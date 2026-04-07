import type { D1Database, D1Row } from '@/lib/d1-db';
import {
  buildVisitorTrackingSnapshot,
  detectTrafficSource,
  humanizePath,
  normalizeVisitorTrackingSnapshot,
  type VisitorTrackingSnapshot,
} from '@/lib/visitor-tracking';

type StoredAttributionSession = {
  sessionId: string;
  visitorId: string;
  visitCount: number;
  visitorType: 'first_time' | 'returning';
  startedAt: string;
  lastActivityAt: string;
  currentPageStartedAt: number;
  landingPage: VisitorTrackingSnapshot['landingPage'];
  source: VisitorTrackingSnapshot['source'];
  attribution: VisitorTrackingSnapshot['attribution'];
  pages: VisitorTrackingSnapshot['pages'];
};

type CookieDescriptor = {
  name: string;
  value: string;
  maxAge: number;
};

type VisitRecordInput = {
  pathWithQuery?: string;
  finalize?: boolean;
};

const SESSION_COOKIE = 'lead_session_id';
const VISITOR_COOKIE = 'lead_visitor_id';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;
const SESSION_COOKIE_MAX_AGE = 60 * 30;
const MAX_PATH_STEPS = 12;

const memorySessions = new Map<string, StoredAttributionSession>();
const memoryVisitorSessionCount = new Map<string, number>();

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

function escapeCookieValue(value: string): string {
  return encodeURIComponent(value);
}

function buildSetCookieHeader(cookie: CookieDescriptor): string {
  return [
    `${cookie.name}=${escapeCookieValue(cookie.value)}`,
    'Path=/',
    `Max-Age=${cookie.maxAge}`,
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
  ].join('; ');
}

export function appendAttributionCookies(headers: Headers, cookies: CookieDescriptor[]): void {
  cookies.forEach((cookie) => {
    headers.append('Set-Cookie', buildSetCookieHeader(cookie));
  });
}

function parseCookieHeader(header: string | null): Record<string, string> {
  if (!header) {
    return {};
  }

  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const separator = part.indexOf('=');
      if (separator < 0) {
        return acc;
      }

      const key = part.slice(0, separator).trim();
      const value = part.slice(separator + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function getCookiesFromRequest(request: Request): Record<string, string> {
  return parseCookieHeader(request.headers.get('cookie'));
}

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return '/';
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function toPathWithQuery(url: URL): string {
  return `${normalizePathname(url.pathname)}${url.search || ''}`;
}

function collectQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    if (value) {
      params[key] = value;
    }
  }

  return params;
}

function buildAttribution(url: URL): VisitorTrackingSnapshot['attribution'] {
  const clickIds: Record<string, string> = {};
  const customTags: Record<string, string> = {};

  ['gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid', 'ttclid', 'li_fat_id', 'twclid'].forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) {
      clickIds[key] = value;
    }
  });

  [
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
  ].forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) {
      customTags[key] = value;
    }
  });

  return {
    utmSource: url.searchParams.get('utm_source') || undefined,
    utmMedium: url.searchParams.get('utm_medium') || undefined,
    utmCampaign: url.searchParams.get('utm_campaign') || undefined,
    utmTerm: url.searchParams.get('utm_term') || undefined,
    utmContent: url.searchParams.get('utm_content') || undefined,
    clickIds,
    customTags,
    landingQuery: collectQueryParams(url.searchParams),
  };
}

function createPageVisit(url: URL): VisitorTrackingSnapshot['pages'][number] {
  const pathWithQuery = toPathWithQuery(url);
  return {
    path: normalizePathname(url.pathname),
    pathWithQuery,
    url: url.toString(),
    label: humanizePath(pathWithQuery),
    enteredAt: new Date().toISOString(),
    durationMs: 0,
  };
}

