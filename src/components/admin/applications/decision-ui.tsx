'use client';

/**
 * The parts of the application flow that the queue and the review screen share.
 *
 * Both screens take the same decisions the same way, and both have to report
 * honestly whether the email actually left. Keeping one copy of that here means
 * a change to the rules — a new required field, a different warning — lands on
 * both screens at once. It also means the two screens cannot end up styling the
 * same status two different colours, which on a screen whose whole job is a
 * decision would be worse than it sounds.
 *
 * NOTHING IS SENT FROM A SINGLE CLICK (H-25). Every decision opens the dialog
 * below, which shows the exact email — recipient, subject, the email as it
 * will look, and its plain-text version — under copy pack 3.7's question. The
 * send carries a fingerprint of what was shown, and the server refuses it if
 * the email has changed since.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Clock, Loader2, PauseCircle, RefreshCw, Send, Unlock, X } from 'lucide-react';
import { toast } from 'sonner';

import { auth } from '@/lib/firebase/config';
import { availableActions } from '@/lib/applications/decision-rules';
import { ADMIN_DECISION_LABELS, decisionConfirmQuestion } from '@/data/applicant-flow-copy';
import type {
  ApplicantSummary,
  ApplicationAction,
  ApplicationStatus,
  DecisionEmailPreview,
} from '@/types/application';

// ─── Palette ──────────────────────────────────────────────────────────────────

export const BLUE = '#37b5ff';
export const BLUE2 = '#60cdff';
export const GREEN = '#22c55e';
export const AMBER = '#fbbf24';
export const RED = '#f87171';
export const PURPLE = '#a78bfa';
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

/**
 * The queue's tabs, and the label and colour each status carries everywhere.
 *
 * `approved` reads "Account open" rather than "Approved": approving moves
 * someone to "Awaiting call", and a tab called Approved that stayed empty after
 * an approval would look like the click had not worked.
 */
export const TABS: { key: ApplicationStatus; label: string; colour: string }[] = [
  { key: 'submitted', label: 'To review', colour: BLUE },
  { key: 'applying', label: 'Unfinished', colour: MUTED },
  { key: 'waitlisted', label: 'Waiting list', colour: AMBER },
  { key: 'awaiting_call', label: 'Awaiting call', colour: PURPLE },
  { key: 'approved', label: 'Account open', colour: GREEN },
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
  decision: ApplicationAction;
  tier: 'automated' | 'custom';
  coachId: string;
  note: string;
}

/**
 * What became of a send. `stale` means the server rebuilt the email and it no
 * longer matched the one on screen, so nothing went and the dialog must show
 * the new version before anything can.
 */
export type DecisionOutcome = 'done' | 'stale' | 'failed';

/** The button label for each action — 3.7's three, plus opening the account. */
export const ACTION_LABELS: Record<ApplicationAction, string> = {
  ...ADMIN_DECISION_LABELS,
  open: 'Open account',
};

const ACTION_STYLE: Record<ApplicationAction, { icon: React.ComponentType<{ size?: number }>; colour: string }> = {
  approve: { icon: Check, colour: GREEN },
  waitlist: { icon: Clock, colour: AMBER },
  decline: { icon: PauseCircle, colour: RED },
  open: { icon: Unlock, colour: PURPLE },
};

// ─── The decision itself ──────────────────────────────────────────────────────

/**
 * Drives the decisions for whichever screen is showing.
 *
 * `onDone` runs after a decision lands — the queue reloads the list, the review
 * screen reloads the one applicant. Both need to, because the decision changes
 * what actions are still available.
 */
