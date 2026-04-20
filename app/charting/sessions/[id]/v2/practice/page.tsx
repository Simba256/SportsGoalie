'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import {
  Session,
  V2PracticeChartEntry,
  PracticeIndexItem,
  PracticeIndexCategory,
} from '@/types';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Flame,
  Sparkles,
  ShieldCheck,
  Video,
  Eye,
  Brain,
  Target,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react';
import {
  ContextualHelp,
  RotatingNumberSelector,
  YesNoToggle,
  VoiceRecorder,
} from '@/components/charting/inputs';
import { toast } from 'sonner';

// ─── Constants ───────────────────────────────────────────────────────────────

const PRACTICE_VALUE_OPTIONS = [
  { value: 1, label: '1 — Wasted time, no designated training' },
  { value: 2, label: '2 — Low value' },
  { value: 3, label: '3 — Some value' },
  { value: 4, label: '4 — Productive' },
  { value: 5, label: '5 — Highly productive, intentional work' },
];

const IMPROVEMENT_OPTIONS = [
  { value: 1, label: '1 — No change or worse' },
  { value: 2, label: '2 — Slight change' },
  { value: 3, label: '3 — Some improvement' },
  { value: 4, label: '4 — Noticeable progress' },
  { value: 5, label: '5 — Significant, feels owned' },
];

const TECHNICAL_EYE_OPTIONS = [
  { value: 1, label: '1 — Could not evaluate objectively' },
  { value: 2, label: '2 — Mostly unclear' },
  { value: 3, label: '3 — Saw some things clearly' },
  { value: 4, label: '4 — Saw most things clearly' },
  { value: 5, label: '5 — Saw everything, know exactly why' },
];

const DURATION_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const minutes = (i + 1) * 5;
  return { value: minutes, label: `${minutes} min` };
});

