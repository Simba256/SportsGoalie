'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SkeletonDetailPage } from '@/components/ui/skeletons';
import { chartingService } from '@/lib/database/services/charting.service';
import { dynamicChartingService } from '@/lib/database/services/dynamic-charting.service';
import { userService } from '@/lib/database/services/user.service';
import { ChartingEntry, Session, User as UserType } from '@/types';
import { DynamicChartingEntry } from '@/types/form-template';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminRoute } from '@/components/auth/protected-route';
import {
  ArrowLeft,
  Calendar,
  User as UserIcon,
  MapPin,
  Clock,
  ClipboardList,
  Flag,
} from 'lucide-react';
import { toast } from 'sonner';
import { ChartingEntryDetails } from '@/components/admin/charting/ChartingEntryDetails';

export default function AdminUserSessionDetailPage() {
  return (
    <AdminRoute>
      <SessionDetailContent />
    </AdminRoute>
  );
}

function SessionDetailContent() {
  const params = useParams();
  const userId = params.id as string;
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<ChartingEntry[]>([]);
  const [dynamicEntries, setDynamicEntries] = useState<DynamicChartingEntry[]>([]);
  const [goalie, setGoalie] = useState<UserType | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, userId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [sessionResult, entriesResult, dynamicResult, userResult] = await Promise.all([
        chartingService.getSession(sessionId),
        chartingService.getChartingEntriesBySession(sessionId),
        dynamicChartingService.getDynamicEntriesBySession(sessionId),
        userService.getUser(userId),
      ]);

      if (sessionResult.success && sessionResult.data) {
        setSession(sessionResult.data);
      } else {
        toast.error('Session not found');
      }

      if (entriesResult.success && entriesResult.data) {
        setEntries(entriesResult.data);
      }

      if (dynamicResult.success && dynamicResult.data) {
        setDynamicEntries(dynamicResult.data);
      }

      if (userResult.success && userResult.data) {
        setGoalie(userResult.data);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <SkeletonDetailPage />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Session not found.</p>
        <Button asChild variant="outline">
          <Link href={`/admin/users/${userId}?tab=charting`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Goalie
          </Link>
        </Button>
      </div>
    );
  }

  const sessionDate = session.date?.toDate?.() ?? new Date();
  const legacyEntry = entries[0];
  const latestDynamicEntry = dynamicEntries[0];

  const statusLabel = session.status.replace('-', ' ');
  const goalieName = goalie?.displayName || goalie?.email || `Student ${userId.slice(-6)}`;

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto max-w-5xl px-4 pt-4 md:px-6">
        {/* Back link */}
        <Link
          href={`/admin/users/${userId}?tab=charting`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {goalieName}'s charting tab
        </Link>

        {/* Header */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {session.type === 'game' ? '🥅' : '🏒'}{' '}
              {session.opponent || (session.type === 'game' ? 'Game Session' : 'Practice Session')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {goalieName} · {sessionDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {session.type}
            </Badge>
            <Badge
              variant={
                session.status === 'completed'
                  ? 'default'
                  : session.status === 'scheduled'
                  ? 'outline'
                  : 'secondary'
              }
              className="capitalize"
            >
              {statusLabel}
            </Badge>
            {session.result && (
              <Badge variant="outline" className="capitalize">
                {session.result}
              </Badge>
            )}
          </div>
        </div>

        {/* Session info card */}
        <Card className="mt-6 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Session Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="font-medium text-foreground">
                  {sessionDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p>
                <p className="font-medium text-foreground">
                  {sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Goalie</p>
                <p className="font-medium text-foreground truncate">{goalieName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Flag className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Type & Opponent</p>
                <p className="font-medium text-foreground">
                  {session.type === 'game' ? '🥅 Game' : '🏒 Practice'}
                  {session.opponent ? ` · ${session.opponent}` : ''}
                </p>
              </div>
            </div>

            {session.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                  <p className="font-medium text-foreground">{session.location}</p>
                </div>
              </div>
            )}

            {session.tags && session.tags.length > 0 && (
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Tags</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {session.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {legacyEntry?.submittedAt && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Charting entry submitted on{' '}
                {legacyEntry.submittedAt.toDate?.()?.toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                by <span className="capitalize">{legacyEntry.submitterRole || 'student'}</span>
              </p>
            </div>
          )}
        </Card>

        {/* Dynamic entries summary */}
        {dynamicEntries.length > 0 && (
          <Card className="mt-6 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">Dynamic Charting Entries</h2>
              <Badge variant="secondary">
                {dynamicEntries.length} {dynamicEntries.length === 1 ? 'entry' : 'entries'}
              </Badge>
            </div>
            <div className="space-y-3">
              {dynamicEntries.map((entry) => {
                const submitted = entry.submittedAt?.toDate?.();
                return (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={entry.isComplete ? 'default' : 'secondary'}>
                          {entry.isComplete ? 'Complete' : 'Partial'}
                        </Badge>
                        <Badge variant="outline">{entry.completionPercentage}% complete</Badge>
                        {entry.submitterRole === 'admin' && (
                          <Badge variant="outline">Admin Entry</Badge>
                        )}
                      </div>
                      {submitted && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Submitted {submitted.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {latestDynamicEntry && latestDynamicEntry.completionPercentage < 100 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Showing counts only. Full dynamic-form responses aren't rendered on this page yet.
              </p>
            )}
          </Card>
        )}

        {/* Legacy entry full details OR not-charted state */}
        {legacyEntry ? (
          <div className="mt-6">
            <ChartingEntryDetails entry={legacyEntry} />
          </div>
        ) : dynamicEntries.length === 0 ? (
          <Card className="mt-6 p-8 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold text-foreground">Session not charted yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This session has no charting entries submitted. The goalie or an admin can chart it from the goalie portal.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
