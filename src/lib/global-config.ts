import type { D1Database, D1Result } from '@/lib/d1-db';
import { siteConfig } from '@/lib/site-config';

export const GLOBAL_CONFIG_KEYS = {
  contactEmail: 'contact_email',
  adminEmail: 'admin_email',
} as const;

export interface EmailSettings {
  contactEmail: string;
  adminEmail: string;
}

type GlobalConfigRow = {
  value?: string | null;
};

const globalForTemplateConfig = globalThis as typeof globalThis & {
  __templateGlobalConfigStore?: Map<string, string>;
};

function getTemplateGlobalConfigStore(): Map<string, string> {
  if (!globalForTemplateConfig.__templateGlobalConfigStore) {
    globalForTemplateConfig.__templateGlobalConfigStore = new Map<string, string>([
      [GLOBAL_CONFIG_KEYS.contactEmail, siteConfig.contactEmail],
      [GLOBAL_CONFIG_KEYS.adminEmail, siteConfig.adminEmail],
    ]);
  }

  return globalForTemplateConfig.__templateGlobalConfigStore;
}

function normalizeStoredValue(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

async function readGlobalConfigValueFromDb(
  db: D1Database,
  key: string
): Promise<string | undefined> {
  const result = await db
    .prepare('SELECT value FROM global_config WHERE key = ? LIMIT 1')
    .bind(key)
    .all<GlobalConfigRow>();

  if (!result.success) {
    throw new Error(`读取 global_config 失败: ${key}`);
  }

  return normalizeStoredValue(result.results?.[0]?.value);
}

async function writeGlobalConfigValueToDb(
  db: D1Database,
  key: string,
  value: string,
  description?: string
): Promise<void> {
  const result = (await db
    .prepare(
      `
        INSERT INTO global_config (key, value, description, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          description = excluded.description,
          updated_at = CURRENT_TIMESTAMP
      `
    )
    .bind(key, value, description || null)
    .run()) as D1Result;

  if (!result.success) {
    throw new Error(`写入 global_config 失败: ${key}`);
  }
}

export async function getGlobalConfigValue(
  db: D1Database | undefined,
  key: string
): Promise<string | undefined> {
  if (db) {
    return readGlobalConfigValueFromDb(db, key);
  }

  if (siteConfig.templateMode) {
    return normalizeStoredValue(getTemplateGlobalConfigStore().get(key));
  }

  return undefined;
}

export async function setGlobalConfigValue(
  db: D1Database | undefined,
  key: string,
  value: string,
  description?: string
): Promise<void> {
  const normalized = value.trim();

  if (db) {
    await writeGlobalConfigValueToDb(db, key, normalized, description);
    return;
  }

  if (siteConfig.templateMode) {
    getTemplateGlobalConfigStore().set(key, normalized);
    return;
  }

  throw new Error('数据库连接不可用，无法保存配置');
}

export async function getEmailSettings(
  db?: D1Database
): Promise<EmailSettings> {
  const [savedContactEmail, savedAdminEmail] = await Promise.all([
    getGlobalConfigValue(db, GLOBAL_CONFIG_KEYS.contactEmail),
    getGlobalConfigValue(db, GLOBAL_CONFIG_KEYS.adminEmail),
  ]);

  return {
    contactEmail:
      savedContactEmail ||
      process.env.SALES_NOTIFICATION_EMAIL ||
      process.env.ADMIN_EMAIL ||
      siteConfig.contactEmail,
    adminEmail:
      savedAdminEmail ||
      process.env.ADMIN_EMAIL ||
      process.env.SALES_NOTIFICATION_EMAIL ||
      siteConfig.adminEmail,
  };
}

export async function saveEmailSettings(
  input: EmailSettings,
  db?: D1Database
): Promise<EmailSettings> {
  const nextSettings: EmailSettings = {
    contactEmail: input.contactEmail.trim(),
    adminEmail: input.adminEmail.trim(),
  };

  await Promise.all([
    setGlobalConfigValue(
      db,
      GLOBAL_CONFIG_KEYS.contactEmail,
      nextSettings.contactEmail,
      '后台联系邮箱，contact/inquiry 通知优先读取此值'
    ),
    setGlobalConfigValue(
      db,
      GLOBAL_CONFIG_KEYS.adminEmail,
      nextSettings.adminEmail,
      '后台管理员邮箱，Better Auth 白名单优先读取此值'
    ),
  ]);

  return nextSettings;
}

export function getEmailSettingsStorageLabel(db?: D1Database): 'd1' | 'template-memory' | 'fallback' {
  if (db) {
    return 'd1';
  }

  if (siteConfig.templateMode) {
    return 'template-memory';
  }

  return 'fallback';
}
