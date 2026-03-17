/**
 * Blog Post Management Utilities
 *
 * Provides database operations for blog posts using Drizzle ORM
 * This is a temporary implementation until full Drizzle integration
 */

import { getAuthorById } from './authors';
import { getBlogCategoryById, initializeSampleBlogCategories } from './blogCategories';
import {
  D1Database,
  getPostsD1,
  createPostD1,
  getPostD1,
  updatePostD1,
  deletePostD1,
  publishPostD1,
  unpublishPostD1,
  getPostStatsD1,
} from './d1-db';

export interface PostFilters {
  search?: string;
  published?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'title' | 'createdAt' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 发布前的文章数据（创建/编辑）
 * 使用 authorId 和 categoryId 代替嵌入的对象（规范化设计）
 */
export interface PostData {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  published?: boolean;
  publishedAt?: string;
  authorId?: number;      // ✅ 作者外键
  categoryId?: number;    // ✅ 分类外键
  tags?: string[];
  readTime?: number;
}

/**
 * 返回给前台的完整文章数据（包含作者和分类信息）
 */
export interface PostWithAuthor extends PostData {
  id: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    name: string;
    avatar?: string;
    bio?: string;
    email?: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
  };
}

/**
 * 计算阅读时间（分钟）
 * Calculate reading time based on content length
 * Assuming average 200 words per minute
 */
function calculateReadTime(content?: string): number {
  if (!content) return 0;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);
  return Math.max(1, readTime);
}

/**
 * Mock blog post database
 * 使用 authorId 外键代替嵌入的 author 对象
 */
const mockPosts = new Map<
  number,
  {
    id: number;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    published: boolean;
    publishedAt?: string;
    authorId?: number;  // ✅ 外键引用
    categoryId?: number;  // ✅ 博客分类外键
    tags?: string[];
    readTime: number;
    createdAt: string;
    updatedAt: string;
  }
>();

let nextPostId = 1;

