# Estructura nueva del repo `creatvmyndz` — diseño

Fecha: 6 de noviembre de 2026 · Estado: **aprobado por el dueño el 6 de noviembre de 2026**

## 1. Para qué

`creatvmyndz` es el sitio de CREATV MYNDZ (creatvmyndz.com): HTML, CSS y JS a mano, sin frameworks ni npm,
publicado en GitHub Pages. Creció página por página y hoy cuesta encontrar las cosas:

- 25 páginas `.html` sueltas en la raíz, revueltas con `CNAME`, `robots.txt`, el README y la carpeta `backend/`.
  Cinco de esas páginas solo reenvían a otra página: `escritorio`, `playground`, `mind`, `creativmask` y `creatvfy`.
- `assets/` mezcla en el mismo nivel estilos, scripts, fuentes, íconos, fondos, fotos, el manifiesto de Oazis y el
  modelo 3D de PuraMente.
- El contenido que se edita a diario está en dos sitios distintos: `assets/projects.js` y `data/escritorio.json`.
- Unos 16 MB de archivos ya no los usa ninguna página: el motor del cielo con scroll de la portada vieja
  (`assets/app.js` y 484 cuadros en `assets/sky/` y `assets/floor/`), más íconos, fondos y logos de relleno.
- El workflow de publicación copia a mano lo que va al sitio (`*.html`, `assets/`, `data/`…). Cada carpeta nueva hay que
  acordarse de agregarla. Ya pasó una vez: `data/` no se copiaba y el escritorio no cargaba.

Lo que se quiere es que cada cosa tenga un lugar obvio. Al abrir el repo debe verse qué se publica y qué no,
dónde va una página nueva y dónde va una imagen. Ningún enlace que ya circula puede romperse.

## 2. Metas, lo que no se hace y lo que sería un fracaso

**Metas**

1. Cada tipo de página tiene su lugar, y la carpeta de una página es su URL.
2. Cada tipo de archivo (imagen, audio, video, estilo, script, fuente, contenido) tiene su carpeta.
3. Todas las URLs viejas siguen funcionando: reenvían a la nueva y conservan `?correo=…` y `#ancla`.
4. Oazis queda listo para el corte, pero el corte no se hace todavía.
5. Se borra lo que no se usa.
6. Una revisión automática impide publicar un enlace roto o dejar una página fuera de lugar.

**Lo que no se hace en esta mudanza**

- No se rediseña ninguna página ni se cambian textos, comportamiento o contenido.
- No se limpian reglas viejas dentro de los CSS o JS, aunque `styles.css` todavía tenga reglas del cielo viejo.
- No se agrega un framework, npm ni un generador de sitios.
- No se toca nada por dentro de Oazis, y tampoco se hace su corte.
- No se tocan el DNS, el dominio, la configuración de Pages, el ruleset de `main` ni la visibilidad del repo.
- No se tocan `docs/superpowers/` ni `.worktrees/`.

**Sería un fracaso, aunque técnicamente funcione**

- Que alguien abra un link viejo (Instagram, WhatsApp, un correo de WAKE UP con `?correo=`) y vea un 404.
- Que una página quede sin imágenes, sin estilos o sin su contenido, como el escritorio sin `escritorio.json`.
- Que se publique algo que no es del sitio, como los PDF de los CRTV o el código del Apps Script.
- Que se pise el trabajo que cmsilo tenga en curso en Oazis.
- Que el sitio se caiga o que el repo deje de ser público.

## 3. Restricciones

- El repo es público y vive en la organización Creatv-Myndz. Tiene que seguir público, porque Pages gratis no publica
  repos privados.
- Se publica con `.github/workflows/deploy.yml` a GitHub Pages. El dominio `creatvmyndz.com` tiene el DNS en Wix,
  y el CNAME de `www` apunta a `creatv-myndz.github.io`.
- A `main` solo se entra por PR (ruleset 26497455, una aprobación; los dueños están exentos). La mudanza va en **un PR**.
- GitHub Pages no tiene redirecciones de servidor. Las únicas redirecciones posibles son páginas HTML que reenvían.
- Pages sirve `/x` desde `x.html`, `/x/` desde `x/index.html`, y para `/x` sin barra, si existe la carpeta `x/`,
  reenvía a `/x/`.

## 4. La estructura nueva

