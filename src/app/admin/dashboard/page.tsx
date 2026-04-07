'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { siteConfig } from '@/lib/site-config';
import styles from './dashboard.module.css';

interface Stats {
  products: {
    total: number;
    active: number;
    inactive: number;
    avgPrice: number;
  };
  posts: {
    total: number;
    published: number;
    draft: number;
  };
  contacts: number;
}

export default function AdminDashboard() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(siteConfig.templateMode ? false : true);
  const [error, setError] = useState<string | null>(null);
  const showPlaceholderMetrics = siteConfig.templateMode;
  const placeholderStats = siteConfig.placeholderMetrics;

  useEffect(() => {
    if (showPlaceholderMetrics) {
      setStats(null);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const [productsRes, postsRes] = await Promise.all([
          fetch('/api/products/stats'),
          fetch('/api/posts/stats'),
        ]);

        if (!productsRes.ok || !postsRes.ok) {
          throw new Error('Failed to fetch stats');
        }

        const [productsData, postsData] = await Promise.all([
          productsRes.json(),
          postsRes.json(),
        ]);

        setStats({
          products: productsData.data,
          posts: postsData.data,
          contacts: 0, // TODO: Add contacts endpoint
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, showPlaceholderMetrics]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>仪表盘</h1>
        <p className={styles.subtitle}>
          {showPlaceholderMetrics
            ? `当前为 ${siteConfig.shortName} 模板演示指标`
            : `欢迎回到 ${siteConfig.shortName} 管理系统`}
        </p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {/* Products Stats */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>📦 产品管理</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.statItem}>
                  <span className={styles.label}>总产品数</span>
                  <span className={styles.value}>{showPlaceholderMetrics ? placeholderStats.products.total : stats?.products.total || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.label}>已激活</span>
                  <span className={styles.valueGreen}>{showPlaceholderMetrics ? placeholderStats.products.active : stats?.products.active || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.label}>已禁用</span>
                  <span className={styles.valueRed}>{showPlaceholderMetrics ? placeholderStats.products.inactive : stats?.products.inactive || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.label}>演示均价</span>
                  <span className={styles.value}>
                    ¥{showPlaceholderMetrics ? placeholderStats.products.avgPrice.toFixed(2) : stats?.products.avgPrice?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <Link href="/admin/products" className={styles.link}>
                  查看详情 →
                </Link>
              </div>
            </div>

            {/* Posts Stats */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>📝 博客管理</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.statItem}>
                  <span className={styles.label}>总文章数</span>
                  <span className={styles.value}>{showPlaceholderMetrics ? placeholderStats.posts.total : stats?.posts.total || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.label}>已发布</span>
                  <span className={styles.valueGreen}>{showPlaceholderMetrics ? placeholderStats.posts.published : stats?.posts.published || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.label}>草稿</span>
                  <span className={styles.valueYellow}>{showPlaceholderMetrics ? placeholderStats.posts.draft : stats?.posts.draft || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.label}>演示发布率</span>
                  <span className={styles.value}>
                    {showPlaceholderMetrics
                      ? `${((placeholderStats.posts.published / placeholderStats.posts.total) * 100).toFixed(1)}%`
                      : `${stats?.posts.total ? ((stats.posts.published / stats.posts.total) * 100).toFixed(1) : '0'}%`}
                  </span>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <Link href="/admin/posts" className={styles.link}>
                  查看详情 →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>⚡ 快速操作</h3>
              </div>
              <div className={styles.quickActions}>
                <Link href="/admin/products/new" className={styles.actionBtn}>
                  ➕ 新增产品
                </Link>
                <Link href="/admin/posts/new" className={styles.actionBtn}>
                  ✍️ 写新文章
                </Link>
                <Link href="/admin/contacts" className={styles.actionBtn}>
                  💬 查看消息
                </Link>
                <Link href="/admin/settings" className={styles.actionBtn}>
                  ⚙️ 系统设置
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.section}>
            <h2>最近活动</h2>
            <div className={styles.emptyState}>
              <p>{showPlaceholderMetrics ? '当前显示模板占位状态，无真实运营活动记录。' : '暂无最近活动记录'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
