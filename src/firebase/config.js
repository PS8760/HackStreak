// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBH41gP8qPqYGEG_iJbzKooIdLqV6ZVT8A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "paperflow-d8cd6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "paperflow-d8cd6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "paperflow-d8cd6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "664431033983",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:664431033983:web:7cec68d42ea54a5f0b094a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-F51T5HMMHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;