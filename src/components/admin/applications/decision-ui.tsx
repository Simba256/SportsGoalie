'use client';

/**
 * The parts of the application flow that the queue and the review screen share.
 *
 * Both screens approve, waitlist and decline the same way, and both have to
 * report honestly whether the email actually left. Keeping one copy of that here
 * means a change to the approval rules — a new required field, a different
 * warning — lands on both screens at once. It also means the two screens cannot
 * end up styling the same status two different colours, which on a screen whose
 * whole job is a decision would be worse than it sounds.
 */

import { useCallback, useState } from 'react';
import { Check, Clock, Loader2, PauseCircle, X } from 'lucide-react';
import { toast } from 'sonner';

import { auth } from '@/lib/firebase/config';
import type {
  ApplicantSummary,
  ApplicationDecision,
  ApplicationStatus,
} from '@/types/application';

// ─── Palette ──────────────────────────────────────────────────────────────────

export const BLUE = '#37b5ff';
export const BLUE2 = '#60cdff';
export const GREEN = '#22c55e';
export const AMBER = '#fbbf24';
export const RED = '#f87171';
export const MUTED = 'rgba(200,230,255,0.55)';
export const BODY = 'rgba(200,230,255,0.84)';

export const card = {
  background: 'rgba(2,18,44,0.85)',
  border: '1px solid rgba(55,181,255,0.14)',
  borderRadius: '16px',
} as const;

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(4,20,45,0.9)',
  border: '1px solid rgba(55,181,255,0.2)',
  borderRadius: '9px',
  color: '#fff',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: BLUE2,
  marginBottom: '6px',
};

// ─── Shared data ──────────────────────────────────────────────────────────────

export interface Coach {
  id: string;
  name: string;
}

export const TABS: { key: ApplicationStatus; label: string; colour: string }[] = [
  { key: 'submitted', label: 'To review', colour: BLUE },
  { key: 'applying', label: 'Unfinished', colour: MUTED },
  { key: 'waitlisted', label: 'Waiting list', colour: AMBER },
  { key: 'approved', label: 'Approved', colour: GREEN },
  { key: 'declined', label: 'Declined', colour: RED },
];

export async function authedFetch(url: string, init?: RequestInit) {
  const token = await auth.currentUser?.getIdToken();
  return fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers },
  });
}

/** A decision in flight, holding the applicant and the coach/track choices. */
export interface PendingDecision {
  applicant: ApplicantSummary;
  decision: ApplicationDecision;
  tier: 'automated' | 'custom';
  coachId: string;
  note: string;
}

// ─── The decision itself ──────────────────────────────────────────────────────

/**
 * Drives approve / waitlist / decline for whichever screen is showing.
 *
 * `onDone` runs after a decision lands — the queue reloads the list, the review
 * screen reloads the one applicant. Both need to, because the decision changes
 * what actions are still available.
 */
export function useApplicationDecision(coaches: Coach[], onDone: () => void | Promise<void>) {
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = useCallback(
    async (p: PendingDecision) => {
      if (p.decision === 'approve' && p.tier === 'custom' && !p.coachId) {
        toast.error('Pick a coach — a custom-track goalie needs one.');
        return;
      }

      setSaving(true);
      const coach = coaches.find(c => c.id === p.coachId);
      try {
        const res = await authedFetch(`/api/admin/applications/${p.applicant.id}`, {
          method: 'POST',
          body: JSON.stringify({
            decision: p.decision,
            ...(p.decision === 'approve' && { tier: p.tier }),
            ...(p.decision === 'approve' && p.coachId && { assignedCoachId: p.coachId, assignedCoachName: coach?.name }),
            ...(p.note.trim() && { note: p.note.trim() }),
          }),
        });
        const data = (await res.json()) as { success: boolean; emailSent?: boolean; error?: string };
        if (!data.success) throw new Error(data.error || 'Failed');

        const name = p.applicant.displayName;
        const done =
          p.decision === 'approve' ? `${name} is in.`
          : p.decision === 'waitlist' ? `${name} is on the waiting list.`
          : `${name} has been declined.`;

        // Whether the email actually left matters — it is the only thing the
        // applicant sees, and the approval email is what carries the booking
        // link. Say so plainly rather than reporting a clean success.
        if (data.emailSent) toast.success(done, { description: 'Email sent.' });
        else toast.warning(done, { description: 'Recorded, but the email did not send. Follow up by hand.' });

        setPending(null);
        await onDone();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to record the decision');
      } finally {
        setSaving(false);
      }
    },
    [coaches, onDone]
  );

  /**
   * Waitlist and decline go through immediately — there is nothing to fill in.
   * Approve opens the dialog, because approving without a track and (for
   * custom) a coach would leave the account open onto nothing.
   */
  const begin = useCallback(
    (applicant: ApplicantSummary, decision: ApplicationDecision) => {
      if (decision === 'approve') {
        setPending({
          applicant,
          decision,
          tier: applicant.tier ?? 'automated',
          coachId: applicant.assignedCoachId ?? '',
          note: '',
        });
        return;
      }
      void submit({ applicant, decision, tier: 'automated', coachId: '', note: '' });
    },
    [submit]
  );

  return { pending, setPending, saving, begin, submit };
}

