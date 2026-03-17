/**
 * D1 数据库配置和初始化
 * 用于 Cloudflare D1 SQLite 数据库
 *
 * 在 Cloudflare Workers 环境中使用时，从 context.env.DB 获取数据库实例
 * 在 Next.js 本地开发中，使用模拟实现或 wrangler d1 执行
 */

import type { RequestGeoInfo, VisitorTrackingSnapshot } from '@/lib/visitor-tracking';

// 数据库类型定义
export interface D1Database {
  prepare(query: string): D1Statement;
  exec(query: string): Promise<D1ExecResult>;
  batch<T = unknown>(statements: D1Statement[]): Promise<D1Result<T>[]>;
}

export interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(colName?: string): Promise<T | undefined>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
  success: boolean;
  results?: T[];
  meta?: {
    duration: number;
    served_by?: string;
    internal_stats?: string;
  };
}

export interface D1ExecResult {
  success: boolean;
  count: number;
  duration: number;
}

// 通用的 D1 行类型（查询结果）
export type D1Row = Record<string, unknown>;

// 更具体的领域类型（保守定义，避免显式 any）
export type DBRecord = Record<string, unknown>;
export type DBProduct = DBRecord & { id: number };
export type DBPost = DBRecord & { id: number };
export type DBContact = DBRecord & { id: number };
export type DBInquiry = DBRecord & { id: number };
export type DBCategory = DBRecord & { id: number };
export type DBTestimonial = DBRecord & { id: number };
export type DBFAQ = DBRecord & { id: number };
export type DBProject = DBRecord & { id: number };
export type LeadType = 'contact' | 'inquiry';
export type LeadSalesStage = 'new' | 'qualified' | 'won' | 'junk';

export interface LeadAttributionInput {
  tracking?: VisitorTrackingSnapshot | null;
  geo?: RequestGeoInfo | null;
  googleSubmitSentAt?: string | null;
}

export interface AdminLeadRecord {
  id: number;
  leadType: LeadType;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  productId: number | null;
  status: string | null;
  salesStage: LeadSalesStage;
  salesStageUpdatedAt: string | null;
  createdAt: string;
  visitorId: string | null;
  sessionId: string | null;
  visitorType: string | null;
  landingPage: string | null;
  sourceLabel: string | null;
  sourcePlatform: string | null;
  sourceChannel: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  clickIds: Record<string, string>;
  customTags: Record<string, string>;
  tracking: VisitorTrackingSnapshot | null;
  geo: RequestGeoInfo | null;
  googleSubmitSentAt: string | null;
  googleQualifiedSentAt: string | null;
  googleWonSentAt: string | null;
  googleSyncError: string | null;
}

// 用于统计查询的行类型
export type ProductStatsRow = {
  total?: number | string;
  active?: number | string;
  inactive?: number | string;
  avgPrice?: number | string;
};

export type PostStatsRow = {
  total?: number | string;
  published?: number | string;
  draft?: number | string;
};

/**
 * 初始化 D1 数据库连接
 *
 * 在 Next.js API 路由中使用:
 * ```typescript
 * const db = getD1Database(request.env?.DB);
 * const result = await db.prepare('SELECT * FROM products').all();
 * ```
 */
export function getD1Database(dbBinding?: D1Database): D1Database | null {
  if (dbBinding) {
    return dbBinding;
  }

  // 在开发环境中，返回 null（由调用方通过 getCloudflareContext 获取 binding）
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  throw new Error('D1 数据库连接失败');
}

/**
 * 创建表的 SQL 语句
 */
export const CREATE_TABLES_SQL = `
-- 管理员用户表
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT 0,
  last_login TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_at ON admin_users(created_at);
`;

/**
 * 产品操作 - D1 版本
 */
export async function getProductsD1(
  db: D1Database,
  filters?: {
    categoryId?: number;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }
): Promise<DBProduct[]> {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params: unknown[] = [];

  if (filters?.categoryId) {
    query += ' AND category_id = ?';
    params.push(filters.categoryId);
  }

  if (filters?.isActive !== undefined) {
    query += ' AND is_active = ?';
    params.push(filters.isActive ? 1 : 0);
  }

  if (filters?.search) {
    query += ' AND (name LIKE ? OR slug LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  // 排序
  let sortBy = filters?.sortBy || 'created_at';
  if (sortBy === 'createdAt') {
    sortBy = 'created_at';
  }
  const sortOrder = filters?.sortOrder || 'desc';
  query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

  // Pagination
  const limit = Math.min(filters?.limit || 20, 100);
  const offset = filters?.offset || 0;
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit);
  params.push(offset);

  try {
    const statement = db.prepare(query);
    const result = await statement.bind(...params).all<D1Row>();

    if (!result.success) {
      throw new Error('Failed to fetch products');
    }

    return (result.results as DBProduct[]) || [];
  } catch (error) {
    throw error;
  }
}

/**
 * 获取单个产品 - D1 版本
 */
