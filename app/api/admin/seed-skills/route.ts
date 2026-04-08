import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { PILLAR_SKILLS } from '@/lib/database/seeding/pillar-skills-seed';

/**
 * POST /api/admin/seed-skills
 *
 * Seeds all 63 goalie skills (7 pillars × 3 levels × 3 skills) into Firestore.
 * Skips skills that already exist (matched by sportId + name).
 *
 * Requires admin role (enforced by middleware).
 */
export async function POST() {
  try {
    const skillsCollection = collection(db, 'skills');
    let created = 0;
    let skipped = 0;

    for (const skill of PILLAR_SKILLS) {
      // Check if skill already exists
      const existing = await getDocs(
        query(
          skillsCollection,
          where('sportId', '==', skill.sportId),
          where('name', '==', skill.name)
        )
      );

      if (!existing.empty) {
        skipped++;
        continue;
      }

      await addDoc(skillsCollection, {
        ...skill,
        content: '',
        externalResources: [],
        media: null,
        prerequisites: [],
        hasVideo: false,
        hasQuiz: false,
        isActive: true,
        metadata: {
          totalCompletions: 0,
          averageCompletionTime: 0,
          averageRating: 0,
          totalRatings: 0,
          difficulty: skill.difficulty,
        },
        createdBy: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      created++;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${created} skills, skipped ${skipped} existing.`,
      total: PILLAR_SKILLS.length,
      created,
      skipped,
    });
  } catch (error) {
    console.error('Failed to seed skills:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
