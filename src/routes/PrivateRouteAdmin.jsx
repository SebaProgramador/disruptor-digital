// src/routes/PrivateRouteAdmin.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function PrivateRouteAdmin({ children }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (user) => {
      setOk(!!user);      // hay admin logueado
      setReady(true);
    });
    return () => off();
  }, []);

  if (!ready) return null;            // puedes poner un spinner
  return ok ? children : <Navigate to="/admin-login" replace />;
}
