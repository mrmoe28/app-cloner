'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { 
  Download, 
  Package,
  FileArchive,
  Github,
  Globe,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function ProjectExportPage() {
  const params = useParams();
  const { getProject } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  
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
          <h1 className="text-2xl font-bold">Export Project</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No Code to Export</h3>
                <p className="text-gray-500">
                  This project doesn't have any generated code yet. Generate code first before exporting.
                </p>
              </div>
              <Button asChild>
                <Link href={`/dashboard/project/${projectId}/generate`}>
                  Generate Code First
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const createZipFile = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Add project files to zip
    if (project.generatedCode?.files) {
      project.generatedCode.files.forEach(file => {
        zip.file(file.name, file.content);
      });
    }
    
    // Add package.json
    const packageJson = {
      name: project.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      version: '1.0.0',
      description: project.description || 'Generated with App Cloner',
      main: 'index.js',
      scripts: {
        start: 'npm run dev',
        dev: 'next dev',
        build: 'next build',
        lint: 'eslint .'
      },
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        next: '^15.0.0'
      }
    };
    zip.file('package.json', JSON.stringify(packageJson, null, 2));
    
    // Add README.md
    const readme = `# ${project.name}

Generated with App Cloner

## Description
${project.description || 'No description provided'}

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Generated Files
${project.generatedCode?.files?.map(f => `- ${f.name}`).join('\n') || 'No files generated'}

## Platform
- **Platform**: ${project.analysis?.platformDetection?.platform || 'Unknown'}
- **Framework**: ${project.generatedCode?.framework || 'Unknown'}
- **Components**: ${project.analysis?.components?.length || 0}

Generated on ${new Date().toLocaleDateString()}
`;
    zip.file('README.md', readme);
    
    return zip;
  };

  const downloadZip = async (zip: any) => {
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '-')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'zip' | 'github' | 'deploy') => {
    setIsExporting(true);
    setExportStatus(null);
    
    try {
      switch (format) {
        case 'zip':
          const zip = await createZipFile();
          await downloadZip(zip);
          setExportStatus('ZIP file downloaded successfully');
          break;
        case 'github':
          // Create ZIP and redirect to GitHub for manual repository creation
          const zip = await createZipFile();
          await downloadZip(zip);
          
          // Open GitHub new repository page
          const repoName = project.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const githubNewRepoUrl = `https://github.com/new?name=${repoName}&description=${encodeURIComponent(project.description || 'Generated with App Cloner')}`;
          window.open(githubNewRepoUrl, '_blank');
          
          setExportStatus('ZIP downloaded! GitHub repository page opened - upload the files to create your repo.');
          break;
        case 'deploy':
          setExportStatus('Deploy functionality coming soon');
          // In a real implementation, this would deploy to a platform
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      id: 'zip',
      title: 'Download ZIP',
      description: 'Download your project as a compressed ZIP file',
      icon: FileArchive,
      action: 'Download',
      recommended: false
    },
    {
      id: 'github',
      title: 'Export to GitHub',
      description: 'Download ZIP and open GitHub to create a new repository',
      icon: Github,
      action: 'Export to GitHub',
      recommended: true
    },
    {
      id: 'deploy',
      title: 'Deploy to Vercel',
      description: 'Deploy your project live to the web with Vercel',
      icon: Globe,
      action: 'Deploy Now',
      recommended: false
    }
  ];

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
            <h1 className="text-2xl font-bold">Export Project</h1>
            <p className="text-gray-500">
              Export your generated code in different formats
            </p>
          </div>
        </div>
        
        <Button asChild variant="outline">
          <Link href={`/dashboard/project/${projectId}/preview`}>
            Preview Code
          </Link>
        </Button>
      </div>

      {/* Export Status */}
      {exportStatus && (
        <Card className={exportStatus.includes('failed') ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {exportStatus.includes('failed') ? (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
              <p className={exportStatus.includes('failed') ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}>
                {exportStatus}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Project Ready for Export
          </CardTitle>
          <CardDescription>
            Your {project.generatedCode.framework} project with {project.generatedCode.files?.length || 0} files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {project.generatedCode.framework}
              </div>
              <div className="text-sm text-gray-500">Framework</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {project.generatedCode.files?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Generated Files</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-600">
                {project.analysis?.components?.length || 0}
              </div>
              <div className="text-sm text-gray-500">UI Components</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Export Options</h2>
        
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          {exportOptions.map((option) => (
            <Card key={option.id} className={`relative ${option.recommended ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950' : ''}`}>
              {option.recommended && (
                <Badge className="absolute -top-2 left-4 bg-blue-600 text-white">
                  Recommended
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <option.icon className={`w-5 h-5 ${option.recommended ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {option.title}
                </CardTitle>
                <CardDescription>
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={option.recommended ? 'default' : 'outline'}
                  onClick={() => handleExport(option.id as 'zip' | 'github' | 'deploy')}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    'Exporting...'
                  ) : (
                    <>
                      {option.action}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* File Structure Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Generated File Structure</CardTitle>
          <CardDescription>
            Preview of files that will be included in your export
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.generatedCode.files && project.generatedCode.files.length > 0 ? (
            <div className="space-y-2">
              {project.generatedCode.files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                  <FileArchive className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-sm">{file.name}</span>
                  {file.type && (
                    <Badge variant="secondary" className="text-xs">
                      {file.type}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No files available for export
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Export Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">What's included:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
              <li>• All generated source code files</li>
              <li>• Package configuration (package.json, etc.)</li>
              <li>• README with setup instructions</li>
              <li>• Component documentation</li>
              <li>• Asset files and resources</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Next steps after export:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
              <li>• Install dependencies (npm install)</li>
              <li>• Review and customize the generated code</li>
              <li>• Test the application thoroughly</li>
              <li>• Deploy to your preferred hosting platform</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}