// src/pages/GerenteLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminPanelEstilo.css";

export default function GerenteLogin() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  // Credenciales temporales (puedes cambiarlas)
  const usuarioValido = "gerente";
  const claveValida = "123456";

  const manejarLogin = (e) => {
    e.preventDefault();
    if (usuario === usuarioValido && clave === claveValida) {
      localStorage.setItem("gerenteLogged", "true");
      navigate("/gerente-panel");
    } else {
      setError("❌ Usuario o clave incorrectos");
    }
  };

  return (
    <div className="fondo-admin" style={{ justifyContent: "center", alignItems: "center" }}>
      <h2 className="titulo">🔑 Acceso Gerente</h2>

      <form onSubmit={manejarLogin} className="tarjeta" style={{ maxWidth: "400px", width: "100%" }}>
        <label className="label">Usuario</label>
        <input
          type="text"
          className="input"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <label className="label">Contraseña</label>
        <input
          type="password"
          className="input"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        <button type="submit" className="btn-accion" style={{ width: "100%", marginTop: "15px" }}>
          Ingresar
        </button>
      </form>
    </div>
  );
}
