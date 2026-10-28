/* ============================================================
   CREATV MYNDZ — LÓGICA DEL SITIO
   ------------------------------------------------------------
   index.html, proyectos.html y crtv-*.html. Los proyectos salen de
   assets/projects.js (cárgalo antes que este archivo donde haga falta).
   ============================================================ */

document.documentElement.classList.add("js");

/* ------------------------------------------------------------
   TRADUCCIONES
   ------------------------------------------------------------ */
const I18N = {
  es: {
    nav_work: "PROYECTOS", nav_about: "NOSOTROS", nav_wakeup: "WAKE UP",
    tagline: "Tomamos las ideas, exploramos los límites de la creatividad y las traemos a la realidad.",
    pg_cta: "VER PROYECTOS CREATIVOS",
    mq_1: "CREER", mq_2: "CREAR", mq_3: "CRECER", mq_4: "CREATIVIDAD INFINITA",
    dl_lead: "Creatividad universal aplicada a marcas globales.",
    dl_sub: "Tomamos la cultura, la convertimos en ideas y las materializamos para marcas que le hablan al mundo.",
    dl_brands: "MARCAS CON LAS QUE HEMOS TRABAJADO",
    local_time: "// HORA LOCAL",
    title_work: "PROYECTOS — CREATV MYNDZ",
    aria_nav: "Navegación principal", aria_home: "Inicio", aria_filter: "Filtrar",
    aria_view: "Vista", aria_more: "Otros CRTV",
    work_all: "VER TODOS LOS PROYECTOS",
    pg_lead: "Todos los CRTV de CREATV MYNDZ, uno por uno.",
    f_all: "TODOS", f_done: "HECHOS", f_soon: "PRÓXIMOS",
    v_list: "LISTA", v_grid: "GRILLA",
    soon: "PRÓXIMO",
    ab_title: "CREATIVIDAD INFINITA",
    ab_p1: "Creemos en la creatividad como propósito de vida y razón de nuestra existencia. Todos somos creativos, y tenemos ese don.",
    ab_c1t: "CREER", ab_c1d: "Cree en ti, cree en tus ideas.",
    ab_c2t: "CREAR", ab_c2d: "Nunca pares de crear. Materializa esas ideas: son un regalo.",
    ab_c3t: "CRECER", ab_c3d: "Cuando cumples la 1 y la 2, es inevitable.",
    ab_cta: "COMENZAR A CREAR →",
    wu_kicker: "DESPERTAR CREATIVO",
    wu_sub: "La creatividad no es algo que se entrena: se recuerda. Es algo que durmieron dentro de ti, y puedes despertarla. Despierta tu potencial, despierta tu propósito, despierta la forma más pura de crear que hay en ti.",
    wu_f1: "Programa despertar.",
    wu_f2: "Serie de audios e hipnosis para despertar tu CREATV.",
    wu_f3: "Acceso al Discord y a la comunidad CREATV MYNDZ.",
    wu_cta: "CONOCER EL PROGRAMA →",
    wu_preview: "Ver construcción del programa →",
    footer_lab: "Página de prueba",
    footer_nav: "NAVEGA",
    footer_more: "MÁS",
    back_work: "← PLAYGROUND",
    prev: "← ANTERIOR", next: "SIGUIENTE →"
  },
  en: {
    nav_work: "WORK", nav_about: "ABOUT", nav_wakeup: "WAKE UP",
    tagline: "We take ideas, explore the limits of creativity and bring them to reality.",
    pg_cta: "SEE CREATIVE PROJECTS",
    mq_1: "BELIEVE", mq_2: "CREATE", mq_3: "GROW", mq_4: "INFINITE CREATIVITY",
    dl_lead: "Universal creativity applied to global brands.",
    dl_sub: "We take culture, turn it into ideas and materialize them for brands that speak to the world.",
    dl_brands: "BRANDS WE HAVE WORKED WITH",
    local_time: "// LOCAL TIME",
    title_work: "WORK — CREATV MYNDZ",
    aria_nav: "Main navigation", aria_home: "Home", aria_filter: "Filter",
    aria_view: "View", aria_more: "More CRTV",
    work_all: "SEE ALL WORK",
    pg_lead: "Every CRTV by CREATV MYNDZ, one by one.",
    f_all: "ALL", f_done: "DONE", f_soon: "SOON",
    v_list: "LIST", v_grid: "GRID",
    soon: "SOON",
    ab_title: "INFINITE CREATIVITY",
    ab_p1: "We believe creativity is a life purpose and the reason we exist. We are all creative — that gift is already in you.",
    ab_c1t: "BELIEVE", ab_c1d: "Believe in yourself, believe in your ideas.",
    ab_c2t: "CREATE", ab_c2d: "Never stop creating. Materialize those ideas: they are a gift.",
    ab_c3t: "GROW", ab_c3d: "Once you do the first two, it is inevitable.",
    ab_cta: "START CREATING →",
    wu_kicker: "CREATIVE AWAKENING",
    wu_sub: "Creativity is not something you train: it is something you remember. It was put to sleep inside you, and you can wake it up. Wake up your potential, your purpose, the purest way of creating that lives in you.",
    wu_f1: "Wake-up program.",
    wu_f2: "A series of audios and hypnosis to wake up your CREATV.",
    wu_f3: "Access to the Discord and the CREATV MYNDZ community.",
    wu_cta: "SEE THE PROGRAM →",
    wu_preview: "See the program in progress →",
    footer_lab: "Test page",
    footer_nav: "NAVIGATE",
    footer_more: "MORE",
    back_work: "← PLAYGROUND",
    prev: "← PREVIOUS", next: "NEXT →"
  }
};

