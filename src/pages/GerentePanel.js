// src/pages/GerentePanel.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  getDocs,
  query,
  limit,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { ensureAuth } from "../utils/ensureAuth";
import "../styles/adminPanelEstilo-glass.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper fecha corta
const MESES_CORTOS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const fechaCorta = (d) => {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MESES_CORTOS[date.getMonth()]} ${date.getFullYear()}`;
};

// WhatsApp del admin
const ADMIN_WHATSAPP = "+56955348010";

export default function GerentePanel() {
  const navigate = useNavigate();

  const [reservasConfirmadas, setReservasConfirmadas] = useState([]);
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [cargaPorEmpleado, setCargaPorEmpleado] = useState([]);

  // UI
  const [busqueda, setBusqueda] = useState("");
  const TABS = ["Resumen", "Confirmadas", "Pendientes"];
  const [tab, setTab] = useState("Resumen");

  // PDF
  const printRef = useRef(null);

  // Estado del borrado masivo
  const [reseteando, setReseteando] = useState(false);

  useEffect(() => {
    // 🔒 Protección de ruta (UI)
    const logged = localStorage.getItem("gerenteLogged");
    if (logged !== "true") {
      navigate("/gerente-login");
      return;
    }

    let unsubPendientes = () => {};
    let unsubConfirmadas = () => {};
    let unsubProyectos = () => {};

    (async () => {
      try {
        // 👇 Necesario para permisos Firestore
        await ensureAuth();

        unsubPendientes = onSnapshot(
          collection(db, "reservas"),
          (snapshot) => setReservasPendientes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
          (err) => console.error("reservas listener:", err)
        );

        unsubConfirmadas = onSnapshot(
          collection(db, "reservasConfirmadas"),
          (snapshot) => setReservasConfirmadas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
          (err) => console.error("confirmadas listener:", err)
        );

        unsubProyectos = onSnapshot(
          collection(db, "proyectos"),
          (snapshot) => {
            const listaProyectos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            // Calcular carga por empleado
            const carga = {};
            listaProyectos.forEach((proy) => {
              proy.responsables?.forEach((resp) => {
                carga[resp] = (carga[resp] || 0) + 1;
              });
            });
            const cargaArray = Object.entries(carga).map(([empleado, cantidad]) => ({ empleado, cantidad }));
            setCargaPorEmpleado(cargaArray);
          },
          (err) => console.error("proyectos listener:", err)
        );
      } catch (e) {
        console.error(e);
        toast.error("No se pudo iniciar la sesión con Firebase.");
      }
    })();

    return () => {
      unsubPendientes?.();
      unsubConfirmadas?.();
      unsubProyectos?.();
    };
  }, [navigate]);

  // KPIs
  const kpiPendientes = reservasPendientes.length;
  const kpiConfirmadas = reservasConfirmadas.length;

  const kpiHoy = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
    const start = new Date(y, m, d);
    const end = new Date(y, m, d + 1);
    return reservasConfirmadas.filter((r) => {
      const dt = new Date(r.dia);
      return dt >= start && dt < end;
    }).length;
  }, [reservasConfirmadas]);

  const kpiSemana = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return reservasConfirmadas.filter((r) => {
      const dt = new Date(r.dia);
      return dt >= start && dt < end;
    }).length;
  }, [reservasConfirmadas]);

  // Filtro por nombre
  const filtrar = (lista) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((r) => (r.nombre || "").toLowerCase().includes(q));
  };

  // Mensaje WhatsApp (texto nuevo)
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

  // Exportar PDF (import dinámico)
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

  // 🗑️ Vaciar toda la colección 'reservasHistorial' (solo gerente)
  const vaciarHistorial = async () => {
    if (reseteando) return;
    const confirm1 = window.confirm("⚠️ Esto eliminará TODO el historial. ¿Continuar?");
    if (!confirm1) return;

    const texto = window.prompt('Para confirmar escribe: ELIMINAR');
    if (texto !== "ELIMINAR") {
      toast.info("Operación cancelada");
      return;
    }

    try {
      setReseteando(true);
      await ensureAuth();

      const pageSize = 200; // borra en lotes
      let total = 0;

      while (true) {
        const snap = await getDocs(query(collection(db, "reservasHistorial"), limit(pageSize)));
        if (snap.empty) break;
        await Promise.all(
          snap.docs.map((d) => deleteDoc(doc(db, "reservasHistorial", d.id)))
        );
        total += snap.size;
        // Si trajo menos que el límite, ya no quedan más docs
        if (snap.size < pageSize) break;
      }

      toast.success(`Historial eliminado (${total} documentos)`);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo vaciar el historial");
    } finally {
      setReseteando(false);
    }
  };

  return (
    <div className="fondo-admin">
      {/* TOP BAR */}
      <header className="barra-superior" style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2 className="titulo" style={{ margin: 0 }}>📊 Panel del Gerente</h2>
          <span className="chip-info">Vista ejecutiva</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={() => navigate("/")}>🏠 Inicio</button>
          <button className="btn btn-ghost" onClick={() => navigate("/admin-panel")}>⬅️ Volver a AdminPanel</button>
          <button className="btn btn-ghost" onClick={() => navigate("/historial-reservas")}>📜 Historico</button>

          {/* 🔹 Reemplazamos la navegación por un botón real que borra el historial */}
          <button
            className="btn btn-ghost"
            onClick={vaciarHistorial}
            disabled={reseteando}
            title="Borra por completo la colección 'reservasHistorial'"
          >
            {reseteando ? "⏳ Vaciando..." : "🗑️ Vaciar Historial"}
          </button>

          <button className="btn btn-primary" onClick={exportarPDF}>🧾 Exportar PDF</button>
          <button
            className="btn btn-danger"
            onClick={() => {
              localStorage.removeItem("gerenteLogged");
              navigate("/gerente-login");
            }}
          >
            🚪 Cerrar sesión
          </button>
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

        {/* TABS + BÚSQUEDA */}
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

        {/* TAB RESUMEN */}
        {tab === "Resumen" && (
          <section>
            {/* Próximas confirmadas (top 10) */}
            <div className="tarjeta">
              <h3 className="subtitulo" style={{ marginTop: 0 }}>✅ Próximas confirmadas</h3>
              {filtrar(reservasConfirmadas).length === 0 ? (
                <div className="tarjeta vacio">Sin datos</div>
              ) : (
                filtrar(reservasConfirmadas)
                  .sort((a, b) => new Date(a.dia) - new Date(b.dia))
                  .slice(0, 10)
                  .map((r, i) => (
                    <div key={`resumen-${r.id}-${i}`} className="fila-reserva tarjeta">
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

            {/* Carga de trabajo por empleado */}
            <div className="tarjeta" style={{ marginTop: 16 }}>
              <h3 className="subtitulo" style={{ marginTop: 0 }}>👥 Carga de Trabajo</h3>
              {cargaPorEmpleado.length === 0 ? (
                <div>No hay proyectos asignados</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {cargaPorEmpleado.map((empleado, i) => (
                    <div className="tarjeta" key={`emp-${empleado.empleado}-${i}`}>
                      <p><strong>Empleado:</strong> {empleado.empleado}</p>
                      <p><strong>Proyectos asignados:</strong> {empleado.cantidad}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB CONFIRMADAS */}
        {tab === "Confirmadas" && (
          <section>
            {filtrar(reservasConfirmadas).length === 0 ? (
              <div className="tarjeta vacio">No hay reservas confirmadas.</div>
            ) : (
              filtrar(reservasConfirmadas).map((r, i) => (
                <div key={`conf-${r.id}-${i}`} className="tarjeta fila-reserva">
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

        {/* TAB PENDIENTES */}
        {tab === "Pendientes" && (
          <section>
            {filtrar(reservasPendientes).length === 0 ? (
              <div className="tarjeta vacio">No hay reservas pendientes.</div>
            ) : (
              filtrar(reservasPendientes).map((r, i) => (
                <div key={`pend-${r.id}-${i}`} className="tarjeta fila-reserva">
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
