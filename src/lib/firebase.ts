import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqUKh24SoZ4tjV_dePHsnUNNKznsmjjYs",
  authDomain: "plan-my-life-36cef.firebaseapp.com",
  projectId: "plan-my-life-36cef",
  storageBucket: "plan-my-life-36cef.firebasestorage.app",
  messagingSenderId: "302156951876",
  appId: "1:302156951876:web:4bc6b51d3bd8377a92e711",
  measurementId: "G-4LSZY3NCXE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);

export default app;
