// =============================
// src/components/BadgeDias.js
// =============================
import React from "react";

export default function BadgeDias({ style }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#0b0b0b",
    color: "#d4af50",
    border: "1px solid #d4af50",
    borderRadius: 999,
    padding: "6px 12px",
    fontWeight: 700,
    boxShadow: "0 0 10px rgba(212, 175, 80, 0.25)",
    letterSpacing: 0.3,
  };
  return (
    <span style={{ ...base, ...(style || {}) }}>
      ✨ Solo L–M–V • sin festivos
    </span>
  );
}

/*
USO sugerido (Inicio/Home):

// src/pages/Inicio.js (ejemplo)
import React from "react";
import { Link } from "react-router-dom";
import BadgeDias from "../components/BadgeDias";

export default function Inicio() {
  return (
    <main>
      <h2>Reserva tu Asesoría</h2>
      <div style={{ marginTop: 8 }}>
        <BadgeDias />
      </div>
      <p style={{ marginTop: 10 }}>Agenda disponible los días Lunes, Miércoles y Viernes.</p>
      <Link className="btn" to="/reserva">Reservar ahora</Link>
    </main>
  );
}
*/

// =============================
// src/pages/GerentePanel.js
// =============================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import "../styles/adminPanelEstilo-glass.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper fecha corta: 8 ago 2025
const MESES_CORTOS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const fechaCorta = (d) => {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MESES_CORTOS[date.getMonth()]} ${date.getFullYear()}`;
};

// WhatsApp admin (puedes cambiarlo)
const ADMIN_WHATSAPP = "+56955348010";

export default function GerentePanel() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]); // pendientes
  const [confirmadas, setConfirmadas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [tab, setTab] = useState("Resumen");
  const TABS = ["Resumen", "Confirmadas", "Pendientes"]; // Vista solo-lectura

  const printRef = useRef(null);

  useEffect(() => {
    const logged = localStorage.getItem("gerenteLogged");
    if (logged !== "true") navigate("/gerente-login");

    const unsubPend = onSnapshot(collection(db, "reservas"), (snap) =>
      setReservas(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubConf = onSnapshot(collection(db, "reservasConfirmadas"), (snap) =>
      setConfirmadas(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => {
      unsubPend();
      unsubConf();
    };
  }, [navigate]);

  // KPIs
  const hoyISO = new Date().toISOString().slice(0, 10);
  const kpiPendientes = reservas.length;
  const kpiConfirmadas = confirmadas.length;
  const kpiHoy = confirmadas.filter((r) => (r.dia || "").startsWith(hoyISO)).length;
  const kpiSemana = useMemo(() => {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 7);
    return confirmadas.filter((r) => {
      const d = new Date(r.dia);
      return d >= now && d <= end;
    }).length;
  }, [confirmadas]);

  const filtrar = (lista) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((r) => (r.nombre || "").toLowerCase().includes(q));
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
      const nombreArchivo = `GerentePanel_${new Date().toISOString().slice(0,19).replace(/[:T]/g, "-")}.pdf`;
      pdf.save(nombreArchivo);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo exportar el PDF");
    }
  };

  return (
    <div className="fondo-admin">
      <header className="barra-superior" style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2 className="titulo" style={{ margin: 0 }}>📊 Panel del Gerente</h2>
          <span className="chip-info">Vista ejecutiva</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={() => navigate("/")}>🏠 Inicio</button>
          <button className="btn btn-secondary" onClick={exportarPDF}>🧾 Exportar PDF</button>
          <button
            className="btn btn-danger"
            onClick={() => {
              localStorage.removeItem("gerenteLogged");
              navigate("/gerente-login");
            }}
          >🚪 Cerrar Sesión</button>
        </div>
      </header>

      {/* Contenido exportable */}
      <div ref={printRef}>
        {/* KPIs */}
        <section className="resumen-panel" style={{ marginTop: 12 }}>
          <div className="tarjeta-resumen kpi-ok">
            <h3>📋 Pendientes</h3>
            <p>{kpiPendientes}</p>
          </div>
          <div className="tarjeta-resumen kpi-ok">
            <h3>✅ Confirmadas</h3>
            <p>{kpiConfirmadas}</p>
          </div>
          <div className="tarjeta-resumen kpi-ok">
            <h3>📅 Hoy</h3>
            <p>{kpiHoy}</p>
          </div>
          <div className="tarjeta-resumen kpi-ok">
            <h3>🗓️ Próx. 7 días</h3>
            <p>{kpiSemana}</p>
          </div>
        </section>

        {/* Tabs + búsqueda */}
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={`tab-${t}`}
              className={`tab-btn ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >{t}</button>
          ))}
          <div className="spacer" />
          <input
            className="input input-compact"
            placeholder="Buscar cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </nav>

        {/* TAB Resumen */}
        {tab === "Resumen" && (
          <section>
            <div className="tarjeta">
              <h3 className="subtitulo" style={{ marginTop: 0 }}>✅ Próximas confirmadas</h3>
              {filtrar(confirmadas).length === 0 ? (
                <div className="tarjeta vacio">Sin datos</div>
              ) : (
                filtrar(confirmadas)
                  .sort((a,b) => new Date(a.dia) - new Date(b.dia))
                  .slice(0, 10)
                  .map((r) => (
                    <div key={r.id} className="fila-reserva tarjeta">
                      <div className="reserva-info">
                        <div className="reserva-nombre">
                          <strong>{r.nombre}</strong>
                          <span className="chip chip-ok">Confirmada</span>
                        </div>
                        <div className="reserva-detalles">
                          <span>📧 {r.email}</span>
                          <span>📱 {r.telefono}</span>
                          <span>🛠️ {r.servicioDeseado || "—"}</span>
                        </div>
                        <div className="reserva-fecha">
                          <span>🗓️ {r.dia}</span>
                          <span>⏰ {r.horario}</span>
                        </div>
                      </div>
                      <div className="reserva-acciones">
                        <a className="btn btn-ghost" href={linkWhatsapp(r)} target="_blank" rel="noreferrer">📲 WhatsApp</a>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        )}

        {/* TAB Confirmadas */}
        {tab === "Confirmadas" && (
          <section>
            {filtrar(confirmadas).length === 0 ? (
              <div className="tarjeta vacio">No hay reservas confirmadas.</div>
            ) : (
              filtrar(confirmadas).map((r) => (
                <div key={r.id} className="tarjeta fila-reserva">
                  <div className="reserva-info">
                    <div className="reserva-nombre">
                      <strong>{r.nombre}</strong>
                      <span className="chip chip-ok">Confirmada</span>
                    </div>
                    <div className="reserva-detalles">
                      <span>📧 {r.email}</span>
                      <span>📱 {r.telefono}</span>
                      <span>🛠️ {r.servicioDeseado || "—"}</span>
                    </div>
                    <div className="reserva-fecha">
                      <span>🗓️ {r.dia}</span>
                      <span>⏰ {r.horario}</span>
                    </div>
                  </div>
                  <div className="reserva-acciones">
                    <a className="btn btn-ghost" href={linkWhatsapp(r)} target="_blank" rel="noreferrer">📲 WhatsApp</a>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB Pendientes */}
        {tab === "Pendientes" && (
          <section>
            {filtrar(reservas).length === 0 ? (
              <div className="tarjeta vacio">No hay reservas pendientes.</div>
            ) : (
              filtrar(reservas).map((r) => (
                <div key={r.id} className="tarjeta fila-reserva">
                  <div className="reserva-info">
                    <div className="reserva-nombre">
                      <strong>{r.nombre}</strong>
                      <span className="chip">Pendiente</span>
                    </div>
                    <div className="reserva-detalles">
                      <span>📧 {r.email}</span>
                      <span>📱 {r.telefono}</span>
                      <span>🛠️ {r.servicioDeseado || "—"}</span>
                    </div>
                    <div className="reserva-fecha">
                      <span>🗓️ {r.dia}</span>
                      <span>⏰ {r.horario}</span>
                    </div>
                  </div>
                  <div className="reserva-acciones">
                    <a className="btn btn-ghost" href={linkWhatsapp(r)} target="_blank" rel="noreferrer">📲 WhatsApp</a>
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

/*
Asegura la ruta en tu App.js:

import GerentePanel from "./pages/GerentePanel";
...
<Route path="/gerente-panel" element={<GerentePanel />} />
*/
