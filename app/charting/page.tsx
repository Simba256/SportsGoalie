'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, SessionStats, StreakData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, TrendingUp, Flame, CheckCircle2, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { CalendarHeatmap } from '@/components/charting/CalendarHeatmap';

export default function ChartingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected day modal state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDaySessions, setSelectedDaySessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load all sessions for heatmap (last 90 days worth)
      const [sessionsResult, analyticsResult] = await Promise.all([
        chartingService.getSessionsByStudent(user.id, { limit: 100, orderBy: 'date', orderDirection: 'desc' }),
        chartingService.getStudentAnalytics(user.id),
      ]);

      if (sessionsResult.success && sessionsResult.data) {
        setSessions(sessionsResult.data);
      }

      if (analyticsResult.success && analyticsResult.data) {
        setStats(analyticsResult.data.sessionStats);
        setStreak(analyticsResult.data.streak);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (date: Date, daySessions: Session[]) => {
    setSelectedDate(date);
    setSelectedDaySessions(daySessions);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedDaySessions([]);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your charting data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Charting</h1>
            <p className="text-gray-600 mt-1">Track your goaltending progress and consistency</p>
          </div>
          <Button onClick={() => router.push('/charting/sessions/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalSessions || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.completionRate ? `${Math.round(stats.completionRate)}%` : '0%'}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {streak?.currentStreak || 0}
                </p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.thisMonthSessions || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Calendar Heatmap */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Activity Calendar</h2>
              <p className="text-sm text-gray-600">
                {streak?.longestStreak ? `🏆 Longest streak: ${streak.longestStreak} days` : ''}
              </p>
            </div>

            <CalendarHeatmap
              sessions={sessions}
              onDayClick={handleDayClick}
              daysToShow={90}
            />
          </div>
        </Card>

        {/* Day Detail Modal */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 space-y-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {selectedDaySessions.length} session{selectedDaySessions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button variant="outline" size="icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Sessions List */}
                {selectedDaySessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No sessions on this day</p>
                    <p className="text-sm text-gray-500 mt-2">Use the "New Session" button to create one</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDaySessions.map((session) => (
                      <Card key={session.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/charting/sessions/${session.id}`)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">
                                {session.type === 'game' ? '🥅 Game' : '🏒 Practice'}
                                {session.opponent && ` vs ${session.opponent}`}
                              </h4>
                              <Badge variant={getStatusBadgeVariant(session.status)}>
                                {session.status}
                              </Badge>
                            </div>
                            {session.location && (
                              <p className="text-sm text-gray-600 mt-1">📍 {session.location}</p>
                            )}
                            {session.tags && session.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {session.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
