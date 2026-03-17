/**
 * POST /api/posts/[id]/publish
 * Publish a blog post
 *
 * Response:
 * {
 *   success: true
 *   data: { ... updated post ... }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { publishPost, unpublishPost, initializeSamplePosts } from '@/lib/posts';

let samplePostsInitialized = false;

async function ensureSamplePosts() {
  if (!samplePostsInitialized) {
    await initializeSamplePosts();
    samplePostsInitialized = true;
  }
}

export async function POST(
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

    // Parse action from body or query
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'publish'; // 'publish' or 'unpublish'

    if (!['publish', 'unpublish'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: '操作无效',
        },
        { status: 400 }
      );
    }

    // Execute action
    const result = action === 'publish' ? await publishPost(id) : await unpublishPost(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 404 }
      );
    }

    console.info(`Post ${action}ed:`, {
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
    console.error('Post publish/unpublish error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '操作失败',
      },
      { status: 500 }
    );
  }
}
