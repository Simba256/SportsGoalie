'use client';

import { useState, useEffect } from 'react';
import { SkeletonAnalytics } from '@/components/ui/skeletons';
import {
  Users, Activity, RefreshCw, Download, Target, Trophy,
  AlertTriangle, CheckCircle, XCircle,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { AdminRoute } from '@/components/auth/protected-route';
import { analyticsService, PlatformAnalytics, UserEngagementData, ContentPopularity, SystemHealth } from '@/lib/database/services/analytics.service';
import { toast } from 'sonner';

const BLUE = '#37b5ff';
const RED = '#f87171';
const GREEN = '#22c55e';
const AMBER = '#fbbf24';
const card = { background: 'rgba(2,18,44,0.85)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '16px' } as const;

const chartTooltipStyle = { contentStyle: { background: 'rgba(2,18,44,0.95)', border: '1px solid rgba(55,181,255,0.2)', borderRadius: '10px', color: '#fff', fontSize: '13px' }, labelStyle: { color: 'rgba(255,255,255,0.6)' } };
const chartGridStyle = { stroke: 'rgba(255,255,255,0.05)' };
const chartAxisStyle = { fill: 'rgba(255,255,255,0.35)', fontSize: 11 };

const TABS = [
  { id: 'engagement', label: 'User Engagement' },
  { id: 'content', label: 'Content Performance' },
  { id: 'users', label: 'User Analytics' },
  { id: 'health', label: 'System Health' },
];

export default function AdminAnalyticsPage() {
  return <AdminRoute><AnalyticsContent /></AdminRoute>;
}

function AnalyticsContent() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [engagementData, setEngagementData] = useState<UserEngagementData[]>([]);
  const [contentPopularity, setContentPopularity] = useState<ContentPopularity[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState('engagement');

  const fetchAnalytics = async (showRefreshToast = false) => {
    try {
      setRefreshing(true);
      const [analyticsResult, engagementResult, popularityResult, healthResult] = await Promise.all([
        analyticsService.getPlatformAnalytics(),
        analyticsService.getUserEngagementData(parseInt(timeRange)),
        analyticsService.getContentPopularity(),
        analyticsService.getSystemHealth(),
      ]);
      if (analyticsResult.success && analyticsResult.data) setAnalytics(analyticsResult.data);
      if (engagementResult.success && engagementResult.data) setEngagementData(engagementResult.data);
      if (popularityResult.success && popularityResult.data) setContentPopularity(popularityResult.data);
      if (healthResult.success && healthResult.data) setSystemHealth(healthResult.data);
      if (showRefreshToast) toast.success('Analytics data refreshed');
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [timeRange]);

  const handleRefresh = () => { analyticsService.clearCache(); fetchAnalytics(true); };

  const getHealthColor = (status: string) => {
    if (status === 'healthy' || status === 'online') return GREEN;
    if (status === 'warning' || status === 'degraded') return AMBER;
    return RED;
  };

  const getHealthIcon = (status: string) => {
    if (status === 'healthy' || status === 'online') return <CheckCircle size={14} color={GREEN} />;
    if (status === 'warning' || status === 'degraded') return <AlertTriangle size={14} color={AMBER} />;
    return <XCircle size={14} color={RED} />;
  };

  const userRoleData = analytics ? [
    { name: 'Students', value: analytics.users.studentCount, color: BLUE },
    { name: 'Admins', value: analytics.users.adminCount, color: RED },
  ] : [];

  const userStatusData = analytics ? [
    { name: 'Active', value: analytics.users.active, color: GREEN },
    { name: 'Inactive', value: analytics.users.inactive, color: RED },
  ] : [];

  if (loading) return <div style={{ padding: '24px' }}><SkeletonAnalytics /></div>;

  return (
    <>
      <style>{`
        .an-tab { transition: all 0.2s !important; }
        .an-tab:hover { background: rgba(55,181,255,0.06) !important; }
        .an-sel { background: rgba(2,18,44,0.7) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: rgba(255,255,255,0.7) !important; border-radius: 10px !important; padding: 8px 12px !important; font-size: 13px !important; outline: none !important; cursor: pointer !important; }
        .an-sel:focus { border-color: rgba(55,181,255,0.45) !important; }
        .an-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(55,181,255,0.2); background: rgba(55,181,255,0.06); color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .an-btn:hover { background: rgba(55,181,255,0.14) !important; color: ${BLUE} !important; border-color: rgba(55,181,255,0.35) !important; }
        .an-btn:disabled { opacity: 0.5 !important; cursor: not-allowed !important; }
        @keyframes an-spin { to { transform: rotate(360deg); } }
        .an-spinning { animation: an-spin 1s linear infinite; }
        @media (max-width: 1024px) { .an-kpi { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) {
          .an-kpi { grid-template-columns: repeat(2, 1fr) !important; }
          .an-2col { grid-template-columns: 1fr !important; }
          .an-header { flex-direction: column !important; align-items: flex-start !important; }
          .an-header-actions { flex-wrap: wrap !important; }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>Platform Analytics</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>Monitor platform performance, user engagement, and system health</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select className="an-sel" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
            <button className="an-btn" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={13} className={refreshing ? 'an-spinning' : ''} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <button className="an-btn">
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        {/* System Health Alert */}
        {systemHealth && systemHealth.status !== 'healthy' && (
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertTriangle size={18} color={AMBER} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ color: AMBER, fontWeight: 700, fontSize: '15px', marginBottom: '3px' }}>System Health Warning</p>
              <p style={{ color: 'rgba(251,191,36,0.7)', fontSize: '15px' }}>Some services are experiencing issues. Check the System Health tab for details.</p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        {analytics && (
          <div className="an-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { label: 'Total Users', value: analytics.users.total, sub: `+${analytics.users.newThisMonth} this month`, icon: Users, color: BLUE },
              { label: 'Active Users', value: analytics.users.active, sub: `${Math.round((analytics.users.active / analytics.users.total) * 100)}% of total`, icon: Activity, color: GREEN },
              { label: 'Quiz Attempts', value: analytics.engagement.totalQuizAttempts, sub: `${analytics.engagement.averageQuizScore}% avg score`, icon: Trophy, color: AMBER },
              { label: 'Content Items', value: analytics.content.totalSports + analytics.content.totalSkills, sub: `${analytics.content.totalSports} sports, ${analytics.content.totalSkills} skills`, icon: Target, color: RED },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} style={{ position: 'relative', ...card, padding: '16px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600 }}>{label}</p>
                  <Icon size={14} color={`${color}88`} />
                </div>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: '26px', lineHeight: 1, marginBottom: '4px' }}>{value}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(55,181,255,0.1)', overflowX: 'auto' }}>
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} className={!active ? 'an-tab' : ''} onClick={() => setActiveTab(tab.id)}
                  style={{ flex: 1, minWidth: '130px', padding: '14px 8px', background: active ? 'rgba(55,181,255,0.08)' : 'transparent', border: 'none', borderBottom: active ? `2px solid ${BLUE}` : '2px solid transparent', color: active ? BLUE : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: '20px' }}>

            {/* Engagement Tab */}
            {activeTab === 'engagement' && (
              <div className="an-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Daily Active Users</h3>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '16px' }}>User activity over the past {timeRange} days</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={engagementData}>
                      <CartesianGrid {...chartGridStyle} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={chartAxisStyle} />
                      <YAxis tick={chartAxisStyle} />
                      <Tooltip {...chartTooltipStyle} />
                      <Line type="monotone" dataKey="activeUsers" stroke={BLUE} strokeWidth={2} dot={{ r: 3, fill: BLUE }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Quiz Performance</h3>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '16px' }}>Quiz attempts over time</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={engagementData}>
                      <CartesianGrid {...chartGridStyle} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={chartAxisStyle} />
                      <YAxis tick={chartAxisStyle} />
                      <Tooltip {...chartTooltipStyle} />
                      <Bar dataKey="quizAttempts" fill={RED} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="an-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Popular Sports</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {contentPopularity.slice(0, 5).map((item, index) => (
                      <div key={item.sportId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `rgba(55,181,255,0.15)`, border: `1px solid rgba(55,181,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: BLUE, flexShrink: 0 }}>
                            {index + 1}
                          </div>
                          <div>
                            <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>{item.sportName}</p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{item.completions} completions</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>{item.views}</p>
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Content Ratings</h3>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '16px' }}>Average user ratings by sport</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={contentPopularity.slice(0, 6)}>
                      <CartesianGrid {...chartGridStyle} strokeDasharray="3 3" />
                      <XAxis dataKey="sportName" tick={chartAxisStyle} angle={-35} textAnchor="end" height={60} />
                      <YAxis domain={[0, 5]} tick={chartAxisStyle} />
                      <Tooltip {...chartTooltipStyle} />
                      <Bar dataKey="averageRating" fill={RED} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="an-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>User Role Distribution</h3>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '16px' }}>Breakdown of user roles on the platform</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={userRoleData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                        label={({ name, percent }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                        labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}>
                        {userRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>User Status</h3>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '16px' }}>Active vs inactive user accounts</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={userStatusData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                        label={({ name, percent }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                        labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}>
                        {userStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* System Health Tab */}
            {activeTab === 'health' && (
              <div className="an-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>System Status</h3>
                  {systemHealth ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { label: 'Overall Status', value: systemHealth.status, isStatus: true },
                        { label: 'Uptime', value: `${systemHealth.uptime}%` },
                        { label: 'Response Time', value: `${systemHealth.responseTime}ms` },
                        { label: 'Error Rate', value: `${systemHealth.errorRate}%` },
                      ].map(({ label, value, isStatus }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>{label}</span>
                          {isStatus ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {getHealthIcon(value)}
                              <span style={{ color: getHealthColor(value), fontWeight: 700, fontSize: '13px', textTransform: 'capitalize' }}>{value}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>{value}</span>
                          )}
                        </div>
                      ))}
                      <div style={{ marginTop: '8px', borderTop: '1px solid rgba(55,181,255,0.1)', paddingTop: '14px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>SERVICE STATUS</p>
                        {[
                          { name: 'Database', status: systemHealth.services.database },
                          { name: 'Authentication', status: systemHealth.services.auth },
                          { name: 'Storage', status: systemHealth.services.storage },
                        ].map(({ name, status }) => (
                          <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {getHealthIcon(status)}
                              <span style={{ color: getHealthColor(status), fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Activity size={40} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>Health data not available</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Performance Metrics</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      {
                        title: 'Avg Response Time', sub: 'API response latency',
                        value: `${systemHealth?.responseTime || 0}ms`,
                        good: !!(systemHealth && systemHealth.responseTime < 100),
                        goodLabel: 'Good', badLabel: 'Needs attention',
                      },
                      {
                        title: 'System Uptime', sub: 'Service availability',
                        value: `${systemHealth?.uptime || 0}%`,
                        good: !!(systemHealth && systemHealth.uptime > 99),
                        goodLabel: 'Excellent', badLabel: 'Poor',
                      },
                      {
                        title: 'Error Rate', sub: 'Failed requests',
                        value: `${systemHealth?.errorRate || 0}%`,
                        good: !!(systemHealth && systemHealth.errorRate < 1),
                        goodLabel: 'Low', badLabel: 'High',
                      },
                    ].map(({ title, sub, value, good, goodLabel, badLabel }) => (
                      <div key={title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>{title}</p>
                          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{sub}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#fff', fontWeight: 800, fontSize: '20px', marginBottom: '4px' }}>{value}</p>
                          <span style={{ background: good ? 'rgba(34,197,94,0.12)' : 'rgba(248,113,113,0.12)', color: good ? GREEN : RED, padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                            {good ? goodLabel : badLabel}
                          </span>
                        </div>
                      </div>
                    ))}
                    {systemHealth?.lastCheck && (
                      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>
                        Last updated: {new Date(systemHealth.lastCheck).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
