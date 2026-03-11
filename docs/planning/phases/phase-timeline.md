# SmarterGoalie Phase Timeline (Revised March 2026)

## Project Goal

Transform the existing dynamic sports learning platform into a specialized **Ice Hockey Goalie Training System** with:
- 4 user roles (Student, Coach, Parent, Admin)
- 6 fixed pillars with 3 levels each
- Intelligence-based assessment and personalized learning
- Subscription tiers with Stripe
- Scalable architecture for thousands of users

---

## Time Investment Summary

### Completed Work

| Phase | Description | Actual Hours | Status |
|-------|-------------|--------------|--------|
| **Phase 1** | Foundation (Auth, Quizzes, Charting) | ~160 | ✅ Complete |
| **Phase 2.0** | Multi-Role Foundation | 65 | ✅ Complete |
| **Phase 2.1** | 6-Pillar Framework | 14 | ✅ Complete |
| **Phase 2.2** | Intelligence-Based Onboarding | 15 | ✅ Complete |
| **Total Completed** | | **~254** | |

### Remaining Work Estimates

| Phase | Description | Est. Hours | Priority |
|-------|-------------|------------|----------|
| **Phase 2.3** | Public Experience & Registration Flow | 40-55 | CRITICAL |
| **Phase 2.4** | Parent System & Compliance | 24-32 | HIGH |
| **Phase 2.5** | Pillar Content & Level System | 40-52 | HIGH |
| **Phase 2.6** | Role-Based Access Hardening | 12-16 | MEDIUM |
| **Phase 3** | Rich Content & Media | 60-80 | MEDIUM |
| **Phase 4** | Analytics & Dashboards | 50-70 | MEDIUM |
| **Phase 5** | Communication & Scheduling | 40-55 | LOW |
| **Phase 6** | Mobile & Performance | 60-80 | LOW |
| **Phase 7** | Payments & Subscriptions | 60-80 | LOW |
| **Remaining Total** | | **396-520** | |

---

## Phase 1: Foundation (COMPLETED)

**Status:** ✅ Complete (~160 hours)

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

## Phase 2: Multi-Role System & 6-Pillar Framework

### Phase 2.0: Multi-Role Foundation (COMPLETED)

**Status:** ✅ Complete (65 hours)
**Completed:** February 22 - March 7, 2026

#### 2.0.1: User Roles & Authentication ✅
- Extended UserRole type: student | coach | parent | admin
- Role-specific fields in User interface
- Registration flow with role selection
- Role validation in auth context

#### 2.0.2: Student ID System ✅
- Crypto-random student ID generation (SG-XXXX-XXXX format)
- Profile display with copy-to-clipboard
- Registration security (Student/Parent only for public registration)

#### 2.0.3: Coach Invitation System ✅
- Email-based invitation workflow
- 32-character crypto-random tokens with 7-day expiry
- Admin UI for invitation management
- Coach acceptance flow with email verification skip

#### 2.0.4: Coach-Student Relationships ✅
- Direct coach-student linking via search
- Add/remove student functionality
- Student roster management
- Dashboard separation for custom vs automated students

#### 2.0.5: Custom Curriculum System ✅
- Student workflow types (automated vs custom)
- CustomCurriculumService with full CRUD
- Coach dashboard with statistics
- Curriculum builder interface with content browser
- Custom content library for reusable coach materials

#### 2.0.6: Coach Custom Content Creation ✅
- Video lesson creator with upload
- Quiz creator with 3-step wizard (VideoQuestionBuilder)
- Content library management
- Full feature parity with admin quiz tools

#### 2.0.7: AI Project Assistant ✅
- Intelligent chatbot with project knowledge
- Smart context loading (80-90% token savings)
- Claude Sonnet 4 integration
- Admin dashboard integration

---

### Phase 2.1: 6-Pillar Framework (COMPLETED)

**Status:** ✅ Complete (14 hours)
**Completed:** March 5-6, 2026

