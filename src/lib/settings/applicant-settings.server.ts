/**
 * Server-side reads of the two applicant-flow values Michael holds himself: the
 * booking link (copy pack 3.4) and the waiting-list line (3.5, [COACH TO SET]).
 *
 * Both live on the admin System Settings screen, in `app_settings/platform`
 * under `general`, so he can change either between one decision and the next
 * without a developer or a redeploy. `app_settings` is admin-only in the rules,
 * which is why these reads happen here, on the server, with the Admin SDK — an
 * applicant's browser could not read them directly.
 *
 * The booking link keeps the `BOOKING_URL` environment variable as a fallback,
 * so a deployment that already had it set keeps working until the setting is
 * filled in.
 *
 * Server only — it imports the Firebase Admin SDK.
 */

import { adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/utils/logger';
import { BOOKING_URL } from '@/lib/emails/application-emails';
import { normalizeBookingUrl, normalizeWaitlistLine } from '@/types/platform-settings';

async function readGeneralSettings(): Promise<Record<string, unknown> | undefined> {
  const snapshot = await adminDb.collection('app_settings').doc('platform').get();
  const general = snapshot.data()?.general;
  return general && typeof general === 'object' ? (general as Record<string, unknown>) : undefined;
}

/**
 * The booking link, or an empty string when there isn't a usable one.
 *
 * Empty is not quietly worked around: the approval email refuses to build
 * without a link (H-26), and the admin screen says to set it. A Firestore read
 * that throws falls back to the environment, so a settings hiccup does not by
 * itself block an approval that has a link configured there.
 */
export async function getBookingUrl(): Promise<string> {
  try {
    const stored = normalizeBookingUrl((await readGeneralSettings())?.bookingUrl);
    if (stored) return stored;
  } catch (error) {
    logger.error('Could not read the booking link from settings', 'ApplicantSettings', error);
  }
  return normalizeBookingUrl(BOOKING_URL);
}

/**
 * The waiting-list line, or an empty string while Michael has not set one.
 *
 * A read that throws is NOT treated as empty. Sending the waiting-list email
 * without his line because a lookup failed would send words he did not approve
 * in the preview, so the error goes up to the caller instead.
 */
export async function getWaitlistLine(): Promise<string> {
  return normalizeWaitlistLine((await readGeneralSettings())?.waitlistLine);
}
