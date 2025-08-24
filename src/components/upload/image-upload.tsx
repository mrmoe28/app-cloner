'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isValidImageFile, formatFileSize, createFilePreview } from '@/lib/utils';
import { UploadedImage } from '@/types';
import Image from 'next/image';

interface ImageUploadProps {
  onUpload?: (file: UploadedImage) => void;
  onRemove?: (id: string) => void;
  maxFileSize?: number; // in bytes
  accept?: string[];
  disabled?: boolean;
}

export function ImageUpload({
  onUpload,
  onRemove,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  accept = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'],
  disabled = false,
}: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Clear any previous errors
    setError(null);

    // Handle rejected files
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

    // Validate file type
    if (!isValidImageFile(file)) {
      setError('Invalid file type. Please upload an image file.');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError(`File too large. Maximum size is ${formatFileSize(maxFileSize)}`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create preview
      const preview = await createFilePreview(file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 100);

      // Create uploaded image object
      const uploadedImageObj: UploadedImage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        uploadedAt: new Date(),
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUploadProgress(100);
      setUploadedImage(uploadedImageObj);
      onUpload?.(uploadedImageObj);

    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [maxFileSize, onUpload]);

  const handleRemove = useCallback(() => {
    if (uploadedImage) {
      setUploadedImage(null);
      setError(null);
      onRemove?.(uploadedImage.id);
    }
  }, [uploadedImage, onRemove]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    multiple: false,
    disabled: disabled || isUploading,
  });

  if (uploadedImage && !isUploading) {
    return (
      <Card className="relative">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={uploadedImage.preview}
                alt="Uploaded image"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium truncate">
                    {uploadedImage.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadedImage.file.size)} • {uploadedImage.file.type}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">Upload complete</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardContent className="p-0">
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${error ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              ) : error ? (
                <AlertCircle className="w-6 h-6 text-red-500" />
              ) : (
                <Upload className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            {isUploading ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Uploading image...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-gray-500">{Math.round(uploadProgress)}% complete</p>
              </div>
            ) : error ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600">{error}</p>
                <p className="text-xs text-gray-500">Please try again</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isDragActive ? 'Drop your image here' : 'Upload app screenshot'}
                </p>
                <p className="text-xs text-gray-500">
                  Drag and drop or click to browse
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary">PNG</Badge>
                  <Badge variant="secondary">JPG</Badge>
                  <Badge variant="secondary">WebP</Badge>
                </div>
                <p className="text-xs text-gray-400">
                  Max file size: {formatFileSize(maxFileSize)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}