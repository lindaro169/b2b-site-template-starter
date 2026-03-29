import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadGlobalConfig() {
  vi.resetModules();
  return import('@/lib/global-config');
}

describe('global config email rules', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('reads contactEmail from notification env fallback', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SALES_NOTIFICATION_EMAIL', 'sales@example.com');

    const { getEmailSettings } = await loadGlobalConfig();
    const settings = await getEmailSettings();

    expect(settings).toEqual({
      contactEmail: 'sales@example.com',
    });
  });

  it('reads admin email from ADMIN_EMAIL', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com');

    const { getAdminEmail } = await loadGlobalConfig();

    expect(getAdminEmail()).toBe('admin@example.com');
  });

  it('throws when admin email is missing outside local preview mode', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_TEMPLATE_MODE', 'false');
    vi.stubEnv('ADMIN_EMAIL', '');

    const { getAdminEmail } = await loadGlobalConfig();

    expect(() => getAdminEmail()).toThrow('ADMIN_EMAIL 未配置');
  });

  it('throws when admin email is missing in local preview mode', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_TEMPLATE_MODE', 'true');
    vi.stubEnv('ADMIN_EMAIL', '');

    const { getAdminEmail } = await loadGlobalConfig();

    expect(() => getAdminEmail()).toThrow('ADMIN_EMAIL 未配置');
  });
});
