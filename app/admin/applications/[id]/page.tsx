'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileQuestion, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { AdminRoute } from '@/components/auth/protected-route';
import {
  DecisionButtons,
  DecisionDialog,
  StatusPill,
  authedFetch,
  BLUE,
  BLUE2,
  BODY,
  MUTED,
  card,
  useApplicationDecision,
  type Coach,
} from '@/components/admin/applications/decision-ui';
import { formatApplicantAnswers, type FormattedAnswer } from '@/lib/applications/format-answers';
import type { ApplicantProfile, ApplicantSummary } from '@/types/application';

/**
 * Admin — reading one application.
 *
 * Michael approves people. Until now he approved them from a name, an email and
 * five summary numbers, which is not a review. This is the screen where he reads
 * what they actually wrote, in the order they wrote it, with the decision
 * buttons beside it rather than on another page — the whole point is that the
 * decision is made while the answers are in front of him.
 *
 * The answers are rendered against the live question bank, so the wording shown
 * is today's wording. See `formatApplicantAnswers` for what that costs and how
 * answers to since-removed questions are kept visible rather than dropped.
 */

export default function AdminApplicationReviewPage() {
  return <AdminRoute><ReviewContent /></AdminRoute>;
}

function ReviewContent() {
  const params = useParams();
  const id = params.id as string;

  const [applicant, setApplicant] = useState<ApplicantSummary | null>(null);
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch(`/api/admin/applications/${id}`);
      const data = (await res.json()) as {
        success: boolean;
        applicant?: ApplicantSummary;
        profile?: ApplicantProfile | null;
        coaches?: Coach[];
        error?: string;
      };
      if (!data.success || !data.applicant) throw new Error(data.error || 'Failed to load');
      setApplicant(data.applicant);
      setProfile(data.profile ?? null);
      setCoaches(data.coaches ?? []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load the application';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const { pending, setPending, saving, begin, submit } = useApplicationDecision(coaches, load);

  const questionnaire = useMemo(
    () => (profile ? formatApplicantAnswers(profile.responses, profile.openExtras) : null),
    [profile]
  );

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1180px' }}>
        <div style={{ ...card, padding: '48px', textAlign: 'center', color: MUTED }}>
          <Loader2 size={22} className="animate-spin" style={{ color: BLUE, marginBottom: '10px' }} />
          <p style={{ margin: 0, fontSize: '13px' }}>Loading the application…</p>
        </div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div style={{ padding: '24px', maxWidth: '1180px' }}>
        <BackLink />
        <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
          <FileQuestion size={26} style={{ color: MUTED, marginBottom: '10px' }} />
          <p style={{ margin: 0, fontSize: '14px', color: BODY, fontWeight: 700 }}>
            {error ?? 'Application not found.'}
          </p>
        </div>
      </div>
    );
  }

  const when = applicant.submittedAt ?? profile?.submittedAt ?? applicant.appliedAt;

  return (
    <div style={{ padding: '24px', maxWidth: '1180px' }}>
      <BackLink />

      {/* Who this is */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
          {applicant.displayName}
        </h1>
        <StatusPill status={applicant.applicationStatus} />
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <a href={`mailto:${applicant.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: MUTED, textDecoration: 'none' }}>
          <Mail size={12} /> {applicant.email}
        </a>
        {when && (
          <span style={{ fontSize: '12px', color: MUTED }}>
            {applicant.submittedAt || profile?.submittedAt ? 'Submitted' : 'Started'} {new Date(when).toLocaleDateString()}
          </span>
        )}
        {questionnaire && (
          <span style={{ fontSize: '12px', color: MUTED }}>
            {questionnaire.answeredCount} of {questionnaire.activeCount} questions answered
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* The answers */}
        <div style={{ flex: '1 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!profile ? (
            <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
              <FileQuestion size={26} style={{ color: MUTED, marginBottom: '10px' }} />
              <p style={{ margin: 0, fontSize: '14px', color: BODY, fontWeight: 700 }}>
                No questionnaire yet.
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: MUTED, lineHeight: 1.6 }}>
                They made an account but have not submitted their answers, so there is
                nothing to read. Wait for them to finish before deciding.
              </p>
            </div>
          ) : (
            <>
              {questionnaire?.sections.map(section => (
                <section key={section.key} style={{ ...card, padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '2px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 900, color: BLUE,
                      background: 'rgba(55,181,255,0.15)', border: '1px solid rgba(55,181,255,0.3)',
                      borderRadius: '7px', padding: '2px 8px',
                    }}>
                      {section.key}
                    </span>
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>{section.title}</h2>
                    <span style={{ fontSize: '11px', color: MUTED, marginLeft: 'auto' }}>
                      {section.answeredCount}/{section.answers.length}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: MUTED, margin: '0 0 16px', letterSpacing: '.02em' }}>
                    {section.categoryLabel}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {section.answers.map(answer => <Answer key={answer.questionId} answer={answer} />)}
                  </div>
                </section>
              ))}

              {/* Answers to questions the bank no longer has. Shown raw rather than
                  dropped — see the note in format-answers.ts. */}
              {questionnaire && questionnaire.orphans.length > 0 && (
                <section style={{ ...card, padding: '20px 22px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>
                    Other answers
                  </h2>
                  <p style={{ fontSize: '11px', color: MUTED, margin: '0 0 16px', lineHeight: 1.6 }}>
                    They answered these, but the questions are no longer in the questionnaire —
                    most likely reworded or removed since. Shown as stored.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {questionnaire.orphans.map(o => (
                      <div key={o.key}>
                        <p style={{ fontSize: '11px', color: MUTED, margin: '0 0 3px', fontFamily: 'monospace' }}>{o.key}</p>
                        <p style={{ fontSize: '14px', color: '#fff', margin: 0, lineHeight: 1.6 }}>{o.value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* The decision, beside the answers rather than after them */}
        <aside style={{ flex: '0 1 320px', minWidth: '280px', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div style={{ ...card, padding: '20px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '.02em' }}>
              Your decision
            </h2>
            {applicant.applicationStatus === 'applying' ? (
              <p style={{ fontSize: '12px', color: MUTED, margin: 0, lineHeight: 1.6 }}>
                Nothing to decide yet — they have not submitted.
              </p>
            ) : (
              <>
                {applicant.applicationStatus === 'awaiting_call' && (
                  <p style={{ fontSize: '12px', color: BODY, margin: '0 0 12px', lineHeight: 1.6 }}>
                    Approved and sent the booking link. They stay behind the wall until you
                    open their account after the call.
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <DecisionButtons applicant={applicant} busy={saving} onDecide={begin} size="large" />
                </div>
              </>
            )}

            {applicant.decidedAt && (
              <p style={{ fontSize: '11px', color: MUTED, margin: '14px 0 0', lineHeight: 1.6 }}>
                Decided {new Date(applicant.decidedAt).toLocaleDateString()}
                {applicant.decidedByName ? ` by ${applicant.decidedByName}` : ''}.
              </p>
            )}
            {applicant.applicationStatus === 'approved' && applicant.openedAt && (
              <p style={{ fontSize: '11px', color: MUTED, margin: '4px 0 0', lineHeight: 1.6 }}>
                Account opened {new Date(applicant.openedAt).toLocaleDateString()}
                {applicant.openedByName ? ` by ${applicant.openedByName}` : ''}.
              </p>
            )}
            {applicant.decisionNote && (
              <p style={{ fontSize: '12px', color: BODY, margin: '8px 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>
                &ldquo;{applicant.decisionNote}&rdquo;
              </p>
            )}
            {applicant.assignedCoachName && (
              <p style={{ fontSize: '11px', color: BODY, margin: '8px 0 0' }}>
                Coach: <strong>{applicant.assignedCoachName}</strong>{applicant.tier ? ` · ${applicant.tier}` : ''}
              </p>
            )}
          </div>

          {applicant.hasProfile && (
            <div style={{ ...card, padding: '20px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '.02em' }}>
                What the system made of it
              </h2>
              <Facts
                rows={[
                  ['Score', applicant.overallScore !== undefined ? applicant.overallScore.toFixed(1) : '—'],
                  ['Pacing', applicant.pacingLevel ?? '—'],
                  ['Driver / passenger', applicant.driverOrPassenger ?? profile?.driverOrPassenger ?? '—'],
                  ['Age', applicant.ageRange ?? '—'],
                  ['Experience', applicant.experienceLevel ?? '—'],
                ]}
              />
              <TagList label="Strengths" items={profile?.intelligenceProfile?.identifiedStrengths} />
              <TagList label="Gaps" items={profile?.intelligenceProfile?.identifiedGaps} />
            </div>
          )}
        </aside>
      </div>

      {pending && (
        <DecisionDialog
          key={`${pending.applicant.id}:${pending.decision}`}
          pending={pending}
          coaches={coaches}
          saving={saving}
          onChange={setPending}
          onCancel={() => setPending(null)}
          onConfirm={previewHash => submit(pending, previewHash)}
        />
      )}
    </div>
  );
}

// ─── Pieces ───────────────────────────────────────────────────────────────────

function BackLink() {
  return (
    <Link
      href="/admin/applications"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: BLUE2, textDecoration: 'none', marginBottom: '14px' }}
    >
      <ArrowLeft size={14} /> All applications
    </Link>
  );
}

/**
 * One question and what they said. An unanswered question stays on the page and
 * says so — a gap where a question should be reads as an answer that was never
 * asked, which is not the same thing at all.
 */
function Answer({ answer }: { answer: FormattedAnswer }) {
  return (
    <div style={{ borderLeft: `2px solid ${answer.answered ? 'rgba(55,181,255,0.35)' : 'rgba(200,230,255,0.12)'}`, paddingLeft: '14px' }}>
      <p style={{ fontSize: '13px', color: MUTED, margin: 0, lineHeight: 1.55 }}>
        <span style={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.7, marginRight: '7px' }}>{answer.questionId}</span>
        {answer.question}
      </p>
      {answer.subLabel && (
        <p style={{ fontSize: '11px', color: MUTED, margin: '2px 0 0', opacity: 0.75, lineHeight: 1.5 }}>{answer.subLabel}</p>
      )}

      {answer.answered ? (
        <>
          {answer.values.map((value, i) => (
            <p key={i} style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: '6px 0 0', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
              {answer.values.length > 1 ? `• ${value}` : value}
            </p>
          ))}
          {answer.scaleHint && (
            <p style={{ fontSize: '11px', color: MUTED, margin: '3px 0 0' }}>{answer.scaleHint}</p>
          )}
          {answer.extras.map((extra, i) => (
            <div key={i} style={{ margin: '8px 0 0', padding: '10px 12px', background: 'rgba(55,181,255,0.05)', borderRadius: '9px' }}>
              <p style={{ fontSize: '11px', color: MUTED, margin: '0 0 4px' }}>{extra.label}</p>
              <p style={{ fontSize: '14px', color: BODY, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{extra.text}</p>
            </div>
          ))}
        </>
      ) : (
        <p style={{ fontSize: '13px', color: MUTED, margin: '6px 0 0', fontStyle: 'italic', opacity: 0.7 }}>
          Left blank.
        </p>
      )}
    </div>
  );
}

function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED }}>{label}</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textAlign: 'right' }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function TagList({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: '16px' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED, margin: '0 0 7px' }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.map(item => (
          <span key={item} style={{ fontSize: '11px', color: BODY, background: 'rgba(55,181,255,0.08)', border: '1px solid rgba(55,181,255,0.18)', borderRadius: '99px', padding: '3px 9px' }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
