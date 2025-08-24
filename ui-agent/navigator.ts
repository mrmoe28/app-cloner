import { Page, Browser, Locator } from '@playwright/test';
import { ErrorFixer } from './error-fixer';
import { UIAgentConfig } from './config';

export interface NavigationPath {
  name: string;
  steps: NavigationStep[];
  expectedErrors?: string[];
  reproduced: boolean;
  context?: any;
}

export interface NavigationStep {
  action: 'navigate' | 'click' | 'fill' | 'select' | 'hover' | 'scroll' | 'wait';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  screenshot?: boolean;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  reproductionSteps: NavigationStep[];
  errors: string[];
  screenshots: string[];
  userAgent: string;
  viewport: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export class Navigator {
  private page: Page;
  private errorFixer: ErrorFixer;
  private config: UIAgentConfig;
  private discoveredPaths: NavigationPath[] = [];
  private bugs: BugReport[] = [];
  private currentPath: NavigationStep[] = [];

  constructor(page: Page, errorFixer: ErrorFixer, config: UIAgentConfig) {
    this.page = page;
    this.errorFixer = errorFixer;
    this.config = config;
  }

  async exploreApplication(): Promise<void> {
    console.log('🔍 Starting application exploration...');
    
    // Start from home page
    await this.navigateToRoute('/');
    
    // Discover all interactive elements
    const interactiveElements = await this.findInteractiveElements();
    console.log(`Found ${interactiveElements.length} interactive elements`);
    
    // Test each element
    for (const element of interactiveElements) {
      await this.testElement(element);
    }
    
    // Test form flows
    await this.testFormFlows();
    
    // Test navigation flows
    await this.testNavigationFlows();
    
    // Test error states
    await this.testErrorStates();
  }

  private async findInteractiveElements(): Promise<Array<{selector: string, type: string}>> {
    return await this.page.evaluate(() => {
      const elements = [];
      
      // Find all clickable elements
      const clickable = document.querySelectorAll('button, a, [role="button"], [onclick]');
      clickable.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) { // Visible elements only
          elements.push({
            selector: this.generateSelector(el, index),
            type: 'click'
          });
        }
      });
      
      // Find all form inputs
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          elements.push({
            selector: this.generateSelector(el, index),
            type: 'input'
          });
        }
      });
      
      function generateSelector(element: Element, index: number): string {
        // Try to generate a unique selector
        if (element.id) return `#${element.id}`;
        if (element.className) {
          const classes = element.className.split(' ').filter(c => c && !c.match(/^(css-|sc-)/));
          if (classes.length > 0) return `.${classes[0]}`;
        }
        return `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
      }
      
      return elements;
    });
  }

  private async testElement(element: {selector: string, type: string}): Promise<void> {
    try {
      console.log(`Testing element: ${element.selector}`);
      
      const step: NavigationStep = {
        action: element.type === 'click' ? 'click' : 'fill',
        selector: element.selector,
        screenshot: true
      };

      this.currentPath.push(step);
      
      // Take before screenshot
      await this.takeScreenshot(`before-${element.selector}`);
      
      const elementLocator = this.page.locator(element.selector);
      
      if (element.type === 'click') {
        await this.testClick(elementLocator, element.selector);
      } else if (element.type === 'input') {
        await this.testInput(elementLocator, element.selector);
      }
      
      // Take after screenshot
      await this.takeScreenshot(`after-${element.selector}`);
      
    } catch (error) {
      console.error(`Error testing element ${element.selector}:`, error);
      
      // Record the bug
      await this.recordBug({
        title: `Element interaction failed: ${element.selector}`,
        description: `Failed to interact with element: ${error}`,
        selector: element.selector,
        error: error as Error
      });
    }
  }

  private async testClick(element: Locator, selector: string): Promise<void> {
    try {
      // Check if element is visible and enabled
      await element.waitFor({ state: 'visible', timeout: 5000 });
      
      const isEnabled = await element.isEnabled();
      if (!isEnabled) {
        console.log(`Element ${selector} is disabled`);
        return;
      }
      
      // Get current URL for comparison
      const beforeUrl = this.page.url();
      
      // Click the element
      await element.click();
      
      // Wait for potential navigation or state change
      await this.page.waitForTimeout(1000);
      
      const afterUrl = this.page.url();
      
      // Check if navigation occurred
      if (beforeUrl !== afterUrl) {
        console.log(`Navigation: ${beforeUrl} → ${afterUrl}`);
        
        // Test the new page
        await this.testPageLoad();
      }
      
      // Check for modal or popup
      const modal = this.page.locator('[role="dialog"], .modal, .popup');
      if (await modal.isVisible()) {
        console.log('Modal/popup detected');
        await this.testModal(modal);
      }
      
    } catch (error) {
      throw new Error(`Click failed on ${selector}: ${error}`);
    }
  }

  private async testInput(element: Locator, selector: string): Promise<void> {
    try {
      await element.waitFor({ state: 'visible', timeout: 5000 });
      
      const inputType = await element.getAttribute('type') || 'text';
      const testValue = this.generateTestValue(inputType);
      
      // Clear and fill with test value
      await element.clear();
      await element.fill(testValue);
      
      // Trigger change event
      await element.blur();
      
      // Check for validation errors
      const errorSelector = `${selector} + .error, ${selector} ~ .error, [data-error-for="${selector.replace('#', '')}"]`;
      const errorElement = this.page.locator(errorSelector);
      
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log(`Validation error for ${selector}: ${errorText}`);
      }
      
    } catch (error) {
      throw new Error(`Input test failed on ${selector}: ${error}`);
    }
  }

  private generateTestValue(inputType: string): string {
    const testValues: Record<string, string> = {
      'email': 'test@example.com',
      'password': 'TestPassword123!',
      'tel': '+1234567890',
      'url': 'https://example.com',
      'number': '42',
      'date': '2024-01-01',
      'text': 'Test input value',
      'search': 'test search query'
    };
    
    return testValues[inputType] || 'Test Value';
  }

  private async testFormFlows(): Promise<void> {
    console.log('🔧 Testing form flows...');
    
    const forms = await this.page.locator('form').all();
    
    for (let i = 0; i < forms.length; i++) {
      await this.testForm(forms[i], i);
    }
  }

  private async testForm(form: Locator, index: number): Promise<void> {
    try {
      console.log(`Testing form ${index + 1}`);
      
      // Find all inputs in the form
      const inputs = await form.locator('input, textarea, select').all();
      
      // Fill all inputs with appropriate test data
      for (const input of inputs) {
        const type = await input.getAttribute('type') || 'text';
        const name = await input.getAttribute('name') || '';
        
        if (type !== 'submit' && type !== 'button') {
          const testValue = this.generateFormTestValue(type, name);
          await input.fill(testValue);
        }
      }
      
      // Find and click submit button
      const submitButton = form.locator('button[type="submit"], input[type="submit"], button:not([type])');
      
      if (await submitButton.isVisible()) {
        await this.takeScreenshot(`form-${index}-before-submit`);
        
        const beforeUrl = this.page.url();
        await submitButton.click();
        
        // Wait for form submission
        await this.page.waitForTimeout(2000);
        
        const afterUrl = this.page.url();
        
        await this.takeScreenshot(`form-${index}-after-submit`);
        
        // Check for success/error messages
        const successSelector = '.success, .alert-success, [data-success]';
        const errorSelector = '.error, .alert-error, .alert-danger, [data-error]';
        
        const hasSuccess = await this.page.locator(successSelector).isVisible();
        const hasError = await this.page.locator(errorSelector).isVisible();
        
        console.log(`Form ${index + 1} submission: URL changed: ${beforeUrl !== afterUrl}, Success: ${hasSuccess}, Error: ${hasError}`);
        
        if (hasError) {
          const errorText = await this.page.locator(errorSelector).textContent();
          console.log(`Form error: ${errorText}`);
        }
      }
      
    } catch (error) {
      console.error(`Form test failed:`, error);
      
      await this.recordBug({
        title: `Form submission failed`,
        description: `Form ${index + 1} failed to submit: ${error}`,
        error: error as Error
      });
    }
  }

  private generateFormTestValue(type: string, name: string): string {
    // Generate contextual test data based on field name
    const namePatterns: Record<string, string> = {
      'name': 'John Doe',
      'email': 'test@example.com',
      'phone': '+1234567890',
      'company': 'Test Company',
      'title': 'Test Project',
      'description': 'This is a test description for the form field.',
      'message': 'This is a test message.',
      'address': '123 Test Street',
      'city': 'Test City',
      'zip': '12345',
      'country': 'United States'
    };
    
    for (const pattern in namePatterns) {
      if (name.toLowerCase().includes(pattern)) {
        return namePatterns[pattern];
      }
    }
    
    return this.generateTestValue(type);
  }

  private async testNavigationFlows(): Promise<void> {
    console.log('🧭 Testing navigation flows...');
    
    // Test all links
    const links = await this.page.locator('a[href]').all();
    
    for (let i = 0; i < Math.min(links.length, 20); i++) { // Limit to 20 links
      await this.testLink(links[i], i);
    }
  }

  private async testLink(link: Locator, index: number): Promise<void> {
    try {
      const href = await link.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return; // Skip non-page links
      }
      
      const linkText = await link.textContent();
      console.log(`Testing link ${index + 1}: "${linkText}" → ${href}`);
      
      const beforeUrl = this.page.url();
      
      // Click link (handle both internal and external)
      if (href.startsWith('http') && !href.includes(new URL(this.config.baseUrl).hostname)) {
        console.log('External link detected, skipping');
        return;
      }
      
      await link.click();
      await this.page.waitForLoadState('networkidle');
      
      const afterUrl = this.page.url();
      
      if (beforeUrl !== afterUrl) {
        console.log(`Navigated to: ${afterUrl}`);
        await this.testPageLoad();
        
        // Navigate back
        await this.page.goBack();
        await this.page.waitForLoadState('networkidle');
      }
      
    } catch (error) {
      console.error(`Link test failed:`, error);
      
      await this.recordBug({
        title: `Link navigation failed`,
        description: `Link ${index + 1} failed to navigate: ${error}`,
        error: error as Error
      });
    }
  }

  private async testErrorStates(): Promise<void> {
    console.log('⚠️ Testing error states...');
    
    // Test 404 pages
    await this.page.goto(`${this.config.baseUrl}/non-existent-page`);
    await this.testPageLoad();
    
    // Test malformed URLs
    const testUrls = [
      '/create?invalid=param&malformed',
      '/dashboard/project/invalid-id',
      '/api/non-existent-endpoint'
    ];
    
    for (const url of testUrls) {
      try {
        await this.page.goto(`${this.config.baseUrl}${url}`);
        await this.testPageLoad();
      } catch (error) {
        console.log(`Expected error for ${url}: ${error}`);
      }
    }
  }

  private async testPageLoad(): Promise<void> {
    // Check for basic page health
    const title = await this.page.title();
    console.log(`Page title: ${title}`);
    
    // Check for broken images
    const brokenImages = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.complete || img.naturalHeight === 0).length;
    });
    
    if (brokenImages > 0) {
      console.log(`⚠️ Found ${brokenImages} broken images`);
    }
    
    // Check for console errors (already monitored by ErrorFixer)
    const errors = this.errorFixer.getErrors();
    const recentErrors = errors.filter(e => 
      Date.now() - e.timestamp.getTime() < 5000 // Last 5 seconds
    );
    
    if (recentErrors.length > 0) {
      console.log(`⚠️ Found ${recentErrors.length} console errors on this page`);
    }
  }

  private async testModal(modal: Locator): Promise<void> {
    try {
      // Test closing modal
      const closeButton = modal.locator('[aria-label="close"], [data-dismiss="modal"], .close, button').first();
      
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await this.page.waitForTimeout(1000);
        
        const isStillVisible = await modal.isVisible();
        if (isStillVisible) {
          console.log('⚠️ Modal did not close properly');
        }
      }
      
    } catch (error) {
      console.error('Modal test failed:', error);
    }
  }

  private async recordBug(bug: {title: string, description: string, selector?: string, error: Error}): Promise<void> {
    const bugReport: BugReport = {
      id: `bug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: bug.title,
      description: bug.description,
      reproductionSteps: [...this.currentPath],
      errors: [bug.error.message],
      screenshots: [],
      userAgent: await this.page.evaluate(() => navigator.userAgent),
      viewport: await this.page.viewportSize().then(size => `${size?.width}x${size?.height}`) || 'unknown',
      timestamp: new Date(),
      severity: this.categorizeSeverity(bug.error.message)
    };
    
    this.bugs.push(bugReport);
    
    // Take screenshot for the bug
    const screenshotName = `bug-${bugReport.id}.png`;
    await this.takeScreenshot(screenshotName);
    bugReport.screenshots.push(screenshotName);
  }

  private categorizeSeverity(errorMessage: string): 'critical' | 'high' | 'medium' | 'low' {
    const criticalKeywords = ['crash', 'cannot load', 'server error', 'database'];
    const highKeywords = ['error', 'failed', 'broken', 'invalid'];
    const mediumKeywords = ['warning', 'deprecated', 'slow'];
    
    const message = errorMessage.toLowerCase();
    
    if (criticalKeywords.some(keyword => message.includes(keyword))) {
      return 'critical';
    } else if (highKeywords.some(keyword => message.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => message.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  private async navigateToRoute(path: string): Promise<void> {
    await this.page.goto(`${this.config.baseUrl}${path}`);
    await this.page.waitForLoadState('networkidle');
  }

  private async takeScreenshot(name: string): Promise<void> {
    try {
      const screenshotPath = `./ui-agent/output/screenshots/${name}-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  }

  async generateNavigationReport(): Promise<void> {
    const report = {
      timestamp: new Date(),
      explorationSummary: {
        pathsDiscovered: this.discoveredPaths.length,
        bugsFound: this.bugs.length,
        criticalBugs: this.bugs.filter(b => b.severity === 'critical').length,
        highSeverityBugs: this.bugs.filter(b => b.severity === 'high').length
      },
      bugs: this.bugs,
      discoveredPaths: this.discoveredPaths
    };
    
    const reportPath = `./ui-agent/output/reports/navigation-${Date.now()}.json`;
    await require('fs').promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Navigation report generated: ${reportPath}`);
  }

  getBugs(): BugReport[] {
    return this.bugs;
  }

  getDiscoveredPaths(): NavigationPath[] {
    return this.discoveredPaths;
  }
}