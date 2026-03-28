import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from '../src/lib/sample-data';
import { siteConfig } from '../src/lib/site-config';

type LeadSeed = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject?: string | null;
  message: string;
  productId?: number | null;
  status: string;
  salesStage: 'new' | 'qualified' | 'won' | 'junk';
  salesStageUpdatedAt: string;
  createdAt: string;
  visitorType: 'first_time' | 'returning';
  landingPage: string;
  sourceLabel: string;
  sourcePlatform: string;
  sourceChannel: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  clickIds?: Record<string, string>;
  customTags?: Record<string, string>;
  tracking: Record<string, unknown>;
  geo?: {
    countryName?: string;
    region?: string;
    city?: string;
  };
};

const localDatabaseName = siteConfig.dbName;
const isDryRun = process.argv.includes('--dry-run');

function sqlQuote(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  return `'${value.replace(/'/g, "''")}'`;
}

function sqlBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  return value ? '1' : '0';
}

function sqlNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'NULL';
  }

  return String(value);
}

function sqlJson(value: unknown): string {
  return sqlQuote(JSON.stringify(value));
}

function buildTrackingSnapshot(seed: {
  sessionId: string;
  visitorId: string;
  visitorType: 'first_time' | 'returning';
  visitCount: number;
  landingPage: string;
  sourceLabel: string;
  sourcePlatform: string;
  sourceChannel: string;
  pages: Array<{ path: string; label: string; durationMs: number }>;
}) {
  const sessionStartedAt = '2026-03-28T08:30:00.000Z';

  const pages = seed.pages.map((page, index) => ({
    path: page.path,
    pathWithQuery: page.path,
    url: `http://localhost:3002${page.path}`,
    label: page.label,
    enteredAt: new Date(Date.parse(sessionStartedAt) + index * 60_000).toISOString(),
    durationMs: page.durationMs,
  }));

  return {
    version: 1,
    visitorId: seed.visitorId,
    sessionId: seed.sessionId,
    visitorType: seed.visitorType,
    visitCount: seed.visitCount,
    sessionStartedAt,
    lastActivityAt: new Date(Date.parse(sessionStartedAt) + 5 * 60_000).toISOString(),
    totalDurationMs: pages.reduce((sum, page) => sum + page.durationMs, 0),
    landingPage: {
      path: seed.landingPage,
      pathWithQuery: seed.landingPage,
      url: `http://localhost:3002${seed.landingPage}`,
      label: pages[0]?.label || 'Landing Page',
    },
    source: {
      channel: seed.sourceChannel,
      platform: seed.sourcePlatform,
      label: seed.sourceLabel,
      matchedBy: 'utm',
      isPaid: seed.sourceChannel === 'paid_search' || seed.sourceChannel === 'paid_social',
    },
    attribution: {
      utmSource: seed.sourcePlatform,
      utmMedium: seed.sourceChannel === 'paid_search' ? 'cpc' : 'referral',
      utmCampaign: 'template-local-preview',
      utmTerm: 'mock-b2b-template',
      utmContent: 'local-d1-seed',
      clickIds: {},
      customTags: {
        lead_tag: 'template-seed',
      },
      landingQuery: {},
    },
    pages,
  };
}

const inquiryTracking = buildTrackingSnapshot({
  sessionId: 'session-local-inquiry-1',
  visitorId: 'visitor-local-inquiry-1',
  visitorType: 'first_time',
  visitCount: 1,
  landingPage: '/products/template-collection-a',
  sourceLabel: 'Google Ads',
  sourcePlatform: 'google',
  sourceChannel: 'paid_search',
  pages: [
    {
      path: '/products/template-collection-a',
      label: 'Products: Template Collection A',
      durationMs: 72_000,
    },
    {
      path: '/products/template-collection-a/bracelets',
      label: 'Products: Bracelets',
      durationMs: 48_000,
    },
    {
      path: '/product/mock-quartz-bracelet-alpha',
      label: 'Product: Mock Quartz Bracelet Alpha',
      durationMs: 134_000,
    },
  ],
});

