import qs from 'qs';

// Fetch utility function
async function fetchData(endpoint) {
  const token = process.env.STRAPI_READ_ONLY_TOKEN;
  const url = new URL(endpoint, process.env.NEXT_PUBLIC_STRAPI).href;
  const cacheStrategy = process.env.NODE_ENV === 'production' ? 'force-cache' : 'no-store';

  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: cacheStrategy,
  };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    // Only log errors in production; in development, use fallback data
    if (process.env.NODE_ENV === 'production') {
      console.error(`Error fetching data from ${endpoint}: ${error.message}`);
    }
    throw new Error(`Unable to fetch data from ${endpoint}.`);
  }
}

// ==========================================
// Product Categories
// ==========================================

export const fetchProductCategories = async () => {
  const query = qs.stringify(
    {
      populate: {
        image: { fields: ['url', 'alternativeText', 'width', 'height'] },
        products: { populate: 'featuredImage' },
      },
      sort: ['order:asc'],
      filters: {
        publishedAt: { $notNull: true },
      },
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `/api/product-categories?${query}`;
  const response = await fetchData(endpoint);

  return response.data.map(item => ({
    id: item.id,
    ...item.attributes,
    image: item.attributes.image?.data?.attributes,
  }));
};

// ==========================================
// Products
// ==========================================

export const fetchProducts = async (filters = {}) => {
  const query = qs.stringify(
    {
      populate: {
        featuredImage: { fields: ['url', 'alternativeText', 'width', 'height'] },
        gallery: { fields: ['url', 'alternativeText', 'width', 'height'] },
        category: { populate: '*' },
      },
      sort: ['order:asc', 'createdAt:desc'],
      filters: {
        publishedAt: { $notNull: true },
        ...filters,
      },
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `/api/products?${query}`;
  const response = await fetchData(endpoint);

  return response.data.map(item => ({
    id: item.id,
    ...item.attributes,
    featuredImage: item.attributes.featuredImage?.data?.attributes,
    gallery: item.attributes.gallery?.data?.map(img => img.attributes),
    category: item.attributes.category?.data?.attributes,
  }));
};

export const fetchFeaturedProducts = async (limit = 8) => {
  const query = qs.stringify(
    {
      populate: {
        featuredImage: { fields: ['url', 'alternativeText', 'width', 'height'] },
        category: { fields: ['name', 'slug'] },
      },
      filters: {
        publishedAt: { $notNull: true },
        isFeatured: { $eq: true },
      },
      sort: ['order:asc'],
      pagination: { limit },
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `/api/products?${query}`;
  const response = await fetchData(endpoint);

  return response.data.map(item => ({
    id: item.id,
    ...item.attributes,
    featuredImage: item.attributes.featuredImage?.data?.attributes,
    category: item.attributes.category?.data?.attributes,
  }));
};

export const fetchProduct = async (slug) => {
  const query = qs.stringify(
    {
      populate: {
        featuredImage: { fields: ['url', 'alternativeText', 'width', 'height'] },
        gallery: { fields: ['url', 'alternativeText', 'width', 'height'] },
        category: { populate: '*' },
      },
      filters: {
        slug: { $eq: slug },
        publishedAt: { $notNull: true },
      },
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `/api/products?${query}`;
  const response = await fetchData(endpoint);

  if (!response.data || response.data.length === 0) {
    return null;
  }

  const item = response.data[0];
  return {
    id: item.id,
    ...item.attributes,
    featuredImage: item.attributes.featuredImage?.data?.attributes,
    gallery: item.attributes.gallery?.data?.map(img => img.attributes),
    category: item.attributes.category?.data?.attributes,
  };
};

// ==========================================
// Testimonials
// ==========================================

export const fetchTestimonials = async (featured = false) => {
  const query = qs.stringify(
    {
      populate: {
        avatar: { fields: ['url', 'alternativeText', 'width', 'height'] },
      },
      sort: ['order:asc'],
      filters: {
        publishedAt: { $notNull: true },
        ...(featured && { isFeatured: { $eq: true } }),
      },
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `/api/testimonials?${query}`;
  const response = await fetchData(endpoint);

  return response.data.map(item => ({
    id: item.id,
    ...item.attributes,
    avatar: item.attributes.avatar?.data?.attributes,
  }));
};

// ==========================================
// FAQs
// ==========================================

export const fetchFAQs = async (filters = {}) => {
  const query = qs.stringify(
    {
      sort: ['order:asc'],
      filters: {
        publishedAt: { $notNull: true },
        ...filters,
      },
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `/api/faqs?${query}`;
  const response = await fetchData(endpoint);

  return response.data.map(item => ({
    id: item.id,
    ...item.attributes,
  }));
};

// ==========================================
// Product Slugs (for static generation)
// ==========================================

export const fetchProductSlugs = async () => {
  const query = qs.stringify(
    {
      fields: ['slug'],
      filters: {
        publishedAt: { $notNull: true },
      },
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `/api/products?${query}`;
  const response = await fetchData(endpoint);

  return response.data.map(item => item.attributes.slug);
};

// ==========================================
// B2B Specific - Categories & Products
// ==========================================

export const fetchCategories = async () => {
  const query = qs.stringify(
    {
      populate: {
        banner: { fields: ['url', 'alternativeText', 'width', 'height'] },
        icon: { fields: ['url', 'alternativeText', 'width', 'height'] },
      },
      sort: ['order:asc'],
      filters: {
        publishedAt: { $notNull: true },
      },
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `/api/categories?${query}`;
  const response = await fetchData(endpoint);

  return response.data.map(item => ({
    id: item.id,
    ...item.attributes,
    banner: item.attributes.banner?.data?.attributes,
    icon: item.attributes.icon?.data?.attributes,
  }));
};

export const fetchCategoryBySlug = async (slug) => {
  const query = qs.stringify(
    {
      populate: {
        banner: { fields: ['url', 'alternativeText', 'width', 'height'] },
        icon: { fields: ['url', 'alternativeText', 'width', 'height'] },
      },
      filters: {
        slug: { $eq: slug },
        publishedAt: { $notNull: true },
      },
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `/api/categories?${query}`;
  const response = await fetchData(endpoint);

  if (!response.data || response.data.length === 0) {
    return null;
  }

  const item = response.data[0];
  return {
    id: item.id,
    ...item.attributes,
    banner: item.attributes.banner?.data?.attributes,
    icon: item.attributes.icon?.data?.attributes,
  };
};

export const fetchProductsByCategory = async (categorySlug) => {
  const query = qs.stringify(
    {
      populate: {
        featuredImage: { fields: ['url', 'alternativeText', 'width', 'height'] },
        gallery: { fields: ['url', 'alternativeText', 'width', 'height'] },
        category: { fields: ['name', 'slug'] },
      },
      filters: {
        publishedAt: { $notNull: true },
        category: {
          slug: { $eq: categorySlug },
        },
      },
      sort: ['isBestSeller:desc', 'order:asc'],
      pagination: { limit: 100 },
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `/api/products?${query}`;
  const response = await fetchData(endpoint);

  return response.data.map(item => ({
    id: item.id,
    ...item.attributes,
    featuredImage: item.attributes.featuredImage?.data?.attributes,
    gallery: item.attributes.gallery?.data?.map(img => img.attributes),
    category: item.attributes.category?.data?.attributes,
  }));
};

export const fetchFeaturedGemstones = async () => {
  const query = qs.stringify(
    {
      populate: {
        image: { fields: ['url', 'alternativeText', 'width', 'height'] },
      },
      sort: ['order:asc'],
      filters: {
        publishedAt: { $notNull: true },
      },
      pagination: { limit: 6 },
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `/api/featured-gemstones?${query}`;
  const response = await fetchData(endpoint);

  return response.data.map(item => ({
    id: item.id,
    ...item.attributes,
    image: item.attributes.image?.data?.attributes,
  }));
};
