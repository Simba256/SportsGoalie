'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import { chartingService, formTemplateService } from '@/lib/database';
import { dynamicChartingService } from '@/lib/database/services/dynamic-charting.service';
import { Session, ChartingEntry, FormTemplate, DynamicChartingEntry } from '@/types';
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
  BarChart3,
  Brain,
  Timer,
  MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DynamicSessionAnalytics } from '@/components/charting/DynamicSessionAnalytics';

export default function SessionDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<ChartingEntry[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<FormTemplate | null>(null);
  const [dynamicEntry, setDynamicEntry] = useState<DynamicChartingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSessionData = useCallback(async () => {
    if (!sessionId || !user) return;

    try {
      setLoading(true);

      const [sessionResult, entriesResult, templateResult, dynamicEntriesResult] = await Promise.all([
        chartingService.getSession(sessionId),
        chartingService.getChartingEntriesBySession(sessionId),
        formTemplateService.getActiveTemplate(),
        dynamicChartingService.getDynamicEntriesBySession(sessionId),
      ]);

      if (sessionResult.success && sessionResult.data) {
        setSession(sessionResult.data);
      }

      if (entriesResult.success && entriesResult.data) {
        setEntries(entriesResult.data);
      }

      if (templateResult.success && templateResult.data) {
        setActiveTemplate(templateResult.data);
      } else {
        setActiveTemplate(null);
      }

      if (dynamicEntriesResult.success && dynamicEntriesResult.data) {
        console.log('📊 [SESSION] Dynamic entries loaded:', {
          totalEntries: dynamicEntriesResult.data.length,
          entries: dynamicEntriesResult.data.map(e => ({
            id: e.id,
            submittedBy: e.submittedBy,
            sessionId: e.sessionId
          })),
          currentUserId: user.id,
        });
        const userEntry = dynamicEntriesResult.data.find((e) => e.submittedBy === user.id);
        console.log('📊 [SESSION] User entry found:', userEntry ? userEntry.id : 'NONE');
        setDynamicEntry(userEntry || null);
      } else {
        console.log('📊 [SESSION] No dynamic entries found or error:', dynamicEntriesResult);
        setDynamicEntry(null);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  // Always reload on mount and when dependencies change (including pathname and search params for route changes)
  useEffect(() => {
    if (user) {
      loadSessionData();
    }
  }, [sessionId, user, refreshKey, loadSessionData, pathname, searchParams]);

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
      <div className="min-h-screen bg-gray-50 p-6">
        <SkeletonContentPage />
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
  const sessionDateObj = (() => {
    const rawDate = session.date as unknown;
    if (rawDate && typeof rawDate === 'object' && 'toDate' in rawDate && typeof (rawDate as { toDate?: unknown }).toDate === 'function') {
      const converted = (rawDate as { toDate: () => Date }).toDate();
      if (!Number.isNaN(converted.getTime())) {
        return converted;
      }
    }
    if (rawDate instanceof Date) {
      if (!Number.isNaN(rawDate.getTime())) {
        return rawDate;
      }
    }
    if (rawDate && typeof rawDate === 'object') {
      const maybeSeconds =
        (rawDate as { seconds?: unknown; _seconds?: unknown }).seconds ??
        (rawDate as { seconds?: unknown; _seconds?: unknown })._seconds;
      if (typeof maybeSeconds === 'number') {
        const parsed = new Date(maybeSeconds * 1000);
        if (!Number.isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }
    if (typeof rawDate === 'string' || typeof rawDate === 'number') {
      const parsed = new Date(rawDate);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return null;
  })();

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
                  {session.opponent && (session.type === 'game' ? ` vs ${session.opponent}` : ` - ${session.opponent}`)}
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
                    {sessionDateObj
                      ? `${sessionDateObj.toLocaleDateString()} at ${sessionDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Date unavailable'}
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

        {/* V2 Practice Chart Section */}
        {session.type === 'practice' && (
          <Card className="p-4 sm:p-6 border-2 border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Practice Chart</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 ml-10">
              Index-driven practice reflection — every minute intentional
            </p>

            <div
              onClick={() => router.push(`/charting/sessions/${sessionId}/v2/practice`)}
              className={`relative p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                !!(myEntry as unknown as Record<string, unknown> | undefined)?.v2Practice
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !!(myEntry as unknown as Record<string, unknown> | undefined)?.v2Practice
                      ? 'bg-blue-500'
                      : 'bg-gray-100'
                  }`}
                >
                  <ClipboardCheck
                    className={`w-5 h-5 ${
                      !!(myEntry as unknown as Record<string, unknown> | undefined)?.v2Practice
                        ? 'text-white'
                        : 'text-gray-500'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900">Open Practice Chart</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Practice Index · Value rating · Technical eye · Mind Vault
                  </p>
                </div>
                {!!(myEntry as unknown as Record<string, unknown> | undefined)?.v2Practice && (
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </div>
          </Card>
        )}

        {/* V2 Game Chart Sections */}
        {session.type === 'game' && (
          <Card className="p-6 border-2 border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Game Chart</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4 ml-10">
              Post-game self-assessment — chart from memory
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pre-Game */}
              <div
                onClick={() => router.push(`/charting/sessions/${sessionId}/v2/pre-game`)}
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  !!(myEntry as unknown as Record<string, unknown> | undefined)?.v2PreGame
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    !!(myEntry as unknown as Record<string, unknown> | undefined)?.v2PreGame ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <Timer className={`w-5 h-5 ${!!(myEntry as unknown as Record<string, unknown> | undefined)?.v2PreGame ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Pre-Game</p>
                    <p className="text-xs text-gray-500">Mind management</p>
                  </div>
                  {!!(myEntry as unknown as Record<string, unknown> | undefined)?.v2PreGame && (
                    <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-500" />
                  )}
                </div>
              </div>

              {/* Periods */}
              <div
                onClick={() => router.push(`/charting/sessions/${sessionId}/v2/periods`)}
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  !!(myEntry as unknown as Record<string, unknown> | undefined)?.v2Periods
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    !!(myEntry as unknown as Record<string, unknown> | undefined)?.v2Periods ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <BarChart3 className={`w-5 h-5 ${!!(myEntry as unknown as Record<string, unknown> | undefined)?.v2Periods ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Periods</p>
                    <p className="text-xs text-gray-500">P1 · P2 · P3 · OT</p>
                  </div>
                  {!!(myEntry as unknown as Record<string, unknown> | undefined)?.v2Periods && (
                    <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-500" />
                  )}
                </div>
              </div>

              {/* Post-Game */}
              <div
                onClick={() => router.push(`/charting/sessions/${sessionId}/v2/post-game`)}
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  !!(myEntry as unknown as Record<string, unknown> | undefined)?.v2PostGame
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    !!(myEntry as unknown as Record<string, unknown> | undefined)?.v2PostGame ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <MessageSquare className={`w-5 h-5 ${!!(myEntry as unknown as Record<string, unknown> | undefined)?.v2PostGame ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Post-Game</p>
                    <p className="text-xs text-gray-500">Review & Mind Vault</p>
                  </div>
                  {!!(myEntry as unknown as Record<string, unknown> | undefined)?.v2PostGame && (
                    <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-500" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

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

        {/* Session Analytics - Dynamic Forms */}
        {activeTemplate && dynamicEntry && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold">Session Analytics</h3>
            </div>
            <DynamicSessionAnalytics template={activeTemplate} entry={dynamicEntry} />
          </Card>
        )}

        {/* Session Analytics - Only show for legacy charting system */}
        {!activeTemplate && (
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
        )}
      </div>
    </div>
  );
}
