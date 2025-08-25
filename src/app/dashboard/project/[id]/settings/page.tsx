'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { 
  Settings, 
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  Info,
  Palette,
  Code2,
  Globe
} from 'lucide-react';

export default function ProjectSettingsPage() {
  const params = useParams();
  const { getProject, updateProject, deleteProject } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const projectId = params.id as string;
  const project = getProject(projectId);

  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
  });

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Project Settings</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Project Not Found</h3>
                <p className="text-gray-500">
                  The project you're looking for doesn't exist or has been deleted.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard">
                  Return to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateProject(projectId, {
        name: formData.name,
        description: formData.description,
        updatedAt: new Date().toISOString(),
      });
      // In a real app, you might show a success toast here
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      deleteProject(projectId);
      // Navigation will be handled by the layout when project is not found
    } catch (error) {
      console.error('Error deleting project:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/project/${projectId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Project Settings</h1>
            <p className="text-gray-500">
              Manage your project configuration and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Project Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Project Information
          </CardTitle>
          <CardDescription>
            Update basic information about your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Project Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Project Status
          </CardTitle>
          <CardDescription>
            Current status and generation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Current Status</Label>
                <p className="text-lg font-semibold capitalize mt-1">
                  {project.status.replace('_', ' ')}
                </p>
              </div>
              
              {project.analysis?.platformDetection && (
                <div>
                  <Label className="text-sm font-medium">Detected Platform</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {project.analysis.platformDetection.platform === 'web' && <Globe className="w-4 h-4" />}
                    {project.analysis.platformDetection.platform === 'mobile' && <Code2 className="w-4 h-4" />}
                    <span className="capitalize">
                      {project.analysis.platformDetection.platform}
                    </span>
                  </div>
                </div>
              )}
              
              {project.generatedCode && (
                <div>
                  <Label className="text-sm font-medium">Generated Framework</Label>
                  <p className="font-medium mt-1">
                    {project.generatedCode.framework}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="mt-1">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="mt-1">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </div>
              
              {project.analysis && (
                <div>
                  <Label className="text-sm font-medium">Components Detected</Label>
                  <p className="font-semibold text-green-600 mt-1">
                    {project.analysis.components?.length || 0}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Generation Settings
          </CardTitle>
          <CardDescription>
            Configure how code is generated for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Generation Settings Coming Soon
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Advanced settings for customizing code generation (framework preferences, 
                    styling options, component structure) will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <div className="space-y-4">
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="space-y-2">
                <h4 className="font-medium text-red-900 dark:text-red-100">
                  Delete Project
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Once you delete a project, there is no going back. This will permanently 
                  delete the project, including all analysis data, generated code, and settings.
                </p>
              </div>
              
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2 mt-4"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}