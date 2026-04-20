'use client';

import {
  ChartingEntry,
  Session,
  V2PreGameData,
  V2PeriodData,
  V2PostGameData,
  V2PracticeChartEntry,
  MindManagementStartTime,
  PracticeIndexCategory,
} from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Timer,
  BarChart3,
  MessageSquare,
  ClipboardList,
  Flame,
  Sparkles,
  ShieldCheck,
  Brain,
  Eye,
  Video,
  CheckCircle2,
  XCircle,
  Target,
  Mic,
} from 'lucide-react';

// ─── Extended type that carries v2 fields (stored flatly on ChartingEntry) ──
type V2Fields = {
  v2PreGame?: V2PreGameData;
  v2Periods?: {
    period1?: V2PeriodData;
    period2?: V2PeriodData;
    period3?: V2PeriodData;
    overtime?: V2PeriodData;
  };
  v2PostGame?: V2PostGameData;
  v2Practice?: Omit<
    V2PracticeChartEntry,
    'id' | 'sessionId' | 'studentId' | 'version' | 'createdAt' | 'updatedAt'
  >;
};

// ─── Label maps ──────────────────────────────────────────────────────────────
const START_TIME_LABELS: Record<MindManagementStartTime, string> = {
  at_the_rink: 'At the rink',
  '1_hour_before': '1 hour before',
  '2_hours_before': '2 hours before',
  '3_plus_hours_before': '3+ hours before',
  wake_up_thinking: 'Wake up thinking about it',
};

const CATEGORY_META: Record<
  PracticeIndexCategory,
  { label: string; chip: string; icon: React.ComponentType<{ className?: string }> }
> = {
  immediate_development: {
    label: 'Immediate Development',
    chip: 'bg-red-100 text-red-700',
    icon: Flame,
  },
  refinement: {
    label: 'Refinement',
    chip: 'bg-blue-100 text-blue-700',
    icon: Sparkles,
  },
  maintenance: {
    label: 'Maintenance',
    chip: 'bg-slate-100 text-slate-700',
    icon: ShieldCheck,
  },
};