const storage = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};

let lang = storage.get("cm-lang") === "en" ? "en" : "es";
const t = key => I18N[lang][key] || I18N.es[key] || "";

const PREFIX = "CRTV";
const code = n => (n === null || n === undefined) ? PREFIX : PREFIX + " " + String(n).padStart(2, "0");
const hasPage = p => !!p.link && p.status !== "soon";
const HAS_PROJECTS = typeof PROJECTS !== "undefined";

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  document.querySelectorAll(".lang").forEach(b => {
    const on = b.dataset.lang === lang;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on);
  });
  renderFeatured();
  renderWork();
}

document.querySelectorAll(".lang").forEach(b => {
  b.addEventListener("click", () => { lang = b.dataset.lang; storage.set("cm-lang", lang); applyLang(); });
});


/* ------------------------------------------------------------
   TARJETA Y FILA DE PROYECTO
   ------------------------------------------------------------ */
function makeCard(p, i) {
  const li = document.createElement("li");
  const linked = hasPage(p);
  li.className = "card " + p.status + (linked ? " linked" : "");
  li.dataset.reveal = "";
  li.style.setProperty("--d", (i % 3) * 0.08 + "s");

  const box = document.createElement(linked ? "a" : "div");
  if (linked) box.href = p.link;

  const media = document.createElement("div");
  media.className = "card-media";
  if (linked && p.image) {
    const img = document.createElement("img");
    img.src = p.image; img.alt = ""; img.loading = "lazy";
    img.width = 512; img.height = 640;
    media.appendChild(img);
  }

  // Código y título van encima de la imagen (con blur), no debajo.
  const over = document.createElement("div");
  over.className = "card-over";
  const top = document.createElement("div");
  top.className = "card-top";
  const n = document.createElement("span"); n.className = "label card-code"; n.textContent = code(p.num);
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  if (linked) { arrow.className = "card-arrow"; arrow.textContent = "↗"; }
  else if (p.status === "soon") { arrow.className = "label"; arrow.textContent = t("soon"); }
  top.append(n, arrow);
  const title = document.createElement("span"); title.className = "card-title"; title.textContent = p.title;
  over.append(top, title);
  media.appendChild(over);

  box.append(media);
  li.appendChild(box);
  return li;
}

function makeRow(p) {
  const li = document.createElement("li");
  const linked = hasPage(p);
  li.className = "project-row " + p.status + (linked ? "" : " nolink");

  const a = document.createElement(linked ? "a" : "span");
  if (linked) a.href = p.link;
  if (linked && p.image) a.dataset.preview = p.image;

  const num = document.createElement("span");
  num.className = "p-num label";
  num.textContent = code(p.num);

  const title = document.createElement("span");
  title.className = "p-title";
  title.textContent = p.title;
  if (p.status === "soon") title.setAttribute("aria-label", t("soon"));
  a.append(num, title);

  if (linked && p.image) {
    const img = document.createElement("img");
    img.className = "p-thumb";
    img.src = p.image; img.alt = ""; img.loading = "lazy";
    img.width = 56; img.height = 68;
    a.appendChild(img);
  }

  const go = document.createElement("span");
  go.className = "p-go" + (linked ? "" : " label");
  go.textContent = p.status === "soon" ? t("soon") : (linked ? "↗" : "");
  go.setAttribute("aria-hidden", "true");
  a.appendChild(go);

  li.appendChild(a);
  return li;
}


/* ------------------------------------------------------------
   PORTADA: proyectos seleccionados (los primeros con imagen)
   ------------------------------------------------------------ */
