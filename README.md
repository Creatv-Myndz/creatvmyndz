# CREATV MYNDZ ☁️

El sitio del colectivo, en vivo en **<https://creatvmyndz.com>**: el escritorio retro como página principal,
el Creative Playground con todos los CRTV, la portada y el programa **WAKE UP**.

Sitio estático puro (HTML/CSS/JS, sin frameworks ni npm). Se publica solo en GitHub Pages en cada push a `main`.

---

## 1. Dónde va cada cosa

**Lo que está en `sitio/` se publica tal cual; lo que está afuera no se publica nunca.**
`sitio/` es creatvmyndz.com: la carpeta de una página es su dirección.

```
sitio/                      → creatvmyndz.com
├── index.html              el escritorio retro (/)
├── 404.html                página de error
├── CNAME robots.txt sitemap.xml favicon.ico
├── portada/  proyectos/  lab/            /portada/, /proyectos/, /lab/
├── wakeup/  wakeup/programa/             /wakeup/, /wakeup/programa/
├── crtv/<id>/              una página por CRTV: /crtv/forja-player/
├── mynd/  love/  onuha/  bryngrill/      páginas con clave o para una persona (no salen en Google)
├── oazis.html              Oazis, temporal (ver sección 8)
└── assets/
    ├── css/                estilos
    ├── js/                 scripts
    ├── contenido/          ← LO QUE SE EDITA A DIARIO: projects.js y escritorio.json
    ├── fonts/              fuentes y sus licencias
    ├── img/                imágenes: marca/, crtvs/, bg/, escritorio/ (iconos/, fondos/),
    │                       y una carpeta por página (lab/, love/, onuha/, bryngrill/, oazis/)
    ├── audio/              audio: wakeup/, oazis/
    └── video/              video (.mp4) de los CRTV
redirecciones.txt           URLs viejas → nuevas (sección 5)
scripts/armar-sitio.py      arma lo que se publica y revisa los enlaces (sección 4)
backend/                    Apps Script de WAKE UP (no se publica)
docs/                       guías y diseños; la del escritorio es docs/escritorio.md
material/                   solo en tu disco, ignorada por git: PDF de los CRTV y otras fuentes
```

| Si vas a agregar… | Va en… | Y se ve en… |
| --- | --- | --- |
| una página nueva | `sitio/<nombre>/index.html` | `/<nombre>/` |
| la página de un CRTV | `sitio/crtv/<id>/index.html` (el `id` de `projects.js`) | `/crtv/<id>/` |
| una imagen que usan varias páginas | `sitio/assets/img/marca/`, `crtvs/` o `bg/` | |
| una imagen de una sola página | `sitio/assets/img/<página>/` | |
| un estilo o un script | `sitio/assets/css/` o `sitio/assets/js/` | |
| un audio o un video | `sitio/assets/audio/<de quién>/` o `sitio/assets/video/` | |

**Toda ruta a un archivo del sitio empieza con `/`**: `/assets/css/minimal.css`, `/portada/#dealing`, nunca
`assets/…` ni `../`. Así funciona igual desde cualquier carpeta. La revisión automática lo exige (salvo en Oazis).

---

## 2. Editar proyectos (lo que harás casi siempre)

Todo está en **`sitio/assets/contenido/projects.js`**. Copias un bloque `{ ... }`, lo pegas arriba, lo editas,
haces push a `main` y la web se actualiza sola. El escritorio sale de **`sitio/assets/contenido/escritorio.json`**
(ver `docs/escritorio.md`).

### ¿Cómo se edita el "CRTV 01"?

Lo controla el campo **`num`**. Escribes solo el número y la web lo muestra con el prefijo y dos dígitos:

| Escribes en `projects.js` | Se ve en la web |
| --- | --- |
| `num: 1` | CRTV 01 |
| `num: 7` | CRTV 07 |
| `num: 23` | CRTV 23 |

La palabra **CRTV** es fija para todos. Si algún día quieres otra (por ejemplo `MYNDZ 01`), se cambia en
`sitio/assets/js/minimal.js` (la línea `const PREFIX = "CRTV";`) y en `sitio/assets/js/escritorio.js` (la función `code`).

### Los demás campos

- `status`: `"done"` (hecho) · `"soon"` (próximo). Los `soon` salen con el **título borroso**,
  para generar expectativa; se leen bien al abrirlos
- `image`: sube la foto a `sitio/assets/img/crtvs/thumb/` y pon `"/assets/img/crtvs/thumb/tu-foto.webp"`
  (la versión grande va con el mismo nombre en `sitio/assets/img/crtvs/`)
- `link`: la página del CRTV, `"/crtv/<id>/"`, o una URL externa (Instagram, YouTube, tienda…)
- `id`: se usa en el enlace directo, p. ej. `creatvmyndz.com/#el-despegue`

### Correo, redes y contacto

Arriba de `projects.js` está el bloque `SITE`: correo donde llegan los leads, correo público de contacto y
las redes. Borra las redes que no uses.

---

## 3. Ver el sitio en tu computador

```bash
python3 -m http.server -d sitio 4173
```

Y abres <http://localhost:4173>. Para probar también las redirecciones, arma el sitio y sirve `dist/`:

```bash
python3 scripts/armar-sitio.py
```

