// src/pages/ResetHistorial.js
import React, { useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/adminPanelEstilo.css";

export default function ResetHistorial() {
  const [borrando, setBorrando] = useState(false);
  const [resumen, setResumen] = useState("");

  const limpiarHistorial = async () => {
    if (borrando) return;
    if (!window.confirm("⚠️ Esto eliminará TODO el historial. ¿Continuar?")) return;
    const ok2 = window.prompt('Escribe "RESET" para confirmar:');
    if (ok2 !== "RESET") return;

    setBorrando(true);
    setResumen("");
    try {
      const snap = await getDocs(collection(db, "historial"));
      if (snap.empty) {
        setResumen("No había elementos en historial.");
        return;
      }
      const CHUNK = 50;
      let borrados = 0;
      for (let i = 0; i < snap.docs.length; i += CHUNK) {
        const slice = snap.docs.slice(i, i + CHUNK);
        await Promise.all(slice.map(d => deleteDoc(doc(db, "historial", d.id))));
        borrados += slice.length;
        setResumen(`Eliminados ${borrados}/${snap.docs.length}…`);
      }
      setResumen(`✅ Historial eliminado: ${borrados} documentos.`);
    } catch (e) {
      console.error(e);
      setResumen("❌ Ocurrió un error eliminando el historial.");
    } finally {
      setBorrando(false);
    }
  };

  return (
    <div className="fondo-admin" style={{
      minHeight: "100vh", background: "#000", color: "#d4af37",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: 24, fontFamily: "'Segoe UI', sans-serif"
    }}>
      <h1 className="titulo" style={{ marginTop: 24, marginBottom: 8 }}>
        Limpieza de Historial (Staff)
      </h1>
      <p style={{ marginBottom: 18, textAlign: "center", maxWidth: 520 }}>
        Borra <b>solo</b> la colección <b>historial</b>. No toca <b>reservas</b> ni <b>reservasConfirmadas</b>.
      </p>
      <button
        onClick={limpiarHistorial}
        disabled={borrando}
        style={{
          backgroundColor: borrando ? "#7a6a33" : "#d4af37",
          color: "#000",
          padding: "12px 24px",
          border: "none",
          borderRadius: 12,
          fontSize: 18,
          fontWeight: 700,
          cursor: borrando ? "not-allowed" : "pointer",
          boxShadow: "0 0 12px rgba(212,175,55,0.6)",
          minWidth: 240,
        }}
      >
        {borrando ? "Eliminando…" : "🗑️ Resetear Historial"}
      </button>

      {resumen && (
        <div style={{
          marginTop: 16, background: "#121212", border: "1px solid #d4af37",
          borderRadius: 10, padding: 12, maxWidth: 520, textAlign: "center", width: "100%"
        }}>
          {resumen}
        </div>
      )}
    </div>
  );
}
