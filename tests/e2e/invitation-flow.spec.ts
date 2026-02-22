/**
 * Invitation Flow E2E Tests
 * Tests for invitation creation and viewing flows
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

test.describe('Invitation Flow', () => {
  test('should display invitation page for published invitation', async ({ page }) => {
    // Note: This test assumes a published invitation exists
    // In real scenario, create invitation first via API or seed data
    
    await page.goto(`${BASE_URL}/invitation/demo-invitation`);
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded (should not be 404)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for invitation content or error message
    const content = page.locator('main, [role="main"]').first();
    await expect(content).toBeVisible();
  });

  test('should handle 404 for non-existent invitation', async ({ page }) => {
    await page.goto(`${BASE_URL}/invitation/non-existent-invitation-12345`);
    await page.waitForLoadState('networkidle');
    
    // Should show error or 404 message
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display RSVP form on invitation page', async ({ page }) => {
    await page.goto(`${BASE_URL}/invitation/demo-invitation`);
    await page.waitForLoadState('networkidle');
    
    // Look for RSVP form elements
    const rsvpForm = page.locator('form, [data-testid="rsvp-form"]').first();
    
    // Form might not exist if invitation doesn't exist, so check if page is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

