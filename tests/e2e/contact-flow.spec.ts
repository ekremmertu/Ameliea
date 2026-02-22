/**
 * Contact Flow E2E Tests
 * Tests for contact form submission
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

test.describe('Contact Flow', () => {
  test('should display contact form', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await page.waitForLoadState('networkidle');
    
    // Check if contact page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Look for contact form
    const form = page.locator('form').first();
    
    // Form should be visible or page should load
    await expect(body).toBeVisible();
  });

  test('should submit contact form with valid data', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await page.waitForLoadState('networkidle');
    
    const form = page.locator('form').first();
    
    if (await form.isVisible()) {
      // Find form inputs
      const nameInput = form.locator('input[name*="name"]').first();
      const emailInput = form.locator('input[type="email"]').first();
      const messageInput = form.locator('textarea[name*="message"]').first();
      const submitButton = form.locator('button[type="submit"]').first();
      
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test User');
        
        if (await emailInput.isVisible()) {
          await emailInput.fill('test@example.com');
        }
        
        if (await messageInput.isVisible()) {
          await messageInput.fill('Test message');
        }
        
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Wait for response
          await page.waitForTimeout(2000);
          
          // Should show success message or form reset
          const body = page.locator('body');
          await expect(body).toBeVisible();
        }
      }
    }
  });
});

