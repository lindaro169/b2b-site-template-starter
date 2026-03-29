type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitBucket>;

const globalForRateLimit = globalThis as typeof globalThis & {
  __requestRateLimitStore?: RateLimitStore;
};

function getRateLimitStore(): RateLimitStore {
  if (!globalForRateLimit.__requestRateLimitStore) {
    globalForRateLimit.__requestRateLimitStore = new Map<string, RateLimitBucket>();
  }

  return globalForRateLimit.__requestRateLimitStore;
}

function pruneExpiredBuckets(store: RateLimitStore, now: number): void {
  if (store.size < 500) {
    return;
  }

  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function getRequestClientIdentifier(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  const firstForwardedIp = forwardedFor?.split(',')[0]?.trim();
  const identifier =
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    firstForwardedIp ||
    headers.get('x-client-ip') ||
    'unknown';

  return identifier.slice(0, 128);
}

export interface RequestRateLimitOptions {
  routeKey: string;
  headers: Headers;
  limit: number;
  windowMs: number;
}

export interface RequestRateLimitResult {
  allowed: boolean;
  identifier: string;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function checkRequestRateLimit(
  options: RequestRateLimitOptions
): RequestRateLimitResult {
  const now = Date.now();
  const store = getRateLimitStore();
  pruneExpiredBuckets(store, now);

  const identifier = getRequestClientIdentifier(options.headers);
  const storageKey = `${options.routeKey}:${identifier}`;
  const existingBucket = store.get(storageKey);

  if (!existingBucket || existingBucket.resetAt <= now) {
    const resetAt = now + options.windowMs;
    store.set(storageKey, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      identifier,
      limit: options.limit,
      remaining: Math.max(options.limit - 1, 0),
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  if (existingBucket.count >= options.limit) {
    return {
      allowed: false,
      identifier,
      limit: options.limit,
      remaining: 0,
      resetAt: existingBucket.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existingBucket.resetAt - now) / 1000)),
    };
  }

  existingBucket.count += 1;
  store.set(storageKey, existingBucket);

  return {
    allowed: true,
    identifier,
    limit: options.limit,
    remaining: Math.max(options.limit - existingBucket.count, 0),
    resetAt: existingBucket.resetAt,
    retryAfterSeconds: 0,
  };
}

export function buildRateLimitHeaders(result: RequestRateLimitResult): Record<string, string> {
  return {
    'Retry-After': result.retryAfterSeconds > 0 ? String(result.retryAfterSeconds) : '0',
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
