// src/pages/AdminLogin.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Nota: no importo el CSS para no interferir con tu estilo inline actual.
// Si deseas combinar con clases del CSS, podemos hacerlo luego.

export default function AdminLogin() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [recordarme, setRecordarme] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [hover, setHover] = useState(false);
  const [focusU, setFocusU] = useState(false);
  const [focusP, setFocusP] = useState(false);
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 });
  const navigate = useNavigate();

  // Credenciales básicas (ajústalas si usas Auth real)
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "admin123";

  const bgUrl = `${process.env.PUBLIC_URL}/fondo-login.gif`;
  const logoUrl = `${process.env.PUBLIC_URL}/logo.jpg`;

  // Carga usuario recordado
  useEffect(() => {
    const u = localStorage.getItem("adminRememberUser");
    if (u) setUsuario(u);
  }, []);

  const estilos = {
    marco: {
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      backgroundImage: `linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.85)), url('${bgUrl}')`,
      backgroundSize: "cover",
      backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
      padding: 20,
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      color: "#d4af37",
      transition: "background-position 0.2s ease",
    },
    card: {
      width: "100%",
      maxWidth: 440,
      background:
        "linear-gradient(145deg, rgba(18,18,18,0.94), rgba(10,10,10,0.96))",
      borderRadius: 24,
      padding: 32,
      backdropFilter: "blur(8px)",
      boxShadow:
        "0 30px 60px rgba(0,0,0,0.6), inset 0 0 25px rgba(212,175,55,0.06), 0 0 60px rgba(212,175,55,0.15)",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "rgba(212, 175, 55, .45)",
      position: "relative",
      overflow: "hidden",
    },
    brillo: {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-50%",
      width: "200%",
      height: "100%",
      background:
        "linear-gradient(120deg, transparent 30%, rgba(212,175,55,0.08) 40%, transparent 70%)",
      animation: "brillo 4s infinite linear",
      pointerEvents: "none",
    },
    cabecera: { textAlign: "center", marginBottom: 20 },
    logo: {
      width: 90,
      height: 90,
      borderRadius: "50%",
      objectFit: "cover",
      marginBottom: 14,
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "#d4af37",
      boxShadow: "0 0 25px rgba(212,175,55,0.4)",
    },
    titulo: {
      margin: 0,
      fontSize: "1.65rem",
      color: "#ffd700",
      textShadow: "0 0 14px rgba(255,215,0,.35)",
      letterSpacing: ".5px",
    },
    bajada: {
      marginTop: 6,
      fontSize: ".92rem",
      color: "#c9a54f",
      opacity: 0.9,
    },
    form: { marginTop: 20 },
    label: {
      display: "block",
      fontSize: ".92rem",
      marginBottom: 6,
      color: "#f0d49b",
    },
    check: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "#d4af7f",
      fontSize: ".92rem",
      margin: "4px 0 10px",
      userSelect: "none",
    },
    inputWrap: { marginBottom: 14, position: "relative" },
    input: {
      width: "100%",
      padding: "13px 14px",
      borderRadius: 12,
      backgroundColor: "#151515",
      color: "#e6cf95",
      outline: "none",
      transition: "box-shadow .2s ease, border-color .2s ease",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "#3b2f17",
    },
    inputFocus: {
      boxShadow: "0 0 0 6px rgba(212,175,55,.15)",
      borderColor: "#d4af37",
    },
    toggleBtn: {
      position: "absolute",
      right: 10,
      top: 34,
      padding: "6px 10px",
      borderRadius: 10,
      backgroundColor: "#1e1e1e",
      color: "#d4af7f",
      cursor: "pointer",
      fontSize: 12,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#3a2f16",
    },
    error: {
      backgroundColor: "rgba(255,77,79,.08)",
      color: "#ffb3b5",
      padding: "10px 12px",
      borderRadius: 10,
      marginBottom: 12,
      fontSize: ".92rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#ff4d4f",
    },
    btn: {
      width: "100%",
      padding: "13px 16px",
      marginTop: 6,
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 700,
      letterSpacing: ".4px",
      backgroundColor: "transparent",
      color: "#d4af37",
      transition: "all .25s ease",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "#d4af37",
    },
    btnHover: {
      backgroundColor: "#d4af37",
      color: "#000",
      boxShadow: "0 0 30px rgba(212,175,55,.5)",
    },
    pie: {
      marginTop: 18,
      textAlign: "center",
      fontSize: ".85rem",
      color: "#c9a54f",
      opacity: 0.85,
    },
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      // Simulación simple (puedes integrar Auth real)
      await new Promise((r) => setTimeout(r, 350));
      if (usuario === ADMIN_USER && clave === ADMIN_PASS) {
        // 👇 CLAVE ACTUALIZADA: coincide con AdminPanel
        localStorage.setItem("adminLogged", "true");
        if (recordarme) {
          localStorage.setItem("adminRememberUser", usuario);
        } else {
          localStorage.removeItem("adminRememberUser");
        }
        navigate("/admin-panel");
      } else {
        setError("Usuario o clave incorrectos.");
      }
    } catch {
      setError("Ocurrió un error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  // Efecto de movimiento sutil del fondo
  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) * 100;
    const y = (e.clientY / innerHeight) * 100;
    setBgPos({ x, y });
  };

  return (
    <div style={estilos.marco} onMouseMove={handleMouseMove}>
      <div style={estilos.card}>
        <div style={estilos.brillo} />
        <div style={estilos.cabecera}>
          <img src={logoUrl} alt="Logo" style={estilos.logo} />
          <h1 style={estilos.titulo}>Intranet Administrador</h1>
          <div style={estilos.bajada}>Acceso seguro — Disruptor Digital</div>
        </div>

        {error ? <div style={estilos.error} role="alert">{error}</div> : null}

        <form style={estilos.form} onSubmit={onSubmit}>
          <div style={estilos.inputWrap}>
            <label style={estilos.label} htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              style={{ ...estilos.input, ...(focusU ? estilos.inputFocus : {}) }}
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onFocus={() => setFocusU(true)}
              onBlur={() => setFocusU(false)}
              autoComplete="username"
              placeholder="Ingresa tu usuario"
              aria-label="Usuario"
            />
          </div>

          <div style={estilos.inputWrap}>
            <label style={estilos.label} htmlFor="clave">Clave</label>
            <input
              id="clave"
              style={{ ...estilos.input, ...(focusP ? estilos.inputFocus : {}) }}
              type={mostrarClave ? "text" : "password"}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              onFocus={() => setFocusP(true)}
              onBlur={() => setFocusP(false)}
              autoComplete="current-password"
              placeholder="Ingresa tu clave"
              aria-label="Clave"
            />
            <button
              type="button"
              onClick={() => setMostrarClave((v) => !v)}
              style={estilos.toggleBtn}
              aria-pressed={mostrarClave}
            >
              {mostrarClave ? "Ocultar" : "Ver"}
            </button>
          </div>

          <label style={estilos.check}>
            <input
              type="checkbox"
              checked={recordarme}
              onChange={() => setRecordarme(!recordarme)}
              aria-checked={recordarme}
            />
            Recordarme
          </label>

          <button
            type="submit"
            disabled={cargando}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ ...estilos.btn, ...(hover ? estilos.btnHover : {}) }}
            aria-busy={cargando}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div style={estilos.pie}>© {new Date().getFullYear()} Disruptor Digital</div>
      </div>
    </div>
  );
}
