# All Application Routes

**Production Site:** https://sports-goalie.vercel.app/

This document lists all accessible pages and routes in the SportsGoalie platform. Each route includes the full URL for easy navigation to the live site.

## Public Routes (No Login Required)

### Landing & Marketing
- **Home Page:** https://sports-goalie.vercel.app/
  - Landing page with project overview and getting started

- **Sports Catalog:** https://sports-goalie.vercel.app/sports
  - Browse all sports without authentication required

- **Sport Detail:** https://sports-goalie.vercel.app/sports/[sportId]
  - Individual sport page with skills list (replace [sportId] with actual sport ID)

### Authentication Pages
- **Login:** https://sports-goalie.vercel.app/auth/login
  - User login for all roles

- **Register:** https://sports-goalie.vercel.app/auth/register
  - New user registration (Student/Parent roles only)

- **Reset Password:** https://sports-goalie.vercel.app/auth/reset-password
  - Password recovery flow

- **Accept Invitation:** https://sports-goalie.vercel.app/auth/accept-invite?token=[token]
  - Coach invitation acceptance (requires invitation token)

### Public Content
- **Quiz Listing:** https://sports-goalie.vercel.app/quizzes
  - Public quiz directory (if configured for public access)

## Student Routes (Requires Student Login)

### Dashboard & Progress
- **Main Dashboard:** https://sports-goalie.vercel.app/dashboard
  - Student dashboard with progress overview and quick actions

- **Progress Tracking:** https://sports-goalie.vercel.app/progress
  - Detailed progress tracking with charts and visualizations

- **Achievements:** https://sports-goalie.vercel.app/achievements
  - Achievement badges, milestones, and accomplishments

- **Goals:** https://sports-goalie.vercel.app/goals
  - Goal setting and tracking interface

### Learning Content
- **Skill Learning:** https://sports-goalie.vercel.app/sports/[sportId]/skills/[skillId]
  - Individual skill learning page with video and content

- **Video Quiz:** https://sports-goalie.vercel.app/quiz/video/[quizId]
  - Interactive video quiz player

- **Quiz Results:** https://sports-goalie.vercel.app/quiz/video/[quizId]/results
  - Quiz results with feedback and scoring

### Ice Hockey Goalie Charting
- **Charting Dashboard:** https://sports-goalie.vercel.app/charting
  - Session list and charting overview

- **New Session:** https://sports-goalie.vercel.app/charting/new
  - Start new game or practice session

- **Session Details:** https://sports-goalie.vercel.app/charting/[sessionId]
  - View detailed session data and analytics

- **Edit Session:** https://sports-goalie.vercel.app/charting/[sessionId]/edit
  - Edit existing session data

### Communication
- **Messages:** https://sports-goalie.vercel.app/messages
  - Message inbox and notifications

- **Message Detail:** https://sports-goalie.vercel.app/messages/[messageId]
  - Read individual message

### Settings
- **Profile:** https://sports-goalie.vercel.app/profile
  - User profile management (includes Student ID display for students)

- **Settings:** https://sports-goalie.vercel.app/settings
  - User preferences and account settings

## Coach Routes (Requires Coach Login)

### Dashboard & Student Management
- **Coach Dashboard:** https://sports-goalie.vercel.app/coach
  - Coach overview with student statistics

- **Student List:** https://sports-goalie.vercel.app/coach/students
  - All assigned students with progress indicators

- **Curriculum Builder:** https://sports-goalie.vercel.app/coach/students/[studentId]/curriculum
  - Create and manage custom curriculum for student (replace [studentId] with actual student ID)

### Content Management (Future Enhancement)
- **Content Library:** https://sports-goalie.vercel.app/coach/content
  - Personal library of coach-created content

- **Create Content:** https://sports-goalie.vercel.app/coach/content/new
  - Create custom lessons or quizzes

- **Edit Content:** https://sports-goalie.vercel.app/coach/content/[contentId]/edit
  - Edit existing custom content

### Analytics (Future Enhancement)
- **Coach Analytics:** https://sports-goalie.vercel.app/coach/analytics
  - Overall coaching analytics and insights

