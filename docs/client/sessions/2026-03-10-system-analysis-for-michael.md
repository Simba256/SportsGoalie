# SmarterGoalie Platform - Current System Analysis for Michael

**Prepared:** March 10, 2026
**Session Type:** System Analysis & Documentation
**Purpose:** Answer Michael's questions about existing systems to provide accurate hour estimates

---

## EXECUTIVE SUMMARY

**Good news:** Significant infrastructure already exists. Both charting systems are fully database-backed. Questionnaires are complete (84 questions). Michael's estimates should lean toward "using existing" rather than "building new" for most items.

| System | Status | Effort Level |
|--------|--------|--------------|
| Charting Engine | ✅ Two systems built, both database-backed with **full admin UI** | Ready to use |
| Questionnaire Engine | ✅ Complete (84 questions), code-based | Ready to use (admin UI optional +8-10 hrs) |
| Goalie Game Charts | ✅ Fully built (5-Pillar complete) | Ready to use |
| Practice Charts | ✅ Admin can create via form builder | ~1-2 hrs to design template |
| Parent/Coach Charts | ✅ Admin can create via form builder | ~1-2 hrs each to design templates |
| Scoring Foundation | ✅ Complete 1.0-4.0 system | Ready to use |
| Cross-Reference | ✅ Engine exists (6 rules) | Ready to use |

---

## 1. CHARTING SYSTEMS - WHAT EXISTS

### A. Legacy Charting System (Fully Built)

**Location:**
- `src/types/charting.ts`
- `src/lib/database/services/charting.service.ts`

**This is the "Goalie Game Chart (5-Pillar)" - IT'S ALREADY BUILT:**

#### Pre-Game Phase Fields:
- Well rested (yes/no with comments)
- Fueled for game (yes/no with comments)
- Mind cleared (yes/no with comments)
- Mental imagery completed (yes/no with comments)
- Ball exercises done (yes/no with comments)
- Stretching completed (yes/no with comments)
- Looked engaged during warm-up (yes/no with comments)
- Lacked focus (yes/no with comments)
- Team warm-up needs adjustment (yes/no with comments)

#### Game Overview:
- Good Goals by Period (P1, P2, P3 - numeric)
- Bad Goals by Period (P1, P2, P3 - numeric)
- Degree of Challenge by Period (1-10 scale)

#### Period-by-Period Performance (P1, P2, P3):
**The 5 Pillars implemented for each period:**
1. **Mind Set:** Focus consistency, Decision making, Body language
2. **Skating Performance:** In sync/weak/improving levels
3. **Positional Performance:** Above icing line, Below icing line (quality levels)
4. **Rebound Control:** Quality and consistency
5. **Freezing Puck:** Quality and consistency

#### Period 3 Special Fields:
- Team Play - Setting Up Defense
- Team Play - Setting Up Forwards

#### Overtime Fields:
- Focus quality, Decision making, Skating performance

#### Shootout Fields:
- Result (won/lost)
- Shots saved (numeric)
- Goals against (numeric)
- Shootout notes

#### Post-Game:
- Review completed (yes/no with comments)
- Additional comments

#### Service Methods Available:
- `createSession()`, `getSession()`, `updateSession()`, `deleteSession()`
- `getSessionsByStudent()`, `getUpcomingSessions()`, `getAllSessions()`
- `createChartingEntry()`, `getChartingEntry()`, `updateChartingEntry()`, `deleteChartingEntry()`
- `getChartingEntriesBySession()`, `getChartingEntriesByStudent()`, `getAllChartingEntries()`
- Analytics: `recalculateStudentAnalytics()`, `getStudentAnalytics()`

---

### B. Dynamic Charting System (Admin-Configurable)

**Location:**
- `src/types/form-template.ts`
- `src/lib/database/services/dynamic-charting.service.ts`
- `src/lib/database/services/form-template.service.ts`

**This is a flexible form builder - USE THIS FOR NEW CHARTS:**

#### Supported Field Types (9):
1. Yes/No with optional comments
2. Radio (single select)
3. Checkbox (multi-select)
4. Numeric (with min/max)
5. Scale (1-10, etc.)
6. Text (short)
7. Textarea (long)
8. Date
9. Time

#### Automatic Analytics Types (7):
1. Percentage of yes responses
2. Average with trend
3. Sum totals
4. Distribution frequency
5. Consistency scoring
6. Trend detection
7. Count

