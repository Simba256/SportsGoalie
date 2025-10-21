'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRoute } from '@/components/auth/protected-route';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
import { sportsService } from '@/lib/database/services/sports.service';
import { Sport, Skill, DifficultyLevel, VideoQuiz, VideoQuizQuestion, VideoQuizSettings } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2, Video, AlertCircle, Upload, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { VideoQuestionBuilder } from '@/components/admin/VideoQuestionBuilder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

function CreateVideoQuizContent() {
  const router = useRouter();
  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoValidating, setVideoValidating] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [quizData, setQuizData] = useState<Partial<VideoQuiz>>({
    title: '',
    description: '',
    sportId: '',
    skillId: '',
    videoUrl: '',
    videoDuration: 0,
    instructions: '',
    difficulty: 'intermediate' as DifficultyLevel,
    tags: [],
    isActive: false,
    isPublished: false,
    questions: [],
    settings: {
      passingScore: 70,
      maxAttempts: 3,
      showExplanations: true,
      allowPause: true,
      allowSkip: false,
      allowSpeedControl: true,
      autoPlayNext: true,
      showProgress: true,
    } as VideoQuizSettings,
  });

  useEffect(() => {
    loadSportsAndSkills();
  }, []);

  const loadSportsAndSkills = async () => {
    try {
      setLoading(true);
      const [sportsResult, skillsResult] = await Promise.all([
        sportsService.getAllSports(),
        sportsService.getAllSkills(),
      ]);

      if (sportsResult.success && sportsResult.data) {
        setSports(sportsResult.data.items);
      }

      if (skillsResult.success && skillsResult.data) {
        setSkills(skillsResult.data.items);
      }
    } catch (error) {
      console.error('Error loading sports and skills:', error);
      toast.error('Failed to load sports and skills');
    } finally {
      setLoading(false);
    }
  };

  const validateVideoUrl = async (url: string) => {
    if (!url) {
      setVideoDuration(0);
      return;
    }

    // Helper to convert Google Drive URLs to direct video URLs
    const convertGoogleDriveUrl = (inputUrl: string): string => {
      // Check if it's a Google Drive URL
      const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
      const match = inputUrl.match(driveRegex);

      if (match && match[1]) {
        // Convert to direct video URL format
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }

      return inputUrl;
    };

    setVideoValidating(true);
    try {
      // Convert Google Drive URLs if needed
      const processedUrl = convertGoogleDriveUrl(url);

      // For Google Drive URLs, we can't always validate duration due to CORS
      // but we can set it up for playback
      if (url.includes('drive.google.com')) {
        toast.info('Google Drive video detected', {
          description: 'Duration will be detected when the video plays. Make sure the video is publicly accessible.',
        });

        setQuizData(prev => ({
          ...prev,
          videoUrl: processedUrl,
          videoDuration: 0, // Will be set when video loads in player
        }));

        setVideoValidating(false);
        return;
      }

      // Create a video element to validate and get duration
      const video = document.createElement('video');
      video.src = processedUrl;
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video validation timeout'));
        }, 10000); // 10 second timeout

        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
            setVideoDuration(Math.floor(video.duration));
            setQuizData(prev => ({
              ...prev,
              videoUrl: processedUrl,
              videoDuration: Math.floor(video.duration),
            }));
            toast.success('Video validated successfully', {
              description: `Duration: ${Math.floor(video.duration / 60)}m ${Math.floor(video.duration % 60)}s`,
            });
            resolve();
          } else {
            reject(new Error('Invalid video duration'));
          }
        };
        video.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Failed to load video'));
        };
      });
    } catch (error) {
      console.error('Video validation error:', error);
      toast.warning('Could not validate video automatically', {
        description: 'The video will be saved. Duration will be detected during playback.',
      });

      // Still allow saving with the URL
      const processedUrl = convertGoogleDriveUrl(url);
      setQuizData(prev => ({
        ...prev,
        videoUrl: processedUrl,
        videoDuration: 0,
      }));
    } finally {
      setVideoValidating(false);
    }
  };

  const handleVideoFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast.error('Video file is too large', {
        description: 'Maximum file size is 500MB',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique file name
      const timestamp = Date.now();
      const fileName = `video-quizzes/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);

      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Failed to upload video', {
            description: error.message,
          });
          setUploading(false);
        },
        async () => {
          // Upload complete, get download URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            toast.success('Video uploaded successfully');

            // Validate the uploaded video
            await validateVideoUrl(downloadURL);

            setUploading(false);
            setUploadProgress(0);
          } catch (error) {
            console.error('Error getting download URL:', error);
            toast.error('Failed to get video URL');
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
      setUploading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSettingsChange = (field: string, value: any) => {
    setQuizData(prev => ({
      ...prev,
      settings: {
        ...prev.settings!,
        [field]: value,
      },
    }));
  };

  const handleQuestionsChange = (questions: VideoQuizQuestion[]) => {
    setQuizData(prev => ({
      ...prev,
      questions,
    }));
  };

  const handleSaveQuiz = async () => {
    // Validation
    if (!quizData.title || quizData.title.trim() === '') {
      toast.error('Quiz title is required');
      return;
    }

    if (!quizData.sportId || quizData.sportId.trim() === '') {
      toast.error('Sport is required', {
        description: 'Every video quiz must be associated with a sport',
      });
      return;
    }

    if (!quizData.skillId || quizData.skillId.trim() === '') {
      toast.error('Skill is required', {
        description: 'Every video quiz must be associated with a skill',
      });
      return;
    }

    if (!quizData.videoUrl || quizData.videoUrl.trim() === '') {
      toast.error('Video URL is required');
      return;
    }

    // Allow saving without duration for Google Drive videos (will be detected during playback)
    // if (!quizData.videoDuration || quizData.videoDuration <= 0) {
    //   toast.warning('Video duration not set', {
    //     description: 'Duration will be detected when the video loads',
    //   });
    // }

    if (!quizData.questions || quizData.questions.length === 0) {
      toast.error('At least one question is required');
      return;
    }

    try {
      setSaveLoading(true);

      const quizToCreate = {
        title: quizData.title,
        description: quizData.description || '',
        videoUrl: quizData.videoUrl,
        videoDuration: quizData.videoDuration,
        sportId: quizData.sportId,
        skillId: quizData.skillId,
        instructions: quizData.instructions || '',
        difficulty: quizData.difficulty!,
        tags: quizData.tags || [],
        isActive: quizData.isActive || false,
        isPublished: quizData.isPublished || false,
        questions: quizData.questions,
        settings: quizData.settings!,
      };

      const result = await videoQuizService.createVideoQuiz(quizToCreate);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create video quiz');
      }

      toast.success('Video quiz created successfully!');
      router.push(`/admin/quizzes`);
    } catch (error) {
      console.error('Error creating video quiz:', error);
      toast.error('Failed to create video quiz', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredSkills = skills.filter(skill =>
    !quizData.sportId || skill.sportId === quizData.sportId
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/quizzes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Video Quiz</h1>
          <p className="text-gray-600 mt-1">
            Create an interactive video quiz with timestamp-based questions
          </p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="video">Video Setup</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  value={quizData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter quiz title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={quizData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this video quiz covers"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={quizData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Instructions for quiz takers (optional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sport">Sport *</Label>
                  <Select
                    value={quizData.sportId || ''}
                    onValueChange={(value) => handleInputChange('sportId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Required</p>
                </div>

                <div>
                  <Label htmlFor="skill">Skill *</Label>
                  <Select
                    value={quizData.skillId || ''}
                    onValueChange={(value) => handleInputChange('skillId', value)}
                    disabled={!quizData.sportId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSkills.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Required</p>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={quizData.difficulty}
                    onValueChange={(value) => handleInputChange('difficulty', value as DifficultyLevel)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={quizData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={quizData.isPublished}
                    onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                  />
                  <Label htmlFor="isPublished">Published</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Setup Tab */}
        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Video className="h-4 w-4" />
                <AlertDescription>
                  Provide a video by entering a URL or uploading a file directly.
                </AlertDescription>
              </Alert>

              {/* Video Input Mode Selector */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <Button
                  variant={uploadMode === 'url' ? 'default' : 'ghost'}
                  className="flex-1"
                  onClick={() => setUploadMode('url')}
                  type="button"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Video URL
                </Button>
                <Button
                  variant={uploadMode === 'upload' ? 'default' : 'ghost'}
                  className="flex-1"
                  onClick={() => setUploadMode('upload')}
                  type="button"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>

              {/* URL Input Mode */}
              {uploadMode === 'url' && (
                <div>
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="videoUrl"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://example.com/video.mp4 or Google Drive link"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => validateVideoUrl(videoUrl)}
                      disabled={!videoUrl || videoValidating}
                      variant="outline"
                      type="button"
                    >
                      {videoValidating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        'Validate'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports direct video URLs, YouTube, Vimeo, and Google Drive links
                  </p>
                </div>
              )}

              {/* File Upload Mode */}
              {uploadMode === 'upload' && (
                <div>
                  <Label htmlFor="videoFile">Upload Video File *</Label>
                  <div className="mt-2">
                    <Input
                      id="videoFile"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileUpload}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum file size: 500MB. Supported formats: MP4, WebM, MOV
                    </p>
                  </div>

                  {uploading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Uploading...</span>
                        <span className="text-sm text-gray-600">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {videoDuration > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Video Validated</p>
                      <p className="text-sm text-green-700">
                        Duration: {Math.floor(videoDuration / 60)}m {videoDuration % 60}s
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="videoDuration">Video Duration (seconds)</Label>
                <Input
                  id="videoDuration"
                  type="number"
                  value={videoDuration}
                  onChange={(e) => {
                    const duration = parseInt(e.target.value);
                    setVideoDuration(duration);
                    setQuizData(prev => ({ ...prev, videoDuration: duration }));
                  }}
                  placeholder="Auto-detected from video"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is auto-detected. Only modify if detection fails.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          {videoDuration > 0 ? (
            <VideoQuestionBuilder
              questions={quizData.questions || []}
              videoDuration={videoDuration}
              onChange={handleQuestionsChange}
            />
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Video Setup Required</h3>
                <p className="text-gray-600 mb-4">
                  Please configure and validate your video first before adding questions
                </p>
                <Button variant="outline" onClick={() => document.getElementById('video-tab')?.click()}>
                  Go to Video Setup
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="passingScore">Passing Score (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={quizData.settings?.passingScore}
                    onChange={(e) => handleSettingsChange('passingScore', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="1"
                    value={quizData.settings?.maxAttempts}
                    onChange={(e) => handleSettingsChange('maxAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Player Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'showExplanations', label: 'Show Explanations' },
                    { key: 'allowPause', label: 'Allow Video Pause' },
                    { key: 'allowSkip', label: 'Allow Question Skip' },
                    { key: 'allowSpeedControl', label: 'Allow Speed Control' },
                    { key: 'autoPlayNext', label: 'Auto-play After Answer' },
                    { key: 'showProgress', label: 'Show Progress Indicator' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={key}
                        checked={quizData.settings?.[key as keyof VideoQuizSettings] as boolean}
                        onCheckedChange={(checked) => handleSettingsChange(key, checked)}
                      />
                      <Label htmlFor={key}>{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <Link href="/admin/quizzes">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSaveQuiz} disabled={saveLoading}>
          {saveLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Video Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function CreateVideoQuizPage() {
  return (
    <AdminRoute>
      <CreateVideoQuizContent />
    </AdminRoute>
  );
}
