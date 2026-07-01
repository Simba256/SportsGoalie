'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { useRouter, useParams } from 'next/navigation';
import { chartingService, parentChartingService } from '@/lib/database';
import { Session, ParentPostGameData, ParentCarRideMood, ParentTalkAboutGame } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { ContextualHelp } from '@/components/charting/inputs';
import { toast } from 'sonner';

// ─── Option sets ─────────────────────────────────────────────────────────────

const CAR_RIDE_OPTIONS: { value: ParentCarRideMood; label: string; emoji: string }[] = [
  { value: 'happy',               label: 'Happy',                    emoji: '😊' },
  { value: 'neutral',             label: 'Neutral',                  emoji: '😐' },
  { value: 'frustrated',          label: 'Frustrated',               emoji: '😤' },
  { value: 'didnt_want_to_talk',  label: "Didn't want to talk",      emoji: '🤐' },
  { value: 'great_conversation',  label: 'Great conversation',        emoji: '💬' },
];

const TALK_OPTIONS: { value: ParentTalkAboutGame; label: string; emoji: string }[] = [
  { value: 'yes_positive',  label: 'Yes — positive',     emoji: '✅' },
  { value: 'yes_tense',     label: 'Yes — it got tense', emoji: '⚠️' },
  { value: 'briefly',       label: 'Briefly',             emoji: '💬' },
  { value: 'no_gave_space', label: 'No — gave space',    emoji: '🤝' },
];

// ─── Conversation guide ───────────────────────────────────────────────────────

function conversationGuide(mood: ParentCarRideMood | undefined, talked: ParentTalkAboutGame | undefined): string[] {
  if (!mood || !talked) return [];

  if (mood === 'great_conversation') {
    return [
      "You had a great conversation — that connection is the foundation.",
      "Ask them: 'What was the moment you felt most in control today?'",
      "Celebrate something specific you observed that only a parent would catch.",
    ];
  }
  if (mood === 'didnt_want_to_talk' || talked === 'no_gave_space') {
    return [
      "Giving space was the right call — let them decompress.",
      "Try later: 'I noticed you working hard today. That part stood out.'",
      "Connection first, conversation second. Timing matters more than content.",
    ];
  }
  if (mood === 'frustrated' || talked === 'yes_tense') {
    return [
      "The car ride home is not the time for coaching — it's the time for connection.",
      "If things got tense, a simple reset: 'I love watching you play.'",
      "Tomorrow, when the dust settles: 'What felt different about today?'",
    ];
  }
  if (talked === 'briefly') {
    return [
      "One positive observation keeps the dialogue open.",
      "Ask: 'What's one thing you want to try differently next game?'",
      "Let them lead — your role today is listener.",
    ];
  }
  return [
    "Every game is data, not a verdict.",
    "Ask: 'What did you learn today?' — not 'How did you do?'",
    "Your presence in the stands means more than your analysis afterward.",
  ];
}

// ─── Emoji radio group ────────────────────────────────────────────────────────

