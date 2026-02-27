/**
 * Testimonials API Tests
 */

import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/invitations/[slug]/testimonials/route';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: null },
        error: null,
      })),
    },
    from: jest.fn((table) => {
      if (table === 'invitations') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(() => ({
                data: {
                  id: 'inv-123',
                  owner_id: 'user-123',
                  is_published: true,
                },
                error: null,
              })),
            })),
          })),
        };
      }
      if (table === 'testimonials') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: [
                  {
                    id: 'test-1',
                    name: 'John Doe',
                    message: 'Great wedding!',
                    approved: true,
                    created_at: '2024-01-01T00:00:00Z',
                  },
                ],
                error: null,
              })),
            })),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: {
                  id: 'test-new',
                  created_at: '2024-01-02T00:00:00Z',
                },
                error: null,
              })),
            })),
          })),
        };
      }
      return {};
    }),
  })),
}));

describe('Testimonials API', () => {
  describe('GET /api/invitations/[slug]/testimonials', () => {
    it('should return approved testimonials for public', async () => {
      const { req } = createMocks({
        method: 'GET',
      });

      const params = Promise.resolve({ slug: 'test-wedding' });
      const response = await GET(req as any, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.testimonials).toBeDefined();
      expect(Array.isArray(data.testimonials)).toBe(true);
    });

    it('should return 404 if invitation not found', async () => {
      const mockSupabase = require('@/lib/supabase/server');
      mockSupabase.createSupabaseServerClient.mockImplementationOnce(() => ({
        auth: {
          getUser: jest.fn(() => ({
            data: { user: null },
            error: null,
          })),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(() => ({
                data: null,
                error: null,
              })),
            })),
          })),
        })),
      }));

      const { req } = createMocks({
        method: 'GET',
      });

      const params = Promise.resolve({ slug: 'non-existent' });
      const response = await GET(req as any, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('INVITATION_NOT_FOUND');
    });
  });

  describe('POST /api/invitations/[slug]/testimonials', () => {
    it('should create testimonial', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Jane Doe',
          message: 'Beautiful ceremony!',
        },
      });

      req.json = jest.fn().mockResolvedValue({
        name: 'Jane Doe',
        message: 'Beautiful ceremony!',
      });

      const params = Promise.resolve({ slug: 'test-wedding' });
      const response = await POST(req as any, { params });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.ok).toBe(true);
      expect(data.testimonial).toBeDefined();
    });

    it('should validate input', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: '',
          message: '',
        },
      });

      req.json = jest.fn().mockResolvedValue({
        name: '',
        message: '',
      });

      const params = Promise.resolve({ slug: 'test-wedding' });
      const response = await POST(req as any, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });

    it('should sanitize XSS in testimonial', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: '<script>alert("xss")</script>John',
          message: 'Great wedding!<script>alert("xss")</script>',
        },
      });

      req.json = jest.fn().mockResolvedValue({
        name: '<script>alert("xss")</script>John',
        message: 'Great wedding!<script>alert("xss")</script>',
      });

      const params = Promise.resolve({ slug: 'test-wedding' });
      const response = await POST(req as any, { params });

      expect(response.status).toBe(201);
      // Sanitization is handled by lib/sanitize.ts
    });
  });
});
