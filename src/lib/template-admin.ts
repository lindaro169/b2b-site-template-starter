import type { AdminLeadRecord, LeadSalesStage, LeadType } from '@/lib/d1-db';
import { siteConfig } from '@/lib/site-config';
import type { VisitorTrackingSnapshot } from '@/lib/visitor-tracking';

type TemplateAdminSession = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: string;
  };
};

const globalForTemplateAdmin = globalThis as typeof globalThis & {
  __templateAdminLeadStore?: Map<string, AdminLeadRecord>;
};

function buildLeadKey(leadType: LeadType, id: number): string {
  return `${leadType}-${id}`;
}

function createTrackingSnapshot(config: {
  landingPath: string;
  sourceLabel: string;
  sourcePlatform: string;
  sourceChannel: VisitorTrackingSnapshot['source']['channel'];
  pages: Array<{
    path: string;
    label: string;
    durationMs: number;
  }>;
}): VisitorTrackingSnapshot {
  const sessionStartedAt = '2026-03-28T08:30:00.000Z';
  const pageEntries = config.pages.map((page, index) => ({
    path: page.path,
    pathWithQuery: page.path,
    url: `http://localhost:3002${page.path}`,
    label: page.label,
    enteredAt: new Date(Date.parse(sessionStartedAt) + index * 90_000).toISOString(),
    durationMs: page.durationMs,
  }));

  return {
    version: 1,
    visitorId: `visitor-template-${config.sourcePlatform}`,
    sessionId: `session-template-${config.sourcePlatform}`,
    visitorType: 'first_time',
    visitCount: 1,
    sessionStartedAt,
    lastActivityAt: '2026-03-28T08:42:00.000Z',
    totalDurationMs: pageEntries.reduce((sum, page) => sum + page.durationMs, 0),
    landingPage: {
      path: config.landingPath,
      pathWithQuery: config.landingPath,
      url: `http://localhost:3002${config.landingPath}`,
      label: pageEntries[0]?.label || 'Landing Page',
    },
    source: {
      channel: config.sourceChannel,
      platform: config.sourcePlatform,
      label: config.sourceLabel,
      matchedBy: 'utm',
      isPaid: config.sourceChannel === 'paid_search' || config.sourceChannel === 'paid_social',
    },
    attribution: {
      utmSource: config.sourcePlatform,
      utmMedium: config.sourceChannel === 'paid_search' ? 'cpc' : 'referral',
      utmCampaign: 'template-spring-review',
      utmTerm: 'mock-b2b-catalog',
      utmContent: 'template-sidebar-preview',
      clickIds: {},
      customTags: {
        lead_tag: 'template-demo',
      },
      landingQuery: {},
    },
    pages: pageEntries,
  };
}

