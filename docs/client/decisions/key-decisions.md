# Key Architectural Decisions

## Recent Decisions (Phase 2)

### February 23, 2026: Content Browser Component Architecture
**Decision:** Extract content browser into separate reusable component
**Rationale:** Can be reused in other parts of app, easier to maintain, clean separation of concerns
**Impact:** Reusable component, better code organization, improved maintainability
**Alternatives Considered:** Inline in curriculum builder (rejected - too complex and not reusable)

### February 23, 2026: Dynamic Content Title Loading
**Decision:** Load content titles separately after loading curriculum items
**Rationale:** Curriculum stores only contentId reference, need to fetch actual names from source
**Impact:** Always displays current content names, no stale data, single source of truth
**Alternatives Considered:** Store titles in curriculum (rejected - data duplication, sync issues)

### February 23, 2026: Client-Side Content Filtering
**Decision:** Load all sport content, perform search/filter client-side
**Rationale:** Small datasets, instant UX, no server round-trips for every filter change
**Impact:** Immediate search results, better UX, reduced database queries
**Alternatives Considered:** Server-side filtering (unnecessary overhead for current data scale)

### February 23, 2026: Student Workflow Type Architecture
**Decision:** Implement two distinct workflow types: automated (self-paced) and custom (coach-guided)
**Rationale:** Supports both independent learners and students who need personalized coaching
**Impact:** Enables custom curriculum system, differentiated learning paths, premium tier foundation
**Alternatives Considered:** Per-pillar workflow (too complex), single workflow for all (too limiting)

### February 23, 2026: All-or-Nothing Workflow Assignment
**Decision:** Students are either fully automated or fully custom (not per-pillar)
**Rationale:** Simpler mental model, easier to implement and maintain, clearer user experience
**Impact:** Clear user choice, straightforward implementation, can enhance later if needed
**Alternatives Considered:** Mixed workflow per pillar (deferred as too complex for MVP)

### February 23, 2026: Curriculum Storage Model
**Decision:** Store curriculum items inline in curriculum document, not separate collection
**Rationale:** Simpler queries, atomic updates, good performance for expected data size
**Impact:** Fast reads, easy management, scales well for expected curriculum sizes
**Alternatives Considered:** Separate items collection (rejected - adds complexity without benefits for MVP)

### February 23, 2026: Content Library Separation
**Decision:** Create separate custom_content_library collection for reusable coach content
**Rationale:** Enables content sharing, reduces duplication, tracks usage across students
**Impact:** Efficient content reuse, sharing capabilities, usage analytics possible
**Alternatives Considered:** Inline only (no sharing), per-student (duplication), global pool (no ownership)

### February 22, 2026: Coach Invitation Token Format
**Decision:** Use 32-character crypto-random tokens with 7-day default expiry
**Rationale:** Provides strong security (62^32 combinations), URL-safe, reasonable acceptance window
**Impact:** Secure invitation system without complexity of JWT, prevents indefinite valid tokens
**Alternatives Considered:** JWT (too complex), UUID (less readable), shorter tokens (less secure)

### February 22, 2026: Email Service Development Mode
**Decision:** Log emails to console in development, prepare infrastructure for production services
**Rationale:** No email service configured yet, but code ready for SendGrid/AWS SES integration
**Impact:** Can test invitation flow immediately, easy switch to production email later
**Alternatives Considered:** Mock email service (rejected - console simpler), immediate integration (premature)

### February 22, 2026: Student ID Format & Security
**Decision:** Use SG-XXXX-XXXX format with crypto-random generation, exclude confusing characters
**Rationale:** Short enough to share verbally, long enough for uniqueness (32^8 = 1.1T combinations), clear for reading
**Impact:** Parents can easily link to children, no approval workflow needed (possession = legitimacy)
**Alternatives Considered:** Sequential IDs (security risk), UUIDs (too long), email-based linking (privacy concerns)

### February 22, 2026: Registration Security Restrictions
**Decision:** Remove Coach and Admin from public registration, only allow Student and Parent
**Rationale:** Prevent unauthorized admin/coach account creation, coaches added via invitation only
**Impact:** Significantly improved security, cleaner registration UI, sets up invitation system
**Alternatives Considered:** CAPTCHA (insufficient), manual approval (too slow), allow all roles (insecure)

### February 22, 2026: Role Selection UI Pattern
**Decision:** Use Select dropdown instead of radio buttons for role selection
**Rationale:** Cleaner UI, scales better for future role additions, consistent with modern UI patterns
**Impact:** Better UX for registration, more maintainable as roles expand
**Alternatives Considered:** Radio buttons (too much vertical space), segmented control (limited flexibility)

### February 22, 2026: Session File Organization
**Decision:** Store detailed session logs in `docs/sessions/YYYY-MM/` instead of single file
**Rationale:** Prevents PROGRESS.md from becoming unwieldy; easier to archive and search
**Impact:** PROGRESS.md now serves as high-level dashboard only
**Alternatives Considered:** Single file (rejected - would grow too large)

## Phase 1 Decisions

### Database Architecture: Service Layer Pattern
**Decision:** Create abstract BaseDatabaseService class extended by all services
**Rationale:** DRY principle, consistent error handling, built-in caching, retry logic
**Impact:** 16 services with consistent patterns, easier to maintain, reduced code duplication
**Alternatives Considered:** Direct Firestore calls (rejected - too much duplication), Repository pattern (too complex)

