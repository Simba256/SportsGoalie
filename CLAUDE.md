# Smarter Goalie — Project Instructions

> Sports learning platform — structured content, progress tracking, quiz assessments. Mobile-first.

## Stack

- **Next.js 14** App Router + TypeScript (strict)
- **Tailwind CSS** + shadcn/ui + Lucide icons
- **Firebase**: Firestore (DB), Auth, Storage
- **Forms**: React Hook Form + Zod
- **State**: React Context + custom hooks
- **Tests**: Playwright (browser flows)
- **Deploy**: Vercel

## Tracking

This project runs **two tracking files** in parallel:

### `PROJECT_TRACKER.md` — dashboard

Living snapshot of current/recent/upcoming work. Read at session start, update at session end. Format follows the global template (absolute dates, ~10 recent completions, roll older items to Archive).

### `PROGRESS.md` + `docs/sessions/YYYY-MM/` — work log

Detailed per-session history with time tracking and milestone progress. Sessions are individual files under `docs/sessions/YYYY-MM/`, named `YYYY-MM-DD-short-title.md`, generated from `docs/sessions/template.md`.

**At session start:**
1. Read `PROJECT_TRACKER.md` for current state
2. Read `PROGRESS.md` for milestone context + recent sessions
3. Skim the most recent session file under `docs/sessions/` for "Next Steps"

**At session end:**
1. Create the session file in `docs/sessions/YYYY-MM/` from the template
2. Update `PROGRESS.md` (recent sessions, time tracking, milestone %, sprint goals)
3. Update `PROJECT_TRACKER.md` (move completed items, refresh in-progress)
4. Commit all three together (`PROJECT_TRACKER.md`, `PROGRESS.md`, the new session file)

## Project structure

```
src/
├── app/            # Next.js App Router routes
├── components/     # Reusable components (shadcn-based)
├── lib/            # Utilities, Firebase config
├── types/          # TypeScript definitions
└── hooks/          # Custom React hooks
docs/
├── sessions/       # Per-session work logs
├── PLAN.md         # Project plan
├── TESTING.md      # Test strategy
└── DEPLOYMENT.md   # Deploy runbook
```

## Project-specific conventions

- **Components**: PascalCase files (`UserDashboard.tsx`), prop interfaces inline
- **Pages**: kebab-case route folders
- **Custom hooks**: `useThing` naming
- **Firebase access**: through `lib/firebase/*`, never call SDK directly from components
- **Validation**: Zod schemas at every boundary (forms, API routes, Firestore writes)
- **Auth-gated routes**: wrap with the auth guard from `components/auth/`

## Commit message format

```
type(scope): description

feat(quiz): add timer to assessment flow
fix(auth): handle expired session on refresh
docs(plan): update Stage 3 milestones
```

## Stage discipline

Build in stages — each stage is a complete, testable increment. Don't pull features forward from later stages. When a stage feels done:
- Run tests + manual browser pass on golden + edge paths
- Update PLAN.md if scope shifted
- Tag the stage in the session log

## Where to look

| Need | File |
|------|------|
| Current tasks | `PROJECT_TRACKER.md` |
| Time / milestone history | `PROGRESS.md` |
| Detailed session work logs | `docs/sessions/YYYY-MM/` |
| Project plan | `docs/PLAN.md` |
| Test strategy | `docs/TESTING.md` |
| Deploy steps | `docs/DEPLOYMENT.md` |
