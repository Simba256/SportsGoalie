# Key Architectural Decisions

**Last Updated:** March 7, 2026

## Recent Decisions (March 2026)

### March 7, 2026: Component Key Prop for State Reset
**Decision:** Use React `key` prop to force component remount instead of `useEffect` for state reset
**Rationale:** `key` prop is more idiomatic React pattern - React handles full state reset automatically on remount
**Impact:** Cleaner code, no manual state reset logic needed, prevents bugs from incomplete state cleanup
**Alternatives Considered:** `useEffect` watching question.id (rejected - more code, potential for missed state)

### March 7, 2026: Pre-Registration Questionnaire Flow
**Decision:** Short questionnaire BEFORE account creation, data transferred to profile on registration
**Rationale:** Captures visitor intent and information before commitment, improves personalization
**Impact:** Better conversion funnel, personalized onboarding, role-specific paths from the start
**Alternatives Considered:** During registration (more form fatigue), after registration (loses pre-qualification benefit)

### March 6, 2026: 1.0-4.0 Continuous Scoring Scale
**Decision:** Replace discrete levels (beginner/intermediate/advanced) with continuous 1.0-4.0 scoring scale
**Rationale:** Per Michael's specification - provides finer-grained intelligence profile, enables weighted category scoring
**Impact:** More nuanced assessment results, better personalization, supports gap/strength analysis
**Alternatives Considered:** Keeping discrete levels (too coarse), 0-100 scale (Michael's spec uses 1.0-4.0)

### March 6, 2026: 7 Assessment Categories per Role
**Decision:** Use 7 distinct categories for each role (goalie/parent/coach) instead of mapping to 6 pillars
**Rationale:** Per Michael's scoring guide - each role has unique categories (e.g., parent has "Car Ride Home", coach has "Approach")
**Impact:** More accurate role-specific assessment, enables meaningful cross-reference comparisons
**Alternatives Considered:** Map to 6 pillars (loses role-specific nuance), single category set (roles assess different aspects)

### March 6, 2026: Pacing Level Thresholds
**Decision:** Use configurable thresholds: Introduction (<2.2), Development (2.2-3.1), Refinement (>3.1)
**Rationale:** Per Michael's spec - maps continuous scores to actionable content pacing levels
**Impact:** Clear content progression path, admin-adjustable thresholds, consistent with pillar structure
**Alternatives Considered:** Fixed percentile-based thresholds (less intuitive), more granular levels (adds complexity)

### March 5, 2026: 6-Pillar Architecture - Repurpose Sports Collection
**Decision:** Repurpose `sports` collection as pillars with fixed document IDs (pillar_mindset, etc.)
**Rationale:** Minimizes refactoring by reusing existing sportId references throughout codebase
**Impact:** All existing services work with pillars, no collection renames needed, easy migration
**Alternatives Considered:** New `pillars` collection (too much refactoring), auto-generated IDs (can't reference in code)

### March 5, 2026: Remove Pillar Create/Delete in Admin
**Decision:** Admin can edit pillars but cannot create or delete them
**Rationale:** 6 pillars are fundamental to the Ice Hockey Goalie training system and should be fixed
**Impact:** Simpler admin UI, prevents accidental data loss, ensures consistent pillar structure
**Alternatives Considered:** Keep full CRUD (pillars shouldn't change), hide admin page (still need to edit descriptions)

### March 4, 2026: Onboarding Evaluation Architecture
**Decision:** Store evaluations in `onboarding_evaluations` collection with document ID `eval_{userId}`
**Rationale:** One-to-one relationship with user, easy lookup, prevents duplicate evaluations
**Impact:** Simple queries, clear ownership, single evaluation per student
**Alternatives Considered:** Subcollection under user (harder to query across users for coach review)

### March 4, 2026: Auto-Advance After Question Selection
**Decision:** Automatically advance to next question after brief feedback (500ms delay)
**Rationale:** Maintains flow, reduces cognitive load, more immersive experience
**Impact:** Faster completion, smoother UX, no "Next" button friction
**Alternatives Considered:** Manual "Next" button (adds friction), instant advance (too fast for feedback)

### March 4, 2026: Full-Page Quiz Creator with Tabs
**Decision:** Convert video quiz creator from dialog to full-page with tab-based navigation
**Rationale:** Dialog approach was cramped, caused horizontal scrolling, poor UX for complex multi-step form
**Impact:** Better space utilization, eliminates scroll issues, tabs allow non-linear navigation
**Alternatives Considered:** Keep dialog with fixes (fundamental space limitation), step wizard (still cramped)

### March 4, 2026: Visual Toggle Buttons for True/False
**Decision:** Replace dropdown with large visual toggle buttons showing True (green) and False (red)
**Rationale:** Dropdown was blank initially and confusing; toggle buttons show both options with clear visual cues
**Impact:** Much more intuitive selection, immediate visual feedback, clearer UX
**Alternatives Considered:** Radio buttons (acceptable but less visual), keep dropdown (poor UX)

### March 4, 2026: Split Input for Fill in the Blank
**Decision:** Use two input fields (text before blank, text after blank) instead of single textarea with manual `___`
**Rationale:** Users shouldn't need to know/remember to add `___`; split approach eliminates confusion
**Impact:** Intuitive question creation, live preview shows student view, no manual blank marker needed
**Alternatives Considered:** Auto-detect `___` (not intuitive), placeholder syntax (too technical)

### March 4, 2026: Client-Side Sorting for Coach Content
**Decision:** Remove `orderBy` from Firestore queries and sort results client-side
**Rationale:** Firestore requires composite indexes for where + orderBy combinations; client-side avoids this
**Impact:** No index maintenance required, works immediately, acceptable for coach content data sizes
**Alternatives Considered:** Create composite index (more ops overhead), no sorting (poor UX)

### March 2, 2026: Non-Blocking View Count Increment
**Decision:** Wrap view count increment in try-catch so read operations succeed even if analytics update fails
**Rationale:** Students don't have write permission to custom_content_library, but should still be able to read content
**Impact:** Core read functionality works for all users; view tracking may be incomplete for student views
**Alternatives Considered:** Add student write permission for metadata only (security risk)

### March 2, 2026: Public Read for Custom Content Library
**Decision:** Make custom_content_library publicly readable (allow read: if true)
**Rationale:** Same approach as pillars, skills, and quizzes - educational content should be accessible to all
**Impact:** Any authenticated user can read custom content assigned to them
**Alternatives Considered:** Complex per-student permissions based on curriculum assignment (over-engineering)

### March 1, 2026: Store Coach Video Quizzes in Existing Collection
**Decision:** Store coach-created video quizzes in the existing `video_quizzes` collection with `source: 'coach'` marker
**Rationale:** Reuses all existing quiz player infrastructure, progress tracking, and UI components
**Impact:** Single quiz player works for both admin and coach quizzes, consistent user experience
**Alternatives Considered:** Separate `coach_video_quizzes` collection (would require duplicating player logic)

### March 1, 2026: useState over react-hook-form
**Decision:** Use basic useState for form management instead of react-hook-form
**Rationale:** Project doesn't have react-hook-form installed; useState provides equivalent functionality for current needs
**Impact:** Simpler dependency management, no new packages required
**Alternatives Considered:** Installing react-hook-form (unnecessary dependency for current scope)

## Recent Decisions (February 2026)

### February 28, 2026: Difficulty Level Renaming
**Decision:** Rename difficulty levels from Beginner/Intermediate/Advanced to Introduction/Development/Refinement
**Rationale:** Better aligns with Michael's teaching methodology and progression philosophy
**Impact:** Required data migration (48 documents), updated 30+ files
**Alternatives Considered:** Keep original names (doesn't match methodology)

### February 27, 2026: Skip Email Verification for Invited Coaches
**Decision:** Invited coaches skip email verification; clicking the invitation link serves as verification
**Rationale:** Invitation emails are sent to the coach's email - clicking the link proves email ownership
**Impact:** Smoother coach onboarding, no redundant verification step, coaches can log in immediately
**Alternatives Considered:** Require email verification anyway (redundant and poor UX)

### February 27, 2026: Dual Email Verification Check
**Decision:** Login checks both Firebase Auth `emailVerified` AND Firestore document `emailVerified`
**Rationale:** Firebase Auth won't have emailVerified set for invited coaches, but we track it in Firestore
**Impact:** Supports both regular email verification and invitation-based verification
**Alternatives Considered:** Force Firebase Auth verification for all users (requires additional email)

### February 24, 2026: Smart Context Loading for AI Chatbot
**Decision:** Default to smart context loading (5-10 relevant docs) instead of full context
**Rationale:** Reduces token usage 80-90%, faster responses, better cost efficiency
**Impact:** Cost-efficient AI assistant, acceptable response quality, can load full context if needed
**Alternatives Considered:** Always full context (expensive), no filtering (too simple)

### February 24, 2026: Claude Sonnet 4 Model Selection
**Decision:** Use Claude Sonnet 4 instead of Opus 4.5 for project assistant chatbot
**Rationale:** 5x cheaper, sufficient quality for Q&A, admin-only tool
**Impact:** 80% cost savings with acceptable response quality for documentation queries
**Alternatives Considered:** Opus 4.5 (overkill for Q&A), Haiku (insufficient intelligence)

### February 23, 2026: Content Browser Component Architecture
**Decision:** Extract content browser into separate reusable component
**Rationale:** Can be reused in other parts of app, easier to maintain, clean separation of concerns
**Impact:** Reusable component, better code organization, improved maintainability
**Alternatives Considered:** Inline in curriculum builder (too complex and not reusable)

### February 23, 2026: Student Workflow Type Architecture
**Decision:** Implement two distinct workflow types: automated (self-paced) and custom (coach-guided)
**Rationale:** Supports both independent learners and students who need personalized coaching
**Impact:** Enables custom curriculum system, differentiated learning paths, premium tier foundation
**Alternatives Considered:** Per-pillar workflow (too complex), single workflow for all (too limiting)

### February 23, 2026: Curriculum Storage Model
**Decision:** Store curriculum items inline in curriculum document, not separate collection
**Rationale:** Simpler queries, atomic updates, good performance for expected data size
**Impact:** Fast reads, easy management, scales well for expected curriculum sizes
**Alternatives Considered:** Separate items collection (adds complexity without benefits for MVP)

### February 22, 2026: Coach Invitation Token Format
**Decision:** Use 32-character crypto-random tokens with 7-day default expiry
**Rationale:** Provides strong security (62^32 combinations), URL-safe, reasonable acceptance window
**Impact:** Secure invitation system without complexity of JWT, prevents indefinite valid tokens
**Alternatives Considered:** JWT (too complex), UUID (less readable), shorter tokens (less secure)

### February 22, 2026: Student ID Format & Security
**Decision:** Use SG-XXXX-XXXX format with crypto-random generation, exclude confusing characters
**Rationale:** Short enough to share verbally, long enough for uniqueness (32^8 = 1.1T combinations)
**Impact:** Parents can easily link to children, no approval workflow needed
**Alternatives Considered:** Sequential IDs (security risk), UUIDs (too long)

### February 22, 2026: Registration Security Restrictions
**Decision:** Remove Coach and Admin from public registration, only allow Student and Parent
**Rationale:** Prevent unauthorized admin/coach account creation, coaches added via invitation only
**Impact:** Significantly improved security, cleaner registration UI
**Alternatives Considered:** CAPTCHA (insufficient), manual approval (too slow)

## Phase 1 Decisions

### Database Architecture: Service Layer Pattern
**Decision:** Create abstract BaseDatabaseService class extended by all services
**Rationale:** DRY principle, consistent error handling, built-in caching, retry logic
**Impact:** 16 services with consistent patterns, easier to maintain

### Type System: Strict TypeScript with Zod Validation
**Decision:** Enable TypeScript strict mode, use Zod for runtime validation
**Rationale:** Catch errors at compile time, runtime safety at boundaries
**Impact:** 100% type coverage, fewer runtime errors

### UI Components: shadcn/ui with Radix Primitives
**Decision:** Use shadcn/ui component library built on Radix UI primitives
**Rationale:** Accessible by default, fully customizable, copy-paste flexibility
**Impact:** 30+ reusable components, consistent design

### State Management: React Context + Custom Hooks
**Decision:** Use React Context API with custom hooks, avoid external state libraries
**Rationale:** Simple, built-in, sufficient for app needs
**Impact:** Clean state management, no Redux complexity

### Styling: Tailwind CSS Utility-First Approach
**Decision:** Use Tailwind CSS for all styling
**Rationale:** Fast development, consistent design, small bundle
**Impact:** Rapid UI development, mobile-first by default

### Backend: Firebase Suite (Firestore + Auth + Storage)
**Decision:** Use Firebase for all backend needs
**Rationale:** Integrated suite, real-time capabilities, serverless, auto-scaling
**Impact:** No server management, simple security rules

## Design Principles

1. **Simplicity First:** Start with MVP, add complexity incrementally
2. **Type Safety:** Strict TypeScript everywhere, runtime validation at boundaries
3. **Modularity:** Service layer, component architecture, clear separation of concerns
4. **Accessibility:** WCAG 2.1 AA compliance, keyboard navigation, screen reader support
5. **Performance:** Code splitting, lazy loading, caching, optimized queries
6. **Security:** Role-based access, Firestore rules, input validation, secure tokens
7. **Maintainability:** Consistent patterns, comprehensive docs, clean code
8. **Scalability:** Designed for growth, modular architecture, efficient data models

## Confirmed Decisions

| Topic | Decision |
|-------|----------|
| **Scoring System** | 1.0-4.0 continuous scale with 7 categories per role |
| **Pacing Levels** | Introduction (<2.2), Development (2.2-3.1), Refinement (>3.1) |
| **Pillar Structure** | 6 fixed pillars, repurposed from sports collection |
| **Coach Permissions** | Can edit lessons AND leave comments/reviews per student |
| **Parent Visibility** | Full access: scores, tests, videos, coach comments |
| **Evaluation Review** | Automated - score determines level unlock |
| **Landing Page** | Marketing-grade with animations, testimonials, professional design |
| **Pre-Registration Flow** | Short questionnaire BEFORE account creation |

## Future Decision Points

### To Be Decided
1. **Parent-Child Linking:** Exact workflow for under-13 consent
2. **Level Unlock System:** Detailed progression mechanics
3. **Email Service:** Resend domain setup timing
4. **Payment System:** Stripe tier configuration
5. **Mobile App:** React Native vs PWA enhancement

### Under Review
1. **Video Storage:** Firebase Storage vs external CDN
2. **Real-time Features:** WebSocket for live coach notifications
3. **Search Enhancement:** Full-text search implementation
4. **Content Versioning:** Handling lesson/quiz updates
