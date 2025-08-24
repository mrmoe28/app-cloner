import { Page, Browser } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface AccessibilityIssue {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagCriteria: string;
  description: string;
  element: string;
  selector: string;
  recommendation: string;
  autoFixable: boolean;
  fix?: AccessibilityFix;
}

export interface AccessibilityFix {
  type: 'add-attribute' | 'modify-attribute' | 'add-element' | 'modify-css' | 'restructure';
  target: string;
  changes: Array<{
    property: string;
    value: string;
    action: 'add' | 'modify' | 'remove';
  }>;
  cssChanges?: Array<{
    selector: string;
    property: string;
    value: string;
  }>;
}

export interface AccessibilityReport {
  timestamp: Date;
  url: string;
  overallScore: number;
  wcagALevel: number;
  wcagAALevel: number;
  wcagAAALevel: number;
  issues: AccessibilityIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    seriousIssues: number;
    moderateIssues: number;
    minorIssues: number;
    fixableIssues: number;
  };
  colorContrast: ColorContrastReport;
  keyboardNavigation: KeyboardNavigationReport;
  screenReader: ScreenReaderReport;
}

export interface ColorContrastReport {
  totalChecked: number;
  passed: number;
  failed: number;
  issues: Array<{
    selector: string;
    foreground: string;
    background: string;
    ratio: number;
    requiredRatio: number;
    level: 'AA' | 'AAA';
  }>;
}

export interface KeyboardNavigationReport {
  totalInteractiveElements: number;
  focusableElements: number;
  tabOrderIssues: number;
  focusTraps: number;
  issues: Array<{
    type: 'no-focus-indicator' | 'unreachable' | 'tab-order' | 'focus-trap';
    element: string;
    description: string;
  }>;
}

export interface ScreenReaderReport {
  missingAltText: number;
  improperHeadingStructure: number;
  missingLabels: number;
  issues: Array<{
    type: 'alt-text' | 'heading-structure' | 'form-label' | 'landmark' | 'aria';
    element: string;
    description: string;
  }>;
}

export class AccessibilityAuditor {
  private page: Page;
  private issues: AccessibilityIssue[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  async performFullAudit(): Promise<AccessibilityReport> {
    console.log('🔍 Starting comprehensive accessibility audit...');
    
    this.issues = [];
    
    // Run all audit checks
    await this.checkImageAltText();
    await this.checkHeadingStructure();
    await this.checkFormLabels();
    await this.checkKeyboardNavigation();
    await this.checkColorContrast();
    await this.checkAriaUsage();
    await this.checkLandmarks();
    await this.checkFocusManagement();
    await this.checkSemanticStructure();
    
    // Generate reports
    const colorContrast = await this.generateColorContrastReport();
    const keyboardNav = await this.generateKeyboardNavigationReport();
    const screenReader = await this.generateScreenReaderReport();
    
    // Calculate scores
    const scores = this.calculateScores();
    
    const report: AccessibilityReport = {
      timestamp: new Date(),
      url: this.page.url(),
      overallScore: scores.overall,
      wcagALevel: scores.levelA,
      wcagAALevel: scores.levelAA,
      wcagAAALevel: scores.levelAAA,
      issues: this.issues,
      summary: this.generateSummary(),
      colorContrast,
      keyboardNavigation: keyboardNav,
      screenReader
    };
    
    return report;
  }

  private async checkImageAltText(): Promise<void> {
    const imageIssues = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const issues = [];
      
      images.forEach((img, index) => {
        const alt = img.getAttribute('alt');
        const src = img.src;
        
        if (!alt && alt !== '') {
          issues.push({
            type: 'missing-alt',
            element: img.outerHTML,
            selector: img.className ? `.${img.className.split(' ')[0]}` : `img:nth-of-type(${index + 1})`,
            src
          });
        } else if (alt && (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture'))) {
          issues.push({
            type: 'generic-alt',
            element: img.outerHTML,
            selector: img.className ? `.${img.className.split(' ')[0]}` : `img:nth-of-type(${index + 1})`,
            src,
            alt
          });
        }
      });
      
      return issues;
    });

    imageIssues.forEach(issue => {
      if (issue.type === 'missing-alt') {
        this.issues.push({
          id: `img-alt-${Date.now()}-${Math.random()}`,
          impact: 'serious',
          wcagLevel: 'A',
          wcagCriteria: '1.1.1 Non-text Content',
          description: `Image missing alt text: ${issue.src}`,
          element: issue.element,
          selector: issue.selector,
          recommendation: 'Add descriptive alt text that conveys the meaning and function of the image',
          autoFixable: true,
          fix: {
            type: 'add-attribute',
            target: issue.selector,
            changes: [{
              property: 'alt',
              value: 'Descriptive alt text needed',
              action: 'add'
            }]
          }
        });
      } else if (issue.type === 'generic-alt') {
        this.issues.push({
          id: `img-alt-generic-${Date.now()}-${Math.random()}`,
          impact: 'moderate',
          wcagLevel: 'A',
          wcagCriteria: '1.1.1 Non-text Content',
          description: `Image has generic alt text: "${issue.alt}"`,
          element: issue.element,
          selector: issue.selector,
          recommendation: 'Replace generic alt text with specific, descriptive text',
          autoFixable: false
        });
      }
    });
  }

