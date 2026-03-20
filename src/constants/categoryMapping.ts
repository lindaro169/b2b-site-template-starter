/**
 * 分类映射常量
 *
 * 前台使用模板化的 mock slug，数据库仍可保留旧 slug。
 * 读取层通过兼容映射把旧 slug 解析到同一个分类 ID，
 * 这样既能统一用户可见 URL，也不会因为旧数据导致页面失效。
 */

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  parentId: number | null;
  children?: Category[];
}

type MainCategoryDefinition = {
  id: number;
  slug: string;
  legacySlug: string;
  name: string;
  description: string;
  icon: string;
};

const MAIN_CATEGORY_DEFINITIONS: MainCategoryDefinition[] = [
  {
    id: 1,
    slug: 'template-collection-a',
    legacySlug: 'healing-crystal-jewelry',
    name: 'Template Collection A',
    description:
      'Placeholder category for pre-launch review, content structure checks, and future assortment replacement.',
    icon: '🔮',
  },
  {
    id: 2,
    slug: 'template-collection-b',
    legacySlug: '925-silver-crystal-jewelry',
    name: 'Template Collection B',
    description:
      'Placeholder category for alternate merchandising, hierarchy review, and demo navigation states.',
    icon: '✨',
  },
  {
    id: 3,
    slug: 'template-collection-c',
    legacySlug: 'chakra-yoga-jewelry',
    name: 'Template Collection C',
    description:
      'Placeholder category for secondary assortment demos and section-level copy validation.',
    icon: '☮️',
  },
  {
    id: 4,
    slug: 'template-collection-d',
    legacySlug: 'aromatherapy-jewelry',
    name: 'Template Collection D',
    description:
      'Placeholder category for accessory-style demos and safe internal review of page layouts.',
    icon: '🌿',
  },
];

export const MAIN_CATEGORIES: Category[] = MAIN_CATEGORY_DEFINITIONS.map(
  (category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    icon: category.icon,
    parentId: null,
  })
);

export const SUB_CATEGORIES: Record<number, Category[]> = {
  1: [
    {
      id: 11,
      slug: 'bracelets',
      name: 'Template Bracelets',
      description: 'Placeholder bracelet entries for layout review',
      icon: '📿',
      parentId: 1,
    },
    {
      id: 12,
      slug: 'necklaces',
      name: 'Template Pendants',
      description: 'Placeholder pendant entries for layout review',
      icon: '💎',
      parentId: 1,
    },
  ],
  2: [
    {
      id: 21,
      slug: 'bracelets',
      name: 'Template Bracelets',
      description: 'Placeholder bracelet entries for layout review',
      icon: '📿',
      parentId: 2,
    },
    {
      id: 22,
      slug: 'necklaces',
      name: 'Template Pendants',
      description: 'Placeholder pendant entries for layout review',
      icon: '💎',
      parentId: 2,
    },
  ],
  3: [
    {
      id: 31,
      slug: 'bracelets',
      name: 'Template Bracelets',
      description: 'Placeholder bracelet entries for layout review',
      icon: '📿',
      parentId: 3,
    },
    {
      id: 32,
      slug: 'necklaces',
      name: 'Template Pendants',
      description: 'Placeholder pendant entries for layout review',
      icon: '💎',
      parentId: 3,
    },
  ],
  4: [
    {
      id: 41,
      slug: 'bracelets',
      name: 'Template Bracelets',
      description: 'Placeholder bracelet entries for layout review',
      icon: '📿',
      parentId: 4,
    },
    {
      id: 42,
      slug: 'necklaces',
      name: 'Template Pendants',
      description: 'Placeholder pendant entries for layout review',
      icon: '💎',
      parentId: 4,
    },
  ],
};

export const CATEGORY_SLUG_TO_ID: Record<string, number> = Object.fromEntries(
  MAIN_CATEGORY_DEFINITIONS.map((category) => [category.slug, category.id])
);

export const LEGACY_CATEGORY_SLUG_TO_ID: Record<string, number> = Object.fromEntries(
  MAIN_CATEGORY_DEFINITIONS.map((category) => [category.legacySlug, category.id])
);

export const CATEGORY_ID_TO_SLUG: Record<number, string> = Object.fromEntries(
  MAIN_CATEGORY_DEFINITIONS.map((category) => [category.id, category.slug])
);

