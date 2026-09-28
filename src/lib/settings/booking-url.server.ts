/**
 * Server-side read of the booking link.
 *
 * The link used to live only in the environment, which meant changing it needed a
 * developer and a redeploy. It now lives on the admin System Settings screen, in
 * `app_settings/platform` under `general.bookingUrl`, so Michael can change it
 * himself between one approval and the next.
 *
 * The environment variable is kept as a fallback, not as the primary source: a
 * deployment that already has `BOOKING_URL` set keeps working unchanged until the
 * setting is filled in, and nothing has to be moved across in a particular order.
 *
 * Server only — it imports the Firebase Admin SDK.
 */

import { adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/utils/logger';
import { BOOKING_URL } from '@/lib/emails/application-emails';
import { normalizeBookingUrl } from '@/types/platform-settings';

/**
 * Returns the booking link, or an empty string when there isn't a usable one.
 *
 * Empty is a real answer, not a failure: the approval email drops its booking
 * block and asks the goalie to reply with times instead, which is the behaviour
 * that already existed when `BOOKING_URL` was unset. A Firestore read that throws
 * therefore falls back to the environment rather than failing the decision — an
 * approval must never be blocked by a settings lookup.
 */
export async function getBookingUrl(): Promise<string> {
  try {
    const snapshot = await adminDb.collection('app_settings').doc('platform').get();
    const stored = normalizeBookingUrl(snapshot.data()?.general?.bookingUrl);
    if (stored) return stored;
  } catch (error) {
    logger.error('Could not read the booking link from settings', 'BookingUrl', error);
  }
  return normalizeBookingUrl(BOOKING_URL);
}