```
creatvmyndz/
├── sitio/                      ← LO ÚNICO QUE SE PUBLICA. sitio/ = creatvmyndz.com
│   ├── index.html              el escritorio retro (/)
│   ├── 404.html                página de error
│   ├── CNAME  robots.txt  sitemap.xml  favicon.ico
│   ├── portada/index.html      /portada/
│   ├── proyectos/index.html    /proyectos/
│   ├── crtv/
│   │   └── <id>/index.html     /crtv/<id>/   (una carpeta por CRTV con página)
│   ├── wakeup/
│   │   ├── index.html          /wakeup/
│   │   └── programa/index.html /wakeup/programa/
│   ├── lab/index.html          /lab/
│   ├── mynd/index.html         /mynd/
│   ├── love/index.html         /love/
│   ├── onuha/index.html        /onuha/
│   ├── bryngrill/index.html    /bryngrill/
│   ├── oazis.html              /oazis   (zona Oazis: se muda tal cual, sale en el corte)
│   └── assets/
│       ├── css/                estilos
│       ├── js/                 scripts
│       ├── contenido/          lo que se edita a diario: projects.js y escritorio.json
│       ├── fonts/              fuentes y sus licencias
│       ├── img/                imágenes, una subcarpeta por dueño (ver 6)
│       ├── audio/              audio, una subcarpeta por dueño (wakeup/, oazis/)
│       ├── video/              video (.mp4) de los CRTV
│       ├── oazis.webmanifest   zona Oazis
│       └── puramente/          zona Oazis
├── redirecciones.txt           URLs viejas → URLs nuevas (ver 8)
├── scripts/armar-sitio.py      arma lo que se publica y revisa los enlaces (ver 9)
├── backend/                    Apps Script de WAKE UP (no se publica)
├── docs/                       guías y diseños (no se publica)
│   └── escritorio.md           la guía del escritorio (antes LEEME-ESCRITORIO.md)
├── material/                   LOCAL, ignorada por git: PDF de los CRTV y otras fuentes de diseño
├── .github/workflows/          publicar (deploy.yml) y revisar en cada PR (revisar.yml)
└── README.md
```

La regla principal: **lo que está en `sitio/` se publica tal cual, con la misma ruta, y lo que está fuera no se
publica nunca.** Una página nueva se crea como una carpeta con su `index.html`, y su URL es esa carpeta.

## 5. Dónde va cada tipo de página

| Tipo | Dónde va | URL | Notas |
|---|---|---|---|
| Página principal (escritorio) | `sitio/index.html` | `/` | Sin cambio de URL. |
| Secciones del sitio | `sitio/<nombre>/index.html` | `/<nombre>/` | Portada, proyectos, WAKE UP y lab. Una sub-página va en una sub-carpeta: `wakeup/programa/`. |
| CRTV | `sitio/crtv/<id>/index.html` | `/crtv/<id>/` | `<id>` es el `id` del CRTV en `projects.js`, que hoy coincide con el nombre del archivo sin `crtv-`. |
| Páginas con clave o para una sola persona | `sitio/<nombre>/index.html` | `/<nombre>/` | mynd, love, onuha y bryngrill. Conservan su dirección corta porque se comparten a mano. Llevan `noindex`, no van en el sitemap y aparecen en `robots.txt`. |
| Página que se mudó | **no es un archivo**: es una línea en `redirecciones.txt` | la vieja | El workflow genera la página que reenvía. |
| Error | `sitio/404.html` | cualquier dirección que no existe | Pages la sirve sola. |
| Oazis (temporal) | `sitio/oazis.html` | `/oazis` | Se muda sin tocar nada por dentro (ver 11). |

No se borra ninguna página. Las cinco que solo reenvían (`escritorio`, `playground`, `mind`, `creativmask` y
`creatvfy`) dejan de ser archivos y pasan a ser líneas de `redirecciones.txt`.

## 6. Dónde van las imágenes, el audio, los estilos y los scripts

