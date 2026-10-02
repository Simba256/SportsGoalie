/**
 * Turning a `users` document into an `ApplicantSummary`.
 *
 * Shared by the queue (`GET /api/admin/applications`) and the review screen
 * (`GET /api/admin/applications/[id]`) so the two can never disagree about what
 * an applicant's score, track or coach is — the review screen is where Michael
 * makes the decision, and it showing a different number from the row he clicked
 * would be worse than either number being wrong on its own.
 *
 * Server only — it reads Firestore Admin `Timestamp` values.
 */

import { Timestamp } from 'firebase-admin/firestore';
import type { ApplicantSummary, ApplicationStatus } from '@/types/application';

/** Firestore `Timestamp` → ISO string. Anything else becomes undefined. */
export function toIso(value: unknown): string | undefined {
  return value instanceof Timestamp ? value.toDate().toISOString() : undefined;
}

/**
 * `profile` is the matching `studentBaselineProfiles` document, or undefined for
 * an applicant who has not submitted the questionnaire yet. The user document
 * wins wherever both carry a value: the profile is what they answered, the user
 * document is what has been decided since.
 */
export function toApplicantSummary(
  id: string,
  data: FirebaseFirestore.DocumentData,
  profile?: FirebaseFirestore.DocumentData
): ApplicantSummary {
  const intake = profile?.signupIntake ?? data.signupIntake;

  return {
    id,
    email: data.email ?? '',
    displayName: data.displayName ?? data.email ?? '(no name)',
    applicationStatus: (data.applicationStatus ?? 'submitted') as ApplicationStatus,
    appliedAt: toIso(data.appliedAt),
    submittedAt: toIso(data.applicationSubmittedAt),
    decidedAt: toIso(data.applicationDecidedAt),
    decidedByName: data.applicationDecidedByName,
    decisionNote: data.applicationNote,
    openedAt: toIso(data.applicationOpenedAt),
    openedByName: data.applicationOpenedByName,

    hasProfile: !!profile,
    overallScore: typeof data.overallScore === 'number' ? data.overallScore : profile?.intelligenceProfile?.overallScore,
    pacingLevel: typeof data.pacingLevel === 'string' ? data.pacingLevel : profile?.intelligenceProfile?.pacingLevel,
    driverOrPassenger: data.driverOrPassenger ?? profile?.driverOrPassenger ?? undefined,
    ageRange: intake?.ageRange,
    experienceLevel: intake?.experienceLevel,

    assignedCoachId: data.assignedCoachId,
    assignedCoachName: data.assignedCoachName,
    tier: data.workflowType === 'custom' || data.workflowType === 'automated' ? data.workflowType : undefined,
  };
}
