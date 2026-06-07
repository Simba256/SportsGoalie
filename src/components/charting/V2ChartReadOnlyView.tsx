'use client';

import {
  ChartingEntry, Session,
  V2PreGameData, V2PeriodData, V2PostGameData, V2PracticeChartEntry,
  MindManagementStartTime, PracticeIndexCategory,
} from '@/types';
import {
  Timer, BarChart3, MessageSquare, ClipboardList,
  Flame, Sparkles, ShieldCheck, Brain, Eye, Video,
  CheckCircle2, XCircle, Target, Mic,
} from 'lucide-react';

const BLUE = '#37b5ff';
const PURPLE = '#a78bfa';

type V2Fields = {
  v2PreGame?: V2PreGameData;
  v2Periods?: { period1?: V2PeriodData; period2?: V2PeriodData; period3?: V2PeriodData; overtime?: V2PeriodData };
  v2PostGame?: V2PostGameData;
  v2Practice?: Omit<V2PracticeChartEntry, 'id' | 'sessionId' | 'studentId' | 'version' | 'createdAt' | 'updatedAt'>;
};

const START_TIME_LABELS: Record<MindManagementStartTime, string> = {
  at_the_rink: 'At the rink',
  '1_hour_before': '1 hour before',
  '2_hours_before': '2 hours before',
  '3_plus_hours_before': '3+ hours before',
  wake_up_thinking: 'Wake up thinking about it',
};

const CATEGORY_META: Record<PracticeIndexCategory, { label: string; color: string; icon: React.ComponentType<{ size?: number; color?: string }> }> = {
  immediate_development: { label: 'Immediate Development', color: '#f87171', icon: Flame },
  refinement: { label: 'Refinement', color: BLUE, icon: Sparkles },
  maintenance: { label: 'Maintenance', color: 'rgba(255,255,255,0.5)', icon: ShieldCheck },
};

/* ── Primitives ── */

function Stat({ label, value, suffix }: { label: string; value: React.ReactNode; suffix?: string }) {
  return (
    <div style={{ borderRadius: '10px', background: 'rgba(55,181,255,0.05)', border: '1px solid rgba(55,181,255,0.12)', padding: '12px' }}>
      <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
        {value}
        {suffix && <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>{suffix}</span>}
      </p>
    </div>
  );
}

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const barColor = pct >= 70 ? '#4ade80' : pct >= 40 ? BLUE : '#fb923c';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: '99px', width: `${pct}%`, background: barColor, boxShadow: `0 0 6px ${barColor}66`, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', minWidth: '28px', textAlign: 'right' }}>{value}/{max}</span>
    </div>
  );
}

function YesNoLine({ label, value, voice }: { label: string; value: boolean; voice?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{label}</p>
        {voice && (
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'flex-start', gap: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '7px 10px' }}>
            <Mic size={11} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{voice}</p>
          </div>
        )}
      </div>
      <span style={{
        flexShrink: 0, fontSize: '10px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase',
        padding: '3px 10px', borderRadius: '20px',
        color: value ? '#4ade80' : 'rgba(255,255,255,0.4)',
        background: value ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.06)',
        border: value ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(255,255,255,0.1)',
      }}>
        {value ? 'Yes' : 'No'}
      </span>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ size?: number; color?: string }>; title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${BLUE}15`, border: `1px solid ${BLUE}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color={BLUE} />
      </div>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '10px' }}>
      <ClipboardList size={28} color="rgba(255,255,255,0.12)" style={{ margin: '0 auto 8px' }} />
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{message}</p>
    </div>
  );
}

/* ── Section renderers ── */

function PreGameSection({ data }: { data: V2PreGameData }) {
  return (
    <div style={{ background: 'rgba(2,18,44,0.6)', border: '1px solid rgba(55,181,255,0.12)', borderRadius: '14px', padding: '16px' }}>
      <SectionHeader icon={Timer} title="Pre-Game · Mind Management" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div style={{ borderRadius: '10px', background: 'rgba(55,181,255,0.05)', border: '1px solid rgba(55,181,255,0.12)', padding: '12px' }}>
          <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>Personal Start Time</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{START_TIME_LABELS[data.personalStartTime] ?? data.personalStartTime}</p>
        </div>
        <div style={{ borderRadius: '10px', background: 'rgba(55,181,255,0.05)', border: '1px solid rgba(55,181,255,0.12)', padding: '12px' }}>
          <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>Mental State</p>
          <RatingBar value={data.mentalStateRating} />
          {data.mentalStateVoiceNote && <p style={{ marginTop: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>&ldquo;{data.mentalStateVoiceNote}&rdquo;</p>}
        </div>
      </div>
      <div style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '4px 12px' }}>
        <YesNoLine label="Routine completed" value={data.routineCompleted} voice={data.routineVoiceNote} />
        <YesNoLine label="Anxiety present" value={data.anxietyPresent} voice={data.anxietyVoiceNote} />
        <div style={{ borderBottom: 'none' }}>
          <YesNoLine label="Target state achieved" value={data.targetStateAchieved} voice={data.targetStateVoiceNote} />
        </div>
      </div>
    </div>
  );
}