| Tipo | Carpeta | Contenido |
|---|---|---|
| Estilos | `sitio/assets/css/` | `escritorio.css`, `minimal.css` (portada, proyectos y CRTV), `lab.css`, `styles.css` (WAKE UP, lab y 404) |
| Scripts | `sitio/assets/js/` | `escritorio.js`, `minimal.js`, `lab.js`, `wakeup.js`, `wakeup-landing.js`, `wakeup-modules.js` |
| Contenido | `sitio/assets/contenido/` | `projects.js` (CRTV, correos y redes) y `escritorio.json` (todo el escritorio) |
| Fuentes | `sitio/assets/fonts/` | los `.woff2` y sus licencias |
| Imágenes de la marca | `sitio/assets/img/marca/` | logos, `favicon*.png`, `apple-touch-icon*.png`, `og.jpg` y `og-playground.jpg` (las de vista previa en redes) |
| Imágenes de los CRTV | `sitio/assets/img/crtvs/` (+ `thumb/`) | igual que hoy |
| Fondo de portada, proyectos y CRTV | `sitio/assets/img/bg/` | igual que hoy |
| Imágenes del escritorio | `sitio/assets/img/escritorio/` | `iconos/` (antes `assets/iconos/`), `fondos/` con `mini/` (antes `assets/fondos/`), `bano.webp` |
| Imágenes de una página | `sitio/assets/img/<página>/` | `lab/` (antes `assets/lab/`), `love/`, `onuha/`, `bryngrill/`, `oazis/` |
| Audio | `sitio/assets/audio/<dueño>/` | `wakeup/` (los módulos, cuando existan), `oazis/` |
| Video | `sitio/assets/video/` | `.mp4` de los CRTV (los usa `escritorio.json → extras`) |
| Modelos 3D y lecciones de PuraMente | `sitio/assets/puramente/` | zona Oazis, igual que hoy |

Reglas:

1. **Los archivos cambian de carpeta, no de nombre.** Así la mudanza es fácil de revisar y git sigue la historia de
   cada archivo.
2. **Toda ruta a un archivo del sitio empieza con `/`**: `/assets/css/minimal.css` y `/portada/#dealing`, no
   `assets/...` ni `../`. Esto vale para HTML, `url()` de CSS, textos dentro de JS, `escritorio.json` y `projects.js`,
   y funciona igual desde cualquier carpeta. La única excepción es la zona Oazis, que conserva sus rutas relativas
   y sigue funcionando porque `oazis.html` queda en la raíz de `sitio/`.
3. Una imagen que usan varias páginas va en `marca/`, `crtvs/` o `bg/`. Una imagen que usa una sola página va en la
   carpeta con el nombre de esa página.

## 7. Cómo quedan las URLs públicas

| Hoy | Queda en el repo | URL nueva |
|---|---|---|
| `/` (`index.html`) | `sitio/index.html` | `/` (igual) |
| `/portada.html` | `sitio/portada/index.html` | `/portada/` |
| `/proyectos.html` | `sitio/proyectos/index.html` | `/proyectos/` |
| `/crtv-<id>.html` (9: cajita-feliz-dtmf, cajita-feliz-ferxxo, dtmf-fc-barcelona, forja-player, jordan-blessd, las-palabras-nos-hacen, perreo-santo, pokemor, underdogs) | `sitio/crtv/<id>/index.html` | `/crtv/<id>/` |
| `/wakeup.html` | `sitio/wakeup/index.html` | `/wakeup/` |
| `/wakeup-program.html` | `sitio/wakeup/programa/index.html` | `/wakeup/programa/` |
| `/lab.html` | `sitio/lab/index.html` | `/lab/` |
| `/mynd.html` · `/mynd` | `sitio/mynd/index.html` | `/mynd/` |
| `/love.html` · `/love` | `sitio/love/index.html` | `/love/` |
| `/onuha.html` · `/onuha` | `sitio/onuha/index.html` | `/onuha/` |
| `/bryngrill.html` · `/bryngrill` | `sitio/bryngrill/index.html` | `/bryngrill/` |
| `/oazis` · `/oazis.html` | `sitio/oazis.html` | `/oazis` (igual) |
| `/404.html` | `sitio/404.html` | igual |

Las direcciones de archivos que no cambian de carpeta siguen iguales: `/assets/img/crtvs/…`, `/assets/img/bg/…`,
`/assets/fonts/…` y toda la zona Oazis. Las que sí cambian (CSS, JS, íconos, fondos, logos y `og.jpg`) no llevan
redirección, porque solo las usan nuestras propias páginas. `/data/escritorio.json` deja de existir y queda en
`/assets/contenido/escritorio.json`. El único efecto afuera es en las vistas previas que Facebook o X tengan
guardadas: pueden quedarse sin la imagen `og.jpg` hasta que vuelvan a leer la página, en unos días. WhatsApp guarda
la miniatura dentro de cada mensaje, así que no le pasa nada.