const contactTracking = buildTrackingSnapshot({
  sessionId: 'session-local-contact-1',
  visitorId: 'visitor-local-contact-1',
  visitorType: 'returning',
  visitCount: 2,
  landingPage: '/services',
  sourceLabel: 'LinkedIn',
  sourcePlatform: 'linkedin',
  sourceChannel: 'social',
  pages: [
    {
      path: '/services',
      label: 'Services',
      durationMs: 83_000,
    },
    {
      path: '/about',
      label: 'About Us',
      durationMs: 41_000,
    },
    {
      path: '/contact',
      label: 'Contact Us',
      durationMs: 59_000,
    },
  ],
});

const contactLeads: LeadSeed[] = [
  {
    id: 9001,
    name: 'Jordan Template Ops',
    email: 'jordan.ops@template-site-placeholder.example',
    phone: null,
    subject: 'Need a localized catalog flow',
    message:
      'We are reviewing the template locally and want the mock lead center to stay persistent after restarts.',
    status: 'unread',
    salesStage: 'qualified',
    salesStageUpdatedAt: '2026-03-28T09:18:00.000Z',
    createdAt: '2026-03-28T09:05:00.000Z',
    visitorType: 'returning',
    landingPage: '/services',
    sourceLabel: 'LinkedIn',
    sourcePlatform: 'linkedin',
    sourceChannel: 'social',
    utmSource: 'linkedin',
    utmMedium: 'social',
    utmCampaign: 'template-local-preview',
    utmTerm: 'mock-b2b-template',
    utmContent: 'local-d1-seed',
    clickIds: {},
    customTags: { lead_tag: 'template-seed' },
    tracking: contactTracking,
    geo: {
      countryName: 'Template Country',
      region: 'Template Coast',
      city: 'Mock Harbor',
    },
  },
];

const inquiryLeads: LeadSeed[] = [
  {
    id: 9101,
    name: 'Avery Demo Buyer',
    email: 'avery.buyer@template-site-placeholder.example',
    phone: '+00 1000 2000',
    company: 'Template Retail Group',
    message:
      'Please share MOQ, lead time, and private-label packaging options for this placeholder collection.',
    productId: 1,
    status: 'new',
    salesStage: 'new',
    salesStageUpdatedAt: '2026-03-28T08:41:00.000Z',
    createdAt: '2026-03-28T08:40:00.000Z',
    visitorType: 'first_time',
    landingPage: '/products/template-collection-a',
    sourceLabel: 'Google Ads',
    sourcePlatform: 'google',
    sourceChannel: 'paid_search',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'template-local-preview',
    utmTerm: 'mock-b2b-template',
    utmContent: 'local-d1-seed',
    clickIds: {},
    customTags: { lead_tag: 'template-seed' },
    tracking: inquiryTracking,
    geo: {
      countryName: 'Template Country',
      region: 'Preview State',
      city: 'Template City',
    },
  },
];

function buildCategoryStatements() {
  return SAMPLE_CATEGORIES.map((category) => `
INSERT INTO categories (
  id, name, slug, description, image_url, parent_id, path, level, is_active, created_at
) VALUES (
  ${sqlNumber(category.id)},
  ${sqlQuote(category.name)},
  ${sqlQuote(category.slug)},
  ${sqlQuote(category.description)},
  ${sqlQuote(category.imageUrl)},
  NULL,
  ${sqlQuote(category.path)},
  ${sqlNumber(category.level)},
  ${sqlBoolean(category.isActive)},
  ${sqlQuote(category.createdAt)}
)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  image_url = excluded.image_url,
  parent_id = excluded.parent_id,
  path = excluded.path,
  level = excluded.level,
  is_active = excluded.is_active,
  created_at = excluded.created_at;
`);
}

function buildProductStatements() {
  return SAMPLE_PRODUCTS.map((product, index) => `
INSERT INTO products (
  id, name, slug, description, price, category_id, image_url, material, moq, lead_time,
  attributes, sku_variants, images, is_active, created_at, updated_at
) VALUES (
  ${sqlNumber(index + 1)},
  ${sqlQuote(product.name)},
  ${sqlQuote(product.slug)},
  ${sqlQuote(product.description)},
  ${sqlNumber(product.price)},
  ${sqlNumber(product.categoryId)},
  ${sqlQuote(product.imageUrl)},
  ${sqlQuote(product.material)},
  ${sqlQuote(product.moq)},
  ${sqlQuote(product.leadTime)},
  ${sqlJson({
    certifications: product.certifications || [],
    customizationOptions: product.customizationOptions || [],
    tags: product.tags || [],
  })},
  NULL,
  ${sqlJson(product.gallery || [])},
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  price = excluded.price,
  category_id = excluded.category_id,
  image_url = excluded.image_url,
  material = excluded.material,
  moq = excluded.moq,
  lead_time = excluded.lead_time,
  attributes = excluded.attributes,
  sku_variants = excluded.sku_variants,
  images = excluded.images,
  is_active = excluded.is_active,
  updated_at = CURRENT_TIMESTAMP;
`);
}

