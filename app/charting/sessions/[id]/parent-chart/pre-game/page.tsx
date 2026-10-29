'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { useRouter, useParams } from 'next/navigation';
import { chartingService, parentChartingService } from '@/lib/database';
import { Session, ParentPreGameData, ParentEmotionalState, ParentRoutineStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';
import { ContextualHelp } from '@/components/charting/inputs';
import { toast } from 'sonner';

// ─── Option sets ─────────────────────────────────────────────────────────────

const EMOTIONAL_STATE_OPTIONS: { value: ParentEmotionalState; label: string; emoji: string }[] = [
  { value: 'calm_focused',   label: 'Calm & focused',   emoji: '😊' },
  { value: 'a_bit_nervous',  label: 'A bit nervous',    emoji: '😬' },
  { value: 'distracted',     label: 'Distracted',       emoji: '😵' },
  { value: 'upset',          label: 'Upset',            emoji: '😤' },
  { value: 'not_sure',       label: 'Not sure',         emoji: '🤷' },
];

const ROUTINE_STATUS_OPTIONS: { value: ParentRoutineStatus; label: string; emoji: string }[] = [
  { value: 'yes',                label: 'Yes',                       emoji: '✅' },
  { value: 'mostly',             label: 'Mostly',                    emoji: '👍' },
  { value: 'dont_think_so',      label: "I don't think so",          emoji: '🤔' },
  { value: 'dont_know_routine',  label: "I don't know their routine", emoji: '💭' },
];

// ─── Radio group ─────────────────────────────────────────────────────────────

function RadioGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | null;
  onChange: (v: T) => void;
  options: { value: T; label: string; emoji: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map(opt => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3"
            style={
              selected
                ? {
                    background: 'rgba(55,181,255,0.13)',
                    border: '1.5px solid rgba(55,181,255,0.55)',
                    color: '#7dd3fc',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: 'rgba(255,255,255,0.6)',
                  }
            }
          >
            <span className="text-base w-6 text-center flex-shrink-0">{opt.emoji}</span>
            <span className="flex-1">{opt.label}</span>
            {selected && (
              <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#37b5ff' }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
        style={{ background: 'rgba(55,181,255,0.18)', color: '#7dd3fc' }}
      >
        {num}
      </span>
      <span className="text-xs font-bold text-white/55 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ParentPreGamePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null);
  const [existingCompleted, setExistingCompleted] = useState<('preGame' | 'periods' | 'postGame')[]>([]);

  const [formData, setFormData] = useState<Partial<ParentPreGameData>>({
    emotionalState: undefined,
    followedRoutine: undefined,
    offIceNote: '',
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
          if (entry.preGame) {
            setFormData({
              emotionalState: entry.preGame.emotionalState,
              followedRoutine: entry.preGame.followedRoutine,
              offIceNote: entry.preGame.offIceNote ?? '',
            });
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

  const handleSave = async () => {
    if (!user || !session) return;
    if (!formData.emotionalState || !formData.followedRoutine) {
      toast.error('Please answer both questions before saving');
      return;
    }
    setSaving(true);
    try {
      const preGame: ParentPreGameData = {
        emotionalState: formData.emotionalState,
        followedRoutine: formData.followedRoutine,
        offIceNote: formData.offIceNote || undefined,
      };
      const newCompleted = Array.from(new Set([...existingCompleted, 'preGame' as const]));

      if (existingEntryId) {
        await parentChartingService.updateSection(existingEntryId, {
          preGame,
          completedSections: newCompleted,
        });
      } else {
        const result = await parentChartingService.createChart({
          sessionId: session.id,
          studentId: session.studentId,
          parentId: user.id,
          parentName: user.displayName ?? undefined,
          preGame,
          completedSections: newCompleted,
        });
        if (result.success && result.data) setExistingEntryId(result.data.id);
        setExistingCompleted(newCompleted);
      }

      toast.success('Pre-Game saved!');
      router.push(`/charting/sessions/${sessionId}/parent-chart/periods`);
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

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 30%, #0a2d52 100%)',
    border: '1px solid rgba(55,181,255,0.22)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
  };

  const bothAnswered = !!formData.emotionalState && !!formData.followedRoutine;

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
            Pre-Game
          </h1>
          <div className="w-16" />
        </div>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────────── */}
      <div className="px-5 py-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Left column — form */}
          <div className="space-y-6">

            {/* Page heading */}
            <div>
              <h2 className="text-2xl font-black text-white">Parent Check-In</h2>
              <p className="text-sm text-white/40 mt-1">Before the game — what you're observing, not judging.</p>
            </div>

            {/* 1. Emotional state */}
            <div>
              <SectionLabel num="1" label="Mental State" />
              <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
                <ContextualHelp
                  label="How does your Goalie seem emotionally before the game?"
                  helpText="You're not judging — you're observing. Your Goalie's mental state before the game directly impacts performance. This helps Smarter Goalie see patterns over time."
                >
                  <RadioGroup<ParentEmotionalState>
                    value={formData.emotionalState ?? null}
                    onChange={v => setFormData(p => ({ ...p, emotionalState: v }))}
                    options={EMOTIONAL_STATE_OPTIONS}
                  />
                </ContextualHelp>
              </div>
            </div>

            {/* 2. Pre-game routine */}
            <div>
              <SectionLabel num="2" label="Routine Check" />
              <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
                <ContextualHelp
                  label="Did they follow their pre-game routine?"
                  helpText="A consistent pre-game routine anchors mental preparation. Even if you don't know every detail, your sense of whether things felt 'normal' or 'off' is valuable data."
                >
                  <RadioGroup<ParentRoutineStatus>
                    value={formData.followedRoutine ?? null}
                    onChange={v => setFormData(p => ({ ...p, followedRoutine: v }))}
                    options={ROUTINE_STATUS_OPTIONS}
                  />
                </ContextualHelp>
              </div>
            </div>

            {/* 3. Off-ice note (optional) */}
            <div>
              <SectionLabel num="3" label="Context Note (optional)" />
              <div className="rounded-2xl p-5 space-y-3" style={cardStyle}>
                <ContextualHelp
                  label="Anything off-ice that might affect them today?"
                  helpText="School stress, sleep, something that happened at home — context the coaching team wouldn't otherwise know. Optional, and it stays private to Smarter Goalie."
                >
                  <textarea
                    value={formData.offIceNote ?? ''}
                    onChange={e => setFormData(p => ({ ...p, offIceNote: e.target.value }))}
                    placeholder="Optional — anything worth noting..."
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-[rgba(55,181,255,0.4)] transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                  />
                </ContextualHelp>
              </div>
            </div>

            {/* Save button */}
            <div className="pb-6 pt-1 space-y-3">
              <Button
                onClick={handleSave}
                disabled={saving || !bothAnswered}
                className="w-full h-12 rounded-xl text-sm font-bold border-0 disabled:opacity-40 transition-all"
                style={{
                  background: bothAnswered ? '#7dd3fc' : 'rgba(125,211,252,0.4)',
                  color: '#041830',
                  boxShadow: bothAnswered ? '0 4px 14px rgba(55,181,255,0.35)' : 'none',
                }}
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                  : <><Save className="w-4 h-4 mr-2" />Save Pre-Game</>
                }
              </Button>
              {!bothAnswered && (
                <p className="text-center text-xs text-white/25">Answer questions 1 and 2 to save</p>
              )}
            </div>

          </div>{/* end left column */}

          {/* Right column — sticky sidebar */}
          <div className="space-y-4 lg:sticky lg:top-24">

            {/* Observer Tips */}
            <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Observer Tips</p>
              <div className="space-y-4">
                {[
                  { label: 'Mental State', tip: "Watch for tension, quiet withdrawal, or unusual energy. Your gut read is often accurate — trust it." },
                  { label: 'Routine Check', tip: "A partial routine still counts. 'Mostly' is honest, useful data — don't overthink it." },
                  { label: 'Off-Ice Context', tip: "School stress, poor sleep, or a tough week at home are invisible to the coach. Your note fills that gap." },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs font-bold text-white/75">{item.label}</p>
                    <p className="text-xs text-white/38 mt-1 leading-relaxed">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-reference note */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(55,181,255,0.04)', border: '1px solid rgba(55,181,255,0.12)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(125,211,252,0.55)' }}>Cross-Referenced With</p>
              <p className="text-xs text-white/35 leading-relaxed">
                Your Goalie's own pre-game self-eval. Alignment confirms the signal — divergence reveals something worth exploring.
              </p>
            </div>

          </div>{/* end right column */}

        </div>{/* end grid */}
      </div>
    </div>
  );
}
