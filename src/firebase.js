// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCxYXUZegxjs_qivThmyoZDPZZlyKmYw1U",
  authDomain: "disruptor-digital-5909a.firebaseapp.com",
  projectId: "disruptor-digital-5909a",
  storageBucket: "disruptor-digital-5909a.firebasestorage.app",
  messagingSenderId: "97847727673",
  appId: "1:97847727673:web:285eb383a4f7467ab41fe8",
};

// Evita doble inicialización en hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Exports únicos, sin default
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Debug opcional (puedes borrar)
if (typeof window !== "undefined") {
  console.log("Firebase listo:", app.options.projectId);
}
