# Authentication System

**Status:** ✅ Complete (Phase 1, 2.0, 2.2)
**Last Updated:** March 7, 2026

## Overview

Multi-role authentication system built on Firebase Auth with custom user profiles, role-based access control, intelligence-based onboarding, and email verification infrastructure.

## Supported Roles

### 1. Student
- **Purpose:** Primary learners using the platform
- **Workflow Types:**
  - **Automated:** Self-paced learning through pillars catalog
  - **Custom:** Coach-guided personalized curriculum
- **Features:**
  - Intelligence-based onboarding evaluation
  - Pillar-based progress tracking
  - Quiz taking
  - Session charting
  - Achievement system
  - Goal setting
- **Student ID:** Automatically generated (Format: SG-XXXX-XXXX)
- **Onboarding:** Required 28-question assessment before dashboard access

### 2. Coach
- **Purpose:** Guide and manage student learning
- **Access Method:** Invitation-only (admin sends invites)
- **Features:**
  - Student management with search/add
  - Custom curriculum creation
  - Custom content creation (lessons + quizzes)
  - Progress monitoring
  - Evaluation review with Q&A details
  - Content library management
- **Registration:** Via email invitation with token (email verification skipped)

### 3. Parent
- **Purpose:** Monitor children's progress
- **Access Method:** Public registration with student ID linking
- **Features:**
  - View children's progress
  - Access performance reports
  - Message system
  - Session review
- **Linking:** Uses student ID to connect to children

### 4. Admin
- **Purpose:** Full platform management
- **Access Method:** Manual creation only (not available in public registration)
- **Features:**
  - User management
  - Content management (6 pillars, skills, quizzes)
  - System configuration
  - Coach invitation system
  - Analytics dashboard
  - AI project assistant

## Registration Flow

### Student/Parent Registration
1. Navigate to `/auth/register`
2. Select role (Student or Parent)
3. **If Student:**
   - Choose workflow type (automated or custom)
   - Provide email, password, name
   - Receive auto-generated student ID
   - **Redirect to onboarding evaluation** (28 questions)
4. **If Parent:**
   - Provide email, password, name
   - Link children using student IDs
5. Email verification (optional via Resend)
6. Redirect to dashboard

### Coach Registration
1. Admin sends invitation email via `/admin/coaches`
2. Coach receives email with unique token
3. Coach clicks invitation link → `/auth/accept-invite?token=xxx`
4. Validates token (7-day expiry)
5. Coach creates account with email and password
6. **Email verification skipped** (clicking invitation link = verification)
7. Account marked as "coach" role
8. Redirect to coach dashboard

### Admin Creation
- Manual creation by existing admins only
- No public registration available
- Created via admin user management interface

## Student Onboarding System

### Onboarding Guard
- Students without completed onboarding are redirected to `/onboarding`
- Login page checks `onboardingCompleted` flag for students
- Dashboard inaccessible until evaluation complete
- Prevents "flash" of dashboard before redirect

### Onboarding Evaluation
- **28 questions** across 7 assessment categories
- **Immersive UI:** Full-screen dark theme
- **Auto-save:** Progress saved after each question
- **Resume capability:** Can continue where left off
- **Question types:** Rating scales, multiple choice, true/false

### Intelligence Profile Scoring
- **1.0-4.0 continuous scale** (not discrete levels)
- **7 categories per role** (goalie/parent/coach have different categories)
- **Weighted calculation** based on category importance
- **Gap/strength analysis** identifies areas needing work
- **Pacing levels:** Introduction (<2.2), Development (2.2-3.1), Refinement (>3.1)

### Onboarding Phases
1. **Welcome** - Introduction to the assessment
2. **Intake** - Background questions (age, experience, goals)
3. **Bridge** - Transition message
4. **Category Intro** - Introduction to each assessment category
5. **Questions** - 28 assessment questions
6. **Profile** - Intelligence profile generation
7. **Complete** - Redirect to dashboard

### Coach Evaluation Review
- View student's intelligence profile at `/coach/students/[id]/evaluation`
- See all scores per category
- Collapsible Q&A section shows individual responses
- Color-coded score badges (green ≥3.1, blue 2.2-3.1, amber <2.2)
- Ability to adjust recommended level

