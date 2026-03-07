# Custom Quiz Content ID Resolution

**Date:** March 7, 2026
**Type:** Enhancement
**Time Investment:** 1 hour

## Summary

Added support for custom content ID resolution in the quiz page. Custom content uses `content_xxx` IDs that reference the actual quiz ID stored in `video_quizzes` collection. The quiz page now automatically resolves these references.

## Goals

- Enable quiz page to resolve custom content IDs to actual quiz IDs
- Support seamless quiz access for curriculum items from custom content library

## Deliverables

### Completed
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
  - **Rationale:** Minimal change, localizes the logic to where it's needed
  - **Alternatives:** Could have modified curriculum link generation to use actual quiz IDs

### Data Flow
1. Coach creates quiz → stored in `video_quizzes` with ID like `abc123`
2. Coach saves to library → stored in `custom_content_library` with ID like `content_1772609729134`, with `content` JSON containing `{ "videoQuizId": "abc123" }`
3. Curriculum assigns content → uses `content_xxx` ID
4. Student clicks quiz → resolves `content_xxx` → `abc123` → fetches actual quiz

## Testing & Validation

- [x] Build compiles successfully

## Progress Impact

- Custom quiz access: Fully supported