function buildGlobalConfigStatements() {
  return [
    `
INSERT INTO global_config (key, value, description, updated_at)
VALUES (
  'contact_email',
  ${sqlQuote(siteConfig.contactEmail)},
  '本地 D1 模板联系邮箱种子值',
  CURRENT_TIMESTAMP
)
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  description = excluded.description,
  updated_at = CURRENT_TIMESTAMP;
`,
    `
INSERT INTO global_config (key, value, description, updated_at)
VALUES (
  'admin_email',
  ${sqlQuote(siteConfig.adminEmail)},
  '本地 D1 模板管理员邮箱种子值',
  CURRENT_TIMESTAMP
)
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  description = excluded.description,
  updated_at = CURRENT_TIMESTAMP;
`,
  ];
}

function buildContactStatements() {
  return contactLeads.map((lead) => `
INSERT INTO contacts (
  id, name, email, subject, phone, message, status, sales_stage, sales_stage_updated_at,
  visitor_id, session_id, visitor_type, landing_page, source_label, source_platform, source_channel,
  utm_source, utm_medium, utm_campaign, utm_term, utm_content,
  click_ids, custom_tags, tracking_json, geo_country, geo_region, geo_city, created_at
) VALUES (
  ${sqlNumber(lead.id)},
  ${sqlQuote(lead.name)},
  ${sqlQuote(lead.email)},
  ${sqlQuote(lead.subject || null)},
  ${sqlQuote(lead.phone || null)},
  ${sqlQuote(lead.message)},
  ${sqlQuote(lead.status)},
  ${sqlQuote(lead.salesStage)},
  ${sqlQuote(lead.salesStageUpdatedAt)},
  ${sqlQuote(String(lead.tracking.visitorId || ''))},
  ${sqlQuote(String(lead.tracking.sessionId || ''))},
  ${sqlQuote(lead.visitorType)},
  ${sqlQuote(lead.landingPage)},
  ${sqlQuote(lead.sourceLabel)},
  ${sqlQuote(lead.sourcePlatform)},
  ${sqlQuote(lead.sourceChannel)},
  ${sqlQuote(lead.utmSource || null)},
  ${sqlQuote(lead.utmMedium || null)},
  ${sqlQuote(lead.utmCampaign || null)},
  ${sqlQuote(lead.utmTerm || null)},
  ${sqlQuote(lead.utmContent || null)},
  ${sqlJson(lead.clickIds || {})},
  ${sqlJson(lead.customTags || {})},
  ${sqlJson(lead.tracking)},
  ${sqlQuote(lead.geo?.countryName || null)},
  ${sqlQuote(lead.geo?.region || null)},
  ${sqlQuote(lead.geo?.city || null)},
  ${sqlQuote(lead.createdAt)}
)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  email = excluded.email,
  subject = excluded.subject,
  phone = excluded.phone,
  message = excluded.message,
  status = excluded.status,
  sales_stage = excluded.sales_stage,
  sales_stage_updated_at = excluded.sales_stage_updated_at,
  visitor_id = excluded.visitor_id,
  session_id = excluded.session_id,
  visitor_type = excluded.visitor_type,
  landing_page = excluded.landing_page,
  source_label = excluded.source_label,
  source_platform = excluded.source_platform,
  source_channel = excluded.source_channel,
  utm_source = excluded.utm_source,
  utm_medium = excluded.utm_medium,
  utm_campaign = excluded.utm_campaign,
  utm_term = excluded.utm_term,
  utm_content = excluded.utm_content,
  click_ids = excluded.click_ids,
  custom_tags = excluded.custom_tags,
  tracking_json = excluded.tracking_json,
  geo_country = excluded.geo_country,
  geo_region = excluded.geo_region,
  geo_city = excluded.geo_city,
  created_at = excluded.created_at;
`);
}

