# Reset Incomplete Evaluations Script

**Date:** March 7, 2026
**Type:** Migration / Data Cleanup
**Time Investment:** 1 hour

## Summary

Created a one-time migration script to reset incomplete or old onboarding evaluations, allowing affected students to retake the assessment from scratch. Supports dry-run mode for safe previewing before execution.

## Goals

- Create a one-time migration script to reset incomplete onboarding evaluations
- Allow affected students to retake the assessment from scratch
- Support dry-run mode for safe previewing before execution

## Deliverables

### Completed
- ✅ Created `scripts/reset-incomplete-evaluations.ts` migration script
- ✅ Implemented detection criteria for incomplete evaluations:
  - Status is not `completed` or `reviewed`
  - `assessmentResponses` is empty or missing
- ✅ Implemented reset actions:
  - Deletes evaluation document from `onboarding_evaluations` collection
  - Resets user flags: `onboardingCompleted=false`, removes timestamps
- ✅ Added `--dry-run` flag for safe preview mode
- ✅ Executed script: reset 4 evaluations

### Script Execution Results
| User ID | Evaluation Status | User Doc Status |
|---------|------------------|-----------------|
| `17gT7gMrxUZYq5Rwkp3IVISJdHm1` | Deleted | Reset |
| `AfKS9rvtbsbk8i9SC32hZrjvu1L2` | Deleted | Reset |
| `DfcudKlKTTd8Q6THC96NWQjS2c42` | Deleted | Flags reset |
| `jTdfmb6QQGhb0EvDEDy2BGRv6R32` | Deleted | Reset |

## Files Modified

### Created
- `scripts/reset-incomplete-evaluations.ts` - One-time migration script

## Technical Notes

### Key Decisions
- **Decision:** Delete evaluation documents rather than reset them
  - **Rationale:** Cleaner approach - when student logs in, `createEvaluation()` creates fresh evaluation

### Implementation Details
- Script uses Firebase Admin SDK (same pattern as other scripts)
- Loads credentials from environment
- Supports `--dry-run` flag for safe previewing
- Shows detailed output with reasons for each reset

## Testing & Validation

- [x] Dry-run mode tested
- [x] Script executed successfully
- [x] 4 evaluations reset

## Progress Impact

- Data cleanup for incomplete evaluations: Complete
- Affected students can now restart onboarding fresh
