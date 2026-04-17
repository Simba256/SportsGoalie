'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, V2PostGameData, V2PeriodData } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Brain, Shield, Vault, ClipboardList, Activity } from 'lucide-react';
import {
  ContextualHelp,
  RotatingNumberSelector,
  VoiceRecorder,
  AutoCalculatedDisplay,
} from '@/components/charting/inputs';
import { toast } from 'sonner';

// ─── Constants ───────────────────────────────────────────────────────────────

const GAME_FACTOR_OPTIONS = [
  { value: 1, label: '1 — Low challenge' },
  { value: 2, label: '2 — Below average' },
  { value: 3, label: '3 — Average' },
  { value: 4, label: '4 — High challenge' },
  { value: 5, label: '5 — Maximum challenge' },
];

const GAME_RETENTION_OPTIONS = [
  { value: 1, label: '1 — Very fuzzy' },
  { value: 2, label: '2 — Mostly unclear' },
  { value: 3, label: '3 — Some parts clear' },
  { value: 4, label: '4 — Mostly clear' },
  { value: 5, label: '5 — Crystal clear' },
];

type PeriodKey = 'period1' | 'period2' | 'period3' | 'overtime';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function V2PostGamePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [periodData, setPeriodData] = useState<Record<PeriodKey, V2PeriodData | null>>({
    period1: null, period2: null, period3: null, overtime: null,
  });

  const [formData, setFormData] = useState<V2PostGameData>({
    overallFeeling: '',
    overallGameFactorRating: 3,
    overallGameFactorVoiceNote: undefined,
    mindControlAverage: 0,
    goodGoalCount: 0,
    badGoalCount: 0,
    goodDecisionRate: 0,
    gameRetentionRating: 3,
    gameRetentionVoiceNote: undefined,
    mindVaultEntry: '',
    factorRatioSummary: 0,
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
            // Load period data for auto-calculations
            const v2Periods = (myEntry as unknown as { v2Periods?: Record<PeriodKey, V2PeriodData> }).v2Periods;
            if (v2Periods) {
              setPeriodData({
                period1: v2Periods.period1 || null,
                period2: v2Periods.period2 || null,
                period3: v2Periods.period3 || null,
                overtime: v2Periods.overtime || null,
              });
            }

            // Load existing post-game data
            const v2PostGame = (myEntry as unknown as { v2PostGame?: V2PostGameData }).v2PostGame;
            if (v2PostGame) {
              setFormData(v2PostGame);
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

  // ── Auto-calculations ─────────────────────────────────────────────────────
  const calculations = useMemo(() => {
    const activePeriods = Object.values(periodData).filter((p): p is V2PeriodData => p !== null);

    // Mind Control Average
    const mindControlAvg = activePeriods.length > 0
      ? activePeriods.reduce((sum, p) => sum + (p.mindControlRating || 0), 0) / activePeriods.length
      : 0;

    // Good / Bad Goal totals
    let goodGoals = 0;
    let badGoals = 0;
    for (const period of activePeriods) {
      for (const goal of period.goals || []) {
        if (goal.isGoodGoal) goodGoals++;
        else badGoals++;
      }
    }
    const totalGoals = goodGoals + badGoals;
    const goodDecisionRate = totalGoals > 0 ? Math.round((goodGoals / totalGoals) * 100) : 0;

    // Factor Ratio Summary
    const factorRatioAvg = activePeriods.length > 0
      ? activePeriods.reduce((sum, p) => sum + (p.periodFactorRatio || 0), 0) / activePeriods.length
      : 0;

    // Per-period factor ratios for visual breakdown
    const periodFactorRatios: { label: string; value: number }[] = [];
    if (periodData.period1) periodFactorRatios.push({ label: 'P1', value: periodData.period1.periodFactorRatio || 0 });
    if (periodData.period2) periodFactorRatios.push({ label: 'P2', value: periodData.period2.periodFactorRatio || 0 });
    if (periodData.period3) periodFactorRatios.push({ label: 'P3', value: periodData.period3.periodFactorRatio || 0 });
    if (periodData.overtime) periodFactorRatios.push({ label: 'OT', value: periodData.overtime.periodFactorRatio || 0 });

    return { mindControlAvg, goodGoals, badGoals, goodDecisionRate, factorRatioAvg, periodFactorRatios };
  }, [periodData]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !session) return;
    setSaving(true);
    try {
      // Merge auto-calculations into form data
      const postGameData: V2PostGameData = {
        ...formData,
        mindControlAverage: Math.round(calculations.mindControlAvg * 10) / 10,
        goodGoalCount: calculations.goodGoals,
        badGoalCount: calculations.badGoals,
        goodDecisionRate: calculations.goodDecisionRate,
        factorRatioSummary: Math.round(calculations.factorRatioAvg * 10) / 10,
      };

      const entriesResult = await chartingService.getChartingEntriesBySession(sessionId);
      const existingEntries = entriesResult.success ? entriesResult.data || [] : [];
      const myEntry = existingEntries.find(e => e.submittedBy === user.id);

      const entryData: Record<string, unknown> = {
        sessionId: session.id,
        studentId: session.studentId,
        submittedBy: user.id,
        submitterRole: (user.role || 'student') as 'student' | 'admin',
        v2PostGame: postGameData,
        v2Version: 'v2',
      };

      if (myEntry) {
        const preserveFields = ['gameOverview', 'period1', 'period2', 'period3', 'overtime', 'shootout', 'postGame', 'preGame', 'v2PreGame', 'v2Periods'] as const;
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

      toast.success('Post-Game section saved!');
      router.push(`/charting/sessions/${sessionId}`);
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  // ── Update helper ─────────────────────────────────────────────────────────
  const update = <K extends keyof V2PostGameData>(key: K, value: V2PostGameData[K]) => {
    setFormData((prev: V2PostGameData) => ({ ...prev, [key]: value }));
  };

  // ── Loading ────────────────────────────────────────────────────────────────
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

  const hasPeriodData = Object.values(periodData).some(p => p !== null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="flex items-center justify-between px-6 h-16">
          <button
            type="button"
            onClick={() => router.push(`/charting/sessions/${sessionId}`)}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-red-600 to-slate-900 bg-clip-text text-transparent">
            Post-Game
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
      <div className="px-6 py-6 space-y-5">

        <div>
          <h2 className="text-xl font-black text-zinc-900">Post-Game Review</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            First quiet moment after the game. Be honest. Before the feelings fade.
          </p>
        </div>

        {/* ── All 8 Fields ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* #1 Overall Game Feeling — Voice Only */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="#1 — Overall Game Feeling"
              helpText="First instinct. No prompts. No multiple choice. Raw and unfiltered. System captures it. Later cross-referenced with actual data. Builds self-evaluation accuracy over time."
            >
              <VoiceRecorder
                onTranscriptionComplete={(text) => update('overallFeeling', text)}
                initialText={formData.overallFeeling}
                placeholder="Tap the mic and share your honest first feeling..."
              />
            </ContextualHelp>
          </div>

          {/* #2 Overall Game Factor Rating */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="#2 — Overall Game Factor Rating"
              helpText="How challenging was this game overall? 1=Low challenge, weak opposition. 3=Average. 5=Maximum challenge, elite opposition. If 4 or 5 triggers voice follow-up. Cross-references with per-period Factor Ratios."
            >
              <RotatingNumberSelector
                value={formData.overallGameFactorRating}
                onChange={(val) => update('overallGameFactorRating', val as number)}
                options={GAME_FACTOR_OPTIONS}
              />
            </ContextualHelp>

            {formData.overallGameFactorRating >= 4 && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-gray-100">
                <p className="text-xs text-zinc-600 mb-2 italic">
                  What made this game most demanding?
                </p>
                <VoiceRecorder
                  onTranscriptionComplete={(text) => update('overallGameFactorVoiceNote', text)}
                  initialText={formData.overallGameFactorVoiceNote}
                  placeholder="Tap to describe what made it challenging..."
                />
              </div>
            )}
          </div>

          {/* #3 Mind Control Average — Auto-calculated */}
          {hasPeriodData ? (
            <AutoCalculatedDisplay
              label="#3 — Mind Control Average"
              value={calculations.mindControlAvg.toFixed(1)}
              unit="/ 5"
              description="System calculates average of per-period Mind Control ratings automatically."
              icon={<Brain className="w-4 h-4 text-blue-600" />}
            />
          ) : (
            <div className="bg-zinc-50 rounded-xl border border-dashed border-zinc-300 p-4 flex items-center justify-center">
              <p className="text-xs text-zinc-400 text-center">#3 — Mind Control Average<br />Complete Period Charting to calculate</p>
            </div>
          )}

          {/* #4 Good Goal / Bad Goal Ratio — Auto-calculated */}
          {hasPeriodData ? (
            <AutoCalculatedDisplay
              label="#4 — Good / Bad Goal Ratio"
              value={`${calculations.goodGoals} Good, ${calculations.badGoals} Bad`}
              description={`${calculations.goodDecisionRate}% Good Decision Rate this game`}
              icon={<Shield className="w-4 h-4 text-blue-600" />}
            />
          ) : (
            <div className="bg-zinc-50 rounded-xl border border-dashed border-zinc-300 p-4 flex items-center justify-center">
              <p className="text-xs text-zinc-400 text-center">#4 — Good / Bad Goal Ratio<br />Complete Period Charting to calculate</p>
            </div>
          )}

          {/* #5 Game Retention Check */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="#5 — Game Retention Check"
              helpText="How clearly do you remember each period? 1=Very fuzzy. 5=Crystal clear. If 1-2 triggers voice. Game Retention is a skill that builds over time through curriculum."
            >
              <RotatingNumberSelector
                value={formData.gameRetentionRating}
                onChange={(val) => update('gameRetentionRating', val as number)}
                options={GAME_RETENTION_OPTIONS}
              />
            </ContextualHelp>

            {formData.gameRetentionRating <= 2 && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-gray-100">
                <p className="text-xs text-zinc-600 mb-2 italic">
                  What do you remember most clearly?
                </p>
                <VoiceRecorder
                  onTranscriptionComplete={(text) => update('gameRetentionVoiceNote', text)}
                  initialText={formData.gameRetentionVoiceNote}
                  placeholder="Tap to share what stands out from this game..."
                />
              </div>
            )}
          </div>

          {/* #6 One Thing for Mind Vault */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <ContextualHelp
              label="#6 — One Thing for Mind Vault"
              helpText="What goes in your Mind Vault from this game? One thing. Could be a save you owned, a reset that worked, a lesson learned. Feeds Mind Vault directly. Every game adds something."
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
                  <Vault className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <span className="text-xs text-zinc-500">Stored in your Mind Vault</span>
              </div>
              <VoiceRecorder
                onTranscriptionComplete={(text) => update('mindVaultEntry', text)}
                initialText={formData.mindVaultEntry}
                placeholder="Tap to record one thing worth keeping..."
              />
            </ContextualHelp>
          </div>

          {/* #7 Practice Index Auto-Generation — Background */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  #7 — Practice Index
                </p>
                <p className="text-sm font-bold text-zinc-800 mb-1">Auto-generated on save</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  System flags items for your Practice Chart: <span className="font-semibold text-red-600">Immediate Development</span> (broke down),{' '}
                  <span className="font-semibold text-blue-600">Refinement</span> (growing),{' '}
                  <span className="font-semibold text-zinc-600">Maintenance</span> (keep sharp).
                </p>
              </div>
            </div>
          </div>

          {/* #8 Factor Ratio Summary — Visual breakdown */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  #8 — Factor Ratio Summary
                </p>
                {hasPeriodData ? (
                  <>
                    <p className="text-2xl font-black text-zinc-900 mb-2">
                      {calculations.factorRatioAvg.toFixed(1)}
                      <span className="text-sm font-medium text-zinc-500 ml-1">/ 5 avg</span>
                    </p>
                    {calculations.periodFactorRatios.length > 0 && (
                      <div className="space-y-1.5">
                        {calculations.periodFactorRatios.map((pr) => (
                          <div key={pr.label} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-500 w-6">{pr.label}</span>
                            <div className="flex-1 h-3 bg-blue-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${(pr.value / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-zinc-700 w-4 text-right">{pr.value}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pt-1 border-t border-blue-200">
                          <span className="text-xs font-bold text-blue-600 w-6">OVR</span>
                          <div className="flex-1 h-3 bg-blue-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${(formData.overallGameFactorRating / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-blue-700 w-4 text-right">{formData.overallGameFactorRating}</span>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-zinc-500 mt-2">Tracked over time across season.</p>
                  </>
                ) : (
                  <p className="text-xs text-zinc-400">Complete Period Charting to see visual breakdown.</p>
                )}
              </div>
            </div>
          </div>

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
              <><Save className="w-4 h-4 mr-2" /> Save Post-Game</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
