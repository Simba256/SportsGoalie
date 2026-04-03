'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { chartingService } from '@/lib/database/services/charting.service';
import type { StudentChartingAnalytics } from '@/types';

interface Props {
  studentId: string;
}

export function StudentChartingSummary({ studentId }: Props) {
  const [analytics, setAnalytics] = useState<StudentChartingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await chartingService.getStudentAnalytics(studentId);
        if (result.success && result.data) {
          setAnalytics(result.data);
        }
      } catch (err) {
        console.error('Failed to load charting analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics || !analytics.sessionStats) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">No Game Data Yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Charting performance data will appear here as this student logs games and practices.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = analytics.sessionStats;
  const goals = analytics.goalsAnalytics;

  const TrendIcon = ({ trend }: { trend?: string }) => {
    if (trend === 'improving') return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend === 'declining') return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Game Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Session stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-lg font-bold">{stats.totalSessions || 0}</p>
            <p className="text-[10px] text-muted-foreground">Sessions</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-lg font-bold">{stats.completedSessions || 0}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* Goals analytics */}
        {goals && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">Goals Analysis</p>
            <div className="flex items-center justify-between text-xs">
              <span>Good/Bad ratio</span>
              <Badge variant={goals.goodBadRatio >= 1 ? 'default' : 'destructive'} className="text-[10px]">
                {goals.goodBadRatio.toFixed(1)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Good goals</span>
              <span className="font-medium text-green-600">{goals.totalGoodGoals}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Bad goals</span>
              <span className="font-medium text-red-600">{goals.totalBadGoals}</span>
            </div>
          </div>
        )}

        {/* Category performance */}
        {analytics.categoryPerformances && analytics.categoryPerformances.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">Category Trends</p>
            {analytics.categoryPerformances.slice(0, 5).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <span className="capitalize truncate flex-1">{cat.category.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-1">
                  <TrendIcon trend={cat.trend} />
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${
                      cat.currentLevel === 'strong' ? 'border-green-300 text-green-700' :
                      cat.currentLevel === 'good' ? 'border-blue-300 text-blue-700' :
                      cat.currentLevel === 'improving' ? 'border-amber-300 text-amber-700' :
                      'border-red-300 text-red-700'
                    }`}
                  >
                    {cat.currentLevel}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Streak */}
        {analytics.streak && analytics.streak.currentStreak > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-center">
            <p className="text-sm font-bold text-amber-700">{analytics.streak.currentStreak} day streak</p>
            <p className="text-[10px] text-amber-600">Best: {analytics.streak.longestStreak} days</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
