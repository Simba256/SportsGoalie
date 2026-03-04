# Session: Onboarding Redirect Fix & Coach Workflow Filter

**Date:** 2026-03-04
**Duration:** 45 min
**Focus:** Bug Fix / Feature

---

## Goals

- [x] Fix redirect loop between /onboarding and /dashboard after completing onboarding
- [x] Delete test user account for fresh onboarding testing
- [x] Add workflow type filter to coach students page

---

## Work Completed

### 1. Fixed Onboarding Redirect Loop

**Problem:** After completing onboarding, students got stuck in a redirect loop between `/onboarding` and `/dashboard` for 10-15 seconds.

**Root Cause:** Two issues:
1. Auth context wasn't including `onboardingCompleted` field when building User object from Firestore
2. After onboarding completion, the auth context wasn't refreshed before redirecting to dashboard

**Fix 1:** Added onboarding fields to auth context user construction (`src/lib/auth/context.tsx:97-100`):
```typescript
...(userData.onboardingCompleted !== undefined && { onboardingCompleted: userData.onboardingCompleted }),
...(userData.onboardingCompletedAt && { onboardingCompletedAt: userData.onboardingCompletedAt }),
...(userData.initialAssessmentLevel && { initialAssessmentLevel: userData.initialAssessmentLevel }),
```

**Fix 2:** Added `refreshUser()` method to auth context that re-fetches user data from Firestore. Updated onboarding hook to accept `onRefreshUser` callback and call it before redirecting to dashboard.

### 2. User Account Cleanup

- Updated `scripts/cleanup-user.ts` to include `onboarding_evaluations` collection
- Deleted all data for `syedbasimmehmood1@gmail.com` test account:
  - User document, progress, 32 quiz attempts, 12 sessions, 7 charting entries, etc.
  - Firebase Auth account deleted

### 3. Coach Students Page Workflow Filter

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

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/auth/context.tsx` | Added onboarding fields to user object, added refreshUser() method |
| `src/hooks/useOnboarding.ts` | Added onRefreshUser callback, call before dashboard redirect |
| `app/onboarding/page.tsx` | Pass refreshUser to useOnboarding hook |
| `scripts/cleanup-user.ts` | Added onboarding_evaluations cleanup, updated email |
| `app/coach/students/page.tsx` | Added workflow filter tabs, workflow badges, conditional UI |

---

## Commits

1. `39c502a` - fix(auth): include onboarding fields in user context
2. `e7001dc` - fix(auth): refresh user context after onboarding completion
3. `0292661` - feat(coach): add workflow filter to students page

---

## Testing

- TypeScript type-check: Passes
- Build: Verified successful
- User cleanup script: Executed successfully

---

## Technical Decisions

### Workflow Filter UX
**Decision:** Three separate filter options (All, Custom, Automated) instead of just All/Custom
**Rationale:** User explicitly requested ability to view only automated students
**Impact:** Clear separation of student types, easy to find specific workflow students

### RefreshUser Callback Pattern
**Decision:** Pass refreshUser as callback to hook rather than having hook use auth context directly
**Rationale:** Keeps hook decoupled from auth context implementation, more testable
**Impact:** Clean separation of concerns, hook remains focused on onboarding logic

---

## Next Steps

- [ ] Test complete onboarding flow with fresh account
- [ ] Verify coach can view evaluations for both workflow types
- [ ] Continue with Phase 2.1 planning

---

## Time Tracking

| Activity | Time |
|----------|------|
| Debugging redirect loop | 15 min |
| Implementing auth context fixes | 10 min |
| User cleanup script | 5 min |
| Workflow filter feature | 15 min |
| **Total** | **45 min** |
