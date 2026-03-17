import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/projects';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getD1Database, D1Database } from '@/lib/d1-db';

interface CloudflareEnv {
    DB: D1Database;
}

async function getDB() {
    try {
        const { env } = await getCloudflareContext();
        return getD1Database((env as unknown as CloudflareEnv).DB);
    } catch {
        return getD1Database();
    }
}

export async function GET(request: NextRequest) {
    try {
        const db = await getDB();
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        const result = await getProjects({ limit, offset }, db);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            total: result.total,
            page: Math.floor(offset / limit) + 1,
            limit,
            hasMore: (offset + limit) < (result.total || 0)
        });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const db = await getDB();
        const body = await request.json();

        // Basic validation
        if (!body.title || !body.slug) {
            return NextResponse.json(
                { success: false, error: 'Title and slug are required' },
                { status: 400 }
            );
        }

        const result = await createProject(body, db);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data
        }, { status: 201 });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 });
    }
}
