// src/utils/ensureAuth.js
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

/** Garantiza que haya un usuario autenticado en Firebase (anónimo si no hay). */
export async function ensureAuth() {
  const auth = getAuth();

  if (auth.currentUser) return auth.currentUser;

  const user = await new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u || null);
    });
  });
  if (user) return user;

  const cred = await signInAnonymously(auth);
  return cred.user;
}
