'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { 
  ArrowLeft, 
  Upload, 
  Brain, 
  Code2, 
  Eye, 
  Settings, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'analyzing':
    case 'generating':
      return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'analyzing':
    case 'generating':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getProgressValue = (status: string) => {
  switch (status) {
    case 'uploaded': return 20;
    case 'analyzing': return 40;
    case 'analyzed': return 60;
    case 'generating': return 80;
    case 'generated':
    case 'completed': return 100;
    case 'failed': return 0;
    default: return 0;
  }
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const { getProject } = useAppStore();
  
  const projectId = params.id as string;
  const project = getProject(projectId);

  if (!project) {
    return (
      <div className="container max-w-6xl mx-auto py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Project Not Found</h1>
          <p className="text-gray-500">The project you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      label: 'Overview',
      href: `/dashboard/project/${projectId}`,
      icon: Upload,
      description: 'Project details and status'
    },
    {
      label: 'Analyze',
      href: `/dashboard/project/${projectId}/analyze`,
      icon: Brain,
      description: 'AI analysis and component detection'
    },
    {
      label: 'Generate',
      href: `/dashboard/project/${projectId}/generate`,
      icon: Code2,
      description: 'Code generation and framework selection'
    },
    {
      label: 'Preview',
      href: `/dashboard/project/${projectId}/preview`,
      icon: Eye,
      description: 'Preview and edit generated code'
    },
    {
      label: 'Settings',
      href: `/dashboard/project/${projectId}/settings`,
      icon: Settings,
      description: 'Project configuration'
    },
    {
      label: 'Export',
      href: `/dashboard/project/${projectId}/export`,
      icon: Download,
      description: 'Download and deploy'
    }
  ];

  const currentTab = tabs.find(tab => 
    tab.href === pathname || 
    (pathname.endsWith('/') && tab.href === pathname.slice(0, -1))
  ) || tabs[0];

  return (
    <div className="container max-w-6xl mx-auto py-6">
      {/* Header */}
      <div className="space-y-6 mb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link 
            href="/dashboard" 
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{project.name}</span>
        </div>

        {/* Project Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                {getStatusIcon(project.status)}
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
            {project.description && (
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                {project.description}
              </p>
            )}
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Project Progress</span>
            <span className="font-medium">{getProgressValue(project.status)}%</span>
          </div>
          <Progress value={getProgressValue(project.status)} className="h-2" />
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.href === pathname || 
                (pathname.endsWith('/') && tab.href === pathname.slice(0, -1));
              
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Current Tab Description */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <currentTab.icon className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold">{currentTab.label}</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">{currentTab.description}</p>
        </div>
      </div>

      {/* Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}