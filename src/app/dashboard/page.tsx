'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SignInButton } from '@/components/auth/sign-in-button';
import { useProjects } from '@/lib/store';
import { formatRelativeTime, getPlatformDisplayName, getFrameworkDisplayName } from '@/lib/utils';
import { Plus, Clock, Code2, Loader2, Eye, Sparkles, Zap, History } from 'lucide-react';
import Image from 'next/image';

function ProjectCard({ project }: { project: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'generated':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'generating':
      case 'analyzing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'analyzed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'uploaded':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Ready to Analyze';
      case 'analyzing':
        return 'Analyzing...';
      case 'analyzed':
        return 'Ready to Generate';
      case 'generating':
        return 'Generating Code...';
      case 'generated':
        return 'Code Generated';
      case 'completed':
        return 'Complete';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <Link href={`/dashboard/project/${project.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{project.name}</CardTitle>
              {project.description && (
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              )}
            </div>
            <Badge className={`text-xs ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preview Image */}
            {project.originalImage?.preview && (
              <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={project.originalImage.preview}
                  alt={project.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Platform Detection */}
            {project.analysis?.platformDetection && (
              <div className="flex items-center gap-2 text-sm">
                <Code2 className="w-4 h-4 text-gray-500" />
                <span>
                  {getPlatformDisplayName(project.analysis.platformDetection.platform)}
                  {project.analysis.platformDetection.framework && (
                    <> • {getFrameworkDisplayName(project.analysis.platformDetection.framework)}</>
                  )}
                </span>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Created {formatRelativeTime(project.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const projects = useProjects();

  // Handle successful authentication redirect
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('User authenticated successfully:', session.user.email);
    }
  }, [status, session]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="container max-w-6xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!session?.user) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card className="border-2 border-dashed border-muted">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to App Cloner</CardTitle>
            <CardDescription className="text-base">
              Transform any app screenshot into production-ready code using advanced AI. 
              Sign in to access your projects and start building.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <div className="space-y-4">
              <SignInButton size="lg" />
              <p className="text-sm text-muted-foreground">
                Supports Google, GitHub, and email authentication
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user's projects
  const userProjects = projects.filter(p => p.userId === session.user.id);

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back{session.user.name ? `, ${session.user.name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-muted-foreground">
                  Transform app screenshots into production-ready code with AI
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/dashboard/history">
                <History className="w-4 h-4" />
                View All Projects
              </Link>
            </Button>
            <Button asChild size="lg" className="gap-2 shadow-lg">
              <Link href="/create">
                <Plus className="w-4 h-4" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Projects</CardTitle>
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Code2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{userProjects.length}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {userProjects.length === 0 ? 'Start your first project' : 'Projects created'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Completed</CardTitle>
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {userProjects.filter(p => ['completed', 'generated'].includes(p.status)).length}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Ready for production
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">In Progress</CardTitle>
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {userProjects.filter(p => 
                  ['analyzing', 'generating'].includes(p.status)
                ).length}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                AI processing...
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Ready to Start</CardTitle>
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {userProjects.filter(p => 
                  ['uploaded', 'analyzed'].includes(p.status)
                ).length}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Awaiting action
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        {userProjects.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Projects</h2>
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link href="/dashboard/history">
                  <Eye className="w-4 h-4" />
                  View All
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userProjects
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 6)
                .map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <Card className="border-2 border-dashed border-muted text-center py-16">
            <CardContent className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-3 max-w-md mx-auto">
                <h3 className="text-xl font-semibold">Ready to start cloning?</h3>
                <p className="text-muted-foreground">
                  Upload any app screenshot and watch our AI transform it into production-ready code. 
                  Supports React, React Native, Flutter, and more frameworks.
                </p>
              </div>
              <div className="space-y-4">
                <Button asChild size="lg" className="gap-2 shadow-lg">
                  <Link href="/create">
                    <Plus className="w-4 h-4" />
                    Create Your First Project
                  </Link>
                </Button>
                <div className="flex items-center gap-6 justify-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    AI-Powered
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Multi-Platform
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Production-Ready
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}