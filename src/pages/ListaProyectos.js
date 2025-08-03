// src/pages/ListaProyectos.js
import React, { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/datepicker-dark.css";
import { FaFolderOpen, FaTrashAlt, FaEdit, FaUser } from "react-icons/fa";

const estilos = {
  contenedor: {
    backgroundColor: "#121212",
    color: "#d4af50",
    padding: "40px 20px",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
  },
  titulo: {
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    textShadow: "0 0 10px #d4af50",
  },
  tarjeta: {
    backgroundColor: "#1e1e1e",
    border: "1px solid #a8854f",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 0 10px #a8854f44",
  },
  botonAccion: {
    backgroundColor: "#333",
    color: "#d4af50",
    border: "1px solid #d4af50",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 10,
    fontWeight: "bold",
  },
  nombre: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: 10,
  },
  dato: {
    color: "#fff8e1",
    margin: "4px 0",
  },
};

export default function ListaProyectos() {
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "proyectos"), (snapshot) => {
      const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProyectos(datos);
    });

    return () => unsub();
  }, []);

  const eliminarProyecto = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este proyecto?");
    if (!confirmar) return;
    await deleteDoc(doc(db, "proyectos", id));
  };

  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}>
        <FaFolderOpen /> Lista de Proyectos Subidos
      </h2>

      {proyectos.length === 0 ? (
        <p style={estilos.dato}>No hay proyectos cargados aún.</p>
      ) : (
        proyectos.map((proyecto) => (
          <div key={proyecto.id} style={estilos.tarjeta}>
            <div style={estilos.nombre}>
              <FaUser /> Cliente: {proyecto.cliente}
            </div>
            <div style={estilos.dato}>📅 Desde: {new Date(proyecto.fechaInicio).toLocaleDateString()}</div>
            <div style={estilos.dato}>📅 Hasta: {new Date(proyecto.fechaFin).toLocaleDateString()}</div>
            <div style={estilos.dato}>👥 Responsables: {proyecto.responsables?.join(", ")}</div>
            {proyecto.archivos && (
              <div style={estilos.dato}>
                🔗 Archivo: <a href={proyecto.archivos} style={{ color: "#d4af50" }} target="_blank" rel="noreferrer">Ver archivo</a>
              </div>
            )}
            {proyecto.linkMeet && (
              <div style={estilos.dato}>
                📡 Meet: <a href={proyecto.linkMeet} style={{ color: "#d4af50" }} target="_blank" rel="noreferrer">Ver enlace</a>
              </div>
            )}
            <div style={{ marginTop: 10 }}>
              <button style={estilos.botonAccion} onClick={() => alert("Edición aún no implementada")}>
                <FaEdit /> Editar
              </button>
              <button style={{ ...estilos.botonAccion, backgroundColor: "#a83232", color: "white" }} onClick={() => eliminarProyecto(proyecto.id)}>
                <FaTrashAlt /> Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
