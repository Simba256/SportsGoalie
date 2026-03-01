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
import {
  BookOpen,
  Plus,
  X,
  Loader2,
  Save,
  Clock,
  Target,
  Tag,
  Paperclip,
  Upload,
} from 'lucide-react';
import { VideoUploader } from './video-uploader';
import { customContentService } from '@/lib/database';
import { toast } from 'sonner';
import { CustomContentLibrary } from '@/types';

interface LessonCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
  onSave: (content: CustomContentLibrary) => void;
  editContent?: CustomContentLibrary;
}

export function LessonCreator({
  open,
  onOpenChange,
  coachId,
  onSave,
  editContent,
}: LessonCreatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | undefined>();
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

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!editContent;

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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
          </DialogTitle>
          <DialogDescription>
            Create a custom lesson with video content, learning objectives, and attachments.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <form onSubmit={onSubmit} className="space-y-6">
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

        <DialogFooter className="flex-shrink-0 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || uploadingAttachments}
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
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
