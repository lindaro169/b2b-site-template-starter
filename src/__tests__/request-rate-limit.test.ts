import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkRequestRateLimit } from '@/lib/request-rate-limit';

describe('request rate limit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('blocks requests after the limit is exceeded within the same window', () => {
    const headers = new Headers({
      'cf-connecting-ip': '127.0.0.1',
    });

    for (let index = 0; index < 5; index += 1) {
      expect(
        checkRequestRateLimit({
          routeKey: 'test-contact-limit',
          headers,
          limit: 5,
          windowMs: 60_000,
        }).allowed
      ).toBe(true);
    }

    const blocked = checkRequestRateLimit({
      routeKey: 'test-contact-limit',
      headers,
      limit: 5,
      windowMs: 60_000,
    });

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets the window after the configured interval', () => {
    const headers = new Headers({
      'x-forwarded-for': '192.168.1.20, 10.0.0.1',
    });

    for (let index = 0; index < 5; index += 1) {
      checkRequestRateLimit({
        routeKey: 'test-inquiry-reset',
        headers,
        limit: 5,
        windowMs: 60_000,
      });
    }

    vi.advanceTimersByTime(60_001);

    const result = checkRequestRateLimit({
      routeKey: 'test-inquiry-reset',
      headers,
      limit: 5,
      windowMs: 60_000,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });
});
