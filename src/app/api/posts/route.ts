/**
 * GET /api/posts
 * Get blog posts list with filtering and pagination
 *
 * Query Parameters:
 * - limit: number (default: 20)
 * - offset: number (default: 0)
 * - published: boolean (default: true for public, undefined for admin)
 * - search: string (optional)
 * - sortBy: 'title' | 'createdAt' | 'publishedAt' (default: 'createdAt')
 * - sortOrder: 'asc' | 'desc' (default: 'desc')
 *
 * Response (Success):
 * {
 *   success: true
 *   data: [ ... post objects ... ]
 *   total: number
 *   page: number
 *   limit: number
 *   hasMore: boolean
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPosts, initializeSamplePosts } from '@/lib/posts';
import { initializeSampleAuthors } from '@/lib/authors';

let samplePostsInitialized = false;
let sampleAuthorsInitialized = false;

export async function GET(request: NextRequest) {
  try {
    // Initialize sample authors and posts on first call
    if (!sampleAuthorsInitialized) {
      await initializeSampleAuthors();
      sampleAuthorsInitialized = true;
    }
    if (!samplePostsInitialized) {
      await initializeSamplePosts();
      samplePostsInitialized = true;
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const published = searchParams.get('published')
      ? searchParams.get('published') === 'true'
      : true; // Default to published for public
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as
      | 'title'
      | 'createdAt'
      | 'publishedAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'limit 必须在 1-100 之间',
        },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'offset 不能为负数',
        },
        { status: 400 }
      );
    }

    // Fetch posts
    const result = await getPosts({
      limit,
      offset,
      published,
      search,
      sortBy,
      sortOrder,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
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
        hasMore,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取文章列表失败',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * Create new blog post (requires authentication)
 *
 * Request body:
 * {
 *   title: string (required)
 *   slug: string (required)
 *   content?: string
 *   excerpt?: string
 *   featuredImage?: string
 *   published?: boolean
 * }
 */

import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import { createPost, type PostData } from '@/lib/posts';

let sampleAuthorsInitializedInPost = false;

const createPostSchema = z.object({
  title: z.string().min(1, '文章标题不能为空').max(500, '文章标题不能超过 500 个字符'),
  slug: z
    .string()
    .min(1, 'Slug 不能为空')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug 格式不正确'),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().url('图片 URL 格式不正确').optional(),
  published: z.boolean().optional(),
});

type CreatePostData = z.infer<typeof createPostSchema>;

export async function POST(request: NextRequest) {
  try {
    // Initialize sample authors on first call
    if (!sampleAuthorsInitializedInPost) {
      await initializeSampleAuthors();
      sampleAuthorsInitializedInPost = true;
    }

    // Check authentication
    const session = await verifyAuth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    let validatedData: CreatePostData;

    try {
      validatedData = createPostSchema.parse(body);
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

    // Create post (validatedData typed via Zod; adapt to adapter signature)
    const result = await createPost(validatedData as PostData);

    if (!result.success) {
      const statusCode = result.error?.includes('已存在') ? 409 : 400;
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: statusCode }
      );
    }

    console.info('Post created:', {
      postId: result.data?.id,
      title: result.data?.title,
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建文章失败',
      },
      { status: 500 }
    );
  }
}
