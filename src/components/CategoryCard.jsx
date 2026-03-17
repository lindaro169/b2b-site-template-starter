import Link from 'next/link';
import Image from 'next/image';

export default function CategoryCard({ category, icon: Icon }) {
  // 防御性检查
  if (!category) {
    return null;
  }

  const { name, slug, description, image, imageUrl } = category;
  const resolvedImageUrl = image?.url || imageUrl;

  // 确保必需的字段存在
  if (!name || !slug) {
    return null;
  }

  return (
    <Link
      href={`/products/${slug}`}
      className="group block bg-white rounded-xl border border-gray-300 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus:outline-none focus:ring-3 focus:ring-secondary/30"
    >
      {/* Category Image/Icon */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary-50 to-secondary/10">
        {resolvedImageUrl ? (
          <Image
            src={resolvedImageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : Icon ? (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
            {/* Decorative Circle */}
            <div className="relative z-10 w-32 h-32 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Icon className="w-16 h-16 text-amber-900/40 transition-all duration-500 group-hover:text-amber-700" />
            </div>
            {/* Background Pattern (Optional) */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
        ) : null}
      </div>

      {/* Category Info */}
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
          {name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>
        <span className="inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
          Explore Collection
          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
