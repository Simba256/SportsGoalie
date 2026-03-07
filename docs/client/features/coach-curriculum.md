# Coach Curriculum & Content System

**Status:** ✅ Complete (Phase 2.0.6)
**Routes:** `/coach`, `/coach/students`, `/coach/students/[studentId]/curriculum`, `/coach/content`
**Last Updated:** March 7, 2026

## Overview

Coaches can create personalized learning paths for students assigned to them with "custom" workflow type. The system includes a curriculum builder for assigning content, and a complete content creation system for coaches to build their own lessons and quizzes.

## Core Features

### 1. Coach Dashboard
**Route:** `/coach`

**Features:**
- Total students count
- Active curricula count
- Completion rate overview
- Quick access to student list

**Statistics:**
- Students with custom workflow assigned to coach
- Number of active custom curricula
- Average completion percentage
- Recent activity summary

### 2. Student List
**Route:** `/coach/students`

**Features:**
- View all assigned students
- **Workflow filter tabs** (All / Custom / Automated)
- **Student search dialog** to add new students
- See student progress at a glance
- Quick access to curriculum builder
- Student cards with key metrics
- **Evaluation status badges** (Pending / Completed / Reviewed)
- **View Evaluation button** for completed evaluations

**Displayed Information:**
- Student name and email
- Workflow type badge (Custom=purple, Automated=blue)
- Curriculum progress (X/Y items completed)
- Completion percentage with progress bar
- "Manage Curriculum" button (custom workflow)
- "View Evaluation" button (all students)

### 3. Student Evaluation Review
**Route:** `/coach/students/[studentId]/evaluation`

**Features:**
- View student's intelligence profile
- Category scores with 1.0-4.0 scale
- Pacing level recommendation
- Strengths and gaps analysis
- **Collapsible Q&A section** showing all assessment responses
- Question codes, text, answers with color-coded scores
- Level adjustment capability
- Coach notes field

### 4. Curriculum Builder
**Route:** `/coach/students/[studentId]/curriculum`

**Features:**
- Create curriculum for student
- Add lessons and quizzes from content library
- Add custom coach-created content
- Reorder curriculum items
- Lock/unlock items individually or in bulk
- Remove items from curriculum
- View item status (locked/unlocked/in progress/completed)
- Track overall curriculum progress

## Content Selection

### Content Browser
**Status:** ✅ Complete

**Features:**
- Pillar selection dropdown
- Tabbed interface: Lessons vs Quizzes vs My Content
- Real-time search across content
- Difficulty level filtering (Introduction/Development/Refinement)
- Visual content cards with:
  - Pillar icon and color coding
  - Content title and description
  - Difficulty badge
  - Estimated completion time
  - Video indicator (for lessons)
  - Type badge (Lesson/Quiz)
- Selection preview before adding
- Empty states for no results
- Responsive design

**Data Sources:**
- **Lessons:** Skills from pillars catalog (via SportsService)
- **Quizzes:** Video quizzes (via VideoQuizService)
- **Custom Content:** Coach's personal library (via CustomContentService)

## Coach Custom Content Creation

### Content Library
**Route:** `/coach/content`
**Status:** ✅ Complete (March 1-3, 2026)

**Features:**
- Personal library overview
- Statistics: Total content, Lessons, Quizzes, Total views
- Search and filter functionality
- Grid view of content cards
- Quick actions: Edit, Delete
- **Create Content button** → Content type selector

### Lesson Creator
**Route:** `/coach/content/lesson/create`

**Features:**
- Title and description fields
- Pillar and level selection
- **Video upload** with drag-drop (Firebase Storage)
- **YouTube/Vimeo URL support**
- Learning objectives list
- Rich text content area
- Tags for organization
- Preview before save

### Quiz Creator
**Route:** `/coach/content/quiz/create`
**Status:** ✅ Complete with full-page 3-step wizard

**Step 1: Quiz Info**
- Title and description
- Pillar and level selection
- Difficulty level
- Passing score threshold

**Step 2: Video**
- Video upload or URL
- Video preview
- Duration detection (auto for YouTube/Vimeo)

**Step 3: Questions**
- **VideoQuestionBuilder** component
- Supports multiple question types:
  - **Multiple Choice:** 4 options with correct answer
  - **True/False:** Visual toggle buttons (green/red)
  - **Fill in the Blank:** Split input (before/after fields)
- Timestamp linking to video
- Question reordering
- Live preview of questions

### Question Types

**Multiple Choice:**
- 4 answer options
- Single correct answer
- Score points configurable

**True/False:**
- Visual toggle buttons instead of dropdown
- Green (True) / Red (False) color coding
- Clear selection indication

**Fill in the Blank:**
- Split input approach (text before blank, text after blank)
- No manual `___` placement needed
- Live preview shows student view

## Curriculum Item Management

### Item Types
1. **Lesson (Standard):** Skill from pillars catalog
2. **Quiz (Standard):** Video quiz from database
3. **Custom Lesson:** Coach-created lesson (type: `custom_lesson`)
4. **Custom Quiz:** Coach-created quiz (type: `custom_quiz`)

### Item Status
- **Locked:** Not yet accessible to student (gray lock icon)
- **Unlocked:** Available for student to start (blue unlock icon)
- **In Progress:** Student has started (yellow progress icon)
- **Completed:** Student has finished (green check icon)

### Item Sorting
Items are sorted by status priority:
1. Completed (first)
2. In Progress
3. Unlocked
4. Locked (last)

### Operations
1. **Add Item**
   - Open content browser
   - Select pillar
   - Choose lesson, quiz, or custom content
   - Preview details
   - Add to curriculum

2. **Unlock Item**
   - Click unlock button on locked item
   - Item becomes immediately available to student

