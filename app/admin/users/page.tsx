'use client';

import { useState, useEffect } from 'react';
import { Search, Users, UserPlus, MoreHorizontal, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { userService } from '@/lib/database/services/user.service';
import { studentAnalyticsService } from '@/lib/database/services/student-analytics.service';
import { chartingService } from '@/lib/database/services/charting.service';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  return (
    <AdminRoute>
      <UsersManagementContent />
    </AdminRoute>
  );
}

function UsersManagementContent() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userProgressMap, setUserProgressMap] = useState<Record<string, {
    skillsAttempted: number;
    skillsCompleted: number;
    quizzesTaken: number;
    averageQuizScore: number;
    totalTimeMinutes: number;
    lastActiveDate: Date | null;
    sessionsTotal: number;
    sessionsCompleted: number;
    sessionsInProgress: number;
  } | null>>({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const fetchGoalieProgress = async (items: User[]) => {
    const goalieUsers = items.filter((item) => item.role === 'student');

    if (goalieUsers.length === 0) {
      setUserProgressMap({});
      return;
    }

    setProgressLoading(true);

    try {
      const entries = await Promise.all(
        goalieUsers.map(async (goalie) => {
          try {
            const [analyticsResult, sessionsResult] = await Promise.all([
              studentAnalyticsService.getStudentAnalytics(goalie.id),
              chartingService.getSessionsByStudent(goalie.id, { limit: 500 }),
            ]);

            const sessions = sessionsResult.success && sessionsResult.data ? sessionsResult.data : [];
            const sessionsTotal = sessions.length;
            const sessionsCompleted = sessions.filter((s) => s.status === 'completed').length;
            const sessionsInProgress = sessions.filter(
              (s) => s.status === 'in-progress' || s.status === 'pre-game'
            ).length;

            if (analyticsResult.success && analyticsResult.data) {
              const { overview, performance, progress } = analyticsResult.data;
              const noQuizData = overview.totalQuizzesTaken === 0 && overview.totalSkillsStarted === 0;

              if (noQuizData && sessionsTotal === 0) {
                return [goalie.id, null] as const;
              }

              return [
                goalie.id,
                {
                  skillsAttempted: overview.totalSkillsStarted,
                  skillsCompleted: progress.skillsCompleted,
                  quizzesTaken: overview.totalQuizzesTaken,
                  averageQuizScore: performance.averageQuizScore,
                  totalTimeMinutes: overview.totalTimeSpent,
                  lastActiveDate: overview.lastActiveDate,
                  sessionsTotal,
                  sessionsCompleted,
                  sessionsInProgress,
                },
              ] as const;
            }

            if (sessionsTotal > 0) {
              return [
                goalie.id,
                {
                  skillsAttempted: 0,
                  skillsCompleted: 0,
                  quizzesTaken: 0,
                  averageQuizScore: 0,
                  totalTimeMinutes: 0,
                  lastActiveDate: null,
                  sessionsTotal,
                  sessionsCompleted,
                  sessionsInProgress,
                },
              ] as const;
            }

            return [goalie.id, null] as const;
          } catch {
            return [goalie.id, null] as const;
          }
        })
      );

      setUserProgressMap(Object.fromEntries(entries));
    } finally {
      setProgressLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await userService.getAllUsers({
        searchTerm: searchTerm.trim() || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        limit: 100,
      });

      if (result.success && result.data) {
        setUsers(result.data.items);
        await fetchGoalieProgress(result.data.items);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!currentUser?.id) return;

    try {
      const result = await userService.changeUserRole(userId, newRole, currentUser.id);
      if (result.success) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers();
      } else {
        toast.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };


  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'coach':
        return 'default';
      case 'parent':
        return 'secondary';
      case 'student':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const themedCard = 'border-red-100/80 bg-white shadow-sm';
  const themedInput = 'border-red-200 bg-white focus-visible:ring-red-500';


  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
            <p className="text-slate-600">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <Button className="bg-red-600 text-white hover:bg-red-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className={themedCard}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">All accounts</p>
            </CardContent>
          </Card>

          <Card className={themedCard}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'student').length}
              </div>
              <p className="text-xs text-muted-foreground">Athletes</p>
            </CardContent>
          </Card>

          <Card className={themedCard}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coaches</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'coach').length}
              </div>
              <p className="text-xs text-muted-foreground">Coach accounts</p>
            </CardContent>
          </Card>

          <Card className={themedCard}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parents</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'parent').length}
              </div>
              <p className="text-xs text-muted-foreground">Parent accounts</p>
            </CardContent>
          </Card>

          <Card className={themedCard}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <ShieldCheck className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <p className="text-xs text-muted-foreground">Administrators</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className={themedCard}>
          <CardHeader>
            <CardTitle className="text-slate-900">Search and Filter Users</CardTitle>
            <CardDescription className="text-slate-600">
              Find and filter users by name, email, or role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 ${themedInput}`}
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}>
                <SelectTrigger className={`w-[180px] ${themedInput}`}>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="border-red-100">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="coach">Coaches</SelectItem>
                  <SelectItem value="parent">Parents</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className={themedCard}>
          <CardHeader>
            <CardTitle className="text-slate-900">Users ({filteredUsers.length})</CardTitle>
            <CardDescription className="text-slate-600">
              All registered users with their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading users...</div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || roleFilter !== 'all'
                    ? 'Try adjusting your search criteria'
                    : 'No users have been registered yet'
                  }
                </p>
                {(!searchTerm && roleFilter === 'all') && (
                  <Button className="bg-red-600 text-white hover:bg-red-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add First User
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-red-100 p-4 transition-colors hover:bg-red-50/60"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.profileImage} />
                        <AvatarFallback className="bg-red-100 text-red-700">
                          {(user.displayName || user.email || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-slate-900">{user.displayName || user.email || 'Unknown'}</h4>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-slate-500">
                          <span>
                            Joined: {(user.createdAt instanceof Date ? user.createdAt : user.createdAt?.toDate?.() ?? new Date()).toLocaleDateString()}
                          </span>
                          {user.lastLoginAt && (
                            <span>
                              Last seen: {(user.lastLoginAt instanceof Date ? user.lastLoginAt : user.lastLoginAt?.toDate?.() ?? new Date()).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {user.role === 'student' && (() => {
                          const progress = userProgressMap[user.id];
                          if (progressLoading && !progress) {
                            return (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Progress: Loading...
                              </div>
                            );
                          }
                          if (!progress) {
                            return (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Progress: No activity yet
                              </div>
                            );
                          }
                          const hours = progress.totalTimeMinutes > 0
                            ? `${(progress.totalTimeMinutes / 60).toFixed(1)}h`
                            : '0h';
                          return (
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              <Badge variant="secondary" className="border-red-100 bg-red-100/70 text-red-800">
                                {progress.skillsCompleted}/{progress.skillsAttempted} skills passed
                              </Badge>
                              <Badge variant="secondary" className="border-red-100 bg-red-100/70 text-red-800">
                                {progress.quizzesTaken} quiz{progress.quizzesTaken === 1 ? '' : 'zes'}
                              </Badge>
                              <Badge variant="secondary" className="border-red-100 bg-red-100/70 text-red-800">
                                {progress.averageQuizScore}% avg
                              </Badge>
                              {progress.sessionsTotal > 0 && (
                                <Badge variant="secondary" className="border-red-100 bg-red-100/70 text-red-800">
                                  {progress.sessionsCompleted}/{progress.sessionsTotal} sessions
                                  {progress.sessionsInProgress > 0 ? ` (${progress.sessionsInProgress} active)` : ''}
                                </Badge>
                              )}
                              <Badge variant="outline" className="border-red-200 text-red-700">{hours} total</Badge>
                              {progress.lastActiveDate && (
                                <Badge variant="outline" className="border-red-200 text-red-700">
                                  Active {progress.lastActiveDate.toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                          View Profile
                        </Button>
                      </Link>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-slate-700 hover:bg-red-50 hover:text-red-700">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-red-100">
                          <DropdownMenuItem asChild className="focus:bg-red-50 focus:text-red-800">
                            <Link href={`/admin/users/${user.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {user.role !== 'student' && (
                            <DropdownMenuItem
                              className="focus:bg-red-50 focus:text-red-800"
                              onClick={() => handleRoleChange(user.id, 'student')}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Make Student
                            </DropdownMenuItem>
                          )}

                          {user.role !== 'coach' && (
                            <DropdownMenuItem
                              className="focus:bg-red-50 focus:text-red-800"
                              onClick={() => handleRoleChange(user.id, 'coach')}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Make Coach
                            </DropdownMenuItem>
                          )}

                          {user.role !== 'parent' && (
                            <DropdownMenuItem
                              className="focus:bg-red-50 focus:text-red-800"
                              onClick={() => handleRoleChange(user.id, 'parent')}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Make Parent
                            </DropdownMenuItem>
                          )}

                          {user.role !== 'admin' && (
                            <DropdownMenuItem
                              className="focus:bg-red-50 focus:text-red-800"
                              onClick={() => handleRoleChange(user.id, 'admin')}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}