```bash
python3 -m http.server -d dist 4173
```

---

## 4. Publicar en producción

Se publica en **GitHub Pages**, gratis porque el repositorio es público. El repositorio vive en la
organización **Creatv-Myndz** (<https://github.com/Creatv-Myndz/creatvmyndz>) desde el 3 de noviembre
de 2026; si se vuelve privado, Pages se apaga (el plan gratuito no publica repos privados).

A `main` se entra por pull request. En cada PR corre **Revisar el sitio** (`.github/workflows/revisar.yml`), y en
cada push a `main` corre **Deploy a producción** (`.github/workflows/deploy.yml`). Los dos usan
`scripts/armar-sitio.py`, que:

1. copia `sitio/` a `dist/`;
2. crea las páginas que reenvían las URLs viejas, desde `redirecciones.txt`;
3. revisa que cada enlace, imagen, estilo y script del sitio exista, y que las rutas empiecen con `/`;
4. avisa si quedó un `.html` fuera de `sitio/` (no se publicaría).

Si algo falla, el script dice qué archivo, qué ruta y qué falta, y **no se publica nada**: corrige y vuelve a
hacer push. En 1-2 minutos el sitio está arriba; el progreso se ve en la pestaña **Actions** de GitHub.

### Cómo está conectado el dominio

El dominio sigue registrado en **Wix**, pero su DNS apunta a GitHub:

| Registro | Nombre | Valor |
| --- | --- | --- |
| A | creatvmyndz.com | 185.199.108.153 |
| A | creatvmyndz.com | 185.199.109.153 |
| A | creatvmyndz.com | 185.199.110.153 |
| A | creatvmyndz.com | 185.199.111.153 |
| CNAME | www | creatv-myndz.github.io |

El archivo `sitio/CNAME` guarda el dominio y viaja con cada publicación, para
que GitHub Pages no lo pierda. **No lo borres.** El certificado HTTPS es automático y está
forzado (todo http redirige a https).

⚠️ **El dominio vence el 1 de octubre de 2026 y la renovación automática está desactivada
en Wix.** Si se vence, el sitio deja de existir. Renuévalo o transfiérelo a otro registrador
(una transferencia suma un año y cuesta ~11 USD).

---

## 5. Mudar o borrar una página

Las URLs viejas no se rompen: cada línea de **`redirecciones.txt`** es una URL vieja y su destino.

```
/crtv-forja-player.html     /crtv/forja-player/
/creativmask.html           https://creatvmask.com/
```

Al publicar, `armar-sitio.py` crea en la URL vieja una página que reenvía al destino conservando
`?consulta` y `#ancla` (los enlaces de WAKE UP con `?correo=` siguen funcionando). Si mueves o borras una
página, agrega su línea. La URL vieja termina en `.html` o en `/`; el destino empieza con `/` o con `https://`.
El script no deja que una redirección pise una página que existe ni que apunte a algo que no existe.

---

## 6. Formulario de WAKE UP (leads)

Los correos llegan a la dirección de `SITE.leadEmail` vía [FormSubmit](https://formsubmit.co)
(gratis, sin backend). **La primera vez** que alguien envíe el formulario, FormSubmit te manda
un correo de activación: confírmalo y desde ahí llegan todos los leads a tu bandeja.

Cuando el programa esté a la venta, reemplaza el formulario en `sitio/wakeup/index.html`
(sección del formulario `lead-form`) por tu botón de pago (Stripe Payment Link,
Gumroad, Hotmart…).

---

## 7. Recuperar algo borrado

Nada se pierde: todo sigue en el historial de git. Para traer de vuelta un archivo que se borró
(por ejemplo un ícono viejo), busca el commit que lo borró y sácalo del commit anterior:

```bash
git log --oneline -- assets/iconos/creatv-paleta.png
```

```bash
git checkout <commit>^ -- assets/iconos/creatv-paleta.png
```

Después muévelo a su carpeta nueva dentro de `sitio/`.

---

## 8. Oazis (temporal)

Oazis ya es un producto aparte (`Creatv-Myndz/oazis-app`) que se va a `oazis.creatvmyndz.com`. Mientras sale,
su prototipo sigue aquí **tal cual, sin tocar nada por dentro**, con sus rutas relativas:
`sitio/oazis.html`, `sitio/assets/oazis.webmanifest`, `sitio/assets/puramente/`, `sitio/assets/img/oazis/` y
`sitio/assets/audio/oazis/`. Se ve en `creatvmyndz.com/oazis`.

Si llegan cambios de Oazis como archivos sueltos (por ejemplo de cmsilo), van con el mismo nombre **dentro de
`sitio/`**: `sitio/oazis.html`, `sitio/assets/puramente/…`. Si alguien los deja en la raíz, la revisión lo frena.

**El corte**, cuando Oazis esté en producción (en un PR aparte):

1. Borrar esos cinco puntos.
2. En `redirecciones.txt`, agregar `/oazis.html  https://oazis.creatvmyndz.com/` y cambiar la línea de
   `/creatvfy.html` a `https://oazis.creatvmyndz.com/`. Como Pages sirve `/oazis` desde `oazis.html`, `/oazis`
   también reenvía.
3. Hacer push: `armar-sitio.py` confirma que nada del sitio quedó apuntando a Oazis.
