import { db } from '@/lib/firebase/config';
import {
  collection, doc, setDoc, serverTimestamp, getDocs, query, where,
} from 'firebase/firestore';
import { TrainingAnalytics, detectTrainingMilestones } from './analytics';
import { NotificationRecord, NotificationRecipient } from '@/types/charting';

/** Mastery thresholds that trigger notifications */
const MASTERY_THRESHOLDS = [10, 20, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];

/** Check if any threshold was crossed between prevPercent → nextPercent */
export function crossedThresholds(prev: number, next: number): number[] {
  return MASTERY_THRESHOLDS.filter(t => prev < t && next >= t);
}

interface MilestoneTriggerInput {
  goalieId: string;
  goalieDisplayName?: string;
  goalieEmail?: string;
  prevAnalytics: TrainingAnalytics;
  nextAnalytics: TrainingAnalytics;
}

/**
 * Fire milestone notifications if thresholds were crossed.
 * Saves NotificationRecords to Firestore. Email delivery handled server-side.
 */
export async function triggerMilestoneNotifications({
  goalieId,
  goalieDisplayName,
  prevAnalytics,
  nextAnalytics,
}: MilestoneTriggerInput): Promise<void> {
  const milestones = detectTrainingMilestones(prevAnalytics, nextAnalytics);
  const thresholds = crossedThresholds(prevAnalytics.masteryPercent, nextAnalytics.masteryPercent);

  // Build combined list of events to notify about
  const events: Array<{ type: NotificationRecord['type']; label: string; description: string; masteryPercent?: number }> = [
    ...milestones.map(m => ({
      type: 'mastery_increment' as const,
      label: m.label,
      description: m.description,
      masteryPercent: m.value,
    })),
    ...thresholds
      .filter(t => !milestones.some(m => m.value === t))
      .map(t => ({
        type: 'mastery_increment' as const,
        label: `${t}% Mastery`,
        description: `${goalieDisplayName ?? 'Your goalie'} just crossed ${t}% mastery in their training!`,
        masteryPercent: t,
      })),
  ];

  if (events.length === 0) return;

  // Load permissioned recipients (parents/coaches linked to this goalie)
  const recipients = await getPermissionedRecipients(goalieId);

  // Write a NotificationRecord for each event
  const writes = events.map(async event => {
    const ref = doc(collection(db, 'notifications'));
    const record: Omit<NotificationRecord, 'id'> = {
      goalieId,
      goalieDisplayName,
      type: event.type,
      label: event.label,
      description: event.description,
      triggeredAt: serverTimestamp() as unknown as import('@/types/charting').NotificationRecord['triggeredAt'],
      masteryPercent: event.masteryPercent,
      recipients,
      status: 'pending',
    };
    await setDoc(ref, { id: ref.id, ...record });
  });

  await Promise.allSettled(writes);
}

/** Load all permissioned recipients for a goalie (parents + coaches with in_app or email opt-in) */
async function getPermissionedRecipients(goalieId: string): Promise<NotificationRecipient[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'notification_permissions'), where('goalieId', '==', goalieId), where('optedIn', '==', true))
    );
    return snap.docs.map(d => d.data() as NotificationRecipient);
  } catch {
    return [];
  }
}

/** Load pending notifications for a user (parent or coach) */
export async function getInAppNotifications(userId: string): Promise<NotificationRecord[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'notifications'), where('status', '==', 'pending'))
    );
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as NotificationRecord))
      .filter(n => n.recipients.some(r => r.userId === userId && r.channel === 'in_app' && r.optedIn));
  } catch {
    return [];
  }
}
