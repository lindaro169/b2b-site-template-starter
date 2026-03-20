'use client';

import Link from 'next/link';
import Image from 'next/image';
import { use, useState, useEffect } from 'react';
import { siteConfig } from '@/lib/site-config';

// 相关文章
const relatedPosts = [
  {
    slug: 'template-content-example-01',
    title: 'Template Content Example 01',
    image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=400',
    category: 'Template Guide'
  },
  {
    slug: 'template-content-example-02',
    title: 'Template Content Example 02',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
    category: 'Template Updates'
  },
  {
    slug: 'template-content-example-03',
    title: 'Template Content Example 03',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    category: 'Template Guide'
  }
];

/**
 * 将 API 博客数据转换为 UI 需要的格式
 * Transform API blog data to match UI component props
 */
function transformBlogData(apiPost) {
  return {
    title: apiPost.title,
    excerpt: apiPost.excerpt,
    content: apiPost.content || '',
    featuredImage: {
      url: apiPost.featuredImage,
      alt: apiPost.title
    },
    author: {
      name: apiPost.author?.name || '博客编辑',
      avatar: apiPost.author?.avatar || siteConfig.logoPath,
      bio: apiPost.author?.bio || '模板文章作者简介，用于演示博客详情页的作者信息区块。'
    },
    publishedAt: apiPost.publishedAt,
    category: apiPost.category?.name || apiPost.category || 'Template Guide',
    readTime: apiPost.readTime || 5,
    tags: apiPost.tags || ['template', 'content', 'placeholder']
  };
}

// 默认文章内容（用于加载失败或文章不存在）
const defaultPost = {
  title: 'Template Article Not Available',
  excerpt: 'This placeholder article could not be loaded. Replace this fallback with your approved empty-state messaging before publishing.',
  content: `
<p>This placeholder article could not be loaded.</p>

<h2>Suggested Next Steps</h2>
<p>Use one of the placeholder actions below while your real content workflow is still in review:</p>
<ul>
  <li><a href="/blog">Browse other template articles</a></li>
  <li><a href="/contact">Open the contact template</a> if you need a replacement flow</li>
  <li>Replace this fallback once your real content inventory is approved</li>
</ul>

<p><a href="/blog">← Back to Template Articles</a></p>
  `,
  featuredImage: {
    url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200',
    alt: 'Template article placeholder'
  },
  author: {
    name: '模板编辑团队',
    avatar: siteConfig.logoPath,
    bio: '用于占位展示的作者资料，请在发布前替换为真实团队介绍。'
  },
  publishedAt: new Date().toISOString(),
  category: 'Template Guide',
  readTime: 5,
  tags: ['not-found']
};

export default function BlogPostPage({ params }) {
  const { slug } = use(params);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/slug/${slug}`);

        if (!response.ok) {
          throw new Error('获取文章失败');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || '文章未找到');
        }

        const transformedPost = transformBlogData(result.data);
        setPost(transformedPost);
      } catch (err) {
        console.error('获取文章出错:', err);
        setError(err.message);
        setPost(defaultPost);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // 如果还在加载中，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          </div>
          <p className="text-gray-600">加载文章中...</p>
        </div>
      </div>
    );
  }

  // 如果加载失败或文章为空，显示错误信息
  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ {error || '文章加载失败'}</p>
          <Link href="/blog" className="text-primary-600 hover:text-primary-700 font-semibold underline">
            返回博客列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary-600">Blog</Link>
            <span>/</span>
            <span className="text-gray-900">{post.category?.name || post.category}</span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="mb-6">
            <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              {post.category?.name || post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4 mb-8">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={56}
              height={56}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-900">{post.author.name}</p>
              <p className="text-sm text-gray-600">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} · {post.readTime} min read
              </p>
            </div>
          </div>

          <div className="relative w-full h-96 rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              className="object-cover"
            />
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-16
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-ul:my-6 prose-li:text-gray-700
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-12 pb-12 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        <div className="mb-16 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-start gap-6">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={80}
              height={80}
              className="rounded-full"
            />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">About This Template Author</h3>
              <p className="text-gray-700">{post.author.bio}</p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group"
              >
                <div className="relative h-48 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={related.image}
                    alt={related.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full text-sm font-semibold">
                      {related.category}
                    </span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {related.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-stone-900 rounded-2xl p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-stone-800 opacity-50"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-serif font-bold mb-4">Need to Replace This Template Section?</h3>
            <p className="text-xl mb-8 text-stone-200">
              This article CTA is still placeholder content. Replace it with your approved offer, destination, and contact path before publishing.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Update This CTA
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
