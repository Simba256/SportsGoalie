'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { LessonCreator } from '@/components/coach/lesson-creator';
import { Loader2 } from 'lucide-react';
import { CustomContentLibrary } from '@/types';

export default function NewLessonPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleSave = (content: CustomContentLibrary) => {
    router.push('/coach/content');
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      router.push('/coach/content');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <LessonCreator
      open={isOpen}
      onOpenChange={handleClose}
      coachId={user.id}
      onSave={handleSave}
    />
  );
}
