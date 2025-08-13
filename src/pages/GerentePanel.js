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
const ADMIN_WHATSAPP = "+56930053314";

// Fallback por si la colección 'empleados' no existe o no hay permisos
const BASE_MINIMA = ["Nicolás", "Eliana", "Sebastián"];
const DEFAULT_CAP = 5;

// Helpers WA
const waSanitize = (phone) => String(phone || "").replace(/\D/g, "");
const waUrl = (phone, text) =>
  `https://wa.me/${waSanitize(phone)}?text=${encodeURIComponent(text || "")}`;

// Link a WhatsApp del CLIENTE
const linkWhatsapp = (reserva) => {
  const tel = waSanitize(reserva?.telefono);
  if (!tel) return "#";
  const fechaReserva = fechaCorta(new Date());
  const fechaReunion = fechaCorta(reserva?.dia || "");
  const txt =
    `Hola ${reserva?.nombre || ""}, recibimos tu reserva el ${fechaReserva} para el servicio de "${reserva?.servicioDeseado || ""}".\n` +
    `Tu reunión es el ${fechaReunion} a las ${reserva?.horario || ""}.\n` +
    `Te entregaremos el link para que te conectes un día antes de la reunión.\n` +
    `¡Gracias por confiar en nosotros!`;
  return waUrl(tel, txt);
};

// Link a WhatsApp del ADMIN con resumen
const linkWhatsappAdmin = (reserva) => {
  const txt =
    `📢 Nueva reserva\n` +
    `👤 ${reserva?.nombre || ""} | ${reserva?.email || ""}\n` +
    `📱 ${reserva?.telefono || ""}\n` +
    `🛠️ ${reserva?.servicioDeseado || ""}\n` +
    `📅 ${reserva?.dia || ""} ⏰ ${reserva?.horario || ""}\n` +
    `🏢 ${reserva?.nombreEmpresa || ""} • ${reserva?.tipoEmpresa || ""}\n` +
    `Rubro: ${reserva?.rubro || ""}`;
  return waUrl(ADMIN_WHATSAPP, txt);
};

// ── UI helpers para la barra semáforo (según % de capacidad) ────────────────
const barColor = (p) => {
  // Verde <50, Amarillo 50–80, Rojo >80
  if (p > 80) return "linear-gradient(90deg, #9b1c1c, #ef4444)";
  if (p >= 50) return "linear-gradient(90deg, #a16207, #f59e0b)";
  return "linear-gradient(90deg, #166534, #22c55e)";
};
const barShadow = (p) => {
  if (p > 80) return "0 0 10px rgba(239, 68, 68, .35)";
  if (p >= 50) return "0 0 10px rgba(245, 158, 11, .35)";
  return "0 0 10px rgba(34, 197, 94, .35)";
};
const pctWidth = (p) => `${Math.max(p, 2)}%`; // asegura visibilidad mínima

