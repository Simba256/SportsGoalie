# Smarter Goalie — Development Tasks

**Project:** Smarter Goalie (Ice Hockey Goalie Training Platform)
**Updated:** March 12, 2026

---

## What's Been Completed

### Block 1 (Launch Critical)

| Task | Status | Summary |
|------|--------|---------|
| Branding Update | ✅ Done | Renamed from "SportsGoalie" to "Smarter Goalie" across all files |
| 7th Pillar: Lifestyle | ✅ Done | Added Lifestyle pillar (Heart icon, pink theme) to the 7-pillar system |
| Video Tagging System | ✅ Done | Structured tags for videos (Pillar, System, User Type, Angle Marker, Level) with filter UI |
| Parent Dashboard + Child Linking | ✅ Done | Parents can link to goalies via code, view progress, cross-reference comparison |

---

## What Needs To Be Done

### Block 1 — Remaining Tasks (Priority: HIGH)

#### 1. Landing Page + Role Selection
**Description:** Create public landing page with role selection for new users.

**Requirements:**
- 2 self-registration roles from landing page: **Goalie** and **Parent**
- Coach role is invitation-only (system already exists)
- Admin role is internal assignment only
- Introduction video placement on landing page
- Role tiles that route to appropriate registration/intake flow

**Related files:**
- `app/page.tsx` (current landing)
- `app/auth/register/page.tsx` (registration flow)

---

#### 2. Dashboard Visualization + Integration
**Description:** Connect existing scoring/analytics systems to user dashboards.

**Requirements:**
- Display cross-reference results (parent vs goalie perception comparison)
- Integrate scoring engine output to dashboards
- Show gap analysis visually
- Connect charting data to dashboard views
- Admin, coach, and parent dashboard views

**Related files:**
- `app/dashboard/page.tsx`
- `app/parent/page.tsx`
- `app/coach/page.tsx`
- `src/lib/scoring/` (scoring engine)

---

#### 3. Production Email (Resend)
**Description:** Configure production email sending with custom domain.

**Requirements:**
- Set up Resend with verified domain
- Verification emails from professional domain
- Invitation emails (coach invites)
- Notification emails

**Related files:**
- `src/lib/services/email.service.ts`
- `.env` variables: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

**Note:** Code infrastructure exists, needs domain configuration.

---

### Block 2 — Depth & Quality (Priority: MEDIUM)

| Task | Description |
|------|-------------|
| Questionnaire Alignment | Verify all 84 assessment + 20 intake questions match specification documents |
| LMS Enhancements | Content recommendations based on scoring - when weak areas identified, suggest relevant content |
| Analytics Upgrades | Parent/coach trend views, period-by-period pattern recognition |
| Mobile Polish | Review all screens on iOS/Android, improve touch targets and transitions |
| Bug Fixes Buffer | Reserved for issues found during testing |

---

### Block 3 — Experience Features (Priority: LOW)

| Task | Description |
|------|-------------|
| Contextual Support System | Pop-up help for terms (M.E.T., V.M.P., Line System), layered explanations with video links |
| Milestone Recognition System | Celebrate achievements with quotes, video clips, student-added highlights |
| Learning Portfolio | Permanent record of learning journey, feeds analytics |

> **Note:** Block 3 features are interconnected — design as one integrated system.

---

## Tech Stack Quick Reference

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Firebase Firestore
- **Auth:** Firebase Auth
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel

---

## Key Directories

```
app/                    # Next.js pages and routes
src/
  ├── components/       # React components
  ├── lib/
  │   ├── database/     # Firestore services
  │   ├── auth/         # Auth context and helpers
  │   ├── scoring/      # Scoring engine
  │   └── services/     # Other services
  └── types/            # TypeScript definitions
docs/
  └── client/           # Client documentation
```

---

## Work Order

**Must follow:** Block 1 → Block 2 → Block 3

Do not skip ahead without approval.

---

## Questions?

Check the existing documentation in `docs/client/` or review recent session logs in `docs/client/sessions/`.
