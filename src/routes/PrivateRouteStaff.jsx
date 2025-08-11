// src/routes/PrivateRouteStaff.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function PrivateRouteStaff({ children }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, (user) => {
        const admin = localStorage.getItem("adminLogged") === "true";
        const gerente = localStorage.getItem("gerenteLogged") === "true";
        setOk(!!user || admin || gerente);
        setReady(true);
      });
    } catch {
      const admin = localStorage.getItem("adminLogged") === "true";
      const gerente = localStorage.getItem("gerenteLogged") === "true";
      setOk(admin || gerente);
      setReady(true);
    }
    return () => unsub && unsub();
  }, []);

  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        color: "#d4af37", background: "#000", fontFamily: "'Segoe UI', sans-serif"
      }}>
        Verificando acceso…
      </div>
    );
  }

  return ok ? children : <Navigate to="/admin-login" replace />;
}