// ─── Pieces ───────────────────────────────────────────────────────────────────

export function ActionButton({
  label, icon: Icon, colour, busy, onClick, size = 'small',
}: {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  colour: string;
  busy: boolean;
  onClick: () => void;
  /** 'large' is for the review screen, where the decision is the point of the page. */
  size?: 'small' | 'large';
}) {
  const large = size === 'large';
  return (
    <button
      onClick={onClick}
      disabled={busy}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        padding: large ? '11px 18px' : '8px 14px', borderRadius: '9px',
        border: `1px solid ${colour}44`, background: `${colour}18`, color: colour,
        fontSize: large ? '13px' : '12px', fontWeight: 700, fontFamily: 'inherit',
        cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1,
      }}
    >
      <Icon size={large ? 15 : 13} /> {label}
    </button>
  );
}

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const colour =
    status === 'approved' ? GREEN
    : status === 'waitlisted' ? AMBER
    : status === 'declined' ? RED
    : status === 'submitted' ? BLUE
    : MUTED;
  const label = TABS.find(t => t.key === status)?.label ?? status;

  return (
    <span style={{
      fontSize: '10px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
      color: colour, background: `${colour}1f`, border: `1px solid ${colour}44`,
      borderRadius: '99px', padding: '3px 9px',
    }}>
      {label}
    </span>
  );
}

/**
 * The three buttons. Approve is hidden on `applying`: there is nothing to judge
 * until the questionnaire is in. Each is hidden on the status it would set, so
 * the row never offers to make a change that would do nothing.
 */
export function DecisionButtons({
  applicant, busy, onDecide, size = 'small',
}: {
  applicant: ApplicantSummary;
  busy: boolean;
  onDecide: (a: ApplicantSummary, d: ApplicationDecision) => void;
  size?: 'small' | 'large';
}) {
  if (applicant.applicationStatus === 'applying') return null;

  return (
    <>
      {applicant.applicationStatus !== 'approved' && (
        <ActionButton label="Approve" icon={Check} colour={GREEN} busy={busy} size={size} onClick={() => onDecide(applicant, 'approve')} />
      )}
      {applicant.applicationStatus !== 'waitlisted' && (
        <ActionButton label="Waitlist" icon={Clock} colour={AMBER} busy={busy} size={size} onClick={() => onDecide(applicant, 'waitlist')} />
      )}
      {applicant.applicationStatus !== 'declined' && (
        <ActionButton label="Decline" icon={PauseCircle} colour={RED} busy={busy} size={size} onClick={() => onDecide(applicant, 'decline')} />
      )}
    </>
  );
}

// ─── Approve dialog ───────────────────────────────────────────────────────────

export function ApproveDialog({
  pending, coaches, saving, onChange, onCancel, onConfirm,
}: {
  pending: PendingDecision;
  coaches: Coach[];
  saving: boolean;
  onChange: (p: PendingDecision) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,6,18,0.78)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ ...card, background: 'linear-gradient(135deg, #041e3a 0%, #082d52 100%)', padding: '26px', maxWidth: '440px', width: '100%' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', margin: 0 }}>
            Approve {pending.applicant.displayName}
          </h2>
          <button onClick={onCancel} aria-label="Cancel" style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={17} />
          </button>
        </div>
        <p style={{ fontSize: '12px', color: MUTED, margin: '0 0 20px', lineHeight: 1.6 }}>
          Their account opens, their questionnaire becomes their baseline, and they get the
          email with the booking link.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <span style={labelStyle}>Track</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['automated', 'custom'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ ...pending, tier: t })}
                style={{
                  flex: 1, padding: '10px', borderRadius: '9px',
                  border: pending.tier === t ? `1px solid ${BLUE}` : '1px solid rgba(55,181,255,0.2)',
                  background: pending.tier === t ? 'rgba(55,181,255,0.15)' : 'rgba(4,20,45,0.9)',
                  color: pending.tier === t ? '#fff' : MUTED,
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="coach" style={labelStyle}>
            Coach {pending.tier === 'custom' ? '(required)' : '(optional)'}
          </label>
          <select
            id="coach"
            value={pending.coachId}
            onChange={e => onChange({ ...pending, coachId: e.target.value })}
            style={inputStyle}
          >
            <option value="">— none —</option>
            {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '22px' }}>
          <label htmlFor="note" style={labelStyle}>Note (private, for your own record)</label>
          <textarea
            id="note"
            value={pending.note}
            onChange={e => onChange({ ...pending, note: e.target.value })}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '9px' }}>
          <button
            onClick={onCancel}
            disabled={saving}
            style={{ flex: 1, padding: '12px', borderRadius: '9px', border: '1px solid rgba(200,230,255,0.22)', background: 'transparent', color: BODY, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            style={{
              flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '9px', border: 'none',
              background: saving ? 'rgba(34,197,94,0.3)' : `linear-gradient(135deg, ${GREEN}, #16a34a)`,
              color: saving ? 'rgba(255,255,255,0.6)' : '#00220e',
              fontSize: '12px', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? 'Approving…' : 'Approve and send'}
          </button>
        </div>
      </div>
    </div>
  );
}
