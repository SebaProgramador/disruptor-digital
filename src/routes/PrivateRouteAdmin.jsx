import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRouteAdmin({ children }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setOk(localStorage.getItem("adminLogged") === "true");
    setReady(true);
  }, []);

  if (!ready) return null;
  return ok ? children : <Navigate to="/admin-login" replace />;
}