## Student ID System

### Generation
- **Format:** SG-XXXX-XXXX
- **Character Set:** Uppercase letters + numbers (excluding confusing: 0, O, I, 1, L)
- **Uniqueness:** Crypto-random with collision checking
- **Entropy:** 32^8 = 1.1 trillion combinations

### Usage
- **Sharing:** Can be shared verbally or written
- **Parent Linking:** Parents use ID to link children
- **Coach Reference:** Coaches may reference student IDs
- **Privacy:** No personally identifiable information in ID

### Security
- Possession of ID implies legitimate access (like school ID systems)
- No approval workflow needed for parent linking
- IDs cannot be changed after creation

## Coach Invitation System

### Token Management
- **Format:** 32-character crypto-random string
- **Character Set:** URL-safe (alphanumeric)
- **Expiry:** 7 days default (configurable)
- **Uniqueness:** One active invitation per email

### Invitation Flow
1. **Admin Creates Invitation**
   - Provides coach email and optional name
   - System generates unique token
   - Checks for existing pending invitations
   - Creates invitation record in Firestore

2. **Email Sent**
   - Invitation email with link
   - Token embedded in URL
   - Expiry date included
   - Development mode: logs to console
   - Production: Resend integration ready

3. **Coach Accepts**
   - Clicks invitation link
   - Token validated (not expired/revoked/accepted)
   - Creates account with provided email
   - **Email verification skipped** (clicking link = verification)
   - Token marked as "accepted"
   - Coach account activated

4. **Admin Management**
   - View all invitations
   - Resend invitation emails
   - Revoke pending invitations
   - Track invitation status

### Invitation Statuses
- **Pending:** Sent, awaiting acceptance
- **Accepted:** Coach registered successfully
- **Expired:** 7+ days old, no longer valid
- **Revoked:** Manually canceled by admin

## Email Infrastructure

### Resend Integration
- **Package:** `resend` npm package installed
- **API Endpoint:** `/api/auth/send-verification`
- **Templates:** Branded "Smarter Goalie" verification emails
- **Status:** Code ready, using Firebase built-in for now (no custom domain)

### Email Templates
- Goalie emoji logo
- Blue gradient header
- "Smarter Goalie" branding
- Verification link with token
- Clean, mobile-friendly design

### Configuration
```env
RESEND_API_KEY=xxx          # Resend API key
RESEND_FROM_EMAIL=xxx       # Sender email (requires verified domain)
```

## Security Features

### Registration Security
- **Public Access:** Student and Parent roles only
- **Restricted Roles:** Coach and Admin excluded from public registration
- **Prevents:** Unauthorized admin/coach account creation
- **Validation:** Email format, password strength, role restrictions

### Authentication
- **Firebase Auth:** Industry-standard authentication
- **Session Management:** Automatic token refresh
- **Password Requirements:** Minimum 8 characters, mixed case recommended
- **Email Verification:** Optional (Resend ready for production)

### Dual Email Verification Check
- Login checks both Firebase Auth `emailVerified` AND Firestore `emailVerified`
- Supports both regular verification and invitation-based verification
- Invited coaches have `emailVerified: true` in Firestore (skipped verification)

### Access Control
- **Role-Based:** Different dashboards and features per role
- **Onboarding Guard:** Students must complete evaluation first
- **Route Protection:** Middleware checks authentication and role
- **API Security:** All endpoints validate user session and permissions
- **Firestore Rules:** Database-level security rules per collection

## Technical Implementation

### Services
- **AuthService** (`src/lib/auth/auth-service.ts`)
  - User registration with role and workflow type
  - Login/logout operations
  - Password reset
  - Session management
  - Default preferences creation

- **OnboardingService** (`src/lib/database/services/onboarding.service.ts`)
  - Evaluation CRUD operations
  - Progress tracking
  - Intelligence profile calculation
  - Coach review updates

- **InvitationService** (Firestore)
  - Token generation
  - Invitation CRUD operations
  - Email sending (Resend ready)
  - Status tracking

