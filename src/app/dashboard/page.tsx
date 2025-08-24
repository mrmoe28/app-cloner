'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SignInButton } from '@/components/auth/sign-in-button';
import { useProjects } from '@/lib/store';
import { formatRelativeTime, getPlatformDisplayName, getFrameworkDisplayName } from '@/lib/utils';
import { Plus, Upload, Clock, Code2, Loader2, Eye } from 'lucide-react';
import Image from 'next/image';

function ProjectCard({ project }: { project: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'generating':
      case 'analyzing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
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

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="container max-w-6xl mx-auto py-12">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!session?.user) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome to App Cloner</CardTitle>
            <CardDescription>
              Sign in to view your projects and start cloning app interfaces
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignInButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user's projects
  const userProjects = projects.filter(p => p.userId === session.user.id);

  return (
    <div className="container max-w-6xl mx-auto py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your app cloning projects
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/create">
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Code2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProjects.filter(p => p.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Loader2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProjects.filter(p => 
                  ['analyzing', 'generating'].includes(p.status)
                ).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready to Start</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProjects.filter(p => 
                  ['uploaded', 'analyzed'].includes(p.status)
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        {userProjects.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Your Projects</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userProjects
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No projects yet</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Upload your first app screenshot to start cloning interfaces with AI
                </p>
              </div>
              <Button asChild className="gap-2">
                <Link href="/create">
                  <Plus className="w-4 h-4" />
                  Create Your First Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}