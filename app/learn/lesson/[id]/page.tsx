'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { Loader2, ArrowLeft, BookOpen, Clock, Target, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { customContentService, customCurriculumService } from '@/lib/database';
import { CustomContentLibrary } from '@/types';
import { toast } from 'sonner';
import { GrowthPointsToast } from '@/components/ui/GrowthPointsToast';
import { GROWTH_POINTS } from '@/lib/config/growth-points';
import { growthPointsService } from '@/lib/firebase/growth-points.service';

const BLUE = '#37b5ff';
const RED = '#f87171';

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function getYouTubeEmbedUrl(url: string): string {
  let videoId = '';
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtube.com/embed/')) {
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
  const [showGpToast, setShowGpToast] = useState(false);

  const getBackHref = () => {
    if (!backToSkillPage) return '/dashboard';
    if (!isCompleted) return `/pillars/${pillarId}/skills/${skillId}`;
    return `/pillars/${pillarId}/skills/${skillId}?completedContentId=${lessonId}&completedAt=${Date.now()}`;
  };

  useEffect(() => {
    if (lessonId) { loadLesson(); }
  }, [lessonId, user?.id]);

  const loadLesson = async () => {
    try {
      setLoading(true);
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
      const curriculumResult = await customCurriculumService.getStudentCurriculum(user.id);
      if (!curriculumResult.success || !curriculumResult.data) {
        toast.error('Could not find your curriculum');
        return;
      }
      const curriculumItem = curriculumResult.data.items.find(
        item => item.contentId === lessonId && (item.type === 'custom_lesson' || item.type === 'lesson')
      );
      if (!curriculumItem) {
        toast.error('This lesson is not in your curriculum');
        return;
      }
      const result = await customCurriculumService.markItemComplete(
        curriculumResult.data.id, curriculumItem.id, user.id
      );
      if (result.success) {
        setIsCompleted(true);
        setShowGpToast(true);
        toast.success('Lesson completed! Great job!');
        growthPointsService.awardPointsOnce(
          user.id,
          'MODULE_COMPLETE',
          GROWTH_POINTS.MODULE_COMPLETE,
          'Module Completed',
          `lesson_${lessonId}`
        ).catch(() => {});
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
    return <div style={{ minHeight: '60vh', padding: '24px' }}><SkeletonContentPage /></div>;
  }

  if (!lesson) return null;

  const cardStyle = { background: 'rgba(2,18,44,0.82)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '16px', overflow: 'hidden' };

  return (
    <>
      <GrowthPointsToast points={GROWTH_POINTS.MODULE_COMPLETE} show={showGpToast} />
      <style>{`
        .lesson-complete:hover:not(:disabled) { opacity: 0.9 !important; transform: translateY(-1px); }
        .lesson-back:hover { color: #fff !important; }
        @keyframes ls-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', border: '1px solid rgba(55,181,255,0.2)', background: 'linear-gradient(135deg, #000f28 0%, #062344 50%, #0a1628 100%)', padding: '24px', boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(55,181,255,0.08)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(248,113,113,0.05)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <button
            onClick={() => router.push(getBackHref())}
            className="lesson-back"
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.45)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, marginBottom: '16px', transition: 'color 0.2s', padding: 0 }}
          >
            <ArrowLeft size={14} />
            {backToSkillPage ? 'Back to Skill' : 'Back to Dashboard'}
          </button>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(55,181,255,0.25)', color: BLUE, fontSize: '11px', fontWeight: 700 }}>
                <BookOpen size={11} /> Lesson
              </span>
              {lesson.estimatedTimeMinutes && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 600 }}>
                  <Clock size={11} /> {lesson.estimatedTimeMinutes} min
                </span>
              )}
              {isCompleted && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontSize: '11px', fontWeight: 700 }}>
                  <CheckCircle2 size={11} /> Completed
                </span>
              )}
            </div>
            <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.02em' }}>{lesson.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{lesson.description}</p>
          </div>
        </div>

        {/* Video */}
        {lesson.videoUrl && (
          <div style={cardStyle}>
            <div style={{ aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
              {isYouTubeUrl(lesson.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(lesson.videoUrl)}
                  style={{ width: '100%', height: '100%' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                />
              ) : (
                <video src={lesson.videoUrl} controls style={{ width: '100%', height: '100%' }}>
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        )}

        {/* Learning Objectives */}
        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
          <div style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Target size={18} color={BLUE} />
              <h2 style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>Learning Objectives</h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '16px' }}>What you'll learn in this lesson</p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}>
              {lesson.learningObjectives.map((objective, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={16} color={RED} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.6 }}>{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lesson Content */}
        {lesson.content && (
          <div style={{ ...cardStyle, padding: '24px' }}>
            <h2 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Lesson Content</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lesson.content.split('\n').map((paragraph, index) => (
                <p key={index} style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', lineHeight: 1.7 }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {lesson.tags && lesson.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {lesson.tags.map((tag, index) => (
              <span key={index} style={{ padding: '5px 12px', borderRadius: '20px', background: 'rgba(55,181,255,0.08)', border: '1px solid rgba(55,181,255,0.2)', color: BLUE, fontSize: '11px', fontWeight: 700 }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Complete Button */}
        {user?.role === 'student' && (
          <div style={{ background: isCompleted ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)', border: `1px solid ${isCompleted ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.18)'}`, borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                {isCompleted ? 'Lesson Completed!' : 'Finished the lesson?'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                {isCompleted
                  ? 'Great job! You can review this lesson anytime.'
                  : 'Mark it as complete to track your progress'}
              </p>
            </div>
            <button
              onClick={handleMarkComplete}
              disabled={completing || isCompleted}
              className="lesson-complete"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '10px', border: 'none', background: isCompleted ? 'rgba(52,211,153,0.15)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: isCompleted ? '#34d399' : '#fff', fontSize: '13px', fontWeight: 700, cursor: completing || isCompleted ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: isCompleted ? 'none' : '0 4px 16px rgba(220,38,38,0.3)', whiteSpace: 'nowrap', opacity: completing ? 0.7 : 1 }}
            >
              {completing ? (
                <><Loader2 size={16} style={{ animation: 'ls-spin 1s linear infinite' }} />Completing...</>
              ) : isCompleted ? (
                <><CheckCircle2 size={16} />Completed</>
              ) : (
                <><CheckCircle2 size={16} />Mark Complete</>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
