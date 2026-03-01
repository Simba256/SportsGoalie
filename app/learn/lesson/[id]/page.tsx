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
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { customContentService, customCurriculumService } from '@/lib/database';
import { CustomContentLibrary } from '@/types';
import { toast } from 'sonner';

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
      const result = await customContentService.getContent(lessonId);
      if (result.success && result.data) {
        setLesson(result.data);
      } else {
        toast.error('Lesson not found');
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
      const result = await customCurriculumService.recordLessonCompletion(
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
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
            <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-muted-foreground">{lesson.description}</p>
          </div>
        </div>
      </div>

      {/* Video Section */}
      {lesson.videoUrl && (
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
              <video
                src={lesson.videoUrl}
                controls
                className="w-full h-full"
                poster="/video-placeholder.png"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Objectives */}
      {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="border-primary/20 bg-primary/5">
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
