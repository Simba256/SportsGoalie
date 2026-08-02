'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { useRouter, useParams } from 'next/navigation';
import { chartingService, parentChartingService } from '@/lib/database';
import { Session, ParentPeriodRatings, ParentNoticedObservation } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Star, HelpCircle, X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// ─── Factor definitions ───────────────────────────────────────────────────────

interface FactorConfig {
  key: keyof Pick<ParentPeriodRatings,
    'engagedRating' | 'emotionalControlRating' | 'skatingInSyncRating' | 'positioningRating' | 'overallImpressionRating'
  >;
  label: string;
  helpText: string;
}

const FACTORS: FactorConfig[] = [
  {
    key: 'engagedRating',
    label: 'Engaged',
    helpText: 'Locked in and present, or drifting? Engaged Goalies compete through three channels — Visual (eyes tracking, reading the play), Mental (focus, composure), Physical (movement, positioning). As you watch more, you\'ll start to see all three.',
  },
  {
    key: 'emotionalControlRating',
    label: 'Emotional Control',
    helpText: 'After a goal against or a bad bounce — composed, or frustration / head drops / body-language changes?',
  },
  {
    key: 'skatingInSyncRating',
    label: 'Skating in Sync',
    helpText: 'Did their skating look in sync with the flow of the game and the puck — or scrambling, delayed, looking but not reacting?',
  },
  {
    key: 'positioningRating',
    label: 'Positioning',
    helpText: 'Were they in the right spot when shots came — set and ready, or caught out of position?',
  },
  {
    key: 'overallImpressionRating',
    label: 'Overall Impression',
    helpText: 'Big picture — how did this period feel watching as a parent?',
  },
];

const LOW_STAR_OPTIONS: { value: ParentNoticedObservation; label: string }[] = [
  { value: 'looked_frustrated',      label: 'Looked frustrated' },
  { value: 'seemed_tired',           label: 'Seemed tired' },
  { value: 'out_of_position',        label: 'Out of position a lot' },
  { value: 'scored_on_and_shut_down', label: 'Got scored on and shut down' },
  { value: 'not_confident',          label: "Didn't look confident" },
  { value: 'other',                  label: 'Other' },
];

type PeriodKey = 'period1' | 'period2' | 'period3';
const PERIOD_TABS: { key: PeriodKey; label: string; short: string }[] = [
  { key: 'period1', label: 'Period 1', short: 'P1' },
  { key: 'period2', label: 'Period 2', short: 'P2' },
  { key: 'period3', label: 'Period 3', short: 'P3' },
];

function emptyPeriod(): ParentPeriodRatings {
  return {
    engagedRating: 0,
    emotionalControlRating: 0,
    skatingInSyncRating: 0,
    positioningRating: 0,
    overallImpressionRating: 0,
    lowStarObservations: [],
    lowStarNote: '',
  };
}

// ─── ℹ Inline help popover ───────────────────────────────────────────────────

function FactorHelp({ helpText }: { helpText: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-5 h-5 flex items-center justify-center rounded-full text-white/30 hover:text-[#37b5ff] hover:bg-[rgba(55,181,255,0.1)] transition-colors"
        aria-label="What does this mean?"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-6 z-20 w-72 rounded-xl p-3 text-sm text-white/80 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150"
          style={{ background: 'rgba(2,18,44,0.97)', border: '1px solid rgba(55,181,255,0.25)' }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-white/35 hover:text-white/70"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="pr-5">{helpText}</p>
        </div>
      )}
    </span>
  );
}

// ─── 5-star rating row ────────────────────────────────────────────────────────

function StarRow({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= display;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            className="w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:scale-110 active:scale-95"
            style={{ color: filled ? '#37b5ff' : 'rgba(255,255,255,0.18)' }}
            aria-label={`${n} star`}
          >
            <Star className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>
        );
      })}
      {value > 0 && (
        <span
          className="ml-1 text-xs font-black px-1.5 py-0.5 rounded-md"
          style={{ background: 'rgba(55,181,255,0.12)', color: '#7dd3fc' }}
        >
          {value}/5
        </span>
      )}
    </div>
  );
}

