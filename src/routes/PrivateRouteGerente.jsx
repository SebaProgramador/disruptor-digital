import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRouteGerente({ children }) {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setOk(localStorage.getItem("gerenteLogged") === "true");
    setReady(true);
  }, []);

  if (!ready) return null;
  return ok ? children : <Navigate to="/gerente-login" replace state={{ from: location }} />;
}

