// src/data/servicios.js
// Tarjetas para la página de Inicio (con icono + texto)
export const SERVICIOS_TARJETAS = [
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

// Lista simple para selects y formularios (solo títulos)
export const SERVICIOS_TITULOS = SERVICIOS_TARJETAS.map(s => s.titulo);