#### 2.1.1: Database Migration ✅
- Created 6 fixed pillar documents with specific IDs
- Migration script for existing content
- Pillar utility functions (colors, icons, helpers)

#### 2.1.2: Route & UI Updates ✅
- Renamed routes from /sports to /pillars
- Updated all internal navigation links
- Pillar management UI (view/edit only, no create/delete)
- Student dashboard with pillar progress cards

#### 2.1.3: Navigation Cleanup ✅
- Renamed "Courses" to "Pillars"
- Removed redundant navigation items
- Cleaner student nav: Pillars, Progress, Charting, Messages

---

### Phase 2.2: Intelligence-Based Onboarding (COMPLETED)

**Status:** ✅ Complete (15 hours)
**Completed:** March 4-7, 2026

#### 2.2.1: Student Onboarding Evaluation ✅
- 28-question assessment across 7 categories
- Immersive full-screen dark theme UI
- Auto-save and resume capability
- Question types: rating scales, multiple choice, true/false

#### 2.2.2: Intelligence Profile Scoring ✅
- 1.0-4.0 continuous scoring scale
- 7 assessment categories per role (goalie/parent/coach)
- Weighted category calculation
- Gap and strength analysis
- Pacing level mapping (Introduction/Development/Refinement)

#### 2.2.3: V2 Onboarding Flow ✅
- Intake questions (background, experience, goals)
- Bridge messages between sections
- Category introductions with icons
- Intelligence profile generation
- Coach review with level adjustment

#### 2.2.4: Cross-Reference Engine ✅
- Multi-role comparison (goalie vs parent vs coach assessments)
- Alignment detection and gap flagging
- Confidence gap, feedback gap, car ride gap identification

---

### Phase 2.3: Public Experience & Registration Flow (NOT STARTED)

**Status:** 🔲 Not Started
**Estimated:** 40-55 hours
**Priority:** CRITICAL - Entry point for all users

This phase creates the public-facing experience that visitors see before registration, showcasing the platform and guiding them toward signing up.

#### 2.3.1: Landing Page (16-22 hours)
**Marketing-grade landing page with professional design:**
- Hero section with compelling value proposition and CTA
- 6 Pillars showcase with visual cards/icons
- Platform features overview with animations
- How it works / Learning journey visualization
- Testimonials section (placeholder for real testimonials)
- Pricing preview section (if applicable)
- FAQ accordion section
- Footer with links, social, contact

**Design Elements:**
- Smooth scroll animations (Framer Motion)
- Responsive design (mobile-first)
- Professional imagery (goalie/hockey themed)
- Consistent branding with dark/ice theme

#### 2.3.2: Public Pages (12-16 hours)
**Separate audience-specific pages:**

**For Goalies/Students:**
- What you'll learn (6 pillars breakdown)
- Training methodology explanation
- Sample content preview (locked)
- Success stories / Progress examples
- Clear CTA to start questionnaire

**For Parents:**
- Why SmarterGoalie for your child
- What parents can monitor and see
- How coaching feedback works
- Safety and privacy commitments
- Age-appropriate training approach
- Clear CTA to start questionnaire

**About/Methodology:**
- Michael's coaching philosophy
- The science behind the 6 pillars
- Credentials and experience
- Platform story

#### 2.3.3: Pre-Registration Questionnaire (8-12 hours)
**Short questionnaire BEFORE account creation:**
- Role selection (Goalie/Student, Parent, Coach)
- 5-8 targeted questions based on role:
  - **Goalies:** Age, experience level, current team, goals
  - **Parents:** Child's age, experience, what they're looking for
  - **Coaches:** Coaching experience, team size, training approach
- Clean, immersive UI (similar to onboarding)
- Progress indicator
- Data stored temporarily, transferred to profile on registration

#### 2.3.4: Updated Registration Flow (4-5 hours)
- Integrate questionnaire data into registration
- Pre-populate profile fields from questionnaire
- Role-specific registration paths
- Clear next steps after registration
- Seamless transition to detailed onboarding evaluation

