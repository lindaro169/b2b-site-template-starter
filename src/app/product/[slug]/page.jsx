import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/products';
import { getCategoryById } from '@/lib/categories';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import ProductDetailClient from './ProductDetailClient';
import ProductImageGallery from './ProductImageGallery';
import FAQSection from './FAQSection';
import TestimonialCard from '@/components/TestimonialCard';
import { siteConfig } from '@/lib/site-config';

/**
 * 动态 SEO Metadata
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  let db;
  try {
    const { env } = await getCloudflareContext();
    db = env?.DB || undefined;
  } catch {
    db = undefined;
  }

  const result = await getProductBySlug(slug, db);

  if (!result.success || !result.data) {
    return {
      title: `Product Not Found | ${siteConfig.brandName}`,
      description: 'The requested placeholder product could not be found.',
    };
  }

  const product = result.data;

  return {
    title: `${product.name} | ${siteConfig.brandName}`,
    description:
      product.description ||
      `Placeholder product content for ${product.name}. Replace this description with approved merchandising copy before publishing.`,
    openGraph: {
      title: product.name,
      description: product.description || `Wholesale ${product.name}`,
      images: product.imageUrl
        ? [{ url: product.imageUrl, width: 800, height: 800, alt: product.name }]
        : [],
      type: 'website',
    },
  };
}

function parseJsonField(jsonStr) {
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * 从产品名称提取具体材质
 * 例: "Natural Gold Rutilated Quartz Tiger Eye Crystal Beaded Bracelet"
 *  → "Natural Gold Rutilated Quartz Tiger Eye Crystal"
 */
function extractMaterialFromName(name) {
  if (!name) return null;
  const suffixes = [
    'Unique Design Beaded Bracelet', 'Faceted Freeform Beaded Bracelet',
    'Beaded Bracelet', 'Fashion Bracelet', 'Design Bracelet', 'Bracelet',
    'Drop Earrings', 'Stud Earrings', 'Dangle Earrings', 'Earrings',
    'Pendant Necklace', 'Pendant', 'Necklace',
    'Loose Beads', 'Bead Loose', 'Beads',
  ];
  let material = name;
  for (const suffix of suffixes) {
    const re = new RegExp(`\\s*${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*$`, 'i');
    const cleaned = material.replace(re, '').trim();
    if (cleaned && cleaned !== material) {
      material = cleaned;
      break;
    }
  }
  return material;
}

