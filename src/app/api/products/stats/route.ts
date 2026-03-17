/**
 * GET /api/products/stats
 * Get product statistics
 *
 * Returns:
 * {
 *   success: true
 *   data: {
 *     total: number          // Total number of products
 *     active: number         // Number of active products
 *     inactive: number       // Number of inactive products
 *     avgPrice?: number      // Average product price
 *   }
 * }
 *
 * HTTP Status Codes:
 * 200 - Success
 * 500 - Server error
 */

import { NextResponse } from 'next/server';
import { getProductStats } from '@/lib/products';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getD1Database, D1Database } from '@/lib/d1-db';

interface CloudflareEnv {
  DB: D1Database;
}

export async function GET() {
  try {
    let db: D1Database | undefined;
    try {
      const { env } = await getCloudflareContext();
      db = getD1Database((env as unknown as CloudflareEnv).DB) ?? undefined;
    } catch {
      db = undefined;
    }

    const result = await getProductStats(db);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
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
    console.error('Get product stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取产品统计失败',
      },
      { status: 500 }
    );
  }
}
