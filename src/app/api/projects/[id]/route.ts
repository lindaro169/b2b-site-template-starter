import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject } from '@/lib/projects';
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

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const db = await getDB();
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid ID' },
                { status: 400 }
            );
        }

        const result = await getProjectById(id, db);

        if (!result.success || !result.data) {
            return NextResponse.json(
                { success: false, error: result.error || 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data
        });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const db = await getDB();
        const id = parseInt(params.id);
        const body = await request.json();

        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid ID' },
                { status: 400 }
            );
        }

        const result = await updateProject(id, body, db);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data
        });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to update project' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const db = await getDB();
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid ID' },
                { status: 400 }
            );
        }

        const result = await deleteProject(id, db);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true
        });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
