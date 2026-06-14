'use client';

import { ParentCrossReferenceView, PerceptionComparison } from '@/types';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, HelpCircle, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

const BLUE   = '#37b5ff';
const GREEN  = '#4ade80';
const YELLOW = '#fbbf24';
const RED    = '#f87171';

// ─── helpers ────────────────────────────────────────────────────────────────

function accentFor(level: string) {
  if (level === 'aligned')         return GREEN;
  if (level === 'minor_gap')       return YELLOW;
  if (level === 'significant_gap') return RED;
  return 'rgba(255,255,255,0.3)';
}

function labelFor(level: string) {
  if (level === 'aligned')         return 'Aligned';
  if (level === 'minor_gap')       return 'Minor Gap';
  if (level === 'significant_gap') return 'Gap Found';
  return 'Unknown';
}

function scoreWord(score: number | undefined): string {
  if (score === undefined) return '—';
  if (score < 1.8) return 'Low';
  if (score < 2.4) return 'Below Average';
  if (score < 3.0) return 'Average';
  if (score < 3.6) return 'Good';
  return 'High';
}

function scoreColor(score: number | undefined): string {
  if (score === undefined) return 'rgba(255,255,255,0.3)';
  if (score < 1.8) return RED;
  if (score < 2.4) return YELLOW;
  if (score < 3.0) return 'rgba(255,255,255,0.6)';
  if (score < 3.6) return GREEN;
  return '#34d399';
}

function gapSummary(comparison: PerceptionComparison): string {
  const diff = comparison.scoreDifference ?? 0;
  if (diff < 0.3) return 'You both see this the same way.';
  const parentHigh = (comparison.parentScore ?? 0) > (comparison.goalieScore ?? 0);
  if (parentHigh) {
    return `You see this more positively than your goalie does (${diff.toFixed(1)} pt difference).`;
  }
  return `Your goalie feels more confident here than you realise (${diff.toFixed(1)} pt difference).`;
}

// ─── main card ──────────────────────────────────────────────────────────────

function ComparisonCard({ c }: { c: PerceptionComparison }) {
  const accent = accentFor(c.alignmentLevel);
  const isGap  = c.alignmentLevel !== 'aligned';

  return (
    <div style={{
      background: 'rgba(8, 24, 52, 0.95)',
      border: `1px solid ${accent}25`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: '14px',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {c.alignmentLevel === 'aligned'         && <CheckCircle2 size={15} color={GREEN} />}
          {c.alignmentLevel === 'minor_gap'       && <AlertTriangle size={15} color={YELLOW} />}
          {c.alignmentLevel === 'significant_gap' && <AlertCircle size={15} color={RED} />}
          <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff' }}>{c.categoryName}</span>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: 700,
          color: accent,
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          borderRadius: '20px',
          padding: '3px 11px',
          whiteSpace: 'nowrap',
        }}>
          {labelFor(c.alignmentLevel)}
        </span>
      </div>

      {/* Two-row comparison — the key simplification */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Goalie row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            Your goalie says:
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: 800,
            color: scoreColor(c.goalieScore),
            background: `${scoreColor(c.goalieScore)}12`,
            border: `1px solid ${scoreColor(c.goalieScore)}30`,
            borderRadius: '8px',
            padding: '4px 12px',
          }}>
            {scoreWord(c.goalieScore)}
          </span>
        </div>

        {/* Parent row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            You say:
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: 800,
            color: scoreColor(c.parentScore),
            background: `${scoreColor(c.parentScore)}12`,
            border: `1px solid ${scoreColor(c.parentScore)}30`,
            borderRadius: '8px',
            padding: '4px 12px',
          }}>
            {scoreWord(c.parentScore)}
          </span>
        </div>
      </div>

      {/* Plain-English gap sentence */}
      <p style={{ fontSize: '13px', color: isGap ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: 0 }}>
        {gapSummary(c)}
      </p>

      {/* Recommendation — only shown when there is a gap */}
      {isGap && c.recommendation && (
        <div style={{
          background: `${accent}08`,
          border: `1px solid ${accent}20`,
          borderRadius: '10px',
          padding: '12px 14px',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: accent, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Suggested action
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
            {c.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── main export ─────────────────────────────────────────────────────────────

export function CrossReferenceDisplay({ data }: CrossReferenceDisplayProps) {

  if (!data.parentAssessmentComplete) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${BLUE}15`, border: `1px solid ${BLUE}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HelpCircle size={26} color={BLUE} />
        </div>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '16px', margin: 0 }}>Complete Your Assessment</h3>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', maxWidth: '360px', lineHeight: 1.7, margin: 0 }}>
          Complete your parent assessment to see how your perceptions compare with your goalie&apos;s self-assessment.
        </p>
        <Link href="/onboarding?role=parent" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, color: '#000f28', padding: '11px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '13px', boxShadow: `0 4px 16px ${BLUE}40` }}>
          <ClipboardCheck size={14} /> Take Parent Assessment
        </Link>
      </div>
    );
  }

  if (!data.goalieAssessmentComplete) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Info size={26} color={YELLOW} />
        </div>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '16px', margin: 0 }}>Waiting for Goalie Assessment</h3>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', maxWidth: '360px', lineHeight: 1.7, margin: 0 }}>
          Your goalie hasn&apos;t completed their self-assessment yet. Once they do, you&apos;ll be able to see how your perceptions compare.
        </p>
      </div>
    );
  }

  const alignedCount = data.comparisons.filter(c => c.alignmentLevel === 'aligned').length;
  const gapCount     = data.comparisons.filter(c => c.alignmentLevel !== 'aligned').length;

  const sorted = [
    ...data.comparisons.filter(c => c.alignmentLevel === 'significant_gap'),
    ...data.comparisons.filter(c => c.alignmentLevel === 'minor_gap'),
    ...data.comparisons.filter(c => c.alignmentLevel === 'aligned'),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Summary ── */}
      <div style={{ background: 'rgba(55,181,255,0.05)', border: '1px solid rgba(55,181,255,0.15)', borderRadius: '16px', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '16px', margin: '0 0 3px' }}>Perception Check</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
              How your view compares to {data.childName}&apos;s across {data.comparisons.length} topics
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '34px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{data.overallAlignmentScore}%</span>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '2px 0 0' }}>in sync</p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '99px', width: `${data.overallAlignmentScore}%`, background: `linear-gradient(90deg, ${BLUE}, #0ea5e9)` }} />
        </div>

        {/* Counts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.18)' }}>
            <p style={{ fontSize: '26px', fontWeight: 900, color: GREEN, margin: 0, lineHeight: 1 }}>{alignedCount}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Seeing eye-to-eye</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)' }}>
            <p style={{ fontSize: '26px', fontWeight: 900, color: YELLOW, margin: 0, lineHeight: 1 }}>{gapCount}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Worth a conversation</p>
          </div>
        </div>
      </div>

      {/* ── Cards ── */}
      {sorted.map((c) => (
        <ComparisonCard key={c.categorySlug} c={c} />
      ))}

      <p style={{ fontSize: '11px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
        Updated {data.lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
}

interface CrossReferenceDisplayProps {
  data: ParentCrossReferenceView;
}
