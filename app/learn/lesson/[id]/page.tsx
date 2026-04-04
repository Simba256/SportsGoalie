'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const { user } = useAuth();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<CustomContentLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      console.log('📖 Loading lesson:', lessonId);
      const result = await customContentService.getContent(lessonId);
      console.log('📖 Lesson result:', result);

      if (result.success && result.data) {
        setLesson(result.data);
      } else if (result.success && !result.data) {
        // Content doesn't exist in database
        console.error('📖 Lesson not found in database:', lessonId);
        toast.error('Lesson not found - it may not have been saved correctly');
        router.back();
      } else {
        // Permission or other error
        console.error('📖 Error loading lesson:', result.error);
        toast.error(result.error?.message || 'Failed to load lesson');
        router.back();
      }
    } catch (error) {
      console.error('📖 Exception loading lesson:', error);
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#0f0f13] via-[#1a1a2e] to-[#16213e] rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-blue-100 hover:text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Lesson
                </Badge>
                {lesson.estimatedTimeMinutes && (
                  <Badge variant="outline" className="border-zinc-300 text-zinc-200 bg-white/5">
                    <Clock className="h-3 w-3 mr-1" />
                    {lesson.estimatedTimeMinutes} min
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-black text-white mb-2">{lesson.title}</h1>
              <p className="text-blue-100/80">{lesson.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section */}
      {lesson.videoUrl && (
        <Card className="mb-6">
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
        <Card className="border-blue-200 bg-white shadow-sm">
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
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      {lesson.content && (
        <Card className="border-zinc-200 bg-white shadow-sm">
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
        <div className="flex flex-wrap gap-2 mb-6">
          {lesson.tags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Complete Button */}
      {user?.role === 'student' && (
        <Card className="border-red-200 bg-red-50/40">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h3 className="font-semibold">
                {isCompleted ? 'Lesson Completed!' : 'Finished the lesson?'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isCompleted
                  ? 'Great job! You can review this lesson anytime.'
                  : 'Mark it as complete to track your progress'}
              </p>
            </div>
            <Button
              onClick={handleMarkComplete}
              disabled={completing || isCompleted}
              size="lg"
              className={isCompleted ? 'bg-zinc-700 text-white' : 'bg-red-600 text-white hover:bg-red-700'}
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
