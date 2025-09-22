'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  RefreshCw,
  Download,
  Target,
  Trophy,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AdminRoute } from '@/components/auth/protected-route';
import { analyticsService, PlatformAnalytics, UserEngagementData, ContentPopularity, SystemHealth } from '@/src/lib/database/services/analytics.service';
import { toast } from 'sonner';

export default function AdminAnalyticsPage() {
  return (
    <AdminRoute>
      <AnalyticsContent />
    </AdminRoute>
  );
}

function AnalyticsContent() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [engagementData, setEngagementData] = useState<UserEngagementData[]>([]);
  const [contentPopularity, setContentPopularity] = useState<ContentPopularity[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30');

  const fetchAnalytics = async (showRefreshToast = false) => {
    try {
      setRefreshing(true);

      const [analyticsResult, engagementResult, popularityResult, healthResult] = await Promise.all([
        analyticsService.getPlatformAnalytics(),
        analyticsService.getUserEngagementData(parseInt(timeRange)),
        analyticsService.getContentPopularity(),
        analyticsService.getSystemHealth(),
      ]);

      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics(analyticsResult.data);
      }

      if (engagementResult.success && engagementResult.data) {
        setEngagementData(engagementResult.data);
      }

      if (popularityResult.success && popularityResult.data) {
        setContentPopularity(popularityResult.data);
      }

      if (healthResult.success && healthResult.data) {
        setSystemHealth(healthResult.data);
      }

      if (showRefreshToast) {
        toast.success('Analytics data refreshed');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleRefresh = () => {
    analyticsService.clearCache();
    fetchAnalytics(true);
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
      case 'offline':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const userRoleData = analytics ? [
    { name: 'Students', value: analytics.users.studentCount, color: '#8884d8' },
    { name: 'Admins', value: analytics.users.adminCount, color: '#82ca9d' },
  ] : [];

  const userStatusData = analytics ? [
    { name: 'Active', value: analytics.users.active, color: '#82ca9d' },
    { name: 'Inactive', value: analytics.users.inactive, color: '#ffc658' },
  ] : [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Analytics</h1>
            <p className="text-muted-foreground">
              Monitor platform performance, user engagement, and system health
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* System Health Alert */}
        {systemHealth && systemHealth.status !== 'healthy' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800">System Health Warning</h3>
                  <p className="text-sm text-yellow-700">
                    Some services are experiencing issues. Check the System Health tab for details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        {analytics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.users.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{analytics.users.newThisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.users.active}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((analytics.users.active / analytics.users.total) * 100)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.engagement.totalQuizAttempts}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.engagement.averageQuizScore}% avg score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Items</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.content.totalSports + analytics.content.totalSkills}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.content.totalSports} sports, {analytics.content.totalSkills} skills
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tabs */}
        <Tabs defaultValue="engagement" className="space-y-6">
          <TabsList>
            <TabsTrigger value="engagement">User Engagement</TabsTrigger>
            <TabsTrigger value="content">Content Performance</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
          </TabsList>

          {/* User Engagement Tab */}
          <TabsContent value="engagement">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Active Users</CardTitle>
                  <CardDescription>
                    User activity over the past {timeRange} days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="activeUsers"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quiz Performance</CardTitle>
                  <CardDescription>
                    Quiz attempts and average scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quizAttempts" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Performance Tab */}
          <TabsContent value="content">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Sports</CardTitle>
                  <CardDescription>
                    Most viewed sports content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentPopularity.slice(0, 5).map((item, index) => (
                      <div key={item.sportId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{item.sportName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.completions} completions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.views}</div>
                          <p className="text-xs text-muted-foreground">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Ratings</CardTitle>
                  <CardDescription>
                    Average user ratings by sport
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={contentPopularity.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sportName" angle={-45} textAnchor="end" height={80} />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="averageRating" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Analytics Tab */}
          <TabsContent value="users">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Roles Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of user roles on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value, percent }: any) =>
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {userRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Status</CardTitle>
                  <CardDescription>
                    Active vs inactive user accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value, percent }: any) =>
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {userStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>
                    Overall system health and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {systemHealth ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Overall Status</span>
                        <div className={`flex items-center space-x-2 ${getHealthStatusColor(systemHealth.status)}`}>
                          {getHealthStatusIcon(systemHealth.status)}
                          <Badge variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                            {systemHealth.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Uptime</span>
                        <span className="font-medium">{systemHealth.uptime}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Response Time</span>
                        <span className="font-medium">{systemHealth.responseTime}ms</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Error Rate</span>
                        <span className="font-medium">{systemHealth.errorRate}%</span>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">Service Status</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Database</span>
                            <div className={`flex items-center space-x-2 ${getHealthStatusColor(systemHealth.services.database)}`}>
                              {getHealthStatusIcon(systemHealth.services.database)}
                              <span className="text-sm font-medium">{systemHealth.services.database}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span>Authentication</span>
                            <div className={`flex items-center space-x-2 ${getHealthStatusColor(systemHealth.services.auth)}`}>
                              {getHealthStatusIcon(systemHealth.services.auth)}
                              <span className="text-sm font-medium">{systemHealth.services.auth}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span>Storage</span>
                            <div className={`flex items-center space-x-2 ${getHealthStatusColor(systemHealth.services.storage)}`}>
                              {getHealthStatusIcon(systemHealth.services.storage)}
                              <span className="text-sm font-medium">{systemHealth.services.storage}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Health data not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Key performance indicators and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Avg Response Time</h4>
                        <p className="text-sm text-muted-foreground">API response latency</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-2xl">
                          {systemHealth?.responseTime || 0}ms
                        </div>
                        <Badge variant={systemHealth && systemHealth.responseTime < 100 ? 'default' : 'destructive'}>
                          {systemHealth && systemHealth.responseTime < 100 ? 'Good' : 'Needs attention'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">System Uptime</h4>
                        <p className="text-sm text-muted-foreground">Service availability</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-2xl">
                          {systemHealth?.uptime || 0}%
                        </div>
                        <Badge variant={systemHealth && systemHealth.uptime > 99 ? 'default' : 'destructive'}>
                          {systemHealth && systemHealth.uptime > 99 ? 'Excellent' : 'Poor'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Error Rate</h4>
                        <p className="text-sm text-muted-foreground">Failed requests</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-2xl">
                          {systemHealth?.errorRate || 0}%
                        </div>
                        <Badge variant={systemHealth && systemHealth.errorRate < 1 ? 'default' : 'destructive'}>
                          {systemHealth && systemHealth.errorRate < 1 ? 'Low' : 'High'}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Last updated: {systemHealth?.lastCheck ? new Date(systemHealth.lastCheck).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}