#### Form Structure Features:
- Sections (collapsible, can be repeatable for periods)
- Conditional display rules
- Field validation (required, min/max, patterns)
- Partial submission support
- Completion tracking (percentage & status)
- Version tracking

#### Admin UI (FULLY BUILT at `/admin/form-templates/`):
- **List Page** - View all templates with status badges
- **Create Page** - Full form builder with sections, fields, field types, validation
- **Detail Page** - View complete template structure
- **Service Methods** - Create, Update, Delete, Archive, Clone templates
- **Default Templates** - Pre-built Hockey Goalie template with 50+ fields

**Michael can create new chart types (Parent, Coach, Practice) directly through the admin UI without any development work.**

---

### C. Default Hockey Goalie Template (Pre-Built)

**Location:** `src/lib/templates/hockey-goalie-default.ts`

**Template Name:** "Hockey Goalie Performance Tracker" (v1)

**8 Sections, 50+ Fields with Analytics:**
1. Pre-Game Section (10 fields)
2. Game Overview Section (9 fields)
3. Period 1 Performance (10 fields)
4. Period 2 Performance (10 fields)
5. Period 3 Performance (12 fields)
6. Overtime Section (3 fields)
7. Shootout Section (4 fields)
8. Post-Game Section (2 fields)

**Admin Pages Present:**
- List Page: `/app/admin/form-templates/page.tsx`
- Create Page: `/app/admin/form-templates/new/page.tsx`
- Detail Page: `/app/admin/form-templates/[id]/page.tsx`

---

## 2. QUESTIONNAIRE ENGINE - WHAT EXISTS

### Current Architecture
**Status:** Code-based (TypeScript constants), NOT admin-editable via UI

> **Note:** This is different from the charting systems which ARE database-backed. The questionnaires are stored as TypeScript arrays in source files. Editing questions requires modifying code files, not database records. This is only a limitation if Michael wants a UI to edit questions without developer involvement.

#### What's Built:

**Goalie Questions:**
- File: `src/data/goalie-assessment-questions.ts`
- 28 assessment questions (7 categories × 4 questions)
- File: `src/data/goalie-intake-questions.ts`
- 7 intake questions across 4 screens

**Coach Questions:**
- File: `src/data/coach-assessment-questions.ts`
- 28 assessment questions (7 categories)
- File: `src/data/coach-intake-questions.ts`
- 7 intake questions

**Parent Questions:**
- File: `src/data/parent-assessment-questions.ts`
- 28 assessment questions (7 categories)
- File: `src/data/parent-intake-questions.ts`
- 6 intake questions

#### Categories & Weights:

**Goalie Categories:**
| Category | Weight | Questions |
|----------|--------|-----------|
| Feelings | 15% | 4 |
| Knowledge | 25% | 4 |
| Pre-Game | 10% | 4 |
| In-Game | 25% | 4 |
| Post-Game | 10% | 4 |
| Training | 10% | 4 |
| Learning | 5% | 4 |
| **Total** | **100%** | **28** |

**Coach Categories:**
| Category | Weight | Questions |
|----------|--------|-----------|
| Goalie Knowledge | 30% | 4 |
| Current Approach | 25% | 4 |
| Pre-Game | 10% | 4 |
| In-Game | 15% | 4 |
| Post-Game | 10% | 4 |
| Coaching Goals | 5% | 4 |
| Preferences | 5% | 4 |
| **Total** | **100%** | **28** |

**Parent Categories:**
| Category | Weight | Questions |
|----------|--------|-----------|
| Goalie State | 10% | 4 |
| Understanding | 30% | 4 |
| Pre-Game | 10% | 4 |
| Car Ride Home | 20% | 4 |
| Development Role | 15% | 4 |
| Expectations | 10% | 4 |
| Preferences | 5% | 4 |
| **Total** | **100%** | **28** |

### What's MISSING (Only matters if admin UI editing is desired)
- ❌ **No admin UI to edit questions** - Must edit TypeScript files (requires developer)
- ❌ **No database storage of questions** - All in code (but this is fine if developer edits are acceptable)
- ❌ **No question builder interface**

### To Make Admin-Editable (OPTIONAL)
**Only needed if Michael wants to edit questions without developer involvement:**
1. Migrate questions to Firestore collection
2. Build admin UI at `/admin/assessment-questions/`
3. Update onboarding service to fetch from database
4. Add question builder with scoring interface

**Estimate:** 8-10 hours for full admin-editable questionnaire engine

**Alternative:** If Michael is fine with developer-edited questions (current approach), this is **0 hours** - questions are already complete and working.

