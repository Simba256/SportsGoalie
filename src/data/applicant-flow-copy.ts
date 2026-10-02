/**
 * Michael's applicant-flow copy — Build Copy Pack, Section 3 (9 September 2026).
 *
 * Every string an applicant reads in the application flow, and the three admin
 * button labels, live here under their copy-pack IDs. Nothing in a component or
 * an email template types these words itself; it reads them from this file.
 *
 * That is on purpose. The pack says the wording is provisional — "treat every
 * string here as replaceable … Do not hand-set any of this text into a place it
 * cannot be edited from." When his corrected wording arrives, it is an edit to
 * this one file.
 *
 * Copied verbatim. Change the words only when Michael sends new ones.
 *
 * Not in this file, deliberately:
 *   - 3.4 [BOOKING LINK] and 3.5 [COACH TO SET — the waiting-list line] are
 *     values Michael holds, not copy. Both are admin settings
 *     (`general.bookingUrl`, `general.waitlistLine`) so he sets them himself.
 *   - 3.8's locked-page wording and the inline lock label belong to the public
 *     content gate, which is SG-03 and not built yet. Only the pre-call state
 *     is used now.
 *
 * House rules the pack sets for this section: the call is by phone, fifteen
 * minutes, never video; never "platform" in anything a goalie reads.
 */

/** 3.1 · The application page. */
export const APPLICATION_PAGE = {
  heading: 'Apply.',
  subheading: "This isn't a sign-up. I read every one of these myself.",
  body: [
    "I take a small number of goalies at a time, because I work with them personally — not through a library of videos.",
    "I'm not looking for the most talented goalie who applies. I'm looking for the one who will still be charting in February. If that's not you right now, that's an honest answer and it costs you nothing to give it.",
    "Tell me who you are and why you want in. Then I'll come back to you myself.",
  ],
  /** The button that sends the application — the applicant's final submit. */
  button: 'Send it to Michael',
} as const;

/** 3.2 · Application received — on screen, immediately. */
export const APPLICATION_RECEIVED_SCREEN = {
  heading: "Got it. It's in front of me, not in a queue.",
  body: "I read applications myself, so give me a few days. You'll hear back either way — I don't leave people waiting without an answer.",
} as const;

/** The sign-off on every applicant email (3.3–3.6). */
export const EMAIL_SIGNATURE = {
  name: 'Michael',
  line: 'Smarter Goalie — Built Not Born · Six decades · One system',
} as const;

/** 3.3 · Email — application received. */
export const EMAIL_RECEIVED = {
  subject: 'Your application — Michael, Smarter Goalie',
  body: [
    "Your application is in and I've got it in front of me.",
    "I read these myself, so it takes a few days rather than a few minutes. You'll get an answer either way. I don't leave people hanging.",
  ],
} as const;

/**
 * 3.4 · Email — approved. Carries the booking link, which is required (H-26):
 * the email is never built without one.
 */
export const EMAIL_APPROVED = {
  subject: "You're in — book your call",
  beforeLink: [
    "You're in.",
    "The next step is a call with me. Not a sales call — I don't do those. It's so I hear how you talk about your game before I start reading your charts, because those two things together tell me more than either one alone.",
  ],
  /** Followed by the booking link itself: "Book a time here: [BOOKING LINK]". */
  linkLead: 'Book a time here:',
  afterLink: [
    "It's fifteen minutes, on the phone. Put your number in when you book and I'll call you.",
    "Bring one thing to it: the part of your game you'd fix today if you could only fix one. That's where we'll start.",
  ],
} as const;

/**
 * 3.5 · Email — waiting list. The [COACH TO SET] line sits between the two
 * parts; while Michael has not set it, the email goes without it rather than
 * with a placeholder.
 */
export const EMAIL_WAITLISTED = {
  subject: 'Waiting list — and what that actually means',
  beforeCoachLine: [
    "You're on the waiting list, and I want to be straight with you about what that means, because most places use that word to mean no.",
    "I don't. It means I liked what you sent and I don't have the room right now. I work with a small number of goalies at a time on purpose — the moment I take more than I can read properly, the whole thing stops being worth anything.",
  ],
  afterCoachLine: ['When a place opens, I go to this list first.'],
} as const;

/** 3.6 · Email — not this time. */
export const EMAIL_DECLINED = {
  subject: 'Straight answer',
  body: [
    "I'm not going to take you on right now, and you deserve the real reason rather than a polite one.",
    "What I work with is a goalie who will do a small thing four times a week for a season. It's not about level and it's not about age. If that's where you are later — a different season, a different year — send it again. I'll read it again.",
    'Keep working.',
  ],
} as const;

/** 3.7 · The three admin buttons. */
export const ADMIN_DECISION_LABELS = {
  approve: 'Approve — send invite',
  waitlist: 'Waiting list',
  decline: 'Not this time',
} as const;

/** 3.7 · The confirmation before any of the three fires. */
export function decisionConfirmQuestion(name: string): string {
  return `Send this to ${name}? They will receive it immediately.`;
}

/** 3.8 · Content gate — approved, but the call has not happened yet. */
export const PRE_CALL_GATE = {
  heading: "You're in — this opens after our call.",
  button: 'Book your call',
} as const;
