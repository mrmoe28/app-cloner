'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { 
  Code2, 
  Settings, 
  Zap,
  CheckCircle, 
  Loader2, 
  ArrowRight,
  AlertCircle,
  Globe,
  Smartphone,
  Monitor,
  FileCode,
  Package,
  Database,
  Palette
} from 'lucide-react';

interface Framework {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  platform: 'web' | 'mobile' | 'desktop';
  popular: boolean;
  features: string[];
}

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  loading: boolean;
  progress: number;
}

const frameworks: Framework[] = [
  {
    id: 'react',
    name: 'React',
    description: 'Modern web applications with hooks and functional components',
    icon: Globe,
    platform: 'web',
    popular: true,
    features: ['TypeScript', 'Tailwind CSS', 'Component Library', 'Responsive Design']
  },
  {
    id: 'react-native',
    name: 'React Native',
    description: 'Cross-platform mobile apps for iOS and Android',
    icon: Smartphone,
    platform: 'mobile',
    popular: true,
    features: ['Navigation', 'Native Components', 'Platform-specific Code', 'Expo Support']
  },
  {
    id: 'next',
    name: 'Next.js',
    description: 'Full-stack React framework with SSR and API routes',
    icon: Globe,
    platform: 'web',
    popular: true,
    features: ['App Router', 'API Routes', 'Server Components', 'Database Integration']
  },
  {
    id: 'flutter',
    name: 'Flutter',
    description: 'Cross-platform apps with Dart and Material Design',
    icon: Smartphone,
    platform: 'mobile',
    popular: false,
    features: ['Material Design', 'Cupertino Widgets', 'Hot Reload', 'Native Performance']
  },
  {
    id: 'vue',
    name: 'Vue.js',
    description: 'Progressive framework with composition API',
    icon: Globe,
    platform: 'web',
    popular: false,
    features: ['Composition API', 'Vuetify', 'Nuxt.js Ready', 'TypeScript Support']
  },
  {
    id: 'electron',
    name: 'Electron',
    description: 'Desktop applications with web technologies',
    icon: Monitor,
    platform: 'desktop',
    popular: false,
    features: ['Cross-platform', 'Node.js Integration', 'Native APIs', 'Auto Updater']
  }
];

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { getProject, updateProject } = useAppStore();
  
  const projectId = params.id as string;
  const project = getProject(projectId);
  
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    {
      id: 'setup',
      title: 'Project Setup',
      description: 'Creating project structure and configuration',
      completed: false,
      loading: false,
      progress: 0
    },
    {
      id: 'components',
      title: 'Component Generation',
      description: 'Converting UI components to code',
      completed: false,
      loading: false,
      progress: 0
    },
    {
      id: 'styles',
      title: 'Styling & Design Tokens',
      description: 'Applying design tokens and styling',
      completed: false,
      loading: false,
      progress: 0
    },
    {
      id: 'layout',
      title: 'Layout Structure',
      description: 'Building responsive layout system',
      completed: false,
      loading: false,
      progress: 0
    },
    {
      id: 'optimization',
      title: 'Code Optimization',
      description: 'Optimizing and finalizing code',
      completed: false,
      loading: false,
      progress: 0
    }
  ]);

  useEffect(() => {
    if (project?.analysis?.platformDetection) {
      // Auto-select recommended framework based on platform detection
      const platform = project.analysis.platformDetection.platform;
      const detectedFramework = project.analysis.platformDetection.framework;
      
      if (detectedFramework && frameworks.find(f => f.id === detectedFramework)) {
        setSelectedFramework(detectedFramework);
      } else {
        // Default selections based on platform
        switch (platform) {
          case 'web':
            setSelectedFramework('react');
            break;
          case 'mobile':
            setSelectedFramework('react-native');
            break;
          case 'desktop':
            setSelectedFramework('electron');
            break;
        }
      }
    }
  }, [project?.analysis]);

  const startGeneration = async () => {
    if (!project || !selectedFramework) return;

    setIsGenerating(true);

    try {
      // Simulate generation steps
      for (let i = 0; i < generationSteps.length; i++) {
        const step = generationSteps[i];
        
        // Start step
        setGenerationSteps(prev => prev.map((s, index) => 
          index === i ? { ...s, loading: true, progress: 0 } : s
        ));

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 25) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setGenerationSteps(prev => prev.map((s, index) => 
            index === i ? { ...s, progress } : s
          ));
        }

        // Complete step
        setGenerationSteps(prev => prev.map((s, index) => 
          index === i ? { ...s, loading: false, completed: true, progress: 100 } : s
        ));

        // Add some delay between steps
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create mock generated code
      const selectedFrameworkData = frameworks.find(f => f.id === selectedFramework);
      const mockGeneratedCode = {
        id: `code-${Date.now()}`,
        projectId,
        framework: selectedFrameworkData?.name || selectedFramework,
        files: [
          {
            path: 'src/App.tsx',
            content: `import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className="app">\n      <h1>Welcome to App</h1>\n      <button className="cta-button">Get Started</button>\n    </div>\n  );\n}\n\nexport default App;`,
            type: 'component'
          },
          {
            path: 'src/App.css',
            content: `.app {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 2rem;\n}\n\n.cta-button {\n  background: #3b82f6;\n  color: white;\n  padding: 0.5rem 1rem;\n  border-radius: 0.375rem;\n  border: none;\n  cursor: pointer;\n}`,
            type: 'style'
          },
          {
            path: 'package.json',
            content: `{\n  "name": "${project.name.toLowerCase().replace(/\\s+/g, '-')}",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}`,
            type: 'config'
          }
        ],
        metadata: {
          framework: selectedFramework,
          platform: selectedFrameworkData?.platform || 'web',
          features: selectedFrameworkData?.features || [],
          generatedAt: new Date(),
          totalFiles: 3,
          linesOfCode: 45
        }
      };

      // Update project with generated code
      updateProject(projectId, {
        generatedCode: mockGeneratedCode,
        status: 'generated',
        updatedAt: new Date()
      });

      toast({
        title: 'Code Generated Successfully',
        description: `Your ${selectedFrameworkData?.name} project is ready!`,
      });

      // Auto-redirect to preview after a brief delay
      setTimeout(() => {
        router.push(`/dashboard/project/${projectId}/preview`);
      }, 2000);

    } catch (error) {
      console.error('Generation failed:', error);
      
      toast({
        title: 'Generation Failed',
        description: 'Something went wrong during code generation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!project) {
    return null; // Layout handles this case
  }

  const hasGenerated = !!project.generatedCode;
  const canGenerate = project.status === 'analyzed' || project.status === 'generated';
  const detectedPlatform = project.analysis?.platformDetection?.platform;

  return (
    <div className="space-y-6">
      {/* Prerequisites Check */}
      {!project.analysis && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  Analysis Required
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Please complete the analysis step before generating code
                </p>
              </div>
              <Button asChild variant="outline">
                <a href={`/dashboard/project/${projectId}/analyze`}>
                  Analyze First
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Complete */}
      {hasGenerated && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Code Generated Successfully
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Your {project.generatedCode.framework} project is ready to preview and export
                </p>
              </div>
              <Button asChild>
                <a href={`/dashboard/project/${projectId}/preview`}>
                  Preview Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Framework Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Framework Selection
            </CardTitle>
            <CardDescription>
              Choose the framework for your generated code
              {detectedPlatform && (
                <span className="block mt-1">
                  Detected platform: <Badge variant="outline" className="text-xs">
                    {detectedPlatform}
                  </Badge>
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {frameworks
              .filter(f => !detectedPlatform || f.platform === detectedPlatform)
              .map((framework) => {
                const Icon = framework.icon;
                const isSelected = selectedFramework === framework.id;
                
                return (
                  <div
                    key={framework.id}
                    className={`
                      relative border rounded-lg p-4 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-600' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                      }
                    `}
                    onClick={() => setSelectedFramework(framework.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        p-2 rounded-lg
                        ${isSelected 
                          ? 'bg-blue-100 dark:bg-blue-900' 
                          : 'bg-gray-100 dark:bg-gray-800'
                        }
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{framework.name}</h3>
                          {framework.popular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {framework.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {framework.features.slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}

            {canGenerate && selectedFramework && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={startGeneration}
                  disabled={isGenerating}
                  className="w-full gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Code...
                    </>
                  ) : (
                    <>
                      <Code2 className="w-4 h-4" />
                      Generate {frameworks.find(f => f.id === selectedFramework)?.name} Code
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Generation Progress
            </CardTitle>
            <CardDescription>
              Real-time progress of code generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generationSteps.map((step, index) => (
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
                        <div className="w-4 h-4 rounded-full bg-gray-400" />
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
            ))}

            {/* Summary for completed generation */}
            {hasGenerated && project.generatedCode && (
              <div className="pt-4 border-t space-y-3">
                <h4 className="font-semibold text-sm">Generation Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-500" />
                    <span>{project.generatedCode.metadata?.totalFiles || 0} files</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-green-500" />
                    <span>{project.generatedCode.metadata?.linesOfCode || 0} lines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-500" />
                    <span>{project.generatedCode.framework}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-orange-500" />
                    <span>{project.generatedCode.metadata?.platform}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Framework Comparison */}
      {detectedPlatform && (
        <Card>
          <CardHeader>
            <CardTitle>Framework Comparison</CardTitle>
            <CardDescription>
              Compare frameworks available for {detectedPlatform} development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Framework</th>
                    <th className="text-left py-2">Learning Curve</th>
                    <th className="text-left py-2">Performance</th>
                    <th className="text-left py-2">Community</th>
                    <th className="text-left py-2">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {frameworks
                    .filter(f => f.platform === detectedPlatform)
                    .map((framework) => (
                      <tr key={framework.id} className="border-b">
                        <td className="py-2 font-medium">{framework.name}</td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs">
                            {framework.popular ? 'Easy' : 'Moderate'}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs">
                            {framework.id === 'flutter' ? 'Excellent' : 'Good'}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs">
                            {framework.popular ? 'Large' : 'Growing'}
                          </Badge>
                        </td>
                        <td className="py-2 text-gray-500">
                          {framework.id === 'react' && 'Complex web apps'}
                          {framework.id === 'next' && 'Full-stack projects'}
                          {framework.id === 'react-native' && 'Cross-platform mobile'}
                          {framework.id === 'flutter' && 'High-performance mobile'}
                          {framework.id === 'vue' && 'Rapid prototyping'}
                          {framework.id === 'electron' && 'Desktop applications'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}