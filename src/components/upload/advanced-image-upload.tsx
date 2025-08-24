'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpTooltip } from '@/components/onboarding/help-tooltip';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  Camera,
  Smartphone,
  Monitor,
  Globe,
  Zap,
  Sparkles,
  Eye,
  Download
} from 'lucide-react';
import { isValidImageFile, formatFileSize, createFilePreview } from '@/lib/utils';
import { UploadedImage } from '@/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AdvancedImageUploadProps {
  onUpload?: (file: UploadedImage) => void;
  onRemove?: (id: string) => void;
  maxFileSize?: number;
  accept?: string[];
  disabled?: boolean;
  showPreview?: boolean;
  enableAIAnalysis?: boolean;
}

interface AnalysisResult {
  platform: 'mobile' | 'web' | 'desktop' | 'unknown';
  confidence: number;
  components: string[];
  suggestions: string[];
}

export function AdvancedImageUpload({
  onUpload,
  onRemove,
  maxFileSize = 10 * 1024 * 1024,
  accept = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'],
  disabled = false,
  showPreview = true,
  enableAIAnalysis = true,
}: AdvancedImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragDepth, setDragDepth] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock AI analysis function
  const analyzeImage = async (file: File): Promise<AnalysisResult> => {
    // Simulate AI analysis based on file name and dimensions
    return new Promise((resolve) => {
      setTimeout(() => {
        const fileName = file.name.toLowerCase();
        let platform: AnalysisResult['platform'] = 'unknown';
        let components: string[] = [];
        let suggestions: string[] = [];

        // Simple heuristics for demo
        if (fileName.includes('mobile') || fileName.includes('phone') || fileName.includes('ios') || fileName.includes('android')) {
          platform = 'mobile';
          components = ['Navigation Bar', 'Cards', 'Buttons', 'List Items'];
          suggestions = ['Consider React Native', 'Flutter implementation recommended', 'Focus on touch interactions'];
        } else if (fileName.includes('web') || fileName.includes('website') || fileName.includes('browser')) {
          platform = 'web';
          components = ['Header', 'Sidebar', 'Content Grid', 'Forms'];
          suggestions = ['React or Vue.js suitable', 'Responsive design needed', 'Consider component library'];
        } else if (fileName.includes('desktop') || fileName.includes('app')) {
          platform = 'desktop';
          components = ['Menu Bar', 'Toolbar', 'Panels', 'Status Bar'];
          suggestions = ['Electron recommended', 'Consider native development', 'Focus on keyboard shortcuts'];
        } else {
          // Default to web
          platform = 'web';
          components = ['Layout Components', 'Interactive Elements', 'Content Areas'];
          suggestions = ['Universal approach recommended', 'Start with web framework', 'Consider cross-platform options'];
        }

        resolve({
          platform,
          confidence: Math.random() * 20 + 80, // 80-100%
          components,
          suggestions,
        });
      }, 2000);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    setDragDepth(0);

    if (rejectedFiles.length > 0) {
      const rejectedFile = rejectedFiles[0];
      if (rejectedFile.errors.some((e: any) => e.code === 'file-too-large')) {
        setError(`File too large. Maximum size is ${formatFileSize(maxFileSize)}`);
      } else if (rejectedFile.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError('Invalid file type. Please upload an image file (JPEG, PNG, WebP, BMP)');
      } else {
        setError('Failed to upload file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    if (!isValidImageFile(file)) {
      setError('Invalid file type. Please upload an image file.');
      return;
    }

    if (file.size > maxFileSize) {
      setError(`File too large. Maximum size is ${formatFileSize(maxFileSize)}`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const preview = await createFilePreview(file);

      // Animate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 150);

      const uploadedImageObj: UploadedImage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        uploadedAt: new Date(),
      };

      await new Promise(resolve => setTimeout(resolve, 1500));

      setUploadProgress(100);
      setUploadedImage(uploadedImageObj);
      onUpload?.(uploadedImageObj);

      // Start AI analysis if enabled
      if (enableAIAnalysis) {
        setIsAnalyzing(true);
        try {
          const analysisResult = await analyzeImage(file);
          setAnalysis(analysisResult);
        } catch (err) {
          console.error('Analysis failed:', err);
        } finally {
          setIsAnalyzing(false);
        }
      }

    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [maxFileSize, onUpload, enableAIAnalysis]);

  const handleRemove = useCallback(() => {
    if (uploadedImage) {
      setUploadedImage(null);
      setError(null);
      setAnalysis(null);
      onRemove?.(uploadedImage.id);
    }
  }, [uploadedImage, onRemove]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragDepth(prev => prev + 1);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragDepth(prev => prev - 1);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    multiple: false,
    disabled: disabled || isUploading,
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'web': return <Globe className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'mobile': return 'bg-green-100 text-green-800 border-green-200';
      case 'web': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'desktop': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (uploadedImage && !isUploading) {
    return (
      <div className="space-y-4">
        {/* Uploaded Image Card */}
        <Card className="relative overflow-hidden border-2 border-green-200 bg-green-50/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-green-200">
                <Image
                  src={uploadedImage.preview}
                  alt="Uploaded image"
                  fill
                  className="object-cover"
                />
                {showPreview && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium truncate flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {uploadedImage.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadedImage.file.size)} • {uploadedImage.file.type}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-green-600 font-medium">Upload complete</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <HelpTooltip
                      content="Preview the uploaded image to verify it contains the app interface you want to recreate."
                      type="info"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      disabled={disabled}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Results */}
        {enableAIAnalysis && (
          <Card className="border border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Analysis</span>
                {isAnalyzing && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-primary" />
                )}
              </div>

              {isAnalyzing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-pulse">Analyzing interface components...</div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              ) : analysis ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn("border", getPlatformColor(analysis.platform))}
                    >
                      {getPlatformIcon(analysis.platform)}
                      <span className="ml-1 capitalize">{analysis.platform} App</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(analysis.confidence)}% confidence
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Detected Components:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.components.map((component, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Recommendations:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Analysis will start after upload completes...
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-0">
        <div
          {...getRootProps()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300",
            "hover:border-primary/50 hover:bg-primary/5",
            isDragActive && dragDepth > 0 && "border-primary bg-primary/10 scale-[1.02] shadow-lg",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-red-300 bg-red-50 dark:bg-red-950/20",
            "group"
          )}
        >
          <input {...getInputProps()} ref={fileInputRef} />
          
          {/* Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative space-y-6">
            {/* Icon */}
            <div className={cn(
              "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
              isDragActive 
                ? "bg-primary text-primary-foreground scale-110 shadow-lg" 
                : "bg-gradient-to-br from-muted to-muted/50 group-hover:from-primary/20 group-hover:to-accent/20"
            )}>
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent" />
              ) : error ? (
                <AlertCircle className="w-8 h-8 text-red-500" />
              ) : isDragActive ? (
                <Download className="w-8 h-8" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
            
            {/* Content */}
            {isUploading ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-primary">Processing your screenshot...</p>
                <div className="w-full max-w-xs mx-auto">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round(uploadProgress)}% complete</p>
                </div>
              </div>
            ) : error ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600 font-medium">{error}</p>
                <p className="text-xs text-muted-foreground">Please try again with a different image</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-medium mb-2">
                    {isDragActive ? 'Drop your screenshot here' : 'Upload app screenshot'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your image, or click to browse files
                  </p>
                </div>
                
                {/* Supported Formats */}
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="border-green-200 text-green-700">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    PNG
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    <Camera className="w-3 h-3 mr-1" />
                    JPG
                  </Badge>
                  <Badge variant="outline" className="border-purple-200 text-purple-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    WebP
                  </Badge>
                </div>
                
                {/* File Size Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Maximum file size: {formatFileSize(maxFileSize)}</p>
                  {enableAIAnalysis && (
                    <p className="flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI analysis will detect platform and components
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}