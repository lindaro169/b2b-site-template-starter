'use client';

import { useEffect, useState } from 'react';
import styles from './settings.module.css';

interface EmailSettings {
  contactEmail: string;
  adminEmail: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>({
    contactEmail: '',
    adminEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storage, setStorage] = useState<'d1' | 'template-memory' | 'fallback'>('fallback');

  const handleChange = <K extends keyof EmailSettings>(field: K, value: EmailSettings[K]) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSavedMessage(null);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        cache: 'no-store',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '获取设置失败');
      }

      setSettings(result.data);
      setStorage(result.storage || 'fallback');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取设置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const storageLabel = {
    d1: 'D1',
    'template-memory': '模板内存',
    fallback: '环境变量兜底',
  }[storage];

  const helperText = {
    d1: '当前保存到 D1 global_config，contact / inquiry 通知会优先读取这里的联系邮箱。',
    'template-memory': '当前没有 D1 绑定，模板模式下会先写入本进程 mock store，方便本地预览。',
    fallback: '当前未检测到可写存储，仅能使用环境变量或站点默认值。',
  }[storage];

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || '保存设置失败');
      }

      setSettings(result.data);
      setStorage(result.storage || 'fallback');
      setSavedMessage('邮箱设置已保存');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存设置失败');
      setSavedMessage(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>设置</h1>
        <p>这里只持久化通知邮箱配置，其他模板项请在正式项目里按需扩展。</p>
      </div>

      {savedMessage && <div className={styles.success}>✓ {savedMessage}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>邮件设置</h2>
          <p>当前存储位置：{storageLabel}</p>
          <p>{helperText}</p>

          <div className={styles.formGroup}>
            <label htmlFor="contactEmail">联系邮箱</label>
            <input
              id="contactEmail"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              disabled={loading || saving}
              placeholder="输入联系邮箱地址"
            />
            <small>Contact / Inquiry 通知优先发送到这里。</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="adminEmail">管理员邮箱</label>
            <input
              id="adminEmail"
              type="email"
              value={settings.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              disabled={loading || saving}
              placeholder="输入管理员邮箱地址"
            />
            <small>Better Auth 管理员白名单优先读取这里。</small>
          </div>
        </section>

        <section className={styles.section}>
          <h2>说明</h2>
          <p>如果存在 D1 绑定，本页会写入 `global_config`。</p>
          <p>如果当前是纯本地模板预览且没有 D1，本页会退回模板内存存储，方便你直接演示后台流程。</p>
          <p>`SALES_NOTIFICATION_EMAIL` 与 `ADMIN_EMAIL` 仍可作为默认值和兜底值存在。</p>
        </section>

        <div className={styles.actions}>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={loading || saving}
          >
            {loading ? '加载中...' : saving ? '保存中...' : '保存邮箱设置'}
          </button>
        </div>
      </div>
    </div>
  );
}
