'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SkeletonDetailPage } from '@/components/ui/skeletons';
import { chartingService } from '@/lib/database';
import { ChartingEntry, Session } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminRoute } from '@/components/auth/protected-route';
import { ArrowLeft, Calendar, User, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ChartingEntryDetails } from '@/components/admin/charting/ChartingEntryDetails';

export default function AdminChartingEntryDetailPage() {
  return (
    <AdminRoute>
      <EntryDetailContent />
    </AdminRoute>
  );
}

function EntryDetailContent() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<ChartingEntry | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    loadData();
  }, [entryId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const entryResult = await chartingService.getChartingEntry(entryId);

      if (entryResult.success && entryResult.data) {
        setEntry(entryResult.data);

        // Load the session
        const sessionResult = await chartingService.getSession(entryResult.data.sessionId);
        if (sessionResult.success && sessionResult.data) {
          setSession(sessionResult.data);
        }
      } else {
        toast.error('Entry not found');
        router.push('/admin/charting');
      }
    } catch (error) {
      console.error('Failed to load entry:', error);
      toast.error('Failed to load entry details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <SkeletonDetailPage />
      </div>
    );
  }

  if (!entry || !session) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p>Entry not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/charting')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              Charting Entry Details (Admin)
            </h1>
            <p className="text-muted-foreground">Complete charting data for this session</p>
          </div>
          <Badge variant={entry.submitterRole === 'admin' ? 'default' : 'secondary'}>
            {entry.submitterRole === 'admin' ? 'Admin Entry' : 'Student Entry'}
          </Badge>
        </div>

        {/* Session Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Session Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {session.date.toDate().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">
                  {session.date.toDate().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Type & Opponent</p>
                <p className="font-medium">
                  {session.type === 'game' ? '🥅' : '🏒'} {session.opponent || 'Practice Session'}
                </p>
              </div>
            </div>

            {session.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{session.location}</p>
                </div>
              </div>
            )}
          </div>

          {entry.submittedAt && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Submitted on{' '}
                {entry.submittedAt.toDate().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </Card>

        {/* Full charting entry details */}
        <ChartingEntryDetails entry={entry} />
      </div>
    </div>
  );
}
