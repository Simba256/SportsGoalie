'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardCheck, Inbox, Loader2, Mail, Search } from 'lucide-react';
import { toast } from 'sonner';

import { AdminRoute } from '@/components/auth/protected-route';
import {
  ApproveDialog,
  DecisionButtons,
  StatusPill,
  TABS,
  authedFetch,
  BLUE,
  BLUE2,
  BODY,
  MUTED,
  card,
  inputStyle,
  useApplicationDecision,
  type Coach,
} from '@/components/admin/applications/decision-ui';
import type {
  ApplicantSummary,
  ApplicationDecision,
  ApplicationStatus,
} from '@/types/application';

/**
 * Admin — the application queue.
 *
 * Michael's requirement: approve, waitlist or decline in one click, with
 * approval filling in the coach and the track and sending the email in the
 * same action. That is what the approve dialog is — the two fields the
 * invitation would have carried, asked for once, then written straight onto
 * the account that already exists.
 *
 * The row carries the headline numbers only. Reading what someone actually
 * wrote happens on the review screen behind their name, because a queue that
 * shows every answer is not a queue any more.
 *
 * NOTE FOR MICHAEL: he wrote "if approved, the invitation goes out". Approval
 * here does not send an invitation, because the invitation flow *creates* an
 * account and the applicant already has one — sending it would give them a
 * second, empty account and lose the questionnaire. Instead approval takes
 * the wall down on their existing account and emails them the booking link,
 * which is what the invitation was carrying. Same outcome, one account.
 */

export default function AdminApplicationsPage() {
  return <AdminRoute><ApplicationsContent /></AdminRoute>;
}

