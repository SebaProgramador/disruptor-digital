// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// ⚙️ Config del proyecto NUEVO
const firebaseConfig = {
  apiKey: "AIzaSyCxYXUZegxjs_qivThmyoZDPZZlyKmYw1U",
  authDomain: "disruptor-digital-5909a.firebaseapp.com",
  projectId: "disruptor-digital-5909a",
  storageBucket: "disruptor-digital-5909a.firebasestorage.app",
  messagingSenderId: "97847727673",
  appId: "1:97847727673:web:285eb383a4f7467ab41fe8",
};

// 1) App primero
const app = initializeApp(firebaseConfig);
export default app;

// 2) Firestore
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,  // ⬅️ forzado
  useFetchStreams: false,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// 3) Auth
export const auth = getAuth(app);

// 4) Login anónimo opcional
(async () => {
  try {
    await signInAnonymously(auth);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Anon auth opcional:", e?.code || e?.message);
    }
  }
})();
