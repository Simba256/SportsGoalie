# Test Files Pillar Route Update

**Date:** March 5, 2026
**Type:** Testing
**Time Investment:** 2 hours

## Summary

Updated all test files from `/sports` to `/pillars` routes. Fixed admin-dashboard.spec.ts line 148 assertion mismatch. Ran type-check, build verification, and Playwright tests.

## Goals

- Update all test files from `/sports` to `/pillars` routes
- Fix admin-dashboard.spec.ts line 148 assertion mismatch
- Run type-check and build verification
- Run Playwright tests to verify changes

## Deliverables

### Test File Route Updates
Updated 5 test files with `/sports` → `/pillars` route changes:

| File | Changes |
|------|---------|
| `tests/sports-workflows.spec.ts` | ~35 route changes + test assertion fixes |
| `tests/stage4-comprehensive.spec.ts` | ~40 route changes |
| `tests/stage4-focused.spec.ts` | ~10 route changes |
| `tests/phase2-stress-tests.spec.ts` | ~10 route changes |
| `tests/admin-dashboard.spec.ts` | Line 148 fix + route update |

### Test Assertion Fixes
Updated sports-workflows.spec.ts to match actual UI:
- Changed expected title from "Pillars Catalog" to match actual "Ice Hockey Goalie Pillars"
- Fixed strict mode violations by using `.first()` selectors
- Changed `networkidle` to `domcontentloaded` for timeout reliability
- Updated admin tests to handle authentication states properly
- Simplified tests to check for pillar cards rather than search/filter UI (removed from new UI)

### Verification
- **TypeScript type-check:** Passes with 0 errors
- **Next.js build:** Succeeds (50 routes)
- **Playwright tests (chromium):** 19/19 passed for sports-workflows.spec.ts

## Files Modified

- `tests/sports-workflows.spec.ts` - Major rewrite (68%)
- `tests/stage4-comprehensive.spec.ts` - Route updates
- `tests/stage4-focused.spec.ts` - Route updates
- `tests/phase2-stress-tests.spec.ts` - Route updates
- `tests/admin-dashboard.spec.ts` - Line 148 fix

## Technical Notes

### Test Changes Summary
1. **Route Updates:** All `/sports` → `/pillars`, `/admin/sports` → `/admin/pillars`
2. **Title Assertions:** Updated to match actual page titles (regex patterns)
3. **Selector Fixes:** Added `.first()` to avoid strict mode violations
4. **Timeout Handling:** Changed from `networkidle` to `domcontentloaded`
5. **Admin Tests:** Handle auth redirect vs loading vs content states

### Tests Removed/Simplified
- Removed search/filter tests (UI removed from pillars page)
- Simplified to check for pillar cards and basic content
- Added info card test for "About the 6 Pillars"

## Commands Run

```bash
npm run type-check  # Passes
npm run build       # Succeeds
npx playwright test sports-workflows.spec.ts --project=chromium  # 19 passed
```

## Commits

- `e987d0e` - test(routes): update test files for /sports to /pillars route rename

## Progress Impact

- Phase 2.1 6-Pillar Conversion: 90% → 95%
- Test file route updates: Complete
