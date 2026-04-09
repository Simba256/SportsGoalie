'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, V2PeriodData, GoalEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import {
  ContextualHelp,
  RotatingNumberSelector,
  StarRating,
  NumericCounter,
  GoalClassifier,
  VoiceRecorder,
} from '@/components/charting/inputs';
import type { StarDefinition } from '@/components/charting/inputs';
import { toast } from 'sonner';

// ─── Constants ───────────────────────────────────────────────────────────────

const MIND_CONTROL_DEFINITIONS: StarDefinition[] = [
  { rating: 1, title: 'Not in the Now', description: 'Mind was elsewhere. Thinking about school, friends, last game, or anything but the current play. Barely tracking the puck.' },
  { rating: 2, title: 'Present but Not Present', description: 'Body was there but mind was drifting. Moments of awareness mixed with stretches of distraction.' },
  { rating: 3, title: 'Developing the Off Switch', description: 'Learning to shut out distractions. Some good stretches of focus, but inconsistent. Building the habit.' },
  { rating: 4, title: 'Review Reset Reaffirm', description: 'After each play, reviewing what happened, resetting position and mind, reaffirming focus. Active mental management.' },
  { rating: 5, title: 'Command Center Operating', description: 'Fully locked in. Eyes tracking puck, reading plays before they develop, body responding automatically. In the zone.' },
];

const FACTOR_RATIO_OPTIONS = [
  { value: 1, label: '1 — Low challenge' },
  { value: 2, label: '2 — Below average' },
  { value: 3, label: '3 — Average' },
  { value: 4, label: '4 — High challenge' },
  { value: 5, label: '5 — Maximum challenge' },
];

type PeriodKey = 'period1' | 'period2' | 'period3' | 'overtime';

const PERIOD_TABS: { key: PeriodKey; label: string; short: string }[] = [
  { key: 'period1', label: 'Period 1', short: 'P1' },
  { key: 'period2', label: 'Period 2', short: 'P2' },
  { key: 'period3', label: 'Period 3', short: 'P3' },
];