function ApplicationsContent() {
  const [applicants, setApplicants] = useState<ApplicantSummary[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ApplicationStatus>('submitted');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch('/api/admin/applications');
      const data = (await res.json()) as {
        success: boolean; applicants?: ApplicantSummary[]; coaches?: Coach[]; error?: string;
      };
      if (!data.success) throw new Error(data.error || 'Failed to load');
      setApplicants(data.applicants ?? []);
      setCoaches(data.coaches ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { pending, setPending, saving, begin, submit } = useApplicationDecision(coaches, load);

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () => applicants
      .filter(a => a.applicationStatus === tab)
      .filter(a => !query || a.displayName.toLowerCase().includes(query) || a.email.toLowerCase().includes(query)),
    [applicants, tab, query]
  );

  const counts = TABS.map(t => applicants.filter(a => a.applicationStatus === t.key).length);

  return (
    <div style={{ padding: '24px', maxWidth: '1180px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <ClipboardCheck size={22} style={{ color: BLUE }} />
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Applications</h1>
      </div>
      <p style={{ fontSize: '13px', color: MUTED, margin: '0 0 20px', lineHeight: 1.6, maxWidth: '680px' }}>
        Everyone who applied through <strong style={{ color: BODY }}>/apply</strong>. They see nothing of the platform
        until you approve them. Click a name to read their answers. Approving opens their account,
        sets their coach and track, and emails them the booking link.
      </p>

      {/* Tabs + search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '99px',
              border: `1px solid ${tab === t.key ? BLUE : 'rgba(55,181,255,0.2)'}`,
              background: tab === t.key ? 'rgba(55,181,255,0.15)' : 'transparent',
              color: tab === t.key ? BLUE2 : MUTED,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t.label} <span style={{ opacity: 0.65 }}>({counts[i]})</span>
          </button>
        ))}

        <div style={{ position: 'relative', marginLeft: 'auto', minWidth: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email"
            style={{ ...inputStyle, paddingLeft: '32px' }}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ ...card, padding: '48px', textAlign: 'center', color: MUTED }}>
          <Loader2 size={22} className="animate-spin" style={{ color: BLUE, marginBottom: '10px' }} />
          <p style={{ margin: 0, fontSize: '13px' }}>Loading applications…</p>
        </div>
      ) : visible.length === 0 ? (
        <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
          <Inbox size={26} style={{ color: MUTED, marginBottom: '10px' }} />
          <p style={{ margin: 0, fontSize: '14px', color: BODY, fontWeight: 700 }}>Nothing here.</p>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: MUTED }}>
            {tab === 'submitted'
              ? 'No applications waiting on you.'
              : `No applications in "${TABS.find(t => t.key === tab)?.label.toLowerCase()}".`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {visible.map(a => (
            <ApplicantRow key={a.id} applicant={a} onDecide={begin} busy={saving} />
          ))}
        </div>
      )}

      {/* Approve dialog */}
      {pending && (
        <ApproveDialog
          pending={pending}
          coaches={coaches}
          saving={saving}
          onChange={setPending}
          onCancel={() => setPending(null)}
          onConfirm={() => submit(pending)}
        />
      )}
    </div>
  );
}

// ─── One applicant ────────────────────────────────────────────────────────────

function ApplicantRow({
  applicant, onDecide, busy,
}: {
  applicant: ApplicantSummary;
  onDecide: (a: ApplicantSummary, d: ApplicationDecision) => void;
  busy: boolean;
}) {
  const a = applicant;
  const when = a.submittedAt ?? a.appliedAt;

  const facts: [string, string][] = [
    ['Score', a.overallScore !== undefined ? a.overallScore.toFixed(1) : '—'],
    ['Pacing', a.pacingLevel ?? '—'],
    ['Driver / passenger', a.driverOrPassenger ?? '—'],
    ['Age', a.ageRange ?? '—'],
    ['Experience', a.experienceLevel ?? '—'],
  ];

  return (
    <div style={{ ...card, padding: '18px 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-start' }}>

        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexWrap: 'wrap' }}>
            {/* The name is the way in to the answers. */}
            <Link
              href={`/admin/applications/${a.id}`}
              style={{ fontSize: '15px', fontWeight: 800, color: '#fff', textDecoration: 'none', borderBottom: '1px solid rgba(55,181,255,0.35)' }}
            >
              {a.displayName}
            </Link>
            <StatusPill status={a.applicationStatus} />
          </div>
          <a href={`mailto:${a.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: MUTED, marginTop: '4px', textDecoration: 'none' }}>
            <Mail size={12} /> {a.email}
          </a>
          {when && (
            <p style={{ fontSize: '11px', color: MUTED, margin: '4px 0 0' }}>
              {a.submittedAt ? 'Submitted' : 'Started'} {new Date(when).toLocaleDateString()}
            </p>
          )}
          {a.assignedCoachName && (
            <p style={{ fontSize: '11px', color: BODY, margin: '4px 0 0' }}>
              Coach: <strong>{a.assignedCoachName}</strong>{a.tier ? ` · ${a.tier}` : ''}
            </p>
          )}
          {a.decisionNote && (
            <p style={{ fontSize: '12px', color: BODY, margin: '8px 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>
              &ldquo;{a.decisionNote}&rdquo;{a.decidedByName ? ` — ${a.decidedByName}` : ''}
            </p>
          )}
        </div>

        {/* The headline numbers, so triage does not need a second screen */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexWrap: 'wrap', gap: '14px 22px', alignSelf: 'center' }}>
          {a.hasProfile ? (
            <>
              {facts.map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED, margin: '0 0 2px' }}>{label}</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>{value}</p>
                </div>
              ))}
              <Link
                href={`/admin/applications/${a.id}`}
                style={{ alignSelf: 'center', fontSize: '12px', fontWeight: 700, color: BLUE2, textDecoration: 'none' }}
              >
                Read answers →
              </Link>
            </>
          ) : (
            <p style={{ fontSize: '12px', color: MUTED, margin: 0, fontStyle: 'italic' }}>
              Questionnaire not submitted yet — nothing to read.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', alignSelf: 'center' }}>
          <DecisionButtons applicant={a} busy={busy} onDecide={onDecide} />
        </div>
      </div>
    </div>
  );
}
