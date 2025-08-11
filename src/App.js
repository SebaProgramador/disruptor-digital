// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import Inicio from "./pages/Inicio";
import Politicas from "./pages/Politicas";
import ReservaAsesoria from "./pages/ReservaAsesoria";

import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import ListaReservas from "./pages/ListaReservas";
import ListaProyectos from "./pages/ListaProyectos";
import HistorialReservas from "./pages/HistorialReservas";

import GerenteLogin from "./pages/GerenteLogin";
import GerentePanel from "./pages/GerentePanel";

import PrivateRouteAdmin from "./routes/PrivateRouteAdmin";
import PrivateRouteGerente from "./routes/PrivateRouteGerente";
import PrivateRouteStaff from "./routes/PrivateRouteStaff";

import ResetHistorial from "./pages/ResetHistorial";

export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Inicio />} />
      <Route path="/politicas" element={<Politicas />} />
      <Route path="/reservar" element={<ReservaAsesoria />} />

      {/* Reset historial (protegida: admin o gerente) */}
      <Route
        path="/reset-historial"
        element={
          <PrivateRouteStaff>
            <ResetHistorial />
          </PrivateRouteStaff>
        }
      />

      {/* Auth Admin */}
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

      {/* Auth Gerente */}
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
  );
}
