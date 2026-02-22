/**
 * Health Check API Route Tests
 * Tests for GET /api/health
 * @jest-environment node
 */

import { GET } from '@/app/api/health/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns healthy status when database is connected', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.database).toBe('connected');
    expect(data.timestamp).toBeDefined();
  });

  it('returns unhealthy status when database has error', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            error: { code: 'PGRST301', message: 'Connection error' },
          }),
        }),
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.database).toBe('error');
    expect(data.error).toBeDefined();
  });

  it('returns healthy status when no rows returned (PGRST116)', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            error: { code: 'PGRST116', message: 'No rows returned' },
          }),
        }),
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.database).toBe('connected');
  });

  it('returns unhealthy status on exception', async () => {
    (createSupabaseServerClient as jest.Mock).mockRejectedValue(
      new Error('Connection failed')
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.database).toBe('disconnected');
    expect(data.error).toBeDefined();
  });
});

