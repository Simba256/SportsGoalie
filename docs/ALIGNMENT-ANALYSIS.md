# Codebase, Requirements & Timeline Alignment Analysis

## Executive Summary

After thorough analysis of the codebase, client requirements (summary_points.txt), and phase timeline, I've identified **significant gaps** between what's planned and what's actually needed. The current codebase has a solid foundation, but the timeline is missing critical features that the client explicitly requested.

---

## Current Codebase Inventory

### What Already Exists (Reusable)

| Feature | Status | Quality | Notes |
|---------|--------|---------|-------|
| Firebase Auth | ✅ Complete | Good | Login, register, password reset |
| User Management | ✅ Complete | Good | Profiles, preferences |
| Sport/Skill CRUD | ✅ Complete | Good | Dynamic structure, needs constraint to 6 |
| Video Quiz System | ✅ Complete | Excellent | Timed questions, multiple types, progress tracking |
| Progress Tracking | ✅ Complete | Good | Per sport/skill, streaks, time spent |
| Charting System | ✅ Complete | Excellent | Hockey-specific, periods, analytics |
| Dynamic Form Templates | ✅ Complete | Excellent | Flexible charting without code changes |
| Admin Dashboards | ✅ Complete | Good | Sports, quizzes, users, analytics |
| Messaging System | ✅ Partial | Good | Admin→users only |
| Achievement System | ✅ Complete | Good | Types, criteria, unlocking |
| Notifications | ✅ Basic | Adequate | Structure exists, needs expansion |

### Database Services (14 total)
```
✅ sports.service.ts      - Sport/skill CRUD, progress
✅ video-quiz.service.ts  - Quiz management, attempts
✅ user.service.ts        - User CRUD, profiles
✅ progress.service.ts    - Progress calculations
✅ charting.service.ts    - Game/practice charting
✅ form-template.service.ts - Dynamic forms
✅ dynamic-charting.service.ts - Form-based entries
✅ dynamic-analytics.service.ts - Analytics calculations
✅ enrollment.service.ts  - Course enrollment
✅ message.service.ts     - Messaging
✅ video-review.service.ts - Video content
✅ student-analytics.service.ts - Student metrics
✅ analytics.service.ts   - General analytics
✅ mock-data.service.ts   - Dev data generation
```

### Current Roles
```typescript
export type UserRole = 'student' | 'admin';  // ONLY TWO ROLES
```

---

## Gap Analysis: Requirements vs Timeline

### CRITICAL GAPS (Not in Timeline, Required by Client)

