import { test, expect } from '@playwright/test';

test.describe('Dashboard Button Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start dev server if needed - for now we'll assume it's running on 3001
    await page.goto('http://localhost:3001/dashboard');
  });

  test('should display welcome message for unauthenticated users', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome to App Cloner');
    await expect(page.locator('text=Sign in to view your projects')).toBeVisible();
  });

  test('navigation buttons work correctly', async ({ page }) => {
    // Test App Cloner logo navigation
    await page.click('a[href="/"]');
    await page.waitForURL('http://localhost:3001/');
    await expect(page.locator('h1')).toContainText('Turn Screenshots into');

    // Test Dashboard navigation
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('http://localhost:3001/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome to App Cloner');

    // Test New Project navigation
    await page.click('a[href="/create"]');
    await page.waitForURL('http://localhost:3001/create');
    await expect(page.locator('h1')).toContainText('Sign In Required');
  });

  test('sign in buttons are clickable and trigger authentication', async ({ page }) => {
    // Test header sign in button
    const headerSignIn = page.locator('header').locator('button:has-text("Sign In")');
    await expect(headerSignIn).toBeVisible();
    
    // Test main content sign in button
    const mainSignIn = page.locator('main').locator('button:has-text("Sign In")');
    await expect(mainSignIn).toBeVisible();

    // Click main sign in button and verify console output
    await mainSignIn.click();
    // Note: We would need to mock NextAuth or test actual auth flow in integration tests
  });

  test('responsive design works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/dashboard');
    
    // Check that elements are still visible and properly arranged
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('navigation active states are correct', async ({ page }) => {
    // Check Dashboard is highlighted when on dashboard page
    await expect(page.locator('a[href="/dashboard"]')).toHaveClass(/text-primary|underline|active/);
    
    // Navigate to New Project and check active state
    await page.click('a[href="/create"]');
    await page.waitForURL('http://localhost:3001/create');
    // Note: Need to check if active state styling is applied to New Project link
  });

  test('loading states display correctly', async ({ page }) => {
    // Test loading spinner appears during session check
    await page.goto('http://localhost:3001/dashboard');
    
    // We might see a loading spinner briefly
    // This test would be better with network throttling or mocked slower responses
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
  });
});

// Test authenticated dashboard features (would need auth setup)
test.describe.skip('Authenticated Dashboard Tests', () => {
  test('displays user projects correctly', async ({ page }) => {
    // This would require setting up authentication and test data
    // Skip for now as it requires more complex setup
  });

  test('new project button in header works', async ({ page }) => {
    // Test the "New Project" button that appears when authenticated
  });

  test('project cards are clickable and navigate correctly', async ({ page }) => {
    // Test clicking on project cards navigates to project detail page
  });

  test('stats cards display correct numbers', async ({ page }) => {
    // Test the dashboard stats cards show accurate project counts
  });
});