/**
 * 分类映射常数 (Category Mapping Constants)
 *
 * 将前端URL中的分类slug映射到后端的categoryId
 * Maps frontend category slugs to backend category IDs
 *
 * 这使得前端可以使用语义化的分类名称（如 "healing-crystal-jewelry"）
 * 而后端管理分类时使用统一的ID
 *
 * 分类结构（树形）:
 * Tree structure:
 * - Healing Crystal Jewelry (ID: 1, parent_id: NULL)
 *   - Bracelets (ID: 11, parent_id: 1)
 *   - Necklaces (ID: 12, parent_id: 1)
 * - 925 Silver & Crystal Jewelry (ID: 2, parent_id: NULL)
 *   - Bracelets (ID: 21, parent_id: 2)
 *   - Necklaces (ID: 22, parent_id: 2)
 * ... etc
 */

/**
 * 分类树形结构接口
 * Category tree structure interface
 */
export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  parentId: number | null; // NULL for top-level categories
  children?: Category[];
}

/**
 * 主分类（顶级分类）
 * Main categories (top-level)
 */
export const MAIN_CATEGORIES: Category[] = [
  {
    id: 1,
    slug: 'healing-crystal-jewelry',
    name: 'Healing Crystal Jewelry',
    description:
      'Natural healing crystal stones and beads jewelry for spiritual wellness and healing energy.',
    icon: '🔮',
    parentId: null,
  },
  {
    id: 2,
    slug: '925-silver-crystal-jewelry',
    name: '925 Silver & Crystal Jewelry',
    description:
      'Premium 925 sterling silver jewelry combined with natural crystals and gemstones.',
    icon: '✨',
    parentId: null,
  },
  {
    id: 3,
    slug: 'chakra-yoga-jewelry',
    name: 'Chakra & Yoga Jewelry',
    description:
      'Chakra balancing jewelry and yoga-inspired accessories for meditation and spiritual practice.',
    icon: '☮️',
    parentId: null,
  },
  {
    id: 4,
    slug: 'aromatherapy-jewelry',
    name: 'Aromatherapy Jewelry',
    description:
      'Diffuser jewelry and aromatherapy accessories for essential oils and natural wellness.',
    icon: '🌿',
    parentId: null,
  },
];

/**
 * 子分类（每个主分类都有这两个子分类）
 * Subcategories (bracelets and necklaces for each main category)
 */
export const SUB_CATEGORIES: Record<number, Category[]> = {
  1: [
    {
      id: 11,
      slug: 'bracelets',
      name: 'Bracelets',
      description: 'Healing crystal bracelets',
      icon: '📿',
      parentId: 1,
    },
    {
      id: 12,
      slug: 'necklaces',
      name: 'Necklaces',
      description: 'Healing crystal necklaces',
      icon: '💎',
      parentId: 1,
    },
  ],
  2: [
    {
      id: 21,
      slug: 'bracelets',
      name: 'Bracelets',
      description: '925 silver crystal bracelets',
      icon: '📿',
      parentId: 2,
    },
    {
      id: 22,
      slug: 'necklaces',
      name: 'Necklaces',
      description: '925 silver crystal necklaces',
      icon: '💎',
      parentId: 2,
    },
  ],
  3: [
    {
      id: 31,
      slug: 'bracelets',
      name: 'Bracelets',
      description: 'Chakra and yoga bracelets',
      icon: '📿',
      parentId: 3,
    },
    {
      id: 32,
      slug: 'necklaces',
      name: 'Necklaces',
      description: 'Chakra and yoga necklaces',
      icon: '💎',
      parentId: 3,
    },
  ],
  4: [
    {
      id: 41,
      slug: 'bracelets',
      name: 'Bracelets',
      description: 'Aromatherapy diffuser bracelets',
      icon: '📿',
      parentId: 4,
    },
    {
      id: 42,
      slug: 'necklaces',
      name: 'Necklaces',
      description: 'Aromatherapy diffuser necklaces',
      icon: '💎',
      parentId: 4,
    },
  ],
};

