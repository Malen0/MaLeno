/**
 * Navigation + theme toggle (dark/light) with localStorage persistence.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "portfolio-theme";
  var root = document.documentElement;
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.querySelector(".nav-menu");
  var navLinks = document.querySelectorAll(".nav-menu a[data-nav]");
  var themeToggle = document.querySelector(".theme-toggle");
  var themeIcon = document.querySelector(".theme-icon");

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

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }

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
