'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { QuizCreator } from '@/components/coach/quiz-creator';
import { customContentService } from '@/lib/database';
import { CustomContentLibrary } from '@/types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState<CustomContentLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  const contentId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (contentId && user?.id) {
      loadContent();
    }
  }, [contentId, user?.id]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const result = await customContentService.getContent(contentId);

      if (result.success && result.data) {
        // Verify ownership
        if (result.data.createdBy !== user?.id) {
          toast.error('You do not have permission to edit this content');
          router.push('/coach/content');
          return;
        }

        if (result.data.type !== 'quiz') {
          toast.error('This content is not a quiz');
          router.push('/coach/content');
          return;
        }

        setContent(result.data);
      } else {
        toast.error('Content not found');
        router.push('/coach/content');
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      toast.error('Failed to load content');
      router.push('/coach/content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (updatedContent: CustomContentLibrary) => {
    toast.success('Quiz updated successfully');
    router.push('/coach/content');
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      router.push('/coach/content');
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <QuizCreator
      open={isOpen}
      onOpenChange={handleClose}
      coachId={user.id}
      onSave={handleSave}
      editContent={content}
    />
  );
}
