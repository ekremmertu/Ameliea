import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page title exists
    await expect(page).toHaveTitle(/Amor Élite|Digital Invitations/i);
  });

  test('should display header', async ({ page }) => {
    await page.goto('/');
    
    // Check for header navigation
    const header = page.locator('header, [role="banner"]').first();
    await expect(header).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    
    // Wait for intro animation to complete (if any)
    await page.waitForTimeout(5000);
    
    // Check for hero section
    const hero = page.locator('#hero, [data-testid="hero"]').first();
    await expect(hero).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click login button/link
    const loginLink = page.locator('a[href*="login"], button:has-text("Giriş"), button:has-text("Login")').first();
    
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click register button/link
    const registerLink = page.locator('a[href*="register"], button:has-text("Kayıt"), button:has-text("Register")').first();
    
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/.*register/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // Check if page is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

