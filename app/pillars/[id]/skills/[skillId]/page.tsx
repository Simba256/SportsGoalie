'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { Sport, Skill, DifficultyLevel, Lesson, VideoQuiz, LessonProgress } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
import { lessonService } from '@/lib/database/services/lesson.service';
import { ProgressService } from '@/lib/database/services/progress.service';
import { customCurriculumService } from '@/lib/database';
import { customContentService } from '@/lib/database/services/custom-content.service';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Play,
  CheckCircle,
  Star,
  ExternalLink,
  Target,
  AlertTriangle,
  Bookmark,
  Share2,
  FileText,
  Video,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface SkillDetailState {
  sport: Sport | null;
  skill: Skill | null;
  prerequisites: Skill[];
  loading: boolean;
  error: string | null;
  hasQuizzes: boolean;
  quizzesLoading: boolean;
}

interface LinkedCustomItem {
  id: string;
  type: 'custom_lesson' | 'custom_quiz';
  title: string;
  description?: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
}

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const sportId = params.id as string;
  const skillId = params.skillId as string;
  const completedContentId = searchParams.get('completedContentId');
  const completedAt = searchParams.get('completedAt');

  const [state, setState] = useState<SkillDetailState>({
    sport: null,
    skill: null,
    prerequisites: [],
    loading: true,
    error: null,
    hasQuizzes: false,
    quizzesLoading: true,
  });

  const [activeTab, setActiveTab] = useState<'content' | 'objectives' | 'resources'>('content');
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isMarkedComplete, setIsMarkedComplete] = useState(false);
  const [isInCurriculum, setIsInCurriculum] = useState(false);
  const [curriculumLoading, setCurriculumLoading] = useState(true);
  const [linkedCustomItems, setLinkedCustomItems] = useState<LinkedCustomItem[]>([]);

  // Lessons + quizzes attached to this skill
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [quizzes, setQuizzes] = useState<VideoQuiz[]>([]);
  const [quizStatusByQuizId, setQuizStatusByQuizId] = useState<
    Record<string, { best: number; passed: boolean; attempts: number }>
  >({});
  const [contentLoading, setContentLoading] = useState(true);

  // Check if user is a custom workflow student
  const isCustomWorkflow = user?.workflowType === 'custom';

  // Check if this skill is in the student's curriculum
  useEffect(() => {
    const checkCurriculum = async () => {
      if (!isCustomWorkflow || !user?.id || !skillId) {
        setCurriculumLoading(false);
        return;
      }

      try {
        setCurriculumLoading(true);
        const result = await customCurriculumService.getStudentCurriculum(user.id);
        console.log('📚 Skill page - Curriculum check:', result);

        if (result.success && result.data) {
          const item = result.data.items.find(i => i.contentId === skillId);
          console.log('📚 Skill page - Found item for skillId', skillId, ':', item);

          // Load coach-assigned custom content linked to this skill or this pillar.
          // Match by exact skill (levelId === skillId) OR by pillar with no specific skill assigned.
          const linkedItems = result.data.items.filter(
            i =>
              (i.type === 'custom_lesson' || i.type === 'custom_quiz') &&
              i.pillarId === sportId &&
              (i.levelId === skillId || !i.levelId || i.levelId === 'level-1') &&
              !!i.contentId
          );

          const linkedContent = await Promise.all(
            linkedItems.map(async (curriculumItem) => {
              if (!curriculumItem.contentId) return null;
              const contentResult = await customContentService.getContent(curriculumItem.contentId);
              if (!contentResult.success || !contentResult.data) return null;
              return {
                id: curriculumItem.contentId,
                type: curriculumItem.type,
                title: contentResult.data.title,
                description: contentResult.data.description,
                status: curriculumItem.contentId === completedContentId ? 'completed' : curriculumItem.status,
              } as LinkedCustomItem;
            })
          );

          setLinkedCustomItems(linkedContent.filter((v): v is LinkedCustomItem => v !== null));

          if (item) {
            setIsInCurriculum(true);
            setIsMarkedComplete(item.status === 'completed');
          } else {
            setIsInCurriculum(false);
          }
        } else {
          setIsInCurriculum(false);
        }
      } catch (error) {
        console.error('Failed to check curriculum:', error);
        setIsInCurriculum(false);
        setLinkedCustomItems([]);
      } finally {
        setCurriculumLoading(false);
      }
    };

    checkCurriculum();
  }, [isCustomWorkflow, user?.id, sportId, skillId, completedContentId, completedAt]);

  useEffect(() => {
    if (!sportId || !skillId) return;

    const loadSkillData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Load sport, skill, and prerequisites
        const [sportResult, skillResult] = await Promise.all([
          sportsService.getSport(sportId),
          sportsService.getSkill(skillId),
        ]);

        if (!sportResult.success || !sportResult.data) {
          setState(prev => ({
            ...prev,
            error: 'Sport not found',
            loading: false,
          }));
          return;
        }

        if (!skillResult.success || !skillResult.data) {
          setState(prev => ({
            ...prev,
            sport: sportResult.data ?? null,
            error: 'Skill not found',
            loading: false,
          }));
          return;
        }

        // Load prerequisites if they exist
        let prerequisites: Skill[] = [];
        if (skillResult.data.prerequisites.length > 0) {
          const prereqResult = await sportsService.getSkillPrerequisites(skillId);
          if (prereqResult.success && prereqResult.data) {
            prerequisites = prereqResult.data;
          }
        }

        setState(prev => ({
          ...prev,
          sport: sportResult.data ?? null,
          skill: skillResult.data ?? null,
          prerequisites,
          loading: false,
        }));

        // Check if quizzes exist for this skill
        checkForQuizzes(skillId);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'An unexpected error occurred',
          loading: false,
        }));
      }
    };

    const checkForQuizzes = async (skillId: string) => {
      try {
        setState(prev => ({ ...prev, quizzesLoading: true }));
        console.log('🔍 Checking for video quizzes for skillId:', skillId);
        const quizzesResult = await videoQuizService.getVideoQuizzesBySkill(skillId, {
          where: [{ field: 'isPublished', operator: '==', value: true }]
        });
        console.log('📊 Video quiz query result:', quizzesResult);

        const hasQuizzes = quizzesResult.success && (quizzesResult.data?.items?.length ?? 0) > 0;

        if (hasQuizzes && quizzesResult.data?.items) {
          console.log('✅ Found video quizzes:', quizzesResult.data.items.map(q => ({
            id: q.id,
            title: q.title,
            status: q.status
          })));
        } else {
          console.log('❌ No published video quizzes found for this skill.');
        }

        setState(prev => ({
          ...prev,
          hasQuizzes,
          quizzesLoading: false,
        }));
      } catch (error) {
        console.error('Error checking for quizzes:', error);
        setState(prev => ({
          ...prev,
          hasQuizzes: false,
          quizzesLoading: false,
        }));
      }
    };

    loadSkillData();
  }, [sportId, skillId]);

  // Load lessons + quizzes + their per-user progress
  useEffect(() => {
    if (!skillId) return;

    const loadContent = async () => {
      try {
        setContentLoading(true);

        const [lessonsResult, quizzesResult] = await Promise.all([
          lessonService.getLessonsBySkill(skillId),
          videoQuizService.getVideoQuizzesBySkill(skillId, {
            where: [{ field: 'isPublished', operator: '==', value: true }],
          }),
        ]);

        const loadedLessons = (lessonsResult.success ? lessonsResult.data?.items ?? [] : []).filter(
          (l) => l.status === 'published'
        );
        const loadedQuizzes = quizzesResult.success ? quizzesResult.data?.items ?? [] : [];
        setLessons(loadedLessons);
        setQuizzes(loadedQuizzes);

        if (user?.id) {
          // Per-lesson progress
          const progressResult = await lessonService.getLessonProgressForUser(user.id, { skillId });
          if (progressResult.success && progressResult.data) {
            const progressMap: Record<string, LessonProgress> = {};
            for (const entry of progressResult.data.items) {
              progressMap[entry.lessonId] = entry;
            }
            setLessonProgress(progressMap);
          }

          // Per-quiz attempt summary
          const attemptsResult = await videoQuizService.getUserVideoQuizAttempts(user.id, {
            skillId,
            completed: true,
          });
          if (attemptsResult.success && attemptsResult.data) {
            const byQuiz: Record<string, { best: number; passed: boolean; attempts: number }> = {};
            for (const attempt of attemptsResult.data.items) {
              const key = attempt.videoQuizId || (attempt as { quizId?: string }).quizId;
              if (!key) continue;
              const existing = byQuiz[key];
              const pct = attempt.percentage ?? 0;
              if (!existing) {
                byQuiz[key] = { best: pct, passed: pct >= 70, attempts: 1 };
              } else {
                byQuiz[key] = {
                  best: Math.max(existing.best, pct),
                  passed: existing.passed || pct >= 70,
                  attempts: existing.attempts + 1,
                };
              }
            }
            setQuizStatusByQuizId(byQuiz);
          }
        }
      } catch (err) {
        console.error('Failed to load skill content:', err);
      } finally {
        setContentLoading(false);
      }
    };

    loadContent();
  }, [skillId, user?.id]);

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'introduction':
        return 'text-green-600 bg-green-100';
      case 'development':
        return 'text-yellow-600 bg-yellow-100';
      case 'refinement':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  // Handle marking lesson as complete (for custom workflow students)
  const handleMarkComplete = async () => {
    if (!user || !skillId) return;

    try {
      setIsMarkingComplete(true);
      const result = await ProgressService.recordLessonCompletion(
        user.id,
        skillId,
        sportId
      );

      if (result.success) {
        setIsMarkedComplete(true);
        toast.success('Lesson marked as complete!', {
          description: 'Your progress has been updated.',
        });
      } else {
        toast.error('Failed to mark lesson as complete');
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast.error('Failed to mark lesson as complete');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonContentPage />
      </div>
    );
  }

  if (state.error || !state.skill || !state.sport) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-4xl">⚠️</div>
              <h3 className="text-lg font-medium text-red-900">
                {state.error || 'Skill not found'}
              </h3>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { sport, skill, prerequisites } = state;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/pillars" className="hover:text-blue-700">Pillars</Link>
        <span>/</span>
        <Link href={`/pillars/${sportId}`} className="hover:text-blue-700">{sport.name}</Link>
        <span>/</span>
        <span className="text-foreground">{skill.name}</span>
      </nav>

      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-slate-700 hover:bg-blue-50 hover:text-blue-700">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {sport.name}
      </Button>

      {/* Skill Header */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{skill.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(skill.difficulty)}`}
                >
                  {skill.difficulty}
                </span>
              </div>
              <p className="text-lg text-muted-foreground">{skill.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Skill Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-xl font-semibold">
                  {formatDuration(skill.estimatedTimeToComplete)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Est. Time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <span className="text-xl font-semibold">{skill.learningObjectives.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Objectives</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                {skill.hasVideo && <Play className="w-5 h-5 text-green-600" />}
                {state.hasQuizzes && <CheckCircle className="w-5 h-5 text-blue-600" />}
                <span className="text-xl font-semibold">
                  {[skill.hasVideo && 'Video', state.hasQuizzes && 'Quiz'].filter(Boolean).join(' + ') || 'Text'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Content Type</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-xl font-semibold">
                  {skill.metadata.averageRating > 0 ? skill.metadata.averageRating.toFixed(1) : 'New'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Prerequisites Warning */}
        {prerequisites.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-900">Prerequisites Required</h4>
                  <p className="text-sm text-yellow-800">
                    Complete these skills before starting this one for the best learning experience:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prerequisites.map((prereq) => (
                      <Link key={prereq.id} href={`/pillars/${sportId}/skills/${prereq.id}`}>
                        <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm hover:bg-yellow-300 transition-colors">
                          {prereq.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content Tabs */}
      <div className="space-y-6">
        <div className="border-b">
          <nav className="flex space-x-8">
            {[
              { id: 'content', label: 'Content', icon: BookOpen },
              { id: 'objectives', label: 'Learning Objectives', icon: Target },
              { id: 'resources', label: 'Resources', icon: ExternalLink },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Video Content */}
              {skill.hasVideo && skill.media?.videos && skill.media.videos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Video Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skill.media.videos.map((video) => (
                      <div key={video.id}>
                        {video.url ? (
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <video
                              src={video.url}
                              controls
                              className="w-full h-full"
                              preload="metadata"
                            >
                              <source src={video.url} type="video/mp4" />
                              <source src={video.url} type="video/webm" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ) : video.youtubeId ? (
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <iframe
                              src={`https://www.youtube.com/embed/${video.youtubeId}`}
                              title={video.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <Play className="w-12 h-12 text-muted-foreground mx-auto" />
                              <p className="text-sm text-muted-foreground">
                                Video unavailable
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Text Content */}
              {skill.content && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: skill.content }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Images */}
              {skill.media?.images && skill.media.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Visual Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skill.media.images.map((image) => (
                        <div key={image.id} className="space-y-2">
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full rounded-lg"
                          />
                          {image.caption && (
                            <p className="text-sm text-muted-foreground">{image.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lessons + Quizzes assigned to this skill */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Lessons & Quizzes
                  </CardTitle>
                  <CardDescription>
                    Work through the lessons and test your understanding with quizzes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contentLoading ? (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary" />
                      Loading content…
                    </div>
                  ) : lessons.length === 0 && quizzes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No lessons or quizzes have been added to this skill yet.
                    </p>
                  ) : (
                    <>
                      {/* Lessons */}
                      {lessons.map((lesson) => {
                        const progress = lessonProgress[lesson.id];
                        const isCompleted = !!progress?.completedAt;
                        const isViewed = !!progress?.viewedAt && !isCompleted;
                        return (
                          <Link
                            key={lesson.id}
                            href={`/pillars/${sportId}/skills/${skillId}/lessons/${lesson.id}`}
                            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-foreground truncate">{lesson.title}</p>
                                  {isCompleted ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                                      <CheckCircle className="h-3 w-3" /> Read
                                    </span>
                                  ) : isViewed ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                      <Eye className="h-3 w-3" /> In progress
                                    </span>
                                  ) : null}
                                </div>
                                {lesson.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                    {lesson.description}
                                  </p>
                                )}
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                  <Clock className="inline h-3 w-3 mr-1" />
                                  {lesson.estimatedTimeMinutes} min
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </Link>
                        );
                      })}

                      {/* Quizzes */}
                      {quizzes.map((quiz) => {
                        const status = quizStatusByQuizId[quiz.id];
                        const passed = status?.passed ?? false;
                        const hasAttempt = (status?.attempts ?? 0) > 0;
                        return (
                          <Link
                            key={quiz.id}
                            href={`/quiz/video/${quiz.id}`}
                            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent/40 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                                <Video className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-foreground truncate">{quiz.title}</p>
                                  {passed ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                                      <CheckCircle className="h-3 w-3" /> Passed {status?.best}%
                                    </span>
                                  ) : hasAttempt ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                                      <Play className="h-3 w-3" /> Best {status?.best}%
                                    </span>
                                  ) : null}
                                </div>
                                {quiz.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                    {quiz.description}
                                  </p>
                                )}
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                  {quiz.questions?.length ?? 0} questions
                                  {typeof quiz.settings?.passingScore === 'number' && (
                                    <> · passing {quiz.settings.passingScore}%</>
                                  )}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </Link>
                        );
                      })}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Coach-assigned custom content linked to this skill */}
              {!curriculumLoading && linkedCustomItems.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Assigned For This Skill</CardTitle>
                    <CardDescription className="text-blue-700">
                      Extra lesson and quiz content your coach linked to this skill.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {linkedCustomItems.map((item) => {
                      const isLesson = item.type === 'custom_lesson';
                      const isLocked = item.status === 'locked';
                      const isCompleted = item.status === 'completed';
                      const href = isLesson
                        ? `/learn/lesson/${item.id}?pillarId=${sportId}&skillId=${skillId}`
                        : `/quiz/video/${item.id}`;
                      return (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border border-blue-100 bg-white p-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-gray-900">{item.title}</p>
                              {isCompleted ? (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                                  Completed
                                </span>
                              ) : null}
                            </div>
                            {item.description ? (
                              <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                            ) : null}
                          </div>
                          <Button asChild size="sm" disabled={isLocked} className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:text-gray-500">
                            <Link href={href}>
                              {isLesson ? (isCompleted ? 'Review Lesson' : 'Start Lesson') : 'Take Quiz'}
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Mark Complete Section - For custom workflow students with this skill in their curriculum */}
              {isCustomWorkflow && !state.hasQuizzes && !state.quizzesLoading && !curriculumLoading && isInCurriculum && (
                <Card className={`${isMarkedComplete ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className={`w-8 h-8 ${isMarkedComplete ? 'text-green-600' : 'text-amber-600'}`} />
                        <div>
                          <h4 className={`font-medium ${isMarkedComplete ? 'text-green-900' : 'text-amber-900'}`}>
                            {isMarkedComplete ? 'Lesson Completed!' : 'Finished this lesson?'}
                          </h4>
                          <p className={`text-sm ${isMarkedComplete ? 'text-green-700' : 'text-amber-700'}`}>
                            {isMarkedComplete
                              ? 'Your coach has been notified of your progress.'
                              : 'Mark this lesson as complete when you\'re done reviewing the content.'}
                          </p>
                        </div>
                      </div>
                      {!isMarkedComplete && (
                        <Button
                          onClick={handleMarkComplete}
                          disabled={isMarkingComplete}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isMarkingComplete ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Loading curriculum check */}
              {isCustomWorkflow && !state.hasQuizzes && !state.quizzesLoading && curriculumLoading && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                      <p className="text-sm text-gray-600">Checking your curriculum...</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'objectives' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Learning Objectives
                </CardTitle>
                <CardDescription>
                  By the end of this skill, you will be able to:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {skill.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              {skill.externalResources && skill.externalResources.length > 0 ? (
                skill.externalResources.map((resource, index) => (
                  <Card key={resource.id || `resource-${index}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                          )}
                          <span className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {resource.type}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <ExternalLink className="w-8 h-8 text-muted-foreground mx-auto" />
                      <h4 className="font-medium">No external resources</h4>
                      <p className="text-sm text-muted-foreground">
                        All the learning material is included in the skill content above.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}