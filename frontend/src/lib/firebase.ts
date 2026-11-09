import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDJi-9xGeTK6TkNueS0dmifn81M_i_6tgA",
  authDomain: "kantingo-d4eb1.firebaseapp.com",
  projectId: "kantingo-d4eb1",
  storageBucket: "kantingo-d4eb1.firebasestorage.app",
  messagingSenderId: "736875324563",
  appId: "1:736875324563:web:f0hb51c111612483821966",
  measurementId: "G-T3S464ENGW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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