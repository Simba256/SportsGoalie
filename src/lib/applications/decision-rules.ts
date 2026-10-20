/**
 * Which actions make sense for an applicant in each status.
 *
 * The admin buttons and the decision route both read from here, so the screen
 * can never offer something the server will refuse, and a stale second tab
 * cannot send the same email twice: once the first click has moved the status
 * on, the second one is refused with a reason instead of mailing the applicant
 * again.
 *
 * Plain TypeScript with no server imports — the admin screen uses it too.
 */

import type { ApplicationAction, ApplicationStatus } from '@/types/application';

/**
 * The actions each status offers, in the order the buttons appear.
 *
 * `applying` offers nothing: there is no application to judge yet.
 * `awaiting_call` offers "Open account" in place of approve — the invitation
 * has already gone, and what is left is opening the content after the call.
 * Every other status offers the decisions that would change it.
 */
const ACTIONS_FOR: Record<ApplicationStatus, ApplicationAction[]> = {
  applying: [],
  submitted: ['approve', 'waitlist', 'decline'],
  waitlisted: ['approve', 'decline'],
  declined: ['approve', 'waitlist'],
  awaiting_call: ['open', 'waitlist', 'decline'],
  approved: ['waitlist', 'decline'],
};

export function availableActions(status: ApplicationStatus): ApplicationAction[] {
  return ACTIONS_FOR[status] ?? [];
}

/**
 * Why `action` cannot be taken on an applicant in `status`, in words for the
 * admin screen — or null when it can.
 */
export function actionRefusal(status: ApplicationStatus, action: ApplicationAction): string | null {
  if (availableActions(status).includes(action)) return null;

  if (status === 'applying') {
    return 'They have not sent their application yet, so there is nothing to decide on.';
  }
  if (status === 'approved' && (action === 'approve' || action === 'open')) {
    return 'Their account is already open.';
  }
  if (action === 'approve') return 'They are already approved and waiting for their call.';
  if (action === 'open') return 'An account opens only after approval and the call. Approve them first.';
  if (action === 'waitlist') return 'They are already on the waiting list.';
  return 'They have already been told not this time.';
}
