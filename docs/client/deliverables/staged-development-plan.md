# Smarter Goalie — Staged Development Plan

**Date:** March 18, 2026
**Project:** Smarter Goalie Training Platform
**Status:** Stage 3 in progress

---

## Overview

This document organizes all development work into client-visible stages — what users see and experience at each milestone, plus the backend and infrastructure work powering it.

---

## STAGE 1: Foundation ✅ COMPLETE
*"The platform exists and people can sign up"*

### What the Client Sees
- User registration for Goalies and Parents
- Email verification on signup
- Login/logout with session management
- User profile with name, bio, location, experience level
- Role-based access (different experience per role)
- Student ID generation (SG-XXXX-XXXX) visible on profile

### Backend & Infrastructure
- Firebase Auth integration (email/password)
- Firestore database setup with security rules
- 4-role system (Student, Coach, Parent, Admin)
- User service with CRUD, role validation, profile management
- Protected route middleware (auth guards)
- Guest route guards (redirect if logged in)
- Registration security (Coach/Admin blocked from public registration)
- Session management and token refresh
- Environment configuration (Firebase, Vercel)
- TypeScript strict mode across entire codebase
- Base database service with caching, error handling, logging

### Coach Subsystem
- Admin sends email invitation to coach
- Coach clicks link → accepts invite → account created
- Coach invitation tokens (32-char crypto-random, 7-day expiry)
- Skip email verification for invited coaches (link click = verification)
- Dual email verification check (Firebase Auth + Firestore)
- Admin UI for invitation management (send, resend, revoke, track status)

---

## STAGE 2: Learning System ✅ COMPLETE
*"Goalies can actually learn things and get tested"*

### What the Client Sees
- **7 Pillars of Goaltending** browseable with icons and colors:
  1. Mind-Set Development (Brain, Purple)
  2. Skating as a Skill (Footprints, Blue)
  3. Form & Structure (Shapes, Green)
  4. Positional Systems (Target, Orange)
  5. 7 Point System Below Icing Line (Grid, Red)
  6. Game/Practice/Off-Ice Performance (Dumbbell, Cyan)
  7. Lifestyle (Heart, Pink)
- Each pillar has 3 levels: Introduction → Development → Refinement
- Skills within each pillar with video lessons
- YouTube-integrated video player with controls (play, pause, seek, speed, fullscreen)
- Video progress tracking (resume where you left off)
- **Interactive Video Quizzes** — questions appear during/after video
  - Multiple choice, True/False, Fill-in-blank, Descriptive
  - Instant feedback per answer
  - Score at the end with explanations
  - Must pass to progress
- Progress dashboard showing pillar completion, quiz scores, streaks
- Achievement badges (Common through Legendary)

### Backend & Infrastructure
- Sports/Pillar service with fixed 7-pillar architecture
- Skill service with prerequisites and learning objectives
- VideoQuiz service — quiz CRUD, embedded questions, scoring, progress tracking
- Enrollment service — track what users are enrolled in
- Progress service — completion status, percentages, time spent, bookmarks
- Analytics service — event tracking, engagement metrics
- Achievement system — definitions, criteria, progress, unlock logic
- Video tag system (Pillar, System, User Type, Angle Marker, Arch Level)
- Tag index for Firestore array queries
- Seed data and migration scripts
- Pillar utility functions (IDs, colors, icons, helpers)

### Coach Tools
- Coach dashboard with student statistics
- Student roster management (add/remove students)
- **Custom Curriculum Builder** — coaches create personalized learning paths
  - Add lessons, quizzes, resources from content library
  - Lock/unlock content for individual students
  - Track student progress in real-time
- **Custom Content Creation** — full parity with admin tools
  - Video lesson creator with upload
  - Quiz creator with 3-step wizard
  - Content library management
- "My Content" tab in content browser
- Student workflow types: Automated (self-paced) vs Custom (coach-guided)

### Admin Tools
- User management (all roles)
- Pillar management (edit only, no create/delete — 7 pillars are fixed)
- Skill management per pillar
- Quiz builder with video question builder
- Video tag editor integrated into quiz create/edit
- Filter panel on quiz list page
- Content moderation interface
- Platform analytics dashboard (activity, engagement, quiz performance)

---

## STAGE 3: Assessment & Onboarding ✅ COMPLETE
*"The platform understands each goalie's level and personalizes their path"*

