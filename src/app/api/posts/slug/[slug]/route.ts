/**
 * /api/posts/slug/[slug]
 * Get blog post by slug
 *
 * GET - Get post by slug (only published posts)
 *
 * Response (Success):
 * {
 *   success: true,
 *   data: { ...post object... }
 * }
 *
 * HTTP Status Codes:
 * 200 - Success
 * 404 - Post not found or not published
 * 500 - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug, initializeSamplePosts } from '@/lib/posts';
import { initializeSampleAuthors } from '@/lib/authors';

let samplePostsInitialized = false;
let sampleAuthorsInitialized = false;

async function ensureSamplePosts() {
  if (!samplePostsInitialized) {
    await initializeSamplePosts();
    samplePostsInitialized = true;
  }
}

async function ensureSampleAuthors() {
  if (!sampleAuthorsInitialized) {
    await initializeSampleAuthors();
    sampleAuthorsInitialized = true;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await ensureSampleAuthors();
    await ensureSamplePosts();

    const { slug } = await params;

    if (!slug || slug.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '文章 slug 不能为空',
        },
        { status: 400 }
      );
    }

    // 使用 getPostBySlug 函数来找到文章
    const result = await getPostBySlug(slug);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '文章未找到',
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
    console.error('获取文章出错:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取文章详情失败',
      },
      { status: 500 }
    );
  }
}
