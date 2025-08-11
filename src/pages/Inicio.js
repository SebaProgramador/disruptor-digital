// src/pages/Inicio.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import estilos from "../estilos/inicioEstilos"; // Importamos los estilos separados

const servicios = [
  { icono: "💡🔍", titulo: "Estrategia de Redes Sociales", texto: "Desarrollamos un plan personalizado para aumentar tu visibilidad y conectar con tu público objetivo en redes sociales." },
  { icono: "📱💬", titulo: "Gestión de Redes Sociales", texto: "Creamos contenido atractivo, respondemos a comentarios y mensajes, y monitoreamos tus métricas para maximizar tu presencia en línea." },
  { icono: "✏️📄", titulo: "Creación de Contenido", texto: "Desarrollamos contenido de alta calidad y relevante para tu audiencia, incluyendo textos, imágenes, videos y más." },
  { icono: "🖌️📐", titulo: "Creación de Logo", texto: "Diseñamos un logotipo único y memorable que refleje la esencia de tu marca." },
  { icono: "🚚📦", titulo: "Logística", texto: "Optimizamos tus procesos internos y externos para garantizar que tu producto o servicio llegue a tus clientes de manera eficiente." },
  { icono: "✅💵", titulo: "Estrategia de Cierre de Ventas", texto: "Plan personalizado para aumentar tus ventas, incluyendo gestión, capacitación y análisis para maximizar tus resultados." },
  { icono: "✅", titulo: "Servicio Completo", texto: "Nos encargamos de la estrategia, contenido, diseño y logística para que puedas enfocarte en crecer y prosperar." },
];

