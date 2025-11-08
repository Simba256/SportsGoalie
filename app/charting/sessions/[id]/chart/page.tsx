'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ChartingFormWrapper } from './ChartingFormWrapper';
import  LegacyChartingForm from './LegacyChartingForm';

export default function ChartingFormPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId && user) {
      loadSession();
    }
  }, [sessionId, user]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const result = await chartingService.getSession(sessionId);

      if (result.success && result.data) {
        setSession(result.data);
      } else {
        console.error('Failed to load session');
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComplete = () => {
    // Refresh session data if needed
    loadSession();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Session not found</p>
          <Button onClick={() => router.push('/charting')}>Back to Sessions</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chart Performance</h1>
            <p className="text-gray-600 mt-1">
              {session.type === 'game' ? '🥅 Game' : '🏒 Practice'}
              {session.opponent && ` vs ${session.opponent}`}
            </p>
          </div>
        </div>

        {/* Form Wrapper - handles dynamic vs legacy forms */}
        <ChartingFormWrapper
          session={session}
          userId={user.id}
          userRole={(user.role || 'student') as 'student' | 'admin'}
          onSave={handleSaveComplete}
          LegacyForm={() => <LegacyChartingForm session={session} user={user} />}
        />
      </div>
    </div>
  );
}
