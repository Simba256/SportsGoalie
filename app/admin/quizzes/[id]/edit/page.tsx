'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { AdminRoute } from '@/components/auth/protected-route';
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

function EditVideoQuizContent() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [originalQuiz, setOriginalQuiz] = useState<VideoQuiz | null>(null);
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
          structuredTags: quiz.structuredTags || createEmptyStructuredTags(),
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

  // Handle video uploaded from VideoUploader component
  const handleVideoUploaded = (url: string, duration?: number) => {
    setQuizData(prev => ({
      ...prev,
      videoUrl: url,
      videoDuration: duration || prev.videoDuration || 1,
    }));
    if (duration) {
      setVideoDuration(duration);
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
        structuredTags: quizData.structuredTags,
        isActive: quizData.isActive || false,
        isPublished: quizData.isPublished || false,
        questions: quizData.questions,
        settings: quizData.settings!,
      };

      // Debug logging
      console.log('🔍 [EditQuiz] Attempting update with data:', {
        quizId,
        questionsCount: updates.questions?.length,
        settings: updates.settings,
        videoDuration: updates.videoDuration,
      });

      const result = await videoQuizService.updateVideoQuiz(quizId, updates);

      console.log('📊 [EditQuiz] Update result:', {
        success: result.success,
        error: result.error,
      });

      if (!result.success) {
        console.error('❌ [EditQuiz] Update failed:', result.error);
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
      <div className="min-h-screen p-6">
        <SkeletonContentPage />
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
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
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
          <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
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
        <TabsList className="grid w-full grid-cols-5 rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Basic Info</TabsTrigger>
          <TabsTrigger value="video" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Video Setup</TabsTrigger>
          <TabsTrigger value="questions" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Questions</TabsTrigger>
          <TabsTrigger value="tags" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Tags</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">Settings</TabsTrigger>
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

              <VideoUploader
                uploadFolder="video-quizzes"
                onVideoUploaded={handleVideoUploaded}
                initialVideoUrl={quizData.videoUrl}
              />

              {/* Manual duration override */}
              <div className="pt-4 border-t">
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
                  className="max-w-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Duration is auto-detected for most videos. Override here if needed.
                </p>
              </div>
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

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-6">
          <VideoTagEditor
            value={quizData.structuredTags}
            onChange={handleStructuredTagsChange}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
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
