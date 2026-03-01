'use client';

import React, { useState } from 'react';
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
import {
  PlayCircle,
  Plus,
  X,
  Loader2,
  Save,
  Clock,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { VideoUploader } from './video-uploader';
import { VideoQuestionBuilder } from '@/components/admin/VideoQuestionBuilder';
import { customContentService } from '@/lib/database';
import { videoQuizService } from '@/lib/database';
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
  editContent?: CustomContentLibrary;
}

export function QuizCreator({
  open,
  onOpenChange,
  coachId,
  onSave,
  editContent,
}: QuizCreatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [questions, setQuestions] = useState<VideoQuizQuestion[]>([]);
  const [settings, setSettings] = useState<VideoQuizSettings>(defaultSettings);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [step, setStep] = useState<'info' | 'video' | 'questions'>('info');

  // Form state
  const [title, setTitle] = useState(editContent?.title || '');
  const [description, setDescription] = useState(editContent?.description || '');
  const [difficulty, setDifficulty] = useState<'introduction' | 'development' | 'refinement'>('introduction');
  const [videoUrl, setVideoUrl] = useState(editContent?.videoUrl || '');
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [isPublic, setIsPublic] = useState(editContent?.isPublic || false);
  const [tags, setTags] = useState<string[]>(editContent?.tags || []);
  const [newTag, setNewTag] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!editContent;

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

  const canProceedToQuestions = () => {
    return videoUrl && videoDuration > 0;
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
      setStep('info');
      return;
    }

    if (!videoUrl) {
      toast.error('Please add a video');
      setStep('video');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total points
      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0);
      const estimatedDuration = Math.ceil(videoDuration / 60) + Math.ceil(questions.length * 0.5);

      // Create the quiz in video_quizzes collection (shared with admin quizzes)
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
        sportId: 'coach-custom', // Custom sport ID for coach content
        skillId: 'coach-custom', // Custom skill ID for coach content
        createdBy: coachId,
        source: 'coach', // Mark as coach-created
        metadata: {
          totalAttempts: 0,
          totalCompletions: 0,
          averageScore: 0,
          averageTimeSpent: 0,
          averageCompletionTime: 0,
          dropOffPoints: [],
        },
      };

      // Create quiz in video_quizzes collection
      const quizResult = await videoQuizService.createQuiz(quizData);

      if (!quizResult.success) {
        throw new Error(quizResult.error?.message || 'Failed to create quiz');
      }

      // Also save reference in custom content library for coach's library view
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

      if (contentResult.success && contentResult.data) {
        toast.success('Quiz created successfully');
        onSave(contentResult.data);
        onOpenChange(false);
        resetForm();
      } else {
        throw new Error(contentResult.error?.message || 'Failed to save quiz to library');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save quiz';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDifficulty('introduction');
    setVideoUrl('');
    setQuestions([]);
    setSettings(defaultSettings);
    setVideoDuration(0);
    setTags([]);
    setStep('info');
    setShowSettingsPanel(false);
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  const renderSettingsPanel = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Quiz Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label>Allow Playback Speed Change</Label>
            <Switch
              checked={settings.allowPlaybackSpeedChange}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowPlaybackSpeedChange: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Allow Rewind</Label>
            <Switch
              checked={settings.allowRewind}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowRewind: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Allow Skip Ahead</Label>
            <Switch
              checked={settings.allowSkipAhead}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowSkipAhead: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Require Sequential Answers</Label>
            <Switch
              checked={settings.requireSequentialAnswers}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, requireSequentialAnswers: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Progress Bar</Label>
            <Switch
              checked={settings.showProgressBar}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showProgressBar: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Correct Answers</Label>
            <Switch
              checked={settings.showCorrectAnswers}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showCorrectAnswers: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Explanations</Label>
            <Switch
              checked={settings.showExplanations}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showExplanations: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-Play Next</Label>
            <Switch
              checked={settings.autoPlayNext}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoPlayNext: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep = () => {
    switch (step) {
      case 'info':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                placeholder="Enter quiz title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this quiz covers"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="introduction">Introduction</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="refinement">Refinement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
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

            {/* Library Options */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Save to Library</Label>
                  <p className="text-xs text-muted-foreground">
                    Save this quiz to your content library for reuse
                  </p>
                </div>
                <Switch
                  checked={saveToLibrary}
                  onCheckedChange={setSaveToLibrary}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Make Public</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow other coaches to use this quiz
                  </p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => {
                if (validate()) {
                  setStep('video');
                }
              }}>
                Next: Add Video
              </Button>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Quiz Video *</Label>
              <p className="text-sm text-muted-foreground">
                Upload or add a video URL. Questions will be added at specific timestamps.
              </p>
              <VideoUploader
                coachId={coachId}
                onVideoUploaded={handleVideoUploaded}
                initialVideoUrl={videoUrl}
              />
            </div>

            {videoDuration > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Video duration: {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setShowSettingsPanel(!showSettingsPanel)}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              {showSettingsPanel ? 'Hide Quiz Settings' : 'Configure Quiz Settings'}
            </Button>

            {showSettingsPanel && renderSettingsPanel()}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('info')}>
                Back
              </Button>
              <Button
                onClick={() => setStep('questions')}
                disabled={!canProceedToQuestions()}
              >
                Next: Add Questions
              </Button>
            </div>
          </div>
        );

      case 'questions':
        return (
          <div className="space-y-6">
            {!videoUrl ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <p className="text-muted-foreground">Please add a video first</p>
                <Button variant="outline" onClick={() => setStep('video')} className="mt-4">
                  Go Back to Video
                </Button>
              </div>
            ) : (
              <>
                <VideoQuestionBuilder
                  questions={questions}
                  videoDuration={videoDuration}
                  videoUrl={videoUrl}
                  onChange={setQuestions}
                />

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setStep('video')}>
                    Back to Video
                  </Button>
                  <div className="flex gap-2">
                    <span className="text-sm text-muted-foreground self-center mr-2">
                      {questions.length} question{questions.length !== 1 ? 's' : ''} added
                    </span>
                    <Button
                      onClick={onSubmit}
                      disabled={isSubmitting || questions.length === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'info':
        return 'Quiz Information';
      case 'video':
        return 'Add Video';
      case 'questions':
        return 'Add Questions';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            {isEditing ? 'Edit Video Quiz' : 'Create Video Quiz'}
          </DialogTitle>
          <DialogDescription>
            Create an interactive video quiz with questions at specific timestamps.
          </DialogDescription>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 pt-4">
            {['info', 'video', 'questions'].map((s, index) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step === s
                      ? 'bg-primary text-primary-foreground'
                      : index < ['info', 'video', 'questions'].indexOf(step)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div
                    className={`flex-1 h-1 ${
                      index < ['info', 'video', 'questions'].indexOf(step)
                        ? 'bg-green-500'
                        : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Step {['info', 'video', 'questions'].indexOf(step) + 1}: {getStepTitle()}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {renderStep()}
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
