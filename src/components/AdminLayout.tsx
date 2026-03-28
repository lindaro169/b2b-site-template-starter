'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { siteConfig } from '@/lib/site-config';
import styles from './admin-layout.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  label: string;
  path?: string;
  icon: string;
  submenu?: Array<{ label: string; path: string }>;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>('博客管理');

  // Redirect to login if not authenticated
  // Add a small delay to avoid race condition with OAuth callback
  useEffect(() => {
    console.log('[AdminLayout] Auth check:', { isLoading, hasUser: !!user, pathname });

    if (!isLoading && !user) {
      // Wait 500ms to allow session to settle after OAuth redirect
      const timer = setTimeout(() => {
        console.log('[AdminLayout] Redirecting to login after delay');
        router.push('/login');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, user, router, pathname]);

  // Show loading state while checking auth
  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  // Redirect in progress
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push(siteConfig.templateMode ? '/admin/dashboard' : '/login');
  };

  const isActive = (path: string) => pathname === path;
  const isParentActive = (submenu?: Array<{ label: string; path: string }>) =>
    submenu?.some(item => isActive(item.path)) || false;

  const menuItems: MenuItem[] = [
    { label: '仪表盘', path: '/admin/dashboard', icon: '📊' },
    {
      label: '产品管理',
      icon: '📦',
      submenu: [
        { label: '产品列表', path: '/admin/products' },
        { label: '产品分类', path: '/admin/categories' },
        { label: '📥 批量导入', path: '/admin/products/import' },
      ],
    },
    {
      label: '博客管理',
      icon: '📝',
      submenu: [
        { label: '文章列表', path: '/admin/posts' },
        { label: '博客分类', path: '/admin/blog-categories' },
        { label: '作者管理', path: '/admin/authors' },
      ],
    },
    { label: '线索中心', path: '/admin/contacts', icon: '💬' },
    { label: '设置', path: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logo}>✨ {siteConfig.shortName}</h2>
          <button
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const hasSubmenu = !!item.submenu;
            const isItemExpanded = expandedMenu === item.label;
            const isParentItemActive = hasSubmenu && isParentActive(item.submenu);

            return (
              <div key={item.label}>
                {hasSubmenu ? (
                  <button
                    className={`${styles.navItem} ${isParentItemActive ? styles.active : ''}`}
                    onClick={() =>
                      setExpandedMenu(isItemExpanded ? null : item.label)
                    }
                    title={item.label}
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    {sidebarOpen && (
                      <>
                        <span className={styles.label}>{item.label}</span>
                        <span className={styles.chevron}>
                          {isItemExpanded ? '▼' : '▶'}
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.path!}
                    className={`${styles.navItem} ${isActive(item.path!) ? styles.active : ''}`}
                    title={item.label}
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    {sidebarOpen && <span className={styles.label}>{item.label}</span>}
                  </Link>
                )}

                {hasSubmenu && isItemExpanded && sidebarOpen && (
                  <div className={styles.submenu}>
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.path}
                        href={subitem.path}
                        className={`${styles.submenuItem} ${isActive(subitem.path) ? styles.active : ''}`}
                      >
                        <span className={styles.submenuLabel}>{subitem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          {sidebarOpen && user && (
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          )}
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Logout"
          >
            <span>🚪</span>
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div className={styles.topBarContent}>
            <h1 className={styles.pageTitle}>
              {(() => {
                for (const item of menuItems) {
                  if (item.path && isActive(item.path)) return item.label;
                  if (item.submenu) {
                    const subitem = item.submenu.find(s => isActive(s.path));
                    if (subitem) return subitem.label;
                  }
                }
                return 'Dashboard';
              })()}
            </h1>
            {user && <p className={styles.welcomeText}>欢迎, {user.name}</p>}
          </div>
        </div>

        {/* Page Content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
