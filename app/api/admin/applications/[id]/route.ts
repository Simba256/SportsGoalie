import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdminRequest } from '@/lib/auth/admin-request';
import { emailService } from '@/lib/services/email.service';
import { logger } from '@/lib/utils/logger';
import { toApplicantSummary, toIso } from '@/lib/applications/applicant-summary.server';
import { actionRefusal } from '@/lib/applications/decision-rules';
import {
  DecisionEmailUnavailableError,
  prepareDecisionEmail,
} from '@/lib/applications/decision-email.server';
import type { ApplicantProfile, ApplicationDecision, ApplicationStatus } from '@/types/application';

/**
 * Admin: act on one application.
 *
 *   POST /api/admin/applications/[id] — approve, waitlist, decline, or open.
 *
 * THE FLOW (H-23): approve → the call → open.
 * Approving sends the invitation with the booking link and moves the applicant
 * to `awaiting_call`. They stay walled: the content opens after the call, not
 * before it. "Open account" is the separate step Michael takes once the call
 * has happened; it moves them to `approved` and sends nothing.
 *
 * APPROVAL DOES NOT USE THE INVITATION FLOW, AND THAT IS DELIBERATE.
 * The existing invitation flow (/auth/accept-invite) *creates a new account*
 * from an email address — which for an applicant would produce a second, empty
 * account and strand the questionnaire they have already done on the first
 * one. That is the one thing Michael was clearest about not wanting: "they
 * never fill it in twice, their record starts the day they applied". So
 * approval writes the coach and track onto the account that already exists
 * and emails the booking link, which is what the invitation was for.
 *
 * NOTHING GOES OUT UNSEEN (H-25).
 * Each of the three decisions sends an email, and the sender must have seen it
 * in full first. The screen fetches the email from the preview route next door,
 * which returns it with a fingerprint; this route rebuilds the email and only
 * sends when the fingerprint still matches. The email is built BEFORE anything
 * is written, so a decision that cannot be emailed — no booking link, no
 * address — is refused whole instead of half-recorded.
 *
 * Once the email is built, the status write and the send are separate: the
 * decision is recorded first and stands whether or not the email leaves. A
 * failed send is reported back to the screen so it can be followed up by hand,
 * not swallowed.
 */

/**
 * Admin: read one applicant in full.
 *
 *   GET /api/admin/applications/[id]
 *
 * Everything the review screen needs in one round trip: the same summary the
 * queue row showed, the whole questionnaire, and the coach list so the approve
 * dialog works without going back to the queue endpoint.
 *
 * Only the raw answers are returned. Resolving a stored option id back to the
 * words the applicant clicked is the screen's job, against the question bank —
 * doing it here would freeze today's wording into the response and quietly
 * diverge from the questionnaire the next time a question is edited.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  const { id } = await params;

  try {
    const [userDoc, profileDoc, coachSnap] = await Promise.all([
      adminDb.collection('users').doc(id).get(),
      adminDb.collection('studentBaselineProfiles').doc(id).get(),
      adminDb.collection('users').where('role', '==', 'coach').limit(200).get(),
    ]);

    const user = userDoc.data();
    if (!userDoc.exists || !user) {
      return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 });
    }
    // Same guard as the decision below: this screen shows a questionnaire and
    // offers to wall or unwall an account, neither of which belongs anywhere
    // near an ordinary member's record.
    if (!user.applicationStatus) {
      return NextResponse.json(
        { success: false, error: 'That account is a member, not an applicant.' },
        { status: 400 }
      );
    }

    const raw = profileDoc.exists ? profileDoc.data() : undefined;

    const profile: ApplicantProfile | null = raw
      ? {
          submittedAt: toIso(raw.submittedAt),
          responses: (raw.responses ?? {}) as Record<string, string | string[]>,
          openExtras: (raw.openExtras ?? {}) as Record<string, string>,
          driverOrPassenger: raw.driverOrPassenger ?? null,
          signupIntake: (raw.signupIntake ?? null) as Record<string, unknown> | null,
          sectionsCompleted: Array.isArray(raw.sectionsCompleted) ? raw.sectionsCompleted : [],
          intelligenceProfile: raw.intelligenceProfile ?? null,
        }
      : null;

    const coaches = coachSnap.docs
      .map(doc => ({ id: doc.id, name: (doc.data().displayName as string) ?? doc.data().email ?? '(unnamed coach)' }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      applicant: toApplicantSummary(id, user, raw),
      profile,
      coaches,
    });
  } catch (error) {
    logger.error('Failed to load one application', 'Applications-Admin-API', { id, error });
    return NextResponse.json({ success: false, error: 'Failed to load the application' }, { status: 500 });
  }
}

const decisionSchema = z.object({
  decision: z.enum(['approve', 'waitlist', 'decline', 'open']),
  assignedCoachId: z.string().trim().max(200).optional(),
  assignedCoachName: z.string().trim().max(200).optional(),
  tier: z.enum(['automated', 'custom']).optional(),
  note: z.string().trim().max(2000).optional(),
  previewHash: z.string().regex(/^[a-f0-9]{64}$/, 'Invalid preview fingerprint').optional(),
});

const STATUS_FOR: Record<ApplicationDecision, ApplicationStatus> = {
  // Approved and invited, not yet open — see the note at the top.
  approve: 'awaiting_call',
  waitlist: 'waitlisted',
  decline: 'declined',
};

/** The applicant's record moved between the check and the write. */
class StaleApplicantError extends Error {}

