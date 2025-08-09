// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDYqv1V9Wvph-L6n9AZ5ggoMKZ_Ly92k74",
  authDomain: "disruptor-digital-368e6.firebaseapp.com",
  projectId: "disruptor-digital-368e6",
  storageBucket: "disruptor-digital-368e6.appspot.com",
  messagingSenderId: "736597173070",
  appId: "1:736597173070:web:1a4bc15de29ea97cff341f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// 🔐 login anónimo para que Firestore permita leer/escribir
signInAnonymously(auth).catch((e) => console.error("anon auth error:", e));

// (opcional) ver en consola si estás autenticado
onAuthStateChanged(auth, (u) => console.log("Auth listo:", !!u));
