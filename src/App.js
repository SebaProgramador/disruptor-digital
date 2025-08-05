// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Inicio from "./pages/Inicio";
import Politicas from "./pages/Politicas";
import AdminLogin from "./pages/AdminLogin";
import ReservaAsesoria from "./pages/ReservaAsesoria";
import ListaReservas from "./pages/ListaReservas";
import AdminPanel from "./pages/AdminPanel";
import ListaProyectos from "./pages/ListaProyectos";
import HistorialReservas from "./pages/HistorialReservas";
import GerentePanel from "./pages/GerentePanel";
import GerenteLogin from "./pages/GerenteLogin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/politicas" element={<Politicas />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/reservar" element={<ReservaAsesoria />} />
        <Route path="/lista-reservas" element={<ListaReservas />} />
        <Route
          path="/admin-panel"
          element={
            localStorage.getItem("adminLogged") === "true" ? (
              <AdminPanel />
            ) : (
              <AdminLogin />
            )
          }
        />
        <Route path="/lista-proyectos" element={<ListaProyectos />} />
        <Route path="/historial-reservas" element={<HistorialReservas />} />
        <Route path="/gerente-login" element={<GerenteLogin />} />
        <Route
          path="/gerente-panel"
          element={
            localStorage.getItem("gerenteLogged") === "true" ? (
              <GerentePanel />
            ) : (
              <GerenteLogin />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
