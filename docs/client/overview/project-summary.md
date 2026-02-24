# SportsGoalie Project Summary

## Project Overview

**Project Name:** SportsGoalie
**Type:** Sports Learning & Training Platform
**Primary Focus:** Ice Hockey Goalie Training & Development
**Live Site:** https://sports-goalie.vercel.app/
**Status:** Phase 2 - Multi-Role System & Advanced Features (60% Complete)

## Mission

Create a comprehensive digital sports coaching platform that combines structured learning, progress tracking, interactive assessments, and personalized coaching for ice hockey goalies.

## Core Capabilities

### 1. Multi-Role System
- **Students:** Choose between self-paced learning or coach-guided custom curriculum
- **Coaches:** Create personalized curricula, manage students, track progress
- **Parents:** Monitor children's progress and performance
- **Admins:** Full system management, content creation, and oversight

### 2. Flexible Learning Pathways
- **Automated Workflow:** Self-paced learning through sports/skills catalog with algorithm-driven progression
- **Custom Workflow:** Personalized coach-guided learning paths with manual content unlocking
- **Video Learning:** YouTube integration with progress tracking
- **Interactive Quizzes:** Multiple question types with instant feedback

### 3. Ice Hockey Goalie Specialization
- **Session Charting:** Detailed game and practice tracking
- **Performance Metrics:** 20+ specialized goalie metrics
- **Multi-Stage Analysis:** Pre-game, period-by-period, post-game tracking
- **Dynamic Forms:** Customizable data collection templates

### 4. Progress & Analytics
- **Real-time Progress Tracking:** Sport and skill-level monitoring
- **Achievement System:** Badges and milestones
- **Streak Tracking:** Daily engagement monitoring
- **Performance Analytics:** Visual charts and insights

## Technology Stack

### Frontend
- **Framework:** Next.js 16.1.4 (App Router)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui + Radix UI
- **State:** React Context + Custom Hooks

### Backend
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth with multi-role support
- **Storage:** Firebase Storage
- **AI Integration:** Anthropic Claude API (for project assistant)

### Infrastructure
- **Deployment:** Vercel (production-ready)
- **Version Control:** Git + GitHub
- **Testing:** Playwright (E2E), Vitest (Unit)

## Recent Development (Phase 2)

### Multi-Role Authentication System
Complete role-based access control supporting Students, Coaches, Parents, and Administrators with secure registration and invitation workflows.

**Key Features:**
- Role selection during registration
- Student ID generation (SG-XXXX-XXXX format)
- Email-based coach invitations
- Parent-child linking via student IDs
- Admin oversight capabilities

### Custom Curriculum System
Coaches can create personalized learning paths for students, managing content selection, unlocking, and progress tracking.

**Capabilities:**
- Create custom curricula for assigned students
- Browse and add lessons/quizzes from database
- Control content availability (lock/unlock)
- Track student progress in real-time
- Admin access to all curricula

### Advanced Content Management
Comprehensive content browser with search, filtering, and real-time data integration.

**Features:**
- Search across all lessons and quizzes
- Filter by sport, difficulty, and type
- Visual content cards with details
- Preview before adding to curriculum
- Smart content recommendations

## Project Metrics

### Current Status
- **Phase Progress:** 60% complete
- **Recent Work:** Comprehensive development over recent sessions
- **Services:** 16 specialized backend services
- **Components:** 30+ reusable UI components
- **Routes:** 40+ pages and endpoints
- **TypeScript Coverage:** 100%

### Quality Standards
- **Code Quality:** B+ (85/100)
- **Build Status:** ✅ Passing
- **Production Readiness:** 85%
- **Type Safety:** Complete TypeScript coverage

## Key Differentiators

1. **Dual Learning Paths:** Both self-paced and coach-guided workflows in one platform
2. **Specialized for Ice Hockey Goalies:** Built specifically for goalie training needs
3. **Comprehensive Charting:** Detailed session tracking with 20+ performance metrics
4. **Flexible Curriculum System:** Coaches create personalized learning experiences
5. **Production-Ready:** Enterprise-grade architecture and security

## Current Phase Focus

**Phase 2.0: Multi-Role Foundation** (60% Complete)
- ✅ Multi-role authentication (Student, Coach, Parent, Admin)
- ✅ Student ID generation and security
- ✅ Coach invitation system with email
- ✅ Student workflow types (automated vs custom)
- ✅ Coach curriculum builder MVP
- ✅ Content browser with real data
- ✅ Admin curriculum management access
- 🔄 Coach-student relationship formalization (upcoming)
- 🔄 Parent-child relationship system (upcoming)

**Next: Phase 2.1 - 6-Pillar Framework**
Transform platform to use fixed 6-pillar ice hockey goalie training structure.

## Quick Access

**Production Site:** https://sports-goalie.vercel.app/

### For Admins
- **Admin Dashboard:** https://sports-goalie.vercel.app/admin - System overview and management
- **User Management:** https://sports-goalie.vercel.app/admin/users - Manage all user accounts
- **Coach Invitations:** https://sports-goalie.vercel.app/admin/coaches - Invite and manage coaches
- **Curriculum Management:** https://sports-goalie.vercel.app/coach - Oversee all student curricula
- **Project Assistant:** https://sports-goalie.vercel.app/admin/project-assistant - AI chatbot for project info

### For Coaches
- **Coach Dashboard:** https://sports-goalie.vercel.app/coach - Student overview and statistics
- **Student List:** https://sports-goalie.vercel.app/coach/students - All assigned students
- **Curriculum Builder:** https://sports-goalie.vercel.app/coach/students/[studentId]/curriculum - Create learning paths (replace [studentId] with actual student ID)

### For Students
- **Dashboard:** https://sports-goalie.vercel.app/dashboard - Personal progress and achievements
- **Sports Catalog:** https://sports-goalie.vercel.app/sports - Browse all available content
- **Session Charting:** https://sports-goalie.vercel.app/charting - Track game and practice sessions

### Public Pages
- **Home Page:** https://sports-goalie.vercel.app/ - Landing page
- **Login:** https://sports-goalie.vercel.app/auth/login - User login
- **Register:** https://sports-goalie.vercel.app/auth/register - New user registration

## Documentation & Support

### Available Resources
- **Feature Docs:** `/docs/client/features/` - Detailed feature documentation
- **Route Guide:** `/docs/client/pages/all-routes.md` - Complete route reference
- **Recent Work:** `/docs/client/sessions/` - Latest development sessions
- **Tech Stack:** `/docs/client/overview/tech-stack.md` - Complete technology details
- **Project Assistant:** Available in admin dashboard for instant answers

### Recent Sessions
See `/docs/client/sessions/` for detailed logs of recent development work including:
- Multi-role authentication implementation
- Student ID system
- Coach invitation system
- Custom curriculum system
- Content browser development
- And more...

## Contact & Support

For questions about project status, features, technical details, or anything else, use the **Project Assistant** chatbot available in the admin dashboard at `/admin/project-assistant`.
