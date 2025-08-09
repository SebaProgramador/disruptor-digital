// src/routes/PrivateRouteGerente.jsx
import { Navigate } from "react-router-dom";

export default function PrivateRouteGerente({ children }) {
  const ok = localStorage.getItem("gerenteLogged") === "true";
  return ok ? children : <Navigate to="/gerente-login" replace />;
}