// Initialize with sample posts
export async function initializeSamplePosts() {
  // 如果已初始化，跳过
  if (mockPosts.size > 0) {
    return;
  }

  const samples = [];

  for (const sample of samples) {
    const readTime = calculateReadTime(sample.content);
    const post = {
      id: nextPostId++,
      ...sample,
      readTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPosts.set(post.id, post);
  }
}

/**
 * Get all posts with filtering and author/category data (JOIN)
 */
export async function getPosts(
  filters?: PostFilters,
  db?: D1Database
): Promise<{
  success: boolean;
  data?: PostWithAuthor[];
  total?: number;
  error?: string;
}> {
  try {
    if (db) {
      const postsList = await getPostsD1(db, filters);
      const postsWithAuthors: PostWithAuthor[] = await Promise.all(
        postsList.map(async (p) => {
          const result: PostWithAuthor = {
            id: p.id,
            title: p.title as string,
            slug: p.slug as string,
            content: p.content as string,
            excerpt: p.excerpt as string,
            featuredImage: p.featured_image as string,
            published: !!p.published,
            publishedAt: p.published_at as string,
            authorId: p.author_id as number,
            categoryId: p.category_id as number,
            tags: [], // Tags not implemented in D1 yet
            readTime: calculateReadTime(p.content as string),
            createdAt: p.created_at as string,
            updatedAt: (p.updated_at as string) || (p.created_at as string),
          };

          if (result.authorId) {
            const authorResult = await getAuthorById(result.authorId);
            result.author = authorResult.data || undefined;
          }

          if (result.categoryId) {
            const categoryResult = await getBlogCategoryById(result.categoryId);
            result.category = categoryResult.data || undefined;
          }

          return result;
        })
      );
      return {
        success: true,
        data: postsWithAuthors,
        total: postsList.length, // Approximation
      };
    }

    // Ensure blog categories are initialized
    await initializeSampleBlogCategories();

    let posts = Array.from(mockPosts.values());

    // Apply filters
    if (filters?.published !== undefined) {
      posts = posts.filter((p) => p.published === filters.published);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.slug.includes(search) ||
          p.excerpt?.toLowerCase().includes(search)
      );
    }

    // Sorting
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';

    posts.sort((a, b) => {
      let aVal = a[sortBy as keyof typeof a];
      let bVal = b[sortBy as keyof typeof b];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;
    const paginatedPosts = posts.slice(offset, offset + limit);

    // ✅ JOIN: 获取作者和分类数据
    const postsWithAuthors: PostWithAuthor[] = await Promise.all(
      paginatedPosts.map(async (post) => {
        let result: PostWithAuthor = post as PostWithAuthor;

        // Get author data
        if (post.authorId) {
          const authorResult = await getAuthorById(post.authorId);
          result = {
            ...result,
            author: authorResult.data || undefined,
          };
        }

        // Get category data
        if (post.categoryId) {
          const categoryResult = await getBlogCategoryById(post.categoryId);
          result = {
            ...result,
            category: categoryResult.data || undefined,
          };
        }

        return result;
      })
    );

    return {
      success: true,
      data: postsWithAuthors,
      total: posts.length,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      success: false,
      error: '获取文章列表失败',
    };
  }
}

/**
 * Get post by ID with author and category data (JOIN)
 */
export async function getPostById(id: number, db?: D1Database): Promise<{
  success: boolean;
  data?: PostWithAuthor;
  error?: string;
}> {
  try {
    if (db) {
      const p = await getPostD1(db, id);
      const result: PostWithAuthor = {
        id: p.id as number,
        title: p.title as string,
        slug: p.slug as string,
        content: p.content as string,
        excerpt: p.excerpt as string,
        featuredImage: p.featured_image as string,
        published: !!p.published,
        publishedAt: p.published_at as string,
        authorId: p.author_id as number,
        categoryId: p.category_id as number,
        tags: [],
        readTime: calculateReadTime(p.content as string),
        createdAt: p.created_at as string,
        updatedAt: (p.updated_at as string) || (p.created_at as string),
      };

      if (result.authorId) {
        const authorResult = await getAuthorById(result.authorId);
        result.author = authorResult.data || undefined;
      }

      if (result.categoryId) {
        const categoryResult = await getBlogCategoryById(result.categoryId);
        result.category = categoryResult.data || undefined;
      }

      return { success: true, data: result };
    }

    // Ensure blog categories are initialized
    await initializeSampleBlogCategories();

    const post = mockPosts.get(id);

    if (!post) {
      return {
        success: false,
        error: '文章不存在',
      };
    }

    // ✅ JOIN: 获取作者和分类数据
    let postWithAuthor: PostWithAuthor = post as PostWithAuthor;
    if (post.authorId) {
      const authorResult = await getAuthorById(post.authorId);
      postWithAuthor = {
        ...post,
        author: authorResult.data || undefined,
      };
    }

    // ✅ JOIN: 获取分类数据
    if (post.categoryId) {
      const categoryResult = await getBlogCategoryById(post.categoryId);
      postWithAuthor = {
        ...postWithAuthor,
        category: categoryResult.data || undefined,
      };
    }

    return {
      success: true,
      data: postWithAuthor,
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      success: false,
      error: '获取文章详情失败',
    };
  }
}

/**
 * Get post by slug with author and category data (JOIN)
 */
export async function getPostBySlug(slug: string, db?: D1Database): Promise<{
  success: boolean;
  data?: PostWithAuthor;
  error?: string;
}> {
  try {
    if (db) {
      // getPostBySlugD1 is not implemented in d1-db.ts yet, need to implement or use getPostsD1 with filter
      const posts = await getPostsD1(db, { search: slug, limit: 1 });
      const p = posts.find(post => post.slug === slug); // Double check slug match

      if (!p) {
        return { success: false, error: '文章不存在' };
      }

      const result: PostWithAuthor = {
        id: p.id as number,
        title: p.title as string,
        slug: p.slug as string,
        content: p.content as string,
        excerpt: p.excerpt as string,
        featuredImage: p.featured_image as string,
        published: !!p.published,
        publishedAt: p.published_at as string,
        authorId: p.author_id as number,
        categoryId: p.category_id as number,
        tags: [],
        readTime: calculateReadTime(p.content as string),
        createdAt: p.created_at as string,
        updatedAt: (p.updated_at as string) || (p.created_at as string),
      };

      if (result.authorId) {
        const authorResult = await getAuthorById(result.authorId);
        result.author = authorResult.data || undefined;
      }

      if (result.categoryId) {
        const categoryResult = await getBlogCategoryById(result.categoryId);
        result.category = categoryResult.data || undefined;
      }

      return { success: true, data: result };
    }

    // Ensure blog categories are initialized
    await initializeSampleBlogCategories();

    const post = Array.from(mockPosts.values()).find((p) => p.slug === slug);

    if (!post) {
      return {
        success: false,
        error: '文章不存在',
      };
    }

    // Only return if published or requesting admin has access
    if (!post.published) {
      return {
        success: false,
        error: '文章未发布',
      };
    }

    // ✅ JOIN: 获取作者和分类数据
    let postWithAuthor: PostWithAuthor = post as PostWithAuthor;
    if (post.authorId) {
      const authorResult = await getAuthorById(post.authorId);
      postWithAuthor = {
        ...post,
        author: authorResult.data || undefined,
      };
    }

    // ✅ JOIN: 获取分类数据
    if (post.categoryId) {
      const categoryResult = await getBlogCategoryById(post.categoryId);
      postWithAuthor = {
        ...postWithAuthor,
        category: categoryResult.data || undefined,
      };
    }

    return {
      success: true,
      data: postWithAuthor,
    };
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return {
      success: false,
      error: '获取文章详情失败',
    };
  }
}

/**
 * Create new post
 */
export async function createPost(
  data: PostData,
  db?: D1Database
): Promise<{
  success: boolean;
  data?: PostWithAuthor;
  error?: string;
}> {
  try {
    if (db) {
      // Validate required fields
      if (!data.title || !data.slug) {
        return {
          success: false,
          error: '文章标题和 slug 不能为空',
        };
      }

      // Create post in D1
      try {
        const p = await createPostD1(db, data);

        const result: PostWithAuthor = {
          id: p.id as number,
          title: p.title as string,
          slug: p.slug as string,
          content: p.content as string,
          excerpt: p.excerpt as string,
          featuredImage: p.featured_image as string,
          published: !!p.published,
          publishedAt: p.published_at as string,
          authorId: p.author_id as number,
          categoryId: p.category_id as number,
          tags: [],
          readTime: calculateReadTime(p.content as string),
          createdAt: p.created_at as string,
          updatedAt: (p.updated_at as string) || (p.created_at as string),
        };

        if (result.authorId) {
          const authorResult = await getAuthorById(result.authorId);
          result.author = authorResult.data || undefined;
        }

        if (result.categoryId) {
          const categoryResult = await getBlogCategoryById(result.categoryId);
          result.category = categoryResult.data || undefined;
        }

        return { success: true, data: result };
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('UNIQUE constraint failed')) {
          return { success: false, error: 'Slug 已存在' };
        }
        throw e;
      }
    }

    // Validate required fields
    if (!data.title || !data.slug) {
      return {
        success: false,
        error: '文章标题和 slug 不能为空',
      };
    }

    // Check for duplicate slug
    const existing = Array.from(mockPosts.values()).find((p) => p.slug === data.slug);
    if (existing) {
      return {
        success: false,
        error: 'Slug 已存在',
      };
    }

    // Validate authorId if provided
    if (data.authorId) {
      const authorResult = await getAuthorById(data.authorId);
      if (!authorResult.success) {
        return {
          success: false,
          error: '指定的作者不存在',
        };
      }
    }

    const readTime = calculateReadTime(data.content);

    const post = {
      id: nextPostId++,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      published: data.published || false,
      publishedAt: data.publishedAt,
      authorId: data.authorId,  // ✅ 使用 authorId
      tags: data.tags,
      readTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPosts.set(post.id, post);

    // ✅ 返回带有作者数据的完整文章
    let postWithAuthor: PostWithAuthor = post as PostWithAuthor;
    if (post.authorId) {
      const authorResult = await getAuthorById(post.authorId);
      postWithAuthor = {
        ...post,
        author: authorResult.data || undefined,
      };
    }

    return {
      success: true,
      data: postWithAuthor,
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      error: '创建文章失败',
    };
  }
}

/**
 * Update post
 */
export async function updatePost(
  id: number,
  data: Partial<PostData>,
  db?: D1Database
): Promise<{
  success: boolean;
  data?: PostWithAuthor;
  error?: string;
}> {
  try {
    if (db) {
      try {
        const p = await updatePostD1(db, id, data);

        const result: PostWithAuthor = {
          id: p.id as number,
          title: p.title as string,
          slug: p.slug as string,
          content: p.content as string,
          excerpt: p.excerpt as string,
          featuredImage: p.featured_image as string,
          published: !!p.published,
          publishedAt: p.published_at as string,
          authorId: p.author_id as number,
          categoryId: p.category_id as number,
          tags: [],
          readTime: calculateReadTime(p.content as string),
          createdAt: p.created_at as string,
          updatedAt: (p.updated_at as string) || (p.created_at as string),
        };

        if (result.authorId) {
          const authorResult = await getAuthorById(result.authorId);
          result.author = authorResult.data || undefined;
        }

        if (result.categoryId) {
          const categoryResult = await getBlogCategoryById(result.categoryId);
          result.category = categoryResult.data || undefined;
        }

        return { success: true, data: result };
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('UNIQUE constraint failed')) {
          return { success: false, error: 'Slug 已存在' };
        }
        if (e instanceof Error && e.message.includes('Failed to retrieve')) {
          return { success: false, error: '文章不存在' };
        }
        throw e;
      }
    }

    const post = mockPosts.get(id);

    if (!post) {
      return {
        success: false,
        error: '文章不存在',
      };
    }

    // Check for duplicate slug if slug is being updated
    if (data.slug && data.slug !== post.slug) {
      const existing = Array.from(mockPosts.values()).find((p) => p.slug === data.slug);
      if (existing) {
        return {
          success: false,
          error: 'Slug 已存在',
        };
      }
    }

    // Validate authorId if provided
    if (data.authorId !== undefined && data.authorId !== null) {
      const authorResult = await getAuthorById(data.authorId);
      if (!authorResult.success) {
        return {
          success: false,
          error: '指定的作者不存在',
        };
      }
    }

    // Recalculate readTime if content is being updated
    const readTime = data.content !== undefined ? calculateReadTime(data.content) : post.readTime;

    const updated = {
      ...post,
      ...data,
      readTime, // Use recalculated or existing value
      updatedAt: new Date().toISOString(),
    };

    mockPosts.set(id, updated);

    // ✅ 返回带有作者数据的完整文章
    let postWithAuthor: PostWithAuthor = updated as PostWithAuthor;
    if (updated.authorId) {
      const authorResult = await getAuthorById(updated.authorId);
      postWithAuthor = {
        ...updated,
        author: authorResult.data || undefined,
      };
    }

    return {
      success: true,
      data: postWithAuthor,
    };
  } catch (error) {
    console.error('Error updating post:', error);
    return {
      success: false,
      error: '更新文章失败',
    };
  }
}

/**
 * Delete post
 */
export async function deletePost(id: number, db?: D1Database): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (db) {
      await deletePostD1(db, id);
      return { success: true };
    }

    const post = mockPosts.get(id);

    if (!post) {
      return {
        success: false,
        error: '文章不存在',
      };
    }

    mockPosts.delete(id);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting post:', error);
    return {
      success: false,
      error: '删除文章失败',
    };
  }
}

