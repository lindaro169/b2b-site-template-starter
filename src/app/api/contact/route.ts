import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { verifyTurnstileToken } from '@/lib/validation';
import { getD1Database, saveContactD1, type D1Database } from '@/lib/d1-db';
import { sendTrackedContactNotification } from '@/lib/email';
import { buildRateLimitHeaders, checkRequestRateLimit } from '@/lib/request-rate-limit';
import { siteConfig } from '@/lib/site-config';
import {
  buildRequestGeoInfo,
  normalizeVisitorTrackingSnapshot,
} from '@/lib/visitor-tracking';

interface CloudflareEnv {
  DB: D1Database;
}

const contactSchema = z
  .object({
    name: z.string().min(1, '姓名不能为空').max(100, '姓名不能超过 100 个字符'),
    email: z.string().min(1, '邮箱不能为空').email('邮箱格式不正确'),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^[\d\s\-+()]+$/.test(val), '电话格式不正确'),
    subject: z.string().max(200, '主题不能超过 200 个字符').optional(),
    message: z.string().min(1, '消息不能为空').max(5000, '消息不能超过 5000 个字符'),
    turnstile_token: z.string().optional(),
    turnstileToken: z.string().optional(),
    tracking: z.unknown().optional(),
  })
  .refine((data) => Boolean(data.turnstile_token || data.turnstileToken), {
    message: 'Turnstile token 不能为空',
    path: ['turnstile_token'],
  });

type ContactFormData = z.infer<typeof contactSchema>;

const CONTACT_RATE_LIMIT = {
  limit: 5,
  windowMs: 10 * 60 * 1000,
} as const;

async function getDB(): Promise<D1Database | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return getD1Database((env as unknown as CloudflareEnv).DB) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let validatedData: ContactFormData;
    try {
      validatedData = contactSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((item) => `${item.path.join('.')}: ${item.message}`)
          .join('; ');

        return NextResponse.json(
          {
            success: false,
            error: `验证错误: ${messages}`,
          },
          { status: 400 }
        );
      }

      throw error;
    }

    const rateLimitResult = checkRequestRateLimit({
      routeKey: 'public-contact-submit',
      headers: request.headers,
      limit: CONTACT_RATE_LIMIT.limit,
      windowMs: CONTACT_RATE_LIMIT.windowMs,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: '提交过于频繁，请稍后再试',
        },
        {
          status: 429,
          headers: buildRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const turnstileToken = validatedData.turnstile_token || validatedData.turnstileToken || '';
    let turnstileResult;

    if (siteConfig.localPreviewMode) {
      turnstileResult = {
        success: turnstileToken === siteConfig.templateTurnstileToken,
        'error-codes':
          turnstileToken === siteConfig.templateTurnstileToken ? [] : ['invalid_template_token'],
      };
    } else {
      const turnstileSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
      if (!turnstileSecret) {
        console.error('CLOUDFLARE_TURNSTILE_SECRET_KEY environment variable not set');
        return NextResponse.json(
          {
            success: false,
            error: '服务器配置错误, 请稍后重试',
          },
          { status: 500 }
        );
      }

      turnstileResult = await verifyTurnstileToken(turnstileToken, turnstileSecret);
    }

    if (!turnstileResult.success) {
      console.warn('Turnstile verification failed:', {
        email: validatedData.email,
        errors: turnstileResult['error-codes'],
      });

      return NextResponse.json(
        {
          success: false,
          error: '安全验证失败, 请重试',
        },
        { status: 400 }
      );
    }

    const tracking = normalizeVisitorTrackingSnapshot(validatedData.tracking);

    let cf: Record<string, unknown> | undefined;
    try {
      const context = await getCloudflareContext({ async: true });
      cf = context.cf as Record<string, unknown> | undefined;
    } catch {
      cf = undefined;
    }

    const geo = buildRequestGeoInfo(cf, request.headers);
    const db = await getDB();

    let savedId: number | undefined;
    if (db) {
      const saved = await saveContactD1(db, {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        phone: validatedData.phone,
        message: validatedData.message,
        tracking,
        geo,
      });
      savedId = Number(saved.id);
    }

    const emailResult = await sendTrackedContactNotification({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      message: validatedData.message,
      tracking,
      geo,
    }, db);

    if (!emailResult.success) {
      console.warn('Contact notification email failed:', emailResult.error);
    }

    return NextResponse.json(
      {
        success: true,
        message: '消息已成功提交, 我们会尽快联系您',
        id: savedId,
        leadType: 'contact',
        googleAdsEligible: true,
      },
      {
        status: 200,
        headers: buildRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '处理请求时出错, 请稍后重试',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: '方法不允许',
    },
    { status: 405 }
  );
}
