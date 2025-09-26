/**
 * Admin Setup Script
 * Run this script to set up the first admin user using Firebase Custom Claims
 *
 * Usage:
 * node scripts/setup-admin.js <email> [secret-key]
 */

const readline = require('readline');

async function setupAdmin() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('❌ Usage: node scripts/setup-admin.js <email> [secret-key]');
    console.log('Example: node scripts/setup-admin.js admin@example.com');
    process.exit(1);
  }

  const email = args[0];
  const secretKey = args[1] || process.env.ADMIN_SETUP_SECRET || 'your-secret-key-here';

  console.log('🔧 Setting up admin user...');
  console.log(`📧 Email: ${email}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Get UID from user
  const uid = await new Promise((resolve) => {
    rl.question('🔑 Enter the Firebase UID for this user: ', (answer) => {
      resolve(answer.trim());
    });
  });

  rl.close();

  if (!uid) {
    console.log('❌ UID is required');
    process.exit(1);
  }

  try {
    // Make API call to setup admin
    const response = await fetch('http://localhost:3001/api/admin/setup-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        email,
        secretKey
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Admin setup successful!');
      console.log(`👤 User: ${result.user.email}`);
      console.log(`🆔 UID: ${result.user.uid}`);
      console.log(`👑 Role: ${result.user.role}`);
      console.log('');
      console.log('🔄 The user may need to sign out and sign back in for the changes to take effect.');
    } else {
      console.log('❌ Admin setup failed:', result.error);
      process.exit(1);
    }

  } catch (error) {
    console.log('❌ Error during setup:', error.message);
    process.exit(1);
  }
}

// Check if we're running directly
if (require.main === module) {
  setupAdmin().catch(console.error);
}

module.exports = { setupAdmin };