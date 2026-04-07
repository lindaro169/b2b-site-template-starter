export type VisitorKind = 'first_time' | 'returning';

export interface MarketingAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  clickIds: Record<string, string>;
  customTags: Record<string, string>;
  landingQuery: Record<string, string>;
}

export interface TrafficSource {
  channel:
    | 'direct'
    | 'organic_search'
    | 'paid_search'
    | 'social'
    | 'paid_social'
    | 'video'
    | 'ai_assistant'
    | 'referral'
    | 'email'
    | 'unknown';
  platform: string;
  label: string;
  matchedBy: 'utm' | 'click_id' | 'referrer' | 'direct' | 'unknown';
  isPaid: boolean;
  referrer?: string;
  referrerHost?: string;
}

export interface TrackedPageVisit {
  path: string;
  pathWithQuery: string;
  url?: string;
  label: string;
  enteredAt: string;
  durationMs: number;
}

export interface VisitorTrackingSnapshot {
  version: 1;
  visitorId: string;
  sessionId: string;
  visitorType: VisitorKind;
  visitCount: number;
  sessionStartedAt: string;
  lastActivityAt: string;
  totalDurationMs: number;
  landingPage: {
    path: string;
    pathWithQuery: string;
    url?: string;
    label: string;
  };
  source: TrafficSource;
  attribution: MarketingAttribution;
  pages: TrackedPageVisit[];
}

interface VisitorProfile {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  visitCount: number;
}

interface StoredTrackingSession {
  sessionId: string;
  visitorId: string;
  visitCount: number;
  visitorType: VisitorKind;
  startedAt: string;
  lastActivityAt: string;
  currentPageStartedAt: number;
  source: TrafficSource;
  attribution: MarketingAttribution;
  landingPage: {
    path: string;
    pathWithQuery: string;
    url?: string;
    label: string;
  };
  pages: TrackedPageVisit[];
}

export interface RequestGeoInfo {
  city?: string;
  region?: string;
  regionCode?: string;
  countryCode?: string;
  countryName?: string;
  timezone?: string;
  ip?: string;
}

export interface TrackingSummary {
  location: string;
  source: string;
  visitor: string;
  landingPage: string;
  visitPath: string;
  totalDuration: string;
  adKeyword?: string;
  referrer?: string;
  tags: string[];
  session: string;
}

const TRACKING_PROFILE_KEY = 'lead-tracker-profile-v1';
const TRACKING_SESSION_KEY = 'lead-tracker-session-v1';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_PATH_STEPS = 12;

const CLICK_ID_KEYS = [
  'gclid',
  'gbraid',
  'wbraid',
  'msclkid',
  'fbclid',
  'ttclid',
  'li_fat_id',
  'twclid',
];

const CUSTOM_TAG_KEYS = [
  'keyword',
  'kw',
  'term',
  'query',
  'search',
  'search_term',
  'matchtype',
  'network',
  'device',
  'placement',
  'creative',
  'campaignid',
  'adgroupid',
  'adid',
  'source_tag',
  'lead_tag',
  'creative_id',
];

const SEARCH_HOSTS: Array<{ match: string[]; platform: string; paidLabel: string; organicLabel: string }> = [
  {
    match: ['google.'],
    platform: 'google',
    paidLabel: 'Google Ads',
    organicLabel: 'Google Search',
  },
  {
    match: ['bing.com'],
    platform: 'bing',
    paidLabel: 'Bing Ads',
    organicLabel: 'Bing Search',
  },
  {
    match: ['search.yahoo.com', 'yahoo.com'],
    platform: 'yahoo',
    paidLabel: 'Yahoo Ads',
    organicLabel: 'Yahoo Search',
  },
];

