'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { siteConfig } from '@/lib/site-config';
import styles from './settings.module.css';

interface AdminSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  adminEmail: string;
  postsPerPage: number;
  productsPerPage: number;
  maintenanceMode: boolean;
  enableComments: boolean;
  autoBackup: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AdminSettings>({
    siteName: siteConfig.brandName,
    siteDescription: siteConfig.companyDescription,
    contactEmail: siteConfig.contactEmail,
    adminEmail: siteConfig.adminEmail,
    postsPerPage: 10,
    productsPerPage: 20,
    maintenanceMode: false,
    enableComments: true,
    autoBackup: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = <K extends keyof AdminSettings>(field: K, value: AdminSettings[K]) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    // In production, save to API
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>设置</h1>
        <p>管理系统配置和偏好设置</p>
      </div>

      {saved && <div className={styles.success}>✓ 设置已保存</div>}

      <div className={styles.content}>
        {/* General Settings */}
        <section className={styles.section}>
          <h2>常规设置</h2>

          <div className={styles.formGroup}>
            <label htmlFor="siteName">网站名称</label>
            <input
              id="siteName"
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              placeholder="输入网站名称"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="siteDescription">网站描述</label>
            <textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              placeholder="输入网站描述"
              rows={3}
            />
          </div>
        </section>

        {/* Email Settings */}
        <section className={styles.section}>
          <h2>邮件设置</h2>

          <div className={styles.formGroup}>
            <label htmlFor="contactEmail">联系邮箱</label>
            <input
              id="contactEmail"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder="输入联系邮箱地址"
            />
            <small>用于接收表单提交的邮箱</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="adminEmail">管理员邮箱</label>
            <input
              id="adminEmail"
              type="email"
              value={settings.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              placeholder="输入管理员邮箱地址"
            />
            <small>用于系统通知的邮箱</small>
          </div>
        </section>

        {/* Display Settings */}
        <section className={styles.section}>
          <h2>显示设置</h2>

          <div className={styles.formGroup}>
            <label htmlFor="postsPerPage">每页博客数</label>
            <input
              id="postsPerPage"
              type="number"
              value={settings.postsPerPage}
              onChange={(e) => handleChange('postsPerPage', parseInt(e.target.value))}
              min="1"
              max="100"
            />
            <small>博客列表每页显示的文章数</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="productsPerPage">每页产品数</label>
            <input
              id="productsPerPage"
              type="number"
              value={settings.productsPerPage}
              onChange={(e) => handleChange('productsPerPage', parseInt(e.target.value))}
              min="1"
              max="100"
            />
            <small>产品列表每页显示的产品数</small>
          </div>
        </section>

        {/* Features Settings */}
        <section className={styles.section}>
          <h2>功能设置</h2>

          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              />
              <span>维护模式</span>
            </label>
            <small>启用后,普通用户将看到维护页面</small>
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={settings.enableComments}
                onChange={(e) => handleChange('enableComments', e.target.checked)}
              />
              <span>启用博客评论</span>
            </label>
            <small>允许用户在博客文章下评论</small>
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => handleChange('autoBackup', e.target.checked)}
              />
              <span>自动备份</span>
            </label>
            <small>每天自动备份数据库</small>
          </div>
        </section>

        {/* User Settings */}
        <section className={styles.section}>
          <h2>当前用户</h2>
          <div className={styles.userInfo}>
            <p><strong>邮箱:</strong> {user?.email || '未登录'}</p>
            <p><strong>用户名:</strong> {user?.name || '暂无'}</p>
            <p><strong>角色:</strong> 管理员</p>
          </div>
        </section>

        {/* Save Button */}
        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