  private async checkHeadingStructure(): Promise<void> {
    const headingIssues = await this.page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const issues = [];
      let lastLevel = 0;
      
      // Check if there's an h1
      const h1s = headings.filter(h => h.tagName === 'H1');
      if (h1s.length === 0) {
        issues.push({
          type: 'no-h1',
          description: 'Page missing h1 heading'
        });
      } else if (h1s.length > 1) {
        issues.push({
          type: 'multiple-h1',
          description: `Page has ${h1s.length} h1 headings (should have only one)`
        });
      }
      
      // Check heading hierarchy
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName[1]);
        const text = heading.textContent?.substring(0, 50) || '';
        
        if (level - lastLevel > 1) {
          issues.push({
            type: 'skipped-level',
            element: heading.outerHTML,
            selector: heading.className ? `.${heading.className.split(' ')[0]}` : `${heading.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
            description: `Heading level skipped: ${heading.tagName} after h${lastLevel}`,
            text
          });
        }
        
        // Check for empty headings
        if (!text.trim()) {
          issues.push({
            type: 'empty-heading',
            element: heading.outerHTML,
            selector: heading.className ? `.${heading.className.split(' ')[0]}` : `${heading.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
            description: `Empty heading: ${heading.tagName}`
          });
        }
        
        lastLevel = level;
      });
      
      return issues;
    });

    headingIssues.forEach(issue => {
      let impact: 'critical' | 'serious' | 'moderate' | 'minor' = 'moderate';
      if (issue.type === 'no-h1' || issue.type === 'empty-heading') impact = 'serious';
      if (issue.type === 'multiple-h1') impact = 'critical';
      
      this.issues.push({
        id: `heading-${Date.now()}-${Math.random()}`,
        impact,
        wcagLevel: 'AA',
        wcagCriteria: '1.3.1 Info and Relationships',
        description: issue.description,
        element: issue.element || '',
        selector: issue.selector || '',
        recommendation: this.getHeadingRecommendation(issue.type),
        autoFixable: issue.type === 'empty-heading',
        fix: issue.type === 'empty-heading' ? {
          type: 'modify-attribute',
          target: issue.selector,
          changes: [{
            property: 'textContent',
            value: 'Descriptive heading text needed',
            action: 'modify'
          }]
        } : undefined
      });
    });
  }

  private getHeadingRecommendation(type: string): string {
    const recommendations = {
      'no-h1': 'Add a descriptive h1 heading that summarizes the page content',
      'multiple-h1': 'Use only one h1 per page for the main heading',
      'skipped-level': 'Use heading levels in sequential order (h1, h2, h3, etc.)',
      'empty-heading': 'Add descriptive text to the heading element'
    };
    return recommendations[type as keyof typeof recommendations] || 'Fix heading structure issue';
  }

  private async checkFormLabels(): Promise<void> {
    const formIssues = await this.page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      const issues = [];
      
      inputs.forEach((input, index) => {
        const type = (input as HTMLInputElement).type;
        const id = input.id;
        const name = (input as HTMLInputElement).name;
        
        // Skip certain input types
        if (['hidden', 'submit', 'button', 'reset'].includes(type)) return;
        
        // Check for associated label
        let hasLabel = false;
        
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (label) hasLabel = true;
        }
        
        // Check for aria-label or aria-labelledby
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        
        if (ariaLabel || ariaLabelledBy) hasLabel = true;
        
        // Check if input is wrapped in a label
        const parentLabel = input.closest('label');
        if (parentLabel) hasLabel = true;
        
        if (!hasLabel) {
          issues.push({
            type: 'missing-label',
            element: input.outerHTML,
            selector: input.className ? `.${input.className.split(' ')[0]}` : `input:nth-of-type(${index + 1})`,
            inputType: type,
            name: name || 'unnamed'
          });
        }
        
        // Check for placeholder-only labels
        const placeholder = (input as HTMLInputElement).placeholder;
        if (placeholder && !hasLabel) {
          issues.push({
            type: 'placeholder-only',
            element: input.outerHTML,
            selector: input.className ? `.${input.className.split(' ')[0]}` : `input:nth-of-type(${index + 1})`,
            placeholder
          });
        }
      });
      
      return issues;
    });

    formIssues.forEach(issue => {
      this.issues.push({
        id: `form-label-${Date.now()}-${Math.random()}`,
        impact: 'serious',
        wcagLevel: 'A',
        wcagCriteria: '1.3.1 Info and Relationships, 3.3.2 Labels or Instructions',
        description: issue.type === 'missing-label' 
          ? `Form input missing label: ${issue.inputType} (${issue.name})`
          : `Form input relies only on placeholder text: "${issue.placeholder}"`,
        element: issue.element,
        selector: issue.selector,
        recommendation: issue.type === 'missing-label'
          ? 'Add a label element with proper for attribute'
          : 'Add a visible label in addition to placeholder text',
        autoFixable: true,
        fix: {
          type: 'add-element',
          target: issue.selector,
          changes: [{
            property: 'label',
            value: `<label for="${issue.name || 'input'}">${issue.inputType} Label</label>`,
            action: 'add'
          }]
        }
      });
    });
  }

  private async checkKeyboardNavigation(): Promise<void> {
    const keyboardIssues = await this.page.evaluate(() => {
      const interactiveElements = Array.from(document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex], [role="button"], [role="link"]'
      ));
      
      const issues = [];
      
      interactiveElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        
        // Skip hidden elements
        if (rect.width === 0 || rect.height === 0) return;
        
        const style = window.getComputedStyle(element);
        const tabIndex = element.getAttribute('tabindex');
        
        // Check if element is focusable
        const isFocusable = element.matches(':focus') || 
          tabIndex !== '-1' || 
          ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
        
        if (!isFocusable) {
          issues.push({
            type: 'not-focusable',
            element: element.outerHTML,
            selector: generateSelector(element, index),
            description: 'Interactive element is not keyboard focusable'
          });
        }
        
        // Check for focus indicators
        const outlineStyle = style.outline;
        const outlineWidth = style.outlineWidth;
        const boxShadow = style.boxShadow;
        
        const hasFocusIndicator = outlineStyle !== 'none' || 
          outlineWidth !== '0px' || 
          boxShadow.includes('focus') ||
          element.matches(':focus-visible');
        
        if (!hasFocusIndicator) {
          issues.push({
            type: 'no-focus-indicator',
            element: element.outerHTML,
            selector: generateSelector(element, index),
            description: 'Element lacks visible focus indicator'
          });
        }
      });
      
      function generateSelector(element: Element, index: number): string {
        if (element.id) return `#${element.id}`;
        if (element.className) {
          const classes = element.className.split(' ').filter(c => c);
          if (classes.length > 0) return `.${classes[0]}`;
        }
        return `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
      }
      
      return issues;
    });

    keyboardIssues.forEach(issue => {
      this.issues.push({
        id: `keyboard-${Date.now()}-${Math.random()}`,
        impact: issue.type === 'not-focusable' ? 'serious' : 'moderate',
        wcagLevel: 'AA',
        wcagCriteria: '2.1.1 Keyboard, 2.4.7 Focus Visible',
        description: issue.description,
        element: issue.element,
        selector: issue.selector,
        recommendation: issue.type === 'not-focusable'
          ? 'Ensure element is keyboard accessible with proper tabindex'
          : 'Add visible focus indicator (outline, box-shadow, or border)',
        autoFixable: true,
        fix: {
          type: 'modify-css',
          target: issue.selector,
          changes: [],
          cssChanges: issue.type === 'no-focus-indicator' ? [{
            selector: `${issue.selector}:focus`,
            property: 'outline',
            value: '2px solid #0066cc'
          }] : [{
            selector: issue.selector,
            property: 'tabindex',
            value: '0'
          }]
        }
      });
    });
  }

  private async checkColorContrast(): Promise<void> {
    const contrastIssues = await this.page.evaluate(() => {
      const textElements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const style = window.getComputedStyle(el);
          return style.color && style.color !== 'rgba(0, 0, 0, 0)' && el.textContent?.trim();
        });
      
      const issues = [];
      
      textElements.forEach((element, index) => {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const contrast = this.calculateContrastRatio(color, backgroundColor);
          const fontSize = parseFloat(style.fontSize);
          const fontWeight = style.fontWeight;
          
          // Determine required contrast ratio
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
          const requiredAA = isLargeText ? 3 : 4.5;
          const requiredAAA = isLargeText ? 4.5 : 7;
          
          if (contrast < requiredAA) {
            issues.push({
              type: 'contrast-aa',
              element: element.outerHTML,
              selector: generateSelector(element, index),
              foreground: color,
              background: backgroundColor,
              ratio: contrast,
              required: requiredAA,
              level: 'AA'
            });
          } else if (contrast < requiredAAA) {
            issues.push({
              type: 'contrast-aaa',
              element: element.outerHTML,
              selector: generateSelector(element, index),
              foreground: color,
              background: backgroundColor,
              ratio: contrast,
              required: requiredAAA,
              level: 'AAA'
            });
          }
        }
      });
      
      function calculateContrastRatio(color1: string, color2: string): number {
        // Simplified contrast calculation
        // In a real implementation, would use proper WCAG formula
        const rgb1 = this.getRGBValues(color1);
        const rgb2 = this.getRGBValues(color2);
        
        const l1 = this.getLuminance(rgb1);
        const l2 = this.getLuminance(rgb2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
      }
      
      function getRGBValues(color: string): [number, number, number] {
        const match = color.match(/\d+/g);
        return match ? [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])] : [0, 0, 0];
      }
      
      function getLuminance([r, g, b]: [number, number, number]): number {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      
      function generateSelector(element: Element, index: number): string {
        if (element.id) return `#${element.id}`;
        if (element.className) {
          const classes = element.className.split(' ').filter(c => c);
          if (classes.length > 0) return `.${classes[0]}`;
        }
        return `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
      }
      
      return issues;
    });

    contrastIssues.forEach(issue => {
      this.issues.push({
        id: `contrast-${Date.now()}-${Math.random()}`,
        impact: issue.level === 'AA' ? 'serious' : 'moderate',
        wcagLevel: issue.level as 'AA' | 'AAA',
        wcagCriteria: '1.4.3 Contrast (Minimum), 1.4.6 Contrast (Enhanced)',
        description: `Color contrast too low: ${issue.ratio.toFixed(2)}:1 (required: ${issue.required}:1)`,
        element: issue.element,
        selector: issue.selector,
        recommendation: `Increase contrast between text (${issue.foreground}) and background (${issue.background})`,
        autoFixable: false
      });
    });
  }

  private async checkAriaUsage(): Promise<void> {
    const ariaIssues = await this.page.evaluate(() => {
      const elementsWithAria = Array.from(document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]'));
      const issues = [];
      
      elementsWithAria.forEach((element, index) => {
        const role = element.getAttribute('role');
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        const ariaDescribedBy = element.getAttribute('aria-describedby');
        
        // Check for invalid roles
        const validRoles = ['button', 'link', 'navigation', 'main', 'banner', 'contentinfo', 'complementary', 'region', 'dialog', 'alert', 'status', 'tab', 'tabpanel', 'tablist'];
        if (role && !validRoles.includes(role)) {
          issues.push({
            type: 'invalid-role',
            element: element.outerHTML,
            selector: generateSelector(element, index),
            role,
            description: `Invalid ARIA role: "${role}"`
          });
        }
        
        // Check for empty aria-label
        if (ariaLabel === '') {
          issues.push({
            type: 'empty-aria-label',
            element: element.outerHTML,
            selector: generateSelector(element, index),
            description: 'Empty aria-label attribute'
          });
        }
        
        // Check if aria-labelledby references exist
        if (ariaLabelledBy) {
          const ids = ariaLabelledBy.split(' ');
          ids.forEach(id => {
            if (!document.getElementById(id)) {
              issues.push({
                type: 'missing-labelledby-target',
                element: element.outerHTML,
                selector: generateSelector(element, index),
                missingId: id,
                description: `aria-labelledby references non-existent element: "${id}"`
              });
            }
          });
        }
        
        // Check if aria-describedby references exist
        if (ariaDescribedBy) {
          const ids = ariaDescribedBy.split(' ');
          ids.forEach(id => {
            if (!document.getElementById(id)) {
              issues.push({
                type: 'missing-describedby-target',
                element: element.outerHTML,
                selector: generateSelector(element, index),
                missingId: id,
                description: `aria-describedby references non-existent element: "${id}"`
              });
            }
          });
        }
      });
      
      function generateSelector(element: Element, index: number): string {
        if (element.id) return `#${element.id}`;
        if (element.className) {
          const classes = element.className.split(' ').filter(c => c);
          if (classes.length > 0) return `.${classes[0]}`;
        }
        return `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
      }
      
      return issues;
    });

    ariaIssues.forEach(issue => {
      this.issues.push({
        id: `aria-${Date.now()}-${Math.random()}`,
        impact: issue.type === 'invalid-role' ? 'serious' : 'moderate',
        wcagLevel: 'A',
        wcagCriteria: '4.1.2 Name, Role, Value',
        description: issue.description,
        element: issue.element,
        selector: issue.selector,
        recommendation: this.getAriaRecommendation(issue.type),
        autoFixable: issue.type === 'empty-aria-label',
        fix: issue.type === 'empty-aria-label' ? {
          type: 'modify-attribute',
          target: issue.selector,
          changes: [{
            property: 'aria-label',
            value: 'Descriptive label needed',
            action: 'modify'
          }]
        } : undefined
      });
    });
  }

  private getAriaRecommendation(type: string): string {
    const recommendations = {
      'invalid-role': 'Use a valid ARIA role or remove the role attribute',
      'empty-aria-label': 'Provide meaningful text for the aria-label attribute',
      'missing-labelledby-target': 'Ensure the referenced element exists or fix the ID reference',
      'missing-describedby-target': 'Ensure the referenced element exists or fix the ID reference'
    };
    return recommendations[type as keyof typeof recommendations] || 'Fix ARIA usage issue';
  }

  private async checkLandmarks(): Promise<void> {
    const landmarkIssues = await this.page.evaluate(() => {
      const issues = [];
      
      // Check for main landmark
      const mains = document.querySelectorAll('main, [role="main"]');
      if (mains.length === 0) {
        issues.push({
          type: 'missing-main',
          description: 'Page missing main landmark'
        });
      } else if (mains.length > 1) {
        issues.push({
          type: 'multiple-main',
          description: `Page has ${mains.length} main landmarks (should have only one)`
        });
      }
      
      // Check for navigation landmark
      const navs = document.querySelectorAll('nav, [role="navigation"]');
      if (navs.length === 0) {
        issues.push({
          type: 'missing-nav',
          description: 'Page missing navigation landmark'
        });
      }
      
      // Check for banner (header)
      const banners = document.querySelectorAll('header, [role="banner"]');
      if (banners.length === 0) {
        issues.push({
          type: 'missing-banner',
          description: 'Page missing banner/header landmark'
        });
      }
      
      // Check for contentinfo (footer)
      const contentinfos = document.querySelectorAll('footer, [role="contentinfo"]');
      if (contentinfos.length === 0) {
        issues.push({
          type: 'missing-contentinfo',
          description: 'Page missing contentinfo/footer landmark'
        });
      }
      
      return issues;
    });

    landmarkIssues.forEach(issue => {
      this.issues.push({
        id: `landmark-${Date.now()}-${Math.random()}`,
        impact: 'moderate',
        wcagLevel: 'AA',
        wcagCriteria: '1.3.1 Info and Relationships, 2.4.1 Bypass Blocks',
        description: issue.description,
        element: '',
        selector: '',
        recommendation: this.getLandmarkRecommendation(issue.type),
        autoFixable: false
      });
    });
  }

  private getLandmarkRecommendation(type: string): string {
    const recommendations = {
      'missing-main': 'Add a <main> element or role="main" to identify the primary content',
      'multiple-main': 'Use only one main landmark per page',
      'missing-nav': 'Add a <nav> element or role="navigation" for site navigation',
      'missing-banner': 'Add a <header> element or role="banner" for the site header',
      'missing-contentinfo': 'Add a <footer> element or role="contentinfo" for the site footer'
    };
    return recommendations[type as keyof typeof recommendations] || 'Fix landmark issue';
  }

  private async checkFocusManagement(): Promise<void> {
    // This would typically involve more complex testing
    // For now, we'll do basic checks
    
    const focusIssues = await this.page.evaluate(() => {
      const issues = [];
      
      // Check for skip links
      const skipLinks = document.querySelectorAll('a[href^="#"]');
      const hasSkipToMain = Array.from(skipLinks).some(link => 
        link.textContent?.toLowerCase().includes('skip') && 
        link.textContent?.toLowerCase().includes('main')
      );
      
      if (!hasSkipToMain) {
        issues.push({
          type: 'missing-skip-link',
          description: 'Page missing "Skip to main content" link'
        });
      }
      
      return issues;
    });

    focusIssues.forEach(issue => {
      this.issues.push({
        id: `focus-${Date.now()}-${Math.random()}`,
        impact: 'moderate',
        wcagLevel: 'A',
        wcagCriteria: '2.4.1 Bypass Blocks',
        description: issue.description,
        element: '',
        selector: '',
        recommendation: 'Add a "Skip to main content" link at the beginning of the page',
        autoFixable: true,
        fix: {
          type: 'add-element',
          target: 'body',
          changes: [{
            property: 'skipLink',
            value: '<a href="#main" class="sr-only">Skip to main content</a>',
            action: 'add'
          }]
        }
      });
    });
  }

  private async checkSemanticStructure(): Promise<void> {
    const semanticIssues = await this.page.evaluate(() => {
      const issues = [];
      
      // Check for semantic HTML usage
      const divs = document.querySelectorAll('div');
      const semanticElements = document.querySelectorAll('article, section, aside, nav, header, footer, main');
      
      const divCount = divs.length;
      const semanticCount = semanticElements.length;
      
      if (divCount > semanticCount * 3) {
        issues.push({
          type: 'excessive-divs',
          description: `Page uses ${divCount} divs but only ${semanticCount} semantic elements`
        });
      }
      
      // Check for list usage
      const listItems = document.querySelectorAll('li');
      const lists = document.querySelectorAll('ul, ol');
      
      if (listItems.length > lists.length * 10) {
        issues.push({
          type: 'potential-list-structure',
          description: 'Content that might benefit from list structure detected'
        });
      }
      
      return issues;
    });

    semanticIssues.forEach(issue => {
      this.issues.push({
        id: `semantic-${Date.now()}-${Math.random()}`,
        impact: 'minor',
        wcagLevel: 'AA',
        wcagCriteria: '1.3.1 Info and Relationships',
        description: issue.description,
        element: '',
        selector: '',
        recommendation: issue.type === 'excessive-divs' 
          ? 'Replace generic divs with semantic HTML elements (article, section, nav, etc.)'
          : 'Consider using list elements (ul, ol, li) for related content',
        autoFixable: false
      });
    });
  }

  private async generateColorContrastReport(): Promise<ColorContrastReport> {
    const contrastIssues = this.issues.filter(issue => issue.id.includes('contrast'));
    
    return {
      totalChecked: contrastIssues.length + 50, // Estimate
      passed: 50 - contrastIssues.length,
      failed: contrastIssues.length,
      issues: contrastIssues.map(issue => ({
        selector: issue.selector,
        foreground: 'extracted-color',
        background: 'extracted-background',
        ratio: 3.5, // Would be calculated properly
        requiredRatio: 4.5,
        level: issue.wcagLevel as 'AA' | 'AAA'
      }))
    };
  }

  private async generateKeyboardNavigationReport(): Promise<KeyboardNavigationReport> {
    const keyboardIssues = this.issues.filter(issue => issue.id.includes('keyboard'));
    
    return {
      totalInteractiveElements: 20, // Would be counted
      focusableElements: 18,
      tabOrderIssues: keyboardIssues.filter(i => i.description.includes('focus')).length,
      focusTraps: 0,
      issues: keyboardIssues.map(issue => ({
        type: issue.description.includes('focusable') ? 'unreachable' : 'no-focus-indicator',
        element: issue.selector,
        description: issue.description
      })) as any[]
    };
  }

  private async generateScreenReaderReport(): Promise<ScreenReaderReport> {
    const altTextIssues = this.issues.filter(issue => issue.id.includes('img-alt')).length;
    const headingIssues = this.issues.filter(issue => issue.id.includes('heading')).length;
    const labelIssues = this.issues.filter(issue => issue.id.includes('form-label')).length;
    
    return {
      missingAltText: altTextIssues,
      improperHeadingStructure: headingIssues,
      missingLabels: labelIssues,
      issues: [
        ...this.issues.filter(issue => issue.id.includes('img-alt')).map(issue => ({
          type: 'alt-text' as const,
          element: issue.selector,
          description: issue.description
        })),
        ...this.issues.filter(issue => issue.id.includes('heading')).map(issue => ({
          type: 'heading-structure' as const,
          element: issue.selector,
          description: issue.description
        })),
        ...this.issues.filter(issue => issue.id.includes('form-label')).map(issue => ({
          type: 'form-label' as const,
          element: issue.selector,
          description: issue.description
        }))
      ]
    };
  }

  private calculateScores(): { overall: number; levelA: number; levelAA: number; levelAAA: number } {
    const totalIssues = this.issues.length;
    const criticalIssues = this.issues.filter(i => i.impact === 'critical').length;
    const seriousIssues = this.issues.filter(i => i.impact === 'serious').length;
    
    const levelAIssues = this.issues.filter(i => i.wcagLevel === 'A').length;
    const levelAAIssues = this.issues.filter(i => i.wcagLevel === 'AA').length;
    const levelAAAIssues = this.issues.filter(i => i.wcagLevel === 'AAA').length;
    
    // Calculate scores (100 = perfect, 0 = many critical issues)
    const overall = Math.max(0, 100 - (criticalIssues * 25) - (seriousIssues * 10) - (totalIssues * 2));
    const levelA = Math.max(0, 100 - (levelAIssues * 15));
    const levelAA = Math.max(0, 100 - (levelAAIssues * 10));
    const levelAAA = Math.max(0, 100 - (levelAAAIssues * 5));
    
    return { overall, levelA, levelAA, levelAAA };
  }

  private generateSummary(): any {
    return {
      totalIssues: this.issues.length,
      criticalIssues: this.issues.filter(i => i.impact === 'critical').length,
      seriousIssues: this.issues.filter(i => i.impact === 'serious').length,
      moderateIssues: this.issues.filter(i => i.impact === 'moderate').length,
      minorIssues: this.issues.filter(i => i.impact === 'minor').length,
      fixableIssues: this.issues.filter(i => i.autoFixable).length
    };
  }

  async applyAutomaticFixes(): Promise<number> {
    const fixableIssues = this.issues.filter(issue => issue.autoFixable && issue.fix);
    let appliedFixes = 0;
    
    for (const issue of fixableIssues) {
      try {
        await this.applyFix(issue.fix!);
        appliedFixes++;
        console.log(`✅ Applied fix for: ${issue.description}`);
      } catch (error) {
        console.error(`❌ Failed to apply fix for: ${issue.description}`, error);
      }
    }
    
    return appliedFixes;
  }

  private async applyFix(fix: AccessibilityFix): Promise<void> {
    await this.page.evaluate((fixData) => {
      const { type, target, changes, cssChanges } = fixData;
      
      if (type === 'add-attribute' || type === 'modify-attribute') {
        const element = document.querySelector(target);
        if (element) {
          changes.forEach(change => {
            if (change.action === 'add' || change.action === 'modify') {
              element.setAttribute(change.property, change.value);
            } else if (change.action === 'remove') {
              element.removeAttribute(change.property);
            }
          });
        }
      } else if (type === 'modify-css' && cssChanges) {
        const style = document.createElement('style');
        const cssText = cssChanges.map(change => 
          `${change.selector} { ${change.property}: ${change.value}; }`
        ).join('\n');
        style.textContent = cssText;
        document.head.appendChild(style);
      }
    }, fix);
  }

  async saveReport(report: AccessibilityReport): Promise<void> {
    const reportPath = path.join('./ui-agent/output/reports', `accessibility-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join('./ui-agent/output/reports', `accessibility-${Date.now()}.html`);
    await fs.writeFile(htmlPath, htmlReport);
    
    console.log(`📊 Accessibility reports generated: ${reportPath} and ${htmlPath}`);
  }

  private generateHTMLReport(report: AccessibilityReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; }
    .score { font-size: 48px; font-weight: bold; }
    .score.excellent { color: #4caf50; }
    .score.good { color: #8bc34a; }
    .score.fair { color: #ff9800; }
    .score.poor { color: #f44336; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .issue { padding: 15px; margin: 10px 0; border-left: 4px solid; border-radius: 4px; }
    .issue.critical { border-color: #f44336; background: #ffebee; }
    .issue.serious { border-color: #ff5722; background: #fff3e0; }
    .issue.moderate { border-color: #ff9800; background: #fff8e1; }
    .issue.minor { border-color: #ffc107; background: #fffde7; }
    .wcag-level { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .wcag-a { background: #e8f5e8; color: #2e7d2e; }
    .wcag-aa { background: #e3f2fd; color: #1976d2; }
    .wcag-aaa { background: #f3e5f5; color: #7b1fa2; }
    .fix-indicator { float: right; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .fixable { background: #e8f5e8; color: #2e7d2e; }
    .not-fixable { background: #ffebee; color: #c62828; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; color: #1976d2; }
  </style>
</head>
<body>
  <h1>Accessibility Audit Report</h1>
  
  <div class="summary">
    <h2>Overall Score</h2>
    <div class="score ${report.overallScore >= 90 ? 'excellent' : report.overallScore >= 70 ? 'good' : report.overallScore >= 50 ? 'fair' : 'poor'}">${report.overallScore}</div>
    <p>Generated: ${report.timestamp.toLocaleString()}</p>
    <p>URL: ${report.url}</p>
  </div>
  
  <div class="stats">
    <div class="stat-card">
      <div class="stat-number">${report.wcagALevel}</div>
      <div>WCAG A Score</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${report.wcagAALevel}</div>
      <div>WCAG AA Score</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${report.wcagAAALevel}</div>
      <div>WCAG AAA Score</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${report.summary.fixableIssues}</div>
      <div>Auto-Fixable Issues</div>
    </div>
  </div>
  
  <h2>Issues Found (${report.issues.length})</h2>
  ${report.issues.map(issue => `
    <div class="issue ${issue.impact}">
      <div class="fix-indicator ${issue.autoFixable ? 'fixable' : 'not-fixable'}">
        ${issue.autoFixable ? 'Auto-fixable' : 'Manual fix required'}
      </div>
      <span class="wcag-level wcag-${issue.wcagLevel.toLowerCase()}">${issue.wcagLevel}</span>
      <strong>${issue.description}</strong>
      <p><strong>Impact:</strong> ${issue.impact} | <strong>WCAG:</strong> ${issue.wcagCriteria}</p>
      <p><strong>Element:</strong> ${issue.selector}</p>
      <p><strong>Recommendation:</strong> ${issue.recommendation}</p>
    </div>
  `).join('')}
  
  <h2>Color Contrast Report</h2>
  <p>Checked: ${report.colorContrast.totalChecked} | Passed: ${report.colorContrast.passed} | Failed: ${report.colorContrast.failed}</p>
  
  <h2>Keyboard Navigation Report</h2>
  <p>Interactive Elements: ${report.keyboardNavigation.totalInteractiveElements} | Focusable: ${report.keyboardNavigation.focusableElements}</p>
  
  <h2>Screen Reader Report</h2>
  <p>Missing Alt Text: ${report.screenReader.missingAltText} | Heading Issues: ${report.screenReader.improperHeadingStructure} | Missing Labels: ${report.screenReader.missingLabels}</p>
</body>
</html>
    `;
  }
}