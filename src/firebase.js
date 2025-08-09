// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// ⚙️ Config del proyecto NUEVO (usa exactamente lo que da la consola)
const firebaseConfig = {
  apiKey: "AIzaSyCxYXUZegxjs_qivThmyoZDPZZlyKmYw1U",
  authDomain: "disruptor-digital-5909a.firebaseapp.com",
  projectId: "disruptor-digital-5909a",
  storageBucket: "disruptor-digital-5909a.firebasestorage.app",
  messagingSenderId: "97847727673",
  appId: "1:97847727673:web:285eb383a4f7467ab41fe8",
};

const app = initializeApp(firebaseConfig);

// 🔥 Firestore y Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Login anónimo OPCIONAL (no rompe si está deshabilitado).
 * En producción NO loguea el warning para que el cliente no vea ruido.
 */
(async () => {
  try {
    await signInAnonymously(auth);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Anon auth opcional:", e?.code || e?.message);
    }
  }
})();
