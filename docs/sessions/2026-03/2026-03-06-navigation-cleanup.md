# Navigation Cleanup

**Date:** 2026-03-06
**Time Spent:** ~20 min
**Category:** UI/UX

## Goals

- Rename "Courses" to "Pillars" in navigation to match content
- Remove "Quizzes" link from navigation
- Remove "Dashboard" link from student navigation

## Work Completed

### Navigation Updates

1. **Renamed "Courses" to "Pillars"**
   - Updated desktop nav link text
   - Updated mobile nav link text
   - Link still points to `/pillars` (correct)

2. **Removed "Quizzes" navigation link**
   - Removed from desktop nav (PillLink component)
   - Removed from mobile nav (MobileLink component)
   - Rationale: Students should encounter quizzes naturally during their studies, not browse them as a separate section

3. **Removed "Dashboard" navigation link**
   - Removed from desktop nav for students
   - Removed from mobile nav for students
   - Rationale: Redundant - students can access pillars and progress directly

## Files Modified

### Modified Files (1)
- `src/components/layout/header.tsx` - Updated nav link text, removed Quizzes and Dashboard links

## Commits

- `fa55e27` fix(nav): rename Courses to Pillars and remove Quizzes link
- `8b0892f` fix(nav): remove Dashboard link from student navigation

## Blockers

None.

## Notes

- The `/quizzes` and `/dashboard` routes still exist for direct access if needed
- This is a UX improvement - cleaner navigation focused on core student actions

## Next Steps

1. Consider whether `/quizzes` page should be removed entirely or kept for edge cases
2. Continue with any remaining 6-pillar conversion tasks