export async function getProductD1(db: D1Database, id: number): Promise<DBProduct> {
  try {
    const result = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).all<D1Row>();

    if (!result.success || !result.results?.[0]) {
      throw new Error('Product not found');
    }

    return result.results[0] as DBProduct;
  } catch (error) {
    console.error('Error fetching product from D1:', error);
    throw error;
  }
}

/**
 * 按 Slug 获取产品 - D1 版本
 */
export async function getProductBySlugD1(db: D1Database, slug: string): Promise<DBProduct> {
  try {
    const result = await db.prepare('SELECT * FROM products WHERE slug = ?').bind(slug).all<D1Row>();

    if (!result.success || !result.results?.[0]) {
      throw new Error('Product not found');
    }

    return result.results[0] as DBProduct;
  } catch (error) {
    console.error('Error fetching product by slug from D1:', error);
    throw error;
  }
}

/**
 * 创建产品 - D1 版本
 */
export async function createProductD1(
  db: D1Database,
  data: {
    name: string;
    slug: string;
    description?: string;
    price?: number;
    categoryId?: number;
    imageUrl?: string;
    isActive?: boolean;
    material?: string;
    moq?: string;
    leadTime?: string;
    attributes?: string;
    skuVariants?: string;
    images?: string;
  }
): Promise<DBProduct> {
  const query = `
    INSERT INTO products (
      name, slug, description, price, category_id, image_url,
      material, moq, lead_time, attributes, sku_variants, images,
      is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  const params: unknown[] = [
    data.name,
    data.slug,
    data.description || null,
    data.price || null,
    data.categoryId || null,
    data.imageUrl || null,
    data.material || null,
    data.moq || null,
    data.leadTime || null,
    data.attributes || null,
    data.leadTime || null,
    data.attributes || null,
    data.skuVariants || null,
    data.images || null,
    data.isActive !== false ? 1 : 0,
  ];

  try {
    const result = await db.prepare(query).bind(...params).run();

    if (!result.success) {
      throw new Error('Failed to create product');
    }

    // 获取新插入的产品
    const selectQuery = 'SELECT * FROM products WHERE id = last_insert_rowid()';
    const selectResult = await db.prepare(selectQuery).all<D1Row>();

    if (!selectResult.success || !selectResult.results?.[0]) {
      throw new Error('Failed to retrieve created product');
    }

    return selectResult.results[0] as DBProduct;
  } catch (error) {
    console.error('Error creating product in D1:', error);
    throw error;
  }
}

/**
 * 更新产品 - D1 版本
 */
export async function updateProductD1(
  db: D1Database,
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    description?: string;
    price?: number;
    categoryId?: number;
    imageUrl?: string;
    isActive?: boolean;
    material?: string;
    moq?: string;
    leadTime?: string;
    attributes?: string;
    skuVariants?: string;
    images?: string;
  }>
): Promise<DBProduct> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.name) {
    fields.push('name = ?');
    params.push(data.name);
  }
  if (data.slug) {
    fields.push('slug = ?');
    params.push(data.slug);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    params.push(data.description);
  }
  if (data.price !== undefined) {
    fields.push('price = ?');
    params.push(data.price);
  }
  if (data.categoryId !== undefined) {
    fields.push('category_id = ?');
    params.push(data.categoryId);
  }
  if (data.imageUrl !== undefined) {
    fields.push('image_url = ?');
    params.push(data.imageUrl);
  }
  if (data.isActive !== undefined) {
    fields.push('is_active = ?');
    params.push(data.isActive ? 1 : 0);
  }
  if (data.material !== undefined) {
    fields.push('material = ?');
    params.push(data.material);
  }
  if (data.moq !== undefined) {
    fields.push('moq = ?');
    params.push(data.moq);
  }
  if (data.leadTime !== undefined) {
    fields.push('lead_time = ?');
    params.push(data.leadTime);
  }
  if (data.attributes !== undefined) {
    fields.push('attributes = ?');
    params.push(data.attributes);
  }
  if (data.skuVariants !== undefined) {
    fields.push('sku_variants = ?');
    params.push(data.skuVariants);
  }
  if (data.images !== undefined) {
    fields.push('images = ?');
    params.push(data.images);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');

  const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);

  try {
    await db.prepare(query).bind(...params).run();

    // 获取更新后的产品
    const selectResult = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).all<D1Row>();

    if (!selectResult.success || !selectResult.results?.[0]) {
      throw new Error('Failed to retrieve updated product');
    }

    return selectResult.results[0] as DBProduct;
  } catch (error) {
    console.error('Error updating product in D1:', error);
    throw error;
  }
}

/**
 * 删除产品 - D1 版本
 */
export async function deleteProductD1(db: D1Database, id: number): Promise<void> {
  try {
    await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  } catch (error) {
    console.error('Error deleting product from D1:', error);
    throw error;
  }
}

/**
 * 获取产品统计 - D1 版本
 */
export async function getProductStatsD1(
  db: D1Database
): Promise<{
  total: number;
  active: number;
  inactive: number;
  avgPrice: number;
}> {
  try {
    const result = await db
      .prepare(
        `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
        ROUND(AVG(CASE WHEN price IS NOT NULL THEN price ELSE 0 END), 2) as avgPrice
      FROM products
    `
      )
      .all();

    if (!result.success || !result.results?.[0]) {
      throw new Error('Failed to fetch product stats');
    }

    const stats = result.results[0] as ProductStatsRow;
    return {
      total: Number(stats.total ?? 0),
      active: Number(stats.active ?? 0),
      inactive: Number(stats.inactive ?? 0),
      avgPrice: Number(stats.avgPrice ?? 0),
    };
  } catch (error) {
    console.error('Error fetching product stats from D1:', error);
    throw error;
  }
}

/**
 * 文章操作 - D1 版本
 */
export async function getPostsD1(
  db: D1Database,
  filters?: {
    search?: string;
    published?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'title' | 'createdAt' | 'publishedAt';
    sortOrder?: 'asc' | 'desc';
  }
): Promise<DBPost[]> {
  let query = 'SELECT * FROM posts WHERE 1=1';
  const params: unknown[] = [];

  if (filters?.published !== undefined) {
    query += ' AND published = ?';
    params.push(filters.published ? 1 : 0);
  }

  if (filters?.search) {
    query += ' AND (title LIKE ? OR slug LIKE ? OR excerpt LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  // 排序
  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';
  query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

  // 分页
  const limit = Math.min(filters?.limit || 20, 100);
  const offset = filters?.offset || 0;
  query += ` LIMIT ${limit} OFFSET ${offset}`;

  try {
    const result = await db.prepare(query).bind(...params).all<D1Row>();

    if (!result.success) {
      throw new Error('Failed to fetch posts');
    }

    return (result.results as DBPost[]) || [];
  } catch (error) {
    console.error('Error fetching posts from D1:', error);
    throw error;
  }
}

/**
 * 创建文章 - D1 版本
 */
export async function createPostD1(
  db: D1Database,
  data: {
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    published?: boolean;
    publishedAt?: string;
  }
): Promise<DBPost> {
  const query = `
    INSERT INTO posts (
      title, slug, content, excerpt, featured_image, published, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  const params: unknown[] = [
    data.title,
    data.slug,
    data.content || null,
    data.excerpt || null,
    data.featuredImage || null,
    data.published ? 1 : 0,
    data.publishedAt || null,
  ];

  try {
    const result = await db.prepare(query).bind(...params).run();

    if (!result.success) {
      throw new Error('Failed to create post');
    }

    // 获取新插入的文章
    const selectQuery = 'SELECT * FROM posts WHERE id = last_insert_rowid()';
    const selectResult = await db.prepare(selectQuery).all<D1Row>();

    if (!selectResult.success || !selectResult.results?.[0]) {
      throw new Error('Failed to retrieve created post');
    }

    return selectResult.results[0] as DBPost;
  } catch (error) {
    console.error('Error creating post in D1:', error);
    throw error;
  }
}

/**
 * 获取文章 - D1 版本
 */
export async function getPostD1(db: D1Database, id: number): Promise<D1Row> {
  try {
    const result = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).all<D1Row>();

    if (!result.success || !result.results?.[0]) {
      throw new Error('Post not found');
    }

    return result.results[0] as DBPost;
  } catch (error) {
    console.error('Error fetching post from D1:', error);
    throw error;
  }
}

