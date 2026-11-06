/* ============================================================
   CREATV MYNDZ — CONTENIDO EDITABLE
   ------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para el día a día.
   Guarda, haz push a main y la web se actualiza sola.
   ============================================================ */


/* ------------------------------------------------------------
   1) DATOS DEL COLECTIVO
   ------------------------------------------------------------ */
const SITE = {
  // A dónde llegan los correos de la newsletter y de WAKE UP.
  // OJO: la primera vez que alguien los use, FormSubmit te manda un
  // correo de activación. Confírmalo y desde ahí llegan todos los leads.
  leadEmail: "dacoloradog@gmail.com",

  // Copia de cada lead — no necesita activación aparte, solo el
  // leadEmail de arriba (el principal) la pide.
  ccEmail: "camiloveggaart@gmail.com",

  // Correo público que aparece abajo en la sección de newsletter.
  contactEmail: "dacoloradog@gmail.com",

  // Video del banner CREATIVE PLAYGROUND en la portada. Sube el .mp4 a
  // sitio/assets/video/ y pon aquí la ruta, p. ej. "/assets/video/creative-playground.mp4".
  // Mientras esté vacío, el banner muestra una cinta con las portadas de los CRTV.
  playgroundVideo: "",

  // Redes: borra las que no uses o cambia la URL.
  social: [
    { label: "INSTAGRAM", url: "https://instagram.com/creatvmyndz" },
    { label: "YOUTUBE",   url: "" },
    { label: "TIKTOK",    url: "" },
    { label: "DISCORD",   url: "" }
  ]
};


/* ------------------------------------------------------------
   2) PROYECTOS
   ------------------------------------------------------------
   El orden de esta lista es el orden en pantalla, de arriba hacia abajo.

   CÓMO SE EDITA EL "CRTV 01":
   Lo controla el campo `num`. Escribes solo el número (1, 2, 33...)
   y la web lo muestra como CRTV 01, CRTV 02, CRTV 33.
   Si pones `num: null`, muestra solo "CRTV" (así están los próximos).
   El "CRTV" es fijo; si algún día quieres otra palabra, se cambia
   en sitio/assets/js/minimal.js (la línea PREFIX = "CRTV") y en
   sitio/assets/js/escritorio.js (la función code).

   Campos:
   - id:      identificador único, minúsculas y sin espacios (se usa en la URL)
   - num:     número del proyecto, o null
   - title:   nombre del proyecto (sale en MAYÚSCULAS)
   - status:  "done" (hecho) | "soon" (próximo)
              Los "soon" salen con el título borroso, para generar expectativa.
   - area:    música | moda | arte | marca ... (texto libre, puede ir vacío "")
   - year:    año (puede ir vacío "")
   - desc:    { es: "...", en: "..." }  ← ¡ESTO ES LO QUE FALTA POR LLENAR!
   - link:    URL del proyecto (Instagram, YouTube, tienda...) o "" si no hay
   - image:   sube la foto a sitio/assets/img/crtvs/ y pon "/assets/img/crtvs/tu-foto.webp", o ""
   ------------------------------------------------------------ */

/* Texto que aparece mientras no escribas la descripción real.
   Reemplaza cada `desc` por la historia del proyecto. */
const PENDIENTE = {
  es: "Escribe aquí la historia de este proyecto, en /assets/contenido/projects.js",
  en: "Write the story of this project here, in /assets/contenido/projects.js"
};

