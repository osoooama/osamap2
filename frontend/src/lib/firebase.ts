import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBPl4Xq-z_ddXNjl44INSb-hZBHDMSXIn8",
  authDomain: "osamap2-59193.firebaseapp.com",
  projectId: "osamap2-59193",
  storageBucket: "osamap2-59193.firebasestorage.app",
  messagingSenderId: "66461927866",
  appId: "1:66461927866:web:f9c07c66c0942850323583",
  measurementId: "G-CFM722T540"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
