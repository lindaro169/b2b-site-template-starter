import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/site-config', () => ({
  siteConfig: {
    websiteUrl: 'https://example.com',
    placeholderLastModified: '2026-01-01T00:00:00.000Z',
  },
}));

vi.mock('@/lib/posts', () => ({
  getPosts: vi.fn().mockResolvedValue({
    success: true,
    data: [],
  }),
}));

vi.mock('@/lib/products', () => ({
  getProducts: vi.fn().mockResolvedValue({
    success: true,
    data: [],
  }),
}));

vi.mock('@/constants/categoryMapping', () => ({
  getAllCategorySlugs: vi.fn().mockReturnValue([]),
}));

describe('legal page seo signals', () => {
  it('does not expose legal pages in sitemap', async () => {
    const { default: sitemap } = await import('@/app/sitemap');

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).not.toContain('https://example.com/privacy-policy');
    expect(urls).not.toContain('https://example.com/terms-conditions');
  });

  it('keeps legal pages crawlable in robots.txt', async () => {
    const { GET } = await import('@/app/robots.txt/route');

    const response = await GET();
    const content = await response.text();

    expect(content).not.toContain('Disallow: /privacy-policy');
    expect(content).not.toContain('Disallow: /terms-conditions');
  });
});