/**
 * 发布文章 - D1 版本
 */
export async function publishPostD1(db: D1Database, id: number): Promise<void> {
  try {
    await db
      .prepare('UPDATE posts SET published = 1, published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(id)
      .run();
  } catch (error) {
    console.error('Error publishing post in D1:', error);
    throw error;
  }
}

/**
 * 获取文章统计 - D1 版本
 */
export async function getPostStatsD1(
  db: D1Database
): Promise<{
  total: number;
  published: number;
  draft: number;
}> {
  try {
    const result = await db
      .prepare(
        `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN published = 1 THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN published = 0 THEN 1 ELSE 0 END) as draft
      FROM posts
    `
      )
      .all();

    if (!result.success || !result.results?.[0]) {
      throw new Error('Failed to fetch post stats');
    }

    const stats = result.results[0] as PostStatsRow;
    return {
      total: Number(stats.total ?? 0),
      published: Number(stats.published ?? 0),
      draft: Number(stats.draft ?? 0),
    };
  } catch (error) {
    console.error('Error fetching post stats from D1:', error);
    throw error;
  }
}

/**
 * 更新文章 - D1 版本
 */
export async function updatePostD1(
  db: D1Database,
  id: number,
  data: Partial<{
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    published?: boolean;
    publishedAt?: string;
    authorId?: number;
    categoryId?: number;
  }>
): Promise<DBPost> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.title) {
    fields.push('title = ?');
    params.push(data.title);
  }
  if (data.slug) {
    fields.push('slug = ?');
    params.push(data.slug);
  }
  if (data.content !== undefined) {
    fields.push('content = ?');
    params.push(data.content);
  }
  if (data.excerpt !== undefined) {
    fields.push('excerpt = ?');
    params.push(data.excerpt);
  }
  if (data.featuredImage !== undefined) {
    fields.push('featured_image = ?');
    params.push(data.featuredImage);
  }
  if (data.published !== undefined) {
    fields.push('published = ?');
    params.push(data.published ? 1 : 0);
  }
  if (data.publishedAt !== undefined) {
    fields.push('published_at = ?');
    params.push(data.publishedAt);
  }
  if (data.authorId !== undefined) {
    fields.push('author_id = ?');
    params.push(data.authorId);
  }
  if (data.categoryId !== undefined) {
    fields.push('category_id = ?');
    params.push(data.categoryId);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');

  const query = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);

  try {
    await db.prepare(query).bind(...params).run();

    const selectResult = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).all<D1Row>();

    if (!selectResult.success || !selectResult.results?.[0]) {
      throw new Error('Failed to retrieve updated post');
    }

    return selectResult.results[0] as DBPost;
  } catch (error) {
    console.error('Error updating post in D1:', error);
    throw error;
  }
}

