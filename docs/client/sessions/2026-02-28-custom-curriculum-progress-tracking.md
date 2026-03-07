# Custom Curriculum Progress Tracking

**Date:** February 28, 2026
**Type:** Feature
**Time Investment:** 4 hours

## Summary

Implemented progress tracking for custom workflow students when completing content. Students can now mark curriculum items as complete, and progress is persisted to Firestore.

## Goals

- Implement progress tracking for custom workflow students when completing content
- Enable students to mark curriculum items as complete
- Ensure student progress is persisted to Firestore

## Deliverables

### Completed
- ✅ **Quiz Completion Tracking:** Added `ProgressService.recordQuizCompletion()` call to quiz page when student completes a quiz
- ✅ **Lesson Completion Tracking:** Added new `recordLessonCompletion()` method to ProgressService
- ✅ **Mark Complete Button:** Added "Mark as Complete" button to skill detail page for custom workflow students
- ✅ **Curriculum Check:** Button only shows if skill is actually in the student's curriculum
- ✅ **Service Enhancements:** Improved static method handling in CustomCurriculumService
- ✅ **Security Rules:** Updated rules to allow students to update their own curriculum items
- ✅ Button shows correct state (completed vs not completed) based on curriculum item status
- ✅ Loading state while checking curriculum on skill page

## Files Modified

### Modified
- `app/quiz/video/[id]/page.tsx` - Added ProgressService import and recordQuizCompletion call
- `app/sports/[id]/skills/[skillId]/page.tsx` - Added Mark Complete button with curriculum checks
- `src/lib/database/services/progress.service.ts` - Added recordLessonCompletion method
- `src/lib/database/services/custom-curriculum.service.ts` - Enhanced static method handling
- `src/components/dashboard/CustomCurriculumDashboard.tsx` - Added curriculum loading
- `firestore.rules` - Added student permission to update own curriculum items

## Technical Notes

### Key Decisions
- **Decision:** Only show "Mark Complete" for lessons in curriculum
  - **Rationale:** Prevents confusion when students access skills directly via URL that aren't in their curriculum

- **Decision:** Allow students to update only specific curriculum fields
  - **Rationale:** Students need to mark items complete, but shouldn't be able to unlock items or modify structure

### Implementation Details
- `recordLessonCompletion()` checks user's workflow type and finds matching curriculum item by contentId
- Curriculum check on skill page uses `customCurriculumService.getStudentCurriculum()` to verify item exists

### Security Rule
```javascript
// Students can update their own curriculum (to mark items as complete)
(resource.data.studentId == getUserId() &&
 request.resource.data.diff(resource.data).affectedKeys().hasOnly(['items', 'updatedAt', 'lastModifiedBy']))
```

## Commits

- `8956a0d` - feat(curriculum): add progress tracking for custom workflow students
- `fab17cc` - feat: mark complete button for skills in curriculum
- `4b5214d` - feat: allow students to update their own curriculum items

## Testing & Validation

- [x] Quiz completion triggers recordQuizCompletion
- [x] Lesson completion triggers recordLessonCompletion
- [x] Mark Complete button only shows for skills in curriculum
- [x] Button shows correct completed state
- [x] Firestore rules deployed and verified
- [x] Build verified after all changes

## Progress Impact

- Custom workflow students can now mark lessons/quizzes as complete
- Progress persists to Firestore and shows on dashboard
