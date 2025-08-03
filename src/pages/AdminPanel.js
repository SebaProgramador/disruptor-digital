import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import "./adminPanelEstilo.css";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";
import {
  collection,
  onSnapshot,
  deleteDoc,
  addDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

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

  const [editIndex, setEditIndex] = useState(null);
  const posiblesResponsables = ["Nicolás", "Eliana", "Sebastián"];

  useEffect(() => {
    const logged = localStorage.getItem("adminLogged");
    if (logged !== "true") navigate("/admin-login");

    const unsubPendientes = onSnapshot(collection(db, "reservas"), (snapshot) => {
      const datos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReservas(datos);
    });

    const unsubConfirmadas = onSnapshot(collection(db, "reservasConfirmadas"), (snapshot) => {
      const datos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReservasConfirmadas(datos);
    });

    return () => {
      unsubPendientes();
      unsubConfirmadas();
    };
  }, [navigate]);

  const confirmarReserva = async (reserva) => {
    try {
      await addDoc(collection(db, "reservasConfirmadas"), reserva);
      await deleteDoc(doc(db, "reservas", reserva.id));
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
    }
  };

  const eliminarReserva = async (id) => {
    const confirmar = window.confirm("¿Deseas eliminar esta reserva?");
    if (!confirmar) return;
    try {
      await deleteDoc(doc(db, "reservas", id));
    } catch (error) {
      console.error("Error al eliminar reserva:", error);
    }
  };

  const manejarCambioProyecto = (e) => {
    setFormularioProyecto({ ...formularioProyecto, [e.target.name]: e.target.value });
  };

  const toggleResponsable = (nombre) => {
    let nuevos = [...formularioProyecto.responsables];
    nuevos = nuevos.includes(nombre)
      ? nuevos.filter((r) => r !== nombre)
      : [...nuevos, nombre];
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

  const guardarProyecto = (e) => {
    e.preventDefault();
    const f = formularioProyecto;
    if (!f.cliente.trim() || !f.fechaInicio || !f.fechaFin || f.responsables.length === 0 || (!f.archivos.trim() && !f.archivoData)) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }
    const nuevo = { ...formularioProyecto };
    if (editIndex !== null) {
      const actualizados = [...proyectos];
      actualizados[editIndex] = nuevo;
      setProyectos(actualizados);
      setEditIndex(null);
    } else {
      setProyectos([...proyectos, nuevo]);
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
  };

  return (
    <div className="fondo-admin">
      <h2 className="titulo">🛠️ Panel de Administración</h2>

      {reservas.length === 0 ? (
        <p>No hay reservas pendientes.</p>
      ) : (
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

              <div className="barra-superior">
                <button className="btn-accion" onClick={() => confirmarReserva(reserva)}>✅ Confirmar</button>
                <button className="btn-eliminar" onClick={() => eliminarReserva(reserva.id)}>🗑️ Eliminar</button>
              </div>
            </div>
          ))}
        </>
      )}

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

      <h3 className="subtitulo">📁 Subir Proyecto de Cliente</h3>
      <form onSubmit={guardarProyecto} className="tarjeta">
        <label className="label">Nombre del cliente</label>
        <input type="text" name="cliente" className="input" value={formularioProyecto.cliente} onChange={manejarCambioProyecto} placeholder="Nombre del cliente" />

        <label className="label">Desde</label>
        <DatePicker
          selected={formularioProyecto.fechaInicio ? new Date(formularioProyecto.fechaInicio) : null}
          onChange={(date) => setFormularioProyecto({ ...formularioProyecto, fechaInicio: date.toISOString() })}
          dateFormat="yyyy-MM-dd"
          locale={es}
          className="calendario"
          placeholderText="Selecciona una fecha"
        />

        <label className="label">Hasta</label>
        <DatePicker
          selected={formularioProyecto.fechaFin ? new Date(formularioProyecto.fechaFin) : null}
          onChange={(date) => setFormularioProyecto({ ...formularioProyecto, fechaFin: date.toISOString() })}
          dateFormat="yyyy-MM-dd"
          locale={es}
          className="calendario"
          placeholderText="Selecciona una fecha"
        />

        <label className="label">Personas a cargo del proyecto (selecciona uno o más)</label>
        <div className="contenedor-responsables">
          {posiblesResponsables.map((nombre) => (
            <button
              key={nombre}
              type="button"
              className="btn-responsable"
              onClick={() => toggleResponsable(nombre)}
              style={{
                backgroundColor: formularioProyecto.responsables.includes(nombre) ? "#d4af37" : "#333",
                color: formularioProyecto.responsables.includes(nombre) ? "#000" : "#d4af37",
              }}
            >
              {nombre}
            </button>
          ))}
        </div>

        <label className="label">Link de archivo (Drive, PDF, etc.)</label>
        <input type="text" name="archivos" className="input" value={formularioProyecto.archivos} onChange={manejarCambioProyecto} placeholder="Pega aquí un link si tienes" />

        <label className="label">O subir archivo:</label>
        <input type="file" onChange={manejarArchivo} className="input" />
        {formularioProyecto.archivoNombre && (
          <p style={{ marginTop: 6, color: "#aaa" }}>
            Archivo cargado: <strong>{formularioProyecto.archivoNombre}</strong>
          </p>
        )}

        <label className="label">Link de Meet (opcional)</label>
        <input type="text" name="linkMeet" className="input" value={formularioProyecto.linkMeet} onChange={manejarCambioProyecto} placeholder="Link de Meet" />

        <div className="barra-superior">
          <button type="submit" className="btn-accion">
            {editIndex !== null ? "💾 Actualizar Proyecto" : "📤 Subir Proyecto"}
          </button>
          {editIndex !== null && (
            <button
              type="button"
              className="btn-cancelar"
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
                setEditIndex(null);
              }}
            >
              ❌ Cancelar edición
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
