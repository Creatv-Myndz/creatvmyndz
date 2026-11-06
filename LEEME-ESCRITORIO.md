# Escritorio retro de CREATV MYNDZ

Página: **creatvmyndz.com** (es la página principal, `index.html`; `/escritorio` reenvía aquí). La portada anterior quedó en `portada.html`.
Viene del escritorio que estaba en la rama `escritorio` de `creatvmyndz/camilovegga`, pasado a la marca
CREATV MYNDZ y a estilo retro (Windows 95/98 + XP + Vista).

Todo el contenido vive en **`data/escritorio.json`**. Para cambiar algo casi nunca hay que tocar el código.

| Archivo | Qué es |
| --- | --- |
| `index.html` | la página (antes `escritorio.html`) |
| `assets/escritorio.css` | estilos retro (bordes biselados, barra azul XP, barra de tareas) |
| `assets/escritorio.js` | lógica: fondo, íconos, ventanas, menús, reloj |
| `data/escritorio.json` | **el contenido**: fondos, proyectos, programas, ideas |
| `assets/fondos/` | fondos de pantalla |
| `assets/iconos/` | íconos retro propios (`.png` = pixel art 32×32, `.svg` = brillantes estilo XP/Vista) |

---

## Los CRTV del Creative Playground (automático)

Con `"creativePlayground": true`, **cada CRTV de `assets/projects.js` es un ícono del escritorio**
(el mismo archivo que alimenta la página de proyectos). No hay que copiarlos al JSON:

- CRTV terminado con página → se abre como un archivo en **Paint** (`nombre.bmp - Paint`) con la imagen
  completa (`assets/img/crtvs/<id>.webp`) y, abajo, "Abrir proyecto ↗".
- CRTV terminado sin material todavía (sin `link`) → mensaje del sistema: "estamos preparando el material".
- CRTV próximo (`status: "soon"`) → ícono de aviso amarillo y mensaje del sistema "Estamos trabajando en
  este CRTV", con botones Ok / Cancelar.

## Íconos sueltos del escritorio (`"accesos"`)

```json
{ "id": "c", "titulo": "Muy pronto", "icono": "assets/iconos/c-flotante.png", "texto": "Mensaje que sale al abrirlo." }
```

- `"abre": "proyectos"` abre la lista del Creative Playground (así está el ícono CREATV con paleta).
- `"enlace"` abre un link. Si no, muestra `texto` en un mensaje del sistema.
- El ícono `c` flota suavemente (animación en el CSS).

## Agregar un proyecto extra (fuera de los CRTV)

Agrega un bloque en `"proyectos"`:

```json
"proyectos": [
  {
    "id": "cajita-feliz-ferxxo",
    "titulo": "Cajita Feliz de Ferxxo",
    "tipo": "Campaña",
    "año": "2025",
    "portada": "assets/img/crtvs/thumb/cajita-feliz-ferxxo.webp",
    "imagenes": ["assets/img/crtvs/cajita-feliz-ferxxo.webp"],
    "texto": "La historia del proyecto.",
    "enlace": "https://..."
  }
]
```

- `id`: único, en minúsculas y sin espacios. **Decide el lugar del ícono**: cada `id` cae siempre en el mismo sitio.
- `portada`: la miniatura del ícono. Sin portada, sale una carpeta amarilla.
- `imagenes`, `texto` y `enlace` son opcionales.
- `x` / `y` (opcional, de 0 a 100): fija el ícono en ese % de la pantalla en vez de ponerlo al azar.
- Con `"proyectos": []` se ve el aviso de escritorio vacío.

## Agregar un programa a la barra de tareas

En `"dock"`, en el orden en que aparecen. `"|"` dibuja un separador.

```json
{ "id": "paint", "nombre": "Paint", "icono": "assets/iconos/paint.png", "texto": "Muy pronto." }
```

- Con `"texto"` abre una ventana con ese texto.
- Con `"enlace"` abre ese link en otra pestaña (así está Instagram).
- Con `"juego": "buscaminas"` abre el Buscaminas (9×9, 10 minas; clic derecho o "modo bandera" en el celular).
- La papelera **Por reciclar** (`"id": "papelera"`) son las ideas sueltas: `"ideas": [{ "titulo": "…", "texto": "…" }]`.
- El primer botón del dock (ícono CREATV con paleta) abre el menú **Inicio**.