const featuredEl = document.getElementById("featured");
const FEATURED_COUNT = 4;

function renderFeatured() {
  if (!featuredEl || !HAS_PROJECTS) return;
  featuredEl.innerHTML = "";
  PROJECTS.filter(p => hasPage(p) && p.image).slice(0, FEATURED_COUNT)
    .forEach((p, i) => featuredEl.appendChild(makeCard(p, i)));
  document.querySelectorAll("[data-count]").forEach(el => {
    el.textContent = "(" + String(PROJECTS.length).padStart(2, "0") + ")";
  });
  observeReveal();
}


/* ------------------------------------------------------------
   PORTADA: banner CREATIVE PLAYGROUND (video, o cinta de portadas)
   ------------------------------------------------------------ */
const pgVideo = document.getElementById("pg-video");
const pgStrip = document.getElementById("pg-strip");
if (pgVideo && typeof SITE !== "undefined" && SITE.playgroundVideo) {
  pgVideo.src = SITE.playgroundVideo;
  pgVideo.hidden = false;
  if (pgStrip) pgStrip.hidden = true;
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    pgVideo.autoplay = true;
    pgVideo.play().catch(() => {});
  }
} else if (pgStrip && HAS_PROJECTS) {
  const imgs = PROJECTS.filter(p => hasPage(p) && p.image).map(p => p.image);
  const track = document.createElement("div");
  track.className = "pg-strip-track";
  [...imgs, ...imgs].forEach(src => {
    const img = document.createElement("img");
    img.src = src; img.alt = ""; img.loading = "lazy"; img.width = 256; img.height = 320;
    track.appendChild(img);
  });
  pgStrip.appendChild(track);
}

/* Cinta de logos de CREATIVE DEALING */
const brandsEl = document.getElementById("brands");
if (brandsEl && typeof BRANDS !== "undefined" && BRANDS.length) {
  const make = b => {
    const el = document.createElement("span");
    el.className = "brand-item";
    if (b.logo) {
      const img = document.createElement("img");
      img.src = b.logo; img.alt = b.name; img.loading = "lazy";
      el.appendChild(img);
    } else el.textContent = b.name;
    return el;
  };
  // Dos copias seguidas para que la cinta gire sin cortes.
  for (let k = 0; k < 2; k++) {
    const group = document.createElement("div");
    group.className = "brands-group";
    if (k) group.setAttribute("aria-hidden", "true");
    // Con pocas marcas, se repiten para que cada copia llene la pantalla.
    const list = BRANDS.length < 10 ? [...BRANDS, ...BRANDS] : BRANDS;
    list.forEach(b => group.appendChild(make(b)));
    brandsEl.appendChild(group);
  }
}


/* ------------------------------------------------------------
   PÁGINA PROYECTOS: filtro + vista lista / grilla
   ------------------------------------------------------------ */
const listEl = document.getElementById("project-list");
const galleryEl = document.getElementById("gallery");
let filter = "all";
let view = storage.get("cm-view") === "grid" ? "grid" : "list";

function renderWork() {
  if (!HAS_PROJECTS || (!listEl && !galleryEl)) return;
  const items = PROJECTS.filter(p => filter === "all" || p.status === filter);

  if (listEl) {
    listEl.innerHTML = "";
    items.forEach(p => listEl.appendChild(makeRow(p)));
    listEl.hidden = view !== "list";
  }
  if (galleryEl) {
    galleryEl.innerHTML = "";
    items.forEach((p, i) => galleryEl.appendChild(makeCard(p, i)));
    galleryEl.hidden = view !== "grid";
  }

  document.querySelectorAll("[data-filter]").forEach(b => {
    b.setAttribute("aria-pressed", b.dataset.filter === filter);
    const sup = b.querySelector("sup");
    if (sup) sup.textContent = PROJECTS.filter(p => b.dataset.filter === "all" || p.status === b.dataset.filter).length;
  });
  document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === view));
  observeReveal();
}

document.querySelectorAll("[data-filter]").forEach(b => {
  b.addEventListener("click", () => { filter = b.dataset.filter; renderWork(); });
});
document.querySelectorAll("[data-view]").forEach(b => {
  b.addEventListener("click", () => { view = b.dataset.view; storage.set("cm-view", view); renderWork(); });
});

