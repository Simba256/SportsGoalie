'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Trophy,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Video,
  UserPlus,
  BarChart3,
  Activity,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

import { AdminRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import {
  analyticsService,
  PlatformAnalytics,
  UserEngagementData,
  ContentPopularity,
  SystemHealth,
} from '@/lib/database/services/analytics.service';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}

function AdminDashboardContent() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [engagement, setEngagement] = useState<UserEngagementData[]>([]);
  const [popularity, setPopularity] = useState<ContentPopularity[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);

      const [analyticsRes, engagementRes, popularityRes, healthRes] =
        await Promise.all([
          analyticsService.getPlatformAnalytics(),
          analyticsService.getUserEngagementData(14),
          analyticsService.getContentPopularity(),
          analyticsService.getSystemHealth(),
        ]);

      if (analyticsRes.success && analyticsRes.data) setAnalytics(analyticsRes.data);
      if (engagementRes.success && engagementRes.data) setEngagement(engagementRes.data);
      if (popularityRes.success && popularityRes.data) setPopularity(popularityRes.data);
      if (healthRes.success && healthRes.data) setHealth(healthRes.data);

      if (showToast) toast.success('Dashboard refreshed');
    } catch {
      if (showToast) toast.error('Failed to refresh');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRefresh = () => {
    analyticsService.clearCache();
    fetchAll(true);
  };

  const firstName = (user?.displayName || user?.email || '').split(' ')[0].split('@')[0];

  const chartData = engagement.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: d.activeUsers,
    quizzes: d.quizAttempts,
    score: d.averageScore,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening on your platform today.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Users"
          value={analytics?.users.total ?? 0}
          subtitle={`+${analytics?.users.newThisMonth ?? 0} this month`}
          icon={<Users className="h-5 w-5" />}
          trend={analytics?.users.newThisMonth ? 'up' : undefined}
          loading={loading}
        />
        <KpiCard
          title="Active Students"
          value={analytics?.users.studentCount ?? 0}
          subtitle={`${analytics?.engagement.activeUsersToday ?? 0} active today`}
          icon={<Activity className="h-5 w-5" />}
          loading={loading}
        />
        <KpiCard
          title="Quiz Attempts"
          value={analytics?.engagement.totalQuizAttempts ?? 0}
          subtitle={`${analytics?.engagement.averageQuizScore ?? 0}% avg score`}
          icon={<Trophy className="h-5 w-5" />}
          trend={analytics?.engagement.averageQuizScore && analytics.engagement.averageQuizScore > 70 ? 'up' : 'down'}
          loading={loading}
        />
        <KpiCard
          title="Content Library"
          value={analytics?.content.totalSports ?? 0}
          subtitle={`${analytics?.content.totalSkills ?? 0} skills, ${analytics?.content.totalQuizzes ?? 0} quizzes`}
          icon={<BookOpen className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Activity Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">User Activity (Last 14 Days)</h3>
          {loading ? (
            <div className="h-[260px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '13px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#37b5ff"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#37b5ff' }}
                  name="Active Users"
                />
                <Line
                  type="monotone"
                  dataKey="quizzes"
                  stroke="#18181b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#18181b' }}
                  strokeDasharray="5 5"
                  name="Quiz Attempts"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
              No activity data yet
            </div>
          )}
        </div>

        {/* Popular Content */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Top Content</h3>
            <Link href="/admin/analytics" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="h-[260px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : popularity.length > 0 ? (
            <div className="space-y-4">
              {popularity.slice(0, 5).map((item, i) => (
                <div key={item.sportId} className="flex items-center gap-3">
                  <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.sportName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.views} views &middot; {item.completions} done
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-primary">
                    {item.averageRating.toFixed(1)} ★
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
              No content data yet
            </div>
          )}
        </div>
      </div>

      {/* Quiz Scores + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quiz Score Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">Quiz Scores (Last 14 Days)</h3>
          {loading ? (
            <div className="h-[220px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '13px',
                  }}
                />
                <Bar
                  dataKey="score"
                  fill="#37b5ff"
                  radius={[6, 6, 0, 0]}
                  name="Avg Score %"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              No quiz data yet
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <QuickAction
              href="/admin/quizzes/create"
              icon={<Trophy className="h-4 w-4" />}
              label="Create Quiz"
            />
            <QuickAction
              href="/admin/pillars"
              icon={<BookOpen className="h-4 w-4" />}
              label="Manage Pillars"
            />
            <QuickAction
              href="/admin/video-reviews"
              icon={<Video className="h-4 w-4" />}
              label="Review Videos"
            />
            <QuickAction
              href="/admin/users"
              icon={<Users className="h-4 w-4" />}
              label="View Students"
            />
            <QuickAction
              href="/admin/coaches"
              icon={<UserPlus className="h-4 w-4" />}
              label="Invite Coach"
            />
            <QuickAction
              href="/admin/analytics"
              icon={<BarChart3 className="h-4 w-4" />}
              label="Full Analytics"
            />
          </div>
        </div>
      </div>

      {/* System Health Bar */}
      {health && (
        <div className="rounded-2xl border border-border bg-card px-6 py-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  health.status === 'healthy'
                    ? 'bg-emerald-500'
                    : health.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-destructive'
                }`}
              />
              <span className="text-sm font-medium text-foreground capitalize">
                System {health.status}
              </span>
            </div>
            <HealthItem label="Uptime" value={`${health.uptime}%`} />
            <HealthItem label="Response" value={`${health.responseTime}ms`} />
            <HealthItem label="Error Rate" value={`${health.errorRate}%`} />
            <HealthItem label="Database" value={health.services.database} />
            <HealthItem label="Auth" value={health.services.auth} />
            <HealthItem label="Storage" value={health.services.storage} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  loading: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">
            {loading ? (
              <span className="inline-block h-7 w-16 rounded animate-pulse bg-muted" />
            ) : (
              value.toLocaleString()
            )}
          </p>
          <div className="flex items-center gap-1.5">
            {trend && !loading && (
              trend === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )
            )}
            <p className="text-xs text-muted-foreground">
              {loading ? '' : subtitle}
            </p>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-primary/10">
          <div className="text-primary">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group"
    >
      <div className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</div>
      <span className="text-sm font-medium text-foreground flex-1 transition-colors">{label}</span>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}

function HealthItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-xs font-medium text-foreground capitalize">{value}</span>
    </div>
  );
}
