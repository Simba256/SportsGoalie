/**
 * The fingerprint of one decision email, exactly as it would be sent.
 *
 * H-25: the sender sees the whole email before any decision goes out. The
 * preview route returns this fingerprint alongside the email; the decision
 * route rebuilds the email at send time and refuses to send if the fingerprint
 * no longer matches. So if anything moved in between — the booking link, the
 * waiting-list line, the applicant's name or address, the wording itself — the
 * sender is asked to look again instead of sending something they never saw.
 *
 * Server only — it uses Node's crypto.
 */

import { createHash } from 'node:crypto';
import type { ApplicationEmail } from '@/lib/emails/application-emails';

export function emailFingerprint(to: string, email: ApplicationEmail): string {
  return createHash('sha256')
    .update(JSON.stringify([to, email.subject, email.text, email.html]))
    .digest('hex');
}
