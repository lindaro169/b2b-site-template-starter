'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ProductCardB2B from '@/components/ProductCardB2B';
import { CircleDot, Gem } from 'lucide-react';
import {
  CATEGORY_METADATA,
  PRODUCT_TYPES,
  getCategoryId,
  isValidCategorySlug,
  isValidProductType,
} from '@/constants/categoryMapping';

/**
 * 转换API产品数据为ProductCardB2B需要的格式
 * Transform API product data to match ProductCardB2B component props
 */
function transformProductData(apiProduct) {
  return {
    id: apiProduct.id,
    slug: apiProduct.slug,
    title: apiProduct.name,
    excerpt: apiProduct.description || '',
    description: apiProduct.description || '',
    featuredImage: { url: apiProduct.imageUrl },
    moq: apiProduct.moq || 50,
    price: apiProduct.price,
    inStock: apiProduct.isActive,
  };
}

export default function ProductTypePage({ params }) {
  const { category, type } = use(params);

  // 状态管理
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 验证参数
  const isValidCategory = isValidCategorySlug(category);
  const isValidType = isValidProductType(type);
  const categoryData = CATEGORY_METADATA[category];
  const typeInfo = PRODUCT_TYPES[type] || PRODUCT_TYPES.bracelets;
  const categoryName = categoryData?.name || 'Products';

  useEffect(() => {
    // 如果参数无效，不获取数据
    if (!isValidCategory || !isValidType) {
      setLoading(false);
      setError('无效的分类或产品类型 (Invalid category or product type)');
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // 根据分类slug获取categoryId
        const categoryId = getCategoryId(category);

        if (!categoryId) {
          throw new Error('无法获取分类ID (Failed to get category ID)');
        }

        // 调用API获取产品
        const response = await fetch(
          `/api/products?categoryId=${categoryId}&limit=100`
        );

        if (!response.ok) {
          throw new Error(`API 返回错误: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || '获取产品失败 (Failed to fetch products)');
        }

        // 转换产品数据
        let transformedProducts = (result.data || []).map(transformProductData);

        // 按产品类型过滤：bracelets 只显示手链，necklaces 只显示项链/吊坠/耳环
        if (type === 'bracelets') {
          transformedProducts = transformedProducts.filter(p =>
            /bracelet/i.test(p.title)
          );
        } else if (type === 'necklaces') {
          transformedProducts = transformedProducts.filter(p =>
            /necklace|pendant|earring/i.test(p.title)
          );
        }

        setProducts(transformedProducts);
      } catch (err) {
        console.error('获取产品出错:', err);
        setError(err.message || '获取产品列表失败 (Failed to fetch products)');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, type, isValidCategory, isValidType]);

  // 如果参数无效，显示错误页面
  if (!isValidCategory || !isValidType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">
            无效的分类或产品类型 (Invalid category or product type)
          </p>
          <Link
            href="/products"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            返回产品列表 (Back to Products)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-600">
            Products
          </Link>
          <span>/</span>
          <Link href={`/products/${category}`} className="hover:text-primary-600">
            {categoryName}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{typeInfo.name}</span>
        </nav>
      </div>

      {/* Page Header */}
      <div className="bg-stone-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-stone-800"></div>
        <div className="absolute inset-0 bg-[url('/pattern-noise.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 text-primary-400 bg-white/5 rounded-full p-4 border border-white/10 flex items-center justify-center">
              {type === 'bracelets' ? (
                <CircleDot className="w-12 h-12 stroke-1" />
              ) : (
                <Gem className="w-12 h-12 stroke-1" />
              )}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">{categoryName}</h1>
              <p className="text-xl text-stone-400 font-light tracking-wide">{typeInfo.name} Collection</p>
            </div>
          </div>
          <p className="text-lg text-stone-300 max-w-3xl mt-6 leading-relaxed border-l-2 border-primary-600 pl-6">
            {typeInfo.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features */}
        <div className="mb-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {typeInfo.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {typeInfo.name} ({loading ? '...' : products.length})
            </h2>
            <Link
              href={`/products/${category}`}
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              View All {categoryName}
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              </div>
              <p className="text-xl text-gray-600">
                加载产品中... (Loading products...)
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xl text-red-600 mb-4">
                ❌ {error}
              </p>
              <Link
                href="/products"
                className="inline-block text-red-600 hover:text-red-700 font-semibold"
              >
                返回产品列表 (Back to Products) →
              </Link>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCardB2B key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <p className="text-xl text-gray-600 mb-4">
                No products found in this category yet.
              </p>
              <Link
                href="/contact"
                className="inline-block text-primary-600 hover:text-primary-700 font-semibold"
              >
                Contact us for custom orders →
              </Link>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-stone-900 rounded-2xl p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-stone-800 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold mb-4">Interested in Bulk Orders?</h2>
            <p className="text-xl mb-8 text-stone-200">
              Contact us for special wholesale pricing and customization options
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Get a Quote
              </Link>
              <Link
                href={`/products/${category}`}
                className="inline-block border-2 border-stone-700 text-white hover:bg-stone-800 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Browse All {categoryName}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