## 8. Redirecciones

### La lista

`redirecciones.txt` está en la raíz del repo y tiene una redirección por línea: la URL vieja y el destino,
separados por espacios. Las líneas que empiezan con `#` son comentarios.

```
# URL vieja                     destino
/escritorio.html                /
/playground.html                /proyectos/
/portada.html                   /portada/
/proyectos.html                 /proyectos/
/crtv/                          /proyectos/
/crtv-cajita-feliz-dtmf.html    /crtv/cajita-feliz-dtmf/
/crtv-cajita-feliz-ferxxo.html  /crtv/cajita-feliz-ferxxo/
/crtv-dtmf-fc-barcelona.html    /crtv/dtmf-fc-barcelona/
/crtv-forja-player.html         /crtv/forja-player/
/crtv-jordan-blessd.html        /crtv/jordan-blessd/
/crtv-las-palabras-nos-hacen.html /crtv/las-palabras-nos-hacen/
/crtv-perreo-santo.html         /crtv/perreo-santo/
/crtv-pokemor.html              /crtv/pokemor/
/crtv-underdogs.html            /crtv/underdogs/
/wakeup.html                    /wakeup/
/wakeup-program.html            /wakeup/programa/
/lab.html                       /lab/
/mynd.html                      /mynd/
/mind.html                      /mynd/
/love.html                      /love/
/onuha.html                     /onuha/
/bryngrill.html                 /bryngrill/
/creativmask.html               https://creatvmask.com/
/creatvfy.html                  /oazis
```

- Una URL vieja que termina en `.html` genera `<ruta>.html`, y Pages también la sirve sin `.html`, así que
  `/crtv-forja-player` y `/mind` siguen funcionando. Una que termina en `/` genera `<ruta>/index.html`.
- `/crtv/` → `/proyectos/` es nueva. Sirve para que alguien que borre el final de la dirección de un CRTV no
  caiga en un 404.
- Cuando se mude o se borre una página en el futuro, basta con agregar una línea.

### La página que reenvía

El script la genera para cada línea, al armar el sitio. No vive en el repo.

```html
<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Esta página se mudó — CREATV MYNDZ</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="https://creatvmyndz.com/portada/">
<meta http-equiv="refresh" content="0; url=/portada/">
<script>location.replace("/portada/" + location.search + location.hash)</script>
</head><body><a href="/portada/">Seguir a la página nueva →</a></body></html>
```

- El JS conserva `?correo=…` (los enlaces de WAKE UP) y `#ancla` (`/portada.html#dealing`). Si el navegador no
  tiene JS, el `refresh` igual reenvía, aunque sin `?` ni `#`.
- Para un destino externo (`https://creatvmask.com/`), el canonical y el destino son esa URL.
- `noindex` y canonical le dicen a Google que la página vale en la URL nueva.

### Lo que el script no deja pasar

- Una redirección que pisaría un archivo real de `sitio/`.
- Un destino interno que no existe.
- Un destino que es otra URL vieja de la lista, porque eso encadena redirecciones.
- Una línea mal formada.

## 9. Publicar y revisar

### `scripts/armar-sitio.py`

Es un script de Python 3 que usa solo la biblioteca estándar (nada que instalar), y el workflow lo corre así:

1. Copia `sitio/` completo a `dist/`.
2. Genera las páginas que reenvían, desde `redirecciones.txt`.
3. Crea `dist/.nojekyll`.
4. **Revisa los enlaces** de todo `dist/`, y cualquier error lo hace fallar con un mensaje claro que dice qué
   archivo, qué enlace y qué falta:
   - Revisa cada `src`, `href`, `srcset`, `poster` y `content` de las meta `og:`/`twitter:` que apunte a
     creatvmyndz.com, en cada `.html`.
   - Revisa cada `url()` de cada `.css`.
   - Revisa cada ruta del sitio dentro de `.js`, `.json` y `.webmanifest`. Cuenta como ruta del sitio un texto que
     empieza con `/assets/` o que nombra una página (`/crtv/…`, `/portada/…`), no cualquier texto con barras como
     `"/thumb/"`. En los `.js` se ignoran los comentarios, porque ahí hay rutas de ejemplo.
   - Los `<style>` y `<script>` escritos dentro de un `.html` se revisan con las mismas reglas que los `.css` y `.js`,
     como en `mynd` y `onuha`.
   - Las rutas relativas se resuelven desde el archivo que las contiene.
   - Una ruta vale si existe en `dist/` como archivo, como carpeta con `index.html` o como `<ruta>.html`.
   - No se revisan los enlaces externos (`https://` a otros dominios), las rutas armadas con `${…}` ni los `data:`.
   - Con el sitio de hoy, antes de mudar nada, la revisión ya pasa sin errores. Así, un error después de la mudanza
     es culpa de la mudanza.
