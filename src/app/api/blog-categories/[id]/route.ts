/**
 * Individual Blog Category API Endpoints
 *
 * GET /api/blog-categories/[id] - 获取单个博客分类
 * PUT /api/blog-categories/[id] - 更新博客分类信息
 * DELETE /api/blog-categories/[id] - 删除博客分类
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getBlogCategoryById,
  updateBlogCategory,
  deleteBlogCategory,
  BlogCategoryData,
} from '@/lib/blogCategories';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/blog-categories/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的博客分类 ID' },
        { status: 400 }
      );
    }

    const result = await getBlogCategoryById(id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/blog-categories/[id]:', error);
    return NextResponse.json(
      { success: false, error: '获取博客分类详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/blog-categories/[id]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的博客分类 ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data: Partial<BlogCategoryData> = body;

    const result = await updateBlogCategory(id, data);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/blog-categories/[id]:', error);
    return NextResponse.json(
      { success: false, error: '更新博客分类失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog-categories/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的博客分类 ID' },
        { status: 400 }
      );
    }

    const result = await deleteBlogCategory(id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/blog-categories/[id]:', error);
    return NextResponse.json(
      { success: false, error: '删除博客分类失败' },
      { status: 500 }
    );
  }
}
