'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { siteConfig } from '@/lib/site-config';

const categories = ['All', 'Template Guide', 'Template Updates'];

/**
 * 转换API博客数据为UI需要的格式
 * Transform API blog data to match UI component props
 */
function transformBlogData(apiPost) {
  return {
    slug: apiPost.slug,
    title: apiPost.title,
    excerpt: apiPost.excerpt,
    featuredImage: {
      url: apiPost.featuredImage,
      alt: apiPost.title
    },
    author: {
      name: apiPost.author?.name || 'Template Editor',
      avatar: apiPost.author?.avatar || siteConfig.logoPath
    },
    publishedAt: apiPost.publishedAt,
    category: apiPost.category?.name || apiPost.category || 'Template Guide',
    readTime: apiPost.readTime || 5
  };
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/posts?limit=10&published=true');

        if (!response.ok) {
          throw new Error('获取博客列表失败');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || '获取博客列表失败');
        }

        // 转换数据
        const transformedPosts = (result.data || []).map(transformBlogData);
        setPosts(transformedPosts);
      } catch (err) {
        console.error('获取博客出错:', err);
        setError(err.message || '获取博客列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 根据选中分类过滤文章
  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(post => post.category?.toLowerCase() === selectedCategory.toLowerCase());

  // 获取第一篇文章（特色文章）
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const otherPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <div className="bg-stone-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900 to-stone-800 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/pattern-noise.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 tracking-wide">Template Content Hub</h1>
          <p className="text-xl max-w-2xl mx-auto text-stone-300 font-light leading-relaxed">
            Placeholder articles, editorial layouts, and reusable content blocks for pre-launch review.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${cat === selectedCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Template Article</h2>
          {loading ? (
            <div className="bg-white rounded-lg shadow-xl p-12 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              </div>
              <p className="text-gray-600">Loading articles...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-lg shadow-lg p-12 text-center border border-red-200">
              <p className="text-red-600 mb-4">❌ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-red-600 hover:text-red-700 font-semibold underline"
              >
                Reload
              </button>
            </div>
          ) : featuredPost ? (
            <Link href={`/blog/${featuredPost.slug}`} className="group">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-80 lg:h-auto">
                    <Image
                      src={featuredPost.featuredImage.url}
                      alt={featuredPost.featuredImage.alt}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-semibold">
                        {featuredPost.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                      <Image
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{featuredPost.author.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} · {featuredPost.readTime} min read
                        </p>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                      {featuredPost.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-2 text-primary-600 font-semibold">
                      Open Template Article
                      <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-gray-50 rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600">No template articles available</p>
            </div>
          )}
        </div>

        {/* Blog Grid */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Template Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-56">
                  <Image
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full text-sm font-semibold">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.readTime} min read</span>
                    <span className="text-primary-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Open More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Placeholder CTA Section */}
        <div className="mt-16 bg-stone-900 rounded-2xl p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-stone-800 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold mb-4">Replace This Content CTA</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-stone-200">
              Use this area for your approved article CTA, newsletter prompt, or resource download after launch content is ready.
            </p>
            <div className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="Enter a placeholder email"
                className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-600 border-none"
              />
              <button className="bg-primary-600 text-white hover:bg-primary-500 px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-primary-600/30">
                Review CTA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
