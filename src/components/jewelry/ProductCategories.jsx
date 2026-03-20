import CategoryCard from '@/components/CategoryCard';
import IconCrystal from '@/components/icons/IconCrystal';
import IconSilver from '@/components/icons/IconSilver';
import IconChakra from '@/components/icons/IconChakra';
import IconAromatherapy from '@/components/icons/IconAromatherapy';
import { siteConfig } from '@/lib/site-config';
import { MAIN_CATEGORIES } from '@/constants/categoryMapping';

const categoryIcons = {
  'template-collection-a': IconCrystal,
  'template-collection-b': IconSilver,
  'template-collection-c': IconChakra,
  'template-collection-d': IconAromatherapy,
};

export default function ProductCategories({ categories }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
            Explore Placeholder Collection Groups
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Each group below is populated with placeholder data so you can review layout, hierarchy, and navigation safely.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                icon={categoryIcons[category.slug]}
              />
            ))
          ) : (
            MAIN_CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={{
                  name: category.name,
                  slug: category.slug,
                  description: category.description,
                  image: { url: siteConfig.scenePlaceholder },
                }}
                icon={categoryIcons[category.slug]}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
