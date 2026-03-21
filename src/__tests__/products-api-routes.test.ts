import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  verifyAuth: vi.fn(),
  getCloudflareContext: vi.fn(),
  getD1Database: vi.fn(),
}));

vi.mock('@/lib/products', () => ({
  getProducts: mocks.getProducts,
  getProductById: mocks.getProductById,
  createProduct: mocks.createProduct,
  updateProduct: mocks.updateProduct,
  deleteProduct: mocks.deleteProduct,
}));

vi.mock('@/lib/auth', () => ({
  verifyAuth: mocks.verifyAuth,
}));

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: mocks.getCloudflareContext,
}));

vi.mock('@/lib/d1-db', () => ({
  getD1Database: mocks.getD1Database,
}));

import { GET as getProductsRoute } from '@/app/api/products/route';
import { GET as getProductRoute } from '@/app/api/products/[id]/route';

describe('Products API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCloudflareContext.mockRejectedValue(
      new Error('Cloudflare context unavailable')
    );
    mocks.getD1Database.mockReturnValue(undefined);
  });

  it('returns paginated products from the current Next route', async () => {
    mocks.getProducts.mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          name: 'Template Product',
          slug: 'template-product',
          isActive: true,
          createdAt: '2026-03-20T00:00:00.000Z',
          updatedAt: '2026-03-20T00:00:00.000Z',
        },
      ],
      total: 1,
    });

    const response = await getProductsRoute(
      new NextRequest('http://localhost:3002/api/products?limit=10&offset=0')
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      total: 1,
      page: 1,
      limit: 10,
      offset: 0,
      hasMore: false,
    });
    expect(body.data).toHaveLength(1);
  });

  it('sanitizes product list failures without leaking internals', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    mocks.getProducts.mockRejectedValue(new Error('database exploded'));

    const response = await getProductsRoute(
      new NextRequest('http://localhost:3002/api/products')
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      error: '获取产品列表失败',
    });
    expect(body).not.toHaveProperty('details');
    expect(body).not.toHaveProperty('stack');

    consoleErrorSpy.mockRestore();
  });

  it('returns product detail from the current dynamic route', async () => {
    mocks.getProductById.mockResolvedValue({
      success: true,
      data: {
        id: 7,
        name: 'Template Product',
        slug: 'template-product',
        isActive: true,
        createdAt: '2026-03-20T00:00:00.000Z',
        updatedAt: '2026-03-20T00:00:00.000Z',
      },
    });

    const response = await getProductRoute(
      new NextRequest('http://localhost:3002/api/products/7'),
      { params: { id: '7' } }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        id: 7,
        slug: 'template-product',
      },
    });
  });

  it('returns 404 for missing products in the current dynamic route', async () => {
    mocks.getProductById.mockResolvedValue({
      success: false,
      error: '产品不存在',
    });

    const response = await getProductRoute(
      new NextRequest('http://localhost:3002/api/products/404'),
      { params: { id: '404' } }
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      success: false,
      error: '产品不存在',
    });
  });
});
