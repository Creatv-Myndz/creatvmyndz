# CREATV MYNDZ ☁️

Sitio del colectivo: lista de proyectos estilo MSCHF + programa **WAKE UP**, sobre un
cielo en video que **avanza y retrocede con el scroll** (de día a noche estrellada).

Sitio estático puro (HTML/CSS/JS, sin frameworks ni build). Rápido, responsive y fácil de editar.

---

## 1. Editar proyectos (lo que harás casi siempre)

Todo está en **`assets/projects.js`**. Copias un bloque `{ ... }`, lo pegas arriba, lo editas,
haces push a `main` y la web se actualiza sola.

### ¿Cómo se edita el "CRTV 01"?

Lo controla el campo **`num`**. Escribes solo el número y la web lo muestra con el prefijo
y dos dígitos:

| Escribes en `projects.js` | Se ve en la web |
| --- | --- |
| `num: 1` | CRTV 01 |
| `num: 7` | CRTV 07 |
| `num: 23` | CRTV 23 |

La palabra **CRTV** es fija para todos. Si algún día quieres otra (por ejemplo `MYNDZ 01`),
se cambia en **una sola línea** de `assets/app.js`:

```js
const PREFIX = "CRTV";
```

### Los demás campos

- `status`: `"done"` (hecho) · `"soon"` (próximo). Los `soon` salen con el **título borroso**,
  para generar expectativa; se leen bien al abrirlos
- `image`: sube la foto a `assets/img/` y pon `"assets/img/tu-foto.jpg"`
- `link`: URL externa del proyecto (Instagram, YouTube, tienda…)
- `id`: se usa en el enlace directo, p. ej. `creatvmyndz.com/#el-despegue`

### Correo, redes y contacto

Arriba de `assets/projects.js` está el bloque `SITE`: correo donde llegan los leads,
correo público de contacto y las redes. Borra las redes que no uses.

---

## 2. El cielo (video de fondo)

El video **no** es un `<video>`: al rebobinar, los celulares se traban. En su lugar el video
está convertido en **121 imágenes** que se dibujan en un canvas según cuánto has bajado.
Es la técnica que usa Apple y va fluida en iPhone y Android.

- `assets/sky/d/` → 121 frames horizontales (computador), 3.4 MB
- `assets/sky/m/` → 121 frames verticales (celular), 1.7 MB

Cada dispositivo descarga **solo su versión**, y en conexiones lentas o teléfonos modestos
la web usa automáticamente menos frames.

### Cambiar el video

Con [ffmpeg](https://ffmpeg.org) y `cwebp` instalados (`brew install ffmpeg webp`):

```bash
ffmpeg -i "TU-VIDEO.mp4" -vf "select=not(mod(n\,3)),scale=1280:720" -vsync 0 /tmp/fd/%04d.png
ffmpeg -i "TU-VIDEO.mp4" -vf "select=not(mod(n\,3)),crop=608:1080:656:0,scale=540:960" -vsync 0 /tmp/fm/%04d.png
for f in /tmp/fd/*.png; do cwebp -quiet -q 70 -m 6 "$f" -o "assets/sky/d/$(basename "$f" .png).webp"; done
for f in /tmp/fm/*.png; do cwebp -quiet -q 70 -m 6 "$f" -o "assets/sky/m/$(basename "$f" .png).webp"; done
```

Si el número de frames cambia, actualiza `SKY_TOTAL` en `assets/app.js`.

---

## 3. Publicar en producción

**El sitio está en vivo en <https://creatvmyndz.com>** (y `www` redirige al dominio principal).

Se publica en **GitHub Pages**, gratis porque el repositorio es público. El repositorio vive en la
organización **Creatv-Myndz** (<https://github.com/Creatv-Myndz/creatvmyndz>) desde el 3 de noviembre
de 2026; si se vuelve privado, Pages se apaga (el plan gratuito no publica repos privados). El workflow
`.github/workflows/deploy.yml` corre en cada push a `main`: no hay que subir nada a mano.

Para publicar un cambio:

```bash
git add -A && git commit -m "Lo que cambiaste" && git push
```

En 1-2 minutos está arriba. El progreso se ve en la pestaña **Actions** de GitHub.

### Cómo está conectado el dominio

El dominio sigue registrado en **Wix**, pero su DNS apunta a GitHub:

| Registro | Nombre | Valor |
| --- | --- | --- |
| A | creatvmyndz.com | 185.199.108.153 |
| A | creatvmyndz.com | 185.199.109.153 |
| A | creatvmyndz.com | 185.199.110.153 |
| A | creatvmyndz.com | 185.199.111.153 |
| CNAME | www | creatv-myndz.github.io |

El archivo `CNAME` de este repositorio guarda el dominio y viaja con cada publicación, para
que GitHub Pages no lo pierda. **No lo borres.** El certificado HTTPS es automático y está
forzado (todo http redirige a https).

⚠️ **El dominio vence el 1 de octubre de 2026 y la renovación automática está desactivada
en Wix.** Si se vence, el sitio deja de existir. Renuévalo o transfiérelo a otro registrador
(una transferencia suma un año y cuesta ~11 USD).

---

## 4. Formulario de WAKE UP (leads)

Los correos llegan a la dirección de `SITE.leadEmail` vía [FormSubmit](https://formsubmit.co)
(gratis, sin backend). **La primera vez** que alguien envíe el formulario, FormSubmit te manda
un correo de activación: confírmalo y desde ahí llegan todos los leads a tu bandeja.

Cuando el programa esté a la venta, reemplaza el formulario en `index.html`
(sección `<!-- Captura de leads -->`) por tu botón de pago (Stripe Payment Link,
Gumroad, Hotmart…).

---

## 5. Estructura

```
index.html              la portada (diseño minimalista: assets/minimal.css + assets/minimal.js)
proyectos.html          todos los CRTV (lista / grilla); playground.html reenvía aquí
assets/img/bg/          foto de fondo (cielo.webp) y su versión empañada (cielo-blur.webp)
assets/projects.js      ← CONTENIDO: proyectos, correos y redes (lo que editas a diario)
assets/app.js           lógica: cielo con scroll, menú, idioma ES/EN, modal, relojes
assets/styles.css       estilos
assets/sky/d, /m        frames del cielo (escritorio y celular)
assets/img/             logos, favicon e imágenes de proyectos
assets/fonts/           tipografía Outfit (licencia libre OFL)
_headers                reglas de caché (para Netlify/Cloudflare; GitHub Pages lo ignora)
.github/workflows/      pipeline de publicación automática
```
