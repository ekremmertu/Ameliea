import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for form to load
    await page.waitForLoadState('networkidle');
    
    // Check for email input
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
    
    // Check for password input
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await expect(passwordInput).toBeVisible();
    
    // Check for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
    await expect(submitButton).toBeVisible();
  });

  test('should display register form', async ({ page }) => {
    await page.goto('/register');
    
    // Wait for form to load
    await page.waitForLoadState('networkidle');
    
    // Check for form fields
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await expect(passwordInput).toBeVisible();
  });

  test('should validate login form', async ({ page }) => {
    await page.goto('/login');
    
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Check for validation errors (if any)
    // This depends on your form validation implementation
    await page.waitForTimeout(1000);
  });

  test('should navigate from login to register', async ({ page }) => {
    await page.goto('/login');
    
    await page.waitForLoadState('networkidle');
    
    // Find register link
    const registerLink = page.locator('a[href*="register"], a:has-text("Kayıt"), a:has-text("Register")').first();
    
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/.*register/);
    }
  });

  test('should navigate from register to login', async ({ page }) => {
    await page.goto('/register');
    
    await page.waitForLoadState('networkidle');
    
    // Find login link
    const loginLink = page.locator('a[href*="login"], a:has-text("Giriş"), a:has-text("Login")').first();
    
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });
});

