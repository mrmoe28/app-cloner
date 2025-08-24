// Core Application Types

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  uploadedAt: Date;
}

export interface AnalysisResult {
  id: string;
  imageId: string;
  components: UIComponent[];
  layout: LayoutStructure;
  platformDetection: PlatformDetection;
  designTokens: DesignTokens;
  confidence: number;
  processingTime: number;
  createdAt: Date;
}

export interface UIComponent {
  id: string;
  type: ComponentType;
  position: Position;
  dimensions: Dimensions;
  styling: ComponentStyling;
  content?: string;
  children?: UIComponent[];
  confidence: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ComponentStyling {
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  border?: string;
  boxShadow?: string;
}

export interface LayoutStructure {
  type: 'flexbox' | 'grid' | 'absolute' | 'stack';
  direction?: 'row' | 'column';
  wrap?: boolean;
  justify?: string;
  align?: string;
  gap?: string;
}

export interface PlatformDetection {
  platform: PlatformType;
  framework: FrameworkType;
  confidence: number;
  indicators: string[];
  reasoning: string;
}

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      bold: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface GeneratedCode {
  id: string;
  analysisId: string;
  platform: PlatformType;
  framework: FrameworkType;
  files: GeneratedFile[];
  packageJson: PackageJsonConfig;
  deploymentConfig: DeploymentConfig;
  createdAt: Date;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'api' | 'config' | 'style' | 'schema' | 'page';
}

export interface PackageJsonConfig {
  name: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'docker';
  configuration: Record<string, any>;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  originalImage: UploadedImage;
  analysis?: AnalysisResult;
  generatedCode?: GeneratedCode;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Enums and Union Types

export type ComponentType = 
  | 'button'
  | 'input'
  | 'text'
  | 'image'
  | 'card'
  | 'navigation'
  | 'header'
  | 'footer'
  | 'sidebar'
  | 'modal'
  | 'dropdown'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'progress'
  | 'badge'
  | 'avatar'
  | 'icon'
  | 'divider'
  | 'spacer'
  | 'container'
  | 'grid'
  | 'list'
  | 'table'
  | 'chart'
  | 'form'
  | 'tab'
  | 'accordion'
  | 'carousel'
  | 'tooltip'
  | 'popover';

export type PlatformType = 
  | 'web'
  | 'mobile'
  | 'desktop'
  | 'tablet';

export type FrameworkType = 
  | 'react'
  | 'react-native'
  | 'flutter'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'native-ios'
  | 'native-android'
  | 'xamarin'
  | 'ionic'
  | 'cordova';

export type ProjectStatus = 
  | 'uploaded'
  | 'analyzing'
  | 'analyzed'
  | 'generating'
  | 'generated'
  | 'completed'
  | 'failed';

// API Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse extends ApiResponse {
  data: {
    imageId: string;
    preview: string;
  };
}

export interface AnalysisResponse extends ApiResponse {
  data: AnalysisResult;
}

export interface GenerationResponse extends ApiResponse {
  data: {
    projectId: string;
    downloadUrl: string;
    previewUrl?: string;
  };
}

// UI State Types

export interface AppState {
  currentProject: Project | null;
  isAnalyzing: boolean;
  isGenerating: boolean;
  analysisProgress: number;
  generationProgress: number;
  error: string | null;
  projects: Project[];
}

export interface UploadState {
  dragActive: boolean;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export interface AnalysisDashboardState {
  selectedComponent: UIComponent | null;
  showPlatformOverride: boolean;
  selectedPlatform: PlatformType | null;
  selectedFramework: FrameworkType | null;
  editingDesignTokens: boolean;
}