'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ArrowLeft,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  Circle,
  Trash2,
  BookOpen,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { userService, sportsService, videoQuizService, customContentService } from '@/lib/database';
import { customCurriculumService } from '@/lib/database';
import { User, CustomCurriculum, CustomCurriculumItem, CustomContentLibrary } from '@/types';
import { toast } from 'sonner';
import { ContentBrowser } from '@/components/coach/content-browser';
import { ContentTypeSelector, ContentType } from '@/components/coach/content-type-selector';
import { LessonCreator } from '@/components/coach/lesson-creator';
import { QuizCreator } from '@/components/coach/quiz-creator';

export default function StudentCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const { user: coach } = useAuth();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<User | null>(null);
  const [curriculum, setCurriculum] = useState<CustomCurriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContentBrowser, setShowContentBrowser] = useState(false);
  const [contentTitles, setContentTitles] = useState<Record<string, string>>({});

  // Quick create states
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showLessonCreator, setShowLessonCreator] = useState(false);
  const [showQuizCreator, setShowQuizCreator] = useState(false);

  useEffect(() => {
    if (studentId && coach?.id) {
      loadData();
    }
  }, [studentId, coach?.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load student
      const studentResult = await userService.getUser(studentId);
      if (!studentResult.success || !studentResult.data) {
        toast.error('Student not found');
        router.push('/coach/students');
        return;
      }

      // Verify student is assigned to this coach (admins can access all)
      if (coach?.role !== 'admin' && studentResult.data.assignedCoachId !== coach?.id) {
        toast.error('Unauthorized: This student is not assigned to you');
        router.push('/coach/students');
        return;
      }

      setStudent(studentResult.data);

      // Load curriculum
      const curriculumResult = await customCurriculumService.getStudentCurriculum(studentId);
      if (curriculumResult.success && curriculumResult.data) {
        setCurriculum(curriculumResult.data);

        // Load content titles for all items
        const titles: Record<string, string> = {};
        for (const item of curriculumResult.data.items) {
          if (item.contentId) {
            try {
              if (item.type === 'lesson') {
                const skillResult = await sportsService.getSkill(item.contentId);
                if (skillResult.success && skillResult.data) {
                  titles[item.contentId] = skillResult.data.name;
                }
              } else if (item.type === 'quiz') {
                const quizResult = await videoQuizService.getQuiz(item.contentId);
                if (quizResult.success && quizResult.data) {
                  titles[item.contentId] = quizResult.data.title;
                }
              } else if (item.type === 'custom_lesson' || item.type === 'custom_quiz') {
                // Load custom content title
                const contentResult = await customContentService.getContent(item.contentId);
                if (contentResult.success && contentResult.data) {
                  titles[item.contentId] = contentResult.data.title;
                }
              }
            } catch (error) {
              console.error('Failed to load content title:', error);
            }
          }
        }
        setContentTitles(titles);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load curriculum data');
    } finally {
      setLoading(false);
    }
  };

  const createCurriculum = async () => {
    if (!coach?.id) return;

    try {
      const result = await customCurriculumService.createCurriculum(
        {
          studentId,
          coachId: coach.id,
          items: [],
        },
        coach.id
      );

      if (result.success && result.data) {
        setCurriculum(result.data);
        toast.success('Curriculum created successfully');
      } else {
        toast.error('Failed to create curriculum');
      }
    } catch (error) {
      console.error('Failed to create curriculum:', error);
      toast.error('Failed to create curriculum');
    }
  };

  const handleContentSelect = async (content: {
    id: string;
    type: 'lesson' | 'quiz' | 'custom_lesson' | 'custom_quiz';
    title: string;
    sportId: string;
    isCustom?: boolean;
  }) => {
    if (!curriculum || !coach?.id) return;

    try {
      // Determine the correct type
      let itemType = content.type;
      if (content.isCustom && content.type === 'lesson') {
        itemType = 'custom_lesson';
      } else if (content.isCustom && content.type === 'quiz') {
        itemType = 'custom_quiz';
      }

      const result = await customCurriculumService.addItem(
        curriculum.id,
        {
          type: itemType,
          contentId: content.id,
          pillarId: content.sportId || 'custom',
          levelId: 'level-1', // Default level for now
          unlocked: false, // Start locked
        },
        coach.id
      );

      if (result.success) {
        // Mark content as used
        if (content.isCustom) {
          await customContentService.markContentUsed(content.id);
        }
        toast.success(`${content.title} added to curriculum`);
        await loadData(); // Reload to see changes
      } else {
        toast.error('Failed to add content');
      }
    } catch (error) {
      console.error('Failed to add content:', error);
      toast.error('Failed to add content');
    }
  };

  const handleTypeSelect = (type: ContentType) => {
    if (type === 'lesson') {
      setShowLessonCreator(true);
    } else {
      setShowQuizCreator(true);
    }
  };

  const handleContentCreated = async (content: CustomContentLibrary) => {
    // Automatically add the created content to the curriculum
    await handleContentSelect({
      id: content.id,
      type: content.type === 'lesson' ? 'custom_lesson' : 'custom_quiz',
      title: content.title,
      sportId: content.pillarId || 'custom',
      isCustom: true,
    });
  };

  const toggleItemLock = async (itemId: string, currentlyLocked: boolean) => {
    if (!curriculum || !coach?.id) return;

    try {
      if (currentlyLocked) {
        // Unlock the item
        const result = await customCurriculumService.unlockItem(curriculum.id, itemId, coach.id);
        if (result.success) {
          toast.success('Item unlocked');
          await loadData();
        } else {
          toast.error('Failed to unlock item');
        }
      } else {
        toast.info('Locking items not implemented yet (items start locked by default)');
      }
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      toast.error('Failed to update item');
    }
  };

  const unlockAllItems = async () => {
    if (!curriculum || !coach?.id) return;

    try {
      const result = await customCurriculumService.unlockAllItems(curriculum.id, coach.id);
      if (result.success) {
        toast.success('All items unlocked');
        await loadData();
      } else {
        toast.error('Failed to unlock all items');
      }
    } catch (error) {
      console.error('Failed to unlock all:', error);
      toast.error('Failed to unlock all items');
    }
  };

  const removeItem = async (itemId: string) => {
    if (!curriculum || !coach?.id) return;

    try {
      const result = await customCurriculumService.removeItem(curriculum.id, itemId, coach.id);
      if (result.success) {
        toast.success('Item removed from curriculum');
        await loadData();
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    }
  };

  const getItemIcon = (item: CustomCurriculumItem) => {
    if (item.status === 'completed') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (item.status === 'in_progress') return <PlayCircle className="h-5 w-5 text-blue-500" />;
    if (item.status === 'unlocked') return <Unlock className="h-5 w-5 text-primary" />;
    return <Lock className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      completed: { variant: "default", label: "Completed" },
      in_progress: { variant: "secondary", label: "In Progress" },
      unlocked: { variant: "outline", label: "Unlocked" },
      locked: { variant: "destructive", label: "Locked" },
    };

    const config = variants[status] || variants.locked;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getItemTypeBadge = (type: string) => {
    const isCustom = type.startsWith('custom_');
    const baseType = type.replace('custom_', '');

    return (
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">
          {baseType === 'lesson' ? 'Lesson' : 'Quiz'}
        </Badge>
        {isCustom && (
          <Badge variant="secondary" className="text-xs">
            Custom
          </Badge>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/coach/students')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{student.displayName}'s Curriculum</h1>
            <p className="text-muted-foreground">
              Manage personalized learning path for {student.displayName}
            </p>
          </div>
        </div>
      </div>

      {/* Create curriculum if doesn't exist */}
      {!curriculum ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Curriculum Created</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create a personalized curriculum for {student.displayName} to start assigning content and tracking progress.
            </p>
            <Button onClick={createCurriculum}>
              <Plus className="h-4 w-4 mr-2" />
              Create Curriculum
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Actions</CardTitle>
              <CardDescription>Manage content and student access</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button onClick={() => setShowContentBrowser(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
              <Button variant="secondary" onClick={() => setShowTypeSelector(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Custom Content
              </Button>
              <Button variant="outline" onClick={unlockAllItems} disabled={curriculum.items.length === 0}>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock All
              </Button>
            </CardContent>
          </Card>

          {/* Curriculum Items */}
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Items ({curriculum.items.length})</CardTitle>
              <CardDescription>
                Content assigned to {student.displayName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {curriculum.items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No content added yet.</p>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" onClick={() => setShowContentBrowser(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Existing Content
                    </Button>
                    <Button variant="secondary" onClick={() => setShowTypeSelector(true)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Custom Content
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {curriculum.items
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-shrink-0">{getItemIcon(item)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">
                              {item.contentId && contentTitles[item.contentId]
                                ? contentTitles[item.contentId]
                                : item.customContent?.title || 'Untitled Content'}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            {getItemTypeBadge(item.type)}
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status === 'locked' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleItemLock(item.id, true)}
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Browser */}
      <ContentBrowser
        open={showContentBrowser}
        onOpenChange={setShowContentBrowser}
        onSelect={handleContentSelect}
        coachId={coach?.id}
      />

      {/* Content Type Selector */}
      <ContentTypeSelector
        open={showTypeSelector}
        onOpenChange={setShowTypeSelector}
        onSelect={handleTypeSelect}
      />

      {/* Lesson Creator */}
      {coach?.id && (
        <>
          <LessonCreator
            open={showLessonCreator}
            onOpenChange={setShowLessonCreator}
            coachId={coach.id}
            onSave={handleContentCreated}
          />

          <QuizCreator
            open={showQuizCreator}
            onOpenChange={setShowQuizCreator}
            coachId={coach.id}
            onSave={handleContentCreated}
          />
        </>
      )}
    </div>
  );
}
