'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { ChartingEntry, Session } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminRoute } from '@/components/auth/protected-route';
import {
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Eye,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminChartingPage() {
  return (
    <AdminRoute>
      <AdminChartingContent />
    </AdminRoute>
  );
}

function AdminChartingContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [allEntries, setAllEntries] = useState<ChartingEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ChartingEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [timeFilter, searchQuery, selectedStudent, allEntries]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all sessions and entries
      const [sessionsResult, entriesResult] = await Promise.all([
        chartingService.getAllSessions({ limit: 1000 }),
        chartingService.getAllChartingEntries({ limit: 1000 }),
      ]);

      if (sessionsResult.success && sessionsResult.data) {
        setAllSessions(sessionsResult.data);
      }

      if (entriesResult.success && entriesResult.data) {
        setAllEntries(entriesResult.data);
        setFilteredEntries(entriesResult.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load charting data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allEntries];

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const days = parseInt(timeFilter);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((entry) => {
        const entryDate = entry.submittedAt?.toDate ? entry.submittedAt.toDate() : new Date(entry.submittedAt);
        return entryDate >= cutoff;
      });
    }

    // Student filter
    if (selectedStudent !== 'all') {
      filtered = filtered.filter((entry) => entry.studentId === selectedStudent);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) => {
        const session = allSessions.find((s) => s.id === entry.sessionId);
        return (
          session?.opponent?.toLowerCase().includes(query) ||
          session?.location?.toLowerCase().includes(query) ||
          entry.additionalComments?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredEntries(filtered);
  };

  // Calculate overall stats
  const calculateOverallStats = () => {
    const entries = selectedStudent === 'all' ? allEntries : filteredEntries;

    const totalSessions = new Set(entries.map((e) => e.sessionId)).size;
    const totalEntries = entries.length;

    const completeEntries = entries.filter((e) =>
      e.preGame && e.gameOverview && e.period1 && e.period2 && e.period3 && e.postGame
    ).length;

    const partialEntries = totalEntries - completeEntries;

    // Calculate average goals
    const entriesWithGoals = entries.filter((e) => e.gameOverview);
    const totalGoodGoals = entriesWithGoals.reduce((sum, e) => {
      return sum + (e.gameOverview?.goodGoals.period1 || 0) +
        (e.gameOverview?.goodGoals.period2 || 0) +
        (e.gameOverview?.goodGoals.period3 || 0);
    }, 0);

    const totalBadGoals = entriesWithGoals.reduce((sum, e) => {
      return sum + (e.gameOverview?.badGoals.period1 || 0) +
        (e.gameOverview?.badGoals.period2 || 0) +
        (e.gameOverview?.badGoals.period3 || 0);
    }, 0);

    const avgGoodGoals = entriesWithGoals.length > 0 ? totalGoodGoals / entriesWithGoals.length : 0;
    const avgBadGoals = entriesWithGoals.length > 0 ? totalBadGoals / entriesWithGoals.length : 0;

    // Calculate average challenge
    const avgChallenge = entriesWithGoals.length > 0
      ? entriesWithGoals.reduce((sum, e) => {
          return sum + ((e.gameOverview?.degreeOfChallenge.period1 || 0) +
            (e.gameOverview?.degreeOfChallenge.period2 || 0) +
            (e.gameOverview?.degreeOfChallenge.period3 || 0)) / 3;
        }, 0) / entriesWithGoals.length
      : 0;

    return {
      totalSessions,
      totalEntries,
      completeEntries,
      partialEntries,
      completionRate: totalEntries > 0 ? (completeEntries / totalEntries) * 100 : 0,
      avgGoodGoals: avgGoodGoals.toFixed(1),
      avgBadGoals: avgBadGoals.toFixed(1),
      avgChallenge: avgChallenge.toFixed(1),
    };
  };

  // Get unique students
  const uniqueStudents = Array.from(new Set(allEntries.map((e) => e.studentId)));

  const stats = calculateOverallStats();

  const getSessionForEntry = (entry: ChartingEntry) => {
    return allSessions.find((s) => s.id === entry.sessionId);
  };

  const isEntryComplete = (entry: ChartingEntry) => {
    return !!(entry.preGame && entry.gameOverview && entry.period1 && entry.period2 && entry.period3 && entry.postGame);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p>Loading admin charting analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Charting Analytics (Admin)</h1>
            <p className="text-gray-600">View and analyze student charting data across the platform</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students ({uniqueStudents.length})</SelectItem>
                  {uniqueStudents.map((studentId) => (
                    <SelectItem key={studentId} value={studentId}>
                      Student {studentId.slice(-6)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Time Period</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by opponent, location, or comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Sessions</p>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.totalEntries} charting entries</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.completeEntries} complete, {stats.partialEntries} partial
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg Good/Bad Goals</p>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.avgGoodGoals} / {stats.avgBadGoals}
            </p>
            <p className="text-sm text-gray-500 mt-1">Per game</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg Challenge</p>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.avgChallenge}/10</p>
            <p className="text-sm text-gray-500 mt-1">Difficulty rating</p>
          </Card>
        </div>

        {/* Entries List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Charting Entries ({filteredEntries.length})
          </h2>

          <div className="space-y-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No charting entries found</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const session = getSessionForEntry(entry);
                const isComplete = isEntryComplete(entry);

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {session?.type === 'game' ? '🥅' : '🏒'}{' '}
                          {session?.opponent || 'Practice Session'}
                        </h3>
                        <Badge variant={isComplete ? 'default' : 'secondary'}>
                          {isComplete ? 'Complete' : 'Partial'}
                        </Badge>
                        {entry.submitterRole === 'admin' && (
                          <Badge variant="outline">Admin Entry</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          📅{' '}
                          {session?.date.toDate
                            ? session.date.toDate().toLocaleDateString()
                            : 'Unknown date'}
                        </span>
                        {session?.location && <span>📍 {session.location}</span>}
                        <span>👤 Student {entry.studentId.slice(-6)}</span>
                        <span>
                          Submitted{' '}
                          {entry.submittedAt?.toDate
                            ? entry.submittedAt.toDate().toLocaleDateString()
                            : 'Unknown'}
                        </span>
                      </div>
                      {entry.gameOverview && (
                        <div className="flex items-center gap-4 text-sm mt-2">
                          <span className="text-green-600">
                            ✅ Good Goals:{' '}
                            {(entry.gameOverview.goodGoals.period1 || 0) +
                              (entry.gameOverview.goodGoals.period2 || 0) +
                              (entry.gameOverview.goodGoals.period3 || 0)}
                          </span>
                          <span className="text-red-600">
                            ❌ Bad Goals:{' '}
                            {(entry.gameOverview.badGoals.period1 || 0) +
                              (entry.gameOverview.badGoals.period2 || 0) +
                              (entry.gameOverview.badGoals.period3 || 0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/charting/entries/${entry.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
