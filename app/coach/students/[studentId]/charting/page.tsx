'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, LineChart } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { userService } from '@/lib/database';
import { User as UserType } from '@/types';
import { toast } from 'sonner';
import { GoalieChartingHistory } from '@/components/charting/GoalieChartingHistory';

export default function CoachStudentChartingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const load = async () => {
      setLoading(true);
      try {
        const result = await userService.getUser(studentId);
        if (result.success && result.data) {
          if (
            user?.role === 'coach' &&
            result.data.assignedCoachId !== user.id
          ) {
            toast.error('This student is not on your roster');
            router.push('/coach/students');
            return;
          }
          setStudent(result.data);
        } else {
          toast.error('Student not found');
          router.push('/coach/students');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load student');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <SkeletonContentPage />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-slate-600">Student not found</p>
          <Button variant="outline" asChild>
            <Link href="/coach/students">Back to Students</Link>
          </Button>
        </div>
      </div>
    );
  }

  const initials = (student.displayName || student.email || 'G')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/coach/students" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Students
          </Link>
        </Button>

        {/* Header card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={student.profileImage} alt={student.displayName} />
                <AvatarFallback className="bg-blue-50 text-blue-700 text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <LineChart className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Charting History
                  </p>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 truncate">
                  {student.displayName}
                </h1>
                {student.email && (
                  <p className="text-sm text-slate-500 truncate">{student.email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Game & Practice Charts</CardTitle>
            <CardDescription>
              Review every session this goalie has charted. Expand a row to read the full
              reflection, Mind Vault entries, and ratings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoalieChartingHistory
              studentId={studentId}
              onOpenSession={(sessionId) =>
                router.push(`/charting/sessions/${sessionId}`)
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
