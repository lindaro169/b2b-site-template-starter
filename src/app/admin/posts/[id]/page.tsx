'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useForm } from '@/lib/hooks';
import { RichEditor, EditorPreview } from '@/components/RichEditor';
import { ImageUpload } from '@/components/ImageUpload';
import { AuthorProfile } from '@/lib/authors';
import { BlogCategoryProfile } from '@/lib/blogCategories';
import styles from './post-editor.module.css';

export interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  published: boolean;
  categoryId?: number;   // ✅ 分类外键
  authorId?: number;    // ✅ 作者外键
  tags?: string[];
  readTime?: number;
}

const validatePostForm = (data: PostFormData) => {
  const errors: Record<string, string> = {};

  const { title, slug, content } = data;
  if (!title || title.trim().length === 0) {
    errors.title = '文章标题不能为空';
  }

  if (!slug || slug.trim().length === 0) {
    errors.slug = '文章 slug 不能为空';
  }

  if (!content || content.trim().length === 0) {
    errors.content = '文章内容不能为空';
  }

  return errors;
};

export default function PostEditor() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(!!params?.id);
  const [showPreview, setShowPreview] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [authorId, setAuthorId] = useState<number | null>(null);  // ✅ 改为 authorId
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);  // ✅ 博客分类 ID
  const [blogCategories, setBlogCategories] = useState<BlogCategoryProfile[]>([]);  // ✅ 博客分类列表
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [readTime, setReadTime] = useState(0);

  const postId = params?.id as string;

  const {
    formData,
    errors,
    isSubmitting,
    submitError,
    submitSuccess,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useForm<PostFormData>({
    onSubmit: async (data) => {
      if (!isAuthenticated) throw new Error('未登录');

      const method = postId ? 'PUT' : 'POST';
      const url = postId ? `/api/posts/${postId}` : '/api/posts';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || '',
          content: data.content,
          featuredImage: imageUrl || data.featuredImage,
          published: data.published || false,
          categoryId: categoryId || undefined,  // ✅ 使用 categoryId（博客分类）
          authorId: authorId || undefined,  // ✅ 使用 authorId
          tags: tags.length > 0 ? tags : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '保存失败');
      }

      // Redirect back to posts list
      router.push('/admin/posts');
    },
    validate: validatePostForm,
  });

  // Load authors list
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
      }
    };

    fetchAuthors();
  }, []);

  // Load blog categories list
  useEffect(() => {
    const fetchBlogCategories = async () => {
      try {
        const response = await fetch('/api/blog-categories');
        if (!response.ok) throw new Error('Failed to load blog categories');

        const data = await response.json();
        if (data.success && data.data) {
          setBlogCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to load blog categories:', error);
      }
    };

    fetchBlogCategories();
  }, []);

  // Load post if editing
  useEffect(() => {
    if (!postId || !isAuthenticated) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);

        if (!response.ok) throw new Error('Failed to load post');

        const data = await response.json();
        const post = data.data;

        setFieldValue('title', post.title);
        setFieldValue('slug', post.slug);
        setFieldValue('excerpt', post.excerpt || '');
        setFieldValue('content', post.content || '');
        setFieldValue('published', post.published || false);
        setFieldValue('category', post.category || '');
        setImageUrl(post.featuredImage || post.featured_image || '');

        // ✅ Load author ID instead of author object
        if (post.authorId) {
          setAuthorId(post.authorId);
        }

        // ✅ Load blog category ID
        if (post.categoryId) {
          setCategoryId(post.categoryId);
        }

        // Load tags
        if (post.tags && Array.isArray(post.tags)) {
          setTags(post.tags);
        }

        // Set readTime (auto-calculated, display only)
        if (post.readTime) {
          setReadTime(post.readTime);
        }
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, isAuthenticated, setFieldValue]);

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{postId ? '编辑文章' : '新建文章'}</h1>
        <div className={styles.headerActions}>
          <button
            className={`${styles.previewToggle} ${showPreview ? styles.active : ''}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '隐藏预览' : '显示预览'}
          </button>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← 返回
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {submitError && <div className={styles.error}>{submitError}</div>}
          {submitSuccess && (
            <div className={styles.success}>文章已保存成功！</div>
          )}

          <div className={styles.editorLayout}>
            {/* Main Content */}
            <div className={styles.mainContent}>
              {/* Title */}
              <div className={styles.formGroup}>
                <label htmlFor="title">文章标题 *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title || ''}
                  onChange={handleChange}
                  placeholder="输入文章标题"
                  className={errors.title ? styles.inputError : ''}
                />
                {errors.title && (
                  <span className={styles.errorText}>{errors.title}</span>
                )}
              </div>

              {/* Slug */}
              <div className={styles.formGroup}>
                <label htmlFor="slug">文章 Slug *</label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={formData.slug || ''}
                  onChange={handleChange}
                  placeholder="URL 友好的标识 (URL safe)"
                  className={errors.slug ? styles.inputError : ''}
                />
                {errors.slug && (
                  <span className={styles.errorText}>{errors.slug}</span>
                )}
                <small className={styles.hint}>
                  示例: my-first-article
                </small>
              </div>

              {/* Excerpt */}
              <div className={styles.formGroup}>
                <label htmlFor="excerpt">文章摘要</label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt || ''}
                  onChange={handleChange}
                  placeholder="输入文章摘要 (显示在列表页)"
                  rows={3}
                  className={styles.textarea}
                />
                <small className={styles.hint}>
                  字数: {(formData.excerpt || '').length}/200
                </small>
              </div>

              {/* Rich Editor */}
              <div className={styles.formGroup}>
                <label htmlFor="content">文章内容 *</label>
                <RichEditor
                  value={formData.content || ''}
                  onChange={(content) => setFieldValue('content', content)}
                  placeholder="开始写文章..."
                  onImageInsert={handleImageUpload}
                />
                {errors.content && (
                  <span className={styles.errorText}>{errors.content}</span>
                )}
              </div>

              {/* Form Actions */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.draftBtn}
                  onClick={() => {
                    setFieldValue('published', false);
                    setTimeout(() => handleSubmit({ preventDefault() {} } as unknown as React.FormEvent), 0);
                  }}
                  disabled={isSubmitting}
                >
                  💾 保存草稿
                </button>
                <button
                  type="button"
                  className={styles.publishBtn}
                  onClick={() => {
                    setFieldValue('published', true);
                    setTimeout(() => handleSubmit({ preventDefault() {} } as unknown as React.FormEvent), 0);
                  }}
                  disabled={isSubmitting}
                >
                  📤 发布文章
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  ← 返回
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              {/* Blog Category */}
              <div className={styles.sidebarSection}>
                <h3>分类设置</h3>
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                  className={styles.formGroupInput}
                >
                  <option value="">-- 请选择分类 --</option>
                  {blogCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoryId && blogCategories.find((c) => c.id === categoryId) && (
                  <div className={styles.infoItem} style={{ marginTop: '12px' }}>
                    <div>
                      <strong>{blogCategories.find((c) => c.id === categoryId)?.name}</strong>
                      <br />
                      <small>{blogCategories.find((c) => c.id === categoryId)?.description}</small>
                    </div>
                  </div>
                )}
              </div>

              {/* Featured Image */}
              <div className={styles.sidebarSection}>
                <h3>特色图片</h3>
                <ImageUpload
                  uploadType="blog"
                  resourceId={postId}
                  onUpload={handleImageUpload}
                />
                {imageUrl && (
                  <div className={styles.currentImage}>
                    <Image src={imageUrl} alt="Featured" width={360} height={240} />
                  </div>
                )}
              </div>

              {/* Publish Settings */}
              <div className={styles.sidebarSection}>
                <h3>发布设置</h3>
                <label className={styles.checkboxLabel}>
                  <input
                    name="published"
                    type="checkbox"
                    checked={formData.published || false}
                    onChange={handleChange}
                  />
                  <span>发布此文章</span>
                </label>
                <small className={styles.hint}>
                  {formData.published ? '✓ 已发布' : '○ 仅保存为草稿'}
                </small>
              </div>

              {/* Author Selection */}
              <div className={styles.sidebarSection}>
                <h3>作者选择</h3>
                <div className={styles.formGroup}>
                  <label>选择作者</label>
                  <select
                    value={authorId || ''}
                    onChange={(e) => setAuthorId(e.target.value ? Number(e.target.value) : null)}
                    className={styles.formGroupInput}
                  >
                    <option value="">-- 请选择作者 --</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                  <small className={styles.hint}>
                    从现有作者中选择
                  </small>
                </div>
                {authorId && authors.find((a) => a.id === authorId) && (
                  <div className={styles.infoItem}>
                    <div>
                      <strong>{authors.find((a) => a.id === authorId)?.name}</strong>
                      <br />
                      <small>{authors.find((a) => a.id === authorId)?.bio}</small>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Management */}
              <div className={styles.sidebarSection}>
                <h3>标签</h3>
                {tags.length > 0 && (
                  <div className={styles.tagList}>
                    {tags.map((tag, index) => (
                      <div key={index} className={styles.tag}>
                        <span>{tag}</span>
                        <button
                          type="button"
                          className={styles.tagRemoveBtn}
                          onClick={() => setTags(tags.filter((_, i) => i !== index))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.tagInputGroup}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newTag.trim() && !tags.includes(newTag.trim())) {
                          setTags([...tags, newTag.trim()]);
                          setNewTag('');
                        }
                      }
                    }}
                    placeholder="输入标签并按 Enter"
                    className={styles.tagInput}
                  />
                  <button
                    type="button"
                    className={styles.addTagBtn}
                    onClick={() => {
                      if (newTag.trim() && !tags.includes(newTag.trim())) {
                        setTags([...tags, newTag.trim()]);
                        setNewTag('');
                      }
                    }}
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* Reading Time Info */}
              {readTime > 0 && (
                <div className={styles.sidebarSection}>
                  <h3>文章信息</h3>
                  <div className={styles.infoItem}>
                    <span>📖 阅读时间: </span>
                    <strong>{readTime} 分钟</strong>
                  </div>
                  <small className={styles.hint}>
                    自动根据内容字数计算（200 字/分钟）
                  </small>
                </div>
              )}

              {/* Article Info */}
              {showPreview && (
                <div className={styles.sidebarSection}>
                  <h3>文章预览</h3>
                  <div className={styles.previewCard}>
                    {formData.title && (
                      <h4 className={styles.previewTitle}>
                        {formData.title}
                      </h4>
                    )}
                    {formData.excerpt && (
                      <p className={styles.previewExcerpt}>
                        {formData.excerpt}
                      </p>
                    )}
                    <div className={styles.previewMeta}>
                      <span>📊 {(formData.content || '').replace(/<[^>]*>/g, '').length} 字</span>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className={styles.previewPanel}>
              <h2>内容预览</h2>
              <div className={styles.previewContent}>
                <EditorPreview content={formData.content || ''} />
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
