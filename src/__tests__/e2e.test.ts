/**
 * E2E Test Suite for Template Catalog API
 * Tests critical user flows and API integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { SignJWT } from 'jose';

const API_BASE_URL = 'http://localhost:3002';
const JWT_SECRET = process.env.JWT_SECRET || 'template-jwt-secret';

/**
 * Helper function to generate JWT token for testing
 */
async function generateTestToken() {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({ userId: 'test-admin', email: 'admin@example.com', role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
  return token;
}

/**
 * Helper function to make API calls
 */
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add Authorization header if token is available and not explicitly skipped
  // We'll set this globally in beforeAll
  if (globalThis.authToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${globalThis.authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return {
    status: response.status,
    data: await response.json(),
  };
}

// Declare global type for authToken
declare global {
  // eslint-disable-next-line no-var
  var authToken: string;
}

describe('E2E: Template Catalog API', () => {
  let createdProductId: number;
  let createdCategoryId: number;
  let createdPostId: number;


  beforeAll(async () => {
    globalThis.authToken = await generateTestToken();
  });

  describe('Health & Documentation', () => {
    it('should return API health status', async () => {
      const result = await apiCall('/api/health');
      expect(result.status).toBe(200);
      expect(result.data.status).toBe('ok');
    });

    it('should return API documentation', async () => {
      const result = await apiCall('/api/api-docs');
      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('openapi');
    });
  });

  describe('Categories API', () => {
    it('should list all categories', async () => {
      const result = await apiCall('/api/categories');
      expect(result.status).toBe(200);
      expect(Array.isArray(result.data.data)).toBe(true);
    });

    it('should create a category', async () => {
      const result = await apiCall('/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Category',
          slug: 'test-category',
          description: 'A test category',
          isActive: true,
        }),
      });

      expect(result.status).toBe(201);
      expect(result.data.data.id).toBeDefined();
      createdCategoryId = result.data.data.id;
    });

    it('should fetch a category by ID', async () => {
      if (!createdCategoryId) {
        console.warn('Skipping: No category ID available');
        return;
      }

      const result = await apiCall(`/api/categories/${createdCategoryId}`);
      expect(result.status).toBe(200);
      expect(result.data.data.id).toBe(createdCategoryId);
    });

    it('should update a category', async () => {
      if (!createdCategoryId) {
        console.warn('Skipping: No category ID available');
        return;
      }

      const result = await apiCall(`/api/categories/${createdCategoryId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Test Category',
        }),
      });

      expect(result.status).toBe(200);
      expect(result.data.data.name).toBe('Updated Test Category');
    });
  });

  describe('Products API', () => {
    it('should list all products', async () => {
      const result = await apiCall('/api/products');
      expect(result.status).toBe(200);
      expect(result.data.data).toBeDefined();
      expect(result.data.total).toBeDefined();
    });

    it('should create a product', async () => {
      if (!createdCategoryId) {
        console.warn('Skipping: No category ID available');
        return;
      }

      const result = await apiCall('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Diamond Ring',
          slug: 'test-diamond-ring',
          price: 999.99,
          description: 'A beautiful test diamond ring',
          categoryId: createdCategoryId,
          isActive: true,
        }),
      });

      expect(result.status).toBe(201);
      expect(result.data.data.id).toBeDefined();
      createdProductId = result.data.data.id;
    });

    it('should filter products by category', async () => {
      if (!createdCategoryId) {
        console.warn('Skipping: No category ID available');
        return;
      }

      const result = await apiCall(`/api/products?categoryId=${createdCategoryId}`);
      expect(result.status).toBe(200);
      expect(Array.isArray(result.data.data)).toBe(true);
    });

    it('should get product by slug', async () => {
      const result = await apiCall('/api/products/category/test-category');
      // Note: This endpoint may return 404 if no products in category
      expect([200, 404]).toContain(result.status);
    });

    it('should support pagination', async () => {
      const result = await apiCall('/api/products?limit=5&offset=0');
      expect(result.status).toBe(200);
      expect(result.data.limit).toBe(5);
      expect(result.data.offset).toBe(0);
    });

    it('should fetch a product by ID', async () => {
      if (!createdProductId) {
        console.warn('Skipping: No product ID available');
        return;
      }

      const result = await apiCall(`/api/products/${createdProductId}`);
      expect(result.status).toBe(200);
      expect(result.data.data.id).toBe(createdProductId);
    });

    it('should update a product', async () => {
      if (!createdProductId) {
        console.warn('Skipping: No product ID available');
        return;
      }

      const result = await apiCall(`/api/products/${createdProductId}`, {
        method: 'PUT',
        body: JSON.stringify({
          price: 1299.99,
        }),
      });

      expect(result.status).toBe(200);
      expect(result.data.data.price).toBe(1299.99);
    });
  });

  describe('Posts API', () => {
    it('should list all posts', async () => {
      const result = await apiCall('/api/posts');
      expect(result.status).toBe(200);
      expect(result.data.data).toBeDefined();
    });

    it('should create a post', async () => {
      const result = await apiCall('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Blog Post',
          slug: 'test-blog-post',
          content: '# Test Content',
          excerpt: 'This is a test blog post',
          published: true,
        }),
      });

      expect(result.status).toBe(201);
      expect(result.data.data.id).toBeDefined();
      createdPostId = result.data.data.id;
    });

    it('should fetch a post by slug', async () => {
      const result = await apiCall('/api/posts/slug/test-blog-post');
      expect([200, 404]).toContain(result.status);
    });

    it('should support pagination', async () => {
      const result = await apiCall('/api/posts?limit=10&offset=0');
      expect(result.status).toBe(200);
      expect(result.data.limit).toBe(10);
    });
  });

  describe('Projects API', () => {
    it('should list all projects', async () => {
      const result = await apiCall('/api/projects');
      expect(result.status).toBe(200);
      expect(result.data.data).toBeDefined();
    });

    it('should create a project', async () => {
      const result = await apiCall('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Project',
          slug: 'test-project',
          description: 'A test project case study',
          order: 1,
          isActive: true,
        }),
      });

      expect(result.status).toBe(201);
      expect(result.data.data.id).toBeDefined();
    });
  });

  describe('Form Submissions', () => {
    it('should submit a product inquiry', async () => {
      const result = await apiCall('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1-555-0123',
          company: 'Test Company',
          message: 'I am interested in bulk orders',
          productId: createdProductId || 1,
          productName: 'Test Product',
          turnstileToken: 'test-turnstile-token',
        }),
      });

      expect(result.status).toBe(201);
      expect(result.data.success).toBe(true);
    });

    it('should submit a general contact form', async () => {
      const result = await apiCall('/api/contacts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Jane Smith',
          email: 'jane@example.com',
          subject: 'Partnership Inquiry',
          message: 'We would like to discuss a partnership',
          phone: '+1-555-0456',
        }),
      });

      expect(result.status).toBe(201);
      expect(result.data.success).toBe(true);
    });

    it('should validate email format in submissions', async () => {
      const result = await apiCall('/api/contacts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Invalid Email',
          email: 'not-an-email',
          message: 'Test',
        }),
      });

      expect(result.status).toBe(400);
    });

    it('should require mandatory fields', async () => {
      const result = await apiCall('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // missing required fields
        }),
      });

      expect(result.status).toBe(400);
    });
  });

  describe('CORS Support', () => {
    it('should handle OPTIONS preflight requests', async () => {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'OPTIONS',
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });

    it('should include CORS headers in responses', async () => {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent resources', async () => {
      const result = await apiCall('/api/products/99999');
      expect(result.status).toBe(404);
    });

    it('should return 400 for invalid request data', async () => {
      const result = await apiCall('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          // missing required name and slug
          price: 100,
        }),
      });

      expect(result.status).toBe(400);
    });

    it('should return 404 for non-existent endpoints', async () => {
      const result = await apiCall('/api/nonexistent');
      expect(result.status).toBe(404);
    });
  });

  describe('Cleanup', () => {
    it('should delete created resources', async () => {
      if (createdProductId) {
        const result = await apiCall(`/api/products/${createdProductId}`, {
          method: 'DELETE',
        });
        expect([200, 404]).toContain(result.status);
      }

      if (createdPostId) {
        const result = await apiCall(`/api/posts/${createdPostId}`, {
          method: 'DELETE',
        });
        expect([200, 404]).toContain(result.status);
      }

      if (createdCategoryId) {
        const result = await apiCall(`/api/categories/${createdCategoryId}`, {
          method: 'DELETE',
        });
        expect([200, 404]).toContain(result.status);
      }
    });
  });
});
