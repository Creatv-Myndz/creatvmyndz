/* ============================================================
   LAB — PÁGINA DE PRUEBA (lab.html)
   ------------------------------------------------------------
   Página aparte y autónoma (no usa el motor del cielo de app.js).
   Dos cosas viven acá: la galería pineada (las tarjetas aparecen
   según cuánto has bajado) y la calculadora. Todo en un IIFE, como
   wakeup.js, para no chocar nombres.
   ============================================================ */
(function () {
  const html = document.documentElement;

  /* Misma lección que en app.js: el navegador interno de Instagram/FB
     no siempre respeta position: sticky, y @supports solo dice si la
     propiedad existe. Si no podemos confiar en el sticky, la galería
     se vuelve una grilla normal (ver html.lab-static en lab.css). */
  const isIAB = /Instagram|FBAN|FBAV|FB_IAB|Line\//.test(navigator.userAgent);
  const noSticky = !(window.CSS && CSS.supports && CSS.supports("position", "sticky"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isIAB || noSticky) html.classList.add("lab-static");

  /* ---------- GALERÍA PINEADA ----------
     p = cuánto has bajado dentro de la sección (0 arriba, 1 abajo).
     Cada tarjeta trae data-stage (1, 2 o 3) y se enciende cuando p
     pasa el umbral de su etapa. */
  const gallery = document.getElementById("lab-galeria");
  const cards = gallery ? Array.from(gallery.querySelectorAll(".lab-card")) : [];
  const STAGE_AT = { 1: 0.04, 2: 0.36, 3: 0.66 };

  function galleryUpdate() {
    if (!cards.length) return;
    if (html.classList.contains("lab-static") || reduceMotion) {
      cards.forEach(c => c.classList.add("is-on"));
      return;
    }
    const top = gallery.getBoundingClientRect().top;
    const runway = gallery.offsetHeight - window.innerHeight;
    const p = runway > 0 ? Math.min(1, Math.max(0, -top / runway)) : 1;
    cards.forEach(c => {
      const stage = Number(c.dataset.stage) || 1;
      c.classList.toggle("is-on", p >= (STAGE_AT[stage] || 0));
    });
  }

  let rafPending = false;
  function schedule() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { rafPending = false; galleryUpdate(); });
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  galleryUpdate();
  // requestAnimationFrame no corre si la pestaña está en segundo plano;
  // este setTimeout garantiza una pasada aunque la página cargue oculta,
  // y visibilitychange la repite apenas la pestaña vuelve a verse.
  setTimeout(galleryUpdate, 250);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) galleryUpdate(); });

  /* ---------- CALCULADORA ----------
     Nada de dinero: horas creando, ideas capturadas, proyectos
     terminados. Son estimaciones para inspirar, y así se dicen. */
  const minEl = document.getElementById("lab-min");
  const daysEl = document.getElementById("lab-days");
  const monthsEl = document.getElementById("lab-months");
  const choices = Array.from(document.querySelectorAll(".lab-choice"));
  const $ = id => document.getElementById(id);

  if (minEl && daysEl && monthsEl) {
    let rate = 3;   // ideas capturadas por hora (según "Hacia dónde vas")
    const WEEKS_PER_MONTH = 4.33;
    const HOURS_PER_PROJECT = 12;
    const fmt = n => Math.round(n).toLocaleString("es-CO");

    function calc() {
      const min = Number(minEl.value);
      const days = Number(daysEl.value);
      const months = Number(monthsEl.value);

      const hoursPerMonth = (min * days * WEEKS_PER_MONTH) / 60;
      const hours = hoursPerMonth * months;
      const ideas = hours * rate;
      const projects = Math.max(1, Math.floor(hours / HOURS_PER_PROJECT));
      const weeks = Math.round(months * WEEKS_PER_MONTH);
      // Un módulo por semana, hasta los 10 que hay.
      const modules = Math.min(10, weeks);

      $("lab-min-out").textContent = min;
      $("lab-days-out").textContent = days;
      $("lab-months-out").textContent = months;
      $("lab-months-echo").textContent = months;
      $("lab-hours").textContent = fmt(hours);
      $("lab-hours-month").textContent = fmt(hoursPerMonth);
      $("lab-ideas").textContent = fmt(ideas);
      $("lab-projects").textContent = fmt(projects);
      $("lab-weeks").textContent = fmt(weeks);
      $("lab-modules").textContent = modules + " / 10";
    }

    [minEl, daysEl, monthsEl].forEach(el => el.addEventListener("input", calc));
    choices.forEach(btn => {
      btn.addEventListener("click", () => {
        choices.forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        rate = Number(btn.dataset.rate) || 3;
        calc();
      });
    });
    calc();
  }

  const year = document.getElementById("lab-year");
  if (year) year.textContent = new Date().getFullYear();
})();
