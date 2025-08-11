import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ role, children }) {
  const location = useLocation();
  const flag = role === "admin" ? "adminLogged" : "gerenteLogged";
  const logged =
    typeof window !== "undefined" && localStorage.getItem(flag) === "true";

  if (!logged) {
    const to = role === "admin" ? "/admin-login" : "/gerente-login";
    return <Navigate to={to} replace state={{ from: location }} />;
  }
  return children;
}
