import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDJi-9xGeTK6TkNueS0dmifm81M_i_6tgA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kantingo-d4eb1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kantingo-d4eb1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kantingo-d4eb1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "736875324563",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:736875324563:web:f0bb51c111612483821966",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-T3S464ENGW",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    return { user: result.user, token };
  } catch (error) {
    console.error("Gagal login dengan Google:", error);
    throw error;
  }
};

export const logoutGoogle = () => signOut(auth);