const SOCIAL_HOSTS: Array<{ match: string[]; platform: string; label: string }> = [
  { match: ['facebook.com', 'm.facebook.com', 'l.facebook.com', 'lm.facebook.com'], platform: 'facebook', label: 'Facebook' },
  { match: ['instagram.com', 'l.instagram.com'], platform: 'instagram', label: 'Instagram' },
  { match: ['pinterest.com', 'pin.it'], platform: 'pinterest', label: 'Pinterest' },
  { match: ['tiktok.com'], platform: 'tiktok', label: 'TikTok' },
  { match: ['x.com', 'twitter.com', 't.co'], platform: 'x', label: 'X / Twitter' },
  { match: ['linkedin.com'], platform: 'linkedin', label: 'LinkedIn' },
];

const VIDEO_HOSTS: Array<{ match: string[]; platform: string; label: string }> = [
  { match: ['youtube.com', 'youtu.be'], platform: 'youtube', label: 'YouTube' },
];

const AI_ASSISTANT_HOSTS: Array<{ match: string[]; platform: string; label: string }> = [
  { match: ['chatgpt.com', 'chat.openai.com'], platform: 'chatgpt', label: 'ChatGPT' },
  { match: ['perplexity.ai'], platform: 'perplexity', label: 'Perplexity' },
];

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return {
    local: window.localStorage,
    session: window.sessionStorage,
  };
}

function getNow(): number {
  return Date.now();
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return '/';
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function getPathWithQuery(url: URL): string {
  const pathname = normalizePathname(url.pathname);
  const search = url.search || '';
  return `${pathname}${search}`;
}

function toTitleCase(input: string): string {
  return input
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function humanizePath(path: string): string {
  const pathname = path.split('?')[0] || '/';

  if (pathname === '/') {
    return 'Home';
  }

  if (pathname === '/contact') {
    return 'Contact Us';
  }

  if (pathname === '/about') {
    return 'About Us';
  }

  if (pathname === '/services') {
    return 'Services';
  }

  if (pathname === '/blog') {
    return 'Blog';
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return 'Home';
  }

  if (segments[0] === 'product' && segments[1]) {
    return `Product: ${toTitleCase(decodeURIComponent(segments[1]))}`;
  }

  if (segments[0] === 'products' && segments[1] && segments[2]) {
    return `Products: ${toTitleCase(decodeURIComponent(segments[2]))}`;
  }

  if (segments[0] === 'products' && segments[1]) {
    return `Products: ${toTitleCase(decodeURIComponent(segments[1]))}`;
  }

  return segments.map((segment) => toTitleCase(decodeURIComponent(segment))).join(' / ');
}

function collectQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    if (!value) {
      continue;
    }

    params[key] = value;
  }

  return params;
}

function getMarketingAttribution(url: URL): MarketingAttribution {
  const landingQuery = collectQueryParams(url.searchParams);
  const clickIds: Record<string, string> = {};
  const customTags: Record<string, string> = {};

  for (const key of CLICK_ID_KEYS) {
    const value = url.searchParams.get(key);
    if (value) {
      clickIds[key] = value;
    }
  }

  for (const key of CUSTOM_TAG_KEYS) {
    const value = url.searchParams.get(key);
    if (value) {
      customTags[key] = value;
    }
  }

  return {
    utmSource: url.searchParams.get('utm_source') || undefined,
    utmMedium: url.searchParams.get('utm_medium') || undefined,
    utmCampaign: url.searchParams.get('utm_campaign') || undefined,
    utmTerm: url.searchParams.get('utm_term') || undefined,
    utmContent: url.searchParams.get('utm_content') || undefined,
    clickIds,
    customTags,
    landingQuery,
  };
}

function normalizeHost(host: string | null | undefined): string {
  return (host || '').toLowerCase().replace(/^www\./, '');
}

function hostMatches(host: string, candidates: string[]): boolean {
  return candidates.some((candidate) => host.includes(candidate));
}

function getQueryValue(url: URL, key: string): string | undefined {
  return url.searchParams.get(key) || undefined;
}

function isPaidMedium(medium?: string): boolean {
  const normalized = (medium || '').toLowerCase();
  return ['cpc', 'ppc', 'paid', 'paid_social', 'paid-social', 'display', 'remarketing'].some((item) =>
    normalized.includes(item)
  );
}

