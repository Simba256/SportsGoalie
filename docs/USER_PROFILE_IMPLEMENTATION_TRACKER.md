# User Profile Implementation Tracker

Last updated: 2026-04-12

## Purpose
This is the master implementation tracker for Smarter Goalie profile-based features.
It separates implemented vs not implemented work by user profile so planning and execution stay clear.

## Status Key
- Implemented
- Partially Implemented
- Not Implemented
- Policy Gap (implemented behavior conflicts with desired policy)
- Planned (future/next phase)

## Master Platform Table

| tsk/feature | status | profile scope | page/file | notes |
|---|---|---|---|---|
| 7-pillar architecture (including Lifestyle) | Implemented | All profiles | PROGRESS.md | Lifestyle pillar added and tracked as done in project progress. |
| Dynamic charting architecture (template-based) | Implemented | Admin + Goalie (+ extensible to others) | app/admin/form-templates/page.tsx, src/lib/database/services/dynamic-charting.service.ts | Admin can manage templates and store dynamic entries. |
| V2 game charting foundation (pre-game, periods, post-game) | Implemented (core) | Goalie | app/charting/sessions/[id]/v2/pre-game/page.tsx, app/charting/sessions/[id]/v2/periods/page.tsx, app/charting/sessions/[id]/v2/post-game/page.tsx | Core flow exists with save/load and auto-calculated sections. |
| Input standards components (rotating selector, yes/no, voice transcription) | Implemented | Platform components | src/components/charting/inputs/RotatingNumberSelector.tsx, src/components/charting/inputs/YesNoToggle.tsx, src/components/charting/inputs/VoiceRecorder.tsx | Core reusable UX controls are present and in use. |
| Cross-reference full multi-role intelligence engine | Partially Implemented | Parent + Coach + Admin | app/parent/child/[childId]/page.tsx, src/lib/database/services/dynamic-charting.service.ts | UI/types exist; full multi-role engine and live data completeness still pending. |
| Full language-standard migration to KAC terminology | Not Implemented | All profiles | app/quizzes/page.tsx, app/admin/quizzes/page.tsx | Quiz/test/difficulty terminology still appears in many user-facing areas. |
| Stripe payment/subscription backend | Not Implemented | All paid profiles | app/pricing/page.tsx, package.json | Pricing page exists; Stripe checkout/subscription workflow not yet implemented. |
| Founding member pricing content | Implemented (UI content) | Public/All | app/pricing/page.tsx | Founding offer content and comparison table are live in UI. |
| 8-role landing selector (Goalie, Parent, Coach, etc.) | Not Implemented | Public | app/page.tsx | Landing role cards currently support Goalie and Parent only. |

---

## Goalie Profile Table

| tsk/feature | status | page/file | notes |
|---|---|---|---|
| Goalie auth and routing | Implemented | app/auth/login/page.tsx, app/auth/register/page.tsx | Goalie flow exists in auth and onboarding pipelines. |
| Pillar learning navigation | Implemented | app/page.tsx, app/pillars | Pillar-based learning structure is present. |
| Quiz participation flow | Implemented (legacy terminology) | app/quizzes/page.tsx | Quizzes available and tracked, but language not yet migrated to KAC standard. |
| V2 pre-game charting | Implemented | app/charting/sessions/[id]/v2/pre-game/page.tsx | Personal start time, mental state, anxiety/routine flows saved per session. |
| V2 period charting | Implemented (core) | app/charting/sessions/[id]/v2/periods/page.tsx | Mind control, factor ratio, goals against, goal classification present. |
| 8 factor ratios full implementation | Partially Implemented | app/charting/sessions/[id]/v2/periods/page.tsx | Placeholder indicates full 8-factor block still pending. |
| V2 post-game charting | Implemented (core) | app/charting/sessions/[id]/v2/post-game/page.tsx | Auto-calculated mind control avg and good/bad goal ratio are present. |
| Practice charting full loop (Immediate Needs + Maintenance) | Partially Implemented | app/charting, src/lib/database/services | Core charting exists; complete practice-loop logic per full directive is not fully complete. |
| Mind Vault core pages (including acceptance/cannot-accept) | Implemented (base) | app/mind-vault/page.tsx, app/mind-vault/acceptance/page.tsx, app/mind-vault/cannot-accept/page.tsx | Vault structure and category flows are present. |
| Mind Vault full privacy governance and reaffirmation cycle depth | Partially Implemented | app/mind-vault, firestore.rules | Core vault exists; full advanced controls/workflows still to be completed. |
| Family link code generation + manage linked parents | Implemented | src/components/settings/ParentLinkManager.tsx | Goalie can generate/revoke parent link access. |
| Calendar-linked analytics visibility | Partially Implemented | app/charting/page.tsx | Charting calendar heatmap exists; full platform-wide calendar linkage is pending. |

---

## Goalie Parent Profile Table

