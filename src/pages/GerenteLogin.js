// src/pages/GerenteLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminPanelEstilo.css";

export default function GerenteLogin() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // 🔒 Credenciales locales
  const GERENTE_USER = "gerente";
  const GERENTE_PASS = "123456";

  const manejarLogin = (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    setTimeout(() => {
      if (usuario.trim() === GERENTE_USER && clave === GERENTE_PASS) {
        localStorage.setItem("gerenteLogged", "true");
        navigate("/gerente-panel");
      } else {
        setError("❌ Usuario o clave incorrectos");
        setCargando(false);
      }
    }, 200);
  };

  return (
    <div className="fondo-admin" style={{ justifyContent: "center", alignItems: "center" }}>
      <h2 className="titulo">🔑 Acceso Gerente</h2>

      <form onSubmit={manejarLogin} className="tarjeta" style={{ maxWidth: 420, width: "100%" }}>
        <label className="label">Usuario</label>
        <input
          type="text"
          className="input"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          disabled={cargando}
        />

        <label className="label">Contraseña</label>
        <input
          type="password"
          className="input"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          disabled={cargando}
        />

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 15 }} disabled={cargando}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
