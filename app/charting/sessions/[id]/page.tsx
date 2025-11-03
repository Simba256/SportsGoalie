'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, ChartingEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  ClipboardCheck,
  CheckCircle,
  BarChart3,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function SessionDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<ChartingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  const loadSessionData = async () => {
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
  };

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
            <Button variant="outline" size="icon" onClick={() => router.back()}>
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

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="entries" className="gap-2">
              <Users className="w-4 h-4" />
              Charting Entries ({entries.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Session Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium capitalize">{session.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{session.status}</p>
                </div>
                {session.opponent && (
                  <div>
                    <p className="text-sm text-gray-600">Opponent</p>
                    <p className="font-medium">{session.opponent}</p>
                  </div>
                )}
                {session.location && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{session.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">
                    {formatDistanceToNow(session.createdAt.toDate(), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Card>

            {/* Charting Sections */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Charting Sections</h2>
              <p className="text-sm text-gray-600 mb-4">Fill out any section at any time - they're completely independent!</p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => router.push(`/charting/sessions/${sessionId}/pre-game`)}
                  variant={myEntry?.preGame ? "outline" : "default"}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Pre-Game Checklist
                  </span>
                  {myEntry?.preGame && <CheckCircle className="w-4 h-4 text-green-500" />}
                </Button>

                <Button
                  onClick={() => router.push(`/charting/sessions/${sessionId}/game-overview`)}
                  variant={myEntry?.gameOverview ? "outline" : "default"}
                  className="w-full justify-between"
                  disabled
                >
                  <span className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Game Overview
                  </span>
                  {myEntry?.gameOverview && <CheckCircle className="w-4 h-4 text-green-500" />}
                </Button>

                <Button
                  onClick={() => router.push(`/charting/sessions/${sessionId}/periods`)}
                  variant={myEntry?.period1 || myEntry?.period2 || myEntry?.period3 ? "outline" : "default"}
                  className="w-full justify-between"
                  disabled
                >
                  <span className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Periods (1, 2, 3)
                  </span>
                  {(myEntry?.period1 || myEntry?.period2 || myEntry?.period3) && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </Button>

                <Button
                  onClick={() => router.push(`/charting/sessions/${sessionId}/overtime-shootout`)}
                  variant={myEntry?.overtime || myEntry?.shootout ? "outline" : "default"}
                  className="w-full justify-between"
                  disabled
                >
                  <span className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Overtime & Shootout
                  </span>
                  {(myEntry?.overtime || myEntry?.shootout) && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </Button>

                <Button
                  onClick={() => router.push(`/charting/sessions/${sessionId}/post-game`)}
                  variant={myEntry?.postGame ? "outline" : "default"}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Post-Game Review
                  </span>
                  {myEntry?.postGame && <CheckCircle className="w-4 h-4 text-green-500" />}
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    if (session.status === 'scheduled') {
                      chartingService.updateSession(sessionId, { status: 'completed' });
                      loadSessionData();
                    }
                  }}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  {session.status === 'completed' ? 'Session Completed' : 'Mark as Completed'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Entries Tab */}
          <TabsContent value="entries" className="space-y-4">
            {entries.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No charting entries yet</p>
                  <Button onClick={() => router.push(`/charting/sessions/${sessionId}/chart`)}>
                    Create First Entry
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {/* My Entry */}
                {myEntry && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Your Entry</h3>
                      <Badge variant="outline">Student</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Last updated: {myEntry.lastUpdatedAt && typeof myEntry.lastUpdatedAt.toDate === 'function'
                          ? formatDistanceToNow(myEntry.lastUpdatedAt.toDate(), { addSuffix: true })
                          : 'Recently'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/charting/sessions/${sessionId}/chart/${myEntry.id}`)}
                      >
                        View & Edit
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Admin Entries */}
                {adminEntries.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Coach/Admin Entries</h3>
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
              </>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="p-12">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Session analytics will be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
