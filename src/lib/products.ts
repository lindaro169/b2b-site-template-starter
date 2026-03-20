/**
 * Database Helper for Product Management
 *
 * Provides database operations for products using Drizzle ORM
 * This is a temporary implementation until full Drizzle integration
 */

export interface ProductFilters {
  categoryId?: number;
  isActive?: boolean;
  featured?: boolean;             // ✅ 按精选产品过滤
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductData {
  // 基础字段
  name: string;
  slug: string;
  sku?: string;                   // SKU 编码

  // 描述字段（分离）
  excerpt?: string;              // 摘要（短描述）
  description?: string;           // 详细描述

  // 价格和货币
  price?: number;
  priceCurrency?: string;         // 币种（USD, CNY等）

  // 分类和激活状态
  categoryId?: number;
  isActive?: boolean;
  featured?: boolean;             // ✅ 是否在首页显示为精选产品

  // 图片
  imageUrl?: string;              // 主图
  featuredImage?: {               // 前端封面图
    url: string;
  };
  gallery?: Array<{               // 产品图片库
    url: string;
    alt: string;
    displayOrder?: number;
  }>;

  // B2B 相关信息
  moq?: string;                   // 最小订购量（文本描述）
  leadTime?: string;              // 交期

  // 产品详情
  material?: string;              // 材料
  certifications?: string[];      // 认证列表
  customizationOptions?: string[]; // 自定义选项列表
  tags?: string[];                // 标签
  attributes?: string;            // JSON：扩展属性
  skuVariants?: string;           // JSON：SKU变体
  images?: string;                // JSON：多图数组
}

/**
 * Mock product database
 * In production, replace with actual D1 queries
 */
export interface Product extends ProductData {
  id: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type ProductGalleryItem = string | { url?: string; alt?: string };

import {
  D1Database,
  getProductsD1,
  getProductD1,
  getProductBySlugD1,
  createProductD1,
  updateProductD1,
  deleteProductD1,
  getProductStatsD1
} from '@/lib/d1-db';
import { siteConfig } from './site-config';

const globalForProducts = globalThis as unknown as {
  __mockProducts: Map<number, Product>;
  __nextProductId: number;
};

if (!globalForProducts.__mockProducts) {
  globalForProducts.__mockProducts = new Map<number, Product>();
  globalForProducts.__nextProductId = 1;
}

const mockProducts = globalForProducts.__mockProducts;
const getNextId = () => globalForProducts.__nextProductId++;

import { SAMPLE_PRODUCTS } from './sample-data';

// Initialize with sample products
export async function initializeSampleProducts() {
  // 如果已初始化，跳过
  if (mockProducts.size > 0) {
    return;
  }

  const samples = SAMPLE_PRODUCTS;

  for (let index = 0; index < samples.length; index++) {
    const sample = samples[index];
    const product = {
      id: getNextId(),
      ...sample,
      isActive: true,
      // ✅ 为每个分类选择第一个产品作为精选产品（共4个）
      // 分别为: Healing Crystal (index 0), 925 Silver (index 4), Chakra (index 8), Aromatherapy (index 12)
      featured: [0, 4, 8, 12].includes(index),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.set(product.id, product);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ 已初始化 ${mockProducts.size} 个珠宝产品 (Initialized ${mockProducts.size} jewelry products)`);
  }
}

function ensureSampleProducts() {
  if (mockProducts.size === 0) {
    void initializeSampleProducts();
  }

  return Array.from(mockProducts.values());
}

// --- R2 Utility Helper ---
function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return siteConfig.productPlaceholder;
  if (url.startsWith('/placeholders/')) return url;
  if (url.startsWith('http')) return url;
  return siteConfig.productPlaceholder;
}

export async function getProducts(
  filters?: ProductFilters,
  db?: D1Database
): Promise<{
  success: boolean;
  data?: Product[];
  total?: number;
  error?: string;
}> {
  try {
    if (db) {
      const productsList = await getProductsD1(db, filters);
      const products: Product[] = productsList.map(p => ({
        id: p.id,
        name: p.name as string,
        slug: p.slug as string,
        description: p.description as string,
        price: p.price as number,
        categoryId: p.category_id as number,
        imageUrl: resolveImageUrl(p.image_url as string),
        material: (p.material as string) || undefined,
        moq: (p.moq as string) || undefined,
        leadTime: (p.lead_time as string) || undefined,
        attributes: (p.attributes as string) || undefined,
        skuVariants: (p.sku_variants as string) || undefined,
        images: (p.images as string) || undefined,
        featuredImage: (p.images as string)
          ? { url: resolveImageUrl((typeof JSON.parse(p.images as string)[0] === 'string') ? JSON.parse(p.images as string)[0] : JSON.parse(p.images as string)[0]?.url) }
          : (p.image_url ? { url: resolveImageUrl(p.image_url as string) } : undefined),
        isActive: !!p.is_active,
        createdAt: p.created_at as string,
        updatedAt: p.updated_at as string || p.created_at as string,
      }));
      return {
        success: true,
        data: products,
        total: products.length // Approximation since D1 pagination doesn't return total yet
      };
    }

    const fallbackProducts = ensureSampleProducts();
    let filtered = [...fallbackProducts];

    if (filters?.isActive !== undefined) {
      filtered = filtered.filter((product) => product.isActive === filters.isActive);
    }
    if (filters?.categoryId) {
      filtered = filtered.filter((product) => product.categoryId === filters.categoryId);
    }
    if (filters?.featured !== undefined) {
      filtered = filtered.filter((product) => !!product.featured === filters.featured);
    }
    if (filters?.search) {
      const keyword = filters.search.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword) ||
        product.excerpt?.toLowerCase().includes(keyword)
      );
    }

    if (filters?.sortBy) {
      filtered.sort((a, b) => {
        const direction = filters.sortOrder === 'desc' ? -1 : 1;
        switch (filters.sortBy) {
          case 'price':
            return ((a.price || 0) - (b.price || 0)) * direction;
          case 'createdAt':
            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
          default:
            return a.name.localeCompare(b.name) * direction;
        }
      });
    }

    const total = filtered.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || total;
    filtered = filtered.slice(offset, offset + limit);

    return {
      success: true,
      data: filtered,
      total,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      error: '获取产品列表失败',
    };
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id: number, db?: D1Database): Promise<{
  success: boolean;
  data?: Product;
  error?: string;
}> {
  try {
    if (db) {
      const p = await getProductD1(db, id);
      return {
        success: true,
        data: {
          id: p.id,
          name: p.name as string,
          slug: p.slug as string,
          description: p.description as string,
          price: p.price as number,
          categoryId: p.category_id as number,
          imageUrl: resolveImageUrl(p.image_url as string),
          material: (p.material as string) || undefined,
          moq: (p.moq as string) || undefined,
          leadTime: (p.lead_time as string) || undefined,
          attributes: (p.attributes as string) || undefined,
          skuVariants: (p.sku_variants as string) || undefined,
          images: (p.images as string) || undefined,
          featuredImage: (p.images as string)
            ? { url: resolveImageUrl((typeof JSON.parse(p.images as string)[0] === 'string') ? JSON.parse(p.images as string)[0] : JSON.parse(p.images as string)[0]?.url) }
            : (p.image_url ? { url: resolveImageUrl(p.image_url as string) } : undefined),
          isActive: !!p.is_active,
          createdAt: p.created_at as string,
          updatedAt: p.updated_at as string || p.created_at as string,
        }
      };
    }
    const fallbackProducts = ensureSampleProducts();
    const product = fallbackProducts.find((item) => item.id === id);
    if (product) {
      return {
        success: true,
        data: product,
      };
    }
    return {
      success: false,
      error: '产品不存在',
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      success: false,
      error: '获取产品详情失败',
    };
  }
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string, db?: D1Database): Promise<{
  success: boolean;
  data?: Product;
  error?: string;
}> {
  try {
    if (db) {
      const p = await getProductBySlugD1(db, slug);
      return {
        success: true,
        data: {
          id: p.id,
          name: p.name as string,
          slug: p.slug as string,
          description: p.description as string,
          price: p.price as number,
          categoryId: p.category_id as number,
          imageUrl: p.image_url as string,
          material: (p.material as string) || undefined,
          moq: (p.moq as string) || undefined,
          leadTime: (p.lead_time as string) || undefined,
          attributes: (p.attributes as string) || undefined,
          skuVariants: (p.sku_variants as string) || undefined,
          images: (p.images as string) || undefined,
          featuredImage: (p.images as string)
            ? { url: resolveImageUrl((typeof JSON.parse(p.images as string)[0] === 'string') ? JSON.parse(p.images as string)[0] : JSON.parse(p.images as string)[0]?.url) }
            : (p.image_url ? { url: resolveImageUrl(p.image_url as string) } : undefined),
          gallery: (p.images as string)
            ? (JSON.parse(p.images as string) as ProductGalleryItem[]).map((img, index: number) => ({
              url: resolveImageUrl(typeof img === 'string' ? img : img.url),
              alt: typeof img === 'string' ? (p.name as string) : (img.alt || (p.name as string)),
              displayOrder: index
            }))
            : [],
          isActive: !!p.is_active,
          createdAt: p.created_at as string,
          updatedAt: p.updated_at as string || p.created_at as string,
        }
      };
    }
    const fallbackProducts = ensureSampleProducts();
    const product = fallbackProducts.find((item) => item.slug === slug);
    if (product) {
      return {
        success: true,
        data: product,
      };
    }
    return {
      success: false,
      error: '产品不存在',
    };
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return {
      success: false,
      error: '获取产品详情失败',
    };
  }
}

/**
 * Create new product
 */
export async function createProduct(
  data: ProductData,
  db?: D1Database
): Promise<{
  success: boolean;
  data?: Product;
  error?: string;
}> {
  try {
    // Validate required fields
    if (!data.name || !data.slug) {
      return {
        success: false,
        error: '产品名称和 slug 不能为空',
      };
    }

    if (db) {
      try {
        const p = await createProductD1(db, {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          categoryId: data.categoryId,
          imageUrl: data.imageUrl,
          isActive: data.isActive,
          material: data.material,
          moq: data.moq,
          leadTime: data.leadTime,
          attributes: data.attributes,
          skuVariants: data.skuVariants,
          images: data.images,
        });
        return {
          success: true,
          data: {
            id: p.id,
            name: p.name as string,
            slug: p.slug as string,
            description: p.description as string,
            price: p.price as number,
            categoryId: p.category_id as number,
            imageUrl: p.image_url as string,
            isActive: !!p.is_active,
            createdAt: p.created_at as string,
            updatedAt: p.updated_at as string || p.created_at as string,
          }
        };
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('UNIQUE constraint failed')) {
          return { success: false, error: 'Slug 已存在' };
        }
        throw e;
      }
    }

    ensureSampleProducts();
    // Check for duplicate slug
    const existing = Array.from(mockProducts.values()).find((p) => p.slug === data.slug);
    if (existing) {
      return {
        success: false,
        error: 'Slug 已存在',
      };
    }

    const product = {
      id: getNextId(),
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProducts.set(product.id, product);

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      error: '创建产品失败',
    };
  }
}

/**
 * Update product
 */
export async function updateProduct(
  id: number,
  data: Partial<ProductData>,
  db?: D1Database
): Promise<{
  success: boolean;
  data?: Product;
  error?: string;
}> {
  try {
    if (db) {
      try {
        const p = await updateProductD1(db, id, {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          categoryId: data.categoryId,
          imageUrl: data.imageUrl,
          isActive: data.isActive,
          material: data.material,
          moq: data.moq,
          leadTime: data.leadTime,
          attributes: data.attributes,
          skuVariants: data.skuVariants,
          images: data.images,
        });
        return {
          success: true,
          data: {
            id: p.id,
            name: p.name as string,
            slug: p.slug as string,
            description: p.description as string,
            price: p.price as number,
            categoryId: p.category_id as number,
            imageUrl: p.image_url as string,
            isActive: !!p.is_active,
            createdAt: p.created_at as string,
            updatedAt: p.updated_at as string || p.created_at as string,
          }
        };
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('UNIQUE constraint failed')) {
          return { success: false, error: 'Slug 已存在' };
        }
        throw e;
      }
    }

    ensureSampleProducts();
    const product = mockProducts.get(id);

    if (!product) {
      return {
        success: false,
        error: '产品不存在',
      };
    }

    // Check for duplicate slug if slug is being updated
    if (data.slug && data.slug !== product.slug) {
      const existing = Array.from(mockProducts.values()).find((p) => p.slug === data.slug);
      if (existing) {
        return {
          success: false,
          error: 'Slug 已存在',
        };
      }
    }

    const updated = {
      ...product,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockProducts.set(id, updated);

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      error: '更新产品失败',
    };
  }
}

/**
 * Delete product
 */
export async function deleteProduct(id: number, db?: D1Database): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (db) {
      await deleteProductD1(db, id);
      return { success: true };
    }

    ensureSampleProducts();
    const product = mockProducts.get(id);

    if (!product) {
      return {
        success: false,
        error: '产品不存在',
      };
    }

    mockProducts.delete(id);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      error: '删除产品失败',
    };
  }
}

/**
 * Get product statistics
 */
export async function getProductStats(db?: D1Database): Promise<{
  success: boolean;
  data?: {
    total: number;
    active: number;
    inactive: number;
    avgPrice?: number;
  };
  error?: string;
}> {
  try {
    if (db) {
      const stats = await getProductStatsD1(db);
      return {
        success: true,
        data: stats
      };
    }

    const fallbackProducts = ensureSampleProducts();
    const active = fallbackProducts.filter((product) => product.isActive).length;
    const total = fallbackProducts.length;
    const avgPrice = fallbackProducts.reduce((sum, product) => sum + (product.price || 0), 0) / (total || 1);
    return {
      success: true,
      data: { total, active, inactive: total - active, avgPrice },
    };
  } catch (error) {
    console.error('Error getting product stats:', error);
    return {
      success: false,
      error: '获取产品统计失败',
    };
  }
}
