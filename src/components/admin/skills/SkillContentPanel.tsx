'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  ExternalLink,
  Video,
  FileText,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { HTMLEditorWithAI } from '@/components/ui/html-editor-with-ai';
import { useDeleteConfirmation } from '@/components/ui/confirmation-dialog';
import { Lesson, LessonStatus, Skill, VideoQuiz } from '@/types';
import { lessonService } from '@/lib/database/services/lesson.service';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';

interface SkillContentPanelProps {
  skill: Skill;
  adminUserId: string;
  /** Optional hook fired when lesson/quiz counts change so the parent can refresh its badge. */
  onCountsChange?: (counts: { lessons: number; quizzes: number }) => void;
}

interface LessonFormState {
  title: string;
  description: string;
  content: string;
  estimatedTimeMinutes: number;
  order: number;
  status: LessonStatus;
  isActive: boolean;
  tags: string;
}

const defaultForm = (order = 0): LessonFormState => ({
  title: '',
  description: '',
  content: '',
  estimatedTimeMinutes: 15,
  order,
  status: 'published',
  isActive: true,
  tags: '',
});

/**
 * Inline content-management panel rendered inside a skill card on
 * `/admin/pillars/[id]/skills`. Lists and CRUDs lessons, and links out to
 * quiz management (quizzes are authored in /admin/quizzes/*).
 */