/**
 * 旧的分类slug到ID的映射（保持向后兼容）
 * Legacy category slug to ID mapping (for backward compatibility)
 */
export const CATEGORY_SLUG_TO_ID: Record<string, number> = {
  'healing-crystal-jewelry': 1,
  '925-silver-crystal-jewelry': 2,
  'chakra-yoga-jewelry': 3,
  'aromatherapy-jewelry': 4,
};

/**
 * 旧的ID到分类slug的反向映射（保持向后兼容）
 * Legacy category ID to slug mapping (for backward compatibility)
 */
export const CATEGORY_ID_TO_SLUG: Record<number, string> = {
  1: 'healing-crystal-jewelry',
  2: '925-silver-crystal-jewelry',
  3: 'chakra-yoga-jewelry',
  4: 'aromatherapy-jewelry',
};

/**
 * 旧的分类元数据（保持向后兼容）
 * Legacy category metadata (for backward compatibility)
 */
export const CATEGORY_METADATA: Record<
  string,
  {
    name: string;
    description: string;
    icon: string;
  }
> = {
  'healing-crystal-jewelry': {
    name: 'Healing Crystal Jewelry',
    description:
      'Natural healing crystal stones and beads jewelry for spiritual wellness and healing energy.',
    icon: '🔮',
  },
  '925-silver-crystal-jewelry': {
    name: '925 Silver & Crystal Jewelry',
    description:
      'Premium 925 sterling silver jewelry combined with natural crystals and gemstones.',
    icon: '✨',
  },
  'chakra-yoga-jewelry': {
    name: 'Chakra & Yoga Jewelry',
    description:
      'Chakra balancing jewelry and yoga-inspired accessories for meditation and spiritual practice.',
    icon: '☮️',
  },
  'aromatherapy-jewelry': {
    name: 'Aromatherapy Jewelry',
    description:
      'Diffuser jewelry and aromatherapy accessories for essential oils and natural wellness.',
    icon: '🌿',
  },
};

/**
 * 产品类型（子分类的详细信息）
 * Product types (subtypes) - detailed information for product listing pages
 */
export const PRODUCT_TYPES = {
  bracelets: {
    name: 'Bracelets',
    description:
      'Elegant and powerful bracelets designed for daily wear. Each piece combines beauty with intention, perfect for your customers who seek both style and spiritual benefits.',
    icon: '📿',
    features: [
      'Adjustable sizing for most wrists',
      'Durable elastic cord or silver chains',
      'High-quality natural stones',
      'Suitable for layering and stacking',
    ],
  },
  necklaces: {
    name: 'Necklaces',
    description:
      'Stunning necklaces featuring carefully selected gemstones and crystals. These statement pieces are perfect for retailers looking to offer their customers elegant, meaningful jewelry.',
    icon: '💎',
    features: [
      'Adjustable chain lengths available',
      'Premium quality clasps',
      'Natural gemstone pendants',
      'Gift-ready packaging options',
    ],
  },
};

/**
 * 获取分类ID
 * Get category ID by slug
 * @param slug - 分类slug (category slug)
 * @returns 分类ID或undefined (category ID or undefined)
 */
export function getCategoryId(slug: string): number | undefined {
  return CATEGORY_SLUG_TO_ID[slug];
}

/**
 * 获取分类Slug
 * Get category slug by ID
 * @param id - 分类ID (category ID)
 * @returns 分类slug或undefined (category slug or undefined)
 */
export function getCategorySlug(id: number): string | undefined {
  return CATEGORY_ID_TO_SLUG[id];
}

/**
 * 获取分类名称
 * Get category name by slug
 * @param slug - 分类slug (category slug)
 * @returns 分类名称 (category name)
 */
export function getCategoryName(slug: string): string {
  return CATEGORY_METADATA[slug]?.name || slug;
}

/**
 * 获取所有分类slug列表
 * Get list of all category slugs
 * @returns 分类slug数组 (array of category slugs)
 */
