import { test, expect } from '@playwright/test';

test.describe('Authentication and Dashboard Redirect Debug', () => {
  test('investigate sign-in to dashboard redirect flow', async ({ page }) => {
    console.log('🔍 Starting authentication redirect investigation...');
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`Browser console [${msg.type()}]:`, msg.text());
    });
    
    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('/api/auth') || request.url().includes('/dashboard')) {
        console.log('📡 Request:', request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/auth') || response.url().includes('/dashboard')) {
        console.log('📨 Response:', response.status(), response.url());
      }
    });
    
    // Step 1: Navigate to signin page
    console.log('\n📍 Step 1: Navigating to signin page...');
    await page.goto('http://localhost:3000/signin');
    await page.waitForLoadState('networkidle');
    
    // Check if we're on signin page
    const signinUrl = page.url();
    console.log('Current URL:', signinUrl);
    expect(signinUrl).toContain('/signin');
    
    // Take screenshot of signin page
    await page.screenshot({ path: 'tests/screenshots/01-signin-page.png', fullPage: true });
    
    // Step 2: Check for any existing session redirects
    console.log('\n📍 Step 2: Checking for existing session...');
    const cookies = await page.context().cookies();
    console.log('Cookies found:', cookies.map(c => c.name));
    
    // Step 3: Attempt to sign in with test credentials
    console.log('\n📍 Step 3: Attempting sign-in...');
    
    // Check which auth providers are available
    const googleButton = await page.locator('button:has-text("Continue with Google")').isVisible().catch(() => false);
    const githubButton = await page.locator('button:has-text("Continue with GitHub")').isVisible().catch(() => false);
    const emailInput = await page.locator('input[name="email"], input[type="email"]').isVisible().catch(() => false);
    
    console.log('Auth options available:');
    console.log('- Google:', googleButton);
    console.log('- GitHub:', githubButton);
    console.log('- Email:', emailInput);
    
    if (emailInput) {
      // Try email sign-in
      console.log('Using email sign-in...');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword123');
      await page.screenshot({ path: 'tests/screenshots/02-filled-form.png', fullPage: true });
      
      // Submit form
      const submitButton = page.locator('button[type="submit"], button:has-text("Sign in")');
      if (await submitButton.isVisible()) {
        console.log('Clicking submit button...');
        await submitButton.click();
        
        // Wait for navigation or error
        await page.waitForTimeout(3000);
        console.log('After submit URL:', page.url());
        await page.screenshot({ path: 'tests/screenshots/03-after-submit.png', fullPage: true });
      }
    }
    
    // Step 4: Check current location and session state
    console.log('\n📍 Step 4: Checking post-auth state...');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check if we have session storage or local storage items
    const sessionStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) items[key] = window.sessionStorage.getItem(key);
      }
      return items;
    });
    console.log('Session Storage:', sessionStorage);
    
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) items[key] = window.localStorage.getItem(key);
      }
      return items;
    });
    console.log('Local Storage:', localStorage);
    
    // Step 5: Try direct navigation to dashboard
    console.log('\n📍 Step 5: Attempting direct dashboard navigation...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    
    const dashboardUrl = page.url();
    console.log('Dashboard navigation result:', dashboardUrl);
    await page.screenshot({ path: 'tests/screenshots/04-dashboard-attempt.png', fullPage: true });
    
    // Check for error messages or redirect behaviors
    const pageContent = await page.content();
    const hasSignInText = pageContent.includes('Sign in') || pageContent.includes('sign in');
    const hasDashboardText = pageContent.includes('Dashboard') || pageContent.includes('dashboard');
    const hasErrorText = pageContent.includes('error') || pageContent.includes('Error');
    
    console.log('\n📊 Page content analysis:');
    console.log('- Contains "Sign in":', hasSignInText);
    console.log('- Contains "Dashboard":', hasDashboardText);
    console.log('- Contains "Error":', hasErrorText);
    
    // Final verdict
    console.log('\n🎯 Redirect Issue Analysis:');
    if (dashboardUrl.includes('/signin') || dashboardUrl.includes('/auth')) {
      console.log('❌ User is being redirected back to sign-in page');
      console.log('Possible issues:');
      console.log('1. Session not being created properly');
      console.log('2. Authentication middleware blocking access');
      console.log('3. Missing or invalid auth token');
    } else if (dashboardUrl.includes('/dashboard')) {
      console.log('✅ User reached dashboard URL');
      if (hasSignInText && !hasDashboardText) {
        console.log('⚠️ But dashboard content not loading, possibly showing sign-in prompt');
      }
    } else {
      console.log('❓ Unexpected redirect to:', dashboardUrl);
    }
  });

  test('check authentication middleware and session', async ({ page }) => {
    console.log('\n🔍 Checking authentication middleware...');
    
    // Test API auth endpoints
    const response = await page.request.get('http://localhost:3000/api/auth/session');
    const sessionData = await response.json();
    console.log('Session API response:', sessionData);
    
    // Test protected API routes
    const protectedResponse = await page.request.get('http://localhost:3000/api/user/profile').catch(err => {
      console.log('Protected route error:', err.message);
      return null;
    });
    
    if (protectedResponse) {
      console.log('Protected route status:', protectedResponse.status());
      if (protectedResponse.status() === 401) {
        console.log('❌ Protected routes returning 401 - authentication not working');
      }
    }
  });

  test('inspect authentication components', async ({ page }) => {
    console.log('\n🔍 Inspecting authentication components...');
    
    await page.goto('http://localhost:3000');
    
    // Check if AuthProvider is loaded
    const hasNextAuth = await page.evaluate(() => {
      return typeof (window as any).next !== 'undefined';
    });
    console.log('Next.js detected:', hasNextAuth);
    
    // Check for sign-in buttons or user menu
    const signInButton = await page.locator('button:has-text("Sign in"), a:has-text("Sign in")').isVisible().catch(() => false);
    const userMenu = await page.locator('[data-testid="user-menu"], button:has-text("Profile")').isVisible().catch(() => false);
    
    console.log('UI State:');
    console.log('- Sign-in button visible:', signInButton);
    console.log('- User menu visible:', userMenu);
    
    if (signInButton) {
      console.log('❌ User appears to be signed out (sign-in button visible)');
    }
    if (userMenu) {
      console.log('✅ User appears to be signed in (user menu visible)');
    }
    
    await page.screenshot({ path: 'tests/screenshots/05-homepage-auth-state.png', fullPage: true });
  });
});

test.describe('Mock Authentication Test', () => {
  test('test with mocked session', async ({ page }) => {
    console.log('\n🔍 Testing with mocked session...');
    
    // Set up mock session cookie
    await page.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/',
        expires: Date.now() / 1000 + 3600,
        httpOnly: true,
        secure: false,
        sameSite: 'Lax'
      }
    ]);
    
    // Try dashboard with mock session
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    console.log('With mock session, URL:', url);
    
    if (url.includes('/dashboard')) {
      console.log('✅ Reached dashboard with mock session');
    } else {
      console.log('❌ Still redirected even with session cookie');
    }
  });
});