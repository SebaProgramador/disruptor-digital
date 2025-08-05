// src/pages/GerentePanel.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/adminPanelEstilo.css";

export default function GerentePanel() {
  const navigate = useNavigate();
  const [reservasConfirmadas, setReservasConfirmadas] = useState([]);
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [cargaPorEmpleado, setCargaPorEmpleado] = useState([]);

  useEffect(() => {
    const unsubPendientes = onSnapshot(collection(db, "reservas"), (snapshot) => {
      setReservasPendientes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubConfirmadas = onSnapshot(collection(db, "reservasConfirmadas"), (snapshot) => {
      setReservasConfirmadas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubProyectos = onSnapshot(collection(db, "proyectos"), (snapshot) => {
      const listaProyectos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProyectos(listaProyectos);

      // Calcular carga por empleado
      const carga = {};
      listaProyectos.forEach((proy) => {
        proy.responsables?.forEach((resp) => {
          carga[resp] = (carga[resp] || 0) + 1;
        });
      });
      const cargaArray = Object.entries(carga).map(([empleado, cantidad]) => ({
        empleado,
        cantidad,
      }));
      setCargaPorEmpleado(cargaArray);
    });

    return () => {
      unsubPendientes();
      unsubConfirmadas();
      unsubProyectos();
    };
  }, []);

  return (
    <div className="fondo-admin">
      <h2 className="titulo">📊 Panel del Gerente</h2>

      {/* Botones de navegación */}
      <div className="barra-superior" style={{ flexWrap: "wrap", gap: "10px" }}>
        <button
          className="btn-volver"
          style={{ flex: "1", minWidth: "200px" }}
          onClick={() => navigate("/")}
        >
          🏠 Volver al Inicio
        </button>
        <button
          className="btn-accion"
          style={{ flex: "1", minWidth: "200px" }}
          onClick={() => navigate("/historial-reservas")}
        >
          📜 Ver Historial de Reservas
        </button>
      </div>

      {/* Resumen rápido */}
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
          <h3 style={{ color: "#ffcc00" }}>📋 Pendientes</h3>
          <p>{reservasPendientes.length}</p>
        </div>
        <div className="tarjeta-resumen" style={{ flex: "1", minWidth: "180px" }}>
          <h3 style={{ color: "#00ff99" }}>✅ Confirmadas</h3>
          <p>{reservasConfirmadas.length}</p>
        </div>
        <div className="tarjeta-resumen" style={{ flex: "1", minWidth: "180px" }}>
          <h3 style={{ color: "#ffcc00" }}>📂 Proyectos</h3>
          <p>{proyectos.length}</p>
        </div>
      </div>

      {/* Carga de trabajo por empleado */}
      <h3 className="subtitulo" style={{ marginTop: "30px" }}>👥 Carga de Trabajo</h3>
      {cargaPorEmpleado.length === 0 ? (
        <p>No hay proyectos asignados</p>
      ) : (
        cargaPorEmpleado.map((empleado) => (
          <div className="tarjeta" key={empleado.empleado}>
            <p>
              <strong>Empleado:</strong> {empleado.empleado}
            </p>
            <p>
              <strong>Proyectos asignados:</strong> {empleado.cantidad}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