function createSession(input: {
  visitorId: string;
  visitCount: number;
  url: URL;
  referrer?: string;
}): StoredAttributionSession {
  const now = Date.now();
  const firstPage = createPageVisit(input.url);
  const timestamp = new Date(now).toISOString();

  return {
    sessionId: createId('session'),
    visitorId: input.visitorId,
    visitCount: input.visitCount,
    visitorType: input.visitCount > 1 ? 'returning' : 'first_time',
    startedAt: timestamp,
    lastActivityAt: timestamp,
    currentPageStartedAt: now,
    landingPage: {
      path: firstPage.path,
      pathWithQuery: firstPage.pathWithQuery,
      url: firstPage.url,
      label: firstPage.label,
    },
    source: detectTrafficSource(input.url, input.referrer),
    attribution: buildAttribution(input.url),
    pages: [firstPage],
  };
}

function touchCurrentPage(session: StoredAttributionSession, now: number): StoredAttributionSession {
  const pages = [...session.pages];
  const currentPage = pages[pages.length - 1];

  if (!currentPage) {
    return session;
  }

  currentPage.durationMs += Math.max(0, now - session.currentPageStartedAt);

  return {
    ...session,
    pages,
    currentPageStartedAt: now,
    lastActivityAt: new Date(now).toISOString(),
  };
}

function navigateToPage(session: StoredAttributionSession, url: URL, now: number): StoredAttributionSession {
  const touched = touchCurrentPage(session, now);
  return {
    ...touched,
    pages: [...touched.pages, createPageVisit(url)].slice(-MAX_PATH_STEPS),
    currentPageStartedAt: now,
    lastActivityAt: new Date(now).toISOString(),
  };
}