// ─── Small primitives ───────────────────────────────────────────────────────
function Stat({ label, value, suffix }: { label: string; value: React.ReactNode; suffix?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
        {value}
        {suffix && <span className="text-sm font-medium text-slate-500 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

function YesNoLine({
  label,
  value,
  voice,
}: {
  label: string;
  value: boolean;
  voice?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">{label}</p>
        {voice && (
          <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-slate-50 border border-slate-100 px-2.5 py-1.5">
            <Mic className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">{voice}</p>
          </div>
        )}
      </div>
      {value ? (
        <Badge className="bg-blue-500 hover:bg-blue-500 text-white flex-shrink-0">Yes</Badge>
      ) : (
        <Badge variant="secondary" className="bg-slate-200 text-slate-700 flex-shrink-0">
          No
        </Badge>
      )}
    </div>
  );
}

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-700 tabular-nums w-8 text-right">
        {value}/{max}
      </span>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="p-8 text-center border-dashed bg-slate-50/50">
      <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
      <p className="text-sm text-slate-500">{message}</p>
    </Card>
  );
}

// ─── Section renderers ──────────────────────────────────────────────────────

function PreGameSection({ data }: { data: V2PreGameData }) {
  return (
    <Card className="p-4 md:p-6">
      <SectionHeader icon={Timer} title="Pre-Game · Mind Management" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Personal Start Time
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {START_TIME_LABELS[data.personalStartTime] ?? data.personalStartTime}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Mental State
          </p>
          <RatingBar value={data.mentalStateRating} />
          {data.mentalStateVoiceNote && (
            <p className="mt-2 text-xs text-slate-600 italic">&ldquo;{data.mentalStateVoiceNote}&rdquo;</p>
          )}
        </div>
        <div className="md:col-span-2 rounded-lg bg-white border border-slate-200 p-3">
          <YesNoLine
            label="Routine completed"
            value={data.routineCompleted}
            voice={data.routineVoiceNote}
          />
          <YesNoLine
            label="Anxiety present"
            value={data.anxietyPresent}
            voice={data.anxietyVoiceNote}
          />
          <YesNoLine
            label="Target state achieved"
            value={data.targetStateAchieved}
            voice={data.targetStateVoiceNote}
          />
        </div>
      </div>
    </Card>
  );
}

function PeriodsSection({
  periods,
}: {
  periods: NonNullable<V2Fields['v2Periods']>;
}) {
  const labels: Array<[keyof typeof periods, string]> = [
    ['period1', 'Period 1'],
    ['period2', 'Period 2'],
    ['period3', 'Period 3'],
    ['overtime', 'Overtime'],
  ];

  const filled = labels.filter(([key]) => !!periods[key]);
  if (filled.length === 0) return null;

  return (
    <Card className="p-4 md:p-6">
      <SectionHeader icon={BarChart3} title="Periods" subtitle="Post-game, charted from memory" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {filled.map(([key, label]) => {
          const p = periods[key]!;
          return (
            <div
              key={key}
              className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5"
            >
              <p className="text-sm font-bold text-slate-900">{label}</p>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Mind Control
                </p>
                <RatingBar value={p.mindControlRating} />
                {p.mindControlVoiceNote && (
                  <p className="mt-1 text-[11px] text-slate-500 italic line-clamp-2">
                    &ldquo;{p.mindControlVoiceNote}&rdquo;
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Factor Ratio
                </p>
                <RatingBar value={p.periodFactorRatio} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-md bg-red-50 border border-red-100 px-2 py-1.5 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-red-600">
                    Against
                  </p>
                  <p className="text-lg font-bold text-red-700 tabular-nums">{p.goalsAgainst}</p>
                </div>
                <div className="rounded-md bg-emerald-50 border border-emerald-100 px-2 py-1.5 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                    Good
                  </p>
                  <p className="text-lg font-bold text-emerald-700 tabular-nums">
                    {p.goals?.filter((g) => g.isGoodGoal).length ?? 0}
                  </p>
                </div>
              </div>
              {p.goals && p.goals.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  {p.goals.map((g) => (
                    <div key={g.goalNumber} className="flex items-start gap-1.5 text-[11px]">
                      {g.isGoodGoal ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700">
                          Goal {g.goalNumber} · {g.isGoodGoal ? 'Good' : 'Bad'}
                        </p>
                        {g.voiceNote && (
                          <p className="text-slate-500 italic line-clamp-1">
                            &ldquo;{g.voiceNote}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PostGameSection({ data }: { data: V2PostGameData }) {
  return (
    <Card className="p-4 md:p-6">
      <SectionHeader icon={MessageSquare} title="Post-Game Review" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Stat label="Good Goals" value={data.goodGoalCount} />
        <Stat label="Bad Goals" value={data.badGoalCount} />
        <Stat
          label="Good Decision %"
          value={`${(data.goodDecisionRate ?? 0).toFixed(0)}`}
          suffix="%"
        />
        <Stat
          label="Mind Control Avg"
          value={(data.mindControlAverage ?? 0).toFixed(1)}
          suffix="/ 5"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Overall Game Factor
          </p>
          <RatingBar value={data.overallGameFactorRating} />
          {data.overallGameFactorVoiceNote && (
            <p className="mt-2 text-xs text-slate-600 italic">
              &ldquo;{data.overallGameFactorVoiceNote}&rdquo;
            </p>
          )}
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Game Retention
          </p>
          <RatingBar value={data.gameRetentionRating} />
          {data.gameRetentionVoiceNote && (
            <p className="mt-2 text-xs text-slate-600 italic">
              &ldquo;{data.gameRetentionVoiceNote}&rdquo;
            </p>
          )}
        </div>
        {data.overallFeeling && (
          <div className="md:col-span-2 rounded-lg bg-white border border-slate-200 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Overall Feeling
            </p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {data.overallFeeling}
            </p>
          </div>
        )}
        {data.mindVaultEntry && (
          <div className="md:col-span-2 rounded-lg bg-blue-50/60 border border-blue-100 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Brain className="w-3.5 h-3.5 text-blue-600" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Mind Vault
              </p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {data.mindVaultEntry}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function PracticeSection({
  data,
}: {
  data: NonNullable<V2Fields['v2Practice']>;
}) {
  const workedOnItems = data.practiceIndex?.filter((i) =>
    data.indexItemsWorkedOn?.includes(i.id)
  );

  return (
    <Card className="p-4 md:p-6 space-y-5">
      <SectionHeader
        icon={Target}
        title="Practice Chart"
        subtitle="Index-driven reflection · New Practice Revolution"
      />

      {/* Core ratings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Practice Value"
          value={data.practiceValueRating ?? '—'}
          suffix="/ 5"
        />
        <Stat
          label="Technical Eye"
          value={data.technicalEyeDevelopmentRating ?? '—'}
          suffix="/ 5"
        />
        <Stat
          label="Designated Training"
          value={
            data.designatedTrainingReceived
              ? data.designatedTrainingDuration
                ? `${data.designatedTrainingDuration}`
                : 'Yes'
              : 'No'
          }
          suffix={data.designatedTrainingReceived && data.designatedTrainingDuration ? 'min' : undefined}
        />
        <Stat
          label="Video Captured"
          value={data.videoCaptured ? 'Yes' : 'No'}
        />
      </div>

      {/* Index items */}
      {data.practiceIndex && data.practiceIndex.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Practice Index
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {(['immediate_development', 'refinement', 'maintenance'] as PracticeIndexCategory[]).map(
              (cat) => {
                const items = data.practiceIndex.filter((i) => i.category === cat);
                if (items.length === 0) return null;
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                return (
                  <div
                    key={cat}
                    className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-slate-600" />
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.chip}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    {items.map((item) => {
                      const worked = data.indexItemsWorkedOn?.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-start gap-1.5 text-xs leading-snug ${
                            worked ? 'text-slate-900 font-medium' : 'text-slate-500'
                          }`}
                        >
                          {worked ? (
                            <CheckCircle2 className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <span className="w-3 h-3 rounded border border-slate-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Improvement ratings */}
      {workedOnItems && workedOnItems.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Did it improve?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {workedOnItems.map((item) => {
              const rating =
                data.improvementRatings?.find((r) => r.itemId === item.id)?.rating ?? 0;
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-200 bg-white p-2.5"
                >
                  <p className="text-xs font-medium text-slate-800 mb-1.5 line-clamp-1">
                    {item.label}
                  </p>
                  <RatingBar value={rating} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mind Vault entry */}
      {data.mindVaultEntry && (
        <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Mind Vault
            </p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {data.mindVaultEntry}
          </p>
        </div>
      )}

      {/* Video note */}
      {data.videoCaptured && (
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600">
          <Video className="w-3.5 h-3.5 text-slate-500" />
          Practice was filmed{data.videoUrl ? ' · Video uploaded' : ' · Upload pending'}
        </div>
      )}
    </Card>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface V2ChartReadOnlyViewProps {
  entry: ChartingEntry;
  session: Session;
}

export function V2ChartReadOnlyView({ entry, session }: V2ChartReadOnlyViewProps) {
  const v2 = entry as unknown as ChartingEntry & V2Fields;
  const hasV2 =
    !!v2.v2PreGame || !!v2.v2Periods || !!v2.v2PostGame || !!v2.v2Practice;

  if (!hasV2) {
    return (
      <EmptyState message="No v2 chart data was submitted for this session yet." />
    );
  }

  return (
    <div className="space-y-4">
      {session.type === 'practice' ? (
        v2.v2Practice ? (
          <PracticeSection data={v2.v2Practice} />
        ) : (
          <EmptyState message="No practice chart submitted for this session." />
        )
      ) : (
        <>
          {v2.v2PreGame && <PreGameSection data={v2.v2PreGame} />}
          {v2.v2Periods && <PeriodsSection periods={v2.v2Periods} />}
          {v2.v2PostGame && <PostGameSection data={v2.v2PostGame} />}
        </>
      )}
    </div>
  );
}