// B2B partner testimonials — uses TestimonialCard field names
const REVIEWS = [
  {
    clientName: 'Sarah M.',
    clientCompany: 'Crystal Life Boutique',
    clientLocation: 'USA',
    role: 'Retailer',
    quote: 'Consistent quality and smooth communication. Our retail customers love these — reorders have been increasing every quarter.',
  },
  {
    clientName: 'Jennifer L.',
    clientCompany: 'EuroGems Trading',
    clientLocation: 'UK',
    role: 'Wholesale Buyer',
    quote: 'Competitive wholesale pricing, flexible MOQ, and great customization support. Exactly what we needed to expand our jewelry line.',
  },
];

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;

  let db;
  try {
    const { env } = await getCloudflareContext();
    db = env?.DB || undefined;
  } catch {
    db = undefined;
  }

  const result = await getProductBySlug(slug, db);
  if (!result.success || !result.data) notFound();

  const product = result.data;

  // 获取分类
  let category = null;
  if (product.categoryId) {
    const catResult = await getCategoryById(product.categoryId, db);
    if (catResult.success && catResult.data) {
      category = catResult.data;
    }
  }

  // 获取同系列产品（最多 4 个，排除当前产品）
  let relatedProducts = [];
  if (product.categoryId) {
    const relResult = await getProducts(
      { categoryId: product.categoryId, isActive: true, limit: 5 },
      db
    );
    if (relResult.success && relResult.data) {
      relatedProducts = relResult.data
        .filter(p => p.id !== product.id)
        .slice(0, 4);
    }
  }

  const attributes = parseJsonField(product.attributes);
  const productImages = parseJsonField(product.images) || [];

  const clientProduct = {
    id: product.id,
    slug: product.slug,
    title: product.name,
    description: product.description || '',
    featuredImage: {
      url: product.imageUrl || '',
      alt: product.name,
    },
  };

  return (
    <main className="bg-white min-h-screen">

      {/* ── Breadcrumb ── */}
      <nav className="bg-primary-50/60 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-sm text-stone-500">
            <li><Link href="/" className="hover:text-primary-600 transition-colors">Home</Link></li>
            <li className="text-stone-300">/</li>
            <li><Link href="/products" className="hover:text-primary-600 transition-colors">Products</Link></li>
            {category && (
              <>
                <li className="text-stone-300">/</li>
                <li>
                  <Link href={`/products/${category.slug}`} className="hover:text-primary-600 transition-colors">
                    {category.name}
                  </Link>
                </li>
              </>
            )}
            <li className="text-stone-300">/</li>
            <li className="text-stone-700 font-medium truncate max-w-[200px]">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* ── Hero: 2-column ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left: Image Gallery */}
          <ProductImageGallery
            images={productImages}
            mainImage={product.featuredImage?.url || product.imageUrl}
            productName={product.name}
          />

          {/* Right: Product Info */}
          <div className="flex flex-col">

            {/* Category Badge */}
            {category && (
              <Link
                href={`/products/${category.slug}`}
                className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 border border-primary-200 rounded-full px-3 py-1 w-fit mb-4 hover:bg-primary-100 transition-colors"
              >
                {category.name}
              </Link>
            )}

            {/* Product Name */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="mb-4 inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-primary-700">
              {siteConfig.templateCopyLabel}
            </div>

            {/* Short Description */}
            {product.description && (
              <div className="text-stone-600 text-base leading-relaxed mb-6 space-y-2">
                {product.description.split('\n').filter(line => line.trim()).map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            {/* MOQ Info */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-5">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Minimum Order Quantity</p>
              <p className="text-lg font-bold text-stone-900">
                {product.moq
                  ? product.moq.split('|')[0].trim().replace(/^Ready Stock:\s*/i, '')
                  : '5 pcs per style'}
              </p>
              {product.leadTime && (
                <p className="text-sm text-stone-500 mt-1">
                  Lead Time: {product.leadTime.split('|')[0].trim().replace(/^Ready Stock:\s*/i, '')}
                </p>
              )}
            </div>

            {/* Sample Order Badge */}
            <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 mb-5 flex items-start gap-3">
              <span className="text-accent-500 text-lg flex-shrink-0">🧪</span>
              <div>
                <p className="text-sm font-semibold text-stone-800">Sample Order Available</p>
                <p className="text-sm text-stone-500 mt-0.5">Try before you bulk order — contact us for sample pricing</p>
              </div>
            </div>

            {/* Client: Inquiry button + Contact + Tags */}
            <ProductDetailClient
              product={clientProduct}
              categoryName={category?.name}
            />

          </div>
        </div>
      </div>

      {/* ── Below Hero: Full-Width Sections ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* 1. Product Description */}
        {product.description && (
          <section className="mb-10">
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">
              Product Description
            </h2>
            <div className="text-stone-600 text-base leading-relaxed space-y-4">
              {product.description.split('\n\n').filter(para => para.trim()).map((para, i) => {
                // Essential oil options — render as tag pills
                if (para.startsWith('Essential Oil Options') || para.startsWith('Scent Options')) {
                  const [label, oils] = para.split('\n');
                  const oilList = oils ? oils.split('|').map(o => o.trim()).filter(Boolean) : [];
                  return (
                    <div key={i}>
                      <p className="font-semibold text-stone-700 mb-2">{label}</p>
                      <div className="flex flex-wrap gap-2">
                        {oilList.map(oil => (
                          <span key={oil} className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-sm font-medium">
                            {oil}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }
                // Regular paragraph — split inner lines too
                return (
                  <div key={i} className="space-y-1">
                    {para.split('\n').filter(l => l.trim()).map((line, j) => (
                      <p key={j}>{line}</p>
                    ))}
                  </div>
                );
              })}
              <p className="text-stone-500 text-sm italic border-t border-stone-100 pt-4">
                Ideal for wholesale B2B buyers — factory-direct sourcing with flexible order quantities.
                Contact us for bulk pricing and customization options.
              </p>
            </div>
          </section>
        )}

        {/* 2. Specifications */}
        <section className="mb-10">
          <h2 className="font-serif text-xl font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">
            Specifications
          </h2>
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            {/* Material: 优先用从名称提取的具体材质 */}
            {(() => {
              const detailedMaterial = extractMaterialFromName(product.name) || product.material;
              return detailedMaterial ? (
                <div className="flex px-5 py-3.5 bg-stone-50 border-b border-stone-100">
                  <span className="text-stone-500 w-1/3 font-medium text-sm flex-shrink-0">Material</span>
                  <span className="text-stone-800 text-base">{detailedMaterial}</span>
                </div>
              ) : null;
            })()}
            <div className="flex px-5 py-3.5 bg-white border-b border-stone-100">
              <span className="text-stone-500 w-1/3 font-medium text-sm flex-shrink-0">Minimum Order</span>
              <span className="text-stone-800 text-base">{product.moq || '5 pcs per style'}</span>
            </div>
            <div className="flex px-5 py-3.5 bg-stone-50 border-b border-stone-100">
              <span className="text-stone-500 w-1/3 font-medium text-sm flex-shrink-0">Lead Time</span>
              <span className="text-stone-800 text-base">{product.leadTime || '3–7 business days'}</span>
            </div>
            {category && (
              <div className="flex px-5 py-3.5 bg-white border-b border-stone-100">
                <span className="text-stone-500 w-1/3 font-medium text-sm flex-shrink-0">Category</span>
                <span className="text-stone-800 text-base">{category.name}</span>
              </div>
            )}
            {attributes && Object.entries(attributes)
              .filter(([key]) => key.toLowerCase() !== 'material') // Material 已单独显示，避免重复
              .map(([key, value], i) => (
                <div
                  key={key}
                  className={`flex px-5 py-3.5 border-t border-stone-100 ${i % 2 === 0 ? 'bg-stone-50' : 'bg-white'}`}
                >
                  <span className="text-stone-500 w-1/3 font-medium text-sm flex-shrink-0">{key}</span>
                  <span className="text-stone-800 text-base">{String(value)}</span>
                </div>
              ))}
          </div>
        </section>

        {/* 3. Customization Options */}
        <section className="mb-10">
          <h2 className="font-serif text-xl font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">
            Customization Options
          </h2>
          <div className="bg-accent-50 border border-accent-200 rounded-xl p-6">
            <div className="space-y-3.5">
              {[
                'Ready stock styles: MOQ 5 pcs per style — mix styles welcome',
                'Custom style (your own design / OEM): MOQ 50 pcs per style',
                'Gift box & retail packaging available upon request',
                'Color & material customization available for OEM orders',
              ].map((option, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-accent-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-stone-700 text-base">{option}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Certifications */}
        <section className="mb-10">
          <h2 className="font-serif text-xl font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">
            Certifications
          </h2>
          <div className="space-y-3">
            {[
              '925 Sterling Silver Certification — Available upon request',
              'Natural Crystal Certification — Available upon request',
            ].map((cert, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-accent-500 font-bold text-lg flex-shrink-0">✓</span>
                <span className="text-stone-700 text-base">{cert}</span>
              </div>
            ))}
            <p className="text-sm text-stone-400 mt-1 pl-8">
              Certifications are provided upon request. Contact us for details.
            </p>
          </div>
        </section>

        {/* 5. FAQ Accordion (Client Component) */}
        <FAQSection />

        {/* 6. Partner Testimonials */}
        <section className="mb-10">
          <h2 className="font-serif text-xl font-bold text-stone-900 mb-6 pb-2 border-b border-stone-200">
            What Our Partners Say
          </h2>
          <div className="space-y-4">
            {REVIEWS.map((review, i) => (
              <TestimonialCard key={i} testimonial={review} />
            ))}
          </div>
        </section>

      </div>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className="bg-stone-50 border-t border-stone-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2 text-center">
              You May Also Like
            </h2>
            <p className="text-stone-500 text-base text-center mb-8">
              More products from {category?.name || 'this collection'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map(p => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group bg-white rounded-xl border border-stone-200 hover:border-primary-400 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                        <span className="text-stone-300 text-3xl">💎</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-stone-800 text-sm font-medium line-clamp-2 group-hover:text-primary-700 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-primary-600 text-xs font-medium mt-1.5">View Details →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Dark CTA Banner ── */}
      <section className="bg-gradient-to-br from-stone-900 to-stone-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
            Interested in More Products?
          </h2>
          <p className="text-stone-400 text-base mb-8">
            Browse our full collection of premium wholesale crystal jewelry
          </p>
          <Link
            href={category ? `/products/${category.slug}` : '/products'}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-stone-900 font-semibold px-8 py-3 rounded-lg transition-colors duration-300 shadow-md"
          >
            {category ? `Browse ${category.name}` : 'View All Products'} →
          </Link>
        </div>
      </section>

    </main>
  );
}
