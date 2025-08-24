import { Page } from '@playwright/test';

export interface UIAgentConfig {
  baseUrl: string;
  routes: Route[];
  viewports: Viewport[];
  analysisOptions: AnalysisOptions;
  improvementPriorities: ImprovementPriority[];
  outputDir: string;
}

export interface Route {
  name: string;
  path: string;
  waitForSelector?: string;
  interactions?: Interaction[];
}

export interface Viewport {
  name: string;
  width: number;
  height: number;
}

export interface Interaction {
  type: 'click' | 'fill' | 'hover' | 'scroll';
  selector?: string;
  value?: string;
  position?: { x: number; y: number };
}

export interface AnalysisOptions {
  checkAccessibility: boolean;
  checkPerformance: boolean;
  checkResponsiveness: boolean;
  checkColorContrast: boolean;
  checkVisualHierarchy: boolean;
  checkConsistency: boolean;
}

export type ImprovementPriority = 
  | 'accessibility'
  | 'performance'
  | 'aesthetics'
  | 'usability'
  | 'consistency'
  | 'responsiveness';

export const defaultConfig: UIAgentConfig = {
  baseUrl: 'http://localhost:3001',
  routes: [
    {
      name: 'home',
      path: '/',
      waitForSelector: 'h1',
    },
    {
      name: 'create',
      path: '/create',
      waitForSelector: '[data-testid="upload-zone"], .card',
    },
    {
      name: 'dashboard',
      path: '/dashboard',
      waitForSelector: '.container',
    }
  ],
  viewports: [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ],
  analysisOptions: {
    checkAccessibility: true,
    checkPerformance: true,
    checkResponsiveness: true,
    checkColorContrast: true,
    checkVisualHierarchy: true,
    checkConsistency: true,
  },
  improvementPriorities: [
    'accessibility',
    'usability',
    'consistency',
    'responsiveness',
    'aesthetics',
    'performance',
  ],
  outputDir: './ui-agent/output',
};

export interface UIIssue {
  type: 'error' | 'warning' | 'suggestion';
  category: ImprovementPriority;
  element?: string;
  description: string;
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
  screenshot?: string;
}

export interface UIAnalysisResult {
  timestamp: Date;
  route: string;
  viewport: string;
  screenshot: string;
  issues: UIIssue[];
  metrics: {
    accessibilityScore?: number;
    performanceScore?: number;
    visualScore?: number;
    overallScore: number;
  };
  suggestions: string[];
}