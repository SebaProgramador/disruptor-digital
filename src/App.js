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

import PrivateRouteAdmin from "./routes/PrivateRouteAdmin";
import PrivateRouteGerente from "./routes/PrivateRouteGerente";

function App() {
  return (
    <Router>
      <Routes>
        {/* públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/politicas" element={<Politicas />} />
        <Route path="/reservar" element={<ReservaAsesoria />} />

        {/* auth admin */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin-panel"
          element={
            <PrivateRouteAdmin>
              <AdminPanel />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/lista-reservas"
          element={
            <PrivateRouteAdmin>
              <ListaReservas />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/lista-proyectos"
          element={
            <PrivateRouteAdmin>
              <ListaProyectos />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/historial-reservas"
          element={
            <PrivateRouteAdmin>
              <HistorialReservas />
            </PrivateRouteAdmin>
          }
        />

        {/* auth gerente */}
        <Route path="/gerente-login" element={<GerenteLogin />} />
        <Route
          path="/gerente-panel"
          element={
            <PrivateRouteGerente>
              <GerentePanel />
            </PrivateRouteGerente>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