function createSeedLeads(): AdminLeadRecord[] {
  const inquiryTracking = createTrackingSnapshot({
    landingPath: '/products/template-collection-a',
    sourceLabel: 'Google Ads',
    sourcePlatform: 'google',
    sourceChannel: 'paid_search',
    pages: [
      { path: '/products/template-collection-a', label: 'Products: Template Collection A', durationMs: 98_000 },
      { path: '/products/template-collection-a/bracelets', label: 'Products: Bracelets', durationMs: 74_000 },
      { path: '/product/mock-quartz-bracelet-alpha', label: 'Product: Mock Quartz Bracelet Alpha', durationMs: 121_000 },
      { path: '/contact', label: 'Contact Us', durationMs: 46_000 },
    ],
  });

  const contactTracking = createTrackingSnapshot({
    landingPath: '/services',
    sourceLabel: 'LinkedIn',
    sourcePlatform: 'linkedin',
    sourceChannel: 'social',
    pages: [
      { path: '/services', label: 'Services', durationMs: 82_000 },
      { path: '/about', label: 'About Us', durationMs: 39_000 },
      { path: '/contact', label: 'Contact Us', durationMs: 67_000 },
    ],
  });

  const returningTracking = createTrackingSnapshot({
    landingPath: '/products/template-collection-d',
    sourceLabel: 'Direct',
    sourcePlatform: 'direct',
    sourceChannel: 'direct',
    pages: [
      { path: '/products/template-collection-d', label: 'Products: Template Collection D', durationMs: 55_000 },
      { path: '/product/aroma-pendant-capsule', label: 'Product: Aroma Pendant Capsule', durationMs: 143_000 },
    ],
  });

  return [
    {
      id: 1001,
      leadType: 'inquiry',
      name: 'Avery Demo Buyer',
      email: 'avery.buyer@template-site-placeholder.example',
      phone: '+00 1000 2000',
      company: 'Template Retail Group',
      subject: null,
      message: 'Please share MOQ, lead time, and private-label packaging options for this placeholder collection.',
      productId: 1,
      status: 'new',
      salesStage: 'new',
      salesStageUpdatedAt: '2026-03-28T08:41:00.000Z',
      createdAt: '2026-03-28T08:40:00.000Z',
      visitorId: inquiryTracking.visitorId,
      sessionId: inquiryTracking.sessionId,
      visitorType: inquiryTracking.visitorType,
      landingPage: inquiryTracking.landingPage.pathWithQuery,
      sourceLabel: inquiryTracking.source.label,
      sourcePlatform: inquiryTracking.source.platform,
      sourceChannel: inquiryTracking.source.channel,
      utmSource: inquiryTracking.attribution.utmSource || null,
      utmMedium: inquiryTracking.attribution.utmMedium || null,
      utmCampaign: inquiryTracking.attribution.utmCampaign || null,
      utmTerm: inquiryTracking.attribution.utmTerm || null,
      utmContent: inquiryTracking.attribution.utmContent || null,
      clickIds: inquiryTracking.attribution.clickIds,
      customTags: inquiryTracking.attribution.customTags,
      tracking: inquiryTracking,
      geo: {
        city: 'Template City',
        region: 'Preview State',
        countryName: 'Template Country',
      },
      googleSubmitSentAt: null,
      googleQualifiedSentAt: null,
      googleWonSentAt: null,
      googleSyncError: null,
    },
    {
      id: 1002,
      leadType: 'contact',
      name: 'Jordan Template Ops',
      email: 'jordan.ops@template-site-placeholder.example',
      phone: null,
      company: null,
      subject: 'Need a localized catalog flow',
      message: 'We are reviewing the template for staging and want to confirm the contact routing and content replacement workflow.',
      productId: null,
      status: 'unread',
      salesStage: 'qualified',
      salesStageUpdatedAt: '2026-03-28T09:18:00.000Z',
      createdAt: '2026-03-28T09:05:00.000Z',
      visitorId: contactTracking.visitorId,
      sessionId: contactTracking.sessionId,
      visitorType: contactTracking.visitorType,
      landingPage: contactTracking.landingPage.pathWithQuery,
      sourceLabel: contactTracking.source.label,
      sourcePlatform: contactTracking.source.platform,
      sourceChannel: contactTracking.source.channel,
      utmSource: contactTracking.attribution.utmSource || null,
      utmMedium: contactTracking.attribution.utmMedium || null,
      utmCampaign: contactTracking.attribution.utmCampaign || null,
      utmTerm: contactTracking.attribution.utmTerm || null,
      utmContent: contactTracking.attribution.utmContent || null,
      clickIds: contactTracking.attribution.clickIds,
      customTags: contactTracking.attribution.customTags,
      tracking: contactTracking,
      geo: {
        city: 'Mock Harbor',
        region: 'Template Coast',
        countryName: 'Template Country',
      },
      googleSubmitSentAt: null,
      googleQualifiedSentAt: null,
      googleWonSentAt: null,
      googleSyncError: null,
    },
    {
      id: 1003,
      leadType: 'inquiry',
      name: 'Riley Sample Studio',
      email: 'riley.sample@template-site-placeholder.example',
      phone: '+00 2222 3333',
      company: 'Placeholder Merch Lab',
      subject: null,
      message: 'Using this mock inquiry to preview the right-hand detail pane before real pipeline data is connected.',
      productId: 8,
      status: 'processing',
      salesStage: 'won',
      salesStageUpdatedAt: '2026-03-28T10:12:00.000Z',
      createdAt: '2026-03-28T09:50:00.000Z',
      visitorId: returningTracking.visitorId,
      sessionId: returningTracking.sessionId,
      visitorType: 'returning',
      landingPage: returningTracking.landingPage.pathWithQuery,
      sourceLabel: returningTracking.source.label,
      sourcePlatform: returningTracking.source.platform,
      sourceChannel: returningTracking.source.channel,
      utmSource: returningTracking.attribution.utmSource || null,
      utmMedium: returningTracking.attribution.utmMedium || null,
      utmCampaign: returningTracking.attribution.utmCampaign || null,
      utmTerm: returningTracking.attribution.utmTerm || null,
      utmContent: returningTracking.attribution.utmContent || null,
      clickIds: returningTracking.attribution.clickIds,
      customTags: returningTracking.attribution.customTags,
      tracking: returningTracking,
      geo: {
        city: 'Preview Town',
        region: 'Template Region',
        countryName: 'Template Country',
      },
      googleSubmitSentAt: null,
      googleQualifiedSentAt: null,
      googleWonSentAt: null,
      googleSyncError: null,
    },
  ];
}

