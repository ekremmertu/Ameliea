/**
 * User Profile API Tests
 */

import { createMocks } from 'node-mocks-http';
import { GET, PATCH } from '@/app/api/user/profile/route';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
              name: 'Test User',
              phone: '+905551234567',
            },
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
        error: null,
      })),
      updateUser: jest.fn(() => ({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
              name: 'Updated User',
              phone: '+905559876543',
            },
            updated_at: '2024-01-02T00:00:00Z',
          },
        },
        error: null,
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    })),
  })),
}));

describe('User Profile API', () => {
  describe('GET /api/user/profile', () => {
    it('should return user profile', async () => {
      const { req } = createMocks({
        method: 'GET',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.profile).toBeDefined();
      expect(data.profile.email).toBe('test@example.com');
      expect(data.profile.name).toBe('Test User');
    });

    it('should return 401 if not authenticated', async () => {
      const mockSupabase = require('@/lib/supabase/server');
      mockSupabase.createSupabaseServerClient.mockImplementationOnce(() => ({
        auth: {
          getUser: jest.fn(() => ({
            data: { user: null },
            error: { message: 'Not authenticated' },
          })),
        },
      }));

      const { req } = createMocks({
        method: 'GET',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /api/user/profile', () => {
    it('should update user profile', async () => {
      const { req } = createMocks({
        method: 'PATCH',
        body: {
          name: 'Updated User',
          phone: '+905559876543',
        },
      });

      // Mock json() method
      req.json = jest.fn().mockResolvedValue({
        name: 'Updated User',
        phone: '+905559876543',
      });

      const response = await PATCH(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.profile.name).toBe('Updated User');
    });

    it('should validate input', async () => {
      const { req } = createMocks({
        method: 'PATCH',
        body: {
          name: 'A', // Too short
        },
      });

      req.json = jest.fn().mockResolvedValue({
        name: 'A',
      });

      const response = await PATCH(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });

    it('should sanitize input', async () => {
      const { req } = createMocks({
        method: 'PATCH',
        body: {
          name: '<script>alert("xss")</script>Test User',
          phone: '+90 555 123 45 67',
        },
      });

      req.json = jest.fn().mockResolvedValue({
        name: '<script>alert("xss")</script>Test User',
        phone: '+90 555 123 45 67',
      });

      const response = await PATCH(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Name should be sanitized (HTML removed)
      expect(data.profile.name).not.toContain('<script>');
      // Phone should be sanitized (spaces removed)
      expect(data.profile.phone).toBe('+905551234567');
    });
  });
});
