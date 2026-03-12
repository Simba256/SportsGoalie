'use client';

import { useState, useEffect } from 'react';
import { User, LinkedChildSummary } from '@/types';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parentLinkService } from '@/lib/database';
import { ChildProgressCard } from './ChildProgressCard';
import { LinkChildForm } from './LinkChildForm';
import {
  Users,
  UserPlus,
  TrendingUp,
  ClipboardCheck,
  Loader2,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

interface ParentDashboardProps {
  user: User;
}

export function ParentDashboard({ user }: ParentDashboardProps) {
  const [children, setChildren] = useState<LinkedChildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await parentLinkService.getLinkedChildren(user.id);

      if (result.success && result.data) {
        setChildren(result.data);
      } else {
        setError(result.error?.message || 'Failed to load linked goalies');
      }
    } catch (err) {
      console.error('Failed to load children:', err);
      setError('Failed to load linked goalies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, [user.id]);

  const handleLinkSuccess = () => {
    loadChildren();
    setActiveTab('overview');
  };

  // Calculate aggregate stats
  const totalQuizzes = children.reduce((sum, c) => sum + (c.quizzesCompleted || 0), 0);
  const avgProgress = children.length > 0
    ? Math.round(children.reduce((sum, c) => sum + (c.progressPercentage || 0), 0) / children.length)
    : 0;
  const childrenWithAssessment = children.filter(c => c.hasCompletedAssessment).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Parent Dashboard</h1>
        <p className="text-muted-foreground">
          Track your goalie's progress and support their development
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {children.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Linked Goalies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-3xl font-bold">{children.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="text-3xl font-bold">{avgProgress}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                <span className="text-3xl font-bold">{totalQuizzes}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Assessments Done</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-muted-foreground" />
                <span className="text-3xl font-bold">
                  {childrenWithAssessment}/{children.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Parent Assessment Prompt */}
      {!user.parentOnboardingComplete && children.length > 0 && (
        <Alert>
          <ClipboardCheck className="h-4 w-4" />
          <AlertTitle>Complete Your Parent Assessment</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Take the parent questionnaire to see how your perceptions compare with your goalie's
              self-assessment.
            </span>
            <Button size="sm" asChild className="ml-4">
              <Link href="/parent/onboarding">Start Assessment</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Goalies
          </TabsTrigger>
          <TabsTrigger value="link" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Link New Goalie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {children.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  <div>
                    <h3 className="text-lg font-semibold">No Linked Goalies</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Link your goalie's account to track their progress and support their development.
                      Ask them for their link code from their profile settings.
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab('link')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Link Your Goalie
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <ChildProgressCard key={child.childId} child={child} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="link" className="mt-6">
          <div className="max-w-md mx-auto">
            <LinkChildForm parentId={user.id} onLinkSuccess={handleLinkSuccess} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