### Type System: Strict TypeScript with Zod Validation
**Decision:** Enable TypeScript strict mode, use Zod for runtime validation
**Rationale:** Catch errors at compile time, runtime safety at boundaries, self-documenting code
**Impact:** 100% type coverage, fewer runtime errors, better developer experience
**Alternatives Considered:** Permissive TypeScript (rejected - unsafe), Joi validation (rejected - less TypeScript-friendly)

### UI Components: shadcn/ui with Radix Primitives
**Decision:** Use shadcn/ui component library built on Radix UI primitives
**Rationale:** Accessible by default, fully customizable, copy-paste flexibility, no lock-in
**Impact:** 30+ reusable components, consistent design, accessibility compliance
**Alternatives Considered:** Material UI (too opinionated), Chakra UI (larger bundle), build from scratch (too time-consuming)

### State Management: React Context + Custom Hooks
**Decision:** Use React Context API with custom hooks, avoid external state libraries
**Rationale:** Simple, built-in, sufficient for app needs, reduces dependencies
**Impact:** Clean state management, no Redux complexity, easier to understand
**Alternatives Considered:** Redux (overkill), Zustand (unnecessary), MobX (different paradigm)

### Styling: Tailwind CSS Utility-First Approach
**Decision:** Use Tailwind CSS for all styling
**Rationale:** Fast development, consistent design, small bundle with purging, responsive utilities
**Impact:** Rapid UI development, consistent spacing/colors, mobile-first by default
**Alternatives Considered:** CSS Modules (more verbose), Styled Components (larger runtime), SASS (less utility-focused)

### Deployment: Vercel with Automatic CI/CD
**Decision:** Deploy on Vercel with automatic deployments from GitHub
**Rationale:** Built for Next.js, automatic previews, edge network, simple setup
**Impact:** Fast deployments, preview URLs for PRs, global CDN, zero config
**Alternatives Considered:** Netlify (similar), AWS Amplify (more complex), Custom server (more maintenance)

### Backend: Firebase Suite (Firestore + Auth + Storage)
**Decision:** Use Firebase for all backend needs
**Rationale:** Integrated suite, real-time capabilities, serverless, auto-scaling, good free tier
**Impact:** No server management, real-time updates, simple security rules, quick development
**Alternatives Considered:** Supabase (newer, less mature), AWS services (complex), custom backend (too much work)

### Testing Strategy: Playwright for E2E, Vitest for Unit
**Decision:** Use Playwright for browser tests, Vitest for unit tests
**Rationale:** Modern tools, TypeScript support, fast execution, good developer experience
**Impact:** Comprehensive testing capability, cross-browser support, visual testing
**Alternatives Considered:** Cypress (Playwright more modern), Jest (Vitest faster for Vite), Selenium (outdated)

### Ice Hockey Focus: Specialized Domain Implementation
**Decision:** Build specialized features for ice hockey goalie training
**Rationale:** Target niche market, specific needs, competitive differentiation
**Impact:** Unique charting system, domain-specific metrics, 6-pillar framework (planned)
**Alternatives Considered:** Generic sports platform (less differentiated), multi-sport (too broad)

### Charting System: Dynamic Form Templates
**Decision:** Build flexible form template system instead of hardcoded forms
**Rationale:** Allows customization without code changes, extensible, user-configurable
**Impact:** Coaches can customize data collection, adaptable to different needs
**Alternatives Considered:** Fixed forms (inflexible), separate form builder (complex), third-party forms (less integrated)

## Design Principles

1. **Simplicity First:** Start with MVP, add complexity incrementally
2. **Type Safety:** Strict TypeScript everywhere, runtime validation at boundaries
3. **Modularity:** Service layer, component architecture, clear separation of concerns
4. **Accessibility:** WCAG 2.1 AA compliance, keyboard navigation, screen reader support
5. **Performance:** Code splitting, lazy loading, caching, optimized queries
6. **Security:** Role-based access, Firestore rules, input validation, secure tokens
7. **Maintainability:** Consistent patterns, comprehensive docs, clean code
8. **Scalability:** Designed for growth, modular architecture, efficient data models

## Decision-Making Framework

When making architectural decisions, we consider:
1. **User Impact:** How does this affect user experience?
2. **Development Speed:** How quickly can we implement and iterate?
3. **Maintainability:** Can we easily modify this later?
4. **Scalability:** Will this work as we grow?
5. **Cost:** What are the financial implications?
6. **Security:** Does this introduce vulnerabilities?
7. **Team Knowledge:** Do we understand this technology well?

## Future Decision Points

### To Be Decided
1. **Phase 2.1 Pillar Structure:** Exact naming and organization of 6 pillars
2. **Level System:** Detailed progression mechanics for each pillar
3. **Parent Features:** Specific features beyond basic progress viewing
4. **Email Service:** SendGrid vs AWS SES vs Postmark
5. **Payment System:** Stripe vs other payment processors (if needed)
6. **Mobile App:** React Native vs separate native apps (future consideration)
7. **AI Features:** Extent of AI-powered recommendations and tutoring

### Under Review
1. **Video Storage:** Firebase Storage vs Cloudinary vs Vimeo
2. **Real-time Features:** WebSocket implementation for live updates
3. **Notification System:** Push notifications vs email vs in-app only
4. **Search Enhancement:** Algolia integration vs Firestore search
5. **Content Versioning:** How to handle content updates and history
