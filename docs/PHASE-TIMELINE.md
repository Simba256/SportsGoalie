# SportsGoalie Phase Timeline (Revised)

## Project Goal

Transform the existing dynamic sports learning platform into a specialized **Ice Hockey Goalie Training System** with:
- 4 user roles (Student, Coach, Parent, Admin)
- 6 fixed pillars with 3 levels each
- Subscription tiers with Stripe
- Scalable architecture for thousands of users

---

## Time Estimates Summary

| Phase | Description | Hours | Days (8hr) |
|-------|-------------|-------|------------|
| **Phase 2** | Roles + 6 Pillars | 170-220 | 21-28 |
| **Phase 3** | Rich Content & Media | 86-112 | 11-14 |
| **Phase 4** | Analytics & Dashboards | 80-106 | 10-13 |
| **Phase 5** | Communication & Scheduling | 62-82 | 8-10 |
| **Phase 6** | Mobile & Performance | 92-124 | 12-16 |
| **Phase 7** | Payments & Subscriptions | 80-106 | 10-13 |
| **TOTAL** | All Phases | **570-750** | **71-94** |

*Estimates assume a competent mid-level developer familiar with Next.js/Firebase*

---

## Phase 1: Authentication, Sports CRUD & Video Quizzes (COMPLETED)

**Status:** Done

### What Was Built
- Firebase Auth with Student/Admin roles
- Dynamic sports and skills content management
- Video quiz creation, taking, and scoring
- Basic dashboard and responsive UI
- User progress tracking per sport/skill
- Charting system for hockey goalies
- Dynamic form templates
- Admin analytics dashboards

---

## Phase 2: Multi-Role System & 6 Fixed Pillars

### Phase 2.0.1: Extend User Roles (Student/Coach/Parent/Admin)

**Estimated Time:** 6-8 hours

**What Changes:**
- Update `UserRole` type: `'student' | 'coach' | 'parent' | 'admin'`
- Add role-specific fields to User interface
- Update registration flow with role selection
- Role validation in auth context

**Outcome:** System supports 4 distinct user roles.

---

### Phase 2.0.2: Coach-Student Relationship Model

**Estimated Time:** 16-20 hours

**What Changes:**
- Create `coach_students` collection
- CoachStudentService with assign/unassign/list methods
- Admin UI to assign students to coaches
- Coach can view assigned students list
- Student profile shows assigned coach

**Outcome:** Coaches have their own roster of students.

---

### Phase 2.0.3: Parent-Child Relationship Model

**Estimated Time:** 20-24 hours (includes compliance additions)

**What Changes:**
- Create `parent_children` collection
- ParentChildService with link/unlink/list methods
- Parent can have multiple children (students)
- Child profile shows linked parents
- Admin UI to link parents to children
- Under-13 consent workflow

**Outcome:** Parents linked to their children's accounts.

---

### Phase 2.0.4: Role-Based Route Protection

**Estimated Time:** 12-16 hours

**What Changes:**
- Update ProtectedRoute component for role checking
- Create role-specific middleware
- `/coach/*` routes require coach role
- `/parent/*` routes require parent role
- `/admin/*` routes require admin role
- Redirect unauthorized users appropriately

**Outcome:** Routes protected by role, not just authentication.

---

### Phase 2.0.5: Student Onboarding & Initial Evaluation

**Estimated Time:** 20-26 hours

**What Changes:**
- **Date of birth collection** on registration (required for compliance)
- Age-based registration routing (under 13 → parent consent first)
- Background history survey (years playing, games, level)
- `student_onboarding` collection tracking evaluation status
- Assign initial evaluation quizzes automatically
- **Automated scoring** → level unlocking (no manual review)
- Student blocked from pillar content until evaluation complete

**Outcome:** Age-compliant registration with automated placement.

---

### Phase 2.1: Database Migration & Seed 6 Fixed Pillars

**Estimated Time:** 16-20 hours

**What Changes:**
- Create `pillars` collection with 6 fixed documents
- Create `pillar_levels` collection (18 docs: 6 pillars × 3 levels)
- Create `lessons` collection (empty, admin adds content)
- PillarService with constrained operations (no add/delete pillars)
- Remove "create new sport" functionality from admin UI