function getTemplateLeadStore(): Map<string, AdminLeadRecord> {
  if (!globalForTemplateAdmin.__templateAdminLeadStore) {
    globalForTemplateAdmin.__templateAdminLeadStore = new Map<string, AdminLeadRecord>(
      createSeedLeads().map((lead) => [buildLeadKey(lead.leadType, lead.id), lead])
    );
  }

  return globalForTemplateAdmin.__templateAdminLeadStore;
}

function cloneLead<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createTemplateAdminSession(
  adminEmail: string = siteConfig.adminEmail
): TemplateAdminSession {
  return {
    user: {
      id: 'template-admin',
      email: adminEmail,
      name: `${siteConfig.shortName} Template Admin`,
    },
    session: {
      id: 'template-session',
      token: 'template-admin-token',
      userId: 'template-admin',
      expiresAt: '2099-12-31T23:59:59.000Z',
    },
  };
}

export function getTemplateAdminLeads(filters?: {
  salesStage?: LeadSalesStage;
  leadType?: LeadType;
  search?: string;
  limit?: number;
  offset?: number;
}): AdminLeadRecord[] {
  let leads = Array.from(getTemplateLeadStore().values()).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (filters?.salesStage) {
    leads = leads.filter((lead) => lead.salesStage === filters.salesStage);
  }

  if (filters?.leadType) {
    leads = leads.filter((lead) => lead.leadType === filters.leadType);
  }

  if (filters?.search) {
    const keyword = filters.search.trim().toLowerCase();
    leads = leads.filter((lead) =>
      [
        lead.name,
        lead.email,
        lead.company || '',
        lead.subject || '',
        lead.message,
        lead.sourceLabel || '',
        lead.utmCampaign || '',
      ].some((value) => value.toLowerCase().includes(keyword))
    );
  }

  const offset = Math.max(filters?.offset ?? 0, 0);
  const limit = Math.min(filters?.limit ?? 200, 500);
  return leads.slice(offset, offset + limit).map(cloneLead);
}

export function getTemplateAdminLeadById(
  leadType: LeadType,
  id: number
): AdminLeadRecord | null {
  const lead = getTemplateLeadStore().get(buildLeadKey(leadType, id));
  return lead ? cloneLead(lead) : null;
}

export function updateTemplateLeadSalesStage(
  leadType: LeadType,
  id: number,
  salesStage: LeadSalesStage
): AdminLeadRecord {
  const store = getTemplateLeadStore();
  const key = buildLeadKey(leadType, id);
  const existingLead = store.get(key);

  if (!existingLead) {
    throw new Error('模板线索不存在');
  }

  const updatedLead: AdminLeadRecord = {
    ...existingLead,
    salesStage,
    salesStageUpdatedAt: new Date().toISOString(),
  };

  store.set(key, updatedLead);
  return cloneLead(updatedLead);
}