export function SkillContentPanel({ skill, adminUserId, onCountsChange }: SkillContentPanelProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<VideoQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<LessonFormState>(defaultForm());
  const [saving, setSaving] = useState(false);

  const { dialog, showDeleteConfirmation, setLoading: setDialogLoading } = useDeleteConfirmation();

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonsResult, quizzesResult] = await Promise.all([
        lessonService.getAllLessonsBySkillForAdmin(skill.id),
        videoQuizService.getVideoQuizzesBySkill(skill.id),
      ]);
      const nextLessons = lessonsResult.success ? lessonsResult.data?.items ?? [] : [];
      const nextQuizzes = quizzesResult.success ? quizzesResult.data?.items ?? [] : [];
      setLessons(nextLessons);
      setQuizzes(nextQuizzes);
      onCountsChange?.({ lessons: nextLessons.length, quizzes: nextQuizzes.length });
    } catch (err) {
      console.error('Failed to load skill content:', err);
      toast.error('Failed to load lessons and quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill.id]);

  const handleEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setShowCreate(false);
    setForm({
      title: lesson.title,
      description: lesson.description ?? '',
      content: lesson.content,
      estimatedTimeMinutes: lesson.estimatedTimeMinutes,
      order: lesson.order,
      status: lesson.status,
      isActive: lesson.isActive,
      tags: (lesson.tags ?? []).join(', '),
    });
  };

  const handleCreate = () => {
    setEditingId(null);
    setShowCreate(true);
    setForm(defaultForm(lessons.length));
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowCreate(false);
    setForm(defaultForm());
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.content.trim()) {
      toast.error('Lesson content is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        skillId: skill.id,
        sportId: skill.sportId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        content: form.content,
        estimatedTimeMinutes: Math.max(1, form.estimatedTimeMinutes),
        order: form.order,
        isActive: form.isActive,
        status: form.status,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        createdBy: adminUserId,
      };

      let result;
      if (editingId) {
        result = await lessonService.updateLesson(editingId, payload);
      } else {
        result = await lessonService.createLesson(payload);
      }

      if (result.success) {
        toast.success(editingId ? 'Lesson updated' : 'Lesson created');
        handleCancel();
        await loadData();
      } else {
        toast.error(result.error?.message || 'Failed to save lesson');
      }
    } catch (err) {
      console.error('Failed to save lesson:', err);
      toast.error('Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (lesson: Lesson) => {
    showDeleteConfirmation({
      title: 'Delete lesson',
      description: `Delete "${lesson.title}"? Goalie progress records for this lesson will not be removed, but the lesson will no longer be visible.`,
      itemName: 'lesson',
      onConfirm: async () => {
        setDialogLoading(true);
        try {
          const result = await lessonService.deleteLesson(lesson.id);
          if (result.success) {
            toast.success('Lesson deleted');
            await loadData();
          } else {
            toast.error(result.error?.message || 'Failed to delete lesson');
          }
        } catch (err) {
          console.error('Failed to delete lesson:', err);
          toast.error('Failed to delete lesson');
        } finally {
          setDialogLoading(false);
        }
      },
    });
  };

  const isFormOpen = showCreate || editingId !== null;

  return (
    <div className="mt-4 space-y-5 border-t border-border pt-4">
      {/* Lessons section */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              Lessons {loading ? '' : `(${lessons.length})`}
            </h4>
          </div>
          {!isFormOpen && (
            <Button size="sm" variant="outline" onClick={handleCreate}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add lesson
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : lessons.length === 0 && !isFormOpen ? (
          <p className="text-xs text-muted-foreground">
            No lessons yet. Add study material goalies read alongside the quiz.
          </p>
        ) : null}

        {lessons.length > 0 && (
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                    <Badge variant={lesson.status === 'published' ? 'default' : 'outline'} className="text-[10px]">
                      {lesson.status}
                    </Badge>
                    {!lesson.isActive && (
                      <Badge variant="secondary" className="text-[10px]">
                        inactive
                      </Badge>
                    )}
                  </div>
                  {lesson.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{lesson.description}</p>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.estimatedTimeMinutes} min
                    </span>
                    <span>order {lesson.order}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(lesson)} title="Edit lesson">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(lesson)}
                    title="Delete lesson"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline create/edit form */}
        {isFormOpen && (
          <Card className="mt-3 border-primary/30">
            <CardContent className="space-y-4 pt-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor={`lesson-title-${skill.id}`}>Title</Label>
                  <Input
                    id={`lesson-title-${skill.id}`}
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Mental reset after a goal"
                  />
                </div>
                <div>
                  <Label htmlFor={`lesson-time-${skill.id}`}>Estimated time (minutes)</Label>
                  <Input
                    id={`lesson-time-${skill.id}`}
                    type="number"
                    min={1}
                    value={form.estimatedTimeMinutes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, estimatedTimeMinutes: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`lesson-order-${skill.id}`}>Display order</Label>
                  <Input
                    id={`lesson-order-${skill.id}`}
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor={`lesson-status-${skill.id}`}>Status</Label>
                  <select
                    id={`lesson-status-${skill.id}`}
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as LessonStatus }))}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor={`lesson-desc-${skill.id}`}>Short description</Label>
                <textarea
                  id={`lesson-desc-${skill.id}`}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="One-line description shown in lesson lists"
                  className="min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>

              <HTMLEditorWithAI
                label="Lesson body"
                value={form.content}
                onChange={(content) => setForm((p) => ({ ...p, content }))}
                placeholder="Write the lesson body in HTML…"
                skillName={skill.name}
                description={skill.description}
                difficulty={skill.difficulty}
                objectives={skill.learningObjectives}
              />

              <div>
                <Label htmlFor={`lesson-tags-${skill.id}`}>Tags (comma-separated)</Label>
                <Input
                  id={`lesson-tags-${skill.id}`}
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="fundamentals, reset, technique"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="rounded"
                />
                <span>Active (visible to goalies)</span>
              </label>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {saving ? 'Saving…' : editingId ? 'Update lesson' : 'Create lesson'}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Quizzes section */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-accent" />
            <h4 className="text-sm font-semibold text-foreground">
              Video quizzes {loading ? '' : `(${quizzes.length})`}
            </h4>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/admin/quizzes/create?skillId=${skill.id}&sportId=${skill.sportId}`}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add quiz
            </Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : quizzes.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No video quizzes linked to this skill yet.
          </p>
        ) : (
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Video className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <p className="text-sm font-medium text-foreground truncate">{quiz.title}</p>
                    <Badge variant={quiz.isPublished ? 'default' : 'outline'} className="text-[10px]">
                      {quiz.isPublished ? 'published' : 'draft'}
                    </Badge>
                  </div>
                  {quiz.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{quiz.description}</p>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{quiz.questions?.length ?? 0} questions</span>
                    {typeof quiz.settings?.passingScore === 'number' && (
                      <span>passing {quiz.settings.passingScore}%</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" asChild title="Preview quiz">
                    <Link href={`/quiz/video/${quiz.id}`} target="_blank">
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild title="Edit quiz">
                    <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {dialog}
    </div>
  );
}
