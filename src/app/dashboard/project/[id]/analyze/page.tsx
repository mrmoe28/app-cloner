'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Layers, 
  Palette, 
  Smartphone, 
  Monitor, 
  Globe,
  CheckCircle, 
  Loader2, 
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Zap,
  Eye,
  Code
} from 'lucide-react';

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  loading: boolean;
  progress: number;
  results?: any;
}

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { getProject, updateProject } = useAppStore();
  
  const projectId = params.id as string;
  const project = getProject(projectId);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    {
      id: 'upload',
      title: 'Image Processing',
      description: 'Processing uploaded screenshot and preparing for analysis',
      icon: Layers,
      completed: true,
      loading: false,
      progress: 100
    },
    {
      id: 'platform',
      title: 'Platform Detection',
      description: 'Identifying target platform (Web, Mobile, Desktop)',
      icon: Smartphone,
      completed: false,
      loading: false,
      progress: 0
    },
    {
      id: 'components',
      title: 'Component Detection',
      description: 'Analyzing UI components and layout structure',
      icon: Code,
      completed: false,
      loading: false,
      progress: 0
    },
    {
      id: 'design',
      title: 'Design Analysis',
      description: 'Extracting design tokens, colors, and typography',
      icon: Palette,
      completed: false,
      loading: false,
      progress: 0
    },
    {
      id: 'optimization',
      title: 'AI Optimization',
      description: 'Optimizing results and preparing recommendations',
      icon: Zap,
      completed: false,
      loading: false,
      progress: 0
    }
  ]);

  useEffect(() => {
    if (project?.analysis) {
      // Mark all steps as completed if analysis already exists
      setAnalysisSteps(steps => steps.map(step => ({
        ...step,
        completed: true,
        progress: 100
      })));
    }
  }, [project?.analysis]);

  const startAnalysis = async () => {
    if (!project) return;

    setIsAnalyzing(true);
    setCurrentStep(1);

    try {
      // Simulate analysis steps
      for (let i = 1; i < analysisSteps.length; i++) {
        const step = analysisSteps[i];
        
        // Start step
        setAnalysisSteps(prev => prev.map((s, index) => 
          index === i ? { ...s, loading: true, progress: 0 } : s
        ));

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setAnalysisSteps(prev => prev.map((s, index) => 
            index === i ? { ...s, progress } : s
          ));
        }

        // Complete step
        setAnalysisSteps(prev => prev.map((s, index) => 
          index === i ? { ...s, loading: false, completed: true, progress: 100 } : s
        ));

        // Add some delay between steps
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create mock analysis results
      const mockAnalysis = {
        id: `analysis-${Date.now()}`,
        imageId: project.originalImage?.name || 'unknown',
        components: [
          {
            id: 'comp-1',
            type: 'button' as const,
            position: { x: 100, y: 200 },
            dimensions: { width: 120, height: 40 },
            styling: {
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '8px 16px'
            },
            content: 'Get Started',
            confidence: 0.95
          },
          {
            id: 'comp-2',
            type: 'text' as const,
            position: { x: 50, y: 50 },
            dimensions: { width: 300, height: 60 },
            styling: {
              fontSize: '24px',
              fontFamily: 'Inter',
              color: '#1f2937'
            },
            content: 'Welcome to App',
            confidence: 0.92
          }
        ],
        layout: {
          type: 'flexbox' as const,
          direction: 'column' as const,
          wrap: false
        },
        platformDetection: {
          platform: 'web' as const,
          framework: 'react' as const,
          confidence: 0.89
        },
        designTokens: {
          colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            text: '#1f2937',
            background: '#ffffff'
          },
          typography: {
            fontFamily: 'Inter',
            fontSize: {
              base: '16px',
              lg: '24px'
            }
          },
          spacing: {
            base: '8px',
            md: '16px',
            lg: '24px'
          }
        },
        confidence: 0.91,
        processingTime: 3500,
        createdAt: new Date()
      };

      // Update project with analysis results
      updateProject(projectId, {
        analysis: mockAnalysis,
        status: 'analyzed',
        updatedAt: new Date()
      });

      toast({
        title: 'Analysis Complete',
        description: 'Your screenshot has been successfully analyzed!',
      });

      // Auto-redirect to next step after a brief delay
      setTimeout(() => {
        router.push(`/dashboard/project/${projectId}/generate`);
      }, 2000);

    } catch (error) {
      console.error('Analysis failed:', error);
      
      updateProject(projectId, {
        status: 'failed',
        updatedAt: new Date()
      });

      toast({
        title: 'Analysis Failed',
        description: 'Something went wrong during analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!project) {
    return null; // Layout handles this case
  }

  const hasAnalysis = !!project.analysis;
  const canAnalyze = project.status === 'uploaded' || project.status === 'failed';

  return (
    <div className="space-y-6">
      {/* Analysis Status */}
      {hasAnalysis && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Analysis Complete
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Your screenshot has been analyzed with {Math.round((project.analysis?.confidence || 0) * 100)}% confidence
                </p>
              </div>
              <Button asChild>
                <a href={`/dashboard/project/${projectId}/generate`}>
                  Generate Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Original Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Original Screenshot
            </CardTitle>
            <CardDescription>
              The image being analyzed for component detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.originalImage?.preview ? (
              <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={project.originalImage.preview}
                  alt={project.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">No image available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Analysis Progress
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your app interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisSteps.map((step, index) => {
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-2 rounded-full
                        ${step.completed 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : step.loading 
                          ? 'bg-blue-100 dark:bg-blue-900' 
                          : 'bg-gray-100 dark:bg-gray-800'
                        }
                      `}>
                        {step.loading ? (
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : step.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Icon className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-gray-500">{step.description}</div>
                      </div>
                    </div>
                    {step.completed && (
                      <Badge variant="outline" className="text-xs">
                        Complete
                      </Badge>
                    )}
                  </div>
                  
                  {(step.loading || step.completed) && (
                    <div className="ml-11">
                      <Progress value={step.progress} className="h-1" />
                    </div>
                  )}
                </div>
              );
            })}

            {!hasAnalysis && canAnalyze && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="w-full gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Start Analysis
                    </>
                  )}
                </Button>
              </div>
            )}

            {hasAnalysis && (
              <div className="pt-4 border-t flex gap-2">
                <Button 
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-analyze
                </Button>
                <Button asChild className="flex-1 gap-2">
                  <a href={`/dashboard/project/${projectId}/generate`}>
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {hasAnalysis && project.analysis && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Platform Detection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {project.analysis.platformDetection.platform === 'mobile' ? (
                    <Smartphone className="w-5 h-5" />
                  ) : project.analysis.platformDetection.platform === 'desktop' ? (
                    <Monitor className="w-5 h-5" />
                  ) : (
                    <Globe className="w-5 h-5" />
                  )}
                  Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {project.analysis.platformDetection.platform.charAt(0).toUpperCase() + 
                     project.analysis.platformDetection.platform.slice(1)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Framework: {project.analysis.platformDetection.framework}
                  </div>
                  <div className="text-xs text-gray-400">
                    Confidence: {Math.round(project.analysis.platformDetection.confidence * 100)}%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Components Detected */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="w-5 h-5" />
                  Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {project.analysis.components.length}
                  </div>
                  <div className="text-sm text-gray-500">
                    UI components detected
                  </div>
                  <div className="text-xs text-gray-400">
                    Types: {Array.from(new Set(project.analysis.components.map(c => c.type))).join(', ')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design Tokens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="w-5 h-5" />
                  Design Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(project.analysis.designTokens.colors).length}
                  </div>
                  <div className="text-sm text-gray-500">
                    Color tokens extracted
                  </div>
                  <div className="flex gap-1 mt-2">
                    {Object.values(project.analysis.designTokens.colors).slice(0, 4).map((color: any, index) => (
                      <div 
                        key={index}
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Detailed Analysis
              </CardTitle>
              <CardDescription>
                Comprehensive breakdown of detected components and design patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Components Breakdown</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {project.analysis.components.map((component) => (
                      <div key={component.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{component.type}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(component.confidence * 100)}%
                          </Badge>
                        </div>
                        {component.content && (
                          <div className="text-sm text-gray-500 mt-1">
                            "{component.content}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Processing Time:</span>
                    <span className="font-medium">{project.analysis.processingTime}ms</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}