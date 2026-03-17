'use client';

import { useState, useEffect } from 'react';
import { BlogCategoryProfile } from '@/lib/blogCategories';
import styles from './blog-categories.module.css';

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategoryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#667eea',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/blog-categories');
        if (!response.ok) throw new Error('Failed to load categories');

        const data = await response.json();
        if (data.success && data.data) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        setMessage('加载博客分类失败');
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
      const endpoint = isEditing ? `/api/blog-categories/${editingId}` : '/api/blog-categories';

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
        if (isEditing) {
          setCategories(categories.map((c) => (c.id === editingId ? result.data : c)));
          setMessage('✓ 博客分类已更新');
        } else {
          setCategories([...categories, result.data]);
          setMessage('✓ 博客分类创建成功');
        }
        setFormData({ name: '', slug: '', description: '', icon: '', color: '#667eea' });
        setShowForm(false);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`错误: ${(error as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = (category: BlogCategoryProfile) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#667eea',
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({ name: '', slug: '', description: '', icon: '', color: '#667eea' });
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('确定要删除这个博客分类吗?')) return;

    try {
      const response = await fetch(`/api/blog-categories/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('删除失败');
      setCategories(categories.filter((c) => c.id !== id));
      setMessage('✓ 博客分类已删除');
    } catch (error) {
      console.error('Error:', error);
      setMessage('删除博客分类失败');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>博客分类管理</h1>
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
          <h2>{editingId ? '编辑博客分类' : '创建新博客分类'}</h2>
          <form onSubmit={handleSubmitCategory}>
            <div className={styles.formGroup}>
              <label>分类名称 *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="例如:技术、产品" required />
            </div>
            <div className={styles.formGroup}>
              <label>Slug</label>
              <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="不填自动生成" />
            </div>
            <div className={styles.formGroup}>
              <label>分类描述</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="简短描述" rows={2} />
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
        <div className={styles.grid}>
          {categories.map((category) => (
            <div key={category.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.info}>
                  <h3>{category.name}</h3>
                  <p className={styles.slug}>/{category.slug}</p>
                </div>
              </div>
              {category.description && <p className={styles.description}>{category.description}</p>}
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => handleEditCategory(category)}>
                  ✏️ 编辑
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDeleteCategory(category.id)}>
                  🗑️ 删除
                </button>
              </div>
            </div>
          ))}</div>
      )}
    </div>
  );
}