/**
 * Publish post
 */
export async function publishPost(id: number, db?: D1Database): Promise<{
  success: boolean;
  data?: PostWithAuthor;
  error?: string;
}> {
  try {
    if (db) {
      await publishPostD1(db, id);
      const postResult = await getPostById(id, db);
      return postResult;
    }

    const post = mockPosts.get(id);

    if (!post) {
      return {
        success: false,
        error: '文章不存在',
      };
    }

    const updated = {
      ...post,
      published: true,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPosts.set(id, updated);

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('Error publishing post:', error);
    return {
      success: false,
      error: '发布文章失败',
    };
  }
}

/**
 * Unpublish post
 */
export async function unpublishPost(id: number, db?: D1Database): Promise<{
  success: boolean;
  data?: PostWithAuthor;
  error?: string;
}> {
  try {
    if (db) {
      await unpublishPostD1(db, id);
      // unpublishPostD1 returns void, so we need to fetch the post to return it
      const postResult = await getPostById(id, db);
      return postResult;
    }

    const post = mockPosts.get(id);

    if (!post) {
      return {
        success: false,
        error: '文章不存在',
      };
    }

    const updated = {
      ...post,
      published: false,
      updatedAt: new Date().toISOString(),
    };

    mockPosts.set(id, updated);

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('Error unpublishing post:', error);
    return {
      success: false,
      error: '取消发布文章失败',
    };
  }
}

/**
 * Get post statistics
 */
export async function getPostStats(db?: D1Database): Promise<{
  success: boolean;
  data?: {
    total: number;
    published: number;
    draft: number;
  };
  error?: string;
}> {
  try {
    if (db) {
      const stats = await getPostStatsD1(db);
      return { success: true, data: stats };
    }

    const posts = Array.from(mockPosts.values());

    const published = posts.filter((p) => p.published).length;
    const draft = posts.length - published;

    return {
      success: true,
      data: {
        total: posts.length,
        published,
        draft,
      },
    };
  } catch (error) {
    console.error('Error getting post stats:', error);
    return {
      success: false,
      error: '获取文章统计失败',
    };
  }
}