## Agregar o cambiar un fondo

1. Optimiza la imagen: máximo ~2560 px de ancho, JPG o WebP.
2. Súbela a `assets/fondos/`.
3. Agrégala en `"fondos"`:

```json
{ "id": "mi-fondo", "nombre": "Nombre corto", "imagen": "assets/fondos/mi-fondo.webp", "blur": 10 }
```

- `"fondo"` (arriba del JSON) es el `id` del fondo por defecto.
- `blur` es el blur **suave** de ese fondo, en px. En el menú Fondo el visitante elige *Sin blur*, *Suave*
  (este valor) o *Fuerte* (el doble, entre 14 y 32 px).
- ⚠️ Los 4 fondos actuales (Aurora, Teal 95, Atardecer pixel y Mosaico) son de relleno. Se reemplazan
  cuando lleguen los fondos definitivos.

## Lo que el visitante cambia (solo en su navegador)

En `localStorage`, con el prefijo `cm-desk-`: el fondo elegido, el nivel de blur, su propio fondo
(*Subir mi propio fondo…*, reducido a máximo 1600 px en JPEG para que quepa) y dónde arrastró cada ícono.
Nada se sube al servidor. *Quitar mi fondo* vuelve a los fondos de la marca.

## Lecciones aprendidas (no romper)

- **Blur sin bordes lavados:** la capa del fondo es más grande que la pantalla (`inset` negativo según el blur).
- **Nombres legibles sobre cualquier fondo:** letra blanca con sombra negra de 1 px, como en Windows.
- **Las ventanas no tapan el dock:** si una ventana se pasa, se sube sola (`keepAboveDock`). Se mide con
  `offsetHeight`, no con `getBoundingClientRect`, porque la animación de entrada achica la ventana un instante.
- **Íconos dentro de la pantalla en el celular:** van en una cuadrícula de 4 con un poco de desorden, y
  nunca se salen por los bordes.
- **Celular:** las ventanas salen como hoja desde abajo, por encima de la barra de tareas.
- **Doble clic contra toque:** en PC se abre con doble clic; en celular con un toque. Arrastrar no abre.
- **`hidden` y `display`:** si un elemento con `hidden` tiene `display:flex` en el CSS, sigue visible y tapa los
  clics. Por eso existe `.menu[hidden]{display:none!important}`.
- **Publicación:** el workflow `.github/workflows/deploy.yml` copia `data/` al sitio; sin eso el escritorio
  no carga su contenido.
- **Íconos:** los pixelados y brillantes (`paint`, `notas`, `paleta`, `camara`, `buho`, cursores…) son dibujos
  propios. `creatv-paleta.png` es arte de la marca CREATV. Ver abajo los que llegaron del equipo.
- **Cursores:** flecha pixelada (`cursor.png`) y manito que señala con el dedo pequeño (`cursor-mano.png`,
  punto activo en 22,0). Solo con mouse; en el celular no se usan.

## Idioma, Buscaminas, contacto y aviso del celular

- **Idioma:** el búho pixelado de la barra de arriba cambia entre español e inglés (comparte la preferencia
  `cm-lang` con el resto de creatvmyndz.com). En el JSON, cualquier texto puede ser `"texto"` o
  `{ "es": "...", "en": "..." }`. Los textos fijos de la interfaz están en `I18N` dentro de `assets/escritorio.js`.
- **Buscaminas:** nivel fácil (6×6, 3 minas; el primer clic nunca es mina y abre una zona grande, se gana en
  segundos). Al ganar, "Siguiente nivel" ya no es juego: se destapa la frase de `"buscaminas": { "frase": … }`
  (una palabra o grupo por línea, en los dos idiomas). Está en el dock y como ícono del escritorio.
- **Contáctanos** (ícono de dos personas, `"contacto": true`): formulario que manda el mensaje por FormSubmit
  al correo `SITE.leadEmail` de `assets/projects.js` (con copia a `SITE.ccEmail`). La primera vez FormSubmit
  manda un correo de activación a esa dirección: hay que confirmarlo.
