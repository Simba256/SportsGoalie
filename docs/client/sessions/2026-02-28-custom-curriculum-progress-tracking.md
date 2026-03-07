# Custom Curriculum Progress Tracking

**Date:** February 28, 2026
**Type:** Feature / Bug Fix
**Time Investment:** 4 hours

## Summary

Implemented progress tracking for custom workflow students when completing content. Fixed issues preventing curriculum items from being marked as complete. Ensured student progress is persisted to Firestore.

## Goals

- Implement progress tracking for custom workflow students when completing content
- Fix issues preventing curriculum items from being marked as complete
- Ensure student progress is persisted to Firestore

## Deliverables

### Completed
- ✅ **Quiz Completion Tracking:** Added `ProgressService.recordQuizCompletion()` call to quiz page when student completes a quiz
- ✅ **Lesson Completion Tracking:** Added new `recordLessonCompletion()` method to ProgressService
- ✅ **Mark Complete Button:** Added "Mark as Complete" button to skill detail page for custom workflow students
- ✅ **Curriculum Check:** Button only shows if skill is actually in the student's curriculum
- ✅ **Static Method Fix:** Fixed "this.fromFirestore is not a function" error by using explicit class name for static methods
- ✅ **Firestore Rules Fix:** Updated security rules to allow students to update their own curriculum items
- ✅ Added comprehensive console logging for debugging curriculum operations
- ✅ Button shows correct state (completed vs not completed) based on curriculum item status
- ✅ Loading state while checking curriculum on skill page

## Files Modified

### Modified
- `app/quiz/video/[id]/page.tsx` - Added ProgressService import and recordQuizCompletion call
- `app/sports/[id]/skills/[skillId]/page.tsx` - Added Mark Complete button with curriculum checks
- `src/lib/database/services/progress.service.ts` - Added recordLessonCompletion method and debug logging
- `src/lib/database/services/custom-curriculum.service.ts` - Fixed static method references (this → class name), added debug logging
- `src/components/dashboard/CustomCurriculumDashboard.tsx` - Added debug logging for curriculum loading
- `firestore.rules` - Added student permission to update own curriculum items

## Technical Notes

### Issues Encountered and Fixed
- **"this.fromFirestore is not a function":** Static methods using `this.` to reference other static methods don't work correctly in production builds. Fixed by using explicit class name `CustomCurriculumService.fromFirestore()`.

- **"Missing or insufficient permissions":** Firestore security rules only allowed coaches/admins to update curriculum. Fixed by adding rule allowing students to update their own curriculum (but only items, updatedAt, lastModifiedBy fields).

### Key Decisions
- **Decision:** Only show "Mark Complete" for lessons in curriculum
  - **Rationale:** Prevents confusion when students access skills directly via URL that aren't in their curriculum

- **Decision:** Allow students to update only specific curriculum fields
  - **Rationale:** Students need to mark items complete, but shouldn't be able to unlock items or modify structure

### Implementation Details
- `recordLessonCompletion()` checks user's workflow type and finds matching curriculum item by contentId
- Curriculum check on skill page uses `customCurriculumService.getStudentCurriculum()` to verify item exists
- Static method references must use explicit class name in TypeScript classes with static methods that call each other

### Security Rule Change
```javascript
// Students can update their own curriculum (to mark items as complete)
(resource.data.studentId == getUserId() &&
 request.resource.data.diff(resource.data).affectedKeys().hasOnly(['items', 'updatedAt', 'lastModifiedBy']))
```

## Commits

- `8956a0d` - feat(curriculum): add progress tracking for custom workflow students
- `fcf4316` - debug: add console logs for curriculum tracking investigation
- `ac6a876` - fix: use class name instead of 'this' for static method references
- `fab17cc` - fix: only show Mark Complete button for skills in curriculum
- `4b5214d` - fix: allow students to update their own curriculum items

## Testing & Validation

- [x] Quiz completion triggers recordQuizCompletion
- [x] Lesson completion triggers recordLessonCompletion
- [x] Mark Complete button only shows for skills in curriculum
- [x] Button shows correct completed state
- [x] Firestore rules deployed and verified
- [x] Build verified after all changes

## Progress Impact

- Phase 2.0 Multi-Role Foundation: 75% (custom curriculum progress tracking working)
- Custom workflow student can now mark lessons/quizzes as complete
- Progress persists to Firestore and shows on dashboard
