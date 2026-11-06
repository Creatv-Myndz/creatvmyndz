/* ============================================================
   WAKE UP — PÁGINA DE VENTA (wakeup.html)
   ------------------------------------------------------------
   Página con scroll normal (no usa el motor del cielo). Arma la lista
   de los 10 módulos desde assets/wakeup-modules.js — así, cuando
   cambias un título allá, acá se actualiza solo — y conecta el
   formulario de la lista de espera (FormSubmit, mismo correo que el
   resto del sitio: SITE.leadEmail en assets/projects.js).
   ============================================================ */
(function () {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* Los 10 módulos: número, categoría, título y la primera frase de la
     clase como adelanto. */
  const list = document.getElementById("wl-modules");
  if (list && typeof MODULES !== "undefined") {
    MODULES.forEach(m => {
      const li = document.createElement("li");
      const num = document.createElement("span");
      num.className = "wl-module-num";
      num.textContent = String(m.num).padStart(2, "0");
      const body = document.createElement("div");
      const kicker = document.createElement("span");
      kicker.className = "wl-module-kicker";
      kicker.textContent = m.kicker;
      const title = document.createElement("strong");
      title.textContent = m.title;
      const teaser = document.createElement("p");
      const firstLine = String(m.lesson || "").split(/\n/)[0];
      const firstSentence = firstLine.match(/^.*?[.!?](\s|$)/);
      teaser.textContent = (firstSentence ? firstSentence[0] : firstLine).trim();
      body.append(kicker, title, teaser);
      li.append(num, body);
      list.appendChild(li);
    });
  }

  /* Lista de espera: mismo flujo que tenía la portada. */
  const form = document.getElementById("lead-form");
  if (form && typeof SITE !== "undefined") {
    form.action = "https://formsubmit.co/" + SITE.leadEmail;
    const cc = document.getElementById("lead-cc");
    if (cc) cc.value = SITE.ccEmail || "";
    const next = document.getElementById("lead-next");
    const emailInput = document.getElementById("email");
    form.addEventListener("submit", () => {
      // Después de dejar el correo, la persona cae en el programa con su
      // correo ya puesto (ahí solo le falta la contraseña si el portón
      // está encendido).
      next.value = location.origin + location.pathname.replace(/[^/]*$/, "")
        + "wakeup-program.html?correo=" + encodeURIComponent(emailInput.value.trim());
    });
  }
})();
