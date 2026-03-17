/**
 * Individual Author API Endpoints
 *
 * GET /api/authors/[id] - 获取单个作者
 * PUT /api/authors/[id] - 更新作者信息
 * DELETE /api/authors/[id] - 删除作者
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  AuthorData,
} from '@/lib/authors';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/authors/[id]
 * 获取单个作者
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的作者 ID' },
        { status: 400 }
      );
    }

    const result = await getAuthorById(id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/authors/[id]:', error);
    return NextResponse.json(
      { success: false, error: '获取作者详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/authors/[id]
 * 更新作者信息
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的作者 ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data: Partial<AuthorData> = body;

    const result = await updateAuthor(id, data);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/authors/[id]:', error);
    return NextResponse.json(
      { success: false, error: '更新作者失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/authors/[id]
 * 删除作者
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的作者 ID' },
        { status: 400 }
      );
    }

    const result = await deleteAuthor(id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/authors/[id]:', error);
    return NextResponse.json(
      { success: false, error: '删除作者失败' },
      { status: 500 }
    );
  }
}
