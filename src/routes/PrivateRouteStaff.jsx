import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRouteStaff({ children }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const admin = localStorage.getItem("adminLogged") === "true";
    const gerente = localStorage.getItem("gerenteLogged") === "true";
    setOk(admin || gerente);
    setReady(true);
  }, []);

  if (!ready) return null;
  return ok ? children : <Navigate to="/admin-login" replace />;
}
