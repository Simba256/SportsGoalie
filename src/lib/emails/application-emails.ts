/**
 * Application-by-questionnaire emails (item 2; copy pack 3.3–3.6).
 *
 * The words are Michael's. They live in `src/data/applicant-flow-copy.ts` under
 * their copy-pack IDs and are only assembled here, so this file owns the
 * presentation and nothing else: restyle freely, never reword. His pack marks
 * the wording as provisional, and a change of words is an edit to that file.
 *
 * Nothing is added around his words — no sub-headings, no bolding, no subtitle
 * under the logo. Every decision email is shown to the sender in full before it
 * goes (H-25), and what that preview shows must be what he wrote and nothing
 * else.
 */

import {
  EMAIL_APPROVED,
  EMAIL_DECLINED,
  EMAIL_RECEIVED,
  EMAIL_SIGNATURE,
  EMAIL_WAITLISTED,
} from '@/data/applicant-flow-copy';
import { isUsableBookingUrl, normalizeWaitlistLine } from '@/types/platform-settings';

/**
 * The booking link from the environment — the fallback, not the source.
 *
 * The link is set on the admin System Settings screen so Michael can change it
 * himself; `getBookingUrl()` reads that first and only falls back to this when
 * the setting is empty. With neither set, approval is refused (H-26) — see
 * `MissingBookingLinkError`.
 */
export const BOOKING_URL = process.env.BOOKING_URL || process.env.NEXT_PUBLIC_BOOKING_URL || '';

/**
 * Thrown when an approval email is asked for without a usable booking link.
 *
 * H-26: "The booking link in the approval email is required, not optional.
 * Without it an approved applicant has no way to reach me and the flow
 * dead-ends." So there is no link-less version of the email to fall back on;
 * the decision route turns this into a message pointing at Settings.
 */
export class MissingBookingLinkError extends Error {
  constructor() {
    super('There is no booking link set, and the approval email cannot go without one.');
    this.name = 'MissingBookingLinkError';
  }
}

export interface ApplicationEmail {
  subject: string;
  text: string;
  html: string;
}

// ─── Presentation ─────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const p = (html: string) =>
  `<p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.75;">${html}</p>`;

/**
 * One paragraph of the email in both forms. `html` is only given where the
 * paragraph carries markup (the booking link); otherwise it is the text,
 * escaped.
 */
interface Block {
  text: string;
  html?: string;
}

const block = (text: string): Block => ({ text });

/**
 * Free text Michael typed into a setting, as blocks. A blank line starts a new
 * paragraph and a single line break stays a line break, so what he typed is
 * what the goalie reads.
 */
function blocksFromTyped(value: string): Block[] {
  return value
    .split(/\n\s*\n/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => ({ text: part, html: escapeHtml(part).replace(/\n/g, '<br>') }));
}

/** The shared shell, matching the founding-member email. */
function shell(title: string, body: string, footer: string, subtitle?: string): string {
  const subtitleHtml = subtitle
    ? `\n        <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:14px;">${escapeHtml(subtitle)}</p>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,sans-serif;">
  <div style="padding:40px 20px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

      <div style="background:linear-gradient(135deg,#050d1a 0%,#0d1b3a 100%);padding:36px 32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">🥅</div>
        <h1 style="margin:0;color:#37b5ff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Smarter Goalie</h1>${subtitleHtml}
      </div>

      <div style="padding:36px 32px;">
${body}
${footer}
      </div>

    </div>
  </div>
</body>
</html>`.trim();
}

const signatureHtml = `        <p style="margin:28px 0 0;color:#0d1b3a;font-size:15px;line-height:1.6;">
          ${escapeHtml(EMAIL_SIGNATURE.name)}<br>
          <span style="color:#64748b;">${escapeHtml(EMAIL_SIGNATURE.line)}</span>
        </p>`;

const signatureText = `${EMAIL_SIGNATURE.name}\n${EMAIL_SIGNATURE.line}`;

/**
 * An applicant email: "[First name] —", Michael's paragraphs, his signature.
 *
 * With no first name the greeting line is left out rather than replaced with
 * wording he did not write.
 */
function compose(subject: string, firstName: string | undefined, blocks: Block[]): ApplicationEmail {
  const all: Block[] = firstName ? [block(`${firstName} —`), ...blocks] : blocks;

  const text = [...all.map(b => b.text), signatureText].join('\n\n');
  const html = shell(subject, all.map(b => p(b.html ?? escapeHtml(b.text))).join('\n'), signatureHtml);

  return { subject, text, html };
}