export function detectTrafficSource(urlInput: URL | string, referrer?: string): TrafficSource {
  const url = typeof urlInput === 'string' ? new URL(urlInput) : urlInput;
  const attribution = getMarketingAttribution(url);
  const utmSource = attribution.utmSource?.toLowerCase();
  const utmMedium = attribution.utmMedium?.toLowerCase();
  const currentHost = normalizeHost(url.hostname);
  let referrerHost = '';

  if (referrer) {
    try {
      referrerHost = normalizeHost(new URL(referrer).hostname);
    } catch {
      referrerHost = '';
    }
  }

  if (referrerHost === currentHost) {
    referrerHost = '';
    referrer = undefined;
  }

  const paidByMedium = isPaidMedium(utmMedium);

  if (attribution.clickIds.gclid || attribution.clickIds.gbraid || attribution.clickIds.wbraid) {
    return {
      channel: 'paid_search',
      platform: 'google',
      label: 'Google Ads',
      matchedBy: 'click_id',
      isPaid: true,
      referrer,
      referrerHost,
    };
  }

  if (attribution.clickIds.msclkid) {
    return {
      channel: 'paid_search',
      platform: 'bing',
      label: 'Bing Ads',
      matchedBy: 'click_id',
      isPaid: true,
      referrer,
      referrerHost,
    };
  }

  if (attribution.clickIds.fbclid && ['facebook', 'instagram', 'meta'].includes(utmSource || '')) {
    return {
      channel: 'paid_social',
      platform: utmSource === 'instagram' ? 'instagram' : 'facebook',
      label: utmSource === 'instagram' ? 'Instagram Ads' : 'Facebook Ads',
      matchedBy: 'click_id',
      isPaid: true,
      referrer,
      referrerHost,
    };
  }

  if (attribution.clickIds.ttclid) {
    return {
      channel: 'paid_social',
      platform: 'tiktok',
      label: 'TikTok Ads',
      matchedBy: 'click_id',
      isPaid: true,
      referrer,
      referrerHost,
    };
  }

  if (utmSource) {
    const sourceFromSearch = SEARCH_HOSTS.find((item) => item.platform === utmSource);
    if (sourceFromSearch) {
      const isPaid = paidByMedium || Object.keys(attribution.clickIds).length > 0;
      return {
        channel: isPaid ? 'paid_search' : 'organic_search',
        platform: utmSource,
        label: isPaid ? sourceFromSearch.paidLabel : sourceFromSearch.organicLabel,
        matchedBy: 'utm',
        isPaid,
        referrer,
        referrerHost,
      };
    }

    const sourceFromSocial = SOCIAL_HOSTS.find((item) => item.platform === utmSource);
    if (sourceFromSocial) {
      const isPaid = paidByMedium || Object.keys(attribution.clickIds).length > 0;
      return {
        channel: isPaid ? 'paid_social' : 'social',
        platform: utmSource,
        label: isPaid ? `${sourceFromSocial.label} Ads` : sourceFromSocial.label,
        matchedBy: 'utm',
        isPaid,
        referrer,
        referrerHost,
      };
    }

    const sourceFromVideo = VIDEO_HOSTS.find((item) => item.platform === utmSource);
    if (sourceFromVideo) {
      return {
        channel: 'video',
        platform: utmSource,
        label: sourceFromVideo.label,
        matchedBy: 'utm',
        isPaid: paidByMedium,
        referrer,
        referrerHost,
      };
    }

    const sourceFromAssistant = AI_ASSISTANT_HOSTS.find((item) => item.platform === utmSource);
    if (sourceFromAssistant) {
      return {
        channel: 'ai_assistant',
        platform: utmSource,
        label: sourceFromAssistant.label,
        matchedBy: 'utm',
        isPaid: false,
        referrer,
        referrerHost,
      };
    }

    if (utmSource.includes('email')) {
      return {
        channel: 'email',
        platform: utmSource,
        label: 'Email Campaign',
        matchedBy: 'utm',
        isPaid: false,
        referrer,
        referrerHost,
      };
    }

    return {
      channel: paidByMedium ? 'referral' : 'unknown',
      platform: utmSource,
      label: toTitleCase(utmSource),
      matchedBy: 'utm',
      isPaid: paidByMedium,
      referrer,
      referrerHost,
    };
  }

  if (referrerHost) {
    const searchMatch = SEARCH_HOSTS.find((item) => hostMatches(referrerHost, item.match));
    if (searchMatch) {
      return {
        channel: 'organic_search',
        platform: searchMatch.platform,
        label: searchMatch.organicLabel,
        matchedBy: 'referrer',
        isPaid: false,
        referrer,
        referrerHost,
      };
    }

    const socialMatch = SOCIAL_HOSTS.find((item) => hostMatches(referrerHost, item.match));
    if (socialMatch) {
      return {
        channel: 'social',
        platform: socialMatch.platform,
        label: socialMatch.label,
        matchedBy: 'referrer',
        isPaid: false,
        referrer,
        referrerHost,
      };
    }

    const videoMatch = VIDEO_HOSTS.find((item) => hostMatches(referrerHost, item.match));
    if (videoMatch) {
      return {
        channel: 'video',
        platform: videoMatch.platform,
        label: videoMatch.label,
        matchedBy: 'referrer',
        isPaid: false,
        referrer,
        referrerHost,
      };
    }

    const assistantMatch = AI_ASSISTANT_HOSTS.find((item) => hostMatches(referrerHost, item.match));
    if (assistantMatch) {
      return {
        channel: 'ai_assistant',
        platform: assistantMatch.platform,
        label: assistantMatch.label,
        matchedBy: 'referrer',
        isPaid: false,
        referrer,
        referrerHost,
      };
    }

    return {
      channel: 'referral',
      platform: referrerHost,
      label: `Referral (${referrerHost})`,
      matchedBy: 'referrer',
      isPaid: false,
      referrer,
      referrerHost,
    };
  }

  return {
    channel: 'direct',
    platform: 'direct',
    label: 'Direct / Unknown',
    matchedBy: 'direct',
    isPaid: false,
  };
}

