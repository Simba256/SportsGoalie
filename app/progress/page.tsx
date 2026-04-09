'use client';

import {
  Calendar,
  TrendingUp,
  BarChart,
  Target,
  Flame,
  CheckCircle2,
  BookOpen,
  Clock,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PieChart,
  Pie,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SkeletonAnalytics } from '@/components/ui/skeletons';
import { useAnalytics, type PillarBreakdown } from '@/hooks/useAnalytics';

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <ProgressContent />
    </ProtectedRoute>
  );
}

function ProgressContent() {
  const { data, loading, error } = useAnalytics();

  if (loading) {
    return <SkeletonAnalytics />;
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">Unable to load progress data</h3>
            <p className="text-muted-foreground">{error || 'No data available'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weekPct = data.consistency.daysInCurrentWeek > 0
    ? Math.round((data.consistency.thisWeekDays / data.consistency.daysInCurrentWeek) * 100)
    : 0;
  const monthPct = data.consistency.daysInCurrentMonth > 0
    ? Math.round((data.consistency.thisMonthDays / data.consistency.daysInCurrentMonth) * 100)
    : 0;

  // Score distribution for donut chart
  const scoreDistribution = [
    { name: '90-100%', value: data.attempts.filter(a => a.percentage >= 90).length, color: '#1d4ed8' },
    { name: '70-89%', value: data.attempts.filter(a => a.percentage >= 70 && a.percentage < 90).length, color: '#3b82f6' },
    { name: '50-69%', value: data.attempts.filter(a => a.percentage >= 50 && a.percentage < 70).length, color: '#f43f5e' },
    { name: '<50%', value: data.attempts.filter(a => a.percentage < 50).length, color: '#ef4444' },
  ].filter(s => s.value > 0);

  // Radar data for pillars
  const radarData = data.pillarBreakdown.map(p => ({
    pillar: p.pillarName,
    score: p.avgScore,
    fullMark: 100,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ══════════ HERO BANNER ══════════ */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-[#1a1a3e] to-slate-900 p-8 md:p-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-red-500/8 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <TrendingUp className="h-7 w-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">Progress Analytics</h1>
            <p className="text-white/60 mt-1 text-sm md:text-base">Track your learning journey with detailed analytics and insights.</p>
          </div>
        </div>
      </div>

      {/* ══════════ STAT CARDS ══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStatCard label="Learning Time" value={data.totalTimeMinutes >= 60 ? `${Math.round(data.totalTimeMinutes / 60)}h ${data.totalTimeMinutes % 60}m` : `${data.totalTimeMinutes}m`} sub="Total time invested" emoji="🕐" gradient="from-blue-500/8 to-blue-500/3" />
        <BigStatCard label="Quiz Attempts" value={data.totalQuizzes} sub={`${data.uniqueSkills} unique`} emoji="🏆" gradient="from-red-500/8 to-red-500/3" />
        <BigStatCard label="Avg Score" value={`${data.avgScore}%`} sub={`Best: ${data.bestScore}%`} emoji="🎯" gradient="from-blue-500/8 to-blue-500/3" />
        <BigStatCard label="Current Streak" value={`${data.currentStreak} days`} sub={`Best: ${data.longestStreak} days`} emoji="🔥" gradient="from-red-500/8 to-red-500/3" />
      </div>

      {/* ══════════ TABS ══════════ */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 border border-red-100 bg-gradient-to-r from-red-50 to-blue-50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pillars">Pillars</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ─────────────────── OVERVIEW TAB ─────────────────── */}
        <TabsContent value="overview" className="space-y-6">

          {/* 30-Day Activity Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    30-Day Activity
                  </CardTitle>
                  <CardDescription>Your daily quiz scores over the last 30 days</CardDescription>
                </div>
                {data.totalQuizzes > 0 && (
                  <div className="hidden sm:flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      <span className="text-muted-foreground">Avg Score</span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {data.dailyProgress.some(d => d.quizzes > 0) ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.dailyProgress}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                      <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} interval={4} stroke="#94a3b8" />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} stroke="#94a3b8" />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2.5} fill="url(#scoreGradient)" dot={false} activeDot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#3b82f6' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState icon={<BarChart className="h-12 w-12" />} title="No activity yet" message="Complete quizzes to see your 30-day progress chart" />
              )}
            </CardContent>
          </Card>

          {/* Two-column: Consistency + Score Donut */}
          <div className="grid gap-6 md:grid-cols-2">

            {/* Learning Consistency */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Learning Consistency
                </CardTitle>
                <CardDescription>How regularly you&apos;re practicing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <GlowProgressBar label="This Week" current={data.consistency.thisWeekDays} total={data.consistency.daysInCurrentWeek} suffix="days" pct={weekPct} color="blue" />
                <GlowProgressBar label="This Month" current={data.consistency.thisMonthDays} total={data.consistency.daysInCurrentMonth} suffix="days" pct={monthPct} color="red" />

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                  <MiniStat label="Pass Rate" value={`${data.completionRate}%`} icon={<CheckCircle2 className="h-4 w-4 text-blue-500" />} />
                  <MiniStat label="Avg Time" value={data.avgSessionTime > 0 ? `${data.avgSessionTime}m` : '--'} icon={<Clock className="h-4 w-4 text-blue-500" />} />
                </div>
              </CardContent>
            </Card>

            {/* Score Distribution Donut */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  Score Distribution
                </CardTitle>
                <CardDescription>How your quiz scores break down</CardDescription>
              </CardHeader>
              <CardContent>
                {data.totalQuizzes > 0 ? (
                  <div className="flex items-center gap-6">
                    {/* Donut */}
                    <div className="relative w-40 h-40 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={scoreDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {scoreDistribution.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-foreground">{data.avgScore}%</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Average</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-2.5">
                      {[
                        { label: 'Excellent (90-100%)', count: data.attempts.filter(a => a.percentage >= 90).length, color: '#1d4ed8' },
                        { label: 'Good (70-89%)', count: data.attempts.filter(a => a.percentage >= 70 && a.percentage < 90).length, color: '#3b82f6' },
                        { label: 'Fair (50-69%)', count: data.attempts.filter(a => a.percentage >= 50 && a.percentage < 70).length, color: '#f43f5e' },
                        { label: 'Needs Work (<50%)', count: data.attempts.filter(a => a.percentage < 50).length, color: '#ef4444' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2.5">
                          <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
                          <span className="text-xs font-bold text-foreground">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState icon={<Target className="h-10 w-10" />} title="No data" message="Take quizzes to see your score distribution" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─────────────────── PILLARS TAB ─────────────────── */}
        <TabsContent value="pillars" className="space-y-6">
          {data.pillarBreakdown.length > 0 ? (
            <>
              {/* Radar + Bar side by side */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Radar Chart */}
                {radarData.length >= 3 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-500" />
                        Skill Radar
                      </CardTitle>
                      <CardDescription>Your strength across pillars</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData} outerRadius="75%">
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Bar Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-red-500" />
                      Performance by Pillar
                    </CardTitle>
                    <CardDescription>Average quiz score per pillar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={data.pillarBreakdown} margin={{ bottom: 50 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                          <XAxis dataKey="pillarName" fontSize={11} tickLine={false} axisLine={false} angle={-35} textAnchor="end" height={65} stroke="#94a3b8" />
                          <YAxis fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} stroke="#94a3b8" />
                          <Tooltip content={<PillarTooltip />} />
                          <Bar dataKey="avgScore" radius={[8, 8, 0, 0]} maxBarSize={45}>
                            {data.pillarBreakdown.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pillar Detail Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.pillarBreakdown.map(pillar => (
                  <PillarCard key={pillar.pillarId} pillar={pillar} />
                ))}
              </div>
            </>
          ) : (
            <Card><CardContent className="py-16"><EmptyState icon={<BookOpen className="h-12 w-12" />} title="No pillar data yet" message="Complete quizzes across different pillars to see your breakdown" /></CardContent></Card>
          )}
        </TabsContent>

        {/* ─────────────────── PERFORMANCE TAB ─────────────────── */}
        <TabsContent value="performance" className="space-y-6">

          {/* Highlight Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <HighlightCard icon={<Clock className="h-5 w-5" />} label="Avg Quiz Time" value={data.avgSessionTime > 0 ? `${data.avgSessionTime} min` : '--'} color="blue" />
            <HighlightCard icon={<CheckCircle2 className="h-5 w-5" />} label="Pass Rate" value={`${data.completionRate}%`} color="blue" />
            <HighlightCard icon={<BookOpen className="h-5 w-5" />} label="Skills Covered" value={data.uniqueSkills} color="red" />
            <HighlightCard icon={<Award className="h-5 w-5" />} label="Best Score" value={`${data.bestScore}%`} color="red" />
          </div>

          <div className="grid gap-6 md:grid-cols-5">
            {/* Streak Panel (2 cols) */}
                <Card className="md:col-span-2 relative overflow-hidden border-red-100">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-red-500/10 to-transparent rounded-full blur-2xl -translate-y-1/4 translate-x-1/4" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-red-500" />
                  Streak Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Big streak display */}
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                    <span className="text-3xl font-black text-white">{data.currentStreak}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Day Streak</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {data.currentStreak === 0 ? 'Start a quiz today!' : data.currentStreak >= data.longestStreak ? 'Personal best!' : `${data.longestStreak - data.currentStreak} days to beat your best`}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Longest Streak</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5 text-blue-500" /> {data.longestStreak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active This Week</span>
                    <span className="text-sm font-bold text-foreground">{data.consistency.thisWeekDays}/{data.consistency.daysInCurrentWeek} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active This Month</span>
                    <span className="text-sm font-bold text-foreground">{data.consistency.thisMonthDays}/{data.consistency.daysInCurrentMonth} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Trend (3 cols) */}
            <Card className="md:col-span-3 border-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Score Trend
                </CardTitle>
                <CardDescription>Quiz scores over time (active days only)</CardDescription>
              </CardHeader>
              <CardContent>
                {data.dailyProgress.filter(d => d.quizzes > 0).length > 0 ? (
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.dailyProgress.filter(d => d.quizzes > 0)}>
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} stroke="#94a3b8" />
                        <YAxis fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} stroke="#94a3b8" />
                        <Tooltip content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-xl border bg-card p-3 shadow-lg text-sm">
                              <p className="font-semibold text-foreground">{label}</p>
                              <p className="text-muted-foreground">Score: <span className="text-blue-600 font-medium">{payload[0].value}%</span></p>
                            </div>
                          );
                        }} />
                        <Area type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2.5} fill="url(#trendGradient)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState icon={<TrendingUp className="h-10 w-10" />} title="No trend data" message="Complete quizzes on multiple days to see your score trend" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Efficiency Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Learning Efficiency
              </CardTitle>
              <CardDescription>Key metrics about how you learn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <EfficiencyTile label="Total Time" value={data.totalTimeMinutes >= 60 ? `${Math.round(data.totalTimeMinutes / 60)}h ${data.totalTimeMinutes % 60}m` : `${data.totalTimeMinutes}m`} icon={<Clock className="h-4 w-4" />} />
                <EfficiencyTile label="Avg per Quiz" value={data.avgSessionTime > 0 ? `${data.avgSessionTime}m` : '--'} icon={<Activity className="h-4 w-4" />} />
                <EfficiencyTile label="Total Quizzes" value={data.totalQuizzes} icon={<Trophy className="h-4 w-4" />} />
                <EfficiencyTile label="Unique Skills" value={data.uniqueSkills} icon={<BookOpen className="h-4 w-4" />} />
                <EfficiencyTile label="Pillars" value={data.pillarBreakdown.length} icon={<Target className="h-4 w-4" />} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────────── HISTORY TAB ─────────────────── */}
        <TabsContent value="history" className="space-y-6">
          {/* Quick summary row */}
          {data.recentAttempts.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/5 to-transparent">
                <CardContent className="pt-5 pb-4 text-center">
                  <p className="text-3xl font-bold text-foreground">{data.totalQuizzes}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Attempts</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500/5 to-transparent border-red-100">
                <CardContent className="pt-5 pb-4 text-center">
                  <p className="text-3xl font-bold text-foreground">{data.attempts.filter(a => a.percentage >= 70).length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Passed</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500/5 to-transparent">
                <CardContent className="pt-5 pb-4 text-center">
                  <p className="text-3xl font-bold text-foreground">{data.bestScore}%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Best Score</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Recent Quiz Attempts
                  </CardTitle>
                  <CardDescription>Your latest {Math.min(data.recentAttempts.length, 10)} results</CardDescription>
                </div>
                {data.totalQuizzes > 0 && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {data.totalQuizzes} total
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {data.recentAttempts.length > 0 ? (
                <div className="space-y-2">
                  {data.recentAttempts.map((attempt, idx) => {
                    const passed = attempt.percentage >= 70;
                    return (
                      <div
                        key={attempt.id}
                        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                          passed
                            ? 'border-blue-100 hover:border-blue-200 hover:bg-blue-50/30'
                            : 'border-red-100 hover:border-red-200 hover:bg-red-50/30'
                        }`}
                      >
                        {/* Rank number */}
                        <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                          {idx + 1}
                        </div>

                        {/* Status icon */}
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          passed ? 'bg-blue-100' : 'bg-red-100'
                        }`}>
                          {passed ? (
                            <ArrowUpRight className="h-5 w-5 text-blue-600" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-red-600" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{attempt.pillarName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {attempt.submittedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {attempt.timeSpent > 0 && ` · ${attempt.timeSpent}m`}
                          </p>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <p className={`text-lg font-bold ${passed ? 'text-blue-600' : 'text-red-600'}`}>
                            {attempt.percentage}%
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {passed ? 'Passed' : 'Retry'}
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="w-24 hidden md:block">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${passed ? 'bg-blue-500' : 'bg-red-500'}`}
                              style={{ width: `${attempt.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={<Calendar className="h-12 w-12" />} title="No history yet" message="Start taking quizzes to build your history" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════ */

function BigStatCard({ label, value, sub, emoji, gradient }: {
  label: string; value: string | number; sub: string; emoji: string; gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br ${gradient} bg-card p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="relative z-10">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl md:text-4xl font-bold text-foreground mt-1 tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </div>
        <span className="text-5xl md:text-6xl opacity-80 select-none leading-none -mt-1" aria-hidden="true">{emoji}</span>
      </div>
    </div>
  );
}

function GlowProgressBar({ label, current, total, suffix, pct, color }: {
  label: string; current: number; total: number; suffix: string; pct: number; color: 'blue' | 'red';
}) {
  const barColor = color === 'blue' ? 'bg-blue-500' : 'bg-red-500';
  const glowColor = color === 'blue' ? 'shadow-blue-500/30' : 'shadow-red-500/30';
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-bold text-foreground">{current}/{total} {suffix}</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor} ${pct > 0 ? `shadow-sm ${glowColor}` : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function HighlightCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: 'blue' | 'red';
}) {
  const colorMap = {
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-200/50',
    red: 'from-red-500/10 to-red-500/5 border-red-200/50',
  };
  const iconBg = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${colorMap[color]} p-4`}>
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${iconBg[color]}`}>{icon}</div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
          <p className="text-xl font-bold text-foreground -mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

function EfficiencyTile({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-red-50 border border-red-100">
      <div className="text-blue-600 mb-1.5">{icon}</div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

function PillarCard({ pillar }: { pillar: PillarBreakdown }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${pillar.color}18` }}>
          <BookOpen className="h-5 w-5" style={{ color: pillar.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{pillar.pillarName}</h3>
          <p className="text-xs text-muted-foreground">{pillar.attempts} attempts · {pillar.timeSpent}m</p>
        </div>
        <span className="text-xl font-bold" style={{ color: pillar.color }}>{pillar.avgScore}%</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pillar.avgScore}%`, backgroundColor: pillar.color }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>Best: {pillar.bestScore}%</span>
        <span className={pillar.avgScore >= 70 ? 'text-blue-600 font-medium' : 'text-red-600 font-medium'}>
          {pillar.avgScore >= 70 ? 'On Track' : 'Needs Focus'}
        </span>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { quizzes: number; avgScore: number; timeSpent: number } }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border bg-card p-3 shadow-xl text-sm min-w-[140px]">
      <p className="font-semibold text-foreground mb-1.5 pb-1.5 border-b border-border/50">{label}</p>
      <div className="space-y-1 text-muted-foreground">
        <div className="flex justify-between"><span>Quizzes</span><span className="text-foreground font-medium">{d.quizzes}</span></div>
        {d.avgScore > 0 && <div className="flex justify-between"><span>Avg Score</span><span className="text-blue-600 font-medium">{d.avgScore}%</span></div>}
        {d.timeSpent > 0 && <div className="flex justify-between"><span>Time</span><span className="text-foreground font-medium">{d.timeSpent}m</span></div>}
      </div>
    </div>
  );
}

function PillarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: PillarBreakdown }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border bg-card p-3 shadow-xl text-sm min-w-[160px]">
      <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-border/50">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
        <span className="font-semibold text-foreground">{d.pillarName}</span>
      </div>
      <div className="space-y-1 text-muted-foreground">
        <div className="flex justify-between"><span>Avg Score</span><span className="font-medium" style={{ color: d.color }}>{d.avgScore}%</span></div>
        <div className="flex justify-between"><span>Best</span><span className="text-foreground font-medium">{d.bestScore}%</span></div>
        <div className="flex justify-between"><span>Attempts</span><span className="text-foreground font-medium">{d.attempts}</span></div>
        <div className="flex justify-between"><span>Time</span><span className="text-foreground font-medium">{d.timeSpent}m</span></div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title?: string; message: string }) {
  return (
    <div className="text-center py-10">
      <div className="text-muted-foreground/30 mx-auto mb-3 flex justify-center">{icon}</div>
      {title && <p className="font-semibold text-foreground mb-1">{title}</p>}
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">{message}</p>
    </div>
  );
}