/**
 * 删除文章 - D1 版本
 */
export async function deletePostD1(db: D1Database, id: number): Promise<void> {
  try {
    await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  } catch (error) {
    console.error('Error deleting post from D1:', error);
    throw error;
  }
}

/**
 * 取消发布文章 - D1 版本
 */
export async function unpublishPostD1(db: D1Database, id: number): Promise<void> {
  try {
    await db
      .prepare('UPDATE posts SET published = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(id)
      .run();
  } catch (error) {
    console.error('Error unpublishing post in D1:', error);
    throw error;
  }
}

function stringifyJson(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'object' && Object.keys(value as Record<string, unknown>).length === 0) {
    return null;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function parseStringMap(value: unknown): Record<string, string> {
  if (typeof value !== 'string' || !value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[0] === 'string' && typeof entry[1] === 'string'
      )
    );
  } catch {
    return {};
  }
}

function parseTrackingSnapshot(value: unknown): VisitorTrackingSnapshot | null {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  try {
    return JSON.parse(value) as VisitorTrackingSnapshot;
  } catch {
    return null;
  }
}

function coerceString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function coerceNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeLeadSalesStage(value: unknown): LeadSalesStage {
  return value === 'qualified' || value === 'won' || value === 'junk' ? value : 'new';
}

function extractLeadAttributionFields(
  input?: LeadAttributionInput
): {
  visitorId: string | null;
  sessionId: string | null;
  visitorType: string | null;
  landingPage: string | null;
  sourceLabel: string | null;
  sourcePlatform: string | null;
  sourceChannel: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  clickIds: string | null;
  customTags: string | null;
  trackingJson: string | null;
  geoCountry: string | null;
  geoRegion: string | null;
  geoCity: string | null;
  googleSubmitSentAt: string | null;
} {
  const tracking = input?.tracking ?? null;
  const geo = input?.geo ?? null;

  return {
    visitorId: tracking?.visitorId ?? null,
    sessionId: tracking?.sessionId ?? null,
    visitorType: tracking?.visitorType ?? null,
    landingPage: tracking?.landingPage?.pathWithQuery ?? null,
    sourceLabel: tracking?.source?.label ?? null,
    sourcePlatform: tracking?.source?.platform ?? null,
    sourceChannel: tracking?.source?.channel ?? null,
    utmSource: tracking?.attribution?.utmSource ?? null,
    utmMedium: tracking?.attribution?.utmMedium ?? null,
    utmCampaign: tracking?.attribution?.utmCampaign ?? null,
    utmTerm: tracking?.attribution?.utmTerm ?? null,
    utmContent: tracking?.attribution?.utmContent ?? null,
    clickIds: stringifyJson(tracking?.attribution?.clickIds),
    customTags: stringifyJson(tracking?.attribution?.customTags),
    trackingJson: stringifyJson(tracking),
    geoCountry: geo?.countryName ?? geo?.countryCode ?? null,
    geoRegion: geo?.region ?? geo?.regionCode ?? null,
    geoCity: geo?.city ?? null,
    googleSubmitSentAt: input?.googleSubmitSentAt ?? null,
  };
}

function mapAdminLeadRow(row: D1Row): AdminLeadRecord {
  const geoCountry = coerceString(row.geo_country);
  const geoRegion = coerceString(row.geo_region);
  const geoCity = coerceString(row.geo_city);

  return {
    id: coerceNumber(row.id) ?? 0,
    leadType: row.lead_type === 'inquiry' ? 'inquiry' : 'contact',
    name: coerceString(row.name) ?? '',
    email: coerceString(row.email) ?? '',
    phone: coerceString(row.phone),
    company: coerceString(row.company),
    subject: coerceString(row.subject),
    message: coerceString(row.message) ?? '',
    productId: coerceNumber(row.product_id),
    status: coerceString(row.status),
    salesStage: normalizeLeadSalesStage(row.sales_stage),
    salesStageUpdatedAt: coerceString(row.sales_stage_updated_at),
    createdAt: coerceString(row.created_at) ?? new Date().toISOString(),
    visitorId: coerceString(row.visitor_id),
    sessionId: coerceString(row.session_id),
    visitorType: coerceString(row.visitor_type),
    landingPage: coerceString(row.landing_page),
    sourceLabel: coerceString(row.source_label),
    sourcePlatform: coerceString(row.source_platform),
    sourceChannel: coerceString(row.source_channel),
    utmSource: coerceString(row.utm_source),
    utmMedium: coerceString(row.utm_medium),
    utmCampaign: coerceString(row.utm_campaign),
    utmTerm: coerceString(row.utm_term),
    utmContent: coerceString(row.utm_content),
    clickIds: parseStringMap(row.click_ids),
    customTags: parseStringMap(row.custom_tags),
    tracking: parseTrackingSnapshot(row.tracking_json),
    geo:
      geoCountry || geoRegion || geoCity
        ? {
            countryName: geoCountry ?? undefined,
            region: geoRegion ?? undefined,
            city: geoCity ?? undefined,
          }
        : null,
    googleSubmitSentAt: coerceString(row.google_submit_sent_at),
    googleQualifiedSentAt: coerceString(row.google_qualified_sent_at),
    googleWonSentAt: coerceString(row.google_won_sent_at),
    googleSyncError: coerceString(row.google_sync_error),
  };
}

