export const INTRO_STORAGE_KEY = "up10:intro:v1";

/**
 * Se ejecuta en el <head> antes del primer paint. Deja el overlay visible solo
 * cuando corresponde: home, primera visita y sin movimiento reducido.
 */
export const INTRO_GATE_SCRIPT = `
(function () {
  try {
    if (window.__up10IntroGate) return;
    window.__up10IntroGate = true;

    var root = document.documentElement;
    var path = window.location.pathname;
    var isHome = path === "/" || path === "/index.html" || path === "";
    if (!isHome) return;

    var force = /(?:^|[?&])intro=1(?:&|$)/.test(window.location.search);
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var seen = false;

    try {
      seen = window.localStorage.getItem("${INTRO_STORAGE_KEY}") === "1";
    } catch (error) {
      seen = false;
    }

    if (reduce || (!force && seen)) return;

    root.setAttribute("data-intro", "on");
    if (force) root.setAttribute("data-intro-force", "on");
    root.classList.add("intro-lock");

    /* Red de seguridad: si la hidratación no llega, la portada no queda tapada. */
    window.setTimeout(function () {
      if (root.getAttribute("data-intro") !== "on") return;
      root.removeAttribute("data-intro");
      root.removeAttribute("data-intro-force");
      root.classList.remove("intro-lock");

      var site = document.getElementById("site-content");
      if (site) site.removeAttribute("inert");
    }, 13000);
  } catch (error) {
    /* Si algo falla, la página queda visible. */
  }
})();
`;
