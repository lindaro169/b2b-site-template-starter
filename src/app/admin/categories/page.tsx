'use client';

import { useState, useEffect } from 'react';
import { CategoryProfile, CategoryTree } from '@/lib/categories';
import styles from './categories.module.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: null as number | null,
  });
  const [allCategories, setAllCategories] = useState<CategoryProfile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch both tree structure and all categories
        const [treeResponse, allResponse] = await Promise.all([
          fetch('/api/categories/tree'),
          fetch('/api/categories'),
        ]);

        if (!treeResponse.ok || !allResponse.ok) {
          throw new Error('Failed to load categories');
        }

        const treeData = await treeResponse.json();
        const allData = await allResponse.json();

        if (treeData.success && treeData.data) {
          setCategories(treeData.data);
        }
        if (allData.success && allData.data) {
          setAllCategories(allData.data);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        setMessage('加载分类失败');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const isEditing = editingId !== null;
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing ? `/api/categories/${editingId}` : '/api/categories';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || (isEditing ? '更新失败' : '创建失败'));
      }

      const result = await response.json();
      if (result.success) {
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`错误: ${(error as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = (category: CategoryProfile) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId || null,
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: null,
    });
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('确定要删除这个分类吗?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('删除失败');
      window.location.reload();
      setMessage('✓ 分类已删除');
    } catch (error) {
      console.error('Error:', error);
      setMessage('删除分类失败');
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  // Recursively render tree nodes
  const renderTreeNode = (node: CategoryTree, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div className={styles.treeNode} style={{ marginLeft: `${level * 20}px` }}>
          {hasChildren && (
            <button
              className={styles.expandBtn}
              onClick={() => toggleExpand(node.id)}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className={styles.spacer}></span>}

          <div className={styles.nodeContent}>
            <div className={styles.nodeInfo}>
              <h3>{node.name}</h3>
              <p>{node.slug}</p>
            </div>
          </div>

          <div className={styles.nodeActions}>
            <button
              className={styles.editBtn}
              onClick={() => handleEditCategory(node)}
            >
              ✏️
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => handleDeleteCategory(node.id)}
            >
              🗑️
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className={styles.treeChildren}>
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>产品分类管理</h1>
        <button className={styles.createBtn} onClick={() => (editingId ? handleCancelEdit() : setShowForm(!showForm))}>
          {showForm ? '取消' : '➕ 创建新分类'}
        </button>
      </div>

      {message && (
        <div className={`${styles.message} ${message.includes('✓') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className={styles.formCard}>
          <h2>{editingId ? '编辑分类' : '创建新分类'}</h2>
          <form onSubmit={handleSubmitCategory}>
            <div className={styles.formGroup}>
              <label>分类名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="例如:晶体、珠宝"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="英文标识，例如:crystal"
              />
            </div>

            <div className={styles.formGroup}>
              <label>分类描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="简短描述"
                rows={2}
              />
            </div>

            <div className={styles.formGroup}>
              <label>父分类（留空为顶级分类）</label>
              <select
                value={formData.parentId || ''}
                onChange={(e) => setFormData({...formData, parentId: e.target.value ? parseInt(e.target.value) : null})}
              >
                <option value="">-- 顶级分类 --</option>
                {allCategories.filter(c => c.id !== editingId).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? (editingId ? '更新中...' : '创建中...') : (editingId ? '保存更改' : '创建分类')}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : (
        <div className={styles.treeContainer}>
          {categories.length > 0 ? (
            categories.map((category) => renderTreeNode(category))
          ) : (
            <p className={styles.emptyState}>暂无分类</p>
          )}
        </div>
      )}
    </div>
  );
}
