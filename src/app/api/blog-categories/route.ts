/**
 * Blog Categories API Endpoints
 *
 * GET /api/blog-categories - 获取所有博客分类
 * POST /api/blog-categories - 创建新博客分类
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getBlogCategories,
  createBlogCategory,
  initializeSampleBlogCategories,
  BlogCategoryData,
} from '@/lib/blogCategories';

/**
 * GET /api/blog-categories
 * 获取所有博客分类
 */
export async function GET() {
  try {
    // 初始化示例分类（第一次访问时）
    await initializeSampleBlogCategories();

    const result = await getBlogCategories();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/blog-categories:', error);
    return NextResponse.json(
      { success: false, error: '获取博客分类列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog-categories
 * 创建新博客分类
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data: BlogCategoryData = body;

    // 初始化示例分类（如果还没有）
    await initializeSampleBlogCategories();

    const result = await createBlogCategory(data);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/blog-categories:', error);
    return NextResponse.json(
      { success: false, error: '创建博客分类失败' },
      { status: 500 }
    );
  }
}
