# Firebase Security Rules Deployment Guide

## Overview
The dynamic charting system requires new Firestore security rules to be deployed to Firebase. This guide walks you through the deployment process.

## New Collections Added

The following collections now have security rules:

1. **`form_templates`** - Dynamic form template definitions
2. **`dynamic_charting_entries`** - Student responses to dynamic forms
3. **`dynamic_charting_analytics`** - Auto-generated analytics data

## Deployment Methods

### Method 1: Firebase Console (Recommended for Quick Deploy)

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Firestore Rules**
   - Click "Firestore Database" in the left sidebar
   - Click on the "Rules" tab

3. **Copy New Rules**
   - Open `firestore.rules` in your project
   - Copy the entire contents

4. **Paste and Publish**
   - Paste the rules into the Firebase Console editor
   - Click "Publish" button
   - Confirm the deployment

5. **Verify**
   - Rules should now be active
   - Check the timestamp to confirm deployment

### Method 2: Firebase CLI (Recommended for Production)

#### Prerequisites
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login
```

#### Deploy Rules
```bash
# From your project root directory
firebase deploy --only firestore:rules

# Or deploy everything (hosting, functions, rules)
firebase deploy
```

#### Verify Deployment
```bash
# Check deployment status
firebase deploy --only firestore:rules --dry-run
```

## Security Rules Summary

### Form Templates (`form_templates`)
- **Read**: Anyone can read active, non-archived templates
- **List**: Authenticated users can list templates
- **Create/Update/Delete**: Only admins

### Dynamic Charting Entries (`dynamic_charting_entries`)
- **Read**: Students can read their own entries, admins can read all
- **Create**: Students can create their own entries, admins can create for anyone
- **Update**: Students can update their own entries, admins can update all
- **Delete**: Students can delete their own entries, admins can delete all

### Dynamic Charting Analytics (`dynamic_charting_analytics`)
- **Read**: Students can read their own analytics, admins can read all
- **Create/Update**: System/admins can create and update
- **Delete**: Only admins

## Testing Rules Locally (Optional)

### Using Firebase Emulator
```bash
# Start Firestore emulator with rules
firebase emulators:start --only firestore

# In another terminal, run your tests
npm test

# Or test rules directly
firebase emulators:exec --only firestore "npm test"
```

### Rules Playground
1. Go to Firebase Console → Firestore → Rules tab
2. Click "Rules Playground" button
3. Test specific operations:
   - Collection: `form_templates`
   - Document ID: `test-template-123`
   - Operation: `get`
   - Authentication: Select a test user

## Common Issues

### Issue: "Permission Denied" errors in app

**Cause**: Rules not deployed or incorrectly configured

**Solution**:
```bash
# Verify rules are deployed
firebase deploy --only firestore:rules

# Check Firebase Console for any syntax errors
# Ensure user has proper authentication token with role claim
```

### Issue: Rules deployment fails

**Cause**: Syntax error in rules file

**Solution**:
```bash
# Test rules syntax
firebase deploy --only firestore:rules --dry-run

# Check for errors in output
# Fix any syntax issues in firestore.rules
```

### Issue: Students can't access their own data

**Cause**: User doesn't have proper role in custom claims

**Solution**:
1. Check user's custom claims in Firebase Auth
2. Ensure `role` claim is set to 'student' or 'admin'
3. User may need to log out and log back in after claim update

## Verification Checklist

After deploying, verify the following:

- [ ] Admin can initialize templates at `/admin/form-templates`
- [ ] Template initialization creates documents in `form_templates`
- [ ] Students can view active templates (when implemented)
- [ ] Students can create their own charting entries
- [ ] Students cannot access other students' entries
- [ ] Admins can access all entries
- [ ] Analytics are created for students
- [ ] Students can view their own analytics
- [ ] No "permission denied" errors in console

## Production Deployment Checklist

Before deploying to production:

- [ ] Test rules in Firebase emulator locally
- [ ] Verify all required fields are validated
- [ ] Test with both student and admin accounts
- [ ] Backup existing rules (Firebase Console keeps history)
- [ ] Deploy during low-traffic period
- [ ] Monitor error logs after deployment
- [ ] Have rollback plan ready (previous rules version)

## Rollback Process

If you need to rollback rules:

### Via Firebase Console
1. Go to Firestore → Rules tab
2. Click "Version history"
3. Find previous working version
4. Click "Restore this version"
5. Publish

### Via Firebase CLI
```bash
# Deploy previous version from git
git checkout <previous-commit>
firebase deploy --only firestore:rules
git checkout main  # or your current branch
```

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Testing Guide](https://firebase.google.com/docs/rules/unit-tests)
- [Custom Claims Documentation](https://firebase.google.com/docs/auth/admin/custom-claims)

## Support

If you encounter issues:
1. Check Firebase Console error logs
2. Verify user authentication and custom claims
3. Test with Firebase Rules Playground
4. Review `firestore.rules` for syntax errors
5. Check application logs for permission errors

---

**Note**: Always test rules changes in a development environment before deploying to production!
