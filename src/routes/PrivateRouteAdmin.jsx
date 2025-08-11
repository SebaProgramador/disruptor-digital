// src/routes/PrivateRouteAdmin.jsx
import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function PrivateRouteAdmin({ children }) {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const evaluate = () => {
      if (!mountedRef.current) return;
      const flag =
        typeof window !== "undefined" &&
        localStorage.getItem("adminLogged") === "true";
      setOk(!!flag);
      setReady(true);
    };

    let unsubscribe = null;
    try {
      if (auth && typeof onAuthStateChanged === "function") {
        unsubscribe = onAuthStateChanged(auth, () => {
          evaluate(); // esperamos init de Firebase y luego evaluamos flag local
        });
      } else {
        evaluate();
      }
    } catch {
      evaluate();
    }

    const timeoutId = setTimeout(() => evaluate(), 800);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  if (!ready) return null; // aquí podrías renderizar un spinner si quieres

  return ok
    ? children
    : <Navigate to="/admin-login" replace state={{ from: location }} />;
}
