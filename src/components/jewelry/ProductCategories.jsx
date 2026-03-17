import CategoryCard from '@/components/CategoryCard';
import IconCrystal from '@/components/icons/IconCrystal';
import IconSilver from '@/components/icons/IconSilver';
import IconChakra from '@/components/icons/IconChakra';
import IconAromatherapy from '@/components/icons/IconAromatherapy';
import { siteConfig } from '@/lib/site-config';

const categoryIcons = {
  'healing-crystal-jewelry': IconCrystal,
  '925-silver-crystal-jewelry': IconSilver,
  'chakra-yoga-jewelry': IconChakra,
  'aromatherapy-jewelry': IconAromatherapy,
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
            // Fallback with default categories
            <>
              <CategoryCard
                category={{
                  name: 'Quartz Capsule Line',
                  slug: 'healing-crystal-jewelry',
                  description: 'Mock bracelets and pendants for template previews.',
                  image: { url: siteConfig.scenePlaceholder }
                }}
                icon={IconCrystal}
              />
              <CategoryCard
                category={{
                  name: 'Silver Studio Line',
                  slug: '925-silver-crystal-jewelry',
                  description: 'Mock silver-tone assortment for navigation and card testing.',
                  image: { url: siteConfig.scenePlaceholder }
                }}
                icon={IconSilver}
              />
              <CategoryCard
                category={{
                  name: 'Mindful Ritual Edit',
                  slug: 'chakra-yoga-jewelry',
                  description: 'Mock wellness-inspired line for content density checks.',
                  image: { url: siteConfig.scenePlaceholder }
                }}
                icon={IconChakra}
              />
              <CategoryCard
                category={{
                  name: 'Aroma Companion Series',
                  slug: 'aromatherapy-jewelry',
                  description: 'Mock diffuser accessories with placeholder merchandising.',
                  image: { url: siteConfig.scenePlaceholder }
                }}
                icon={IconAromatherapy}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
