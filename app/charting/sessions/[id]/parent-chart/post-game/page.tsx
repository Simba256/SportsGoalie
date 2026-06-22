'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { useRouter, useParams } from 'next/navigation';
import { chartingService, parentChartingService } from '@/lib/database';
import { Session, ParentPostGameData, ParentCarRideMood, ParentTalkAboutGame } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';
import { ContextualHelp } from '@/components/charting/inputs';
import { toast } from 'sonner';

// ─── Option sets ─────────────────────────────────────────────────────────────

const CAR_RIDE_OPTIONS: { value: ParentCarRideMood; label: string; emoji: string }[] = [
  { value: 'happy',               label: 'Happy',                    emoji: '😊' },
  { value: 'neutral',             label: 'Neutral',                  emoji: '😐' },
  { value: 'frustrated',          label: 'Frustrated',               emoji: '😤' },
  { value: 'didnt_want_to_talk',  label: "Didn't want to talk",      emoji: '🤐' },
  { value: 'great_conversation',  label: 'We had a great conversation', emoji: '💬' },
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
  if (mood === 'a_bit_nervous' as string || talked === 'briefly') {
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

// ─── Radio group ──────────────────────────────────────────────────────────────

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
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }
            }
          >
            <span className="text-base">{opt.emoji}</span>
            <span>{opt.label}</span>
            {selected && <CheckCircle className="ml-auto w-4 h-4" style={{ color: '#37b5ff' }} />}
          </button>
        );
      })}
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
            Post-Game
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

      <div className="px-5 py-6 space-y-5 max-w-lg mx-auto">

        <div>
          <h2 className="text-2xl font-black text-white">Parent Reflection</h2>
          <p className="text-sm text-white/45 mt-1">The goal is connection, not coaching.</p>
        </div>

        {/* 1. One word */}
        <div className="rounded-xl p-4 space-y-3" style={cardStyle}>
          <ContextualHelp
            label="One word for your Goalie's game"
            helpText="A single word that captures your overall sense of how the game went. There's no wrong answer — this is your honest observation."
          >
            <input
              type="text"
              value={formData.oneWordForGame ?? ''}
              onChange={e => update('oneWordForGame', e.target.value)}
              placeholder="e.g. Determined, Shaky, Locked-in..."
              maxLength={30}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[rgba(55,181,255,0.5)]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </ContextualHelp>
        </div>

        {/* 2. One positive */}
        <div className="rounded-xl p-4 space-y-3" style={cardStyle}>
          <ContextualHelp
            label="ONE positive thing you saw"
            helpText="Specific observations land better than general praise. What moment stood out where your Goalie showed something real?"
          >
            <textarea
              value={formData.onePositiveThing ?? ''}
              onChange={e => update('onePositiveThing', e.target.value)}
              placeholder="What did you see that impressed you..."
              rows={2}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-[rgba(55,181,255,0.5)]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </ContextualHelp>
        </div>

        {/* 3. One concern */}
        <div className="rounded-xl p-4 space-y-3" style={cardStyle}>
          <ContextualHelp
            label="ONE thing that concerned you"
            helpText="Honest concerns are valuable data — not criticism. The platform cross-references this with your Goalie's self-evaluation to find patterns."
          >
            <textarea
              value={formData.oneConcern ?? ''}
              onChange={e => update('oneConcern', e.target.value)}
              placeholder="What worried or confused you as you watched..."
              rows={2}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-[rgba(55,181,255,0.5)]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </ContextualHelp>
        </div>

        {/* 4. Car-ride mood */}
        <div className="rounded-xl p-4 space-y-3" style={cardStyle}>
          <ContextualHelp
            label="Car-ride-home mood?"
            helpText="The mood in the car after a game tells the platform a lot about how your Goalie processes performance. No judgment — just data."
          >
            <EmojiRadioGroup<ParentCarRideMood>
              value={formData.carRideMood ?? null}
              onChange={v => update('carRideMood', v)}
              options={CAR_RIDE_OPTIONS}
            />
          </ContextualHelp>
        </div>

        {/* 5. Did you talk */}
        <div className="rounded-xl p-4 space-y-3" style={cardStyle}>
          <ContextualHelp
            label="Did you talk about the game?"
            helpText="How you debrief after a game shapes your Goalie's relationship with performance. The platform guides post-game conversations based on your answers."
          >
            <EmojiRadioGroup<ParentTalkAboutGame>
              value={formData.talkedAboutGame ?? null}
              onChange={v => update('talkedAboutGame', v)}
              options={TALK_OPTIONS}
            />
          </ContextualHelp>
        </div>

        {/* ── Conversation guide (appears after both Q4 + Q5 answered) ──────── */}
        {guide.length > 0 && (
          <div
            className="rounded-xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-400"
            style={{ background: 'rgba(55,181,255,0.06)', border: '1px solid rgba(55,181,255,0.2)' }}
          >
            <p className="text-xs font-bold text-[#7dd3fc] uppercase tracking-widest">
              Conversation Guide
            </p>
            <div className="space-y-2">
              {guide.map((line, i) => (
                <p key={i} className="text-sm text-white/75 leading-relaxed">
                  {i === 0 ? <span className="text-white font-semibold">{line}</span> : line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ── Saved confirmation ────────────────────────────────────────────── */}
        {saved && (
          <div
            className="rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-300">Parent chart complete</p>
              <p className="text-xs text-white/40 mt-0.5">
                Cross-referenced with your Goalie's self-evaluation.
              </p>
            </div>
          </div>
        )}

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
              : <><Save className="w-4 h-4 mr-2" />Save Post-Game</>
            }
          </Button>

          {saved && (
            <button
              type="button"
              onClick={() => router.push(`/charting/sessions/${sessionId}/parent-chart`)}
              className="w-full mt-3 py-2.5 text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              ← Back to chart overview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
