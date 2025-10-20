'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { ArrowLeft, Save, Loader2, Video, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { VideoQuestionBuilder } from '@/components/admin/VideoQuestionBuilder';
import { Alert, AlertDescription } from '@/components/ui/alert';

function EditVideoQuizContent() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [originalQuiz, setOriginalQuiz] = useState<VideoQuiz | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoValidating, setVideoValidating] = useState(false);

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
    loadInitialData();
  }, [quizId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load quiz data, sports, and skills in parallel
      const [quizResult, sportsResult, skillsResult] = await Promise.all([
        videoQuizService.getVideoQuiz(quizId),
        sportsService.getAllSports(),
        sportsService.getAllSkills(),
      ]);

      if (quizResult.success && quizResult.data) {
        const quiz = quizResult.data;
        setOriginalQuiz(quiz);
        setVideoUrl(quiz.videoUrl);
        setVideoDuration(quiz.videoDuration);
        setQuizData({
          title: quiz.title,
          description: quiz.description || '',
          sportId: quiz.sportId,
          skillId: quiz.skillId,
          videoUrl: quiz.videoUrl,
          videoDuration: quiz.videoDuration,
          instructions: quiz.instructions || '',
          difficulty: quiz.difficulty,
          tags: quiz.tags || [],
          isActive: quiz.isActive,
          isPublished: quiz.isPublished,
          questions: quiz.questions,
          settings: quiz.settings,
        });
      } else {
        toast.error('Video quiz not found');
        router.push('/admin/quizzes');
        return;
      }

      if (sportsResult.success && sportsResult.data) {
        setSports(sportsResult.data.items);
      }

      if (skillsResult.success && skillsResult.data) {
        setSkills(skillsResult.data.items);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load video quiz data');
      router.push('/admin/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const validateVideoUrl = async (url: string) => {
    if (!url) {
      setVideoDuration(0);
      return;
    }

    setVideoValidating(true);
    try {
      // Create a video element to validate and get duration
      const video = document.createElement('video');
      video.src = url;
      video.preload = 'metadata';

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
            setVideoDuration(Math.floor(video.duration));
            setQuizData(prev => ({
              ...prev,
              videoUrl: url,
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
        video.onerror = () => reject(new Error('Failed to load video'));
      });
    } catch (error) {
      console.error('Video validation error:', error);
      toast.error('Failed to validate video', {
        description: 'Please check the video URL and try again',
      });
      setVideoDuration(0);
    } finally {
      setVideoValidating(false);
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

    if (!quizData.videoDuration || quizData.videoDuration <= 0) {
      toast.error('Video duration is invalid', {
        description: 'Please validate the video URL first',
      });
      return;
    }

    if (!quizData.questions || quizData.questions.length === 0) {
      toast.error('At least one question is required');
      return;
    }

    try {
      setSaveLoading(true);

      const updates = {
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

      const result = await videoQuizService.updateVideoQuiz(quizId, updates);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update video quiz');
      }

      toast.success('Video quiz updated successfully!');
      router.push('/admin/quizzes');
    } catch (error) {
      console.error('Error updating video quiz:', error);
      toast.error('Failed to update video quiz', {
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
          <p className="mt-4 text-gray-600">Loading video quiz...</p>
        </div>
      </div>
    );
  }

  if (!originalQuiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg text-gray-700 mb-4">Video quiz not found</p>
            <Link href="/admin/quizzes">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quizzes
              </Button>
            </Link>
          </CardContent>
        </Card>
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
          <h1 className="text-3xl font-bold">Edit Video Quiz</h1>
          <p className="text-gray-600 mt-1">{originalQuiz.title}</p>
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
                  Be careful when changing the video URL - it may affect existing question timestamps!
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="videoUrl">Video URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => validateVideoUrl(videoUrl)}
                    disabled={!videoUrl || videoValidating}
                    variant="outline"
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
                  Current: {quizData.videoUrl}
                </p>
              </div>

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
                  Current: {quizData.videoDuration}s
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
                <h3 className="text-lg font-semibold mb-2">Video Not Validated</h3>
                <p className="text-gray-600 mb-4">
                  Please validate your video in the Video Setup tab before editing questions
                </p>
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
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function EditVideoQuizPage() {
  return (
    <AdminRoute>
      <EditVideoQuizContent />
    </AdminRoute>
  );
}
