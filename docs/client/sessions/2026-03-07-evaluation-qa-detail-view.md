# Add Detailed Q&A View to Evaluation Page

**Date:** March 7, 2026
**Type:** Feature - Coach/Admin UI Enhancement
**Time Investment:** 1 hour

## Summary

Added a collapsible "Assessment Responses" section to the coach evaluation page showing individual assessment questions and answers. Displays question codes, question text, selected answers, and color-coded scores grouped by category.

## Goals

- Add collapsible section to coach evaluation page showing individual assessment questions and answers
- Display question codes, question text, selected answers, and color-coded scores
- Group responses by category for easier reading

## Deliverables

### Completed
- ✅ Added new "Assessment Responses" collapsible section to evaluation page
- ✅ Imported `GOALIE_ASSESSMENT_QUESTIONS` to look up question text and option details
- ✅ Created helper functions: `getQuestionById()`, `getSelectedOptionText()`, `getScoreBadgeColor()`
- ✅ Implemented `responsesByCategory` memoized grouping of assessment responses
- ✅ Built expandable UI showing all 28 questions grouped by 7 categories

### UI Features
- Collapsible header with chevron icon toggle
- Category headers with icons and question counts
- Each question shows: code (Q1.1), question text, answer text, color-coded score badge
- Score badge colors: green (≥3.1), blue (2.2-3.1), amber (<2.2)
- Clean layout with background cards for each question

## Files Modified

### Modified
- `app/coach/students/[studentId]/evaluation/page.tsx` - Added imports (useMemo, ChevronDown/Up, AssessmentResponse, GOALIE_ASSESSMENT_QUESTIONS), helper functions, state, and new UI section

## Technical Notes

### Key Decisions
- **Decision:** Use collapsible section instead of always-visible
  - **Rationale:** Page already has substantial content; collapse keeps it manageable while allowing detailed drill-down
  - **Alternatives:** Separate tab, modal (rejected - adds navigation friction)

- **Decision:** Group by category with category headers
  - **Rationale:** Matches Category Breakdown card structure; coaches can correlate scores with specific answers
  - **Alternatives:** Flat list (rejected - too long to scan)

### Implementation Details
- Used existing `GOALIE_CATEGORIES` array to maintain consistent category ordering
- `useMemo` for `responsesByCategory` to avoid recomputation on every render
- Score badge uses same color thresholds as existing progress bars for consistency
- Question/option lookup handles both single and multi-select responses

## Commits

- `8539b7a` - feat(coach): add detailed Q&A view to evaluation page

## Testing & Validation

- [x] TypeScript compiles with zero errors
- [x] Build succeeds
- [x] Code follows existing patterns in file

## Progress Impact

- Coach evaluation page enhancement: Complete
- Coaches can now see exactly how students answered each assessment question