| # | Client Requirement | In Timeline? | Priority |
|---|-------------------|--------------|----------|
| 1 | **Coach Role** (coaches have their own students) | ❌ Mentioned but not detailed | CRITICAL |
| 2 | **Parent Role** (view child's progress, multiple children) | ❌ Missing entirely | CRITICAL |
| 3 | **Coach-Student Relationship** (assignment, monitoring) | ❌ Missing | CRITICAL |
| 4 | **Parent-Child Relationship** (linking accounts) | ❌ Missing | CRITICAL |
| 5 | **Payment/Stripe Integration** | ❌ Missing | HIGH |
| 6 | **Parents require paid child account** | ❌ Missing | HIGH |
| 7 | **Initial Evaluation Period on Signup** | ❌ Missing | HIGH |
| 8 | **Background History Survey** (games played, levels, etc.) | ❌ Missing | HIGH |
| 9 | **Teams & Organizations** | ❌ Missing | MEDIUM |
| 10 | **Video Upload & Compression (720p)** | ❌ Missing | MEDIUM |
| 11 | **Admin "Preview as Student"** | ❌ Missing | MEDIUM |
| 12 | **Social/Community Features** | ❌ Missing | LOW |
| 13 | **Calendar Integrations & Reminders** | ⚠️ Phase 5.3 | MEDIUM |

### Partial Gaps (In Timeline, Needs Clarification)

| Requirement | Timeline Coverage | Gap |
|-------------|------------------|-----|
| Hide numerical scores from students | Phase 2.2 mentions "no numerical scores" | Needs explicit implementation |
| Students only see unlocked content | Phase 2.2 mentions lock states | Needs content hiding, not just locks |
| Remedial content on failure | Phase 2.6 covers this | ✅ Aligned |
| Coach can comment on charts | Phase 4.2 mentions coach | No coach role defined |
| Charting for parents/coaches | Charting exists | No parent/coach access defined |

### Already Built (No Need to Rebuild)

| Timeline Item | Status | Action |
|--------------|--------|--------|
| Phase 2.5: Video Quiz Evaluations | ✅ VideoQuizService exists | Reuse, add level linking |
| Phase 3.2: Video Watch Progress | ✅ VideoProgress type exists | Extend for non-quiz videos |
| Phase 4.3: Admin Analytics | ✅ Analytics dashboards exist | Extend, don't rebuild |

---

## Revised Phase Plan

### NEW Phase 2.0: Role System Foundation (ADD BEFORE 2.1)

**Why:** Coach and Parent roles are prerequisites for most client requirements.

```
Phase 2.0: Multi-Role User System
├── 2.0.1: Extend UserRole type (student | coach | parent | admin)
├── 2.0.2: Coach-Student relationship model (coach_students collection)
├── 2.0.3: Parent-Child relationship model (parent_children collection)
├── 2.0.4: Role-based route protection middleware
├── 2.0.5: Role-specific dashboards (coach dashboard, parent dashboard)
└── 2.0.6: Update all existing admin pages for coach access where appropriate
```

**Database Collections to Add:**
```
coach_students/
├── id, coachId, studentId, assignedAt, status

parent_children/
├── id, parentId, childId (studentId), relationship, linkedAt
```

### NEW Phase 2.0.5: Onboarding & Evaluation Flow (ADD)

**Why:** Client explicitly requires evaluation period and background survey.

```
Phase 2.0.5: Student Onboarding
├── Background history survey form (games played, levels, experience)
├── Initial evaluation assignment (video quizzes)
├── Evaluation period tracking (status: evaluating → evaluated → active)
├── Coach/Admin review of evaluation results
└── Placement into appropriate pillar levels based on evaluation
```

### UPDATED Phase 2: Convert to 6 Fixed Pillars

Keep existing phases 2.1-2.7 but add:

```
Phase 2.8: Content Visibility Rules
├── Students only see unlocked levels (not locked with icons - HIDDEN)
├── Score hiding for students (store scores, show pass/fail only)
├── Admin/Coach can see all scores
└── Parent sees child's pass/fail status
```

### NEW Phase 3.5: Video Upload & Management (ADD)

```
Phase 3.5: Video Upload System
├── Student video upload (for analysis tier)
├── Auto-compression to 720p (Firebase Functions or client-side)
├── Coach/Admin review queue
├── Parent viewing access to student uploads
└── Storage quota management
```

### UPDATED Phase 4: Analytics & Roles

```
Phase 4.2: Coach Dashboard & Student Management
├── Coach roster (assigned students)
├── Student progress overview
├── Evaluation score visibility
├── Comment on student charts
├── Custom content assignment per student
└── Bulk messaging to students

Phase 4.2.5: Parent Dashboard (NEW)
├── Child progress view (pillar completion, pass/fail)
├── Evaluation feedback viewing
├── Chart viewing (games, practices)
├── Video upload viewing
├── Multiple children support
└── No editing capabilities (view-only)
```

### NEW Phase 7: Payment & Tiers (ADD)

```
Phase 7: Subscription & Payment
├── 7.1: Stripe Integration Setup
├── 7.2: Subscription Tiers (Basic, Pro, Premium)
├── 7.3: Parent Account Requires Paid Child
├── 7.4: Feature Gating by Tier
├── 7.5: Advanced Video Analysis (Premium only)
└── 7.6: Billing Management & History
```

---

## Architecture Recommendations for Scale

### Current Architecture (Good)
- ✅ BaseDatabaseService with retry, circuit breaker, caching
- ✅ Firestore (scales horizontally)
- ✅ TypeScript strict mode
- ✅ Service layer abstraction
- ✅ Real-time subscriptions

### Needed for 1000s of Users

| Area | Current | Recommendation |
|------|---------|----------------|
| Caching | LRU in-memory | Add Redis for shared cache (optional) |
| Queries | Basic indexes | Audit & add composite indexes |
| Pagination | Exists but inconsistent | Standardize cursor-based pagination everywhere |
| Background Jobs | None | Add Cloud Functions for: video compression, email sending, analytics aggregation |
| Rate Limiting | Config exists | Implement enforcement |
| Monitoring | None | Add Sentry, Firebase Performance |

### Code Organization Concerns

| Issue | Current State | Recommendation |
|-------|--------------|----------------|
| BaseDatabaseService | 25K+ lines | Consider splitting into smaller modules |
| Types | Well organized | Keep as-is |
| Services | 14 services | Good modularization |
| Components | Reasonable | Add component documentation |

### Firestore Indexes Needed

```javascript
// Composite indexes to add for common queries:
{ collection: 'video_quiz_progress', fields: ['userId', 'pillarId', 'levelSlug'] }
{ collection: 'student_pillar_progress', fields: ['studentId', 'status'] }
{ collection: 'coach_students', fields: ['coachId', 'status'] }
{ collection: 'parent_children', fields: ['parentId'] }
{ collection: 'lessons', fields: ['pillarId', 'levelId', 'order'] }
```

---

## Type Changes Summary

### Existing Types to Modify

```typescript
// src/types/index.ts - Change this:
export type UserRole = 'student' | 'admin';

// To this:
export type UserRole = 'student' | 'coach' | 'parent' | 'admin';

// Add to User interface:
export interface User {
  // ... existing fields
  coachId?: string;        // For students assigned to a coach
  parentIds?: string[];    // For students with parent accounts
  childrenIds?: string[];  // For parents with multiple children
  subscriptionTier?: 'free' | 'basic' | 'pro' | 'premium';
  evaluationStatus?: 'pending' | 'in_progress' | 'completed';
}
```

### New Types Needed

```typescript
// Coach-Student relationship
interface CoachStudent {
  id: string;
  coachId: string;
  studentId: string;
  assignedAt: Timestamp;
  assignedBy: string; // admin who assigned
  status: 'active' | 'inactive';
  notes?: string;
}

// Parent-Child relationship
interface ParentChild {
  id: string;
  parentId: string;
  childId: string;
  relationship: 'parent' | 'guardian';
  linkedAt: Timestamp;
  linkedBy: string;
  status: 'active' | 'inactive';
}

// Student onboarding/evaluation
interface StudentOnboarding {
  id: string;
  studentId: string;
  backgroundSurvey: BackgroundSurvey;
  evaluationQuizzes: string[]; // quiz IDs
  evaluationResults: EvaluationResult[];
  status: 'survey_pending' | 'evaluating' | 'review_pending' | 'completed';
  placementLevel: Record<PillarSlug, PillarLevelSlug>;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  createdAt: Timestamp;
}

interface BackgroundSurvey {
  yearsPlaying: number;
  gamesPlayed: number;
  highestLevel: string;
  previousTraining: string[];
  injuries?: string;
  goals: string[];
  availability: string;
}
```

---

## Revised Timeline Summary

```
Phase 1: Foundation (DONE)

Phase 2: Role System & 6 Pillars
├── 2.0: Multi-Role User System (NEW - CRITICAL)
│   ├── 2.0.1: Extend roles (student/coach/parent/admin)
│   ├── 2.0.2: Coach-Student relationships
│   ├── 2.0.3: Parent-Child relationships
│   ├── 2.0.4: Role-based middleware
│   └── 2.0.5: Student Onboarding Flow
├── 2.1: Database Migration & Seed 6 Fixed Pillars
├── 2.2: Student Dashboard with Hidden Locked Content
├── 2.3: Lesson Viewing & Completion
├── 2.4: Admin Lesson CRUD
├── 2.5: Level Evaluations via Video Quizzes
├── 2.6: Remedial Content for Failures
├── 2.7: Navigation Updates
└── 2.8: Content Visibility Rules (scores hidden for students)

Phase 3: Rich Content & Media
├── 3.1: Rich Text Editor
├── 3.2: Video Watch Progress (extend existing)
├── 3.3: Downloadable Resources
├── 3.4: Practice Drill Library
└── 3.5: Video Upload & Compression (NEW)

Phase 4: Analytics & Dashboards
├── 4.1: Student Progress Dashboard
├── 4.2: Coach Dashboard & Student Management
├── 4.2.5: Parent Dashboard (NEW)
└── 4.3: Admin Analytics & Content Effectiveness

Phase 5: Communication & Scheduling
├── 5.1: Coach Feedback on Evaluations
├── 5.2: Announcements & Notifications
├── 5.3: Calendar & Reminders
└── 5.4: Bulk Messaging (coach/admin to students)

Phase 6: Mobile & Performance
├── 6.1: Mobile-Optimized Experience
├── 6.2: Performance Optimization
├── 6.3: Multi-Sport Architecture (Future)
└── 6.4: Production Hardening

Phase 7: Payments & Subscriptions (NEW)
├── 7.1: Stripe Integration
├── 7.2: Subscription Tiers
├── 7.3: Parent Account Requirements
├── 7.4: Feature Gating
└── 7.5: Premium Video Analysis
```

---

## Confirmed Decisions

| Question | Answer |
|----------|--------|
| Can coaches create/edit content? | **Yes** - coaches can edit lessons and leave comments/reviews |
| What can parents see? | **Everything** - scores, tests, video uploads, coach comments |
| Who assigns coaches to students? | Admin |
| Who reviews evaluations? | **Automated** - score-based level unlocking |
| Can students skip evaluation? | No - must complete before accessing content |
| When do we need payments? | **After Phase 6**, before social/multi-sport |
| Age compliance? | Canadian PIPEDA - under 13 requires parental consent |

## Immediate Action Items

### Before Starting Phase 2.1

1. ~~Decision Required: Role hierarchy~~ ✅ Confirmed
2. ~~Decision Required: Evaluation flow~~ ✅ Confirmed
3. ~~Decision Required: Payment timing~~ ✅ Confirmed

### Start With (Recommended Order)

1. **Phase 2.0.1**: Add coach/parent roles to types (foundational)
2. **Phase 2.1**: Convert to 6 pillars (can run in parallel with 2.0.x)
3. **Phase 2.0.2**: Coach-student relationships
4. **Phase 2.0.3**: Parent-child relationships + compliance (under-13 consent)
5. **Phase 2.0.4**: Role-based route protection
6. **Phase 2.0.5**: Student onboarding with age verification + evaluation

### Canadian Compliance Note

For children ages 6+, PIPEDA requires:
- **Under 13**: Parental consent before account creation
- **13-17**: Age-appropriate consent
- Date of birth collection on registration
- Privacy by default settings
- Parental data access/deletion rights

See `/docs/COMPLIANCE-CANADA.md` for full requirements.

---

## What NOT to Rebuild

| Existing Feature | Status | Action |
|-----------------|--------|--------|
| VideoQuizService | Excellent | Keep, extend for evaluations |
| ChartingService | Excellent | Keep, add coach/parent access |
| FormTemplateService | Excellent | Keep as-is |
| Progress tracking | Good | Extend for pillar progress |
| Achievement system | Good | Keep as-is |
| Admin analytics | Good | Extend, don't replace |
| Messaging system | Good | Extend for coach, bulk |

---

## Conclusion

The current codebase is **well-architected and scalable**. The main gaps are:

1. **Role system** - Only 2 roles, need 4
2. **Relationships** - No coach-student or parent-child models
3. **Onboarding flow** - No evaluation period
4. **Payments** - Not started
5. **Content visibility** - Locked content visible (should be hidden)

The timeline needs to be updated to address these gaps **before** the detailed pillar work, as many features depend on having proper roles in place.

**Recommendation:** Start with Phase 2.0 (roles) in parallel with Phase 2.1 (pillar structure), as they're mostly independent. This maximizes progress while ensuring foundations are solid.
