'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  X,
  Loader2,
  Save,
  ArrowRight,
  Clock,
  Settings,
  PlayCircle,
  FileText,
  Video,
  HelpCircle,
} from 'lucide-react';
import { VideoUploader } from '@/components/coach/video-uploader';
import { VideoQuestionBuilder } from '@/components/admin/VideoQuestionBuilder';
import { customContentService, videoQuizService } from '@/lib/database';
import { toast } from 'sonner';
import { VideoQuizQuestion, VideoQuizSettings, CustomContentLibrary } from '@/types';

const defaultSettings: VideoQuizSettings = {
  allowPlaybackSpeedChange: true,
  playbackSpeeds: [0.5, 0.75, 1, 1.25, 1.5, 2],
  allowRewind: true,
  allowSkipAhead: false,
  requireSequentialAnswers: true,
  showProgressBar: true,
  autoPlayNext: true,
  showCorrectAnswers: true,
  showExplanations: true,
};

interface QuizCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
  onSave: (content: CustomContentLibrary) => void;
}

export function QuizCreator({ open, onOpenChange, coachId, onSave }: QuizCreatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [videoDuration, setVideoDuration] = useState(0);
  const [questions, setQuestions] = useState<VideoQuizQuestion[]>([]);
  const [settings, setSettings] = useState<VideoQuizSettings>(defaultSettings);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'introduction' | 'development' | 'refinement'>('introduction');
  const [videoUrl, setVideoUrl] = useState('');
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setIsSubmitting(false);
    setActiveTab('info');
    setVideoDuration(0);
    setQuestions([]);
    setSettings(defaultSettings);
    setTitle('');
    setDescription('');
    setDifficulty('introduction');
    setVideoUrl('');
    setSaveToLibrary(true);
    setIsPublic(false);
    setTags([]);
    setNewTag('');
    setErrors({});
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
    resetForm();
  };

  const handleVideoUploaded = (url: string, duration?: number) => {
    setVideoUrl(url);
    if (duration) {
      setVideoDuration(duration);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim() || title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!description.trim() || description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      setActiveTab('info');
      return;
    }

    if (!videoUrl) {
      toast.error('Please add a video');
      setActiveTab('video');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      setActiveTab('questions');
      return;
    }

    setIsSubmitting(true);

    try {
      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0);
      const estimatedDuration = Math.ceil(videoDuration / 60) + Math.ceil(questions.length * 0.5);

      const quizData = {
        title: title.trim(),
        description: description.trim(),
        videoUrl,
        videoDuration,
        questions,
        settings,
        difficulty,
        estimatedDuration,
        tags,
        isActive: true,
        isPublished: true,
        category: 'coach-content',
        sportId: 'coach-custom',
        skillId: 'coach-custom',
        createdBy: coachId,
        source: 'coach',
        metadata: {
          totalAttempts: 0,
          totalCompletions: 0,
          averageScore: 0,
          averageTimeSpent: 0,
          averageCompletionTime: 0,
          dropOffPoints: [],
        },
      };

      const quizResult = await videoQuizService.createVideoQuiz(quizData);

      if (!quizResult.success) {
        throw new Error(quizResult.error?.message || 'Failed to create quiz');
      }

      if (!saveToLibrary) {
        toast.success('Quiz created successfully');
        onOpenChange(false);
        resetForm();
        return;
      }

      const contentData = {
        title: title.trim(),
        description: description.trim(),
        type: 'quiz' as const,
        content: JSON.stringify({
          videoQuizId: quizResult.data?.id,
          totalPoints,
          questionCount: questions.length,
        }),
        videoUrl,
        tags,
        isPublic,
        estimatedTimeMinutes: estimatedDuration,
      };

      const contentResult = await customContentService.createContent(coachId, contentData);

      if (!contentResult.success || !contentResult.data) {
        throw new Error(contentResult.error?.message || 'Failed to save quiz to library');
      }

      toast.success('Quiz created successfully');
      onSave(contentResult.data);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save quiz';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        handleClose();
      } else {
        onOpenChange(nextOpen);
      }
    }}>
      <DialogContent showCloseButton={false} className="sm:max-w-6xl w-[95vw] h-[90vh] flex flex-col overflow-hidden border-0 bg-white shadow-2xl rounded-2xl p-0 gap-0">
        <DialogHeader className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 bg-red-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300 mb-2">Curriculum</p>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <PlayCircle className="h-7 w-7" />
            Create Video Quiz
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-1.5 text-sm">
              Create an interactive video quiz with questions at specific timestamps
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 px-8 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
              <TabsList className="grid w-full grid-cols-4 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
                <TabsTrigger value="info" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-800">
                  <FileText className="h-4 w-4" />
                  Quiz Info
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-800">
                  <Video className="h-4 w-4" />
                  Video
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-800">
                  <HelpCircle className="h-4 w-4" />
                  Questions
                  {questions.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800 border-blue-200">
                      {questions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-5">
                <Card className="border-zinc-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="quiz-title">Quiz Title *</Label>
                      <Input
                        id="quiz-title"
                        placeholder="Enter quiz title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quiz-description">Description *</Label>
                      <Textarea
                        id="quiz-description"
                        placeholder="Describe what this quiz covers"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Difficulty Level</Label>
                      <Select value={difficulty} onValueChange={(v: 'introduction' | 'development' | 'refinement') => setDifficulty(v)}>
                        <SelectTrigger className="w-full md:w-64">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="introduction">Introduction</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="refinement">Refinement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" onClick={addTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-zinc-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Library Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Save to Library</Label>
                        <p className="text-xs text-muted-foreground">
                          Save this quiz to your content library for reuse
                        </p>
                      </div>
                      <Switch checked={saveToLibrary} onCheckedChange={setSaveToLibrary} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Make Public</Label>
                        <p className="text-xs text-muted-foreground">
                          Allow other coaches to use this quiz
                        </p>
                      </div>
                      <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="video">
                <Card className="border-zinc-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Quiz Video</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Upload or add a video URL. Questions will be added at specific timestamps.
                    </p>
                    <VideoUploader
                      coachId={coachId}
                      onVideoUploaded={handleVideoUploaded}
                      initialVideoUrl={videoUrl}
                    />
                    {videoDuration > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Video duration: {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="questions">
                {!videoUrl ? (
                  <Card className="border-zinc-200 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Video className="h-14 w-14 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Add a Video First</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        Please add a video in the Video tab before creating questions.
                      </p>
                      <Button onClick={() => setActiveTab('video')}>Go to Video Tab</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <VideoQuestionBuilder
                    questions={questions}
                    videoDuration={videoDuration}
                    videoUrl={videoUrl}
                    onChange={setQuestions}
                  />
                )}
              </TabsContent>

              <TabsContent value="settings">
                <Card className="border-zinc-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Quiz Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Playback Speed Change</Label>
                        <p className="text-xs text-muted-foreground">Let students adjust video playback speed</p>
                      </div>
                      <Switch
                        checked={settings.allowPlaybackSpeedChange}
                        onCheckedChange={(checked) => setSettings({ ...settings, allowPlaybackSpeedChange: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Rewind</Label>
                        <p className="text-xs text-muted-foreground">Let students rewind the video</p>
                      </div>
                      <Switch
                        checked={settings.allowRewind}
                        onCheckedChange={(checked) => setSettings({ ...settings, allowRewind: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Skip Ahead</Label>
                        <p className="text-xs text-muted-foreground">Let students skip ahead in the video</p>
                      </div>
                      <Switch
                        checked={settings.allowSkipAhead}
                        onCheckedChange={(checked) => setSettings({ ...settings, allowSkipAhead: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Sequential Answers</Label>
                        <p className="text-xs text-muted-foreground">Students must answer questions in order</p>
                      </div>
                      <Switch
                        checked={settings.requireSequentialAnswers}
                        onCheckedChange={(checked) => setSettings({ ...settings, requireSequentialAnswers: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Progress Bar</Label>
                        <p className="text-xs text-muted-foreground">Display progress through the quiz</p>
                      </div>
                      <Switch
                        checked={settings.showProgressBar}
                        onCheckedChange={(checked) => setSettings({ ...settings, showProgressBar: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Correct Answers</Label>
                        <p className="text-xs text-muted-foreground">Show correct answers after submission</p>
                      </div>
                      <Switch
                        checked={settings.showCorrectAnswers}
                        onCheckedChange={(checked) => setSettings({ ...settings, showCorrectAnswers: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Explanations</Label>
                        <p className="text-xs text-muted-foreground">Show explanations for each answer</p>
                      </div>
                      <Switch
                        checked={settings.showExplanations}
                        onCheckedChange={(checked) => setSettings({ ...settings, showExplanations: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Play Next</Label>
                        <p className="text-xs text-muted-foreground">Automatically continue after answering</p>
                      </div>
                      <Switch
                        checked={settings.autoPlayNext}
                        onCheckedChange={(checked) => setSettings({ ...settings, autoPlayNext: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 px-8 pb-6 pt-4 border-t border-slate-200 bg-white">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-red-600 text-white hover:bg-red-700 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Quiz
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
