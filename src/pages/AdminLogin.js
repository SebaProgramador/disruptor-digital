// src/pages/AdminLogin.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [recordarme, setRecordarme] = useState(true);
  const navigate = useNavigate();

  const ADMIN_USER = "admin";
  const ADMIN_PASS = "admin123";

  useEffect(() => {
    const u = localStorage.getItem("adminRememberUser");
    if (u) setUsuario(u);
  }, []);

  const estilos = {
    fondo: {
      minHeight: "100vh",
      backgroundImage: "url('/fondo-login.gif')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      color: "#d4af7f",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Segoe UI', sans-serif",
      flexDirection: "column",
      padding: 20,
    },
    caja: {
      backgroundColor: "rgba(30, 30, 30, 0.95)",
      padding: 40,
      borderRadius: 15,
      border: "2px solid #a8854f",
      boxShadow: "0 0 25px #a8854f80",
      width: "100%",
      maxWidth: 400,
      boxSizing: "border-box",
      textAlign: "center",
    },
    logo: {
      width: "100%",
      maxWidth: 200,
      marginBottom: 20,
      borderRadius: 12,
      boxShadow: "0 0 14px #a8854f88",
    },
    titulo: {
      fontSize: "1.8rem",
      marginBottom: 20,
      textAlign: "center",
      color: "#d4af7f",
    },
    input: {
      width: "100%",
      padding: 10,
      marginBottom: 15,
      borderRadius: 8,
      border: "1px solid #a8854f",
      backgroundColor: "#2b2b2b",
      color: "#fff",
      fontSize: "1rem",
      boxSizing: "border-box",
    },
    boton: {
      width: "100%",
      padding: 12,
      backgroundColor: "#a8854f",
      border: "none",
      borderRadius: 8,
      color: "#121212",
      fontWeight: "bold",
      fontSize: "1rem",
      cursor: "pointer",
      boxShadow: "0 0 10px #a8854f88",
      marginTop: 5,
    },
    botonSecundario: {
      width: "100%",
      padding: 12,
      backgroundColor: "#444",
      border: "none",
      borderRadius: 8,
      color: "#d4af7f",
      fontWeight: "bold",
      fontSize: "1rem",
      cursor: "pointer",
      boxShadow: "0 0 8px #666",
      marginTop: 15,
    },
    error: {
      color: "#ff6666",
      textAlign: "center",
      marginBottom: 10,
      fontWeight: "bold",
    },
    contenedorMostrarClave: {
      display: "flex",
      alignItems: "center",
      marginBottom: 15,
      color: "#d4af7f",
      fontSize: "0.9rem",
      userSelect: "none",
      cursor: "pointer",
    },
    labelOculto: {
      position: "absolute",
      left: "-9999px",
      top: "auto",
      width: "1px",
      height: "1px",
      overflow: "hidden",
    },
    check: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "#d4af7f",
      fontSize: ".9rem",
      marginBottom: 15,
      cursor: "pointer",
    },
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (usuario === ADMIN_USER && clave === ADMIN_PASS) {
      localStorage.setItem("adminLogged", "true");
      if (recordarme) {
        localStorage.setItem("adminRememberUser", usuario);
      } else {
        localStorage.removeItem("adminRememberUser");
      }
      navigate("/admin-panel");
    } else {
      setError("❌ Usuario o clave incorrecta.");
    }
  };

  return (
    <div style={estilos.fondo}>
      <div style={estilos.caja}>
        <img src="/logo.jpg" alt="Logo Disruptor" style={estilos.logo} />
        <h2 style={estilos.titulo}>🔒 Ingreso Administrador</h2>
        {error && <p style={estilos.error}>{error}</p>}

        <form onSubmit={handleLogin} noValidate>
          <label htmlFor="usuario" style={estilos.labelOculto}>
            Usuario
          </label>
          <input
            id="usuario"
            type="text"
            placeholder="Usuario"
            style={estilos.input}
            value={usuario}
            onChange={(e) => {
              setUsuario(e.target.value);
              if (error) setError("");
            }}
            required
          />

          <label htmlFor="clave" style={estilos.labelOculto}>
            Contraseña
          </label>
          <input
            id="clave"
            type={mostrarClave ? "text" : "password"}
            placeholder="Contraseña"
            style={estilos.input}
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              if (error) setError("");
            }}
            required
          />

          <div
            style={estilos.contenedorMostrarClave}
            onClick={() => setMostrarClave(!mostrarClave)}
          >
            <input
              type="checkbox"
              checked={mostrarClave}
              onChange={() => setMostrarClave(!mostrarClave)}
              style={{ marginRight: 8 }}
            />
            Mostrar contraseña
          </div>

          <label style={estilos.check}>
            <input
              type="checkbox"
              checked={recordarme}
              onChange={() => setRecordarme(!recordarme)}
            />
            Recordarme
          </label>

          <button type="submit" style={estilos.boton}>
            👉 Ingresar
          </button>
        </form>

        <button style={estilos.botonSecundario} onClick={() => navigate("/")}>
          ⬅️ Volver al Inicio
        </button>
      </div>
    </div>
  );
}