/**
 * 保存联系表单 - D1 版本
 */
export async function saveContactD1(
  db: D1Database,
  data: {
    name: string;
    email: string;
    subject?: string;
    phone?: string;
    message: string;
    tracking?: VisitorTrackingSnapshot | null;
    geo?: RequestGeoInfo | null;
    googleSubmitSentAt?: string | null;
  }
): Promise<DBContact> {
  const attribution = extractLeadAttributionFields({
    tracking: data.tracking,
    geo: data.geo,
    googleSubmitSentAt: data.googleSubmitSentAt,
  });

  const query = `
    INSERT INTO contacts (
      name, email, subject, phone, message, status, sales_stage, sales_stage_updated_at,
      visitor_id, session_id, visitor_type, landing_page,
      source_label, source_platform, source_channel,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      click_ids, custom_tags, tracking_json,
      geo_country, geo_region, geo_city,
      google_submit_sent_at, created_at
    )
    VALUES (
      ?, ?, ?, ?, ?, 'unread', 'new', CURRENT_TIMESTAMP,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, CURRENT_TIMESTAMP
    )
  `;

  const params: unknown[] = [
    data.name,
    data.email,
    data.subject || null,
    data.phone || null,
    data.message,
    attribution.visitorId,
    attribution.sessionId,
    attribution.visitorType,
    attribution.landingPage,
    attribution.sourceLabel,
    attribution.sourcePlatform,
    attribution.sourceChannel,
    attribution.utmSource,
    attribution.utmMedium,
    attribution.utmCampaign,
    attribution.utmTerm,
    attribution.utmContent,
    attribution.clickIds,
    attribution.customTags,
    attribution.trackingJson,
    attribution.geoCountry,
    attribution.geoRegion,
    attribution.geoCity,
    attribution.googleSubmitSentAt,
  ];

  try {
    const result = await db.prepare(query).bind(...params).run();

    if (!result.success) {
      throw new Error('Failed to save contact');
    }

    // 获取新插入的记录
    const selectQuery = 'SELECT * FROM contacts WHERE id = last_insert_rowid()';
    const selectResult = await db.prepare(selectQuery).all<D1Row>();

    if (!selectResult.success || !selectResult.results?.[0]) {
      throw new Error('Failed to retrieve saved contact');
    }

    return selectResult.results[0] as DBContact;
  } catch (error) {
    console.error('Error saving contact in D1:', error);
    throw error;
  }
}

/**
 * 保存产品询盘 - D1 版本
 */
export async function saveInquiryD1(
  db: D1Database,
  data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message: string;
    productId?: number;
    tracking?: VisitorTrackingSnapshot | null;
    geo?: RequestGeoInfo | null;
    googleSubmitSentAt?: string | null;
  }
): Promise<DBInquiry> {
  const attribution = extractLeadAttributionFields({
    tracking: data.tracking,
    geo: data.geo,
    googleSubmitSentAt: data.googleSubmitSentAt,
  });

  const query = `
    INSERT INTO inquiries (
      name, email, phone, company, message, product_id, status, sales_stage, sales_stage_updated_at,
      visitor_id, session_id, visitor_type, landing_page,
      source_label, source_platform, source_channel,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      click_ids, custom_tags, tracking_json,
      geo_country, geo_region, geo_city,
      google_submit_sent_at, created_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, 'new', 'new', CURRENT_TIMESTAMP,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, CURRENT_TIMESTAMP
    )
  `;

  const params: unknown[] = [
    data.name,
    data.email,
    data.phone || null,
    data.company || null,
    data.message,
    data.productId || null,
    attribution.visitorId,
    attribution.sessionId,
    attribution.visitorType,
    attribution.landingPage,
    attribution.sourceLabel,
    attribution.sourcePlatform,
    attribution.sourceChannel,
    attribution.utmSource,
    attribution.utmMedium,
    attribution.utmCampaign,
    attribution.utmTerm,
    attribution.utmContent,
    attribution.clickIds,
    attribution.customTags,
    attribution.trackingJson,
    attribution.geoCountry,
    attribution.geoRegion,
    attribution.geoCity,
    attribution.googleSubmitSentAt,
  ];

  try {
    const result = await db.prepare(query).bind(...params).run();

    if (!result.success) {
      throw new Error('Failed to save inquiry');
    }

    const selectQuery = 'SELECT * FROM inquiries WHERE id = last_insert_rowid()';
    const selectResult = await db.prepare(selectQuery).all<D1Row>();

    if (!selectResult.success || !selectResult.results?.[0]) {
      throw new Error('Failed to retrieve saved inquiry');
    }

    return selectResult.results[0] as DBInquiry;
  } catch (error) {
    console.error('Error saving inquiry in D1:', error);
    throw error;
  }
}