const PROJECTS = [

  /* ---------- HECHOS ---------- */
  {
    id: "cajita-feliz-ferxxo",
    num: 1,
    title: "CAJITA FELIZ DE FERXXO",
    status: "done",
    area: "", year: "",
    desc: PENDIENTE,
    link: "/crtv/cajita-feliz-ferxxo/",
    image: "/assets/img/crtvs/thumb/cajita-feliz-ferxxo.webp"
  },
  {
    id: "perreo-santo",
    num: 2,
    title: "“PERREO SANTO”",
    status: "done",
    area: "", year: "",
    desc: PENDIENTE,
    link: "/crtv/perreo-santo/",
    image: "/assets/img/crtvs/thumb/perreo-santo.webp"
  },
  {
    id: "dtmf-fc-barcelona",
    num: 4,
    title: "DtMF X FC BARCELONA",
    status: "done",
    area: "", year: "",
    desc: PENDIENTE,
    link: "/crtv/dtmf-fc-barcelona/",
    image: "/assets/img/crtvs/thumb/dtmf-fc-barcelona.webp"
  },
  {
    id: "las-palabras-nos-hacen",
    num: 5,
    title: "LAS PALABRAS NOS HACEN_",
    status: "done",
    area: "", year: "",
    desc: PENDIENTE,
    link: "/crtv/las-palabras-nos-hacen/",
    image: "/assets/img/crtvs/thumb/las-palabras-nos-hacen.webp"
  },
  {
    id: "cajita-feliz-dtmf",
    num: 6,
    title: "CAJITA FELIZ DtMF",
    status: "done",
    area: "", year: "",
    desc: PENDIENTE,
    link: "/crtv/cajita-feliz-dtmf/",
    image: "/assets/img/crtvs/thumb/cajita-feliz-dtmf.webp"
  },
  {
    id: "pokemor",
    num: 7,
    title: "POKÉMOR — POKÉMON DEL REGGAETÓN",
    status: "done",
    area: "", year: "",
    desc: PENDIENTE,
    link: "/crtv/pokemor/",
    image: "/assets/img/crtvs/thumb/pokemor.webp"
  },
  {
    id: "happy-house",
    num: 8,
    title: "HAPPY HOUSE",
    status: "done",
    area: "", year: "",
    desc: PENDIENTE,
    link: "",
    image: ""
  },
  {
    id: "underdogs",
    num: 17,
    title: "UNDERDOGS / PERRO NEGRO X UNDERGOLD",
    status: "done",
    area: "", year: "",
    desc: PENDIENTE,
    link: "/crtv/underdogs/",
    image: "/assets/img/crtvs/thumb/underdogs.webp"
  },
  {
    id: "jordan-blessd",
    num: 33,
    title: "JORDAN X BLESSD",
    status: "done",
    area: "", year: "",
    desc: PENDIENTE,
    link: "/crtv/jordan-blessd/",
    image: "/assets/img/crtvs/thumb/jordan-blessd.webp"
  },
  {
    // Antes "FORJA GAME IN REAL LIFE" (próximo). Ya está en producción:
    // https://forjaplayer.com.co — la página del CRTV enlaza al sitio.
    id: "forja-player",
    num: null,
    title: "FORJA PLAYER",
    status: "done",
    area: "app", year: "2026",
    desc: {
      es: "Un RPG de hábitos y finanzas que se juega con tu vida real: cada hábito cumplido le pega a uno de los 6 Demonios que te frenan.",
      en: "A habits-and-money RPG played with your real life: every habit you keep hits one of the 6 Demons holding you back."
    },
    link: "/crtv/forja-player/",
    image: "/assets/img/crtvs/thumb/forja-player.webp"
  },

  /* ---------- PRÓXIMOS (salen borrosos) ---------- */
  {
    id: "snoopy-flops",
    num: null,
    title: "SNOOPY FLOPS",
    status: "soon",
    area: "", year: "",
    desc: PENDIENTE,
    link: "",
    image: ""
  },
  {
    id: "carriel-de-ryan",
    num: null,
    title: "CARRIEL DE RYAN",
    status: "soon",
    area: "", year: "",
    desc: PENDIENTE,
    link: "",
    image: ""
  },
  {
    id: "joya-por-amor-al-arte",
    num: null,
    title: "JOYA POR AMOR AL ARTE",
    status: "soon",
    area: "", year: "",
    desc: PENDIENTE,
    link: "",
    image: ""
  },
  {
    id: "tiempo-vs-amor",
    num: null,
    title: "TIEMPO VS AMOR (RELOJ)",
    status: "soon",
    area: "", year: "",
    desc: PENDIENTE,
    link: "",
    image: ""
  }
];


/* ------------------------------------------------------------
   3) MARCAS (cinta de logos de CREATIVE DEALING)
   ------------------------------------------------------------
   Sube cada logo (PNG o SVG blanco, con fondo transparente) a
   sitio/assets/img/brands/ y agrégalo aquí:
     { name: "NOMBRE DE LA MARCA", logo: "/assets/img/brands/marca.png" }
   Si `logo` va vacío, se muestra el nombre en texto.
   ------------------------------------------------------------ */
const BRANDS = [
  // ⚠️ RELLENAR: estos son espacios de ejemplo hasta tener los logos reales.
  { name: "MARCA 01", logo: "" },
  { name: "MARCA 02", logo: "" },
  { name: "MARCA 03", logo: "" },
  { name: "MARCA 04", logo: "" },
  { name: "MARCA 05", logo: "" },
  { name: "MARCA 06", logo: "" }
];