---

### Phase 2.4: Parent System & Compliance (NOT STARTED)

**Status:** 🔲 Not Started
**Estimated:** 24-32 hours
**Priority:** HIGH

#### 2.4.1: Parent-Child Relationships (8-10 hours)
- Create `parent_children` collection
- ParentChildService with link/unlink/list methods
- Parent links using student ID (no approval required)
- Multiple children per parent support
- Child profile shows linked parents

#### 2.4.2: Parent Onboarding Flow (8-12 hours)
- Parent intake questions (7 questions from scoring spec)
- Parent assessment (28 questions)
- Parent intelligence profile generation
- Cross-reference with child's goalie assessment

#### 2.4.3: Age Compliance (Canadian PIPEDA) (8-10 hours)
- Date of birth collection on registration
- Under-13 consent workflow (parent creates account first)
- Age-appropriate registration routing
- Privacy-first default settings
- Parent data access and deletion rights

---

### Phase 2.5: Pillar Content & Level System (NOT STARTED)

**Status:** 🔲 Not Started
**Estimated:** 40-52 hours
**Priority:** HIGH

#### 2.5.1: Pillar Level Structure (10-14 hours)
- Create `pillar_levels` collection (18 docs: 6 pillars × 3 levels)
- Create `lessons` collection for pillar-based content
- Level status tracking per student per pillar
- Hidden locked content (students only see unlocked levels)

#### 2.5.2: Lesson Management (12-16 hours)
- Admin/coach lesson CRUD for pillar levels
- Lesson page with content, video, objectives
- "Mark as Complete" functionality
- Lesson ordering and navigation
- Completed lessons show checkmark

#### 2.5.3: Level Evaluations (10-12 hours)
- Link existing video quizzes as level evaluations
- Score-based level unlocking (pass threshold → unlock next)
- Pass/fail display (no numerical scores shown to students)
- Evaluation history tracking

#### 2.5.4: Remedial Content (8-10 hours)
- Remedial content collection per level
- Review page after failing evaluation
- "Retake Evaluation" after reviewing
- Admin UI to manage remedial content

---

### Phase 2.6: Role-Based Access Hardening (NOT STARTED)

**Status:** 🔲 Not Started
**Estimated:** 12-16 hours
**Priority:** MEDIUM

#### 2.6.1: Route Protection Middleware (6-8 hours)
- Enhanced ProtectedRoute component for role checking
- `/coach/*` routes require coach role
- `/parent/*` routes require parent role
- `/admin/*` routes require admin role
- Proper redirects for unauthorized access

#### 2.6.2: Coach Content Access (6-8 hours)
- Coaches can edit pillar lessons
- Coaches see all student scores (numerical)
- Coach comments/reviews on student progress
- Custom notes per student

---

## Phase 3: Rich Content & Media

**Status:** 🔲 Not Started
**Estimated:** 60-80 hours (reduced from original 86-112)
**Dependencies:** Phase 2.4 (Pillar Lessons)

### 3.1: Rich Text Editor (10-14 hours)
- Integrate TipTap or similar editor
- Support headings, lists, bold/italic, links
- Image upload within content
- Admin lesson form uses rich editor

### 3.2: Video Progress Tracking (12-16 hours)
- Track watch percentage per lesson video
- Require minimum watch % for lesson completion
- Resume from last position
- Support YouTube, Vimeo, direct uploads

### 3.3: Downloadable Resources (10-14 hours)
- File upload for PDFs, images, documents
- Resource list per lesson with download buttons
- Firebase Storage integration

### 3.4: Practice Drill Library (16-20 hours)
- Drills collection with instructions, difficulty, duration
- Browsable drill library page
- Link drills to lessons/levels
- Filter by pillar, difficulty, on-ice/off-ice

