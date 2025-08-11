// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";

// 🔐 auth anónimo sólo para admin/gerente
import { auth } from "./firebase";
import { signInAnonymously } from "firebase/auth";

// Si estás en rutas de admin o gerente -> loguea anónimo
const PATRONES_PRIVADOS = [/^\/admin/, /^\/gerente/];
const esPrivado = PATRONES_PRIVADOS.some((re) => re.test(window.location.pathname));

if (esPrivado) {
  signInAnonymously(auth).catch(() => {
    // no mostrar errores al cliente
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router basename="/">
      <App />
    </Router>
  </React.StrictMode>
);

reportWebVitals();
