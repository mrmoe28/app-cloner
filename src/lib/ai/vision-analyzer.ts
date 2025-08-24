import OpenAI from 'openai';
import { AnalysisResult, UIComponent, ComponentType, LayoutStructure, PlatformDetection, DesignTokens, PlatformType, FrameworkType } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VisionAnalysisOptions {
  imageBase64: string;
  projectId: string;
  userId: string;
  additionalContext?: string;
}

export class VisionAnalyzer {
  private static instance: VisionAnalyzer;

  static getInstance(): VisionAnalyzer {
    if (!VisionAnalyzer.instance) {
      VisionAnalyzer.instance = new VisionAnalyzer();
    }
    return VisionAnalyzer.instance;
  }

  async analyzeScreenshot(options: VisionAnalysisOptions): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildAnalysisPrompt(options.additionalContext);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${options.imageBase64}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No analysis received from GPT-4 Vision API');
      }

      const analysis = this.parseAnalysisResponse(analysisText);
      const processingTime = Date.now() - startTime;

      return {
        id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageId: options.projectId,
        components: analysis.components,
        layout: analysis.layout,
        platformDetection: analysis.platformDetection,
        designTokens: analysis.designTokens,
        confidence: analysis.confidence,
        processingTime,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Vision analysis failed:', error);
      throw new Error(`Failed to analyze screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildAnalysisPrompt(additionalContext?: string): string {
    return `
You are an expert UI/UX analyzer specializing in mobile and web application interfaces. Analyze this screenshot and provide a comprehensive JSON response with the following structure:

{
  "platformDetection": {
    "platform": "web|mobile|desktop|tablet",
    "framework": "react|react-native|flutter|vue|angular|svelte|native-ios|native-android|xamarin|ionic|cordova",
    "confidence": 0.0-1.0,
    "indicators": ["list of visual indicators that led to this conclusion"],
    "reasoning": "detailed explanation of platform/framework detection"
  },
  "components": [
    {
      "id": "unique-id",
      "type": "button|input|text|image|card|navigation|header|footer|sidebar|modal|dropdown|checkbox|radio|switch|slider|progress|badge|avatar|icon|divider|spacer|container|grid|list|table|chart|form|tab|accordion|carousel|tooltip|popover",
      "position": {"x": 0, "y": 0},
      "dimensions": {"width": 0, "height": 0},
      "styling": {
        "backgroundColor": "#hex or null",
        "color": "#hex or null",
        "fontSize": "px value or null",
        "fontFamily": "font name or null",
        "borderRadius": "px value or null",
        "padding": "px value or null",
        "margin": "px value or null",
        "border": "border definition or null",
        "boxShadow": "shadow definition or null"
      },
      "content": "text content if applicable",
      "children": [],
      "confidence": 0.0-1.0
    }
  ],
  "layout": {
    "type": "flexbox|grid|absolute|stack",
    "direction": "row|column",
    "wrap": true|false,
    "justify": "flex-start|center|flex-end|space-between|space-around|space-evenly",
    "align": "flex-start|center|flex-end|stretch",
    "gap": "px value"
  },
  "designTokens": {
    "colors": {
      "primary": "#hex",
      "secondary": "#hex", 
      "accent": "#hex",
      "background": "#hex",
      "surface": "#hex",
      "text": "#hex",
      "textSecondary": "#hex"
    },
    "typography": {
      "fontFamily": "font name",
      "fontSize": {
        "small": "px",
        "medium": "px", 
        "large": "px",
        "xlarge": "px"
      },
      "fontWeight": {
        "normal": "400",
        "medium": "500",
        "bold": "600|700"
      }
    },
    "spacing": {
      "xs": "px",
      "sm": "px",
      "md": "px", 
      "lg": "px",
      "xl": "px"
    },
    "borderRadius": {
      "sm": "px",
      "md": "px",
      "lg": "px"
    }
  },
  "confidence": 0.0-1.0
}

Analysis Guidelines:
1. **Platform Detection**: Look for platform-specific UI patterns:
   - iOS: Native navigation bars, system fonts (San Francisco), iOS-style buttons, tab bars
   - Android: Material Design elements, floating action buttons, navigation drawers
   - Web: Browser-specific elements, responsive layouts, web fonts
   - React Native: Cross-platform components, mobile-first but web-like elements
   - Flutter: Material Design or Cupertino widgets, consistent cross-platform look

2. **Component Analysis**: Identify all interactive and visual elements with precise positioning and styling
3. **Layout Structure**: Determine the overall layout system (flexbox, grid, etc.)
4. **Design Tokens**: Extract the design system including colors, typography, and spacing
5. **Confidence Scoring**: Be honest about uncertainty levels

${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Return ONLY valid JSON. Do not include any explanatory text outside the JSON structure.
    `.trim();
  }

  private parseAnalysisResponse(response: string): {
    components: UIComponent[];
    layout: LayoutStructure;
    platformDetection: PlatformDetection;
    designTokens: DesignTokens;
    confidence: number;
  } {
    try {
      // Clean the response - remove any markdown code blocks or extra text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString);

      // Validate and transform the response
      return {
        components: this.validateComponents(parsed.components || []),
        layout: this.validateLayout(parsed.layout || {}),
        platformDetection: this.validatePlatformDetection(parsed.platformDetection || {}),
        designTokens: this.validateDesignTokens(parsed.designTokens || {}),
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))
      };
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
      console.error('Raw response:', response);
      
      // Return fallback analysis
      return this.getFallbackAnalysis();
    }
  }

  private validateComponents(components: any[]): UIComponent[] {
    return components.map((comp, index) => ({
      id: comp.id || `component-${index}`,
      type: this.validateComponentType(comp.type),
      position: {
        x: Number(comp.position?.x) || 0,
        y: Number(comp.position?.y) || 0
      },
      dimensions: {
        width: Number(comp.dimensions?.width) || 100,
        height: Number(comp.dimensions?.height) || 50
      },
      styling: comp.styling || {},
      content: comp.content || undefined,
      children: comp.children ? this.validateComponents(comp.children) : undefined,
      confidence: Math.max(0, Math.min(1, Number(comp.confidence) || 0.5))
    }));
  }

  private validateComponentType(type: string): ComponentType {
    const validTypes: ComponentType[] = [
      'button', 'input', 'text', 'image', 'card', 'navigation', 'header', 'footer',
      'sidebar', 'modal', 'dropdown', 'checkbox', 'radio', 'switch', 'slider',
      'progress', 'badge', 'avatar', 'icon', 'divider', 'spacer', 'container',
      'grid', 'list', 'table', 'chart', 'form', 'tab', 'accordion', 'carousel',
      'tooltip', 'popover'
    ];
    
    return validTypes.includes(type as ComponentType) ? type as ComponentType : 'container';
  }

  private validateLayout(layout: any): LayoutStructure {
    return {
      type: ['flexbox', 'grid', 'absolute', 'stack'].includes(layout.type) ? layout.type : 'flexbox',
      direction: ['row', 'column'].includes(layout.direction) ? layout.direction : 'column',
      wrap: Boolean(layout.wrap),
      justify: layout.justify || 'flex-start',
      align: layout.align || 'flex-start',
      gap: layout.gap || '8px'
    };
  }

  private validatePlatformDetection(platform: any): PlatformDetection {
    const validPlatforms: PlatformType[] = ['web', 'mobile', 'desktop', 'tablet'];
    const validFrameworks: FrameworkType[] = [
      'react', 'react-native', 'flutter', 'vue', 'angular', 'svelte',
      'native-ios', 'native-android', 'xamarin', 'ionic', 'cordova'
    ];

    return {
      platform: validPlatforms.includes(platform.platform) ? platform.platform : 'web',
      framework: validFrameworks.includes(platform.framework) ? platform.framework : 'react',
      confidence: Math.max(0, Math.min(1, Number(platform.confidence) || 0.5)),
      indicators: Array.isArray(platform.indicators) ? platform.indicators : [],
      reasoning: platform.reasoning || 'Platform detection based on visual analysis'
    };
  }

  private validateDesignTokens(tokens: any): DesignTokens {
    return {
      colors: {
        primary: tokens.colors?.primary || '#3b82f6',
        secondary: tokens.colors?.secondary || '#64748b',
        accent: tokens.colors?.accent || '#8b5cf6',
        background: tokens.colors?.background || '#ffffff',
        surface: tokens.colors?.surface || '#f8fafc',
        text: tokens.colors?.text || '#1e293b',
        textSecondary: tokens.colors?.textSecondary || '#64748b'
      },
      typography: {
        fontFamily: tokens.typography?.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: {
          small: tokens.typography?.fontSize?.small || '14px',
          medium: tokens.typography?.fontSize?.medium || '16px',
          large: tokens.typography?.fontSize?.large || '18px',
          xlarge: tokens.typography?.fontSize?.xlarge || '24px'
        },
        fontWeight: {
          normal: tokens.typography?.fontWeight?.normal || '400',
          medium: tokens.typography?.fontWeight?.medium || '500',
          bold: tokens.typography?.fontWeight?.bold || '600'
        }
      },
      spacing: {
        xs: tokens.spacing?.xs || '4px',
        sm: tokens.spacing?.sm || '8px',
        md: tokens.spacing?.md || '16px',
        lg: tokens.spacing?.lg || '24px',
        xl: tokens.spacing?.xl || '32px'
      },
      borderRadius: {
        sm: tokens.borderRadius?.sm || '4px',
        md: tokens.borderRadius?.md || '8px',
        lg: tokens.borderRadius?.lg || '12px'
      }
    };
  }

  private getFallbackAnalysis() {
    return {
      components: [{
        id: 'fallback-container',
        type: 'container' as ComponentType,
        position: { x: 0, y: 0 },
        dimensions: { width: 400, height: 600 },
        styling: {},
        confidence: 0.1
      }],
      layout: {
        type: 'flexbox' as const,
        direction: 'column' as const,
        wrap: false,
        justify: 'flex-start',
        align: 'flex-start',
        gap: '16px'
      },
      platformDetection: {
        platform: 'web' as PlatformType,
        framework: 'react' as FrameworkType,
        confidence: 0.1,
        indicators: ['Fallback analysis - unable to analyze image'],
        reasoning: 'Analysis failed, providing fallback detection'
      },
      designTokens: this.validateDesignTokens({}),
      confidence: 0.1
    };
  }
}