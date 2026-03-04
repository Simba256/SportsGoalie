'use client';

import { useMemo, useEffect, useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { userService } from '@/lib/database';

interface Props {
  className?: string;
}

export function CoachBreadcrumb({ className }: Props) {
  const pathname = usePathname();
  const params = useParams();
  const [studentName, setStudentName] = useState<string | null>(null);

  // Fetch student name if we're on a student-related page
  useEffect(() => {
    const studentId = params.studentId as string | undefined;
    if (studentId) {
      userService.getUser(studentId).then((result) => {
        if (result.success && result.data) {
          setStudentName(result.data.displayName);
        }
      }).catch(() => {
        // Silently fail - breadcrumb will show generic label
        setStudentName(null);
      });
    } else {
      setStudentName(null);
    }
  }, [params.studentId]);

  const items = useMemo<BreadcrumbItem[]>(() => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Skip if not in coach section or just /coach
    if (segments[0] !== 'coach') return [];

    // Add Coach > Dashboard for the root
    if (segments.length === 1) {
      breadcrumbs.push({ label: 'Dashboard', current: true });
      return breadcrumbs;
    }

    // Build breadcrumbs based on path segments
    let currentPath = '/coach';

    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;

      // Handle known routes
      if (segment === 'students') {
        breadcrumbs.push({
          label: 'My Students',
          href: '/coach/students',
          current: isLast,
        });
        currentPath = '/coach/students';
      } else if (segment === 'content') {
        breadcrumbs.push({
          label: 'Content Library',
          href: '/coach/content',
          current: isLast,
        });
        currentPath = '/coach/content';
      } else if (segment === 'curriculum') {
        // Student curriculum page
        const studentId = params.studentId as string;
        breadcrumbs.push({
          label: studentName ? `${studentName}'s Curriculum` : 'Curriculum',
          href: `/coach/students/${studentId}/curriculum`,
          current: isLast,
        });
      } else if (segment === 'quiz') {
        currentPath += '/quiz';
        // Only add if next segment exists (create, edit, etc.)
        if (i + 1 < segments.length) {
          continue; // Skip, will be handled with next segment
        }
      } else if (segment === 'lesson') {
        currentPath += '/lesson';
        // Only add if next segment exists (new, edit, etc.)
        if (i + 1 < segments.length) {
          continue; // Skip, will be handled with next segment
        }
      } else if (segment === 'create') {
        // Quiz create page
        if (segments[i - 1] === 'quiz') {
          breadcrumbs.push({
            label: 'Create Quiz',
            current: isLast,
          });
        }
      } else if (segment === 'new') {
        // New lesson or quiz page
        if (segments[i - 1] === 'lesson') {
          breadcrumbs.push({
            label: 'New Lesson',
            current: isLast,
          });
        } else if (segments[i - 1] === 'quiz') {
          breadcrumbs.push({
            label: 'New Quiz',
            current: isLast,
          });
        }
      } else if (segment === 'edit') {
        // Edit page
        if (segments[i - 2] === 'lesson') {
          breadcrumbs.push({
            label: 'Edit Lesson',
            current: isLast,
          });
        } else if (segments[i - 2] === 'quiz') {
          breadcrumbs.push({
            label: 'Edit Quiz',
            current: isLast,
          });
        }
      } else if (params.studentId === segment) {
        // Skip the student ID segment, will be combined with curriculum
        continue;
      } else if (params.id === segment) {
        // Skip content IDs, they're handled by the edit label
        continue;
      }
    }

    return breadcrumbs;
  }, [pathname, params, studentName]);

  // Don't render if no breadcrumb items
  if (items.length === 0) return null;

  return <Breadcrumb items={items} className={className} />;
}