export const CATEGORY_METADATA: Record<
  string,
  {
    name: string;
    description: string;
    icon: string;
  }
> = Object.fromEntries(
  MAIN_CATEGORY_DEFINITIONS.map((category) => [
    category.slug,
    {
      name: category.name,
      description: category.description,
      icon: category.icon,
    },
  ])
);

export const PRODUCT_TYPES = {
  bracelets: {
    name: 'Template Bracelets',
    description:
      'Placeholder bracelet entries used to review filters, cards, and subcategory layouts before your real catalog is loaded.',
    icon: '📿',
    features: [
      'Replace this section title before publishing',
      'Swap in approved imagery and pricing later',
      'Useful for internal layout and hierarchy review',
      'Safe placeholder content for staging demos',
    ],
  },
  necklaces: {
    name: 'Template Pendants',
    description:
      'Placeholder pendant and necklace entries used to validate navigation, imagery, and content density in the template.',
    icon: '💎',
    features: [
      'Replace this section title before publishing',
      'Swap in approved imagery and pricing later',
      'Useful for internal layout and hierarchy review',
      'Safe placeholder content for staging demos',
    ],
  },
};

export function getCategoryId(slug: string): number | undefined {
  return CATEGORY_SLUG_TO_ID[slug] ?? LEGACY_CATEGORY_SLUG_TO_ID[slug];
}

export function getCategorySlug(id: number): string | undefined {
  return CATEGORY_ID_TO_SLUG[id];
}

export function getCanonicalCategorySlug(slug: string): string | undefined {
  const categoryId = getCategoryId(slug);
  if (categoryId === undefined) {
    return undefined;
  }

  return getCategorySlug(categoryId);
}

export function getCategoryName(slug: string): string {
  const canonicalSlug = getCanonicalCategorySlug(slug) ?? slug;
  return CATEGORY_METADATA[canonicalSlug]?.name || slug;
}

export function getAllCategorySlugs(): string[] {
  return MAIN_CATEGORIES.map((category) => category.slug);
}

export function isValidCategorySlug(slug: string): boolean {
  return getCategoryId(slug) !== undefined;
}

export function isValidProductType(type: string): boolean {
  return Object.prototype.hasOwnProperty.call(PRODUCT_TYPES, type);
}

export function getMainCategories(): Category[] {
  return MAIN_CATEGORIES;
}

export function getSubCategories(parentId: number): Category[] {
  return SUB_CATEGORIES[parentId] || [];
}

export function getCategoryTree(): Category[] {
  return MAIN_CATEGORIES.map((category) => ({
    ...category,
    children: SUB_CATEGORIES[category.id],
  }));
}

export function getCategoryById(id: number): Category | undefined {
  const mainCategory = MAIN_CATEGORIES.find((category) => category.id === id);
  if (mainCategory) {
    return mainCategory;
  }

  for (const subcategories of Object.values(SUB_CATEGORIES)) {
    const subCategory = subcategories.find((category) => category.id === id);
    if (subCategory) {
      return subCategory;
    }
  }

  return undefined;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  const canonicalSlug = getCanonicalCategorySlug(slug);
  if (canonicalSlug) {
    return MAIN_CATEGORIES.find((category) => category.slug === canonicalSlug);
  }

  for (const subcategories of Object.values(SUB_CATEGORIES)) {
    const subCategory = subcategories.find((category) => category.slug === slug);
    if (subCategory) {
      return subCategory;
    }
  }

  return undefined;
}

export function getSubCategoriesByMainSlug(mainCategorySlug: string): Category[] {
  const categoryId = getCategoryId(mainCategorySlug);
  if (categoryId === undefined) {
    return [];
  }

  return getSubCategories(categoryId);
}

export function isMainCategorySlug(slug: string): boolean {
  const categoryId = getCategoryId(slug);
  if (categoryId === undefined) {
    return false;
  }

  return MAIN_CATEGORIES.some((category) => category.id === categoryId);
}

export function isSubCategorySlug(mainSlug: string, subSlug: string): boolean {
  const subcategories = getSubCategoriesByMainSlug(mainSlug);
  return subcategories.some((category) => category.slug === subSlug);
}
