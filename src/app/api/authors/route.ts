/**
 * Authors API Endpoints
 *
 * GET /api/authors - 获取所有作者
 * POST /api/authors - 创建新作者
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  initializeSampleAuthors,
  getAuthors,
  createAuthor,
  AuthorData,
} from '@/lib/authors';

// 初始化示例作者数据
initializeSampleAuthors().catch(console.error);

/**
 * GET /api/authors
 * 获取所有作者
 */
export async function GET() {
  try {
    const result = await getAuthors();

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/authors:', error);
    return NextResponse.json(
      { success: false, error: '获取作者列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/authors
 * 创建新作者
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data: AuthorData = body;

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { success: false, error: '作者名字不能为空' },
        { status: 400 }
      );
    }

    const result = await createAuthor(data);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/authors:', error);
    return NextResponse.json(
      { success: false, error: '创建作者失败' },
      { status: 500 }
    );
  }
}
