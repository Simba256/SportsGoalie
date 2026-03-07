# Fix Custom Quiz Not Found Bug

**Date:** March 7, 2026
**Type:** Bug Fix
**Time Investment:** 1 hour

## Summary

Fixed the "Video quiz not found" error when clicking "Take Quiz" on custom content items. The issue was that custom content uses `content_xxx` IDs that reference the actual quiz ID stored in `video_quizzes` collection.

## Goals

- Fix the "Video quiz not found" error when clicking "Take Quiz" on custom content items

## Deliverables

### Completed
- ✅ Identified root cause: custom content uses `content_xxx` IDs that reference the actual quiz ID stored in `video_quizzes` collection
- ✅ Modified `app/quiz/video/[id]/page.tsx` to resolve custom content references before loading the quiz
- ✅ Added import for `customContentService`
- ✅ Updated `loadQuizData` function to detect `content_` prefix and resolve to actual quiz ID

### Implementation Details
When the quiz ID starts with `content_`, the code now:
1. Fetches the custom content document from `custom_content_library`
2. Parses the JSON `content` field to extract `videoQuizId`
3. Uses the resolved ID to fetch the actual quiz from `video_quizzes`

## Files Modified

### Modified
- `app/quiz/video/[id]/page.tsx` - Added custom content ID resolution logic

## Technical Notes

### Key Decisions
- **Decision:** Resolve content references at the quiz page level
  - **Rationale:** Minimal change, localizes the fix to where the problem occurs
  - **Alternatives:** Could have modified the curriculum link generation to use actual quiz IDs, but that would require more extensive changes

### Data Flow
1. Coach creates quiz → stored in `video_quizzes` with ID like `abc123`
2. Coach saves to library → stored in `custom_content_library` with ID like `content_1772609729134`, with `content` JSON containing `{ "videoQuizId": "abc123" }`
3. Curriculum assigns content → uses `content_xxx` ID
4. Student clicks quiz → NOW resolves `content_xxx` → `abc123` → fetches actual quiz

## Testing & Validation

- [x] Build compiles successfully

## Verification Steps
1. Log in as student
2. Navigate to dashboard
3. Click "Take Quiz" on a custom content item
4. Verify quiz loads and is playable
5. Verify quiz completion records progress correctly

## Progress Impact

- Custom quiz access bug: Fixed
