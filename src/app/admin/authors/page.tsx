'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AuthorProfile } from '@/lib/authors';
import { ImageUpload } from '@/components/ImageUpload';
import styles from './authors.module.css';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    email: '',
    avatar: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Load authors
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch('/api/authors');
        if (!response.ok) throw new Error('Failed to load authors');

        const data = await response.json();
        if (data.success && data.data) {
          setAuthors(data.data);
        }
      } catch (error) {
        console.error('Failed to load authors:', error);
        setMessage('加载作者失败');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const handleSubmitAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const isEditing = editingId !== null;
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing ? `/api/authors/${editingId}` : '/api/authors';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || (isEditing ? '更新失败' : '创建失败'));
      }

      const result = await response.json();
      if (result.success) {
        if (isEditing) {
          setAuthors(authors.map((a) => (a.id === editingId ? result.data : a)));
          setMessage('✓ 作者已更新');
        } else {
          setAuthors([...authors, result.data]);
          setMessage('✓ 作者创建成功');
        }
        setFormData({ name: '', bio: '', email: '', avatar: '' });
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

  const handleEditAuthor = (author: AuthorProfile) => {
    setEditingId(author.id);
    setFormData({
      name: author.name,
      bio: author.bio || '',
      email: author.email || '',
      avatar: author.avatar || '',
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({ name: '', bio: '', email: '', avatar: '' });
  };

  const handleDeleteAuthor = async (id: number) => {
    if (!confirm('确定要删除这个作者吗？')) return;

    try {
      const response = await fetch(`/api/authors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除失败');

      setAuthors(authors.filter((a) => a.id !== id));
      setMessage('✓ 作者已删除');
    } catch (error) {
      console.error('Error deleting author:', error);
      setMessage('删除作者失败');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>作者管理</h1>
        <button
          className={styles.createBtn}
          onClick={() => (editingId ? handleCancelEdit() : setShowForm(!showForm))}
        >
          {showForm ? '取消' : '➕ 创建新作者'}
        </button>
      </div>

      {message && (
        <div className={`${styles.message} ${message.includes('✓') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className={styles.formCard}>
          <h2>{editingId ? '编辑作者' : '创建新作者'}</h2>
          <form onSubmit={handleSubmitAuthor}>
            <div className={styles.formGroup}>
              <label>名字 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入作者名字"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="输入作者邮箱"
              />
            </div>

            <div className={styles.formGroup}>
              <label>简介</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="输入作者简介"
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label>头像</label>
              <ImageUpload
                uploadType="avatar"
                onUpload={(url) => setFormData({ ...formData, avatar: url })}
              />
              {formData.avatar && (
                <div className={styles.avatarPreview}>
                  <Image src={formData.avatar} alt="Avatar preview" width={96} height={96} />
                </div>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? (editingId ? '更新中...' : '创建中...') : (editingId ? '保存更改' : '创建作者')}
            </button>
          </form>
        </div>
      )}

      {/* Authors List */}
      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : (
        <div className={styles.grid}>
          {authors.map((author) => (
            <div key={author.id} className={styles.card}>
              {author.avatar && (
                <Image src={author.avatar} alt={author.name} width={96} height={96} className={styles.avatar} />
              )}
              <div className={styles.info}>
                <h3>{author.name}</h3>
                {author.email && <p className={styles.email}>{author.email}</p>}
                {author.bio && <p className={styles.bio}>{author.bio}</p>}
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEditAuthor(author)}
                >
                  ✏️ 编辑
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteAuthor(author.id)}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