| tsk/feature | status | page/file | notes |
|---|---|---|---|
| Parent auth routing | Implemented | app/auth/login/page.tsx, app/auth/register/page.tsx | Parent role supported and routed to parent area. |
| Parent dashboard access control | Implemented | app/parent/page.tsx | Parent-only checks and redirects in place. |
| Link child via XXXX-XXXX code | Implemented | app/parent/link-child/page.tsx, src/components/parent/LinkChildForm.tsx | Parent can validate and link goalie account. |
| Linked goalie list and summary cards | Implemented | app/parent/goalies/page.tsx, app/parent/page.tsx | Parent sees progress summary, quizzes completed, streak, activity. |
| Parent child detail overview | Implemented | app/parent/child/[childId]/page.tsx | Child-level summary view is available. |
| Parent onboarding flow | Implemented | app/parent/onboarding/page.tsx | Parent onboarding entry route exists. |
| Parent perception route | Implemented | app/parent/perception/page.tsx | Perception workflow route exists and links to child comparison area. |
| Parent-child cross-reference with real data | Partially Implemented | app/parent/child/[childId]/page.tsx | UI exists but data integration remains mocked/TODO. |
| Parent detailed progress charts | Not Implemented | app/parent/child/[childId]/page.tsx | Marked as coming soon in the UI. |
| Parent video feedback view | Not Implemented | app/parent | No dedicated parent-facing video feedback surface currently exists. |
| Strict parent visibility controls (owner decides exact fields) | Policy Gap | firestore.rules | Current rules are not fully aligned to strict field-level parent visibility model. |
| Parent blocked from quiz-answer-level data | Policy Gap | firestore.rules | Authenticated read paths are still too broad for strict answer privacy requirement. |

---

## Coach Profile Table

| tsk/feature | status | page/file | notes |
|---|---|---|---|
| Coach dashboard and student list | Implemented | app/coach/page.tsx, app/coach/students/page.tsx | Coach role has dedicated area and student management surfaces. |
| Coach curriculum management per student | Implemented | app/coach/students/[studentId]/curriculum/page.tsx | Coach can manage assigned student curriculum items. |
| Coach custom lesson/quiz content creation | Implemented | app/coach/content/page.tsx, app/coach/content/lesson/new/page.tsx, app/coach/content/quiz/new/page.tsx | Coach content creation flow exists and is integrated. |
| Coach review of student evaluation | Implemented | app/coach/students/[studentId]/evaluation/page.tsx | Coach can inspect evaluation responses and profile info. |
| Coach observation chart (full basic + educated + certified framework) | Not Implemented | app/coach, app/admin/form-templates/page.tsx | Pieces exist, full role-specific chart model from directive not fully delivered. |
| Coach goal classification index (20+ options) | Not Implemented | app/coach, app/charting | Full indexed classification system is not fully implemented as specified. |
| Coach Q&A queue with SLA/program tie-ins | Partially Implemented | app/messages/page.tsx | Messaging exists; full queue model from directive is not clearly complete. |

---

## Admin Profile Table

| tsk/feature | status | page/file | notes |
|---|---|---|---|
| Admin dashboard and user management | Implemented | app/admin, app/admin/users/page.tsx | Admin management surfaces are present. |
| Admin charting oversight | Implemented | app/admin/charting/page.tsx | System-wide charting overview and filtering are available. |
| Admin dynamic form template management | Implemented | app/admin/form-templates/page.tsx | Create/activate/manage form templates. |
| Admin coach invitation management | Implemented | app/admin/coaches/page.tsx | Invitation workflows (resend/revoke handling) exist. |
| Admin video review workflow | Implemented (core) | app/admin/video-reviews/page.tsx | Admin can review uploaded videos and status. |
| Admin cross-reference engine with per-field visibility controls | Partially Implemented | app/admin/charting, firestore.rules | Some foundations exist; full policy-driven per-field release controls are incomplete. |
| Admin financial dashboard | Not Implemented | app/admin | No dedicated complete finance dashboard evidence found in current build. |
| Admin view-as-student preview | Not Implemented (not verified) | app/admin | Could not verify a complete preview mode implementation. |

---

## Additional Roles Table (Future Profiles)

| profile | status | page/file | notes |
|---|---|---|---|
| Goalie Coach (distinct tiered role path) | Planned | app/coach, app/page.tsx | Mentioned in strategy, but no separate full role implementation. |
| Certified Smarter Goalie Coach | Planned | app/coach | Certification-level role model not implemented as separate permissions UX yet. |
| Mentor / Smarter Goalie Mentor | Planned | app, src | No dedicated mentor role and workflow implementation verified. |
| Team Manager | Planned | app/page.tsx | Listed in role strategy; no dedicated role implementation found. |
| Organization | Planned | app/page.tsx | Pricing references exist; dedicated org role UX/permissions not fully implemented. |
| Federation | Planned | app/page.tsx | Pricing references exist; dedicated federation role UX/permissions not fully implemented. |
| Camp | Planned | app/page.tsx | Mentioned in role strategy; no dedicated implementation verified. |

---

## Future / Next Phase Tracking Section

| future item | status | notes |
|---|---|---|
| Full charting completion across goalie + parent + coach | Planned | Continue from current V2 and dynamic charting foundation. |
| Full Contextual Support engine on all tappable elements | Planned | Partial contextual help exists in charting; platform-wide rollout pending. |
| Platform-wide KAC language conversion | Planned | Needs global UX/content pass and schema/UI updates. |
| Payment stack (Stripe) + subscription/guarantee mechanics | Planned | Requires backend checkout and billing state integration. |
| Community portal and stories architecture | Planned | No dedicated routes/modules currently present. |
| Full calendar-centric analytics unification | Planned | Charting calendar exists; broader coverage pending. |
| Compliance and consent workflows (minors/PIPEDA) | Planned | Needs dedicated legal/flow implementation. |

---

## References
- Parent-focused tracker: docs/PARENT_FEATURE_TRACKER.md
- Current sprint/work progress: PROGRESS.md

## Update Log
- 2026-04-12: Initial master profile tracker created with separate user-profile tables and future section.
