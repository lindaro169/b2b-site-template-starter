import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { appendAttributionCookies, recordAttributionVisit } from '@/lib/attribution-session';
import { getD1Database, type D1Database } from '@/lib/d1-db';

type CloudflareEnv = {
  DB?: D1Database;
};

async function getDB(): Promise<D1Database | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return getD1Database((env as CloudflareEnv).DB) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      path?: string;
      finalize?: boolean;
    };

    const db = await getDB();
    const { cookies } = await recordAttributionVisit(request, db, {
      pathWithQuery: typeof body.path === 'string' ? body.path : undefined,
      finalize: body.finalize === true,
    });

    const headers = new Headers();
    appendAttributionCookies(headers, cookies);

    return new NextResponse(null, {
      status: 204,
      headers,
    });
  } catch (error) {
    console.error('Error in POST /api/visit:', error);
    return NextResponse.json(
      {
        success: false,
        error: '记录访问轨迹失败',
      },
      { status: 500 }
    );
  }
}
