import CategoryCard from '@/components/CategoryCard';
import FAQAccordion from '@/components/FAQAccordion';
import IconCrystal from '@/components/icons/IconCrystal';
import IconSilver from '@/components/icons/IconSilver';
import IconChakra from '@/components/icons/IconChakra';
import IconAromatherapy from '@/components/icons/IconAromatherapy';
import Link from 'next/link';
import TemplateCopyBadge from '@/components/TemplateCopyBadge';
import ProductCardB2B from '@/components/ProductCardB2B';
import { getProducts } from '@/lib/products';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getD1Database } from '@/lib/d1-db';
import { getFAQs } from '@/lib/faqs';
import { siteConfig } from '@/lib/site-config';
import { MAIN_CATEGORIES } from '@/constants/categoryMapping';

export const metadata = {
  title: `Demo Collections — ${siteConfig.brandName}`,
  description: 'Mock category and product listing page for sanitized template review.',
};

const categoryIcons = {
  'template-collection-a': IconCrystal,
  'template-collection-b': IconSilver,
  'template-collection-c': IconChakra,
  'template-collection-d': IconAromatherapy,
};

const defaultCategories = MAIN_CATEGORIES.map((category) => ({
  name: category.name,
  slug: category.slug,
  description: category.description,
  image: { url: siteConfig.scenePlaceholder },
}));

const defaultFAQs = [
  {
    question: 'Are these real products?',
    answer: 'No. This grid is populated with mock products so you can review UI patterns safely.',
  },
  {
    question: 'Why do all product images look like placeholders?',
    answer: 'The original product imagery has been removed from the template and replaced with local placeholders.',
  },
  {
    question: 'Can I keep these mock categories in staging?',
    answer: 'Yes. They are useful for design review until your real assortment is ready.',
  },
  {
    question: 'Where should I update the category copy?',
    answer: 'Replace the mock labels and descriptions once your information architecture is finalized.',
  },
  {
    question: 'Is the pricing live?',
    answer: 'No. The numbers on this page are placeholders only.',
  },
];

/**
 * Transform API product data to UI component format
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
    moq: apiProduct.moq || 50,
    price: apiProduct.price,
    leadTime: apiProduct.leadTime || '7-10 days',
    material: apiProduct.material || 'Template Material Placeholder',
    color: 'Mixed',
    isBestSeller: false,
    inStock: apiProduct.isActive,
    tags: apiProduct.tags || ['template', 'catalog'],
    category: {
      slug: apiProduct.category?.slug || '',
      name: apiProduct.category?.name || ''
    }
  };
}

export default async function ProductsPage() {
  let categories = defaultCategories;
  let faqs = defaultFAQs;
  let allProducts = [];
  let db;

  try {
    const { env } = await getCloudflareContext();
    db = env?.DB ? getD1Database(env.DB) : undefined;
  } catch {
    db = undefined;
  }

  const faqResult = await getFAQs(db);
  if (faqResult.success && faqResult.data && faqResult.data.length > 0) {
    faqs = faqResult.data;
  }

  // Fetch all products from D1 database
  try {
    const result = await getProducts({
      limit: 100,
      isActive: true,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }, db);

    if (result.success && result.data) {
      allProducts = result.data.map(transformProductData);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Continue without all products section
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-stone-50 via-white to-amber-50/30 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <TemplateCopyBadge className="mb-6 border-stone-200 bg-stone-100 text-stone-900" />
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 mb-6 tracking-tight">
              Explore the Template Catalog
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed font-light">
              {siteConfig.templateCopyDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.slug || category.id}
                category={category}
                icon={categoryIcons[category.slug]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* All Products Section */}
      {allProducts.length > 0 && (
        <section className="py-20 bg-stone-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mb-4">
                All Placeholder Products
              </h2>
              <p className="text-lg text-stone-500">
                Browse {allProducts.length} placeholder items currently included in this sanitized template
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCardB2B key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <FAQAccordion faqs={faqs} />
        </div>
      </section>

      {/* CTA Banner - Unified Stone Theme */}
      <section className="py-20 bg-gradient-to-br from-stone-900 to-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-6">
            Ready to Replace This Catalog?
          </h2>
          <p className="text-lg text-stone-300 mb-10 font-light">
            Use this CTA slot for your approved catalog offer, sales route, or gated download flow.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-stone-900 font-serif font-semibold rounded-lg hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-primary-100/20"
          >
            Open Contact Template
          </Link>
        </div>
      </section>
    </>
  );
}
