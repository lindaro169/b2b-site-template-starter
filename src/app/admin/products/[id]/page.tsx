'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useForm } from '@/lib/hooks';
import { ImageUpload } from '@/components/ImageUpload';
import styles from './product-form.module.css';

export interface ProductFormData {
  // 基础字段
  name: string;
  slug: string;
  sku?: string;
  categoryId: number;
  isActive: boolean;

  // 描述字段（分离）
  excerpt?: string;
  description?: string;

  // 价格和货币
  price?: number;
  priceCurrency?: string;

  // 图片
  imageUrl?: string;
  gallery?: Array<{
    url: string;
    alt: string;
    displayOrder?: number;
  }>;

  // B2B 相关信息
  moq?: number;
  leadTime?: string;

  // 产品详情
  material?: string;
  certifications?: string[];
  customizationOptions?: string[];
  tags?: string[];
}

// MediaItem type removed (not used in current UI handlers)

const validateProductForm = (data: ProductFormData) => {
  const errors: Record<string, string> = {};

  const { name, slug, price } = data;
  if (!name || name.trim().length === 0) {
    errors.name = '产品名称不能为空';
  }

  if (!slug || slug.trim().length === 0) {
    errors.slug = '产品 slug 不能为空';
  }

  // 价格是可选的(B2B 模式),如果提供则必须大于 0
  if (price !== undefined && price !== null && Number(price) <= 0) {
    errors.price = '产品价格必须大于 0';
  }

  return errors;
};

