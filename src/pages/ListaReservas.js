// src/pages/ListaReservas.js
import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/datepicker-dark.css";
import {
  FaCalendarAlt,
  FaUserAlt,
  FaClock,
  FaTag,
  FaTrashAlt,
} from "react-icons/fa";

const estilos = {
  contenedor: {
    backgroundColor: "#121212",
    color: "#d4af50",
    padding: "40px 20px",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
  },
  tablaResponsive: {
    overflowX: "auto",
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 30,
    minWidth: 700, // 👈 importante para que en móvil tenga scroll
  },
  th: {
    backgroundColor: "#1a1a1a",
    color: "#d4af50",
    padding: 12,
    border: "1px solid #a8854f",
    fontSize: "0.9rem",
  },
  td: {
    padding: 12,
    border: "1px solid #a8854f",
    backgroundColor: "#1e1e1e",
    color: "#fff8e1",
    textAlign: "center",
    fontSize: "0.9rem",
  },
  titulo: {
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center",
    textShadow: "0 0 10px #d4af50",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  botonEliminar: {
    backgroundColor: "#a83232",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    boxShadow: "0 0 8px rgba(255, 0, 0, 0.5)",
  },
  filtros: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
    flexWrap: "wrap",
  },
  input: {
    padding: 8,
    borderRadius: 6,
    border: "1px solid #d4af50",
    backgroundColor: "#2b1d0e",
    color: "#d4af50",
    fontSize: "1rem",
    boxShadow: "0 0 8px #a8854f55",
    minWidth: 180,
  },
};

export default function ListaReservas() {
  const [reservas, setReservas] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroDia, setFiltroDia] = useState("");

  const obtenerReservas = async () => {
    const snapshot = await getDocs(collection(db, "reservas"));
    const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setReservas(datos);
  };

  useEffect(() => {
    obtenerReservas();
  }, []);

  const eliminarReserva = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar esta reserva?");
    if (!confirmar) return;
    await deleteDoc(doc(db, "reservas", id));
    obtenerReservas();
  };

  const reservasFiltradas = reservas.filter((r) => {
    const coincideNombre = r.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const coincideDia = filtroDia ? r.dia === filtroDia : true;
    return coincideNombre && coincideDia;
  });

  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}>
        <FaCalendarAlt /> Lista de Reservas
      </h2>

      <div style={estilos.filtros}>
        <input
          style={estilos.input}
          type="text"
          placeholder="Buscar por nombre"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />
        <input
          style={estilos.input}
          type="date"
          value={filtroDia}
          onChange={(e) => setFiltroDia(e.target.value)}
        />
      </div>

      <div style={estilos.tablaResponsive}>
        <table style={estilos.tabla}>
          <thead>
            <tr>
              <th style={estilos.th}>Nombre</th>
              <th style={estilos.th}>Empresa</th>
              <th style={estilos.th}>Día</th>
              <th style={estilos.th}>Hora</th>
              <th style={estilos.th}>Email</th>
              <th style={estilos.th}>Teléfono</th>
              <th style={estilos.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservasFiltradas.map((r) => (
              <tr key={r.id}>
                <td style={estilos.td}>
                  <FaUserAlt /> {r.nombre}
                </td>
                <td style={estilos.td}>
                  <FaTag /> {r.nombreEmpresa}
                </td>
                <td style={estilos.td}>{r.dia}</td>
                <td style={estilos.td}>
                  <FaClock /> {r.horario}
                </td>
                <td style={estilos.td}>{r.email}</td>
                <td style={estilos.td}>{r.telefono}</td>
                <td style={estilos.td}>
                  <button
                    style={estilos.botonEliminar}
                    onClick={() => eliminarReserva(r.id)}
                  >
                    <FaTrashAlt /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