export default function GerentePanel() {
  const navigate = useNavigate();

  const [reservasConfirmadas, setReservasConfirmadas] = useState([]);
  const [reservasPendientes, setReservasPendientes] = useState([]);

  // Datos crudos
  const [proyectos, setProyectos] = useState([]);
  const [empleadosBase, setEmpleadosBase] = useState([]); // [{nombre, capacidad, activo?}]
  const [warnEmpleados, setWarnEmpleados] = useState(false); // para no spamear el toast

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
    let unsubEmpleados = () => {};

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

        // 📁 Proyectos (para conteo de asignaciones)
        unsubProyectos = onSnapshot(
          collection(db, "proyectos"),
          (snapshot) => setProyectos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
          (err) => console.error("proyectos listener:", err)
        );

        // 👥 Empleados base desde Firestore (con fallback si faltan permisos)
        unsubEmpleados = onSnapshot(
          collection(db, "empleados"),
          (snap) => {
            const lista = snap.docs
              .map((d) => {
                const data = d.data() || {};
                return {
                  nombre: data.nombre,
                  capacidad: Number(data.capacidad) > 0 ? Number(data.capacidad) : DEFAULT_CAP,
                  activo: data.activo !== false, // por defecto activos
                };
              })
              .filter((e) => !!e.nombre);
            setEmpleadosBase(lista);
          },
          (err) => {
            console.error("empleados listener:", err);
            // Fallback silencioso + un aviso (solo una vez)
            setEmpleadosBase(
              BASE_MINIMA.map((n) => ({ nombre: n, capacidad: DEFAULT_CAP, activo: true }))
            );
            if (!warnEmpleados) {
              toast.warn("Sin permisos para 'empleados'. Usando lista base local.", { autoClose: 3000 });
              setWarnEmpleados(true);
            }
          }
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
      unsubEmpleados?.();
    };
  }, [navigate, warnEmpleados]);

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

  // 📊 Deriva Carga por empleado (carga vs capacidad, incluye 0 asign.)
  const cargaPorEmpleado = useMemo(() => {
    // Conteo de asignaciones por persona
    const asignacionesPorEmpleado = {};
    const vistos = new Set();

    proyectos.forEach((proy) => {
      const responsables = Array.isArray(proy.responsables) ? proy.responsables : [];
      responsables.forEach((resp) => {
        vistos.add(resp);
        asignacionesPorEmpleado[resp] = (asignacionesPorEmpleado[resp] || 0) + 1;
      });
    });

    // Base: empleados activos desde Firestore o fallback
    const baseActivos = (empleadosBase && empleadosBase.length > 0)
      ? empleadosBase.filter((e) => e.activo !== false)
      : BASE_MINIMA.map((n) => ({ nombre: n, capacidad: DEFAULT_CAP, activo: true }));

    // Unión: base + los que aparezcan en proyectos aunque no estén en empleados
    const setNombres = new Set([...baseActivos.map((e) => e.nombre), ...Array.from(vistos)]);
    const nombres = Array.from(setNombres);

    // Map para lookup de capacidad
    const capMap = new Map(baseActivos.map((e) => [e.nombre, Number(e.capacidad) || DEFAULT_CAP]));

    const arr = nombres.map((nombre) => {
      const cantidad = asignacionesPorEmpleado[nombre] || 0;
      const capacidad = capMap.get(nombre) || DEFAULT_CAP;
      const pctRaw = capacidad > 0 ? (cantidad / capacidad) * 100 : 0;
      const pct = Math.min(100, Math.round(pctRaw));
      const sobre = cantidad > capacidad; // 🚨 sobreasignado
      return { empleado: nombre, cantidad, capacidad, porcentaje: pct, sobre };
    });

    // Ordena por ocupación, y desempata por asignaciones
    arr.sort((a, b) => (b.porcentaje - a.porcentaje) || (b.cantidad - a.cantidad));
    return arr;
  }, [proyectos, empleadosBase]);

  // Resúmenes
  const totalAsign = useMemo(
    () => cargaPorEmpleado.reduce((acc, x) => acc + (x.cantidad || 0), 0),
    [cargaPorEmpleado]
  );
  const totalPeople = cargaPorEmpleado.length;
  const avgAsign = totalPeople ? Math.round(totalAsign / totalPeople) : 0;
  const avgOcup = totalPeople
    ? Math.round(cargaPorEmpleado.reduce((acc, x) => acc + (x.porcentaje || 0), 0) / totalPeople)
    : 0;

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
    const confirm1 = window.confirm("⚠️ Esto eliminará TODO el histórico. ¿Continuar?");
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
        if (snap.size < pageSize) break;
      }

      toast.success(`Historial eliminado (${total} documentos)`);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo vaciar el histórico");
    } finally {
      setReseteando(false);
    }
  };

  // Estilo del badge sobreasignado
  const badgeSobre = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
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
          <button className="btn btn-ghost" onClick={() => navigate("/historial-reservas")}>📜 Histórico</button>

          {/* 🔹 Botón real que borra el historial */}
          <button
            className="btn btn-ghost"
            onClick={vaciarHistorial}
            disabled={reseteando}
            title="Borra por completo la colección 'reservasHistorial'"
          >
            {reseteando ? "⏳ Vaciando..." : "🗑️ Vaciar Histórico"}
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
                        <a className="btn btn-ghost" href={linkWhatsappAdmin(r)} target="_blank" rel="noreferrer" title="Avisar al admin por WhatsApp">🛎️ Admin</a>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* 👥 Carga de trabajo por empleado (carga vs capacidad) */}
            <div className="tarjeta" style={{ marginTop: 16 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap: 12, flexWrap: "wrap" }}>
                <h3 className="subtitulo" style={{ marginTop: 0 }}>👥 Carga de Trabajo</h3>
                {/* Leyenda */}
                <div style={{ display:"flex", gap: 8, alignItems:"center", fontSize: 12 }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                    <i style={{ width:12, height:8, borderRadius:999, background: barColor(35), boxShadow: barShadow(35) }} />{" "}
                    <b>0–49%</b>
                  </span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                    <i style={{ width:12, height:8, borderRadius:999, background: barColor(65), boxShadow: barShadow(65) }} />{" "}
                    <b>50–80%</b>
                  </span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                    <i style={{ width:12, height:8, borderRadius:999, background: barColor(95), boxShadow: barShadow(95) }} />{" "}
                    <b>81–100%</b>
                  </span>
                </div>
              </div>

              {/* Base del % */}
              <small style={{opacity:.75}}>
                Base del %: <b>asignaciones / capacidad</b> por persona (capacidad de la colección <code>empleados</code>; default {DEFAULT_CAP}).
              </small>

              {/* Resumen números */}
              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(4, minmax(0,1fr))",
                gap:12,
                margin:"10px 0"
              }}>
                <div className="tarjeta-resumen kpi-ok" style={{ padding:10 }}>
                  <div style={{ fontSize:12, opacity:.85 }}>Asignaciones totales</div>
                  <div style={{ fontWeight:700 }}>{totalAsign}</div>
                </div>
                <div className="tarjeta-resumen kpi-ok" style={{ padding:10 }}>
                  <div style={{ fontSize:12, opacity:.85 }}>Colaboradores</div>
                  <div style={{ fontWeight:700 }}>{totalPeople}</div>
                </div>
                <div className="tarjeta-resumen kpi-ok" style={{ padding:10 }}>
                  <div style={{ fontSize:12, opacity:.85 }}>Promedio / persona</div>
                  <div style={{ fontWeight:700 }}>{avgAsign}</div>
                </div>
                <div className="tarjeta-resumen kpi-ok" style={{ padding:10 }}>
                  <div style={{ fontSize:12, opacity:.85 }}>Ocupación promedio</div>
                  <div style={{ fontWeight:700 }}>{avgOcup}%</div>
                </div>
              </div>

              {cargaPorEmpleado.length === 0 ? (
                <div>No hay proyectos asignados</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {cargaPorEmpleado.map((empleado, i) => (
                    <div
                      className="tarjeta"
                      key={`emp-${empleado.empleado}-${i}`}
                      style={empleado.sobre ? { boxShadow: "0 0 0 1px #fecaca, 0 0 18px rgba(239,68,68,.22)" } : {}}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        <p style={{ margin: 0, display:"flex", alignItems:"center", gap:8 }}>
                          <strong>{empleado.empleado}</strong>
                          {empleado.sobre && (
                            <span style={badgeSobre} title="Tiene más asignaciones que su capacidad">
                              🚨 Sobreasignado
                            </span>
                          )}
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>{empleado.cantidad}</strong> / {empleado.capacidad} asign. · <strong>{empleado.porcentaje}%</strong>
                        </p>
                      </div>

                      {/* Barra de progreso con semáforo */}
                      <div
                        aria-label={`Ocupación ${empleado.porcentaje}%`}
                        title={`${empleado.porcentaje}% de su capacidad (${empleado.cantidad}/${empleado.capacidad})`}
                        style={{
                          width: "100%",
                          height: 14,
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.08)",
                          overflow: "hidden",
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                          marginTop: 8,
                          position: "relative"
                        }}
                      >
                        <div
                          style={{
                            width: pctWidth(empleado.porcentaje),
                            height: "100%",
                            borderRadius: 999,
                            background: barColor(empleado.porcentaje),
                            boxShadow: barShadow(empleado.porcentaje),
                            transition: "width .6s ease"
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: 11,
                            opacity: .85
                          }}
                        >
                          {empleado.porcentaje}%
                        </span>
                      </div>
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
                    <a className="btn btn-ghost" href={linkWhatsappAdmin(r)} target="_blank" rel="noreferrer" title="Avisar al admin por WhatsApp">🛎️ Admin</a>
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
                    <a className="btn btn-ghost" href={linkWhatsappAdmin(r)} target="_blank" rel="noreferrer" title="Avisar al admin por WhatsApp">🛎️ Admin</a>
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
