'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Activity,
  Bell,
  Settings,
  Trophy,
  Target,
  Clock,
  MapPin,
  Phone,
  Edit,
  Save,
  X,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { User as UserType, UserRole, UserProgress, Notification, Message } from '@/types';
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
import { QuizPerformanceChart } from '@/src/components/admin/analytics/QuizPerformanceChart';
import { ProgressOverTimeChart } from '@/src/components/admin/analytics/ProgressOverTimeChart';
import { SkillPerformanceTable } from '@/src/components/admin/analytics/SkillPerformanceTable';
import { ActivityTimeline } from '@/src/components/admin/analytics/ActivityTimeline';
import { EngagementMetrics } from '@/src/components/admin/analytics/EngagementMetrics';
import { CourseProgress } from '@/src/components/admin/analytics/CourseProgress';
import { QuizAttemptHistory } from '@/src/components/admin/analytics/QuizAttemptHistory';

export default function AdminUserDetailsPage() {
  return (
    <AdminRoute>
      <UserDetailsContent />
    </AdminRoute>
  );
}

function UserDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params.id as string;

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

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

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
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading user details...</div>
        </div>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">User Profile</h1>
              <p className="text-muted-foreground">
                Manage {user.displayName}'s account and settings
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && currentUser && (
              <Button
                variant="outline"
                onClick={() => setShowMessageComposer(true)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            )}
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            )}
          </div>
        </div>

        {/* User Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profile?.avatarUrl} />
                <AvatarFallback className="text-lg">
                  {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold">{user.displayName}</h2>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  {user.lastLoginAt && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      Last seen {new Date(user.lastLoginAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="analytics" onClick={fetchAnalytics}>Analytics</TabsTrigger>
            <TabsTrigger value="progress" onClick={fetchAnalytics}>Progress</TabsTrigger>
            <TabsTrigger value="messages" onClick={fetchMessages}>Messages</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
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
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{user.displayName}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                      {user.emailVerified && (
                        <Badge variant="outline" className="text-xs">Verified</Badge>
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
                      <span>{user.profile?.firstName || 'Not provided'}</span>
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
                      <span>{user.profile?.lastName || 'Not provided'}</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
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
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Account Status</Label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editedUser?.isActive}
                          onCheckedChange={(checked) => setEditedUser(prev => prev ? {...prev, isActive: checked} : null)}
                        />
                        <span>{editedUser?.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label>Date of Birth</Label>
                    <div className="flex items-center space-x-2">
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
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.profile?.country || 'Not provided'}</span>
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
              <Card>
                <CardHeader>
                  <CardTitle>Overall Statistics</CardTitle>
                  <CardDescription>
                    User's learning progress and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userProgress ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {userProgress.overallStats.skillsCompleted}
                          </div>
                          <p className="text-sm text-muted-foreground">Skills Attempted</p>
                        </div>
                        <div className="text-center">
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

              <Card>
                <CardHeader>
                  <CardTitle>Video Quiz Performance</CardTitle>
                  <CardDescription>
                    Performance metrics from video quizzes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {analytics.performance.totalQuizzesPassed}
                          </div>
                          <p className="text-sm text-muted-foreground">Passed</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {analytics.performance.totalQuizzesFailed}
                          </div>
                          <p className="text-sm text-muted-foreground">Failed</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Pass Rate</span>
                          <span className="font-medium">
                            {analytics.performance.passRate}%
                          </span>
                        </div>
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

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
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
                        className={`p-4 border rounded-lg ${
                          message.isRead ? 'bg-muted/50' : 'bg-background'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{message.subject}</h4>
                              <Badge variant="outline" className="text-xs">
                                {message.type.replace('_', ' ')}
                              </Badge>
                              {!message.isRead && (
                                <Badge variant="default" className="text-xs">
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
                              Sent {new Date(message.createdAt).toLocaleString()}
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
                        className="mt-4"
                        variant="outline"
                        onClick={() => setShowMessageComposer(true)}
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
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>
                  User's recent notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg ${
                          notification.isRead ? 'bg-muted/50' : 'bg-background'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {notification.type}
                              </Badge>
                              {!notification.isRead && (
                                <Badge variant="default" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleString()}
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
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>
                  User's application preferences and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
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

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Theme</h4>
                      <p className="text-sm text-muted-foreground">
                        Application theme preference
                      </p>
                    </div>
                    <Badge variant="outline">
                      {user.preferences?.theme || 'Light'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Language</h4>
                      <p className="text-sm text-muted-foreground">
                        Preferred language
                      </p>
                    </div>
                    <Badge variant="outline">
                      {user.preferences?.language || 'English'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Timezone</h4>
                      <p className="text-sm text-muted-foreground">
                        User's timezone
                      </p>
                    </div>
                    <Badge variant="outline">
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