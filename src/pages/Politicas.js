import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaClock,
  FaBell,
  FaMoneyBillWave,
  FaUserShield,
} from "react-icons/fa";

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
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Georgia', serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#121212",
          border: "2px solid #b88c50",
          borderRadius: "20px",
          padding: "24px",
          width: "100%",
          maxWidth: "850px",
          boxShadow: "0 0 25px rgba(184, 140, 80, 0.6)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#d4af7f",
            fontSize: "1.9rem",
            marginBottom: "24px",
            textShadow: "0 0 8px #b88c50aa",
          }}
        >
          📜 Términos y Condiciones
        </h1>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            color: "#f5deb3",
            fontSize: "1rem",
            lineHeight: 1.6,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <li>
            <p style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", color: "#b88c50" }}>
              <FaClock /> Tiempos de espera:
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
              <li>- Llegado el día de la reunión, el tiempo de espera es máximo 15 minutos.</li>
              <li>- Si el cliente no se conecta en el tiempo estipulado sin aviso previo deberá hacer el pago de igual manera.</li>
            </ul>
          </li>

          <li>
            <p style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", color: "#b88c50" }}>
              <FaBell /> Atrasos y notificaciones:
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
              <li>- Si el cliente necesita reprogramar la reunión se deberá notificar 2 días antes de la fecha pactada.</li>
              <li>- Si la información del proyecto no es entregada de manera oportuna ni completa el profesional no comenzará con proyecto y se le asignará una nueva fecha de entrega.</li>
            </ul>
          </li>

          <li>
            <p style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", color: "#b88c50" }}>
              <FaMoneyBillWave /> Condiciones de pago:
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
              <li>- El primer pago corresponderá al 60% de la inversión total del proyecto mientras que el 40% restante deberá realizarse un día de la reunión.</li>
              <li>- Los pagos se realizan a través de transferencia a la cuenta que el profesional le asignará.</li>
            </ul>
          </li>

          <li>
            <p style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", color: "#b88c50" }}>
              <FaUserShield /> Responsabilidad profesional:
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
              <li>- El profesional se compromete a realizar un trabajo de manera responsable y ética.</li>
              <li>- El profesional se compromete a mantener confidencialidad en la información que el cliente le proporciona ya sea acerca del proyecto realizado o lo conversado en las reuniones.</li>
            </ul>
          </li>
        </ul>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={handleAceptar}
            style={{
              padding: "14px 24px",
              backgroundColor: "#b88c50",
              color: "#121212",
              border: "none",
              borderRadius: "14px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 0 20px #b88c50cc",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.3s ease",
              width: "100%",
              maxWidth: "320px",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <FaCheckCircle />
            Aceptar y reservar
          </button>
        </div>
      </div>
    </div>
  );
}
