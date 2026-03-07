# Reset Incomplete Evaluations Script

**Date:** March 7, 2026
**Type:** Migration / Data Cleanup
**Time Investment:** 1 hour

## Summary

Created a one-time migration script to reset incomplete or old onboarding evaluations, allowing affected students to retake the assessment from scratch. Supports dry-run mode for safe previewing before execution.

## Goals

- Create a one-time migration script to reset incomplete or old onboarding evaluations
- Allow affected students to retake the assessment from scratch
- Support dry-run mode for safe previewing before execution

## Deliverables

### Completed
- ✅ Created `scripts/reset-incomplete-evaluations.ts` migration script
- ✅ Implemented detection criteria for incomplete evaluations:
  - Status is not `completed` or `reviewed` (stuck in progress)
  - `assessmentResponses` is empty or missing (pre-V2 or incomplete data)
- ✅ Implemented reset actions:
  - Deletes evaluation document from `onboarding_evaluations` collection
  - Resets user flags: `onboardingCompleted=false`, removes timestamps
- ✅ Added `--dry-run` flag for safe preview mode
- ✅ Executed script: reset 4 incomplete evaluations (1 stuck, 3 pre-V2)

### Script Execution Results
| User ID | Evaluation Status | User Doc Status |
|---------|------------------|-----------------|
| `17gT7gMrxUZYq5Rwkp3IVISJdHm1` | Deleted | Orphaned |
| `AfKS9rvtbsbk8i9SC32hZrjvu1L2` | Deleted | Orphaned |
| `DfcudKlKTTd8Q6THC96NWQjS2c42` | Deleted | Flags reset |
| `jTdfmb6QQGhb0EvDEDy2BGRv6R32` | Deleted | Orphaned |

## Files Modified

### Created
- `scripts/reset-incomplete-evaluations.ts` - One-time migration script

## Technical Notes

### Issues Encountered
- `ts-node` failed with ESM module error - resolved by using `npx tsx` instead
- 3 of 4 evaluations were orphaned (user documents already deleted) - expected for old test accounts

### Key Decisions
- **Decision:** Delete evaluation documents rather than reset them
  - **Rationale:** Cleaner approach - when student logs in, `createEvaluation()` creates fresh evaluation
  - **Alternatives:** Reset status to 'in_progress' (rejected - leaves stale data)

### Implementation Details
- Script uses Firebase Admin SDK (same pattern as other scripts)
- Loads credentials from `.env.local`
- Supports `--dry-run` flag for safe previewing
- Shows detailed output with reasons for each reset

## Testing & Validation

- [x] Dry-run mode tested (found 4 evaluations)
- [x] Script executed successfully
- [x] 4 evaluations deleted, 1 user's flags reset

## Progress Impact

- Data cleanup for incomplete evaluations: Complete
- Affected students can now restart onboarding fresh