// ─── Period average helper ────────────────────────────────────────────────────

function periodAvg(p: ParentPeriodRatings): number | null {
  const vals = [
    p.engagedRating, p.emotionalControlRating,
    p.skatingInSyncRating, p.positioningRating, p.overallImpressionRating,
  ].filter(v => v > 0);
  if (vals.length === 0) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

function isPeriodComplete(p: ParentPeriodRatings) {
  return p.engagedRating > 0 && p.emotionalControlRating > 0 &&
    p.skatingInSyncRating > 0 && p.positioningRating > 0 && p.overallImpressionRating > 0;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ParentPeriodsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null);
  const [existingCompleted, setExistingCompleted] = useState<('preGame' | 'periods' | 'postGame')[]>([]);

  const [activePeriod, setActivePeriod] = useState<PeriodKey>('period1');
  const [periods, setPeriods] = useState<Record<PeriodKey, ParentPeriodRatings>>({
    period1: emptyPeriod(),
    period2: emptyPeriod(),
    period3: emptyPeriod(),
  });

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
        if (chartResult.success && chartResult.data) {
          const entry = chartResult.data;
          setExistingEntryId(entry.id);
          setExistingCompleted(entry.completedSections ?? []);
          if (entry.periods) {
            setPeriods(prev => ({
              period1: entry.periods?.period1 ?? prev.period1,
              period2: entry.periods?.period2 ?? prev.period2,
              period3: entry.periods?.period3 ?? prev.period3,
            }));
          }
        }
      } catch {
        toast.error('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, sessionId]);

  const updatePeriod = <K extends keyof ParentPeriodRatings>(
    period: PeriodKey,
    key: K,
    value: ParentPeriodRatings[K]
  ) => {
    setPeriods(prev => ({
      ...prev,
      [period]: { ...prev[period], [key]: value },
    }));
  };

  const toggleObservation = (period: PeriodKey, obs: ParentNoticedObservation) => {
    setPeriods(prev => {
      const current = prev[period].lowStarObservations ?? [];
      const next = current.includes(obs)
        ? current.filter(o => o !== obs)
        : [...current, obs];
      return { ...prev, [period]: { ...prev[period], lowStarObservations: next } };
    });
  };

  // A period has any low-star rating if any of the 5 factors is 1 or 2
  const hasLowStar = (p: ParentPeriodRatings) => {
    const fields: (keyof ParentPeriodRatings)[] = [
      'engagedRating', 'emotionalControlRating', 'skatingInSyncRating',
      'positioningRating', 'overallImpressionRating',
    ];
    return fields.some(f => {
      const v = p[f];
      return typeof v === 'number' && v > 0 && v <= 2;
    });
  };

  const handleSave = async () => {
    if (!user || !session) return;

    // Validate at least one period has all 5 ratings
    const atLeastOnePeriodComplete = (['period1', 'period2', 'period3'] as PeriodKey[]).some(
      pk => isPeriodComplete(periods[pk])
    );

    if (!atLeastOnePeriodComplete) {
      toast.error('Rate all 5 factors for at least one period before saving');
      return;
    }

    setSaving(true);
    try {
      const newCompleted = Array.from(new Set([...existingCompleted, 'periods' as const]));

      if (existingEntryId) {
        await parentChartingService.updateSection(existingEntryId, {
          periods,
          completedSections: newCompleted,
        });
      } else {
        const result = await parentChartingService.createChart({
          sessionId: session.id,
          studentId: session.studentId,
          parentId: user.id,
          parentName: user.displayName ?? undefined,
          periods,
          completedSections: newCompleted,
        });
        if (result.success && result.data) setExistingEntryId(result.data.id);
        setExistingCompleted(newCompleted);
      }

      toast.success('Periods saved!');
      router.push(`/charting/sessions/${sessionId}/parent-chart/post-game`);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

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
        <p className="text-white/60">Session not found</p>
      </div>
    );
  }

  const current = periods[activePeriod];
  const lowStar = hasLowStar(current);
  const activeIdx = PERIOD_TABS.findIndex(t => t.key === activePeriod);

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 30%, #0a2d52 100%)',
    border: '1px solid rgba(55,181,255,0.22)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
  };

  return (
    <div className="min-h-screen" style={{ background: '#041830' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ background: 'rgba(6,30,58,0.97)', borderColor: 'rgba(55,181,255,0.18)' }}>
        <div className="flex items-center justify-between px-6 h-16">
          <button
            type="button"
            onClick={() => router.push(`/charting/sessions/${sessionId}/parent-chart`)}
            className="flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-[#7dd3fc] to-white bg-clip-text text-transparent">
            Periods
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-5 py-5 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* Left column — form */}
          <div className="space-y-5">

            {/* Page heading */}
            <div>
              <h2 className="text-2xl font-black text-white">What You Noticed</h2>
              <p className="text-sm text-white/40 mt-1">5 stars per factor, per period. Rate what you observed.</p>
            </div>

        {/* ── Period tabs ───────────────────────────────────────────────────── */}
        <div className="flex gap-2">
          {PERIOD_TABS.map(tab => {
            const p = periods[tab.key];
            const isDone = isPeriodComplete(p);
            const avg = periodAvg(p);
            const isActive = activePeriod === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActivePeriod(tab.key)}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all relative flex flex-col items-center gap-0.5"
                style={
                  isActive
                    ? { background: '#37b5ff', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.09)' }
                }
              >
                <span>{tab.label}</span>
                {isDone && avg !== null && (
                  <span
                    className="text-[9px] font-bold flex items-center gap-0.5"
                    style={{ color: isActive ? 'rgba(255,255,255,0.75)' : '#37b5ff', opacity: isActive ? 0.85 : 1 }}
                  >
                    <Star className="w-2.5 h-2.5" fill="currentColor" /> {avg}
                  </span>
                )}
                {isDone && avg === null && (
                  <CheckCircle
                    className="w-3 h-3"
                    style={{ color: isActive ? 'rgba(255,255,255,0.75)' : '#34d399' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Factor cards ──────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {FACTORS.map((factor, fi) => {
            const rating = current[factor.key] as number;
            const isLow = rating > 0 && rating <= 2;
            const isRated = rating > 0;
            return (
              <div key={factor.key} className="rounded-2xl overflow-hidden" style={cardStyle}>
                <div className="px-5 pt-4 pb-1">
                  {/* Factor header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                      style={{ background: 'rgba(55,181,255,0.15)', color: '#7dd3fc' }}
                    >
                      {fi + 1}
                    </span>
                    <span className="text-sm font-bold text-white">{factor.label}</span>
                    <FactorHelp helpText={factor.helpText} />
                    {isLow && (
                      <span
                        className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
                      >
                        LOW
                      </span>
                    )}
                    {isRated && !isLow && (
                      <span
                        className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
                      >
                        RATED
                      </span>
                    )}
                  </div>

                  {/* Stars */}
                  <div className="pb-4">
                    <StarRow
                      value={rating}
                      onChange={v => updatePeriod(activePeriod, factor.key, v)}
                    />
                  </div>
                </div>

                {/* Low-star note */}
                {isLow && (
                  <div
                    className="px-5 py-2 border-t"
                    style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.15)' }}
                  >
                    <p className="text-[10px] text-yellow-400/70 italic">
                      Low rating — share what you noticed below ↓
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Low-star trigger ─────────────────────────────────────────────── */}
        {lowStar && (
          <div
            className="rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
            style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.2)' }}
          >
            <div>
              <p className="text-sm font-bold text-yellow-300">What did you notice?</p>
              <p className="text-xs text-white/40 mt-0.5">Select everything that applies for this period.</p>
            </div>
            <div className="flex flex-col gap-2">
              {LOW_STAR_OPTIONS.map(opt => {
                const selected = (current.lowStarObservations ?? []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleObservation(activePeriod, opt.value)}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3"
                    style={
                      selected
                        ? { background: 'rgba(251,191,36,0.14)', border: '1.5px solid rgba(251,191,36,0.45)', color: '#fbbf24' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
                    }
                  >
                    <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[10px]"
                      style={{ background: selected ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)' }}>
                      {selected ? '✓' : ''}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <textarea
              value={current.lowStarNote ?? ''}
              onChange={e => updatePeriod(activePeriod, 'lowStarNote', e.target.value)}
              placeholder="Optional — any additional notes..."
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-[rgba(251,191,36,0.35)] transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.18)' }}
            />
            <p className="text-[10px] text-white/28 italic">
              Recorded. Cross-referenced with your Goalie's self-evaluation.
            </p>
          </div>
        )}

        {/* ── Period navigation ─────────────────────────────────────────────── */}
        <div className="flex gap-2">
          {activeIdx > 0 && (
            <button
              type="button"
              onClick={() => setActivePeriod(PERIOD_TABS[activeIdx - 1].key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
            >
              <ChevronLeft className="w-4 h-4" />
              {PERIOD_TABS[activeIdx - 1].label}
            </button>
          )}
          {activeIdx < PERIOD_TABS.length - 1 && (
            <button
              type="button"
              onClick={() => setActivePeriod(PERIOD_TABS[activeIdx + 1].key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
            >
              {PERIOD_TABS[activeIdx + 1].label}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

            {/* ── Save button ─────────────────────────────────────────────── */}
            <div className="pb-6">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 rounded-xl text-sm font-bold border-0"
                style={{ background: '#7dd3fc', color: '#041830', boxShadow: '0 4px 14px rgba(55,181,255,0.35)' }}
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                  : <><Save className="w-4 h-4 mr-2" />Save Periods</>
                }
              </Button>
            </div>

          </div>{/* end left column */}

          {/* Right column — sticky sidebar */}
          <div className="space-y-4 lg:sticky lg:top-24">

            {/* Rating Guide */}
            <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Rating Guide</p>
              <div className="space-y-3">
                {[
                  { range: '1–2 stars', desc: 'Noticeably off or struggling' },
                  { range: '3 stars', desc: 'Average — nothing stood out' },
                  { range: '4–5 stars', desc: 'Strong to excellent showing' },
                ].map(r => (
                  <div key={r.range} className="flex items-start gap-3">
                    <span className="text-[11px] font-bold flex-shrink-0 w-16" style={{ color: '#37b5ff' }}>{r.range}</span>
                    <p className="text-xs text-white/40 leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Period Summary */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Period Summary</p>
              <div className="space-y-1.5">
                {PERIOD_TABS.map(tab => {
                  const avg = periodAvg(periods[tab.key]);
                  const done = isPeriodComplete(periods[tab.key]);
                  const isActive = activePeriod === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActivePeriod(tab.key)}
                      className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all"
                      style={isActive
                        ? { background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(55,181,255,0.25)' }
                        : { background: 'transparent', border: '1px solid transparent' }
                      }
                    >
                      <span className="text-xs font-medium" style={{ color: isActive ? '#7dd3fc' : 'rgba(255,255,255,0.45)' }}>{tab.label}</span>
                      <span className="text-xs font-bold" style={{ color: done ? '#37b5ff' : 'rgba(255,255,255,0.2)' }}>
                        {done && avg !== null ? `${avg}/5` : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-white/25 leading-relaxed pt-1">
                Rate all 5 factors to complete a period.
              </p>
            </div>

            {/* Observer note */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(55,181,255,0.04)', border: '1px solid rgba(55,181,255,0.12)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(125,211,252,0.55)' }}>Cross-Referenced With</p>
              <p className="text-xs text-white/35 leading-relaxed">
                Your Goalie's own per-period self-evaluation. Divergence between your ratings and theirs is the most valuable data.
              </p>
            </div>

          </div>{/* end right column */}

        </div>{/* end grid */}
      </div>
    </div>
  );
}
