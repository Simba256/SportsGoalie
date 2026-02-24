# Deployment & Access Guide

## Live Production Site

**URL:** https://sports-goalie.vercel.app/

The SportsGoalie platform is deployed and accessible 24/7 at the URL above.

## Platform Access

### For Administrators

**Admin Dashboard:** https://sports-goalie.vercel.app/admin

From the admin dashboard, you can:
- Manage all users and roles
- Invite and manage coaches
- Oversee all curriculum content
- Access system analytics
- Use the Project Assistant chatbot
- Configure platform settings

**Quick Links for Admins:**
- User Management: https://sports-goalie.vercel.app/admin/users
- Coach Invitations: https://sports-goalie.vercel.app/admin/coaches
- Curriculum Oversight: https://sports-goalie.vercel.app/coach
- Project Assistant: https://sports-goalie.vercel.app/admin/project-assistant
- Sports Management: https://sports-goalie.vercel.app/admin/sports
- Quiz Management: https://sports-goalie.vercel.app/admin/quizzes

### For Coaches

**Coach Dashboard:** https://sports-goalie.vercel.app/coach

Coaches can:
- View all assigned students
- Create custom curricula
- Track student progress
- Manage learning content
- Browse content library

**Quick Links for Coaches:**
- Student List: https://sports-goalie.vercel.app/coach/students
- Build Curriculum: https://sports-goalie.vercel.app/coach/students/[studentId]/curriculum

### For Students

**Student Dashboard:** https://sports-goalie.vercel.app/dashboard

Students can:
- Access learning content
- Track their progress
- Complete quizzes and lessons
- View achievements
- Chart game sessions (goalies)

**Quick Links for Students:**
- Progress: https://sports-goalie.vercel.app/progress
- Sports Catalog: https://sports-goalie.vercel.app/sports
- Achievements: https://sports-goalie.vercel.app/achievements
- Charting: https://sports-goalie.vercel.app/charting
- Profile: https://sports-goalie.vercel.app/profile

### For Parents (Coming Soon)

**Parent Dashboard:** https://sports-goalie.vercel.app/parent (Phase 2.0.4)

Parents will be able to:
- Monitor children's progress
- View learning activities
- Track achievements
- Communicate with coaches

## Getting Started

### First Time Access

1. **Visit the Site:** https://sports-goalie.vercel.app/
2. **Login or Register:**
   - Existing users: https://sports-goalie.vercel.app/auth/login
   - New students/parents: https://sports-goalie.vercel.app/auth/register
   - Coaches: Accept invitation email link
   - Admins: Contact system administrator

### Role-Based Registration

**Students & Parents:**
- Can register directly at the registration page
- Choose role during signup
- Students receive automatic student ID (SG-XXXX-XXXX)
- Email verification required

**Coaches:**
- Must be invited by an administrator
- Receive email invitation with secure link
- Accept invitation at https://sports-goalie.vercel.app/auth/accept-invite?token=[token]
- Create account with pre-filled information

**Administrators:**
- Cannot self-register (security feature)
- Must be promoted by existing administrator
- Contact support for admin access

## Navigation Guide

### Finding Specific Features

Use these direct links to navigate to any feature:

**User Management:**
- All Users: https://sports-goalie.vercel.app/admin/users
- Specific User: https://sports-goalie.vercel.app/admin/users/[userId]

**Coach Features:**
- Invite Coaches: https://sports-goalie.vercel.app/admin/coaches
- Coach Dashboard: https://sports-goalie.vercel.app/coach
- View Students: https://sports-goalie.vercel.app/coach/students
- Build Curriculum: https://sports-goalie.vercel.app/coach/students/[studentId]/curriculum

**Content Management:**
- Sports: https://sports-goalie.vercel.app/admin/sports
- Skills: https://sports-goalie.vercel.app/admin/sports/[sportId]/skills
- Quizzes: https://sports-goalie.vercel.app/admin/quizzes

**Student Features:**
- Dashboard: https://sports-goalie.vercel.app/dashboard
- Browse Sports: https://sports-goalie.vercel.app/sports
- Progress: https://sports-goalie.vercel.app/progress
- Charting: https://sports-goalie.vercel.app/charting