---

## 3. SCORING FOUNDATION - WHAT EXISTS

### Intelligence Profile Scoring (Complete)

**Location:** `src/lib/scoring/intelligence-profile.ts` (441 lines)

#### Features:
- 1.0-4.0 continuous scale
- Per-question scoring
- Category averaging with weights
- Overall intelligence score calculation
- Pacing level determination
- Gap detection with priority tiers
- Strength identification
- Content recommendations based on gaps

#### Pacing Thresholds (Exact):
```
Introduction: 1.0 - 2.2
Development: 2.2 - 3.1
Refinement: 3.1 - 4.0
```

### Gap & Strength Analysis (Complete)

**Built-in detection:**
- **Gaps:** Categories below average threshold or absolute threshold
- **Priority Levels:** HIGH (< 1.5 or -1.0 deviation), MEDIUM (2.0 or -0.5 deviation), LOW
- **Strengths:** Categories >0.3 above average or ≥3.5 absolute
- Suggested content per gap

### Cross-Reference Engine (Complete)

**Location:** `src/lib/scoring/cross-reference-engine.ts` (391 lines)

#### All 6 Rules Implemented:

| # | Rule | Comparison | Threshold | Severity |
|---|------|------------|-----------|----------|
| 1 | Confidence Perception Gap | Goalie vs Parent | 1.0 | HIGH |
| 2 | Post-Game Feedback Gap | Coach vs Goalie | 1.5 | HIGH |
| 3 | Car Ride Home Gap | Goalie vs Parent | 1.0 | MEDIUM |
| 4 | Development Gap | Coach vs Goalie | 1.5 | MEDIUM |
| 5 | Pre-Game Communication Gap | Goalie vs Parent | 1.0 | MEDIUM |
| 6 | Attitude Perception Gap | Goalie vs Parent | 1.0 | MEDIUM |

#### Cross-Reference Functions:
- `compareGoalieAndParent()` - Goalie vs parent comparison
- `compareGoalieAndCoach()` - Goalie vs coach comparison
- `generateCrossReferenceResult()` - Comprehensive result generation
- `getCrossReferenceSummary()` - Human-readable summary
- `getPriorityRecommendations()` - Actionable recommendations

#### Output Includes:
- Flagged gaps with severity
- Overall alignment score (percentage)
- Critical gaps count

---

## 4. ANALYTICS DASHBOARDS - WHAT EXISTS

### Admin Analytics Dashboard

**Location:** `/app/admin/analytics/page.tsx` (597 lines)

#### Features:
- **Dashboard Overview:** Total users, active users, quiz attempts, content items
- **User Engagement Tab:** Daily active users, quiz performance trends
- **Content Performance Tab:** Popular sports, content ratings
- **User Analytics Tab:** Role distribution, user status charts
- **System Health Tab:** Service status, performance metrics

### Platform Analytics Service

**Location:** `src/lib/database/services/analytics.service.ts` (519 lines)

#### Capabilities:
- User statistics (total, active, inactive, new)
- Content metrics (sports, skills, quizzes)
- Engagement metrics (attempts, scores, completion)
- Performance metrics (response time, uptime, error rate)
- 5-minute caching for performance

### Student Analytics Service

**Location:** `src/lib/database/services/student-analytics.service.ts` (980 lines)

#### Tracks:
- Total time spent
- Active days
- Quiz performance (avg/best/worst scores)
- Completion rates
- Current/longest streaks
- Study patterns (morning/afternoon/evening/night)
- Detailed course progress
- Progress over time with trends

### Dynamic Analytics Service

**Location:** `src/lib/database/services/dynamic-analytics.service.ts`

#### Purpose:
- Calculates analytics from dynamic form responses (charting entries)
- Field-level analytics calculation
- Category analytics aggregation
- Trend analysis and direction detection

---

## 5. REVISED HOUR ESTIMATES FOR MICHAEL

Based on verified existing systems:

### Questionnaires
| Task | Estimate | Notes |
|------|----------|-------|
| Admin UI for question editing | 8-10 hrs | **OPTIONAL** - Only if Michael wants to edit without developer |
| Parent questionnaire | 0 hrs | ✅ Already exists (28 questions in code) |
| Coach questionnaire | 0 hrs | ✅ Already exists (28 questions in code) |
| Goalie questionnaire | 0 hrs | ✅ Already exists (28 questions in code) |

