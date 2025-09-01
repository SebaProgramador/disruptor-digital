import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // ✅ Credenciales exactas
  const ADMIN_USER = "DD-ADM";
  const ADMIN_PASS = "Digit@l-25";        // ← corregido (con guion)
  const GERENTE_USER = "DD-GERENTE";
  const GERENTE_PASS = "NicoGerent3-25";

  // Assets desde /public
  const bgUrl = useMemo(() => `${process.env.PUBLIC_URL}/fondo-login.gif`, []);
  const logoUrl = useMemo(() => `${process.env.PUBLIC_URL}/logo.jpg`, []);

  // Estilos
  const estilos = {
    fondo: {
      minHeight: "100vh",
      backgroundImage: `url('${bgUrl}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      color: "#d4af7f",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Segoe UI', sans-serif",
      padding: 16,
    },
    caja: {
      width: "100%",
      maxWidth: 420,
      background: "rgba(18,18,18,0.96)",
      border: "2px solid #a8854f",
      borderRadius: 14,
      padding: 28,
      boxShadow: "0 0 24px #a8854f66",
      backdropFilter: "blur(2px)",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
      textAlign: "center",
    },
    logo: {
      width: 96,
      height: 96,
      borderRadius: 12,
      objectFit: "cover",
      border: "2px solid #a8854f",
      boxShadow: "0 0 14px #a8854f88",
      userSelect: "none",
    },
    titulo: {
      fontSize: "1.8rem",
      color: "#ffd98a",
      textShadow: "0 0 6px rgba(255,217,138,0.5)",
      fontWeight: 800,
    },
    form: { marginTop: 8 },
    labelOculto: {
      position: "absolute",
      left: "-9999px",
      top: "auto",
      width: "1px",
      height: "1px",
      overflow: "hidden",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      marginBottom: 12,
      borderRadius: 10,
      border: "1px solid #a8854f",
      background: "#262626",
      color: "#fff",
      fontSize: "1rem",
      outline: "none",
      boxShadow: "inset 0 0 6px rgba(168,133,79,0.25)",
    },
    row: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
      color: "#d4af7f",
      fontSize: ".95rem",
      userSelect: "none",
      cursor: "pointer",
    },
    checkbox: { width: 18, height: 18, cursor: "pointer" },
    error: {
      color: "#ff6b6b",
      background: "rgba(255,107,107,0.1)",
      border: "1px solid #ff6b6b99",
      borderRadius: 8,
      padding: "8px 10px",
      fontWeight: 700,
      marginBottom: 8,
      textAlign: "center",
    },
    boton: {
      width: "100%",
      padding: "12px 14px",
      background: "#a8854f",
      color: "#121212",
      border: "none",
      borderRadius: 10,
      fontWeight: 800,
      fontSize: "1rem",
      cursor: "pointer",
      boxShadow: "0 0 12px #a8854f88",
      transition: "transform .08s ease",
    },
    botonDisabled: {
      opacity: 0.75,
      cursor: "not-allowed",
      filter: "grayscale(0.2)",
    },
    botonSec: {
      width: "100%",
      padding: "12px 14px",
      background: "#3a3a3a",
      color: "#d4af7f",
      border: "none",
      borderRadius: 10,
      fontWeight: 700,
      fontSize: "1rem",
      cursor: "pointer",
      marginTop: 12,
      boxShadow: "0 0 8px #000",
    },
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (cargando) return;

    const u = usuario.trim();
    const p = clave; // la clave puede llevar símbolos, no aplicar trim por seguridad

    if (!u || !p) {
      setError("❌ Completa usuario y contraseña.");
      return;
    }

    setCargando(true);
    setError("");

    setTimeout(() => {
      // Admin
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "admin");
        localStorage.setItem("adminLogged", "true"); // compat
        localStorage.removeItem("gerenteLogged");
        navigate("/admin-panel", { replace: true });
        setCargando(false);
        return;
      }
      // Gerente
      if (u === GERENTE_USER && p === GERENTE_PASS) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "gerente");
        localStorage.setItem("gerenteLogged", "true"); // compat
        localStorage.removeItem("adminLogged");
        navigate("/gerente-panel", { replace: true });
        setCargando(false);
        return;
      }

      setError("❌ Usuario o clave incorrecta.");
      setCargando(false);
    }, 250);
  };

  return (
    <div style={estilos.fondo}>
      <div style={estilos.caja}>
        <div style={estilos.header}>
          <img src={logoUrl} alt="Logo Disruptor" style={estilos.logo} draggable={false} />
          <h2 style={estilos.titulo}>🔒 Ingreso Administrador</h2>
        </div>

        {error && <div role="alert" style={estilos.error}>{error}</div>}

        <form style={estilos.form} onSubmit={handleLogin} noValidate>
          <label htmlFor="admin-usuario" style={estilos.labelOculto}>Usuario</label>
          <input
            id="admin-usuario"
            type="text"
            placeholder="Usuario"
            style={estilos.input}
            value={usuario}
            autoComplete="username"
            onChange={(e) => {
              setUsuario(e.target.value);
              if (error) setError("");
            }}
            required
          />

          <label htmlFor="admin-clave" style={estilos.labelOculto}>Contraseña</label>
          <input
            id="admin-clave"
            type={mostrarClave ? "text" : "password"}
            placeholder="Contraseña"
            style={estilos.input}
            value={clave}
            autoComplete="current-password"
            onChange={(e) => {
              setClave(e.target.value);
              if (error) setError("");
            }}
            required
          />

          <div
            style={estilos.row}
            onClick={() => setMostrarClave((v) => !v)}
            role="button"
            aria-label="Mostrar u ocultar contraseña"
          >
            <input
              type="checkbox"
              checked={mostrarClave}
              onChange={() => setMostrarClave((v) => !v)}
              style={estilos.checkbox}
              onClick={(e) => e.stopPropagation()}
            />
            Mostrar contraseña
          </div>

          <button
            type="submit"
            style={{ ...estilos.boton, ...(cargando ? estilos.botonDisabled : {}) }}
            disabled={cargando}
          >
            {cargando ? "Ingresando..." : "👉 Ingresar"}
          </button>
        </form>

        <button
          style={estilos.botonSec}
          onClick={() => navigate("/", { replace: true })}
        >
          ⬅️ Volver al Inicio
        </button>
      </div>
    </div>
  );
}
