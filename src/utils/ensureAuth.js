// src/utils/ensureAuth.js
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export function ensureAuth() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (user) => {
      off();
      resolve(user || null);
    });
  });
}
