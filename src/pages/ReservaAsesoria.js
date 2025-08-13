// src/pages/ReservaAsesoria.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUserAlt, FaEnvelope, FaPhoneAlt, FaBuilding,
  FaCalendarAlt, FaClock, FaTag, FaFolderOpen,
} from "react-icons/fa";
import { db } from "../firebase";
import {
  collection, addDoc, getDocs, query, where, onSnapshot,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";
import estilos from "./ReservaAsesoriaEstilo";

const FESTIVOS = ["2025-07-28", "2025-09-18", "2025-09-19"];
const MAX_CUPOS_POR_DIA = 20;
// ✅ Lunes (1), Miércoles (3) y Viernes (5)
const DIAS_PERMITIDOS = [1, 3, 5];

const SERVICIOS = [
  "Diseño Web",
  "Tienda Online",
  "Branding",
  "Publicidad",
  "Mantenimiento Web",
];

// EmailJS (solo ADMIN)
const EMAILJS_SERVICE_ID = "service_ajyjiwj";
const EMAILJS_TEMPLATE_ID = "template_k6flmfv";
const EMAILJS_PUBLIC_KEY = "frWaGRd2eCSYgm1Yf";

// ✅ Número de WhatsApp del ADMIN
const WHATSAPP_ADMIN = "+56930053314";

const esFestivo = (fecha) => {
  const fechaStr = fecha.toISOString().split("T")[0];
  return FESTIVOS.includes(fechaStr);
};

// ✅ Genera SOLO lunes/miércoles/viernes no festivos
const obtenerFechasDisponibles = () => {
  const hoy = new Date();
  const fechas = [];
  let diasBuscados = 0;
  while (fechas.length < 10 && diasBuscados < 60) {
    const dow = hoy.getDay();
    if (DIAS_PERMITIDOS.includes(dow) && !esFestivo(hoy)) {
      fechas.push(new Date(hoy)); // copia
    }
    hoy.setDate(hoy.getDate() + 1);
    diasBuscados++;
  }
  return fechas;
};

const obtenerHorasDisponibles = async (fechaSeleccionada) => {
  const horarios = [
    "09:00","10:00","11:00","12:00",
    "13:00","14:00","15:00","16:00",
    "17:00","18:00","19:00"
  ];

  const snapshot = await getDocs(
    query(collection(db, "reservas"), where("dia", "==", fechaSeleccionada))
  );

  const conteo = {};
  snapshot.forEach((doc) => {
    const data = doc.data();
    conteo[data.horario] = (conteo[data.horario] || 0) + 1;
  });

  return horarios.map((hora) => ({
    hora,
    disponible: !conteo[hora],
  }));
};

// ✅ Local: evita desfases de zona horaria
const toLocalDate = (yyyy_mm_dd) => {
  const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const MESES_CORTOS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const fechaCorta = (d) => {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MESES_CORTOS[date.getMonth()]} ${date.getFullYear()}`;
};

const formatoFecha = (fecha) =>
  fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// ✅ Normaliza a formato E.164 chileno +569XXXXXXXX
const normalizarTelefono = (input) => {
  if (!input) return "";
  const t = String(input).replace(/\s+/g, "");
  // Acepta +569XXXXXXXX o 9XXXXXXXX
  const m1 = /^\+569\d{8}$/.test(t);
  const m2 = /^9\d{8}$/.test(t);
  if (m1) return t;
  if (m2) return `+56${t}`;
  return ""; // inválido
};

export default function ReservaAsesoria() {
  const navigate = useNavigate();
  const [fechasDisponibles] = useState(obtenerFechasDisponibles);
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipoEmpresa: "Pyme",
    dia: "",
    horario: "09:00",
    nombreEmpresa: "",
    rubro: "",
    servicioDeseado: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [hover, setHover] = useState(false);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [totalReservas, setTotalReservas] = useState(0);

  // Aviso visual si el día es inválido
  const [avisoDia, setAvisoDia] = useState("");
  const diaBoxRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "reservas"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTotalReservas(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  // ✅ Valida L/M/V y no festivos cuando el usuario elige el día
  const manejarDiaSeleccionado = async (e) => {
    const nuevoDia = e.target.value;

    if (!nuevoDia) {
      setFormulario({ ...formulario, dia: "" });
      setHorariosDisponibles([]);
      return;
    }

    const date = toLocalDate(nuevoDia);
    const dow = date.getDay();
    const permitido = DIAS_PERMITIDOS.includes(dow) && !FESTIVOS.includes(nuevoDia);

    if (!permitido) {
      setAvisoDia("Solo se puede agendar los días Lunes, Miércoles y Viernes (no festivos).");
      setFormulario({ ...formulario, dia: "" });
      setHorariosDisponibles([]);
      if (diaBoxRef.current) {
        diaBoxRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(() => setAvisoDia(""), 6000);
      return;
    }

    setAvisoDia("");
    setFormulario({ ...formulario, dia: nuevoDia });

    const horarios = await obtenerHorasDisponibles(nuevoDia);
    setHorariosDisponibles(horarios);
  };

  // ✅ Email al ADMIN
  const enviarEmailAdmin = async (mensaje) => {
    const templateParams = {
      nombre: formulario.nombre,
      email: formulario.email,
      telefono: normalizarTelefono(formulario.telefono) || formulario.telefono,
      tipoEmpresa: formulario.tipoEmpresa,
      dia: formulario.dia,
      horario: formulario.horario,
      nombreEmpresa: formulario.nombreEmpresa,
      rubro: formulario.rubro,
      servicioDeseado: formulario.servicioDeseado,
      mensaje,
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
    } catch (e) {
      console.error("Error al enviar email al admin:", e);
    }
  };

  const agregarReserva = async (e) => {
    e.preventDefault();

    // ✅ Acepta +569XXXXXXXX o 9XXXXXXXX y normaliza
    const telNormalizado = normalizarTelefono(formulario.telefono);
    if (!telNormalizado) {
      setAvisoDia("Formato de teléfono inválido. Usa +569XXXXXXXX o 9XXXXXXXX.");
      if (diaBoxRef.current) diaBoxRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setAvisoDia(""), 6000);
      return;
    }

    if (!formulario.dia) {
      setAvisoDia("Debes seleccionar un día válido (Lunes, Miércoles o Viernes).");
      if (diaBoxRef.current) diaBoxRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setAvisoDia(""), 6000);
      return;
    }

    // Revalida L/M/V y no festivo
    const dow = toLocalDate(formulario.dia).getDay();
    if (!DIAS_PERMITIDOS.includes(dow) || FESTIVOS.includes(formulario.dia)) {
      setAvisoDia("Solo se puede agendar los días Lunes, Miércoles y Viernes (no festivos).");
      if (diaBoxRef.current) diaBoxRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setAvisoDia(""), 6000);
      return;
    }

    if (totalReservas >= MAX_CUPOS_POR_DIA) {
      setAvisoDia("Lo siento, ya no quedan cupos disponibles.");
      if (diaBoxRef.current) diaBoxRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setAvisoDia(""), 6000);
      return;
    }

    setEnviando(true);

    try {
      // Verifica que la hora no esté tomada ese día
      const snapshot = await getDocs(
        query(
          collection(db, "reservas"),
          where("dia", "==", formulario.dia),
          where("horario", "==", formulario.horario)
        )
      );

      if (snapshot.size >= 1) {
        setAvisoDia("Este horario ya no tiene cupos disponibles.");
        if (diaBoxRef.current) diaBoxRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setAvisoDia(""), 6000);
        setEnviando(false);
        return;
      }

      // 1) Guardar en Firebase (con teléfono normalizado)
      await addDoc(collection(db, "reservas"), {
        ...formulario,
        telefono: telNormalizado,
      });

      // 2) Mensajes
      const fechaReservaTextoCorta = fechaCorta(new Date());
      const fechaReunionTextoCorta = fechaCorta(toLocalDate(formulario.dia));
      const mensajeCliente =
        `Hola ${formulario.nombre}, recibimos tu reserva el ${fechaReservaTextoCorta} para el servicio de "${formulario.servicioDeseado}".\n` +
        `Tu reunión es el ${fechaReunionTextoCorta} a las ${formulario.horario}.\n` +
        `Te entregaremos el link para que te conectes un día antes de la reunión.\n` +
        `¡Gracias por confiar en nosotros!`;

      const mensajeAdmin =
        `📢 Nueva reserva\n` +
        `👤 ${formulario.nombre} | ${formulario.email}\n` +
        `📱 ${telNormalizado}\n` +
        `🛠️ ${formulario.servicioDeseado}\n` +
        `📅 ${formulario.dia} ⏰ ${formulario.horario}\n` +
        `🏢 ${formulario.nombreEmpresa} • ${formulario.tipoEmpresa}\n` +
        `Rubro: ${formulario.rubro}`;

      // 3) WhatsApp: primero cliente, luego admin (pequeño delay para evitar bloqueos)
      const telClienteWa = telNormalizado.replace(/\D/g, "");   // 569XXXXXXXX
      const telAdminWa = WHATSAPP_ADMIN.replace(/\D/g, "");     // 569XXXXXXXX
      window.open(`https://wa.me/${telClienteWa}?text=${encodeURIComponent(mensajeCliente)}`, "_blank", "noopener");
      setTimeout(() => {
        window.open(`https://wa.me/${telAdminWa}?text=${encodeURIComponent(mensajeAdmin)}`, "_blank", "noopener");
      }, 500);

      // 4) Aviso por Email SOLO al ADMIN
      await enviarEmailAdmin(mensajeAdmin);

      // 5) Limpiar y feedback visual
      setFormulario({
        nombre: "",
        email: "",
        telefono: "",
        tipoEmpresa: "Pyme",
        dia: "",
        horario: "09:00",
        nombreEmpresa: "",
        rubro: "",
        servicioDeseado: "",
      });

      setExito(true);
      setEnviando(false);

      setTimeout(() => {
        setExito(false);
        navigate("/");
      }, 8000);
    } catch (error) {
      console.error("Error al guardar reserva:", error);
      setAvisoDia("Ocurrió un error. Intenta nuevamente.");
      setTimeout(() => setAvisoDia(""), 6000);
      setEnviando(false);
    }
  };

  // 🔴 Estilo chip-error
  const chipError = {
    background: "#ffebee",
    color: "#c62828",
    border: "1px solid #ffcdd2",
    padding: "8px 12px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: 600,
    marginBottom: "10px",
  };
  const chipCloseBtn = {
    border: "none",
    background: "transparent",
    color: "#c62828",
    fontSize: "16px",
    cursor: "pointer",
    lineHeight: 1,
  };

  // 🟡 Badge dorado/negro
  const badgeInfo = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#0b0b0b",
    color: "#d4af50",
    border: "1px solid #d4af50",
    borderRadius: "999px",
    padding: "6px 12px",
    fontWeight: 700,
    boxShadow: "0 0 10px rgba(212, 175, 80, 0.25)",
    letterSpacing: "0.3px",
    marginTop: "8px",
  };

  return (
    <div style={estilos.fondo}>
      <div style={estilos.contenedor}>
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
            <img
              src="/logo.jpg"
              alt="Logo Disruptor Digital"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "50%",
                boxShadow: "0 0 15px rgba(212, 175, 80, 0.6)",
                border: "2px solid #d4af50"
              }}
            />
          </div>
          <h2 style={estilos.titulo}>
            <FaCalendarAlt style={{ color: "#d4af50" }} /> Reserva tu Asesoría
          </h2>

          {/* Badge permanente L–M–V */}
          <div>
            <span style={badgeInfo}>
              ✨ Solo L–M–V • sin festivos
            </span>
          </div>
        </div>

        <p style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1.2rem",
          marginTop: "10px",
          color: "#d4af50",
          textShadow: "0 0 5px #a8854f99"
        }}>
          Cupos {MAX_CUPOS_POR_DIA - totalReservas} / {MAX_CUPOS_POR_DIA}
        </p>

        <form onSubmit={agregarReserva}>
          <label style={estilos.etiqueta}><FaUserAlt /> Nombre:</label>
          <input name="nombre" value={formulario.nombre} onChange={manejarCambio} required style={estilos.input} disabled={enviando || exito} />

          <label style={estilos.etiqueta}><FaEnvelope /> Email:</label>
          <input type="email" name="email" value={formulario.email} onChange={manejarCambio} required style={estilos.input} disabled={enviando || exito} />

          <label style={estilos.etiqueta}><FaPhoneAlt /> Teléfono (+56 9):</label>
          {/* ✅ Pattern relajado y normalización en JS */}
          <input
            type="tel"
            name="telefono"
            value={formulario.telefono}
            onChange={manejarCambio}
            required
            placeholder="+569XXXXXXXX o 9XXXXXXXX"
            pattern="^(\+569\d{8}|9\d{8})$"
            style={estilos.input}
            disabled={enviando || exito}
            title="Ingresa +569XXXXXXXX o 9XXXXXXXX"
          />
          <small style={{ color: "#c5b27a", display: "block", marginTop: 6 }}>
            Acepta +569XXXXXXXX o 9XXXXXXXX. Se normaliza automáticamente.
          </small>

          <label style={estilos.etiqueta}><FaBuilding /> Tipo de empresa:</label>
          <select name="tipoEmpresa" value={formulario.tipoEmpresa} onChange={manejarCambio} style={estilos.input} disabled={enviando || exito}>
            <option value="Pyme">Pyme</option>
            <option value="Emprendedor">Emprendedor</option>
            <option value="Mediana empresa">Mediana empresa</option>
          </select>

          {/* BLOQUE DÍA + AVISO */}
          <div ref={diaBoxRef}>
            {avisoDia && (
              <div style={chipError} role="alert" aria-live="assertive">
                <span>⚠️ {avisoDia}</span>
                <button type="button" onClick={() => setAvisoDia("")} style={chipCloseBtn} aria-label="Cerrar aviso">×</button>
              </div>
            )}

            <label style={estilos.etiqueta}><FaCalendarAlt /> Día:</label>
            <select name="dia" value={formulario.dia} onChange={manejarDiaSeleccionado} required style={estilos.input} disabled={enviando || exito}>
              <option value="">Selecciona un día</option>
              {fechasDisponibles.map((fecha, i) => (
                <option key={i} value={fecha.toISOString().split("T")[0]}>
                  {formatoFecha(fecha)}
                </option>
              ))}
            </select>
          </div>

          <label style={estilos.etiqueta}><FaClock /> Horario:</label>
          <select name="horario" value={formulario.horario} onChange={manejarCambio} required style={estilos.input} disabled={enviando || exito || horariosDisponibles.length === 0}>
            {horariosDisponibles.length === 0
              ? ["09:00","10:00","11:00"].map((hora) => (
                  <option key={hora} value={hora}>{hora}</option>
                ))
              : horariosDisponibles.map(({ hora, disponible }) => (
                  <option key={hora} value={hora} disabled={!disponible}>
                    {hora} {disponible ? "" : "(No disponible)"}
                  </option>
                ))}
          </select>

          <label style={estilos.etiqueta}><FaTag /> Nombre de empresa:</label>
          <input name="nombreEmpresa" value={formulario.nombreEmpresa} onChange={manejarCambio} required style={estilos.input} disabled={enviando || exito} />

          <label style={estilos.etiqueta}><FaFolderOpen /> Rubro:</label>
          <input name="rubro" value={formulario.rubro} onChange={manejarCambio} required style={estilos.input} disabled={enviando || exito} />

          <label style={estilos.etiqueta}><FaTag /> Servicio que deseas:</label>
          <select
            name="servicioDeseado"
            value={formulario.servicioDeseado}
            onChange={manejarCambio}
            required
            style={estilos.input}
            disabled={enviando || exito}
          >
            <option value="">Selecciona un servicio</option>
            {SERVICIOS.map((servicio, i) => (
              <option key={i} value={servicio}>{servicio}</option>
            ))}
          </select>

          <button type="submit" disabled={enviando || exito} style={{ ...estilos.boton, ...(enviando || exito ? estilos.botonDisabled : {}) }}>
            🚀 Reservar ahora
          </button>
        </form>
      </div>

      {(enviando || exito) && (
        <div style={estilos.modalOverlay} role="alert" aria-live="assertive">
          <div style={estilos.modalContent}>
            {enviando ? (
              <>
                <img src="/loading.gif" alt="Cargando..." style={estilos.gifCarga} />
                <p style={estilos.mensajeCarga}>🛠️ Estamos programando tu asesoría...</p>
              </>
            ) : (
              <>
                <img src="/enviado.gif" alt="Enviado" style={estilos.gifCarga} />
                <p style={estilos.mensajeExito}>✅ ¡Muchas gracias por reservar!<br />Pronto serás contactado por WhatsApp 📱.</p>
              </>
            )}
          </div>
        </div>
      )}

      <Link
        to="/"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ ...estilos.volver, ...(hover ? estilos.volverHover : {}) }}
      >
        ⬅️ Volver al Inicio
      </Link>
    </div>
  );
}
