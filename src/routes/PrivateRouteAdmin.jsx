// src/routes/PrivateRouteAdmin.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function PrivateRouteAdmin({ children }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // Fuente de verdad: flag puesto por AdminLogin
    const evaluate = () => {
      const adminFlag =
        typeof window !== "undefined" &&
        localStorage.getItem("adminLogged") === "true";
      setOk(!!adminFlag);
      setReady(true);
    };

    // Nos suscribimos sólo para esperar la init de Firebase (pero ignoramos anónimo)
    let off = () => {};
    try {
      off = onAuthStateChanged(auth, () => {
        // Cuando Firebase quede listo, evaluamos el flag
        evaluate();
      });
    } catch {
      // Si no hay auth disponible por alguna razón, evaluamos igual
      evaluate();
    }

    // Fallback por si no dispara el listener
    const t = setTimeout(() => {
      if (!ready) evaluate();
    }, 1000);

    return () => {
      clearTimeout(t);
      if (off) off();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return null; // (opcional) aquí podrías renderizar un spinner
  return ok ? children : <Navigate to="/admin-login" replace />;
}
