# Admin-to-Student Messaging System

**Project**: SportsCoach V3
**Feature**: Admin-to-Student Messaging with Video Review Integration
**Date**: October 2025
**Status**: In Development

---

## Table of Contents
1. [Overview](#overview)
2. [User Stories](#user-stories)
3. [Technical Architecture](#technical-architecture)
4. [Data Models](#data-models)
5. [UI/UX Design](#uiux-design)
6. [Implementation Plan](#implementation-plan)
7. [Security Considerations](#security-considerations)
8. [Testing Strategy](#testing-strategy)

---

## Overview

### Purpose
Enable admins (coaches) to send rich media messages (text, images, videos) to individual students. The system integrates with the existing video review feature, allowing coaches to provide feedback on student-uploaded practice videos while also supporting general messaging.

### Key Features
- ✅ Admin sends messages with text and media attachments
- ✅ Integration with existing video review system
- ✅ Support for images (up to 10MB) and videos (up to 100MB)
- ✅ Student inbox with unread message tracking
- ✅ Notification system integration
- ✅ Message history preservation
- ✅ One-way communication (admin → student only)

### Design Decisions
- **Message Composer**: Full modal (better mobile experience)
- **Student Inbox**: `/messages` route
- **Message Types**: Instruction, Feedback, General, Video Review
- **Attachment Limit**: 3 files per message
- **Communication**: One-way only (no student replies)
- **Message Retention**: Keep all messages permanently

---

## User Stories

### Admin Stories

**Story 1: Video Feedback**
```
As an admin,
I want to review a student's uploaded practice video and send feedback with reference materials,
So that the student can improve their technique with visual guidance.

Acceptance Criteria:
- Can access video review from /admin/video-reviews
- Can watch student video before sending feedback
- Can attach images and videos to feedback message
- Message is linked to the original student video
- Video is marked as "reviewed" after sending feedback
```

**Story 2: General Messaging**
```
As an admin,
I want to send messages to students without them being tied to a video review,
So that I can provide general instructions, encouragement, or updates.

Acceptance Criteria:
- Can send message from user detail page (/admin/users/[id])
- Can select message type (Instruction, Feedback, General)
- Can attach media files
- Can view all sent messages
```

**Story 3: Message History**
```
As an admin,
I want to view all messages I've sent to a specific student,
So that I can track our communication history.

Acceptance Criteria:
- Can view messages in user detail page "Messages" tab
- Can see message status (read/unread)
- Can filter by message type
```

### Student Stories

**Story 4: Receive Video Feedback**
```
As a student,
I want to receive feedback on my practice videos with reference materials,
So that I can see what I'm doing wrong and how to fix it.

Acceptance Criteria:
- Receive notification when coach reviews my video
- Can view my original video alongside coach's feedback
- Can view/download all reference materials
- Message is clearly marked as "Video Feedback"
```

**Story 5: Message Inbox**
```
As a student,
I want to access all messages from my coach in one place,
So that I can reference past instructions and feedback.

Acceptance Criteria:
- Can access messages at /messages
- See unread message count in navigation
- Can filter messages by type
- Can mark messages as read/unread
```

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Admin Interface              Student Interface         │
│  ├─ Message Composer          ├─ Messages Inbox        │
│  ├─ Video Review Page         ├─ Message Detail View   │
│  ├─ User Detail Page          ├─ Media Viewer          │
│  └─ Sent Messages History     └─ Notifications         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                    Service Layer                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  MessageService               StorageService            │
│  ├─ createMessage()           ├─ uploadImage()          │
│  ├─ getMessages()             ├─ uploadVideo()          │
│  ├─ markAsRead()              ├─ uploadDocument()       │
│  └─ deleteMessage()           └─ deleteFile()           │
│                                                          │
│  NotificationService          VideoReviewService        │
│  ├─ createNotification()      ├─ linkFeedback()         │
│  └─ sendAdminMessage()        └─ markAsReviewed()       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│              Backend (Firebase Services)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Firestore Collections        Firebase Storage          │
│  ├─ messages/                 ├─ messages/{id}/         │
│  ├─ notifications/            ├─ videos/{userId}/       │
│  └─ video_reviews/            └─ images/{userId}/       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth (existing)
- **Notifications**: In-app notifications (existing system)

---

## Data Models

### Message Interface

```typescript
interface Message {
  id: string;
  fromUserId: string;        // Admin user ID
  toUserId: string;          // Student user ID
  subject: string;           // Message subject line
  message: string;           // Message body (can be markdown)
  type: MessageType;         // Type of message

  // Video review integration
  relatedVideoUrl?: string;  // Student's original video URL
  relatedVideoId?: string;   // Reference to video_reviews collection

  // Attachments
  attachments: MessageAttachment[];

  // Status
  isRead: boolean;
  readAt?: Timestamp;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type MessageType = 'instruction' | 'feedback' | 'general' | 'video_review';

interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;              // Firebase Storage download URL
  fileName: string;
  fileSize: number;         // Size in bytes
  mimeType: string;         // e.g., 'image/jpeg', 'video/mp4'
  thumbnailUrl?: string;    // For videos
  uploadedAt: Timestamp;
}
```

### Extended VideoReview Interface

```typescript
// Extends existing video_reviews collection
interface VideoReview {
  id: string;
  userId: string;
  videoUrl: string;
  title: string;
  description: string;
  status: 'pending' | 'reviewed' | 'archived';

  // NEW: Link to feedback message
  feedbackMessageId?: string;
  reviewedAt?: Timestamp;
  reviewedBy?: string;       // Admin user ID

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Notification Extension

```typescript
// Add new notification type to existing NotificationType
export type NotificationType =
  | 'progress'
  | 'quiz_result'
  | 'new_content'
  | 'reminder'
  | 'achievement'
  | 'admin_message';  // NEW

// NotificationData extension
interface NotificationData {
  sportId?: string;
  skillId?: string;
  quizId?: string;
  contentId?: string;
  actionUrl?: string;
  achievementId?: string;
  messageId?: string;        // NEW - links to message
  messageType?: MessageType; // NEW - type of message
}
```

---

## UI/UX Design

### Admin Interface

#### 1. User Detail Page - Entry Point
**Location**: `/admin/users/[userId]`

```
┌─────────────────────────────────────────┐
│  ← Back to Users                        │
│                                         │
│  👤 John Smith (Student)                │
│  john@example.com                       │
│                                         │
│  [Edit User] [Send Message] ✉️          │
│                                         │
│  Tabs: Profile | Progress | Messages   │
└─────────────────────────────────────────┘
```

**Features**:
- "Send Message" button prominently displayed
- "Messages" tab shows conversation history
- Context-aware messaging (knows which student)

#### 2. Message Composer Modal
**Component**: `MessageComposer.tsx`

```
┌─────────────────────────────────────────┐
│  Send Message to John Smith         [×]│
├─────────────────────────────────────────┤
│  Message Type: *                        │
│  ○ Instruction  ○ Feedback  ○ General  │
│                                         │
│  Subject: *                             │
│  ┌─────────────────────────────────┐   │
│  │ [Text input]                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Message: *                             │
│  ┌─────────────────────────────────┐   │
│  │ [Textarea - multiline]          │   │
│  │                                  │   │
│  │                                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Attachments:                           │
│  ┌─────────────────────────────────┐   │
│  │ 📎 Drag & drop files here       │   │
│  │    or [Browse Files]             │   │
│  │                                  │   │
│  │  Max 3 files                     │   │
│  │  Images: 10MB (JPG, PNG, GIF)   │   │
│  │  Videos: 100MB (MP4, MOV, AVI)  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Uploaded Files:                        │
│  ┌─────────────────────────────────┐   │
│  │ 📹 demo.mp4 (45MB)          [×] │   │
│  │ [████████████░░] 85%            │   │
│  └─────────────────────────────────┘   │
│                                         │
│     [Cancel]  [Send Message] →          │
└─────────────────────────────────────────┘
```

**Features**:
- Full modal with dark overlay
- File drag-and-drop support
- Upload progress indicators
- File size validation
- Preview thumbnails
- Error handling

#### 3. Video Review Integration
**Location**: `/admin/video-reviews`

```
┌─────────────────────────────────────────┐
│  Video Reviews                          │
├─────────────────────────────────────────┤
│  Pending Reviews (3)                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📹 John Smith                    │   │
│  │ Shooting Form Practice           │   │
│  │ Uploaded: 2h ago                 │   │
│  │                                  │   │
│  │ [▶️ Watch Video]                 │   │
│  │ [Send Feedback] ✉️               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📹 Sarah Johnson                 │   │
│  │ Dribbling Drill                  │   │
│  │ Uploaded: 1d ago                 │   │
│  │                                  │   │
│  │ [▶️ Watch Video]                 │   │
│  │ [Send Feedback] ✉️               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Features**:
- "Send Feedback" button on each video card
- Clicking opens MessageComposer with:
  - Type pre-selected as "Video Review"
  - Video context included
  - Option to mark video as reviewed

#### 4. Video Feedback Modal
**Special variant of MessageComposer**

```
┌─────────────────────────────────────────┐
│  Send Feedback to John Smith        [×]│
├─────────────────────────────────────────┤
│  📹 Reviewing: Shooting Form Practice   │
│  [Video thumbnail/preview]              │
├─────────────────────────────────────────┤
│  Subject: *                             │
│  ┌─────────────────────────────────┐   │
│  │ Feedback on Shooting Form       │   │ (auto-filled)
│  └─────────────────────────────────┘   │
│                                         │
│  Feedback: *                            │
│  ┌─────────────────────────────────┐   │
│  │ [Textarea for feedback]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Reference Materials:                   │
│  ┌─────────────────────────────────┐   │
│  │ 📎 Add images/videos            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ✅ Mark video as reviewed              │
│                                         │
│     [Cancel]  [Send Feedback] →         │
└─────────────────────────────────────────┘
```

**Features**:
- Shows student's video context
- Auto-fills subject line
- Checkbox to mark video as reviewed
- Links message to video review

### Student Interface

#### 1. Navigation Badge
**Location**: Header/Navigation

```
┌─────────────────────────────────────────┐
│  SportsCoach V3         👤 John  [🔔 1] │
├─────────────────────────────────────────┤
│  Dashboard | Sports | Progress | ✉️ (2) │
└─────────────────────────────────────────┘
```

**Features**:
- Red badge shows unread message count
- Separate from general notifications
- Clicking goes to `/messages`

#### 2. Messages Inbox
**Location**: `/messages`

```
┌─────────────────────────────────────────┐
│  ← Dashboard                            │
│                                         │
│  Messages from Your Coach               │
│  You have 2 unread messages             │
├─────────────────────────────────────────┤
│  Filters: [All Types ▼] [Unread ▼] 🔍  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔴 UNREAD                        │   │
│  │ 📹 Video Review: Shooting Form   │   │
│  │ From: Coach Mike • 2h ago        │   │
│  │ Type: Video Feedback • 📎 2      │   │
│  │                                  │   │
│  │ Great effort! Here's what I...   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔴 UNREAD                        │   │
│  │ New Drill Instructions           │   │
│  │ From: Coach Mike • 1d ago        │   │
│  │ Type: Instruction • 📎 1         │   │
│  │                                  │   │
│  │ Try this new drill this week...  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Week 2 Progress                  │   │
│  │ From: Coach Mike • 3d ago        │   │
│  │ Type: General                    │   │
│  │                                  │   │
│  │ You're making great progress...  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Features**:
- Visual distinction for unread messages
- Message type badges
- Attachment count
- Preview text
- Filter options
- Mobile-responsive cards

#### 3. Message Detail View
**Location**: `/messages/[messageId]`

**For Video Feedback Messages:**
```
┌─────────────────────────────────────────┐
│  ← Back to Messages                     │
├─────────────────────────────────────────┤
│  👤 Coach Mike                          │
│  Video Feedback • 2 hours ago           │
│                                         │
│  Feedback on Shooting Form Practice     │
├─────────────────────────────────────────┤
│  YOUR VIDEO:                            │
│  ┌───────────────────────────────┐     │
│  │ 📹 Shooting Form Practice      │     │
│  │ [Video Player - Your Upload]   │     │
│  │ Uploaded: 4 hours ago          │     │
│  └───────────────────────────────┘     │
├─────────────────────────────────────────┤
│  COACH'S FEEDBACK:                      │
│                                         │
│  Great effort! Here's what I noticed:   │
│                                         │
│  1. Your stance is a bit too wide      │
│  2. Follow through needs work           │
│  3. Watch my demo video below           │
│                                         │
│  Keep practicing!                       │
│                                         │
├─────────────────────────────────────────┤
│  REFERENCE MATERIALS (2):               │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────┐     │
│  │ 🖼️ Correct Stance               │     │
│  │ [Image Thumbnail]              │     │
│  │ proper_stance.jpg (2MB)        │     │
│  │                                │     │
│  │ [View Full] [Download]         │     │
│  └───────────────────────────────┘     │
│                                         │
│  ┌───────────────────────────────┐     │
│  │ 📹 Proper Form Demo            │     │
│  │ [Video Player]                 │     │
│  │ demo_form.mp4 (45MB)           │     │
│  │                                │     │
│  │ [Play] [Download]              │     │
│  └───────────────────────────────┘     │
│                                         │
│  [Mark as Unread] [Delete]             │
└─────────────────────────────────────────┘
```

**For General Messages:**
```
┌─────────────────────────────────────────┐
│  ← Back to Messages                     │
├─────────────────────────────────────────┤
│  👤 Coach Mike                          │
│  Instruction • 1 day ago                │
│                                         │
│  New Drill Instructions                 │
├─────────────────────────────────────────┤
│  Hey John,                              │
│                                         │
│  Try this new drill this week:          │
│                                         │
│  [Message content...]                   │
│                                         │
├─────────────────────────────────────────┤
│  ATTACHMENTS (1):                       │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────┐     │
│  │ 📹 Drill Demonstration         │     │
│  │ [Video Player]                 │     │
│  └───────────────────────────────┘     │
│                                         │
│  [Mark as Unread] [Delete]             │
└─────────────────────────────────────────┘
```

**Features**:
- Video feedback messages show student's original video
- All attachments displayed with appropriate viewers
- Download buttons for all media
- Clear visual hierarchy
- Responsive layout

#### 4. Media Viewers

**Image Lightbox:**
```
┌─────────────────────────────────────────┐
│  [×]                               1/2  │
│                                         │
│         [Full-screen Image]             │
│                                         │
│         proper_stance.jpg               │
│                                         │
│  [←]                               [→]  │
│                                         │
│  [Download] [Zoom In] [Zoom Out]       │
└─────────────────────────────────────────┘
```

**Video Player:**
```
┌─────────────────────────────────────────┐
│  [Video Player with Controls]           │
│  ▶️ ⏸ ⏹ ──────●────── 🔊 ⚙️ ⛶         │
│                                         │
│  2:34 / 5:12                            │
│                                         │
│  Drill Demonstration                    │
│  [Download MP4]                         │
└─────────────────────────────────────────┘
```

### Empty States

**No Messages (Student):**
```
┌─────────────────────────────────────────┐
│                                         │
│              ✉️                         │
│                                         │
│         No Messages Yet                 │
│                                         │
│   Your coach hasn't sent you any        │
│   messages yet. Check back later!       │
│                                         │
└─────────────────────────────────────────┘
```

**No Sent Messages (Admin):**
```
┌─────────────────────────────────────────┐
│                                         │
│              📭                         │
│                                         │
│       No Messages Sent                  │
│                                         │
│   You haven't sent any messages to      │
│   your students yet.                    │
│                                         │
│   [Send Your First Message]             │
│                                         │
└─────────────────────────────────────────┘
```

### Responsive Design

**Mobile (< 768px):**
- Full-screen modals
- Stacked cards
- Bottom navigation
- Swipe gestures
- Larger touch targets

**Tablet (768px - 1024px):**
- Two-column layouts
- Side panels
- Grid attachment views

**Desktop (> 1024px):**
- Three-column potential
- Hover states
- Drag-and-drop
- Keyboard shortcuts

---

## Implementation Plan

### Phase 1: Database & Types (1 hour)

**Tasks:**
1. ✅ Create type definitions
   - `src/types/message.ts` - Message, MessageAttachment, MessageType
   - Update `src/types/index.ts` - Add NotificationType enum value
   - Update VideoReview interface

2. ✅ Create MessageService
   - `src/lib/database/services/message.service.ts`
   - Extends BaseDatabaseService
   - Methods: createMessage, getMessages, getUserMessages, markAsRead, deleteMessage

3. ✅ Firestore Security Rules
   - `rules/firestore.rules`
   - Admin can create/read all messages
   - Students can only read their own messages
   - No one can update/delete except specific cases

**Files to Create:**
```
src/types/message.ts
src/lib/database/services/message.service.ts
```

**Files to Modify:**
```
src/types/index.ts
rules/firestore.rules
```

### Phase 2: File Upload Enhancement (1 hour)

**Tasks:**
1. ✅ Extend FirebaseStorageService
   - Add `uploadImage()` method
   - Add `uploadDocument()` method
   - Add image validation (file type, size)
   - Update file size limits

2. ✅ Create MultiFileUpload component
   - `src/components/messages/MultiFileUpload.tsx`
   - Drag-and-drop support
   - Progress tracking
   - File preview
   - Remove file functionality

**Files to Create:**
```
src/components/messages/MultiFileUpload.tsx
```

**Files to Modify:**
```
src/lib/firebase/storage.ts
```

### Phase 3: Admin Interface (3 hours)

**Tasks:**
1. ✅ Create MessageComposer component
   - `src/components/messages/MessageComposer.tsx`
   - Full modal with form
   - File upload integration
   - Form validation
   - Success/error handling

2. ✅ Add to User Detail Page
   - `app/admin/users/[id]/page.tsx`
   - Add "Send Message" button
   - Add "Messages" tab
   - Show conversation history

3. ✅ Integrate with Video Reviews
   - `app/admin/video-reviews/page.tsx`
   - Add "Send Feedback" button to video cards
   - Create video feedback variant of composer
   - Link message to video review

4. ✅ Create Sent Messages Page
   - `app/admin/messages/page.tsx`
   - List all sent messages
   - Filter by student, type, date
   - Show read status

**Files to Create:**
```
src/components/messages/MessageComposer.tsx
src/components/messages/VideoFeedbackComposer.tsx
app/admin/messages/page.tsx
```

**Files to Modify:**
```
app/admin/users/[id]/page.tsx
app/admin/video-reviews/page.tsx
```

### Phase 4: Student Interface (2 hours)

**Tasks:**
1. ✅ Create Messages Inbox
   - `app/messages/page.tsx`
   - List all messages
   - Filter by type, read status
   - Unread indicator
   - Empty state

2. ✅ Create Message Detail View
   - `app/messages/[id]/page.tsx`
   - Display message content
   - Show video context for video feedback
   - Display attachments
   - Mark as read on view

3. ✅ Create Media Viewers
   - `src/components/messages/ImageViewer.tsx` - Lightbox
   - `src/components/messages/VideoPlayer.tsx` - Video player
   - Download functionality

4. ✅ Add Navigation Badge
   - `src/components/layout/header.tsx`
   - Show unread message count
   - Link to `/messages`

**Files to Create:**
```
app/messages/page.tsx
app/messages/[id]/page.tsx
src/components/messages/ImageViewer.tsx
src/components/messages/VideoPlayer.tsx
src/components/messages/MessageCard.tsx
```

**Files to Modify:**
```
src/components/layout/header.tsx
```

### Phase 5: Notifications Integration (1 hour)

**Tasks:**
1. ✅ Extend NotificationType
   - Add 'admin_message' to enum
   - Update NotificationData interface

2. ✅ Create notification on message send
   - In MessageService.createMessage()
   - Call userService.createNotification()
   - Include messageId and actionUrl

3. ✅ Link notification to message
   - Update notification click handler
   - Navigate to message detail page

**Files to Modify:**
```
src/types/index.ts
src/lib/database/services/message.service.ts
```

### Phase 6: Testing & Polish (1 hour)

**Tasks:**
1. ✅ Test video feedback flow
   - Upload video as student
   - Send feedback as admin
   - View feedback as student

2. ✅ Test general messages
   - Send message from user detail page
   - Receive and view as student

3. ✅ Test file uploads
   - Images (various formats, sizes)
   - Videos (various formats, sizes)
   - Multiple files
   - Error cases (too large, wrong type)

4. ✅ Mobile testing
   - Responsive layouts
   - Touch interactions
   - File upload on mobile

5. ✅ Error handling
   - Network errors
   - Upload failures
   - Invalid data

**Testing Checklist:**
- [ ] Admin can send video feedback
- [ ] Admin can send general message
- [ ] Student receives notification
- [ ] Student can view messages
- [ ] Student can view attachments
- [ ] File upload works (images)
- [ ] File upload works (videos)
- [ ] File size validation works
- [ ] Unread count updates correctly
- [ ] Mark as read works
- [ ] Mobile responsive
- [ ] Error states display correctly

---

## Security Considerations

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Messages collection
    match /messages/{messageId} {
      // Admin can create and read all messages
      allow create: if isAdmin();
      allow read: if isAdmin() || isOwner(resource.data.toUserId);

      // Only recipient can mark as read
      allow update: if isOwner(resource.data.toUserId) &&
                       request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['isRead', 'readAt', 'updatedAt']);

      // No one can delete messages
      allow delete: if false;
    }

    // Video reviews - extend existing rules
    match /video_reviews/{reviewId} {
      // ... existing rules ...

      // Admin can update to add feedbackMessageId
      allow update: if isAdmin() &&
                       request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['feedbackMessageId', 'reviewedAt', 'reviewedBy', 'status', 'updatedAt']);
    }
  }
}
```

### Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Message attachments - only admins can upload
    match /messages/{messageId}/{filename} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() &&
                      request.resource.size < 100 * 1024 * 1024 && // 100MB max
                      (request.resource.contentType.matches('image/.*') ||
                       request.resource.contentType.matches('video/.*') ||
                       request.resource.contentType == 'application/pdf');
      allow delete: if isAdmin();
    }

    // Student video uploads - existing rules
    match /videos/{userId}/{filename} {
      // ... existing rules ...
    }
  }
}
```

### Input Validation

**Client-side (TypeScript):**
```typescript
// File validation
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_ATTACHMENTS = 3;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

function validateFile(file: File): { valid: boolean; error?: string } {
  // Type validation
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) &&
      !ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }

  // Size validation
  const maxSize = ALLOWED_IMAGE_TYPES.includes(file.type)
    ? MAX_IMAGE_SIZE
    : MAX_VIDEO_SIZE;

  if (file.size > maxSize) {
    return { valid: false, error: `File too large (max ${maxSize / (1024 * 1024)}MB)` };
  }

  return { valid: true };
}
```

**Server-side (Firestore Rules):**
```javascript
// Message data validation
function isValidMessage() {
  let data = request.resource.data;
  return data.fromUserId is string &&
         data.toUserId is string &&
         data.subject is string &&
         data.subject.size() > 0 &&
         data.subject.size() <= 200 &&
         data.message is string &&
         data.message.size() > 0 &&
         data.message.size() <= 10000 &&
         data.type in ['instruction', 'feedback', 'general', 'video_review'] &&
         data.attachments is list &&
         data.attachments.size() <= 3 &&
         data.isRead == false;
}
```

### XSS Prevention

- All user input sanitized before display
- Use React's built-in XSS protection
- No `dangerouslySetInnerHTML` for user content
- Markdown rendering with sanitization library

### Authentication

- All API calls require authenticated user
- Role-based access control (admin vs student)
- Firebase Auth tokens validated on every request
- Session timeout configured

---

## Testing Strategy

### Unit Tests

**MessageService Tests:**
```typescript
describe('MessageService', () => {
  test('createMessage creates message with attachments', async () => {
    // Test message creation
  });

  test('getMessages filters by userId', async () => {
    // Test query filtering
  });

  test('markAsRead updates read status', async () => {
    // Test status update
  });
});
```

**File Upload Tests:**
```typescript
describe('FirebaseStorageService', () => {
  test('uploadImage validates file type', async () => {
    // Test image validation
  });

  test('uploadImage validates file size', async () => {
    // Test size validation
  });

  test('uploadVideo handles large files', async () => {
    // Test progress tracking
  });
});
```

### Integration Tests (Playwright)

**Video Feedback Flow:**
```typescript
test('admin can send video feedback', async ({ page }) => {
  // Login as admin
  await page.goto('/login');
  await loginAsAdmin(page);

  // Navigate to video reviews
  await page.goto('/admin/video-reviews');

  // Click "Send Feedback" on first video
  await page.click('[data-testid="send-feedback-btn"]');

  // Fill feedback form
  await page.fill('[data-testid="message-textarea"]', 'Great work!');

  // Upload attachment
  await page.setInputFiles('[data-testid="file-input"]', 'test-image.jpg');

  // Wait for upload
  await page.waitForSelector('[data-testid="upload-complete"]');

  // Send message
  await page.click('[data-testid="send-btn"]');

  // Verify success
  await expect(page.locator('.toast-success')).toBeVisible();
});
```

**Student Receives Message:**
```typescript
test('student can view video feedback', async ({ page }) => {
  // Login as student
  await page.goto('/login');
  await loginAsStudent(page);

  // Check notification badge
  await expect(page.locator('[data-testid="message-badge"]')).toHaveText('1');

  // Navigate to messages
  await page.goto('/messages');

  // Click first message
  await page.click('[data-testid="message-card"]:first-child');

  // Verify video feedback content
  await expect(page.locator('[data-testid="student-video"]')).toBeVisible();
  await expect(page.locator('[data-testid="coach-feedback"]')).toContainText('Great work!');
  await expect(page.locator('[data-testid="attachment"]')).toBeVisible();
});
```

### Manual Testing Checklist

**Admin Workflows:**
- [ ] Send video feedback from video review page
- [ ] Send general message from user detail page
- [ ] Upload multiple attachments (images + videos)
- [ ] View sent message history
- [ ] Filter messages by type
- [ ] Handle upload errors gracefully

**Student Workflows:**
- [ ] Receive notification for new message
- [ ] View unread badge in navigation
- [ ] Open messages inbox
- [ ] Filter messages by type/status
- [ ] View video feedback with original video
- [ ] View general message with attachments
- [ ] Download attachments
- [ ] Mark message as read/unread

**Error Scenarios:**
- [ ] File too large (shows error)
- [ ] Invalid file type (shows error)
- [ ] Network error during upload (retryable)
- [ ] Network error during send (shows error)
- [ ] Empty state displays correctly

**Responsive Testing:**
- [ ] Mobile (iPhone 13 Pro)
- [ ] Tablet (iPad Air)
- [ ] Desktop (1920x1080)
- [ ] Touch interactions work
- [ ] Keyboard navigation works

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Load messages in batches (pagination)
   - Lazy load images (use `loading="lazy"`)
   - Code split message components

2. **Caching**
   - Cache message list in React state
   - Use SWR or React Query for data fetching
   - Cache Firebase Storage URLs (they expire after some time)

3. **Image Optimization**
   - Generate thumbnails for images
   - Use Next.js Image component for optimization
   - Compress images before upload

4. **Video Handling**
   - Use video thumbnails in lists
   - Lazy load video players
   - Stream videos (don't download entire file)

5. **Firestore Queries**
   - Index on frequently queried fields
   - Limit query results (pagination)
   - Use composite indexes for complex queries

### Firestore Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "toUserId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "toUserId", "order": "ASCENDING" },
        { "fieldPath": "isRead", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "toUserId", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Rich Text Editor**
   - Formatting (bold, italic, lists)
   - Markdown support
   - Emoji picker

2. **Message Templates**
   - Admin can create reusable templates
   - Quick send common messages
   - Variable substitution (student name, etc.)

3. **Bulk Messaging**
   - Send to multiple students
   - Send to all students in a sport
   - Group messaging

4. **Read Receipts**
   - Track when student viewed message
   - Show "seen at" timestamp
   - Notification when message is read

5. **Student Replies**
   - Two-way messaging
   - Threaded conversations
   - Real-time chat

6. **Search**
   - Search message history
   - Filter by date range
   - Full-text search

7. **Analytics**
   - Message engagement metrics
   - Average response time
   - Most common message types

8. **Export**
   - Export conversation history
   - PDF generation
   - Email transcript

---

## Maintenance & Monitoring

### Monitoring

**Metrics to Track:**
- Message send success rate
- Upload failure rate
- Average upload time
- Message read rate
- Active messaging users

**Error Tracking:**
- Failed uploads
- Failed message sends
- Client-side errors
- Storage quota issues

### Maintenance Tasks

**Daily:**
- Monitor error logs
- Check upload success rates

**Weekly:**
- Review message statistics
- Check storage usage
- Verify Firestore query performance

**Monthly:**
- Audit security rules
- Review user feedback
- Plan feature enhancements

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code review completed
- [ ] Security rules tested
- [ ] Environment variables configured
- [ ] Firebase Storage CORS configured
- [ ] Firestore indexes created
- [ ] Error tracking set up

### Deployment Steps

1. Deploy Firestore security rules
2. Deploy Storage security rules
3. Create Firestore indexes
4. Deploy Next.js application
5. Verify production environment
6. Monitor for errors
7. Send announcement to users

### Post-Deployment

- [ ] Verify messaging works in production
- [ ] Test file uploads in production
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Gather user feedback

---

## Appendix

### File Size Limits

| File Type | Max Size | Formats Supported |
|-----------|----------|-------------------|
| Images | 10MB | JPG, PNG, GIF, WebP |
| Videos | 100MB | MP4, MOV, AVI, WebM |
| Documents | 10MB | PDF (future) |

### Message Types

| Type | Description | Use Case |
|------|-------------|----------|
| Instruction | Training instructions | New drills, techniques |
| Feedback | Performance feedback | Video review feedback |
| General | General communication | Updates, encouragement |
| Video Review | Video-specific feedback | Linked to student video |

### Component Hierarchy

```
Admin Interface:
- AdminUserDetailPage
  └─ MessageComposer
     └─ MultiFileUpload

- AdminVideoReviewsPage
  └─ VideoFeedbackComposer
     └─ MultiFileUpload

- AdminMessagesPage
  └─ MessageList
     └─ MessageCard

Student Interface:
- MessagesInboxPage
  └─ MessageList
     └─ MessageCard

- MessageDetailPage
  └─ MessageContent
     ├─ VideoContext (if video feedback)
     ├─ MessageBody
     └─ AttachmentList
        ├─ ImageViewer
        └─ VideoPlayer
```

---

**Document Version**: 1.0
**Last Updated**: October 2025
**Status**: Ready for Implementation
**Approved By**: [Pending]

---

## Quick Links

- [Project README](../README.md)
- [CLAUDE.md - Development Guidelines](../CLAUDE.md)
- [Testing Guide](./TESTING.md)
- [Deployment Guide](./DEPLOYMENT.md)
