/**
 * Cloudflare Workers API Client
 * Replaces Strapi API calls with new Cloudflare Workers backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Generic fetch wrapper with error handling
 */
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const cacheStrategy = process.env.NODE_ENV === 'production' ? 'force-cache' : 'no-store';

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: cacheStrategy,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

/**
 * Products API
 */
export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await apiCall(`/api/products${query}`);
  return data.data || [];
};

export const fetchProductById = async (id) => {
  const data = await apiCall(`/api/products/${id}`);
  return data.data || null;
};

export const fetchProductsByCategory = async (slug) => {
  const data = await apiCall(`/api/products/category/${slug}`);
  return data.data || [];
};

export const createProduct = async (productData) => {
  const data = await apiCall('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  return data.data || null;
};

export const updateProduct = async (id, productData) => {
  const data = await apiCall(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
  return data.data || null;
};

export const deleteProduct = async (id) => {
  const data = await apiCall(`/api/products/${id}`, {
    method: 'DELETE',
  });
  return data.success || false;
};

/**
 * Categories API
 */
export const fetchCategories = async () => {
  const data = await apiCall('/api/categories');
  return data.data || [];
};

export const fetchCategoryById = async (id) => {
  const data = await apiCall(`/api/categories/${id}`);
  return data.data || null;
};

export const createCategory = async (categoryData) => {
  const data = await apiCall('/api/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
  return data.data || null;
};

export const updateCategory = async (id, categoryData) => {
  const data = await apiCall(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
  return data.data || null;
};

export const deleteCategory = async (id) => {
  const data = await apiCall(`/api/categories/${id}`, {
    method: 'DELETE',
  });
  return data.success || false;
};

/**
 * Posts API
 */
export const fetchPosts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await apiCall(`/api/posts${query}`);
  return data.data || [];
};

export const fetchPostById = async (id) => {
  const data = await apiCall(`/api/posts/${id}`);
  return data.data || null;
};

export const fetchPostBySlug = async (slug) => {
  const data = await apiCall(`/api/posts/slug/${slug}`);
  return data.data || null;
};

export const createPost = async (postData) => {
  const data = await apiCall('/api/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
  return data.data || null;
};

export const updatePost = async (id, postData) => {
  const data = await apiCall(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
  return data.data || null;
};

export const deletePost = async (id) => {
  const data = await apiCall(`/api/posts/${id}`, {
    method: 'DELETE',
  });
  return data.success || false;
};

/**
 * Projects API
 */
export const fetchProjects = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await apiCall(`/api/projects${query}`);
  return data.data || [];
};

export const fetchProjectById = async (id) => {
  const data = await apiCall(`/api/projects/${id}`);
  return data.data || null;
};

export const fetchProjectBySlug = async (slug) => {
  const data = await apiCall(`/api/projects/slug/${slug}`);
  return data.data || null;
};

export const createProject = async (projectData) => {
  const data = await apiCall('/api/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
  return data.data || null;
};

export const updateProject = async (id, projectData) => {
  const data = await apiCall(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  });
  return data.data || null;
};

export const deleteProject = async (id) => {
  const data = await apiCall(`/api/projects/${id}`, {
    method: 'DELETE',
  });
  return data.success || false;
};

/**
 * Inquiries API (Product inquiries)
 */
export const fetchInquiries = async () => {
  const data = await apiCall('/api/inquiries');
  return data.data || [];
};

export const fetchInquiryById = async (id) => {
  const data = await apiCall(`/api/inquiries/${id}`);
  return data.data || null;
};

export const createInquiry = async (inquiryData) => {
  const data = await apiCall('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(inquiryData),
  });
  return data.data || null;
};

export const updateInquiry = async (id, inquiryData) => {
  const data = await apiCall(`/api/inquiries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(inquiryData),
  });
  return data.data || null;
};

export const deleteInquiry = async (id) => {
  const data = await apiCall(`/api/inquiries/${id}`, {
    method: 'DELETE',
  });
  return data.success || false;
};

/**
 * Contacts API (General contact form)
 */
export const fetchContacts = async () => {
  const data = await apiCall('/api/contacts');
  return data.data || [];
};

export const fetchContactById = async (id) => {
  const data = await apiCall(`/api/contacts/${id}`);
  return data.data || null;
};

export const createContact = async (contactData) => {
  const data = await apiCall('/api/contacts', {
    method: 'POST',
    body: JSON.stringify(contactData),
  });
  return data.data || null;
};

export const updateContact = async (id, contactData) => {
  const data = await apiCall(`/api/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(contactData),
  });
  return data.data || null;
};

export const deleteContact = async (id) => {
  const data = await apiCall(`/api/contacts/${id}`, {
    method: 'DELETE',
  });
  return data.success || false;
};

/**
 * API Health Check
 */
export const checkApiHealth = async () => {
  try {
    const data = await apiCall('/api/health');
    return data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error.message);
    return false;
  }
};

/**
 * Get API Documentation
 */
export const getApiDocs = async () => {
  const data = await apiCall('/api');
  return data;
};
