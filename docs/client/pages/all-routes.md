# All Application Routes

## Public Routes (Unauthenticated)

### Landing & Marketing
- `/` - Landing page with project overview
- `/sports` - Sports catalog (browseable without login)
- `/sports/[id]` - Individual sport detail page with skills list

### Authentication
- `/auth/login` - User login
- `/auth/register` - New user registration (Student/Parent only)
- `/auth/reset-password` - Password reset flow
- `/auth/accept-invite` - Coach invitation acceptance

### Content (Public Access)
- `/quizzes` - Public quiz listing (if configured)

## Student Routes

### Dashboard & Progress
- `/dashboard` - Main student dashboard with progress overview
- `/progress` - Detailed progress tracking with charts
- `/achievements` - Achievement badges and milestones
- `/goals` - Goal setting and tracking interface

### Learning
- `/sports/[id]/skills/[skillId]` - Skill learning page with video
- `/quiz/video/[id]` - Video quiz player
- `/quiz/video/[id]/results` - Quiz results and feedback

### Charting (Ice Hockey Goalie)
- `/charting` - Session list and charting dashboard
- `/charting/new` - Start new session (game/practice)
- `/charting/[sessionId]` - View session details
- `/charting/[sessionId]/edit` - Edit session data

### Communication
- `/messages` - Message inbox
- `/messages/[id]` - Individual message detail

### Settings
- `/profile` - User profile management
- `/settings` - User preferences and settings

## Coach Routes

### Dashboard & Students
- `/coach` - Coach dashboard with statistics
- `/coach/students` - List of assigned students
- `/coach/students/[studentId]/curriculum` - Curriculum builder for student

### Content Management (Future)
- `/coach/content` - Personal content library
- `/coach/content/new` - Create custom content
- `/coach/content/[id]/edit` - Edit custom content

### Analytics (Future)
- `/coach/analytics` - Coach analytics dashboard
- `/coach/students/[studentId]/analytics` - Individual student analytics

## Parent Routes (Planned Phase 2.0.4)

### Dashboard
- `/parent` - Parent dashboard
- `/parent/children` - List of linked children

### Monitoring
- `/parent/children/[childId]/progress` - Child's progress
- `/parent/children/[childId]/sessions` - Child's charting sessions
- `/parent/children/[childId]/messages` - Child's messages

## Admin Routes

### Main Dashboard
- `/admin` - Admin dashboard overview
- `/admin/page` - Alternative admin landing

### User Management
- `/admin/users` - User list and management
- `/admin/users/[id]` - User detail and editing
- `/admin/coaches` - Coach invitation management

### Content Management
- `/admin/sports` - Sports management
- `/admin/sports/[id]/skills` - Skills management for sport
- `/admin/quizzes` - Quiz management
- `/admin/quizzes/create` - Create new quiz
- `/admin/quizzes/[id]/edit` - Edit existing quiz

### Charting Administration
- `/admin/form-templates` - Form template management
- `/admin/form-templates/create` - Create new template
- `/admin/form-templates/[id]` - Edit template
- `/admin/charting` - Charting system overview
- `/admin/charting/analytics` - System-wide charting analytics

### System Management
- `/admin/messages` - System messages management
- `/admin/video-reviews` - Video review system
- `/admin/moderation` - Content moderation queue
- `/admin/analytics` - System analytics dashboard
- `/admin/settings` - Application settings
- `/admin/project-assistant` - **NEW:** AI project assistant chatbot

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

### User Management
- `GET /api/users` - List users (admin)
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Content
- `GET /api/sports` - List sports
- `GET /api/sports/[id]` - Get sport details
- `GET /api/sports/[id]/skills` - Get skills for sport
- `POST /api/sports` - Create sport (admin)
- `PUT /api/sports/[id]` - Update sport (admin)

### Quizzes
- `GET /api/quizzes` - List quizzes
- `GET /api/quizzes/[id]` - Get quiz details
- `POST /api/quizzes` - Create quiz (admin)
- `POST /api/quizzes/[id]/submit` - Submit quiz answers

### Progress
- `GET /api/progress/user` - Get user progress
- `POST /api/progress/skill/[id]` - Record skill progress
- `POST /api/progress/quiz/[id]` - Record quiz completion

### Coach
- `GET /api/coach/students` - Get assigned students
- `GET /api/coach/curriculum/[studentId]` - Get student curriculum
- `POST /api/coach/curriculum` - Create curriculum
- `PUT /api/coach/curriculum/[id]` - Update curriculum

### Admin
- `POST /api/admin/chat` - **NEW:** Chat with project assistant AI
- `POST /api/admin/invitations` - Send coach invitation
- `GET /api/admin/invitations` - List invitations
- `PUT /api/admin/invitations/[id]` - Update invitation status

### Charting
- `GET /api/charting/sessions` - List user sessions
- `POST /api/charting/sessions` - Create session
- `GET /api/charting/sessions/[id]` - Get session details
- `PUT /api/charting/sessions/[id]` - Update session

## Route Protection

### Public Routes
- No authentication required
- Accessible to all visitors
- SEO-friendly

### Protected Routes
- Require authentication
- Redirect to login if not authenticated
- Session validation

### Role-Based Routes
- Require specific role (student/coach/parent/admin)
- Redirect to appropriate dashboard if wrong role
- Permission checking at API level

### Security Middleware
- Token validation
- Role verification
- Rate limiting (admin routes)
- CSRF protection

## Navigation Structure

### Student Navigation
- Dashboard
- Sports Catalog
- Progress
- Achievements
- Goals
- Messages
- Charting (if applicable)
- Profile

### Coach Navigation
- Dashboard
- My Students
- Content Library
- Analytics
- Profile

### Parent Navigation
- Dashboard
- My Children
- Messages
- Profile

### Admin Navigation
- Dashboard
- Users
- Content (Sports/Skills/Quizzes)
- Coaches
- Form Templates
- Analytics
- Messages
- Project Assistant
- Settings

## Route Conventions

### Dynamic Routes
- `[id]` - Single dynamic parameter (e.g., user ID, sport ID)
- `[...slug]` - Catch-all route for nested paths

### Query Parameters
- `?token=xxx` - Invitation tokens
- `?redirect=/path` - Post-login redirects
- `?filter=value` - List filtering
- `?page=1` - Pagination

### URL Structure
- Lowercase with hyphens: `/my-students`
- RESTful patterns: `/api/resource` (GET), `/api/resource/[id]` (GET/PUT/DELETE)
- Nested resources: `/sports/[id]/skills`

## Future Routes (Planned)

### Phase 2.1 (6-Pillar System)
- `/pillars` - 6 pillars overview
- `/pillars/[pillarId]` - Individual pillar content
- `/pillars/[pillarId]/level/[level]` - Pillar level content

### Phase 2.2 (Enhanced Analytics)
- `/coach/analytics/cohort` - Cohort comparison
- `/admin/analytics/engagement` - User engagement metrics
- `/admin/analytics/content` - Content performance

### Future Features
- `/community` - Community forum
- `/marketplace` - Content marketplace
- `/teams` - Team management
- `/tournaments` - Competition tracking