### Charting
| Task | Estimate | Notes |
|------|----------|-------|
| Goalie Game Chart (5-Pillar) | 0 hrs | ✅ **ALREADY BUILT** with 50+ fields |
| Goalie Practice Chart | 0 hrs | ✅ Admin can create via form builder UI |
| Parent Observation Chart | 0 hrs | ✅ Admin can create via form builder UI |
| Coach Evaluation Chart | 0 hrs | ✅ Admin can create via form builder UI |
| Goalie Coach Chart | 0 hrs | ✅ Admin can create via form builder UI |

**Note:** All new chart types can be created by Michael directly through `/admin/form-templates/new/` - no development needed. Time required is just Michael's time to design the template fields.

### Cross-Reference Analytics
| Task | Estimate | Notes |
|------|----------|-------|
| Cross-reference engine | 0 hrs | ✅ **ALREADY BUILT** (6 rules, alignment scoring) |
| Dashboard visualization | 4-6 hrs | Display existing cross-reference data |
| Additional rules | 1-2 hrs | Add new comparison rules (engine supports it) |

### TOTALS
| Scenario | Hours |
|----------|-------|
| **Using existing systems as-is** | 5-10 hrs |
| **+ Admin UI for question editing** | +8-10 hrs (optional) |
| **+ Custom implementations beyond existing** | +15-20 hrs (if needed) |

**Why so low?** Charting = 0 dev hours (admin creates via UI), Questionnaires = 0 hrs (already built), Scoring = 0 hrs (already built), Cross-reference = 0 hrs (already built). Remaining work is primarily dashboard visualization and any custom features not covered by existing systems.

---

## 6. KEY FILES FOR REFERENCE

```
CHARTING:
├── src/types/charting.ts                    # Legacy charting types
├── src/types/form-template.ts               # Dynamic forms types
├── src/lib/database/services/charting.service.ts
├── src/lib/database/services/dynamic-charting.service.ts
├── src/lib/database/services/form-template.service.ts
├── src/lib/templates/hockey-goalie-default.ts  # Pre-built template
├── src/lib/templates/init-templates.ts         # Template initialization
├── src/components/charting/                 # UI components
└── app/admin/form-templates/                # Admin form builder

QUESTIONNAIRES:
├── src/data/goalie-assessment-questions.ts  # 28 questions
├── src/data/goalie-intake-questions.ts      # 7 intake
├── src/data/coach-assessment-questions.ts   # 28 questions
├── src/data/coach-intake-questions.ts       # 7 intake
├── src/data/parent-assessment-questions.ts  # 28 questions
├── src/data/parent-intake-questions.ts      # 6 intake
├── src/types/onboarding.ts                  # All types + pacing
└── src/lib/database/services/onboarding.service.ts

SCORING:
├── src/lib/scoring/intelligence-profile.ts  # 1.0-4.0 scoring (441 lines)
├── src/lib/scoring/cross-reference-engine.ts # 6 rules (391 lines)
├── src/lib/scoring/index.ts                 # Public exports
└── src/components/onboarding/intelligence-profile-view.tsx

ANALYTICS:
├── app/admin/analytics/page.tsx             # Dashboard (597 lines)
├── src/lib/database/services/analytics.service.ts (519 lines)
├── src/lib/database/services/student-analytics.service.ts (980 lines)
├── src/lib/database/services/dynamic-analytics.service.ts
└── src/components/admin/analytics/
```

---

## BOTTOM LINE FOR MICHAEL

1. **Charting has full admin UI** - Michael can create ANY chart type (Practice, Parent, Coach) directly through `/admin/form-templates/new/` with no development needed. Just design the fields.
2. **Questionnaires are complete and working** - All 84 questions (28 per role) exist and work. They're stored as code (TypeScript), which means a developer edits them. If Michael wants a UI to edit questions himself, that's 8-10 hrs extra (optional).
3. **Scoring foundation is complete** - 1.0-4.0 scale, cross-reference (all 6 rules), gap analysis all ready to use
4. **Total realistic development estimate:**
   - **5-10 hours** for dashboard visualization and integration work
   - **+8-10 hours** only if admin UI for question editing is desired

**The platform has FAR more built than Michael realized.** Charting, questionnaires, scoring, and cross-reference are all complete. The only development work needed is displaying the data in dashboards and any truly custom features.

---

## SESSION METADATA

**Time Spent:** ~30 minutes
**Work Completed:** System analysis and documentation
**Files Created:** This document
**Next Steps:** Share with Michael for review and hour estimation finalization
