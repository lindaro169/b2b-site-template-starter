/**
 * Product Filtering and Sorting Utilities
 * Provides helper functions for searching, filtering, and sorting products
 */

/**
 * Filter products based on search query
 * Searches in product name, title, description, and excerpt
 */
export function searchProducts(products, query) {
  if (!query || query.trim() === '') {
    return products;
  }

  const lowerQuery = query.toLowerCase().trim();

  return products.filter((product) => {
    const searchableFields = [
      product.name || '',
      product.title || '',
      product.description || '',
      product.excerpt || '',
    ];

    return searchableFields.some((field) =>
      field.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Filter products based on price range and stock status
 */
export function filterProducts(products, filters) {
  return products.filter((product) => {
    const { minPrice, maxPrice, inStock } = filters;

    // Price filter
    if (minPrice !== undefined && product.price < minPrice) {
      return false;
    }

    if (maxPrice !== undefined && product.price > maxPrice) {
      return false;
    }

    // Stock filter
    if (inStock && !product.inStock && product.moq > 5) {
      return false;
    }

    return true;
  });
}

/**
 * Sort products based on the specified criteria
 */
export function sortProducts(products, sortBy) {
  const sorted = [...products];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

    case 'oldest':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      });

    case 'price_low':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));

    case 'price_high':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));

    case 'name_asc':
      return sorted.sort((a, b) =>
        (a.title || a.name || '').localeCompare(b.title || b.name || '')
      );

    case 'name_desc':
      return sorted.sort((a, b) =>
        (b.title || b.name || '').localeCompare(a.title || a.name || '')
      );

    case 'popular':
      // Sort by popularity (could be based on views, sales, etc.)
      // For now, we'll sort by price descending as a proxy
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));

    default:
      return sorted;
  }
}

/**
 * Apply all filters and sorting to products
 * Combines search, filter, and sort operations
 */
export function applyProductFilters(
  products,
  searchQuery = '',
  filters = {},
  sortBy = 'newest'
) {
  // Step 1: Search
  let result = searchProducts(products, searchQuery);

  // Step 2: Filter
  if (filters && Object.keys(filters).length > 0) {
    result = filterProducts(result, filters);
  }

  // Step 3: Sort
  result = sortProducts(result, sortBy);

  return result;
}

/**
 * Get price range from products
 * Useful for setting min/max price filter boundaries
 */
export function getPriceRange(products) {
  if (!products || products.length === 0) {
    return { min: 0, max: 1000 };
  }

  const prices = products
    .map((p) => p.price || 0)
    .filter((p) => p > 0);

  if (prices.length === 0) {
    return { min: 0, max: 1000 };
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  // Round to nearest 10 for nice UI
  return {
    min: Math.floor(min / 10) * 10,
    max: Math.ceil(max / 10) * 10,
  };
}

/**
 * Get product statistics
 * Useful for displaying filter counts and summaries
 */
export function getProductStats(products) {
  if (!products || products.length === 0) {
    return {
      total: 0,
      inStock: 0,
      avgPrice: 0,
      priceRange: { min: 0, max: 0 },
    };
  }

  const inStock = products.filter((p) => p.inStock || p.moq <= 5).length;
  const avgPrice =
    products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length;
  const priceRange = getPriceRange(products);

  return {
    total: products.length,
    inStock,
    avgPrice: Math.round(avgPrice * 100) / 100,
    priceRange,
  };
}

/**
 * Paginate products array
 * Returns a subset of products for the specified page
 */
export function paginateProducts(products, currentPage, itemsPerPage = 20) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return products.slice(startIndex, endIndex);
}

/**
 * Calculate total pages for pagination
 */
export function calculateTotalPages(totalItems, itemsPerPage = 20) {
  if (totalItems === 0) return 1;
  return Math.ceil(totalItems / itemsPerPage);
}