**Outcome:** Database contains exactly 6 pillars, structure is fixed.

---

### Phase 2.2: Student Dashboard with Hidden Locked Content

**Estimated Time:** 16-20 hours

**What Changes:**
- `/pillars` page showing 6 pillar cards
- Pillar card shows current level and completion status
- **Locked levels are HIDDEN, not shown with lock icon**
- Students only see Introduction level initially
- Development/Refinement revealed only when unlocked
- Visual progress indicator (no numerical scores)

**Outcome:** Students see only what they've unlocked, unaware of hidden content.

---

### Phase 2.3: Lesson Viewing & Completion Tracking

**Estimated Time:** 14-18 hours

**What Changes:**
- Level page lists lessons for unlocked level only
- Lesson detail page with content (text, video)
- "Mark as Complete" button updates progress
- Completed lessons show checkmark
- Cannot access lessons in locked levels (404, not "locked")

**Outcome:** Students progress through lessons in unlocked levels.

---

### Phase 2.4: Admin & Coach Lesson Management

**Estimated Time:** 20-26 hours

**What Changes:**
- `/admin/pillars` overview (6 pillars, view-only structure)
- `/admin/pillars/[id]/levels/[level]/lessons` management
- Create lesson form: title, description, content, video URL, order
- Edit/delete existing lessons
- Drag-and-drop reordering
- **Coaches can also edit lessons** (same UI, role-checked)
- Preview lesson as student

**Outcome:** Admins and coaches manage lesson content.

---

### Phase 2.5: Link Video Quizzes as Level Evaluations

**Estimated Time:** 16-20 hours

**What Changes:**
- `pillar_level_evaluations` collection maps levels to video quizzes
- Admin assigns existing video quiz as level evaluation
- Student takes evaluation from level completion page
- Score stored but **not shown to student** (pass/fail only)
- Pass (≥ threshold) → unlock next level
- Fail → redirect to remedial content

**Outcome:** Video quiz evaluations gate level progression.

---

### Phase 2.6: Remedial Content for Failed Evaluations

**Estimated Time:** 18-22 hours

**What Changes:**
- `remedial_content` collection per level
- Review page after failing evaluation
- Lists lessons to revisit
- Additional simplified videos/resources
- "Retake Evaluation" button (after reviewing)
- Admin UI to manage remedial content

**Outcome:** Failed students get targeted review before retry.

---

### Phase 2.7: Coach & Parent Content Access

**Estimated Time:** 16-20 hours

**What Changes:**
- **Coach**: Full content access, can edit lessons
- **Coach**: Sees all student scores (numerical)
- **Coach**: Can leave comments/reviews on student progress
- **Coach**: Can add custom notes per student
- **Parent**: Full visibility of child's data:
  - All scores and test results
  - Video uploads
  - Coach comments and feedback
  - Charting entries
  - Progress history
- Parent is view-only (cannot edit)

**Outcome:** Coaches edit and comment, parents see everything.

---

### Phase 2.8: Navigation & Dashboard Updates

**Estimated Time:** 12-16 hours

**What Changes:**
- Student sidebar: "My Training" → 6 pillars
- Coach sidebar: "My Students", "Content Library"
- Parent sidebar: "My Children", "Progress"
- Admin sidebar: unchanged (full access)
- Dashboard widgets per role
- Remove all "Add Sport" buttons

**Outcome:** Navigation reflects role and fixed pillar structure.

---

**Phase 2 Total: 170-220 hours (21-28 days)**

---

## Phase 3: Rich Content & Media

### Phase 3.1: Rich Text Editor for Lesson Content

**Estimated Time:** 12-16 hours

**What Changes:**
- Integrate TipTap or similar editor
- Support headings, lists, bold/italic, links
- Image upload within content
- Admin lesson form uses rich editor

**Outcome:** Formatted lesson content with embedded images.

---

### Phase 3.2: Video Lesson Progress Tracking

**Estimated Time:** 14-18 hours

**What Changes:**
- Extend existing VideoProgress for non-quiz videos
- Track watch percentage per lesson video
- Require minimum watch % for lesson completion
- Resume from last position
- Support YouTube, Vimeo, direct uploads

**Outcome:** Video engagement tracked for all lesson types.

---

### Phase 3.3: Downloadable Resources & Attachments

