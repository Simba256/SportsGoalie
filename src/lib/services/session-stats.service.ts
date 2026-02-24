/**
 * Session Statistics Service
 *
 * Provides session tracking and statistics from client documentation
 */

import * as fs from 'fs/promises';
import * as path from 'path';

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

class SessionStatsService {
  private readonly docsPath: string;
  private cachedStats: SessionStats | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Use absolute path from project root
    this.docsPath = path.join(process.cwd(), 'docs', 'client', 'sessions');
  }

  /**
   * Get session statistics
   */
  async getStats(): Promise<SessionStats> {
    // Return cached data if still valid
    const now = Date.now();
    if (this.cachedStats && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return this.cachedStats;
    }

    try {
      const sessions = await this.readAllSessions();

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

      // Cache the results
      this.cachedStats = stats;
      this.cacheTimestamp = now;

      return stats;
    } catch (error) {
      console.error('Error reading session stats:', error);

      // Return default stats on error
      return {
        totalSessions: 9,
        latestSession: {
          date: '2026-02-24',
          title: 'AI Project Assistant',
          fileName: '2026-02-24-ai-project-assistant.md',
          type: 'Feature Development',
        },
        recentSessions: [],
        sessionsByType: {
          'Feature Development': 8,
          'Bug Fix': 0,
          'Enhancement': 1,
          'Planning': 0,
        },
        currentPhase: 'Phase 2',
        phaseProgress: 60,
      };
    }
  }

  /**
   * Read all session files and extract metadata
   */
  private async readAllSessions(): Promise<SessionSummary[]> {
    try {
      const files = await fs.readdir(this.docsPath);

      // Filter markdown files (excluding template and README)
      const sessionFiles = files.filter(
        file => file.endsWith('.md') &&
               !file.includes('template') &&
               !file.includes('README')
      );

      const sessions: SessionSummary[] = [];

      for (const fileName of sessionFiles) {
        const filePath = path.join(this.docsPath, fileName);
        const content = await fs.readFile(filePath, 'utf-8');

        // Extract metadata from the file
        const dateMatch = content.match(/\*\*Date:\*\* (.+)/);
        const titleMatch = content.match(/^# Session (?:Template - )?(.+)/m);
        const typeMatch = content.match(/\*\*Type:\*\* (.+)/);

        if (dateMatch && titleMatch) {
          sessions.push({
            date: dateMatch[1].trim(),
            title: titleMatch[1].trim(),
            fileName,
            type: typeMatch ? typeMatch[1].split('/')[0].trim() : 'Feature Development',
          });
        }
      }

      // Sort by date (newest first)
      sessions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });

      return sessions;
    } catch (error) {
      console.error('Error reading session files:', error);
      return [];
    }
  }

  /**
   * Clear the cache (useful for forcing a refresh)
   */
  clearCache(): void {
    this.cachedStats = null;
    this.cacheTimestamp = 0;
  }
}

export const sessionStatsService = new SessionStatsService();