function readProfile(): VisitorProfile | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return safeJsonParse<VisitorProfile>(storage.local.getItem(TRACKING_PROFILE_KEY));
}

function writeProfile(profile: VisitorProfile): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.local.setItem(TRACKING_PROFILE_KEY, JSON.stringify(profile));
}

function readSession(): StoredTrackingSession | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return safeJsonParse<StoredTrackingSession>(storage.session.getItem(TRACKING_SESSION_KEY));
}

function writeSession(session: StoredTrackingSession): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.session.setItem(TRACKING_SESSION_KEY, JSON.stringify(session));
}

function createPageVisit(url: URL): TrackedPageVisit {
  const pathWithQuery = getPathWithQuery(url);
  return {
    path: normalizePathname(url.pathname),
    pathWithQuery,
    url: url.toString(),
    label: humanizePath(pathWithQuery),
    enteredAt: new Date().toISOString(),
    durationMs: 0,
  };
}

function createProfile(now: number): VisitorProfile {
  const timestamp = new Date(now).toISOString();
  return {
    visitorId: createId('visitor'),
    firstSeenAt: timestamp,
    lastSeenAt: timestamp,
    visitCount: 1,
  };
}

function createSession(profile: VisitorProfile, url: URL, referrer?: string): StoredTrackingSession {
  const now = getNow();
  const firstPage = createPageVisit(url);
  const source = detectTrafficSource(url, referrer);
  const attribution = getMarketingAttribution(url);
  const timestamp = new Date(now).toISOString();

  return {
    sessionId: createId('session'),
    visitorId: profile.visitorId,
    visitCount: profile.visitCount,
    visitorType: profile.visitCount > 1 ? 'returning' : 'first_time',
    startedAt: timestamp,
    lastActivityAt: timestamp,
    currentPageStartedAt: now,
    source,
    attribution,
    landingPage: {
      path: firstPage.path,
      pathWithQuery: firstPage.pathWithQuery,
      url: firstPage.url,
      label: firstPage.label,
    },
    pages: [firstPage],
  };
}

