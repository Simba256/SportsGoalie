'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, ClipboardCheck, User, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { userService, coachChartingService } from '@/lib/database';
import type { User as UserType } from '@/types';

const BLUE = '#37b5ff';
const card = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(55,181,255,0.12)',
  borderRadius: '14px',
  padding: '20px 24px',
  transition: 'all 0.2s',
} as const;

interface GoalieSummary {
  id: string;
  displayName: string;
  email: string;
  chartedSessions: number;
}

export default function CoachChartingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goalies, setGoalies] = useState<GoalieSummary[]>([]);

  useEffect(() => {
    if (user?.id) load();
  }, [user?.id]);

  const load = async () => {
    try {
      const result = await userService.getAllUsers({ role: 'student', limit: 200 });
      if (!result.success || !result.data) return;

      const assigned = result.data.items.filter(
        (u: UserType) => u.workflowType === 'custom' && (user?.role === 'admin' || u.assignedCoachId === user?.id)
      );

      const summaries: GoalieSummary[] = await Promise.all(
        assigned.map(async (goalie: UserType) => {
          const chartsResult = await coachChartingService.getChartsByStudent(goalie.id, user!.id);
          return {
            id: goalie.id,
            displayName: goalie.displayName || goalie.email.split('@')[0],
            email: goalie.email,
            chartedSessions: chartsResult.success ? (chartsResult.data?.length ?? 0) : 0,
          };
        })
      );

      setGoalies(summaries);
    } catch (err) {
      console.error('Failed to load charting data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `rgba(55,181,255,0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={20} color={BLUE} />
          </div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: 0 }}>Charting</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: 0 }}>
          Select a goalie to add or continue your game charts
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ ...card, height: '76px', opacity: 0.4, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && goalies.length === 0 && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '48px 24px', textAlign: 'center' }}>
          <AlertCircle size={36} color="rgba(255,255,255,0.2)" />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>No goalies assigned to your roster yet.</p>
          <Link href="/coach/students" style={{ color: BLUE, fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Go to My Goalies →
          </Link>
        </div>
      )}

      {/* Goalie list */}
      {!loading && goalies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {goalies.map(goalie => (
            <Link
              key={goalie.id}
              href={`/coach/charting/${goalie.id}`}
              style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', cursor: 'pointer' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(55,181,255,0.07)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(55,181,255,0.28)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(55,181,255,0.12)';
              }}
            >
              {/* Avatar */}
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={18} color="#000f28" />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {goalie.displayName}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', margin: '2px 0 0' }}>
                  {goalie.email}
                </p>
              </div>

              {/* Chart count badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <ClipboardCheck size={15} color={goalie.chartedSessions > 0 ? '#34d399' : 'rgba(255,255,255,0.25)'} />
                <span style={{ color: goalie.chartedSessions > 0 ? '#34d399' : 'rgba(255,255,255,0.35)', fontSize: '13px', fontWeight: 600 }}>
                  {goalie.chartedSessions} {goalie.chartedSessions === 1 ? 'chart' : 'charts'}
                </span>
              </div>

              <ChevronRight size={16} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
