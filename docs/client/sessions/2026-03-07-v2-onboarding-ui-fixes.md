# V2 Onboarding UI Fixes

**Date:** March 7, 2026
**Type:** Bug Fix / UI Improvement
**Time Investment:** 1 hour

## Summary

Fixed V2 onboarding UI proportions to match old onboarding styling. Fixed assessment question stuck issue (not advancing after answering).

## Goals

- Fix V2 onboarding UI proportions to match old onboarding styling
- Fix assessment question stuck issue (not advancing after answering)

## Deliverables

### Completed
- ✅ Fixed V2 intake screen UI proportions:
  - Progress dots increased from `w-2.5 h-2.5` to `w-3 h-3`
  - Removed `max-w-lg` constraint on options container
  - Added letter badges (A, B, C, D) matching old design
  - Increased badge size from `w-6 h-6` to `w-10 h-10`
  - Changed gap from `gap-3` to `gap-4`

- ✅ Fixed V2 progress bar proportions:
  - Progress bar height from `h-1.5` to `h-2`
  - Icon sizes from `w-8 h-8` to `w-10 h-10 sm:w-12 sm:h-12`
  - Inner icons from `w-4 h-4` to `w-5 h-5 sm:w-6 sm:h-6`
  - First connector from `w-4 sm:w-6` to `w-4 sm:w-8`
  - Category connectors from `w-2 sm:w-4` to `w-4 sm:w-6`

- ✅ Fixed critical bug: Assessment questions not advancing after selection
  - Root cause: `AssessmentQuestionV2` component maintained internal state (`selectedId`, `isSubmitting`) that wasn't reset when parent provided new question
  - Solution: Added `key={currentQuestion.id}` to force React to remount component on question change

## Files Modified

### Modified
- `src/components/onboarding/intake-screen.tsx` - Fixed proportions (progress dots, options container, letter badges)
- `src/components/onboarding/onboarding-progress-v2.tsx` - Fixed proportions (bar height, icon sizes, connectors)
- `app/onboarding/page.tsx` - Added key prop to AssessmentQuestionV2 to fix stuck issue

## Technical Notes

### Issues Encountered
- **Issue:** Assessment flow stuck after answering first question in feelings category
  - **Root Cause:** React reused same `AssessmentQuestionV2` instance when question changed, keeping internal `isSubmitting=true` state
  - **Resolution:** Added `key` prop with `currentQuestion.id` to force fresh component instance per question

### Key Decisions
- **Decision:** Use `key` prop instead of `useEffect` for state reset
  - **Rationale:** Cleaner solution - React handles full state reset automatically on remount
  - **Alternatives:** Could use `useEffect` watching `question.id` to reset state, but `key` prop is more idiomatic React

### Implementation Details
- Letter badges show A, B, C, D for unselected options, checkmark for selected
- All icon containers changed from `rounded-lg` to `rounded-full` for consistency
- Progress bar icons now responsive with `sm:` breakpoint variants

## Commits

- `5b308e1` - fix(onboarding): adjust V2 UI proportions to match old onboarding
- `fd6aea4` - fix(onboarding): reset assessment question state on question change

## Testing & Validation

- [x] Build passes with zero TypeScript errors
- [x] Visual verification of UI proportions
- [x] Assessment question advancement verified via console logs

## Progress Impact

- V2 Onboarding UI: Bug fixes complete
- V2 Goalie Onboarding: Critical bugs fixed
