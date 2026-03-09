// Firebase Client SDK Configuration
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
let _app: FirebaseApp;
let _db: Firestore;
let _auth: Auth;

export function getFirebaseApp(): FirebaseApp {
  if (!_app && getApps().length === 0) {
    _app = initializeApp(firebaseConfig);
  } else if (!_app) {
    _app = getApps()[0];
  }
  return _app;
}

export function getFirestoreDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

// Check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

// Export initialized instances for direct use
// Only initialize if Firebase is configured
export const firebaseApp = isFirebaseConfigured() ? getFirebaseApp() : null;
export const firestore = isFirebaseConfigured() ? getFirestoreDb() : null;
export const auth = isFirebaseConfigured() ? getFirebaseAuth() : null;