### What the Client Sees
- **Immersive full-screen onboarding** (dark theme, progress indicators)
- **Intake questions** — quick role understanding (4 screens per role)
- **28-question assessment** across 7 categories per role:
  - Goalie: Feelings, Knowledge, Pre-Game, In-Game, Post-Game, Training, Learning
  - Parent: Goalie State, Understanding, Pre-Game, Car Ride Home, Development, Expectations, Preferences
  - Coach: Knowledge, Approach, Pre-Game, In-Game, Post-Game, Goals, Preferences
- **Intelligence Profile** after assessment:
  - 1.0-4.0 score per category
  - Overall pacing level (Introduction / Development / Refinement)
  - Strengths and gaps identified
  - Visual charts and breakdowns
- Auto-save — quit and resume where you left off
- Coach can review student assessments with level adjustment
- **Cross-Reference Comparison** — parent vs goalie perception alignment
  - Category-by-category comparison
  - Alignment badges (Aligned / Minor Gap / Significant Gap)
  - Recommendations for addressing gaps

### Backend & Infrastructure
- Onboarding service with Firebase persistence
- Scoring engine (1.0-4.0 continuous scale, weighted categories)
- Pacing level mapping (configurable thresholds: <2.2, 2.2-3.1, >3.1)
- Gap and strength analysis (deviation from average)
- Cross-reference engine (6 comparison rules across roles)
- Alignment detection and gap flagging
- 104 total questions across 3 roles (84 assessment + 20 intake)
- Category weights configuration
- Evaluation document storage (eval_{userId} pattern)
- Auto-save with resume capability
- Coach evaluation review with level override
- Redirect guards (incomplete onboarding → force completion)

---

## STAGE 4: Charting & Session Tracking ✅ COMPLETE
*"Goalies can log every game and practice with detailed performance tracking"*

### What the Client Sees
- **Create game/practice sessions** with type selection
- **Pre-Game Form** — readiness, mindset, routine adherence, warm-up, equipment
- **Period-by-Period Charting** — rate performance across 8 factors:
  - Intensity, Positional Play, Reading the Breakout, Rebound Control, etc.
- **Post-Game Debrief** — insights and performance summary
- **Overtime/Shootout** tracking
- **Session History** — browse all past sessions
- **Analytics Dashboard** — trends, streaks, category breakdowns
- **Calendar Heatmap** — activity visualization
- **Dynamic Form System** — admin can create custom chart templates
  - Practice Chart, Parent Observation Chart, Coach Evaluation Chart
  - Custom field types (Text, Numeric, Radio, Checkbox, Scale, Yes/No)

### Backend & Infrastructure
- Charting service — session CRUD, period data, analytics aggregation
- Dynamic charting service — custom form rendering and response collection
- Form template service — template builder, field validation, versioning
- Dynamic analytics service — custom analytics per form type
- Session statistics aggregation
- Period performance analytics
- Shootout-specific analytics
- Cohort analytics and student comparison
- Streak tracking

---

## STAGE 5: Landing Page & Parent Experience ✅ COMPLETE
*"New visitors see a professional landing page and parents can monitor their goalies"*

### What the Client Sees
- **Landing Page:**
  - Full-screen hero with "Training The Next Generation of Goalies"
  - Club intro section with auto-rotating slideshow
  - Role selection cards (Goalie / Parent) with conditional feature showcases
  - "What We Do" section — 5 feature cards (AI Training, Video Learning, Analytics, Quizzes, Charting)
  - Stats section (Athletes, Courses, Trust indicators)
  - Testimonials marquee
  - Professional header with glassmorphic scroll effect
  - Dark gradient footer with social links
- **Parent Dashboard:**
  - Link to child via XXXX-XXXX code
  - See all linked goalies with progress cards
  - Per-child detail view (progress %, quizzes, streak, assessment status)
  - Cross-reference perception comparison
  - Aggregate stats across all children
- **Goalie Settings:**
  - Generate/regenerate parent link codes
  - View linked parents
  - Revoke parent access

### Backend & Infrastructure
- Parent link service — code generation (collision-checked), validation, CRUD
- Link code system (XXXX-XXXX format, excludes 0/1/O/I, 7-day expiry)
- parentLinks and parentLinkCodes Firestore collections
- Relationship types (parent/guardian/other)
- Cross-reference data aggregation for parent views
- Image optimization pipeline (lossless resize to 1400px, PNG optimize)
- New header/footer components
- ScrollStack and ClubIntroSection components

### Branding
- Full rebrand from "SportsGoalie" to "Smarter Goalie" across 42 files
- Package name, metadata, AI prompts, documentation, infrastructure, tests
- New logo integration

---

## STAGE 6: Dashboard Integration 🔲 NEXT
*"All the data comes together in meaningful, actionable dashboards"*