/**
 * The first name the emails greet an applicant by: the first word of the name
 * they gave. Undefined when there is no name — an email address is never used
 * as one, so nobody is greeted "jo@example.com —".
 */
export function applicantFirstName(displayName: unknown): string | undefined {
  if (typeof displayName !== 'string') return undefined;
  const first = displayName.trim().split(/\s+/)[0];
  if (!first || first.includes('@')) return undefined;
  return first;
}

// ─── 3.3 Application received ─────────────────────────────────────────────────

/** Sent automatically the moment the questionnaire is submitted. */
export function buildApplicationReceived(firstName?: string): ApplicationEmail {
  return compose(EMAIL_RECEIVED.subject, firstName, EMAIL_RECEIVED.body.map(block));
}

// ─── 3.4 Approved ─────────────────────────────────────────────────────────────

/**
 * Sent when Michael approves. This is the email that carries the booking link —
 * the only place it ever appears, which is what makes booking approved-only.
 *
 * Throws `MissingBookingLinkError` without a usable link (H-26).
 */
export function buildApplicationApproved(firstName: string | undefined, bookingUrl: string): ApplicationEmail {
  const url = bookingUrl.trim();
  if (!isUsableBookingUrl(url)) throw new MissingBookingLinkError();

  const link: Block = {
    text: `${EMAIL_APPROVED.linkLead} ${url}`,
    html: `${escapeHtml(EMAIL_APPROVED.linkLead)} <a href="${escapeHtml(url)}" style="color:#0284c7;font-weight:700;word-break:break-all;">${escapeHtml(url)}</a>`,
  };

  return compose(EMAIL_APPROVED.subject, firstName, [
    ...EMAIL_APPROVED.beforeLink.map(block),
    link,
    ...EMAIL_APPROVED.afterLink.map(block),
  ]);
}

// ─── 3.5 Waiting list ─────────────────────────────────────────────────────────

/**
 * `waitlistLine` is the [COACH TO SET] paragraph from System Settings. Empty
 * leaves it out — the email reads straight on to "When a place opens…".
 */
export function buildApplicationWaitlisted(firstName?: string, waitlistLine = ''): ApplicationEmail {
  return compose(EMAIL_WAITLISTED.subject, firstName, [
    ...EMAIL_WAITLISTED.beforeCoachLine.map(block),
    ...blocksFromTyped(normalizeWaitlistLine(waitlistLine)),
    ...EMAIL_WAITLISTED.afterCoachLine.map(block),
  ]);
}

// ─── 3.6 Not this time ────────────────────────────────────────────────────────

export function buildApplicationDeclined(firstName?: string): ApplicationEmail {
  return compose(EMAIL_DECLINED.subject, firstName, EMAIL_DECLINED.body.map(block));
}

// ─── Michael's heads-up ───────────────────────────────────────────────────────

interface ApplicationNotificationData {
  displayName: string;
  email: string;
  overallScore?: number;
  pacingLevel?: string;
  adminUrl: string;
}

/**
 * The heads-up to Michael when an application lands, mirroring the founding one.
 * Internal, so it is not copy-pack text and keeps its own plain wording.
 */
export function buildApplicationNotification(data: ApplicationNotificationData): ApplicationEmail {
  const subject = `New application — ${data.displayName}`;

  const score = data.overallScore !== undefined ? data.overallScore.toFixed(1) : '—';
  const pacing = data.pacingLevel || '—';

  const text = `A new application has come in.

Name:    ${data.displayName}
Email:   ${data.email}
Score:   ${score}
Pacing:  ${pacing}

Review it here: ${data.adminUrl}`;

  const rows = [
    ['Name', data.displayName],
    ['Email', data.email],
    ['Overall score', score],
    ['Pacing level', pacing],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#64748b;font-size:14px;width:140px;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:#0d1b3a;font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');

  const html = shell(
    subject,
    [
      p('A new application has come in.'),
      `<table style="width:100%;border-collapse:collapse;margin:0 0 22px;">${rows}</table>`,
      `<div style="text-align:center;margin:0 0 18px;">
        <a href="${escapeHtml(data.adminUrl)}" style="display:inline-block;background:linear-gradient(135deg,#37b5ff,#0ea5e9);color:#001426;font-size:15px;font-weight:800;letter-spacing:0.5px;text-decoration:none;padding:14px 32px;border-radius:10px;">Review the application</a>
      </div>`,
    ].join('\n'),
    '',
    'New application'
  );

  return { subject, text, html };
}