- **Aviso del baño:** solo para quien entra desde un celular (pantalla táctil y pequeña), una vez por visita.
  Foto en `assets/img/escritorio/bano.webp`; textos `pw_*` en `I18N`.
- **Íconos que mandó el equipo y se usan tal cual:** `c-flotante.png`, `contacto.png`, `papelera.png`,
  `creatv-paleta.png` (se les quitó solo el fondo blanco). Ojo: la "C" y las dos personas son logos de
  Microsoft (Internet Explorer y MSN); se usan como guiño retro por decisión de CREATV MYNDZ.

## Íconos propios y videos por CRTV (`"extras"`)

En `data/escritorio.json → extras`, por `id` del CRTV:

```json
"jordan-blessd": { "videos": [ { "tipo": "youtube", "id": "y0u16r_mF4A", "inicio": 4, "x": 34, "y": 31.5, "w": 32 } ] },
"perreo-santo":  { "icono": "assets/iconos/perreo-santo.png",
                   "videos": [ { "tipo": "video", "src": "assets/video/perreo-1.mp4", "x": 18.7, "y": 60, "w": 16, "h": 27.1 } ] }
```

- `icono`: reemplaza la miniatura del CRTV en el escritorio (Cajita Feliz DtMF, Cajita Feliz de Ferxxo, Perreo Santo y Pokémor ya tienen el suyo).
- `videos`: se ponen **encima** de la imagen del proyecto cuando se abre en Paint. `x`, `y`, `w`, `h` son % de la imagen.
  YouTube mantiene 16:9 (no necesita `h`). Un `.mp4` va en `assets/video/` y se reproduce con controles.
  Si `src` está vacío, no se muestra (así están los 3 celulares de Perreo Santo, esperando sus videos).
- Jordan x Blessd: el video de YouTube tapa el botón "VER DROP" de la imagen.
- El ícono "EXPLORA" (la C) abre un navegador retro con "Explora tu creatividad".
- `pokemor.png` se reconstruyó casilla por casilla desde una plantilla de pixel art (magicoloriage.com), sin fondo.

## Arriba (no hay barra)

- Al centro: logo CREATV MYNDZ pixelado (`assets/img/logo-creatv-pixel.png`), levitando suave. Abre "Sobre".
- A la izquierda (~10% del borde, un poco abajo): los accesos con `"fijo": true` (hoy: Explorers). No se arrastran
  y se abren con un clic. En el celular ocupan la primera casilla de la cuadrícula.
- Arriba a la derecha: **Duo** (`assets/iconos/duo.png`), cambia entre ES y EN. Ya no hay reloj.
- El menú **Fondo** se abre desde el menú Inicio (botón CREATV del dock).
- Las ventanas no tienen el menú "Archivo Edición Ver Ayuda" (no tenía función).
- Nombres en el escritorio: tal cual se escriben (sin forzar mayúsculas). Los de los CRTV se ponen en
  `extras.<id>.titulo`.

## Otros accesos

- **Mynd** (cerebro): ventana de inicio de sesión retro con la misma clave de `mynd.html` (mismo hash). Si la
  clave es correcta, abre el tablero de MYND CREATV en otra pestaña. Si cambia la clave o el tablero, hay que
  cambiar `MYND_HASH` / `MYND_BOARD` en `assets/escritorio.js` **y** en `mynd.html`.
- **Creative Dealers**: ventana con la descripción y un botón a la sección Creative Dealing de la portada.
- Los CRTV próximos usan el ícono `proximoIcono` (carpeta con papeles), salvo que tengan su propio `icono` (Snoopy).
- Ojo con marcas de otros: Duo (Duolingo), Instagram, Snoopy (Peanuts), Ash (Pokémon), la C y las dos personas
  (Microsoft) se usan por decisión de CREATV MYNDZ.

## Cambios recientes

- Fondo por defecto: **Nubes 95** (`assets/fondos/nubes-95.webp`, nubes pixeladas estilo Windows 95, sin blur).
- Íconos del escritorio: parecen regados al azar, pero van en una cuadrícula con un poco de desorden para que
  ningún nombre se tape (en PC y en celular). Los nombres llevan un fondito azul oscuro para leerse sobre las nubes.