5. Hace de **guardia**: falla si encuentra un `.html` fuera de `sitio/`. Revisa todo el repo menos `.git/`, `dist/`,
   `docs/`, `.worktrees/`, `material/`, `.claude/` y `.superpowers/`. Así, si alguien (o una exportación de la
   MYND) vuelve a dejar `onuha.html` en la raíz, se entera antes de publicar en vez de no ver el cambio en
   el sitio.

También sirve a mano: `python3 scripts/armar-sitio.py` y luego `python3 -m http.server -d dist 4173` para ver el sitio
con las redirecciones. Para editar no hace falta: basta con `python3 -m http.server -d sitio 4173`.

### Workflows

- `deploy.yml` (push a `main`): en vez de la lista de `cp`, corre `python3 scripts/armar-sitio.py` y publica `dist/`.
  Lo demás queda igual: permisos, concurrencia, `configure-pages`, `upload-pages-artifact` y `deploy-pages`.
  Se quita `rm -rf dist/assets/CRTVS`, que ya no hace falta.
- `revisar.yml` (nuevo, en cada PR a `main`): corre el mismo script, sin publicar. Así un PR que rompa un enlace
  se ve en rojo antes de aprobarlo. Para que sea obligatorio hay que marcarlo como requerido en el ruleset,
  y eso lo decide el dueño después.

## 10. Qué se borra

Todo sigue en el historial de git, y el README explica cómo recuperar un archivo.

| Qué | Por qué |
|---|---|
| `assets/app.js`, `assets/sky/` (242 cuadros) y `assets/floor/` (242 cuadros), unos 15 MB | Es el motor del cielo con scroll de la portada vieja. Ninguna página carga `app.js`. |
| `escritorio.html`, `playground.html`, `mind.html`, `creativmask.html` y `creatvfy.html` | Solo reenviaban. Pasan a `redirecciones.txt`. |
| `assets/mask/` (`logo-creativmask.webp`) | CREATV MASK vive en creatvmask.com y nadie usa ese logo. |
| `assets/fondos/`: `aurora`, `teal-95`, `atardecer-pixel`, `mosaico` y `nubes-95` | Fondos de relleno o viejos que ya no están en `escritorio.json`. |
| `assets/iconos/`: `animacion.svg`, `buho.png`, `camara.svg`, `cerebro.png`, `cerebro-azul.png`, `correo.png`, `creatv-paleta.png`, `cursor.png`, `cursor-mano.png`, `duo.png`, `fotos.svg`, `internet.svg`, `musica.svg`, `notas.png`, `paleta.svg` y `playground.png` | Íconos que el escritorio dejó de usar. Ningún HTML, CSS, JS ni JSON los nombra. |
| `assets/img/`: `logo-creatv-pixel.png`, `logo-creatv-studios.webp`, `logo-creativ-playground.webp`, `studio.png` y `love/camilo-signature.webp` | Imágenes que ninguna página usa. |

Lo que no se borra aunque nadie lo nombre: las licencias de las fuentes (la licencia OFL exige que viajen con
ellas) y todo lo de la zona Oazis (`img/oazis/icon.svg`, `THIRD_PARTY_NOTICES.md` y `audio/oazis/README.md`).

La carpeta local `assets/CRTVS/` (53 MB de PDF, ignorada por git) se mueve a `material/CRTVS/`, también ignorada.
`.gitignore` cambia `assets/CRTVS/` por `material/`.

## 11. Oazis: se muda congelado, y el corte queda listo

