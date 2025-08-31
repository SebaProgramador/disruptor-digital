// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuración desde variables de entorno (.env)
const cfg = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId:     process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

if (!cfg.apiKey) {
  console.error("❌ ERROR: Firebase API key está vacía. Revisa tu archivo .env");
}

const app = initializeApp(cfg);

// Exportar servicios
export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);

export default app;
