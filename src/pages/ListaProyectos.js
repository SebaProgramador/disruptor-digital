// src/pages/ListaProyectos.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import "../styles/adminPanelEstilo.css";

export default function ListaProyectos() {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [formulario, setFormulario] = useState({
    cliente: "",
    fechaInicio: "",
    fechaFin: "",
    responsables: [],
    archivos: "",
    archivoData: "",
    archivoNombre: "",
    linkMeet: "",
  });
  const [editandoId, setEditandoId] = useState(null);
  const posiblesResponsables = ["Nicolás", "Eliana", "Sebastián"];

  useEffect(() => {
    obtenerProyectos();
  }, []);

  const obtenerProyectos = async () => {
    try {
      const snapshot = await getDocs(collection(db, "proyectos"));
      const datos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProyectos(datos);
    } catch (error) {
      toast.error("❌ Error al cargar los proyectos.");
    }
  };

  const manejarCambio = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormulario((prev) => ({
          ...prev,
          archivoData: reader.result,
          archivoNombre: file.name,
          archivos: "",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleResponsable = (nombre) => {
    const actuales = formulario.responsables;
    const nuevos = actuales.includes(nombre)
      ? actuales.filter((r) => r !== nombre)
      : [...actuales, nombre];
    setFormulario({ ...formulario, responsables: nuevos });
  };

  const limpiarFormulario = () => {
    setFormulario({
      cliente: "",
      fechaInicio: "",
      fechaFin: "",
      responsables: [],
      archivos: "",
      archivoData: "",
      archivoNombre: "",
      linkMeet: "",
    });
    setEditandoId(null);
  };

  const guardarProyecto = async (e) => {
    e.preventDefault();
    const f = formulario;

    if (
      !f.cliente.trim() ||
      !f.fechaInicio ||
      !f.fechaFin ||
      f.responsables.length === 0 ||
      (!f.archivos.trim() && !f.archivoData)
    ) {
      toast.warn("⚠️ Completa todos los campos obligatorios.");
      return;
    }

    try {
      if (editandoId) {
        await updateDoc(doc(db, "proyectos", editandoId), f);
        toast.success("✅ Proyecto actualizado");
      } else {
        await addDoc(collection(db, "proyectos"), f);
        toast.success("📤 Proyecto subido");
      }
      limpiarFormulario();
      obtenerProyectos();
    } catch (error) {
      toast.error("❌ Error al guardar el proyecto.");
    }
  };

  const cargarParaEditar = (proy) => {
    setFormulario(proy);
    setEditandoId(proy.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarProyecto = async (id) => {
    const confirmar = window.confirm("¿Eliminar este proyecto?");
    if (!confirmar) return;
    try {
      await deleteDoc(doc(db, "proyectos", id));
      toast.success("🗑️ Proyecto eliminado");
      obtenerProyectos();
    } catch (error) {
      toast.error("❌ Error al eliminar.");
    }
  };

  return (
    <div className="fondo-admin">
      <h2 className="titulo">📂 Proyectos Subidos</h2>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          onClick={() => navigate("/admin-panel")}
          className="btn-volver"
          style={{ padding: "10px 20px", fontSize: "1rem" }}
        >
          ⬅️ Volver al Panel
        </button>
      </div>

      <form onSubmit={guardarProyecto} className="tarjeta">
        <h3 className="subtitulo">
          {editandoId ? "✏️ Editar Proyecto" : "📤 Subir Proyecto"}
        </h3>

        <label className="label">Nombre del cliente</label>
        <input
          type="text"
          name="cliente"
          className="input"
          value={formulario.cliente}
          onChange={manejarCambio}
        />

        <label className="label">Desde</label>
        <DatePicker
          selected={
            formulario.fechaInicio ? new Date(formulario.fechaInicio) : null
          }
          onChange={(date) =>
            setFormulario({ ...formulario, fechaInicio: date.toISOString() })
          }
          dateFormat="yyyy-MM-dd"
          locale={es}
          className="calendario"
          placeholderText="Selecciona una fecha"
        />

        <label className="label">Hasta</label>
        <DatePicker
          selected={
            formulario.fechaFin ? new Date(formulario.fechaFin) : null
          }
          onChange={(date) =>
            setFormulario({ ...formulario, fechaFin: date.toISOString() })
          }
          dateFormat="yyyy-MM-dd"
          locale={es}
          className="calendario"
          placeholderText="Selecciona una fecha"
        />

        <label className="label">Responsables</label>
        <div className="contenedor-responsables">
          {posiblesResponsables.map((nombre) => (
            <button
              key={nombre}
              type="button"
              className="btn-responsable"
              onClick={() => toggleResponsable(nombre)}
              style={{
                backgroundColor: formulario.responsables.includes(nombre)
                  ? "#d4af37"
                  : "#333",
                color: formulario.responsables.includes(nombre)
                  ? "#000"
                  : "#d4af37",
              }}
            >
              {nombre}
            </button>
          ))}
        </div>

        <label className="label">Link archivo (opcional)</label>
        <input
          type="text"
          name="archivos"
          className="input"
          value={formulario.archivos}
          onChange={manejarCambio}
        />

        <label className="label">O subir archivo:</label>
        <input type="file" onChange={manejarArchivo} className="input" />
        {formulario.archivoNombre && (
          <p style={{ marginTop: 6, color: "#aaa" }}>
            Archivo cargado: <strong>{formulario.archivoNombre}</strong>
          </p>
        )}

        <label className="label">Link Meet (opcional)</label>
        <input
          type="text"
          name="linkMeet"
          className="input"
          value={formulario.linkMeet}
          onChange={manejarCambio}
        />

        <div className="barra-superior">
          <button type="submit" className="btn-accion">
            {editandoId ? "💾 Actualizar" : "📤 Subir"}
          </button>
          {editandoId && (
            <button
              type="button"
              className="btn-cancelar"
              onClick={limpiarFormulario}
            >
              ❌ Cancelar
            </button>
          )}
        </div>
      </form>

      {proyectos.map((proy) => (
        <div key={proy.id} className="tarjeta">
          <p><strong>👤 Cliente:</strong> {proy.cliente}</p>
          <p><strong>📅 Desde:</strong> {new Date(proy.fechaInicio).toLocaleDateString()}</p>
          <p><strong>📅 Hasta:</strong> {new Date(proy.fechaFin).toLocaleDateString()}</p>
          {proy.responsables?.length > 0 && (
            <p><strong>👥 Responsables:</strong> {proy.responsables.join(", ")}</p>
          )}
          {proy.archivos && (
            <p>
              <strong>📎 Link archivo:</strong>{" "}
              <a href={proy.archivos} target="_blank" rel="noreferrer">
                Ver archivo
              </a>
            </p>
          )}
          {proy.archivoNombre && (
            <p><strong>📂 Archivo subido:</strong> {proy.archivoNombre}</p>
          )}
          {proy.linkMeet && (
            <p>
              <strong>🎥 Link Meet:</strong>{" "}
              <a href={proy.linkMeet} target="_blank" rel="noreferrer">
                {proy.linkMeet}
              </a>
            </p>
          )}
          <div className="barra-superior">
            <button className="btn-accion" onClick={() => cargarParaEditar(proy)}>
              ✏️ Editar
            </button>
            <button className="btn-eliminar" onClick={() => eliminarProyecto(proy.id)}>
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}

      <ToastContainer position="bottom-center" autoClose={2500} hideProgressBar />
    </div>
  );
}
