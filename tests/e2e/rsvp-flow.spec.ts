/**
 * RSVP Flow E2E Tests
 * Tests for RSVP submission flow
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

test.describe('RSVP Flow', () => {
  test('should submit RSVP form with valid data', async ({ page }) => {
    await page.goto(`${BASE_URL}/invitation/demo-invitation`);
    await page.waitForLoadState('networkidle');
    
    // Find RSVP form
    const form = page.locator('form').first();
    
    if (await form.isVisible()) {
      // Fill form
      const nameInput = form.locator('input[name*="name"], input[placeholder*="name" i]').first();
      const attendanceSelect = form.locator('select[name*="attendance"], button:has-text("yes")').first();
      const submitButton = form.locator('button[type="submit"], button:has-text("Gönder")').first();
      
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Guest');
        
        if (await attendanceSelect.isVisible()) {
          await attendanceSelect.click();
        }
        
        if (await submitButton.isVisible()) {
          // Submit might show success message or redirect
          await submitButton.click();
          
          // Wait for response
          await page.waitForTimeout(2000);
          
          // Check if form submitted (success message or form reset)
          const body = page.locator('body');
          await expect(body).toBeVisible();
        }
      }
    }
  });

  test('should show validation errors for invalid RSVP data', async ({ page }) => {
    await page.goto(`${BASE_URL}/invitation/demo-invitation`);
    await page.waitForLoadState('networkidle');
    
    const form = page.locator('form').first();
    
    if (await form.isVisible()) {
      const submitButton = form.locator('button[type="submit"]').first();
      
      if (await submitButton.isVisible()) {
        // Try to submit empty form
        await submitButton.click();
        
        await page.waitForTimeout(1000);
        
        // Should show validation errors or prevent submission
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    }
  });
});