- **Student Analytics:** https://sports-goalie.vercel.app/coach/students/[studentId]/analytics
  - Individual student performance analytics

## Parent Routes (Phase 2.0.4 - Upcoming)

### Dashboard
- **Parent Dashboard:** https://sports-goalie.vercel.app/parent
  - Parent overview with all children's progress

- **Children List:** https://sports-goalie.vercel.app/parent/children
  - All linked children accounts

### Child Monitoring
- **Child Progress:** https://sports-goalie.vercel.app/parent/children/[childId]/progress
  - View child's learning progress

- **Child Sessions:** https://sports-goalie.vercel.app/parent/children/[childId]/sessions
  - View child's charting sessions

- **Child Messages:** https://sports-goalie.vercel.app/parent/children/[childId]/messages
  - Monitor child's messages (with privacy controls)

## Admin Routes (Requires Admin Login)

### Main Dashboard
- **Admin Dashboard:** https://sports-goalie.vercel.app/admin
  - System overview and management hub

### User Management
- **User List:** https://sports-goalie.vercel.app/admin/users
  - All users with filtering and management tools

- **User Detail:** https://sports-goalie.vercel.app/admin/users/[userId]
  - Individual user management and editing

- **Coach Invitations:** https://sports-goalie.vercel.app/admin/coaches
  - Invite and manage coach accounts

### Content Management
- **Sports Management:** https://sports-goalie.vercel.app/admin/sports
  - Manage sports catalog

- **Skills Management:** https://sports-goalie.vercel.app/admin/sports/[sportId]/skills
  - Manage skills for specific sport

- **Quiz Management:** https://sports-goalie.vercel.app/admin/quizzes
  - Manage quiz library

- **Create Quiz:** https://sports-goalie.vercel.app/admin/quizzes/create
  - Create new quiz

- **Edit Quiz:** https://sports-goalie.vercel.app/admin/quizzes/[quizId]/edit
  - Edit existing quiz

### Charting Administration
- **Form Templates:** https://sports-goalie.vercel.app/admin/form-templates
  - Manage charting form templates

- **Create Template:** https://sports-goalie.vercel.app/admin/form-templates/create
  - Create new form template

- **Edit Template:** https://sports-goalie.vercel.app/admin/form-templates/[templateId]
  - Edit form template

- **Charting Overview:** https://sports-goalie.vercel.app/admin/charting
  - System-wide charting statistics

- **Charting Analytics:** https://sports-goalie.vercel.app/admin/charting/analytics
  - Advanced charting analytics

### System Management
- **Messages:** https://sports-goalie.vercel.app/admin/messages
  - System messages management

- **Video Reviews:** https://sports-goalie.vercel.app/admin/video-reviews
  - Video review system

- **Moderation:** https://sports-goalie.vercel.app/admin/moderation
  - Content moderation queue

- **Analytics:** https://sports-goalie.vercel.app/admin/analytics
  - System analytics dashboard

- **Settings:** https://sports-goalie.vercel.app/admin/settings
  - Application settings

- **Project Assistant:** https://sports-goalie.vercel.app/admin/project-assistant
  - AI chatbot for project information and guidance

### Curriculum Oversight
- **All Curricula:** https://sports-goalie.vercel.app/coach
  - Admins can access all coach features including curriculum management

## API Endpoints

**Base URL:** https://sports-goalie.vercel.app/api

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

### User Management
- `GET /api/users` - List users (admin only)
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Content
- `GET /api/sports` - List all sports
- `GET /api/sports/[id]` - Get sport details
- `GET /api/sports/[id]/skills` - Get skills for sport
- `POST /api/sports` - Create sport (admin)
- `PUT /api/sports/[id]` - Update sport (admin)

### Quizzes
- `GET /api/quizzes` - List quizzes
- `GET /api/quizzes/[id]` - Get quiz details
- `POST /api/quizzes` - Create quiz (admin)
- `POST /api/quizzes/[id]/submit` - Submit quiz answers

