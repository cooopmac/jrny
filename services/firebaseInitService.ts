import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
// You can also import other Firebase services you'll use globally here, e.g.:
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getFunctions } from "firebase/functions";

// --- IMPORTANT: Replace with your actual Firebase project configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCGcPgbVgd-ygzKq6uQuXJTCh-ag0biT-Q",
  authDomain: "journey-8e175.firebaseapp.com",
  databaseURL: "https://journey-8e175-default-rtdb.firebaseio.com",
  projectId: "journey-8e175",
  storageBucket: "journey-8e175.firebasestorage.app",
  messagingSenderId: "454632746273",
  appId: "1:454632746273:web:7e814699f152b535f7a260",
  measurementId: "G-QXPX5YGP6C",
};
// ----------------------------------------------------------------------

let app: FirebaseApp;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully in firebaseInitService.ts!");
  } catch (error) {
    console.error(
      "Firebase initialization error in firebaseInitService.ts:",
      error
    );
    // You might want to throw the error or handle it more gracefully
    // depending on how critical Firebase is at the very start.
    throw error; // Re-throwing might stop app startup, which could be intended if Firebase is critical.
  }
} else {
  app = getApp(); // if already initialized, use that one
  console.log(
    "Firebase was already initialized (retrieved by firebaseInitService.ts)."
  );
}

// Export the initialized app instance
export default app;

// Optionally, export other initialized services for convenience elsewhere
// export const auth = getAuth(app);
// export const firestore = getFirestore(app);
// export const functionsInstance = getFunctions(app); // Renamed to avoid conflict with 'functions' from firebase-functions SDK