const STALE_MESSAGE =
  'This applicant changed while you were deciding, so nothing was sent. Reload and look again.';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  const { id } = await params;

  try {
    const parsed = decisionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid decision' },
        { status: 400 }
      );
    }
    const { decision, assignedCoachId, assignedCoachName, tier, note, previewHash } = parsed.data;

    // A custom-track goalie without a coach has nobody to work with. Caught
    // here as well as in the dialog, because this route is callable directly.
    if (decision === 'approve' && tier === 'custom' && !assignedCoachId) {
      return NextResponse.json(
        { success: false, error: 'A custom-track goalie needs a coach assigned.' },
        { status: 400 }
      );
    }

    if (decision !== 'open' && !previewHash) {
      return NextResponse.json(
        { success: false, error: 'Look at the email before sending it — nothing was sent.' },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection('users').doc(id);
    const userDoc = await userRef.get();
    const user = userDoc.data();

    if (!userDoc.exists || !user) {
      return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 });
    }
    // Never let this route touch an ordinary member. Without the guard, a
    // mistyped id would wall an existing goalie out of their own account.
    if (!user.applicationStatus) {
      return NextResponse.json(
        { success: false, error: 'That account is a member, not an applicant.' },
        { status: 400 }
      );
    }

    const status = user.applicationStatus as ApplicationStatus;
    const refusal = actionRefusal(status, decision);
    if (refusal) {
      return NextResponse.json({ success: false, error: refusal }, { status: 409 });
    }

    const adminDoc = await adminDb.collection('users').doc(auth.uid).get();
    const decidedByName: string = adminDoc.data()?.displayName ?? 'Admin';

    /**
     * Writes `update` only if the applicant is still exactly who and where they
     * were when this request read them. Two tabs clicking at once would
     * otherwise both pass the status check above and both send the email.
     */
    const writeIfUnchanged = (update: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>) =>
      adminDb.runTransaction(async tx => {
        const current = (await tx.get(userRef)).data();
        if (
          !current ||
          current.applicationStatus !== user.applicationStatus ||
          current.email !== user.email ||
          current.displayName !== user.displayName
        ) {
          throw new StaleApplicantError();
        }
        tx.update(userRef, update);
      });

    // ── Open the account after the call. No email, so no preview. ──────────
    if (decision === 'open') {
      try {
        await writeIfUnchanged({
          applicationStatus: 'approved',
          applicationOpenedAt: FieldValue.serverTimestamp(),
          applicationOpenedBy: auth.uid,
          applicationOpenedByName: decidedByName,
        });
      } catch (error) {
        if (error instanceof StaleApplicantError) {
          return NextResponse.json({ success: false, error: STALE_MESSAGE }, { status: 409 });
        }
        throw error;
      }
      return NextResponse.json({ success: true, status: 'approved', decidedByName });
    }

    // ── The three decisions. Build the email first, check it is the one shown.
    let prepared;
    try {
      prepared = await prepareDecisionEmail(decision, user);
    } catch (error) {
      if (error instanceof DecisionEmailUnavailableError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.status });
      }
      throw error;
    }

    if (prepared.previewHash !== previewHash) {
      return NextResponse.json(
        {
          success: false,
          code: 'preview_stale',
          error: 'The email changed since you looked at it, so nothing was sent. Check the new version and send again.',
        },
        { status: 409 }
      );
    }

    try {
      await writeIfUnchanged({
        applicationStatus: STATUS_FOR[decision],
        applicationDecidedAt: FieldValue.serverTimestamp(),
        applicationDecidedBy: auth.uid,
        applicationDecidedByName: decidedByName,
        // Reset for this decision, so an earlier decision's sent email can
        // never stand in for this one's failed send.
        applicationDecisionEmailSent: false,
        ...(note ? { applicationNote: note } : {}),
        // Approval only: the coach and track. These are the same two fields the
        // invitation would have set, written onto the account that already exists.
        ...(decision === 'approve' && tier ? { workflowType: tier } : {}),
        ...(decision === 'approve' && assignedCoachId ? { assignedCoachId } : {}),
        ...(decision === 'approve' && assignedCoachName ? { assignedCoachName } : {}),
      });
    } catch (error) {
      if (error instanceof StaleApplicantError) {
        return NextResponse.json({ success: false, error: STALE_MESSAGE }, { status: 409 });
      }
      throw error;
    }

    let emailSent = false;
    try {
      await emailService.sendEmail({
        to: prepared.to,
        subject: prepared.email.subject,
        text: prepared.email.text,
        html: prepared.email.html,
        // Every one of these three invites a reply, so replies go to Michael.
        replyTo: process.env.CONTACT_NOTIFY_EMAIL?.split(',')[0]?.trim() || 'info@smartergoalie.com',
      });
      emailSent = true;
    } catch (error) {
      logger.error('Application decision saved but email failed', 'Applications-Admin-API', {
        id,
        decision,
        error,
      });
    }

    if (emailSent) {
      // The email has gone either way; failing to note it must not turn a sent
      // email into a reported failure and invite a second send.
      await userRef.update({ applicationDecisionEmailSent: true }).catch(error =>
        logger.error('Decision email sent but not marked as sent', 'Applications-Admin-API', { id, error })
      );
    }

    return NextResponse.json({
      success: true,
      status: STATUS_FOR[decision],
      emailSent,
      decidedByName,
    });
  } catch (error) {
    logger.error('Failed to record application decision', 'Applications-Admin-API', {
      id,
      error,
    });
    return NextResponse.json({ success: false, error: 'Failed to record the decision' }, { status: 500 });
  }
}
