import { Page, Browser, chromium } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ReferenceURL {
  url: string;
  category: 'design-inspiration' | 'competitor' | 'component-library' | 'best-practice';
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  lastScraped?: Date;
  description?: string;
}

export interface VisualAnalysis {
  url: string;
  screenshot: string;
  colorPalette: string[];
  typography: {
    primaryFont: string;
    headingFonts: string[];
    fontSizes: number[];
    lineHeights: number[];
  };
  layout: {
    gridSystem: string;
    spacing: number[];
    breakpoints: number[];
    maxWidth: number;
  };
  components: ComponentPattern[];
  designScore: number;
  extractedPatterns: DesignPattern[];
}

export interface ComponentPattern {
  type: 'button' | 'form' | 'navigation' | 'card' | 'hero' | 'footer';
  styles: any;
  position: { x: number; y: number; width: number; height: number };
  screenshot: string;
}

export interface DesignPattern {
  name: string;
  description: string;
  cssProperties: Record<string, string>;
  frequency: number;
  confidence: number;
}

export class VisualRenderer {
  private browser: Browser | null = null;
  private referenceUrls: ReferenceURL[] = [
    // Design Inspiration
    { url: 'https://dribbble.com/shots/popular/web-design', category: 'design-inspiration', tags: ['modern', 'clean'], priority: 'high' },
    { url: 'https://www.awwwards.com/websites/web-app/', category: 'design-inspiration', tags: ['award-winning', 'innovative'], priority: 'high' },
    { url: 'https://www.behance.net/search/projects?field=web%20design', category: 'design-inspiration', tags: ['creative', 'ui-ux'], priority: 'medium' },
    
    // Component Libraries
    { url: 'https://ui.shadcn.com', category: 'component-library', tags: ['react', 'modern', 'accessible'], priority: 'high' },
    { url: 'https://material.io/design', category: 'component-library', tags: ['google', 'material'], priority: 'medium' },
    { url: 'https://developer.apple.com/design/human-interface-guidelines/', category: 'component-library', tags: ['apple', 'ios'], priority: 'medium' },
    
    // Best Practices
    { url: 'https://web.dev/learn/design/', category: 'best-practice', tags: ['accessibility', 'performance'], priority: 'high' },
    { url: 'https://www.a11yproject.com/', category: 'best-practice', tags: ['accessibility'], priority: 'high' },
    
    // App Cloner Competitors
    { url: 'https://www.figma.com', category: 'competitor', tags: ['design-tool', 'collaboration'], priority: 'high' },
    { url: 'https://www.sketch.com', category: 'competitor', tags: ['design-tool'], priority: 'medium' },
    { url: 'https://www.adobe.com/products/xd.html', category: 'competitor', tags: ['design-tool', 'prototyping'], priority: 'medium' }
  ];

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Ensure output directories exist
    await fs.mkdir('./ui-agent/output/references', { recursive: true });
    await fs.mkdir('./ui-agent/output/analysis', { recursive: true });
  }

  async scrapeReferences(): Promise<VisualAnalysis[]> {
    if (!this.browser) await this.initialize();
    
    const analyses: VisualAnalysis[] = [];
    
    for (const reference of this.referenceUrls) {
      if (reference.priority === 'high') {
        const analysis = await this.analyzeReference(reference);
        if (analysis) {
          analyses.push(analysis);
        }
      }
    }
    
    return analyses;
  }

  async analyzeReference(reference: ReferenceURL): Promise<VisualAnalysis | null> {
    const page = await this.browser!.newPage();
    
    try {
      console.log(`🔍 Analyzing reference: ${reference.url}`);
      
      // Set realistic viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Navigate with timeout
      await page.goto(reference.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Take screenshot
      const screenshotName = `ref-${Date.now()}-${this.sanitizeFilename(reference.url)}.png`;
      const screenshotPath = path.join('./ui-agent/output/references', screenshotName);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Extract visual properties
      const analysis = await this.extractVisualProperties(page, reference.url, screenshotName);
      
      return analysis;
      
    } catch (error) {
      console.error(`Failed to analyze ${reference.url}:`, error);
      return null;
    } finally {
      await page.close();
    }
  }

  private async extractVisualProperties(page: Page, url: string, screenshot: string): Promise<VisualAnalysis> {
    // Extract color palette
    const colorPalette = await this.extractColorPalette(page);
    
    // Extract typography
    const typography = await this.extractTypography(page);
    
    // Extract layout properties
    const layout = await this.extractLayout(page);
    
    // Extract component patterns
    const components = await this.extractComponents(page);
    
    // Extract design patterns
    const patterns = await this.extractDesignPatterns(page);
    
    // Calculate design score
    const designScore = this.calculateDesignScore(colorPalette, typography, layout, components);
    
    return {
      url,
      screenshot,
      colorPalette,
      typography,
      layout,
      components,
      designScore,
      extractedPatterns: patterns
    };
  }

  private async extractColorPalette(page: Page): Promise<string[]> {
    return await page.evaluate(() => {
      const colors = new Set<string>();
      const elements = document.querySelectorAll('*');
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        
        // Extract colors from various properties
        const colorProps = ['color', 'background-color', 'border-color', 'fill', 'stroke'];
        
        colorProps.forEach(prop => {
          const value = style.getPropertyValue(prop);
          if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
            colors.add(value);
          }
        });
      });
      
      // Convert to hex if possible and filter
      return Array.from(colors)
        .filter(color => !color.includes('inherit') && !color.includes('initial'))
        .slice(0, 20); // Limit to 20 most common colors
    });
  }

  private async extractTypography(page: Page): Promise<any> {
    return await page.evaluate(() => {
      const fontFamilies = new Set<string>();
      const fontSizes = new Set<number>();
      const lineHeights = new Set<number>();
      
      const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button');
      
      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        
        const fontFamily = style.fontFamily;
        const fontSize = parseFloat(style.fontSize);
        const lineHeight = parseFloat(style.lineHeight);
        
        if (fontFamily) fontFamilies.add(fontFamily);
        if (fontSize && fontSize > 0) fontSizes.add(fontSize);
        if (lineHeight && lineHeight > 0) lineHeights.add(lineHeight);
      });
      
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingFonts = Array.from(headingElements).map(el => 
        window.getComputedStyle(el).fontFamily
      );
      
      return {
        primaryFont: Array.from(fontFamilies)[0] || 'system-ui',
        headingFonts: [...new Set(headingFonts)],
        fontSizes: Array.from(fontSizes).sort((a, b) => a - b),
        lineHeights: Array.from(lineHeights).sort((a, b) => a - b)
      };
    });
  }

  private async extractLayout(page: Page): Promise<any> {
    return await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      
      // Detect grid system
      const gridElements = document.querySelectorAll('[class*="grid"], [class*="col"], [class*="row"]');
      const flexElements = document.querySelectorAll('[style*="display: flex"], [class*="flex"]');
      
      let gridSystem = 'unknown';
      if (gridElements.length > 0) gridSystem = 'css-grid';
      else if (flexElements.length > 0) gridSystem = 'flexbox';
      
      // Extract spacing values
      const spacingElements = document.querySelectorAll('*');
      const margins = new Set<number>();
      const paddings = new Set<number>();
      
      spacingElements.forEach(el => {
        const style = window.getComputedStyle(el);
        
        ['margin-top', 'margin-bottom', 'margin-left', 'margin-right'].forEach(prop => {
          const value = parseFloat(style.getPropertyValue(prop));
          if (value > 0) margins.add(value);
        });
        
        ['padding-top', 'padding-bottom', 'padding-left', 'padding-right'].forEach(prop => {
          const value = parseFloat(style.getPropertyValue(prop));
          if (value > 0) paddings.add(value);
        });
      });
      
      const spacing = [...margins, ...paddings].sort((a, b) => a - b);
      
      // Detect max-width
      const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], main');
      const maxWidths = Array.from(containers).map(el => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.maxWidth) || 0;
      }).filter(w => w > 0);
      
      return {
        gridSystem,
        spacing: spacing.slice(0, 10), // Top 10 spacing values
        breakpoints: [768, 1024, 1280, 1536], // Common breakpoints
        maxWidth: Math.max(...maxWidths, 0)
      };
    });
  }

  private async extractComponents(page: Page): Promise<ComponentPattern[]> {
    return await page.evaluate(() => {
      const components: any[] = [];
      
      // Extract button patterns
      const buttons = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');
      buttons.forEach((btn, index) => {
        const rect = btn.getBoundingClientRect();
        const style = window.getComputedStyle(btn);
        
        if (rect.width > 0 && rect.height > 0) {
          components.push({
            type: 'button',
            styles: {
              backgroundColor: style.backgroundColor,
              color: style.color,
              borderRadius: style.borderRadius,
              padding: style.padding,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight
            },
            position: {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            },
            screenshot: `button-${index}.png`
          });
        }
      });
      
      // Extract navigation patterns
      const navs = document.querySelectorAll('nav, [role="navigation"], header nav');
      navs.forEach((nav, index) => {
        const rect = nav.getBoundingClientRect();
        const style = window.getComputedStyle(nav);
        
        if (rect.width > 0 && rect.height > 0) {
          components.push({
            type: 'navigation',
            styles: {
              backgroundColor: style.backgroundColor,
              padding: style.padding,
              height: style.height,
              position: style.position
            },
            position: {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            },
            screenshot: `nav-${index}.png`
          });
        }
      });
      
      // Extract card patterns
      const cards = document.querySelectorAll('[class*="card"], .item, article');
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const style = window.getComputedStyle(card);
        
        if (rect.width > 0 && rect.height > 0 && index < 5) { // Limit to 5 cards
          components.push({
            type: 'card',
            styles: {
              backgroundColor: style.backgroundColor,
              borderRadius: style.borderRadius,
              boxShadow: style.boxShadow,
              padding: style.padding,
              border: style.border
            },
            position: {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            },
            screenshot: `card-${index}.png`
          });
        }
      });
      
      return components;
    });
  }

  private async extractDesignPatterns(page: Page): Promise<DesignPattern[]> {
    return await page.evaluate(() => {
      const patterns: any[] = [];
      
      // Detect common design patterns
      const patternDetectors = [
        {
          name: 'Glassmorphism',
          detector: () => {
            const elements = document.querySelectorAll('*');
            let count = 0;
            elements.forEach(el => {
              const style = window.getComputedStyle(el);
              if (style.backdropFilter && style.backdropFilter.includes('blur')) {
                count++;
              }
            });
            return count;
          },
          css: { 'backdrop-filter': 'blur(10px)', 'background': 'rgba(255, 255, 255, 0.1)' }
        },
        {
          name: 'Neumorphism',
          detector: () => {
            const elements = document.querySelectorAll('*');
            let count = 0;
            elements.forEach(el => {
              const style = window.getComputedStyle(el);
              const shadow = style.boxShadow;
              if (shadow && shadow.includes('inset') && shadow.split(',').length >= 2) {
                count++;
              }
            });
            return count;
          },
          css: { 'box-shadow': 'inset 2px 2px 5px #babecc, inset -5px -5px 10px #ffffff73' }
        },
        {
          name: 'Gradient Backgrounds',
          detector: () => {
            const elements = document.querySelectorAll('*');
            let count = 0;
            elements.forEach(el => {
              const style = window.getComputedStyle(el);
              if (style.background && style.background.includes('gradient')) {
                count++;
              }
            });
            return count;
          },
          css: { 'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
        },
        {
          name: 'Rounded Corners',
          detector: () => {
            const elements = document.querySelectorAll('*');
            let count = 0;
            elements.forEach(el => {
              const style = window.getComputedStyle(el);
              const radius = parseFloat(style.borderRadius);
              if (radius > 8) {
                count++;
              }
            });
            return count;
          },
          css: { 'border-radius': '12px' }
        }
      ];
      
      patternDetectors.forEach(pattern => {
        const frequency = pattern.detector();
        if (frequency > 0) {
          patterns.push({
            name: pattern.name,
            description: `Detected ${frequency} instances of ${pattern.name}`,
            cssProperties: pattern.css,
            frequency,
            confidence: Math.min(frequency / 5, 1) // Normalize to 0-1
          });
        }
      });
      
      return patterns;
    });
  }

  private calculateDesignScore(colorPalette: string[], typography: any, layout: any, components: ComponentPattern[]): number {
    let score = 0;
    
    // Color palette diversity (0-25 points)
    score += Math.min(colorPalette.length * 2, 25);
    
    // Typography consistency (0-25 points)
    const fontVariety = typography.headingFonts.length;
    score += fontVariety <= 3 ? 25 : Math.max(0, 25 - (fontVariety - 3) * 5);
    
    // Layout organization (0-25 points)
    if (layout.gridSystem !== 'unknown') score += 15;
    if (layout.spacing.length >= 3) score += 10; // Consistent spacing
    
    // Component quality (0-25 points)
    score += Math.min(components.length * 5, 25);
    
    return Math.min(score, 100);
  }

  private sanitizeFilename(url: string): string {
    return url.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50);
  }

  async compareWithCurrent(currentScreenshot: string, referenceAnalyses: VisualAnalysis[]): Promise<any> {
    // This would implement visual comparison logic
    // For now, return a placeholder
    return {
      similarityScore: 0.7,
      improvements: [
        'Consider adopting the color palette from the highest-scored reference',
        'Implement similar component patterns for better consistency',
        'Apply modern design patterns found in references'
      ],
      bestReference: referenceAnalyses.reduce((best, current) => 
        current.designScore > best.designScore ? current : best
      )
    };
  }

  async generateImprovementSuggestions(referenceAnalyses: VisualAnalysis[]): Promise<string[]> {
    const suggestions: string[] = [];
    
    // Analyze all references for common patterns
    const allPatterns = referenceAnalyses.flatMap(r => r.extractedPatterns);
    const patternFrequency = new Map<string, number>();
    
    allPatterns.forEach(pattern => {
      patternFrequency.set(pattern.name, (patternFrequency.get(pattern.name) || 0) + 1);
    });
    
    // Generate suggestions based on most common patterns
    const commonPatterns = Array.from(patternFrequency.entries())
      .filter(([_, frequency]) => frequency >= 2)
      .sort((a, b) => b[1] - a[1]);
    
    commonPatterns.forEach(([pattern, frequency]) => {
      suggestions.push(`Consider implementing ${pattern} - found in ${frequency} high-quality references`);
    });
    
    // Color palette suggestions
    const highScoringRefs = referenceAnalyses.filter(r => r.designScore >= 80);
    if (highScoringRefs.length > 0) {
      suggestions.push('Update color palette based on high-scoring references');
      suggestions.push('Implement consistent spacing system from reference designs');
    }
    
    return suggestions;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}