export default function Inicio() {
  const [hoverReservar, setHoverReservar] = useState(false);
  const [hoverAdmin, setHoverAdmin] = useState(false);

  // ===== Slider Portada =====
  const imagenes = useMemo(() => ["/portada-disruptor.jpg", "/portada-disruptor-2.jpg"], []);
  const [idx, setIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const hoverRef = useRef(false);

  // Pre-carga de imágenes para evitar parpadeos
  useEffect(() => {
    imagenes.forEach((src) => {
      const im = new Image();
      im.src = src;
    });
  }, [imagenes]);

  // Cambio automático con fade
  useEffect(() => {
    if (paused || hoverRef.current) return;
    const t = setInterval(() => {
      setPrevIdx((p) => p);
      setIdx((i) => (i + 1) % imagenes.length);
      setPrevIdx((p) => (p + 1) % imagenes.length);
    }, 5000); // cada 5s
    return () => clearInterval(t);
  }, [paused, imagenes.length]);

  const goTo = (i) => {
    if (i === idx) return;
    setPrevIdx(idx);
    setIdx(i % imagenes.length);
  };

  // Estilos locales del slider (manteniendo tu estética dorado/negro)
  const sliderStyles = {
    contenedor: {
      position: "relative",
      width: "100%",
      maxWidth: 1200,
      margin: "0 auto 18px auto",
      borderRadius: 18,
      overflow: "hidden",
      border: "2px solid #d4af37",
      boxShadow: "0 10px 28px rgba(184, 140, 80, 0.9), inset 0 0 12px 4px #d4af7f",
      aspectRatio: "16/9",
      background: "#000",
    },
    capaBrillo: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.35))",
      pointerEvents: "none",
      zIndex: 2,
    },
    slideBase: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "opacity 1.2s ease-in-out, transform 6s ease-out",
      willChange: "opacity, transform",
    },
    dots: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 10,
      display: "flex",
      justifyContent: "center",
      gap: 8,
      zIndex: 3,
    },
    dot: (active) => ({
      width: active ? 12 : 9,
      height: active ? 12 : 9,
      borderRadius: "50%",
      border: "1px solid #d4af37",
      background: active ? "#d4af37" : "transparent",
      boxShadow: active ? "0 0 10px #ffd700aa" : "none",
      cursor: "pointer",
      transition: "all 0.25s ease",
    }),
    textoCaja: {
      position: "relative",
      zIndex: 3,
      marginTop: 12,
      textAlign: "center",
    },
  };

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.fondo} />

      <div style={estilos.contenido}>
        {/* 👤 Presentación con SLIDER */}
        <section style={estilos.portada}>
          <div
            style={sliderStyles.contenedor}
            onMouseEnter={() => {
              hoverRef.current = true;
              setPaused(true);
            }}
            onMouseLeave={() => {
              hoverRef.current = false;
              setPaused(false);
            }}
          >
            {/* Imagen anterior (para fundido cruzado suave) */}
            <img
              key={`prev-${prevIdx}`}
              src={imagenes[prevIdx]}
              alt="Portada Disruptor Digital"
              style={{
                ...sliderStyles.slideBase,
                opacity: 0,
              }}
            />
            {/* Imagen activa */}
            <img
              key={`curr-${idx}`}
              src={imagenes[idx]}
              alt="Portada Disruptor Digital"
              style={{
                ...sliderStyles.slideBase,
                opacity: 1,
                transform: "scale(1.03)", // leve zoom elegante
              }}
            />
            <div style={sliderStyles.capaBrillo} />
            {/* Dots */}
            <div style={sliderStyles.dots}>
              {imagenes.map((_, i) => (
                <span
                  key={`dot-${i}`}
                  onClick={() => goTo(i)}
                  style={sliderStyles.dot(i === idx)}
                  title={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Texto de presentación debajo del slider */}
          <div style={sliderStyles.textoCaja}>
            <p style={{ marginBottom: 12 }}>
              Asesoría en marketing con visión moderna y elegante. Mi misión es ayudarte a crear y ejecutar
              cualquier proyecto digital con ideas innovadoras, estrategias efectivas y una presencia que marque diferencia.
            </p>
            <p>Mi compromiso es dejar huella en cada uno de los emprendimientos que confíen en mis conocimientos.</p>
          </div>
        </section>

        {/* 🎯 Misión y Visión */}
        <section style={estilos.tarjeta}>
          <h2 style={estilos.titulo}>Misión & Visión</h2>
          <p style={estilos.texto}>
            <strong>Misión:</strong> Impulsar tu marca, conectar con tu audiencia y convertir ideas en realidades digitales que generen impacto y crecimiento sostenible.
          </p>
          <p style={estilos.texto}>
            <strong>Visión:</strong> Ser un referente clave en el marketing digital moderno, reconocido por creatividad, confianza y resultados medibles.
          </p>
        </section>

        {/* 💼 Servicios */}
        <section style={estilos.serviciosContenedor}>
          <h2 style={estilos.serviciosTitulo}>Servicios</h2>
          <div style={estilos.serviciosGrid}>
            {servicios.map(({ icono, titulo, texto }, i) => (
              <article
                key={i}
                style={estilos.servicioCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                  e.currentTarget.style.boxShadow =
                    "0 14px 38px rgba(184, 140, 80, 0.95), inset 0 0 20px 7px #d4af7f";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow =
                    "0 10px 28px rgba(184, 140, 80, 0.9), inset 0 0 15px 5px #d4af7f";
                }}
              >
                <div style={estilos.servicioIcono}>{icono}</div>
                <h3 style={estilos.servicioTitulo}>{titulo}</h3>
                <p style={estilos.servicioTexto}>{texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 📩 Consultas */}
        <section style={estilos.consultas}>
          <h2 style={estilos.consultasTitulo}>Consultas y Dudas</h2>
          <a
            href="https://wa.me/56912345678"
            target="_blank"
            rel="noreferrer"
            style={estilos.enlaceWhatsapp}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#25D366";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.boxShadow = "0 0 24px #25D366cc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#25D366";
              e.currentTarget.style.boxShadow = "0 0 18px #25D366aa";
            }}
          >
            <FaWhatsapp size={28} /> +56 9 3005 3314
          </a>
        </section>

        {/* 📆 Botones */}
        <div
          style={{
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            gap: "28px",
            flexWrap: "wrap",
            marginTop: "50px",
            marginBottom: "60px",
          }}
        >
          <Link
            to="/Politicas"
            style={{
              ...estilos.boton,
              ...(hoverReservar ? estilos.botonHoverReservar : {}),
              borderWidth: "2px",
              borderStyle: "solid",
              borderColor: "#d4af37",
            }}
            onMouseEnter={() => setHoverReservar(true)}
            onMouseLeave={() => setHoverReservar(false)}
          >
            📅 Iniciar Reserva de Asesoría
          </Link>

          <Link
            to="/admin-login"
            style={{
              ...estilos.boton,
              ...(hoverAdmin ? estilos.botonHoverReservar : {}),
              borderWidth: "2px",
              borderStyle: "solid",
              borderColor: "#d4af37",
            }}
            onMouseEnter={() => setHoverAdmin(true)}
            onMouseLeave={() => setHoverAdmin(false)}
          >
            🔑 Intranet Admin
          </Link>
        </div>

        <footer style={estilos.footer}>
          © {new Date().getFullYear()} Disruptor Digital — Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
