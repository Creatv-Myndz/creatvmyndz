/* ============================================================
   WAKE UP — EL PROGRAMA
   ------------------------------------------------------------
   Página aparte, autónoma (no usa el motor del cielo de app.js).
   El progreso vive en una hoja de Sheets, por correo — así la
   persona lo ve igual desde cualquier dispositivo. Todo en un IIFE,
   para no chocar nombres con las otras páginas.
   ============================================================ */
(function () {
  // Por ahora dejamos pasar directo, sin pedir correo ni contraseña —
  // pon esto en true cuando quieras que el portón vuelva a pedirlos.
  const GATE_ENABLED = false;

  const PASSWORD = "creatvmyndz";

  // OJO: esto es solo una traba simple, no seguridad real — cualquiera
  // que mire el código fuente puede ver la contraseña. Sirve para no
  // dejar el programa abierto a cualquiera que llegue al link, nada más.
  const PROGRESS_URL = "PEGA_AQUI_LA_URL_DEL_APPS_SCRIPT_DE_WAKEUP";

  const EMAIL_KEY = "wakeup-email";
  const DONE_KEY = "wakeup-done";
  const DEMO_MODULE = 1;   // el que se puede ver sin entrar

  // Mientras PROGRESS_URL siga en placeholder, el progreso se guarda solo
  // en este navegador (nada de disparar peticiones que van a fallar).
  // Apenas pegues la URL real del Apps Script, la hoja manda.
  const BACKEND_READY = !/PEGA_AQUI/.test(PROGRESS_URL);

  // localStorage puede lanzar (Safari en modo privado, cuota llena):
  // nunca dejamos que eso tumbe la página.
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const localDone = () => { try { const v = JSON.parse(store.get(DONE_KEY) || "[]"); return Array.isArray(v) ? v.map(Number) : []; } catch (e) { return []; } };
  const timeoutSignal = ms => (window.AbortSignal && AbortSignal.timeout) ? AbortSignal.timeout(ms) : undefined;

  const $ = id => document.getElementById(id);
  const gate = $("wakeup-gate");
  const gateForm = $("gate-form");
  const gateEmail = $("gate-email");
  const gatePassword = $("gate-password");
  const gateError = $("gate-error");
  const gateDemo = $("gate-demo");
  const hub = $("wakeup-hub");
  const hubSub = $("wakeup-hub-sub");
  const pathEl = $("wakeup-path");
  const progressBar = $("wakeup-progress-bar");
  const progressFill = $("wakeup-progress-fill");
  const progressText = $("wakeup-progress-text");

  const modal = $("module-modal");
  const modalClose = $("module-modal-close");
  const content = $("module-content");
  const modalKicker = $("module-kicker");
  const modalTitle = $("module-title");
  const modalMedia = $("module-media");
  const modalLesson = $("module-lesson");
  const modalTask = $("module-task");
  const modalDeliverable = $("module-deliverable");
  const completeBtn = $("module-complete-btn");
  const doneNote = $("module-done-note");
  const demoNote = $("module-demo-note");
  const celebrate = $("module-celebrate");
  const celebrateKicker = $("celebrate-kicker");
  const celebrateTitle = $("celebrate-title");
  const celebrateText = $("celebrate-text");
  const celebrateNext = $("celebrate-next");
  const celebrateLink = $("celebrate-link");

  const TOTAL = MODULES.length;
  let email = store.get(EMAIL_KEY) || "";
  let completed = [];    // números de módulo ya completados
  let activeNum = null;  // el módulo abierto ahora mismo en el modal
  let demoMode = false;  // abierto desde el portón, sin haber entrado

  // Si viene del formulario del index (?correo=...), ya le dejamos el
  // correo puesto — así en el portón solo le falta la contraseña.
  const fromUrl = (new URLSearchParams(location.search).get("correo") || "").trim().toLowerCase();
  if (fromUrl) {
    gateEmail.value = fromUrl;
    // Aunque el portón esté apagado, nos quedamos con el correo: así el
    // progreso queda ligado a la persona (y se sube a la hoja apenas
    // haya URL del Apps Script), no solo a este navegador.
    if (!email) { email = fromUrl; store.set(EMAIL_KEY, email); }
  }

  function openHub() {
    gate.hidden = true;
    hub.hidden = false;
    loadProgress();
  }

  gateForm.addEventListener("submit", e => {
    e.preventDefault();
    if (gatePassword.value !== PASSWORD) {
      gateError.hidden = false;
      return;
    }
    gateError.hidden = true;
    email = gateEmail.value.trim().toLowerCase();
    store.set(EMAIL_KEY, email);
    openHub();
  });

  // Módulo de prueba desde el portón: se ve completo, pero no se marca.
  if (gateDemo) gateDemo.addEventListener("click", () => openModule(DEMO_MODULE, true));

  if (!GATE_ENABLED) {
    // Portón apagado: directo al programa, sin pedir nada.
    openHub();
  } else if (email) {
    // Si ya entró antes en este navegador, se salta el portón.
    openHub();
  }

  function loadProgress() {
    if (!BACKEND_READY || !email) {
      completed = localDone();
      hubSub.textContent = "Completa cada módulo para desbloquear el siguiente. Tu progreso se guarda en este navegador.";
      renderPath();
      return;
    }
    hubSub.textContent = "Cargando tu progreso…";
    fetch(PROGRESS_URL + "?correo=" + encodeURIComponent(email), { signal: timeoutSignal(8000) })
      .then(r => r.json())
      .then(nums => {
        completed = Array.isArray(nums) ? nums.map(Number) : [];
        store.set(DONE_KEY, JSON.stringify(completed));
        hubSub.textContent = "Completa cada módulo para desbloquear el siguiente.";
        renderPath();
      })
      .catch(() => {
        // Sin conexión a la hoja (o tardó más de 8 s): seguimos con lo
        // último guardado acá — mejor eso que dejar a la persona sin
        // poder ver el programa.
        completed = localDone();
        hubSub.textContent = "Completa cada módulo para desbloquear el siguiente.";
        renderPath();
      });
  }

  function nextAvailable() {
    const max = completed.length ? Math.max(...completed) : 0;
    return max + 1;
  }

  function renderProgress() {
    const done = completed.length;
    const pct = Math.round((done / TOTAL) * 100);
    progressFill.style.width = pct + "%";
    progressBar.setAttribute("aria-valuenow", String(done));
    progressText.textContent = done === TOTAL
      ? "¡Completaste los " + TOTAL + " módulos!"
      : done + " de " + TOTAL + " módulos · " + pct + "%";
  }

  function renderPath() {
    renderProgress();
    pathEl.innerHTML = "";
    const unlocked = nextAvailable();

    MODULES.forEach(m => {
      const isDone = completed.indexOf(m.num) !== -1;
      const isCurrent = !isDone && m.num === unlocked;
      const isLocked = !isDone && m.num > unlocked;

      const node = document.createElement("button");
      node.type = "button";
      node.className = "wakeup-node" + (isDone ? " done" : isCurrent ? " current" : " locked");
      node.disabled = isLocked;
      if (isLocked) node.setAttribute("aria-label", "Módulo " + m.num + ": " + m.title + " (bloqueado)");

      const dot = document.createElement("span");
      dot.className = "wakeup-node-dot";
      dot.textContent = isDone ? "✓" : isLocked ? "🔒" : String(m.num);

      const info = document.createElement("span");
      info.className = "wakeup-node-info";
      const kicker = document.createElement("span");
      kicker.className = "wakeup-node-kicker";
      kicker.textContent = "MÓDULO " + String(m.num).padStart(2, "0") + " · " + m.kicker;
      const title = document.createElement("span");
      title.className = "wakeup-node-title";
      title.textContent = m.title;
      info.append(kicker, title);
      if (isCurrent) {
        const badge = document.createElement("span");
        badge.className = "wakeup-node-badge";
        badge.textContent = completed.length ? "CONTINÚA AQUÍ →" : "EMPIEZA AQUÍ →";
        info.appendChild(badge);
      }

      node.append(dot, info);
      if (!isLocked) node.addEventListener("click", () => openModule(m.num, false));
      pathEl.appendChild(node);
    });
  }

  /* Texto de la clase: párrafos separados por línea en blanco, listas con
     "- " al inicio. Todo va como texto (createTextNode), nunca como HTML. */
  function renderText(el, text) {
    el.innerHTML = "";
    const blocks = String(text || "").split(/\n\s*\n/);
    blocks.forEach(block => {
      const lines = block.split("\n").filter(l => l.trim());
      let para = [];
      let ul = null;
      const flushPara = () => {
        if (!para.length) return;
        const p = document.createElement("p");
        p.textContent = para.join(" ");
        el.appendChild(p);
        para = [];
      };
      lines.forEach(l => {
        if (/^\s*-\s+/.test(l)) {
          flushPara();
          if (!ul) { ul = document.createElement("ul"); el.appendChild(ul); }
          const li = document.createElement("li");
          li.textContent = l.replace(/^\s*-\s+/, "");
          ul.appendChild(li);
        } else {
          ul = null;
          para.push(l.trim());
        }
      });
      flushPara();
    });
  }

  /* Video/audio de la clase según el link que pusieron en "media". */
  function renderMedia(url) {
    modalMedia.innerHTML = "";
    modalMedia.hidden = true;
    if (!url) return;
    let yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    let vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    let node;
    if (yt) {
      node = document.createElement("iframe");
      node.src = "https://www.youtube-nocookie.com/embed/" + yt[1] + "?rel=0";
      node.title = "Video de la clase";
      node.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      node.allowFullscreen = true;
      node.loading = "lazy";
      modalMedia.classList.add("is-video");
    } else if (vimeo) {
      node = document.createElement("iframe");
      node.src = "https://player.vimeo.com/video/" + vimeo[1];
      node.title = "Video de la clase";
      node.allow = "autoplay; fullscreen; picture-in-picture";
      node.allowFullscreen = true;
      node.loading = "lazy";
      modalMedia.classList.add("is-video");
    } else if (/\.(mp3|m4a|ogg|wav)(\?|#|$)/i.test(url)) {
      node = document.createElement("audio");
      node.controls = true;
      node.preload = "none";
      node.src = url;
      modalMedia.classList.remove("is-video");
    } else if (/\.(mp4|webm|mov)(\?|#|$)/i.test(url)) {
      node = document.createElement("video");
      node.controls = true;
      node.preload = "metadata";
      node.playsInline = true;
      node.src = url;
      modalMedia.classList.add("is-video");
    } else {
      node = document.createElement("a");
      node.className = "pill-btn";
      node.href = url;
      node.target = "_blank";
      node.rel = "noopener";
      node.textContent = "Abrir el material de la clase →";
      modalMedia.classList.remove("is-video");
    }
    modalMedia.appendChild(node);
    modalMedia.hidden = false;
  }

  function openModule(num, demo) {
    const m = MODULES.find(x => x.num === num);
    if (!m) return;
    activeNum = num;
    demoMode = !!demo;
    celebrate.hidden = true;
    content.hidden = false;

    modalKicker.textContent = "MÓDULO " + String(num).padStart(2, "0") + " · " + m.kicker + (demoMode ? " · PRUEBA" : "");
    modalTitle.textContent = m.title;
    renderMedia(m.media);
    renderText(modalLesson, m.lesson);
    renderText(modalTask, m.task);
    renderText(modalDeliverable, m.deliverable);

    const isDone = completed.indexOf(num) !== -1;
    completeBtn.hidden = isDone || demoMode;
    doneNote.hidden = !isDone || demoMode;
    demoNote.hidden = !demoMode;

    modal.hidden = false;
    modal.scrollTop = 0;
    document.body.classList.add("modal-open");
    modalClose.focus();
  }

  function closeModule() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    modalMedia.innerHTML = "";   // apaga video/audio que quede sonando
    activeNum = null;
  }

  modalClose.addEventListener("click", closeModule);
  modal.addEventListener("click", e => { if (e.target === modal) closeModule(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !modal.hidden) closeModule();
  });

  /* Celebración: reemplaza el contenido del módulo recién completado y
     ofrece el siguiente — sin cerrar y volver a buscarlo en la lista. */
  function showCelebration(num) {
    const next = MODULES.find(x => x.num === num + 1);
    modalMedia.innerHTML = "";
    content.hidden = true;
    celebrate.hidden = false;
    celebrateKicker.textContent = "MÓDULO " + String(num).padStart(2, "0") + " LISTO";
    if (next) {
      celebrateTitle.textContent = "Un paso más despierto.";
      celebrateText.textContent = "Ya completaste " + completed.length + " de " + TOTAL + ". El siguiente es \"" + next.title + "\" — no lo dejes enfriar.";
      celebrateNext.hidden = false;
      celebrateNext.textContent = "Ir al módulo " + next.num + " →";
      celebrateNext.onclick = () => openModule(next.num, false);
      celebrateLink.hidden = true;
    } else {
      celebrateTitle.textContent = "Completaste WAKE UP.";
      celebrateText.textContent = "Los " + TOTAL + " módulos, con tus propias manos. Esto no era un curso para terminar: era la prueba de que el hábito se puede construir. Ahora sigue creando — y hazlo en comunidad.";
      celebrateNext.hidden = true;
      celebrateLink.hidden = false;
      celebrateLink.href = WAKEUP_COMMUNITY.url;
      celebrateLink.textContent = WAKEUP_COMMUNITY.label;
      celebrateLink.target = "_blank";
      celebrateLink.rel = "noopener";
    }
    modal.scrollTop = 0;
  }

  completeBtn.addEventListener("click", () => {
    if (!activeNum || demoMode) return;
    const num = activeNum;
    completeBtn.disabled = true;
    completeBtn.textContent = "Guardando…";
    const data = new URLSearchParams({ Correo: email, Modulo: String(num) });
    const save = (BACKEND_READY && email)
      ? fetch(PROGRESS_URL, { method: "POST", mode: "no-cors", body: data, signal: timeoutSignal(8000) }).catch(() => {})
      : Promise.resolve();
    save
      .then(() => {
        if (completed.indexOf(num) === -1) completed.push(num);
        store.set(DONE_KEY, JSON.stringify(completed));
        completeBtn.disabled = false;
        completeBtn.textContent = "Ya completé este módulo →";
        renderPath();
        showCelebration(num);
      });
  });
})();
