/**
 * API Routes E2E Tests
 * Tests for critical API endpoints
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

test.describe('API Routes', () => {
  test('GET /api/health should return healthy status', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.database).toBe('connected');
    expect(data.timestamp).toBeDefined();
  });

  test('GET /api/invitations/[slug] should return 404 for non-existent invitation', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/invitations/non-existent-slug-12345`);
    const data = await response.json();

    expect(response.status()).toBe(404);
    expect(data.error).toBe('Invitation not found');
  });

  test('POST /api/rsvp should return 400 for invalid data', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/rsvp`, {
      data: {
        slug: 'ab', // too short
        full_name: 'A', // too short
        attendance: 'invalid', // invalid enum
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('VALIDATION_ERROR');
  });

  test('POST /api/rsvp should return 404 for non-existent invitation', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/rsvp`, {
      data: {
        slug: 'non-existent-invitation-12345',
        full_name: 'Test Guest',
        attendance: 'yes',
        guests_count: 1,
      },
    });

    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('INVITATION_NOT_FOUND');
  });

  test('POST /api/rsvp should accept bot trap silently', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/rsvp`, {
      data: {
        slug: 'test',
        full_name: 'Bot',
        attendance: 'yes',
        guests_count: 1,
        website: 'http://spam.com', // bot trap
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
  });

  test('GET /api/invitations/[slug]/guest-questions should return 404 for non-existent invitation', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/invitations/non-existent-slug-12345/guest-questions`);
    const data = await response.json();

    expect(response.status()).toBe(404);
    expect(data.error).toBe('INVITATION_NOT_FOUND');
  });
});

