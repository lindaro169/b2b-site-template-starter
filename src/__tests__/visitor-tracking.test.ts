import { describe, expect, it } from 'vitest';
import {
  buildRequestGeoInfo,
  buildTrackingSummary,
  detectTrafficSource,
  formatDuration,
} from '@/lib/visitor-tracking';

describe('visitor tracking utilities', () => {
  it('detects google ads via gclid', () => {
    const source = detectTrafficSource('https://template-site-placeholder.example/contact?gclid=test123&utm_source=google&utm_medium=cpc');

    expect(source.label).toBe('Google Ads');
    expect(source.channel).toBe('paid_search');
    expect(source.isPaid).toBe(true);
  });

  it('detects bing organic search from referrer', () => {
    const source = detectTrafficSource('https://template-site-placeholder.example/products', 'https://www.bing.com/search?q=template+collection');

    expect(source.label).toBe('Bing Search');
    expect(source.channel).toBe('organic_search');
  });

  it('formats tracking summary with attribution tags', () => {
    const summary = buildTrackingSummary(
      {
        version: 1,
        visitorId: 'visitor_1',
        sessionId: 'session_1',
        visitorType: 'returning',
        visitCount: 3,
        sessionStartedAt: '2026-03-12T08:00:00.000Z',
        lastActivityAt: '2026-03-12T08:05:01.000Z',
        totalDurationMs: 301000,
        landingPage: {
          path: '/products/silver-crystal-jewelry',
          pathWithQuery: '/products/silver-crystal-jewelry?utm_source=bing',
          label: 'Products: Silver Crystal Jewelry',
        },
        source: {
          channel: 'organic_search',
          platform: 'bing',
          label: 'Bing Search',
          matchedBy: 'referrer',
          isPaid: false,
          referrer: 'https://www.bing.com/search?q=silver+bracelet',
          referrerHost: 'bing.com',
        },
        attribution: {
          utmSource: 'bing',
          utmMedium: 'organic',
          utmCampaign: 'march-wholesale',
          utmTerm: 'silver bracelet supplier',
          utmContent: undefined,
          clickIds: {},
          customTags: {
            kw: 'silver925',
          },
          landingQuery: {
            utm_source: 'bing',
          },
        },
        pages: [
          {
            path: '/products/silver-crystal-jewelry',
            pathWithQuery: '/products/silver-crystal-jewelry',
            label: 'Products: Silver Crystal Jewelry',
            enteredAt: '2026-03-12T08:00:00.000Z',
            durationMs: 181000,
          },
          {
            path: '/contact',
            pathWithQuery: '/contact',
            label: 'Contact Us',
            enteredAt: '2026-03-12T08:03:01.000Z',
            durationMs: 120000,
          },
        ],
      },
      {
        city: 'New York',
        countryCode: 'US',
        countryName: 'United States',
      }
    );

    expect(summary.location).toBe('New York, United States');
    expect(summary.source).toBe('Bing Search');
    expect(summary.visitor).toBe('Returning visitor (#3)');
    expect(summary.totalDuration).toBe('5m 01s');
    expect(summary.tags).toContain('utm_term=silver bracelet supplier');
    expect(summary.tags).toContain('kw=silver925');
  });

  it('formats geo info from cloudflare headers and cf payload', () => {
    const headers = new Headers({
      'cf-ipcountry': 'US',
      'cf-connecting-ip': '203.0.113.12',
    });

    const geo = buildRequestGeoInfo(
      {
        city: 'New York',
        region: 'New York',
        timezone: 'America/New_York',
      },
      headers
    );

    expect(geo.countryCode).toBe('US');
    expect(geo.city).toBe('New York');
    expect(geo.ip).toBe('203.0.113.12');
  });

  it('formats short durations consistently', () => {
    expect(formatDuration(62000)).toBe('1m 02s');
  });
});
