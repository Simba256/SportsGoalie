'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  customCurriculumService,
  customContentService,
  sportsService,
  videoQuizService,
} from '@/lib/database';
import { CustomCurriculum, CustomCurriculumItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, PlayCircle, Lock, Unlock, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

type ItemDetail = {
  title: string;
  description?: string;
  estimatedTimeMinutes?: number;
  targetUrl?: string;
};

const statusBadgeClass: Record<string, string> = {
  locked: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  unlocked: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function LessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [curriculum, setCurriculum] = useState<CustomCurriculum | null>(null);
  const [itemDetails, setItemDetails] = useState<Record<string, ItemDetail>>({});

  useEffect(() => {
    const loadCurriculum = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await customCurriculumService.getStudentCurriculum(user.id);

        if (!result.success) {
          toast.error('Failed to load your lessons');
          return;
        }

        setCurriculum(result.data || null);

        if (!result.data || result.data.items.length === 0) {
          setItemDetails({});
          return;
        }

        const details: Record<string, ItemDetail> = {};

        for (const item of result.data.items) {
          const fallbackTitle = item.customContent?.title || 'Untitled Content';
          const fallbackDescription = item.customContent?.description;

          if (!item.contentId) {
            details[item.id] = {
              title: fallbackTitle,
              description: fallbackDescription,
              estimatedTimeMinutes: item.customContent?.estimatedTimeMinutes,
            };
            continue;
          }

          try {
            if (item.type === 'lesson') {
              const skillResult = await sportsService.getSkill(item.contentId);
              if (skillResult.success && skillResult.data) {
                details[item.id] = {
                  title: skillResult.data.name,
                  description: skillResult.data.description,
                  estimatedTimeMinutes: skillResult.data.estimatedTimeToComplete,
                  targetUrl: item.pillarId ? `/pillars/${item.pillarId}/skills/${item.contentId}` : undefined,
                };
              }
            } else if (item.type === 'quiz') {
              const quizResult = await videoQuizService.getVideoQuiz(item.contentId);
              if (quizResult.success && quizResult.data) {
                details[item.id] = {
                  title: quizResult.data.title,
                  description: quizResult.data.description,
                  estimatedTimeMinutes: quizResult.data.estimatedDuration,
                  targetUrl: `/quiz/video/${item.contentId}`,
                };
              }
            } else {
              const customResult = await customContentService.getContent(item.contentId);
              if (customResult.success && customResult.data) {
                let targetUrl: string | undefined;
                if (item.type === 'custom_lesson') {
                  targetUrl = `/learn/lesson/${item.contentId}`;
                } else if (item.type === 'custom_quiz') {
                  try {
                    const parsed = JSON.parse(customResult.data.content || '{}') as { videoQuizId?: string };
                    if (parsed.videoQuizId) {
                      targetUrl = `/quiz/video/${parsed.videoQuizId}`;
                    }
                  } catch {
                    targetUrl = undefined;
                  }
                }

                details[item.id] = {
                  title: customResult.data.title,
                  description: customResult.data.description,
                  estimatedTimeMinutes: customResult.data.estimatedTimeMinutes,
                  targetUrl,
                };
              }
            }
          } catch {
            details[item.id] = {
              title: fallbackTitle,
              description: fallbackDescription,
              estimatedTimeMinutes: item.customContent?.estimatedTimeMinutes,
            };
          }

          if (!details[item.id]) {
            details[item.id] = {
              title: fallbackTitle,
              description: fallbackDescription,
              estimatedTimeMinutes: item.customContent?.estimatedTimeMinutes,
            };
          }
        }

        setItemDetails(details);
      } finally {
        setLoading(false);
      }
    };

    loadCurriculum();
  }, [user?.id]);

  const sortedItems = useMemo(() => {
    if (!curriculum) return [];
    return [...curriculum.items].sort((a, b) => a.order - b.order);
  }, [curriculum]);

  const summary = useMemo(() => {
    const base = { total: 0, lessons: 0, quizzes: 0 };
    for (const item of sortedItems) {
      base.total += 1;
      if (item.type.includes('lesson')) base.lessons += 1;
      if (item.type.includes('quiz')) base.quizzes += 1;
    }
    return base;
  }, [sortedItems]);

  const openItem = (item: CustomCurriculumItem) => {
    if (item.status === 'locked') {
      toast.info('This content is locked by your coach.');
      return;
    }

    const targetUrl = itemDetails[item.id]?.targetUrl;
    if (!targetUrl) {
      toast.error('This content is not available yet.');
      return;
    }

    router.push(targetUrl);
  };

  const getTypeBadge = (item: CustomCurriculumItem) => {
    const isLesson = item.type.includes('lesson');
    return (
      <Badge
        variant="outline"
        className={isLesson ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-red-200 bg-red-50 text-red-700'}
      >
        {isLesson ? 'Lesson' : 'Quiz'}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    if (status === 'in_progress') return <PlayCircle className="h-4 w-4 text-red-600" />;
    if (status === 'unlocked') return <Unlock className="h-4 w-4 text-blue-600" />;
    return <Lock className="h-4 w-4 text-zinc-500" />;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="relative bg-gradient-to-r from-[#0f0f13] via-[#1a1a2e] to-[#16213e] rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <p className="text-red-400 text-sm font-semibold tracking-wide uppercase mb-1">Learning Plan</p>
          <h1 className="text-2xl md:text-3xl font-black text-white">Your Lessons and Quizzes</h1>
          <p className="text-white/60 text-sm mt-1">All assigned content from your coach, including locked and unlocked items.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-zinc-200">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-black text-zinc-900">{summary.total}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-4">
            <p className="text-xs text-blue-700 uppercase tracking-wide">Lessons</p>
            <p className="text-2xl font-black text-blue-800">{summary.lessons}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/40">
          <CardContent className="p-4">
            <p className="text-xs text-red-700 uppercase tracking-wide">Quizzes</p>
            <p className="text-2xl font-black text-red-800">{summary.quizzes}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200">
        <CardHeader>
          <CardTitle>Assigned Content</CardTitle>
          <CardDescription>
            This view shows all items your coach has assigned to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              No lessons or quizzes have been assigned yet.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedItems.map((item, idx) => {
                const detail = itemDetails[item.id];
                const isLesson = item.type.includes('lesson');
                const canOpen = item.status !== 'locked' && !!detail?.targetUrl;
                return (
                  <div
                    key={item.id}
                    onClick={() => openItem(item)}
                    className={`rounded-xl border bg-white p-4 transition-colors ${
                      canOpen
                        ? 'border-zinc-200 hover:bg-zinc-50 hover:border-blue-200 cursor-pointer'
                        : 'border-zinc-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-zinc-100">
                        {isLesson ? (
                          <BookOpen className="h-5 w-5 text-blue-700" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-red-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-zinc-900 truncate">{detail?.title || 'Untitled Content'}</h3>
                          {getTypeBadge(item)}
                          <Badge variant="outline" className={statusBadgeClass[item.status] || statusBadgeClass.locked}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {detail?.description && (
                          <p className="text-sm text-zinc-600 line-clamp-2 mb-2">{detail.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span className="inline-flex items-center gap-1">
                            {getStatusIcon(item.status)}
                            {item.status === 'locked' ? 'Locked by coach' : 'Available in your plan'}
                          </span>
                          {canOpen && (
                            <span className="text-blue-700 font-semibold">Click to open</span>
                          )}
                          {typeof detail?.estimatedTimeMinutes === 'number' && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {detail.estimatedTimeMinutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
