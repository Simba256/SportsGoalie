# Curriculum Improvements & Difficulty Level Renaming

**Date:** February 28, 2026
**Type:** Enhancement / Refactor / Migration
**Time Investment:** 5 hours

## Summary

Enhanced the curriculum system with improved service methods and renamed difficulty levels from Beginner/Intermediate/Advanced to Introduction/Development/Refinement across the entire platform. Created and executed data migration for 48 existing Firestore documents.

## Goals

- Add admin dashboard access to custom curriculum management
- Enhance service methods with static helpers
- Rename difficulty levels to better reflect learning progression
- Create and run data migration for existing Firestore documents
- Improve content browser UI layout

## Deliverables

### Completed
- ✅ **Admin Dashboard Link:** Added Custom Curriculum card to admin dashboard, links directly to `/coach/students` for all students view
- ✅ **Service Method Enhancement:** Added static `toFirestore` and `fromFirestore` helper methods to CustomCurriculumService and CustomContentService
- ✅ **New API Method:** Added `getQuizzesBySport` method to VideoQuizService
- ✅ **Difficulty Level Renaming:** Changed all difficulty levels across 22+ files including types, validation, UI, and seeding data
- ✅ **Data Migration:** Created and executed migration script - updated 48 documents (22 sports, 12 skills, 14 video_quizzes)
- ✅ **Content Browser Enhancement:** Improved dialog layout with proper flex containment
- ✅ Updated Firestore security rules validation for new difficulty values
- ✅ Updated Zod validation schema for difficulty levels
- ✅ Updated all test files with new difficulty values
- ✅ Updated analytics components to use new difficulty colors
- ✅ Added migration 006 to migration.service.ts
- ✅ Created standalone migration script with dry-run support

## Files Modified

### Created
- `scripts/migrate-difficulty-levels.ts` - Standalone migration script with dry-run and revert support

### Modified
- `app/admin/page.tsx` - Added Custom Curriculum link
- `src/lib/database/services/custom-curriculum.service.ts` - Added static toFirestore/fromFirestore methods
- `src/lib/database/services/custom-content.service.ts` - Added static toFirestore/fromFirestore methods
- `src/lib/database/services/video-quiz.service.ts` - Added getQuizzesBySport method
- `src/lib/database/migrations/migration.service.ts` - Added migration 006 for difficulty levels
- `src/components/coach/content-browser.tsx` - Improved dialog layout with flex
- `src/types/index.ts` - Changed DifficultyLevel type values
- `firestore.rules` - Updated isValidDifficulty function
- `src/lib/validation/schemas.ts` - Updated difficultyLevelSchema enum
- Multiple test files - Updated with new difficulty values
- Multiple admin pages - Updated difficulty select options
- Multiple seeding files - Updated sample data

## Technical Notes

### Key Decisions
- **Decision:** Add static helper methods for Firestore conversion
  - **Rationale:** Maintains existing static method pattern in services

- **Decision:** Create standalone migration script in addition to migration service
  - **Rationale:** Allows direct execution without needing to trigger through app

### Implementation Details
- Static `toFirestore` recursively converts Date objects to Firestore Timestamps
- Migration script supports `--dry-run` and `--revert` flags
- Content browser uses `flex flex-col overflow-hidden` on DialogContent

### Migration Results
- **sports:** 22 documents updated
- **skills:** 12 documents updated
- **video_quizzes:** 14 documents updated
- **Total:** 48 documents migrated successfully

## Commits

- `742f33f` - feat: add difficulty level migration and content browser improvements
- `7f0a8a2` - feat(admin): link custom curriculum to students list directly

## Testing & Validation

- [x] Manual testing completed - curriculum creation works
- [x] Content browser loads successfully
- [x] Migration executed successfully (48 documents)
- [x] Build verified after all changes

## Progress Impact

- Terminology update completed across codebase
- Data migration completed successfully
- Curriculum system enhanced
