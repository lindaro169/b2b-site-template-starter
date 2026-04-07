'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import styles from './products.module.css';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  isActive: boolean;
  imageUrl?: string;
  categoryId?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductsPage() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async (p: number = 1, q: string = '') => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((p - 1) * limit).toString(),
        ...(q && { search: q }),
      });

      const response = await fetch(`/api/products?${params}`);

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, limit]);

  useEffect(() => {
    fetchProducts(page, search);
  }, [fetchProducts, page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(1, search);
  };

  const handleDelete = async (id: number) => {
    if (!isAuthenticated) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');

      setProducts(products.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📦 产品管理</h1>
        <Link href="/admin/products/new" className={styles.newBtn}>
          ➕ 新增产品
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="搜索产品名称..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchBtn}>
          🔍 搜索
        </button>
      </form>

      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : products.length === 0 ? (
        <div className={styles.emptyState}>
          <p>暂无产品，{' '}<Link href="/admin/products/new">创建第一个产品</Link></p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>产品名称</th>
                  <th>价格</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className={styles.nameCell}>

                      {product.imageUrl && (
                        <div className="relative w-12 h-12">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className={`${styles.thumbnail} object-cover rounded`}
                          />
                        </div>
                      )}
                      <span>{product.name}</span>
                    </td>
                    <td>¥{product.price?.toFixed(2)}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${product.isActive ? styles.active : styles.inactive
                          }`}
                      >
                        {product.isActive ? '已激活' : '已禁用'}
                      </span>
                    </td>
                    <td>-</td>
                    <td className={styles.actions}>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className={styles.editBtn}
                      >
                        ✏️ 编辑
                      </Link>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteId(product.id)}
                      >
                        🗑️ 删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={styles.paginationBtn}
            >
              ← 上一页
            </button>
            <span className={styles.pageInfo}>第 {page} 页</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={products.length < limit}
              className={styles.paginationBtn}
            >
              下一页 →
            </button>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>确认删除</h3>
            <p>确定要删除这个产品吗？此操作不可撤销。</p>
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