Oazis es un producto aparte (`Creatv-Myndz/oazis-app`) que se va a `oazis.creatvmyndz.com`. Según el diseño de
oazis-app, hasta el corte el dueño y cmsilo pueden seguir cambiando `oazis.html` y `assets/puramente/`. Por eso
la mudanza **no edita ningún archivo de Oazis**: solo les antepone `sitio/`. Git reconoce el cambio como un
renombre, y una rama de cmsilo hecha sobre las rutas viejas se puede fusionar sin pelear línea por línea.

La zona Oazis es esta:

- `sitio/oazis.html`
- `sitio/assets/oazis.webmanifest`
- `sitio/assets/puramente/`
- `sitio/assets/img/oazis/`
- `sitio/assets/audio/oazis/`

Sus URLs siguen iguales: `/oazis`, `/oazis.html` y `/assets/…`. El manifiesto apunta a `/oazis`, y sus íconos son
relativos al manifiesto, así que siguen funcionando. Es la única excepción a las reglas 1 a 3 de la sección 6,
y desaparece con el corte.

**El corte**, en un PR aparte, cuando Oazis esté en producción:

1. Borrar los cinco puntos de la zona Oazis.
2. En `redirecciones.txt`, agregar `/oazis.html  https://oazis.creatvmyndz.com/` y cambiar la línea de
   `/creatvfy.html` a `https://oazis.creatvmyndz.com/`. Como Pages sirve `/oazis` desde `oazis.html`, `/oazis`
   también reenvía, y quien tenga Oazis instalado como app llega a la dirección nueva.
3. `armar-sitio.py` confirma que nada del sitio quedó apuntando a la zona borrada. Hoy ninguna página enlaza a
   Oazis, salvo `creatvfy`.

El paso 4 de la sección 13 del diseño de oazis-app nombra las rutas viejas. Actualizarlo es un cambio en ese repo
y queda como tarea aparte.

**Si el trabajo de cmsilo no llega por git.** Puede llegar como archivos que el dueño copia a mano, porque cmsilo
todavía no tiene usuario de GitHub. Entonces van con el mismo nombre dentro de `sitio/`: `sitio/oazis.html` y
`sitio/assets/puramente/…`. Si alguien los deja en la raíz como antes, la guardia del script lo frena y dice dónde
van. El README lo explica en una línea, y el PR lo avisa en su descripción.

## 12. Lo que también cambia por dentro (sin cambiar lo que se ve)

- **Todas las páginas movidas:** las rutas pasan a empezar con `/`, y se actualizan los enlaces entre páginas,
  los `canonical`, los `og:url` y la `og:image` de `og.jpg`.
- **`minimal.js`:** hoy reconoce el CRTV en pantalla por el nombre del archivo
  (`location.pathname.split("/").pop()`). Debe pasar a comparar la ruta con el `link` del proyecto, porque con
  carpetas ese nombre queda vacío. Esto mueve los botones Anterior y Siguiente.
- **`projects.js`:** `link: "/crtv/<id>/"`, imágenes en `/assets/img/crtvs/…` y los comentarios con las rutas nuevas.
- **`escritorio.js`:** lee `/assets/contenido/escritorio.json`. Las rutas de íconos, logos y fondos cambian,
  incluida la función `mini()`, que arma la ruta de las miniaturas de fondos. El fondo que eligió el visitante se
  guarda por `id`, así que no se pierde.
- **`escritorio.json`:** las rutas de íconos, fondos e imágenes cambian, y los `enlace_interno` pasan a
  `/portada/#dealing` y `/wakeup/`.
- **`wakeup-landing.js`:** el regreso del formulario apunta a `/wakeup/programa/?correo=…`.
- **`wakeup-modules.js`:** la ruta de ejemplo de audio pasa a `/assets/audio/wakeup/…`.
- **`404.html`, `mynd`:** las rutas de fuentes, estilos e íconos cambian a las nuevas.
- **`sitemap.xml`:** queda con las URLs nuevas, con `lastmod` del día de la mudanza para las páginas movidas.
- **`robots.txt`:** las reglas `/mynd`, `/mind`, `/love`, `/onuha` y `/bryngrill` quedan como están, porque ya
  cubren las carpetas. Se quita `Disallow: /assets/CRTVS/`.
- **Documentación:** el README se reescribe con la estructura nueva (dónde va cada cosa, cómo publicar, cómo
  agregar un CRTV o una redirección y cómo recuperar algo borrado), y se quita la sección del cielo, que ya no
  existe. `LEEME-ESCRITORIO.md` pasa a `docs/escritorio.md` con las rutas nuevas. El comentario del Apps Script
  que dice "el deploy solo copia *.html y assets/" se actualiza.
