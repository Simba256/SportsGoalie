'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { SkeletonDetailPage } from '@/components/ui/skeletons';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  Trophy,
  Target,
  Clock,
  MapPin,
  Edit,
  Save,
  X,
  MessageSquare,
  Activity,
  PlayCircle,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminRoute } from '@/components/auth/protected-route';
import { userService } from '@/lib/database/services/user.service';
import { messageService } from '@/lib/database/services/message.service';
import { chartingService } from '@/lib/database/services/charting.service';
import { dynamicChartingService } from '@/lib/database/services/dynamic-charting.service';
import { User as UserType, UserRole, UserProgress, Notification, Message, Session as ChartingSession, ChartingEntry } from '@/types';
import { DynamicChartingEntry } from '@/types/form-template';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'sonner';
import { studentAnalyticsService } from '@/lib/database/services/student-analytics.service';
import type {
  StudentAnalytics,
  QuizPerformanceData,
  ProgressOverTimeData,
  SkillPerformanceData,
  CourseProgressDetail,
  QuizAttemptDetail
} from '@/lib/database/services/student-analytics.service';
import { QuizPerformanceChart } from '@/components/admin/analytics/QuizPerformanceChart';
import { ProgressOverTimeChart } from '@/components/admin/analytics/ProgressOverTimeChart';
import { SkillPerformanceTable } from '@/components/admin/analytics/SkillPerformanceTable';
import { ActivityTimeline } from '@/components/admin/analytics/ActivityTimeline';
import { EngagementMetrics } from '@/components/admin/analytics/EngagementMetrics';
import { CourseProgress } from '@/components/admin/analytics/CourseProgress';
import { QuizAttemptHistory } from '@/components/admin/analytics/QuizAttemptHistory';
import { CalendarHeatmap } from '@/components/charting/CalendarHeatmap';
import { ChartingPerformanceSection } from '@/components/admin/charting/ChartingPerformanceSection';

export default function AdminUserDetailsPage() {
  return (
    <AdminRoute>
      <UserDetailsContent />
    </AdminRoute>
  );
}

function UserDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();
  const userId = params.id as string;
  const initialTab = searchParams?.get('tab') || 'profile';

  const [user, setUser] = useState<UserType | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserType | null>(null);
  const [showMessageComposer, setShowMessageComposer] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [quizPerformance, setQuizPerformance] = useState<QuizPerformanceData[]>([]);
  const [progressOverTime, setProgressOverTime] = useState<ProgressOverTimeData[]>([]);
  const [skillPerformance, setSkillPerformance] = useState<SkillPerformanceData[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgressDetail[]>([]);
  const [quizAttemptHistory, setQuizAttemptHistory] = useState<QuizAttemptDetail[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Charting state
  const [chartingSessions, setChartingSessions] = useState<ChartingSession[]>([]);
  const [chartingEntries, setChartingEntries] = useState<ChartingEntry[]>([]);
  const [dynamicEntries, setDynamicEntries] = useState<DynamicChartingEntry[]>([]);
  const [loadingCharting, setLoadingCharting] = useState(false);
  const [chartingLoaded, setChartingLoaded] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user details
      const userResult = await userService.getUser(userId);
      if (userResult.success && userResult.data) {
        setUser(userResult.data);
        setEditedUser(userResult.data);
      }

      // Fetch user progress
      const progressResult = await userService.getUserProgress(userId);
      if (progressResult.success && progressResult.data) {
        setUserProgress(progressResult.data);
      }

      // Fetch notifications
      const notificationsResult = await userService.getUserNotifications(userId, { limit: 10 });
      if (notificationsResult.success && notificationsResult.data) {
        setNotifications(notificationsResult.data.items);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!currentUser) return;

    try {
      setLoadingMessages(true);
      const result = await messageService.getUserMessages(userId, { limit: 20 });
      if (result.success && result.data) {
        setMessages(result.data.items);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);

      // Fetch all analytics data in parallel
      const [
        analyticsResult,
        quizPerfResult,
        progressResult,
        skillPerfResult,
        courseProgressResult,
        quizHistoryResult
      ] = await Promise.all([
        studentAnalyticsService.getStudentAnalytics(userId),
        studentAnalyticsService.getQuizPerformance(userId),
        studentAnalyticsService.getProgressOverTime(userId, 30),
        studentAnalyticsService.getSkillPerformance(userId),
        studentAnalyticsService.getCourseProgressDetails(userId),
        studentAnalyticsService.getQuizAttemptHistory(userId, 100)
      ]);

      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics(analyticsResult.data);
      }

      if (quizPerfResult.success && quizPerfResult.data) {
        setQuizPerformance(quizPerfResult.data);
      }

      if (progressResult.success && progressResult.data) {
        setProgressOverTime(progressResult.data);
      }

      if (skillPerfResult.success && skillPerfResult.data) {
        setSkillPerformance(skillPerfResult.data);
      }

      if (courseProgressResult.success && courseProgressResult.data) {
        setCourseProgress(courseProgressResult.data);
      }

      if (quizHistoryResult.success && quizHistoryResult.data) {
        setQuizAttemptHistory(quizHistoryResult.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchCharting = async () => {
    if (chartingLoaded) return;
    try {
      setLoadingCharting(true);

      const [sessionsResult, entriesResult, dynamicResult] = await Promise.all([
        chartingService.getSessionsByStudent(userId, { limit: 500, orderBy: 'date', orderDirection: 'desc' }),
        chartingService.getChartingEntriesByStudent(userId),
        dynamicChartingService.getDynamicEntriesByStudent(userId),
      ]);

      if (sessionsResult.success && sessionsResult.data) {
        setChartingSessions(sessionsResult.data);
      }
      if (entriesResult.success && entriesResult.data) {
        setChartingEntries(entriesResult.data);
      }
      if (dynamicResult.success && dynamicResult.data) {
        setDynamicEntries(dynamicResult.data);
      }
      setChartingLoaded(true);
    } catch (error) {
      console.error('Error fetching charting data:', error);
      toast.error('Failed to load charting data');
    } finally {
      setLoadingCharting(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // When deep-linking to a tab that lazy-loads data, trigger the fetch on mount.
  useEffect(() => {
    if (!userId) return;
    if (initialTab === 'charting') fetchCharting();
    if (initialTab === 'analytics' || initialTab === 'progress') fetchAnalytics();
    if (initialTab === 'messages') fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, initialTab]);

  const handleSaveChanges = async () => {
    if (!editedUser) return;

    try {
      const updates = {
        displayName: editedUser.displayName,
        role: editedUser.role,
        isActive: editedUser.isActive,
        profile: editedUser.profile,
        preferences: editedUser.preferences,
      };

      const result = await userService.updateUser(userId, updates);
      if (result.success) {
        setUser(editedUser);
        setIsEditing(false);
        toast.success('User updated successfully');
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleCancelEdit = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonDetailPage />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">User not found</h3>
          <p className="text-muted-foreground mb-4">
            The user you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/admin/users">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'student':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const themedCard = 'border-red-100/80 shadow-sm bg-white';
  const themedSubCard = 'border-red-100/70 bg-red-50/30';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/users">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Back to users"
                title="Back to users"
                className="text-slate-700 hover:bg-red-50 hover:text-red-700"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Profile</h1>
              <p className="text-slate-600">
                Manage {user.displayName}'s account and settings
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && currentUser && (
              <Button
                variant="outline"
                onClick={() => setShowMessageComposer(true)}
                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            )}
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} className="bg-red-600 text-white hover:bg-red-700">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-red-600 text-white hover:bg-red-700">
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            )}
          </div>
        </div>

        {/* User Overview */}
        <Card className={themedCard}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="bg-red-100 text-lg text-red-700">
                  {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{user.displayName}</h2>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </div>
                <p className="mb-2 text-slate-600">{user.email}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Joined {(user.createdAt instanceof Date ? user.createdAt : user.createdAt?.toDate?.() ?? new Date()).toLocaleDateString()}
                  </div>
                  {user.lastLoginAt && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      Last seen {(user.lastLoginAt instanceof Date ? user.lastLoginAt : user.lastLoginAt?.toDate?.() ?? new Date()).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue={initialTab} className="space-y-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-xl border border-red-100 bg-white p-2 shadow-sm">
            <TabsTrigger value="profile" className="rounded-md border border-transparent px-4 py-2 data-[state=active]:border-red-200 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Profile</TabsTrigger>
            <TabsTrigger value="analytics" onClick={fetchAnalytics} className="rounded-md border border-transparent px-4 py-2 data-[state=active]:border-red-200 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Analytics</TabsTrigger>
            <TabsTrigger value="progress" onClick={fetchAnalytics} className="rounded-md border border-transparent px-4 py-2 data-[state=active]:border-red-200 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Progress</TabsTrigger>
            <TabsTrigger value="charting" onClick={fetchCharting} className="rounded-md border border-transparent px-4 py-2 data-[state=active]:border-red-200 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Charting</TabsTrigger>
            <TabsTrigger value="messages" onClick={fetchMessages} className="rounded-md border border-transparent px-4 py-2 data-[state=active]:border-red-200 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Messages</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-md border border-transparent px-4 py-2 data-[state=active]:border-red-200 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Notifications</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md border border-transparent px-4 py-2 data-[state=active]:border-red-200 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className={themedCard}>
                <CardHeader>
                  <CardTitle className="text-slate-900">Basic Information</CardTitle>
                  <CardDescription className="text-slate-600">
                    User's basic profile information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    {isEditing ? (
                      <Input
                        id="displayName"
                        value={editedUser?.displayName || ''}
                        onChange={(e) => setEditedUser(prev => prev ? {...prev, displayName: e.target.value} : null)}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 rounded-md border border-red-100 bg-red-50/40 px-3 py-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{user.displayName}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center space-x-2 rounded-md border border-red-100 bg-red-50/40 px-3 py-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span>{user.email}</span>
                      {user.emailVerified && (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700">Verified</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={editedUser?.profile?.firstName || ''}
                        onChange={(e) => setEditedUser(prev => prev ? {
                          ...prev,
                          profile: {...prev.profile, firstName: e.target.value}
                        } : null)}
                      />
                    ) : (
                      <span className="rounded-md border border-red-100 bg-red-50/40 px-3 py-2 text-sm text-slate-700">{user.profile?.firstName || 'Not provided'}</span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={editedUser?.profile?.lastName || ''}
                        onChange={(e) => setEditedUser(prev => prev ? {
                          ...prev,
                          profile: {...prev.profile, lastName: e.target.value}
                        } : null)}
                      />
                    ) : (
                      <span className="rounded-md border border-red-100 bg-red-50/40 px-3 py-2 text-sm text-slate-700">{user.profile?.lastName || 'Not provided'}</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className={themedCard}>
                <CardHeader>
                  <CardTitle className="text-slate-900">Account Settings</CardTitle>
                  <CardDescription className="text-slate-600">
                    User role, status, and account configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">User Role</Label>
                    {isEditing ? (
                      <Select
                        value={editedUser?.role}
                        onValueChange={(value) => setEditedUser(prev => prev ? {...prev, role: value as UserRole} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center space-x-2 rounded-md border border-red-100 bg-red-50/40 px-3 py-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                    )}
                  </div>


                  <div className="grid gap-2">
                    <Label>Date of Birth</Label>
                    <div className="flex items-center space-x-2 rounded-md border border-red-100 bg-red-50/40 px-3 py-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {user.profile?.dateOfBirth
                          ? new Date(user.profile.dateOfBirth).toLocaleDateString()
                          : 'Not provided'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Country</Label>
                    <div className="flex items-center space-x-2 rounded-md border border-red-100 bg-red-50/40 px-3 py-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.profile?.location?.country || 'Not provided'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading analytics...</div>
              </div>
            ) : (
              <div className="space-y-6">
                <Card className={themedSubCard}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-red-700">Analytics Snapshot</p>
                        <p className="text-sm text-slate-600">Performance and engagement details for this goalie are grouped below.</p>
                      </div>
                      <Badge className="bg-red-600 text-white hover:bg-red-600">Live</Badge>
                    </div>
                  </CardContent>
                </Card>
                {/* Engagement Metrics */}
                {analytics && (
                  <EngagementMetrics
                    currentStreak={analytics.engagement.currentStreak}
                    longestStreak={analytics.engagement.longestStreak}
                    activeDays={analytics.overview.activeDays}
                    averageSessionDuration={analytics.engagement.averageSessionDuration}
                    studyPattern={analytics.engagement.studyPattern}
                    totalTimeSpent={analytics.overview.totalTimeSpent}
                  />
                )}

                {/* Course Progress with Skills */}
                <CourseProgress
                  courses={courseProgress}
                  loading={loadingAnalytics}
                />

                {/* Progress Over Time Chart */}
                <ProgressOverTimeChart data={progressOverTime} />

                {/* Quiz Attempt History */}
                <QuizAttemptHistory
                  attempts={quizAttemptHistory}
                  loading={loadingAnalytics}
                />

                {/* Quiz Performance */}
                <QuizPerformanceChart data={quizPerformance} />

                {/* Skill Performance Table */}
                <SkillPerformanceTable data={skillPerformance} />

                {/* Activity Timeline */}
                {analytics && (
                  <ActivityTimeline activities={analytics.recentActivity} />
                )}
              </div>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className={themedCard}>
                <CardHeader>
                  <CardTitle className="text-slate-900">Overall Statistics</CardTitle>
                  <CardDescription className="text-slate-600">
                    User's learning progress and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userProgress ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-red-100 bg-red-50/40 p-4 text-center">
                          <div className="text-2xl font-bold text-primary">
                            {userProgress.overallStats.skillsCompleted}
                          </div>
                          <p className="text-sm text-muted-foreground">Skills Attempted</p>
                        </div>
                        <div className="rounded-xl border border-red-100 bg-red-50/40 p-4 text-center">
                          <div className="text-2xl font-bold text-primary">
                            {userProgress.overallStats.quizzesCompleted}
                          </div>
                          <p className="text-sm text-muted-foreground">Quiz Attempts</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Average Quiz Score</span>
                          <span className="font-medium">
                            {userProgress.overallStats.averageQuizScore}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Current Streak</span>
                          <span className="font-medium">
                            {userProgress.overallStats.currentStreak} days
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Time</span>
                          <span className="font-medium">
                            {Math.round(userProgress.overallStats.totalTimeSpent / 60)} hours
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Target className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No progress data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={themedCard}>
                <CardHeader>
                  <CardTitle className="text-slate-900">Video Quiz Performance</CardTitle>
                  <CardDescription className="text-slate-600">
                    Performance metrics from video quizzes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {analytics.performance.totalQuizzesCompleted}
                        </div>
                        <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                      </div>
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Best Score</span>
                          <span className="font-medium">
                            {analytics.performance.bestQuizScore}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Worst Score</span>
                          <span className="font-medium">
                            {analytics.performance.worstQuizScore}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Study Pattern</span>
                          <span className="font-medium capitalize">
                            {analytics.engagement.studyPattern}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Trophy className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No quiz data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Charting Tab */}
          <TabsContent value="charting">
            {loadingCharting ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading charting data...</div>
              </div>
            ) : (() => {
              const totalSessions = chartingSessions.length;
              const completed = chartingSessions.filter((s) => s.status === 'completed').length;
              const inProgress = chartingSessions.filter(
                (s) => s.status === 'in-progress' || s.status === 'pre-game'
              ).length;
              const scheduled = chartingSessions.filter((s) => s.status === 'scheduled').length;
              const games = chartingSessions.filter((s) => s.type === 'game').length;
              const practices = chartingSessions.filter((s) => s.type === 'practice').length;
              const totalEntries = chartingEntries.length + dynamicEntries.length;

              const recentSessions = [...chartingSessions].slice(0, 15);

              const formatSessionDate = (ts: ChartingSession['date']) => {
                try {
                  const d = (ts as { toDate?: () => Date })?.toDate?.() ?? new Date(ts as unknown as string | number);
                  return d.toLocaleDateString();
                } catch {
                  return '—';
                }
              };

              const getStatusVariant = (status: ChartingSession['status']) => {
                switch (status) {
                  case 'completed':
                    return 'default';
                  case 'in-progress':
                  case 'pre-game':
                    return 'secondary';
                  case 'scheduled':
                    return 'outline';
                  default:
                    return 'outline';
                }
              };

              return (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className={themedCard}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <Activity className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalSessions}</div>
                        <p className="text-xs text-muted-foreground">
                          {games} games · {practices} practices
                        </p>
                      </CardContent>
                    </Card>

                    <Card className={themedCard}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{completed}</div>
                        <p className="text-xs text-muted-foreground">Fully charted</p>
                      </CardContent>
                    </Card>

                    <Card className={themedCard}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <PlayCircle className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{inProgress}</div>
                        <p className="text-xs text-muted-foreground">
                          {scheduled} scheduled
                        </p>
                      </CardContent>
                    </Card>

                    <Card className={themedCard}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Charting Entries</CardTitle>
                        <ClipboardList className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalEntries}</div>
                        <p className="text-xs text-muted-foreground">
                          {chartingEntries.length} legacy · {dynamicEntries.length} dynamic
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {chartingSessions.length > 0 && (
                    <Card className={themedCard}>
                      <CardHeader>
                        <CardTitle className="text-slate-900">Session Activity Calendar</CardTitle>
                        <CardDescription className="text-slate-600">
                          Daily charting activity for this goalie
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <CalendarHeatmap
                            sessions={chartingSessions}
                            chartingEntries={chartingEntries}
                            dynamicEntries={dynamicEntries}
                            onDayClick={() => { /* no-op here */ }}
                            colorScheme="default"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className={themedCard}>
                    <CardHeader>
                      <CardTitle className="text-slate-900">Recent Sessions</CardTitle>
                      <CardDescription className="text-slate-600">
                        Most recent charting sessions started or completed by this goalie
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recentSessions.length === 0 ? (
                        <div className="text-center py-8">
                          <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">No charting sessions yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recentSessions.map((session) => (
                            <Link
                              key={session.id}
                              href={`/admin/users/${userId}/sessions/${session.id}`}
                              className="flex items-center justify-between rounded-lg border border-red-100 p-3 transition-colors hover:bg-red-50/60"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                                  {session.type === 'game' ? (
                                    <Trophy className="h-4 w-4" />
                                  ) : (
                                    <Target className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium capitalize">{session.type}</span>
                                    {session.opponent && (
                                      <span className="text-sm text-muted-foreground truncate">
                                        vs {session.opponent}
                                      </span>
                                    )}
                                    {session.result && (
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {session.result}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {formatSessionDate(session.date)}
                                    {session.location ? ` · ${session.location}` : ''}
                                  </div>
                                </div>
                              </div>
                              <Badge variant={getStatusVariant(session.status)} className="capitalize shrink-0">
                                {session.status.replace('-', ' ')}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Full performance metrics for this goalie (same view as /admin/charting) */}
                  {chartingEntries.length > 0 && (
                    <div>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Performance Metrics</h3>
                        <p className="text-sm text-muted-foreground">
                          Computed from {chartingEntries.length} charting{' '}
                          {chartingEntries.length === 1 ? 'entry' : 'entries'} submitted by this goalie
                        </p>
                      </div>
                      <ChartingPerformanceSection entries={chartingEntries} />
                    </div>
                  )}
                </div>
              );
            })()}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className={themedCard}>
              <CardHeader>
                <CardTitle className="text-slate-900">Messages</CardTitle>
                <CardDescription className="text-slate-600">
                  Messages sent to this student
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMessages ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">Loading messages...</div>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`rounded-lg border p-4 ${
                          message.isRead
                            ? 'border-slate-200 bg-slate-50/70'
                            : 'border-red-200 bg-red-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{message.subject}</h4>
                              <Badge variant="outline" className="border-slate-300 text-xs text-slate-700">
                                {message.type.replace('_', ' ')}
                              </Badge>
                              {!message.isRead && (
                                <Badge variant="default" className="bg-red-600 text-xs text-white hover:bg-red-600">
                                  Unread
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {message.message.length > 150
                                ? message.message.substring(0, 150) + '...'
                                : message.message}
                            </p>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{message.attachments.length} attachment(s)</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Sent {(message.createdAt?.toDate?.() ?? new Date()).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No messages sent yet</p>
                    {currentUser && (
                      <Button
                        variant="outline"
                        onClick={() => setShowMessageComposer(true)}
                        className="mt-4 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send First Message
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className={themedCard}>
              <CardHeader>
                <CardTitle className="text-slate-900">Recent Notifications</CardTitle>
                <CardDescription className="text-slate-600">
                  User's recent notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-lg border p-4 ${
                          notification.isRead
                            ? 'border-slate-200 bg-slate-50/70'
                            : 'border-red-200 bg-red-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              <Badge variant="outline" className="border-slate-300 text-xs text-slate-700">
                                {notification.type}
                              </Badge>
                              {!notification.isRead && (
                                <Badge variant="default" className="bg-red-600 text-xs text-white hover:bg-red-600">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(notification.createdAt?.toDate?.() ?? new Date()).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className={themedCard}>
              <CardHeader>
                <CardTitle className="text-slate-900">User Preferences</CardTitle>
                <CardDescription className="text-slate-600">
                  User's application preferences and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/40 p-4">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={user.preferences?.notifications}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/40 p-4">
                    <div>
                      <h4 className="font-medium">Theme</h4>
                      <p className="text-sm text-muted-foreground">
                        Application theme preference
                      </p>
                    </div>
                    <Badge variant="outline" className="border-red-200 text-red-700">
                      {user.preferences?.theme || 'Light'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/40 p-4">
                    <div>
                      <h4 className="font-medium">Language</h4>
                      <p className="text-sm text-muted-foreground">
                        Preferred language
                      </p>
                    </div>
                    <Badge variant="outline" className="border-red-200 text-red-700">
                      {user.preferences?.language || 'English'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/40 p-4">
                    <div>
                      <h4 className="font-medium">Timezone</h4>
                      <p className="text-sm text-muted-foreground">
                        User's timezone
                      </p>
                    </div>
                    <Badge variant="outline" className="border-red-200 text-red-700">
                      {user.preferences?.timezone || 'UTC'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Message Composer Modal */}
        {currentUser && (
          <MessageComposer
            isOpen={showMessageComposer}
            onClose={() => setShowMessageComposer(false)}
            studentId={userId}
            studentName={user.displayName}
            adminUserId={currentUser.id}
            onMessageSent={() => {
              fetchMessages();
              toast.success('Message sent successfully');
            }}
          />
        )}
      </div>
    </div>
  );
}