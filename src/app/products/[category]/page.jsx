import Link from 'next/link';
import ProductCardB2B from '@/components/ProductCardB2B';
import CrystalCard from '@/components/CrystalCard';
import { CircleDot, Gem } from 'lucide-react';
import { getCategoryId } from '@/constants/categoryMapping';
import { getProducts } from '@/lib/products';

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
    leadTime: '7-10 days', // 默认值
    material: 'Natural Crystal', // 默认值
    color: 'Mixed', // 默认值
    isBestSeller: false, // 默认值
    inStock: apiProduct.isActive,
    tags: ['jewelry', 'crystal'], // 默认值
    category: {
      slug: apiProduct.category?.slug || '',
      name: apiProduct.category?.name || ''
    }
  };
}

// Category content configuration with unique details for each category
const categoryContent = {
  'healing-crystal-jewelry': {
    name: 'Healing Crystal Jewelry',
    title: 'Healing Crystal Jewelry Collection',
    description: 'Harness the power of natural crystals with our exquisite healing jewelry collection. Each piece is carefully crafted with authentic gemstones known for their unique metaphysical properties and healing energies.',
    benefits: [
      'Natural healing stones sourced from ethical mines',
      'Each stone hand-selected for quality and energy',
      'Promotes emotional and physical well-being',
      'Perfect for meditation and yoga practitioners'
    ],
    banner: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&h=400&fit=crop',
    subcategories: [
      { name: 'Bracelets', slug: 'bracelets', icon: '🔮', count: 24 },
      { name: 'Necklaces', slug: 'necklaces', icon: '💎', count: 18 }
    ],
    featuredStones: [
      { name: 'Rose Quartz', benefit: 'Love & Compassion', color: 'pink' },
      { name: 'Amethyst', benefit: 'Spiritual Protection', color: 'purple' },
      { name: 'Citrine', benefit: 'Abundance & Joy', color: 'yellow' },
      { name: 'Clear Quartz', benefit: 'Clarity & Energy', color: 'white' },
      { name: 'Green Ghost Crystal', benefit: 'Balance & Healing', color: 'green' },
      { name: 'Black Tourmaline', benefit: 'Grounding & Protection', color: 'black' }
    ]
  },
  '925-silver-crystal-jewelry': {
    name: '925 Silver & Crystal Jewelry',
    title: '925 Sterling Silver & Crystal Collection',
    description: 'Luxury meets spirituality in our premium 925 sterling silver jewelry collection. Combining the elegance of pure silver with the natural beauty of healing crystals for a sophisticated, high-end product line.',
    benefits: [
      '925 Sterling Silver - hypoallergenic and tarnish-resistant',
      'Premium quality natural crystals',
      'Elegant designs suitable for daily wear',
      'Perfect for upscale boutiques and gift shops'
    ],
    banner: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=400&fit=crop',
    subcategories: [
      { name: 'Bracelets', slug: 'bracelets', icon: '💫', count: 16 },
      { name: 'Necklaces', slug: 'necklaces', icon: '✨', count: 20 }
    ],
    featuredStones: [
      { name: 'Rose Quartz', benefit: 'Love & Compassion', color: 'pink' },
      { name: 'Amethyst', benefit: 'Spiritual Protection', color: 'purple' },
      { name: 'Citrine', benefit: 'Abundance & Joy', color: 'yellow' },
      { name: 'Clear Quartz', benefit: 'Clarity & Energy', color: 'white' },
      { name: 'Green Ghost Crystal', benefit: 'Balance & Healing', color: 'green' },
      { name: 'Black Tourmaline', benefit: 'Grounding & Protection', color: 'black' }
    ]
  },
  'chakra-yoga-jewelry': {
    name: 'Chakra & Yoga Jewelry',
    title: 'Chakra & Yoga Jewelry Collection',
    description: 'Enhance your spiritual practice with our specially designed chakra and yoga jewelry. Featuring the 7 chakra stones in perfect harmony to balance your energy centers and support your wellness journey.',
    benefits: [
      '7 Chakra stones for complete energy alignment',
      'Ideal for yoga studios and wellness centers',
      'Helps balance mind, body, and spirit',
      'Beautifully designed for practitioners and enthusiasts'
    ],
    banner: 'https://images.unsplash.com/photo-1601450977452-2ab21e7affe9?w=1200&h=400&fit=crop',
    subcategories: [
      { name: 'Bracelets', slug: 'bracelets', icon: '🧘', count: 28 },
      { name: 'Necklaces', slug: 'necklaces', icon: '☯️', count: 15 }
    ],
    featuredStones: [
      { name: 'Rose Quartz', benefit: 'Love & Compassion', color: 'pink' },
      { name: 'Amethyst', benefit: 'Spiritual Protection', color: 'purple' },
      { name: 'Citrine', benefit: 'Abundance & Joy', color: 'yellow' },
      { name: 'Clear Quartz', benefit: 'Clarity & Energy', color: 'white' },
      { name: 'Green Ghost Crystal', benefit: 'Balance & Healing', color: 'green' },
      { name: 'Black Tourmaline', benefit: 'Grounding & Protection', color: 'black' }
    ]
  },
  'aromatherapy-jewelry': {
    name: 'Aromatherapy Jewelry',
    title: 'Aromatherapy Diffuser Jewelry',
    description: 'Revolutionary jewelry that combines fashion with wellness. Our aromatherapy pieces feature porous lava stones that absorb and diffuse your favorite essential oils throughout the day, bringing wellness on-the-go.',
    benefits: [
      'Natural lava stones absorb essential oils',
      'All-day aromatherapy benefits',
      'Unique product - great profit margins',
      'Appeals to wellness and lifestyle customers'
    ],
    banner: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=1200&h=400&fit=crop',
    subcategories: [
      { name: 'Bracelets', slug: 'bracelets', icon: '🌿', count: 20 },
      { name: 'Necklaces', slug: 'necklaces', icon: '🌸', count: 12 }
    ],
    featuredStones: [
      { name: 'Rose Quartz', benefit: 'Love & Compassion', color: 'pink' },
      { name: 'Amethyst', benefit: 'Spiritual Protection', color: 'purple' },
      { name: 'Citrine', benefit: 'Abundance & Joy', color: 'yellow' },
      { name: 'Clear Quartz', benefit: 'Clarity & Energy', color: 'white' },
      { name: 'Green Ghost Crystal', benefit: 'Balance & Healing', color: 'green' },
      { name: 'Black Tourmaline', benefit: 'Grounding & Protection', color: 'black' }
    ]
  }
};

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getD1Database } from '@/lib/d1-db';

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const content = categoryContent[category] || categoryContent['healing-crystal-jewelry'];

  // 从 API 获取产品数据
  let products = [];
  let productCount = 0;

  try {
    // 获取 DB 实例
    let db;
    try {
      const { env } = await getCloudflareContext();
      db = getD1Database(env.DB);
    } catch {
      // Fallback or dev mode without bindings
      db = getD1Database();
    }

    const categoryId = getCategoryId(category);
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Explore Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.subcategories.map((subcat) => (
              <Link
                key={subcat.slug}
                href={`/products/${category}/${subcat.slug}`}
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
                    <p className="text-gray-600">{subcat.count} products available</p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose {content.name}?</h2>
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

        {/* Featured Natural Crystal Gemstones */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Natural Crystal Gemstones</h2>
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
            <h2 className="text-3xl font-bold text-gray-900">All Products</h2>
            <p className="text-gray-600">{productCount || products.length} products found</p>
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
            <h2 className="text-3xl font-serif font-bold mb-4">Ready to Place an Order?</h2>
            <p className="text-xl mb-8 text-stone-200">Contact us for bulk pricing and customization options</p>
            <Link
              href="/contact"
              className="inline-block bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