export function useApplicationDecision(coaches: Coach[], onDone: () => void | Promise<void>) {
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const [saving, setSaving] = useState(false);

  /**
   * Sends the decision. `previewHash` is the fingerprint of the email the
   * dialog showed; it is required for everything except opening the account,
   * which sends nothing.
   */
  const submit = useCallback(
    async (p: PendingDecision, previewHash?: string): Promise<DecisionOutcome> => {
      if (p.decision === 'approve' && p.tier === 'custom' && !p.coachId) {
        toast.error('Pick a coach — a custom-track goalie needs one.');
        return 'failed';
      }

      setSaving(true);
      const coach = coaches.find(c => c.id === p.coachId);
      try {
        const res = await authedFetch(`/api/admin/applications/${p.applicant.id}`, {
          method: 'POST',
          body: JSON.stringify({
            decision: p.decision,
            ...(p.decision !== 'open' && { previewHash }),
            ...(p.decision === 'approve' && { tier: p.tier }),
            ...(p.decision === 'approve' && p.coachId && { assignedCoachId: p.coachId, assignedCoachName: coach?.name }),
            ...(p.decision !== 'open' && p.note.trim() && { note: p.note.trim() }),
          }),
        });
        const data = (await res.json()) as { success: boolean; emailSent?: boolean; error?: string; code?: string };

        if (!data.success && data.code === 'preview_stale') {
          toast.warning('The email changed since you opened it. Nothing was sent.', {
            description: 'The dialog now shows the current version. Read it again before sending.',
          });
          return 'stale';
        }
        if (!data.success) throw new Error(data.error || 'Failed');

        const name = p.applicant.displayName;

        if (p.decision === 'open') {
          toast.success(`${name}'s account is open.`, { description: 'Nothing was emailed.' });
        } else {
          const done =
            p.decision === 'approve' ? `${name} is approved.`
            : p.decision === 'waitlist' ? `${name} is on the waiting list.`
            : `${name} has been declined.`;

          // Whether the email actually left matters — it is the only thing the
          // applicant sees, and the approval email is what carries the booking
          // link. Say so plainly rather than reporting a clean success.
          if (data.emailSent) {
            toast.success(done, { description: p.decision === 'approve' ? 'Invite sent.' : 'Email sent.' });
          } else {
            toast.warning(done, {
              description:
                p.decision === 'approve'
                  ? 'Recorded, but the invite did not send. Follow up by hand — it carries their booking link.'
                  : 'Recorded, but the email did not send. Follow up by hand.',
            });
          }
        }

        setPending(null);
        await onDone();
        return 'done';
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to record the decision');
        return 'failed';
      } finally {
        setSaving(false);
      }
    },
    [coaches, onDone]
  );

  /** Every action opens the dialog. Nothing is sent from the button itself. */
  const begin = useCallback((applicant: ApplicantSummary, decision: ApplicationAction) => {
    setPending({
      applicant,
      decision,
      tier: applicant.tier ?? 'automated',
      coachId: applicant.assignedCoachId ?? '',
      note: '',
    });
  }, []);

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
  const tab = TABS.find(t => t.key === status);
  const colour = tab?.colour ?? MUTED;
  const label = tab?.label ?? status;

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
 * The buttons a status offers — see `availableActions` for which and why. The
 * server applies the same rules, so nothing here is offered that it would
 * refuse.
 */
export function DecisionButtons({
  applicant, busy, onDecide, size = 'small',
}: {
  applicant: ApplicantSummary;
  busy: boolean;
  onDecide: (a: ApplicantSummary, d: ApplicationAction) => void;
  size?: 'small' | 'large';
}) {
  const actions = availableActions(applicant.applicationStatus);
  if (actions.length === 0) return null;

  return (
    <>
      {actions.map(action => (
        <ActionButton
          key={action}
          label={ACTION_LABELS[action]}
          icon={ACTION_STYLE[action].icon}
          colour={ACTION_STYLE[action].colour}
          busy={busy}
          size={size}
          onClick={() => onDecide(applicant, action)}
        />
      ))}
    </>
  );
}

// ─── The confirmation ─────────────────────────────────────────────────────────

type PreviewState =
  | { kind: 'loading' }
  | { kind: 'ready'; preview: DecisionEmailPreview }
  | { kind: 'error'; message: string };

/**
 * The confirmation every action goes through.
 *
 * For the three decisions it loads the exact email from the server and shows
 * it under 3.7's question, with the send button held until it has loaded. For
 * approve it also asks for the track and coach. Opening the account after the
 * call sends nothing, so it is a plain confirmation.
 */
export function DecisionDialog({
  pending, coaches, saving, onChange, onCancel, onConfirm,
}: {
  pending: PendingDecision;
  coaches: Coach[];
  saving: boolean;
  onChange: (p: PendingDecision) => void;
  onCancel: () => void;
  onConfirm: (previewHash?: string) => Promise<DecisionOutcome>;
}) {
  const { applicant, decision } = pending;
  const sendsEmail = decision !== 'open';
  const { colour } = ACTION_STYLE[decision];

  const [state, setState] = useState<PreviewState>({ kind: 'loading' });
  const [changedNotice, setChangedNotice] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Load the email. Keyed on the applicant and decision — the track, coach and
  // note do not appear in the email, so changing them does not reload it.
  useEffect(() => {
    if (!sendsEmail) return;
    let cancelled = false;
    setState({ kind: 'loading' });
    (async () => {
      try {
        const res = await authedFetch(
          `/api/admin/applications/${applicant.id}/preview?decision=${decision}`,
          { cache: 'no-store' }
        );
        const data = (await res.json()) as { success: boolean; preview?: DecisionEmailPreview; error?: string };
        if (cancelled) return;
        if (!data.success || !data.preview) throw new Error(data.error || 'Could not load the email.');
        setState({ kind: 'ready', preview: data.preview });
      } catch (err) {
        if (!cancelled) setState({ kind: 'error', message: err instanceof Error ? err.message : 'Could not load the email.' });
      }
    })();
    return () => { cancelled = true; };
  }, [applicant.id, decision, sendsEmail, reloadKey]);

  // Focus moves into the dialog once, when it opens — not on every render,
  // or typing in the note would keep throwing the cursor out of it.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Escape closes, unless a send is in flight. Read through a ref so the
  // listener is not re-attached every time the parent re-renders.
  const escapeRef = useRef({ onCancel, saving });
  useEffect(() => {
    escapeRef.current = { onCancel, saving };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !escapeRef.current.saving) escapeRef.current.onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const confirm = async () => {
    if (!sendsEmail) {
      await onConfirm();
      return;
    }
    if (state.kind !== 'ready') return;
    const outcome = await onConfirm(state.preview.previewHash);
    if (outcome === 'stale') {
      setChangedNotice(true);
      setReloadKey(k => k + 1);
    }
  };

  const canConfirm = !saving && (!sendsEmail || state.kind === 'ready');
  const title = sendsEmail ? ACTION_LABELS[decision] : `Open ${applicant.displayName}'s account`;

  return (
    <div
      onClick={() => { if (!saving) onCancel(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,6,18,0.78)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 'max(16px, 4vh) 16px', zIndex: 100, overflowY: 'auto',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-dialog-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        style={{
          ...card, background: 'linear-gradient(135deg, #041e3a 0%, #082d52 100%)',
          padding: 'clamp(18px, 4vw, 26px)', maxWidth: sendsEmail ? '680px' : '440px', width: '100%',
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
          <div>
            <p style={{ ...labelStyle, color: colour, marginBottom: '4px' }}>{title}</p>
            <h2 id="decision-dialog-title" style={{ fontSize: '17px', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.35 }}>
              {sendsEmail
                ? decisionConfirmQuestion(applicant.displayName)
                : `Has your call with ${applicant.displayName} happened?`}
            </h2>
          </div>
          <button onClick={onCancel} disabled={saving} aria-label="Cancel" style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={17} />
          </button>
        </div>

        {!sendsEmail && (
          <p style={{ fontSize: '13px', color: BODY, margin: '10px 0 22px', lineHeight: 1.65 }}>
            Opening their account takes the wall down: they see their content the next time they
            load the app. Nothing is emailed to them.
          </p>
        )}

        {decision === 'approve' && <ApproveFields pending={pending} coaches={coaches} onChange={onChange} />}

        {sendsEmail && (
          <>
            {changedNotice && (
              <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', margin: '14px 0 0', padding: '11px 13px', borderRadius: '10px', background: `${AMBER}14`, border: `1px solid ${AMBER}44` }}>
                <AlertTriangle size={15} style={{ color: AMBER, flexShrink: 0, marginTop: '1px' }} />
                <p style={{ margin: 0, fontSize: '12px', color: BODY, lineHeight: 1.55 }}>
                  The email changed after you opened this, so nothing was sent. What is below is the
                  current version — read it again before sending.
                </p>
              </div>
            )}

            <EmailPreview state={state} onRetry={() => setReloadKey(k => k + 1)} />

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="decision-note" style={labelStyle}>Note (private, for your own record — not in the email)</label>
              <textarea
                id="decision-note"
                value={pending.note}
                onChange={e => onChange({ ...pending, note: e.target.value })}
                rows={2}
                maxLength={2000}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '9px' }}>
          <button
            onClick={onCancel}
            disabled={saving}
            style={{ flex: 1, padding: '12px', borderRadius: '9px', border: '1px solid rgba(200,230,255,0.22)', background: 'transparent', color: BODY, fontSize: '12px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <button
            onClick={() => void confirm()}
            disabled={!canConfirm}
            style={{
              flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '9px', border: 'none',
              background: canConfirm ? colour : `${colour}40`,
              color: canConfirm ? '#00121f' : 'rgba(255,255,255,0.6)',
              fontSize: '12px', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase',
              cursor: canConfirm ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : sendsEmail ? <Send size={14} /> : <Unlock size={14} />}
            {saving ? (sendsEmail ? 'Sending…' : 'Opening…') : sendsEmail ? 'Send it now' : 'Yes — open their account'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ApproveFields({
  pending, coaches, onChange,
}: {
  pending: PendingDecision;
  coaches: Coach[];
  onChange: (p: PendingDecision) => void;
}) {
  return (
    <div style={{ marginTop: '16px' }}>
      <p style={{ fontSize: '12px', color: MUTED, margin: '0 0 16px', lineHeight: 1.6 }}>
        They move to Awaiting call and stay walled until you open their account after the call.
        Their questionnaire becomes their baseline.
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

      <div>
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
    </div>
  );
}

/**
 * The email as it will arrive. The HTML is shown in a sandboxed frame with no
 * scripts, so it renders exactly as built without being able to reach this
 * page; the plain-text version, which some mail apps show instead, sits
 * underneath.
 */
function EmailPreview({ state, onRetry }: { state: PreviewState; onRetry: () => void }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(420);

  const fit = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    // Links in the preview open in a new tab instead of navigating the frame.
    // This touches the displayed copy only; the email itself is unchanged.
    doc.querySelectorAll('a').forEach(a => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
    setHeight(Math.max(200, doc.documentElement.scrollHeight));
  }, []);

  useEffect(() => {
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [fit]);

  if (state.kind === 'loading') {
    return (
      <div style={{ margin: '16px 0 18px', padding: '40px 16px', textAlign: 'center', color: MUTED, border: '1px dashed rgba(55,181,255,0.2)', borderRadius: '12px' }}>
        <Loader2 size={18} className="animate-spin" style={{ color: BLUE, marginBottom: '8px' }} />
        <p style={{ margin: 0, fontSize: '12px' }}>Building the email…</p>
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div style={{ margin: '16px 0 18px', padding: '16px', borderRadius: '12px', background: `${RED}12`, border: `1px solid ${RED}44` }}>
        <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#fff', lineHeight: 1.55, fontWeight: 600 }}>
          {state.message}
        </p>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: MUTED }}>Nothing has been sent.</p>
        <button
          onClick={onRetry}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(200,230,255,0.25)', background: 'transparent', color: BODY, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <RefreshCw size={12} /> Try again
        </button>
      </div>
    );
  }

  const { preview } = state;
  return (
    <div style={{ margin: '16px 0 18px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 12px', fontSize: '13px', marginBottom: '12px' }}>
        <span style={{ color: MUTED }}>To</span>
        <span style={{ color: '#fff', fontWeight: 600, wordBreak: 'break-all' }}>{preview.to}</span>
        <span style={{ color: MUTED }}>Subject</span>
        <span style={{ color: '#fff', fontWeight: 600 }}>{preview.subject}</span>
      </div>

      <iframe
        ref={frameRef}
        title="The email, as it will arrive"
        srcDoc={preview.html}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        onLoad={fit}
        style={{ width: '100%', height: `${height}px`, border: '1px solid rgba(55,181,255,0.2)', borderRadius: '12px', background: '#f0f4f8', display: 'block' }}
      />

      <details style={{ marginTop: '10px' }}>
        <summary style={{ cursor: 'pointer', fontSize: '12px', color: BLUE2, fontWeight: 700 }}>
          Plain-text version
        </summary>
        <pre style={{ margin: '8px 0 0', padding: '12px 14px', borderRadius: '10px', background: 'rgba(4,20,45,0.9)', border: '1px solid rgba(55,181,255,0.15)', color: BODY, fontSize: '12px', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
          {preview.text}
        </pre>
      </details>
    </div>
  );
}
