// src/pages/AdminPanel.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";

// Usa SOLO el estilo glass
import "../styles/adminPanelEstilo-glass.css";

import {
  collection,
  onSnapshot,
  deleteDoc,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";
// db lo cargamos en diferido
import { ensureAuth } from "../utils/ensureAuth";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Opcional: EmailJS (completa tus IDs para activarlo)
import emailjs from "@emailjs/browser";
const EMAILJS_SERVICE_ID = "service_xxx";
const EMAILJS_TEMPLATE_ID_CONFIRM = "template_confirmacion_admin";
const EMAILJS_PUBLIC_KEY = "PUBLIC_KEY";

// WhatsApp admin
const ADMIN_WHATSAPP = "+56955348010";

// ==== Helpers de fecha (formato corto: 8 ago 2025) ====
const MESES_CORTOS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const fechaCorta = (d) => {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MESES_CORTOS[date.getMonth()]} ${date.getFullYear()}`;
};

export default function AdminPanel() {
  const navigate = useNavigate();

  // ====== DATA ======
  const [reservas, setReservas] = useState([]);
  const [reservasConfirmadas, setReservasConfirmadas] = useState([]);
  const [proyectos, setProyectos] = useState([]);

  // 🔑 db cargado en diferido (evita ciclo de imports)
  const [dbRef, setDbRef] = useState(null);

  // ====== UI / TABS ======
  const TABS = ["Pendientes", "Confirmadas", "Subir Proyecto", "Proyectos"];
  const [tab, setTab] = useState("Pendientes");
  const [busqueda, setBusqueda] = useState("");

  // ====== REF para PDF ======
  const printRef = useRef(null);

  // ====== FORM PROYECTO ======
  const [formularioProyecto, setFormularioProyecto] = useState({
    cliente: "",
    fechaInicio: "",
    fechaFin: "",
    responsables: [],
    archivos: "",
    archivoData: "",
    archivoNombre: "",
    linkMeet: "",
  });
  const [editId, setEditId] = useState(null);
  const posiblesResponsables = ["Nicolás", "Eliana", "Sebastián"];

  // ====== AUTH & SNAPSHOTS ======
  useEffect(() => {
    const logged = localStorage.getItem("adminLogged");
    if (logged !== "true") {
      navigate("/admin-login");
      return;
    }

    let unsubPend = () => {};
    let unsubConf = () => {};
    let unsubProy = () => {};

    (async () => {
      try {
        // 👇 Imprescindible para que Firestore permita leer
        await ensureAuth();

        // 👉 carga db después de montar (corta cualquier ciclo)
        const { db } = await import("../firebase");
        setDbRef(db);

        unsubPend = onSnapshot(
          collection(db, "reservas"),
          (snap) => setReservas(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
          (err) => console.error("reservas listener:", err)
        );
        unsubConf = onSnapshot(
          collection(db, "reservasConfirmadas"),
          (snap) => setReservasConfirmadas(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
          (err) => console.error("confirmadas listener:", err)
        );
        unsubProy = onSnapshot(
          collection(db, "proyectos"),
          (snap) => setProyectos(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
          (err) => console.error("proyectos listener:", err)
        );
      } catch (e) {
        console.error(e);
        toast.error("No se pudo iniciar la sesión con Firebase.");
      }
    })();

    return () => {
      unsubPend?.();
      unsubConf?.();
      unsubProy?.();
    };
  }, [navigate]);

  // ====== HELPERS ======
  const guardarEnHistorial = async (reserva, estado) => {
    if (!dbRef) return;
    await ensureAuth();
    await addDoc(collection(dbRef, "reservasHistorial"), {
      ...reserva,
      estado,
      fechaRegistro: new Date().toISOString(),
    });
  };

  const linkWhatsapp = (reserva) => {
    const tel = ADMIN_WHATSAPP.replace(/\D/g, "");
    const fechaReserva = fechaCorta(new Date());
    const fechaReunion = fechaCorta(reserva?.dia || "");
    const txt = encodeURIComponent(
      `Hola ${reserva?.nombre || ""}, recibimos tu reserva el ${fechaReserva} para el servicio de "${reserva?.servicioDeseado || ""}".\n` +
      `Tu reunión es el ${fechaReunion} a las ${reserva?.horario || ""}.\n` +
      `Te entregaremos el link para que te conectes un día antes de la reunión.\n` +
      `¡Gracias por confiar en nosotros!`
    );
    return `https://wa.me/${tel}?text=${txt}`;
  };

  const confirmarReserva = async (reserva) => {
    if (!dbRef) return;
    await ensureAuth();
    const r = { ...reserva, estado: "confirmada", fechaConfirmacion: new Date().toISOString() };
    try {
      await addDoc(collection(dbRef, "reservasConfirmadas"), r);
      await guardarEnHistorial(r, "confirmada");
      await deleteDoc(doc(dbRef, "reservas", reserva.id));
      toast.success(`✅ Confirmada: ${reserva.nombre}`);

      if (EMAILJS_SERVICE_ID !== "service_xxx") {
        try {
          const fechaReserva = fechaCorta(new Date());
          const fechaReunion = fechaCorta(reserva?.dia || "");
          const mensaje =
            `Hola ${reserva?.nombre || ""}, recibimos tu reserva el ${fechaReserva} para el servicio de "${reserva?.servicioDeseado || ""}".\n` +
            `Tu reunión es el ${fechaReunion} a las ${reserva?.horario || ""}.\n` +
            `Te entregaremos el link para que te conectes un día antes de la reunión.\n` +
            `¡Gracias por confiar en nosotros!`;

          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID_CONFIRM,
            {
              asunto: `Reserva confirmada — ${reserva?.nombre || ""}`,
              mensaje,
              email_admin: "sebastian.valenzuela.fsurf@gmail.com",
              nombre: reserva?.nombre || "",
              servicioDeseado: reserva?.servicioDeseado || "",
              dia: reserva?.dia || "",
              horario: reserva?.horario || "",
            },
            { publicKey: EMAILJS_PUBLIC_KEY }
          );
        } catch (e) {
          console.warn("EmailJS no configurado o falló:", e);
        }
      }
    } catch (err) {
      toast.error(`❌ Error al confirmar: ${err?.message || err}`);
    }
  };

  const eliminarReservaPendiente = async (id) => {
    if (!dbRef) return;
    await ensureAuth();
    const r = reservas.find((x) => x.id === id);
    if (!window.confirm("¿Eliminar esta reserva pendiente?")) return;
    try {
      if (r) await guardarEnHistorial(r, "eliminada");
      await deleteDoc(doc(dbRef, "reservas", id));
      toast.info("🗑️ Reserva eliminada");
    } catch (err) {
      toast.error(`❌ Error al eliminar: ${err.message}`);
    }
  };

  const eliminarReservaConfirmada = async (id) => {
    if (!dbRef) return;
    await ensureAuth();
    if (!window.confirm("¿Eliminar esta reserva confirmada?")) return;
    try {
      await deleteDoc(doc(dbRef, "reservasConfirmadas", id));
      toast.info("🗑️ Eliminada de confirmadas");
    } catch (err) {
      toast.error(`❌ Error al eliminar: ${err.message}`);
    }
  };

  const clienteTieneReservaConfirmada = (cliente) =>
    reservasConfirmadas.some(
      (r) => (r.nombre || "").toLowerCase() === (cliente || "").toLowerCase()
    );

  // ====== FORM PROYECTO ======
  const onChangeProyecto = (e) =>
    setFormularioProyecto({ ...formularioProyecto, [e.target.name]: e.target.value });

  const toggleResponsable = (nombre) => {
    const { responsables } = formularioProyecto;
    setFormularioProyecto({
      ...formularioProyecto,
      responsables: responsables.includes(nombre)
        ? responsables.filter((r) => r !== nombre)
        : [...responsables, nombre],
    });
  };

  const manejarArchivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setFormularioProyecto((p) => ({
        ...p,
        archivoData: reader.result,
        archivoNombre: file.name,
        archivos: "",
      }));
    reader.readAsDataURL(file);
  };

  const guardarProyecto = async (e) => {
    e.preventDefault();
    if (!dbRef) return;
    await ensureAuth();
    const f = formularioProyecto;

    if (!clienteTieneReservaConfirmada(f.cliente)) {
      toast.warn("⚠️ El cliente no tiene una reserva confirmada");
      return;
    }
    if (
      !f.cliente ||
      !f.fechaInicio ||
      !f.fechaFin ||
      f.responsables.length === 0 ||
      (!f.archivos && !f.archivoData)
    ) {
      toast.warn("⚠️ Completa todos los campos obligatorios");
      return;
    }
    if (new Date(f.fechaFin) < new Date(f.fechaInicio)) {
      toast.warn("⚠️ La fecha de fin no puede ser menor a la de inicio");
      return;
    }

    try {
      if (editId) {
        await setDoc(doc(dbRef, "proyectos", editId), f);
        toast.success("💾 Proyecto actualizado");
      } else {
        await addDoc(collection(dbRef, "proyectos"), f);
        toast.success("📤 Proyecto subido");
      }
      setFormularioProyecto({
        cliente: "",
        fechaInicio: "",
        fechaFin: "",
        responsables: [],
        archivos: "",
        archivoData: "",
        archivoNombre: "",
        linkMeet: "",
      });
      setEditId(null);
      setTab("Proyectos");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(`❌ Error al guardar: ${err.message}`);
    }
  };

  const editarProyecto = (p) => {
    setFormularioProyecto(p);
    setEditId(p.id);
    setTab("Subir Proyecto");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarProyecto = async (id) => {
    if (!dbRef) return;
    await ensureAuth();
    if (!window.confirm("¿Eliminar este proyecto?")) return;
    try {
      await deleteDoc(doc(dbRef, "proyectos", id));
      toast.info("🗑️ Proyecto eliminado");
    } catch (err) {
      toast.error(`❌ Error al eliminar proyecto: ${err.message}`);
    }
  };

  // ====== PDF ======
  const exportarPDF = async () => {
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const area = printRef.current;
      if (!area) return;

      const canvas = await html2canvas(area, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const nombreArchivo = `AdminPanel_${tab}_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.pdf`;
      pdf.save(nombreArchivo);
    } catch (e) {
      console.error(e);
      toast.error("❌ No se pudo exportar el PDF");
    }
  };

  // ====== FILTROS VISUALES ======
  const reservasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return reservas;
    return reservas.filter((r) => (r.nombre || "").toLowerCase().includes(q));
  }, [reservas, busqueda]);

  const confirmadasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return reservasConfirmadas;
    return reservasConfirmadas.filter((r) => (r.nombre || "").toLowerCase().includes(q));
  }, [reservasConfirmadas, busqueda]);

  // ====== UI ======
  return (
    <div className="fondo-admin">
      {/* TOP BAR */}
      <header className="barra-superior" style={{ position: "sticky", top: 0, zIndex: 10 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
    <h2 className="titulo" style={{ margin: 0 }}>🛠️ Panel de Administración</h2>
    <span className="chip-info">Versión Admin</span>
  </div>
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    <button className="btn btn-ghost" onClick={() => navigate("/")}>🏠 Inicio</button>
    <button className="btn btn-ghost" onClick={() => navigate("/historial-reservas")}>📜 Historico</button>
    <button className="btn btn-ghost" onClick={() => navigate("/gerente-login")}>🧑‍💼 Gerente Login</button>
    {/* 🔹 Eliminado el botón "Resetear Historial" */}
    <button className="btn btn-primary" onClick={exportarPDF}>🧾 Exportar PDF (vista)</button>
    <button
      className="btn btn-danger"
      onClick={() => {
        localStorage.removeItem("adminLogged");
        navigate("/admin-login");
      }}
    >
      🚪 Cerrar Sesión
    </button>
  </div>
</header>

      {/* Contenido capturable en PDF */}
      <div ref={printRef}>
        {/* KPIs */}
        <section className="resumen-panel" style={{ marginTop: 12 }}>
          <div className="tarjeta-resumen kpi-ok">
            <h3>📋 Pendientes</h3>
            <p>{reservas.length}</p>
          </div>
          <div className="tarjeta-resumen kpi-ok">
            <h3>✅ Confirmadas</h3>
            <p>{reservasConfirmadas.length}</p>
          </div>
          <div className="tarjeta-resumen kpi-ok">
            <h3>📂 Proyectos</h3>
            <p>{proyectos.length}</p>
          </div>
        </section>

        {/* TABS */}
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={`tab-${t}`}
              className={`tab-btn ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
          <div className="spacer" />
          <input
            className="input input-compact"
            placeholder="Buscar cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </nav>

        {/* TAB: PENDIENTES */}
        {tab === "Pendientes" && (
          <section>
            {reservasFiltradas.length === 0 ? (
              <div className="tarjeta vacio">No hay reservas pendientes.</div>
            ) : (
              reservasFiltradas.map((reserva, i) => (
                <div key={`pend-${reserva.id}-${i}`} className="tarjeta fila-reserva">
                  <div className="reserva-info">
                    <div className="reserva-nombre">
                      <strong>{reserva.nombre}</strong>
                      <span className="chip">{reserva.rubro || "—"}</span>
                    </div>
                    <div className="reserva-detalles">
                      <span>📧 {reserva.email}</span>
                      <span>📱 {reserva.telefono}</span>
                      <span>🏢 {reserva.nombreEmpresa || "—"}</span>
                    </div>
                    <div className="reserva-fecha">
                      <span>🗓️ {reserva.dia}</span>
                      <span>⏰ {reserva.horario}</span>
                    </div>
                  </div>
                  <div className="reserva-acciones">
                    <a className="btn btn-ghost" href={linkWhatsapp(reserva)} target="_blank" rel="noreferrer">📲 WhatsApp</a>
                    <button className="btn btn-primary" onClick={() => confirmarReserva(reserva)}>✅ Confirmar</button>
                    <button className="btn btn-danger" onClick={() => eliminarReservaPendiente(reserva.id)}>🗑️ Eliminar</button>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB: CONFIRMADAS */}
        {tab === "Confirmadas" && (
          <section>
            {reservasConfirmadas.length === 0 ? (
              <div className="tarjeta vacio">No hay reservas confirmadas.</div>
            ) : (
              confirmadasFiltradas.map((reserva, i) => (
                <div key={`conf-${reserva.id}-${i}`} className="tarjeta fila-reserva">
                  <div className="reserva-info">
                    <div className="reserva-nombre">
                      <strong>{reserva.nombre}</strong>
                      <span className="chip chip-ok">Confirmada</span>
                    </div>
                    <div className="reserva-detalles">
                      <span>📧 {reserva.email}</span>
                      <span>📱 {reserva.telefono}</span>
                      <span>🏢 {reserva.nombreEmpresa || "—"}</span>
                    </div>
                    <div className="reserva-fecha">
                      <span>🗓️ {reserva.dia}</span>
                      <span>⏰ {reserva.horario}</span>
                    </div>
                  </div>
                  <div className="reserva-acciones">
                    <a className="btn btn-ghost" href={linkWhatsapp({ ...reserva, estado: "confirmada" })} target="_blank" rel="noreferrer">📲 WhatsApp</a>
                    <button className="btn btn-danger" onClick={() => eliminarReservaConfirmada(reserva.id)}>🗑️ Eliminar</button>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB: SUBIR PROYECTO */}
        {tab === "Subir Proyecto" && (
          <section className="tarjeta">
            <h3 className="subtitulo" style={{ marginTop: 0 }}>📁 Subir Proyecto</h3>

            <label className="label">Cliente</label>
            <input
              type="text"
              name="cliente"
              className="input"
              value={formularioProyecto.cliente}
              onChange={onChangeProyecto}
              placeholder="Nombre exactamente como en la reserva"
            />

            <div className="grid-2">
              <div>
                <label className="label">Desde</label>
                <DatePicker
                  selected={formularioProyecto.fechaInicio ? new Date(formularioProyecto.fechaInicio) : null}
                  onChange={(date) =>
                    setFormularioProyecto({ ...formularioProyecto, fechaInicio: date.toISOString() })
                  }
                  dateFormat="yyyy-MM-dd"
                  locale={es}
                  className="calendario"
                />
              </div>
              <div>
                <label className="label">Hasta</label>
                <DatePicker
                  selected={formularioProyecto.fechaFin ? new Date(formularioProyecto.fechaFin) : null}
                  onChange={(date) =>
                    setFormularioProyecto({ ...formularioProyecto, fechaFin: date.toISOString() })
                  }
                  dateFormat="yyyy-MM-dd"
                  locale={es}
                  className="calendario"
                />
              </div>
            </div>

            <label className="label">Responsables</label>
            <div className="contenedor-responsables">
              {posiblesResponsables.map((n) => {
                const activo = formularioProyecto.responsables.includes(n);
                return (
                  <button
                    type="button"
                    key={`resp-${n}`}
                    className={`chip-toggle ${activo ? "on" : ""}`}
                    onClick={() => toggleResponsable(n)}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <label className="label">Link de archivo (opcional)</label>
            <input
              type="text"
              name="archivos"
              className="input"
              value={formularioProyecto.archivos}
              onChange={onChangeProyecto}
              placeholder="https://..."
            />

            <label className="label">O subir archivo</label>
            <input type="file" onChange={manejarArchivo} className="input" />
            {formularioProyecto.archivoNombre && <p>📎 {formularioProyecto.archivoNombre}</p>}

            <label className="label">Link de Meet (opcional)</label>
            <input
              type="text"
              name="linkMeet"
              className="input"
              value={formularioProyecto.linkMeet}
              onChange={onChangeProyecto}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
            />

            <div className="barra-superior" style={{ gap: 8, flexWrap: "wrap" }}>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={guardarProyecto}
                disabled={!clienteTieneReservaConfirmada(formularioProyecto.cliente) || !dbRef}
              >
                {editId ? "💾 Actualizar Proyecto" : "📤 Subir Proyecto"}
              </button>
              {editId && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setFormularioProyecto({
                      cliente: "",
                      fechaInicio: "",
                      fechaFin: "",
                      responsables: [],
                      archivos: "",
                      archivoData: "",
                      archivoNombre: "",
                      linkMeet: "",
                    });
                    setEditId(null);
                  }}
                >
                  ❌ Cancelar edición
                </button>
              )}
            </div>

            {!clienteTieneReservaConfirmada(formularioProyecto.cliente) && (
              <p className="texto-bloqueado">⚠ Requiere reserva confirmada</p>
            )}
          </section>
        )}

        {/* TAB: PROYECTOS */}
        {tab === "Proyectos" && (
          <section>
            {proyectos.length === 0 ? (
              <div className="tarjeta vacio">Sin proyectos cargados.</div>
            ) : (
              proyectos.map((p, i) => (
                <div key={`proy-${p.id}-${i}`} className="tarjeta fila-proyecto">
                  <div className="proy-info">
                    <div className="proy-titulo">
                      <strong>{p.nombreProyecto || "(Proyecto sin nombre)"}</strong>
                      <span className="chip">{p.cliente}</span>
                    </div>
                    <div className="proy-detalles">
                      <span>📅 {new Date(p.fechaInicio).toLocaleDateString()} → {new Date(p.fechaFin).toLocaleDateString()}</span>
                      <span>👥 {p.responsables?.join(", ")}</span>
                    </div>
                    {p.archivos && (
                      <div>
                        <a href={p.archivos} target="_blank" rel="noreferrer" className="link">
                          📎 Ver archivo
                        </a>
                      </div>
                    )}
                    {p.archivoNombre && <div>📄 {p.archivoNombre}</div>}
                    {p.linkMeet && (
                      <div>
                        <a href={p.linkMeet} target="_blank" rel="noreferrer" className="link">
                          🎥 Meet
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="proy-acciones">
                    <button className="btn btn-primary" onClick={() => editarProyecto(p)}>✏️ Editar</button>
                    <button className="btn btn-danger" onClick={() => eliminarProyecto(p.id)}>🗑️ Eliminar</button>
                  </div>
                </div>
              ))
            )}
          </section>
        )}
      </div>

      <ToastContainer position="bottom-center" autoClose={2500} hideProgressBar />
    </div>
  );
}
