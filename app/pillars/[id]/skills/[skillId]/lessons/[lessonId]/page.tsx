'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  BookOpen,
  Eye,
} from 'lucide-react';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { lessonService } from '@/lib/database/services/lesson.service';
import { ProgressService } from '@/lib/database/services/progress.service';
import { sportsService } from '@/lib/database/services/sports.service';
import { Lesson, LessonProgress, Skill, Sport } from '@/types';

function LessonViewerContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const sportId = params.id as string;
  const skillId = params.skillId as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [sport, setSport] = useState<Sport | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track time spent reading for progress.
  const viewStartRef = useRef<number | null>(null);
  // Auto-complete when the user scrolls near the bottom of the lesson body.
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const hasAutoCompletedRef = useRef(false);

  const isCompleted = !!progress?.completedAt;

  useEffect(() => {
    if (!lessonId || !skillId || !sportId) return;
    viewStartRef.current = Date.now();

    const load = async () => {
      try {
        setLoading(true);
        const [lessonResult, skillResult, sportResult] = await Promise.all([
          lessonService.getLesson(lessonId),
          sportsService.getSkill(skillId),
          sportsService.getSport(sportId),
        ]);

        if (!lessonResult.success || !lessonResult.data) {
          setError('Lesson not found');
          return;
        }

        setLesson(lessonResult.data);
        if (skillResult.success && skillResult.data) setSkill(skillResult.data);
        if (sportResult.success && sportResult.data) setSport(sportResult.data);

        // Idempotently record the first view and fetch existing progress.
        if (user?.id && lessonResult.data) {
          const viewResult = await lessonService.markLessonViewed(user.id, lessonResult.data);
          if (viewResult.success && viewResult.data) {
            setProgress(viewResult.data);
          }
        }
      } catch (err) {
        console.error('Failed to load lesson:', err);
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, skillId, sportId, user?.id]);

  const markComplete = async (source: 'manual' | 'scroll') => {
    if (!lesson || !user?.id || marking || isCompleted) return;
    try {
      setMarking(true);
      const secondsSpent = viewStartRef.current
        ? Math.max(0, Math.round((Date.now() - viewStartRef.current) / 1000))
        : 0;

      const result = await ProgressService.recordLessonAttempt(user.id, lesson, {
        completed: true,
        timeSpentSeconds: secondsSpent,
      });

      if (result.success) {
        setProgress((prev) =>
          prev
            ? { ...prev, completedAt: prev.completedAt ?? ({ toDate: () => new Date() } as any) }
            : null
        );
        if (source === 'manual') {
          toast.success('Lesson marked as read', {
            description: 'Your progress has been saved.',
          });
        }
      } else {
        if (source === 'manual') toast.error('Failed to save progress');
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
      if (source === 'manual') toast.error('Failed to save progress');
    } finally {
      setMarking(false);
    }
  };

  // Auto-complete on scroll-to-bottom of the lesson body.
  useEffect(() => {
    if (isCompleted || !lesson || !user?.id) return;

    const onScroll = () => {
      if (hasAutoCompletedRef.current) return;
      const el = bodyRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;

      // Trigger when the bottom of the body is within 80px of the viewport bottom.
      if (rect.bottom - viewportH < 80) {
        hasAutoCompletedRef.current = true;
        void markComplete('scroll');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Also evaluate immediately in case the lesson is short enough to not require scrolling.
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, lesson?.id, user?.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonContentPage />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-6">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-foreground">{error || 'Lesson not found'}</p>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const skillHref = `/pillars/${sportId}/skills/${skillId}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link href="/pillars" className="hover:text-primary">Pillars</Link>
          <span>/</span>
          {sport && (
            <>
              <Link href={`/pillars/${sportId}`} className="hover:text-primary truncate max-w-[160px]">
                {sport.name}
              </Link>
              <span>/</span>
            </>
          )}
          {skill && (
            <>
              <Link href={skillHref} className="hover:text-primary truncate max-w-[180px]">
                {skill.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground truncate max-w-[220px]">{lesson.title}</span>
        </nav>

        <Button variant="ghost" onClick={() => router.push(skillHref)} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to skill
        </Button>

        {/* Header */}
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase tracking-wide">Lesson</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {lesson.estimatedTimeMinutes} min
            </span>
            {isCompleted ? (
              <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            ) : progress ? (
              <Badge variant="secondary">
                <Eye className="mr-1 h-3 w-3" />
                In progress
              </Badge>
            ) : null}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="text-base text-muted-foreground">{lesson.description}</p>
          )}
        </header>

        {/* Body */}
        <Card>
          <CardContent className="pt-6">
            <div
              ref={bodyRef}
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {isCompleted
              ? 'You\'ve read this lesson. Come back any time to review.'
              : 'Tap the button when you\'re done — or just scroll to the end and we\'ll mark it for you.'}
          </p>
          <div className="flex gap-2">
            {!isCompleted && (
              <Button onClick={() => markComplete('manual')} disabled={marking}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {marking ? 'Saving…' : 'Mark as read'}
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push(skillHref)}>
              Back to skill
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LessonViewerPage() {
  return (
    <ProtectedRoute>
      <LessonViewerContent />
    </ProtectedRoute>
  );
}
