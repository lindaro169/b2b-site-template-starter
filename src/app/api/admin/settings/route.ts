import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { verifyAuth } from '@/lib/auth';
import { getD1Database, type D1Database } from '@/lib/d1-db';
import {
  getEmailSettings,
  getEmailSettingsStorageLabel,
  saveEmailSettings,
} from '@/lib/global-config';
import { siteConfig } from '@/lib/site-config';

type CloudflareEnv = {
  DB?: D1Database;
};

const settingsSchema = z.object({
  contactEmail: z.string().email('联系邮箱格式不正确'),
  adminEmail: z.string().email('管理员邮箱格式不正确'),
});

async function getDB(): Promise<D1Database | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return getD1Database((env as CloudflareEnv).DB) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function GET() {
  try {
    const session = await verifyAuth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const db = await getDB();
    const settings = await getEmailSettings(db);

    return NextResponse.json(
      {
        success: true,
        data: settings,
        storage: getEmailSettingsStorageLabel(db),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json(
      { success: false, error: '获取设置失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAuth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors.map((item) => `${item.path.join('.')}: ${item.message}`).join('; '),
        },
        { status: 400 }
      );
    }

    const db = await getDB();
    if (!db && !siteConfig.templateMode) {
      return NextResponse.json(
        { success: false, error: '数据库连接不可用' },
        { status: 500 }
      );
    }

    const settings = await saveEmailSettings({
      contactEmail: parsed.data.contactEmail,
      adminEmail: parsed.data.adminEmail,
    }, db);

    return NextResponse.json(
      {
        success: true,
        data: settings,
        storage: getEmailSettingsStorageLabel(db),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error);
    return NextResponse.json(
      { success: false, error: '保存设置失败' },
      { status: 500 }
    );
  }
}
