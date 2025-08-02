const estilos = {
  fondo: {
    backgroundColor: "#0e0e0e",
    minHeight: "100vh",
    padding: "20px",
    color: "#d4af50",
    fontFamily: "'Segoe UI', sans-serif",
  },
  contenedor: {
    maxWidth: "700px",
    margin: "auto",
    backgroundColor: "#1a1a1a",
    padding: "30px",
    borderRadius: "20px",
    border: "2px solid #b88c50",
    boxShadow: "0 0 15px rgba(212, 175, 80, 0.2)",
  },
  titulo: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#d4af50",
    textShadow: "0 0 5px #b88c50",
  },
  logo: {
    width: "100px",
    borderRadius: "50%",
    marginBottom: "10px",
  },
  etiqueta: {
    display: "block",
    margin: "15px 0 5px",
    fontWeight: "bold",
    fontSize: "1rem",
    color: "#d4af50",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #b88c50",
    backgroundColor: "#141414",
    color: "#fff",
    fontSize: "1rem",
    marginBottom: "10px",
  },
  opcionDisponible: {
    backgroundColor: "#141414",
    color: "#d4af50",
  },
  opcionNoDisponible: {
    backgroundColor: "#1a1a1a",
    color: "#888",
  },
  boton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#d4af50",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
    transition: "background-color 0.3s, transform 0.2s",
  },
  botonDisabled: {
    backgroundColor: "#555",
    cursor: "not-allowed",
  },
  volver: {
    display: "block",
    textAlign: "center",
    marginTop: "30px",
    color: "#d4af50",
    textDecoration: "none",
    fontSize: "1rem",
  },
  volverHover: {
    color: "#fff",
    textShadow: "0 0 5px #d4af50",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px",
    animation: "fadeIn 0.5s ease-in-out",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    padding: "30px 20px",
    borderRadius: "20px",
    border: "2px solid #d4af50",
    textAlign: "center",
    color: "#d4af50",
    maxWidth: "350px",
    width: "100%",
    boxShadow: "0 0 15px rgba(212, 175, 80, 0.4)",
    animation: "zoomIn 0.5s ease",
  },
  gifCarga: {
    width: "90px",
    height: "90px",
    objectFit: "contain",
    marginBottom: "20px",
  },
  mensajeCarga: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    lineHeight: "1.4",
  },
  mensajeExito: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    lineHeight: "1.4",
  },
};

// Animaciones como CSS global para fadeIn y zoomIn
const globalStyles = `
@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}
@keyframes zoomIn {
  from { transform: scale(0.7); opacity: 0 }
  to { transform: scale(1); opacity: 1 }
}
button:hover {
  transform: scale(1.03);
  background-color: #e0c170 !important;
}
`;

const styleTag = document.createElement("style");
styleTag.innerHTML = globalStyles;
document.head.appendChild(styleTag);

export default estilos;
