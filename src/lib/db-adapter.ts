/**
 * 混合数据库适配层
 *
 * 支持在内存存储和 D1 数据库之间切换
 * 优先使用 D1 数据库，如果不可用则使用内存存储
 */

import {
  getProductsD1,
  createProductD1,
  updateProductD1,
  deleteProductD1,
  getProductStatsD1,
  getPostsD1,
  createPostD1,
  publishPostD1,
  getPostStatsD1,
  saveContactD1,
  type D1Database,
  type DBProduct,
  type DBPost,
  type DBContact,
} from './d1-db';

import {
  getProducts as getProductsMock,
  createProduct as createProductMock,
  updateProduct as updateProductMock,
  deleteProduct as deleteProductMock,
  getProductStats as getProductStatsMock,
  type ProductFilters,
  type ProductData,
} from './products';

import {
  getPosts as getPostsMock,
  createPost as createPostMock,
  publishPost as publishPostMock,
  getPostStats as getPostStatsMock,
  type PostFilters,
  type PostData,
  type PostWithAuthor,
} from './posts';

// 推断 D1 方法的 filters 参数类型，避免使用 `any`
type GetProductsFilters = Parameters<typeof getProductsD1>[1];
type GetPostsFilters = Parameters<typeof getPostsD1>[1];

/**
 * 数据库适配器
 * 在实际 Request 对象中获取 D1 数据库绑定
 */
export class DatabaseAdapter {
  private db: D1Database | null;
  private useD1: boolean;

  constructor(dbBinding?: D1Database) {
    this.db = dbBinding || null;
    this.useD1 = !!dbBinding;

    if (!this.useD1) {
      console.info('📦 使用内存存储 (D1 不可用)');
    }
  }

  /**
   * 产品相关操作
   */
  async getProducts(filters?: ProductFilters): Promise<DBProduct[]> {
    if (this.useD1 && this.db) {
      return await getProductsD1(this.db, filters as unknown as GetProductsFilters);
    }
    const result = await getProductsMock(filters);
    return (result.data as unknown as DBProduct[]) || [];
  }

  async createProduct(data: ProductData): Promise<DBProduct> {
    if (this.useD1 && this.db) {
      return await createProductD1(this.db, data);
    }
    const result = await createProductMock(data);
    return result.data as unknown as DBProduct;
  }

  async updateProduct(id: number, data: Partial<ProductData>): Promise<DBProduct> {
    if (this.useD1 && this.db) {
      return await updateProductD1(this.db, id, data);
    }
    const result = await updateProductMock(id, data);
    return result.data as unknown as DBProduct;
  }

  async deleteProduct(id: number) {
    if (this.useD1 && this.db) {
      await deleteProductD1(this.db, id);
      return { success: true };
    }
    return await deleteProductMock(id);
  }

  async getProductStats() {
    if (this.useD1 && this.db) {
      return await getProductStatsD1(this.db);
    }
    const result = await getProductStatsMock();
    return result.data;
  }

  /**
   * 文章相关操作
   */
  async getPosts(filters?: PostFilters): Promise<DBPost[] | PostWithAuthor[]> {
    if (this.useD1 && this.db) {
      return await getPostsD1(this.db, filters as unknown as GetPostsFilters);
    }
    const result = await getPostsMock(filters);
    return (result.data as PostWithAuthor[]) || [];
  }

  async createPost(data: PostData) {
    if (this.useD1 && this.db) {
      return await createPostD1(this.db, data);
    }
    const result = await createPostMock(data);
    return result.data as PostWithAuthor;
  }

  async publishPost(id: number): Promise<DBPost | PostWithAuthor | undefined> {
    if (this.useD1 && this.db) {
      await publishPostD1(this.db, id);
      // 重新获取文章以返回完整数据
      const posts = (await this.getPosts()) as DBPost[];
      return posts.find((p) => (p as DBPost).id === id);
    }
    const result = await publishPostMock(id);
    return result.data as PostWithAuthor;
  }

  async getPostStats() {
    if (this.useD1 && this.db) {
      return await getPostStatsD1(this.db);
    }
    const result = await getPostStatsMock();
    return result.data;
  }

  /**
   * 联系表单操作
   */
  async saveContact(data: { name: string; email: string; phone?: string; message: string }): Promise<DBContact | { success: boolean }> {
    if (this.useD1 && this.db) {
      return await saveContactD1(this.db, data);
    }
    // 内存存储不支持联系表单，返回成功但不保存
    return { success: true };
  }

  /**
   * 检查数据库状态
   */
  isD1Connected(): boolean {
    return this.useD1;
  }

  isDatabaseReady(): boolean {
    return !!this.db;
  }
}

/**
 * 从 Next.js Request 中提取 D1 数据库适配器
 *
 * 使用示例:
 * ```typescript
 * import { getDatabaseAdapter } from '@/lib/db-adapter';
 * import { NextRequest } from 'next/server';
 *
 * export async function GET(request: NextRequest) {
 *   const db = getDatabaseAdapter(request);
 *   const products = await db.getProducts();
 * }
 * ```
 */
export function getDatabaseAdapter(request?: { env?: { DB?: D1Database } }): DatabaseAdapter {
  // 尝试从 request 中获取 D1 绑定
  let dbBinding = null as D1Database | null;

  if (request?.env?.DB) {
    dbBinding = request.env.DB;
  }

  return new DatabaseAdapter(dbBinding);
}

/**
 * 默认数据库适配器 (开发环境)
 */
export const defaultDb = new DatabaseAdapter();