- Nuevos accesos: **Por Amor al Arte** → camilovegga.com, **Galadsy** → galadsy.com. Mynd usa el ícono de aviso.
- Creative Playground (escritorio y botón Inicio del dock) usa el cerebro azul `cerebro-azul.png`.
- Dock: Inicio (cerebro) · Spotify · Instagram · Videos (YouTube) · Fotos | Contáctanos | Papelera de ideas.
  - **Spotify** todavía no tiene enlace: agrega `"enlace": "https://open.spotify.com/..."` en su bloque.
  - **Videos** apunta a `https://www.youtube.com/@camilovegga`: confirmar que es el canal correcto.
  - **Fotos** (`"collage": true`) muestra un collage con `fotos.imagenes` del JSON; si está vacío, usa las imágenes de los CRTV.
- **Buscaminas**: al ganar, cada "Siguiente" destapa la frase siguiente de `buscaminas.frases`
  (la última no tiene botón).
- Fondo por defecto: **Colina** (`assets/fondos/colina.webp`, blur 3 px para separar los íconos).
- El ícono fijo de la izquierda (la C) ahora se llama **Creative Playground** y abre la lista de proyectos.
- Primer botón del dock (menú Inicio): la **nube** pixelada (`nube.png`). Mynd solo está en el menú Inicio.
- Idioma: botón "ES / EN" arriba a la derecha (sin Duo). Cursores: los normales del sistema.
- Dock: Inicio (nube) · Spotify · Instagram · Videos · Fotos · Por Amor al Arte | Contáctanos | Papelera de ideas.


## Carpetas

- Un acceso con `"abre": "carpeta"` es una carpeta (se abre como ventana con sus íconos ordenados).
- Lo que lleve `"carpeta": "<id>"` va adentro y no en el escritorio; con `"tambienEnEscritorio": true` va en los dos lados.
  - **Proyectos creativos** (ícono Cajita DtMF): Cajitas Felices, Las Palabras Nos Hacen, Perro Negro Undergold, DtMF x FC Barcelona. Las dos Cajitas también siguen en el escritorio.
  - **Próximamente**: los CRTV pendientes (Carriel de Ryan, Joya, Tiempo vs Amor, Happy House).
    Forja Game salió de aquí: ahora es **Forja Player** (hecho, en producción en forjaplayer.com.co) y va suelto en el escritorio.
  - **Creatvfy**: Wake Up! (abre `wakeup.html`), Cualquiera puede crear (ebook) y CREATV Kids.
- Para mover un CRTV a una carpeta: en `extras.<id>` pon `"carpeta": "proyectos-creativos"` (o la que sea).
- El escritorio en PC es un grupo centrado: filas parejas, centradas y un poco corridas entre sí.

## Cambios (celular con páginas, Buscaminas, Playground)

- **Celular:** 3 columnas, íconos un 15 % más grandes y un poco desordenados, en páginas que se deslizan a la
  derecha (como el iPhone), con puntitos abajo. Máximo 4 filas por página; los íconos se reparten parejo.
  En el celular los íconos no se arrastran (para poder deslizar) y se abren con un toque.
- **Aviso del baño:** sale una vez, solo en celular, después de 1 minuto usando la página.
- **Buscaminas** (en el escritorio): al ganar se ven bombas (no banderas). "Siguiente nivel" muestra otra
  cuadrícula tapada; la frase se destapa cuando tocan una casilla. El botón final **Comienza a jugar** cierra el juego.
- Carpeta **Playground** (resbaladero, antes "Proyectos creativos") y carpeta **Creando..** (antes "Próximamente").
- La C se llama **Explorers** y abre la lista de proyectos. La C también es el favicon.
- Dock: Inicio · Instagram · Videos · Fotos · Por Amor al Arte · Spotify | Contáctanos | Papelera de ideas.
- Íconos: Creando.. = reloj de arena, Creatvfy = computador, Cualquiera puede crear = libros, Creative Dealers = bloque con C.
- El logo va pequeño arriba a la izquierda. Las ventanas son más grandes (780 px; Paint, Fotos y Explorers 980 px; carpetas 880 px).
- Todos los íconos se guardan como PNG RGBA: con PNG de paleta algunos Safari no los mostraban dentro de las carpetas.
- Ya no existe la carpeta Playground: todos los proyectos van en el escritorio. En el celular van primero los
  proyectos y después los accesos, apilados desde arriba (hasta 5 filas por página).

