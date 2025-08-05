// src/pages/AdminPanel.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";
import { collection, onSnapshot, deleteDoc, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/adminPanelEstilo.css";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [reservasConfirmadas, setReservasConfirmadas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
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

  useEffect(() => {
    const logged = localStorage.getItem("adminLogged");
    if (logged !== "true") navigate("/admin-login");

    const unsubPendientes = onSnapshot(collection(db, "reservas"), (snapshot) => {
      setReservas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubConfirmadas = onSnapshot(collection(db, "reservasConfirmadas"), (snapshot) => {
      setReservasConfirmadas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubProyectos = onSnapshot(collection(db, "proyectos"), (snapshot) => {
      setProyectos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubPendientes();
      unsubConfirmadas();
      unsubProyectos();
    };
  }, [navigate]);

  const guardarEnHistorial = async (reserva, estado) => {
    try {
      await addDoc(collection(db, "reservasHistorial"), {
        ...reserva,
        estado,
        fechaRegistro: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error guardando en historial:", error);
    }
  };

  const confirmarReserva = async (reserva) => {
    try {
      await addDoc(collection(db, "reservasConfirmadas"), reserva);
      await guardarEnHistorial(reserva, "confirmada");
      await deleteDoc(doc(db, "reservas", reserva.id));
      toast.success(`✅ Reserva confirmada para ${reserva.nombre}`);
    } catch (error) {
      console.error(error);
      toast.error("❌ Error al confirmar la reserva");
    }
  };

  const eliminarReserva = async (id) => {
    const reservaAEliminar = reservas.find((r) => r.id === id);
    if (!window.confirm("¿Deseas eliminar esta reserva?")) return;
    try {
      if (reservaAEliminar) {
        await guardarEnHistorial(reservaAEliminar, "eliminada");
      }
      await deleteDoc(doc(db, "reservas", id));
      toast.info("🗑️ Reserva eliminada");
    } catch (error) {
      toast.error("❌ Error al eliminar");
    }
  };

  const manejarCambioProyecto = (e) => {
    setFormularioProyecto({ ...formularioProyecto, [e.target.name]: e.target.value });
  };

  const toggleResponsable = (nombre) => {
    const nuevos = formularioProyecto.responsables.includes(nombre)
      ? formularioProyecto.responsables.filter((r) => r !== nombre)
      : [...formularioProyecto.responsables, nombre];
    setFormularioProyecto({ ...formularioProyecto, responsables: nuevos });
  };

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormularioProyecto((prev) => ({
          ...prev,
          archivoData: reader.result,
          archivoNombre: file.name,
          archivos: "",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clienteTieneReservaConfirmada = (cliente) => {
    return reservasConfirmadas.some(
      (r) => r.nombre?.toLowerCase() === cliente.toLowerCase()
    );
  };

  const guardarProyecto = async (e) => {
    e.preventDefault();
    if (!clienteTieneReservaConfirmada(formularioProyecto.cliente)) {
      toast.warn("⚠️ Este cliente no tiene una reserva confirmada");
      return;
    }
    const f = formularioProyecto;
    if (!f.cliente || !f.fechaInicio || !f.fechaFin || f.responsables.length === 0 || (!f.archivos && !f.archivoData)) {
      toast.warn("⚠️ Completa todos los campos obligatorios");
      return;
    }
    try {
      if (editId) {
        await setDoc(doc(db, "proyectos", editId), f);
        toast.success("💾 Proyecto actualizado");
      } else {
        await addDoc(collection(db, "proyectos"), f);
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
    } catch (error) {
      toast.error("❌ Error al guardar el proyecto");
    }
  };

  const cargarProyectoParaEditar = (proyecto) => {
    setFormularioProyecto(proyecto);
    setEditId(proyecto.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarProyecto = async (id) => {
    if (!window.confirm("¿Deseas eliminar este proyecto?")) return;
    try {
      await deleteDoc(doc(db, "proyectos", id));
      toast.info("🗑️ Proyecto eliminado");
    } catch (error) {
      toast.error("❌ Error al eliminar el proyecto");
    }
  };

  return (
    <div className="fondo-admin">
      <h2 className="titulo">🛠️ Panel de Administración</h2>

      {/* Resumen */}
      <div className="resumen-panel">
        <div className="tarjeta-resumen">
          <h3>📋 Pendientes</h3>
          <p>{reservas.length}</p>
        </div>
        <div className="tarjeta-resumen">
          <h3>✅ Confirmadas</h3>
          <p>{reservasConfirmadas.length}</p>
        </div>
        <div className="tarjeta-resumen">
          <h3>📂 Proyectos</h3>
          <p>{proyectos.length}</p>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="barra-superior">
        <button className="btn-volver" onClick={() => navigate("/")}>🏠 Inicio</button>
        <button className="boton-ver-proyectos" onClick={() => navigate("/lista-proyectos")}>📂 Ver Proyectos</button>
        <button className="boton-ver-proyectos" onClick={() => navigate("/historial-reservas")}>📜 Historial</button>
        <button className="btn-eliminar" style={{ backgroundColor: "#ff4d4d" }} onClick={() => {
          localStorage.removeItem("adminLogged");
          navigate("/admin-login");
        }}>🚪 Cerrar Sesión</button>
      </div>

      {/* Pendientes */}
      {reservas.length > 0 && (
        <>
          <h3 className="subtitulo">📋 Reservas Pendientes</h3>
          {reservas.map((reserva) => (
            <div key={reserva.id} className="tarjeta">
              <p><strong>👤 Nombre:</strong> {reserva.nombre}</p>
              <p><strong>📧 Email:</strong> {reserva.email}</p>
              <p><strong>📱 Teléfono:</strong> {reserva.telefono}</p>
              <p><strong>🏢 Empresa:</strong> {reserva.nombreEmpresa}</p>
              <p><strong>📂 Rubro:</strong> {reserva.rubro}</p>
              <p><strong>🗓️ Día:</strong> {reserva.dia}</p>
              <p><strong>⏰ Hora:</strong> {reserva.horario}</p>
              <div className="grupo-botones">
                <button className="btn-accion" onClick={() => confirmarReserva(reserva)}>✅ Confirmar</button>
                <button className="btn-eliminar" onClick={() => eliminarReserva(reserva.id)}>🗑️ Eliminar</button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Confirmadas */}
      {reservasConfirmadas.length > 0 && (
        <>
          <h3 className="subtitulo">✅ Reservas Confirmadas</h3>
          {reservasConfirmadas.map((reserva) => (
            <div key={reserva.id} className="tarjeta">
              <p><strong>👤 Nombre:</strong> {reserva.nombre}</p>
              <p><strong>📧 Email:</strong> {reserva.email}</p>
              <p><strong>📱 Teléfono:</strong> {reserva.telefono}</p>
              <p><strong>🏢 Empresa:</strong> {reserva.nombreEmpresa}</p>
              <p><strong>📂 Rubro:</strong> {reserva.rubro}</p>
              <p><strong>🗓️ Día:</strong> {reserva.dia}</p>
              <p><strong>⏰ Hora:</strong> {reserva.horario}</p>
            </div>
          ))}
        </>
      )}

      {/* Subir proyecto */}
      <h3 className="subtitulo">📁 Subir Proyecto de Cliente</h3>
      <form onSubmit={guardarProyecto} className="tarjeta">
        <label className="label">Nombre del cliente</label>
        <input type="text" name="cliente" className="input" value={formularioProyecto.cliente} onChange={manejarCambioProyecto} />
        <label className="label">Desde</label>
        <DatePicker selected={formularioProyecto.fechaInicio ? new Date(formularioProyecto.fechaInicio) : null} onChange={(date) => setFormularioProyecto({ ...formularioProyecto, fechaInicio: date.toISOString() })} dateFormat="yyyy-MM-dd" locale={es} className="calendario" />
        <label className="label">Hasta</label>
        <DatePicker selected={formularioProyecto.fechaFin ? new Date(formularioProyecto.fechaFin) : null} onChange={(date) => setFormularioProyecto({ ...formularioProyecto, fechaFin: date.toISOString() })} dateFormat="yyyy-MM-dd" locale={es} className="calendario" />
        <label className="label">Responsables</label>
        <div className="contenedor-responsables">
          {posiblesResponsables.map((nombre) => (
            <button key={nombre} type="button" className="btn-responsable" onClick={() => toggleResponsable(nombre)} style={{ backgroundColor: formularioProyecto.responsables.includes(nombre) ? "#d4af37" : "#333", color: formularioProyecto.responsables.includes(nombre) ? "#000" : "#d4af37" }}>{nombre}</button>
          ))}
        </div>
        <label className="label">Link de archivo (opcional)</label>
        <input type="text" name="archivos" className="input" value={formularioProyecto.archivos} onChange={manejarCambioProyecto} />
        <label className="label">O subir archivo:</label>
        <input type="file" onChange={manejarArchivo} className="input" />
        {formularioProyecto.archivoNombre && <p>📎 {formularioProyecto.archivoNombre}</p>}
        <label className="label">Link de Meet (opcional)</label>
        <input type="text" name="linkMeet" className="input" value={formularioProyecto.linkMeet} onChange={manejarCambioProyecto} />
        <div className="barra-superior">
          <button type="submit" className="btn-accion" disabled={!clienteTieneReservaConfirmada(formularioProyecto.cliente)}>{editId ? "💾 Actualizar Proyecto" : "📤 Subir Proyecto"}</button>
          {editId && (
            <button type="button" className="btn-cancelar" onClick={() => {
              setFormularioProyecto({ cliente: "", fechaInicio: "", fechaFin: "", responsables: [], archivos: "", archivoData: "", archivoNombre: "", linkMeet: "" });
              setEditId(null);
            }}>❌ Cancelar edición</button>
          )}
        </div>
        {!clienteTieneReservaConfirmada(formularioProyecto.cliente) && (
          <p className="texto-bloqueado">⚠ Este cliente no tiene reserva confirmada</p>
        )}
      </form>

      {/* Proyectos */}
      {proyectos.length > 0 && (
        <>
          <h3 className="subtitulo">📂 Proyectos Actuales</h3>
          {proyectos.map((proy) => (
            <div key={proy.id} className="tarjeta">
              <p><strong>👤 Cliente:</strong> {proy.cliente}</p>
              <p><strong>📅 Desde:</strong> {new Date(proy.fechaInicio).toLocaleDateString()}</p>
              <p><strong>📅 Hasta:</strong> {new Date(proy.fechaFin).toLocaleDateString()}</p>
              <p><strong>👥 Responsables:</strong> {proy.responsables.join(", ")}</p>
              {proy.archivos && <p><strong>📎 Link:</strong> <a href={proy.archivos} target="_blank" rel="noreferrer">Ver</a></p>}
              {proy.archivoNombre && <p><strong>📄 Archivo:</strong> {proy.archivoNombre}</p>}
              {proy.linkMeet && <p><strong>🎥 Meet:</strong> <a href={proy.linkMeet} target="_blank" rel="noreferrer">{proy.linkMeet}</a></p>}
              <div className="barra-superior">
                <button className="btn-accion" onClick={() => cargarProyectoParaEditar(proy)}>✏️ Editar</button>
                <button className="btn-eliminar" onClick={() => eliminarProyecto(proy.id)}>🗑️ Eliminar</button>
              </div>
            </div>
          ))}
        </>
      )}

      <ToastContainer position="bottom-center" autoClose={2500} hideProgressBar />
    </div>
  );
}