### 3.5: Student Video Upload (12-16 hours)
- Student video upload (premium tier)
- Auto-compress via Cloud Function
- Upload quota limits
- Coach/admin review queue

---

## Phase 4: Analytics & Role Dashboards

**Status:** 🔲 Not Started
**Estimated:** 50-70 hours (reduced from original 80-106)
**Dependencies:** Phase 2.4 (Level System)

### 4.1: Student Progress Dashboard (12-16 hours)
- Pillar completion visualization
- Lessons completed, time spent metrics
- Streak and consistency tracking
- Milestone achievements
- No numerical evaluation scores shown

### 4.2: Coach Student Dashboard (14-18 hours)
- Enhanced roster with pillar status
- Evaluation scores visible to coach
- Filter by status (stuck, advancing, completed)
- Custom content assignment tracking

### 4.3: Parent Progress Dashboard (14-18 hours)
- Full child progress overview
- All evaluation scores and quiz results
- Video uploads and coach feedback
- Charting entries and history
- Data export capability

### 4.4: Admin Analytics (10-18 hours)
- Evaluation pass/fail rates per level
- Lesson completion rates, drop-off points
- Student cohort comparisons
- Coach performance metrics
- CSV/Excel export

---

## Phase 5: Communication & Scheduling

**Status:** 🔲 Not Started
**Estimated:** 40-55 hours (reduced from original 62-82)
**Dependencies:** Phase 4 (Dashboards)

### 5.1: Coach Feedback System (10-14 hours)
- Written feedback on evaluations
- Student notifications for feedback
- Feedback visible to parent
- Re-attempt guidance

### 5.2: Notifications (12-16 hours)
- Notification bell with unread count
- Email notification preferences
- Triggers: level unlocked, feedback, new content
- Parent notifications about child

### 5.3: Bulk Messaging (8-12 hours)
- Coach bulk select students for message
- Message templates
- Parent can view messages sent to child

### 5.4: Calendar & Reminders (10-13 hours)
- Learning schedule goals
- Charting reminders after games
- Inactive student reminders

---

## Phase 6: Mobile & Performance

**Status:** 🔲 Not Started
**Estimated:** 60-80 hours (reduced from original 92-124)
**Dependencies:** Phase 5 (Communication)

### 6.1: Mobile Optimization (20-26 hours)
- Touch-friendly navigation
- PWA manifest for home screen install
- Offline lesson access (cached)
- Mobile video upload
- Mobile-specific layouts

### 6.2: Performance Optimization (18-24 hours)
- Firestore composite indexes audit
- React Query/SWR for client caching
- Image lazy loading
- Code splitting by route
- Target < 2s initial load time

### 6.3: Admin Preview (8-12 hours)
- Admin can "impersonate" any student view
- Clear visual indicator of preview mode
- Audit log of preview sessions

### 6.4: Production Hardening (14-18 hours)
- Comprehensive error boundaries
- Security audit
- Monitoring/alerting (Sentry)
- Load testing
- User documentation

---

## Phase 7: Payments & Subscriptions

**Status:** 🔲 Not Started
**Estimated:** 60-80 hours (reduced from original 80-106)
**Dependencies:** Phase 6 (Production Ready)

### 7.1: Stripe Integration (14-18 hours)
- Stripe account connection
- Customer creation on registration
- Webhook handling
- Payment method management

### 7.2: Subscription Tiers (10-14 hours)
- Define tiers: Free, Basic, Pro, Premium
- Feature matrix per tier
- Trial period support

### 7.3: Parent Account Requirements (8-12 hours)
- Parent registration requires linked paid child
- Parent inherits access from child's tier
- Multiple children → highest tier applies

### 7.4: Feature Gating (12-16 hours)
- Middleware to check tier for features
- Upgrade prompts for locked features
- Graceful degradation for expired subscriptions

### 7.5: Billing Management (16-20 hours)
- Billing history page
- Invoice downloads
- Subscription management (upgrade/downgrade/cancel)
- Payment failure handling

---

