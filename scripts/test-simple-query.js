const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");

require("dotenv").config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testSimpleActiveQuery() {
  console.log("Testing: Simple active sports query...");
  const sportsRef = collection(db, "sports");
  const q = query(sportsRef, where("isActive", "==", true));
  const snapshot = await getDocs(q);

  console.log(`Active sports: ${snapshot.size}`);
  snapshot.forEach((doc) => {
    console.log(`  - ${doc.id}: ${doc.data().name}`);
  });

  return snapshot.size;
}

testSimpleActiveQuery().then((count) => {
  console.log(`SUCCESS: Found ${count} active sports`);
  console.log("Firebase CRUD reads are working!");
}).catch(console.error);
