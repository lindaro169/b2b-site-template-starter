import { describe, expect, it } from 'vitest';

const RUN_API_E2E = process.env.RUN_API_E2E === 'true';
const API_BASE_URL = process.env.TEST_API_BASE_URL || 'http://localhost:3002';
const describeE2E = RUN_API_E2E ? describe : describe.skip;

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  return {
    status: response.status,
    data: await response.json(),
  };
}

describeE2E('E2E: Public API', () => {
  it('returns health status from the running app', async () => {
    const result = await apiCall('/api/health');

    expect(result.status).toBe(200);
    expect(result.data.status).toBe('ok');
  });

  it('returns product listing data', async () => {
    const result = await apiCall('/api/products?limit=5&offset=0');

    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
    expect(result.data.limit).toBe(5);
    expect(result.data.offset).toBe(0);
    expect(Array.isArray(result.data.data)).toBe(true);
  });

  it('rejects invalid product list parameters with a stable error shape', async () => {
    const result = await apiCall('/api/products?limit=999');

    expect(result.status).toBe(400);
    expect(result.data).toMatchObject({
      success: false,
      error: 'limit 必须在 1-100 之间',
    });
  });

  it('validates contact submissions through the current public endpoint', async () => {
    const result = await apiCall('/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: '',
        email: 'invalid-email',
        message: '',
      }),
    });

    expect(result.status).toBe(400);
    expect(result.data.success).toBe(false);
    expect(typeof result.data.error).toBe('string');
  });

  it('validates inquiry submissions through the current public endpoint', async () => {
    const result = await apiCall('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify({
        name: '',
        email: 'invalid-email',
        productName: '',
        message: '',
      }),
    });

    expect(result.status).toBe(400);
    expect(result.data.success).toBe(false);
    expect(typeof result.data.error).toBe('string');
  });
});
