/**
 * /api/products/[id]
 * Manage individual products
 *
 * GET - Get product by ID
 * PUT - Update product (requires authentication)
 * DELETE - Delete product (requires authentication)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import {
  getProductById,
  updateProduct,
  deleteProduct,
  ProductData,
} from '@/lib/products';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getD1Database, D1Database } from '@/lib/d1-db';

interface CloudflareEnv {
  DB: D1Database;
}

async function getDB(): Promise<D1Database | undefined> {
  try {
    const { env } = await getCloudflareContext();
    return getD1Database((env as unknown as CloudflareEnv).DB) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * GET /api/products/[id]
 * Get product by ID
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
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDB();

    const id = parseInt(params.id);

    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        {
          success: false,
          error: '产品 ID 无效',
        },
        { status: 400 }
      );
    }

    const result = await getProductById(id, db);

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
    console.error('Get product error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取产品详情失败',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * Update product (requires authentication)
 *
 * Request body (all fields optional):
 * {
 *   name?: string
 *   slug?: string
 *   sku?: string
 *   description?: string
 *   price?: number
 *   categoryId?: number
 *   imageUrl?: string
 *   isActive?: boolean
 *   excerpt?: string
 *   priceCurrency?: string
 *   gallery?: Array<{ url, alt, displayOrder? }>
 *   moq?: number
 *   leadTime?: string
 *   material?: string
 *   certifications?: string[]
 *   customizationOptions?: string[]
 *   tags?: string[]
 * }
 *
 * Response (Success):
 * {
 *   success: true
 *   data: { ... updated product object ... }
 * }
 *
 * HTTP Status Codes:
 * 200 - Product updated
 * 400 - Validation error
 * 401 - Unauthorized
 * 404 - Product not found
 * 409 - Slug already exists
 * 500 - Server error
 */

const updateProductSchema = z.object({
  // 基础字段
  name: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug 格式不正确')
    .optional(),
  sku: z.string().max(100).optional(),

  // 描述字段
  excerpt: z.string().max(500).optional(),
  description: z.string().optional(),

  // 价格和货币
  price: z.number().min(0).optional(),
  priceCurrency: z.string().max(10).optional(),

  // 分类和激活状态
  categoryId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),

  // 图片
  imageUrl: z.string().url().optional(),
  gallery: z.array(
    z.object({
      url: z.string().url(),
      alt: z.string().max(200),
      displayOrder: z.number().int().nonnegative().optional(),
    })
  ).optional(),

  // B2B 相关信息
  moq: z.number().int().positive().optional(),
  leadTime: z.string().max(200).optional(),

  // 产品详情
  material: z.string().max(500).optional(),
  certifications: z.array(z.string()).optional(),
  customizationOptions: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type UpdateProductData = z.infer<typeof updateProductSchema>;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDB();

    // Check authentication
    const session = await verifyAuth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // Parse ID
    const id = parseInt(params.id);
    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        {
          success: false,
          error: '产品 ID 无效',
        },
        { status: 400 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    let validatedData: UpdateProductData;

    try {
      validatedData = updateProductSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join('; ');
        return NextResponse.json(
          {
            success: false,
            error: `验证错误: ${messages}`,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Update product
    const result = await updateProduct(id, validatedData as unknown as Partial<ProductData>, db);

    if (!result.success) {
      const statusCode = result.error?.includes('已存在') ? 409 : 404;
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: statusCode }
      );
    }

    console.info('Product updated:', {
      productId: id,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新产品失败',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Delete product
 *
 * Response (Success):
 * {
 *   success: true
 *   message: string
 * }
 *
 * HTTP Status Codes:
 * 200 - Product deleted
 * 401 - Unauthorized
 * 404 - Product not found
 * 500 - Server error
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDB();


    // Check authentication
    const session = await verifyAuth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // Parse ID
    const id = parseInt(params.id);
    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        {
          success: false,
          error: '产品 ID 无效',
        },
        { status: 400 }
      );
    }

    // Delete product
    const result = await deleteProduct(id, db);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 404 }
      );
    }

    console.info('Product deleted:', {
      productId: id,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: '产品已删除',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除产品失败',
      },
      { status: 500 }
    );
  }
}
