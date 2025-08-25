'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { formatRelativeTime, getPlatformDisplayName, getFrameworkDisplayName } from '@/lib/utils';
import { 
  History,
  Eye, 
  Download, 
  Settings,
  Trash2,
  Clock,
  Brain,
  Code2,
  Smartphone,
  Monitor,
  Globe,
  Zap,
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  ImageIcon
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export default function HistoryPage() {
  const { projects, deleteProject } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filter and search projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(projectId);
    try {
      deleteProject(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(null);
    }
  };

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
      case 'uploaded': return 'Ready to Analyze';
      case 'analyzing': return 'Analyzing...';
      case 'analyzed': return 'Ready to Generate';
      case 'generating': return 'Generating Code...';
      case 'generated': return 'Code Generated';
      case 'completed': return 'Complete';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'mobile': return Smartphone;
      case 'desktop': return Monitor;
      case 'web': return Globe;
      default: return Zap;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'uploaded', label: 'Ready to Analyze' },
    { value: 'analyzing', label: 'Analyzing' },
    { value: 'analyzed', label: 'Ready to Generate' },
    { value: 'generating', label: 'Generating Code' },
    { value: 'generated', label: 'Code Generated' },
    { value: 'completed', label: 'Complete' },
    { value: 'failed', label: 'Failed' }
  ];

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Project History</h1>
              <p className="text-muted-foreground">
                View and manage all your analyzed screenshots and generated projects
              </p>
            </div>
          </div>
        </div>
        
        <Button asChild size="lg" className="gap-2 shadow-lg">
          <Link href="/create">
            <Zap className="w-4 h-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Projects</CardTitle>
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{projects.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Completed</CardTitle>
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Code2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {projects.filter(p => ['generated', 'completed'].includes(p.status)).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">In Progress</CardTitle>
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {projects.filter(p => ['analyzing', 'generating'].includes(p.status)).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Ready to Start</CardTitle>
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {projects.filter(p => ['uploaded', 'analyzed'].includes(p.status)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {statusOptions.find(option => option.value === filterStatus)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setFilterStatus(option.value)}
                  className={filterStatus === option.value ? 'bg-accent' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => {
            const PlatformIcon = getPlatformIcon(project.analysis?.platformDetection?.platform);
            
            return (
              <Card 
                key={project.id} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/project/${project.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/project/${project.id}/settings`}>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        {project.generatedCode && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/project/${project.id}/preview`}>
                                <Code2 className="w-4 h-4 mr-2" />
                                Preview Code
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/project/${project.id}/export`}>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(project.id, project.name)}
                          disabled={isDeleting === project.id}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {isDeleting === project.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Image Preview */}
                  <Link href={`/dashboard/project/${project.id}`}>
                    <div className="relative w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden mb-3 group-hover:scale-[1.02] transition-transform duration-300">
                      {project.originalImage?.preview ? (
                        <Image
                          src={project.originalImage.preview}
                          alt={project.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ExternalLink className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Platform and Framework */}
                    {project.analysis?.platformDetection && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <PlatformIcon className="w-4 h-4" />
                        <span>
                          {getPlatformDisplayName(project.analysis.platformDetection.platform)}
                          {project.analysis.platformDetection.framework && (
                            <> • {getFrameworkDisplayName(project.analysis.platformDetection.framework)}</>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Analysis Stats */}
                    {project.analysis && (
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{project.analysis.components?.length || 0} components</span>
                        <span>{Math.round((project.analysis.confidence || 0) * 100)}% confidence</span>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>Created {formatRelativeTime(project.createdAt)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/dashboard/project/${project.id}`}>
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Link>
                      </Button>
                      
                      {project.generatedCode && (
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/dashboard/project/${project.id}/export`}>
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Link>
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(project.id, project.name)}
                        disabled={isDeleting === project.id}
                        className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="border-2 border-dashed border-muted text-center py-16">
          <CardContent className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center">
              <History className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-3 max-w-md mx-auto">
              <h3 className="text-xl font-semibold">
                {searchQuery || filterStatus !== 'all' ? 'No matching projects found' : 'No projects yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria to find projects.'
                  : 'Start by uploading your first app screenshot to analyze and generate code.'
                }
              </p>
            </div>
            <div className="space-y-4">
              {searchQuery || filterStatus !== 'all' ? (
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setSearchQuery('')} variant="outline">
                    Clear Search
                  </Button>
                  <Button onClick={() => setFilterStatus('all')} variant="outline">
                    Show All
                  </Button>
                </div>
              ) : (
                <Button asChild size="lg" className="gap-2 shadow-lg">
                  <Link href="/create">
                    <Zap className="w-4 h-4" />
                    Create Your First Project
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}