function touchCurrentPage(session: StoredTrackingSession, now: number): StoredTrackingSession {
  const pages = [...session.pages];
  const currentPage = pages[pages.length - 1];

  if (!currentPage) {
    return session;
  }

  const delta = Math.max(0, now - session.currentPageStartedAt);
  currentPage.durationMs += delta;

  return {
    ...session,
    pages,
    currentPageStartedAt: now,
    lastActivityAt: new Date(now).toISOString(),
  };
}

function navigateToPage(session: StoredTrackingSession, url: URL, now: number): StoredTrackingSession {
  const touched = touchCurrentPage(session, now);
  const nextPage = createPageVisit(url);
  const pages = [...touched.pages, nextPage].slice(-MAX_PATH_STEPS);

  return {
    ...touched,
    pages,
    currentPageStartedAt: now,
    lastActivityAt: new Date(now).toISOString(),
  };
}

function isSessionExpired(session: StoredTrackingSession, now: number): boolean {
  const lastActivity = new Date(session.lastActivityAt).getTime();
  return Number.isFinite(lastActivity) ? now - lastActivity > SESSION_TIMEOUT_MS : true;
}

function getCurrentUrl(explicitUrl?: string): URL | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return new URL(explicitUrl || window.location.href);
  } catch {
    return null;
  }
}

export function ensureVisitorTracking(explicitUrl?: string): VisitorTrackingSnapshot | null {
  const storage = getStorage();
  const currentUrl = getCurrentUrl(explicitUrl);

  if (!storage || !currentUrl) {
    return null;
  }

  const now = getNow();
  let profile = readProfile();
  const hadExistingProfile = Boolean(profile);

  if (!profile) {
    profile = createProfile(now);
    writeProfile(profile);
  }

  let session = readSession();
  const referrer =
    typeof document !== 'undefined' && document.referrer && document.referrer !== window.location.href
      ? document.referrer
      : undefined;

  if (!session || isSessionExpired(session, now)) {
    if (hadExistingProfile) {
      profile.visitCount += 1;
    }

    profile.lastSeenAt = new Date(now).toISOString();
    writeProfile(profile);
    session = createSession(profile, currentUrl, referrer);
    writeSession(session);
    return buildVisitorTrackingSnapshot(session);
  }

  profile.lastSeenAt = new Date(now).toISOString();
  writeProfile(profile);

  const currentPath = getPathWithQuery(currentUrl);
  const lastPath = session.pages[session.pages.length - 1]?.pathWithQuery;
  if (currentPath !== lastPath) {
    session = navigateToPage(session, currentUrl, now);
  } else {
    session = {
      ...session,
      lastActivityAt: new Date(now).toISOString(),
    };
  }

  writeSession(session);
  return buildVisitorTrackingSnapshot(session);
}

export function syncVisitorTrackingCurrentPage(): VisitorTrackingSnapshot | null {
  const session = readSession();
  if (!session) {
    return ensureVisitorTracking();
  }

  const touched = touchCurrentPage(session, getNow());
  writeSession(touched);
  return buildVisitorTrackingSnapshot(touched);
}

export function getVisitorTrackingSnapshot(): VisitorTrackingSnapshot | null {
  const session = readSession();
  if (!session) {
    return ensureVisitorTracking();
  }

  return buildVisitorTrackingSnapshot(session);
}

export function buildVisitorTrackingSnapshot(session: StoredTrackingSession): VisitorTrackingSnapshot {
  const now = getNow();
  const pages = session.pages.map((page, index) => {
    const isCurrent = index === session.pages.length - 1;
    const durationMs = isCurrent ? page.durationMs + Math.max(0, now - session.currentPageStartedAt) : page.durationMs;
    return {
      ...page,
      durationMs,
    };
  });

  const totalDurationMs = pages.reduce((sum, page) => sum + page.durationMs, 0);

  return {
    version: 1,
    visitorId: session.visitorId,
    sessionId: session.sessionId,
    visitorType: session.visitorType,
    visitCount: session.visitCount,
    sessionStartedAt: session.startedAt,
    lastActivityAt: session.lastActivityAt,
    totalDurationMs,
    landingPage: session.landingPage,
    source: session.source,
    attribution: session.attribution,
    pages,
  };
}

