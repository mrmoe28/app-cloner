import { Page, Browser, chromium } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';
import { UIAgentConfig, UIAnalysisResult, UIIssue, Route, Viewport } from './config';

export class UIAnalyzer {
  private browser: Browser | null = null;
  private config: UIAgentConfig;
  private results: UIAnalysisResult[] = [];

  constructor(config: UIAgentConfig) {
    this.config = config;
  }

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Ensure output directory exists
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'screenshots'), { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'reports'), { recursive: true });
  }

  async analyze(): Promise<UIAnalysisResult[]> {
    if (!this.browser) {
      await this.initialize();
    }

    for (const route of this.config.routes) {
      for (const viewport of this.config.viewports) {
        await this.analyzeRoute(route, viewport);
      }
    }

    return this.results;
  }

  private async analyzeRoute(route: Route, viewport: Viewport): Promise<void> {
    const page = await this.browser!.newPage();
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    try {
      // Navigate to the route
      await page.goto(`${this.config.baseUrl}${route.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for content to load
      if (route.waitForSelector) {
        await page.waitForSelector(route.waitForSelector, { timeout: 10000 });
      }

      // Take screenshot
      const screenshotName = `${route.name}-${viewport.name}-${Date.now()}.png`;
      const screenshotPath = path.join(this.config.outputDir, 'screenshots', screenshotName);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Perform various analyses
      const issues: UIIssue[] = [];
      
      if (this.config.analysisOptions.checkAccessibility) {
        issues.push(...await this.checkAccessibility(page));
      }
      
      if (this.config.analysisOptions.checkColorContrast) {
        issues.push(...await this.checkColorContrast(page));
      }
      
      if (this.config.analysisOptions.checkVisualHierarchy) {
        issues.push(...await this.checkVisualHierarchy(page));
      }
      
      if (this.config.analysisOptions.checkResponsiveness) {
        issues.push(...await this.checkResponsiveness(page, viewport));
      }

      if (this.config.analysisOptions.checkPerformance) {
        issues.push(...await this.checkPerformance(page));
      }

      // Calculate scores
      const metrics = this.calculateMetrics(issues);
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(issues);

      // Store result
      const result: UIAnalysisResult = {
        timestamp: new Date(),
        route: route.name,
        viewport: viewport.name,
        screenshot: screenshotName,
        issues,
        metrics,
        suggestions
      };

      this.results.push(result);
      
    } catch (error) {
      console.error(`Error analyzing ${route.name} at ${viewport.name}:`, error);
    } finally {
      await page.close();
    }
  }

  private async checkAccessibility(page: Page): Promise<UIIssue[]> {
    const issues: UIIssue[] = [];

    // Check for missing alt text on images
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.alt).map(img => ({
        src: img.src,
        selector: img.className || img.id || 'img'
      }));
    });

    imagesWithoutAlt.forEach(img => {
      issues.push({
        type: 'error',
        category: 'accessibility',
        element: img.selector,
        description: `Image missing alt text: ${img.src}`,
        recommendation: 'Add descriptive alt text to improve accessibility',
        severity: 'high'
      });
    });

    // Check for proper heading hierarchy
    const headingIssues = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const issues = [];
      let lastLevel = 0;
      
      for (const heading of headings) {
        const level = parseInt(heading.tagName[1]);
        if (level - lastLevel > 1) {
          issues.push({
            tag: heading.tagName,
            text: heading.textContent?.substring(0, 50)
          });
        }
        lastLevel = level;
      }
      
      return issues;
    });

    headingIssues.forEach(issue => {
      issues.push({
        type: 'warning',
        category: 'accessibility',
        element: issue.tag,
        description: `Heading hierarchy issue: ${issue.tag} "${issue.text}"`,
        recommendation: 'Ensure heading levels increase by one at a time',
        severity: 'medium'
      });
    });

    // Check for form labels
    const inputsWithoutLabels = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      return inputs.filter(input => {
        const id = input.id;
        if (!id) return true;
        const label = document.querySelector(`label[for="${id}"]`);
        return !label;
      }).map(input => ({
        type: input.tagName.toLowerCase(),
        id: input.id,
        name: (input as HTMLInputElement).name
      }));
    });

    inputsWithoutLabels.forEach(input => {
      issues.push({
        type: 'error',
        category: 'accessibility',
        element: `${input.type}#${input.id}`,
        description: `Form input missing associated label`,
        recommendation: 'Add a label element with proper for attribute',
        severity: 'high'
      });
    });

    return issues;
  }

  private async checkColorContrast(page: Page): Promise<UIIssue[]> {
    const issues: UIIssue[] = [];

    const contrastIssues = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const issues = [];

      for (const element of elements) {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // Simple contrast check (would need proper WCAG calculation in production)
          const textBrightness = this.getBrightness(color);
          const bgBrightness = this.getBrightness(backgroundColor);
          const contrast = Math.abs(textBrightness - bgBrightness);
          
          if (contrast < 125) {
            issues.push({
              selector: element.className || element.tagName.toLowerCase(),
              color,
              backgroundColor,
              contrast
            });
          }
        }
      }

      function getBrightness(color: string): number {
        const rgb = color.match(/\d+/g);
        if (!rgb) return 0;
        return (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
      }

      return issues.slice(0, 10); // Limit to first 10 issues
    });

    contrastIssues.forEach(issue => {
      issues.push({
        type: 'warning',
        category: 'accessibility',
        element: issue.selector,
        description: `Low color contrast detected`,
        recommendation: 'Increase contrast between text and background for better readability',
        severity: 'medium'
      });
    });

    return issues;
  }

  private async checkVisualHierarchy(page: Page): Promise<UIIssue[]> {
    const issues: UIIssue[] = [];

    // Check for consistent spacing
    const spacingIssues = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.card, .button, section'));
      const margins = new Set();
      const paddings = new Set();
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        margins.add(style.marginBottom);
        paddings.add(style.padding);
      });

      return {
        marginVariety: margins.size,
        paddingVariety: paddings.size
      };
    });

    if (spacingIssues.marginVariety > 5) {
      issues.push({
        type: 'suggestion',
        category: 'consistency',
        description: 'Inconsistent margin spacing detected across components',
        recommendation: 'Use a consistent spacing scale (e.g., 8px grid system)',
        severity: 'low'
      });
    }

    // Check for font size hierarchy
    const fontSizes = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
      return elements.map(el => ({
        tag: el.tagName.toLowerCase(),
        fontSize: window.getComputedStyle(el).fontSize
      }));
    });

    // Analyze font hierarchy
    const h1Size = fontSizes.find(f => f.tag === 'h1')?.fontSize;
    const h2Size = fontSizes.find(f => f.tag === 'h2')?.fontSize;
    const pSize = fontSizes.find(f => f.tag === 'p')?.fontSize;

    if (h1Size && h2Size && parseInt(h1Size) <= parseInt(h2Size)) {
      issues.push({
        type: 'error',
        category: 'aesthetics',
        description: 'Heading hierarchy issue: H1 should be larger than H2',
        recommendation: 'Ensure proper visual hierarchy with decreasing heading sizes',
        severity: 'medium'
      });
    }

    return issues;
  }

  private async checkResponsiveness(page: Page, viewport: Viewport): Promise<UIIssue[]> {
    const issues: UIIssue[] = [];

    // Check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (hasHorizontalScroll) {
      issues.push({
        type: 'error',
        category: 'responsiveness',
        description: `Horizontal scrolling detected at ${viewport.name} viewport`,
        recommendation: 'Adjust layout to prevent horizontal overflow',
        severity: 'high'
      });
    }

    // Check for overlapping elements
    const overlappingElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, input'));
      const overlaps = [];
      
      for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
          const rect1 = elements[i].getBoundingClientRect();
          const rect2 = elements[j].getBoundingClientRect();
          
          const overlap = !(rect1.right < rect2.left || 
                          rect1.left > rect2.right || 
                          rect1.bottom < rect2.top || 
                          rect1.top > rect2.bottom);
          
          if (overlap) {
            overlaps.push({
              element1: elements[i].tagName.toLowerCase(),
              element2: elements[j].tagName.toLowerCase()
            });
          }
        }
      }
      
      return overlaps.slice(0, 5); // Limit to first 5 overlaps
    });

    overlappingElements.forEach(overlap => {
      issues.push({
        type: 'error',
        category: 'responsiveness',
        description: `Elements overlapping: ${overlap.element1} and ${overlap.element2}`,
        recommendation: 'Adjust spacing or layout to prevent element overlap',
        severity: 'high'
      });
    });

    return issues;
  }

  private async checkPerformance(page: Page): Promise<UIIssue[]> {
    const issues: UIIssue[] = [];

    // Check image optimization
    const unoptimizedImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => {
        return img.naturalWidth > 2000 || img.naturalHeight > 2000;
      }).map(img => ({
        src: img.src,
        width: img.naturalWidth,
        height: img.naturalHeight
      }));
    });

    unoptimizedImages.forEach(img => {
      issues.push({
        type: 'warning',
        category: 'performance',
        description: `Large image detected: ${img.width}x${img.height}px`,
        recommendation: 'Optimize image size and use responsive images',
        severity: 'medium'
      });
    });

    // Check for unused CSS
    const cssStats = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      let totalRules = 0;
      
      styleSheets.forEach(sheet => {
        try {
          if (sheet.cssRules) {
            totalRules += sheet.cssRules.length;
          }
        } catch (e) {
          // Cross-origin stylesheets
        }
      });
      
      return { totalRules };
    });

    if (cssStats.totalRules > 1000) {
      issues.push({
        type: 'suggestion',
        category: 'performance',
        description: `Large number of CSS rules detected: ${cssStats.totalRules}`,
        recommendation: 'Consider removing unused CSS to improve performance',
        severity: 'low'
      });
    }

    return issues;
  }

  private calculateMetrics(issues: UIIssue[]): any {
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const suggestionCount = issues.filter(i => i.type === 'suggestion').length;

    const accessibilityIssues = issues.filter(i => i.category === 'accessibility').length;
    const performanceIssues = issues.filter(i => i.category === 'performance').length;
    const aestheticIssues = issues.filter(i => i.category === 'aesthetics').length;

    // Calculate scores (100 = perfect, 0 = many issues)
    const accessibilityScore = Math.max(0, 100 - (accessibilityIssues * 10));
    const performanceScore = Math.max(0, 100 - (performanceIssues * 15));
    const visualScore = Math.max(0, 100 - (aestheticIssues * 5));
    
    const overallScore = Math.round(
      (accessibilityScore * 0.4) + 
      (performanceScore * 0.3) + 
      (visualScore * 0.3)
    );

    return {
      accessibilityScore,
      performanceScore,
      visualScore,
      overallScore,
      errorCount,
      warningCount,
      suggestionCount
    };
  }

  private generateSuggestions(issues: UIIssue[]): string[] {
    const suggestions: string[] = [];
    const categories = new Set(issues.map(i => i.category));

    if (categories.has('accessibility')) {
      suggestions.push('Focus on improving accessibility by adding alt text, labels, and proper heading hierarchy');
    }

    if (categories.has('performance')) {
      suggestions.push('Optimize images and reduce CSS/JavaScript bundle sizes for better performance');
    }

    if (categories.has('responsiveness')) {
      suggestions.push('Test and fix layout issues at different viewport sizes');
    }

    if (categories.has('consistency')) {
      suggestions.push('Establish and follow a consistent design system for spacing, colors, and typography');
    }

    if (issues.filter(i => i.severity === 'high').length > 0) {
      suggestions.unshift('Priority: Fix high-severity issues first for immediate improvement');
    }

    return suggestions;
  }

  async generateReport(): Promise<void> {
    const reportPath = path.join(this.config.outputDir, 'reports', `ui-analysis-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport();
    const htmlPath = path.join(this.config.outputDir, 'reports', `ui-analysis-${Date.now()}.html`);
    await fs.writeFile(htmlPath, htmlReport);
    
    console.log(`Reports generated at: ${reportPath} and ${htmlPath}`);
  }

  private generateHTMLReport(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>UI Analysis Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .route-analysis { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .issue { padding: 10px; margin: 10px 0; border-left: 4px solid; }
    .issue.error { border-color: #f44336; background: #ffebee; }
    .issue.warning { border-color: #ff9800; background: #fff3e0; }
    .issue.suggestion { border-color: #2196f3; background: #e3f2fd; }
    .metric { display: inline-block; padding: 10px 20px; margin: 5px; background: white; border-radius: 4px; border: 1px solid #ddd; }
    .score { font-size: 24px; font-weight: bold; }
    .score.good { color: #4caf50; }
    .score.medium { color: #ff9800; }
    .score.poor { color: #f44336; }
    img { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>UI Analysis Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p>Analyzed ${this.results.length} page/viewport combinations</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>
  
  ${this.results.map(result => `
    <div class="route-analysis">
      <h2>${result.route} - ${result.viewport}</h2>
      
      <div class="metrics">
        <div class="metric">
          Overall Score: <span class="score ${result.metrics.overallScore >= 80 ? 'good' : result.metrics.overallScore >= 60 ? 'medium' : 'poor'}">${result.metrics.overallScore}</span>
        </div>
        <div class="metric">Accessibility: ${result.metrics.accessibilityScore}</div>
        <div class="metric">Performance: ${result.metrics.performanceScore}</div>
        <div class="metric">Visual: ${result.metrics.visualScore}</div>
      </div>
      
      <h3>Issues Found (${result.issues.length})</h3>
      ${result.issues.map(issue => `
        <div class="issue ${issue.type}">
          <strong>${issue.type.toUpperCase()}: ${issue.description}</strong>
          <p>Category: ${issue.category} | Severity: ${issue.severity}</p>
          <p>Recommendation: ${issue.recommendation}</p>
        </div>
      `).join('')}
      
      <h3>Suggestions</h3>
      <ul>
        ${result.suggestions.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
  `).join('')}
</body>
</html>
    `;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}