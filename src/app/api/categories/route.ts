/**
 * Categories API Endpoints
 *
 * GET /api/categories - 获取所有分类
 * POST /api/categories - 创建新分类（支持快速创建）
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCategories,
  createCategory,
  CategoryData,
} from '@/lib/categories';
import type { D1Database } from '@/lib/d1-db';
import { getCloudflareContext } from '@opennextjs/cloudflare';

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
 * GET /api/categories
 * 获取所有分类
 */
export async function GET() {
  try {
    const result = await getCategories(await getDB());

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { success: false, error: '获取分类列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * 创建新分类
 * 支持快速创建：如果只提供 name，会自动生成 slug
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data: CategoryData = body;

    // 验证必填字段
    if (!data.name) {
      return NextResponse.json(
        { success: false, error: '分类名称不能为空' },
        { status: 400 }
      );
    }

    // 如果没有提供 slug，自动生成（快速创建支持）
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    }

    const result = await createCategory(data, await getDB());

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json(
      { success: false, error: '创建分类失败' },
      { status: 500 }
    );
  }
}
