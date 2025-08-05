// src/pages/HistorialReservas.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../styles/adminPanelEstilo.css";

export default function HistorialReservas() {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reservasHistorial"), (snapshot) => {
      const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      datos.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));
      setHistorial(datos);
    });
    return () => unsub();
  }, []);

  const reservasFiltradas = historial.filter((reserva) => {
    const nombreCoincide = reserva.nombre
      ?.toLowerCase()
      .includes(filtroNombre.toLowerCase());
    const estadoCoincide =
      filtroEstado === "todos" ? true : reserva.estado === filtroEstado;
    return nombreCoincide && estadoCoincide;
  });

  const totalConfirmadas = historial.filter((r) => r.estado === "confirmada").length;
  const totalEliminadas = historial.filter((r) => r.estado === "eliminada").length;

  const getColorEstado = (estado) => {
    if (estado === "confirmada") return { color: "#00ff99", fontWeight: "bold" };
    if (estado === "eliminada") return { color: "#ff4d4d", fontWeight: "bold" };
    return { color: "#d4af37", fontWeight: "bold" };
  };

  // Exportar a Excel
  const exportarExcel = () => {
    const datosExportar = reservasFiltradas.map((reserva) => ({
      Nombre: reserva.nombre,
      Email: reserva.email,
      Teléfono: reserva.telefono,
      Empresa: reserva.nombreEmpresa,
      Rubro: reserva.rubro,
      Día: reserva.dia,
      Hora: reserva.horario,
      "Fecha registro": new Date(reserva.fechaRegistro).toLocaleString(),
      Estado: reserva.estado,
    }));
    const ws = XLSX.utils.json_to_sheet(datosExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial Reservas");
    XLSX.writeFile(wb, "Historial_Reservas.xlsx");
  };

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Historial de Reservas", 14, 15);

    // Resumen
    doc.setFontSize(12);
    doc.text(`Total: ${historial.length}`, 14, 25);
    doc.text(`Confirmadas: ${totalConfirmadas}`, 14, 32);
    doc.text(`Eliminadas: ${totalEliminadas}`, 14, 39);

    // Tabla
    const columnas = [
      "Nombre",
      "Email",
      "Teléfono",
      "Empresa",
      "Rubro",
      "Día",
      "Hora",
      "Fecha registro",
      "Estado",
    ];
    const filas = reservasFiltradas.map((reserva) => [
      reserva.nombre,
      reserva.email,
      reserva.telefono,
      reserva.nombreEmpresa,
      reserva.rubro,
      reserva.dia,
      reserva.horario,
      new Date(reserva.fechaRegistro).toLocaleString(),
      reserva.estado,
    ]);

    doc.autoTable({
      head: [columnas],
      body: filas,
      startY: 45,
      styles: { fontSize: 8 },
    });

    doc.save("Historial_Reservas.pdf");
  };

  return (
    <div className="fondo-admin">
      <h2 className="titulo">📜 Historial de Reservas</h2>

      {/* Botones de navegación */}
      <div className="barra-superior" style={{ flexWrap: "wrap", gap: "10px" }}>
        <button
          className="btn-volver"
          style={{ flex: "1", minWidth: "180px" }}
          onClick={() => navigate("/admin-panel")}
        >
          🔙 Volver al Panel
        </button>
        <button
          className="boton-ver-proyectos"
          style={{ flex: "1", minWidth: "180px" }}
          onClick={() => navigate("/")}
        >
          🏠 Ir al Inicio
        </button>
        <button
          className="btn-accion"
          style={{ flex: "1", minWidth: "180px" }}
          onClick={exportarExcel}
        >
          📊 Exportar Excel
        </button>
        <button
          className="btn-accion"
          style={{ flex: "1", minWidth: "180px" }}
          onClick={exportarPDF}
        >
          📄 Exportar PDF
        </button>
      </div>

      {/* Resumen de conteos */}
      <div
        className="resumen-panel"
        style={{
          display: "flex",
          gap: "15px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <div className="tarjeta-resumen" style={{ flex: "1", minWidth: "180px" }}>
          <h3>📋 Total</h3>
          <p>{historial.length}</p>
        </div>
        <div className="tarjeta-resumen" style={{ flex: "1", minWidth: "180px" }}>
          <h3 style={{ color: "#00ff99" }}>✅ Confirmadas</h3>
          <p>{totalConfirmadas}</p>
        </div>
        <div className="tarjeta-resumen" style={{ flex: "1", minWidth: "180px" }}>
          <h3 style={{ color: "#ff4d4d" }}>🗑️ Eliminadas</h3>
          <p>{totalEliminadas}</p>
        </div>
      </div>

      {/* Filtros */}
      <div
        className="tarjeta"
        style={{
          marginTop: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Buscar por nombre"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="input"
          style={{ flex: "2", minWidth: "200px" }}
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="input"
          style={{ flex: "1", minWidth: "150px" }}
        >
          <option value="todos">Todos los estados</option>
          <option value="confirmada">Confirmadas</option>
          <option value="eliminada">Eliminadas</option>
        </select>
      </div>

      {/* Lista de reservas */}
      {reservasFiltradas.length === 0 ? (
        <p style={{ marginTop: "20px" }}>No hay reservas en el historial</p>
      ) : (
        reservasFiltradas.map((reserva) => (
          <div className="tarjeta" key={reserva.id} style={{ marginTop: "15px" }}>
            <p>
              <strong>👤 Nombre:</strong> {reserva.nombre}
            </p>
            <p>
              <strong>📧 Email:</strong> {reserva.email}
            </p>
            <p>
              <strong>📱 Teléfono:</strong> {reserva.telefono}
            </p>
            <p>
              <strong>🏢 Empresa:</strong> {reserva.nombreEmpresa}
            </p>
            <p>
              <strong>📂 Rubro:</strong> {reserva.rubro}
            </p>
            <p>
              <strong>🗓️ Día:</strong> {reserva.dia}
            </p>
            <p>
              <strong>⏰ Hora:</strong> {reserva.horario}
            </p>
            <p>
              <strong>📅 Fecha registro:</strong>{" "}
              {new Date(reserva.fechaRegistro).toLocaleString()}
            </p>
            <p style={getColorEstado(reserva.estado)}>
              <strong>📌 Estado:</strong> {reserva.estado}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
