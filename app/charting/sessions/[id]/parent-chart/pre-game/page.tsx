'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { useRouter, useParams } from 'next/navigation';
import { chartingService, parentChartingService } from '@/lib/database';
import { Session, ParentPreGameData, ParentEmotionalState, ParentRoutineStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { ContextualHelp } from '@/components/charting/inputs';
import { toast } from 'sonner';

// ─── Option sets ─────────────────────────────────────────────────────────────

const EMOTIONAL_STATE_OPTIONS: { value: ParentEmotionalState; label: string }[] = [
  { value: 'calm_focused',   label: 'Calm & focused' },
  { value: 'a_bit_nervous',  label: 'A bit nervous' },
  { value: 'distracted',     label: 'Distracted' },
  { value: 'upset',          label: 'Upset' },
  { value: 'not_sure',       label: 'Not sure' },
];

const ROUTINE_STATUS_OPTIONS: { value: ParentRoutineStatus; label: string }[] = [
  { value: 'yes',                label: 'Yes' },
  { value: 'mostly',             label: 'Mostly' },
  { value: 'dont_think_so',      label: "I don't think so" },
  { value: 'dont_know_routine',  label: "I don't know their routine" },
];

// ─── Radio group component ────────────────────────────────────────────────────

function RadioGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | null;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
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
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
            style={
              selected
                ? { background: 'rgba(55,181,255,0.13)', border: '1.5px solid rgba(55,181,255,0.55)', color: '#7dd3fc' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }
            }
          >
            <span className="mr-2">{selected ? '●' : '○'}</span>
            {opt.label}
          </button>
        );
      })}
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
      router.push(`/charting/sessions/${sessionId}/parent-chart`);
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

  const cardStyle = {
    background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 30%, #0a2d52 100%)',
    border: '1px solid rgba(55,181,255,0.28)',
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
            Pre-Game
          </h1>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-white rounded-lg px-4 h-9 text-sm font-semibold border-0"
            style={{ background: '#7dd3fc' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1.5" />Save</>}
          </Button>
        </div>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────────── */}
      <div className="px-5 py-6 space-y-5 max-w-lg mx-auto">

        <div>
          <h2 className="text-2xl font-black text-white">Parent Check-In</h2>
          <p className="text-sm text-white/45 mt-1">Before the game — what you're observing, not judging.</p>
        </div>

        {/* 1. Emotional state */}
        <div className="rounded-xl p-4 space-y-3" style={cardStyle}>
          <ContextualHelp
            label="How does your Goalie seem emotionally before the game?"
            helpText="You're not judging — you're observing. Your Goalie's mental state before the game directly impacts performance. This helps the platform see patterns over time."
          >
            <RadioGroup<ParentEmotionalState>
              value={formData.emotionalState ?? null}
              onChange={v => setFormData(p => ({ ...p, emotionalState: v }))}
              options={EMOTIONAL_STATE_OPTIONS}
            />
          </ContextualHelp>
        </div>

        {/* 2. Pre-game routine */}
        <div className="rounded-xl p-4 space-y-3" style={cardStyle}>
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

        {/* 3. Off-ice note (optional) */}
        <div className="rounded-xl p-4 space-y-3" style={cardStyle}>
          <ContextualHelp
            label="Anything off-ice that might affect them today?"
            helpText="School stress, sleep, something that happened at home — context the coaching team wouldn't otherwise know. Optional, and it stays private to the platform."
          >
            <textarea
              value={formData.offIceNote ?? ''}
              onChange={e => setFormData(p => ({ ...p, offIceNote: e.target.value }))}
              placeholder="Optional — anything worth noting..."
              rows={3}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-[rgba(55,181,255,0.5)]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </ContextualHelp>
        </div>

        {/* Save button */}
        <div className="pb-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 text-white rounded-xl text-sm font-bold border-0"
            style={{ background: '#7dd3fc', boxShadow: '0 4px 14px rgba(55,181,255,0.35)' }}
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
              : <><Save className="w-4 h-4 mr-2" />Save Pre-Game</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
