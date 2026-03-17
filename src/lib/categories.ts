/**
 * 分类管理工具库
 *
 * 独立的分类管理系统
 * - 分类数据与文章解耦
 * - 支持完整的 CRUD 操作
 * - 规范化设计（类似作者管理）
 */

/**
 * 分类完整数据（带 ID）
 */
export interface CategoryProfile {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  parentId?: number | null;  // ✅ 父分类 ID（树形结构）
  createdAt: string;
  updatedAt: string;
}

/**
 * 分类树形数据（包含子分类）
 */
export interface CategoryTree extends CategoryProfile {
  children?: CategoryTree[];  // ✅ 子分类列表
}

/**
 * 创建/编辑分类的数据
 */
export interface CategoryData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  parentId?: number | null;  // ✅ 父分类 ID
}

/**
 * Mock 分类数据库
 */
import {
  D1Database,
  getCategoriesD1,
  getCategoryD1,
  getCategoryBySlugD1,
  createCategoryD1,
  updateCategoryD1,
  deleteCategoryD1,
  DBCategory
} from '@/lib/d1-db';
import { SAMPLE_CATEGORIES } from '@/lib/sample-data';

type CategoryRow = DBCategory & {
  parent_id?: number | null;
};

function getCategoryParentId(category: CategoryRow): number | null {
  return typeof category.parent_id === 'number' || category.parent_id === null
    ? category.parent_id
    : null;
}

function mapCategoryRow(category: CategoryRow): CategoryProfile {
  return {
    id: category.id,
    name: category.name as string,
    slug: category.slug as string,
    description: category.description as string,
    imageUrl: category.image_url as string,
    isActive: !!category.is_active,
    parentId: getCategoryParentId(category),
    createdAt: category.created_at as string,
    updatedAt: (category.updated_at as string) || (category.created_at as string),
  };
}

const fallbackCategories = SAMPLE_CATEGORIES.map((category) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  imageUrl: category.imageUrl,
  isActive: category.isActive,
  parentId: null,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
}));



/**
 * 获取所有分类
 */
export async function getCategories(db?: D1Database): Promise<{
  success: boolean;
  data?: CategoryProfile[];
  error?: string;
}> {
  try {
    // Try D1 first if available
    if (db) {
      const d1Categories = await getCategoriesD1(db);
      // Convert DBCategory to CategoryProfile
      const categories = (d1Categories as CategoryRow[]).map(mapCategoryRow);
      return { success: true, data: categories };
    }

    // 模板模式下使用内置 mock 分类，保证页面可展示
    return {
      success: true,
      data: fallbackCategories,
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: '获取分类列表失败',
    };
  }
}

/**
 * 按 ID 获取分类
 */
export async function getCategoryById(id: number, db?: D1Database): Promise<{
  success: boolean;
  data?: CategoryProfile;
  error?: string;
}> {
  try {
    if (db) {
      const c = await getCategoryD1(db, id);
      return {
        success: true,
        data: {
          id: c.id,
          name: c.name as string,
          slug: c.slug as string,
          description: c.description as string,
          imageUrl: c.image_url as string,
          isActive: !!c.is_active,
          parentId: null,
          createdAt: c.created_at as string,
          updatedAt: c.updated_at as string || c.created_at as string,
        }
      };
    }

    const fallback = fallbackCategories.find((category) => category.id === id);
    if (fallback) {
      return {
        success: true,
        data: fallback,
      };
    }
    return {
      success: false,
      error: '分类不存在',
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    return {
      success: false,
      error: '获取分类详情失败',
    };
  }
}

/**
 * 按 slug 获取分类
 */
export async function getCategoryBySlug(slug: string, db?: D1Database): Promise<{
  success: boolean;
  data?: CategoryProfile;
  error?: string;
}> {
  try {
    if (db) {
      const c = await getCategoryBySlugD1(db, slug);
      return {
        success: true,
        data: {
          id: c.id,
          name: c.name as string,
          slug: c.slug as string,
          description: c.description as string,
          imageUrl: c.image_url as string,
          isActive: !!c.is_active,
          parentId: null,
          createdAt: c.created_at as string,
          updatedAt: c.updated_at as string || c.created_at as string,
        }
      };
    }

    const fallback = fallbackCategories.find((category) => category.slug === slug);
    if (fallback) {
      return {
        success: true,
        data: fallback,
      };
    }
    return {
      success: false,
      error: '分类不存在',
    };
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return {
      success: false,
      error: '获取分类详情失败',
    };
  }
}

/**
 * 创建新分类
 */
export async function createCategory(data: CategoryData, db?: D1Database): Promise<{
  success: boolean;
  data?: CategoryProfile;
  error?: string;
}> {
  try {
    // 验证必填字段
    if (!data.name || data.name.trim().length === 0) {
      return {
        success: false,
        error: '分类名称不能为空',
      };
    }

    if (!data.slug || data.slug.trim().length === 0) {
      return {
        success: false,
        error: '分类 slug 不能为空',
      };
    }

    if (db) {
      try {
        const c = await createCategoryD1(db, {
          name: data.name,
          slug: data.slug,
          description: data.description,
          parentId: data.parentId,
        });
        return {
          success: true,
          data: mapCategoryRow(c as CategoryRow)
        };
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('UNIQUE constraint failed')) {
          return { success: false, error: 'Slug 已存在' };
        }
        throw e;
      }
    }

    // ⚠️ 无 D1 连接时返回错误
    console.warn('⚠️ createCategory: 无 D1 数据库连接');
    return {
      success: false,
      error: '创建分类失败（无数据库连接）',
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: '创建分类失败',
    };
  }
}

