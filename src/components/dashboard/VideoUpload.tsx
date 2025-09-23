'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, X, FileVideo, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { firebaseStorageService, UploadProgress } from '@/lib/firebase/storage';
import { videoReviewService, StudentVideo } from '@/lib/database/services/video-review.service';
import { firebaseService } from '@/lib/firebase/service';

interface VideoUploadProps {
  className?: string;
}

interface Sport {
  id: string;
  name: string;
  icon: string;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ className }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadedVideos, setUploadedVideos] = useState<StudentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState<Sport[]>([]);

  // Form state for video details
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load sports for dropdown
      const sportsData = await firebaseService.getCollection<Sport>('sports');
      setSports(sportsData || []);

      // Load user's videos
      const videosResult = await videoReviewService.getStudentVideos(user.id);
      if (videosResult.success && videosResult.data) {
        setUploadedVideos(videosResult.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0 || !user) {
      console.log('No files or user not available');
      return;
    }

    const videoFile = files[0];
    console.log('Processing file upload:', { name: videoFile.name, size: videoFile.size, type: videoFile.type });

    // Validate video file
    const validation = firebaseStorageService.validateVideoFile(videoFile);
    if (!validation.isValid) {
      console.error('File validation failed:', validation.error);
      toast.error(validation.error);
      return;
    }

    // Check if sport and description are provided
    if (!selectedSport) {
      toast.error('Please select a sport before uploading');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description for your video');
      return;
    }

    console.log('Starting upload process...');
    setIsUploading(true);
    setUploadProgress(null);

    try {
      console.log('User info:', { id: user.id, displayName: user.displayName, email: user.email });

      // Upload to Firebase Storage
      const uploadResult = await firebaseStorageService.uploadVideo(
        videoFile,
        user.id,
        (progress) => {
          console.log('Progress update:', progress);
          setUploadProgress(progress);
        }
      );

      console.log('Upload result:', uploadResult);

      if (!uploadResult.success || !uploadResult.downloadURL) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      console.log('Creating video record in database...');

      // Create video record in database
      const selectedSportData = sports.find(s => s.id === selectedSport);
      const videoRecordData = {
        studentId: user.id,
        studentName: user.displayName || 'Unknown',
        studentEmail: user.email || '',
        videoUrl: uploadResult.downloadURL,
        storagePath: `videos/${user.id}/${videoFile.name}`,
        fileName: videoFile.name,
        fileSize: videoFile.size,
        sport: selectedSportData?.name,
        description: description.trim()
      };

      console.log('Video record data:', videoRecordData);

      const videoRecordResult = await videoReviewService.createVideoRecord(videoRecordData);

      console.log('Video record result:', videoRecordResult);

      if (!videoRecordResult.success) {
        throw new Error(videoRecordResult.error?.message || 'Failed to save video record');
      }

      toast.success('Video uploaded successfully! Coach will review soon.');

      // Reset form
      setSelectedSport('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload videos
      console.log('Reloading video list...');
      await loadInitialData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const removeVideo = async (videoId: string) => {
    try {
      const result = await videoReviewService.deleteVideoRecord(videoId);
      if (result.success) {
        setUploadedVideos(prev => prev.filter(video => video.id !== videoId));
        toast.success('Video removed');
      } else {
        toast.error('Failed to remove video');
      }
    } catch (error) {
      console.error('Error removing video:', error);
      toast.error('Failed to remove video');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: StudentVideo['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Under Review</Badge>;
      case 'feedback_sent':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Feedback Available</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: StudentVideo['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'reviewed':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'feedback_sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileVideo className="h-5 w-5 text-primary" />
            <span>Upload Training Video</span>
          </CardTitle>
          <CardDescription>
            Upload a video of your training session to receive personalized course recommendations from our coaches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sport">Sport</Label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {sport.icon} {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you're working on in this video (e.g., 'Practicing my shooting form', 'Working on defensive stance', etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                <div>
                  <p className="text-lg font-medium">Uploading video...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we process your video</p>
                  {uploadProgress && (
                    <div className="mt-4 max-w-xs mx-auto">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(uploadProgress.percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Drop your video here</p>
                  <p className="text-sm text-muted-foreground">or click to browse files</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Supported formats: MP4, MOV, AVI, WebM • Max size: 100MB
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                  disabled={!selectedSport || !description.trim()}
                >
                  Choose Video File
                </Button>
                {(!selectedSport || !description.trim()) && (
                  <p className="text-xs text-amber-600">
                    Please select a sport and provide a description before uploading
                  </p>
                )}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Uploaded Videos */}
      {uploadedVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Uploaded Videos</CardTitle>
            <CardDescription>
              Track the status of your uploaded videos and view coach feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedVideos.map((video) => (
              <div
                key={video.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-sm truncate">{video.fileName}</p>
                        {getStatusIcon(video.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                        <span>{formatFileSize(video.fileSize)}</span>
                        <span>•</span>
                        <span>Uploaded {new Date(video.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      {video.sport && (
                        <div className="text-xs text-muted-foreground mb-2">
                          Sport: {video.sport}
                        </div>
                      )}
                      <div className="mb-3">
                        {getStatusBadge(video.status)}
                      </div>

                      {/* Video Description */}
                      {video.description && (
                        <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                          <strong>Your note:</strong> {video.description}
                        </div>
                      )}

                      {/* Coach Feedback */}
                      {video.status === 'feedback_sent' && video.coachFeedback && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-sm text-green-800 mb-2">Coach Feedback</h4>
                          <p className="text-sm text-green-700 mb-3">{video.coachFeedback}</p>

                          {video.recommendedCourses && video.recommendedCourses.length > 0 && (
                            <div>
                              <h5 className="font-medium text-xs text-green-800 mb-2">Recommended Courses</h5>
                              <div className="flex flex-wrap gap-1">
                                {video.recommendedCourses.map((course, index) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-white">
                                    {course}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {video.reviewedAt && (
                            <div className="text-xs text-green-600 mt-2">
                              Reviewed on {new Date(video.reviewedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideo(video.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};