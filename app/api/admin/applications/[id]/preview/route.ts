import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-request';
import { logger } from '@/lib/utils/logger';
import { actionRefusal } from '@/lib/applications/decision-rules';
import {
  DecisionEmailUnavailableError,
  prepareDecisionEmail,
} from '@/lib/applications/decision-email.server';
import type { ApplicationDecision, ApplicationStatus, DecisionEmailPreview } from '@/types/application';

/**
 * Admin: the exact email a decision would send, before it is sent (H-25).
 *
 *   GET /api/admin/applications/[id]/preview?decision=approve|waitlist|decline
 *
 * Returns the recipient, subject, plain text and HTML, plus a fingerprint of
 * all four. The confirmation dialog shows the email and hands the fingerprint
 * back with the decision; the decision route rebuilds the email and refuses to
 * send if it no longer matches. Nothing is written here.
 *
 * The same refusals apply as for the decision itself, so the dialog reports
 * "already on the waiting list" or "no booking link" before the sender has
 * read a word, not after.
 */

const DECISIONS: ApplicationDecision[] = ['approve', 'waitlist', 'decline'];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  const { id } = await params;
  const decision = request.nextUrl.searchParams.get('decision') as ApplicationDecision | null;
  if (!decision || !DECISIONS.includes(decision)) {
    return NextResponse.json({ success: false, error: 'Unknown decision' }, { status: 400 });
  }

  try {
    const userDoc = await adminDb.collection('users').doc(id).get();
    const user = userDoc.data();

    if (!userDoc.exists || !user) {
      return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 });
    }
    if (!user.applicationStatus) {
      return NextResponse.json(
        { success: false, error: 'That account is a member, not an applicant.' },
        { status: 400 }
      );
    }

    const refusal = actionRefusal(user.applicationStatus as ApplicationStatus, decision);
    if (refusal) {
      return NextResponse.json({ success: false, error: refusal }, { status: 409 });
    }

    const prepared = await prepareDecisionEmail(decision, user);
    const preview: DecisionEmailPreview = {
      to: prepared.to,
      subject: prepared.email.subject,
      text: prepared.email.text,
      html: prepared.email.html,
      previewHash: prepared.previewHash,
    };

    return NextResponse.json({ success: true, preview }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof DecisionEmailUnavailableError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    logger.error('Failed to build the decision email preview', 'Applications-Admin-API', { id, decision, error });
    return NextResponse.json({ success: false, error: 'Could not build the email preview' }, { status: 500 });
  }
}
