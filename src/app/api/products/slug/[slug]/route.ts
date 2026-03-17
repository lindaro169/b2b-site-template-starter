/**
 * /api/products/slug/[slug]
 * Get product by slug
 *
 * GET - Get product by slug
 *
 * Response (Success):
 * {
 *   success: true
 *   data: { ... product object ... }
 * }
 *
 * HTTP Status Codes:
 * 200 - Success
 * 404 - Product not found
 * 500 - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/products';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getD1Database, D1Database } from '@/lib/d1-db';

interface CloudflareEnv {
  DB: D1Database;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug || slug.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product slug is required',
        },
        { status: 400 }
      );
    }

    let db: D1Database | undefined;
    try {
      const { env } = await getCloudflareContext();
      db = getD1Database((env as unknown as CloudflareEnv).DB);
    } catch {
      db = getD1Database();
    }

    const result = await getProductBySlug(slug, db);

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
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
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
      },
      { status: 500 }
    );
  }
}
