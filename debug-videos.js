#!/usr/bin/env node

// Debug script to check student_videos collection directly
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (if we can access service account)
async function debugVideos() {
  try {
    console.log('🔍 Starting debug script to check student_videos...');

    // Try to initialize with application default credentials
    const app = initializeApp({
      projectId: 'sportscoach-2a84d'
    });

    const db = getFirestore(app);

    console.log('📊 Connected to Firestore, checking student_videos collection...');

    // Get all documents in student_videos collection
    const videosSnapshot = await db.collection('student_videos').get();

    console.log(`📹 Found ${videosSnapshot.size} documents in student_videos collection:`);

    videosSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- Video ID: ${doc.id}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Student: ${data.studentName} (${data.studentEmail})`);
      console.log(`  File: ${data.fileName}`);
      console.log(`  Uploaded: ${data.uploadedAt?.toDate?.() || data.uploadedAt}`);
      console.log(`  ---`);
    });

    // Now test the specific query that the admin page uses
    console.log('\n🔍 Testing admin query with status filter...');
    const adminQuery = await db.collection('student_videos')
      .where('status', 'in', ['pending', 'reviewed', 'feedback_sent'])
      .get();

    console.log(`📊 Admin query returned ${adminQuery.size} videos`);

    adminQuery.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.fileName} (Status: ${data.status})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

debugVideos();