# Testing Credentials & Test Accounts

This document contains all test accounts and credentials used for testing the SportsCoach V3 authentication system.

## 🔐 Test Accounts Overview

### Verified Admin Account
- **Email**: `syedbasimmehmood@gmail.com`
- **Password**: `password`
- **Role**: Admin
- **Status**: Email verified
- **Usage**: Testing admin dashboard access, admin-only features
- **Expected Behavior**: Should redirect to `/admin` after login

### Verified Student Account
- **Email**: `syedbasimmehmood1@gmail.com`
- **Password**: `password`
- **Role**: Student
- **Status**: Email verified
- **Usage**: Testing student dashboard access, regular user features
- **Expected Behavior**: Should redirect to `/dashboard` after login

### Unverified Test Accounts

#### Account 1 (Created during testing)
- **Email**: `testuser@example.com`
- **Password**: `Password123`
- **Role**: Student
- **Status**: Email NOT verified
- **Usage**: Testing email verification error handling
- **Expected Behavior**: Should show email verification required message

#### Account 2 (Created during refactoring)
- **Email**: `unverified.test@example.com`
- **Password**: `TestPass123`
- **Role**: Student
- **Status**: Email NOT verified
- **Usage**: Testing unverified user login attempts
- **Expected Behavior**: Should show specific error message and block login

## 🧪 Test Scenarios

### Authentication Flow Tests

#### Login Tests
1. **Verified Admin Login**
   - Use: `syedbasimmehmood@gmail.com` / `password`
   - Expected: Redirect to `/admin`

2. **Verified Student Login**
   - Use: `syedbasimmehmood1@gmail.com` / `password`
   - Expected: Redirect to `/dashboard`

3. **Unverified User Login**
   - Use: `testuser@example.com` / `Password123`
   - Expected: Error message "Email verification required. Please check your inbox..."

4. **Invalid Credentials**
   - Use: `invalid@email.com` / `wrongpassword`
   - Expected: Error message "Invalid email or password..."

#### Registration Tests
1. **New Account Creation**
   - Use unique email like `test.new.user@example.com`
   - Expected: Success message + email verification sent

2. **Duplicate Email Registration**
   - Use: `syedbasimmehmood@gmail.com`
   - Expected: Error message "An account with this email already exists..."

#### Error Handling Tests
1. **Network Errors**: Disconnect internet during login
2. **Firebase Errors**: Test with invalid Firebase config
3. **Console Security**: Verify no sensitive errors exposed in console

### Role-Based Access Tests

#### Admin Routes
- `/admin` - Should be accessible only to admin users
- `/dashboard` - Should redirect admin to `/admin`

#### Student Routes
- `/dashboard` - Should be accessible to verified students
- `/admin` - Should redirect students to `/dashboard`

#### Protected Routes
- Any protected route when not logged in should redirect to `/auth/login`

### Security Tests

#### Email Verification
- Unverified users should not be able to login
- Console should not expose Firebase permission errors
- Error messages should be user-friendly, not technical

#### Session Management
- Logout should clear all authentication state
- Page refresh should maintain authentication state
- Browser back/forward should work correctly

## 🔍 Testing Checklist

### Pre-Test Setup
- [ ] Firebase emulator running (if using local testing)
- [ ] Development server running (`npm run dev`)
- [ ] Clear browser cache and cookies
- [ ] Open browser console for error monitoring

### Authentication Tests
- [ ] Admin login and redirect to `/admin`
- [ ] Student login and redirect to `/dashboard`
- [ ] Unverified user login blocked with proper error
- [ ] Invalid credentials show appropriate error
- [ ] Registration creates account and sends verification email
- [ ] Duplicate email registration shows error

### Error Handling Tests
- [ ] No Firebase errors exposed in console
- [ ] User-friendly error messages displayed
- [ ] Error states don't break the UI
- [ ] Error recovery works (can retry after error)

### Navigation Tests
- [ ] Role-based redirects work correctly
- [ ] Protected routes require authentication
- [ ] Logout clears state and redirects to login
- [ ] Browser refresh maintains authentication state

### Security Tests
- [ ] Unverified users cannot access protected routes
- [ ] Direct URL access to admin routes blocked for students
- [ ] Console errors don't expose sensitive information
- [ ] Authentication state properly managed

## 🐛 Known Issues & Expected Behaviors

### Email Verification
- Test accounts with `@example.com` will not receive real verification emails
- Verification status can be manually updated in Firebase Console if needed

### Firebase Errors
- Some Firebase errors might appear in development mode - this is expected
- Production should have cleaner error handling

### Rate Limiting
- Firebase may temporarily block repeated failed login attempts
- Wait a few minutes if encountering rate limiting

## 📝 Test Results Template

```
Date: [DATE]
Tester: [NAME]
Environment: [Development/Staging/Production]

Authentication Tests:
- Admin Login: ✅/❌
- Student Login: ✅/❌
- Unverified Login: ✅/❌
- Invalid Credentials: ✅/❌
- Registration: ✅/❌

Error Handling:
- Console Security: ✅/❌
- User-Friendly Messages: ✅/❌
- Error Recovery: ✅/❌

Navigation:
- Role Redirects: ✅/❌
- Protected Routes: ✅/❌
- Logout: ✅/❌

Notes:
[Any additional observations or issues found]
```

## 🔧 Debugging Tips

### If Login Fails
1. Check browser console for errors
2. Verify Firebase configuration
3. Confirm account exists in Firebase Auth
4. Check if account is email verified

### If Redirects Don't Work
1. Check user role in Firebase Firestore
2. Verify protected route components are working
3. Check browser network tab for failed requests

### If Errors Are Exposed
1. Check error handling in auth context
2. Verify error boundary is working
3. Review error logging configuration

---

**Important**: Keep this document updated as new test accounts are created or existing ones are modified during development and testing.