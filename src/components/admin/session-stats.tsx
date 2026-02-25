'use client';

import { Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionSummary {
  date: string;
  title: string;
  type: string;
}

// Static session data - updated Feb 25, 2026
const SESSION_DATA: SessionSummary[] = [
  // Feb 25 (1 session)
  {
    date: '2026-02-25',
    title: 'Development Progress Dashboard',
    type: 'Feature Development',
  },
  // Feb 24 (2 sessions)
  {
    date: '2026-02-24',
    title: 'AI Project Assistant',
    type: 'Feature Development',
  },
  {
    date: '2026-02-24',
    title: 'Custom Curriculum System MVP',
    type: 'Feature Development',
  },
  // Feb 23 (2 sessions)
  {
    date: '2026-02-23',
    title: 'Curriculum Content Browser',
    type: 'Feature Development',
  },
  {
    date: '2026-02-23',
    title: 'Admin Curriculum Management Access',
    type: 'Feature Development',
  },
  // Feb 22 (5 sessions)
  {
    date: '2026-02-22',
    title: 'Documentation System Setup',
    type: 'Enhancement',
  },
  {
    date: '2026-02-22',
    title: 'Coach Invitation System',
    type: 'Feature Development',
  },
  {
    date: '2026-02-22',
    title: 'Multi-Role Authentication',
    type: 'Feature Development',
  },
  {
    date: '2026-02-22',
    title: 'Student ID System',
    type: 'Feature Development',
  },
  {
    date: '2026-02-22',
    title: 'Visual Branding Update',
    type: 'Feature Development',
  },
];

const TOTAL_SESSIONS = SESSION_DATA.length;
const FEATURES_BUILT = SESSION_DATA.filter(s => s.type === 'Feature Development').length;
const CURRENT_PHASE = 'Phase 2';
const PHASE_PROGRESS = 60;

export function SessionStatsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Development Sessions
        </CardTitle>
        <CardDescription>Recent work and progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase Progress */}
        <div className="space-y-3">
          {/* Current Phase */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{CURRENT_PHASE} <span className="text-xs text-blue-600 dark:text-blue-400">(Current)</span></span>
              <span className="text-sm text-muted-foreground">{PHASE_PROGRESS}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${PHASE_PROGRESS}%` }}
              />
            </div>
          </div>

          {/* Future Phases */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Phase 3 - Advanced Analytics</span>
              <span className="text-muted-foreground">Upcoming</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Phase 4 - Mobile App</span>
              <span className="text-muted-foreground">Planned</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Phase 5 - AI Coaching</span>
              <span className="text-muted-foreground">Planned</span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-primary">{TOTAL_SESSIONS}</div>
            <div className="text-xs text-muted-foreground">Total Sessions</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-primary">{FEATURES_BUILT}</div>
            <div className="text-xs text-muted-foreground">Features Built</div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Sessions</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {SESSION_DATA.slice(0, 5).map((session, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.type} • {new Date(session.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