function buildInquiryStatements() {
  return inquiryLeads.map((lead) => `
INSERT INTO inquiries (
  id, name, email, phone, company, message, product_id, status, sales_stage, sales_stage_updated_at,
  visitor_id, session_id, visitor_type, landing_page, source_label, source_platform, source_channel,
  utm_source, utm_medium, utm_campaign, utm_term, utm_content,
  click_ids, custom_tags, tracking_json, geo_country, geo_region, geo_city, created_at
) VALUES (
  ${sqlNumber(lead.id)},
  ${sqlQuote(lead.name)},
  ${sqlQuote(lead.email)},
  ${sqlQuote(lead.phone || null)},
  ${sqlQuote(lead.company || null)},
  ${sqlQuote(lead.message)},
  ${sqlNumber(lead.productId || null)},
  ${sqlQuote(lead.status)},
  ${sqlQuote(lead.salesStage)},
  ${sqlQuote(lead.salesStageUpdatedAt)},
  ${sqlQuote(String(lead.tracking.visitorId || ''))},
  ${sqlQuote(String(lead.tracking.sessionId || ''))},
  ${sqlQuote(lead.visitorType)},
  ${sqlQuote(lead.landingPage)},
  ${sqlQuote(lead.sourceLabel)},
  ${sqlQuote(lead.sourcePlatform)},
  ${sqlQuote(lead.sourceChannel)},
  ${sqlQuote(lead.utmSource || null)},
  ${sqlQuote(lead.utmMedium || null)},
  ${sqlQuote(lead.utmCampaign || null)},
  ${sqlQuote(lead.utmTerm || null)},
  ${sqlQuote(lead.utmContent || null)},
  ${sqlJson(lead.clickIds || {})},
  ${sqlJson(lead.customTags || {})},
  ${sqlJson(lead.tracking)},
  ${sqlQuote(lead.geo?.countryName || null)},
  ${sqlQuote(lead.geo?.region || null)},
  ${sqlQuote(lead.geo?.city || null)},
  ${sqlQuote(lead.createdAt)}
)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  company = excluded.company,
  message = excluded.message,
  product_id = excluded.product_id,
  status = excluded.status,
  sales_stage = excluded.sales_stage,
  sales_stage_updated_at = excluded.sales_stage_updated_at,
  visitor_id = excluded.visitor_id,
  session_id = excluded.session_id,
  visitor_type = excluded.visitor_type,
  landing_page = excluded.landing_page,
  source_label = excluded.source_label,
  source_platform = excluded.source_platform,
  source_channel = excluded.source_channel,
  utm_source = excluded.utm_source,
  utm_medium = excluded.utm_medium,
  utm_campaign = excluded.utm_campaign,
  utm_term = excluded.utm_term,
  utm_content = excluded.utm_content,
  click_ids = excluded.click_ids,
  custom_tags = excluded.custom_tags,
  tracking_json = excluded.tracking_json,
  geo_country = excluded.geo_country,
  geo_region = excluded.geo_region,
  geo_city = excluded.geo_city,
  created_at = excluded.created_at;
`);
}

function buildSeedSql() {
  return [
    '-- 本地 D1 模板种子数据',
    '-- 所有内容均为 mock data，发布前请替换',
    'BEGIN TRANSACTION;',
    ...buildCategoryStatements(),
    ...buildProductStatements(),
    ...buildGlobalConfigStatements(),
    ...buildContactStatements(),
    ...buildInquiryStatements(),
    'COMMIT;',
    '',
  ].join('\n');
}

function writeTempSqlFile(sql: string) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'template-local-d1-'));
  const filePath = path.join(tempDir, 'seed.sql');
  fs.writeFileSync(filePath, sql, 'utf8');
  return filePath;
}

function main() {
  const sql = buildSeedSql();
  const filePath = writeTempSqlFile(sql);

  if (isDryRun) {
    console.log(`-- dry run: local D1 seed SQL generated at ${filePath}`);
    console.log(sql);
    return;
  }

  const pnpmExecutable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  execFileSync(
    pnpmExecutable,
    ['exec', 'wrangler', 'd1', 'execute', localDatabaseName, '--local', '--file', filePath],
    {
      stdio: 'inherit',
      env: process.env,
    }
  );

  console.log(`\n✅ 本地 D1 模板种子数据已写入 ${localDatabaseName}`);
}

main();
