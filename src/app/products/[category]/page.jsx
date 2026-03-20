import Link from 'next/link';
import ProductCardB2B from '@/components/ProductCardB2B';
import CrystalCard from '@/components/CrystalCard';
import { CircleDot, Gem } from 'lucide-react';
import {
  getCanonicalCategorySlug,
  getCategoryId,
} from '@/constants/categoryMapping';
import { getProducts } from '@/lib/products';
import { siteConfig } from '@/lib/site-config';
import { redirect } from 'next/navigation';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getD1Database } from '@/lib/d1-db';

/**
 * 将 API 产品数据转换为 UI 需要的格式
 * Transform API product data to match ProductCardB2B props
 */
function transformProductData(apiProduct) {
  return {
    id: apiProduct.id,
    slug: apiProduct.slug,
    title: apiProduct.name,
    excerpt: apiProduct.description || '',
    description: apiProduct.description || '',
    featuredImage: {
      url: apiProduct.imageUrl || '/api/placeholder/400/400',
      alt: apiProduct.name
    },
    moq: 50, // 默认值，真实数据应该从 API 获取
    price: apiProduct.price,
    leadTime: 'Replace before publishing', // 默认值
    material: 'Template Material Placeholder', // 默认值
    color: 'Mixed', // 默认值
    isBestSeller: false, // 默认值
    inStock: apiProduct.isActive,
    tags: ['template', 'catalog'], // 默认值
    category: {
      slug: apiProduct.category?.slug || '',
      name: apiProduct.category?.name || ''
    }
  };
}

const placeholderBenefits = [
  'Placeholder copy used for internal review and approval workflows',
  'Local placeholder imagery replaces original category assets',
  'Useful for validating layout, spacing, and navigation depth',
  'Replace all headings, claims, and counts before publishing',
];

const placeholderFeaturedCards = [
  { name: 'Template Material 01', benefit: 'Replace with your approved material story', color: 'stone' },
  { name: 'Template Material 02', benefit: 'Replace with your approved category benefit', color: 'sand' },
  { name: 'Template Material 03', benefit: 'Replace with your final launch copy', color: 'slate' },
  { name: 'Template Material 04', benefit: 'Placeholder support line for design review', color: 'cloud' },
  { name: 'Template Material 05', benefit: 'Swap before publishing this collection', color: 'sage' },
  { name: 'Template Material 06', benefit: 'Safe mock data for staging and demos', color: 'charcoal' },
];

// Category content configuration with unique details for each category
const categoryContent = {
  'template-collection-a': {
    name: 'Template Collection A',
    title: 'Template Collection A',
    description: 'Placeholder category copy for assortment group A. Replace this heading, description, and imagery before publishing.',
    benefits: placeholderBenefits,
    banner: siteConfig.scenePlaceholder,
    subcategories: [
      { name: 'Template Bracelets', slug: 'bracelets', icon: '🔮', count: 24 },
      { name: 'Template Pendants', slug: 'necklaces', icon: '💎', count: 18 }
    ],
    featuredStones: placeholderFeaturedCards,
  },
  'template-collection-b': {
    name: 'Template Collection B',
    title: 'Template Collection B',
    description: 'Placeholder category copy for assortment group B. Use this section to validate layout and replace it with approved merchandising later.',
    benefits: placeholderBenefits,
    banner: siteConfig.scenePlaceholder,
    subcategories: [
      { name: 'Template Bracelets', slug: 'bracelets', icon: '💫', count: 16 },
      { name: 'Template Pendants', slug: 'necklaces', icon: '✨', count: 20 }
    ],
    featuredStones: placeholderFeaturedCards,
  },
  'template-collection-c': {
    name: 'Template Collection C',
    title: 'Template Collection C',
    description: 'Placeholder category copy for assortment group C. Keep it in staging until your final positioning and approved assets are ready.',
    benefits: placeholderBenefits,
    banner: siteConfig.scenePlaceholder,
    subcategories: [
      { name: 'Template Bracelets', slug: 'bracelets', icon: '🧘', count: 28 },
      { name: 'Template Pendants', slug: 'necklaces', icon: '☯️', count: 15 }
    ],
    featuredStones: placeholderFeaturedCards,
  },
  'template-collection-d': {
    name: 'Template Collection D',
    title: 'Template Collection D',
    description: 'Placeholder category copy for assortment group D. Replace this section with your final accessory narrative before going live.',
    benefits: placeholderBenefits,
    banner: siteConfig.scenePlaceholder,
    subcategories: [
      { name: 'Template Bracelets', slug: 'bracelets', icon: '🌿', count: 20 },
      { name: 'Template Pendants', slug: 'necklaces', icon: '🌸', count: 12 }
    ],
    featuredStones: placeholderFeaturedCards,
  }
};

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const canonicalCategory = getCanonicalCategorySlug(category);

  if (canonicalCategory && canonicalCategory !== category) {
    redirect(`/products/${canonicalCategory}`);
  }

  const resolvedCategory = canonicalCategory || category;
  const content = categoryContent[resolvedCategory] || categoryContent['template-collection-a'];

  // 从 API 获取产品数据
  let products = [];
  let productCount = 0;

  try {
    // 获取 DB 实例
    let db;
    try {
      const { env } = await getCloudflareContext();
      db = env?.DB ? getD1Database(env.DB) : undefined;
    } catch {
      db = undefined;
    }

    const categoryId = getCategoryId(resolvedCategory);
    if (categoryId) {
      // Use direct function call instead of HTTP fetch for better performance
      const result = await getProducts({
        categoryId,
        limit: 100,
        isActive: true,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }, db); // Pass db instance

      if (result.success && result.data) {
        products = result.data.map(transformProductData);
        productCount = result.total || products.length;
      } else {
        console.error(`获取产品失败: ${result.error}`);
      }
    }
  } catch (error) {
    console.error('获取产品数据失败:', error);
    // 降级：继续使用空产品列表
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{content.name}</span>
        </nav>
      </div>

      {/* Category Banner */}
      <div className="relative h-80 bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-5xl font-serif font-bold mb-4 tracking-tight">{content.title}</h1>
            <p className="text-xl text-stone-200 max-w-3xl leading-relaxed">{content.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Subcategories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Explore Subsections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.subcategories.map((subcat) => (
              <Link
                key={subcat.slug}
                href={`/products/${resolvedCategory}/${subcat.slug}`}
                className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-8 border-2 border-transparent hover:border-primary-600"
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {subcat.slug === 'bracelets' ? (
                      <CircleDot className="w-16 h-16 text-primary-600 stroke-1" />
                    ) : (
                      <Gem className="w-16 h-16 text-primary-600 stroke-1" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 mb-2">
                      {subcat.name}
                    </h3>
                    <p className="text-gray-600">{subcat.count} placeholder entries</p>
                  </div>
                  <svg className="w-8 h-8 text-primary-600 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why This Section Is Still Placeholder</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-800">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Placeholder Material Cards */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Placeholder Material Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.featuredStones.map((stone, index) => (
              <CrystalCard
                key={index}
                name={stone.name}
                benefit={stone.benefit}
              />
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Placeholder Products</h2>
            <p className="text-gray-600">{productCount || products.length} placeholder items found</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCardB2B key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-stone-900 rounded-2xl p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-stone-800 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold mb-4">Ready to Replace This Section?</h2>
            <p className="text-xl mb-8 text-stone-200">Use this area for review only. Replace copy, imagery, and assortment details before publishing.</p>
            <Link
              href="/contact"
              className="inline-block bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Request Template Update
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
