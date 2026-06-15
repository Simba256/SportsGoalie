'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { TrainingLogEntry, TrainingCategory } from '@/types/charting';
import { computeTrainingAnalytics, TrainingAnalytics } from '@/lib/training/analytics';
import { TrainingAnalyticsDashboard } from '@/components/training/TrainingAnalyticsDashboard';
import { Dumbbell, Snowflake, Zap, Leaf, Trophy, Plus, ChevronRight, Calendar, BarChart3 } from 'lucide-react';

const CYAN = '#00FFFF';
const MINT = '#00FF99';
const VIOLET = '#B388FF';
const CORAL = '#FF6B6B';

const CATEGORIES: { id: TrainingCategory; label: string; icon: typeof Dumbbell; color: string }[] = [
  { id: 'ice', label: 'Ice', icon: Snowflake, color: CYAN },
  { id: 'puck_machine', label: 'Puck Machine', icon: Zap, color: MINT },
  { id: 'land_conditioning', label: 'Land / Conditioning', icon: Dumbbell, color: VIOLET },
  { id: 'lifestyle_foundations', label: 'Lifestyle Foundations', icon: Leaf, color: '#FFD166' },
  { id: 'games_tourneys', label: 'Games / Tourneys', icon: Trophy, color: CORAL },
];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function TrainingHubPage() {
  const { user } = useAuth();
  const [recentLogs, setRecentLogs] = useState<TrainingLogEntry[]>([]);
  const [todayLog, setTodayLog] = useState<TrainingLogEntry | null>(null);
  const [analytics, setAnalytics] = useState<TrainingAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'training_logs'),
          where('goalieId', '==', user.id),
          orderBy('date', 'desc'),
          limit(7)
        );
        const snap = await getDocs(q);
        const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingLogEntry));
        setRecentLogs(logs);
        const today = todayStr();
        setTodayLog(logs.find(l => l.date === today) || null);
        setAnalytics(computeTrainingAnalytics(logs));
      } catch {
        // silently fail — user sees empty state
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const today = todayStr();
  const todayDone = todayLog?.items.filter(i => i.done).length ?? 0;
  const todayTotal = todayLog?.items.length ?? 0;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Daily Training
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
          Track your training across all categories
        </p>
      </div>

      {/* Today's Entry Card */}
      <div style={{
        background: 'rgba(0,255,255,0.06)',
        border: `1px solid rgba(0,255,255,0.2)`,
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Calendar style={{ width: '16px', height: '16px', color: CYAN }} />
              <span style={{ color: CYAN, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Today
              </span>
            </div>
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>
              {formatDate(today)}
            </p>
          </div>
          {todayLog && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: MINT, fontSize: '22px', fontWeight: 800 }}>{todayDone}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>of {todayTotal} done</div>
            </div>
          )}
        </div>
        <Link
          href="/training/log"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '12px',
            background: todayLog ? 'rgba(0,255,153,0.12)' : `linear-gradient(135deg, ${CYAN} 0%, ${MINT} 100%)`,
            border: todayLog ? '1px solid rgba(0,255,153,0.3)' : 'none',
            color: todayLog ? MINT : '#06050f',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'opacity 0.18s',
          }}
        >
          {todayLog ? (
            <>Update Today&apos;s Log <ChevronRight style={{ width: '16px', height: '16px' }} /></>
          ) : (
            <><Plus style={{ width: '16px', height: '16px' }} /> Start Today&apos;s Log</>
          )}
        </Link>
      </div>

      {/* Categories Overview */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          Categories
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const catItems = todayLog?.items.filter(i => i.category === cat.id) ?? [];
            const done = catItems.filter(i => i.done).length;
            const total = catItems.length;
            return (
              <Link
                key={cat.id}
                href={`/training/log?category=${cat.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  textDecoration: 'none',
                  transition: 'background 0.18s',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: `${cat.color}18`,
                  border: `1px solid ${cat.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon style={{ width: '18px', height: '18px', color: cat.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{cat.label}</p>
                  {total > 0 && (
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{done}/{total} done today</p>
                  )}
                </div>
                <ChevronRight style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.2)' }} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Logs */}
      {!loading && recentLogs.filter(l => l.date !== today).length > 0 && (
        <div>
          <h2 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Recent
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentLogs.filter(l => l.date !== today).slice(0, 5).map(log => {
              const done = log.items.filter(i => i.done).length;
              return (
                <Link
                  key={log.id}
                  href={`/training/log?date=${log.date}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textDecoration: 'none',
                  }}
                >
                  <div>
                    <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{formatDate(log.date)}</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{done} items completed</p>
                  </div>
                  <ChevronRight style={{ width: '15px', height: '15px', color: 'rgba(255,255,255,0.2)' }} />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Loading…</p>
        </div>
      )}

      {/* Analytics section */}
      {!loading && analytics && analytics.overallScore > 0 && (
        <div style={{ marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => setShowAnalytics(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: '12px',
              background: showAnalytics ? 'rgba(0,255,153,0.06)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${showAnalytics ? 'rgba(0,255,153,0.2)' : 'rgba(255,255,255,0.07)'}`,
              cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 style={{ width: '16px', height: '16px', color: MINT }} />
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Training Analytics</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontWeight: 700 }}>
              {analytics.masteryPercent}% mastery
            </span>
          </button>
          {showAnalytics && (
            <div style={{ marginTop: '12px' }}>
              <TrainingAnalyticsDashboard analytics={analytics} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