function isSessionExpired(session: StoredAttributionSession, now: number): boolean {
  const lastActivityAt = new Date(session.lastActivityAt).getTime();
  return Number.isFinite(lastActivityAt) ? now - lastActivityAt > SESSION_TIMEOUT_MS : true;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || !value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function rowToStoredSession(row: D1Row): StoredAttributionSession | null {
  const snapshot = normalizeVisitorTrackingSnapshot({
    version: 1,
    sessionId: row.session_id,
    visitorId: row.visitor_id,
    visitCount: row.visit_count,
    visitorType: row.visitor_type,
    sessionStartedAt: row.started_at,
    lastActivityAt: row.last_activity_at,
    landingPage: parseJson(row.landing_page_json, null),
    source: parseJson(row.source_json, null),
    attribution: parseJson(row.attribution_json, null),
    pages: parseJson(row.pages_json, []),
  });

  if (!snapshot) {
    return null;
  }

  return {
    sessionId: snapshot.sessionId,
    visitorId: snapshot.visitorId,
    visitCount: snapshot.visitCount,
    visitorType: snapshot.visitorType,
    startedAt: snapshot.sessionStartedAt,
    lastActivityAt: snapshot.lastActivityAt,
    currentPageStartedAt: Number(row.current_page_started_at || Date.now()),
    landingPage: snapshot.landingPage,
    source: snapshot.source,
    attribution: snapshot.attribution,
    pages: snapshot.pages,
  };
}

async function loadSession(db: D1Database | null | undefined, sessionId: string): Promise<StoredAttributionSession | null> {
  if (!sessionId) {
    return null;
  }

  if (!db) {
    return memorySessions.get(sessionId) || null;
  }

  const result = await db
    .prepare('SELECT * FROM tracking_sessions WHERE session_id = ? LIMIT 1')
    .bind(sessionId)
    .all<D1Row>();

  if (!result.success || !result.results?.[0]) {
    return null;
  }

  return rowToStoredSession(result.results[0]);
}

async function getVisitorSessionCount(db: D1Database | null | undefined, visitorId: string): Promise<number> {
  if (!db) {
    return memoryVisitorSessionCount.get(visitorId) || 0;
  }

  const count = await db
    .prepare('SELECT COUNT(*) AS total FROM tracking_sessions WHERE visitor_id = ?')
    .bind(visitorId)
    .first<{ total?: number | string }>();

  return Number(count?.total || 0);
}

async function saveSession(db: D1Database | null | undefined, session: StoredAttributionSession): Promise<void> {
  if (!db) {
    memorySessions.set(session.sessionId, session);
    memoryVisitorSessionCount.set(
      session.visitorId,
      Math.max(memoryVisitorSessionCount.get(session.visitorId) || 0, session.visitCount)
    );
    return;
  }

  await db
    .prepare(`
      INSERT INTO tracking_sessions (
        session_id, visitor_id, visit_count, visitor_type, started_at, last_activity_at,
        current_page_started_at, landing_page_json, source_json, attribution_json, pages_json,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(session_id) DO UPDATE SET
        visitor_id = excluded.visitor_id,
        visit_count = excluded.visit_count,
        visitor_type = excluded.visitor_type,
        started_at = excluded.started_at,
        last_activity_at = excluded.last_activity_at,
        current_page_started_at = excluded.current_page_started_at,
        landing_page_json = excluded.landing_page_json,
        source_json = excluded.source_json,
        attribution_json = excluded.attribution_json,
        pages_json = excluded.pages_json,
        updated_at = CURRENT_TIMESTAMP
    `)
    .bind(
      session.sessionId,
      session.visitorId,
      session.visitCount,
      session.visitorType,
      session.startedAt,
      session.lastActivityAt,
      session.currentPageStartedAt,
      JSON.stringify(session.landingPage),
      JSON.stringify(session.source),
      JSON.stringify(session.attribution),
      JSON.stringify(session.pages)
    )
    .run();
}

function derivePageUrl(request: Request, pathWithQuery?: string): URL | null {
  try {
    if (pathWithQuery) {
      return new URL(pathWithQuery, request.url);
    }

    const referrer = request.headers.get('referer');
    if (referrer) {
      return new URL(referrer);
    }
  } catch {
    return null;
  }

  return null;
}

function buildCookies(session: StoredAttributionSession, visitorId: string): CookieDescriptor[] {
  return [
    { name: VISITOR_COOKIE, value: visitorId, maxAge: VISITOR_COOKIE_MAX_AGE },
    { name: SESSION_COOKIE, value: session.sessionId, maxAge: SESSION_COOKIE_MAX_AGE },
  ];
}

export async function recordAttributionVisit(
  request: Request,
  db: D1Database | null | undefined,
  input: VisitRecordInput
): Promise<{ snapshot: VisitorTrackingSnapshot | null; cookies: CookieDescriptor[] }> {
  const pageUrl = derivePageUrl(request, input.pathWithQuery);
  if (!pageUrl) {
    return { snapshot: null, cookies: [] };
  }

  const cookieMap = getCookiesFromRequest(request);
  const visitorId = cookieMap[VISITOR_COOKIE] || createId('visitor');
  const existingSessionId = cookieMap[SESSION_COOKIE] || '';
  const now = Date.now();
  const referrer = request.headers.get('referer') || undefined;

  let session = await loadSession(db, existingSessionId);
  if (!session || session.visitorId !== visitorId || isSessionExpired(session, now)) {
    const visitCount = (await getVisitorSessionCount(db, visitorId)) + 1;
    session = createSession({
      visitorId,
      visitCount,
      url: pageUrl,
      referrer,
    });
  } else if (input.finalize) {
    session = touchCurrentPage(session, now);
  } else {
    const currentPath = toPathWithQuery(pageUrl);
    const lastPath = session.pages[session.pages.length - 1]?.pathWithQuery;
    session = currentPath === lastPath ? touchCurrentPage(session, now) : navigateToPage(session, pageUrl, now);
  }

  await saveSession(db, session);

  return {
    snapshot: buildVisitorTrackingSnapshot(session),
    cookies: buildCookies(session, visitorId),
  };
}

export async function getAttributionSnapshotFromRequest(
  request: Request,
  db: D1Database | null | undefined
): Promise<{ snapshot: VisitorTrackingSnapshot | null; cookies: CookieDescriptor[] }> {
  const cookieMap = getCookiesFromRequest(request);
  const sessionId = cookieMap[SESSION_COOKIE] || '';

  if (sessionId) {
    const session = await loadSession(db, sessionId);
    if (session) {
      return {
        snapshot: buildVisitorTrackingSnapshot(session),
        cookies: buildCookies(session, session.visitorId),
      };
    }
  }

  return recordAttributionVisit(request, db, {});
}
