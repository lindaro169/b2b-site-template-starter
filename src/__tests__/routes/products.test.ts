/**
 * Unit Tests for Products API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createProductsRouter } from '../routes/products';

describe('Products API', () => {
  let mockDb: Record<string, ReturnType<typeof vi.fn>>;
  let router: ReturnType<typeof createProductsRouter>;

  beforeEach(() => {
    // Mock database
    mockDb = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([
              {
                id: 1,
                name: 'Diamond Ring',
                slug: 'diamond-ring',
                price: 999.99,
                isActive: 1,
                categoryId: 1,
              },
            ]),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([
            {
              id: 2,
              name: 'Gold Necklace',
              slug: 'gold-necklace',
              price: 599.99,
              isActive: 1,
              categoryId: 1,
            },
          ]),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn().mockResolvedValue([
              {
                id: 1,
                name: 'Updated Ring',
                price: 1099.99,
              },
            ]),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        })),
      })),
    };

    router = createProductsRouter(mockDb);
  });

  describe('GET /api/products', () => {
    it('should fetch all products', async () => {
      const response = await router.handle(
        new Request('http://localhost:3000/api/products')
      );
      expect(response.status).toBe(200);
    });

    it('should support pagination', async () => {
      const response = await router.handle(
        new Request('http://localhost:3000/api/products?limit=10&offset=0')
      );
      expect(response.status).toBe(200);
    });

    it('should filter by category', async () => {
      const response = await router.handle(
        new Request('http://localhost:3000/api/products?categoryId=1')
      );
      expect(response.status).toBe(200);
    });

    it('should filter by active status', async () => {
      const response = await router.handle(
        new Request('http://localhost:3000/api/products?isActive=true')
      );
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should fetch product by ID', async () => {
      const response = await router.handle(
        new Request('http://localhost:3000/api/products/1')
      );
      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent product', async () => {
      // Mock DB to return empty array
      mockDb.select = vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([]),
          })),
        })),
      }));

      const response = await router.handle(
        new Request('http://localhost:3000/api/products/999')
      );
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Gold Necklace',
          slug: 'gold-necklace',
          price: 599.99,
          isActive: true,
          categoryId: 1,
        }),
      });

      const response = await router.handle(request);
      expect(response.status).toBe(201);
    });

    it('should validate required fields', async () => {
      const request = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: 599.99,
          // missing name and slug
        }),
      });

      const response = await router.handle(request);
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const request = new Request('http://localhost:3000/api/products/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Ring',
          price: 1099.99,
        }),
      });

      const response = await router.handle(request);
      expect(response.status).toBe(200);
    });

    it('should return 404 when updating non-existent product', async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn().mockResolvedValue([]),
          })),
        })),
      }));

      const request = new Request('http://localhost:3000/api/products/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated' }),
      });

      const response = await router.handle(request);
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const request = new Request('http://localhost:3000/api/products/1', {
        method: 'DELETE',
      });

      const response = await router.handle(request);
      expect(response.status).toBe(200);
    });

    it('should return 404 when deleting non-existent product', async () => {
      mockDb.delete = vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([]),
        })),
      }));

      const request = new Request('http://localhost:3000/api/products/999', {
        method: 'DELETE',
      });

      const response = await router.handle(request);
      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.select = vi.fn(() => {
        throw new Error('Database connection failed');
      });

      const response = await router.handle(
        new Request('http://localhost:3000/api/products')
      );
      expect(response.status).toBe(500);
    });
  });
});