function buildLeadSearchClause(fields: string[], search?: string): { clause: string; params: unknown[] } {
  if (!search) {
    return { clause: '', params: [] };
  }

  const pattern = `%${search}%`;
  return {
    clause: ` AND (${fields.map((field) => `${field} LIKE ?`).join(' OR ')})`,
    params: fields.map(() => pattern),
  };
}

export async function getAdminLeadsD1(
  db: D1Database,
  filters?: {
    salesStage?: LeadSalesStage;
    leadType?: LeadType;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<AdminLeadRecord[]> {
  const selects: string[] = [];
  const params: unknown[] = [];
  const salesStageClause = filters?.salesStage ? ' AND sales_stage = ?' : '';
  const limit = Math.min(filters?.limit ?? 200, 500);
  const offset = Math.max(filters?.offset ?? 0, 0);

  if (!filters?.leadType || filters.leadType === 'contact') {
    const search = buildLeadSearchClause(['name', 'email', 'IFNULL(subject, \'\')', 'message'], filters?.search);
    selects.push(`
      SELECT
        id,
        'contact' AS lead_type,
        name,
        email,
        phone,
        NULL AS company,
        subject,
        message,
        NULL AS product_id,
        status,
        sales_stage,
        sales_stage_updated_at,
        created_at,
        visitor_id,
        session_id,
        visitor_type,
        landing_page,
        source_label,
        source_platform,
        source_channel,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        click_ids,
        custom_tags,
        tracking_json,
        geo_country,
        geo_region,
        geo_city,
        google_submit_sent_at,
        google_qualified_sent_at,
        google_won_sent_at,
        google_sync_error
      FROM contacts
      WHERE 1=1${salesStageClause}${search.clause}
    `);
    if (filters?.salesStage) {
      params.push(filters.salesStage);
    }
    params.push(...search.params);
  }

  if (!filters?.leadType || filters.leadType === 'inquiry') {
    const search = buildLeadSearchClause(['name', 'email', 'IFNULL(company, \'\')', 'message'], filters?.search);
    selects.push(`
      SELECT
        id,
        'inquiry' AS lead_type,
        name,
        email,
        phone,
        company,
        NULL AS subject,
        message,
        product_id,
        status,
        sales_stage,
        sales_stage_updated_at,
        created_at,
        visitor_id,
        session_id,
        visitor_type,
        landing_page,
        source_label,
        source_platform,
        source_channel,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        click_ids,
        custom_tags,
        tracking_json,
        geo_country,
        geo_region,
        geo_city,
        google_submit_sent_at,
        google_qualified_sent_at,
        google_won_sent_at,
        google_sync_error
      FROM inquiries
      WHERE 1=1${salesStageClause}${search.clause}
    `);
    if (filters?.salesStage) {
      params.push(filters.salesStage);
    }
    params.push(...search.params);
  }

  if (selects.length === 0) {
    return [];
  }

  const query = `
    ${selects.join('\nUNION ALL\n')}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  try {
    const result = await db.prepare(query).bind(...params).all<D1Row>();

    if (!result.success) {
      throw new Error('Failed to fetch admin leads');
    }

    return (result.results || []).map(mapAdminLeadRow);
  } catch (error) {
    console.error('Error fetching admin leads from D1:', error);
    throw error;
  }
}

export async function getAdminLeadByIdD1(
  db: D1Database,
  leadType: LeadType,
  id: number
): Promise<AdminLeadRecord | null> {
  const tableName = leadType === 'inquiry' ? 'inquiries' : 'contacts';
  const companyField = leadType === 'inquiry' ? 'company' : 'NULL';
  const subjectField = leadType === 'contact' ? 'subject' : 'NULL';
  const productField = leadType === 'inquiry' ? 'product_id' : 'NULL';

  try {
    const result = await db
      .prepare(
        `
          SELECT
            id,
            ? AS lead_type,
            name,
            email,
            phone,
            ${companyField} AS company,
            ${subjectField} AS subject,
            message,
            ${productField} AS product_id,
            status,
            sales_stage,
            sales_stage_updated_at,
            created_at,
            visitor_id,
            session_id,
            visitor_type,
            landing_page,
            source_label,
            source_platform,
            source_channel,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_term,
            utm_content,
            click_ids,
            custom_tags,
            tracking_json,
            geo_country,
            geo_region,
            geo_city,
            google_submit_sent_at,
            google_qualified_sent_at,
            google_won_sent_at,
            google_sync_error
          FROM ${tableName}
          WHERE id = ?
        `
      )
      .bind(leadType, id)
      .all<D1Row>();

    if (!result.success || !result.results?.[0]) {
      return null;
    }

    return mapAdminLeadRow(result.results[0]);
  } catch (error) {
    console.error('Error fetching admin lead by id from D1:', error);
    throw error;
  }
}

export async function updateLeadSalesStageD1(
  db: D1Database,
  leadType: LeadType,
  id: number,
  salesStage: LeadSalesStage
): Promise<AdminLeadRecord> {
  const tableName = leadType === 'inquiry' ? 'inquiries' : 'contacts';

  try {
    const updateResult = await db
      .prepare(`UPDATE ${tableName} SET sales_stage = ?, sales_stage_updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(salesStage, id)
      .run();

    if (!updateResult.success) {
      throw new Error('Failed to update lead stage');
    }

    const updatedLead = await getAdminLeadByIdD1(db, leadType, id);
    if (!updatedLead) {
      throw new Error('Updated lead not found');
    }

    return updatedLead;
  } catch (error) {
    console.error('Error updating lead sales stage in D1:', error);
    throw error;
  }
}

/**
 * 获取分类 - D1 版本
 */
export async function getCategoriesD1(
  db: D1Database,
  filters?: {
    isActive?: boolean;
  }
): Promise<DBCategory[]> {
  let query = 'SELECT * FROM categories WHERE 1=1';
  const params: unknown[] = [];

  if (filters?.isActive !== undefined) {
    query += ' AND is_active = ?';
    params.push(filters.isActive ? 1 : 0);
  }

  query += ' ORDER BY id ASC';

  try {
    const result = await db.prepare(query).bind(...params).all<D1Row>();

    if (!result.success) {
      throw new Error('Failed to fetch categories');
    }

    return (result.results as DBCategory[]) || [];
  } catch (error) {
    console.error('Error fetching categories from D1:', error);
    throw error;
  }
}

export async function getCategoryD1(db: D1Database, id: number): Promise<DBCategory> {
  try {
    const result = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).all<D1Row>();

    if (!result.success || !result.results?.[0]) {
      throw new Error('Category not found');
    }

    return result.results[0] as DBCategory;
  } catch (error) {
    console.error('Error fetching category from D1:', error);
    throw error;
  }
}

