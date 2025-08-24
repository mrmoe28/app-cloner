#!/usr/bin/env node

import { chromium, Browser, Page } from '@playwright/test';
import { UIAnalyzer } from './analyzer';
import { ErrorFixer } from './error-fixer';
import { Navigator } from './navigator';
import { VisualRenderer } from './visual-renderer';
import { AccessibilityAuditor } from './accessibility-auditor';
import { defaultConfig, UIAgentConfig } from './config';
import * as fs from 'fs/promises';
import * as path from 'path';

export class UIAgent {
  private browser: Browser | null = null;
  private config: UIAgentConfig;
  private analyzer: UIAnalyzer;
  private errorFixer: ErrorFixer;
  private navigator: Navigator | null = null;
  private visualRenderer: VisualRenderer;
  private accessibilityAuditor: AccessibilityAuditor | null = null;

  constructor(config: Partial<UIAgentConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.analyzer = new UIAnalyzer(this.config);
    this.errorFixer = new ErrorFixer();
    this.visualRenderer = new VisualRenderer();
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing UI Agent...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Initialize all sub-systems
    await this.analyzer.initialize();
    await this.visualRenderer.initialize();
    
    // Ensure output directories exist
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'screenshots'), { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'reports'), { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'references'), { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'analysis'), { recursive: true });
    
    console.log('✅ UI Agent initialized successfully');
  }

  async runFullAnalysis(): Promise<void> {
    if (!this.browser) {
      await this.initialize();
    }

    console.log('🔥 Starting comprehensive UI analysis and improvement...');
    
    const startTime = Date.now();
    
    try {
      // Phase 1: Reference Analysis
      console.log('\n📚 Phase 1: Analyzing reference designs...');
      const referenceAnalyses = await this.visualRenderer.scrapeReferences();
      console.log(`✅ Analyzed ${referenceAnalyses.length} reference designs`);
      
      // Phase 2: Current App Analysis
      console.log('\n🔍 Phase 2: Analyzing current application...');
      const uiAnalysisResults = await this.analyzer.analyze();
      console.log(`✅ Analyzed ${uiAnalysisResults.length} pages/viewports`);
      
      // Phase 3: Error Detection and Auto-Fix
      console.log('\n🔧 Phase 3: Error detection and auto-fixing...');
      const page = await this.browser!.newPage();
      
      try {
        await this.errorFixer.monitorConsole(page);
        
        // Test each route for errors
        for (const route of this.config.routes) {
          console.log(`Testing route: ${route.path}`);
          await page.goto(`${this.config.baseUrl}${route.path}`);
          await page.waitForLoadState('networkidle');
          
          if (route.waitForSelector) {
            await page.waitForSelector(route.waitForSelector, { timeout: 10000 });
          }
          
          // Wait for any console errors to be captured
          await page.waitForTimeout(2000);
        }
        
        const errors = this.errorFixer.getErrors();
        const fixes = this.errorFixer.getFixes();
        console.log(`✅ Found ${errors.length} errors, applied ${fixes.length} auto-fixes`);
        
      } finally {
        await page.close();
      }
      
      // Phase 4: Browser Navigation Testing
      console.log('\n🧭 Phase 4: Comprehensive navigation testing...');
      const navPage = await this.browser!.newPage();
      
      try {
        this.navigator = new Navigator(navPage, this.errorFixer, this.config);
        await this.navigator.exploreApplication();
        
        const bugs = this.navigator.getBugs();
        console.log(`✅ Navigation testing complete, found ${bugs.length} issues`);
        
      } finally {
        await navPage.close();
      }
      
      // Phase 5: Accessibility Audit
      console.log('\n♿ Phase 5: Comprehensive accessibility audit...');
      const a11yPage = await this.browser!.newPage();
      
      try {
        this.accessibilityAuditor = new AccessibilityAuditor(a11yPage);
        
        // Test accessibility on each route
        const accessibilityReports = [];
        for (const route of this.config.routes) {
          await a11yPage.goto(`${this.config.baseUrl}${route.path}`);
          await a11yPage.waitForLoadState('networkidle');
          
          if (route.waitForSelector) {
            await a11yPage.waitForSelector(route.waitForSelector, { timeout: 10000 });
          }
          
          const report = await this.accessibilityAuditor.performFullAudit();
          accessibilityReports.push(report);
          
          // Apply automatic fixes
          const appliedFixes = await this.accessibilityAuditor.applyAutomaticFixes();
          console.log(`✅ Applied ${appliedFixes} accessibility fixes for ${route.path}`);
        }
        
        // Save accessibility reports
        for (const report of accessibilityReports) {
          await this.accessibilityAuditor.saveReport(report);
        }
        
        console.log(`✅ Accessibility audit complete, tested ${accessibilityReports.length} routes`);
        
      } finally {
        await a11yPage.close();
      }
      
      // Phase 6: Generate Comprehensive Report
      console.log('\n📊 Phase 6: Generating comprehensive improvement report...');
      await this.generateMasterReport({
        references: referenceAnalyses,
        uiAnalysis: uiAnalysisResults,
        errors: this.errorFixer.getErrors(),
        fixes: this.errorFixer.getFixes(),
        bugs: this.navigator?.getBugs() || [],
        accessibility: [] // Would include accessibility reports
      });
      
      // Phase 7: Generate Improvement Suggestions
      console.log('\n💡 Phase 7: Generating AI-powered improvement suggestions...');
      const suggestions = await this.generateImprovementPlan({
        references: referenceAnalyses,
        uiAnalysis: uiAnalysisResults,
        navigator: this.navigator
      });
      
      await this.saveImprovementPlan(suggestions);
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n🎉 Full analysis complete in ${duration}s!`);
      console.log('📁 Check ./ui-agent/output/ for all reports and recommendations');
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    }
  }

  async runQuickAnalysis(): Promise<void> {
    if (!this.browser) {
      await this.initialize();
    }

    console.log('⚡ Running quick UI analysis...');
    
    const page = await this.browser!.newPage();
    
    try {
      // Quick error check
      await this.errorFixer.monitorConsole(page);
      await page.goto(this.config.baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      const errors = this.errorFixer.getErrors();
      console.log(`Found ${errors.length} console errors`);
      
      // Quick accessibility check
      this.accessibilityAuditor = new AccessibilityAuditor(page);
      const a11yReport = await this.accessibilityAuditor.performFullAudit();
      console.log(`Accessibility score: ${a11yReport.overallScore}/100`);
      
      // Apply quick fixes
      const errorFixes = await this.errorFixer.getErrors().length;
      const a11yFixes = await this.accessibilityAuditor.applyAutomaticFixes();
      
      console.log(`✅ Quick analysis complete. Applied ${errorFixes + a11yFixes} fixes.`);
      
    } finally {
      await page.close();
    }
  }

  async fixOnlyErrors(): Promise<void> {
    if (!this.browser) {
      await this.initialize();
    }

    console.log('🔧 Running error detection and auto-fix...');
    
    const page = await this.browser!.newPage();
    
    try {
      await this.errorFixer.monitorConsole(page);
      
      // Test all routes for errors
      for (const route of this.config.routes) {
        console.log(`Checking ${route.path} for errors...`);
        await page.goto(`${this.config.baseUrl}${route.path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      }
      
      const errors = this.errorFixer.getErrors();
      const fixes = this.errorFixer.getFixes();
      
      console.log(`✅ Found ${errors.length} errors, applied ${fixes.length} auto-fixes`);
      
      await this.errorFixer.generateReport();
      
    } finally {
      await page.close();
    }
  }

  async runAccessibilityAudit(): Promise<void> {
    if (!this.browser) {
      await this.initialize();
    }

    console.log('♿ Running comprehensive accessibility audit...');
    
    const page = await this.browser!.newPage();
    
    try {
      this.accessibilityAuditor = new AccessibilityAuditor(page);
      
      for (const route of this.config.routes) {
        console.log(`Auditing accessibility for ${route.path}...`);
        
        await page.goto(`${this.config.baseUrl}${route.path}`);
        await page.waitForLoadState('networkidle');
        
        if (route.waitForSelector) {
          await page.waitForSelector(route.waitForSelector, { timeout: 10000 });
        }
        
        const report = await this.accessibilityAuditor.performFullAudit();
        await this.accessibilityAuditor.saveReport(report);
        
        const fixes = await this.accessibilityAuditor.applyAutomaticFixes();
        console.log(`✅ ${route.path}: Score ${report.overallScore}/100, Applied ${fixes} fixes`);
      }
      
    } finally {
      await page.close();
    }
  }

  private async generateMasterReport(data: any): Promise<void> {
    const report = {
      timestamp: new Date(),
      summary: {
        referencesAnalyzed: data.references.length,
        pagesAnalyzed: data.uiAnalysis.length,
        errorsFound: data.errors.length,
        autoFixesApplied: data.fixes.length,
        bugsDiscovered: data.bugs.length,
        overallHealthScore: this.calculateOverallHealthScore(data)
      },
      recommendations: {
        immediate: this.getImmediateRecommendations(data),
        shortTerm: this.getShortTermRecommendations(data),
        longTerm: this.getLongTermRecommendations(data)
      },
      detailedFindings: {
        references: data.references,
        uiAnalysis: data.uiAnalysis,
        errors: data.errors,
        fixes: data.fixes,
        bugs: data.bugs,
        accessibility: data.accessibility
      }
    };
    
    const reportPath = path.join(this.config.outputDir, 'reports', `master-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML master report
    const htmlReport = this.generateMasterHTMLReport(report);
    const htmlPath = path.join(this.config.outputDir, 'reports', `master-report-${Date.now()}.html`);
    await fs.writeFile(htmlPath, htmlReport);
    
    console.log(`📊 Master report generated: ${reportPath}`);
  }

  private calculateOverallHealthScore(data: any): number {
    let score = 100;
    
    // Deduct points for issues
    score -= Math.min(data.errors.length * 5, 30); // Max 30 points for errors
    score -= Math.min(data.bugs.length * 3, 20);   // Max 20 points for bugs
    
    // Add points for fixes applied
    score += Math.min(data.fixes.length * 2, 10);  // Max 10 points for fixes
    
    return Math.max(0, Math.min(100, score));
  }

  private getImmediateRecommendations(data: any): string[] {
    const recommendations = [];
    
    if (data.errors.length > 0) {
      recommendations.push(`Fix ${data.errors.length} console errors immediately`);
    }
    
    if (data.bugs.filter((b: any) => b.severity === 'critical').length > 0) {
      recommendations.push('Address critical bugs that prevent core functionality');
    }
    
    recommendations.push('Apply all available auto-fixes for accessibility issues');
    
    return recommendations;
  }

  private getShortTermRecommendations(data: any): string[] {
    const recommendations = [];
    
    if (data.references.length > 0) {
      const bestReference = data.references.reduce((best: any, current: any) => 
        current.designScore > best.designScore ? current : best
      );
      recommendations.push(`Implement design patterns from highest-scoring reference (${bestReference.url})`);
    }
    
    recommendations.push('Improve color contrast ratios for better accessibility');
    recommendations.push('Standardize spacing and typography across all components');
    
    return recommendations;
  }

  private getLongTermRecommendations(data: any): string[] {
    return [
      'Implement comprehensive design system based on reference analysis',
      'Set up automated accessibility testing in CI/CD pipeline',
      'Create component library for consistency',
      'Implement progressive enhancement strategies'
    ];
  }

  private generateMasterHTMLReport(report: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Agent - Master Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; line-height: 1.6; }
    h1 { color: #333; text-align: center; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .health-score { font-size: 72px; font-weight: bold; margin: 20px 0; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .summary-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center; }
    .summary-number { font-size: 32px; font-weight: bold; color: #1976d2; }
    .recommendations { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .recommendation { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #1976d2; border-radius: 4px; }
    .priority-immediate { border-left-color: #f44336; }
    .priority-short { border-left-color: #ff9800; }
    .priority-long { border-left-color: #4caf50; }
    .timestamp { text-align: center; color: #666; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 UI Agent Analysis Report</h1>
    <div class="health-score">${report.summary.overallHealthScore}/100</div>
    <p>Overall Application Health Score</p>
  </div>
  
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-number">${report.summary.referencesAnalyzed}</div>
      <div>References Analyzed</div>
    </div>
    <div class="summary-card">
      <div class="summary-number">${report.summary.pagesAnalyzed}</div>
      <div>Pages Analyzed</div>
    </div>
    <div class="summary-card">
      <div class="summary-number">${report.summary.errorsFound}</div>
      <div>Errors Found</div>
    </div>
    <div class="summary-card">
      <div class="summary-number">${report.summary.autoFixesApplied}</div>
      <div>Auto-Fixes Applied</div>
    </div>
    <div class="summary-card">
      <div class="summary-number">${report.summary.bugsDiscovered}</div>
      <div>Bugs Discovered</div>
    </div>
  </div>
  
  <div class="recommendations">
    <h2>🚨 Immediate Actions Required</h2>
    ${report.recommendations.immediate.map((rec: string) => `
      <div class="recommendation priority-immediate">${rec}</div>
    `).join('')}
    
    <h2>📅 Short-term Improvements</h2>
    ${report.recommendations.shortTerm.map((rec: string) => `
      <div class="recommendation priority-short">${rec}</div>
    `).join('')}
    
    <h2>🔮 Long-term Strategic Goals</h2>
    ${report.recommendations.longTerm.map((rec: string) => `
      <div class="recommendation priority-long">${rec}</div>
    `).join('')}
  </div>
  
  <div class="timestamp">
    Generated: ${report.timestamp}
  </div>
</body>
</html>
    `;
  }

  private async generateImprovementPlan(data: any): Promise<string[]> {
    const suggestions = [];
    
    // Analyze reference designs for patterns
    if (data.references && data.references.length > 0) {
      const highScoringRefs = data.references.filter((r: any) => r.designScore >= 80);
      if (highScoringRefs.length > 0) {
        suggestions.push('Implement modern design patterns found in high-scoring references');
        suggestions.push('Update color palette based on current design trends');
      }
    }
    
    // Analyze UI issues
    if (data.uiAnalysis && data.uiAnalysis.length > 0) {
      const allIssues = data.uiAnalysis.flatMap((analysis: any) => analysis.issues || []);
      const highPriorityIssues = allIssues.filter((issue: any) => issue.severity === 'high');
      
      if (highPriorityIssues.length > 0) {
        suggestions.push(`Address ${highPriorityIssues.length} high-priority UI issues first`);
      }
    }
    
    // Navigation improvements
    if (data.navigator) {
      const bugs = data.navigator.getBugs();
      const criticalBugs = bugs.filter((bug: any) => bug.severity === 'critical');
      
      if (criticalBugs.length > 0) {
        suggestions.push(`Fix ${criticalBugs.length} critical navigation bugs immediately`);
      }
    }
    
    return suggestions;
  }

  private async saveImprovementPlan(suggestions: string[]): Promise<void> {
    const plan = {
      timestamp: new Date(),
      suggestions,
      implementationOrder: suggestions.map((suggestion, index) => ({
        priority: index + 1,
        task: suggestion,
        estimatedEffort: 'TBD',
        impact: 'High'
      }))
    };
    
    const planPath = path.join(this.config.outputDir, 'improvement-plan.json');
    await fs.writeFile(planPath, JSON.stringify(plan, null, 2));
    
    console.log(`💡 Improvement plan saved: ${planPath}`);
  }

  async cleanup(): Promise<void> {
    await this.analyzer?.cleanup();
    await this.visualRenderer?.cleanup();
    
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  
  const agent = new UIAgent();
  
  try {
    switch (command) {
      case 'full':
        await agent.runFullAnalysis();
        break;
      case 'quick':
        await agent.runQuickAnalysis();
        break;
      case 'errors':
        await agent.fixOnlyErrors();
        break;
      case 'accessibility':
        await agent.runAccessibilityAudit();
        break;
      default:
        console.log('Usage: node ui-agent [full|quick|errors|accessibility]');
        console.log('  full: Complete analysis with all features');
        console.log('  quick: Fast analysis with basic checks');
        console.log('  errors: Error detection and auto-fixing only');
        console.log('  accessibility: Comprehensive accessibility audit');
        break;
    }
  } catch (error) {
    console.error('❌ UI Agent failed:', error);
    process.exit(1);
  } finally {
    await agent.cleanup();
  }
}

// Export for use as module
export { defaultConfig };

// Run CLI if executed directly
if (require.main === module) {
  main();
}