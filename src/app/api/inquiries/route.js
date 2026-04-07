import { z } from 'zod';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { appendAttributionCookies, getAttributionSnapshotFromRequest } from '@/lib/attribution-session';
import { verifyTurnstileToken } from '@/lib/validation';
import { getD1Database, saveInquiryD1 } from '@/lib/d1-db';
import { sendTrackedInquiryNotification } from '@/lib/email';
import { buildRateLimitHeaders, checkRequestRateLimit } from '@/lib/request-rate-limit';
import { siteConfig } from '@/lib/site-config';
import {
  buildRequestGeoInfo,
} from '@/lib/visitor-tracking';

const inquirySchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
    quantity: z.string().optional(),
    message: z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
    productId: z.union([z.number(), z.string()]).optional(),
    productName: z.string().min(1, 'Product name is required'),
    turnstileToken: z.string().optional(),
    turnstile_token: z.string().optional(),
  })
  .refine((data) => Boolean(data.turnstileToken || data.turnstile_token), {
    message: 'Turnstile token is required',
    path: ['turnstileToken'],
  });

const INQUIRY_RATE_LIMIT = {
  limit: 5,
  windowMs: 10 * 60 * 1000,
};

async function getDB() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return getD1Database(env.DB) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    let inquiryData;
    try {
      inquiryData = inquirySchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          {
            success: false,
            error: error.errors.map((item) => `${item.path.join('.')}: ${item.message}`).join('; '),
          },
          { status: 400 }
        );
      }

      throw error;
    }

    const rateLimitResult = checkRequestRateLimit({
      routeKey: 'public-inquiry-submit',
      headers: request.headers,
      limit: INQUIRY_RATE_LIMIT.limit,
      windowMs: INQUIRY_RATE_LIMIT.windowMs,
    });

    if (!rateLimitResult.allowed) {
      return Response.json(
        {
          success: false,
          error: 'Too many submissions. Please try again later.',
        },
        {
          status: 429,
          headers: buildRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const turnstileToken = inquiryData.turnstileToken || inquiryData.turnstile_token || '';
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
        return Response.json(
          {
            success: false,
            error: 'Server configuration error, please try again later',
          },
          { status: 500 }
        );
      }

      turnstileResult = await verifyTurnstileToken(turnstileToken, turnstileSecret);
    }

    if (!turnstileResult.success) {
      console.warn('Turnstile verification failed for inquiry:', {
        email: inquiryData.email,
        errors: turnstileResult['error-codes'],
      });

      return Response.json(
        {
          success: false,
          error: 'Security verification failed, please try again',
        },
        { status: 400 }
      );
    }

    let cf;
    try {
      const context = await getCloudflareContext({ async: true });
      cf = context.cf;
    } catch {
      cf = undefined;
    }

    const geo = buildRequestGeoInfo(cf, request.headers);
    const db = await getDB();
    const attribution = await getAttributionSnapshotFromRequest(request, db);
    const tracking = attribution.snapshot;

    const numericProductId =
      typeof inquiryData.productId === 'string'
        ? Number.parseInt(inquiryData.productId, 10)
        : inquiryData.productId;

    let savedId;
    if (db) {
      const saved = await saveInquiryD1(db, {
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone,
        company: inquiryData.company,
        message: inquiryData.message,
        productId: Number.isFinite(numericProductId) ? numericProductId : undefined,
        tracking,
        geo,
      });
      savedId = Number(saved.id);
    }

    const emailResult = await sendTrackedInquiryNotification({
      name: inquiryData.name,
      email: inquiryData.email,
      phone: inquiryData.phone,
      company: inquiryData.company,
      quantity: inquiryData.quantity,
      message: inquiryData.message,
      productId: Number.isFinite(numericProductId) ? numericProductId : inquiryData.productId,
      productName: inquiryData.productName,
      tracking,
      geo,
    }, db);

    if (!emailResult.success) {
      console.warn('Inquiry notification email failed:', emailResult.error);
    }

    const responseHeaders = new Headers(buildRateLimitHeaders(rateLimitResult));
    appendAttributionCookies(responseHeaders, attribution.cookies);

    return Response.json(
      {
        success: true,
        message: 'Inquiry submitted successfully. Our sales team will contact you shortly.',
        inquiryId: savedId || `INQ-${Date.now()}`,
        id: savedId,
        leadType: 'inquiry',
        googleAdsEligible: true,
      },
      {
        status: 201,
        headers: responseHeaders,
      }
    );
  } catch (error) {
    console.error('Error processing inquiry:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to process inquiry. Please try again later.',
      },
      { status: 500 }
    );
  }
}
