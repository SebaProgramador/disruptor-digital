// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYqv1V9Wvph-L6n9AZ5ggoMKZ_Ly92k74",
  authDomain: "disruptor-digital-368e6.firebaseapp.com",
  projectId: "disruptor-digital-368e6",
  storageBucket: "disruptor-digital-368e6.appspot.com",
  messagingSenderId: "736597173070",
  appId: "1:736597173070:web:1a4bc15de29ea97cff341f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // ← IMPORTANTE

export { db };
