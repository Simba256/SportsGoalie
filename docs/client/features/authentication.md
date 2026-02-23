# Authentication System

**Status:** ✅ Complete (Phase 1 & Phase 2.0.1)
**Last Updated:** February 22, 2026

## Overview

Multi-role authentication system built on Firebase Auth with custom user profiles and role-based access control.

## Supported Roles

### 1. Student
- **Purpose:** Primary learners using the platform
- **Workflow Types:**
  - **Automated:** Self-paced learning through sports/skills catalog
  - **Custom:** Coach-guided personalized curriculum
- **Features:**
  - Progress tracking
  - Quiz taking
  - Session charting
  - Achievement system
  - Goal setting
- **Student ID:** Automatically generated (Format: SG-XXXX-XXXX)

### 2. Coach
- **Purpose:** Guide and manage student learning
- **Access Method:** Invitation-only (admin sends invites)
- **Features:**
  - Student management
  - Custom curriculum creation
  - Progress monitoring
  - Content library management
  - Performance analytics
- **Registration:** Via email invitation with token

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
  - Content management
  - System configuration
  - Coach invitation system
  - Analytics dashboard

## Registration Flow

### Student/Parent Registration
1. Navigate to `/auth/register`
2. Select role (Student or Parent)
3. **If Student:**
   - Choose workflow type (automated or custom)
   - Provide email, password, name
   - Receive auto-generated student ID
4. **If Parent:**
   - Provide email, password, name
   - Link children using student IDs
5. Email verification (optional)
6. Redirect to dashboard

### Coach Registration
1. Admin sends invitation email via `/admin/coaches`
2. Coach receives email with unique token
3. Coach clicks invitation link → `/auth/accept-invite?token=xxx`
4. Validates token (7-day expiry)
5. Coach creates account with email and password
6. Account marked as "coach" role
7. Redirect to coach dashboard

### Admin Creation
- Manual creation by existing admins only
- No public registration available
- Created via admin user management interface

## Student ID System

### Generation
- **Format:** SG-XXXX-XXXX
- **Character Set:** Uppercase letters + numbers (excluding confusing: 0, O, I, 1, L)
- **Uniqueness:** Crypto-random with collision checking
- **Entropy:** 32^8 = 1.1 trillion combinations

### Usage
- **Sharing:** Can be shared verbally or written
- **Parent Linking:** Parents use ID to link children
- **Coach Assignment:** (Future) Coaches may reference student IDs
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

2. **Email Sent** (Currently Dev Mode)
   - Invitation email with link
   - Token embedded in URL
   - Expiry date included
   - Currently logs to console (production email pending)

3. **Coach Accepts**
   - Clicks invitation link
   - Token validated (not expired/revoked/accepted)
   - Creates account with provided email
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
- **Email Verification:** Optional but recommended

### Access Control
- **Role-Based:** Different dashboards and features per role
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

- **InvitationService** (Firestore)
  - Token generation
  - Invitation CRUD operations
  - Email sending (prepared infrastructure)
  - Status tracking

- **UserService** (`src/lib/database/services/user.service.ts`)
  - User profile management
  - Role updates
  - Student ID generation
  - User deactivation

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
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  - Redirect to role-specific dashboard

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
6. Access student dashboard immediately

### Coach Journey
1. Receive invitation email from admin
2. Click invitation link
3. Validate token
4. Create account
5. Access coach dashboard
6. View assigned students (when implemented)

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
```

### Invitation Settings
- **Token Length:** 32 characters
- **Expiry Duration:** 7 days
- **Resend Limit:** Unlimited (creates new token)
- **Email Service:** Development mode (console logging)

## Future Enhancements

### Planned
- Production email service integration (SendGrid/AWS SES)
- Social authentication (Google, Microsoft)
- Two-factor authentication (2FA)
- Password complexity requirements
- Account recovery options
- Login history tracking

### Under Consideration
- Phone number verification
- Biometric authentication (mobile)
- Single sign-on (SSO) for organizations
- Magic link authentication
- OAuth integration

## Related Documentation
- [User Management](../technical/user-management.md)
- [Security Model](../technical/security-model.md)
- [Admin Routes](../pages/admin-routes.md)
- [Coach Features](./coach-curriculum.md)
