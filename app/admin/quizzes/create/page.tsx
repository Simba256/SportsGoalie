'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
import { sportsService } from '@/lib/database/services/sports.service';
import { Sport, Skill, DifficultyLevel, VideoQuiz, VideoQuizQuestion, VideoQuizSettings, VideoStructuredTags, createEmptyStructuredTags } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoTagEditor } from '@/components/video';
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
import { VideoUploader } from '@/components/coach/video-uploader';

function CreateVideoQuizContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const [quizData, setQuizData] = useState<Partial<VideoQuiz>>({
    title: '',
    description: '',
    sportId: '',
    skillId: '',
    videoUrl: '',
    videoDuration: 0,
    instructions: '',
    difficulty: 'development' as DifficultyLevel,
    tags: [],
    isActive: false,
    isPublished: false,
    questions: [],
    structuredTags: createEmptyStructuredTags(),
    settings: {
      allowPlaybackSpeedChange: true,
      playbackSpeeds: [0.5, 0.75, 1, 1.25, 1.5, 2],
      allowRewind: true,
      allowSkipAhead: false,
      requireSequentialAnswers: false,
      showProgressBar: true,
      autoPlayNext: true,
      showCorrectAnswers: true,
      showExplanations: true,
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

  // Handle video uploaded from VideoUploader component
  const handleVideoUploaded = (url: string, duration?: number) => {
    setQuizData(prev => ({
      ...prev,
      videoUrl: url,
      videoDuration: duration || 1, // Set minimal duration if not detected
    }));
    if (duration) {
      setVideoDuration(duration);
    } else {
      // Set minimal duration so questions tab unlocks
      setVideoDuration(1);
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

  const handleStructuredTagsChange = (structuredTags: VideoStructuredTags) => {
    setQuizData(prev => ({
      ...prev,
      structuredTags,
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

      // Ensure we have a valid user ID
      if (!user || !user.id) {
        toast.error('Authentication error', {
          description: 'Please log in again to create a quiz',
        });
        return;
      }

      const quizToCreate = {
        title: quizData.title,
        description: quizData.description || '',
        videoUrl: quizData.videoUrl,
        videoDuration: quizData.videoDuration ?? 0,
        sportId: quizData.sportId,
        skillId: quizData.skillId,
        instructions: quizData.instructions || '',
        difficulty: quizData.difficulty!,
        tags: quizData.tags || [],
        structuredTags: quizData.structuredTags,
        category: 'Video Quiz', // Default category for video quizzes
        isActive: quizData.isActive || false,
        isPublished: quizData.isPublished || false,
        questions: quizData.questions,
        settings: quizData.settings!,
        estimatedDuration: Math.ceil((quizData.videoDuration || 300) / 60), // Convert seconds to minutes
        createdBy: user.id,
      };

      // DEBUG: Log the quiz data to see what we're sending
      console.log('🔍 Quiz data being sent to service:', {
        quizToCreate,
        videoDuration: quizToCreate.videoDuration,
        videoDurationState: videoDuration,
        estimatedDuration: quizToCreate.estimatedDuration,
        undefinedFields: Object.keys(quizToCreate).filter(key => quizToCreate[key as keyof typeof quizToCreate] === undefined),
        nullFields: Object.keys(quizToCreate).filter(key => quizToCreate[key as keyof typeof quizToCreate] === null),
        settings: quizData.settings,
        questions: quizData.questions,
        questionsCount: quizData.questions?.length,
        questionsIsArray: Array.isArray(quizData.questions),
        firstQuestion: quizData.questions?.[0],
      });

      const result = await videoQuizService.createVideoQuiz(quizToCreate);

      // DEBUG: Log the actual result to see what we got back
      console.log('📬 Result from createVideoQuiz:', {
        result,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : 'null',
        hasSuccess: result && 'success' in result,
        successValue: result?.success,
        successType: typeof result?.success,
      });

      if (!result || typeof result !== 'object') {
        console.error('❌ Invalid result structure:', result);
        throw new Error('Service returned invalid response structure');
      }

      if (!result.success) {
        console.error('❌ Quiz creation failed:', result.error);
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
          <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
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
        <TabsList className="grid w-full grid-cols-5 rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Basic Info</TabsTrigger>
          <TabsTrigger value="video" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Video Setup</TabsTrigger>
          <TabsTrigger value="questions" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Questions</TabsTrigger>
          <TabsTrigger value="tags" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Tags</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Settings</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="border-red-100 shadow-sm">
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
                  className="border-slate-300 focus-visible:ring-red-200"
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
                  className="border-slate-300 focus-visible:ring-red-200"
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
                  className="border-slate-300 focus-visible:ring-red-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sport">Sport *</Label>
                  <Select
                    value={quizData.sportId || ''}
                    onValueChange={(value) => handleInputChange('sportId', value)}
                  >
                    <SelectTrigger className="border-slate-300 focus:ring-red-200">
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
                    <SelectTrigger className="border-slate-300 focus:ring-red-200">
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
                    <SelectTrigger className="border-slate-300 focus:ring-red-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="introduction">Introduction</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="refinement">Refinement</SelectItem>
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
          <Card className="border-red-100 shadow-sm">
            <CardHeader>
              <CardTitle>Video Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50/60 text-blue-900">
                <Video className="h-4 w-4" />
                <AlertDescription>
                  Provide a video by entering a URL or uploading a file. Duration will be automatically detected when you create questions.
                </AlertDescription>
              </Alert>

              <VideoUploader
                userId={user?.id}
                uploadFolder="video-quizzes"
                onVideoUploaded={handleVideoUploaded}
                initialVideoUrl={quizData.videoUrl}
              />

              {/* Manual duration override */}
              {quizData.videoUrl && (
                <div className="pt-4 border-t">
                  <Label htmlFor="videoDuration">Video Duration (seconds)</Label>
                  <Input
                    id="videoDuration"
                    type="number"
                    value={videoDuration || ''}
                    onChange={(e) => {
                      const duration = Number(e.target.value);
                      setVideoDuration(duration);
                      handleInputChange('videoDuration', duration);
                    }}
                    placeholder="Auto-detected or enter manually"
                    min="1"
                    className="max-w-xs border-slate-300 focus-visible:ring-red-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Duration is auto-detected for most videos. Override here if needed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          {videoDuration > 0 && quizData.videoUrl ? (
            <VideoQuestionBuilder
              questions={quizData.questions || []}
              videoDuration={videoDuration}
              videoUrl={quizData.videoUrl}
              onChange={handleQuestionsChange}
            />
          ) : (
            <Card className="border-blue-100 shadow-sm">
              <CardContent className="pt-12 pb-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Video Setup Required</h3>
                <p className="text-gray-600 mb-4">
                  Please add a video URL or upload a video file in the Video Setup tab first
                </p>
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800" onClick={() => document.getElementById('video-tab')?.click()}>
                  Go to Video Setup
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-6">
          <VideoTagEditor
            value={quizData.structuredTags}
            onChange={handleStructuredTagsChange}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border-red-100 shadow-sm">
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Player Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'showExplanations', label: 'Show Explanations' },
                    { key: 'showCorrectAnswers', label: 'Show Correct Answers' },
                    { key: 'allowRewind', label: 'Allow Video Rewind' },
                    { key: 'allowSkipAhead', label: 'Allow Skip Ahead' },
                    { key: 'allowPlaybackSpeedChange', label: 'Allow Speed Control' },
                    { key: 'requireSequentialAnswers', label: 'Require Sequential Answers' },
                    { key: 'autoPlayNext', label: 'Auto-play After Answer' },
                    { key: 'showProgressBar', label: 'Show Progress Bar' },
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
          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">Cancel</Button>
        </Link>
        <Button onClick={handleSaveQuiz} disabled={saveLoading} className="bg-red-600 text-white hover:bg-red-700">
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
