'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { 
  Eye, 
  Download, 
  Code2, 
  Copy,
  ExternalLink,
  FileCode,
  Palette,
  Layout,
  ArrowLeft
} from 'lucide-react';

export default function ProjectPreviewPage() {
  const params = useParams();
  const { getProject } = useAppStore();
  
  const projectId = params.id as string;
  const project = getProject(projectId);

  if (!project || !project.generatedCode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/project/${projectId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Code Preview</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                <Code2 className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No Code Generated</h3>
                <p className="text-gray-500">
                  This project doesn't have any generated code yet. Generate code first to preview it here.
                </p>
              </div>
              <Button asChild>
                <Link href={`/dashboard/project/${projectId}/generate`}>
                  Generate Code
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
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
            <h1 className="text-2xl font-bold">Code Preview</h1>
            <p className="text-gray-500">
              Review and customize your generated code
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/project/${projectId}/export`}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Link>
          </Button>
        </div>
      </div>

      {/* Code Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layout className="w-5 h-5" />
              Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {project.generatedCode.framework}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Generated framework
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCode className="w-5 h-5" />
              Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {project.generatedCode.files?.length || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Generated files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5" />
              Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {project.analysis?.components?.length || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              UI components
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Generated Files */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Generated Files</h2>
        
        {project.generatedCode.files && project.generatedCode.files.length > 0 ? (
          <div className="space-y-4">
            {project.generatedCode.files.map((file, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="w-4 h-4" />
                      {file.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {file.type || 'file'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(file.content)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  {file.description && (
                    <CardDescription>{file.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea
                      value={file.content}
                      readOnly
                      className="font-mono text-sm min-h-[200px] resize-none"
                      style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                  <FileCode className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">No Files Generated</h3>
                  <p className="text-gray-500 text-sm">
                    The code generation process didn't create any files. This might be due to an error or incomplete analysis.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/project/${projectId}/generate`}>
                    <Code2 className="w-4 h-4 mr-2" />
                    Regenerate Code
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Project Summary
          </CardTitle>
          <CardDescription>
            Overview of your generated project structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Project Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span>{project.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Framework:</span>
                    <span>{project.generatedCode.framework}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform:</span>
                    <span className="capitalize">
                      {project.analysis?.platformDetection?.platform || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Generation Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Files Created:</span>
                    <span>{project.generatedCode.files?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Components:</span>
                    <span>{project.analysis?.components?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Confidence:</span>
                    <span>
                      {project.analysis?.confidence ? 
                        `${Math.round(project.analysis.confidence * 100)}%` : 
                        'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t">
        <Button asChild className="flex-1">
          <Link href={`/dashboard/project/${projectId}/export`}>
            <Download className="w-4 h-4 mr-2" />
            Export Project
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/dashboard/project/${projectId}/generate`}>
            <Code2 className="w-4 h-4 mr-2" />
            Regenerate Code
          </Link>
        </Button>
      </div>
    </div>
  );
}