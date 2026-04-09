'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
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
import { userService, sportsService, videoQuizService, customContentService, onboardingService } from '@/lib/database';
import { customCurriculumService } from '@/lib/database';
import { User, CustomCurriculum, CustomCurriculumItem, CustomContentLibrary, GapAnalysis } from '@/types';
import { toast } from 'sonner';
import { ContentBrowser } from '@/components/coach/content-browser';
import { ContentTypeSelector, ContentType } from '@/components/coach/content-type-selector';
import { LessonCreator } from '@/components/coach/lesson-creator';
import { QuizCreator } from '@/components/coach/quiz-creator';
import { StudentIntelligenceSidebar } from '@/components/coach/StudentIntelligenceSidebar';
import { StudentChartingSummary } from '@/components/coach/StudentChartingSummary';
import { CurriculumTemplatePicker } from '@/components/coach/CurriculumTemplatePicker';
import { getApplicableTemplates, type CurriculumTemplate as CurrTemplate } from '@/lib/utils/curriculum-templates';
import type { PacingLevel } from '@/types/onboarding';

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
  const [preSelectedPillarId, setPreSelectedPillarId] = useState<string | undefined>();
  const [studentGaps, setStudentGaps] = useState<GapAnalysis[]>([]);
  const [pacingLevel, setPacingLevel] = useState<PacingLevel | undefined>();
  const [applicableTemplates, setApplicableTemplates] = useState<CurrTemplate[]>([]);

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
                const quizResult = await videoQuizService.getVideoQuiz(item.contentId);
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

      // Load intelligence profile for gaps, pacing level, and templates
      try {
        const evalResult = await onboardingService.getEvaluation(studentId);
        if (evalResult.success && evalResult.data?.intelligenceProfile) {
          const profile = evalResult.data.intelligenceProfile;
          setStudentGaps(profile.identifiedGaps || []);
          setPacingLevel(profile.pacingLevel);
          const gapSlugs = (profile.identifiedGaps || []).map((g: GapAnalysis) => g.categorySlug);
          setApplicableTemplates(getApplicableTemplates(profile.pacingLevel, gapSlugs));
        }
      } catch {
        // Non-blocking — gaps are optional context
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
    skillId?: string;
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
          // Store linked skill ID (when provided) so content can be shown on the skill page.
          levelId: content.skillId || 'level-1',
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
      skillId: content.levelId,
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

  const handleSelectTemplate = async (template: CurrTemplate) => {
    if (!coach?.id) return;

    // First create the curriculum
    try {
      const result = await customCurriculumService.createCurriculum(
        { studentId, coachId: coach.id, items: [] },
        coach.id
      );
      if (!result.success || !result.data) {
        toast.error('Failed to create curriculum');
        return;
      }
      const newCurriculum = result.data;

      // Add template items
      for (const item of template.items) {
        await customCurriculumService.addItem(
          newCurriculum.id,
          {
            type: 'lesson',
            pillarId: item.pillarId,
            levelId: pacingLevel || 'introduction',
            unlocked: false,
            notes: item.rationale,
          },
          coach.id
        );
      }

      toast.success(`Created curriculum from "${template.name}" with ${template.items.length} items`);
      await loadData();
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast.error('Failed to create curriculum from template');
    }
  };

  const handleAddContentForPillar = (pillarId: string, pillarName: string) => {
    setPreSelectedPillarId(pillarId);
    setShowContentBrowser(true);
    toast.info(`Showing content for: ${pillarName}`);
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#0f0f13] via-[#1a1a2e] to-[#16213e] rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <p className="text-red-400 text-sm font-semibold tracking-wide uppercase mb-1">Curriculum</p>
          <h1 className="text-2xl md:text-3xl font-black text-white">{student.displayName}&apos;s Learning Path</h1>
          <p className="text-white/50 text-sm mt-1">Manage personalized curriculum for {student.displayName}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content area (2/3) */}
        <div className="lg:col-span-2">

      {/* Create curriculum if doesn't exist */}
      {!curriculum ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center mb-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-xl font-semibold mb-2">Create {student.displayName}&apos;s Curriculum</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Start with a recommended template based on the student&apos;s assessment, or build from scratch.
              </p>
            </div>
            <CurriculumTemplatePicker
              templates={applicableTemplates}
              onSelectTemplate={handleSelectTemplate}
              onStartFromScratch={createCurriculum}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">Curriculum Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setShowContentBrowser(true)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Content
              </button>
              <button onClick={() => setShowTypeSelector(true)} className="border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Create Custom Content
              </button>
              <button onClick={unlockAllItems} disabled={curriculum.items.length === 0} className="border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 disabled:opacity-50">
                <Unlock className="h-4 w-4" />
                Unlock All
              </button>
            </div>
          </div>

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
                  {[...curriculum.items]
                    .sort((a, b) => {
                      // Priority: completed > in_progress > unlocked > locked
                      const statusOrder: Record<string, number> = { completed: 0, in_progress: 1, unlocked: 2, locked: 3 };
                      const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
                      if (statusDiff !== 0) return statusDiff;
                      // Within same status, sort by order
                      return a.order - b.order;
                    })
                    .map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-zinc-50 transition-colors"
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

        </div>{/* end main column */}

        {/* Intelligence Sidebar (1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <StudentIntelligenceSidebar
              studentId={studentId}
              onAddContentForPillar={handleAddContentForPillar}
            />
            <StudentChartingSummary studentId={studentId} />
          </div>
        </div>
      </div>{/* end grid */}

      {/* Content Browser */}
      <ContentBrowser
        open={showContentBrowser}
        onOpenChange={(open) => {
          setShowContentBrowser(open);
          if (!open) setPreSelectedPillarId(undefined);
        }}
        onSelect={handleContentSelect}
        coachId={coach?.id}
        preSelectedSportId={preSelectedPillarId}
      />

      {/* Content Type Selector */}
      <ContentTypeSelector
        open={showTypeSelector}
        onOpenChange={setShowTypeSelector}
        onSelect={handleTypeSelect}
      />

      {/* Lesson Creator */}
      {coach?.id && (
        <LessonCreator
          open={showLessonCreator}
          onOpenChange={setShowLessonCreator}
          coachId={coach.id}
          onSave={handleContentCreated}
          studentGaps={studentGaps.map((g) => ({
            categoryName: g.categoryName,
            categorySlug: g.categorySlug,
            priority: g.priority,
            suggestedContent: g.suggestedContent,
          }))}
        />
      )}

      {/* Quiz Creator (native modal) */}
      {coach?.id && (
        <QuizCreator
          open={showQuizCreator}
          onOpenChange={setShowQuizCreator}
          coachId={coach.id}
          onSave={handleContentCreated}
        />
      )}
    </div>
  );
}
