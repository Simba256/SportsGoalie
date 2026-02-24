'use client';

import { useState, useEffect } from 'react';
import { Calendar, FileText, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SessionSummary {
  date: string;
  title: string;
  fileName: string;
  type: string;
}

interface SessionStats {
  totalSessions: number;
  latestSession: SessionSummary | null;
  recentSessions: SessionSummary[];
  sessionsByType: {
    'Feature Development': number;
    'Bug Fix': number;
    'Enhancement': number;
    'Planning': number;
  };
  currentPhase: string;
  phaseProgress: number;
}

export function SessionStatsPanel() {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { getAuth } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase/config');
      const firebaseAuth = getAuth(auth);
      const currentUser = firebaseAuth.currentUser;

      if (!currentUser) {
        console.error('No authenticated user');
        setLoading(false);
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch('/api/admin/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching session stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Development Sessions
          </CardTitle>
          <CardDescription>Recent work and progress</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Development Sessions
            </CardTitle>
            <CardDescription>Recent work and progress</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase Progress */}
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{stats?.currentPhase || 'Phase 2'}</span>
            <span className="text-sm text-muted-foreground">{stats?.phaseProgress || 60}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${stats?.phaseProgress || 60}%` }}
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-primary">{stats?.totalSessions || 0}</div>
            <div className="text-xs text-muted-foreground">Total Sessions</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {stats?.sessionsByType['Feature Development'] || 0}
            </div>
            <div className="text-xs text-muted-foreground">Features Built</div>
          </div>
        </div>

        {/* Recent Sessions */}
        {stats?.recentSessions && stats.recentSessions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Sessions</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {stats.recentSessions.slice(0, 5).map((session, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.type} • {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Sessions Fallback */}
        {(!stats?.recentSessions || stats.recentSessions.length === 0) && (
          <div className="text-center py-4">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Development sessions will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
