// src/pages/ReservaAsesoria.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaBuilding,
  FaCalendarAlt,
  FaClock,
  FaTag,
  FaFolderOpen,
} from "react-icons/fa";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";
import estilos from "./ReservaAsesoriaEstilo";

const FESTIVOS = ["2025-07-28", "2025-09-18", "2025-09-19"];
const MAX_CUPOS_POR_DIA = 20;

const SERVICIOS = [
  "Diseño Web",
  "Tienda Online",
  "Branding",
  "Publicidad",
  "Mantenimiento Web",
];

// EmailJS (solo ADMIN)
const EMAILJS_SERVICE_ID = "service_ajyjiwj";         // ✅ tu Service ID
const EMAILJS_TEMPLATE_ID = "template_k6flmfv";       // ✅ tu Template ID
const EMAILJS_PUBLIC_KEY = "frWaGRd2eCSYgm1Yf";  // ⛳ pega tu Public Key de EmailJS

const esFestivo = (fecha) => {
  const fechaStr = fecha.toISOString().split("T")[0];
  return FESTIVOS.includes(fechaStr);
};

const obtenerFechasDisponibles = () => {
  const hoy = new Date();
  const fechas = [];
  let diasBuscados = 0;

  while (fechas.length < 10 && diasBuscados < 30) {
    const diaSemana = hoy.getDay();
    if (diaSemana !== 0 && diaSemana !== 6 && !esFestivo(hoy)) {
      fechas.push(new Date(hoy));
    }
    hoy.setDate(hoy.getDate() + 1);
    diasBuscados++;
  }

  return fechas;
};

const obtenerHorasDisponibles = async (fechaSeleccionada) => {
  const horarios = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00"
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

const formatoFecha = (fecha) =>
  fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

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

  const manejarDiaSeleccionado = async (e) => {
    const nuevoDia = e.target.value;
    setFormulario({ ...formulario, dia: nuevoDia });

    if (nuevoDia) {
      const horarios = await obtenerHorasDisponibles(nuevoDia);
      setHorariosDisponibles(horarios);
    } else {
      setHorariosDisponibles([]);
    }
  };

  const enviarEmailAdmin = async () => {
    const templateParams = {
      nombre: formulario.nombre,
      email: formulario.email,
      telefono: formulario.telefono,
      tipoEmpresa: formulario.tipoEmpresa,
      dia: formulario.dia,
      horario: formulario.horario,
      nombreEmpresa: formulario.nombreEmpresa,
      rubro: formulario.rubro,
      servicioDeseado: formulario.servicioDeseado,
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
      // No interrumpimos el flujo del usuario si falla el email
    }
  };

  const agregarReserva = async (e) => {
    e.preventDefault();

    if (!/^\+569\d{8}$/.test(formulario.telefono)) {
      alert("❌ El teléfono debe comenzar con +569 y tener 8 dígitos más.");
      return;
    }

    if (!formulario.dia) {
      alert("❌ Debes seleccionar un día válido.");
      return;
    }

    if (totalReservas >= MAX_CUPOS_POR_DIA) {
      alert("❌ Lo siento, ya no quedan cupos disponibles.");
      return;
    }

    setEnviando(true);

    try {
      const snapshot = await getDocs(
        query(
          collection(db, "reservas"),
          where("dia", "==", formulario.dia),
          where("horario", "==", formulario.horario)
        )
      );

      if (snapshot.size >= 1) {
        alert("❌ Este horario ya no tiene cupos disponibles.");
        setEnviando(false);
        return;
      }

      // 1) Guardar en Firebase
      await addDoc(collection(db, "reservas"), formulario);

      // 2) Aviso por WhatsApp al cliente
      window.open(
        `https://wa.me/56955348010?text=${encodeURIComponent(
          `Hola ${formulario.nombre}, recibimos tu reserva para el servicio de "${formulario.servicioDeseado}" el día ${formulario.dia} a las ${formulario.horario}. Te responderemos dentro de 24 horas. ¡Gracias por confiar en nosotros!`
        )}`,
        "_blank"
      );

      // 3) Aviso por Email SOLO al ADMIN
      await enviarEmailAdmin();

      // 4) Limpiar y feedback visual
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
      alert("❌ Ocurrió un error. Intenta nuevamente.");
      setEnviando(false);
    }
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

          <label style={estilos.etiqueta}><FaPhoneAlt /> Teléfono (+569):</label>
          <input type="tel" name="telefono" value={formulario.telefono} onChange={manejarCambio} required placeholder="+56912345678" pattern="^\+569\d{8}$" style={estilos.input} disabled={enviando || exito} />

          <label style={estilos.etiqueta}><FaBuilding /> Tipo de empresa:</label>
          <select name="tipoEmpresa" value={formulario.tipoEmpresa} onChange={manejarCambio} style={estilos.input} disabled={enviando || exito}>
            <option value="Pyme">Pyme</option>
            <option value="Emprendedor">Emprendedor</option>
            <option value="Mediana empresa">Mediana empresa</option>
          </select>

          <label style={estilos.etiqueta}><FaCalendarAlt /> Día:</label>
          <select name="dia" value={formulario.dia} onChange={manejarDiaSeleccionado} required style={estilos.input} disabled={enviando || exito}>
            <option value="">Selecciona un día</option>
            {fechasDisponibles.map((fecha, i) => (
              <option key={i} value={fecha.toISOString().split("T")[0]}>
                {formatoFecha(fecha)}
              </option>
            ))}
          </select>

          <label style={estilos.etiqueta}><FaClock /> Horario:</label>
          <select name="horario" value={formulario.horario} onChange={manejarCambio} required style={estilos.input} disabled={enviando || exito || horariosDisponibles.length === 0}>
            {horariosDisponibles.length === 0
              ? ["09:00", "10:00", "11:00"].map((hora) => (
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

      <Link to="/" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ ...estilos.volver, ...(hover ? estilos.volverHover : {}) }}>
        ⬅️ Volver al Inicio
      </Link>
    </div>
  );
}
