/**
 * The decision email for one applicant, built the same way for the preview and
 * for the send.
 *
 * H-25 depends on this being one function. The preview route shows the sender
 * what this returns; the decision route calls it again at send time and
 * compares fingerprints. If the two routes assembled the email separately, the
 * check would be comparing two different recipes and could pass while the
 * words differed.
 *
 * Server only — it reads the settings through the Admin SDK.
 */

import {
  applicantFirstName,
  buildApplicationApproved,
  buildApplicationDeclined,
  buildApplicationWaitlisted,
  MissingBookingLinkError,
  type ApplicationEmail,
} from '@/lib/emails/application-emails';
import { emailFingerprint } from '@/lib/applications/email-fingerprint';
import { getBookingUrl, getWaitlistLine } from '@/lib/settings/applicant-settings.server';
import { logger } from '@/lib/utils/logger';
import type { ApplicationDecision } from '@/types/application';

export interface PreparedDecisionEmail {
  to: string;
  email: ApplicationEmail;
  previewHash: string;
}

/**
 * Why a decision email could not be put together, with the HTTP status and the
 * words the admin screen shows. Both routes turn it into the same response.
 */
export class DecisionEmailUnavailableError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'DecisionEmailUnavailableError';
  }
}

/**
 * `user` is the applicant's `users` document.
 *
 * Throws `DecisionEmailUnavailableError` when the email cannot go: no address
 * on the account, no booking link for an approval (H-26), or the waiting-list
 * line could not be read.
 */
export async function prepareDecisionEmail(
  decision: ApplicationDecision,
  user: FirebaseFirestore.DocumentData
): Promise<PreparedDecisionEmail> {
  const to = typeof user.email === 'string' ? user.email.trim() : '';
  if (!to) {
    throw new DecisionEmailUnavailableError(
      'This applicant has no email address on their account, so nothing can be sent to them.',
      400
    );
  }

  const firstName = applicantFirstName(user.displayName);

  let email: ApplicationEmail;
  if (decision === 'approve') {
    try {
      email = buildApplicationApproved(firstName, await getBookingUrl());
    } catch (error) {
      if (error instanceof MissingBookingLinkError) {
        throw new DecisionEmailUnavailableError(
          'There is no booking link set, and the approval email cannot go without one. ' +
            'Add it under System Settings → General → Booking link, then approve again.',
          409
        );
      }
      throw error;
    }
  } else if (decision === 'waitlist') {
    let line: string;
    try {
      line = await getWaitlistLine();
    } catch (error) {
      logger.error('Could not read the waiting-list line', 'Applications-Admin-API', error);
      throw new DecisionEmailUnavailableError(
        'Could not read the waiting-list line from settings. Nothing was sent — try again in a moment.',
        503
      );
    }
    email = buildApplicationWaitlisted(firstName, line);
  } else {
    email = buildApplicationDeclined(firstName);
  }

  return { to, email, previewHash: emailFingerprint(to, email) };
}
