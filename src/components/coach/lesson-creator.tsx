'use client';

import React, { useState, useEffect } from 'react';
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
import {
  BookOpen,
  Plus,
  X,
  Loader2,
  Save,
  ArrowRight,
  Clock,
  Target,
  Tag,
  Paperclip,
  Upload,
} from 'lucide-react';
import { VideoUploader } from './video-uploader';
import { customContentService, sportsService } from '@/lib/database';
import { toast } from 'sonner';
import { CustomContentLibrary, Sport, Skill } from '@/types';

interface StudentGapInfo {
  categoryName: string;
  categorySlug: string;
  priority: 'high' | 'medium' | 'low';
  suggestedContent: string[];
}

interface LessonCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
  onSave: (content: CustomContentLibrary) => void;
  editContent?: CustomContentLibrary;
  studentGaps?: StudentGapInfo[];
}

export function LessonCreator({
  open,
  onOpenChange,
  coachId,
  onSave,
  editContent,
  studentGaps,
}: LessonCreatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_videoDuration, setVideoDuration] = useState<number | undefined>();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  // Form state
  const [title, setTitle] = useState(editContent?.title || '');
  const [description, setDescription] = useState(editContent?.description || '');
  const [content, setContent] = useState(editContent?.content || '');
  const [videoUrl, setVideoUrl] = useState(editContent?.videoUrl || '');
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState(
    editContent?.estimatedTimeMinutes || 15
  );
  const [learningObjectives, setLearningObjectives] = useState<string[]>(
    editContent?.learningObjectives || []
  );
  const [tags, setTags] = useState<string[]>(editContent?.tags || []);
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [isPublic, setIsPublic] = useState(editContent?.isPublic || false);
  const [newObjective, setNewObjective] = useState('');
  const [newTag, setNewTag] = useState('');

  // Pillar & skill selection
  const [pillars, setPillars] = useState<Sport[]>([]);
  const [pillarSkills, setPillarSkills] = useState<Skill[]>([]);
  const [selectedPillarId, setSelectedPillarId] = useState(editContent?.pillarId || '');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [loadingPillars, setLoadingPillars] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!editContent;

  // Load pillars when dialog opens
  useEffect(() => {
    if (!open) return;
    const loadPillars = async () => {
      setLoadingPillars(true);
      try {
        const result = await sportsService.getAllSports({ limit: 10 });
        if (result.success && result.data) {
          setPillars(result.data.items.sort((a, b) => a.order - b.order));
        }
      } catch { /* non-blocking */ }
      finally { setLoadingPillars(false); }
    };
    loadPillars();
  }, [open]);

  // Load skills when pillar changes
  useEffect(() => {
    if (!selectedPillarId) { setPillarSkills([]); return; }
    const loadSkills = async () => {
      setLoadingSkills(true);
      try {
        const result = await sportsService.getSkillsBySport(selectedPillarId);
        if (result.success && result.data) {
          setPillarSkills(result.data.items.filter(s => s.isActive));
        }
      } catch { /* non-blocking */ }
      finally { setLoadingSkills(false); }
    };
    loadSkills();
  }, [selectedPillarId]);

  const applyGapSuggestion = (gap: StudentGapInfo) => {
    if (!title) setTitle(`${gap.categoryName} — Targeted Lesson`);
    const newTags = [...tags];
    if (!newTags.includes(gap.categorySlug)) newTags.push(gap.categorySlug);
    if (!newTags.includes(gap.priority)) newTags.push(gap.priority + '-priority');
    setTags(newTags);
    if (gap.suggestedContent.length > 0 && learningObjectives.length === 0) {
      setLearningObjectives(gap.suggestedContent.slice(0, 3));
    }
  };

  const handleVideoUploaded = (url: string, duration?: number) => {
    setVideoUrl(url);
    if (duration) {
      setVideoDuration(duration);
      // Auto-calculate estimated time based on video duration
      setEstimatedTimeMinutes(Math.ceil(duration / 60));
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setLearningObjectives([...learningObjectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
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

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments((prev) => [...prev, ...newFiles].slice(0, 5)); // Max 5 attachments
    }
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim() || title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!description.trim() || description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (estimatedTimeMinutes < 1 || estimatedTimeMinutes > 180) {
      newErrors.estimatedTime = 'Estimated time must be between 1 and 180 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare content data
      const contentData = {
        title: title.trim(),
        description: description.trim(),
        type: 'lesson' as const,
        content: content.trim(),
        videoUrl,
        attachments,
        estimatedTimeMinutes,
        learningObjectives,
        tags,
        isPublic,
        pillarId: selectedPillarId || undefined,
        // Use levelId to store linked skill ID for curriculum/skill-page association.
        levelId: selectedSkillId || undefined,
      };

      let result;
      if (isEditing && editContent) {
        result = await customContentService.updateContent(
          editContent.id,
          {
            title: title.trim(),
            description: description.trim(),
            content: content.trim(),
            videoUrl,
            estimatedTimeMinutes,
            learningObjectives,
            tags,
            isPublic,
          },
          coachId
        );

        if (result.success) {
          toast.success('Lesson updated successfully');
          onSave({ ...editContent, ...contentData, attachments: [] });
        }
      } else {
        result = await customContentService.createContent(coachId, contentData);

        if (result.success && result.data) {
          toast.success('Lesson created successfully');
          onSave(result.data);
        }
      }

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to save lesson');
      }

      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save lesson';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setUploadingAttachments(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form
      setTitle(editContent?.title || '');
      setDescription(editContent?.description || '');
      setContent(editContent?.content || '');
      setVideoUrl(editContent?.videoUrl || '');
      setEstimatedTimeMinutes(editContent?.estimatedTimeMinutes || 15);
      setLearningObjectives(editContent?.learningObjectives || []);
      setTags(editContent?.tags || []);
      setAttachments([]);
      setNewObjective('');
      setNewTag('');
      setVideoDuration(undefined);
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border-0 bg-white shadow-2xl rounded-2xl p-0 gap-0">
        <DialogHeader className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 bg-red-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300 mb-2">Curriculum</p>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
              <BookOpen className="h-5 w-5" />
            </span>
            {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-1.5 text-sm">
              Create a custom lesson with video content, learning objectives, and attachments.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Gap Suggestions Panel */}
        {studentGaps && studentGaps.length > 0 && !isEditing && (
          <div className="flex-shrink-0 rounded-lg border border-blue-200 bg-blue-50 p-4 mx-8 mt-6">
            <p className="text-xs font-semibold text-blue-800 mb-2">
              Student needs help with:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {studentGaps.map((gap) => (
                <button
                  key={gap.categorySlug}
                  type="button"
                  onClick={() => applyGapSuggestion(gap)}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                    gap.priority === 'high'
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : gap.priority === 'medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {gap.categoryName}
                  <span className="text-[9px] opacity-70">({gap.priority})</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-blue-600 mt-1.5">
              Click a gap area to pre-fill lesson title, tags, and objectives.
            </p>
          </div>
        )}

        <ScrollArea className="flex-1">
          <form onSubmit={onSubmit} className="space-y-6 px-8 py-8">
            {/* Pillar & Skill Association */}
            <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
              <p className="text-xs font-semibold text-blue-800">Assign to Pillar & Skill</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Pillar</Label>
                  <select
                    value={selectedPillarId}
                    onChange={(e) => { setSelectedPillarId(e.target.value); setSelectedSkillId(''); }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    disabled={loadingPillars}
                  >
                    <option value="">Select a pillar...</option>
                    {pillars.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Skill (optional)</Label>
                  <select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    disabled={!selectedPillarId || loadingSkills}
                  >
                    <option value="">Select a skill...</option>
                    {pillarSkills.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-blue-600">
                Linking to a pillar/skill ensures this content appears in the goalie&apos;s skill page.
              </p>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter lesson title"
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
                  placeholder="Describe what students will learn in this lesson"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <Label>Video (Optional)</Label>
              <VideoUploader
                coachId={coachId}
                onVideoUploaded={handleVideoUploaded}
                initialVideoUrl={videoUrl}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Lesson Content (Optional)</Label>
              <p className="text-xs text-muted-foreground">
                Add written content, instructions, or notes for this lesson
              </p>
              <Textarea
                id="content"
                placeholder="Add lesson content, instructions, or notes..."
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* Estimated Time */}
            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Estimated Time (minutes)
              </Label>
              <Input
                id="estimatedTime"
                type="number"
                min={1}
                max={180}
                value={estimatedTimeMinutes}
                onChange={(e) => setEstimatedTimeMinutes(parseInt(e.target.value) || 15)}
              />
              {errors.estimatedTime && (
                <p className="text-sm text-destructive">{errors.estimatedTime}</p>
              )}
            </div>

            {/* Learning Objectives */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Learning Objectives (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a learning objective"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addObjective();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addObjective}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {learningObjectives.length > 0 && (
                <ul className="space-y-2 mt-2">
                  {learningObjectives.map((objective, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 p-2 bg-muted rounded-lg"
                    >
                      <span className="flex-1 text-sm">{objective}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeObjective(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags (Optional)
              </Label>
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

            {/* Attachments */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Attachments (Optional)
              </Label>
              <p className="text-xs text-muted-foreground">
                Add PDFs, documents, or images (max 5 files, 25MB each)
              </p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    {file.name}
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {attachments.length < 5 && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                      onChange={handleAddAttachment}
                      className="hidden"
                      multiple
                    />
                    <Badge
                      variant="outline"
                      className="gap-1 cursor-pointer hover:bg-accent"
                    >
                      <Upload className="h-3 w-3" />
                      Add File
                    </Badge>
                  </label>
                )}
              </div>
            </div>

            {/* Library Options */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Save to Library</Label>
                  <p className="text-xs text-muted-foreground">
                    Save this lesson to your content library for reuse
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
                    Allow other coaches to use this lesson
                  </p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </div>
          </form>
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
            disabled={isSubmitting || uploadingAttachments}
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploadingAttachments ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Lesson' : 'Create Lesson'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
