/**
 * Individual Category API Endpoints
 *
 * GET /api/categories/[id] - 获取单个分类
 * PUT /api/categories/[id] - 更新分类信息
 * DELETE /api/categories/[id] - 删除分类
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  CategoryData,
} from '@/lib/categories';
import type { D1Database } from '@/lib/d1-db';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Next.js 15: params is now a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

type CloudflareEnv = {
  DB?: D1Database;
};

async function getDB(): Promise<D1Database | undefined> {
  try {
    const { env } = await getCloudflareContext();
    return (env as CloudflareEnv).DB;
  } catch {
    return undefined;
  }
}

/**
 * GET /api/categories/[id]
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的分类 ID' },
        { status: 400 }
      );
    }

    const result = await getCategoryById(id, await getDB());

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/categories/[id]:', error);
    return NextResponse.json(
      { success: false, error: '获取分类详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[id]
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的分类 ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data: Partial<CategoryData> = body;

    const result = await updateCategory(id, data, await getDB());

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/categories/[id]:', error);
    return NextResponse.json(
      { success: false, error: '更新分类失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的分类 ID' },
        { status: 400 }
      );
    }

    const result = await deleteCategory(id, await getDB());

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/categories/[id]:', error);
    return NextResponse.json(
      { success: false, error: '删除分类失败' },
      { status: 500 }
    );
  }
}
