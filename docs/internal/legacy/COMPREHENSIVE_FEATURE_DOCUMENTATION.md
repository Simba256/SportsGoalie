# SportsGoalie (SmarterGoalie) - Comprehensive Feature Documentation

**Platform Name**: SportsGoalie / SmarterGoalie
**Version**: V3
**Technology Stack**: Next.js 14, TypeScript, Firebase (Firestore, Auth, Storage), Anthropic Claude API, Tailwind CSS, shadcn/ui
**Deployment**: Vercel (https://sports-goalie.vercel.app)
**Last Updated**: December 8, 2025

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [User Roles](#user-roles)
3. [Student Features](#student-features)
4. [Admin Features](#admin-features)
5. [Core Modules](#core-modules)
6. [Technical Architecture](#technical-architecture)
7. [Data Models](#data-models)
8. [Security & Authentication](#security--authentication)
9. [Analytics & Reporting](#analytics--reporting)
10. [Integrations](#integrations)

---

## Platform Overview

SportsGoalie is a **comprehensive digital sports coaching platform** specifically designed for **hockey goalies** (though extensible to other sports). It combines structured learning, performance tracking, interactive assessments, and coach-student communication in a modern, mobile-first web application.

### Core Mission
- Help athletes learn goaltending skills through structured courses
- Track performance through detailed game/practice charting
- Assess knowledge through interactive video-based quizzes
- Enable personalized coaching through video review and messaging
- Provide analytics-driven insights for continuous improvement

### Key Differentiators
1. **AI-Powered Coaching Assistant** - Claude-powered chatbot providing personalized, context-aware guidance site-wide
2. **Dynamic Performance Charting System** - Flexible form templates for tracking goalie performance
3. **Video-Based Interactive Quizzes** - Questions embedded at specific timestamps in training videos
4. **Video Upload & Coach Review** - Students upload training videos for personalized feedback
5. **Form Template Builder** - Admin can create custom performance tracking forms
6. **Comprehensive Analytics** - Detailed performance trends, consistency metrics, and insights

---

## User Roles

### 1. **Student**
- Primary end-users (hockey goalies)
- Can enroll in courses, complete skills, take quizzes
- Upload training videos for coach review
- Chart their own game/practice sessions
- Track personal progress and analytics
- Receive messages and feedback from coaches

### 2. **Admin/Coach**
- Platform administrators and coaches
- Full access to all platform management features
- Create and manage courses, skills, quizzes, and content
- Review student videos and provide feedback
- Create custom form templates for performance tracking
- View student analytics and performance data
- Send messages and instructions to students
- Manage user accounts and platform settings

---

## Student Features

### 📚 **Learning & Courses**

#### Course Enrollment
- **Browse Course Catalog**: View all available sports courses (Hockey Goalie, Soccer Goalie, etc.)
- **Course Details**: See course descriptions, difficulty levels, estimated completion time
- **Skill Overview**: View all skills within a course before enrolling
- **Enroll in Courses**: One-click enrollment in courses of interest
- **Course Progress Tracking**: Visual progress bars showing completion percentage

#### Skill Learning
- **Structured Skill Modules**: Each course contains multiple skills to master
- **Rich Content Display**:
  - Text-based learning content (HTML formatted)
  - Embedded images with captions
  - YouTube video integration with player controls
  - External resource links (PDFs, websites, videos)
- **Learning Objectives**: Clear list of what you'll learn
- **Prerequisites Tracking**: Skills locked until prerequisites are met
- **Difficulty Indicators**: Beginner, Intermediate, Advanced labels
- **Time Estimates**: Estimated time to complete each skill

#### Progress Management
- **Bookmark Skills**: Save skills for later review
- **Personal Notes**: Add notes to any skill for future reference
- **Completion Tracking**: Mark skills as complete
- **Video Progress**: Track time watched for video content
- **Quiz Scores**: See quiz results tied to each skill
- **Overall Dashboard**: Central view of all course progress

---

### 🎯 **Interactive Video Quizzes**

#### Quiz Taking Experience
- **Video-Embedded Questions**: Questions appear at specific timestamps during video playback
- **Automatic Pause**: Video pauses when a question appears
- **Multiple Question Types**:
  - Multiple choice (single or multiple answers)
  - True/False
  - Descriptive/Open-ended
  - Fill-in-the-blank
- **Question Hints**: Optional hints available for guidance
- **Immediate Feedback**: See if answers are correct right away (configurable)
- **Explanations**: Detailed explanations for each answer
- **Progress Indicator**: Visual progress bar showing questions completed

#### Quiz Features
- **Playback Controls**:
  - Variable playback speeds (0.5x to 2x)
  - Rewind capability (if enabled)
  - Skip ahead restrictions (configurable)
- **Score Tracking**: Real-time score calculation
- **Time Tracking**: Monitor time spent on quiz
- **Resume Capability**: Return to incomplete quizzes
- **Results Page**: Comprehensive results with:
  - Overall score and percentage
  - Question-by-question breakdown
  - Correct vs. incorrect answers
  - Time spent per question
  - Recommendations for review

#### Quiz History
- **Attempt History**: View all past quiz attempts
- **Score Trends**: See improvement over time
- **Average Scores**: Compare performance across attempts
- **Best Scores**: Track personal best performances

---

### 📊 **Performance Charting System**

#### Session Management
- **Create Sessions**:
  - Game sessions (vs opponent)
  - Practice sessions
  - Add date, time, location
  - Tag sessions (home, away, tournament, league, etc.)
- **Session Types**: Differentiate between games and practices
- **Session Status**: Track session stages (scheduled, in-progress, completed)
- **Opponent Tracking**: Record opponent names for games
- **Result Recording**: Win/Loss/Tie tracking

#### Dynamic Charting Forms
The platform uses a **flexible form template system** allowing coaches to create custom tracking forms. Current implementation includes a comprehensive hockey goalie performance tracker:

##### Pre-Game Preparation
- **Game Readiness**:
  - Well rested (Yes/No with comments)
  - Fueled for game (Yes/No with comments)
- **Mindset**:
  - Mind cleared (Yes/No with comments)
  - Mental imagery practiced (Yes/No with comments)
- **Pre-Game Routine**:
  - Ball exercises completed
  - Stretching completed
  - Other routine items
- **Warm-Up Assessment**:
  - Looked engaged
  - Lacked focus
  - Team warm-up needs adjustment

##### Game Overview
- **Goals Tracking by Period**:
  - Good goals allowed (Period 1, 2, 3)
  - Bad goals allowed (Period 1, 2, 3)
- **Degree of Challenge**: Rate game difficulty (1-10 scale per period)

##### Period-by-Period Performance (Periods 1, 2, 3)
- **Mindset**:
  - Focus consistency/inconsistency
  - Decision making (strong, improving, needs work)
  - Body language (consistent/inconsistent)
- **Skating**:
  - In sync with puck
  - Improving
  - Weak
  - Not in sync
- **Positional Play**:
  - Above icing line (poor, improving, good, angle issues)
  - Below icing line (poor, improving, good, strong)
  - Four-arch level tracking with specific point selection
- **Rebound Control**:
  - Quality assessment (poor, improving, good)
  - Consistency (consistent/inconsistent)
- **Freezing Puck**:
  - Quality rating
  - Consistency tracking
- **Team Play** (Period 3 only):
  - Setting up defense (poor, improving, good)
  - Setting up forwards (poor, improving, good)

##### Overtime & Shootout
- **Overtime Performance**:
  - Mindset focus
  - Decision making
  - Skating performance
  - Positional game
  - Rebound control
  - Freezing puck
- **Shootout Statistics**:
  - Result (won/lost)
  - Shots saved (0-10)
  - Shots scored against (0-10)
  - Dekes saved (0-10)
  - Dekes scored against (0-10)
  - Comments

##### Post-Game
- **Review Completion**: Track whether post-game review was completed
- **Additional Comments**: Free-form notes about the session

#### Charting Features
- **Session Calendar View**: Visual calendar showing all sessions
- **Calendar Heatmap**: Color-coded calendar showing charting activity
- **Session Details**: View complete charting data for any session
- **Edit Capability**: Update charting data after submission
- **Partial Save**: Save incomplete forms and return later
- **Completion Percentage**: Track how much of each form is complete

---

### 📈 **Personal Analytics Dashboard**

#### Overview Statistics
- **Total Sessions**: Count of all games and practices
- **Completed Sessions**: Sessions with charting data
- **Current Streak**: Consecutive days with activity
- **This Month Stats**: Session count for current month
- **Completion Rate**: Percentage of sessions charted

#### Performance Analytics
The platform provides **comprehensive analytics** based on charting data:

##### Goals Analysis
- **Average Good Goals per Game**: Track quality saves
- **Average Bad Goals per Game**: Identify areas for improvement
- **Good/Bad Ratio**: Performance indicator
- **Goals by Period**: See which periods are strongest/weakest
- **Trend Analysis**: Compare recent vs. older performance

##### Challenge & Difficulty
- **Average Challenge Rating**: How difficult games have been (1-10)
- **Challenge Consistency**: Standard deviation of difficulty
- **Performance vs. Challenge**: Compare performance at different difficulty levels

##### Mindset Performance
- **Focus Consistency**: Percentage of periods with consistent focus
- **Decision Making Strength**: Percentage of strong decision making
- **Body Language**: Consistency tracking
- **Trend Indicators**: Improving, stable, or declining

##### Technical Skills
- **Skating Performance**: In-sync percentage and trends
- **Positional Play**: Strong positioning percentage
- **Rebound Control**: Quality and consistency percentages
- **Freezing Puck**: Quality and consistency metrics

##### Team Play
- **Setting Up Defense**: Quality assessment
- **Setting Up Forwards**: Quality assessment
- **Period 3 Performance**: Specific team play metrics

##### Pre-Game Adherence
- **Equipment Check**: Completion percentage
- **Mental Preparation**: Adherence tracking
- **Warm-Up Quality**: Assessment scores
- **Physical Preparation**: Completion rate
- **Overall Prep Score**: Combined metric (0-100)

##### Shootout Statistics
- **Total Shootouts**: Count participated in
- **Win Rate**: Success percentage
- **Shot Save Percentage**: Saves/total shots
- **Deke Save Percentage**: Dekes saved/total dekes

#### Activity Tracking
- **Calendar Heatmap**: Visual representation of session frequency
- **Streak Tracking**: Current and longest streak
- **Session Frequency**: Average sessions per week/month
- **Time Periods**: Filter analytics by week, month, 3 months, or all time

#### Recent Sessions Timeline
- **Session List**: Chronological view of recent sessions
- **Quick Stats**: Good/bad goals at a glance
- **Status Indicators**: Completion badges
- **Jump to Details**: Click to view full session charting

---

### 🎥 **Video Upload & Coach Feedback**

#### Video Upload
- **Upload Interface**: Drag-and-drop or click to upload
- **File Validation**: Supports MP4, MOV, AVI, WebM formats
- **Size Limits**: Maximum file size enforcement
- **Sport Selection**: Tag videos with relevant sport
- **Description Field**: Add context about the video
- **Upload Progress**: Real-time progress indicator
- **Firebase Storage**: Secure cloud storage integration

#### Feedback Reception
- **Message Notifications**: Notified when coach provides feedback
- **Video Review Messages**: Detailed feedback with video reference
- **Course Recommendations**: Coaches can recommend specific courses
- **Feedback History**: Archive of all received feedback
- **Video Player**: Embedded player to review videos with feedback

---

### 💬 **Messaging System**

#### Inbox Features
- **Message Types**:
  - General messages
  - Instructions from coaches
  - Feedback on performance
  - Video review feedback
- **Unread Indicators**: Visual badges for new messages
- **Message Filters**:
  - Filter by type (general, instruction, feedback, video_review)
  - Filter by read/unread status
  - Search by sender or content
- **Message Details**:
  - Subject and body
  - Attachments (images, videos, documents)
  - Timestamp
  - Sender information

#### Message Organization
- **Inbox View**: All messages in one place
- **Message Count**: Total and unread counts
- **Sorting**: By date, unread first
- **Attachment Preview**: Icons showing attachment types
- **Message Status**: Read/unread tracking

---

### 🤖 **AI Coaching Chat (Claude-Powered)**

#### Overview
The platform features an **AI-powered coaching assistant** available site-wide to all users (students and admins). The chatbot uses Anthropic's Claude AI (claude-3-haiku model) to provide intelligent, context-aware assistance.

#### Features
- **Site-Wide Availability**: Floating chat widget accessible from any page
- **Context-Aware Responses**: AI receives user progress data for personalized guidance
- **Real-Time Assistance**: Instant responses to questions
- **Multiple Use Cases**:
  - Technique questions and explanations
  - Platform navigation help
  - Learning recommendations
  - Motivational support and encouragement
  - Progress insights

#### Context Injection
The AI chatbot has access to:
- User enrollments and course progress
- Quiz scores and performance history
- Recent video uploads
- Charting activity and statistics
- This enables highly personalized and relevant responses

#### Chat Features
- **Conversation History**: Maintains chat history during session
- **User-Friendly Interface**: Clean, intuitive chat interface
- **Message Formatting**: Markdown support for formatted responses
- **Loading States**: Clear indicators when AI is thinking
- **Error Handling**: Graceful error messages and retry options

#### Privacy & Cost Control
- **Cost-Optimized**: Uses claude-3-haiku model for efficient operation
- **Context Privacy**: User data only used for current conversation
- **No Data Storage**: Chat history not permanently stored
- **Secure API**: Anthropic API key securely stored in environment variables

---

### 👤 **User Profile & Settings**

#### Profile Management
- **Personal Information**:
  - First and last name
  - Email address (verified)
  - Profile picture upload
  - Date of birth
  - Location (country, city)
- **Sports Interests**: Select interested sports
- **Experience Level**: Beginner, Intermediate, Advanced
- **Goals**: Personal learning objectives

#### Preferences
- **Notification Settings**:
  - Progress notifications
  - Quiz result alerts
  - New content announcements
  - Reminder emails
- **Theme**: Light/Dark mode (if implemented)
- **Language**: Platform language preference
- **Timezone**: For accurate scheduling

#### Account Management
- **Email Verification**: Verify email address
- **Password Change**: Update password securely
- **Account Deletion**: Request account deletion

---

### 🏆 **Achievements & Gamification**

#### Achievement System
- **Achievement Types**:
  - Progress achievements (complete X skills)
  - Quiz achievements (score above X%)
  - Streak achievements (X day streak)
  - Time achievements (spend X hours learning)
  - Special achievements (unlock secrets)
- **Achievement Levels**: Common, Uncommon, Rare, Epic, Legendary
- **Progress Tracking**: See progress toward locked achievements
- **Unlock Notifications**: Celebrate when achievements are unlocked

#### Leaderboards (Potential)
- **Score Rankings**: Compare quiz scores with peers
- **Completion Rankings**: See who's completed the most skills
- **Streak Rankings**: Longest learning streaks

---

## Admin Features

### 📋 **Dashboard Overview**

#### Platform Statistics
- **User Metrics**:
  - Total users (students + admins)
  - New users this month
  - Active users (last 7 days)
  - User role distribution
- **Content Metrics**:
  - Total sports/courses available
  - Total skills available
  - Quiz attempts
  - Average quiz score
- **Engagement Metrics**:
  - Platform activity rate
  - System uptime percentage
  - Performance scores

#### Quick Actions
- **Content Management**: Jump to sports, skills, quizzes
- **User Management**: Manage user accounts
- **Video Reviews**: Pending video reviews count
- **Analytics**: Platform-wide analytics
- **Settings**: System configuration

---

### 🎓 **Course & Content Management**

#### Sports (Course) Management
- **Create Sports**:
  - Name and description
  - Category selection
  - Difficulty level (beginner, intermediate, advanced)
  - Estimated completion time
  - Icon/color selection
  - Cover image upload
  - Tags and keywords
  - Prerequisites (other sports)
  - Featured flag
- **Edit Sports**: Update any sport details
- **Sport Ordering**: Control display order
- **Activate/Deactivate**: Control visibility
- **Delete Sports**: Remove sports (with safeguards)
- **Sport Metadata**: View enrollment and completion stats

#### Skills Management
- **Create Skills**:
  - Skill name and description
  - Associate with sport
  - Difficulty level
  - Estimated time to complete (minutes)
  - Learning objectives list
  - Tags for searchability
  - Prerequisites (other skills)
  - Display order
- **Content Authoring**:
  - Rich text editor for content
  - Image uploads with captions
  - YouTube video embedding
  - External resource links (PDF, website, video)
- **Media Management**:
  - Upload images to Firebase Storage
  - YouTube video integration
  - Video thumbnails
  - Media ordering
- **Skill Settings**:
  - Active/Inactive toggle
  - Featured flag
  - Order within sport
- **Skill Analytics**: View completion rates and ratings

---

### 🎯 **Quiz Management**

#### Video Quiz Creation
- **Quiz Setup**:
  - Title and description
  - Associate with sport and skill (mandatory)
  - Category and tags
  - Difficulty level
  - Estimated duration
  - Cover image/thumbnail
  - Instructions for students
- **Video Configuration**:
  - Upload video to Firebase Storage or use external URL
  - Video duration (auto-detected)
  - Thumbnail/poster image
  - Playback settings
- **Question Builder**:
  - Add questions at specific timestamps
  - Question types:
    - Multiple choice (single or multiple correct)
    - True/False
    - Descriptive/essay
    - Fill-in-the-blank
  - Question text and options
  - Correct answer marking
  - Points assignment per question
  - Explanations for answers
  - Hints (optional)
  - Media attachments for questions (images, video clips)
- **Quiz Settings**:
  - Allow playback speed change
  - Available playback speeds (0.5x - 2x)
  - Allow rewind
  - Allow skip ahead
  - Require sequential answers
  - Show progress bar
  - Auto-play next
  - Show correct answers (immediate/after submission)
  - Show explanations (immediate/after submission)
- **Publishing**:
  - Active/Inactive toggle
  - Published/Unpublished status
  - Visibility controls

#### Quiz Management Features
- **Edit Quizzes**: Update any quiz details or questions
- **Preview Mode**: Test quiz before publishing
- **Duplicate Quiz**: Clone existing quizzes
- **Question Reordering**: Drag-and-drop question ordering
- **Bulk Operations**: Activate/deactivate multiple quizzes
- **Quiz Analytics**:
  - Total attempts
  - Completion rate
  - Average score
  - Average time spent
  - Drop-off points (where students abandon)
  - Question-level statistics

---

### 👥 **User Management**

#### User Administration
- **User List**:
  - View all registered users
  - Filter by role (student/admin)
  - Search by name or email
  - Sort by registration date, last login
- **User Details**:
  - View full user profile
  - See enrollment history
  - Check progress across courses
  - Review quiz history
  - Message history
- **User Actions**:
  - View user as admin
  - Promote student to admin
  - Demote admin to student
  - Suspend user account
  - Delete user account (with data removal)
  - Reset user password (trigger email)
- **User Analytics**:
  - Total learning time
  - Skills completed
  - Quiz performance
  - Engagement metrics

---

### 🎥 **Video Review Management**

#### Video Review Dashboard
- **Pending Videos**: Count of videos awaiting review
- **Review Queue**: Organized list of uploaded videos
- **Filtering Options**:
  - By status (pending, reviewed, feedback sent)
  - By student name
  - By upload date
  - By sport
- **Search**: Find specific videos quickly

#### Video Review Process
- **Video Playback**:
  - Embedded video player
  - Full playback controls
  - Download option for offline review
  - Timestamp markers
- **Student Information**:
  - Student name and email
  - Video description/context
  - Upload date
  - File size and format
- **Feedback Composition**:
  - **Quick Feedback Form**:
    - Text feedback field
    - Recommend courses (multi-select)
    - One-click send
  - **Detailed Feedback Message**:
    - Rich text editor
    - Attach images, videos, documents
    - Reference specific timestamps
    - Send as formal message
- **Course Recommendations**:
  - Select from all available courses
  - Add multiple recommendations
  - Recommendations appear in student messages
- **Status Tracking**:
  - Pending review
  - Under review (marked but not sent)
  - Feedback sent
- **Review History**: See all past feedback for a video

---

### 📝 **Form Template Management**

#### Dynamic Form Builder
The platform features a powerful form template system for creating custom performance tracking forms:

##### Template Creation
- **Template Information**:
  - Name and description
  - Associate with sport
  - Version number (auto-incremented)
  - Active/Inactive toggle
  - Archive capability
- **Section Builder**:
  - Add multiple sections to template
  - Section title and description
  - Section icon selection (Lucide icons)
  - Section ordering
  - Repeatable sections (e.g., "Period" section repeated 3 times)
  - Conditional sections (show if certain conditions met)

##### Field Types & Configuration
The form builder supports comprehensive field types:

1. **Yes/No Fields**:
   - Boolean value
   - Optional comment field
   - Comment required/optional toggle
   - Custom comment label

2. **Radio Buttons (Single Selection)**:
   - Custom options list
   - Pre-defined option sets (poor/improving/good/strong)
   - Comments field
   - Default selection

3. **Checkboxes (Multiple Selection)**:
   - Multiple choice options
   - Allow all/limit selections
   - Comments field

4. **Numeric Input**:
   - Min/max validation
   - Default value
   - Units (optional)
   - Number formatting

5. **Scale (Rating)**:
   - Min and max values (e.g., 1-10)
   - Step size
   - Label customization
   - Visual representation

6. **Text Input**:
   - Short text (single line)
   - Long text (textarea)
   - Min/max length validation
   - Placeholder text
   - Regex pattern validation

7. **Date & Time**:
   - Date picker
   - Time picker
   - Date range
   - Past/future restrictions

##### Field Configuration
- **Validation Rules**:
  - Required field toggle
  - Min/max values (numeric)
  - Min/max length (text)
  - Pattern matching (regex)
  - Custom error messages
- **Analytics Configuration**:
  - Enable/disable analytics for field
  - Analytics type (percentage, average, sum, trend, consistency, distribution, count)
  - Category grouping for related fields
  - Display name override
  - Weight for weighted averages
  - Higher is better toggle
  - Target value for goal tracking
- **Conditional Display**:
  - Show field if another field meets condition
  - Conditions: equals, not equals, contains, greater than, less than
  - Dependent field selection
- **UI Configuration**:
  - Field order
  - Column span (half-width or full-width)
  - Help text/description
  - Placeholder text

#### Template Management
- **Template Library**: View all created templates
- **Template Details**: See complete template structure
- **Template Versioning**: Track template changes over time
- **Activate/Deactivate**: Control which template is currently active
- **Template Migration**: Convert old data to new template format
- **Usage Statistics**: See how many entries use each template
- **Default Templates**: Initialize pre-built hockey goalie template

---

### 📊 **Analytics & Reports**

#### Platform Analytics
- **User Growth**:
  - Registration trends over time
  - Active user metrics
  - User retention rates
  - Churn analysis
- **Content Engagement**:
  - Most popular courses
  - Most accessed skills
  - Quiz participation rates
  - Video view counts
- **Performance Metrics**:
  - Average quiz scores by course
  - Skill completion rates
  - Time to complete courses
  - Drop-off points in courses
- **System Health**:
  - Page load times
  - Error rates
  - API response times
  - Database performance

#### Student Analytics Dashboard
- **Individual Student Reports**:
  - Progress across all courses
  - Quiz performance history
  - Charting completion rates
  - Time spent learning
- **Cohort Analysis**:
  - Compare students in same course
  - Identify struggling students
  - Recognize top performers
  - Engagement trends
- **Dynamic Charting Analytics**:
  - Field-level statistics (percentage, average, distribution)
  - Category-level analytics (grouped fields)
  - Trend analysis (improving, stable, declining)
  - Consistency scores
  - Target progress tracking
  - Strengths and weaknesses identification

---

### 💬 **Messaging Administration**

#### Message Management
- **Send Messages**:
  - Compose messages to individual students or groups
  - Select message type (general, instruction, feedback, video_review)
  - Subject and body
  - Attach files (images, videos, documents)
  - Priority level (low, medium, high)
  - Expiration date (optional)
- **Broadcast Messages**:
  - Send to all students
  - Send to students in specific course
  - Send to filtered user groups
- **Message Templates**:
  - Save frequently used messages
  - Reuse templates for common communications
- **Message Tracking**:
  - See which students have read messages
  - Delivery confirmation
  - Read receipts

---

### ⚙️ **Platform Settings**

#### General Settings
- **Platform Information**:
  - Platform name
  - Logo upload
  - Favicon
  - Description
  - Contact information
- **Maintenance Mode**:
  - Enable/disable platform access
  - Maintenance message customization
  - Scheduled maintenance windows
- **Feature Flags**:
  - Enable/disable registration
  - Enable/disable quizzes
  - Enable/disable achievements
  - Enable/disable notifications
  - Enable/disable content creation
  - Enable/disable video learning
  - Enable/disable social features
  - Enable/disable analytics tracking

#### Security Settings
- **Authentication**:
  - Password requirements (length, complexity)
  - Email verification requirement
  - Session timeout duration
  - Remember me duration
- **Rate Limiting**:
  - API calls per minute
  - Quiz attempts per hour
  - Content upload per day
- **IP Restrictions** (if implemented)
- **Two-Factor Authentication** (if implemented)

#### Content Settings
- **Language Support**:
  - Available languages
  - Default language
  - Translation management
- **Cache Settings**:
  - User data TTL
  - Content TTL
  - Quiz TTL
  - Static assets TTL

---

## Core Modules

### 1. **Authentication Module**

#### Features
- Firebase Authentication integration
- Email/password authentication
- Email verification required
- Password reset functionality
- Remember me functionality
- Session management
- Role-based access control (student/admin)
- Protected routes (client-side and server-side)
- Guest routes (redirect if already logged in)

#### Security
- Secure password hashing (Firebase)
- CSRF protection
- XSS prevention
- SQL injection prevention (NoSQL database)
- Rate limiting on auth endpoints
- Session timeout

---

### 2. **Database Module**

#### Firestore Collections Structure
```
- users
  ├─ {userId}
  │  ├─ email, displayName, role, profile, preferences
  │  └─ createdAt, updatedAt, lastLoginAt

- sports
  ├─ {sportId}
  │  ├─ name, description, icon, color, category
  │  ├─ difficulty, estimatedTimeToComplete, skillsCount
  │  ├─ imageUrl, tags, prerequisites
  │  └─ metadata (enrollments, completions, ratings)

- skills
  ├─ {skillId}
  │  ├─ sportId, name, description, difficulty
  │  ├─ content, media (images, videos)
  │  ├─ externalResources, learningObjectives
  │  ├─ prerequisites, tags
  │  └─ metadata (completions, ratings)

- video_quizzes
  ├─ {quizId}
  │  ├─ sportId, skillId (mandatory)
  │  ├─ title, description, videoUrl, videoDuration
  │  ├─ thumbnail, coverImage, instructions
  │  ├─ questions[] (with timestamps)
  │  ├─ settings (playback, rewind, etc.)
  │  └─ metadata (attempts, scores, drop-offs)

- quiz_progress
  ├─ {progressId}
  │  ├─ userId, videoQuizId, sportId, skillId
  │  ├─ currentTime, questionsAnswered[]
  │  ├─ score, percentage, isCompleted
  │  └─ watchTime, totalTimeSpent

- sport_progress
  ├─ {progressId}
  │  ├─ userId, sportId
  │  ├─ status, completedSkills[], progressPercentage
  │  ├─ timeSpent, streak
  │  └─ rating, review

- skill_progress
  ├─ {progressId}
  │  ├─ userId, skillId, sportId
  │  ├─ status, progressPercentage, timeSpent
  │  ├─ bookmarked, notes, rating, quizScore
  │  └─ videoProgress

- user_progress
  ├─ {userId}
  │  ├─ overallStats (timeSpent, skillsCompleted, quizzesCompleted)
  │  ├─ achievements[], lastUpdated

- charting_sessions
  ├─ {sessionId}
  │  ├─ studentId, type (game/practice)
  │  ├─ status, date, opponent, location, result
  │  └─ tags[]

- charting_entries (Legacy)
  ├─ {entryId}
  │  ├─ sessionId, studentId, submittedBy
  │  ├─ preGame, gameOverview
  │  ├─ period1, period2, period3
  │  ├─ overtime, shootout, postGame
  │  └─ additionalComments

- dynamic_charting_entries (New System)
  ├─ {entryId}
  │  ├─ sessionId, studentId
  │  ├─ formTemplateId, formTemplateVersion
  │  ├─ responses (dynamic form data)
  │  ├─ isComplete, completionPercentage
  │  └─ signature

- form_templates
  ├─ {templateId}
  │  ├─ name, description, sport, version
  │  ├─ isActive, isArchived
  │  ├─ sections[] (with fields[])
  │  ├─ allowPartialSubmission
  │  └─ usageCount

- student_videos
  ├─ {videoId}
  │  ├─ userId, studentName, studentEmail
  │  ├─ fileName, fileSize, storagePath, videoUrl
  │  ├─ sport, description
  │  ├─ status (pending/reviewed/feedback_sent)
  │  ├─ coachFeedback, recommendedCourses[]
  │  └─ uploadedAt, reviewedAt, reviewedBy

- messages
  ├─ {messageId}
  │  ├─ fromId, fromName, toId (studentId)
  │  ├─ type (general/instruction/feedback/video_review)
  │  ├─ subject, message
  │  ├─ attachments[] (images, videos, documents)
  │  ├─ isRead, priority
  │  ├─ videoReviewId (if type is video_review)
  │  └─ createdAt, expiresAt

- achievements
  ├─ {achievementId}
  │  ├─ name, description, icon, type
  │  ├─ criteria, points, rarity
  │  └─ isActive, isSecret

- user_achievements
  ├─ {userAchievementId}
  │  ├─ userId, achievementId
  │  ├─ progress, isCompleted, unlockedAt
  │  └─ isNotified

- notifications
  ├─ {notificationId}
  │  ├─ userId, type, title, message, data
  │  ├─ isRead, priority
  │  └─ createdAt, expiresAt
```

---

### 3. **Storage Module**

#### Firebase Storage Structure
```
/storage
  ├─ /users/{userId}
  │  └─ profile-pictures/
  ├─ /sports/{sportId}
  │  └─ images/
  ├─ /skills/{skillId}
  │  ├─ images/
  │  └─ videos/ (if local)
  ├─ /quizzes/{quizId}
  │  ├─ videos/
  │  ├─ thumbnails/
  │  └─ question-media/
  ├─ /student-videos/{userId}
  │  └─ {videoId}/
  └─ /messages/{messageId}
     └─ attachments/
```

#### Storage Features
- Automatic file compression (images)
- CORS configuration for public access
- Security rules for authenticated upload
- File size limits enforcement
- Accepted file formats validation
- Signed URLs for secure access
- CDN distribution for performance

---

### 4. **Messaging Module**

#### Message Types
1. **General**: Standard communication
2. **Instruction**: Training instructions from coach
3. **Feedback**: Performance feedback
4. **Video Review**: Feedback on uploaded videos

#### Message Features
- Rich text formatting
- File attachments (images, videos, documents)
- Read/unread status
- Message priority levels
- Expiration dates
- Message filtering and search
- Notification integration
- Video reference (for video review messages)
- Course recommendations (for video reviews)

---

### 5. **Analytics Module**

#### Analytics Types
1. **User Analytics**: Individual student performance
2. **Platform Analytics**: Overall platform metrics
3. **Content Analytics**: Course and skill engagement
4. **Quiz Analytics**: Quiz performance and drop-offs
5. **Charting Analytics**: Performance tracking metrics

#### Analytics Features
- Real-time calculation
- Caching for performance
- Trend analysis (improving, declining, stable)
- Consistency scores
- Comparative analytics
- Goal tracking
- Strength/weakness identification

---

## Technical Architecture

### Frontend Architecture

#### Framework & Structure
- **Next.js 14** with App Router
- **TypeScript** (strict mode)
- **React Server Components** where applicable
- **Client Components** for interactivity
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons

#### State Management
- **React Context** for global state (Auth, User)
- **Custom Hooks** for data fetching
- **Local State** with useState, useReducer
- **Real-time Updates** with Firestore listeners

#### Key Directories
```
/app
  ├─ /admin              # Admin pages
  ├─ /auth               # Auth pages (login, register)
  ├─ /charting           # Performance charting
  ├─ /dashboard          # Student dashboard
  ├─ /messages           # Messaging
  ├─ /quiz/video         # Video quizzes
  ├─ /sports             # Courses
  └─ /profile            # User profile

/src
  ├─ /components
  │  ├─ /admin           # Admin components
  │  ├─ /auth            # Auth components
  │  ├─ /charting        # Charting components
  │  ├─ /quiz            # Quiz components
  │  └─ /ui              # shadcn/ui components
  ├─ /lib
  │  ├─ /auth            # Auth utilities
  │  ├─ /database        # Database services
  │  │  └─ /services     # Service layer
  │  └─ /utils           # Utility functions
  ├─ /hooks              # Custom React hooks
  └─ /types              # TypeScript definitions
```

---

### Backend Architecture

#### Database (Firestore)
- **NoSQL Document Database**
- **Real-time Listeners** for live updates
- **Optimistic UI Updates** for responsiveness
- **Batch Operations** for efficiency
- **Transactions** for data consistency
- **Offline Support** (PWA capability)

#### Authentication (Firebase Auth)
- **Email/Password** authentication
- **Email Verification** required
- **Custom Claims** for role-based access
- **Token Refresh** automatic
- **Session Management** configurable timeout

#### Storage (Firebase Storage)
- **CDN Distribution** for global access
- **Automatic Backup** by Firebase
- **Security Rules** for access control
- **CORS Configuration** for web access

#### Security Rules
- **Firestore Rules**: Collection-level and document-level rules
- **Storage Rules**: Path-based access control
- **Role-Based Access**: Student vs Admin permissions
- **Ownership Validation**: Users can only access their own data

---

### Service Layer

#### Service Architecture
All database operations go through a service layer for:
- **Abstraction**: Hide Firestore implementation
- **Validation**: Ensure data integrity
- **Error Handling**: Consistent error responses
- **Caching**: Improve performance
- **Type Safety**: TypeScript interfaces
- **Testing**: Easier to mock and test

#### Key Services
1. **authService**: Authentication operations
2. **userService**: User CRUD operations
3. **sportsService**: Sports/course management
4. **skillsService**: Skill management
5. **videoQuizService**: Quiz operations
6. **progressService**: Progress tracking
7. **chartingService**: Charting operations
8. **dynamicChartingService**: Dynamic form charting
9. **formTemplateService**: Template management
10. **dynamicAnalyticsService**: Analytics calculations
11. **messageService**: Messaging operations
12. **videoReviewService**: Video upload and review
13. **analyticsService**: Platform analytics
14. **enrollmentService**: Course enrollments

---

## Data Models

### Core Entities

#### User
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'student' | 'admin';
  profileImage?: string;
  emailVerified: boolean;
  preferences: UserPreferences;
  profile?: UserProfile;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}
```

#### Sport (Course)
```typescript
interface Sport {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTimeToComplete: number; // hours
  skillsCount: number;
  imageUrl?: string;
  tags: string[];
  prerequisites?: string[]; // sport IDs
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  metadata: SportMetadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

#### Skill
```typescript
interface Skill {
  id: string;
  sportId: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedTimeToComplete: number; // minutes
  content?: string; // Rich HTML content
  externalResources: ExternalResource[];
  media?: SkillMedia;
  prerequisites: string[]; // skill IDs
  learningObjectives: string[];
  tags: string[];
  hasVideo: boolean;
  isActive: boolean;
  order: number;
  metadata: SkillMetadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

#### VideoQuiz
```typescript
interface VideoQuiz {
  id: string;
  title: string;
  description?: string;
  sportId: string; // MANDATORY
  skillId: string; // MANDATORY
  videoUrl: string;
  videoDuration: number; // seconds
  thumbnail?: string;
  coverImage?: string;
  instructions?: string;
  questions: VideoQuizQuestion[];
  settings: VideoQuizSettings;
  difficulty: DifficultyLevel;
  estimatedDuration: number; // minutes
  tags: string[];
  isActive: boolean;
  isPublished: boolean;
  category: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  metadata: VideoQuizMetadata;
}
```

#### FormTemplate
```typescript
interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  sport?: string;
  version: number;
  isActive: boolean; // Only one active at a time
  isArchived: boolean;
  sections: FormSection[];
  allowPartialSubmission: boolean;
  requireSignature?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy?: string;
  usageCount?: number;
}
```

#### Message
```typescript
interface Message {
  id: string;
  fromId: string;
  fromName: string;
  toId: string; // studentId
  type: 'general' | 'instruction' | 'feedback' | 'video_review';
  subject: string;
  message: string;
  attachments?: MessageAttachment[];
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  videoReviewId?: string; // if type is video_review
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}
```

---

## Security & Authentication

### Authentication Flow
1. User registers with email/password
2. Email verification sent
3. User verifies email
4. User can now log in
5. Session token generated (Firebase)
6. Token stored in cookie/localStorage
7. Token validated on each request
8. Token auto-refreshes before expiry

### Authorization
- **Role-Based**: Student vs Admin
- **Resource-Based**: Users can only access their own data
- **Route Protection**: Client-side and server-side guards
- **Firestore Rules**: Database-level security
- **Storage Rules**: File access control

### Security Best Practices
- **HTTPS Only**: All traffic encrypted
- **Password Hashing**: Firebase handles securely
- **CSRF Protection**: Built into Firebase
- **XSS Prevention**: React auto-escapes
- **Input Validation**: Client and server-side
- **Rate Limiting**: Prevent abuse
- **Session Timeout**: Configurable
- **Email Verification**: Required for activation

---

## Analytics & Reporting

### Student Analytics
- **Progress Metrics**: Skills completed, time spent, courses enrolled
- **Quiz Performance**: Average scores, attempts, improvement trends
- **Charting Insights**: Performance categories, consistency, strengths/weaknesses
- **Streak Tracking**: Learning consistency, longest streaks
- **Goal Progress**: Achievement unlocking, target progress

### Admin Analytics
- **Platform Overview**: User count, content count, engagement rates
- **User Analytics**: Individual student performance, cohort analysis
- **Content Analytics**: Most popular courses/skills, completion rates
- **Quiz Analytics**: Average scores, drop-off points, question difficulty
- **Charting Analytics**: Field-level statistics, trend analysis
- **System Health**: Performance metrics, error rates, uptime

### Reporting Features
- **Real-Time Dashboards**: Live data updates
- **Historical Trends**: Compare periods
- **Export Options**: CSV, Excel, PDF, JSON
- **Customizable Reports**: Select metrics and date ranges
- **Scheduled Reports**: Automated report generation (future)

---

## Integrations

### Current Integrations
1. **Firebase**:
   - Authentication
   - Firestore Database
   - Storage
   - Hosting (via Vercel)

2. **Vercel**:
   - Hosting & CDN
   - Serverless Functions
   - Automatic Deployments
   - Custom Domain

3. **Anthropic Claude API**:
   - AI-powered chatbot (claude-3-haiku-20240307 model)
   - Context-aware coaching assistance
   - Site-wide availability
   - Cost-optimized model selection

4. **YouTube**:
   - Video embedding
   - Player API integration

### Potential Future Integrations
- **Email Service**: SendGrid, Mailgun for transactional emails
- **Analytics**: Google Analytics, Mixpanel
- **Payment**: Stripe for subscriptions
- **Video Hosting**: Vimeo, Wistia for better video analytics
- **Chat**: Real-time chat for coach-student communication
- **Calendar**: Google Calendar for session scheduling
- **Social Login**: Google, Facebook OAuth
- **Mobile Apps**: React Native apps (iOS, Android)

---

## Deployment & DevOps

### Development Environment
- **Local Development**: npm run dev
- **Environment Variables**: .env.local (git-ignored)
- **Firebase Emulators**: Test locally without production data

### Staging Environment
- **Vercel Preview Deployments**: Automatic for PRs
- **Branch Deployments**: Test specific branches
- **Separate Firebase Project**: Staging database

### Production Environment
- **Vercel Production**: Automatic on main branch merge
- **Custom Domain**: Production domain configured
- **Firebase Production**: Production database and storage
- **Monitoring**: Error tracking, performance monitoring
- **Analytics**: User behavior tracking

### CI/CD Pipeline
1. **Code Push**: Developer pushes to Git
2. **Vercel Build**: Automatic build triggered
3. **Type Check**: TypeScript validation
4. **Linting**: ESLint checks
5. **Build**: Next.js production build
6. **Deploy**: Automatic deployment
7. **Post-Deploy**: Run smoke tests

---

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Monitor bundle size
- **Caching Strategy**: Aggressive caching for static assets
- **Lazy Loading**: Non-critical components loaded on demand
- **Memoization**: React.memo for expensive renders
- **Virtual Scrolling**: For long lists

### Backend Optimization
- **Firestore Indexes**: Optimized for common queries
- **Caching Layer**: Cache frequently accessed data
- **Batch Operations**: Reduce database calls
- **Pagination**: Limit data fetched per request
- **Real-Time Listeners**: Only for critical data
- **CDN**: Firebase Storage with CDN for media

### Database Optimization
- **Denormalization**: Store computed values
- **Composite Indexes**: For complex queries
- **Query Limits**: Prevent excessive data fetching
- **Offline Persistence**: Firestore local cache

---

## Mobile Responsiveness

### Design Approach
- **Mobile-First**: Designed for mobile, enhanced for desktop
- **Responsive Breakpoints**: sm, md, lg, xl, 2xl (Tailwind)
- **Touch-Friendly**: Large tap targets, swipe gestures
- **Adaptive Layouts**: Grid/flexbox for all screen sizes

### Mobile Features
- **PWA Capability**: Installable as app
- **Offline Support**: Basic offline functionality
- **Touch Gestures**: Swipe navigation
- **Mobile Navigation**: Hamburger menu, bottom nav
- **Optimized Forms**: Mobile-friendly inputs
- **Video Playback**: Native mobile video controls

---

## Future Enhancements

### Planned Features
1. **Real-Time Chat**: Live messaging between coaches and students
2. **Live Sessions**: Virtual coaching sessions via video call
3. **Social Features**: Student community, forums, discussions
4. **Advanced Analytics**: AI-powered insights and recommendations
5. **Gamification**: Points, badges, leaderboards
6. **Mobile Apps**: Native iOS and Android apps
7. **Payment Integration**: Subscription plans, course purchases
8. **Content Marketplace**: User-generated content
9. **Multi-Language**: Full internationalization
10. **Accessibility**: WCAG 2.1 AA compliance
11. **API**: Public API for third-party integrations
12. **Webhooks**: Real-time event notifications
13. **Advanced Search**: Elasticsearch integration
14. **Video Hosting**: Self-hosted video platform
15. **Calendar Integration**: Schedule coaching sessions

---

## Conclusion

SportsGoalie (SmarterGoalie) is a **comprehensive, feature-rich sports coaching platform** built with modern web technologies. It provides:

- ✅ **AI-Powered Coaching Assistant** (Claude API) for intelligent, context-aware guidance
- ✅ **Complete Learning Management System** for sports courses
- ✅ **Interactive Video Quizzes** with timestamp-based questions
- ✅ **Dynamic Performance Charting** with customizable form templates
- ✅ **Video Upload & Coach Review** for personalized feedback
- ✅ **Messaging System** for coach-student communication
- ✅ **Comprehensive Analytics** for performance tracking
- ✅ **Admin Tools** for complete platform management
- ✅ **Mobile-Responsive Design** for access anywhere
- ✅ **Secure & Scalable Architecture** using Firebase, Vercel & Anthropic Claude

The platform is **production-ready**, actively deployed, and serving real students and coaches in the hockey goalie training space, with the flexibility to expand to other sports and use cases.

---

**Document Version**: 1.1
**Last Updated**: December 8, 2025
**Compiled By**: Claude (AI Assistant) based on comprehensive codebase analysis
