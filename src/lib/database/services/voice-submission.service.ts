import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export type VoiceCategory = 'COMPLIMENT' | 'CONCERN' | 'QUESTION';
export type VoiceStatus = 'NEW' | 'IN_PROGRESS' | 'ANSWERED' | 'ARCHIVED' | 'ESCALATED';

export interface VoiceSubmission {
  id: string;
  parentId: string;
  parentName: string;
  goalieId: string | null;
  goalieName: string | null;
  category: VoiceCategory;
  subject: string;
  body: string;
  status: VoiceStatus;
  adminReply?: string;
  adminReplyBy?: string;
  adminReplyAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'parent_voice_submissions';

export class VoiceSubmissionService {
  async createSubmission(input: {
    parentId: string;
    parentName: string;
    goalieId: string | null;
    goalieName: string | null;
    category: VoiceCategory;
    subject: string;
    body: string;
  }): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      parentId: input.parentId,
      parentName: input.parentName,
      goalieId: input.goalieId ?? null,
      goalieName: input.goalieName ?? null,
      category: input.category,
      subject: input.subject,
      body: input.body,
      status: 'NEW' as VoiceStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async getParentSubmissions(parentId: string): Promise<VoiceSubmission[]> {
    const q = query(
      collection(db, COLLECTION),
      where('parentId', '==', parentId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        parentId: data.parentId,
        parentName: data.parentName,
        goalieId: data.goalieId ?? null,
        goalieName: data.goalieName ?? null,
        category: data.category as VoiceCategory,
        subject: data.subject,
        body: data.body,
        status: data.status as VoiceStatus,
        adminReply: data.adminReply,
        adminReplyBy: data.adminReplyBy,
        adminReplyAt: data.adminReplyAt?.toDate?.() ?? undefined,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      } as VoiceSubmission;
    });
  }

  async getAllSubmissions(filters?: {
    status?: VoiceStatus;
    category?: VoiceCategory;
  }): Promise<VoiceSubmission[]> {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));

    if (filters?.status) {
      q = query(
        collection(db, COLLECTION),
        where('status', '==', filters.status),
        orderBy('createdAt', 'desc')
      );
    } else if (filters?.category) {
      q = query(
        collection(db, COLLECTION),
        where('category', '==', filters.category),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        parentId: data.parentId,
        parentName: data.parentName,
        goalieId: data.goalieId ?? null,
        goalieName: data.goalieName ?? null,
        category: data.category as VoiceCategory,
        subject: data.subject,
        body: data.body,
        status: data.status as VoiceStatus,
        adminReply: data.adminReply,
        adminReplyBy: data.adminReplyBy,
        adminReplyAt: data.adminReplyAt?.toDate?.() ?? undefined,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      } as VoiceSubmission;
    });
  }

  async updateStatus(id: string, status: VoiceStatus): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  async replyToSubmission(
    id: string,
    adminReply: string,
    adminId: string
  ): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      adminReply,
      adminReplyBy: adminId,
      adminReplyAt: serverTimestamp(),
      status: 'ANSWERED' as VoiceStatus,
      updatedAt: serverTimestamp(),
    });
  }
}

export const voiceSubmissionService = new VoiceSubmissionService();
