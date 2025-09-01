// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔑 Configuración de tu nuevo proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCxYXUZegxjs_qivThmyoZDPZZlyKmYw1U",
  authDomain: "disruptor-digital-5909a.firebaseapp.com",
  projectId: "disruptor-digital-5909a",
  storageBucket: "disruptor-digital-5909a.firebasestorage.app",
  messagingSenderId: "97847727673",
  appId: "1:97847727673:web:285eb383a4f7467ab41fe8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// ✅ Exportar servicios
export const db = getFirestore(app);
export const storage = getStorage(app);