export async function getCategoryBySlugD1(db: D1Database, slug: string): Promise<DBCategory> {
  try {
    const result = await db.prepare('SELECT * FROM categories WHERE slug = ?').bind(slug).all<D1Row>();

    if (!result.success || !result.results?.[0]) {
      throw new Error('Category not found');
    }

    return result.results[0] as DBCategory;
  } catch (error) {
    console.error('Error fetching category by slug from D1:', error);
    throw error;
  }
}

export async function createCategoryD1(
  db: D1Database,
  data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: number | null;
    isActive?: boolean;
  }
): Promise<DBCategory> {
  const query = `
    INSERT INTO categories (
      name, slug, description, image_url, parent_id, is_active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  const params: unknown[] = [
    data.name,
    data.slug,
    data.description || null,
    data.imageUrl || null,
    data.parentId || null,
    data.isActive !== false ? 1 : 0,
  ];

  try {
    const result = await db.prepare(query).bind(...params).run();

    if (!result.success) {
      throw new Error('Failed to create category');
    }

    const selectQuery = 'SELECT * FROM categories WHERE id = last_insert_rowid()';
    const selectResult = await db.prepare(selectQuery).all<D1Row>();

    if (!selectResult.success || !selectResult.results?.[0]) {
      throw new Error('Failed to retrieve created category');
    }

    return selectResult.results[0] as DBCategory;
  } catch (error) {
    console.error('Error creating category in D1:', error);
    throw error;
  }
}

export async function updateCategoryD1(
  db: D1Database,
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: number | null;
    isActive?: boolean;
  }>
): Promise<DBCategory> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.name) {
    fields.push('name = ?');
    params.push(data.name);
  }
  if (data.slug) {
    fields.push('slug = ?');
    params.push(data.slug);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    params.push(data.description);
  }
  if (data.imageUrl !== undefined) {
    fields.push('image_url = ?');
    params.push(data.imageUrl);
  }
  if (data.parentId !== undefined) {
    fields.push('parent_id = ?');
    params.push(data.parentId);
  }
  if (data.isActive !== undefined) {
    fields.push('is_active = ?');
    params.push(data.isActive ? 1 : 0);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);

  try {
    await db.prepare(query).bind(...params).run();

    const selectResult = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).all<D1Row>();

    if (!selectResult.success || !selectResult.results?.[0]) {
      throw new Error('Failed to retrieve updated category');
    }

    return selectResult.results[0] as DBCategory;
  } catch (error) {
    console.error('Error updating category in D1:', error);
    throw error;
  }
}

export async function deleteCategoryD1(db: D1Database, id: number): Promise<void> {
  try {
    await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  } catch (error) {
    console.error('Error deleting category from D1:', error);
    throw error;
  }
}

/**
 * 获取推荐 - D1 版本
 */
export async function getTestimonialsD1(
  db: D1Database,
  filters?: {
    isActive?: boolean;
    limit?: number;
  }
): Promise<DBTestimonial[]> {
  let query = 'SELECT * FROM testimonials WHERE 1=1';
  const params: unknown[] = [];

  if (filters?.isActive !== undefined) {
    query += ' AND is_active = ?';
    params.push(filters.isActive ? 1 : 0);
  }

  query += ' ORDER BY `order` ASC, created_at DESC';

  if (filters?.limit) {
    query += ` LIMIT ${filters.limit}`;
  }

  try {
    const result = await db.prepare(query).bind(...params).all<D1Row>();

    if (!result.success) {
      throw new Error('Failed to fetch testimonials');
    }

    return (result.results as DBTestimonial[]) || [];
  } catch (error) {
    console.error('Error fetching testimonials from D1:', error);
    throw error;
  }
}

/**
 * 获取常见问题 - D1 版本
 */
export async function getFaqsD1(
  db: D1Database,
  filters?: {
    category?: string;
    isActive?: boolean;
  }
): Promise<DBFAQ[]> {
  let query = 'SELECT * FROM faqs WHERE 1=1';
  const params: unknown[] = [];

  if (filters?.isActive !== undefined) {
    query += ' AND is_active = ?';
    params.push(filters.isActive ? 1 : 0);
  }

  if (filters?.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  query += ' ORDER BY `order` ASC, created_at DESC';

  try {
    const result = await db.prepare(query).bind(...params).all<D1Row>();

    if (!result.success) {
      throw new Error('Failed to fetch faqs');
    }

    return (result.results as DBFAQ[]) || [];
  } catch (error) {
    console.error('Error fetching faqs from D1:', error);
    throw error;
  }
}

/**
 * 获取项目 - D1 版本
 */
export async function getProjectsD1(
  db: D1Database,
  filters?: {
    limit?: number;
    offset?: number;
  }
): Promise<DBProject[]> {
  let query = 'SELECT * FROM projects WHERE 1=1';
  const params: unknown[] = [];

  query += ' ORDER BY created_at DESC';

  if (filters?.limit) {
    query += ` LIMIT ${filters.limit}`;
  }
  if (filters?.offset) {
    query += ` OFFSET ${filters.offset}`;
  }

  try {
    const result = await db.prepare(query).bind(...params).all<D1Row>();

    if (!result.success) {
      throw new Error('Failed to fetch projects');
    }

    return (result.results as DBProject[]) || [];
  } catch (error) {
    console.error('Error fetching projects from D1:', error);
    throw error;
  }
}

export async function getProjectD1(db: D1Database, id: number): Promise<DBProject> {
  try {
    const result = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).all<D1Row>();

    if (!result.success || !result.results?.[0]) {
      throw new Error('Project not found');
    }

    return result.results[0] as DBProject;
  } catch (error) {
    console.error('Error fetching project from D1:', error);
    throw error;
  }
}

export async function createProjectD1(
  db: D1Database,
  data: {
    title: string;
    slug: string;
    description?: string;
    imageUrl?: string;
  }
): Promise<DBProject> {
  const query = `
    INSERT INTO projects (
      title, slug, description, featured_image, created_at
    ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  const params: unknown[] = [
    data.title,
    data.slug,
    data.description || null,
    data.imageUrl || null,
  ];

  try {
    const result = await db.prepare(query).bind(...params).run();

    if (!result.success) {
      throw new Error('Failed to create project');
    }

    const selectQuery = 'SELECT * FROM projects WHERE id = last_insert_rowid()';
    const selectResult = await db.prepare(selectQuery).all<D1Row>();

    if (!selectResult.success || !selectResult.results?.[0]) {
      throw new Error('Failed to retrieve created project');
    }

    return selectResult.results[0] as DBProject;
  } catch (error) {
    console.error('Error creating project in D1:', error);
    throw error;
  }
}

export async function updateProjectD1(
  db: D1Database,
  id: number,
  data: Partial<{
    title: string;
    slug: string;
    description?: string;
    imageUrl?: string;
  }>
): Promise<DBProject> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.title) {
    fields.push('title = ?');
    params.push(data.title);
  }
  if (data.slug) {
    fields.push('slug = ?');
    params.push(data.slug);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    params.push(data.description);
  }
  if (data.imageUrl !== undefined) {
    fields.push('featured_image = ?');
    params.push(data.imageUrl);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  // projects table does not have updated_at column
  // fields.push('updated_at = CURRENT_TIMESTAMP');

  const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);

  try {
    await db.prepare(query).bind(...params).run();

    const selectResult = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).all<D1Row>();

    if (!selectResult.success || !selectResult.results?.[0]) {
      throw new Error('Failed to retrieve updated project');
    }

    return selectResult.results[0] as DBProject;
  } catch (error) {
    console.error('Error updating project in D1:', error);
    throw error;
  }
}

export async function deleteProjectD1(db: D1Database, id: number): Promise<void> {
  try {
    await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  } catch (error) {
    console.error('Error deleting project from D1:', error);
    throw error;
  }
}
