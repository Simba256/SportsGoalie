'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, V2PreGameData, MindManagementStartTime } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import {
  ContextualHelp,
  RotatingNumberSelector,
  YesNoToggle,
  VoiceRecorder,
} from '@/components/charting/inputs';
import { toast } from 'sonner';

// ─── Start Time Options ──────────────────────────────────────────────────────

const START_TIME_OPTIONS = [
  { value: 'at_the_rink' as MindManagementStartTime, label: 'At the rink' },
  { value: '1_hour_before' as MindManagementStartTime, label: '1 hour before' },
  { value: '2_hours_before' as MindManagementStartTime, label: '2 hours before' },
  { value: '3_plus_hours_before' as MindManagementStartTime, label: '3+ hours before' },
  { value: 'wake_up_thinking' as MindManagementStartTime, label: 'I wake up thinking about it' },
];

const MENTAL_STATE_OPTIONS = [
  { value: 1, label: '1 — Already anxious' },
  { value: 2, label: '2 — A bit uneasy' },
  { value: 3, label: '3 — Neutral' },
  { value: 4, label: '4 — Feeling good' },
  { value: 5, label: '5 — Calm and ready' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function V2PreGamePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<V2PreGameData>({
    personalStartTime: '1_hour_before',
    mentalStateRating: 3,
    mentalStateVoiceNote: undefined,
    routineCompleted: true,
    routineVoiceNote: undefined,
    anxietyPresent: false,
    anxietyVoiceNote: undefined,
    targetStateAchieved: true,
    targetStateVoiceNote: undefined,
  });

  // ── Load session & existing v2 data ──────────────────────────────────────
  useEffect(() => {
    if (!user || !sessionId) return;
    const load = async () => {
      setLoading(true);
      try {
        const sessionResult = await chartingService.getSession(sessionId);
        if (sessionResult.success && sessionResult.data) {
          setSession(sessionResult.data);
        }

        // Try to load existing v2 entry
        const entriesResult = await chartingService.getChartingEntriesBySession(sessionId);
        if (entriesResult.success && entriesResult.data) {
          const myEntry = entriesResult.data.find(e => e.submittedBy === user.id);
          if (myEntry) {
            // Check for v2 pre-game data stored in the entry
            const v2Data = (myEntry as unknown as { v2PreGame?: V2PreGameData }).v2PreGame;
            if (v2Data) {
              setFormData(v2Data);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        toast.error('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, sessionId]);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !session) return;
    setSaving(true);
    try {
      // Load existing entry to preserve other sections
      const entriesResult = await chartingService.getChartingEntriesBySession(sessionId);
      const existingEntries = entriesResult.success ? entriesResult.data || [] : [];
      const myEntry = existingEntries.find(e => e.submittedBy === user.id);

      const entryData: Record<string, unknown> = {
        sessionId: session.id,
        studentId: session.studentId,
        submittedBy: user.id,
        submitterRole: (user.role || 'student') as 'student' | 'admin',
        v2PreGame: formData,
        v2Version: 'v2',
      };

      if (myEntry) {
        // Preserve existing fields
        const preserveFields = ['gameOverview', 'period1', 'period2', 'period3', 'overtime', 'shootout', 'postGame', 'preGame', 'v2Periods', 'v2PostGame'] as const;
        for (const field of preserveFields) {
          const val = (myEntry as unknown as Record<string, unknown>)[field];
          if (val) entryData[field] = val;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await chartingService.updateChartingEntry(myEntry.id, entryData as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await chartingService.createChartingEntry(entryData as any);
      }

      toast.success('Pre-Game section saved!');
      router.push(`/charting/sessions/${sessionId}`);
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  // ── Update helpers ───────────────────────────────────────────────────────
  const update = <K extends keyof V2PreGameData>(key: K, value: V2PreGameData[K]) => {
    setFormData((prev: V2PreGameData) => ({ ...prev, [key]: value }));
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <SkeletonContentPage />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-zinc-600">Session not found</p>
          <Button variant="outline" onClick={() => router.push('/charting')}>Back to Sessions</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="flex items-center justify-between px-6 h-16">
          <button
            type="button"
            onClick={() => router.push(`/charting/sessions/${sessionId}`)}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 bg-clip-text text-transparent">
            Pre-Game
          </h1>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 h-9 text-sm font-semibold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1.5" /> Save</>}
          </Button>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-6 space-y-6">

        {/* Section header */}
        <div>
          <h2 className="text-xl font-black text-zinc-900">Mind Management</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Complete before leaving for the rink. Not at the rink.
          </p>
        </div>

        {/* Fields grid — 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* 1. Personal Start Time */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="Personal Start Time"
              helpText="When does your Mind Management begin? This tracks how early you start preparing mentally before the game."
            >
              <RotatingNumberSelector
                value={formData.personalStartTime}
                onChange={(val) => update('personalStartTime', val as MindManagementStartTime)}
                options={START_TIME_OPTIONS}
              />
            </ContextualHelp>
          </div>

          {/* 2. Mental State Check-in */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="Mental State Check-in"
              helpText="Where are you arriving from mentally? Rate how you feel right now. A low rating will prompt a voice note to capture what's on your mind."
            >
              <RotatingNumberSelector
                value={formData.mentalStateRating}
                onChange={(val) => update('mentalStateRating', val as number)}
                options={MENTAL_STATE_OPTIONS}
              />
            </ContextualHelp>

            {/* Conditional voice for low ratings */}
            {formData.mentalStateRating <= 2 && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-gray-100">
                <p className="text-xs text-zinc-600 mb-2 italic">What is on your mind?</p>
                <VoiceRecorder
                  onTranscriptionComplete={(text) => update('mentalStateVoiceNote', text)}
                  initialText={formData.mentalStateVoiceNote}
                  placeholder="Tap the mic to describe what's on your mind..."
                />
              </div>
            )}
          </div>

          {/* 3. Routine Completed */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="Routine Completed?"
              helpText="Did you complete your pre-game routine? Your routine is your anchor — it sets the stage for how you'll perform."
            >
              <YesNoToggle
                value={formData.routineCompleted}
                onChange={(val) => update('routineCompleted', val)}
                triggerVoiceOn="no"
                voicePrompt="What got in the way?"
                onVoiceComplete={(text) => update('routineVoiceNote', text)}
                initialVoiceText={formData.routineVoiceNote}
              />
            </ContextualHelp>
          </div>

          {/* 4. Anxiety Present */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="Anxiety Present?"
              helpText="If anxiety is present, this is normal. What matters is what you do with it. Your response feeds your Mind Vault — methods that work get stored."
            >
              <YesNoToggle
                value={formData.anxietyPresent}
                onChange={(val) => update('anxietyPresent', val)}
                triggerVoiceOn="yes"
                voicePrompt="What did you do with it?"
                onVoiceComplete={(text) => update('anxietyVoiceNote', text)}
                initialVoiceText={formData.anxietyVoiceNote}
              />
            </ContextualHelp>
          </div>

          {/* 5. Target State Achieved */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="Target State Achieved?"
              helpText="Excited, calm, controlled — did you get there? Your target state is the mental place you need to be before competing."
            >
              <YesNoToggle
                value={formData.targetStateAchieved}
                onChange={(val) => update('targetStateAchieved', val)}
                triggerVoiceOn="no"
                voicePrompt="What happened?"
                onVoiceComplete={(text) => update('targetStateVoiceNote', text)}
                initialVoiceText={formData.targetStateVoiceNote}
              />
            </ContextualHelp>
          </div>
        </div>

        {/* ── Bottom save bar ─────────────────────────────────────────────── */}
        <div className="pb-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 px-8"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Pre-Game</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
