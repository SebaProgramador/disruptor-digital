import { auth } from "../firebase";
import { signInAnonymously } from "firebase/auth";

export async function ensureAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}