/* Vista previa que sigue al cursor sobre la lista (solo con mouse). */
const preview = document.getElementById("preview");
if (preview && listEl && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const img = preview.querySelector("img");
  let px = 0, py = 0, cx = 0, cy = 0, raf = 0;
  const follow = () => {
    cx += (px - cx) * 0.18; cy += (py - cy) * 0.18;
    preview.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    raf = (Math.abs(px - cx) > 0.5 || Math.abs(py - cy) > 0.5) ? requestAnimationFrame(follow) : 0;
  };
  listEl.addEventListener("mousemove", e => {
    px = e.clientX; py = e.clientY;
    const row = e.target.closest("a[data-preview]");
    if (row) {
      if (img.getAttribute("src") !== row.dataset.preview) img.src = row.dataset.preview;
      if (!preview.classList.contains("on")) { cx = px; cy = py; }
      preview.classList.add("on");
    } else preview.classList.remove("on");
    if (!raf) raf = requestAnimationFrame(follow);
  });
  listEl.addEventListener("mouseleave", () => preview.classList.remove("on"));
}


/* ------------------------------------------------------------
   DETALLE DE UN CRTV: anterior / siguiente
   ------------------------------------------------------------ */
const crtvNav = document.getElementById("crtv-nav");
if (crtvNav && HAS_PROJECTS) {
  const pages = PROJECTS.filter(hasPage);
  const here = location.pathname.split("/").pop();
  const i = pages.findIndex(p => p.link === here);
  if (i !== -1) {
    crtvNav.querySelector("[data-prev]").href = pages[(i - 1 + pages.length) % pages.length].link;
    crtvNav.querySelector("[data-next]").href = pages[(i + 1) % pages.length].link;
  }
}


/* ------------------------------------------------------------
   RELOJES, AÑO, PORCENTAJE DE VUELO
   ------------------------------------------------------------ */
function updateClocks() {
  document.querySelectorAll("[data-tz]").forEach(el => {
    el.textContent = new Intl.DateTimeFormat("es-CO", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: el.dataset.tz
    }).format(new Date());
  });
}
updateClocks();
setInterval(updateClocks, 1000);

document.querySelectorAll(".year").forEach(el => { el.textContent = new Date().getFullYear(); });

const flyingEl = document.getElementById("flying");
function updateFlying() {
  if (!flyingEl) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? Math.round(Math.min(1, Math.max(0, scrollY / max)) * 100) : 0;
  flyingEl.textContent = "✈ " + String(pct).padStart(2, "0") + "%";
}
addEventListener("scroll", updateFlying, { passive: true });
updateFlying();


/* ------------------------------------------------------------
   NAVEGACIÓN: marca la sección en la que estás (barra y dock)
   ------------------------------------------------------------ */
const navLinks = [...document.querySelectorAll("a[data-section]")];
const sectionIds = [...new Set(navLinks.map(a => a.dataset.section))];
const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
if (sections.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle("active", a.dataset.section === e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => io.observe(s));
}


/* ------------------------------------------------------------
   APARICIÓN SUAVE AL HACER SCROLL
   ------------------------------------------------------------ */
let revealIO = null;
function observeReveal() {
  const els = document.querySelectorAll("[data-reveal]:not(.in)");
  if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("in")); return; }
  if (!revealIO) {
    revealIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
  }
  els.forEach(el => revealIO.observe(el));
}


/* ------------------------------------------------------------
   VIDRIO EMPAÑADO: al pasar el mouse o el dedo se limpia un círculo
   del vidrio y se ve el cielo nítido detrás; se vuelve a empañar solo.
   ------------------------------------------------------------ */
const fog = document.querySelector(".fog");
if (fog && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const R = () => Math.max(innerWidth, innerHeight) * 0.22;
  let x = innerWidth / 2, y = innerHeight / 2, r = 0, tx = x, ty = y, last = 0, raf = 0;
  const tick = now => {
    const moving = now - last < 900;
    const target = moving ? R() : 0;
    x += (tx - x) * 0.12; y += (ty - y) * 0.12;
    r += (target - r) * (moving ? 0.08 : 0.025);
    fog.style.setProperty("--x", x + "px");
    fog.style.setProperty("--y", y + "px");
    fog.style.setProperty("--r", r.toFixed(1) + "px");
    raf = (moving || r > 0.5) ? requestAnimationFrame(tick) : 0;
    if (!raf) fog.style.setProperty("--r", "0px");
  };
  const wipe = (cx, cy) => {
    tx = cx; ty = cy; last = performance.now();
    if (!raf) { if (r < 1) { x = cx; y = cy; } raf = requestAnimationFrame(tick); }
  };
  addEventListener("pointermove", e => wipe(e.clientX, e.clientY), { passive: true });
  addEventListener("touchmove", e => { const p = e.touches[0]; if (p) wipe(p.clientX, p.clientY); }, { passive: true });
}


/* ------------------------------------------------------------
   ARRANQUE
   ------------------------------------------------------------ */
applyLang();
observeReveal();
