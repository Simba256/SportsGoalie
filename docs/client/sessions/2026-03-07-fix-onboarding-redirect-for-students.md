# Fix Onboarding Redirect for Students

**Date:** March 7, 2026
**Type:** Bug Fix
**Time Investment:** 1 hour

## Summary

Fixed login page redirect logic to send students who haven't completed onboarding directly to `/onboarding` instead of `/dashboard`. This eliminates the race condition where students briefly saw the dashboard before being redirected.

## Goals

- Fix login page to redirect students who haven't completed onboarding to `/onboarding` instead of `/dashboard`
- Prevent race condition where students briefly see dashboard before being redirected

## Deliverables

### Completed
- ✅ Updated login redirect logic to check `onboardingCompleted` for students before redirecting to dashboard
- ✅ Students who haven't completed onboarding now go directly to `/onboarding`
- ✅ Parents and students who completed onboarding continue to go to `/dashboard`

## Files Modified

### Modified
- `app/auth/login/page.tsx` - Added `onboardingCompleted` check for students in redirect logic (lines 88-104)

## Technical Notes

### Key Decisions
- **Decision:** Check `onboardingCompleted` in login redirect rather than relying on dashboard fallback
  - **Rationale:** Prevents race condition where students briefly see dashboard before redirect, better UX
  - **Alternatives:** Could have kept dashboard fallback only (rejected - causes flash of content)

### Implementation Details
- Updated redirect logic order: admin → coach → student (not onboarded) → dashboard
- Only affects students explicitly - parents go directly to dashboard regardless of `onboardingCompleted`

## Commits

- `0430991` - fix(auth): redirect students to onboarding if not completed

## Testing & Validation

- [x] TypeScript compiles with zero errors
- [x] Build succeeds
- [x] Changes committed and pushed

## Progress Impact

- Login redirect fix: Complete
- Student onboarding UX: Improved (no flash of dashboard content)