export function normalizeVisitorTrackingSnapshot(payload: unknown): VisitorTrackingSnapshot | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as Partial<VisitorTrackingSnapshot>;
  if (!candidate.sessionId || !candidate.visitorId || !Array.isArray(candidate.pages) || !candidate.source) {
    return null;
  }

  const pages = candidate.pages
    .filter((page): page is TrackedPageVisit => {
      return !!page && typeof page.path === 'string' && typeof page.pathWithQuery === 'string';
    })
    .map((page) => ({
      path: page.path,
      pathWithQuery: page.pathWithQuery,
      url: page.url,
      label: page.label || humanizePath(page.pathWithQuery),
      enteredAt: page.enteredAt || new Date().toISOString(),
      durationMs: Math.max(0, Number(page.durationMs || 0)),
    }))
    .slice(-MAX_PATH_STEPS);

  if (pages.length === 0) {
    return null;
  }

  return {
    version: 1,
    visitorId: String(candidate.visitorId),
    sessionId: String(candidate.sessionId),
    visitorType: candidate.visitorType === 'returning' ? 'returning' : 'first_time',
    visitCount: Math.max(1, Number(candidate.visitCount || 1)),
    sessionStartedAt: candidate.sessionStartedAt || new Date().toISOString(),
    lastActivityAt: candidate.lastActivityAt || candidate.sessionStartedAt || new Date().toISOString(),
    totalDurationMs: Math.max(0, Number(candidate.totalDurationMs || 0)),
    landingPage: candidate.landingPage
      ? {
          path: candidate.landingPage.path || pages[0].path,
          pathWithQuery: candidate.landingPage.pathWithQuery || pages[0].pathWithQuery,
          url: candidate.landingPage.url || pages[0].url,
          label: candidate.landingPage.label || humanizePath(candidate.landingPage.pathWithQuery || pages[0].pathWithQuery),
        }
      : {
          path: pages[0].path,
          pathWithQuery: pages[0].pathWithQuery,
          url: pages[0].url,
          label: pages[0].label,
        },
    source: {
      channel: candidate.source.channel || 'unknown',
      platform: candidate.source.platform || 'unknown',
      label: candidate.source.label || 'Unknown',
      matchedBy: candidate.source.matchedBy || 'unknown',
      isPaid: Boolean(candidate.source.isPaid),
      referrer: candidate.source.referrer,
      referrerHost: candidate.source.referrerHost,
    },
    attribution: {
      utmSource: candidate.attribution?.utmSource,
      utmMedium: candidate.attribution?.utmMedium,
      utmCampaign: candidate.attribution?.utmCampaign,
      utmTerm: candidate.attribution?.utmTerm,
      utmContent: candidate.attribution?.utmContent,
      clickIds: candidate.attribution?.clickIds || {},
      customTags: candidate.attribution?.customTags || {},
      landingQuery: candidate.attribution?.landingQuery || {},
    },
    pages,
  };
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

function getRegionName(countryCode?: string): string | undefined {
  if (!countryCode) {
    return undefined;
  }

  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode.toUpperCase()) || undefined;
  } catch {
    return undefined;
  }
}

