'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { V2GameChartEntry, CrossReferenceGap } from '@/types/charting';
import { ArrowLeft, MessageCircle, Eye } from 'lucide-react';

const CYAN = '#00FFFF';
const MINT = '#00FF99';
const VIOLET = '#B388FF';
const CORAL = '#FF6B6B';

/** Extract per-period pillar ratings from a V2 game chart entry */
function extractRatings(entry: V2GameChartEntry): Record<string, number> {
  const ratings: Record<string, number> = {};
  const periods = ['period1', 'period2', 'period3', 'overtime'] as const;
  periods.forEach(p => {
    const pd = entry.periods?.[p];
    if (!pd) return;
    const label = p === 'overtime' ? 'OT' : p.replace('period', 'P');
    if (pd.mindControlRating) ratings[`${p}_mindControl`] = pd.mindControlRating;
    if (pd.skatingRating) ratings[`${p}_skating`] = pd.skatingRating;
    if (pd.sevenAMSRating) ratings[`${p}_7ams`] = pd.sevenAMSRating;
    if (pd.sixZSRating) ratings[`${p}_6zs`] = pd.sixZSRating;
    if (pd.formRating) ratings[`${p}_form`] = pd.formRating;
    // factorRatios is a Record — skip until B1 content is delivered
    void label;
  });
  if (entry.postGame?.gameRetentionRating) ratings['postGame_retention'] = entry.postGame.gameRetentionRating;
  if (entry.postGame?.overallGameFactorRating) ratings['postGame_factor'] = entry.postGame.overallGameFactorRating;
  return ratings;
}

const FIELD_LABELS: Record<string, string> = {
  period1_mindControl: 'P1 Mind Control',
  period2_mindControl: 'P2 Mind Control',
  period3_mindControl: 'P3 Mind Control',
  overtime_mindControl: 'OT Mind Control',
  period1_skating: 'P1 Skating',
  period2_skating: 'P2 Skating',
  period3_skating: 'P3 Skating',
  period1_7ams: 'P1 7AMS',
  period2_7ams: 'P2 7AMS',
  period3_7ams: 'P3 7AMS',
  period1_6zs: 'P1 6ZS',
  period2_6zs: 'P2 6ZS',
  period3_6zs: 'P3 6ZS',
  period1_form: 'P1 Form',
  period2_form: 'P2 Form',
  period3_form: 'P3 Form',
  period1_factorRatio: 'P1 Factor Ratio',
  period2_factorRatio: 'P2 Factor Ratio',
  period3_factorRatio: 'P3 Factor Ratio',
  postGame_retention: 'Game Retention',
  postGame_factor: 'Overall Factor',
};

function StarDisplay({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: i <= value ? color : 'rgba(255,255,255,0.1)',
          }}
        />
      ))}
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginLeft: '4px' }}>{value}/5</span>
    </div>
  );
}

function GapCard({ gap }: { gap: CrossReferenceGap }) {
  return (
    <div style={{
      borderRadius: '12px',
      background: 'rgba(255,107,107,0.06)',
      border: '1px solid rgba(255,107,107,0.2)',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <MessageCircle style={{ width: '14px', height: '14px', color: CORAL }} />
        <p style={{ color: CORAL, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Conversation Starter — {gap.fieldLabel}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '4px' }}>Goalie</p>
          <StarDisplay value={gap.goalieRating} color={CYAN} />
        </div>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '4px' }}>{gap.observerRole}</p>
          <StarDisplay value={gap.observerRating} color={VIOLET} />
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontStyle: 'italic' }}>
        &ldquo;{gap.conversationStarter}&rdquo;
      </p>
    </div>
  );
}

export default function CrossReferencePage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { user } = useAuth();

  const [goalieEntry, setGoalieEntry] = useState<V2GameChartEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || !user?.id) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'v2_chart_entries'), where('sessionId', '==', sessionId))
        );
        if (!snap.empty) {
          setGoalieEntry({ id: snap.docs[0].id, ...snap.docs[0].data() } as V2GameChartEntry);
        }
      } catch { /* silently fail */ } finally {
        setLoading(false);
      }
    })();
  }, [sessionId, user?.id]);

  const goalieRatings = goalieEntry ? extractRatings(goalieEntry) : {};
  const ratingKeys = Object.keys(goalieRatings).filter(k => goalieRatings[k] > 0);

  // Placeholder gaps — will be populated when parent/coach charts exist
  const gaps: CrossReferenceGap[] = [];

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        <button
          type="button"
          onClick={() => router.push(`/charting/sessions/${sessionId}`)}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <Eye style={{ width: '16px', height: '16px', color: VIOLET }} />
            <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 800 }}>Cross-Reference View</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
            Side-by-side alignment of all perspectives on this game
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
      ) : (
        <>
          {/* Perspective legend */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { label: 'Goalie', color: CYAN, available: !!goalieEntry },
              { label: 'Parent', color: MINT, available: false },
              { label: 'Coach', color: VIOLET, available: false },
              { label: 'Goalie Coach', color: '#FFD166', available: false },
            ].map(({ label, color, available }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: available ? color : 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                <span style={{ color: available ? '#fff' : 'rgba(255,255,255,0.25)', fontSize: '13px', fontWeight: 600 }}>
                  {label}
                  {!available && <span style={{ fontSize: '10px', marginLeft: '4px', color: 'rgba(255,255,255,0.2)' }}>—</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Note about missing perspectives */}
          {!goalieEntry && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
              No chart data found for this session yet.
            </div>
          )}

          {/* Goalie ratings table */}
          {ratingKeys.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Goalie Ratings
              </p>
              <div style={{ background: 'rgba(0,255,255,0.04)', border: '1px solid rgba(0,255,255,0.12)', borderRadius: '12px', overflow: 'hidden' }}>
                {ratingKeys.map((key, i) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: i < ratingKeys.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                      {FIELD_LABELS[key] ?? key}
                    </span>
                    <StarDisplay value={goalieRatings[key]} color={CYAN} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parent / Coach slots — coming soon */}
          <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Parent, Coach & Goalie Coach Perspectives</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
              When a parent or coach charts this game, their ratings will appear here side-by-side with the goalie&apos;s perspective. Gaps of ≥2 stars surface as conversation starters — never to show who was &ldquo;wrong,&rdquo; only to open the right coaching conversation.
            </p>
          </div>

          {/* Conversation starter gaps */}
          {gaps.length > 0 && (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Conversation Starters ({gaps.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {gaps.map((gap, i) => <GapCard key={i} gap={gap} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