**Estimated Time:** 14-18 hours

**What Changes:**
- File upload for PDFs, images, documents
- Resource list per lesson with download buttons
- Firebase Storage integration
- Admin UI to attach files to lessons

**Outcome:** Lessons include downloadable materials.

---

### Phase 3.4: Practice Drill Library

**Estimated Time:** 20-26 hours

**What Changes:**
- `drills` collection with instructions, difficulty, duration
- Browsable drill library page
- Link drills to lessons/levels
- Filter by pillar, difficulty, on-ice/off-ice
- Student practice log

**Outcome:** Structured practice drills accessible to students.

---

### Phase 3.5: Video Upload & Compression

**Estimated Time:** 26-34 hours

**What Changes:**
- Student video upload (for premium tier)
- Auto-compress to 720p via Cloud Function
- Upload to Firebase Storage with quota limits
- Coach/Admin review queue for uploaded videos
- Parent can view child's uploaded videos

**Outcome:** Students can upload videos for analysis.

---

**Phase 3 Total: 86-112 hours (11-14 days)**

---

## Phase 4: Analytics & Role Dashboards

### Phase 4.1: Student Personal Progress Dashboard

**Estimated Time:** 18-24 hours

**What Changes:**
- `/progress` page with pillar completion visualization
- Lessons completed, time spent metrics
- Streak and consistency tracking
- Milestone achievements
- Recent activity timeline
- **No numerical evaluation scores shown**

**Outcome:** Students see progress without score anxiety.

---

### Phase 4.2: Coach Student Management Dashboard

**Estimated Time:** 22-28 hours

**What Changes:**
- `/coach/students` roster of assigned students
- Per-student progress cards with pillar status
- Click through to detailed student view
- **Evaluation scores visible to coach**
- Filter by status (stuck, advancing, completed)
- Add notes/comments to student profile
- Custom content assignment

**Outcome:** Coaches monitor and support their students.

---

### Phase 4.3: Parent Progress Viewing Dashboard

**Estimated Time:** 20-26 hours

**What Changes:**
- `/parent/children` list of linked children
- Per-child full progress overview:
  - **All evaluation scores** (numerical)
  - **All test/quiz results**
  - **Video uploads and coach feedback**
  - **Coach comments and reviews**
  - Charting entries (games, practices)
  - Lesson completion history
