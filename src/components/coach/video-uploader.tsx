'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Video, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { storageService, UploadProgress, STORAGE_CONFIGS } from '@/lib/firebase/storage.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VideoUploaderProps {
  coachId: string;
  onVideoUploaded: (url: string, duration?: number) => void;
  initialVideoUrl?: string;
  className?: string;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function VideoUploader({
  coachId,
  onVideoUploaded,
  initialVideoUrl,
  className,
}: VideoUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>(
    initialVideoUrl ? 'success' : 'idle'
  );
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(
    initialVideoUrl && !initialVideoUrl.includes('firebasestorage') ? 'url' : 'upload'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const MAX_SIZE_BYTES = STORAGE_CONFIGS.VIDEOS.maxSizeBytes;
  const ALLOWED_TYPES = STORAGE_CONFIGS.VIDEOS.allowedTypes;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(MAX_SIZE_BYTES)})`);
      return false;
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage(`File type "${file.type}" is not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    setErrorMessage(null);

    if (!validateFile(file)) {
      setUploadState('error');
      return;
    }

    setSelectedFile(file);
    setUploadState('idle');

    // Create a temporary URL to get video duration
    const tempUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      setVideoDuration(Math.floor(tempVideo.duration));
      URL.revokeObjectURL(tempUrl);
    };
    tempVideo.src = tempUrl;
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadState('uploading');
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      const result = await storageService.uploadFile(
        selectedFile,
        {
          folder: `coach-content/${coachId}/videos`,
          maxSizeBytes: MAX_SIZE_BYTES,
          allowedTypes: ALLOWED_TYPES,
          customMetadata: {
            coachId,
            contentType: 'video',
          },
        },
        (progress: UploadProgress) => {
          setUploadProgress(Math.round(progress.percentage));
        }
      );

      if (result.success && result.url) {
        setVideoUrl(result.url);
        setUploadState('success');
        onVideoUploaded(result.url, videoDuration);
        toast.success('Video uploaded successfully');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadState('error');
      const message = error instanceof Error ? error.message : 'Failed to upload video';
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (!videoUrl.trim()) {
      setErrorMessage('Please enter a video URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(videoUrl);
    } catch {
      setErrorMessage('Please enter a valid URL');
      return;
    }

    // Get video duration from URL
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      const duration = Math.floor(tempVideo.duration);
      setVideoDuration(duration);
      onVideoUploaded(videoUrl, duration);
      setUploadState('success');
      toast.success('Video URL added successfully');
    };
    tempVideo.onerror = () => {
      // For external URLs (YouTube, etc.), we can't get duration
      onVideoUploaded(videoUrl, undefined);
      setUploadState('success');
      toast.success('Video URL added successfully');
    };
    tempVideo.src = videoUrl;
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setVideoUrl('');
    setUploadState('idle');
    setUploadProgress(0);
    setErrorMessage(null);
    setVideoDuration(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderUploadArea = () => {
    if (uploadState === 'success' && videoUrl) {
      return (
        <div className="space-y-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Video ready</span>
              {videoDuration && (
                <span className="text-muted-foreground">
                  ({Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')})
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleRemove}>
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      );
    }

    if (uploadState === 'uploading') {
      return (
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Uploading... {uploadProgress}%
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
          uploadState === 'error' && 'border-destructive/50 bg-destructive/5'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        {uploadState === 'error' ? (
          <div className="space-y-2">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}>
              Try Again
            </Button>
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <Video className="h-12 w-12 mx-auto text-primary" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
                {videoDuration && ` • ${Math.floor(videoDuration / 60)}:${(videoDuration % 60).toString().padStart(2, '0')}`}
              </p>
            </div>
            <Button onClick={(e) => {
              e.stopPropagation();
              handleUpload();
            }}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">Drop your video here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supports MP4, WebM, MOV (max {formatFileSize(MAX_SIZE_BYTES)})
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'url')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="url">Video URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            {renderUploadArea()}
          </TabsContent>

          <TabsContent value="url">
            {uploadState === 'success' && videoUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Video URL added</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRemove}>
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://youtube.com/watch?v=... or direct video URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a YouTube, Vimeo, or direct video URL
                  </p>
                </div>
                {errorMessage && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}
                <Button onClick={handleUrlSubmit} className="w-full">
                  Add Video URL
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
