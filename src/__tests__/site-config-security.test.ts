import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadSiteConfig() {
  vi.resetModules();
  return (await import('@/lib/site-config')).siteConfig;
}

describe('siteConfig template security gates', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('enables local preview mode by default during development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_TEMPLATE_MODE', undefined);
    vi.stubEnv('NEXT_PUBLIC_WEBSITE', undefined);

    const siteConfig = await loadSiteConfig();

    expect(siteConfig.templateMode).toBe(true);
    expect(siteConfig.localPreviewMode).toBe(true);
  });

  it('disables template mode by default in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_TEMPLATE_MODE', undefined);
    vi.stubEnv('NEXT_PUBLIC_WEBSITE', 'https://catalog.example.com');

    const siteConfig = await loadSiteConfig();

    expect(siteConfig.templateMode).toBe(false);
    expect(siteConfig.localPreviewMode).toBe(false);
  });

  it('allows local preview overrides only for localhost-like origins', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_TEMPLATE_MODE', 'true');
    vi.stubEnv('NEXT_PUBLIC_WEBSITE', 'http://localhost:3002');

    const siteConfig = await loadSiteConfig();

    expect(siteConfig.templateMode).toBe(true);
    expect(siteConfig.localPreviewMode).toBe(true);
  });

  it('keeps unsafe local preview bypasses disabled on remote production hosts', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_TEMPLATE_MODE', 'true');
    vi.stubEnv('NEXT_PUBLIC_WEBSITE', 'https://preview.example.com');

    const siteConfig = await loadSiteConfig();

    expect(siteConfig.templateMode).toBe(true);
    expect(siteConfig.localPreviewMode).toBe(false);
  });
});
