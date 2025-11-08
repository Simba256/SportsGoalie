'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, ChartingEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ClipboardCheck,
  CheckCircle,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChartingFormWrapper } from './chart/ChartingFormWrapper';
import LegacyChartingForm from './chart/LegacyChartingForm';

export default function SessionDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<ChartingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSessionData = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);

      const [sessionResult, entriesResult] = await Promise.all([
        chartingService.getSession(sessionId),
        chartingService.getChartingEntriesBySession(sessionId),
      ]);

      if (sessionResult.success && sessionResult.data) {
        setSession(sessionResult.data);
      }

      if (entriesResult.success && entriesResult.data) {
        setEntries(entriesResult.data);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Always reload on mount and when dependencies change (including pathname for route changes)
  useEffect(() => {
    if (user) {
      loadSessionData();
    }
  }, [sessionId, user, refreshKey, loadSessionData, pathname]);

  // Reload data when window gains focus (user returns to page/tab)
  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleDeleteSession = async () => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await chartingService.deleteSession(sessionId);
      if (result.success) {
        router.push('/charting');
      } else {
        alert('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('An error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'pre-game':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Session not found</p>
          <Button onClick={() => router.push('/charting')}>Back to Sessions</Button>
        </div>
      </div>
    );
  }

  const myEntry = entries.find((e) => e.submittedBy === user?.id);
  const adminEntries = entries.filter((e) => e.submitterRole === 'admin');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/charting')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {session.type === 'game' ? '🥅 Game' : '🏒 Practice'}
                  {session.opponent && ` vs ${session.opponent}`}
                </h1>
                <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                {session.result && (
                  <Badge variant="outline" className="capitalize">
                    {session.result}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {session.date.toDate().toLocaleDateString()} at{' '}
                    {session.date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {session.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{session.location}</span>
                  </div>
                )}
              </div>
              {session.tags && session.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {session.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" title="Edit Session">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDeleteSession} title="Delete Session">
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>

        {/* Performance Charting Form */}
        <ChartingFormWrapper
          session={session}
          userId={user.id}
          userRole={(user.role || 'student') as 'student' | 'admin'}
          onSave={loadSessionData}
          LegacyForm={() => <LegacyChartingForm session={session} user={user} />}
        />


        {/* Coach/Admin Entries */}
        {adminEntries.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Coach/Admin Observations</h3>
            <div className="space-y-3">
              {adminEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Admin Observation</p>
                    <p className="text-sm text-gray-600">
                      {entry.submittedAt && typeof entry.submittedAt.toDate === 'function'
                        ? formatDistanceToNow(entry.submittedAt.toDate(), { addSuffix: true })
                        : 'Recently'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/charting/sessions/${sessionId}/chart/${entry.id}`)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Session Analytics */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-bold">Session Analytics</h3>
          </div>

          {myEntry ? (
            <div className="space-y-6">
              {/* Game Overview Stats */}
              {myEntry.gameOverview && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Game Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Good Goals</p>
                      <p className="text-3xl font-bold text-green-700">
                        {(myEntry.gameOverview.goodGoals.period1 || 0) +
                          (myEntry.gameOverview.goodGoals.period2 || 0) +
                          (myEntry.gameOverview.goodGoals.period3 || 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        P1: {myEntry.gameOverview.goodGoals.period1 || 0} |
                        P2: {myEntry.gameOverview.goodGoals.period2 || 0} |
                        P3: {myEntry.gameOverview.goodGoals.period3 || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Bad Goals</p>
                      <p className="text-3xl font-bold text-red-700">
                        {(myEntry.gameOverview.badGoals.period1 || 0) +
                          (myEntry.gameOverview.badGoals.period2 || 0) +
                          (myEntry.gameOverview.badGoals.period3 || 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        P1: {myEntry.gameOverview.badGoals.period1 || 0} |
                        P2: {myEntry.gameOverview.badGoals.period2 || 0} |
                        P3: {myEntry.gameOverview.badGoals.period3 || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Avg Challenge</p>
                      <p className="text-3xl font-bold text-blue-700">
                        {(
                          ((myEntry.gameOverview.degreeOfChallenge.period1 || 0) +
                            (myEntry.gameOverview.degreeOfChallenge.period2 || 0) +
                            (myEntry.gameOverview.degreeOfChallenge.period3 || 0)) /
                          3
                        ).toFixed(1)}
                        <span className="text-base">/10</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        P1: {myEntry.gameOverview.degreeOfChallenge.period1 || 0} |
                        P2: {myEntry.gameOverview.degreeOfChallenge.period2 || 0} |
                        P3: {myEntry.gameOverview.degreeOfChallenge.period3 || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Period Performance Summary */}
              {(myEntry.period1 || myEntry.period2 || myEntry.period3) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Period Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {myEntry.period1 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Period 1</p>
                        <div className="space-y-1 text-xs">
                          {myEntry.period1.mindSet?.focusConsistent?.value && (
                            <p className="text-green-600">✓ Focus: Consistent</p>
                          )}
                          {myEntry.period1.mindSet?.focusInconsistent?.value && (
                            <p className="text-yellow-600">⚠ Focus: Inconsistent</p>
                          )}
                          {myEntry.period1.skating?.inSync?.value && (
                            <p className="text-green-600">✓ Skating: In Sync</p>
                          )}
                          {myEntry.period1.skating?.notInSync?.value && (
                            <p className="text-red-600">✗ Skating: Not In Sync</p>
                          )}
                        </div>
                      </div>
                    )}
                    {myEntry.period2 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Period 2</p>
                        <div className="space-y-1 text-xs">
                          {myEntry.period2.mindSet?.focusConsistent?.value && (
                            <p className="text-green-600">✓ Focus: Consistent</p>
                          )}
                          {myEntry.period2.mindSet?.focusInconsistent?.value && (
                            <p className="text-yellow-600">⚠ Focus: Inconsistent</p>
                          )}
                          {myEntry.period2.skating?.inSync?.value && (
                            <p className="text-green-600">✓ Skating: In Sync</p>
                          )}
                          {myEntry.period2.skating?.notInSync?.value && (
                            <p className="text-red-600">✗ Skating: Not In Sync</p>
                          )}
                        </div>
                      </div>
                    )}
                    {myEntry.period3 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Period 3</p>
                        <div className="space-y-1 text-xs">
                          {myEntry.period3.mindSet?.focusConsistent?.value && (
                            <p className="text-green-600">✓ Focus: Consistent</p>
                          )}
                          {myEntry.period3.mindSet?.focusInconsistent?.value && (
                            <p className="text-yellow-600">⚠ Focus: Inconsistent</p>
                          )}
                          {myEntry.period3.skating?.inSync?.value && (
                            <p className="text-green-600">✓ Skating: In Sync</p>
                          )}
                          {myEntry.period3.skating?.notInSync?.value && (
                            <p className="text-red-600">✗ Skating: Not In Sync</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Overtime & Shootout Stats */}
              {(myEntry.overtime || myEntry.shootout) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Extended Play</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myEntry.overtime && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Overtime</p>
                        <div className="space-y-1 text-xs">
                          {myEntry.overtime.mindSetFocus?.good?.value && (
                            <p className="text-green-600">✓ Focus: Good</p>
                          )}
                          {myEntry.overtime.mindSetFocus?.needsWork?.value && (
                            <p className="text-yellow-600">⚠ Focus: Needs Work</p>
                          )}
                          {myEntry.overtime.skatingPerformance?.good?.value && (
                            <p className="text-green-600">✓ Skating: Good</p>
                          )}
                          {myEntry.overtime.positionalGame?.good?.value && (
                            <p className="text-green-600">✓ Positioning: Good</p>
                          )}
                        </div>
                      </div>
                    )}
                    {myEntry.shootout && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Shootout</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Result:</span>
                            <span className={`text-sm font-bold ${myEntry.shootout.result === 'won' ? 'text-green-600' : 'text-red-600'}`}>
                              {myEntry.shootout.result?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Saves:</span>
                            <span className="text-sm font-semibold">{myEntry.shootout.shotsSaved || 0}/10</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Save %:</span>
                            <span className="text-sm font-semibold">
                              {myEntry.shootout.shotsSaved && (myEntry.shootout.shotsSaved + myEntry.shootout.shotsScored) > 0
                                ? ((myEntry.shootout.shotsSaved / (myEntry.shootout.shotsSaved + myEntry.shootout.shotsScored)) * 100).toFixed(0)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Comments */}
              {myEntry.additionalComments && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Additional Notes</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{myEntry.additionalComments}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No charting data available yet</p>
              <p className="text-sm text-gray-500 mt-2">Fill out the charting sections above to see analytics here</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