function PeriodsSection({ periods }: { periods: NonNullable<V2Fields['v2Periods']> }) {
  const labels: Array<[keyof typeof periods, string]> = [['period1', 'P1'], ['period2', 'P2'], ['period3', 'P3'], ['overtime', 'OT']];
  const filled = labels.filter(([key]) => !!periods[key]);
  if (filled.length === 0) return null;

  return (
    <div style={{ background: 'rgba(2,18,44,0.6)', border: '1px solid rgba(55,181,255,0.12)', borderRadius: '14px', padding: '16px' }}>
      <SectionHeader icon={BarChart3} title="Periods" subtitle="Post-game, charted from memory" />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${filled.length}, 1fr)`, gap: '8px' }}>
        {filled.map(([key, label]) => {
          const p = periods[key]!;
          const goalsAgainst = p.goalsAgainst ?? 0;
          const goodGoals = p.goals?.filter(g => g.isGoodGoal).length ?? 0;
          return (
            <div key={key} style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(55,181,255,0.1)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{label}</p>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', marginBottom: '5px' }}>Mind Control</p>
                <RatingBar value={p.mindControlRating} />
                {p.mindControlVoiceNote && <p style={{ marginTop: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>&ldquo;{p.mindControlVoiceNote}&rdquo;</p>}
              </div>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', marginBottom: '5px' }}>Factor Ratio</p>
                <RatingBar value={p.periodFactorRatio} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', padding: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#f87171', marginBottom: '3px' }}>Against</p>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#f87171' }}>{goalsAgainst}</p>
                </div>
                <div style={{ borderRadius: '8px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', padding: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#4ade80', marginBottom: '3px' }}>Good</p>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#4ade80' }}>{goodGoals}</p>
                </div>
              </div>
              {p.goals && p.goals.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                  {p.goals.map((g) => (
                    <div key={g.goalNumber} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      {g.isGoodGoal
                        ? <CheckCircle2 size={12} color="#4ade80" style={{ flexShrink: 0, marginTop: '1px' }} />
                        : <XCircle size={12} color="#f87171" style={{ flexShrink: 0, marginTop: '1px' }} />}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>Goal {g.goalNumber} · {g.isGoodGoal ? 'Good' : 'Bad'}</p>
                        {g.voiceNote && <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>&ldquo;{g.voiceNote}&rdquo;</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostGameSection({ data }: { data: V2PostGameData }) {
  return (
    <div style={{ background: 'rgba(2,18,44,0.6)', border: '1px solid rgba(55,181,255,0.12)', borderRadius: '14px', padding: '16px' }}>
      <SectionHeader icon={MessageSquare} title="Post-Game Review" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
        <Stat label="Good Goals" value={data.goodGoalCount} />
        <Stat label="Bad Goals" value={data.badGoalCount} />
        <Stat label="Good Decision %" value={`${(data.goodDecisionRate ?? 0).toFixed(0)}`} suffix="%" />
        <Stat label="Mind Control Avg" value={(data.mindControlAverage ?? 0).toFixed(1)} suffix="/ 5" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ borderRadius: '10px', background: 'rgba(55,181,255,0.05)', border: '1px solid rgba(55,181,255,0.12)', padding: '12px' }}>
          <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>Overall Game Factor</p>
          <RatingBar value={data.overallGameFactorRating} />
          {data.overallGameFactorVoiceNote && <p style={{ marginTop: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>&ldquo;{data.overallGameFactorVoiceNote}&rdquo;</p>}
        </div>
        <div style={{ borderRadius: '10px', background: 'rgba(55,181,255,0.05)', border: '1px solid rgba(55,181,255,0.12)', padding: '12px' }}>
          <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>Game Retention</p>
          <RatingBar value={data.gameRetentionRating} />
          {data.gameRetentionVoiceNote && <p style={{ marginTop: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>&ldquo;{data.gameRetentionVoiceNote}&rdquo;</p>}
        </div>
        {data.overallFeeling && (
          <div style={{ gridColumn: '1 / -1', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '12px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>Overall Feeling</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.overallFeeling}</p>
          </div>
        )}
        {data.mindVaultEntry && (
          <div style={{ gridColumn: '1 / -1', borderRadius: '10px', background: `${PURPLE}0a`, border: `1px solid ${PURPLE}25`, padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Brain size={13} color={PURPLE} />
              <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: PURPLE }}>Mind Vault</p>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.mindVaultEntry}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PracticeSection({ data }: { data: NonNullable<V2Fields['v2Practice']> }) {
  const workedOnItems = data.practiceIndex?.filter(i => data.indexItemsWorkedOn?.includes(i.id));

  return (
    <div style={{ background: 'rgba(2,18,44,0.6)', border: '1px solid rgba(55,181,255,0.12)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionHeader icon={Target} title="Practice Chart" subtitle="Index-driven reflection · New Practice Revolution" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        <Stat label="Practice Value" value={data.practiceValueRating ?? '—'} suffix="/ 5" />
        <Stat label="Technical Eye" value={data.technicalEyeDevelopmentRating ?? '—'} suffix="/ 5" />
        <Stat label="Designated Training"
          value={data.designatedTrainingReceived ? (data.designatedTrainingDuration ? `${data.designatedTrainingDuration}` : 'Yes') : 'No'}
          suffix={data.designatedTrainingReceived && data.designatedTrainingDuration ? 'min' : undefined}
        />
        <Stat label="Video Captured" value={data.videoCaptured ? 'Yes' : 'No'} />
      </div>

      {data.practiceIndex && data.practiceIndex.length > 0 && (
        <div>
          <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>Practice Index</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {(['immediate_development', 'refinement', 'maintenance'] as PracticeIndexCategory[]).map(cat => {
              const items = data.practiceIndex.filter(i => i.category === cat);
              if (items.length === 0) return null;
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              return (
                <div key={cat} style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${meta.color}25`, padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <Icon size={12} color={meta.color} />
                    <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: meta.color }}>{meta.label}</span>
                  </div>
                  {items.map(item => {
                    const worked = data.indexItemsWorkedOn?.includes(item.id);
                    return (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        {worked
                          ? <CheckCircle2 size={11} color={BLUE} style={{ flexShrink: 0, marginTop: '1px' }} />
                          : <span style={{ width: '11px', height: '11px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, marginTop: '1px', display: 'inline-block' }} />}
                        <span style={{ fontSize: '11px', color: worked ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)', fontWeight: worked ? 600 : 400, lineHeight: 1.4 }}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {workedOnItems && workedOnItems.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Eye size={12} color={BLUE} />
            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.35)' }}>Did it improve?</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {workedOnItems.map(item => {
              const rating = data.improvementRatings?.find(r => r.itemId === item.id)?.rating ?? 0;
              return (
                <div key={item.id} style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '10px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</p>
                  <RatingBar value={rating} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.mindVaultEntry && (
        <div style={{ borderRadius: '10px', background: `${PURPLE}0a`, border: `1px solid ${PURPLE}25`, padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Brain size={13} color={PURPLE} />
            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: PURPLE }}>Mind Vault</p>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.mindVaultEntry}</p>
        </div>
      )}

      {data.videoCaptured && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '10px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
          <Video size={13} color="rgba(255,255,255,0.3)" />
          Practice was filmed{data.videoUrl ? ' · Video uploaded' : ' · Upload pending'}
        </div>
      )}
    </div>
  );
}

/* ── Main ── */

interface V2ChartReadOnlyViewProps { entry: ChartingEntry; session: Session }

export function V2ChartReadOnlyView({ entry, session }: V2ChartReadOnlyViewProps) {
  const v2 = entry as unknown as ChartingEntry & V2Fields;
  const hasV2 = !!v2.v2PreGame || !!v2.v2Periods || !!v2.v2PostGame || !!v2.v2Practice;

  if (!hasV2) return <EmptyState message="No v2 chart data was submitted for this session yet." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {session.type === 'practice' ? (
        v2.v2Practice
          ? <PracticeSection data={v2.v2Practice} />
          : <EmptyState message="No practice chart submitted for this session." />
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
