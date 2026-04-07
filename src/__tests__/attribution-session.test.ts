import { describe, expect, it } from 'vitest';
import {
  appendAttributionCookies,
  getAttributionSnapshotFromRequest,
  recordAttributionVisit,
} from '@/lib/attribution-session';

describe('attribution session', () => {
  it('creates a server-side session from the first tracked visit', async () => {
    const request = new Request('https://template-site-placeholder.example/api/visit', {
      method: 'POST',
      headers: {
        referer:
          'https://template-site-placeholder.example/contact?utm_source=google&utm_medium=cpc&gclid=test123',
      },
    });

    const result = await recordAttributionVisit(request, null, {
      pathWithQuery: '/contact?utm_source=google&utm_medium=cpc&gclid=test123',
    });

    expect(result.snapshot?.source.label).toBe('Google Ads');
    expect(result.snapshot?.pages[0]?.pathWithQuery).toBe(
      '/contact?utm_source=google&utm_medium=cpc&gclid=test123'
    );
    expect(result.cookies).toHaveLength(2);
  });

  it('reuses session cookies to recover tracking on form submit', async () => {
    const firstVisit = await recordAttributionVisit(
      new Request('https://template-site-placeholder.example/api/visit', {
        method: 'POST',
        headers: {
          referer: 'https://template-site-placeholder.example/products?utm_source=bing&utm_medium=organic',
        },
      }),
      null,
      {
        pathWithQuery: '/products?utm_source=bing&utm_medium=organic',
      }
    );

    const cookieHeaders = new Headers();
    appendAttributionCookies(cookieHeaders, firstVisit.cookies);
    const cookieValue = firstVisit.cookies.map((item) => `${item.name}=${item.value}`).join('; ');

    const submitRequest = new Request('https://template-site-placeholder.example/api/contact', {
      method: 'POST',
      headers: {
        cookie: cookieValue,
        referer: 'https://template-site-placeholder.example/contact',
      },
    });

    const recovered = await getAttributionSnapshotFromRequest(submitRequest, null);

    expect(recovered.snapshot?.source.label).toBe('Bing Search');
    expect(recovered.snapshot?.landingPage.pathWithQuery).toBe(
      '/products?utm_source=bing&utm_medium=organic'
    );
  });
});
