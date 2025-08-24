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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ProgressBar } from '@/components/ui/progress-bar';
import { HelpTooltip } from '@/components/onboarding/help-tooltip';
import { ArrowRight, Loader2, Sparkles, Upload, Zap } from 'lucide-react';

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
  const [creationProgress, setCreationProgress] = useState(0);
  const [creationStep, setCreationStep] = useState('');

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
      setCreationProgress(0);
      setCreationStep('Initializing project...');

      // Step 1: Validate and prepare data
      await new Promise(resolve => setTimeout(resolve, 500));
      setCreationProgress(25);
      setCreationStep('Preparing project data...');

      // Step 2: Create project object
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

      await new Promise(resolve => setTimeout(resolve, 500));
      setCreationProgress(50);
      setCreationStep('Saving to workspace...');

      // Step 3: Add to store
      addProject(project);

      await new Promise(resolve => setTimeout(resolve, 500));
      setCreationProgress(75);
      setCreationStep('Setting up analysis...');

      await new Promise(resolve => setTimeout(resolve, 500));
      setCreationProgress(100);
      setCreationStep('Complete!');

      toast({
        title: 'Project Created',
        description: 'Your project has been created successfully.',
      });

      // Navigate to analysis page
      setTimeout(() => {
        router.push(`/dashboard/project/${project.id}`);
      }, 500);

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
          <LoadingSpinner size="lg" text="Initializing workspace..." />
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
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
              <HelpTooltip
                content="Upload any app screenshot and our AI will analyze the interface to generate production-ready code. The process involves screenshot analysis, component detection, and full-stack code generation."
                title="How it works"
                type="info"
              />
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transform any app interface into production-ready code using our advanced AI analysis. 
              Supports mobile apps, web apps, and desktop applications.
            </p>
          </div>
          
          {/* Process Steps */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <span>Upload</span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <span>Analyze</span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <span>Generate</span>
            </div>
          </div>
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
            <AdvancedImageUpload
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              disabled={isCreating}
              showPreview={true}
              enableAIAnalysis={true}
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="project-name">Project Name *</Label>
                  <HelpTooltip
                    content="Choose a descriptive name for your project. This will be used for generated files and project organization. Names should be unique and follow standard naming conventions."
                    type="help"
                  />
                </div>
                <Input
                  id="project-name"
                  placeholder="My Awesome App Clone"
                  value={projectName}
                  onChange={(e) => handleProjectNameChange(e.target.value)}
                  disabled={isCreating}
                  className={nameError ? 'border-red-500' : ''}
                />
                {nameError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>{nameError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <HelpTooltip
                    content="Add a brief description of what this app does or what you're trying to recreate. This helps with code generation and project documentation."
                    type="help"
                  />
                </div>
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

        {/* Creation Progress */}
        {isCreating && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <LoadingSpinner size="sm" />
                  <div>
                    <p className="font-medium text-primary">Creating Your Project</p>
                    <p className="text-sm text-muted-foreground">{creationStep}</p>
                  </div>
                </div>
                <ProgressBar 
                  value={creationProgress} 
                  max={100}
                  variant="default"
                  showLabel={true}
                  label="Progress"
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
              className="gap-2 min-w-[140px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
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