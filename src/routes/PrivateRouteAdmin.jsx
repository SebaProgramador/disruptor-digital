// src/routes/PrivateRouteAdmin.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function PrivateRouteAdmin({ children }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, (user) => {
        const local = localStorage.getItem("adminLogged") === "true";
        setOk(!!user || local); // Permite Firebase Auth o bandera localStorage
        setReady(true);
      });
    } catch (e) {
      const local = localStorage.getItem("adminLogged") === "true";
      setOk(local);
      setReady(true);
    }
    return () => unsub && unsub();
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#d4af37",
          background: "#000",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        Verificando acceso…
      </div>
    );
  }

  return ok ? children : <Navigate to="/admin-login" replace />;
}