/**
 * 更新分类
 */
export async function updateCategory(
  id: number,
  data: Partial<CategoryData>,
  db?: D1Database
): Promise<{
  success: boolean;
  data?: CategoryProfile;
  error?: string;
}> {
  try {
    if (db) {
      try {
        const c = await updateCategoryD1(db, id, {
          name: data.name,
          slug: data.slug,
          description: data.description,
          parentId: data.parentId,
        });
        return {
          success: true,
          data: mapCategoryRow(c as CategoryRow)
        };
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('UNIQUE constraint failed')) {
          return { success: false, error: 'Slug 已存在' };
        }
        throw e;
      }
    }

    // ⚠️ 无 D1 连接时返回错误
    console.warn('⚠️ updateCategory: 无 D1 数据库连接');
    return {
      success: false,
      error: '更新分类失败（无数据库连接）',
    };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: '更新分类失败',
    };
  }
}

/**
 * 删除分类
 */
export async function deleteCategory(id: number, db?: D1Database): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (db) {
      await deleteCategoryD1(db, id);
      return { success: true };
    }

    // ⚠️ 无 D1 连接时返回错误
    console.warn('⚠️ deleteCategory: 无 D1 数据库连接');
    return {
      success: false,
      error: '删除分类失败（无数据库连接）',
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: '删除分类失败',
    };
  }
}

/**
 * 获取分类树形结构
 */
export async function getCategoryTree(db?: D1Database): Promise<{
  success: boolean;
  data?: CategoryTree[];
  error?: string;
}> {
  try {
    let allCategories: CategoryProfile[] = [];

    // Use D1 database if available
    if (db) {
      const d1Categories = await getCategoriesD1(db);
      allCategories = (d1Categories as CategoryRow[]).map(mapCategoryRow);
    } else {
      console.warn('⚠️ getCategoryTree: 无 D1 数据库连接，返回空树');
    }

    // 构建树形结构
    const buildTree = (parentId: number | null = null): CategoryTree[] => {
      return allCategories
        .filter((c) => (c.parentId ?? null) === parentId)
        .map((c) => ({
          ...c,
          children: buildTree(c.id),
        }));
    };

    const tree = buildTree();

    return {
      success: true,
      data: tree,
    };
  } catch (error) {
    console.error('Error fetching category tree:', error);
    return {
      success: false,
      error: '获取分类树形结构失败',
    };
  }
}

/**
 * 获取子分类
 */
export async function getSubCategories(parentId: number, db?: D1Database): Promise<{
  success: boolean;
  data?: CategoryProfile[];
  error?: string;
}> {
  try {
    if (db) {
      const d1Categories = await getCategoriesD1(db);
      const subCategories = (d1Categories as CategoryRow[])
        .filter((category) => getCategoryParentId(category) === parentId)
        .map(mapCategoryRow);
      return { success: true, data: subCategories };
    }

    // ⚠️ 无 D1 连接时返回空数据
    console.warn('⚠️ getSubCategories: 无 D1 数据库连接');
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    console.error('Error fetching sub categories:', error);
    return {
      success: false,
      error: '获取子分类失败',
    };
  }
}
