/**
 * Site navigation: mobile hamburger + active link state by pathname.
 */
(function () {
  "use strict";

  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  const links = document.querySelectorAll(".nav-menu a[data-nav]");

  /* Hamburger: open / close mobile menu */
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    /* Close menu when a link is clicked (mobile) */
    menu.querySelectorAll("a").forEach(function (anchor) {
      anchor.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 768px)").matches) {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  /* Highlight active nav item from data-nav + current path */
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  links.forEach(function (link) {
    const nav = link.getAttribute("data-nav");
    if (!nav) return;
    if (nav === "home" && (path === "/" || path === "")) {
      link.classList.add("is-active");
    } else if (nav !== "home" && path.endsWith("/" + nav)) {
      link.classList.add("is-active");
    }
  });
})();
