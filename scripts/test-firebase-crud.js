#!/usr/bin/env node

/**
 * Standalone Firebase CRUD Test Script
 *
 * This script tests Firebase Firestore operations independently
 * to ensure database connectivity and CRUD functionality works.
 */

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
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
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('API Key:', firebaseConfig.apiKey ? '✅ Present' : '❌ Missing');

// Initialize Firebase
let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

// Test collection name
const TEST_COLLECTION = 'crud_test';

// Test data
const testSport = {
  name: 'Firebase Test Sport',
  description: 'This is a test sport created by the CRUD test script',
  category: 'test-category',
  difficulty: 'beginner',
  isActive: true,
  isFeatured: false,
  estimatedTimeToComplete: 60,
  icon: '🧪',
  color: '#FF6B6B',
  order: 999,
  tags: ['test', 'firebase', 'crud'],
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
};

/**
 * Test Firebase CREATE operation
 */
async function testCreate() {
  console.log('\n🔸 Testing CREATE operation...');
  try {
    const docRef = await addDoc(collection(db, TEST_COLLECTION), testSport);
    console.log('✅ CREATE successful. Document ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ CREATE failed:', error.message);
    throw error;
  }
}

/**
 * Test Firebase READ operation
 */
async function testRead(docId) {
  console.log('\n🔸 Testing READ operation...');
  try {
    // Test read single document
    const docRef = doc(db, TEST_COLLECTION, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('✅ READ single document successful');
      console.log('Document data:', { id: docSnap.id, ...docSnap.data() });
    } else {
      throw new Error('Document does not exist');
    }

    // Test read collection
    const collectionRef = collection(db, TEST_COLLECTION);
    const querySnapshot = await getDocs(collectionRef);

    console.log(`✅ READ collection successful. Found ${querySnapshot.size} documents`);
    querySnapshot.forEach((doc) => {
      console.log(`  - ${doc.id}:`, doc.data().name);
    });

    return true;
  } catch (error) {
    console.error('❌ READ failed:', error.message);
    throw error;
  }
}

/**
 * Test Firebase UPDATE operation
 */
async function testUpdate(docId) {
  console.log('\n🔸 Testing UPDATE operation...');
  try {
    const docRef = doc(db, TEST_COLLECTION, docId);
    const updateData = {
      name: 'Updated Firebase Test Sport',
      description: 'This sport has been updated by the CRUD test script',
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, updateData);
    console.log('✅ UPDATE successful');

    // Verify update
    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
      console.log('✅ UPDATE verification successful');
      console.log('Updated data:', updatedDoc.data().name);
    }

    return true;
  } catch (error) {
    console.error('❌ UPDATE failed:', error.message);
    throw error;
  }
}

/**
 * Test Firebase QUERY operation with filters
 */
async function testQuery() {
  console.log('\n🔸 Testing QUERY with filters...');
  try {
    const q = query(
      collection(db, TEST_COLLECTION),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    console.log(`✅ QUERY successful. Found ${querySnapshot.size} active documents`);

    querySnapshot.forEach((doc) => {
      console.log(`  - ${doc.id}:`, doc.data().name);
    });

    return querySnapshot.size;
  } catch (error) {
    console.error('❌ QUERY failed:', error.message);
    throw error;
  }
}

/**
 * Test Firebase DELETE operation
 */
async function testDelete(docId) {
  console.log('\n🔸 Testing DELETE operation...');
  try {
    const docRef = doc(db, TEST_COLLECTION, docId);
    await deleteDoc(docRef);
    console.log('✅ DELETE successful');

    // Verify deletion
    const deletedDoc = await getDoc(docRef);
    if (!deletedDoc.exists()) {
      console.log('✅ DELETE verification successful - document no longer exists');
    } else {
      throw new Error('Document still exists after deletion');
    }

    return true;
  } catch (error) {
    console.error('❌ DELETE failed:', error.message);
    throw error;
  }
}

/**
 * Clean up test data
 */
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  try {
    const querySnapshot = await getDocs(collection(db, TEST_COLLECTION));
    const deletePromises = [];

    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
    console.log(`✅ Cleanup completed. Deleted ${deletePromises.length} test documents`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

/**
 * Run all CRUD tests
 */
async function runCRUDTests() {
  console.log('🚀 Starting Firebase CRUD Tests\n');

  let testDocId = null;

  try {
    // Test CREATE
    testDocId = await testCreate();

    // Test READ
    await testRead(testDocId);

    // Test QUERY
    await testQuery();

    // Test UPDATE
    await testUpdate(testDocId);

    // Test READ again to verify update
    await testRead(testDocId);

    // Test DELETE
    await testDelete(testDocId);

    console.log('\n🎉 All CRUD tests passed successfully!');
    console.log('✅ Firebase database is working correctly');

  } catch (error) {
    console.error('\n💥 CRUD test failed:', error.message);
    console.error('❌ Firebase database has issues that need to be resolved');

    // Clean up on failure
    if (testDocId) {
      try {
        await testDelete(testDocId);
      } catch (cleanupError) {
        console.error('Failed to cleanup test document:', cleanupError.message);
      }
    }

    process.exit(1);
  } finally {
    // Additional cleanup
    await cleanup();
  }
}

/**
 * Test specific sports collection operations
 */
async function testSportsCollection() {
  console.log('\n🏀 Testing actual Sports collection...');

  try {
    // Check existing sports
    const sportsRef = collection(db, 'sports');
    const sportsSnapshot = await getDocs(sportsRef);

    console.log(`📊 Found ${sportsSnapshot.size} documents in sports collection`);

    if (sportsSnapshot.size > 0) {
      console.log('📋 Existing sports:');
      sportsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ${doc.id}: ${data.name} (isActive: ${data.isActive})`);
      });
    }

    // Test query with isActive filter
    const activeQuery = query(sportsRef, where('isActive', '==', true));
    const activeSnapshot = await getDocs(activeQuery);
    console.log(`🟢 Active sports: ${activeSnapshot.size}`);

    // Test query without filters
    const allQuery = query(sportsRef);
    const allSnapshot = await getDocs(allQuery);
    console.log(`📊 Total sports (no filter): ${allSnapshot.size}`);

    return {
      total: sportsSnapshot.size,
      active: activeSnapshot.size,
      all: allSnapshot.size
    };

  } catch (error) {
    console.error('❌ Sports collection test failed:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Run CRUD tests
    await runCRUDTests();

    // Test actual sports collection
    const sportsStats = await testSportsCollection();

    console.log('\n📈 Final Results:');
    console.log('✅ CRUD operations: Working');
    console.log('✅ Database connection: Stable');
    console.log(`📊 Sports collection: ${sportsStats.total} total, ${sportsStats.active} active`);

    if (sportsStats.total > 0 && sportsStats.active === 0) {
      console.log('\n⚠️  Warning: Sports exist but none are marked as active');
      console.log('   This explains why getAllSports() returns empty results');
      console.log('   Consider updating existing sports to set isActive: true');
    }

  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run tests
main().catch(console.error);