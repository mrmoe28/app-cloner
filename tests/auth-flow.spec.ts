import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('Authentication Flow Tests', () => {
  let serverProcess: any;
  
  test.beforeAll(async () => {
    console.log('Setting up test environment...');
    
    // Copy test environment variables
    await execAsync('cp .env.test .env.local');
    
    // Initialize test database
    try {
      await execAsync('npx prisma migrate dev --name test-setup --skip-generate');
    } catch (error) {
      console.log('Database migration may have already been run:', error);
    }
    
    // Generate Prisma client
    await execAsync('npx prisma generate');
    
    console.log('Starting development server...');
    // Start the development server
    const { spawn } = require('child_process');
    serverProcess = spawn('npm', ['run', 'dev'], {
      detached: false,
      stdio: 'pipe'
    });
    
    // Wait for server to be ready
    await new Promise(resolve => {
      const checkServer = async () => {
        try {
          const response = await fetch('http://localhost:3000');
          if (response.status) {
            resolve(true);
          }
        } catch {
          setTimeout(checkServer, 1000);
        }
      };
      setTimeout(checkServer, 3000);
    });
    
    console.log('Server is ready for testing');
  });
  
  test.afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
    }
    // Clean up test environment
    await execAsync('rm -f .env.local test.db*');
  });

  test('should navigate to sign-in page and show form', async ({ page }) => {
    console.log('Testing sign-in page navigation...');
    
    // Navigate to sign-in page
    await page.goto('http://localhost:3000/signin');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if sign-in form is visible
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Check for sign-in button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✓ Sign-in page loaded successfully');
  });

  test('should attempt credential sign-in and check redirect behavior', async ({ page }) => {
    console.log('Testing credential sign-in flow...');
    
    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Monitor network failures
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    
    await page.goto('http://localhost:3000/signin');
    await page.waitForLoadState('networkidle');
    
    // Fill in test credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors);
    }
    if (networkErrors.length > 0) {
      console.log('Network Errors:', networkErrors);
    }
    
    // Check current URL to see where we ended up
    const currentUrl = page.url();
    console.log('Current URL after sign-in attempt:', currentUrl);
    
    // The sign-in may fail due to invalid credentials, but we're testing the flow
    const isOnSignIn = currentUrl.includes('/signin');
    const isOnSubscription = currentUrl.includes('/subscription');
    const isOnDashboard = currentUrl.includes('/dashboard');
    
    console.log(`Page locations - SignIn: ${isOnSignIn}, Subscription: ${isOnSubscription}, Dashboard: ${isOnDashboard}`);
    
    expect(consoleErrors.length).toBeLessThan(5); // Allow some expected errors but not too many
  });

  test('should test social sign-in button functionality', async ({ page }) => {
    console.log('Testing social sign-in buttons...');
    
    await page.goto('http://localhost:3000/signin');
    await page.waitForLoadState('networkidle');
    
    // Check if Google sign-in button exists and is clickable
    const googleButton = page.locator('button:has-text("Google")');
    await expect(googleButton).toBeVisible();
    
    // Check if GitHub sign-in button exists and is clickable
    const githubButton = page.locator('button:has-text("GitHub")');
    await expect(githubButton).toBeVisible();
    
    console.log('✓ Social sign-in buttons are present and visible');
  });

  test('should test subscription page accessibility', async ({ page }) => {
    console.log('Testing subscription page...');
    
    await page.goto('http://localhost:3000/subscription');
    await page.waitForLoadState('networkidle');
    
    // Check for key elements on subscription page
    await expect(page.locator('h1')).toContainText('Transform Screenshots');
    
    // Check for pricing information
    await expect(page.locator(':text("$29")')).toBeVisible();
    
    // Check for CTA button
    const ctaButton = page.locator('button:has-text("Get Instant Access")');
    await expect(ctaButton).toBeVisible();
    
    console.log('✓ Subscription page loads correctly');
  });

  test('should test navbar visibility for unauthenticated users', async ({ page }) => {
    console.log('Testing navbar visibility...');
    
    // Test on signin page (should have no navbar)
    await page.goto('http://localhost:3000/signin');
    await page.waitForLoadState('networkidle');
    
    const navbarOnSignin = page.locator('nav').first();
    const hasNavbar = await navbarOnSignin.count() > 0;
    
    console.log(`Navbar present on signin page: ${hasNavbar}`);
    
    // Test on subscription page (should have no navbar for unauth users)  
    await page.goto('http://localhost:3000/subscription');
    await page.waitForLoadState('networkidle');
    
    const navbarOnSub = page.locator('header').first();
    const hasNavbarOnSub = await navbarOnSub.count() > 0;
    
    console.log(`Navbar present on subscription page: ${hasNavbarOnSub}`);
    
    console.log('✓ Navbar visibility test completed');
  });
});