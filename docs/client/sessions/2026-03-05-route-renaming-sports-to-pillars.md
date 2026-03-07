# Route Renaming (sports to pillars)

**Date:** March 5, 2026
**Type:** Refactor
**Time Investment:** 1 hour

## Summary

Renamed URL routes from `/sports` to `/pillars`. Updated all internal links to use new route paths, updated middleware public routes, updated test file paths and references. Verified build and type-check pass.

## Goals

- Rename URL routes from `/sports` to `/pillars`
- Update all internal links to use new route paths
- Update middleware public routes
- Update test file paths and references
- Verify build and type-check pass

## Deliverables

### Completed
- ✅ Renamed `app/sports/` directory to `app/pillars/`
- ✅ Renamed `app/admin/sports/` directory to `app/admin/pillars/`
- ✅ Renamed `src/__tests__/app/sports/` directory to `src/__tests__/app/pillars/`
- ✅ Updated all internal navigation links across 11 files
- ✅ Updated middleware public routes from `/sports` to `/pillars`
- ✅ Updated test file import paths and selectors

### Additional Work
- Cleared `.next` cache to resolve stale type references
- Updated breadcrumb navigation in skill detail page
- Updated prerequisite links in skill detail page

## Files Modified

### Renamed Directories
- `app/sports/` → `app/pillars/`
- `app/admin/sports/` → `app/admin/pillars/`
- `src/__tests__/app/sports/` → `src/__tests__/app/pillars/`

### Modified
- `app/dashboard/page.tsx` - Updated 5 link references from `/sports` to `/pillars`
- `src/components/layout/header.tsx` - Updated desktop and mobile navigation links
- `src/components/layout/footer.tsx` - Updated 2 footer links
- `app/page.tsx` - Updated 2 homepage links
- `app/admin/page.tsx` - Updated admin dashboard link to `/admin/pillars`
- `middleware.ts` - Updated public routes from `/sports` to `/pillars`
- `app/pillars/page.tsx` - Updated pillar card links
- `app/pillars/[id]/page.tsx` - Updated skill links
- `app/pillars/[id]/skills/[skillId]/page.tsx` - Updated breadcrumb and prereq links
- `app/admin/pillars/page.tsx` - Updated view public and manage skills buttons
- `app/admin/pillars/[id]/skills/page.tsx` - Updated back navigation link
- `tests/admin-dashboard.spec.ts` - Updated link selectors
- `src/__tests__/app/pillars/sports-catalog.test.tsx` - Updated import path
- `src/__tests__/app/pillars/sports-detail.test.tsx` - Updated import path

## Technical Notes

### Issues Encountered
- Type errors after directory rename due to `.next` cache - resolved by clearing cache with `rm -rf .next`
- Test file imports needed manual update - fixed import paths in unit test files

### Key Decisions
- **Decision:** Keep internal `sportId` field names unchanged
  - **Rationale:** Database field names are internal and don't need to change for URL rename

### Implementation Details
- Used `replace_all` for consistent link updates across files
- Preserved all internal variable names (sportId, enrolledSports, etc.)
- Only URL-facing routes were renamed

### Learnings
- Next.js cache in `.next` directory can cause false positive type errors after file moves
- Playwright test files have many route references that need updating

## Testing & Validation

- [x] TypeScript type-check passes (0 errors)
- [x] Next.js build succeeds

## Progress Impact

- Phase 2.1 6-Pillar Conversion: 80% → 90%
- Route renaming (Phase 2.1c): Complete