- Data export (download child's data)
- Consent management (revoke, delete)
- **View-only, no editing capabilities**

**Outcome:** Parents have complete visibility of child's journey.

---

### Phase 4.4: Admin Analytics & Content Effectiveness

**Estimated Time:** 20-28 hours

**What Changes:**
- `/admin/analytics` comprehensive dashboard
- Evaluation pass/fail rates per level
- Lesson completion rates, drop-off points
- Average time to complete levels
- Student cohort comparisons
- Coach performance metrics
- CSV/Excel export

**Outcome:** Data-driven content and coaching decisions.

---

**Phase 4 Total: 80-106 hours (10-13 days)**

---

## Phase 5: Communication & Scheduling

### Phase 5.1: Coach Feedback on Evaluations

**Estimated Time:** 16-20 hours

**What Changes:**
- Coach can add written feedback after viewing evaluation
- Student notified when feedback received
- Feedback history on evaluation page
- Coach can require re-attempt with guidance
- Feedback visible to parent

**Outcome:** Personalized feedback from coaches.

---

### Phase 5.2: Announcements & Notifications

**Estimated Time:** 16-20 hours

**What Changes:**
- Admin/coach can post announcements
- Notification bell with unread count
- Notifications for: level unlocked, feedback, new content
- Email notification preferences
- Parent receives notifications about child

**Outcome:** Users stay informed of updates.

---

### Phase 5.3: Bulk Messaging (Coach/Admin to Students)

**Estimated Time:** 12-16 hours

**What Changes:**
- Extend existing messaging for coaches
- Bulk select students for message
- Message templates
- Delivery confirmation
- Parent can view messages sent to child

**Outcome:** Efficient communication with student groups.

---

### Phase 5.4: Calendar Integration & Reminders

**Estimated Time:** 18-26 hours

**What Changes:**
- Learning schedule goals (lessons per week)
- Calendar view of games/practices from charting
- Reminder notifications for charting after games
- Inactive student reminders
- Coach-suggested schedules

**Outcome:** Structured learning pacing with reminders.

---

**Phase 5 Total: 62-82 hours (8-10 days)**

---

## Phase 6: Mobile & Performance

### Phase 6.1: Mobile-Optimized Experience

**Estimated Time:** 26-34 hours

**What Changes:**
- Touch-friendly navigation and buttons
- Swipe gestures for lesson navigation
- PWA manifest for home screen install
- Offline lesson access (cached)
- Mobile video upload from camera roll
- Mobile-specific layouts

**Outcome:** Full functionality on phones and tablets.

---

### Phase 6.2: Performance Optimization & Caching

**Estimated Time:** 24-32 hours

**What Changes:**
- Firestore composite indexes audit
- React Query/SWR for client caching
- Image lazy loading and optimization
- Code splitting by route
- Cloud Functions for heavy operations
- Target < 2s initial load time

**Outcome:** Fast experience at scale (1000s of users).

---

### Phase 6.3: Admin Preview as Student

**Estimated Time:** 10-14 hours

**What Changes:**
- Admin can "impersonate" any student view
- See exactly what student sees (hidden content, etc.)
- Clear visual indicator of preview mode
- Audit log of preview sessions

**Outcome:** Admin can debug and verify student experience.

---

### Phase 6.4: Production Hardening & Launch

**Estimated Time:** 32-44 hours

**What Changes:**
- Comprehensive error boundaries
- Security audit (auth rules, input validation)
- Automated backup verification
- Monitoring/alerting (Sentry, Firebase Performance)
- Load testing (1000+ concurrent users)
- Rate limiting enforcement
- User documentation and help pages

**Outcome:** Production-ready, reliable application.

---

**Phase 6 Total: 92-124 hours (12-16 days)**

---

## Phase 7: Payments & Subscriptions

### Phase 7.1: Stripe Integration Setup

**Estimated Time:** 18-24 hours

**What Changes:**
- Stripe account connection
- Customer creation on registration
- Webhook handling for events
- Payment method management

**Outcome:** Stripe infrastructure ready.

---

### Phase 7.2: Subscription Tiers Definition

**Estimated Time:** 12-16 hours

**What Changes:**
- Define tiers: Free, Basic, Pro, Premium
- Feature matrix per tier
- Pricing configuration
- Trial period support

**Tier Features:**
- Free: Limited pillars, no video upload
- Basic: All pillars, no video analysis
- Pro: Video upload, coach feedback
- Premium: Advanced video analysis, priority support

**Outcome:** Clear tier structure defined.

---

### Phase 7.3: Parent Account Requirements

**Estimated Time:** 10-14 hours

**What Changes:**
- Parent registration requires linked paid child
- Validation during parent signup
- Parent inherits access from child's tier
- Multiple children → highest tier applies

**Outcome:** Parents only access with paid student account.

---

### Phase 7.4: Feature Gating by Tier

**Estimated Time:** 16-20 hours

**What Changes:**
- Middleware to check tier for features
- UI shows upgrade prompts for locked features
- Graceful degradation for expired subscriptions
- Admin can override/grant access

**Outcome:** Features properly gated by subscription.

---

### Phase 7.5: Billing Management & History

**Estimated Time:** 24-32 hours

**What Changes:**
- Billing history page
- Invoice downloads
- Subscription management (upgrade/downgrade/cancel)
- Payment failure handling
- Admin billing dashboard

**Outcome:** Complete billing self-service.

---

**Phase 7 Total: 80-106 hours (10-13 days)**

---

## Phase 8: Future Expansion

### Phase 8.1: Teams & Organizations

**What Changes:**
- Organization accounts
- Team management within organizations
- Shared tournaments/games
- Organization billing
- Organization admin role

**Outcome:** Support for hockey organizations.

---

### Phase 8.2: Multi-Sport Architecture

**What Changes:**
- Sport selection on registration
- Sport-specific pillar configurations
- Shared vs sport-specific content
- Multi-sport admin tools
- URL structure: `/sports/[sport]/pillars`

**Outcome:** Platform ready for additional sports.

---

### Phase 8.3: Social & Community Features

**What Changes:**
- Public achievement sharing
- Progress sharing to social media
- Community feed
- Student recognition/spotlight
- Privacy controls

**Outcome:** Community engagement features.

---

## Phase Dependencies

```
Phase 1 (DONE)
    │
    └── Phase 2.0.x (Roles) ←── CRITICAL FOUNDATION
            │
            ├── 2.0.1 (Role Types)
            │       └── 2.0.2 (Coach-Student)
            │               └── 2.0.3 (Parent-Child)
            │                       └── 2.0.4 (Route Protection)
            │                               └── 2.0.5 (Onboarding)
            │
            └── 2.1 (6 Pillars DB) ←── Can run in parallel with 2.0.x
                    │
                    ├── 2.2 (Student Pillar UI)
                    │       └── 2.3 (Lesson Viewing)
                    │               └── 2.5 (Evaluations)
                    │                       └── 2.6 (Remedial)
                    │
                    └── 2.4 (Admin Lessons)
                            └── 2.7 (Role Access)
                                    └── 2.8 (Navigation)

Phase 2.8 ──→ Phase 3 (Content)
                    └── 3.1 → 3.2 → 3.3 → 3.4 → 3.5

Phase 2.8 ──→ Phase 4 (Analytics)
                    └── 4.1 → 4.2 → 4.3 → 4.4

Phase 4 ────→ Phase 5 (Communication)
                    └── 5.1 → 5.2 → 5.3 → 5.4

Phase 5 ────→ Phase 6 (Mobile/Performance)
                    └── 6.1 → 6.2 → 6.3 → 6.4

Phase 6 ────→ Phase 7 (Payments)
                    └── 7.1 → 7.2 → 7.3 → 7.4 → 7.5

Phase 7 ────→ Phase 8 (Future)
                    └── 8.1 → 8.2 → 8.3
```

---

## Current Focus: Phase 2

| Sub-Phase | Name | Hours | Status | Priority |
|-----------|------|-------|--------|----------|
| 2.0.1 | Extend User Roles | 6-8 | **Next** | CRITICAL |
| 2.0.2 | Coach-Student Relationships | 16-20 | Next | CRITICAL |
| 2.0.3 | Parent-Child Relationships | 20-24 | Next | CRITICAL |
| 2.0.4 | Role-Based Route Protection | 12-16 | Pending | HIGH |
| 2.0.5 | Student Onboarding & Evaluation | 20-26 | Pending | HIGH |
| 2.1 | Database Migration & Seed 6 Pillars | 16-20 | **Parallel** | HIGH |
| 2.2 | Student Dashboard (Hidden Locked) | 16-20 | Pending | HIGH |
| 2.3 | Lesson Viewing & Completion | 14-18 | Pending | MEDIUM |
| 2.4 | Admin & Coach Lesson CRUD | 20-26 | Pending | MEDIUM |
| 2.5 | Level Evaluations | 16-20 | Pending | MEDIUM |
| 2.6 | Remedial Content | 18-22 | Pending | MEDIUM |
| 2.7 | Coach & Parent Access | 16-20 | Pending | MEDIUM |
| 2.8 | Navigation Updates | 12-16 | Pending | MEDIUM |
| | **Phase 2 Total** | **170-220** | | |

---

## Confirmed Decisions

| Decision | Answer |
|----------|--------|
| **Coach Permissions** | Can edit lessons AND leave comments/reviews for individual students |
| **Parent Visibility** | Full access: scores, tests, video uploads, coach comments |
| **Evaluation Review** | Automated - score-based level unlocking |
| **Payment Timeline** | After Phase 6 (basic features), before Phase 8 (social/multi-sport) |
| **Age Compliance** | Canadian PIPEDA - see `/docs/COMPLIANCE-CANADA.md` |

---

## Canadian Compliance Requirements (Ages 6+)

| Age | Requirement |
|-----|-------------|
| Under 13 | Parental consent required before account creation |
| 13-17 | Age-appropriate consent, parent linking optional |
| 18+ | Standard consent |

**Key Requirements:**
- Collect date of birth on registration
- Privacy by default (most restrictive settings)
- Parents can view/delete all child data
- Kid-friendly privacy explanations
- No dark patterns in UI

See `/docs/COMPLIANCE-CANADA.md` for full details.