### Progress Tracking
- `GET /api/progress/user` - Get user progress
- `POST /api/progress/skill/[id]` - Record skill progress
- `POST /api/progress/quiz/[id]` - Record quiz completion

### Coach Features
- `GET /api/coach/students` - Get assigned students
- `GET /api/coach/curriculum/[studentId]` - Get student curriculum
- `POST /api/coach/curriculum` - Create new curriculum
- `PUT /api/coach/curriculum/[id]` - Update curriculum

### Admin Features
- `POST /api/admin/chat` - Chat with project assistant AI
- `POST /api/admin/invitations` - Send coach invitation
- `GET /api/admin/invitations` - List all invitations
- `PUT /api/admin/invitations/[id]` - Update invitation status

### Charting System
- `GET /api/charting/sessions` - List user's sessions
- `POST /api/charting/sessions` - Create new session
- `GET /api/charting/sessions/[id]` - Get session details
- `PUT /api/charting/sessions/[id]` - Update session data

## Navigation Guide

### How to Guide Users

When directing users to specific pages, always provide the full URL. For example:

**For Students:**
- "Go to your dashboard at https://sports-goalie.vercel.app/dashboard"
- "View your progress at https://sports-goalie.vercel.app/progress"
- "Check your profile at https://sports-goalie.vercel.app/profile"

**For Coaches:**
- "Access your coach dashboard at https://sports-goalie.vercel.app/coach"
- "View your students at https://sports-goalie.vercel.app/coach/students"
- "To build a curriculum, go to https://sports-goalie.vercel.app/coach/students/[studentId]/curriculum (you'll need the student's ID)"

**For Admins:**
- "Open the admin dashboard at https://sports-goalie.vercel.app/admin"
- "Manage users at https://sports-goalie.vercel.app/admin/users"
- "Invite coaches at https://sports-goalie.vercel.app/admin/coaches"
- "Ask the project assistant at https://sports-goalie.vercel.app/admin/project-assistant"

### Dynamic URL Parameters

Some routes require dynamic parameters (IDs):

- **[sportId]** - Replace with actual sport ID (e.g., "ice-hockey", "baseball")
- **[skillId]** - Replace with actual skill ID
- **[studentId]** - Replace with student's user ID
- **[sessionId]** - Replace with charting session ID
- **[userId]** - Replace with user ID
- **[quizId]** - Replace with quiz ID
- **[messageId]** - Replace with message ID
- **[templateId]** - Replace with form template ID
- **[contentId]** - Replace with custom content ID

**Example:**
Instead of: `https://sports-goalie.vercel.app/coach/students/[studentId]/curriculum`
Use: `https://sports-goalie.vercel.app/coach/students/abc123xyz/curriculum`

## Route Protection

### Public Access
- Home, sports catalog, authentication pages
- No login required
- SEO-optimized for search engines

### Authentication Required
- All other routes require login
- Users redirected to login page if not authenticated
- Session validation on each request

### Role-Based Access
- Routes check user role (student/coach/parent/admin)
- Wrong role users redirected to their appropriate dashboard
- API endpoints validate permissions

### Security Features
- Token-based authentication
- Role verification
- Rate limiting on sensitive routes
- CSRF protection
- Secure session management

## Future Routes (Planned)

### Phase 2.1 (6-Pillar System)
- `/pillars` - 6 pillars overview page
- `/pillars/[pillarId]` - Individual pillar content
- `/pillars/[pillarId]/level/[level]` - Level-specific content

### Phase 2.2 (Enhanced Analytics)
- `/coach/analytics/cohort` - Cohort comparison analytics
- `/admin/analytics/engagement` - User engagement metrics
- `/admin/analytics/content` - Content performance dashboard

### Future Enhancements
- `/community` - Community forum
- `/marketplace` - Content marketplace
- `/teams` - Team management
- `/tournaments` - Competition tracking
- `/notifications` - Notification center

---

**Note:** Always use the full URL (https://sports-goalie.vercel.app/...) when directing users to specific pages. This ensures they can navigate directly to the correct location.
