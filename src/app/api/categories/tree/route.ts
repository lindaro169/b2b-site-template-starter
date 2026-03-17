/**
 * Category Tree API Endpoint
 *
 * GET /api/categories/tree - 获取分类树形结构
 */

import { NextResponse } from 'next/server';
import { getCategoryTree } from '@/lib/categories';
import type { D1Database } from '@/lib/d1-db';
import { getCloudflareContext } from '@opennextjs/cloudflare';

type CloudflareEnv = {
  DB?: D1Database;
};

/**
 * GET /api/categories/tree
 * 获取分类树形结构
 */
export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    const result = await getCategoryTree((env as CloudflareEnv).DB);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/categories/tree:', error);
    return NextResponse.json(
      { success: false, error: '获取分类树形结构失败' },
      { status: 500 }
    );
  }
}
