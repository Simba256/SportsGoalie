'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { LessonCreator } from '@/components/coach/lesson-creator';
import { CustomContentLibrary } from '@/types';
import { SkeletonContentPage } from '@/components/ui/skeletons';

export default function NewLessonPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleSave = (_content: CustomContentLibrary) => {
    router.push('/coach/content');
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      router.push('/coach/content');
    }
  };

  if (authLoading || !user) {
    return <SkeletonContentPage />;
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
