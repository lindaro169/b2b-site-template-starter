/**
 * 博客分类管理工具库
 *
 * 独立的博客分类管理系统（与产品分类分离）
 * - 分类数据与文章解耦
 * - 支持完整的 CRUD 操作
 * - 规范化设计（类似作者管理）
 */

/**
 * 博客分类完整数据（带 ID）
 */
export interface BlogCategoryProfile {
  id: number;
  name: string;
  slug: string;
  description?: string;
  // 可选显示字段
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建/编辑博客分类的数据
 */
export interface BlogCategoryData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

/**
 * Mock 博客分类数据库
 */
const mockBlogCategories = new Map<number, BlogCategoryProfile>();

let nextBlogCategoryId = 1;

/**
 * 初始化示例博客分类
 */
export async function initializeSampleBlogCategories() {
  if (mockBlogCategories.size > 0) {
    return;
  }

  const samples: BlogCategoryData[] = [
    {
      name: 'Guide',
      slug: 'guide',
      description: 'Guides and tutorials for jewelry wholesale business',
    },
    {
      name: 'Trends',
      slug: 'trends',
      description: 'Industry trends and market updates',
    },
  ];

  for (const sample of samples) {
    const category: BlogCategoryProfile = {
      id: nextBlogCategoryId++,
      ...sample,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBlogCategories.set(category.id, category);
  }
}

/**
 * 获取所有博客分类
 */
export async function getBlogCategories(): Promise<{
  success: boolean;
  data?: BlogCategoryProfile[];
  error?: string;
}> {
  try {
    const categories = Array.from(mockBlogCategories.values()).sort(
      (a, b) => a.id - b.id
    );
    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return {
      success: false,
      error: '获取博客分类列表失败',
    };
  }
}

/**
 * 按 ID 获取博客分类
 */
export async function getBlogCategoryById(id: number): Promise<{
  success: boolean;
  data?: BlogCategoryProfile;
  error?: string;
}> {
  try {
    const category = mockBlogCategories.get(id);

    if (!category) {
      return {
        success: false,
        error: '博客分类不存在',
      };
    }

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error('Error fetching blog category:', error);
    return {
      success: false,
      error: '获取博客分类详情失败',
    };
  }
}

/**
 * 按 slug 获取博客分类
 */
export async function getBlogCategoryBySlug(slug: string): Promise<{
  success: boolean;
  data?: BlogCategoryProfile;
  error?: string;
}> {
  try {
    const category = Array.from(mockBlogCategories.values()).find(
      (c) => c.slug === slug
    );

    if (!category) {
      return {
        success: false,
        error: '博客分类不存在',
      };
    }

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error('Error fetching blog category by slug:', error);
    return {
      success: false,
      error: '获取博客分类详情失败',
    };
  }
}

/**
 * 创建新博客分类
 */
export async function createBlogCategory(data: BlogCategoryData): Promise<{
  success: boolean;
  data?: BlogCategoryProfile;
  error?: string;
}> {
  try {
    // 验证必填字段
    if (!data.name || data.name.trim().length === 0) {
      return {
        success: false,
        error: '博客分类名称不能为空',
      };
    }

    // 自动生成 slug（如果未提供）
    const slug = data.slug ? data.slug.trim().toLowerCase() : data.name.trim().toLowerCase();

    // 检查 slug 重复
    const exists = Array.from(mockBlogCategories.values()).some(
      (c) => c.slug === slug
    );
    if (exists) {
      return {
        success: false,
        error: 'Slug 已存在',
      };
    }

    const category: BlogCategoryProfile = {
      id: nextBlogCategoryId++,
      name: data.name.trim(),
      slug: slug,
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockBlogCategories.set(category.id, category);

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error('Error creating blog category:', error);
    return {
      success: false,
      error: '创建博客分类失败',
    };
  }
}

/**
 * 更新博客分类
 */
export async function updateBlogCategory(
  id: number,
  data: Partial<BlogCategoryData>
): Promise<{
  success: boolean;
  data?: BlogCategoryProfile;
  error?: string;
}> {
  try {
    const category = mockBlogCategories.get(id);

    if (!category) {
      return {
        success: false,
        error: '博客分类不存在',
      };
    }

    // 检查 slug 重复（如果修改了 slug）
    if (data.slug && data.slug !== category.slug) {
      const exists = Array.from(mockBlogCategories.values()).some(
        (c) => c.id !== id && c.slug === data.slug
      );
      if (exists) {
        return {
          success: false,
          error: 'Slug 已存在',
        };
      }
    }

    const updated: BlogCategoryProfile = {
      ...category,
      name: data.name ? data.name.trim() : category.name,
      slug: data.slug ? data.slug.trim().toLowerCase() : category.slug,
      description: data.description !== undefined ? data.description : category.description,
      updatedAt: new Date().toISOString(),
    };

    mockBlogCategories.set(id, updated);

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('Error updating blog category:', error);
    return {
      success: false,
      error: '更新博客分类失败',
    };
  }
}

/**
 * 删除博客分类
 */
export async function deleteBlogCategory(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const category = mockBlogCategories.get(id);

    if (!category) {
      return {
        success: false,
        error: '博客分类不存在',
      };
    }

    mockBlogCategories.delete(id);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting blog category:', error);
    return {
      success: false,
      error: '删除博客分类失败',
    };
  }
}
