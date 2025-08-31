// src/pages/Inicio.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import estilos from "../estilos/inicioEstilos"; // Importamos los estilos separados

// ✅ Servicios ACTUALIZADOS (modo enseñanza) — se eliminaron “Cierre de Ventas” y “Servicio Completo”
export const servicios = [
  {
    icono: "💡🔍",
    titulo: "Estrategia de Redes Sociales",
    texto:
      "Te ayudo a crear un plan de marketing personalizado para aumentar tu visibilidad y conectar con tu público en redes sociales.",
  },
  {
    icono: "📱💬",
    titulo: "Gestión de Redes Sociales",
    texto:
      "Te enseño todas las técnicas necesarias para que puedas manejar tus redes sociales de manera efectiva.",
  },
  {
    icono: "✏️📄",
    titulo: "Creación de Contenido",
    texto:
      "Te enseño a crear contenido que destaque sobre tu competencia con un enfoque innovador y efectivo.",
  },
  {
    icono: "🖌️📐",
    titulo: "Creación de Logotipo",
    texto:
      "Te enseño a crear un logotipo que refleje lo que ofreces y que además represente la esencia y los valores de tu marca.",
  },
  {
    icono: "🚚📦",
    titulo: "Logística",
    texto:
      "Te enseño técnicas de optimización para garantizar que tu producto o servicio se entregue de manera clara y eficiente.",
  },
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
            href="https://wa.me/56955348010"
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
