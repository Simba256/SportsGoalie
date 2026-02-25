/**
 * Session Statistics Service
 *
 * Provides session tracking and statistics from client documentation
 * Note: Uses hardcoded data since docs/ folder is not available at runtime on Vercel
 */

export interface SessionSummary {
  date: string;
  title: string;
  fileName: string;
  type: string;
}

export interface SessionStats {
  totalSessions: number;
  latestSession: SessionSummary | null;
  recentSessions: SessionSummary[];
  sessionsByType: {
    'Feature Development': number;
    'Bug Fix': number;
    'Enhancement': number;
    'Planning': number;
  };
  currentPhase: string;
  phaseProgress: number;
}

// Hardcoded session data - docs/ folder not available at Vercel runtime
const SESSION_DATA: SessionSummary[] = [
  {
    date: '2026-02-24',
    title: 'AI Project Assistant',
    fileName: '2026-02-24-ai-project-assistant.md',
    type: 'Feature Development',
  },
  {
    date: '2026-02-23',
    title: 'Custom Curriculum System MVP',
    fileName: '2026-02-23-custom-curriculum-system-mvp.md',
    type: 'Feature Development',
  },
  {
    date: '2026-02-23',
    title: 'Curriculum Content Browser',
    fileName: '2026-02-23-curriculum-content-browser.md',
    type: 'Feature Development',
  },
  {
    date: '2026-02-23',
    title: 'Admin Curriculum Management Access',
    fileName: '2026-02-23-admin-curriculum-management-access.md',
    type: 'Feature Development',
  },
  {
    date: '2026-02-22',
    title: 'Documentation System Setup',
    fileName: '2026-02-22-documentation-system-setup.md',
    type: 'Enhancement',
  },
  {
    date: '2026-02-22',
    title: 'Coach Invitation System',
    fileName: '2026-02-22-coach-invitation-system.md',
    type: 'Feature Development',
  },
  {
    date: '2026-02-22',
    title: 'Multi-Role Authentication',
    fileName: '2026-02-22-multi-role-authentication.md',
    type: 'Feature Development',
  },
  {
    date: '2026-02-22',
    title: 'Student ID System',
    fileName: '2026-02-22-student-id-system.md',
    type: 'Feature Development',
  },
  {
    date: '2026-02-22',
    title: 'Visual Branding Update',
    fileName: '2026-02-22-visual-branding-update.md',
    type: 'Feature Development',
  },
];

class SessionStatsService {
  /**
   * Get session statistics
   */
  async getStats(): Promise<SessionStats> {
    const sessions = SESSION_DATA;

    const stats: SessionStats = {
      totalSessions: sessions.length,
      latestSession: sessions[0] || null,
      recentSessions: sessions.slice(0, 5),
      sessionsByType: {
        'Feature Development': 0,
        'Bug Fix': 0,
        'Enhancement': 0,
        'Planning': 0,
      },
      currentPhase: 'Phase 2',
      phaseProgress: 60,
    };

    // Count sessions by type
    sessions.forEach(session => {
      const type = session.type as keyof typeof stats.sessionsByType;
      if (stats.sessionsByType[type] !== undefined) {
        stats.sessionsByType[type]++;
      }
    });

    return stats;
  }

  /**
   * Clear the cache (no-op now since data is hardcoded)
   */
  clearCache(): void {
    // No-op - data is now hardcoded
  }
}

export const sessionStatsService = new SessionStatsService();