- **Fuera del PR (local):** `.claude/launch.json` (ignorado por git) pasa a servir `sitio/`, y `assets/CRTVS/`
  se mueve a `material/`.

## 13. Cómo se sabe que salió bien

Antes de fusionar:

- `armar-sitio.py` pasa en verde.
- En la vista local de `dist/` se abren y funcionan: el escritorio (íconos, fondos con el pincel, ventanas, Paint
  con un CRTV, Buscaminas, Contáctanos, Mynd), proyectos, un CRTV con Anterior/Siguiente, portada con sus anclas,
  WAKE UP y su formulario, el programa con `?correo=`, lab, mynd, love, onuha, bryngrill, Oazis (suena, carga
  PuraMente y el cerebro) y el 404.
- Cada URL vieja de la lista reenvía a su destino, y se probaron `?correo=` y `#dealing`.
- Los formularios (WAKE UP y Contáctanos) **no se envían de verdad** durante las pruebas, porque cada envío le
  escribe al dueño, con copia a Camilo, y manda la respuesta automática. Se revisa que su `action`, sus campos
  ocultos y el regreso `_next` sean los correctos.

Después de publicar, se prueba lo mismo en creatvmyndz.com, con al menos todas las URLs viejas. Ahí, con el visto
bueno del dueño, se hace **un envío real** desde `/wakeup/`, para confirmar que los leads siguen llegando. Si
FormSubmit pide confirmar otra vez por la página nueva, el dueño confirma el correo de activación.

**Mientras el PR está abierto.** El PR se arma desde `main` al día y conviene fusionarlo el mismo día. Justo antes de
fusionar, se revisa qué cambió en `main` desde que se abrió la rama, sobre todo `projects.js`, `escritorio.json` y
la zona Oazis. Esos cambios se pasan a las rutas nuevas, para que ninguna edición de contenido se pierda al resolver
conflictos.

Si algo sale mal, se revierte el merge en un PR y el sitio vuelve a como estaba. Los links viejos vuelven a
funcionar. Solo se romperían los links nuevos que alguien haya compartido en ese rato.

## 14. Quién decidió qué

**Lo decidió el dueño:**

- Las URLs pasan a carpetas (`/crtv/forja-player/`) y las viejas reenvían solas.

**Venía dado** (restricciones del proyecto): el repo es público, se publica en Pages, a `main` se entra solo
por PR, no se tocan `docs/superpowers/` ni `.worktrees/`, y el corte de Oazis se prepara pero no se hace.

**Lo decidí yo** (el dueño lo puede cambiar al aprobar):

- `sitio/` como única carpeta publicada.
- Las páginas con clave conservan su dirección corta, sin agruparlas en `/privado/`.
- No se borra ninguna página.
- `assets/` se separa por tipo y aparte va `contenido/`.
- Los archivos cambian de carpeta, no de nombre.
- Todas las rutas empiezan con `/`.
- Oazis se muda congelado.
- La lista de lo que se borra (sección 10).
- `og.jpg` se mueve a `marca/`.
- La redirección nueva `/crtv/` → `/proyectos/`.
- Las redirecciones se generan desde una lista en vez de ser archivos.
- El script de revisión, la guardia y el workflow de revisión en los PR.
- `LEEME-ESCRITORIO.md` pasa a `docs/`.
- `material/` para lo local.
- Durante las pruebas no se envían formularios reales, y después de publicar se hace un solo envío real, con tu
  visto bueno.
- Fusionar el mismo día y, antes de fusionar, comparar con `main`.
- Si el trabajo de cmsilo llega como archivos sueltos, entra en `sitio/`.

## 15. Lo que queda a criterio de quien lo construya

- Cómo está hecho por dentro `armar-sitio.py`: la lectura del HTML, cómo ignora los comentarios de JS y el formato
  de los mensajes, siempre que cumpla la sección 9.
- El orden de los commits dentro del PR, siempre que cada uno se pueda revisar por separado (borrar, mover,
  arreglar rutas, redirecciones y workflow, documentación).
- El texto exacto de la página que reenvía.
- Cómo se prueba localmente cada pantalla de la sección 13.
