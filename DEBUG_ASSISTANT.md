# Debugging Project Assistant

## Common Issues & Solutions

### 1. API Key Not Found
**Error:** `ANTHROPIC_API_KEY is not defined`
**Solution:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add `ANTHROPIC_API_KEY` with your key value
- Redeploy

### 2. Authentication Error (401)
**Error:** `Unauthorized - No valid token provided` or `Unauthorized - Invalid token`
**Solution:**
- Make sure you're logged in as an admin user
- Check that your Firebase session hasn't expired (try logging out and back in)
- Verify the user document in Firestore has `role: "admin"`

### 3. Forbidden Error (403)
**Error:** `Forbidden - Admin access required`
**Solution:**
- Your account exists but doesn't have admin role
- Go to Firestore → users collection → find your user document
- Set `role` field to `"admin"`

### 4. Module Not Found
**Error:** `Module not found: Can't resolve '@/lib/firebase/config'`
**Solution:**
- This was fixed in the code
- Make sure you deployed the latest version
- Check Vercel deployment logs to confirm latest commit was deployed

### 5. Anthropic API Error
**Error:** `AI service error` or Anthropic-specific errors
**Solution:**
- Verify API key is valid: https://console.anthropic.com/settings/keys
- Check Anthropic API status: https://status.anthropic.com/
- Verify you have credits/billing set up

## Testing Checklist

- [ ] Logged in as admin user
- [ ] Can access /admin dashboard
- [ ] Can see "Project Assistant" card
- [ ] /admin/project-assistant page loads
- [ ] No errors in browser console
- [ ] Network tab shows request to /api/admin/chat
- [ ] Response is not 401/403/500

## Browser Console Commands

Test authentication:
```javascript
// Check if user is logged in
firebase.auth().currentUser

// Get auth token
firebase.auth().currentUser.getIdToken().then(token => console.log(token))
```

Test API directly:
```javascript
// Get auth token first
const token = await firebase.auth().currentUser.getIdToken();

// Call API
fetch('/api/admin/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    messages: [{role: 'user', content: 'Hello'}]
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## Vercel Deployment Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to Deployments tab
4. Click on latest deployment
5. Check "Building" and "Functions" logs
6. Look for any errors

## Environment Variables in Vercel

Required variables:
- ✅ `ANTHROPIC_API_KEY` - For AI chatbot
- ✅ `FIREBASE_ADMIN_PROJECT_ID` - For auth
- ✅ `FIREBASE_ADMIN_CLIENT_EMAIL` - For auth
- ✅ `FIREBASE_ADMIN_PRIVATE_KEY` - For auth
- ✅ All `NEXT_PUBLIC_FIREBASE_*` variables

## Common Solutions

### Solution 1: Redeploy
Sometimes environment variables don't take effect until redeployment:
```bash
git commit --allow-empty -m "redeploy"
git push
```

### Solution 2: Check Admin Role
In Firestore Console:
1. Navigate to `users` collection
2. Find your user document (by email or UID)
3. Verify `role` field is set to `"admin"`
4. If not, edit and save

### Solution 3: Clear Browser Cache
- Hard reload: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Or clear site data in DevTools → Application → Clear Storage

## Need More Help?

1. Copy error message from browser console
2. Check Vercel function logs
3. Verify environment variables are set
4. Try the debug commands above
