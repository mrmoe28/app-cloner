'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { formatRelativeTime, getPlatformDisplayName, getFrameworkDisplayName } from '@/lib/utils';
import { 
  Brain, 
  Code2, 
  Eye, 
  Download, 
  Settings,
  Clock,
  Layers,
  Palette,
  Smartphone,
  Monitor,
  Globe,
  Zap,
  ArrowRight,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function ProjectOverviewPage() {
  const params = useParams();
  const { getProject, updateProject, deleteProject } = useAppStore();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const projectId = params.id as string;
  const project = getProject(projectId);

  if (!project) {
    return null; // Layout handles this case
  }

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      deleteProject(projectId);
      // Redirect will be handled by the layout when project is not found
    } catch (error) {
      console.error('Error deleting project:', error);
      setIsDeleting(false);
    }
  };

  const getNextAction = () => {
    switch (project.status) {
      case 'uploaded':
        return {
          title: 'Start Analysis',
          description: 'Analyze your screenshot with AI to detect components and patterns',
          href: `/dashboard/project/${projectId}/analyze`,
          icon: Brain,
          variant: 'default' as const
        };
      case 'analyzed':
        return {
          title: 'Generate Code',
          description: 'Generate production-ready code for your preferred framework',
          href: `/dashboard/project/${projectId}/generate`,
          icon: Code2,
          variant: 'default' as const
        };
      case 'generated':
        return {
          title: 'Preview Code',
          description: 'Review and customize your generated code',
          href: `/dashboard/project/${projectId}/preview`,
          icon: Eye,
          variant: 'default' as const
        };
      case 'completed':
        return {
          title: 'Export Project',
          description: 'Download your project or deploy to the cloud',
          href: `/dashboard/project/${projectId}/export`,
          icon: Download,
          variant: 'default' as const
        };
      case 'failed':
        return {
          title: 'Retry Analysis',
          description: 'Something went wrong. Try analyzing your image again',
          href: `/dashboard/project/${projectId}/analyze`,
          icon: RefreshCw,
          variant: 'destructive' as const
        };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  const platformIcon = project.analysis?.platformDetection?.platform === 'mobile' 
    ? Smartphone 
    : project.analysis?.platformDetection?.platform === 'desktop' 
    ? Monitor 
    : project.analysis?.platformDetection?.platform === 'web' 
    ? Globe 
    : Zap;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {nextAction && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <nextAction.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    {nextAction.title}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    {nextAction.description}
                  </p>
                </div>
              </div>
              <Button 
                asChild 
                variant={nextAction.variant}
                className="gap-2"
              >
                <Link href={nextAction.href}>
                  {nextAction.title}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Original Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Original Screenshot
            </CardTitle>
            <CardDescription>
              The app interface you uploaded for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.originalImage?.preview ? (
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={project.originalImage.preview}
                  alt={project.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">No image available</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">File name:</span>
                <span className="font-medium">{project.originalImage?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">File size:</span>
                <span className="font-medium">
                  {project.originalImage?.size ? 
                    `${(project.originalImage.size / 1024 / 1024).toFixed(2)} MB` : 
                    'Unknown'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Project Status
            </CardTitle>
            <CardDescription>
              Current stage and progress information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="outline">
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Created</span>
                <span className="text-sm text-gray-500">
                  {formatRelativeTime(project.createdAt)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-sm text-gray-500">
                  {formatRelativeTime(project.updatedAt)}
                </span>
              </div>

              {project.analysis?.platformDetection && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Platform</span>
                    <div className="flex items-center gap-2">
                      <platformIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {getPlatformDisplayName(project.analysis.platformDetection.platform)}
                      </span>
                    </div>
                  </div>
                  
                  {project.analysis.platformDetection.framework && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Framework</span>
                      <span className="text-sm text-gray-500">
                        {getFrameworkDisplayName(project.analysis.platformDetection.framework)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results (if available) */}
      {project.analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              AI-detected components and design patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  {project.analysis.components?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Components Detected</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {project.analysis.confidence ? Math.round(project.analysis.confidence * 100) : 0}%
                </div>
                <div className="text-sm text-gray-500">Confidence Score</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-purple-600">
                  {project.analysis.designTokens ? Object.keys(project.analysis.designTokens.colors || {}).length : 0}
                </div>
                <div className="text-sm text-gray-500">Color Tokens</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/project/${projectId}/analyze`}>
                  <Brain className="w-4 h-4 mr-2" />
                  View Detailed Analysis
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Code (if available) */}
      {project.generatedCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Generated Code
            </CardTitle>
            <CardDescription>
              Production-ready code for your selected framework
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Framework</div>
                <div className="text-lg font-semibold text-blue-600">
                  {project.generatedCode.framework}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Files Generated</div>
                <div className="text-lg font-semibold text-green-600">
                  {project.generatedCode.files?.length || 0}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/dashboard/project/${projectId}/preview`}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Code
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href={`/dashboard/project/${projectId}/export`}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Project
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
          <Link href={`/dashboard/project/${projectId}/analyze`}>
            <Brain className="w-6 h-6" />
            <span className="font-medium">Analyze</span>
            <span className="text-xs text-gray-500">AI Analysis</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
          <Link href={`/dashboard/project/${projectId}/generate`}>
            <Code2 className="w-6 h-6" />
            <span className="font-medium">Generate</span>
            <span className="text-xs text-gray-500">Create Code</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
          <Link href={`/dashboard/project/${projectId}/preview`}>
            <Eye className="w-6 h-6" />
            <span className="font-medium">Preview</span>
            <span className="text-xs text-gray-500">View Code</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
          <Link href={`/dashboard/project/${projectId}/settings`}>
            <Settings className="w-6 h-6" />
            <span className="font-medium">Settings</span>
            <span className="text-xs text-gray-500">Configure</span>
          </Link>
        </Button>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteProject}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}