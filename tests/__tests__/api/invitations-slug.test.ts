/**
 * Invitation by Slug API Route Tests
 * Tests for GET /api/invitations/[slug]
 * @jest-environment node
 */

import { GET } from '@/app/api/invitations/[slug]/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isValidTokenFormat } from '@/lib/token';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@/lib/token', () => ({
  isValidTokenFormat: jest.fn(),
}));

describe('GET /api/invitations/[slug]', () => {
  const mockParams = { slug: 'test-invitation' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when slug is missing', async () => {
    const request = new Request('http://localhost/api/invitations/');
    const params = Promise.resolve({ slug: '' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invitation slug is required');
  });

  it('returns 404 when invitation not found', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/invitations/test-invitation');
    const params = Promise.resolve(mockParams);

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Invitation not found');
  });

  it('returns 500 when database error occurs', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            }),
          }),
        }),
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/invitations/test-invitation');
    const params = Promise.resolve(mockParams);

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('returns 200 when invitation is found and published', async () => {
    const mockInvitation = {
      id: '123',
      slug: 'test-invitation',
      title: 'Test Wedding',
      is_published: true,
      require_token: false,
    };

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: mockInvitation,
                error: null,
              }),
            }),
          }),
        }),
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/invitations/test-invitation');
    const params = Promise.resolve(mockParams);

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.slug).toBe('test-invitation');
    expect(data.title).toBe('Test Wedding');
  });

  it('returns 403 when token is required but not provided', async () => {
    const mockInvitation = {
      id: '123',
      slug: 'test-invitation',
      title: 'Test Wedding',
      is_published: true,
      require_token: true,
    };

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: mockInvitation,
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/invitations/test-invitation');
    const params = Promise.resolve(mockParams);

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('TOKEN_REQUIRED');
  });

  it('returns 400 when token format is invalid', async () => {
    const mockInvitation = {
      id: '123',
      slug: 'test-invitation',
      title: 'Test Wedding',
      is_published: true,
      require_token: true,
    };

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: mockInvitation,
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);
    (isValidTokenFormat as jest.Mock).mockReturnValue(false);

    const request = new Request('http://localhost/api/invitations/test-invitation?token=invalid');
    const params = Promise.resolve(mockParams);

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('INVALID_TOKEN_FORMAT');
  });
});