## Fondos con el pincel y registro de correos

- **Pincel** (arriba a la derecha, al lado de ES/EN): abre la ventana "Personalizar" con todos los fondos de `"fondos"` (miniaturas en `assets/fondos/mini/`); el visitante escoge uno y se guarda en el
  navegador del visitante. Todos los fondos llevan el mismo blur suave (3 px). Fondos: Colina, Explorar (lupa),
  Pradera, Resbaladero, Pájaros y Baño. Para agregar otro: súbelo a `assets/fondos/` y añádelo a la lista.
- **Registro** (hoy APAGADO: `"registro": false` en el JSON; pon `true` para encenderlo): al entrar (a los 2,5 s, una vez por visita y nunca más si ya se registró) sale "¿Quieres ver más
  creatividad?". El correo llega a `SITE.leadEmail` (con copia a `SITE.ccEmail`) vía FormSubmit, con el asunto
  "Nuevo registro · CREATV MYNDZ". La primera vez FormSubmit pide confirmar el correo de activación.
  Para tener una base de datos ordenada, se pueden exportar esos correos o cambiar el destino a un servicio de
  listas (Mailchimp, Brevo, Google Sheets) en la función `signup()` de `assets/escritorio.js`.

## Distribución fija en PC

- `distribucionPC.posiciones` en el JSON guarda dónde va cada ícono (píxeles de una pantalla de referencia de
  2000×1039, centro 1000,520). La forma se mantiene en cualquier pantalla; si no cabe entre el logo, Explorers y
  el dock, todo se achica un poco. `distribucionPC.esquina` pone íconos contra la esquina de abajo a la derecha
  (Buscaminas). Un proyecto nuevo sin posición se acomoda solo alrededor sin taparse.
- El celular usa el mismo orden (de arriba a abajo, de izquierda a derecha).
- Logo: centrado arriba (15 % de la altura en PC, 26 px en el celular).

## Arranque, usuarios y "Please stand by"

- Al abrir la página: pantalla de arranque negra con el logo y "OS" (una vez por visita; se salta con un clic),
  y después la pantalla de bienvenida estilo Windows XP (sobre el mismo fondo del escritorio) para escoger usuario: Creative Playground o Creative Dealers (`usuarios.lista` en el JSON).
- Cada ícono dice en `"usuario"` en qué escritorio va: `"playground"`, `"dealers"` o `"ambos"`. Los CRTV sin
  `usuario` van en Playground; los accesos sin `usuario`, en los dos. Buscaminas y Creando.. están en los dos.
  La barra de abajo es la misma siempre. "Cambiar de usuario" está en el menú Inicio.
- Distribución en PC: `distribucionPC.posiciones` (Playground) y `distribucionPC.porUsuario.dealers` (Dealers).
- Lo que todavía no está listo (CRTV próximos, Cualquiera puede crear, CREATV Kids…) abre la pantalla azul
  **PLEASE STAND BY** con el nombre y un mensaje; se cierra tocando.
- Cada usuario tiene su fondo: `usuarios.lista[].fondo` (Playground = Resbaladero, Dealers = Colina). El pincel lo
  cambia solo para el usuario en el que estás. El logo de CREATV MYNDZ (arriba) vuelve a la pantalla de usuarios.
- Creative Dealers (en el centro de su escritorio) abre la lista de todo lo de ese escritorio. Explorers queda
  vacío por ahora (será una exploración creativa).
- Los dos escritorios usan la misma forma de la referencia (`distribucionPC`), con el bloque de la C al centro:
  en Playground abre todos los CRTV, en Dealers todo lo de Dealers. Los íconos crecen hasta 1,35× en pantallas
  grandes; en pantallas angostas (tablet, ventanas chicas) pasan a una cuadrícula ordenada sin achicarse.
- Arrastrar un ícono ya no se guarda: al recargar, el escritorio vuelve a su distribución.
- La pantalla de usuarios ya no tiene las bandas azules de arriba y abajo.
