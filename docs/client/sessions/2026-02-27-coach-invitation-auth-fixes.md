# Coach Invitation Auth Fixes

**Date:** February 27, 2026
**Type:** Bug Fix / Debugging
**Time Investment:** 3 hours

## Summary

Fixed critical Firestore permission denied error during coach registration via invitation. Debugged why coach invitation flow was failing while student registration worked. Implemented `skipEmailVerification` flag for invited coaches since clicking invitation link IS the verification.

## Goals

- Fix Firestore permission denied error during coach registration via invitation
- Debug why coach invitation flow was failing while student registration worked
- Simplify coach verification (no email verification needed for invited coaches)

## Deliverables

### Completed
- ✅ Fixed critical race condition between `onAuthStateChanged` listener and registration code
- ✅ Discovered and resolved code path discrepancy between student registration (context.tsx) and coach registration (auth-service.ts)
- ✅ Implemented `skipEmailVerification` flag for invited coaches
- ✅ Updated login flow to check Firestore `emailVerified` field for coaches verified via invitation
- ✅ Updated Firestore security rules to allow invitation acceptance after user sign-out
- ✅ Added `isRegistrationInProgress` flag to prevent auth state listener from signing out during registration
- ✅ Updated auth context to return userId from register function

## Files Modified

### Modified
- `src/types/auth.ts` - Added `skipEmailVerification` optional field to RegisterCredentials
- `src/lib/auth/context.tsx` - Updated register to support skipEmailVerification, updated login to check Firestore emailVerified, register now returns userId
- `app/auth/accept-invite/page.tsx` - Changed to use `useAuth().register` instead of `authService.register`
- `firestore.rules` - Updated coach_invitations rules to allow acceptance after sign-out
- `src/lib/auth/auth-service.ts` - Added `isRegistrationInProgress` global flag

## Technical Notes

### Issues Encountered and Fixed

1. **Firestore permission denied on user document creation**
   - Initial thought: Security rules issue
   - Made rules permissive (`allow create: if true`) - still failed
   - Root cause: `onAuthStateChanged` in context.tsx was signing out unverified users before auth-service.ts could write to Firestore
   - Resolution: Added `isRegistrationInProgress` flag that context.tsx checks before signing out

2. **Permission denied persisted even with `isAuthenticated: true`**
   - Even with permissive rules, still got permission denied
   - Discovery: Student registration (context.tsx) works, but coach invitation (auth-service.ts) fails
   - Resolution: Changed accept-invite page to use `useAuth().register` instead of `authService.register`

3. **"Failed to accept invitation" error after successful registration**
   - Logs showed "Firestore document created successfully" then "Failed to accept invitation"
   - Cause: After register(), user is signed out, but acceptInvitation() was checking for auth
   - Resolution: Updated Firestore rules to allow updates when status == 'accepted'

4. **Unnecessary email verification for invited coaches**
   - Clicking the invitation link IS email verification
   - Resolution: Added `skipEmailVerification` flag, set `emailVerified: true` in Firestore for invited coaches

### Key Decisions
- **Decision:** Skip email verification for invited coaches
  - **Rationale:** Clicking the invitation link (sent to their email) serves as email verification

- **Decision:** Use Firestore `emailVerified` field as fallback for Firebase Auth
  - **Rationale:** Firebase Auth emailVerified won't be set for invited coaches, but we can track it in Firestore

### Implementation Details
- `skipEmailVerification: true` → No verification email sent, `emailVerified: true` set in Firestore
- Login now checks both Firebase Auth `emailVerified` AND Firestore document `emailVerified`
- Registration returns `{ userId: string }` for flows that need to track the new user ID

### Learnings
- Firebase `createUserWithEmailAndPassword` automatically signs in the user
- Firestore security rules use `request.auth` from the Firebase SDK auth state
- Auth state listeners can interfere with registration flows if they sign out unverified users
- Having two registration code paths (context.tsx vs auth-service.ts) creates maintenance burden

## Testing & Validation

- [x] Manual testing completed (coach invitation flow)

## Progress Impact

- Phase 2.0 Multi-Role Foundation: 70% (unchanged - this was a bug fix)
- Coach invitation system: Bug fixes applied, flow now works correctly
