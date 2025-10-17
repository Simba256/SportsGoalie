'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Trophy,
  BookOpen,
  Award,
  CheckCircle,
  Clock
} from 'lucide-react';
// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

interface ActivityRecord {
  id: string;
  type: 'quiz_completed' | 'skill_started' | 'skill_completed' | 'sport_enrolled' | 'achievement_unlocked';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityTimelineProps {
  activities: ActivityRecord[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_completed':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'skill_started':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'skill_completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'sport_enrolled':
        return <Activity className="h-5 w-5 text-purple-600" />;
      case 'achievement_unlocked':
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quiz_completed':
        return 'border-yellow-200 bg-yellow-50';
      case 'skill_started':
        return 'border-blue-200 bg-blue-50';
      case 'skill_completed':
        return 'border-green-200 bg-green-50';
      case 'sport_enrolled':
        return 'border-purple-200 bg-purple-50';
      case 'achievement_unlocked':
        return 'border-amber-200 bg-amber-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'quiz_completed':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Quiz</Badge>;
      case 'skill_started':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Skill Started</Badge>;
      case 'skill_completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Skill Completed</Badge>;
      case 'sport_enrolled':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Enrolled</Badge>;
      case 'achievement_unlocked':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Achievement</Badge>;
      default:
        return <Badge variant="outline">Activity</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>
          Latest learning activities and achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-border" />

            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-start space-x-4 pb-4">
                {/* Icon */}
                <div className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-full border-2 ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between space-x-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        {getTypeBadge(activity.type)}
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm truncate">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>

                      {/* Metadata badges for quiz */}
                      {activity.type === 'quiz_completed' && activity.metadata && (
                        <div className="flex items-center space-x-2 pt-1">
                          {activity.metadata.passed && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              ✓ Passed
                            </Badge>
                          )}
                          {activity.metadata.score && (
                            <Badge variant="outline">
                              Score: {activity.metadata.score}%
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mb-3 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