**Help & Support:**
- Project Assistant: https://sports-goalie.vercel.app/admin/project-assistant (admin only)

### URL Parameters

Some pages require specific IDs in the URL:

- **[userId]** - User's unique identifier
- **[studentId]** - Student's unique identifier
- **[sportId]** - Sport identifier (e.g., "ice-hockey")
- **[skillId]** - Skill identifier
- **[quizId]** - Quiz identifier
- **[sessionId]** - Charting session identifier

**Example:**
To view a specific student's curriculum:
`https://sports-goalie.vercel.app/coach/students/abc123xyz/curriculum`

## Deployment Details

### Platform
- **Hosting:** Vercel
- **SSL:** Automatic HTTPS (secure)
- **CDN:** Global edge network
- **Uptime:** 99.9% target

### Performance
- **Page Load:** < 2 seconds average
- **API Response:** < 500ms average
- **Global Access:** Low latency worldwide
- **Auto-Scaling:** Handles traffic spikes automatically

### Updates & Deployments
- **Deployment:** Automatic from Git repository
- **Zero Downtime:** Seamless updates
- **Rollback:** Instant if issues detected
- **Monitoring:** 24/7 uptime monitoring

### Security
- **HTTPS:** All traffic encrypted
- **Authentication:** Firebase Auth
- **Database:** Firestore with security rules
- **Rate Limiting:** Protection against abuse
- **Session Management:** Secure token-based

## Browser Requirements

### Supported Browsers
- ✅ Chrome (recommended) - Latest version
- ✅ Firefox - Latest version
- ✅ Safari - Latest version
- ✅ Edge - Latest version

### Mobile Support
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Mobile-responsive design
- ✅ Touch-optimized interface

## Troubleshooting Access

### Can't Access Site
1. Check URL is exactly: https://sports-goalie.vercel.app/
2. Clear browser cache and cookies
3. Try incognito/private browsing mode
4. Check internet connection
5. Try different browser

### Login Issues
1. Verify email and password are correct
2. Check email verification status
3. Try password reset: https://sports-goalie.vercel.app/auth/reset-password
4. Clear browser data and try again

### Permission Errors
1. Verify your user role is correct
2. Check with administrator if role needs updating
3. Log out and log back in
4. Clear browser cache

### Page Not Loading
1. Check URL is correct and complete
2. Verify you have necessary permissions for that page
3. Try refreshing the page (Ctrl+R or Cmd+R)
4. Check browser console for errors (F12)

## Support & Assistance

### For Quick Answers
Use the **Project Assistant** chatbot at:
https://sports-goalie.vercel.app/admin/project-assistant

The assistant can:
- Answer questions about features
- Guide you to specific pages
- Explain how systems work
- Provide route information
- Help with navigation

### For Technical Issues
Contact the system administrator or use the Project Assistant for guidance.

## Important URLs Summary

**Main Access Points:**
- **Home:** https://sports-goalie.vercel.app/
- **Login:** https://sports-goalie.vercel.app/auth/login
- **Register:** https://sports-goalie.vercel.app/auth/register

**Dashboards:**
- **Admin:** https://sports-goalie.vercel.app/admin
- **Coach:** https://sports-goalie.vercel.app/coach
- **Student:** https://sports-goalie.vercel.app/dashboard
- **Parent:** https://sports-goalie.vercel.app/parent (coming soon)

**Key Features:**
- **Project Assistant:** https://sports-goalie.vercel.app/admin/project-assistant
- **User Management:** https://sports-goalie.vercel.app/admin/users
- **Coach Invitations:** https://sports-goalie.vercel.app/admin/coaches
- **Curriculum Builder:** https://sports-goalie.vercel.app/coach/students/[studentId]/curriculum
- **Sports Catalog:** https://sports-goalie.vercel.app/sports
- **Progress Tracking:** https://sports-goalie.vercel.app/progress

---

**Remember:** All routes start with https://sports-goalie.vercel.app/

For any questions about accessing or navigating the platform, use the Project Assistant at https://sports-goalie.vercel.app/admin/project-assistant
