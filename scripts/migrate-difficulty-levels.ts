/**
 * Script to migrate difficulty levels from beginner/intermediate/advanced
 * to introduction/development/refinement
 *
 * Usage: npx tsx scripts/migrate-difficulty-levels.ts [--dry-run]
 *
 * Options:
 *   --dry-run    Show what would be updated without making changes
 *   --revert     Revert back to old difficulty levels
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!privateKey || !process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    console.error('❌ Missing Firebase Admin credentials in .env.local');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = admin.firestore();

// Difficulty mapping
const DIFFICULTY_MAP: Record<string, string> = {
  'beginner': 'introduction',
  'intermediate': 'development',
  'advanced': 'refinement',
};

const REVERSE_DIFFICULTY_MAP: Record<string, string> = {
  'introduction': 'beginner',
  'development': 'intermediate',
  'refinement': 'advanced',
};

interface MigrationStats {
  collection: string;
  found: number;
  updated: number;
  skipped: number;
}

async function migrateCollection(
  collectionName: string,
  fieldPath: string,
  difficultyMap: Record<string, string>,
  dryRun: boolean
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    collection: collectionName,
    found: 0,
    updated: 0,
    skipped: 0,
  };

  try {
    const snapshot = await db.collection(collectionName).get();
    stats.found = snapshot.size;

    console.log(`\n📁 Processing ${collectionName} (${snapshot.size} documents)...`);

    const batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Handle nested field paths like 'profile.experienceLevel'
      const fieldParts = fieldPath.split('.');
      let currentValue: any = data;
      for (const part of fieldParts) {
        currentValue = currentValue?.[part];
      }

      if (currentValue && difficultyMap[currentValue]) {
        const newValue = difficultyMap[currentValue];

        if (dryRun) {
          console.log(`  📝 Would update ${doc.id}: ${fieldPath} "${currentValue}" → "${newValue}"`);
        } else {
          batch.update(doc.ref, {
            [fieldPath]: newValue,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          batchCount++;
        }
        stats.updated++;

        // Firestore batch limit is 500
        if (!dryRun && batchCount >= 450) {
          await batch.commit();
          batchCount = 0;
        }
      } else {
        stats.skipped++;
      }
    }

    // Commit remaining batch operations
    if (!dryRun && batchCount > 0) {
      await batch.commit();
    }

    console.log(`  ✅ ${collectionName}: ${stats.updated} updated, ${stats.skipped} skipped`);

  } catch (error: any) {
    if (error.code === 5) {
      // Collection doesn't exist, skip silently
      console.log(`  ⏭️  ${collectionName}: Collection not found, skipping`);
    } else {
      console.error(`  ❌ Error processing ${collectionName}:`, error.message);
    }
  }

  return stats;
}

async function runMigration(dryRun: boolean, revert: boolean) {
  const mode = revert ? 'REVERT' : 'MIGRATE';
  const difficultyMap = revert ? REVERSE_DIFFICULTY_MAP : DIFFICULTY_MAP;

  console.log('\n' + '='.repeat(60));
  console.log(`🔄 Difficulty Levels Migration - ${mode} Mode`);
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made');
  }

  if (revert) {
    console.log('⚠️  REVERT MODE - Converting back to beginner/intermediate/advanced');
  } else {
    console.log('📋 Converting: beginner → introduction, intermediate → development, advanced → refinement');
  }

  const allStats: MigrationStats[] = [];

  // Collections to migrate with their difficulty field paths
  const collections = [
    { name: 'sports', field: 'difficulty' },
    { name: 'skills', field: 'difficulty' },
    { name: 'video_quizzes', field: 'difficulty' },
    { name: 'courses', field: 'difficulty' },
    { name: 'users', field: 'profile.experienceLevel' },
    { name: 'custom_content_library', field: 'difficulty' },
  ];

  for (const { name, field } of collections) {
    const stats = await migrateCollection(name, field, difficultyMap, dryRun);
    allStats.push(stats);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary');
  console.log('='.repeat(60));

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const stats of allStats) {
    if (stats.found > 0) {
      console.log(`  ${stats.collection}: ${stats.updated} updated, ${stats.skipped} skipped`);
      totalUpdated += stats.updated;
      totalSkipped += stats.skipped;
    }
  }

  console.log('-'.repeat(60));
  console.log(`  TOTAL: ${totalUpdated} documents ${dryRun ? 'would be ' : ''}updated`);
  console.log('='.repeat(60));

  if (dryRun && totalUpdated > 0) {
    console.log('\n💡 To apply these changes, run without --dry-run:');
    console.log('   npx tsx scripts/migrate-difficulty-levels.ts');
  }

  if (!dryRun && totalUpdated > 0) {
    console.log('\n✅ Migration completed successfully!');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const revert = args.includes('--revert');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Difficulty Levels Migration Script

Usage: npx tsx scripts/migrate-difficulty-levels.ts [options]

Options:
  --dry-run    Show what would be updated without making changes
  --revert     Revert back to old difficulty levels (introduction → beginner, etc.)
  --help, -h   Show this help message

Examples:
  npx tsx scripts/migrate-difficulty-levels.ts --dry-run    # Preview changes
  npx tsx scripts/migrate-difficulty-levels.ts              # Run migration
  npx tsx scripts/migrate-difficulty-levels.ts --revert     # Revert migration
`);
  process.exit(0);
}

runMigration(dryRun, revert)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
