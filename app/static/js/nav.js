/**
 * Navigation + theme toggle (dark/light) with localStorage persistence.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "portfolio-theme";
  var LANG_KEY = "lang";
  var root = document.documentElement;
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.querySelector(".nav-menu");
  var navLinks = document.querySelectorAll(".nav-menu a[data-nav]");
  var themeToggle = document.querySelector(".theme-toggle");
  var themeIcon = document.querySelector(".theme-icon");
  var langEn = document.querySelector('[data-lang="en"]');
  var langEs = document.querySelector('[data-lang="es"]');

  var translations = {
    en: {
      nav_home: "Home",
      nav_about: "About",
      nav_projects: "Projects",
      nav_blog: "Blog",
      nav_contact: "Contact",
      hero_name: "Maleno Santander",
      hero_title: "Machine Learning and Deep Learning Engineer",
      hero_bio:
        "I am a machine learning and deep learning engineer with a passion for building scalable and efficient machine learning models. I am currently working on a project to build a recommendation system for a retail company.",
      blog_title: "Blog",
      blog_subtitle: "Articles about AI, ML and Web Development",
      read_more: "Read more →",
      cat_ai: "AI",
      cat_ml: "Machine Learning",
      cat_dl: "Deep Learning",
      cat_web: "Web Development",
      post_1_title: "The Future of Large Language Models in 2026",
      post_2_title: "Building Recommendation Systems with Python",
      post_3_title: "Getting Started with UV: The Fastest Python Package Manager",
      post_4_title: "Deep Learning vs Traditional ML: When to Use Each",
      contact_title: "Contact",
      contact_subtitle: "Get in touch",
      contact_button: "Send Message",
      chat_title: "AI Assistant",
      chat_subtitle: "Powered by Google Gemini",
      chat_placeholder: "Ask me anything…",
      chat_send: "Send",
      chat_clear: "Clear",
      chat_fab_aria: "Open chat assistant",
      chat_close_aria: "Close chat",
      chat_clear_aria: "Clear chat history",
      chat_welcome:
        "Hi! I'm Maleno's AI assistant. Ask me anything about ML, AI, or software development! 🤖",
      chat_err_missing_key:
        "⚠️ API key not configured. Add GOOGLE_AI_API_KEY to the project root `.env` file (never put API keys in config.js in the browser).",
      chat_err_connect: "Sorry, I couldn't connect to the AI. Please try again.",
      chat_err_rate_limit: "Too many requests. Please wait a moment and try again.",
    },
    es: {
      nav_home: "Inicio",
      nav_about: "Sobre mí",
      nav_projects: "Proyectos",
      nav_blog: "Blog",
      nav_contact: "Contacto",
      hero_name: "Maleno Santander",
      hero_title: "Ingeniero de Machine Learning y Deep Learning",
      hero_bio:
        "Soy un ingeniero de machine learning y deep learning con pasión por construir modelos de aprendizaje automático escalables y eficientes. Actualmente trabajo en un proyecto para construir un sistema de recomendación para una empresa de retail.",
      blog_title: "Blog",
      blog_subtitle: "Artículos sobre IA, ML y Desarrollo Web",
      read_more: "Leer más →",
      cat_ai: "IA",
      cat_ml: "Machine Learning",
      cat_dl: "Deep Learning",
      cat_web: "Desarrollo Web",
      post_1_title: "El Futuro de los Modelos de Lenguaje en 2026",
      post_2_title: "Construyendo Sistemas de Recomendación con Python",
      post_3_title: "Comenzando con UV: El Gestor de Paquetes más Rápido",
      post_4_title: "Deep Learning vs ML Tradicional: Cuándo Usar Cada Uno",
      contact_title: "Contacto",
      contact_subtitle: "Ponte en contacto",
      contact_button: "Enviar Mensaje",
      chat_title: "Asistente IA",
      chat_subtitle: "Con la tecnología de Google Gemini",
      chat_placeholder: "Pregúntame algo…",
      chat_send: "Enviar",
      chat_clear: "Borrar",
      chat_fab_aria: "Abrir asistente de chat",
      chat_close_aria: "Cerrar chat",
      chat_clear_aria: "Borrar historial del chat",
      chat_welcome:
        "¡Hola! Soy el asistente IA de Maleno. ¡Pregúntame sobre ML, IA o desarrollo de software! 🤖",
      chat_err_missing_key:
        "⚠️ API key no configurada. Añade GOOGLE_AI_API_KEY en el archivo `.env` en la raíz del proyecto (nunca pongas claves en config.js en el navegador).",
      chat_err_connect: "No pude conectar con la IA. Inténtalo de nuevo.",
      chat_err_rate_limit: "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.",
    },
  };

  function applyTheme(theme) {
    var mode = theme === "light" ? "light" : "dark";
    root.setAttribute("data-theme", mode);
    if (themeToggle && themeIcon) {
      themeToggle.setAttribute("aria-label", mode === "dark" ? "Switch to light mode" : "Switch to dark mode");
      themeToggle.setAttribute("aria-pressed", mode === "light" ? "true" : "false");
      themeIcon.textContent = mode === "dark" ? "🌙" : "☀️";
    }
  }

  function initTheme() {
    var saved = localStorage.getItem(STORAGE_KEY) || "dark";
    applyTheme(saved);
  }

  initTheme();

  function switchLanguage(lang, persist) {
    var next = lang === "es" ? "es" : "en";
    if (persist) localStorage.setItem(LANG_KEY, next);
    root.setAttribute("lang", next);

    if (langEn && langEs) {
      langEn.classList.toggle("is-active", next === "en");
      langEs.classList.toggle("is-active", next === "es");
      langEn.setAttribute("aria-pressed", next === "en" ? "true" : "false");
      langEs.setAttribute("aria-pressed", next === "es" ? "true" : "false");
    }

    var dict = translations[next];
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key || !dict[key]) return;
      el.textContent = dict[key];
    });

    document.dispatchEvent(
      new CustomEvent("portfolio-lang-changed", { detail: { lang: next } }),
    );
  }

  function initLanguage() {
    var saved = localStorage.getItem(LANG_KEY) || "en";
    switchLanguage(saved, false);
  }

  initLanguage();

  if (langEn) {
    langEn.addEventListener("click", function () {
      switchLanguage("en", true);
    });
  }
  if (langEs) {
    langEs.addEventListener("click", function () {
      switchLanguage("es", true);
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }

  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY && e.newValue) applyTheme(e.newValue);
    if (e.key === LANG_KEY && e.newValue) switchLanguage(e.newValue, false);
  });

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navMenu.querySelectorAll("a").forEach(function (anchor) {
      anchor.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 768px)").matches) {
          navMenu.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  var path = window.location.pathname.replace(/\/$/, "") || "/";
  navLinks.forEach(function (link) {
    var nav = link.getAttribute("data-nav");
    if (!nav) return;
    if (nav === "home" && (path === "/" || path === "")) {
      link.classList.add("is-active");
    } else if (nav !== "home" && path.endsWith("/" + nav)) {
      link.classList.add("is-active");
    }
  });
})();