function createEmptyPeriod(): V2PeriodData {
  return {
    mindControlRating: 3,
    mindControlVoiceNote: undefined,
    periodFactorRatio: 3,
    goalsAgainst: 0,
    goals: [],
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function V2PeriodsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<PeriodKey>('period1');
  const [showOvertime, setShowOvertime] = useState(false);

  const [periods, setPeriods] = useState<Record<PeriodKey, V2PeriodData>>({
    period1: createEmptyPeriod(),
    period2: createEmptyPeriod(),
    period3: createEmptyPeriod(),
    overtime: createEmptyPeriod(),
  });

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !sessionId) return;
    const load = async () => {
      setLoading(true);
      try {
        const sessionResult = await chartingService.getSession(sessionId);
        if (sessionResult.success && sessionResult.data) setSession(sessionResult.data);

        const entriesResult = await chartingService.getChartingEntriesBySession(sessionId);
        if (entriesResult.success && entriesResult.data) {
          const myEntry = entriesResult.data.find(e => e.submittedBy === user.id);
          if (myEntry) {
            const v2Periods = (myEntry as unknown as { v2Periods?: Record<PeriodKey, V2PeriodData> }).v2Periods;
            if (v2Periods) {
              setPeriods(prev => ({
                period1: v2Periods.period1 || prev.period1,
                period2: v2Periods.period2 || prev.period2,
                period3: v2Periods.period3 || prev.period3,
                overtime: v2Periods.overtime || prev.overtime,
              }));
              if (v2Periods.overtime?.mindControlRating) setShowOvertime(true);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load:', error);
        toast.error('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, sessionId]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !session) return;
    setSaving(true);
    try {
      const entriesResult = await chartingService.getChartingEntriesBySession(sessionId);
      const existingEntries = entriesResult.success ? entriesResult.data || [] : [];
      const myEntry = existingEntries.find(e => e.submittedBy === user.id);

      const periodsToSave: Record<string, V2PeriodData> = {
        period1: periods.period1,
        period2: periods.period2,
        period3: periods.period3,
      };
      if (showOvertime) periodsToSave.overtime = periods.overtime;

      const entryData: Record<string, unknown> = {
        sessionId: session.id,
        studentId: session.studentId,
        submittedBy: user.id,
        submitterRole: (user.role || 'student') as 'student' | 'admin',
        v2Periods: periodsToSave,
        v2Version: 'v2',
      };

      if (myEntry) {
        const preserveFields = ['gameOverview', 'period1', 'period2', 'period3', 'overtime', 'shootout', 'postGame', 'preGame', 'v2PreGame', 'v2PostGame'] as const;
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

      toast.success('Period charting saved!');
      router.push(`/charting/sessions/${sessionId}`);
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  // ── Update helpers ────────────────────────────────────────────────────────
  const updatePeriod = <K extends keyof V2PeriodData>(key: K, value: V2PeriodData[K]) => {
    setPeriods(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [key]: value },
    }));
  };

  const updateGoals = (goals: GoalEntry[]) => {
    setPeriods(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], goals },
    }));
  };

  const activePeriod = periods[activeTab];
  const allTabs = showOvertime ? [...PERIOD_TABS, { key: 'overtime' as PeriodKey, label: 'Overtime', short: 'OT' }] : PERIOD_TABS;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
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
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="flex items-center justify-between px-6 h-14">
          <button
            type="button"
            onClick={() => router.push(`/charting/sessions/${sessionId}`)}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-sm font-bold text-zinc-900">Period Charting</h1>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 h-9 text-sm font-semibold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1.5" /> Save</>}
          </Button>
        </div>

        {/* Period tabs */}
        <div className="px-6 pb-2">
          <div className="flex gap-1.5 max-w-md">
            {allTabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 h-8 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-gray-100 text-zinc-500 hover:bg-gray-200'
                }`}
              >
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
            {!showOvertime && (
              <button
                type="button"
                onClick={() => { setShowOvertime(true); setActiveTab('overtime'); }}
                className="h-8 px-3 rounded-lg text-xs font-medium text-zinc-400 hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> OT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-6 space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-900">
              {allTabs.find(t => t.key === activeTab)?.label}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              Chart from memory — how did this period go?
            </p>
          </div>
          {/* OT remove option */}
          {activeTab === 'overtime' && (
            <button
              type="button"
              onClick={() => { setShowOvertime(false); setActiveTab('period3'); }}
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* 1. Mind Control Rating */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="Mind Control Rating"
              helpText="Rate your mental command during this period. 1 = Not in the Now, 5 = Command Center Operating. Tap any star to see its full definition."
            >
              <StarRating
                value={activePeriod.mindControlRating}
                onChange={(val) => updatePeriod('mindControlRating', val)}
                definitions={MIND_CONTROL_DEFINITIONS}
              />
            </ContextualHelp>

            {activePeriod.mindControlRating <= 2 && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-gray-100">
                <p className="text-xs text-zinc-600 mb-2 italic">
                  What had your attention instead of the game?
                </p>
                <VoiceRecorder
                  onTranscriptionComplete={(text) => updatePeriod('mindControlVoiceNote', text)}
                  initialText={activePeriod.mindControlVoiceNote}
                  placeholder="Tap to describe what distracted you..."
                />
              </div>
            )}
          </div>

          {/* 2. Period Factor Ratio */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="Period Factor Ratio"
              helpText="How challenging was this period? 1 = Low challenge, easy opposition. 5 = Maximum challenge, elite opposition, constant pressure."
            >
              <RotatingNumberSelector
                value={activePeriod.periodFactorRatio}
                onChange={(val) => updatePeriod('periodFactorRatio', val as number)}
                options={FACTOR_RATIO_OPTIONS}
              />
            </ContextualHelp>
          </div>

          {/* 3. Goals Against */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="Goals Against"
              helpText="How many goals were scored against you this period? Each goal will be classified as Good Goal or Bad Goal below."
            >
              <NumericCounter
                value={activePeriod.goalsAgainst}
                onChange={(val) => {
                  updatePeriod('goalsAgainst', val);
                  if (val < activePeriod.goals.length) {
                    updateGoals(activePeriod.goals.slice(0, val));
                  }
                }}
                min={0}
                max={15}
              />
            </ContextualHelp>
          </div>

          {/* 4. Goal Classification */}
          {activePeriod.goalsAgainst > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 md:col-span-2">
              <ContextualHelp
                label="Goal Classification"
                helpText="Good Goal: Correct position, correct read, correct decision — puck still went in. Not your fault. Bad Goal: Breakdown in position, read, form, or mental execution within your control."
              >
                <GoalClassifier
                  goalCount={activePeriod.goalsAgainst}
                  goals={activePeriod.goals}
                  onChange={updateGoals}
                />
              </ContextualHelp>
            </div>
          )}
        </div>

        {/* Architecture placeholder for 8 Factor Ratios */}
        <div className="bg-zinc-50 rounded-xl border border-dashed border-zinc-300 p-4 text-center">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            8 Factor Ratios — Coming Soon
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Intensity, Skating Command, Positional 7AMS, Below Icing Line 7PTS, Form, Reading Breakout, Reading Stick
          </p>
        </div>

        {/* ── Bottom save ──────────────────────────────────────────────── */}
        <div className="pb-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 px-8"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Periods</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
