import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBH41gP8qPqYGEG_iJbzKooIdLqV6ZVT8A",
  authDomain: "paperflow-d8cd6.firebaseapp.com",
  projectId: "paperflow-d8cd6",
  storageBucket: "paperflow-d8cd6.firebasestorage.app",
  messagingSenderId: "664431033983",
  appId: "1:664431033983:web:7cec68d42ea54a5f0b094a",
  measurementId: "G-F51T5HMMHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;