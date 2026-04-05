'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BookOpen, Lock, Clock, CheckCircle2, ArrowRight, Target, FileText } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { customCurriculumService, customContentService, sportsService } from '@/lib/database';
import { CustomCurriculumItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LessonEntry {
  item: CustomCurriculumItem;
  title: string;
  description?: string;
  duration?: number;
}

function LessonsPageContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LessonEntry[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    void loadLessons();
  }, [user?.id]);

  const loadLessons = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const curriculumResult = await customCurriculumService.getStudentCurriculum(user.id);

      if (!curriculumResult.success || !curriculumResult.data) {
        setEntries([]);
        return;
      }

      const lessonLikeItems = curriculumResult.data.items
        .filter((item) => ['lesson', 'custom_lesson', 'quiz', 'custom_quiz'].includes(item.type))
        .sort((a, b) => a.order - b.order);

      const resolved = await Promise.all(
        lessonLikeItems.map(async (item) => {
          if (!item.contentId) {
            return {
              item,
              title: item.customContent?.title || 'Curriculum Item',
              description: item.customContent?.description,
              duration: item.customContent?.estimatedTimeMinutes,
            };
          }

          try {
            if (item.type === 'lesson') {
              const skillResult = await sportsService.getSkill(item.contentId);
              if (skillResult.success && skillResult.data) {
                return {
                  item,
                  title: skillResult.data.name,
                  description: skillResult.data.description,
                  duration: skillResult.data.estimatedTimeToComplete,
                };
              }
            }

            if (item.type === 'quiz') {
              const contentResult = await customContentService.getContent(item.contentId);
              if (contentResult.success && contentResult.data) {
                return {
                  item,
                  title: contentResult.data.title,
                  description: contentResult.data.description,
                  duration: contentResult.data.estimatedTimeMinutes,
                };
              }

              return {
                item,
                title: 'Video Quiz',
                description: 'Assigned by your coach',
              };
            }

            const customResult = await customContentService.getContent(item.contentId);
            if (customResult.success && customResult.data) {
              return {
                item,
                title: customResult.data.title,
                description: customResult.data.description,
                duration: customResult.data.estimatedTimeMinutes,
              };
            }
          } catch {
            // fall through to fallback
          }

          return {
            item,
            title: item.type.includes('quiz') ? 'Quiz' : 'Lesson',
            description: 'Assigned by your coach',
          };
        })
      );

      setEntries(resolved);
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast.error('Failed to load assigned lessons');
    } finally {
      setLoading(false);
    }
  };

  const getHref = (item: CustomCurriculumItem) => {
    if (item.status === 'locked') return '';
    if (!item.contentId) return '';

    if (item.type === 'lesson') return `/pillars/${item.pillarId}/skills/${item.contentId}`;
    if (item.type === 'quiz' || item.type === 'custom_quiz') return `/quiz/video/${item.contentId}`;
    if (item.type === 'custom_lesson') return `/learn/lesson/${item.contentId}`;
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-blue-50 px-6 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Lessons and Quizzes</h1>
        <p className="mt-2 text-slate-600">All coach-assigned learning items in one place.</p>
      </div>

      {entries.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-slate-700 font-medium">No assigned items yet</p>
            <p className="text-sm text-slate-500">Your coach will add lessons and quizzes here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {entries.map(({ item, title, description, duration }) => {
            const href = getHref(item);
            const isLocked = item.status === 'locked';
            const isCompleted = item.status === 'completed';
            const isQuiz = item.type === 'quiz' || item.type === 'custom_quiz';

            return (
              <Card
                key={item.id}
                className={`border transition-all ${
                  isLocked
                    ? 'border-slate-200 bg-slate-50/80'
                    : 'border-red-100 hover:border-red-300 hover:shadow-lg hover:shadow-red-100/40'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={isQuiz ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>
                      {isQuiz ? 'Quiz' : 'Lesson'}
                    </Badge>
                    {isCompleted ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    ) : isLocked ? (
                      <Badge variant="outline" className="border-slate-300 text-slate-500">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                        <Target className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg text-slate-900 line-clamp-2">{title}</CardTitle>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {description && <p className="text-sm text-slate-600 line-clamp-3">{description}</p>}

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      Step {item.order + 1}
                    </span>
                    {duration ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {duration} min
                      </span>
                    ) : null}
                  </div>

                  {isLocked ? (
                    <Button disabled className="w-full">
                      Locked
                    </Button>
                  ) : (
                    <Link href={href}>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                        {isCompleted ? 'Review' : isQuiz ? 'Start Quiz' : 'Start Lesson'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LessonsPage() {
  return (
    <ProtectedRoute>
      <LessonsPageContent />
    </ProtectedRoute>
  );
}
