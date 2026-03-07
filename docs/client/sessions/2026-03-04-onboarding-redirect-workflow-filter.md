# Onboarding Redirect Improvement & Coach Workflow Filter

**Date:** March 4, 2026
**Type:** Enhancement / Feature
**Time Investment:** 2 hours

## Summary

Improved onboarding redirect flow with proper auth context refresh. Added workflow type filter to coach students page.

## Goals

- Improve onboarding redirect flow after completion
- Add workflow type filter to coach students page

## Deliverables

### Completed

### 1. Improved Onboarding Redirect Flow

**Enhancement:** Added `refreshUser()` method to auth context that re-fetches user data from Firestore. Updated onboarding hook to accept `onRefreshUser` callback and call it before redirecting to dashboard.

**Changes:**
- Added onboarding fields to auth context user construction
- Implemented `refreshUser()` method for immediate user data sync

### 2. Coach Students Page Workflow Filter

Added filter tabs to `/coach/students` page with three options:

| Filter | Description |
|--------|-------------|
| All | Shows all students regardless of workflow type |
| Custom | Shows coach-managed students (curriculum features available) |
| Automated | Shows self-paced students (evaluation view only) |

**Features:**
- Workflow type badge on each student card (purple for Custom, blue for Automated)
- "Add Student" button only appears on Custom filter
- "Manage Curriculum" button only for custom workflow students
- "View Evaluation" available for all students with completed evaluations
- Student counts displayed in tab labels

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/auth/context.tsx` | Added onboarding fields to user object, added refreshUser() method |
| `src/hooks/useOnboarding.ts` | Added onRefreshUser callback, call before dashboard redirect |
| `app/onboarding/page.tsx` | Pass refreshUser to useOnboarding hook |
| `app/coach/students/page.tsx` | Added workflow filter tabs, workflow badges, conditional UI |

## Technical Notes

### Key Decisions

**Workflow Filter UX**
- **Decision:** Three separate filter options (All, Custom, Automated) instead of just All/Custom
- **Rationale:** Clear separation of student types, easy to find specific workflow students

**RefreshUser Callback Pattern**
- **Decision:** Pass refreshUser as callback to hook rather than having hook use auth context directly
- **Rationale:** Keeps hook decoupled from auth context implementation, more testable

## Commits

1. `39c502a` - feat(auth): include onboarding fields in user context
2. `e7001dc` - feat(auth): add refresh user context method
3. `0292661` - feat(coach): add workflow filter to students page

## Testing & Validation

- TypeScript type-check: Passes
- Build: Verified successful

## Progress Impact

- Onboarding flow: Improved with immediate redirect
- Coach students page: Enhanced with workflow filter
