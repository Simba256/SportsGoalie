#!/usr/bin/env node

/**
 * Deploy development-friendly Firebase security rules
 * This allows public read access to sports and skills for development
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require('/media/basim/New Volume1/Basim/Saad Bhai/Chamelion Ideas/SportsCoach/sportscoach-2a84d-firebase-adminsdk-fbsvc-fd58b490c7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'sportscoach-2a84d'
});

async function deployDevRules() {
  try {
    console.log('🔧 Deploying development-friendly Firebase rules...');

    // Read the development rules file
    const rulesPath = path.join(__dirname, '..', 'firestore-dev.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    console.log('📋 Rules content loaded from firestore-dev.rules');

    // Use Firebase Admin to update rules
    const securityRules = admin.securityRules();

    // Get the current ruleset
    const rulesets = await securityRules.listRulesetMetadata();
    console.log(`📊 Found ${rulesets.length} existing rulesets`);

    // Create new ruleset with development rules
    const newRuleset = await securityRules.createRuleset({
      source: [{
        name: 'firestore.rules',
        content: rulesContent
      }]
    });

    console.log(`✅ Created new ruleset: ${newRuleset.name}`);

    // Release the new ruleset to Firestore
    const release = await securityRules.createRelease({
      name: 'projects/sportscoach-2a84d/releases/cloud.firestore',
      rulesetName: newRuleset.name
    });

    console.log(`🚀 Deployed rules successfully: ${release.name}`);
    console.log('🎉 Development rules are now active!');
    console.log('📝 Sports and skills collections now allow public read access');

  } catch (error) {
    console.error('❌ Error deploying rules:', error);
    process.exit(1);
  }
}

deployDevRules();