3. **Unlock All**
   - Bulk unlock button
   - Unlocks all locked items at once

4. **Remove Item**
   - Delete button on each item
   - Confirmation dialog
   - Item removed from curriculum

## Technical Implementation

### Backend Services

**CustomCurriculumService** (`src/lib/database/services/custom-curriculum.service.ts`)

**Methods:**
- `createCurriculum(studentId, coachId, items)` - Create new curriculum
- `getCurriculumByStudent(studentId)` - Get student's curriculum
- `getCurriculaByCoach(coachId)` - Get all coach's curricula
- `addItem(curriculumId, item)` - Add content item
- `removeItem(curriculumId, itemId)` - Remove item
- `unlockItem(curriculumId, itemId)` - Unlock single item
- `unlockAllItems(curriculumId)` - Bulk unlock
- `reorderItems(curriculumId, newOrder)` - Change sequence
- `recordLessonCompletion(curriculumId, itemId)` - Mark lesson complete
- `getProgress(curriculumId)` - Get completion stats
- `toFirestore()` / `fromFirestore()` - Static conversion methods

**CustomContentService** (`src/lib/database/services/custom-content.service.ts`)

**Methods:**
- `createContent(coachId, content)` - Create custom content
- `updateContent(contentId, updates)` - Edit content
- `deleteContent(contentId)` - Remove content
- `getContentByCoach(coachId)` - Coach's library
- `getContentById(contentId)` - Get single content item
- `incrementViewCount(contentId)` - Track usage (non-blocking)
- `toFirestore()` / `fromFirestore()` - Static conversion methods

### Database Schema

**custom_curriculum Collection:**
```typescript
{
  id: string;
  studentId: string;
  coachId: string;
  title: string;
  description?: string;
  items: CustomCurriculumItem[];  // Array inline
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**CustomCurriculumItem:**
```typescript
{
  id: string;
  type: 'lesson' | 'quiz' | 'custom_lesson' | 'custom_quiz';
  contentId: string;  // Reference to content
  pillarId: string;
  levelId: string;
  order: number;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  unlockedAt?: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  score?: number;  // For quizzes
  timeSpent?: number;  // In seconds
}
```

**custom_content_library Collection:**
```typescript
{
  id: string;
  coachId: string;
  type: 'lesson' | 'quiz';
  title: string;
  description: string;
  pillarId: string;
  levelId: string;
  difficulty: 'introduction' | 'development' | 'refinement';
  videoUrl?: string;
  videoQuizId?: string;  // Reference to video_quizzes for custom quizzes
  content?: string;  // For lessons
  objectives?: string[];
  tags?: string[];
  viewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Security Rules

**Firestore Rules:**
```javascript
// Coaches can only access their students' curricula
match /custom_curriculum/{curriculumId} {
  allow read: if isCoachOrAdmin() &&
    (resource.data.coachId == request.auth.uid || isAdmin());
  allow create: if isCoachOrAdmin();
  allow update, delete: if resource.data.coachId == request.auth.uid || isAdmin();
}

// Coaches can manage their own content library
// Public read for students to access assigned content
match /custom_content_library/{contentId} {
  allow read: if true;  // Public read for students
  allow create: if isCoachOrAdmin();
  allow update, delete: if resource.data.coachId == request.auth.uid || isAdmin();
}

// Coach video quizzes stored in video_quizzes collection
match /video_quizzes/{quizId} {
  allow read: if true;
  allow create: if isCoachOrAdmin();
  allow update, delete: if
    (resource.data.source == 'coach' && resource.data.createdBy == request.auth.uid)
    || isAdmin();
}
```

### Client-Side Sorting
- **Decision:** Remove `orderBy` from Firestore queries, sort client-side
- **Rationale:** Avoids composite index requirements for where + orderBy combinations
- **Impact:** Works immediately, acceptable for coach content data sizes

## Student Experience

### Custom Lesson Viewer
**Route:** `/learn/lesson/[id]`

**Features:**
- Video player (YouTube embed or direct URL)
- Learning objectives display
- Lesson content with paragraph formatting
- Tags display
- "Mark Complete" button
- Progress tracking

### Custom Quiz Access
- Custom quizzes use same video quiz player
- Quiz page resolves `content_xxx` IDs to actual `videoQuizId`
- Seamless experience for students

### Dashboard Experience

**Automated Workflow:**
- Full pillar catalog available immediately
- Progress through pillars/skills freely
- No coach involvement needed
- Standard progress tracking

**Custom Workflow:**
- Only see unlocked curriculum items
- Cannot access content not in curriculum
- "Waiting for coach" message for locked items
- Progress tied to curriculum completion
- Shows coach name and contact info

## User Interface

### Component Architecture
- **CoachLayout** - Navigation wrapper for coach routes
- **StudentList** - Grid of student cards with workflow filter
- **StudentSearchDialog** - Modal for finding/adding students
- **CurriculumBuilder** - Main curriculum management interface
- **ContentBrowser** - Modal for content selection (with "My Content" tab)
- **CurriculumItemCard** - Individual item display with actions
- **ContentTypeSelector** - Modal for lesson vs quiz selection
- **LessonCreator** - Full lesson creation form
- **QuizCreator** - 3-step quiz creation wizard
- **VideoUploader** - Drag-drop upload with progress
- **VideoQuestionBuilder** - Question editing component

### Design Patterns
- shadcn/ui components for consistency
- Responsive grid layouts
- Loading states with spinner
- Toast notifications for actions
- Confirmation dialogs for destructive actions
- Status badges with color coding
- Progress bars for visual feedback
- Tab-based navigation for complex forms

## Related Documentation
- [Authentication](./authentication.md)
- [All Routes](../pages/all-routes.md)
- [Key Decisions](../decisions/key-decisions.md)