### What the Client Will See
- **Goalie Dashboard** — unified view showing:
  - Intelligence profile summary from assessment
  - Pillar progress with visual indicators
  - Recent charting sessions with performance trends
  - Gap analysis with recommended content
  - Achievement highlights
  - Streak and engagement metrics
- **Coach Dashboard** — enhanced with:
  - Student development tracking across games/practices
  - Cross-reference results for students with linked parents
  - Scoring engine output per student
  - Quick actions (assign content, leave feedback)
- **Parent Dashboard** — enhanced with:
  - Visual trend data over time
  - Period-by-period pattern insights
  - Assessment score progression
- **Admin Dashboard** — enhanced with:
  - Platform-wide scoring analytics
  - User engagement trends
  - Content effectiveness metrics

### Backend & Middleware Work
- Connect scoring engine output to dashboard components
- Build gap analysis → content recommendation pipeline
- Aggregate charting data into trend visualizations
- Wire cross-reference results into parent/coach views
- Create dashboard data aggregation service
- Implement caching for dashboard queries (performance)
- API endpoints for dashboard data feeds

### Estimated Hours: 4-6h

---

## STAGE 7: Production Email 🔲 BLOCKED
*"Professional emails from smartergoalie.com domain"*

### What the Client Will See
- Verification emails from @smartergoalie.com (branded template)
- Coach invitation emails (professional, not console logs)
- Notification emails (quiz results, coach feedback, milestones)
- Password reset emails (branded)

### Backend & Middleware Work
- Configure Resend with verified custom domain
- Enable branded email templates (already built, inactive)
- Switch from Firebase default verification to Resend custom emails
- Update email service to use production Resend client
- Test all email flows end-to-end

### Blocker: Domain needs to be purchased and DNS configured
### Estimated Hours: 2-3h (after domain is ready)

---

## STAGE 8: Content Alignment & LMS 🔲 PLANNED
*"Every question, score, and recommendation matches the specification exactly"*

### What the Client Will See
- All 84 assessment questions verified against specification documents
- All 20 intake questions verified
- Scoring weights confirmed matching specs
- When assessment identifies weak areas → system recommends specific videos/lessons
- Content recommendations appear on dashboard ("Suggested for you")
- Smarter content ordering based on performance

### Backend & Middleware Work
- Audit all question text, options, and scoring against spec docs
- Fix any mismatches in question data files
- Build content recommendation engine:
  - Map scoring categories to pillar content
  - Rank content by relevance to identified gaps
  - Filter by user's pacing level
- Create recommendation service with caching
- Add recommendation UI components to dashboard
- Wire gap analysis output to content suggestion pipeline

### Estimated Hours: 8-13h

---

## STAGE 9: Analytics & Trend Views 🔲 PLANNED
*"Parents and coaches can see progress over time, not just snapshots"*

### What the Client Will See
- **Parent View:**
  - Goalie progress chart over weeks/months
  - Assessment score trends (improving/declining per category)
  - Charting session performance trends
  - Engagement metrics (sessions per week, time spent)
- **Coach View:**
  - Multi-student comparison charts
  - Development tracking across games/practices
  - Period-by-period pattern recognition
  - Group analytics (cohort performance)
- **Admin View:**
  - Platform-wide pass rates and completion trends
  - Content effectiveness analytics
  - User growth and retention charts

### Backend & Middleware Work
- Build time-series data aggregation for progress metrics
- Create trend calculation service (moving averages, deltas)
- Build period-by-period pattern detection
- Add date range filtering to analytics queries
- Create chart data formatters for frontend visualization
- Optimize analytics queries with composite indexes
- Add data export capabilities (CSV/PDF)

### Estimated Hours: 5-8h

---

## STAGE 10: Mobile Polish 🔲 PLANNED
*"Everything works smoothly on phones and tablets"*

### What the Client Will See
- All screens optimized for iOS and Android browsers
- Larger touch targets on buttons and interactive elements
- Smooth transitions and animations
- Fast load times on cellular connections
- Charting forms comfortable to fill on mobile
- Assessment/quiz flows smooth on small screens
- Video player responsive and touch-friendly

### Backend & Middleware Work
- Audit all pages for responsive breakpoints
- Optimize image loading (lazy load, responsive srcsets)
- Review and fix touch target sizes (minimum 44x44px)
- Test and fix form inputs on mobile keyboards
- Reduce JavaScript bundle size where possible
- Add service worker for offline resilience
- Test on real iOS and Android devices

### Estimated Hours: 3-5h

