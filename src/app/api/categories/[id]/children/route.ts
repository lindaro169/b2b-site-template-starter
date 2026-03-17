/**
 * GET /api/categories/:id/children
 * 获取指定分类的直接子分类
 * Get direct children of a category
 *
 * URL Parameters:
 * - id: number (category ID)
 *
 * Response (Success):
 * {
 *   success: true
 *   data: [
 *     {
 *       id: number
 *       name: string
 *       slug: string
 *       description?: string
 *       imageUrl?: string
 *       parentId: number
 *       isActive: boolean
 *       createdAt: string
 *     }
 *   ]
 * }
 *
 * HTTP Status Codes:
 * 200 - Success
 * 400 - Invalid category ID
 * 404 - Category not found
 * 500 - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSubCategories } from '@/lib/categories';
import type { D1Database } from '@/lib/d1-db';
import { getCloudflareContext } from '@opennextjs/cloudflare';

type RouteParams = Promise<{ id: string }>;
type CloudflareEnv = { DB?: D1Database };

export async function GET(_request: NextRequest, props: { params: RouteParams }) {
  try {
    const params = await props.params;
    const { id } = params;

    // Validate category ID
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: '分类 ID 必须为数字',
        },
        { status: 400 }
      );
    }

    let db: D1Database | undefined;
    try {
      const { env } = await getCloudflareContext();
      db = (env as CloudflareEnv).DB;
    } catch {
      db = undefined;
    }

    // Get subcategories
    const result = await getSubCategories(categoryId, db);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('获取子分类失败 (Get subcategories error):', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取子分类失败',
      },
      { status: 500 }
    );
  }
}
