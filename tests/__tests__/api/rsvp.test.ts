/**
 * RSVP API Route Tests
 * Tests for POST /api/rsvp
 * @jest-environment node
 */

import { POST } from '@/app/api/rsvp/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

describe('POST /api/rsvp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when JSON is invalid', async () => {
    const request = new Request('http://localhost/api/rsvp', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('INVALID_JSON');
  });

  it('returns 400 when validation fails', async () => {
    const invalidBody = {
      slug: 'ab', // too short
      full_name: 'A', // too short
      attendance: 'invalid', // invalid enum
    };

    const request = new Request('http://localhost/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('VALIDATION_ERROR');
    expect(data.details).toBeDefined();
  });

  it('returns 404 when invitation not found', async () => {
    const validBody = {
      slug: 'non-existent',
      full_name: 'Test Guest',
      attendance: 'yes',
      guests_count: 1,
    };

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('INVITATION_NOT_FOUND');
  });

  it('returns 404 when invitation is not published', async () => {
    const validBody = {
      slug: 'unpublished',
      full_name: 'Test Guest',
      attendance: 'yes',
      guests_count: 1,
    };

    const mockInvitation = {
      id: '123',
      slug: 'unpublished',
      is_published: false,
      require_token: false,
    };

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: mockInvitation,
              error: null,
            }),
          }),
        }),
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('INVITATION_NOT_FOUND');
  });

  it('returns 403 when token is required but not provided', async () => {
    const validBody = {
      slug: 'token-required',
      full_name: 'Test Guest',
      attendance: 'yes',
      guests_count: 1,
    };

    const mockInvitation = {
      id: '123',
      slug: 'token-required',
      is_published: true,
      require_token: true,
      default_token: 'default-token-123',
    };

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: mockInvitation,
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: { id: 'rsvp-123' },
            error: null,
          }),
        }),
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('TOKEN_REQUIRED');
  });

  it('returns 200 when bot trap is triggered', async () => {
    const botBody = {
      slug: 'test',
      full_name: 'Bot',
      attendance: 'yes',
      guests_count: 1,
      website: 'http://spam.com', // bot trap
    };

    const request = new Request('http://localhost/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(botBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it('returns 201 when RSVP is successfully created', async () => {
    const validBody = {
      slug: 'test-invitation',
      full_name: 'Test Guest',
      email: 'test@example.com',
      phone: '+905551234567',
      attendance: 'yes',
      guests_count: 2,
      note: 'Looking forward to it!',
    };

    const mockInvitation = {
      id: '123',
      slug: 'test-invitation',
      is_published: true,
      require_token: false,
    };

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: mockInvitation,
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'rsvp-123', created_at: new Date().toISOString() },
              error: null,
            }),
          }),
        }),
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.ok).toBe(true);
    expect(data.rsvp?.id).toBe('rsvp-123');
  });
});