export function buildRequestGeoInfo(
  cf: Record<string, unknown> | undefined,
  headers: Headers
): RequestGeoInfo {
  const countryCodeFromCf = typeof cf?.country === 'string' ? cf.country : undefined;
  const countryCodeFromHeader = headers.get('cf-ipcountry') || undefined;
  const countryCode = countryCodeFromCf || countryCodeFromHeader;
  const countryName =
    (typeof cf?.countryName === 'string' ? cf.countryName : undefined) || getRegionName(countryCode);

  const forwardedFor = headers.get('x-forwarded-for');
  const ipFromHeader = headers.get('cf-connecting-ip') || forwardedFor?.split(',')[0]?.trim() || undefined;

  return {
    city: typeof cf?.city === 'string' ? cf.city : undefined,
    region: typeof cf?.region === 'string' ? cf.region : undefined,
    regionCode: typeof cf?.regionCode === 'string' ? cf.regionCode : undefined,
    countryCode,
    countryName,
    timezone: typeof cf?.timezone === 'string' ? cf.timezone : undefined,
    ip: ipFromHeader,
  };
}

export function formatGeoLocation(geo?: RequestGeoInfo | null): string {
  if (!geo) {
    return 'Unknown';
  }

  const parts = [geo.city, geo.region, geo.countryName || geo.countryCode].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Unknown';
}

function getTrackingTags(snapshot: VisitorTrackingSnapshot): string[] {
  const tags: string[] = [];

  if (snapshot.attribution.utmSource) {
    tags.push(`utm_source=${snapshot.attribution.utmSource}`);
  }

  if (snapshot.attribution.utmMedium) {
    tags.push(`utm_medium=${snapshot.attribution.utmMedium}`);
  }

  if (snapshot.attribution.utmCampaign) {
    tags.push(`utm_campaign=${snapshot.attribution.utmCampaign}`);
  }

  if (snapshot.attribution.utmTerm) {
    tags.push(`utm_term=${snapshot.attribution.utmTerm}`);
  }

  if (snapshot.attribution.utmContent) {
    tags.push(`utm_content=${snapshot.attribution.utmContent}`);
  }

  for (const [key, value] of Object.entries(snapshot.attribution.clickIds)) {
    tags.push(`${key}=${value}`);
  }

  for (const [key, value] of Object.entries(snapshot.attribution.customTags)) {
    tags.push(`${key}=${value}`);
  }

  return tags;
}

export function getAttributionKeyword(snapshot: VisitorTrackingSnapshot): string | undefined {
  return (
    snapshot.attribution.utmTerm ||
    snapshot.attribution.customTags.keyword ||
    snapshot.attribution.customTags.kw ||
    snapshot.attribution.customTags.term ||
    snapshot.attribution.customTags.search_term ||
    snapshot.attribution.customTags.query
  );
}

export function buildTrackingSummary(
  snapshot: VisitorTrackingSnapshot | null | undefined,
  geo?: RequestGeoInfo | null
): TrackingSummary {
  if (!snapshot) {
    return {
      location: formatGeoLocation(geo),
      source: 'Unknown',
      visitor: 'Unknown visitor',
      landingPage: 'Unknown',
      visitPath: 'No journey captured',
      totalDuration: '0m 00s',
      tags: [],
      session: 'Unavailable',
    };
  }

  const visitPath = snapshot.pages
    .map((page) => `${page.label} (${formatDuration(page.durationMs)})`)
    .join(' -> ');

  return {
    location: formatGeoLocation(geo),
    source: snapshot.source.label,
    visitor:
      snapshot.visitorType === 'returning'
        ? `Returning visitor (#${snapshot.visitCount})`
        : 'First-time visitor',
    landingPage: snapshot.landingPage.label,
    visitPath,
    totalDuration: formatDuration(
      snapshot.totalDurationMs ||
        snapshot.pages.reduce((sum, page) => sum + Math.max(0, page.durationMs), 0)
    ),
    adKeyword: getAttributionKeyword(snapshot),
    referrer: snapshot.source.referrer,
    tags: getTrackingTags(snapshot),
    session: `${snapshot.sessionId} / ${snapshot.visitorId}`,
  };
}

export function getSearchQueryHint(url: URL): string | undefined {
  return (
    getQueryValue(url, 'q') ||
    getQueryValue(url, 'p') ||
    getQueryValue(url, 'query') ||
    getQueryValue(url, 'search')
  );
}
