# Navigation Cleanup

**Date:** March 6, 2026
**Type:** UI/UX
**Time Investment:** 1 hour

## Summary

Renamed "Courses" to "Pillars" in navigation to match content. Removed "Quizzes" link from navigation. Removed "Dashboard" link from student navigation.

## Goals

- Rename "Courses" to "Pillars" in navigation to match content
- Remove "Quizzes" link from navigation
- Remove "Dashboard" link from student navigation

## Deliverables

### Navigation Updates

1. ✅ **Renamed "Courses" to "Pillars"**
   - Updated desktop nav link text
   - Updated mobile nav link text
   - Link still points to `/pillars` (correct)

2. ✅ **Removed "Quizzes" navigation link**
   - Removed from desktop nav (PillLink component)
   - Removed from mobile nav (MobileLink component)
   - Rationale: Students should encounter quizzes naturally during their studies, not browse them as a separate section

3. ✅ **Removed "Dashboard" navigation link**
   - Removed from desktop nav for students
   - Removed from mobile nav for students
   - Rationale: Redundant - students can access pillars and progress directly

## Files Modified

### Modified Files (1)
- `src/components/layout/header.tsx` - Updated nav link text, removed Quizzes and Dashboard links

## Technical Notes

- The `/quizzes` and `/dashboard` routes still exist for direct access if needed
- This is a UX improvement - cleaner navigation focused on core student actions

## Commits

- `fa55e27` fix(nav): rename Courses to Pillars and remove Quizzes link
- `8b0892f` fix(nav): remove Dashboard link from student navigation

## Progress Impact

- Navigation cleanup: Complete
- UX improvement for cleaner student experience
