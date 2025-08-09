// src/routes/PrivateRouteGerente.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function PrivateRouteGerente({ children }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // Fuente de verdad: flag puesto por GerenteLogin
    const evaluate = () => {
      const gerenteFlag =
        typeof window !== "undefined" &&
        localStorage.getItem("gerenteLogged") === "true";
      setOk(!!gerenteFlag);
      setReady(true);
    };

    // Nos suscribimos sólo para esperar init de Firebase (ignoramos anónimo)
    let off = () => {};
    try {
      off = onAuthStateChanged(auth, () => {
        evaluate();
      });
    } catch {
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

  if (!ready) return null; // (opcional: spinner)
  return ok ? children : <Navigate to="/gerente-login" replace />;
}
