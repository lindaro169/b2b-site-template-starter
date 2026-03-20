/**
 * GET /api/posts/stats
 * Get blog post statistics
 *
 * Returns:
 * {
 *   success: true
 *   data: {
 *     total: number        // Total number of posts
 *     published: number    // Number of published posts
 *     draft: number        // Number of draft posts
 *   }
 * }
 */

import { NextResponse } from 'next/server';
import { getPostStats, initializeSamplePosts } from '@/lib/posts';
import { siteConfig } from '@/lib/site-config';

let samplePostsInitialized = false;

export async function GET() {
  try {
    if (siteConfig.templateMode) {
      return NextResponse.json(
        {
          success: true,
          data: siteConfig.placeholderMetrics.posts,
          isPlaceholder: true,
        },
        { status: 200 }
      );
    }

    // Initialize sample posts on first call
    if (!samplePostsInitialized) {
      await initializeSamplePosts();
      samplePostsInitialized = true;
    }

    const result = await getPostStats();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
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
    console.error('Get post stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取文章统计失败',
      },
      { status: 500 }
    );
  }
}
