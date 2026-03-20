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
      description:
        product.description ||
        `Template placeholder content for ${product.name}. Replace this summary with approved launch copy before publishing.`,
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
    clientName: 'Template Reviewer 03',
    clientCompany: 'Template Review Group C',
    clientLocation: 'Template Region C',
    role: 'Template Reviewer',
    quote: 'This placeholder product page helped our team validate hierarchy, CTA placement, and proof blocks before approved catalog copy was ready.',
  },
  {
    clientName: 'Template Reviewer 04',
    clientCompany: 'Template Review Group D',
    clientLocation: 'Template Region D',
    role: 'Template Approver',
    quote: 'Keeping this page fully mocked let us review layout and interaction patterns without exposing any live assortment details or commercial promises.',
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
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Template Quantity Placeholder</p>
              <p className="text-lg font-bold text-stone-900">
                Replace with approved order minimums
              </p>
              <p className="text-sm text-stone-500 mt-1">
                Replace this helper line with approved lead-time and qualification rules.
              </p>
            </div>

            {/* Sample Order Badge */}
            <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 mb-5 flex items-start gap-3">
              <span className="text-accent-500 text-lg flex-shrink-0">🧪</span>
              <div>
                <p className="text-sm font-semibold text-stone-800">Template Review Note</p>
                <p className="text-sm text-stone-500 mt-0.5">Replace any sampling, pricing, or follow-up promises before publishing this page.</p>
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
              Template Description Block
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
                This paragraph is placeholder guidance for template review only.
                Replace sourcing notes, pricing details, and customization claims before publishing.
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
                  <span className="text-stone-800 text-base">Template material placeholder</span>
                </div>
              ) : null;
            })()}
            <div className="flex px-5 py-3.5 bg-white border-b border-stone-100">
              <span className="text-stone-500 w-1/3 font-medium text-sm flex-shrink-0">Minimum Order</span>
              <span className="text-stone-800 text-base">Replace with approved quantity rules</span>
            </div>
            <div className="flex px-5 py-3.5 bg-stone-50 border-b border-stone-100">
              <span className="text-stone-500 w-1/3 font-medium text-sm flex-shrink-0">Lead Time</span>
              <span className="text-stone-800 text-base">Replace with approved fulfillment timing</span>
            </div>
            {category && (
              <div className="flex px-5 py-3.5 bg-white border-b border-stone-100">
                <span className="text-stone-500 w-1/3 font-medium text-sm flex-shrink-0">Category</span>
                <span className="text-stone-800 text-base">{category.name}</span>
              </div>
            )}
            {attributes && Object.keys(attributes).length > 0 && (
              <div className="flex px-5 py-3.5 bg-stone-50 border-t border-stone-100">
                <span className="text-stone-500 w-1/3 font-medium text-sm flex-shrink-0">Additional Notes</span>
                <span className="text-stone-800 text-base">
                  Replace dimension, finish, packaging, and compliance fields with approved public specifications.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 3. Customization Options */}
        <section className="mb-10">
          <h2 className="font-serif text-xl font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">
            Replaceable Detail Blocks
          </h2>
          <div className="bg-accent-50 border border-accent-200 rounded-xl p-6">
            <div className="space-y-3.5">
              {[
                'Use this list for approved quantity rules, package scope, or qualification steps.',
                'Replace this line with the real options your team supports after review.',
                'Keep staging copy generic until launch assets, pricing, and workflows are approved.',
                'Remove any placeholder promises before publishing to a live audience.',
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
            Replaceable Trust Blocks
          </h2>
          <div className="space-y-3">
            {[
              'Approved quality or compliance note placeholder',
              'Approved support, delivery, or review note placeholder',
            ].map((cert, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-accent-500 font-bold text-lg flex-shrink-0">✓</span>
                <span className="text-stone-700 text-base">{cert}</span>
              </div>
            ))}
            <p className="text-sm text-stone-400 mt-1 pl-8">
              Replace this block with legal- or ops-approved trust language before launch.
            </p>
          </div>
        </section>

        {/* 5. FAQ Accordion (Client Component) */}
        <FAQSection />

        {/* 6. Partner Testimonials */}
        <section className="mb-10">
          <h2 className="font-serif text-xl font-bold text-stone-900 mb-6 pb-2 border-b border-stone-200">
            Placeholder Review Quotes
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
              Related Template Entries
            </h2>
            <p className="text-stone-500 text-base text-center mb-8">
              More placeholder items from {category?.name || 'this collection'}
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
                    <p className="text-primary-600 text-xs font-medium mt-1.5">Open Details →</p>
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
            Need More Placeholder Items?
          </h2>
          <p className="text-stone-400 text-base mb-8">
            Browse the rest of this template collection and replace it with your approved catalog before publishing
          </p>
          <Link
            href={category ? `/products/${category.slug}` : '/products'}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-stone-900 font-semibold px-8 py-3 rounded-lg transition-colors duration-300 shadow-md"
          >
            {category ? `Browse ${category.name}` : 'View All Placeholder Products'} →
          </Link>
        </div>
      </section>

    </main>
  );
}
