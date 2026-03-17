/**
 * Drizzle ORM Schema for the sanitized template catalog
 *
 * This schema defines all database tables needed to replace the Strapi backend.
 * It includes 9 tables with complete relationships, indexes, and constraints.
 *
 * Tables:
 * 1. categories - Product categories
 * 2. products - Product listings with category relations
 * 3. posts - Blog articles
 * 4. projects - Project showcase items
 * 5. testimonials - Customer testimonials
 * 6. faqs - Frequently asked questions
 * 7. global_config - Global configuration settings
 * 8. inquiries - Inquiry/quote requests (new, replaces logging)
 * 9. contacts - Contact form submissions
 */


import {
  sqliteTable,
  text,
  integer,
  real,
  unique,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/**
 * ============================================================================
 * TABLE 1: CATEGORIES
 * ============================================================================
 * Product categories table with hierarchical support
 */
export const categories = sqliteTable(
  "categories",
  () => ({
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    parentId: integer("parent_id"),  // Parent category ID for hierarchy
    path: text("path"),
    level: integer("level").default(0),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    createdAt: text("created_at")
      .notNull()
      .default(new Date().toISOString()),
  })
  // Note: slug is NOT unique to allow same slug under different parent categories
  // URL structure: /products/{parent-slug}/{child-slug}
);

/**
 * ============================================================================
 * TABLE 2: PRODUCTS
 * ============================================================================
 * Product listings table with category foreign key
 */
export const products = sqliteTable(
  "products",
  () => ({
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    price: real("price"),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    imageUrl: text("image_url"),
    // B2B 扩展字段
    material: text("material"),           // 材质（如：天然水晶, 925银）
    moq: text("moq"),                     // MOQ文本（如：5 pcs/style）
    leadTime: text("lead_time"),          // 交期（如：3-7 days）
    attributes: text("attributes"),       // JSON：扩展属性（工艺/风格/适用人群等）
    skuVariants: text("sku_variants"),    // JSON：SKU变体（颜色/尺寸选项）
    images: text("images"),               // JSON: 多图数组
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    createdAt: text("created_at")
      .notNull()
      .default(new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .default(new Date().toISOString()),
  }),
  (table) => ({
    slugIndex: unique("products_slug_unique").on(table.slug),
  })
);

/**
 * ============================================================================
 * TABLE 3: POSTS
 * ============================================================================
 * Blog articles table
 */
export const posts = sqliteTable(
  "posts",
  () => ({
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    content: text("content"), // Markdown content
    excerpt: text("excerpt"),
    featuredImage: text("featured_image"),
    published: integer("published", { mode: "boolean" }).default(false),
    publishedAt: text("published_at"),
    createdAt: text("created_at")
      .notNull()
      .default(new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .default(new Date().toISOString()),
  }),
  (table) => ({
    slugIndex: unique("posts_slug_unique").on(table.slug),
  })
);

/**
 * ============================================================================
 * TABLE 4: PROJECTS
 * ============================================================================
 * Project showcase items table
 */
export const projects = sqliteTable(
  "projects",
  () => ({
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    featuredImage: text("featured_image"),
    order: integer("order").default(0),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    createdAt: text("created_at")
      .notNull()
      .default(new Date().toISOString()),
  }),
  (table) => ({
    slugIndex: unique("projects_slug_unique").on(table.slug),
  })
);

/**
 * ============================================================================
 * TABLE 5: TESTIMONIALS
 * ============================================================================
 * Customer testimonials and reviews
 */
export const testimonials = sqliteTable(
  "testimonials",
  () => ({
    id: integer("id").primaryKey({ autoIncrement: true }),
    authorName: text("author_name").notNull(),
    authorCompany: text("author_company"),
    authorImage: text("author_image"),
    content: text("content").notNull(),
    rating: integer("rating"), // 1-5 stars
    order: integer("order").default(0),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    createdAt: text("created_at")
      .notNull()
      .default(new Date().toISOString()),
  })
);

/**
 * ============================================================================
 * TABLE 6: FAQS
 * ============================================================================
 * Frequently asked questions
 */
export const faqs = sqliteTable(
  "faqs",
  () => ({
    id: integer("id").primaryKey({ autoIncrement: true }),
    question: text("question").notNull(),
    answer: text("answer").notNull(), // Markdown content
    category: text("category"), // e.g., "Products", "Shipping", "Returns"
    order: integer("order").default(0),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    createdAt: text("created_at")
      .notNull()
      .default(new Date().toISOString()),
  })
);

/**
 * ============================================================================
 * TABLE 7: GLOBAL_CONFIG
 * ============================================================================
 * Global site configuration and settings
 */
export const globalConfig = sqliteTable(
  "global_config",
  () => ({
    id: integer("id").primaryKey({ autoIncrement: true }),
    key: text("key").notNull(),
    value: text("value"), // JSON or plain text
    description: text("description"),
    updatedAt: text("updated_at")
      .notNull()
      .default(new Date().toISOString()),
  }),
  (table) => ({
    keyIndex: unique("global_config_key_unique").on(table.key),
  })
);

/**
 * ============================================================================
 * TABLE 8: INQUIRIES
 * ============================================================================
 * Product inquiries and quote requests (replaces logging)
 */
export const inquiries = sqliteTable(
  "inquiries",
  () => ({
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    message: text("message").notNull(),
    productId: integer("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    status: text("status").default("new"), // new, processing, replied
    salesStage: text("sales_stage").notNull().default("new"), // new, qualified, won, junk
    salesStageUpdatedAt: text("sales_stage_updated_at"),
    visitorId: text("visitor_id"),
    sessionId: text("session_id"),
    visitorType: text("visitor_type"),
    landingPage: text("landing_page"),
    sourceLabel: text("source_label"),
    sourcePlatform: text("source_platform"),
    sourceChannel: text("source_channel"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmTerm: text("utm_term"),
    utmContent: text("utm_content"),
    clickIds: text("click_ids"),
    customTags: text("custom_tags"),
    trackingJson: text("tracking_json"),
    geoCountry: text("geo_country"),
    geoRegion: text("geo_region"),
    geoCity: text("geo_city"),
    googleSubmitSentAt: text("google_submit_sent_at"),
    googleQualifiedSentAt: text("google_qualified_sent_at"),
    googleWonSentAt: text("google_won_sent_at"),
    googleSyncError: text("google_sync_error"),
    createdAt: text("created_at")
      .notNull()
      .default(new Date().toISOString()),
    repliedAt: text("replied_at"),
  }),
  () => ({
    // indexes: productId and status indexes intentionally omitted
  })
);

/**
 * ============================================================================
 * TABLE 9: CONTACTS
 * ============================================================================
 * Contact form submissions
 */
export const contacts = sqliteTable(
  "contacts",
  () => ({
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject"),
    message: text("message").notNull(),
    phone: text("phone"),
    status: text("status").default("unread"), // unread, read, replied
    salesStage: text("sales_stage").notNull().default("new"), // new, qualified, won, junk
    salesStageUpdatedAt: text("sales_stage_updated_at"),
    visitorId: text("visitor_id"),
    sessionId: text("session_id"),
    visitorType: text("visitor_type"),
    landingPage: text("landing_page"),
    sourceLabel: text("source_label"),
    sourcePlatform: text("source_platform"),
    sourceChannel: text("source_channel"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmTerm: text("utm_term"),
    utmContent: text("utm_content"),
    clickIds: text("click_ids"),
    customTags: text("custom_tags"),
    trackingJson: text("tracking_json"),
    geoCountry: text("geo_country"),
    geoRegion: text("geo_region"),
    geoCity: text("geo_city"),
    googleSubmitSentAt: text("google_submit_sent_at"),
    googleQualifiedSentAt: text("google_qualified_sent_at"),
    googleWonSentAt: text("google_won_sent_at"),
    googleSyncError: text("google_sync_error"),
    createdAt: text("created_at")
      .notNull()
      .default(new Date().toISOString()),
  }),
  () => ({
  })
);

/**
 * ============================================================================
 * BETTER-AUTH TABLES
 * ============================================================================
 */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  role: text("role").default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

/**
 * ============================================================================
 * DEPRECATED: ADMIN_USERS (Replaced by BetterAuth 'user' table)
 * ============================================================================
 * Admin users for authentication
 */
/*
export const adminUsers = sqliteTable(
  "admin_users",
  () => ({
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    name: text("name"),
    passwordHash: text("password_hash").notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
    resetToken: text("reset_token"),
    resetTokenExpiry: integer("reset_token_expiry"), // Timestamp
    createdAt: text("created_at")
      .notNull()
      .default(new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .default(new Date().toISOString()),
  }),
  (table) => ({
    emailIndex: unique("admin_users_email_unique").on(table.email),
  })
);
*/

/**
 * ============================================================================
 * RELATIONSHIPS
 * ============================================================================
 */

/**
 * Categories relations
 * - One category has many products
 */
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

/**
 * Products relations
 * - One product belongs to one category
 * - One product has many inquiries
 */
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  inquiries: many(inquiries),
}));

/**
 * Inquiries relations
 * - Many inquiries belong to one product
 */
export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  product: one(products, {
    fields: [inquiries.productId],
    references: [products.id],
  }),
}));

/**
 * ============================================================================
 * TYPESCRIPT TYPES
 * ============================================================================
 * Inferred types for database operations
 */

// Categories
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

// Products
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// Posts
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

// Projects
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Testimonials
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

// FAQs
export type FAQ = typeof faqs.$inferSelect;
export type NewFAQ = typeof faqs.$inferInsert;

// Global Config
export type GlobalConfig = typeof globalConfig.$inferSelect;
export type NewGlobalConfig = typeof globalConfig.$inferInsert;

// Inquiries
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;

// Contacts
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

// Admin Users


/**
 * ============================================================================
 * SCHEMA SUMMARY
 * ============================================================================
 *
 * Total Tables: 9
 * Total Foreign Keys: 2 (products.categoryId, inquiries.productId)
 * Total Unique Constraints: 7
 * Total Indexes: 4
 *
 * Key Features:
 * - Automatic timestamps (created_at, updated_at)
 * - Status tracking for inquiries and contacts
 * - Boolean flags for active/published states
 * - Markdown content support for posts, faqs
 * - JSON support for global_config values
 * - Cascading deletes for referential integrity
 *
 * Database: Cloudflare D1 (SQLite)
 * ORM: Drizzle
 * Dialect: sqlite
 */