---

## STAGE 11: Contextual Support System 🔲 FUTURE
*"When a goalie doesn't understand something, help appears instantly"*

### What the Client Will See
- Highlighted terms throughout the platform (M.E.T., V.M.P., Line System, etc.)
- Click a term → support popup appears with 3 layers:
  - **Layer 1:** Quick text explanation (or voice)
  - **Layer 2:** Link to short video or deeper article
  - **Layer 3:** Additional perspectives or related content
- Student goes as deep as they need
- "Was this helpful?" feedback prompt
- Admin can manage all terms, explanations, and linked content

### Backend & Middleware Work
- Create terminology database/collection
- Build term definition service (CRUD, search, categories)
- Create term detection system (scan content for known terms)
- Build popup/overlay component with layered content
- Implement "helpful" feedback tracking
- Create admin UI for managing terms and linked content
- Analytics: which terms triggered, how deep users went, helpfulness ratings
- API endpoints for term lookup and feedback submission

### Note: Interconnected with Stages 12 and 13 — design as integrated system

---

## STAGE 12: Milestone Recognition System 🔲 FUTURE
*"The platform celebrates achievements in a meaningful, personal way"*

### What the Client Will See
- Celebrations when goalies hit benchmarks:
  - Module completions
  - Charting milestones (X sessions logged)
  - Level unlocks
  - Consistent performance patterns
- Celebration content:
  - Congratulatory messages
  - Inspirational quotes (from database)
  - Motivational video clips
  - Personal highlights from their own charting history
- **Students can add their own content:**
  - Personal highlights
  - Favourite saves
  - Milestone moments
- System draws from student-added content in future celebrations
- Every milestone logged in student's portfolio

### Backend & Middleware Work
- Create milestone definitions service (criteria, triggers, rewards)
- Build milestone detection engine (listen for qualifying events)
- Create celebration content service (quotes, videos, templates)
- Build user-generated content upload and moderation pipeline
- Implement celebration trigger system (event-driven)
- Create milestone history storage
- Build celebration UI components (modal, animation, confetti)
- Feed milestones into learning portfolio
- Admin UI for managing milestone criteria and celebration content

---

## STAGE 13: Learning Portfolio 🔲 FUTURE
*"Every goalie has a permanent, growing record of their journey"*

### What the Client Will See
- **Complete learning history** per user:
  - What they learned and when
  - What they struggled with
  - What support they accessed (from contextual support)
  - What milestones they achieved
  - Their charting patterns over time
  - Self-evaluation progression
  - Coach feedback history
- **Portfolio view** for parents and coaches — see the full journey
- **Business intelligence** (admin) — aggregated portfolio data reveals:
  - Which content works best
  - Where students commonly struggle
  - What needs improvement

### Backend & Middleware Work
- Create portfolio data aggregation service
- Build timeline/history reconstruction from multiple data sources:
  - Progress events
  - Quiz attempts
  - Charting sessions
  - Support interactions
  - Milestone achievements
  - Coach feedback
- Create portfolio API with filtering and date ranges
- Build portfolio visualization components (timeline, journey map)
- Implement data export (PDF portfolio report)
- Create aggregated BI analytics service
- Admin BI dashboard with platform-wide insights
- Privacy controls (what parents/coaches can see vs private)

---

## STAGE SUMMARY

| Stage | Name | Status | Est Hours |
|-------|------|--------|-----------|
| 1 | Foundation | ✅ Complete | — |
| 2 | Learning System | ✅ Complete | — |
| 3 | Assessment & Onboarding | ✅ Complete | — |
| 4 | Charting & Session Tracking | ✅ Complete | — |
| 5 | Landing Page & Parent Experience | ✅ Complete | — |
| 6 | Dashboard Integration | 🔲 Next | 4-6h |
| 7 | Production Email | 🔲 Blocked (domain) | 2-3h |
| 8 | Content Alignment & LMS | 🔲 Planned | 8-13h |
| 9 | Analytics & Trend Views | 🔲 Planned | 5-8h |
| 10 | Mobile Polish | 🔲 Planned | 3-5h |
| 11 | Contextual Support | 🔲 Future | TBD |
| 12 | Milestone Recognition | 🔲 Future | TBD |
| 13 | Learning Portfolio | 🔲 Future | TBD |

**Stages 1-5:** ✅ Complete (Block 1 + Foundation)
**Stages 6-10:** Block 2 work (~22-35h remaining)
**Stages 11-13:** Block 3 experience features (interconnected system, TBD)

---

*Last Updated: March 18, 2026*
