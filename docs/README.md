# Smarter Goalie Documentation

## Directory Structure

```
docs/
├── PLAN.md                      # Main development plan (Phase 1 complete)
├── README.md                    # This file
│
├── client/                      # CLIENT-FACING DOCS (for Michael)
│   ├── overview/               # Project status, summaries
│   │   ├── project-summary.md  # Main project overview
│   │   ├── current-status.md   # Current development status
│   │   ├── tech-stack.md       # Technology stack details
│   │   └── deployment-access.md
│   ├── progress/               # Progress tracking
│   │   └── phase-summaries.md  # Phase completion summaries
│   ├── sessions/               # Work session logs
│   ├── features/               # Feature documentation
│   ├── decisions/              # Key decisions
│   ├── deliverables/           # Formal deliverables
│   │   ├── scope-of-work.md    # SOW document
│   │   └── system-analysis-march-2026.md
│   └── pages/                  # Route documentation
│
├── technical/                   # DEVELOPER DOCUMENTATION
│   ├── architecture/           # System design docs
│   │   ├── 7-pillars-implementation.md
│   │   ├── dynamic-charting-system.md
│   │   ├── messaging-system.md
│   │   └── ...
│   ├── services/               # Service layer docs
│   └── guides/                 # Implementation guides
│
├── planning/                    # PROJECT PLANNING
│   ├── phases/                 # Phase plans
│   │   ├── phase-timeline.md
│   │   ├── deployment.md
│   │   └── docker.md
│   └── assessments/            # Stage assessments
│       ├── stage-1-foundation-security-assessment.md
│       ├── stage-2-core-functionality-assessment.md
│       └── ...
│
├── internal/                    # INTERNAL ONLY (not client-facing)
│   ├── testing/                # Test plans and results
│   ├── security/               # Security audits, firebase rules
│   └── legacy/                 # Archived/historical docs
│
└── invoices/                    # Invoice records
```

## Quick Links

### For Michael (Client)
- [Project Summary](client/overview/project-summary.md) - Current status and capabilities
- [Scope of Work](client/deliverables/scope-of-work.md) - Original SOW
- [System Analysis](client/deliverables/system-analysis-march-2026.md) - What's built
- [Phase Progress](client/progress/phase-summaries.md) - Development progress

### For Developers
- [Main Plan](PLAN.md) - Phase 1 development plan
- [7 Pillars Implementation](technical/architecture/7-pillars-implementation.md) - Pillar system design
- [Dynamic Charting](technical/architecture/dynamic-charting-system.md) - Charting system
- [Phase Timeline](planning/phases/phase-timeline.md) - Full timeline

### Current Work (Block Structure)
Per Michael's Work Directive (March 10, 2026):

| Block | Focus | Status |
|-------|-------|--------|
| Block 1 | Launch Critical | In Progress |
| Block 2 | Depth & Quality | Pending |
| Block 3 | Experience Features | Pending |

See `client_data/Phase2/basim-work-directive-march10.md` for full details.

## Naming Conventions

- **kebab-case** for all file names
- **Descriptive names** that indicate content
- **Date prefixes** for session logs: `YYYY-MM-DD-description.md`

## Adding Documentation

1. **Session logs**: Add to `client/sessions/` with date prefix
2. **Feature docs**: Add to `client/features/`
3. **Technical docs**: Add to `technical/architecture/` or `technical/guides/`
4. **Internal docs**: Add to `internal/` (not shared with client)

---

*Last reorganized: March 12, 2026*