## Phase 8: Future Expansion

**Status:** 🔲 Not Planned (Post-Launch)

### 8.1: Teams & Organizations
- Organization accounts
- Team management
- Organization billing

### 8.2: Multi-Sport Architecture
- Sport selection on registration
- Sport-specific pillar configurations

### 8.3: Social & Community
- Achievement sharing
- Community feed
- Student recognition

---

## Recommended Priority Order

### Immediate (Next 2-4 weeks)
1. **Phase 2.3** - Public Experience & Registration Flow
   - Entry point for ALL users - critical for conversion
   - Landing page, public showcase pages
   - Pre-registration questionnaire
   - Must be compelling and professional

### Short-term (1-2 months)
2. **Phase 2.4** - Parent System & Compliance
   - Critical for PIPEDA compliance
   - Enables parent onboarding flow
   - Completes the role system

3. **Phase 2.5** - Pillar Content & Level System
   - Core learning functionality
   - Level progression mechanics
   - Enables student learning journey

### Medium-term (2-3 months)
4. **Phase 2.6** - Role-Based Access Hardening
5. **Phase 3** - Rich Content & Media (partial)
6. **Phase 4** - Analytics & Dashboards

### Pre-Launch (3-5 months)
7. **Phase 5** - Communication & Scheduling
8. **Phase 6** - Mobile & Performance
9. **Phase 7** - Payments & Subscriptions

---

## Phase Dependencies

```
Phase 1 (DONE)
    │
    └── Phase 2.0 (DONE) ─── Multi-Role Foundation
            │
            ├── Phase 2.1 (DONE) ─── 6-Pillar Framework
            │
            ├── Phase 2.2 (DONE) ─── Intelligence-Based Onboarding
            │
            ├── Phase 2.3 ─── Public Experience & Registration ←── NEXT
            │       │
            │       └── Drives user acquisition & conversion
            │
            ├── Phase 2.4 ─── Parent System & Compliance
            │       │
            │       └── Phase 4.3 (Parent Dashboard)
            │
            └── Phase 2.5 ─── Pillar Content & Level System
                    │
                    ├── Phase 2.6 (Role Access)
                    │
                    ├── Phase 3 (Rich Content)
                    │       └── Phase 3.5 (Video Upload)
                    │
                    └── Phase 4 (Analytics)
                            │
                            └── Phase 5 (Communication)
                                    │
                                    └── Phase 6 (Mobile/Performance)
                                            │
                                            └── Phase 7 (Payments)
```

---

## Confirmed Decisions

| Decision | Answer |
|----------|--------|
| **Coach Permissions** | Can edit lessons AND leave comments/reviews for individual students |
| **Parent Visibility** | Full access: scores, tests, video uploads, coach comments |
| **Evaluation Review** | Automated - score-based level unlocking |
| **Scoring System** | 1.0-4.0 continuous scale with 7 categories per role |
| **Pacing Levels** | Introduction (<2.2), Development (2.2-3.1), Refinement (>3.1) |
| **Payment Timeline** | After Phase 6 (core features), before Phase 8 (social/multi-sport) |
| **Age Compliance** | Canadian PIPEDA - see `/docs/COMPLIANCE-CANADA.md` |
| **Landing Page** | Marketing-grade with animations, testimonials, professional design |
| **Pre-Registration Flow** | Short questionnaire BEFORE account creation, data transfers to profile |
| **Public Pages** | Separate pages for Goalies/Students vs Parents with role-specific content |

---

## Key Metrics

### Completed (as of March 7, 2026)
- **Total Hours:** ~254 hours (Phase 1 + Phase 2.0-2.2)
- **Sessions:** 38 documented sessions
- **Working Days:** 14 days in Phase 2

### Remaining Estimate
- **Phase 2 Completion:** 76-100 hours
- **Full Platform:** 346-465 hours
- **Timeline:** 4-6 months to launch-ready

---

*Last Updated: March 7, 2026*
