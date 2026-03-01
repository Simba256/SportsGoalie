'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  PlayCircle,
  Lock,
  CheckCircle2,
  Clock,
  Trophy,
  Target,
  User as UserIcon,
  Flame,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatsCards } from '@/components/analytics/StatsCards';
import { userService, sportsService, videoQuizService, customContentService } from '@/lib/database';
import { customCurriculumService } from '@/lib/database';
import { User, CustomCurriculum, CustomCurriculumItem } from '@/types';
import { toast } from 'sonner';

interface CustomCurriculumDashboardProps {
  user: User;
}

interface ContentInfo {
  title: string;
  description?: string;
  sportName?: string;
  sportIcon?: string;
  sportColor?: string;
}

export function CustomCurriculumDashboard({ user }: CustomCurriculumDashboardProps) {
  const [curriculum, setCurriculum] = useState<CustomCurriculum | null>(null);
  const [coach, setCoach] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentInfo, setContentInfo] = useState<Record<string, ContentInfo>>({});

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load curriculum
      console.log('📚 Loading curriculum for student:', user.id);
      const curriculumResult = await customCurriculumService.getStudentCurriculum(user.id);
      console.log('📚 Curriculum result:', curriculumResult);

      if (curriculumResult.success && curriculumResult.data) {
        console.log('📚 Curriculum data:', {
          id: curriculumResult.data.id,
          studentId: curriculumResult.data.studentId,
          coachId: curriculumResult.data.coachId,
          itemsCount: curriculumResult.data.items?.length || 0,
          items: curriculumResult.data.items,
        });
        setCurriculum(curriculumResult.data);

        // Load content info for all items
        const info: Record<string, ContentInfo> = {};
        for (const item of curriculumResult.data.items) {
          if (item.contentId) {
            try {
              if (item.type === 'lesson') {
                const skillResult = await sportsService.getSkill(item.contentId);
                if (skillResult.success && skillResult.data) {
                  const skill = skillResult.data;
                  // Get sport info
                  const sportResult = await sportsService.getSport(skill.sportId);
                  info[item.contentId] = {
                    title: skill.name,
                    description: skill.description,
                    sportName: sportResult.data?.name,
                    sportIcon: sportResult.data?.icon,
                    sportColor: sportResult.data?.color,
                  };
                }
              } else if (item.type === 'quiz') {
                const quizResult = await videoQuizService.getQuiz(item.contentId);
                if (quizResult.success && quizResult.data) {
                  const quiz = quizResult.data;
                  const sportResult = await sportsService.getSport(quiz.sportId);
                  info[item.contentId] = {
                    title: quiz.title,
                    description: quiz.description,
                    sportName: sportResult.data?.name,
                    sportIcon: sportResult.data?.icon,
                    sportColor: sportResult.data?.color,
                  };
                }
              } else if (item.type === 'custom_lesson' || item.type === 'custom_quiz') {
                // Load custom content from content library
                const contentResult = await customContentService.getContent(item.contentId);
                if (contentResult.success && contentResult.data) {
                  info[item.contentId] = {
                    title: contentResult.data.title,
                    description: contentResult.data.description,
                    sportName: 'Custom Content',
                    sportColor: '#8b5cf6', // Purple for custom content
                  };
                }
              }
            } catch (error) {
              console.error('Failed to load content info:', error);
            }
          } else if (item.customContent) {
            info[item.id] = {
              title: item.customContent.title,
              description: item.customContent.description,
            };
          }
        }
        setContentInfo(info);
      }

      // Load coach info
      if (user.assignedCoachId) {
        const coachResult = await userService.getUser(user.assignedCoachId);
        if (coachResult.success && coachResult.data) {
          setCoach(coachResult.data);
        }
      }
    } catch (error) {
      console.error('Failed to load curriculum data:', error);
      toast.error('Failed to load your curriculum');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Calculate progress stats
  const totalItems = curriculum?.items.length || 0;
  const completedItems = curriculum?.items.filter(i => i.status === 'completed').length || 0;
  const unlockedItems = curriculum?.items.filter(i => i.status === 'unlocked').length || 0;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Find next item to work on
  const nextItem = curriculum?.items
    .sort((a, b) => a.order - b.order)
    .find(item => item.status === 'unlocked');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'unlocked':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Available
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="default">
            <PlayCircle className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Lock className="h-3 w-3 mr-1" />
            Locked
          </Badge>
        );
    }
  };

  const getContentLink = (item: CustomCurriculumItem) => {
    // All unlocked/in_progress/completed items should be accessible
    if (item.status === 'locked') return null;

    if (item.type === 'lesson' && item.contentId) {
      return `/sports/${item.pillarId}/skills/${item.contentId}`;
    } else if (item.type === 'quiz' && item.contentId) {
      return `/quiz/video/${item.contentId}`;
    } else if (item.type === 'custom_lesson' && item.contentId) {
      // Custom lessons - link to custom content viewer
      return `/learn/lesson/${item.contentId}`;
    } else if (item.type === 'custom_quiz' && item.contentId) {
      // Custom quizzes - link to video quiz player (same as regular quizzes)
      return `/quiz/video/${item.contentId}`;
    }
    return null;
  };

  const statsCards = [
    {
      title: 'Progress',
      value: `${progressPercentage}%`,
      description: `${completedItems} of ${totalItems} completed`,
      trend: progressPercentage > 50 ? ('up' as const) : ('neutral' as const),
      trendValue: '',
      icon: <Target className="h-4 w-4" />,
    },
    {
      title: 'Available',
      value: unlockedItems,
      description: unlockedItems > 0 ? 'Items ready to learn' : 'Complete current items',
      trend: unlockedItems > 0 ? ('up' as const) : ('neutral' as const),
      trendValue: '',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: 'Completed',
      value: completedItems,
      description: completedItems > 0 ? 'Great progress!' : 'Start learning',
      trend: completedItems > 0 ? ('up' as const) : ('neutral' as const),
      trendValue: '',
      icon: <Trophy className="h-4 w-4" />,
    },
    {
      title: 'Total Items',
      value: totalItems,
      description: 'In your curriculum',
      trend: 'neutral' as const,
      trendValue: '',
      icon: <Flame className="h-4 w-4" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user.displayName || user.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Continue your personalized learning journey with your coach-assigned curriculum.
            </p>
          </div>
        </div>

        {/* Coach Info Card */}
        {coach && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={coach.profileImage} alt={coach.displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(coach.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Your Coach</p>
                <h3 className="font-semibold">{coach.displayName}</h3>
                <p className="text-sm text-muted-foreground">{coach.email}</p>
              </div>
              <Link href="/messages">
                <Button variant="outline" size="sm">
                  Message Coach
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <StatsCards stats={statsCards} />

        {/* Main Content Area */}
        {!curriculum || curriculum.items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                No Curriculum Assigned Yet
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed text-center max-w-md">
                Your coach hasn't assigned any learning materials yet. Check back soon or message your coach for updates.
              </p>
              {coach && (
                <Link href="/messages">
                  <Button>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Contact Coach
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Curriculum Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Next Up Card */}
              {nextItem && (
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-primary" />
                      Continue Learning
                    </CardTitle>
                    <CardDescription>
                      Pick up where you left off
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${contentInfo[nextItem.contentId || nextItem.id]?.sportColor || '#6366f1'}20`,
                        }}
                      >
                        {nextItem.type === 'lesson' ? (
                          <BookOpen
                            className="h-6 w-6"
                            style={{ color: contentInfo[nextItem.contentId || nextItem.id]?.sportColor || '#6366f1' }}
                          />
                        ) : (
                          <PlayCircle
                            className="h-6 w-6"
                            style={{ color: contentInfo[nextItem.contentId || nextItem.id]?.sportColor || '#6366f1' }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {contentInfo[nextItem.contentId || nextItem.id]?.title || 'Learning Item'}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {contentInfo[nextItem.contentId || nextItem.id]?.description || ''}
                        </p>
                        {getContentLink(nextItem) && (
                          <Link href={getContentLink(nextItem)!}>
                            <Button>
                              {nextItem.type === 'lesson' ? 'Start Lesson' : 'Take Quiz'}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Curriculum Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Your Learning Path
                  </CardTitle>
                  <CardDescription>
                    {totalItems} items assigned by your coach
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {curriculum.items
                    .sort((a, b) => {
                      // Priority: completed > in_progress > unlocked > locked
                      const statusOrder = { completed: 0, in_progress: 1, unlocked: 2, locked: 3 };
                      const statusDiff = (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
                      if (statusDiff !== 0) return statusDiff;
                      // Within same status, sort by order
                      return a.order - b.order;
                    })
                    .map((item, index) => {
                      const info = contentInfo[item.contentId || item.id];
                      const link = getContentLink(item);

                      return (
                        <div
                          key={item.id}
                          className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                            item.status === 'locked'
                              ? 'bg-muted/30 opacity-60'
                              : item.status === 'completed'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-background hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {item.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : item.status === 'locked' ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium">
                                  {info?.title || item.customContent?.title || 'Learning Item'}
                                </h4>
                                {info?.sportName && (
                                  <p className="text-xs text-muted-foreground">
                                    {info.sportIcon} {info.sportName}
                                  </p>
                                )}
                              </div>
                              {getStatusBadge(item.status)}
                            </div>
                            {info?.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {info.description}
                              </p>
                            )}
                            {link && item.status !== 'locked' && (
                              <Link href={link} className="inline-block mt-2">
                                <Button size="sm" variant={item.status === 'completed' ? 'outline' : 'default'}>
                                  {item.status === 'completed' ? 'Review' : item.type === 'lesson' ? 'Start' : 'Take Quiz'}
                                </Button>
                              </Link>
                            )}
                          </div>
                          <div
                            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: `${info?.sportColor || '#6366f1'}15`,
                            }}
                          >
                            {item.type === 'lesson' ? (
                              <BookOpen
                                className="h-5 w-5"
                                style={{ color: info?.sportColor || '#6366f1' }}
                              />
                            ) : (
                              <PlayCircle
                                className="h-5 w-5"
                                style={{ color: info?.sportColor || '#6366f1' }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Progress & Info */}
            <div className="space-y-6">
              {/* Overall Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                  <CardDescription>
                    Your journey through the curriculum
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Completion</span>
                      <span className="font-semibold">{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    <p className="text-xs text-muted-foreground">
                      {completedItems} of {totalItems} items completed
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {completedItems}
                      </div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {unlockedItems}
                      </div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/progress" className="block">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <Target className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">View Analytics</p>
                        <p className="text-xs text-muted-foreground">
                          Detailed progress tracking
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/achievements" className="block">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <Trophy className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Achievements</p>
                        <p className="text-xs text-muted-foreground">
                          View your badges
                        </p>
                      </div>
                    </div>
                  </Link>

                  {coach && (
                    <Link href="/messages" className="block">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <UserIcon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Message Coach</p>
                          <p className="text-xs text-muted-foreground">
                            Get help or feedback
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
