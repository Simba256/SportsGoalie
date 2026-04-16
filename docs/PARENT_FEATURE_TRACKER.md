# Parent Features Tracker

Last updated: 2026-04-12

## Purpose
This tracker records what is already implemented and what is still pending for parent-facing capabilities, access boundaries, and policy goals.

## Status Key
- Implemented
- Partially Implemented
- Not Implemented
- Policy Gap (implemented behavior conflicts with desired policy)

## Tracking Table

| tsk/feature | status | category (goalie,admin etc) | page/file | notes ( what is done in this task/ not done ) |
|---|---|---|---|---|
| Parent dashboard access control | Implemented | Parent | app/parent/page.tsx | Parent-only route checks are in place; non-parent users are redirected. |
| Parent linked goalies list | Implemented | Parent | app/parent/goalies/page.tsx | Parent can view linked children and summary progress. |
| Parent child detail page | Implemented | Parent | app/parent/child/[childId]/page.tsx | Parent can view child overview metrics (progress, quizzes, streak, last active). |
| Parent link child via code | Implemented | Parent + Goalie | src/components/parent/LinkChildForm.tsx | Parent enters code, validates, and links account. |
| Parent link backend service | Implemented | Parent + Goalie | src/lib/database/services/parent-link.service.ts | Supports validate code, link, list linked children/parents, revoke link, and link checks. |
| Goalie family link manager | Implemented | Goalie (student) | src/components/settings/ParentLinkManager.tsx | Goalie can generate/regenerate link codes and revoke parent access. |
| Parent onboarding route | Implemented | Parent | app/parent/onboarding/page.tsx | Parent assessment entry route exists and is wired in nav flow. |
| Parent perception route | Implemented | Parent | app/parent/perception/page.tsx | Parent can access perception workflow and navigate to child view. |
| Cross-reference data integration | Partially Implemented | Parent | app/parent/child/[childId]/page.tsx | UI exists but real cross-reference data loading is still TODO/mocked. |
| Parent detailed progress charts | Not Implemented | Parent | app/parent/child/[childId]/page.tsx | Placeholder only; chart data and chart rendering pipeline are not complete yet. |
| Parent video feedback UI | Not Implemented | Parent | app/parent | No dedicated parent page/component currently exposes video feedback. |
| Parent read of linked child progress (rules) | Implemented | Security Rules | firestore.rules | Parent read allowances for progress-related data exist. |
| Prevent parent from seeing quiz answers | Policy Gap | Security Rules | firestore.rules | quiz_questions read allows authenticated users, so parent access is not explicitly blocked. |
| Strict parent view-only policy | Policy Gap | Security Rules | firestore.rules | Some parent-link related writes are broadly allowed for authenticated users. |
| Parent role in registration | Implemented | Auth | app/auth/register/page.tsx | Parent role option exists and routes into parent onboarding/dashboard flow. |
| Parent role login routing | Implemented | Auth | app/auth/login/page.tsx | Parent users are routed to parent area after login. |

## Next Actions (Suggested)
1. Lock down parent read scope to linked children only in firestore rules.
2. Prevent parent access to quiz answer-bearing collections.
3. Implement parent-safe video feedback view (high-level feedback only if desired).
4. Complete real cross-reference data integration for parent-child perception comparisons.
5. Implement detailed charting for parent view with redacted-sensitive fields only.

## Update Log
- 2026-04-12: Initial tracker created from code and rules audit.
