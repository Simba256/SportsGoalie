'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { customContentService, customCurriculumService } from '@/lib/database';
import { CustomContentLibrary } from '@/types';
import { toast } from 'sonner';

// Helper functions for YouTube URLs
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function getYouTubeEmbedUrl(url: string): string {
  // Handle various YouTube URL formats
  let videoId = '';

  if (url.includes('youtu.be/')) {
    // Short format: https://youtu.be/VIDEO_ID
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/watch')) {
    // Standard format: https://www.youtube.com/watch?v=VIDEO_ID
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtube.com/embed/')) {
    // Already embed format
    return url;
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

export default function CustomLessonPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const lessonId = params.id as string;
  const pillarId = searchParams.get('pillarId');
  const skillId = searchParams.get('skillId');

  const backToSkillPage = !!pillarId && !!skillId;

  const [lesson, setLesson] = useState<CustomContentLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const getBackHref = () => {
    if (!backToSkillPage) {
      return '/dashboard';
    }

    if (!isCompleted) {
      return `/pillars/${pillarId}/skills/${skillId}`;
    }

    return `/pillars/${pillarId}/skills/${skillId}?completedContentId=${lessonId}&completedAt=${Date.now()}`;
  };

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId, user?.id]);

  const loadLesson = async () => {
    try {
      setLoading(true);

      // Fetch lesson content and curriculum status in parallel
      const [result, curriculumResult] = await Promise.all([
        customContentService.getContent(lessonId),
        user?.id
          ? customCurriculumService.getStudentCurriculum(user.id).catch(() => null)
          : Promise.resolve(null),
      ]);

      if (result.success && result.data) {
        setLesson(result.data);

        if (curriculumResult?.success && curriculumResult.data) {
          const curriculumItem = curriculumResult.data.items.find(
            item => item.contentId === lessonId && (item.type === 'custom_lesson' || item.type === 'lesson')
          );
          setIsCompleted(curriculumItem?.status === 'completed');
        }
      } else if (result.success && !result.data) {
        toast.error('Lesson not found - it may not have been saved correctly');
        router.back();
      } else {
        toast.error(result.error?.message || 'Failed to load lesson');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load lesson:', error);
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!user?.id || !lessonId) return;

    try {
      setCompleting(true);

      // Get student's curriculum
      const curriculumResult = await customCurriculumService.getStudentCurriculum(user.id);
      if (!curriculumResult.success || !curriculumResult.data) {
        toast.error('Could not find your curriculum');
        return;
      }

      // Find the curriculum item for this lesson
      const curriculumItem = curriculumResult.data.items.find(
        item => item.contentId === lessonId && (item.type === 'custom_lesson' || item.type === 'lesson')
      );

      if (!curriculumItem) {
        toast.error('This lesson is not in your curriculum');
        return;
      }

      // Mark as completed
      const result = await customCurriculumService.markItemComplete(
        curriculumResult.data.id,
        curriculumItem.id,
        user.id
      );

      if (result.success) {
        setIsCompleted(true);
        toast.success('Lesson completed! Great job!');
      } else {
        toast.error('Failed to mark lesson as complete');
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      toast.error('Failed to mark lesson as complete');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-blue-50 px-6 py-6">
        <Button variant="ghost" onClick={() => router.push(getBackHref())} className="mb-4 text-slate-700 hover:bg-white/80">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backToSkillPage ? 'Back to Skill' : 'Back to Dashboard'}
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                <BookOpen className="h-3 w-3 mr-1" />
                Lesson
              </Badge>
              {lesson.estimatedTimeMinutes && (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {lesson.estimatedTimeMinutes} min
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2 text-slate-900">{lesson.title}</h1>
            <p className="text-slate-600">{lesson.description}</p>
          </div>
        </div>
      </div>

      {/* Video Section */}
      {lesson.videoUrl && (
        <Card className="border-red-100">
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
              {isYouTubeUrl(lesson.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(lesson.videoUrl)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                />
              ) : (
                <video
                  src={lesson.videoUrl}
                  controls
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Objectives */}
      {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Objectives
            </CardTitle>
            <CardDescription>
              What you'll learn in this lesson
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lesson.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      {lesson.content && (
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {lesson.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {lesson.tags && lesson.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {lesson.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Complete Button */}
      {user?.role === 'student' && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h3 className="font-semibold">
                {isCompleted ? 'Lesson Completed!' : 'Finished the lesson?'}
              </h3>
              <p className="text-sm text-slate-600">
                {isCompleted
                  ? 'Great job! You can review this lesson anytime.'
                  : 'Mark it as complete to track your progress'}
              </p>
            </div>
            <Button
              onClick={handleMarkComplete}
              disabled={completing || isCompleted}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {completing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : isCompleted ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completed
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
