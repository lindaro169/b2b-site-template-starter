'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import styles from './posts.module.css';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  published: boolean;
  published_at?: string;
  created_at?: string;
}

export default function PostsPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const response = await fetch('/api/posts');

        if (!response.ok) throw new Error('Failed to fetch posts');

        const data = await response.json();
        setPosts(data.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isAuthenticated]);

  const handleDelete = async (id: number) => {
    if (!isAuthenticated) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts(posts.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = async (id: number, published: boolean) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`/api/posts/${id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !published }),
      });

      if (!response.ok) throw new Error('Failed to update post');

      setPosts(
        posts.map((p) =>
          p.id === id ? { ...p, published: !published } : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === 'published') return post.published;
    if (filter === 'draft') return !post.published;
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📝 博客管理</h1>
        <Link href="/admin/posts/new" className={styles.newBtn}>
          ✍️ 写新文章
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Filter Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          全部文章 ({posts.length})
        </button>
        <button
          className={`${styles.tab} ${filter === 'published' ? styles.active : ''}`}
          onClick={() => setFilter('published')}
        >
          已发布 ({posts.filter((p) => p.published).length})
        </button>
        <button
          className={`${styles.tab} ${filter === 'draft' ? styles.active : ''}`}
          onClick={() => setFilter('draft')}
        >
          草稿 ({posts.filter((p) => !p.published).length})
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : filteredPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>暂无文章，{' '}<Link href="/admin/posts/new">创建第一篇文章</Link></p>
        </div>
      ) : (
        <>
          <div className={styles.postsList}>
            {filteredPosts.map((post) => (
              <div key={post.id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <h3>{post.title}</h3>
                  <span
                    className={`${styles.badge} ${
                      post.published ? styles.published : styles.draft
                    }`}
                  >
                    {post.published ? '已发布' : '草稿'}
                  </span>
                </div>

                {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

                <div className={styles.postMeta}>
                  {post.published_at && (
                    <span className={styles.date}>
                      发布于 {new Date(post.published_at).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                  {post.created_at && !post.published && (
                    <span className={styles.date}>
                      创建于 {new Date(post.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                </div>

                <div className={styles.postActions}>
                  <Link href={`/admin/posts/${post.id}`} className={styles.editBtn}>
                    ✏️ 编辑
                  </Link>
                  <button
                    className={`${styles.publishBtn} ${
                      post.published ? styles.unpublish : styles.publish
                    }`}
                    onClick={() => handlePublish(post.id, post.published)}
                  >
                    {post.published ? '取消发布' : '发布'}
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setDeleteId(post.id)}
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>确认删除</h3>
            <p>确定要删除这篇文章吗？此操作不可撤销。</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                取消
              </button>
              <button
                className={styles.confirmBtn}
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
