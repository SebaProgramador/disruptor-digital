// src/pages/Politicas.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

export default function Politicas() {
  const navigate = useNavigate();

  const handleAceptar = () => {
    navigate("/reservar");
  };

  return (
    <div
      style={{
        backgroundColor: "#000",
        minHeight: "100vh",
        color: "#d4af7f",
        padding: "20px",
        fontFamily: "'Georgia', serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#121212",
          border: "2px solid #b88c50",
          padding: "24px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(184, 140, 80, 0.8)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#b88c50",
            fontSize: "1.8rem",
            marginBottom: "20px",
            textShadow: "0 0 8px #b88c50aa",
          }}
        >
          📜 Términos y Condiciones
        </h1>

        <ul
          style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            paddingLeft: "20px",
            marginBottom: "32px",
          }}
        >
          <li style={{ marginBottom: "14px" }}>
            <strong>⏰ Tiempos de espera:</strong> Máximo 15 minutos el día de la
            reunión. Si no te conectas sin aviso previo, deberás pagar igualmente.
          </li>
          <li style={{ marginBottom: "14px" }}>
            <strong>📅 Atrasos y notificaciones:</strong> Debes notificar
            reprogramación al menos 2 días antes. Si no entregas tu información a
            tiempo, se reprogramará la entrega.
          </li>
          <li style={{ marginBottom: "14px" }}>
            <strong>💰 Condiciones de pago:</strong> 60% al inicio, 40% restante el
            día de la reunión. Se paga por transferencia.
          </li>
          <li>
            <strong>🤝 Responsabilidad profesional:</strong> Me comprometo a trabajar
            con ética y mantener la confidencialidad de tu información.
          </li>
        </ul>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleAceptar}
            style={{
              padding: "14px 20px",
              backgroundColor: "#b88c50",
              color: "#121212",
              border: "none",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 0 18px #b88c50cc",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.3s ease",
              width: "100%",
              maxWidth: "350px",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <FaCheckCircle />
            Aceptar y Reservar
          </button>
        </div>
      </div>
    </div>
  );
}
