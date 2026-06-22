'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { useRouter, useParams } from 'next/navigation';
import { chartingService, parentChartingService } from '@/lib/database';
import { Session, ParentChartEntry } from '@/types';
import { ArrowLeft, CheckCircle, Lock, Timer, BarChart3, MessageSquare, ChevronRight, Eye, GitMerge, Lightbulb, Users, ArrowRight } from 'lucide-react';

// ─── Intro overlay ────────────────────────────────────────────────────────────

function IntroOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col animate-in fade-in duration-300"
      style={{ background: '#041830' }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 w-[600px] h-[600px] opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #37b5ff 0%, transparent 70%)', transform: 'translate(-50%, -30%)' }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-5 py-8 max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(55,181,255,0.2)' }}
          >
            <Eye className="w-3.5 h-3.5" style={{ color: '#7dd3fc' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#7dd3fc' }}>Observer Mode</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Before You Start
          </h1>
          <p className="text-sm text-white/45 leading-relaxed max-w-sm mx-auto">
            Your perspective is one of four charts that cross-reference in real time. Here's how it works.
          </p>
        </div>

        {/* ── How the Cross-Reference Works ──────────────────────────────── */}
        <div
          className="rounded-2xl p-5 mb-4 space-y-5"
          style={{
            background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 100%)',
            border: '1px solid rgba(55,181,255,0.22)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(55,181,255,0.15)' }}>
              <GitMerge className="w-4 h-4" style={{ color: '#7dd3fc' }} />
            </div>
            <p className="text-sm font-bold text-white">How the Cross-Reference Works</p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '📍', title: 'Where you align', body: "When your read matches your Goalie's self-eval, it confirms the signal — data the coach can act on." },
              { icon: '⚡', title: 'Where you diverge', body: "Mismatches are the most valuable data. They reveal blind spots — yours or theirs — and that's where growth begins." },
              { icon: '🔒', title: 'Your data stays private', body: "Your observations are shared with the platform and coaching team, not your Goalie directly." },
            ].map(item => (
              <div key={item.title} className="flex gap-3.5 items-start">
                <span className="text-xl flex-shrink-0 leading-none mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white/85">{item.title}</p>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── What Each Section Captures + The Parent Role (side by side on md+) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

          {/* What Each Section Captures */}
          <div
            className="rounded-2xl p-5 space-y-5"
            style={{
              background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 100%)',
              border: '1px solid rgba(55,181,255,0.22)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(125,211,252,0.1)' }}>
                <Lightbulb className="w-4 h-4" style={{ color: '#7dd3fc' }} />
              </div>
              <p className="text-sm font-bold text-white">What Each Section Captures</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: <Timer className="w-4 h-4" />,
                  label: 'Pre-Game',
                  color: '#7dd3fc',
                  body: "Your Goalie's emotional state and pre-game routine — critical context for what follows on the ice.",
                },
                {
                  icon: <BarChart3 className="w-4 h-4" />,
                  label: 'Periods',
                  color: '#a78bfa',
                  body: "Per-period ratings on engagement, emotional control, positioning, and sync — through a parent's eyes.",
                },
                {
                  icon: <MessageSquare className="w-4 h-4" />,
                  label: 'Post-Game',
                  color: '#34d399',
                  body: "Car-ride mood, debrief style, and your top observation — the data that shapes the connection conversation.",
                },
              ].map(item => (
                <div key={item.label} className="flex gap-3.5 items-start">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}18`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: item.color }}>{item.label}</p>
                    <p className="text-xs text-white/45 mt-1 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The Parent Role */}
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 100%)',
              border: '1px solid rgba(55,181,255,0.22)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <Users className="w-4 h-4 text-white/50" />
              </div>
              <p className="text-sm font-bold text-white/70">The Parent Role</p>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              You're not judging — you're observing. Your perspective is one of four charts that cross-reference in real time. The Smarter Goalie Way™ puts the parent in the data loop, not on the sidelines of development.
            </p>
          </div>

        </div>{/* end two-card grid */}

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onStart}
            className="w-full h-13 rounded-2xl text-base font-black flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #37b5ff 0%, #7dd3fc 100%)',
              color: '#041830',
              boxShadow: '0 6px 20px rgba(55,181,255,0.4)',
              height: '52px',
            }}
          >
            Start Charting
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-center text-[10px] text-white/18 tracking-wider uppercase">
            The Smarter Goalie Way™ · Four charts, one mirror
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── Progress ring ────────────────────────────────────────────────────────────

function ProgressRing({ done }: { done: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const pct = done / 3;
  const dashOffset = c * (1 - pct);
  const isComplete = done === 3;
  return (
    <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
      <svg width="80" height="80" className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(55,181,255,0.1)" strokeWidth="5" />
        <circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={isComplete ? '#34d399' : '#37b5ff'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="relative z-10 text-center leading-none">
        <span className="text-2xl font-black" style={{ color: isComplete ? '#34d399' : '#fff' }}>{done}</span>
        <span className="text-xs text-white/35">/3</span>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ParentChartHubPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [entry, setEntry] = useState<ParentChartEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

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
  const completedCount = [preGameDone, periodsDone, postGameDone].filter(Boolean).length;

  type StepConfig = {
    key: string;
    label: string;
    sub: string;
    icon: React.ReactNode;
    done: boolean;
    unlocked: boolean;
    href: string;
    lockedHint: string;
    time: string;
  };

  const steps: StepConfig[] = [
    {
      key: 'pre-game',
      label: 'Pre-Game',
      sub: 'How your Goalie seemed before',
      icon: <Timer className="w-5 h-5" />,
      done: preGameDone,
      unlocked: true,
      href: `/charting/sessions/${sessionId}/parent-chart/pre-game`,
      lockedHint: '',
      time: '~2 min',
    },
    {
      key: 'periods',
      label: 'Periods',
      sub: 'P1 · P2 · P3 — what you noticed',
      icon: <BarChart3 className="w-5 h-5" />,
      done: periodsDone,
      unlocked: preGameDone,
      href: `/charting/sessions/${sessionId}/parent-chart/periods`,
      lockedHint: 'Complete Pre-Game first',
      time: '~5 min',
    },
    {
      key: 'post-game',
      label: 'Post-Game',
      sub: 'Reflection & car-ride check-in',
      icon: <MessageSquare className="w-5 h-5" />,
      done: postGameDone,
      unlocked: preGameDone && periodsDone,
      href: `/charting/sessions/${sessionId}/parent-chart/post-game`,
      lockedHint: 'Complete Periods first',
      time: '~3 min',
    },
  ];

  // First step that is unlocked but not yet done
  const nextIdx = steps.findIndex(s => s.unlocked && !s.done);

  const sessionDateObj = (() => {
    const raw = session.date as unknown;
    if (raw && typeof raw === 'object' && 'toDate' in raw && typeof (raw as { toDate?: unknown }).toDate === 'function') {
      return (raw as { toDate: () => Date }).toDate();
    }
    if (raw instanceof Date) return raw;
    return null;
  })();

  // Show intro page first — sidebar stays visible since it lives in the layout
  if (showIntro) {
    return <IntroOverlay onStart={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#041830' }}>

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-[0.035]"
          style={{ background: 'radial-gradient(circle, #37b5ff 0%, transparent 70%)', transform: 'translate(40%, -40%)' }}
        />
      </div>

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

      {/* ── Two-column layout ─────────────────────────────────────────────────── */}
      <div className="px-5 py-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 items-start">

          {/* ── LEFT column: progress + steps ─────────────────────────────── */}
          <div className="space-y-4">

            {/* Progress + session card */}
            <div
              className="rounded-2xl p-5 flex items-center gap-5"
              style={{
                background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 100%)',
                border: allDone ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(55,181,255,0.22)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <ProgressRing done={completedCount} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Eye className="w-3 h-3 opacity-50" style={{ color: '#7dd3fc' }} />
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(125,211,252,0.55)' }}>
                    Observer Mode
                  </span>
                </div>
                <p className="font-bold text-white text-base leading-tight">
                  {session.type === 'game' ? 'Game' : 'Practice'}
                  {session.opponent ? ` vs ${session.opponent}` : ''}
                </p>
                {sessionDateObj && (
                  <p className="text-xs text-white/40 mt-0.5">
                    {sessionDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                )}
                <p
                  className="text-xs mt-2.5 font-semibold"
                  style={{ color: allDone ? '#34d399' : 'rgba(255,255,255,0.38)' }}
                >
                  {allDone ? '✓ All sections complete' : `${completedCount} of 3 sections done`}
                </p>
              </div>
            </div>

            {/* Completion banner */}
            {allDone && (
              <div
                className="rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.15)' }}
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-300">Chart complete</p>
                  <p className="text-xs text-white/45 mt-0.5">Cross-referenced with your Goalie's self-evaluation.</p>
                </div>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isNext = idx === nextIdx;

                let stepCardStyle: React.CSSProperties;
                if (step.done) {
                  stepCardStyle = { border: '1px solid rgba(52,211,153,0.28)', background: 'rgba(52,211,153,0.05)', cursor: 'pointer' };
                } else if (step.unlocked) {
                  stepCardStyle = {
                    border: isNext ? '1px solid rgba(55,181,255,0.5)' : '1px solid rgba(255,255,255,0.09)',
                    background: isNext ? 'rgba(55,181,255,0.07)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    boxShadow: isNext ? '0 0 24px rgba(55,181,255,0.08)' : 'none',
                  };
                } else {
                  stepCardStyle = { border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', cursor: 'not-allowed', opacity: 0.38 };
                }

                let iconStyle: React.CSSProperties;
                if (step.done) {
                  iconStyle = { background: 'rgba(52,211,153,0.15)', color: '#34d399' };
                } else if (step.unlocked) {
                  iconStyle = isNext
                    ? { background: 'rgba(55,181,255,0.15)', color: '#37b5ff' }
                    : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' };
                } else {
                  iconStyle = { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)' };
                }

                return (
                  <div
                    key={step.key}
                    onClick={() => step.unlocked && router.push(step.href)}
                    className="rounded-2xl transition-all duration-200"
                    style={stepCardStyle}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={iconStyle}>
                        {step.done ? <CheckCircle className="w-5 h-5" /> : step.unlocked ? step.icon : <Lock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm" style={{ color: step.unlocked ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                            {step.label}
                          </p>
                          {isNext && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(55,181,255,0.18)', color: '#7dd3fc' }}>
                              NEXT
                            </span>
                          )}
                          {step.done && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                              DONE
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: step.unlocked ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.2)' }}>
                          {step.unlocked ? step.sub : step.lockedHint}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {step.unlocked && !step.done && <span className="text-[10px] text-white/22">{step.time}</span>}
                        {step.unlocked && (
                          <ChevronRight className="w-4 h-4" style={{ color: step.done ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.18)' }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-[10px] text-white/15 pt-2 pb-2 tracking-wider uppercase lg:hidden">
              The Smarter Goalie Way™ · Four charts, one mirror
            </p>
          </div>

          {/* ── RIGHT column: quick reference ─────────────────────────────── */}
          <div className="space-y-4">

            {/* Section breakdown */}
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{
                background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 100%)',
                border: '1px solid rgba(55,181,255,0.18)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <p className="text-xs font-bold text-white/55 uppercase tracking-wider">Section Breakdown</p>
              <div className="space-y-4">
                {[
                  { icon: <Timer className="w-4 h-4" />, label: 'Pre-Game', color: '#7dd3fc', time: '~2 min', body: "Emotional state & routine check before the puck drops." },
                  { icon: <BarChart3 className="w-4 h-4" />, label: 'Periods', color: '#a78bfa', time: '~5 min', body: "Rate engagement, control, sync & positioning per period." },
                  { icon: <MessageSquare className="w-4 h-4" />, label: 'Post-Game', color: '#34d399', time: '~3 min', body: "Car-ride mood, debrief style, and your one key observation." },
                ].map(item => (
                  <div key={item.label} className="flex gap-3.5 items-start">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}18`, color: item.color }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold" style={{ color: item.color }}>{item.label}</p>
                        <span className="text-[10px] text-white/25">{item.time}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Re-read intro button */}
            <button
              type="button"
              onClick={() => setShowIntro(true)}
              className="w-full rounded-xl py-3 text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center justify-center gap-2"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Eye className="w-3.5 h-3.5" />
              Re-read how the chart works
            </button>

            <p className="text-center text-[10px] text-white/12 pb-2 tracking-wider uppercase hidden lg:block">
              The Smarter Goalie Way™ · Four charts, one mirror
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
