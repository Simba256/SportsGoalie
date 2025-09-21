const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where, orderBy } = require("firebase/firestore");

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

async function testGetAllSportsQuery() {
  console.log("Testing: Simplified getAllSports query...");
  const sportsRef = collection(db, "sports");
  const q = query(
    sportsRef,
    where("isActive", "==", true),
    orderBy("name", "asc")
  );
  
  const snapshot = await getDocs(q);
  console.log(`Active sports (sorted by name): ${snapshot.size}`);
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`  - ${doc.id}: ${data.name}`);
  });
  
  return snapshot.size;
}

testGetAllSportsQuery().then((count) => {
  console.log(`SUCCESS: getAllSports query works! Found ${count} sports`);
}).catch((error) => {
  console.error("FAILED:", error.message);
});
