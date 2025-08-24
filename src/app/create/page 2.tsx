'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdvancedImageUpload } from '@/components/upload/advanced-image-upload';
import { SignInButton } from '@/components/auth/sign-in-button';
import { useAppStore } from '@/lib/store';
import { UploadedImage, Project } from '@/types';
import { generateId, generateProjectName, validateProjectName } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function CreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { addProject } = useAppStore();

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleImageUpload = (image: UploadedImage) => {
    setUploadedImage(image);
    
    // Auto-generate project name if not set
    if (!projectName) {
      setProjectName(generateProjectName());
      setNameError(null);
    }
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
  };

  const handleProjectNameChange = (value: string) => {
    setProjectName(value);
    const error = validateProjectName(value);
    setNameError(error);
  };

  const handleCreateProject = async () => {
    if (!session?.user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to create a project.',
        variant: 'destructive',
      });
      return;
    }

    if (!uploadedImage) {
      toast({
        title: 'Image Required',
        description: 'Please upload a screenshot to analyze.',
        variant: 'destructive',
      });
      return;
    }

    const nameValidation = validateProjectName(projectName);
    if (nameValidation) {
      setNameError(nameValidation);
      return;
    }

    try {
      setIsCreating(true);

      // Create project object
      const project: Project = {
        id: generateId(),
        userId: session.user.id!,
        name: projectName.trim(),
        description: description.trim() || undefined,
        originalImage: uploadedImage,
        status: 'uploaded',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to store
      addProject(project);

      toast({
        title: 'Project Created',
        description: 'Your project has been created successfully.',
      });

      // Navigate to analysis page
      router.push(`/dashboard/project/${project.id}`);

    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!session?.user) {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to create a new project and start analyzing app screenshots.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignInButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Upload a screenshot of any app interface to get started
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Screenshot</CardTitle>
            <CardDescription>
              Choose an image of the app interface you want to recreate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              disabled={isCreating}
            />
          </CardContent>
        </Card>

        {/* Project Details */}
        {uploadedImage && (
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Give your project a name and optional description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name *</Label>
                <Input
                  id="project-name"
                  placeholder="My Awesome App Clone"
                  value={projectName}
                  onChange={(e) => handleProjectNameChange(e.target.value)}
                  disabled={isCreating}
                  className={nameError ? 'border-red-500' : ''}
                />
                {nameError && (
                  <p className="text-sm text-red-500">{nameError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Describe what this app does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isCreating}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {uploadedImage && (
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={isCreating || !!nameError || !projectName.trim()}
              className="gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Project...
                </>
              ) : (
                <>
                  Create Project
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}