function EmojiRadioGroup<T extends string>({
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
                ? { background: 'rgba(55,181,255,0.13)', border: '1.5px solid rgba(55,181,255,0.55)', color: '#7dd3fc' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.65)' }
            }
          >
            <span className="text-lg w-7 text-center flex-shrink-0">{opt.emoji}</span>
            <span className="flex-1">{opt.label}</span>
            {selected && <CheckCircle className="ml-auto w-4 h-4 flex-shrink-0" style={{ color: '#37b5ff' }} />}
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

export default function ParentPostGamePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null);
  const [existingCompleted, setExistingCompleted] = useState<('preGame' | 'periods' | 'postGame')[]>([]);

  const [formData, setFormData] = useState<Partial<ParentPostGameData>>({
    oneWordForGame: '',
    onePositiveThing: '',
    oneConcern: '',
    carRideMood: undefined,
    talkedAboutGame: undefined,
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
          if (entry.postGame) {
            setFormData({ ...entry.postGame });
          }
          if (entry.completedSections?.includes('postGame')) setSaved(true);
        }
      } catch {
        toast.error('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, sessionId]);

  const update = <K extends keyof ParentPostGameData>(key: K, value: ParentPostGameData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user || !session) return;

    const missing: string[] = [];
    if (!formData.oneWordForGame?.trim()) missing.push('one word for the game');
    if (!formData.onePositiveThing?.trim()) missing.push('one positive thing');
    if (!formData.oneConcern?.trim()) missing.push('one concern');
    if (!formData.carRideMood) missing.push('car-ride mood');
    if (!formData.talkedAboutGame) missing.push('whether you talked about the game');

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing[0]}`);
      return;
    }

    setSaving(true);
    try {
      const postGame: ParentPostGameData = {
        oneWordForGame: formData.oneWordForGame!.trim(),
        onePositiveThing: formData.onePositiveThing!.trim(),
        oneConcern: formData.oneConcern!.trim(),
        carRideMood: formData.carRideMood!,
        talkedAboutGame: formData.talkedAboutGame!,
      };

      const newCompleted = Array.from(new Set([...existingCompleted, 'postGame' as const]));

      if (existingEntryId) {
        await parentChartingService.updateSection(existingEntryId, {
          postGame,
          completedSections: newCompleted,
        });
      } else {
        const result = await parentChartingService.createChart({
          sessionId: session.id,
          studentId: session.studentId,
          parentId: user.id,
          parentName: user.displayName ?? undefined,
          postGame,
          completedSections: newCompleted,
        });
        if (result.success && result.data) setExistingEntryId(result.data.id);
        setExistingCompleted(newCompleted);
      }

      setSaved(true);
      toast.success('Post-Game saved!');
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

  const guide = conversationGuide(formData.carRideMood, formData.talkedAboutGame);

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 30%, #0a2d52 100%)',
    border: '1px solid rgba(55,181,255,0.22)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
  };

  const wordCount = (formData.oneWordForGame ?? '').trim().length;

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
            Post-Game
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-5 py-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Left column — form */}
          <div className="space-y-6">

            {/* Page heading */}
            <div>
              <h2 className="text-2xl font-black text-white">Parent Reflection</h2>
              <p className="text-sm text-white/40 mt-1">The goal is connection, not coaching.</p>
            </div>

        {/* 1. One word — prominent display */}
        <div>
          <SectionLabel num="1" label="Your Read on the Game" />
          <div className="rounded-2xl p-5 space-y-3" style={cardStyle}>
            <ContextualHelp
              label="One word for your Goalie's game"
              helpText="A single word that captures your overall sense of how the game went. There's no wrong answer — this is your honest observation."
            >
              <div className="relative">
                <input
                  type="text"
                  value={formData.oneWordForGame ?? ''}
                  onChange={e => update('oneWordForGame', e.target.value)}
                  placeholder="e.g. Determined, Shaky, Locked-in..."
                  maxLength={30}
                  className="w-full rounded-xl px-4 py-3.5 text-lg font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[rgba(55,181,255,0.45)] transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', letterSpacing: '0.02em' }}
                />
                {wordCount > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-medium">
                    {30 - wordCount}
                  </span>
                )}
              </div>
              {formData.oneWordForGame?.trim() && (
                <p
                  className="text-2xl font-black text-center py-2 animate-in fade-in duration-300"
                  style={{ color: '#7dd3fc', opacity: 0.7, letterSpacing: '0.05em' }}
                >
                  "{formData.oneWordForGame.trim()}"
                </p>
              )}
            </ContextualHelp>
          </div>
        </div>

        {/* 2. One positive */}
        <div>
          <SectionLabel num="2" label="Highlight" />
          <div className="rounded-2xl p-5 space-y-3" style={cardStyle}>
            <ContextualHelp
              label="ONE positive thing you saw"
              helpText="Specific observations land better than general praise. What moment stood out where your Goalie showed something real?"
            >
              <textarea
                value={formData.onePositiveThing ?? ''}
                onChange={e => update('onePositiveThing', e.target.value)}
                placeholder="What did you see that impressed you..."
                rows={2}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-[rgba(55,181,255,0.4)] transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
              />
            </ContextualHelp>
          </div>
        </div>

        {/* 3. One concern */}
        <div>
          <SectionLabel num="3" label="Concern" />
          <div className="rounded-2xl p-5 space-y-3" style={cardStyle}>
            <ContextualHelp
              label="ONE thing that concerned you"
              helpText="Honest concerns are valuable data — not criticism. Smarter Goalie's intuitive system cross-references this with your Goalie's self-evaluation to find patterns."
            >
              <textarea
                value={formData.oneConcern ?? ''}
                onChange={e => update('oneConcern', e.target.value)}
                placeholder="What worried or confused you as you watched..."
                rows={2}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-[rgba(55,181,255,0.4)] transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
              />
            </ContextualHelp>
          </div>
        </div>

        {/* 4. Car-ride mood */}
        <div>
          <SectionLabel num="4" label="Car Ride Home" />
          <div className="rounded-2xl p-5 space-y-3" style={cardStyle}>
            <ContextualHelp
              label="Car-ride-home mood?"
              helpText="The mood in the car after a game tells Smarter Goalie a lot about how your Goalie processes performance. No judgment — just data."
            >
              <EmojiRadioGroup<ParentCarRideMood>
                value={formData.carRideMood ?? null}
                onChange={v => update('carRideMood', v)}
                options={CAR_RIDE_OPTIONS}
              />
            </ContextualHelp>
          </div>
        </div>

        {/* 5. Did you talk */}
        <div>
          <SectionLabel num="5" label="Debrief Style" />
          <div className="rounded-2xl p-5 space-y-3" style={cardStyle}>
            <ContextualHelp
              label="Did you talk about the game?"
              helpText="How you debrief after a game shapes your Goalie's relationship with performance. Smarter Goalie's intuitive system guides post-game conversations based on your answers."
            >
              <EmojiRadioGroup<ParentTalkAboutGame>
                value={formData.talkedAboutGame ?? null}
                onChange={v => update('talkedAboutGame', v)}
                options={TALK_OPTIONS}
              />
            </ContextualHelp>
          </div>
        </div>

        {/* ── Conversation guide ────────────────────────────────────────────── */}
        {guide.length > 0 && (
          <div
            className="rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400"
            style={{ background: 'rgba(55,181,255,0.05)', border: '1px solid rgba(55,181,255,0.18)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(55,181,255,0.15)' }}
              >
                <MessageCircle className="w-4 h-4" style={{ color: '#7dd3fc' }} />
              </div>
              <p className="text-xs font-bold text-[#7dd3fc] uppercase tracking-widest">
                Conversation Guide
              </p>
            </div>
            <div className="space-y-3 pl-2">
              {guide.map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span
                    className="w-1 rounded-full flex-shrink-0 mt-1"
                    style={{ background: i === 0 ? '#7dd3fc' : 'rgba(55,181,255,0.25)', minHeight: '14px' }}
                  />
                  <p className="text-sm leading-relaxed" style={{ color: i === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)' }}>
                    {i === 0 ? <span className="font-semibold">{line}</span> : line}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

            {/* ── Save button ─────────────────────────────────────────────── */}
            <div className="pb-6 space-y-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 rounded-xl text-sm font-bold border-0"
                style={{ background: '#7dd3fc', color: '#041830', boxShadow: '0 4px 14px rgba(55,181,255,0.35)' }}
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                  : <><Save className="w-4 h-4 mr-2" />Save Post-Game</>
                }
              </Button>

              {saved && (
                <button
                  type="button"
                  onClick={() => router.push(`/charting/sessions/${sessionId}/parent-chart`)}
                  className="w-full py-2.5 text-sm font-medium text-white/40 hover:text-white/70 transition-colors"
                >
                  ← Back to chart overview
                </button>
              )}
            </div>

          </div>{/* end left column */}

          {/* Right column — sticky sidebar */}
          <div className="space-y-4 lg:sticky lg:top-24">

            {/* Connection Guide */}
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{
                background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 30%, #0a2d52 100%)',
                border: '1px solid rgba(55,181,255,0.22)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
            >
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Connection Guide</p>
              <div className="space-y-4">
                {[
                  { label: 'Your Word', tip: "One word captures your gut sense. No wrong answers — patterns emerge across games over time." },
                  { label: 'Car Ride', tip: "The drive home is for connection, not coaching. Your mood read here shapes how Smarter Goalie guides you." },
                  { label: 'Debrief Style', tip: "Even silence or space is data — it tells us where your Goalie is mentally after competing." },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs font-bold text-white/75">{item.label}</p>
                    <p className="text-xs text-white/38 mt-1 leading-relaxed">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Observer reminder */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(55,181,255,0.04)', border: '1px solid rgba(55,181,255,0.12)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(125,211,252,0.55)' }}>Remember</p>
              <p className="text-xs text-white/35 leading-relaxed">
                You're an observer, not a coach. Your data cross-references with your Goalie's self-eval — divergence is where growth begins.
              </p>
            </div>

            {/* Saved status */}
            {saved && (
              <div
                className="rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300"
                style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)' }}
              >
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <p className="text-xs font-semibold text-green-300">Chart complete</p>
              </div>
            )}

          </div>{/* end right column */}

        </div>{/* end grid */}
      </div>
    </div>
  );
}
