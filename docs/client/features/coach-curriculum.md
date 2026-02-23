# Coach Curriculum Builder

**Status:** ✅ MVP Complete (Phase 2.0.6)
**Routes:** `/coach`, `/coach/students`, `/coach/students/[studentId]/curriculum`
**Implemented:** February 23, 2026

## Overview

Coaches can create personalized learning paths for students assigned to them with "custom" workflow type. The curriculum builder allows coaches to select content, sequence learning, unlock items progressively, and track student progress.

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
- Filter by workflow type (custom only)
- See student progress at a glance
- Quick access to curriculum builder
- Student cards with key metrics

**Displayed Information:**
- Student name and email
- Workflow type badge
- Curriculum progress (X/Y items completed)
- Completion percentage with progress bar
- "Manage Curriculum" button

### 3. Curriculum Builder
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
**Status:** ✅ Complete (Feb 23, 2026)

**Features:**
- Sport/pillar selection dropdown
- Tabbed interface: Lessons vs Quizzes
- Real-time search across content
- Difficulty level filtering (beginner/intermediate/advanced)
- Visual content cards with:
  - Sport icon and color coding
  - Content title and description
  - Difficulty badge
  - Estimated completion time
  - Video indicator (for lessons)
  - Type badge (Lesson/Quiz)
- Selection preview before adding
- Empty states for no results
- Responsive design

**Data Sources:**
- **Lessons:** Skills from sports catalog (via SportsService)
- **Quizzes:** Video quizzes (via VideoQuizService)
- **Sports:** All available sports with metadata

### Custom Content
**Status:** Backend complete, UI pending

**Planned Features:**
- Create custom lessons with rich text
- Upload attachments (PDFs, images, videos)
- Create custom quizzes
- Save to personal content library
- Share content with other coaches (optional)
- Clone content from library

## Curriculum Item Management

### Item Types
1. **Lesson (Standard):** Skill from sports catalog
2. **Quiz (Standard):** Video quiz from database
3. **Custom Lesson:** Coach-created lesson
4. **Custom Quiz:** Coach-created quiz

### Item Status
- **Locked:** Not yet accessible to student (gray lock icon)
- **Unlocked:** Available for student to start (blue unlock icon)
- **In Progress:** Student has started (yellow progress icon)
- **Completed:** Student has finished (green check icon)

### Operations
1. **Add Item**
   - Open content browser
   - Select sport/pillar
   - Choose lesson or quiz
   - Preview details
   - Add to curriculum

2. **Unlock Item**
   - Click unlock button on locked item
   - Item becomes immediately available to student
   - Student receives notification (future)

3. **Unlock All**
   - Bulk unlock button
   - Unlocks all locked items at once
   - Useful for "open access" approach

4. **Remove Item**
   - Delete button on each item
   - Confirmation dialog
   - Item removed from curriculum
   - Student loses access immediately

5. **Reorder Items** (Future)
   - Drag-and-drop interface
   - Change learning sequence
   - Update order numbers

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
- `markItemComplete(curriculumId, itemId)` - Student completes item
- `getProgress(curriculumId)` - Get completion stats
- `getNextItem(curriculumId)` - Get next unlocked item

**CustomContentService** (`src/lib/database/services/custom-content.service.ts`)

**Methods:**
- `createContent(coachId, content)` - Create custom content
- `updateContent(contentId, updates)` - Edit content
- `deleteContent(contentId)` - Remove content
- `getContentByCoach(coachId)` - Coach's library
- `getSharedContent()` - Public/shared content
- `uploadAttachment(file)` - Upload to Firebase Storage
- `cloneContent(contentId, newCoachId)` - Copy to own library
- `trackUsage(contentId, studentId)` - Record usage
- `getUsageStats(contentId)` - View analytics

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
  contentId?: string;  // Reference to standard content
  customContent?: CustomContent;  // Inline custom content
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
  content: string;  // HTML or markdown
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  isShared: boolean;
  usageCount: number;
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
match /custom_content_library/{contentId} {
  allow read: if resource.data.isShared == true ||
    resource.data.coachId == request.auth.uid || isAdmin();
  allow create: if isCoachOrAdmin();
  allow update, delete: if resource.data.coachId == request.auth.uid || isAdmin();
}
```

## Workflow Integration

### ProgressService Integration

**Workflow-Aware Methods:**
- `canAccessContent(userId, contentId)` - Checks if student can access based on workflow
  - **Automated:** All content available immediately
  - **Custom:** Only unlocked curriculum items accessible
- `notifyCoachOfCompletion(studentId, itemId)` - Notify coach when student completes item
- `recordQuizCompletion(userId, quizId, score)` - Auto-unlock next item for automated, notify coach for custom

### Student Experience

**Automated Workflow:**
- Full catalog available immediately
- Progress through sports/skills freely
- No coach involvement needed
- Standard progress tracking

**Custom Workflow:**
- Only see unlocked curriculum items
- Cannot access content not in curriculum
- "Waiting for coach" message for locked items
- Progress tied to curriculum completion

## User Interface

### Component Architecture
- **CoachLayout** - Navigation wrapper for coach routes
- **StudentList** - Grid of student cards
- **CurriculumBuilder** - Main curriculum management interface
- **ContentBrowser** - Modal for content selection (500+ lines)
- **CurriculumItemCard** - Individual item display with actions

### Design Patterns
- shadcn/ui components for consistency
- Responsive grid layouts
- Loading states with spinner
- Toast notifications for actions
- Confirmation dialogs for destructive actions
- Status badges with color coding
- Progress bars for visual feedback

## Current Limitations

1. **Content Browser:** Shows actual lessons and quizzes from database (Complete as of Feb 23)
2. **Custom Content UI:** Backend ready, rich editor UI pending
3. **Reordering:** Drag-and-drop not yet implemented
4. **Notifications:** Student alerts for unlocked items pending
5. **Templates:** Curriculum templates not yet available
6. **Sharing:** Coach content sharing UI pending

## Upcoming Enhancements

### Short-term
1. **Student Curriculum View** - Display assigned items in student dashboard
2. **Notification System** - Alert students when content unlocked
3. **Custom Content Editor** - Rich text editor for coaches
4. **Drag-and-Drop Reordering** - Intuitive item sequencing

### Medium-term
1. **Curriculum Templates** - Quick-start curriculum sets
2. **Content Sharing** - Coach-to-coach content sharing
3. **Feedback System** - Coach notes on student items
4. **Analytics** - Curriculum effectiveness metrics

### Long-term
1. **AI Recommendations** - Suggest content based on student performance
2. **Adaptive Paths** - Auto-adjust difficulty
3. **Group Curricula** - Assign same curriculum to multiple students
4. **Version Control** - Track curriculum changes over time

## Usage Statistics (as of Feb 24, 2026)

- **Coaches with Access:** Admin + Coach roles
- **Students Eligible:** Students with "custom" workflow type
- **Curricula Created:** TBD (newly launched)
- **Content Items Added:** TBD
- **Completion Rate:** TBD

## Related Documentation
- [Student Workflow Types](../technical/workflow-types.md)
- [Custom Content System](../technical/custom-content.md)
- [Coach Routes](../pages/coach-routes.md)
- [Progress Tracking](./progress-tracking.md)
