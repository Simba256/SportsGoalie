// Quick admin user creation script
// Run this in browser console to create an admin user document

async function createAdminUser() {
  console.log('👑 Creating admin user...');

  try {
    // Get current user from Firebase Auth
    const user = firebase.auth().currentUser;

    if (!user) {
      console.error('❌ No user signed in. Please sign in first.');
      return;
    }

    console.log(`🔍 Current user: ${user.email} (${user.uid})`);

    // Create admin user document in Firestore
    const adminUserDoc = {
      id: user.uid,
      email: user.email,
      displayName: user.displayName || 'Admin User',
      role: 'admin', // IMPORTANT: Make this user admin
      emailVerified: true,
      preferences: {
        notifications: true,
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        emailNotifications: {
          progress: true,
          quizResults: true,
          newContent: true,
          reminders: true
        }
      },
      profile: {
        firstName: user.displayName?.split(' ')[0] || 'Admin',
        lastName: user.displayName?.split(' ')[1] || 'User',
        sportsInterests: [],
        experienceLevel: 'beginner',
        goals: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    };

    // Use Firebase service to add the document
    await window.firebaseService.updateDocument('users', user.uid, adminUserDoc);
    console.log('✅ Created/updated admin user document in Firestore');

    // Refresh the page to pick up the new role
    console.log('🔄 Refreshing page to apply admin role...');
    window.location.reload();

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Instructions
console.log(`
👑 Admin User Creation Script

Steps to fix your auth issue:

1. Go to Firebase Console > Authentication
2. Delete the problematic user (if you can't sign in/up)
3. Sign up with a new email in your app
4. Come back to browser console and run: createAdminUser()
5. Page will refresh and you'll have admin access

Or if you can sign in:
1. Sign in with your existing account
2. Run: createAdminUser()
3. You'll become an admin user

Then you can create sports, skills, and quizzes!
`);

// Quick function to test if we have admin access
function checkAdminAccess() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.log('❌ Not signed in');
    return;
  }

  console.log(`🔍 Checking access for: ${user.email}`);

  // Try to access admin route
  fetch('/admin/sports')
    .then(response => {
      if (response.ok) {
        console.log('✅ Admin access confirmed!');
      } else {
        console.log('❌ No admin access');
      }
    })
    .catch(error => {
      console.log('❌ Error checking admin access:', error);
    });
}

// Export functions for use
window.createAdminUser = createAdminUser;
window.checkAdminAccess = checkAdminAccess;