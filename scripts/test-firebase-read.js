#!/usr/bin/env node

/**
 * Simple Firebase READ Test Script
 */

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy
} = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Firebase Configuration:');
console.log('Project ID:', firebaseConfig.projectId);

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

async function testReadAllSports() {
  console.log('\n🏀 Testing: Read ALL sports...');
  try {
    const sportsRef = collection(db, 'sports');
    const snapshot = await getDocs(sportsRef);
    console.log(`📊 Total documents: ${snapshot.size}`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.name} (isActive: ${data.isActive})`);
    });
    
    return snapshot.size;
  } catch (error) {
    console.error('❌ Read failed:', error.message);
    throw error;
  }
}

async function testGetAllSportsQuery() {
  console.log('\n🎯 Testing: getAllSports query...');
  try {
    const sportsRef = collection(db, 'sports');
    const q = query(
      sportsRef,
      where('isActive', '==', true),
      orderBy('isFeatured', 'desc'),
      orderBy('order', 'asc'),
      orderBy('name', 'asc')
    );
    
    const snapshot = await getDocs(q);
    console.log(`📊 getAllSports result: ${snapshot.size} documents`);
    
    if (snapshot.size === 0) {
      console.log('❗ This explains why admin interface shows empty');
    }
    
    return snapshot.size;
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Firebase READ Tests\n');
  
  try {
    const allSports = await testReadAllSports();
    const activeSports = await testGetAllSportsQuery();
    
    console.log('\n📈 RESULTS:');
    console.log(`📊 Total sports: ${allSports}`);
    console.log(`🟢 Active sports: ${activeSports}`);
    
    if (allSports > 0 && activeSports === 0) {
      console.log('\n🔍 ISSUE FOUND:');
      console.log('❌ Sports exist but none marked as active');
      console.log('💡 Need to update isActive field to true');
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
}

main().catch(console.error);
