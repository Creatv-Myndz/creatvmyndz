/* ============================================================
   WAKE UP — PROGRESO POR CORREO (Google Apps Script)
   ------------------------------------------------------------
   Hoja de Google Sheets con estos encabezados en la fila 1:
     A: Fecha  |  B: Correo  |  C: Módulo

   Cómo ponerlo a andar (una sola vez):
   1. En esa hoja: Extensiones → Apps Script → borra lo que haya y pega
      este archivo completo → guarda.
   2. Implementar → Nueva implementación → tipo "Aplicación web" →
      Ejecutar como: "Yo" · Quién tiene acceso: "Cualquiera" → Implementar.
   3. Copia la URL que termina en /exec y pégala en sitio/assets/js/wakeup.js, en
      PROGRESS_URL (reemplaza el texto PEGA_AQUI…). Sube a main.
   Si después cambias este código: Implementar → Gestionar
   implementaciones → lápiz → Versión: "Nueva versión" → Implementar
   (así la URL no cambia). Este archivo vive en backend/ y NO sale al
   sitio (solo se publica la carpeta sitio/).
   ============================================================ */

// El sitio pide esto (GET ?correo=...) al abrir el programa: devuelve
// la lista de módulos ya completados por ese correo, p. ej. [1,2,3].
function doGet(e) {
  var correo = String((e && e.parameter && e.parameter.correo) || "").trim().toLowerCase();
  if (!correo) {
    return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
  }
  var rows = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getDataRange().getValues();
  var done = {};
  for (var i = 1; i < rows.length; i++) {   // i=0 son los encabezados
    if (String(rows[i][1]).trim().toLowerCase() === correo) {
      var n = Number(rows[i][2]);
      if (n > 0) done[n] = true;
    }
  }
  var out = Object.keys(done).map(Number).sort(function (a, b) { return a - b; });
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

// El sitio manda esto (POST Correo + Modulo) cada vez que alguien marca
// "Ya completé este módulo". Una fila por marca; repetir no hace daño.
function doPost(e) {
  var p = (e && e.parameter) || {};
  var correo = String(p.Correo || "").trim().toLowerCase();
  var modulo = Number(p.Modulo) || 0;
  if (correo && modulo > 0) {
    SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().appendRow([new Date(), correo, modulo]);
  }
  return ContentService.createTextOutput("ok");
}
