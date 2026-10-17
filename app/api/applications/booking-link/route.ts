import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyUserRequest } from '@/lib/auth/admin-request';
import { logger } from '@/lib/utils/logger';
import { getBookingUrl } from '@/lib/settings/applicant-settings.server';

/**
 * GET /api/applications/booking-link — the booking link, for an approved
 * applicant waiting on their call.
 *
 * The holding screen shows a "Book your call" button in that state (copy pack
 * 3.8), so an applicant who has lost the approval email is not stuck. The link
 * lives in `app_settings`, which the rules keep admin-only, hence this route.
 *
 * Only an applicant in `awaiting_call` gets it. The link is the one thing that
 * makes booking approved-only, so anyone else — mid-application, waitlisted,
 * declined, or not an applicant at all — gets nothing. The account is read from
 * the verified token, never from the request.
 */
export async function GET(request: NextRequest) {
  const auth = await verifyUserRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const userDoc = await adminDb.collection('users').doc(auth.uid).get();
    if (userDoc.data()?.applicationStatus !== 'awaiting_call') {
      return NextResponse.json({ success: false, error: 'Not available' }, { status: 403 });
    }

    const bookingUrl = await getBookingUrl();
    return NextResponse.json(
      { success: true, bookingUrl: bookingUrl || null },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    logger.error('Failed to read the booking link for an applicant', 'Applications-API', { uid: auth.uid, error });
    return NextResponse.json({ success: false, error: 'Failed to load' }, { status: 500 });
  }
}
