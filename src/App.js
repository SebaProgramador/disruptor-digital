// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Inicio from "./pages/Inicio";
import Politicas from "./pages/Politicas";
import AdminLogin from "./pages/AdminLogin";
import ReservaAsesoria from "./pages/ReservaAsesoria";
import GerentePanel from "./pages/GerentePanel";
import ListaReservas from "./pages/ListaReservas";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Politicas" element={<Politicas />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/reservar" element={<ReservaAsesoria />} />
        <Route path="/gerente" element={<GerentePanel />} />
        <Route path="/lista-reservas" element={<ListaReservas />} />
      </Routes>
    </Router>
  );
}

export default App;