export function getAllCategorySlugs(): string[] {
  return Object.keys(CATEGORY_SLUG_TO_ID);
}

/**
 * 验证分类slug是否有效
 * Validate if category slug is valid
 * @param slug - 分类slug (category slug)
 * @returns 是否有效 (is valid)
 */
export function isValidCategorySlug(slug: string): boolean {
  return CATEGORY_SLUG_TO_ID.hasOwnProperty(slug);
}

/**
 * 验证产品类型是否有效
 * Validate if product type is valid
 * @param type - 产品类型 (product type)
 * @returns 是否有效 (is valid)
 */
export function isValidProductType(type: string): boolean {
  return PRODUCT_TYPES.hasOwnProperty(type);
}

/**
 * 获取主分类列表（顶级分类）
 * Get main categories (top-level categories)
 * @returns 主分类数组 (array of main categories)
 */
export function getMainCategories(): Category[] {
  return MAIN_CATEGORIES;
}

/**
 * 获取子分类列表
 * Get subcategories for a main category
 * @param parentId - 主分类ID (main category ID)
 * @returns 子分类数组 (array of subcategories)
 */
export function getSubCategories(parentId: number): Category[] {
  return SUB_CATEGORIES[parentId] || [];
}

/**
 * 获取完整的分类树
 * Get full category tree with children
 * @returns 分类树（包含children）(category tree with children)
 */
export function getCategoryTree(): Category[] {
  return MAIN_CATEGORIES.map((category) => ({
    ...category,
    children: SUB_CATEGORIES[category.id],
  }));
}

/**
 * 获取分类信息（按ID）
 * Get category by ID
 * @param id - 分类ID (category ID)
 * @returns 分类对象或undefined
 */
export function getCategoryById(id: number): Category | undefined {
  // 检查主分类
  const mainCategory = MAIN_CATEGORIES.find((cat) => cat.id === id);
  if (mainCategory) return mainCategory;

  // 检查所有子分类
  for (const subcategories of Object.values(SUB_CATEGORIES)) {
    const subCategory = subcategories.find((cat) => cat.id === id);
    if (subCategory) return subCategory;
  }

  return undefined;
}

/**
 * 获取分类信息（按slug）
 * Get category by slug
 * @param slug - 分类slug (category slug)
 * @returns 分类对象或undefined
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  // 检查主分类
  const mainCategory = MAIN_CATEGORIES.find((cat) => cat.slug === slug);
  if (mainCategory) return mainCategory;

  // 检查所有子分类
  for (const subcategories of Object.values(SUB_CATEGORIES)) {
    const subCategory = subcategories.find((cat) => cat.slug === slug);
    if (subCategory) return subCategory;
  }

  return undefined;
}

/**
 * 获取主分类对应的子分类（按主分类slug）
 * Get subcategories by main category slug
 * @param mainCategorySlug - 主分类slug (main category slug)
 * @returns 子分类数组 (array of subcategories)
 */
export function getSubCategoriesByMainSlug(mainCategorySlug: string): Category[] {
  const mainCategory = MAIN_CATEGORIES.find((cat) => cat.slug === mainCategorySlug);
  if (!mainCategory) return [];
  return getSubCategories(mainCategory.id);
}

/**
 * 验证是否为主分类slug
 * Check if slug is a main category
 * @param slug - 分类slug (category slug)
 * @returns 是否为主分类 (is main category)
 */
export function isMainCategorySlug(slug: string): boolean {
  return MAIN_CATEGORIES.some((cat) => cat.slug === slug);
}

/**
 * 验证是否为子分类slug（在特定主分类下）
 * Check if slug is a subcategory of main category
 * @param mainSlug - 主分类slug (main category slug)
 * @param subSlug - 子分类slug (subcategory slug)
 * @returns 是否为该主分类的子分类 (is subcategory of main)
 */
export function isSubCategorySlug(mainSlug: string, subSlug: string): boolean {
  const subcategories = getSubCategoriesByMainSlug(mainSlug);
  return subcategories.some((cat) => cat.slug === subSlug);
}
