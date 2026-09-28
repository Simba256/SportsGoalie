import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdminRequest } from '@/lib/auth/admin-request';
import { logger } from '@/lib/utils/logger';
import { toApplicantSummary } from '@/lib/applications/applicant-summary.server';
import type { ApplicantSummary, ApplicationStatus } from '@/types/application';

/**
 * Admin: the application queue.
 *
 *   GET /api/admin/applications — every applicant, plus the coach list the
 *   approve dialog needs, in one round trip.
 *
 * Applicants are ordinary `users` documents carrying `applicationStatus` —
 * see the note at the top of src/types/application.ts for why there is no
 * separate collection. That makes this a query on `users`, and it means a
 * user with no `applicationStatus` at all is an existing member who must
 * never appear here.
 */

export interface ApplicationsResponse {
  success: boolean;
  applicants?: ApplicantSummary[];
  coaches?: { id: string; name: string }[];
  error?: string;
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    // `!=` would exclude documents with no applicationStatus field at all,
    // which is what we want, but Firestore's inequality queries need an index
    // and an orderBy on the same field. An `in` over the five known values is
    // simpler, needs no index, and cannot accidentally sweep up the existing
    // membership if a sixth status is added without thinking.
    const statuses: ApplicationStatus[] = ['applying', 'submitted', 'waitlisted', 'approved', 'declined'];

    const [applicantSnap, coachSnap] = await Promise.all([
      adminDb.collection('users').where('applicationStatus', 'in', statuses).limit(500).get(),
      adminDb.collection('users').where('role', '==', 'coach').limit(200).get(),
    ]);

    // The headline numbers come from the baseline profile, so Michael can
    // triage the list without opening anything. Fetched only for applicants
    // who have actually submitted — the rest have no profile to read.
    const withProfiles = applicantSnap.docs.filter(doc => doc.data().onboardingCompleted === true);
    const profiles = new Map<string, FirebaseFirestore.DocumentData>();
    if (withProfiles.length > 0) {
      const refs = withProfiles.map(doc => adminDb.collection('studentBaselineProfiles').doc(doc.id));
      const profileDocs = await adminDb.getAll(...refs);
      for (const doc of profileDocs) {
        if (doc.exists) profiles.set(doc.id, doc.data() as FirebaseFirestore.DocumentData);
      }
    }

    const applicants: ApplicantSummary[] = applicantSnap.docs.map(doc =>
      toApplicantSummary(doc.id, doc.data(), profiles.get(doc.id))
    );

    // Newest application first. Sorted here rather than in Firestore because
    // an `in` filter plus an orderBy on a different field needs a composite
    // index, and 500 rows sort instantly.
    applicants.sort((a, b) => (b.appliedAt ?? '').localeCompare(a.appliedAt ?? ''));

    const coaches = coachSnap.docs
      .map(doc => ({ id: doc.id, name: (doc.data().displayName as string) ?? doc.data().email ?? '(unnamed coach)' }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ success: true, applicants, coaches });
  } catch (error) {
    logger.error('Failed to list applications', 'Applications-Admin-API', { error });
    return NextResponse.json({ success: false, error: 'Failed to load applications' }, { status: 500 });
  }
}
