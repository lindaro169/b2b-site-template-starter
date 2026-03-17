/**
 * /api/posts/[id]
 * Manage individual blog posts
 *
 * GET - Get post by ID
 * PUT - Update post (requires authentication)
 * DELETE - Delete post (requires authentication)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import {
  getPostById,
  updatePost,
  deletePost,
  initializeSamplePosts,
} from '@/lib/posts';

let samplePostsInitialized = false;

async function ensureSamplePosts() {
  if (!samplePostsInitialized) {
    await initializeSamplePosts();
    samplePostsInitialized = true;
  }
}

/**
 * GET /api/posts/[id]
 * Get post by ID (public endpoint, but only returns published posts)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {


    await ensureSamplePosts();

    const id = parseInt(params.id);

    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        {
          success: false,
          error: '文章 ID 无效',
        },
        { status: 400 }
      );
    }

    const result = await getPostById(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 404 }
      );
    }

    // Check if post is published (for public API)
    if (!result.data.published) {
      return NextResponse.json(
        {
          success: false,
          error: '文章未发布',
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
    console.error('Get post error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取文章详情失败',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts/[id]
 * Update post (requires authentication)
 */

const updatePostSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug 格式不正确')
    .optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().url().optional(),
  published: z.boolean().optional(),
});

type UpdatePostData = z.infer<typeof updatePostSchema>;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureSamplePosts();

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
          error: '文章 ID 无效',
        },
        { status: 400 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    let validatedData: UpdatePostData;

    try {
      validatedData = updatePostSchema.parse(body);
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

    // Update post
    const result = await updatePost(id, validatedData);

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

    console.info('Post updated:', {
      postId: id,
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新文章失败',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * Delete post (requires authentication)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureSamplePosts();

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
          error: '文章 ID 无效',
        },
        { status: 400 }
      );
    }

    // Delete post
    const result = await deletePost(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 404 }
      );
    }

    console.info('Post deleted:', {
      postId: id,
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: '文章已删除',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除文章失败',
      },
      { status: 500 }
    );
  }
}
