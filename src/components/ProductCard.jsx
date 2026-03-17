import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }) {
  // 防御性检查 - 确保product存在
  if (!product) {
    return null;
  }

  const {
    title,
    slug,
    excerpt,
    featuredImage,
    tags,
    moq,
    category,
    price
  } = product;

  // 确保必需的字段存在
  if (!title || !slug) {
    console.warn('ProductCard: Missing required fields', product);
    return null;
  }

  return (
    <Link
      href={`/product/${slug}`}
      className="product-card group block bg-white rounded-xl border border-gray-300 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus:outline-none focus:ring-3 focus:ring-secondary/30"
    >
      {/* Product Image */}
      <div className="product-img relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={featuredImage?.url || '/api/placeholder/400/400'}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {moq && (
          <div className="absolute top-3 right-3 bg-primary-600/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            MOQ {moq}
          </div>
        )}
      </div>

      {/* Product Body */}
      <div className="product-body p-4">
        {/* Category */}
        {category && (
          <div className="text-xs font-medium text-primary-600 mb-2 uppercase tracking-wide">
            {typeof category === 'object' ? category.name : category}
          </div>
        )}

        {/* Title */}
        <h3 className="product-title font-serif text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>

        {/* Subtitle/Excerpt */}
        {excerpt && (
          <p className="product-sub text-sm text-gray-600 mb-3 line-clamp-2">
            {excerpt}
          </p>
        )}

        {/* Price if available */}
        {price && (
          <p className="text-sm font-semibold text-primary-600 mb-2">
            ${price} per piece
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="product-tags flex flex-wrap gap-2 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="product-actions">
          <span className="inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
            View Details
            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
