import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
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
        } catch (e) {
            console.warn('Failed to get Cloudflare context:', e);
        }

        if (!db) {
            if (process.env.NODE_ENV === 'development') {
                return NextResponse.json({
                    status: 'ok',
                    mode: 'development',
                    note: 'DB check skipped in local dev'
                }, { status: 200 });
            }
            return NextResponse.json({ status: 'error', message: 'DB binding missing' }, { status: 500 });
        }

        // Simple query to check connection
        await db.prepare('SELECT 1').run();

        return NextResponse.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
