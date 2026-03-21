import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { apiErrorResponse } from '@/lib/api-response';
import type { D1Database } from '@/lib/d1-db';

type CloudflareEnv = {
  DB?: D1Database;
};

export async function GET() {
  try {
    let db: D1Database | undefined;
    try {
      const ctx = await getCloudflareContext();
      db = (ctx.env as CloudflareEnv).DB;
    } catch (error) {
      console.warn('Failed to get Cloudflare context:', error);
    }

    if (!db) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          {
            status: 'ok',
            mode: 'development',
            note: 'DB check skipped in local dev',
          },
          { status: 200 }
        );
      }

      return apiErrorResponse('数据库连接不可用', 500, {
        status: 'error',
        timestamp: new Date().toISOString(),
      });
    }

    await db.prepare('SELECT 1').run();

    return NextResponse.json(
      {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return apiErrorResponse('健康检查失败', 500, {
      status: 'error',
      timestamp: new Date().toISOString(),
    });
  }
}
