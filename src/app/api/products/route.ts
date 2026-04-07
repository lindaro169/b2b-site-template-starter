/**
 * GET /api/products
 * Get products list with filtering and pagination
 *
 * Query Parameters:
 * - limit: number (default: 20, max: 100)
 * - offset: number (default: 0)
 * - categoryId: number (optional) - 按主分类过滤
 * - parentId: number (optional) - 按子分类过滤（推荐用于树形结构）
 * - isActive: boolean (optional)
 * - featured: boolean (optional) - 按精选产品过滤
 * - search: string (optional)
 * - sortBy: 'name' | 'price' | 'createdAt' (default: 'createdAt')
 * - sortOrder: 'asc' | 'desc' (default: 'desc')
 *
 * 说明：
 * - categoryId: 用于向后兼容，过滤主分类的产品
 * - parentId: 新参数，按子分类ID过滤（用于树形结构）
 * - featured: 按是否为精选产品过滤（用于首页展示）
 * - 优先级：parentId > categoryId（如果两个都提供，使用parentId）
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
 *       price?: number
 *       categoryId?: number
 *       imageUrl?: string
 *       isActive: boolean
 *       createdAt: string
 *       updatedAt: string
 *     }
 *   ]
 *   total: number
 *   page: number
 *   limit: number
 *   hasMore: boolean
 * }
 *
 * HTTP Status Codes:
 * 200 - Success
 * 400 - Invalid query parameters
 * 500 - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getD1Database, D1Database } from '@/lib/d1-db';
import { apiErrorResponse } from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import { createProduct, getProducts, ProductData } from '@/lib/products';

interface CloudflareEnv {
  DB: D1Database;
}

export async function GET(request: NextRequest) {
  let db: D1Database | undefined;
  try {
    const { env } = await getCloudflareContext();
    db = getD1Database((env as unknown as CloudflareEnv).DB) ?? undefined;
  } catch {
    db = undefined;
  }

  try {

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Support both categoryId and parentId for filtering
    // Priority: parentId > categoryId
    let filterCategoryId = undefined;
    if (searchParams.get('parentId')) {
      filterCategoryId = parseInt(searchParams.get('parentId')!);
    } else if (searchParams.get('categoryId')) {
      filterCategoryId = parseInt(searchParams.get('categoryId')!);
    }

    const isActive = searchParams.get('isActive')
      ? searchParams.get('isActive') === 'true'
      : undefined;
    const featured = searchParams.get('featured')
      ? searchParams.get('featured') === 'true'
      : undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as
      | 'name'
      | 'price'
      | 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return apiErrorResponse('limit 必须在 1-100 之间', 400);
    }

    if (offset < 0) {
      return apiErrorResponse('offset 不能为负数', 400);
    }

    // Fetch products
    const result = await getProducts({
      limit,
      offset,
      categoryId: filterCategoryId,
      isActive,
      featured,
      search,
      sortBy,
      sortOrder,
    }, db);

    if (!result.success) {
      return apiErrorResponse(result.error || '获取产品列表失败', 500);
    }

    const page = Math.floor(offset / limit) + 1;
    const hasMore = offset + limit < (result.total || 0);

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        total: result.total,
        page,
        limit,
        offset,
        hasMore,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get products error:', error);
    return apiErrorResponse('获取产品列表失败', 500);
  }
}

/**
 * POST /api/products
 * Create new product (requires authentication)
 *
 * Request body:
 * {
 *   name: string (required)
 *   slug: string (required)
 *   description?: string
 *   price?: number
 *   categoryId?: number
 *   imageUrl?: string
 *   isActive?: boolean
 * }
 *
 * Response (Success):
 * {
 *   success: true
 *   data: { ... product object ... }
 * }
 *
 * HTTP Status Codes:
 * 200 - Product created
 * 400 - Validation error
 * 401 - Unauthorized
 * 409 - Slug already exists
 * 500 - Server error
 */

const createProductSchema = z.object({
  // 基础字段
  name: z.string().min(1, '产品名称不能为空').max(200, '产品名称不能超过 200 个字符'),
  slug: z
    .string()
    .min(1, 'Slug 不能为空')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug 格式不正确 (只能包含小写字母、数字和连字符)'),
  sku: z.string().max(100, 'SKU 不能超过 100 个字符').optional(),

  // 描述字段
  excerpt: z.string().max(500, '摘要不能超过 500 个字符').optional(),
  description: z.string().optional(),

  // 价格和货币
  price: z.number().min(0, '价格不能为负数').optional(),
  priceCurrency: z.string().max(10, '币种代码不能超过 10 个字符').optional(),

  // 分类和激活状态
  categoryId: z.number().int().positive('分类 ID 必须为正整数').optional(),
  isActive: z.boolean().optional(),

  // 图片
  imageUrl: z.string().url('图片 URL 格式不正确').optional(),
  gallery: z.array(
    z.object({
      url: z.string().url('图片 URL 格式不正确'),
      alt: z.string().max(200, '图片描述不能超过 200 个字符'),
      displayOrder: z.number().int().nonnegative('排序号不能为负数').optional(),
    })
  ).optional(),

  // B2B 相关信息
  moq: z.number().int().positive('MOQ 必须为正整数').optional(),
  leadTime: z.string().max(200, '交期描述不能超过 200 个字符').optional(),

  // 产品详情
  material: z.string().max(500, '材料信息不能超过 500 个字符').optional(),
  certifications: z.array(z.string()).optional(),
  customizationOptions: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type CreateProductData = z.infer<typeof createProductSchema>;

export async function POST(request: NextRequest) {
  let db: D1Database | undefined;
  try {
    const { env } = await getCloudflareContext();
    db = getD1Database((env as unknown as CloudflareEnv).DB);
  } catch {
    db = getD1Database();
  }

  try {
    const session = await verifyAuth();

    if (!session) {
      return apiErrorResponse('未授权访问', 401);
    }

    // Parse and validate request body
    const body = await request.json();
    let validatedData: CreateProductData;

    try {
      validatedData = createProductSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join('; ');
        return apiErrorResponse(`验证错误: ${messages}`, 400);
      }
      throw error;
    }

    // Create product
    const result = await createProduct(validatedData as unknown as ProductData, db);

    if (!result.success) {
      const statusCode = result.error?.includes('已存在') ? 409 : 400;
      return apiErrorResponse(result.error || '创建产品失败', statusCode);
    }

    console.info('Product created:', {
      productId: result.data?.id,
      name: result.data?.name,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return apiErrorResponse('创建产品失败', 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
