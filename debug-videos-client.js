#!/usr/bin/env node

// Debug script using client SDK (like the app does)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { readFileSync } from 'fs';

async function debugVideos() {
  try {
    console.log('🔍 Starting client-side debug script...');

    // Read Firebase config from environment
    const envContent = readFileSync('.env.local', 'utf8');
    const config = {};

    envContent.split('\n').forEach(line => {
      if (line.includes('NEXT_PUBLIC_FIREBASE_')) {
        const [key, value] = line.split('=');
        const configKey = key.replace('NEXT_PUBLIC_FIREBASE_', '').toLowerCase();
        config[configKey] = value.replace(/"/g, '');
      }
    });

    console.log('📊 Firebase config:', config);

    // Initialize Firebase
    const app = initializeApp({
      apiKey: config.api_key,
      authDomain: config.auth_domain,
      projectId: config.project_id,
      storageBucket: config.storage_bucket,
      messagingSenderId: config.messaging_sender_id,
      appId: config.app_id
    });

    const db = getFirestore(app);

    console.log('📊 Connected to Firestore, checking student_videos collection...');

    // Get all documents in student_videos collection
    const videosCollection = collection(db, 'student_videos');
    const allVideosSnapshot = await getDocs(videosCollection);

    console.log(`📹 Found ${allVideosSnapshot.size} documents in student_videos collection:`);

    allVideosSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- Video ID: ${doc.id}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Student: ${data.studentName} (${data.studentEmail})`);
      console.log(`  File: ${data.fileName}`);
      console.log(`  Uploaded: ${data.uploadedAt}`);
      console.log(`  ---`);
    });

    // Now test the specific query that the admin page uses
    console.log('\n🔍 Testing admin query with status filter...');
    const adminQuery = query(
      videosCollection,
      where('status', 'in', ['pending', 'reviewed', 'feedback_sent'])
    );

    const adminSnapshot = await getDocs(adminQuery);

    console.log(`📊 Admin query returned ${adminSnapshot.size} videos`);

    adminSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.fileName} (Status: ${data.status})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

debugVideos();