export default function ProductForm() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(!!params?.id);
  const [imageUrl, setImageUrl] = useState('');

  // 新增数组字段的状态
  const [galleryItems, setGalleryItems] = useState<Array<{ url: string; alt: string; displayOrder?: number }>>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [customizationOptions, setCustomizationOptions] = useState<string[]>([]);

  // 分类列表从 API 获取
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string; parentId?: number | null }>>([]);

  const productId = params?.id as string;

  const {
    formData,
    errors,
    isSubmitting,
    submitError,
    submitSuccess,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useForm<ProductFormData>({
    onSubmit: async (data) => {
      if (!isAuthenticated) throw new Error('未登录');

      const method = productId ? 'PUT' : 'POST';
      const url = productId
        ? `/api/products/${productId}`
        : '/api/products';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // 基础字段
          name: data.name,
          slug: data.slug,
          sku: data.sku || undefined,
          categoryId: data.categoryId ? parseInt(String(data.categoryId), 10) : undefined,
          isActive: data.isActive || true,

          // 描述字段
          excerpt: data.excerpt || undefined,
          description: data.description || undefined,

          // 价格和货币
          price: data.price ? parseFloat(String(data.price)) : undefined,
          priceCurrency: data.priceCurrency || undefined,

          // 图片
          imageUrl: imageUrl || data.imageUrl || undefined,
          gallery: galleryItems && galleryItems.length > 0 ? galleryItems : undefined,

          // B2B 相关信息
          moq: data.moq ? parseInt(String(data.moq), 10) : undefined,
          leadTime: data.leadTime || undefined,

          // 产品详情
          material: data.material || undefined,
          certifications: certifications && certifications.length > 0 ? certifications : undefined,
          customizationOptions: customizationOptions && customizationOptions.length > 0 ? customizationOptions : undefined,
          tags: tags && tags.length > 0 ? tags : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '保存失败');
      }

      // Redirect back to products list
      router.push('/admin/products');
    },
    validate: validateProductForm,
  });

  // Load product if editing
  useEffect(() => {
    if (!productId || !isAuthenticated) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) throw new Error('Failed to load product');

        const data = await response.json();
        const product = data.data;

        // 基础字段
        setFieldValue('name', product.name);
        setFieldValue('slug', product.slug);
        setFieldValue('sku', product.sku || '');
        setFieldValue('categoryId', product.categoryId || '');
        setFieldValue('isActive', product.isActive);

        // 描述字段
        setFieldValue('excerpt', product.excerpt || '');
        setFieldValue('description', product.description || '');

        // 价格和货币
        setFieldValue('price', product.price || '');
        setFieldValue('priceCurrency', product.priceCurrency || '');

        // 图片
        setImageUrl(product.imageUrl || '');
        if (product.gallery && Array.isArray(product.gallery)) {
          setGalleryItems(product.gallery);
        }

        // B2B 相关信息
        setFieldValue('moq', product.moq || '');
        setFieldValue('leadTime', product.leadTime || '');

        // 产品详情
        setFieldValue('material', product.material || '');
        if (product.certifications && Array.isArray(product.certifications)) {
          setCertifications(product.certifications);
        }
        if (product.customizationOptions && Array.isArray(product.customizationOptions)) {
          setCustomizationOptions(product.customizationOptions);
        }
        if (product.tags && Array.isArray(product.tags)) {
          setTags(product.tags);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isAuthenticated, setFieldValue]);

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setCategories(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  // mediaItems management removed (not used in current UI)

  // 数组字段处理函数
  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const addCertification = (cert: string) => {
    if (cert.trim() && !certifications.includes(cert.trim())) {
      setCertifications([...certifications, cert.trim()]);
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addCustomizationOption = (option: string) => {
    if (option.trim() && !customizationOptions.includes(option.trim())) {
      setCustomizationOptions([...customizationOptions, option.trim()]);
    }
  };

  const removeCustomizationOption = (index: number) => {
    setCustomizationOptions(customizationOptions.filter((_, i) => i !== index));
  };

  const addGalleryItem = (url: string, alt: string = '') => {
    if (url.trim()) {
      const newItem = {
        url: url.trim(),
        alt: alt.trim() || '产品图片',
        displayOrder: galleryItems.length,
      };
      setGalleryItems([...galleryItems, newItem]);
    }
  };

  const removeGalleryItem = (index: number) => {
    const filtered = galleryItems.filter((_, i) => i !== index);
    // 更新displayOrder
    const updated = filtered.map((item, idx) => ({
      ...item,
      displayOrder: idx,
    }));
    setGalleryItems(updated);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{productId ? '编辑产品' : '新增产品'}</h1>
        <button className={styles.backBtn} onClick={() => router.back()}>
          ← 返回
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {submitError && <div className={styles.error}>{submitError}</div>}
          {submitSuccess && (
            <div className={styles.success}>产品已保存成功！</div>
          )}

          {/* ========== 1. 基础信息 ========== */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>基础信息</h2>
            <div className={styles.twoColumn}>
              <div className={styles.column}>
                {/* Product Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="name">产品名称 *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="输入产品名称"
                    className={errors.name ? styles.inputError : ''}
                  />
                  {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                {/* Product Slug */}
                <div className={styles.formGroup}>
                  <label htmlFor="slug">产品 Slug *</label>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={formData.slug || ''}
                    onChange={handleChange}
                    placeholder="产品唯一标识 (小写字母、数字、连字符)"
                    className={errors.slug ? styles.inputError : ''}
                  />
                  {errors.slug && <span className={styles.errorText}>{errors.slug}</span>}
                </div>

                {/* SKU */}
                <div className={styles.formGroup}>
                  <label htmlFor="sku">SKU</label>
                  <input
                    id="sku"
                    name="sku"
                    type="text"
                    value={formData.sku || ''}
                    onChange={handleChange}
                    placeholder="输入产品 SKU 编码 (例如：SKU-001)"
                    maxLength={100}
                  />
                  <small>产品唯一编码，用于库存和订单管理</small>
                </div>
              </div>

              <div className={styles.column}>
                {/* Category */}
                <div className={styles.formGroup}>
                  <label htmlFor="categoryId">分类</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId !== undefined ? String(formData.categoryId) : ''}
                    onChange={handleChange}
                  >
                    <option value="">-- 请选择分类 --</option>
                    {/* 构建层级分类显示：父类 → 子类 */}
                    {(() => {
                      // 找到所有顶级分类
                      const parentCategories = categories.filter(c => !c.parentId);
                      const options: React.ReactElement[] = [];

                      parentCategories.forEach(parent => {
                        // 添加父分类
                        options.push(
                          <option key={parent.id} value={parent.id} style={{ fontWeight: 'bold' }}>
                            {parent.name}
                          </option>
                        );
                        // 找到该父分类下的子分类
                        const children = categories.filter(c => c.parentId === parent.id);
                        children.forEach(child => {
                          options.push(
                            <option key={child.id} value={child.id}>
                              &nbsp;&nbsp;→ {child.name}
                            </option>
                          );
                        });
                      });

                      // 添加没有父分类且自身也不是父分类的孤立分类
                      const orphans = categories.filter(c =>
                        c.parentId && !categories.some(p => p.id === c.parentId)
                      );
                      orphans.forEach(orphan => {
                        options.push(
                          <option key={orphan.id} value={orphan.id}>
                            {orphan.name}
                          </option>
                        );
                      });

                      return options;
                    })()}
                  </select>
                </div>

                {/* Status */}
                <div className={styles.formGroup}>
                  <label htmlFor="isActive">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive || false}
                      onChange={handleChange}
                    />
                    <span>激活此产品</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 2. 描述信息 ========== */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>描述信息</h2>
            <div className={styles.formGroup}>
              <label htmlFor="excerpt">产品摘要 (简短描述)</label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt || ''}
                onChange={handleChange}
                placeholder="输入产品摘要（简短描述，用于列表页显示）"
                rows={3}
                className={styles.textarea}
              />
              <small>简短描述用于产品列表页面显示</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">产品描述 (详细描述)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="输入产品详细描述"
                rows={6}
                className={styles.textarea}
              />
              <small>详细描述用于产品详情页显示</small>
            </div>
          </div>

          {/* ========== 3. 价格信息 ========== */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>价格信息</h2>
            <div className={styles.twoColumn}>
              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label htmlFor="price">价格</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || ''}
                    onChange={handleChange}
                    placeholder="输入产品价格"
                    className={errors.price ? styles.inputError : ''}
                  />
                  <small>留空表示按询价方式销售 (B2B)</small>
                  {errors.price && <span className={styles.errorText}>{errors.price}</span>}
                </div>
              </div>

              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label htmlFor="priceCurrency">币种</label>
                  <input
                    id="priceCurrency"
                    name="priceCurrency"
                    type="text"
                    value={formData.priceCurrency || ''}
                    onChange={handleChange}
                    placeholder="USD, CNY, EUR 等"
                    maxLength={10}
                  />
                  <small>货币代码，如 USD, CNY</small>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 4. 图片信息 ========== */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>图片信息</h2>

            {/* Featured Image */}
            <div className={styles.formGroup}>
              <label>特色图片</label>
              <ImageUpload
                uploadType="product"
                resourceId={productId}
                onUpload={handleImageUpload}
              />
              {imageUrl && (
                <div className={styles.currentImage}>
                  <p>当前特色图片：</p>
                  <Image src={imageUrl} alt="Featured" width={360} height={240} />
                </div>
              )}
            </div>

            {/* Product Gallery */}
            <div className={styles.formGroup}>
              <label>产品图片库</label>
              <div className={styles.gallerySection}>
                <div className={styles.galleryGrid}>
                  {galleryItems.length === 0 ? (
                    <p className={styles.emptyGallery}>暂无图片，添加产品图片</p>
                  ) : (
                    galleryItems.map((item, idx) => (
                      <div key={idx} className={styles.galleryItem}>
                        <Image src={item.url} alt={item.alt} width={240} height={240} />
                        <div className={styles.galleryItemInfo}>
                          <p className={styles.galleryItemAlt}>{item.alt}</p>
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => removeGalleryItem(idx)}
                            title="删除"
                          >
                            🗑️ 删除
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className={styles.addGallerySection}>
                  <p>添加新图片到图片库</p>
                  <div className={styles.addGalleryForm}>
                    <input
                      type="text"
                      id="galleryUrl"
                      placeholder="图片 URL"
                      className={styles.input}
                    />
                    <input
                      type="text"
                      id="galleryAlt"
                      placeholder="图片描述"
                      className={styles.input}
                    />
                    <button
                      type="button"
                      className={styles.addBtn}
                      onClick={() => {
                        const urlInput = document.getElementById('galleryUrl') as HTMLInputElement;
                        const altInput = document.getElementById('galleryAlt') as HTMLInputElement;
                        if (urlInput && altInput) {
                          addGalleryItem(urlInput.value, altInput.value);
                          urlInput.value = '';
                          altInput.value = '';
                        }
                      }}
                    >
                      + 添加图片
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 5. B2B 信息 ========== */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>B2B 信息</h2>
            <div className={styles.twoColumn}>
              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label htmlFor="moq">最小订购量 (MOQ)</label>
                  <input
                    id="moq"
                    name="moq"
                    type="number"
                    min="1"
                    value={formData.moq || ''}
                    onChange={handleChange}
                    placeholder="输入最小订购数量"
                  />
                  <small>例如：5 件</small>
                </div>
              </div>

              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label htmlFor="leadTime">交期</label>
                  <input
                    id="leadTime"
                    name="leadTime"
                    type="text"
                    value={formData.leadTime || ''}
                    onChange={handleChange}
                    placeholder="例如：7-10 days (sampling) + 2-3 weeks (production)"
                    maxLength={200}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========== 6. 产品详情 ========== */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>产品详情</h2>

            {/* Material */}
            <div className={styles.formGroup}>
              <label htmlFor="material">材料</label>
              <input
                id="material"
                name="material"
                type="text"
                value={formData.material || ''}
                onChange={handleChange}
                placeholder="例如：天然玫瑰石英，橡皮筋"
                maxLength={500}
              />
            </div>

            {/* Certifications */}
            <div className={styles.formGroup}>
              <label>认证</label>
              <div className={styles.tagList}>
                {certifications.map((cert, idx) => (
                  <span key={idx} className={styles.tag}>
                    {cert}
                    <button
                      type="button"
                      className={styles.tagRemoveBtn}
                      onClick={() => removeCertification(idx)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className={styles.tagInputGroup}>
                <input
                  type="text"
                  id="certInput"
                  placeholder="输入认证信息"
                  className={styles.tagInput}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      addCertification(input.value);
                      input.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => {
                    const input = document.getElementById('certInput') as HTMLInputElement;
                    if (input) {
                      addCertification(input.value);
                      input.value = '';
                    }
                  }}
                >
                  + 添加
                </button>
              </div>
            </div>

            {/* Customization Options */}
            <div className={styles.formGroup}>
              <label>自定义选项</label>
              <div className={styles.tagList}>
                {customizationOptions.map((option, idx) => (
                  <span key={idx} className={styles.tag}>
                    {option}
                    <button
                      type="button"
                      className={styles.tagRemoveBtn}
                      onClick={() => removeCustomizationOption(idx)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className={styles.tagInputGroup}>
                <input
                  type="text"
                  id="optionInput"
                  placeholder="输入自定义选项"
                  className={styles.tagInput}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      addCustomizationOption(input.value);
                      input.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => {
                    const input = document.getElementById('optionInput') as HTMLInputElement;
                    if (input) {
                      addCustomizationOption(input.value);
                      input.value = '';
                    }
                  }}
                >
                  + 添加
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className={styles.formGroup}>
              <label>标签</label>
              <div className={styles.tagList}>
                {tags.map((tag, idx) => (
                  <span key={idx} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      className={styles.tagRemoveBtn}
                      onClick={() => removeTag(idx)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className={styles.tagInputGroup}>
                <input
                  type="text"
                  id="tagInput"
                  placeholder="输入标签"
                  className={styles.tagInput}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      addTag(input.value);
                      input.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => {
                    const input = document.getElementById('tagInput') as HTMLInputElement;
                    if (input) {
                      addTag(input.value);
                      input.value = '';
                    }
                  }}
                >
                  + 添加
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className={styles.formActions}>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存产品'}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              取消
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