- **UserService** (`src/lib/database/services/user.service.ts`)
  - User profile management
  - Role updates
  - Student ID generation
  - Onboarding flag management

### Database Schema

**users Collection:**
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'coach' | 'parent' | 'admin';
  studentId?: string;  // For students only
  workflowType?: 'automated' | 'custom';  // For students only
  assignedCoachId?: string;  // For custom workflow students
  onboardingCompleted: boolean;  // Onboarding gate
  onboardingCompletedAt?: Timestamp;
  initialPacingLevel?: string;  // introduction/development/refinement
  emailVerified: boolean;  // Dual verification support
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**onboarding_evaluations Collection:**
```typescript
{
  id: string;  // eval_{userId}
  userId: string;
  status: 'in_progress' | 'completed' | 'reviewed';
  currentCategoryIndex: number;
  currentQuestionIndex: number;
  intakeResponses: IntakeResponse[];
  assessmentResponses: AssessmentResponse[];  // 28 questions
  intelligenceProfile?: {
    categoryScores: { [category: string]: number };  // 1.0-4.0
    overallScore: number;
    pacingLevel: 'introduction' | 'development' | 'refinement';
    strengths: string[];
    gaps: string[];
  };
  coachReview?: {
    reviewedAt: Timestamp;
    reviewedBy: string;
    adjustedLevel?: string;
    notes?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}
```

**coach_invitations Collection:**
```typescript
{
  id: string;
  email: string;
  coachName?: string;
  token: string;  // 32-char crypto-random
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: Timestamp;  // 7 days from creation
  createdBy: string;  // Admin uid
  acceptedBy?: string;  // Coach uid after acceptance
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
  revokedAt?: Timestamp;
}
```

## UI Components

### Registration Page
- **Location:** `/app/auth/register/page.tsx`
- **Features:**
  - Role selection dropdown (Student/Parent only)
  - Workflow type selection (Students only)
  - Email/password form with validation
  - Real-time error display
  - Loading states

### Login Page
- **Location:** `/app/auth/login/page.tsx`
- **Features:**
  - Email/password login
  - "Forgot password" link
  - Error handling
  - Onboarding check for students
  - Redirect to role-specific dashboard

### Onboarding Flow
- **Location:** `/app/onboarding/page.tsx`
- **Components:**
  - WelcomeScreen - Introduction
  - IntakeScreen - Background questions
  - BridgeMessage - Transition messages
  - CategoryIntro - Category introductions
  - AssessmentQuestion - Individual questions
  - IntelligenceProfileView - Results display
  - OnboardingProgress - Progress indicator

### Invitation Acceptance Page
- **Location:** `/app/auth/accept-invite/page.tsx`
- **Features:**
  - Token validation
  - Coach registration form
  - Expiry checking
  - Error states for invalid tokens

### Admin Invitation Management
- **Location:** `/app/admin/coaches/page.tsx`
- **Features:**
  - Create invitation form
  - Invitation list with status
  - Resend invitation button
  - Revoke invitation button
  - Status badges

## User Experience

### Student Journey
1. Visit registration page
2. Select "Student" role
3. Choose workflow (automated or custom)
4. Complete registration
5. Receive student ID on profile
6. **Complete 28-question onboarding evaluation**
7. View intelligence profile
8. Access student dashboard

### Coach Journey
1. Receive invitation email from admin
2. Click invitation link
3. Validate token
4. Create account (no email verification needed)
5. Access coach dashboard
6. View and manage assigned students

### Parent Journey
1. Register as parent
2. Receive confirmation
3. Navigate to profile
4. Link children using student IDs
5. Access parent dashboard
6. View children's progress

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
RESEND_API_KEY=xxx          # Optional: for branded emails
RESEND_FROM_EMAIL=xxx       # Optional: requires verified domain
```

### Invitation Settings
- **Token Length:** 32 characters
- **Expiry Duration:** 7 days
- **Resend Limit:** Unlimited (creates new token)
- **Email Service:** Resend ready, Firebase built-in for now

## Related Documentation
- [Coach Curriculum](./coach-curriculum.md)
- [All Routes](../pages/all-routes.md)
- [Key Decisions](../decisions/key-decisions.md)