const CATEGORIES: Array<{
  key: PracticeIndexCategory;
  label: string;
  description: string;
  accent: string;
  ring: string;
  chip: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: 'immediate_development',
    label: 'Immediate Development',
    description: 'Broke down in your last game — highest priority',
    accent: 'text-red-600',
    ring: 'border-red-200 bg-red-50/60',
    chip: 'bg-red-100 text-red-700',
    icon: Flame,
  },
  {
    key: 'refinement',
    label: 'Refinement',
    description: 'Growing but not yet owned',
    accent: 'text-blue-600',
    ring: 'border-blue-200 bg-blue-50/60',
    chip: 'bg-blue-100 text-blue-700',
    icon: Sparkles,
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    description: 'Under control — keep sharp',
    accent: 'text-slate-600',
    ring: 'border-slate-200 bg-slate-50',
    chip: 'bg-slate-100 text-slate-700',
    icon: ShieldCheck,
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type PracticeFormData = Omit<
  V2PracticeChartEntry,
  'id' | 'sessionId' | 'studentId' | 'version' | 'createdAt' | 'updatedAt'
>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const createEmptyForm = (): PracticeFormData => ({
  practiceIndex: [],
  practiceValueRating: 1,
  designatedTrainingReceived: false,
  designatedTrainingDuration: undefined,
  indexItemsWorkedOn: [],
  videoCaptured: false,
  videoUrl: undefined,
  improvementRatings: [],
  mindVaultEntry: '',
  technicalEyeDevelopmentRating: 1,
});

const newItemId = () =>
  `pi_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function V2PracticeChartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PracticeFormData>(createEmptyForm());

  // Draft state for adding a new index item in each category
  const [draftLabel, setDraftLabel] = useState<Record<PracticeIndexCategory, string>>({
    immediate_development: '',
    refinement: '',
    maintenance: '',
  });

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !sessionId) return;
    const load = async () => {
      setLoading(true);
      try {
        const sessionResult = await chartingService.getSession(sessionId);
        if (sessionResult.success && sessionResult.data) {
          setSession(sessionResult.data);
        }

        const entriesResult = await chartingService.getChartingEntriesBySession(sessionId);
        if (entriesResult.success && entriesResult.data) {
          const myEntry = entriesResult.data.find((e) => e.submittedBy === user.id);
          if (myEntry) {
            const existing = (myEntry as unknown as { v2Practice?: PracticeFormData })
              .v2Practice;
            if (existing) {
              setFormData({
                ...createEmptyForm(),
                ...existing,
                practiceIndex: existing.practiceIndex ?? [],
                indexItemsWorkedOn: existing.indexItemsWorkedOn ?? [],
                improvementRatings: existing.improvementRatings ?? [],
              });
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

  // ── Mutators ─────────────────────────────────────────────────────────────
  const update = <K extends keyof PracticeFormData>(key: K, value: PracticeFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addIndexItem = (category: PracticeIndexCategory) => {
    const label = draftLabel[category].trim();
    if (!label) return;
    const priority =
      category === 'immediate_development' ? 1 : category === 'refinement' ? 2 : 3;
    const item: PracticeIndexItem = {
      id: newItemId(),
      label,
      category,
      priority,
    };
    setFormData((prev) => ({ ...prev, practiceIndex: [...prev.practiceIndex, item] }));
    setDraftLabel((prev) => ({ ...prev, [category]: '' }));
  };

  const removeIndexItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      practiceIndex: prev.practiceIndex.filter((i) => i.id !== id),
      indexItemsWorkedOn: prev.indexItemsWorkedOn.filter((i) => i !== id),
      improvementRatings: prev.improvementRatings.filter((r) => r.itemId !== id),
    }));
  };

  const toggleWorkedOn = (id: string) => {
    setFormData((prev) => {
      const worked = prev.indexItemsWorkedOn.includes(id);
      const nextWorked = worked
        ? prev.indexItemsWorkedOn.filter((i) => i !== id)
        : [...prev.indexItemsWorkedOn, id];
      const nextRatings = worked
        ? prev.improvementRatings.filter((r) => r.itemId !== id)
        : prev.improvementRatings.find((r) => r.itemId === id)
        ? prev.improvementRatings
        : [...prev.improvementRatings, { itemId: id, rating: 1 }];
      return { ...prev, indexItemsWorkedOn: nextWorked, improvementRatings: nextRatings };
    });
  };

  const setImprovement = (itemId: string, rating: number) => {
    setFormData((prev) => ({
      ...prev,
      improvementRatings: prev.improvementRatings.some((r) => r.itemId === itemId)
        ? prev.improvementRatings.map((r) => (r.itemId === itemId ? { ...r, rating } : r))
        : [...prev.improvementRatings, { itemId, rating }],
    }));
  };

  const groupedIndex = useMemo(() => {
    const by: Record<PracticeIndexCategory, PracticeIndexItem[]> = {
      immediate_development: [],
      refinement: [],
      maintenance: [],
    };
    formData.practiceIndex.forEach((item) => by[item.category].push(item));
    return by;
  }, [formData.practiceIndex]);

  const workedOnItems = useMemo(
    () =>
      formData.practiceIndex.filter((i) => formData.indexItemsWorkedOn.includes(i.id)),
    [formData.practiceIndex, formData.indexItemsWorkedOn]
  );

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !session) return;
    setSaving(true);
    try {
      const entriesResult = await chartingService.getChartingEntriesBySession(sessionId);
      const existingEntries = entriesResult.success ? entriesResult.data || [] : [];
      const myEntry = existingEntries.find((e) => e.submittedBy === user.id);

      const entryData: Record<string, unknown> = {
        sessionId: session.id,
        studentId: session.studentId,
        submittedBy: user.id,
        submitterRole: (user.role || 'student') as 'student' | 'admin',
        v2Practice: formData,
        v2Version: 'v2',
      };

      if (myEntry) {
        const preserveFields = [
          'gameOverview',
          'period1',
          'period2',
          'period3',
          'overtime',
          'shootout',
          'postGame',
          'preGame',
          'v2PreGame',
          'v2Periods',
          'v2PostGame',
        ] as const;
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

      await chartingService.updateSession(sessionId, { status: 'completed' });

      toast.success('Practice chart saved!');
      router.push(`/charting/sessions/${sessionId}`);
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save practice chart');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <SkeletonContentPage />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-zinc-600">Session not found</p>
          <Button variant="outline" onClick={() => router.push('/charting')}>
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  const totalIndexItems = formData.practiceIndex.length;
  const totalWorkedOn = formData.indexItemsWorkedOn.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-200/60">
        <div className="flex items-center justify-between px-4 md:px-6 h-14 md:h-16 max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => router.push(`/charting/sessions/${sessionId}`)}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-base md:text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 bg-clip-text text-transparent">
            Practice Chart
          </h1>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 md:px-4 h-9 text-xs md:text-sm font-semibold"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Intro */}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900">
            New Practice Revolution
          </h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
            The game identifies what needs work. You decide where to spend your minutes.
            Every practice is intentional.
          </p>
        </div>

        {/* ── Practice Index Dashboard ───────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 space-y-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-zinc-900">Practice Index</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Your priority list heading into practice. Select what you worked on today.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-500 bg-slate-50 rounded-full px-3 py-1.5">
              <Clock className="w-3.5 h-3.5" />
              20 min → pick 2 · 60 min → pick 5
            </div>
          </div>

          {totalIndexItems === 0 && (
            <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3 flex gap-2.5 text-xs text-zinc-700">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Auto-generation from your last game is coming soon. For now, add items
                manually in any category below. Items you select will feed into the
                improvement ratings further down.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const items = groupedIndex[cat.key];
              return (
                <div
                  key={cat.key}
                  className={`rounded-xl border ${cat.ring} p-3 md:p-4 flex flex-col gap-3 min-h-[200px]`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${cat.accent}`} />
                    <p className={`text-xs font-bold uppercase tracking-wider ${cat.accent}`}>
                      {cat.label}
                    </p>
                    {items.length > 0 && (
                      <span
                        className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.chip}`}
                      >
                        {items.length}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed -mt-1">
                    {cat.description}
                  </p>

                  {/* Items */}
                  <div className="space-y-1.5 flex-1">
                    {items.length === 0 ? (
                      <p className="text-[11px] text-zinc-400 italic">No items yet.</p>
                    ) : (
                      items.map((item) => {
                        const isSelected = formData.indexItemsWorkedOn.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`group flex items-start gap-2 rounded-lg border px-2.5 py-2 transition-colors ${
                              isSelected
                                ? 'border-blue-400 bg-white ring-1 ring-blue-200'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleWorkedOn(item.id)}
                              className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-300 bg-white hover:border-blue-400'
                              }`}
                              aria-label={
                                isSelected ? 'Deselect item' : 'Mark as worked on'
                              }
                            >
                              {isSelected && (
                                <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleWorkedOn(item.id)}
                              className="flex-1 text-left text-xs font-medium text-zinc-800 leading-snug"
                            >
                              {item.label}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeIndexItem(item.id)}
                              className="flex-shrink-0 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              aria-label="Remove item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add draft */}
                  <div className="flex gap-1.5 pt-1 border-t border-gray-100">
                    <input
                      type="text"
                      value={draftLabel[cat.key]}
                      onChange={(e) =>
                        setDraftLabel((prev) => ({ ...prev, [cat.key]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addIndexItem(cat.key);
                        }
                      }}
                      placeholder="Add item…"
                      className="flex-1 min-w-0 text-xs bg-white border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => addIndexItem(cat.key)}
                      disabled={!draftLabel[cat.key].trim()}
                      className="flex-shrink-0 w-7 h-7 rounded-md bg-blue-500 text-white flex items-center justify-center disabled:bg-gray-200 disabled:text-gray-400 hover:bg-blue-600 transition-colors"
                      aria-label="Add item"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalIndexItems > 0 && (
            <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
              <span className="text-zinc-600">
                <span className="font-bold text-zinc-900">{totalWorkedOn}</span> of{' '}
                <span className="font-bold text-zinc-900">{totalIndexItems}</span> items
                selected for today&apos;s session
              </span>
              <span className="text-zinc-400">#3 · Index items worked on</span>
            </div>
          )}
        </section>

        {/* ── Core Fields ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* #1 Practice Value Rating */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2 block">
              #1 · Practice Value
            </span>
            <ContextualHelp
              label="How much of this practice developed you?"
              helpText="1 = Wasted time, no designated training. 3 = Some value. 5 = Highly productive, designated training, intentional work. Tracked over time this reveals practice-format patterns."
            >
              <RotatingNumberSelector
                value={formData.practiceValueRating}
                onChange={(v) => update('practiceValueRating', v as number)}
                options={PRACTICE_VALUE_OPTIONS}
              />
            </ContextualHelp>
          </div>

          {/* #2 Designated Training */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              #2 · Designated Training
            </span>
            <ContextualHelp
              label="Did you get designated goalie training?"
              helpText="Did you get designated goalie training time today? If yes, log the duration in 5-minute increments. This data is the organizational pitch proof point."
            >
              <YesNoToggle
                value={formData.designatedTrainingReceived}
                onChange={(v) => {
                  update('designatedTrainingReceived', v);
                  if (!v) update('designatedTrainingDuration', undefined);
                }}
              />
            </ContextualHelp>

            {formData.designatedTrainingReceived && (
              <div className="pt-2 border-t border-gray-100 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <p className="text-xs font-semibold text-zinc-700">
                  How long? (5-minute increments)
                </p>
                <RotatingNumberSelector
                  value={formData.designatedTrainingDuration ?? 15}
                  onChange={(v) => update('designatedTrainingDuration', v as number)}
                  options={DURATION_OPTIONS}
                />
              </div>
            )}
          </div>

          {/* #4 Video Captured */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              #4 · Video
            </span>
            <ContextualHelp
              label="Was your practice filmed today?"
              helpText="If yes, mentor-review subscribers can upload footage for review. Standard subscribers see an upgrade prompt."
            >
              <YesNoToggle
                value={formData.videoCaptured}
                onChange={(v) => update('videoCaptured', v)}
              />
            </ContextualHelp>

            {formData.videoCaptured && (
              <div className="pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-2 rounded-lg bg-blue-50/60 border border-blue-100 px-3 py-2 text-xs text-blue-800">
                  <Video className="w-3.5 h-3.5" />
                  Upload flow for mentor review coming soon.
                </div>
              </div>
            )}
          </div>

          {/* #7 Technical Eye */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2 block">
              #7 · Technical Eye
            </span>
            <ContextualHelp
              label="How clearly did you see your own performance?"
              helpText="1 = Could not evaluate objectively. 3 = Saw some things clearly. 5 = Saw everything clearly — know exactly what happened and why. This is your Technical Eye developing, tracked as a MLI milestone."
            >
              <RotatingNumberSelector
                value={formData.technicalEyeDevelopmentRating}
                onChange={(v) => update('technicalEyeDevelopmentRating', v as number)}
                options={TECHNICAL_EYE_OPTIONS}
              />
            </ContextualHelp>
          </div>
        </div>

        {/* ── #5 Improvement Ratings ────────────────────────────────────── */}
        {workedOnItems.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">
                  #5 · Did it improve?
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Rate each item you worked on. Improving → Refinement. Owned →
                  Maintenance. Stuck → stays Immediate Development.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {workedOnItems.map((item) => {
                const rating =
                  formData.improvementRatings.find((r) => r.itemId === item.id)?.rating ?? 3;
                const catMeta = CATEGORIES.find((c) => c.key === item.category)!;
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200 bg-slate-50/40 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${catMeta.chip}`}
                      >
                        {catMeta.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 leading-snug">
                      {item.label}
                    </p>
                    <RotatingNumberSelector
                      value={rating}
                      onChange={(v) => setImprovement(item.id, v as number)}
                      options={IMPROVEMENT_OPTIONS}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── #6 Mind Vault ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">#6 · One thing for the Mind Vault</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                What did you confirm or discover today that belongs in your Mind Vault?
                Every practice adds something.
              </p>
            </div>
          </div>
          <VoiceRecorder
            onTranscriptionComplete={(text) => update('mindVaultEntry', text)}
            initialText={formData.mindVaultEntry}
            placeholder="Tap to record one thing worth keeping..."
          />
        </section>

        {/* ── Bottom save bar ────────────────────────────────────────────── */}
        <div className="pt-2 pb-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto h-11 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 px-8"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Practice Chart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
