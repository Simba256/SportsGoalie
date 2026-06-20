'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { useRouter, useParams } from 'next/navigation';
import { chartingService, parentChartingService } from '@/lib/database';
import { Session, ParentChartEntry } from '@/types';
import { ArrowLeft, CheckCircle, Lock, Timer, BarChart3, MessageSquare, Heart } from 'lucide-react';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ParentChartHubPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [entry, setEntry] = useState<ParentChartEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !sessionId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [sessionResult, chartResult] = await Promise.all([
          chartingService.getSession(sessionId),
          parentChartingService.getChartBySession(sessionId, user.id),
        ]);
        if (sessionResult.success && sessionResult.data) setSession(sessionResult.data);
        if (chartResult.success && chartResult.data) setEntry(chartResult.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, sessionId]);

  // Reload when window regains focus (user returns after completing a section)
  useEffect(() => {
    const onFocus = () => {
      if (!user || !sessionId) return;
      parentChartingService.getChartBySession(sessionId, user.id).then(r => {
        if (r.success && r.data) setEntry(r.data);
      });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ background: '#041830' }}>
        <SkeletonContentPage />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#041830' }}>
        <div className="text-center space-y-3">
          <p className="text-white/60">Session not found</p>
          <button
            type="button"
            onClick={() => router.push('/parent/charting')}
            className="text-sm text-[#37b5ff] hover:underline"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  const completed = entry?.completedSections ?? [];
  const preGameDone = completed.includes('preGame');
  const periodsDone = completed.includes('periods');
  const postGameDone = completed.includes('postGame');
  const allDone = preGameDone && periodsDone && postGameDone;

  type StepConfig = {
    key: string;
    label: string;
    sub: string;
    icon: React.ReactNode;
    done: boolean;
    unlocked: boolean;
    href: string;
    lockedHint: string;
  };

  const steps: StepConfig[] = [
    {
      key: 'pre-game',
      label: 'Pre-Game',
      sub: 'How your Goalie seemed before',
      icon: <Timer className="w-5 h-5 text-white" />,
      done: preGameDone,
      unlocked: true,
      href: `/charting/sessions/${sessionId}/parent-chart/pre-game`,
      lockedHint: '',
    },
    {
      key: 'periods',
      label: 'Periods',
      sub: 'P1 · P2 · P3 — what you noticed',
      icon: <BarChart3 className="w-5 h-5 text-white" />,
      done: periodsDone,
      unlocked: preGameDone,
      href: `/charting/sessions/${sessionId}/parent-chart/periods`,
      lockedHint: 'Complete Pre-Game first',
    },
    {
      key: 'post-game',
      label: 'Post-Game',
      sub: 'Reflection & car ride',
      icon: <MessageSquare className="w-5 h-5 text-white" />,
      done: postGameDone,
      unlocked: preGameDone && periodsDone,
      href: `/charting/sessions/${sessionId}/parent-chart/post-game`,
      lockedHint: 'Complete Periods first',
    },
  ];

  const sessionDateObj = (() => {
    const raw = session.date as unknown;
    if (raw && typeof raw === 'object' && 'toDate' in raw && typeof (raw as { toDate?: unknown }).toDate === 'function') {
      return (raw as { toDate: () => Date }).toDate();
    }
    if (raw instanceof Date) return raw;
    return null;
  })();

  return (
    <div className="min-h-screen" style={{ background: '#041830' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ background: 'rgba(6,30,58,0.97)', borderColor: 'rgba(55,181,255,0.18)' }}>
        <div className="flex items-center justify-between px-6 h-16">
          <button
            type="button"
            onClick={() => router.push('/parent/charting')}
            className="flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-[#7dd3fc] to-white bg-clip-text text-transparent">
            Parent Chart
          </h1>
          <div className="w-14" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-lg mx-auto">

        {/* ── Session info ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 100%)', border: '1px solid rgba(55,181,255,0.22)' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(55,181,255,0.12)' }}>
              <Heart className="w-4 h-4" style={{ color: '#7dd3fc' }} />
            </div>
            <div>
              <p className="font-bold text-white text-base">
                {session.type === 'game' ? 'Game' : 'Practice'}
                {session.opponent ? ` vs ${session.opponent}` : ''}
              </p>
              <p className="text-xs text-white/40">
                {sessionDateObj ? sessionDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
              </p>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-3 leading-relaxed">
            You're not judging — you're observing. Your perspective cross-references with your Goalie's
            self-evaluation. Where they align, that confirms the read. Where they diverge, that's where coaching begins.
          </p>
        </div>

        {/* ── Completion banner ─────────────────────────────────────────────── */}
        {allDone && (
          <div className="rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
            <div>
              <p className="text-sm font-bold text-green-300">Chart complete</p>
              <p className="text-xs text-white/45 mt-0.5">Cross-referenced with your Goalie's self-evaluation.</p>
            </div>
          </div>
        )}

        {/* ── Steps ─────────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={step.key}
              onClick={() => step.unlocked && router.push(step.href)}
              className="relative p-5 border rounded-2xl transition-all"
              style={
                step.done
                  ? { borderColor: '#37b5ff', background: 'rgba(55,181,255,0.08)', cursor: 'pointer' }
                  : step.unlocked
                  ? { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }
                  : { borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', cursor: 'not-allowed', opacity: 0.45 }
              }
            >
              {/* Step number */}
              <div
                className="absolute top-4 left-4 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={step.done ? { background: '#37b5ff', color: '#fff' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
              >
                {idx + 1}
              </div>

              {step.done && (
                <CheckCircle className="absolute top-4 right-4 w-4 h-4" style={{ color: '#37b5ff' }} />
              )}
              {!step.unlocked && (
                <Lock className="absolute top-4 right-4 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
              )}

              <div className="flex items-center gap-4 pl-7">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={step.done ? { background: '#37b5ff' } : step.unlocked ? { background: 'rgba(255,255,255,0.08)' } : { background: 'rgba(255,255,255,0.04)' }}
                >
                  {step.unlocked ? step.icon : <Lock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: step.unlocked ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                    {step.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: step.unlocked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)' }}>
                    {step.unlocked ? step.sub : step.lockedHint}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer note ──────────────────────────────────────────────────── */}
        <p className="text-center text-xs text-white/25 pb-6">
          The Smarter Goalie Way™ · Four charts, one mirror
        </p>
      </div>
    </div>
  );
}
