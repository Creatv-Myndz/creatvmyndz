# Mudanza a la estructura nueva — plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pasar el repo `creatvmyndz` a la estructura aprobada (`sitio/` publicado tal cual, una carpeta por página,
`assets/` por tipo, redirecciones desde una lista) en **un solo PR**, sin que se rompa ningún enlace.

**Architecture:** El sitio sigue siendo HTML/CSS/JS a mano. Se agrega `scripts/armar-sitio.py`, que copia `sitio/` a
`dist/`, genera las páginas que reenvían desde `redirecciones.txt` y revisa los enlaces. El workflow de Pages lo corre
y publica `dist/`, y un workflow nuevo lo corre en cada PR. Primero se escribe el script con pruebas y se
comprueba con el sitio de hoy. Después se borra lo que no se usa, se mueven los archivos (solo renombres) y se
reescriben las rutas, hasta que el script pase en verde.

**Tech Stack:** HTML/CSS/JS estático · GitHub Pages con Actions · Python 3 (solo biblioteca estándar, `unittest`).

**Estado:** aprobado por el dueño el 6 de noviembre de 2026; sin ejecutar.

**Spec:** `docs/2026-11-06-estructura-del-sitio-diseno.md` (aprobado). Léelo antes de empezar; este plan lo cita por sección (§).

## Global Constraints

- Python compatible con **3.9** (el Mac del dueño tiene 3.9.6): `from __future__ import annotations`, sin `match` ni
  `X | Y` fuera de anotaciones. Solo biblioteca estándar: nada de `pip`, npm ni dependencias.
- Dominio: `https://creatvmyndz.com`.
- **Los archivos cambian de carpeta, no de nombre.** Las únicas excepciones son las páginas, que pasan a
  `<carpeta>/index.html`, y `LEEME-ESCRITORIO.md`, que pasa a `docs/escritorio.md` (§6 regla 1).
- **Toda ruta a un archivo del sitio empieza con `/`**, salvo en la zona Oazis (§6 regla 2).
- Zona Oazis, **byte por byte igual** (git debe verla como `R100`): `sitio/oazis.html`,
  `sitio/assets/oazis.webmanifest`, `sitio/assets/puramente/`, `sitio/assets/img/oazis/`, `sitio/assets/audio/oazis/` (§11).
- La página que reenvía es exactamente la plantilla de §8 ("La página que reenvía").
- Los mensajes del script van en español.
- No tocar `docs/superpowers/` ni `.worktrees/`. No hacer commits en `main`. No cambiar de rama en la copia compartida
  `/Users/colorado/Documents/GitHub/creatvmyndz`: se trabaja en un worktree propio, fuera de `.worktrees/`.
- No enviar formularios reales mientras se prueba (§13).
- No cambiar textos, diseño ni comportamiento de ninguna página (§2).

## Review Focus

1. **Un link viejo con `?` o `#`.** `/wakeup-program.html?correo=a%40b.co` debe llegar a `/wakeup/programa/?correo=a%40b.co`,
   y `/portada.html#dealing` a `/portada/#dealing`. Lo prueba `test_reenvio_conserva_query_y_hash` (Task 1) y se
   revisa en vivo en la Task 8.
2. **Rutas relativas escondidas en datos dentro del HTML.** `window.ONUHA_STATIC={"base": "assets/img/onuha/mynd/"…}`
   en onuha, o el `url("assets/fonts/…")` dentro del `<style>` de mynd: desde `/onuha/` resolverían mal y la página
   quedaría sin imágenes. Lo prueba `test_relativa_en_script_inline` (Task 3).
3. **Anterior / Siguiente de un CRTV.** En `/crtv/<id>/` (y en `/crtv/<id>/index.html`) los botones deben apuntar al
   CRTV vecino, no quedarse en `/proyectos/`. Se revisa a mano en la Task 6, paso "Anterior / Siguiente".
4. **Una carpeta pedida sin barra.** `/mynd` y `/crtv/forja-player` deben terminar en la página, no en un 404. Se
   revisa con `curl` en la Task 6 (local) y en la Task 8 (en vivo).
5. **Un `.html` nuevo dejado en la raíz** (una exportación de la MYND a `onuha.html`, o un `oazis.html` de cmsilo):
   debe frenar la publicación con un mensaje que diga dónde va. Lo prueba `test_guardia_html_fuera_de_sitio` (Task 3).

---

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `scripts/armar-sitio.py` (nuevo) | Arma `dist/`, genera las redirecciones, revisa enlaces y rutas, hace de guardia. |
| `scripts/test_armar_sitio.py` (nuevo) | Pruebas `unittest` del script. |
| `redirecciones.txt` (nuevo) | La lista de §8. |
| `.github/workflows/deploy.yml` | Corre el script y publica `dist/`. |
| `.github/workflows/revisar.yml` (nuevo) | Corre las pruebas y el script en cada PR. |
| `sitio/**` | Todo lo publicado, movido desde la raíz, `assets/` y `data/`. |
| `README.md`, `docs/escritorio.md`, `backend/apps-script-wakeup.gs` | La documentación, con las rutas nuevas. |
| `.gitignore` | `assets/CRTVS/` pasa a `material/`. |

---

### Task 0: Rama y worktree

**Files:** ninguno del sitio.

- [ ] **Paso 1: Crear el worktree desde `main` al día**

```bash
cd /Users/colorado/Documents/GitHub/creatvmyndz
git fetch origin
git worktree add ../creatvmyndz-estructura -b estructura-del-sitio origin/main
cd ../creatvmyndz-estructura
```

Esperado: `git status` muestra la rama `estructura-del-sitio`, limpia. Desde aquí, todo pasa en este worktree.

- [ ] **Paso 2: Traer el diseño y el plan al PR**

```bash
mkdir -p docs
cp /Users/colorado/Documents/GitHub/creatvmyndz/docs/2026-11-06-estructura-del-sitio-{diseno,plan}.md docs/
git add docs/2026-11-06-estructura-del-sitio-*.md
git commit -m "Diseño y plan de la estructura nueva del sitio"
```

---

### Task 1: Redirecciones en `armar-sitio.py`

**Files:**
- Create: `scripts/armar-sitio.py`
- Create: `scripts/test_armar_sitio.py`

**Interfaces:**
- Produces (en `scripts/armar-sitio.py`):
  - `DOMINIO = "https://creatvmyndz.com"`
  - `class ErrorDeSitio(Exception)`
  - `leer_redirecciones(texto: str) -> list[tuple[str, str]]`: lanza `ErrorDeSitio("redirecciones.txt línea N: …")`
    si una línea no tiene exactamente dos campos, si la URL vieja no empieza con `/` o no termina en `.html` o `/`,
    o si el destino no empieza con `/` ni con `https://`. Ignora las líneas vacías y las que empiezan con `#`.
  - `archivo_del_reenvio(vieja: str) -> str`: convierte `"/x.html"` en `"x.html"` y `"/x/"` en `"x/index.html"`.
  - `pagina_de_reenvio(destino: str) -> str`: la plantilla de §8. Para un destino interno el canonical es
    `DOMINIO + destino`; para uno `https://`, el destino mismo. En el JS, el destino va con `json.dumps`.
  - `escribir_reenvios(dist: Path, redirecciones: list[tuple[str, str]]) -> list[str]`: primero valida todo. Si hay
    errores, los devuelve sin escribir nada; si no, escribe cada página y devuelve `[]`. Los mensajes contienen:
    `"{vieja}: ya existe una página en esa ruta"`, `"{vieja} → {destino}: el destino no existe"`,
    `"{vieja} → {destino}: el destino también es una URL vieja"` y `"{vieja}: aparece dos veces"`.
  - `existe_en_sitio(dist: Path, ruta: str) -> bool`: quita `?…` y `#…` y aplica `urllib.parse.unquote`. Vale si la
    ruta es un archivo, si es una carpeta con `index.html`, o si existe `<ruta>.html`. Una ruta bajo `/assets/` que
    termina en `/` vale si la carpeta existe.
- Produces (en `scripts/test_armar_sitio.py`): `cargar()`, que carga el módulo con `importlib.util.spec_from_file_location`
  (el nombre del archivo tiene guion), y `sitio_de_prueba(archivos: dict[str, str]) -> Path`, que crea un directorio
  temporal con esos archivos y su texto.

- [ ] **Paso 1: Escribir las pruebas que fallan**

```python
class Redirecciones(unittest.TestCase):
    def test_lee_lineas_y_comentarios(self):
        m = cargar()
        t = "# c\n/portada.html   /portada/\n\n/creativmask.html https://creatvmask.com/\n"
        self.assertEqual(m.leer_redirecciones(t),
            [("/portada.html", "/portada/"), ("/creativmask.html", "https://creatvmask.com/")])

    def test_lineas_invalidas(self):
        m = cargar()
        for t in ["/portada.html\n", "/portada /portada/\n", "/a.html portada/\n"]:
            with self.assertRaises(m.ErrorDeSitio) as e:
                m.leer_redirecciones(t)
            self.assertIn("línea 1", str(e.exception))

    def test_archivo_del_reenvio(self):
        m = cargar()
        self.assertEqual(m.archivo_del_reenvio("/crtv-forja-player.html"), "crtv-forja-player.html")
        self.assertEqual(m.archivo_del_reenvio("/crtv/"), "crtv/index.html")

    def test_reenvio_conserva_query_y_hash(self):
        p = cargar().pagina_de_reenvio("/portada/")
        self.assertIn('<link rel="canonical" href="https://creatvmyndz.com/portada/">', p)
        self.assertIn('content="0; url=/portada/"', p)
        self.assertIn('location.replace("/portada/" + location.search + location.hash)', p)
        self.assertIn('name="robots" content="noindex"', p)
        self.assertIn('<a href="/portada/">', p)

    def test_reenvio_externo(self):
        p = cargar().pagina_de_reenvio("https://creatvmask.com/")
        self.assertIn('<link rel="canonical" href="https://creatvmask.com/">', p)

    def test_escribe_reenvios(self):
        m = cargar(); d = sitio_de_prueba({"portada/index.html": "x"})
        self.assertEqual(m.escribir_reenvios(d, [("/portada.html", "/portada/")]), [])
        self.assertIn("/portada/", (d / "portada.html").read_text())

    def test_no_pisa_una_pagina(self):
        m = cargar(); d = sitio_de_prueba({"lab.html": "real", "lab/index.html": "x"})
        e = m.escribir_reenvios(d, [("/lab.html", "/lab/")])
        self.assertTrue(any("ya existe una página" in x for x in e))
        self.assertEqual((d / "lab.html").read_text(), "real")

    def test_destino_que_no_existe(self):
        m = cargar(); d = sitio_de_prueba({"index.html": "x"})
        e = m.escribir_reenvios(d, [("/x.html", "/no-existe/")])
        self.assertTrue(any("el destino no existe" in x for x in e))
        self.assertFalse((d / "x.html").exists())

    def test_destino_encadenado_y_repetido(self):
        m = cargar(); d = sitio_de_prueba({"c/index.html": "x"})
        e = m.escribir_reenvios(d, [("/a.html", "/b.html"), ("/b.html", "/c/"), ("/b.html", "/c/")])
        self.assertTrue(any("también es una URL vieja" in x for x in e))
        self.assertTrue(any("aparece dos veces" in x for x in e))

    def test_existe_en_sitio(self):
        m = cargar(); d = sitio_de_prueba({"oazis.html": "x", "mynd/index.html": "x", "assets/img/onuha/mynd/a.jpg": "x"})
        for r in ["/oazis", "/oazis.html", "/mynd", "/mynd/", "/mynd/?a=1#b", "/assets/img/onuha/mynd/"]:
            self.assertTrue(m.existe_en_sitio(d, r), r)
        for r in ["/nada/", "/assets/img/no.png"]:
            self.assertFalse(m.existe_en_sitio(d, r), r)
```

- [ ] **Paso 2: Verificar que fallan**

Run: `python3 -m unittest discover -s scripts -p "test_*.py" -v`
Esperado: FALLAN (el módulo no existe o no tiene las funciones).

- [ ] **Paso 3: Implementar las funciones de la Interfaz en `scripts/armar-sitio.py`**

Con `pathlib`, `json` y `urllib.parse`. `escribir_reenvios` crea las carpetas que hagan falta (`crtv/` para `/crtv/`).

- [ ] **Paso 4: Verificar que pasan**

Run: `python3 -m unittest discover -s scripts -p "test_*.py" -v`
Esperado: todas en `ok`.

- [ ] **Paso 5: Commit**

```bash
git add scripts/
git commit -m "armar-sitio: redirecciones desde una lista, sin pisar páginas ni encadenar"
```

---

### Task 2: Revisión de enlaces

**Files:**
- Modify: `scripts/armar-sitio.py`
- Modify: `scripts/test_armar_sitio.py`

**Interfaces:**
- Consumes: `existe_en_sitio`, `DOMINIO` (Task 1).
- Produces: `revisar_enlaces(dist: Path) -> list[str]`. Devuelve un mensaje
  `"{archivo relativo a dist}: {ruta} no existe"` por cada referencia rota. Revisa:
  - En `.html`: `src`, `href`, `srcset` (cada URL de la lista), `poster`, y `content` de las meta cuyo
    `property`/`name` empieza con `og:` o `twitter:`. Una URL que empieza con `DOMINIO` se revisa sin el dominio.
    El `style="…"` y los `<style>` se revisan como CSS; los `<script>` sin `src`, como JS.
  - En `.css`: cada `url(…)`. Los `data:` se quitan antes de buscar.
  - En `.js` y en `<script>`: se quitan los comentarios `//` y `/* */` sin tocar lo que va dentro de comillas
    (`"https://x"` no es un comentario). Cuentan los textos entre comillas que empiezan con `/` y cuyo primer
    segmento es el nombre de una entrada del primer nivel de `dist/` (carpeta, archivo, o archivo sin `.html`).
  - En `.json` y `.webmanifest`: cada texto con la misma regla que en JS. En `.webmanifest`, además,
    `icons[].src` se resuelve relativo al manifiesto.
  - Las rutas relativas se resuelven desde la carpeta del archivo que las contiene (`portada/index.html` → base `/portada/`).
  - Se ignoran: vacías, `#…`, `mailto:`, `tel:`, `javascript:`, `data:`, `//…`, `http(s)://` de otros dominios, y todo
    lo que contenga `${`.

- [ ] **Paso 1: Escribir las pruebas que fallan**

```python
class Enlaces(unittest.TestCase):
    def errores(self, archivos):
        return cargar().revisar_enlaces(sitio_de_prueba(archivos))

    def test_html_valido(self):
        self.assertEqual(self.errores({
            "index.html": '<link href="/assets/css/a.css"><img src="/assets/img/x.png">'
                          '<a href="/portada/#dealing"></a><a href="https://otro.com/x"></a>'
                          '<a href="mailto:a@b.co"></a><a href="#top"></a><img src="data:image/png;base64,AA">',
            "assets/css/a.css": "", "assets/img/x.png": "", "portada/index.html": ""}), [])

    def test_html_roto_y_dominio_propio(self):
        e = self.errores({"index.html": '<img src="/assets/img/no.png">'
                                        '<link rel="canonical" href="https://creatvmyndz.com/crtv/x/">'})
        self.assertIn("index.html: /assets/img/no.png no existe", e)
        self.assertTrue(any("/crtv/x/ no existe" in x for x in e))

    def test_srcset_y_og(self):
        e = self.errores({"index.html": '<img srcset="/a.png 1x, /b.png 2x">'
                          '<meta property="og:image" content="https://creatvmyndz.com/assets/img/marca/og.jpg">',
                          "a.png": ""})
        self.assertTrue(any("/b.png no existe" in x for x in e))
        self.assertTrue(any("/assets/img/marca/og.jpg no existe" in x for x in e))

    def test_relativa_desde_su_carpeta(self):
        self.assertEqual(self.errores({"portada/index.html": '<img src="foto.png">', "portada/foto.png": ""}), [])

    def test_css(self):
        e = self.errores({"assets/css/a.css": 'a{background:url("/assets/fonts/f.woff2")}'
            "b{background:url(\"data:image/svg+xml,%3Csvg filter='url(%23n)'%3E\")}"})
        self.assertEqual(e, ["assets/css/a.css: /assets/fonts/f.woff2 no existe"])

    def test_style_y_script_inline(self):
        e = self.errores({"index.html": '<style>b{background:url("/assets/img/no.webp")}</style>'
                                        '<script>const s="/assets/js/no.js"</script>', "assets/x": ""})
        self.assertTrue(any("/assets/img/no.webp" in x for x in e))
        self.assertTrue(any("/assets/js/no.js" in x for x in e))

    def test_js_comentarios_y_rutas_del_sitio(self):
        self.assertEqual(self.errores({
            "assets/a.js": '// "/assets/no.png"\n/* "/assets/no2.png" */\n'
                           'const u="https://formsubmit.co/x"; const p="/assets/si.png";\n'
                           'const t="/thumb/"; const q=`/assets/${x}.png`;',
            "assets/si.png": ""}), [])
        e = self.errores({"assets/a.js": 'const l="/crtv/x/";', "crtv/y/index.html": ""})
        self.assertTrue(any("/crtv/x/ no existe" in x for x in e))

    def test_json_y_manifiesto(self):
        archivos = {"assets/contenido/e.json": '{"icono": "/assets/img/escritorio/iconos/no.png"}',
                    "assets/m.webmanifest": '{"start_url": "/oazis", "icons": [{"src": "img/i.png"}]}',
                    "oazis.html": ""}
        e = self.errores(archivos)
        self.assertTrue(any("/assets/img/escritorio/iconos/no.png" in x for x in e))
        self.assertTrue(any("img/i.png" in x for x in e))
        archivos.update({"assets/img/i.png": "", "assets/img/escritorio/iconos/no.png": ""})
        self.assertEqual(self.errores(archivos), [])
```

- [ ] **Paso 2: Verificar que fallan**

Run: `python3 -m unittest discover -s scripts -p "test_*.py" -v`
Esperado: las de `Enlaces` FALLAN y las de `Redirecciones` siguen en `ok`.

- [ ] **Paso 3: Implementar `revisar_enlaces`**

Para el HTML, usa `html.parser.HTMLParser`: junta los atributos, el texto de `<style>` y el de los `<script>` sin `src`.
Para CSS y JS bastan expresiones regulares.

- [ ] **Paso 4: Verificar que pasan**

Run: `python3 -m unittest discover -s scripts -p "test_*.py" -v`
Esperado: todas en `ok`.

- [ ] **Paso 5: Commit**

```bash
git add scripts/
git commit -m "armar-sitio: revisión de enlaces en HTML, CSS, JS, JSON y manifiesto"
```

---

### Task 3: Rutas que empiezan con `/`, guardia y `armar`, más la prueba con el sitio de hoy

**Files:**
- Modify: `scripts/armar-sitio.py`
- Modify: `scripts/test_armar_sitio.py`

**Interfaces:**
- Consumes: `leer_redirecciones`, `escribir_reenvios`, `revisar_enlaces` y `ErrorDeSitio` (Tasks 1 y 2).
- Produces:
  - `ZONA_OAZIS = ("oazis.html", "assets/oazis.webmanifest", "assets/puramente/", "assets/img/oazis/", "assets/audio/oazis/")`:
    rutas relativas a `dist/`. Un archivo que es una de ellas, o está debajo de una, queda fuera de
    `revisar_rutas_absolutas`.
  - `revisar_rutas_absolutas(dist: Path) -> list[str]`, con el mensaje
    `"{archivo}: {ruta} es relativa; las rutas del sitio empiezan con /"`. Marca:
    - en HTML (`src`, `href`, `srcset`, `poster`) y en `url()` de CSS, cualquier valor que no empiece con `/`,
      `https:`, `http:`, `mailto:`, `tel:`, `#`, `data:` o `javascript:`, salvo los vacíos y los que tengan `${`;
    - en JS, JSON y `<script>`, todo texto entre comillas que empiece con `assets/` o `data/`. En JS se ignoran los
      comentarios, igual que en la Task 2.
  - `FUERA_DE_LA_GUARDIA = {".git", "dist", "docs", ".worktrees", "material", ".claude", ".superpowers", "sitio"}`.
  - `revisar_guardia(repo: Path) -> list[str]`: un mensaje `"{ruta}: está fuera de sitio/ y no se publicaría; muévela a sitio/"`
    por cada `.html` del repo cuya primera carpeta no esté en `FUERA_DE_LA_GUARDIA`.
  - `armar(repo: Path) -> list[str]`. Hace en orden:
    1. `revisar_guardia`.
    2. Borra `repo/dist` si existe y copia `repo/sitio` (ignora `.DS_Store`).
    3. `leer_redirecciones(repo/"redirecciones.txt")`. Si el archivo falta, el error es `"falta redirecciones.txt"`;
       si lanza `ErrorDeSitio`, su mensaje.
    4. `escribir_reenvios`.
    5. Crea `dist/.nojekyll`.
    6. `revisar_enlaces` + `revisar_rutas_absolutas`.

    Devuelve todos los errores juntos.
  - `main(argv: list[str] | None = None) -> int`: corre `armar(Path.cwd())`. Si hay errores, los imprime uno por
    línea y devuelve `1`. Si no, imprime `Listo: dist/ armado con {n} redirecciones y sin errores.` y devuelve `0`.
    Al final del archivo: `if __name__ == "__main__": sys.exit(main())`.

- [ ] **Paso 1: Escribir las pruebas que fallan**

```python
class RutasYGuardia(unittest.TestCase):
    def test_relativa_en_html_y_css(self):
        e = cargar().revisar_rutas_absolutas(sitio_de_prueba({
            "onuha/index.html": '<img src="assets/img/x.png"><a href="#a"></a><a href="mailto:a@b.co"></a>',
            "assets/css/a.css": 'a{background:url("fonts/x.woff2")}'}))
        self.assertTrue(any("onuha/index.html: assets/img/x.png es relativa" in x for x in e))
        self.assertTrue(any("assets/css/a.css: fonts/x.woff2 es relativa" in x for x in e))
        self.assertEqual(len(e), 2)

    def test_relativa_en_script_inline(self):
        e = cargar().revisar_rutas_absolutas(sitio_de_prueba({
            "onuha/index.html": '<script>window.ONUHA_STATIC={"base": "assets/img/onuha/mynd/"}</script>'}))
        self.assertTrue(any("assets/img/onuha/mynd/ es relativa" in x for x in e))

    def test_zona_oazis_queda_afuera(self):
        self.assertEqual(cargar().revisar_rutas_absolutas(sitio_de_prueba({
            "oazis.html": '<img src="assets/img/oazis/mark.png"><script>a="assets/audio/oazis/"</script>',
            "assets/puramente/models/puramente-audios.js": 'const l="assets/puramente/lecciones/";'})), [])

    def test_guardia_html_fuera_de_sitio(self):
        r = sitio_de_prueba({"sitio/index.html": "", "docs/a.html": "", ".worktrees/x/a.html": "",
                             "dist/a.html": "", "onuha.html": ""})
        self.assertEqual(cargar().revisar_guardia(r),
                         ["onuha.html: está fuera de sitio/ y no se publicaría; muévela a sitio/"])

    def test_armar_completo(self):
        r = sitio_de_prueba({"sitio/index.html": '<a href="/portada/"></a>', "sitio/portada/index.html": "",
                             "redirecciones.txt": "/portada.html /portada/\n", "dist/viejo.html": ""})
        self.assertEqual(cargar().armar(r), [])
        for f in ["index.html", "portada/index.html", "portada.html", ".nojekyll"]:
            self.assertTrue((r / "dist" / f).exists(), f)
        self.assertFalse((r / "dist" / "viejo.html").exists())

    def test_armar_sin_lista(self):
        r = sitio_de_prueba({"sitio/index.html": ""})
        self.assertIn("falta redirecciones.txt", cargar().armar(r))
```

- [ ] **Paso 2: Verificar que fallan**

Run: `python3 -m unittest discover -s scripts -p "test_*.py" -v`
Esperado: las de `RutasYGuardia` FALLAN.

- [ ] **Paso 3: Implementar `revisar_rutas_absolutas`, `revisar_guardia`, `armar` y `main`**

Reusa el lector de HTML/CSS/JS de la Task 2. Solo cambia qué se marca.

- [ ] **Paso 4: Verificar que pasan**

Run: `python3 -m unittest discover -s scripts -p "test_*.py" -v`
Esperado: todas en `ok`.

- [ ] **Paso 5: Probar la revisión de enlaces con el sitio de hoy (§9: el día uno pasa en verde)**

Se arma el sitio como lo hace hoy `deploy.yml` y se le corre solo `revisar_enlaces`. `revisar_rutas_absolutas` todavía
fallaría, porque hoy todo es relativo.

```bash
B=$(mktemp -d) && mkdir "$B/dist"
cp *.html CNAME robots.txt sitemap.xml favicon.ico "$B/dist/" && cp -r assets data "$B/dist/"
python3 -c "import importlib.util,sys,pathlib; s=importlib.util.spec_from_file_location('a','scripts/armar-sitio.py'); m=importlib.util.module_from_spec(s); s.loader.exec_module(m); e=m.revisar_enlaces(pathlib.Path(sys.argv[1])); print(*e, sep='\n'); print(len(e), 'errores')" "$B/dist"
```

Esperado: `0 errores`. Si sale alguno, decide qué es antes de seguir:
- Si es un enlace roto que ya existía, anótalo para la descripción del PR. No lo arregles en esta mudanza, salvo
  que sea una ruta.
- Si es un error del script, corrige el script y agrega la prueba que lo fija.

- [ ] **Paso 6: Commit**

```bash
git add scripts/
git commit -m "armar-sitio: rutas que empiezan con /, guardia fuera de sitio/ y armado completo"
```

---

### Task 4: Borrar lo que no se usa y crear `redirecciones.txt`

**Files:**
- Delete: lo que lista §10.
- Create: `redirecciones.txt`

- [ ] **Paso 1: Borrar (§10)**

```bash
git rm -q -r assets/app.js assets/sky assets/floor assets/mask \
  escritorio.html playground.html mind.html creativmask.html creatvfy.html \
  assets/fondos/{aurora,teal-95,atardecer-pixel,mosaico,nubes-95}.webp \
  assets/iconos/{animacion.svg,buho.png,camara.svg,cerebro.png,cerebro-azul.png,correo.png,creatv-paleta.png,cursor.png,cursor-mano.png,duo.png,fotos.svg,internet.svg,musica.svg,notas.png,paleta.svg,playground.png} \
  assets/img/{logo-creatv-pixel.png,logo-creatv-studios.webp,logo-creativ-playground.webp,studio.png,love/camilo-signature.webp}
```

- [ ] **Paso 2: Crear `redirecciones.txt`**

Va con la cabecera `# URL vieja   destino` y las **24 líneas** de la tabla de §8, en ese orden: de
`/escritorio.html` a `/creatvfy.html`.

- [ ] **Paso 3: Verificar**

Run: `python3 -c "import importlib.util; s=importlib.util.spec_from_file_location('a','scripts/armar-sitio.py'); m=importlib.util.module_from_spec(s); s.loader.exec_module(m); print(len(m.leer_redirecciones(open('redirecciones.txt').read())))"`
Esperado: `24`.

Run: `grep -rlE "app\.js|assets/(sky|floor|mask)/|nubes-95|teal-95|creatv-paleta|cerebro-azul|logo-creatv-pixel|camilo-signature" --include="*.html" --include="*.js" --include="*.css" --include="*.json" .`
Esperado: no imprime nada. Lo que sigue nombrándolos son solo documentos `.md`, y se arreglan en la Task 7.

- [ ] **Paso 4: Commit**

```bash
git add -A redirecciones.txt && git commit -m "Borrar lo que ninguna página usa; los reenvíos sueltos pasan a redirecciones.txt"
```

---

### Task 5: Mudar a `sitio/` (solo renombres)

**Files:** todo lo publicado; `.gitignore`.

- [ ] **Paso 1: Mover con `git mv`, sin editar nada**

```bash
mkdir -p sitio/assets/{css,js,contenido,audio} sitio/assets/img/{marca,escritorio} sitio/crtv sitio/wakeup/programa docs
git mv index.html 404.html CNAME robots.txt sitemap.xml favicon.ico oazis.html sitio/
for p in portada proyectos lab mynd love onuha bryngrill; do mkdir -p sitio/$p && git mv $p.html sitio/$p/index.html; done
git mv wakeup.html sitio/wakeup/index.html
git mv wakeup-program.html sitio/wakeup/programa/index.html
for id in cajita-feliz-dtmf cajita-feliz-ferxxo dtmf-fc-barcelona forja-player jordan-blessd las-palabras-nos-hacen perreo-santo pokemor underdogs; do mkdir -p sitio/crtv/$id && git mv crtv-$id.html sitio/crtv/$id/index.html; done
git mv assets/escritorio.css assets/minimal.css assets/lab.css assets/styles.css sitio/assets/css/
git mv assets/escritorio.js assets/minimal.js assets/lab.js assets/wakeup.js assets/wakeup-landing.js assets/wakeup-modules.js sitio/assets/js/
git mv assets/projects.js data/escritorio.json sitio/assets/contenido/
git mv assets/fonts assets/puramente assets/oazis.webmanifest sitio/assets/
git mv assets/audio/oazis sitio/assets/audio/oazis
git mv assets/iconos sitio/assets/img/escritorio/iconos
git mv assets/fondos sitio/assets/img/escritorio/fondos
git mv assets/img/escritorio/bano.webp sitio/assets/img/escritorio/bano.webp
git mv assets/lab sitio/assets/img/lab
git mv assets/img/{favicon.png,favicon-c.png,apple-touch-icon.png,apple-touch-icon-c.png,logo-creatv.webp,logo-creatv-blur.webp,logo-creatv-blanco.webp,logo-wakeup.png,og.jpg,og-playground.jpg} sitio/assets/img/marca/
git mv assets/img/bg assets/img/crtvs assets/img/love assets/img/onuha assets/img/bryngrill assets/img/oazis sitio/assets/img/
git mv LEEME-ESCRITORIO.md docs/escritorio.md
```

- [ ] **Paso 2: `.gitignore`**

Cambia las líneas de `assets/CRTVS/` (el comentario y la ruta) por:

```
# Fuentes de diseño que no son del sitio (PDF de los CRTV, etc.): solo en disco.
material/
```

- [ ] **Paso 3: Verificar que todo es renombre puro**

Run: `git ls-files assets data '*.html' | grep -v '^sitio/'`
Esperado: no imprime nada.

Run: `git add -A && git diff --cached -M100% --name-status | grep -v '^R100'`
Esperado: solo `M	.gitignore`.

- [ ] **Paso 4: Commit**

```bash
git commit -m "Mudar todo lo publicado a sitio/: una carpeta por página y assets por tipo (solo renombres)"
```

---

### Task 6: Reescribir rutas y enlaces hasta que `armar-sitio.py` pase en verde

**Files:** los de texto en `sitio/`, **menos la zona Oazis**: `.html`, `.css`, `.js`, `.json`, `sitemap.xml` y `robots.txt`.

- [ ] **Paso 1: Reemplazar las rutas con un script de una sola vez**

El script va en el scratchpad y no se commitea. Cada ruta vieja puede aparecer de tres formas, y las tres pasan a la
nueva conservando lo que tenían adelante:
- relativa: `assets/x`;
- desde la raíz: `/assets/x`;
- con dominio: `https://creatvmyndz.com/assets/x`.

Nunca debe quedar `//assets`. Aplica primero las rutas más largas:

| Ruta vieja | Ruta nueva |
|---|---|
| `assets/{escritorio,minimal,lab,styles}.css` | `/assets/css/<mismo nombre>` |
| `assets/{escritorio,minimal,lab,wakeup,wakeup-landing,wakeup-modules}.js` | `/assets/js/<mismo nombre>` |
| `assets/projects.js` | `/assets/contenido/projects.js` |
| `data/escritorio.json` | `/assets/contenido/escritorio.json` |
| `assets/iconos/` | `/assets/img/escritorio/iconos/` |
| `assets/fondos/` | `/assets/img/escritorio/fondos/` |
| `assets/lab/` | `/assets/img/lab/` |
| `assets/img/<cada uno de los 10 archivos de marca de la Task 5>` | `/assets/img/marca/<mismo nombre>` |
| `assets/audio/modulo-01.mp3` | `/assets/audio/wakeup/modulo-01.mp3` |
| `assets/img/` (todo lo demás), `assets/fonts/`, `assets/video/` | lo mismo con `/` adelante |
| en los CSS: `url("fonts/…")`, `url("img/…")` | `url("/assets/fonts/…")`, `url("/assets/img/…")` |

Los enlaces a páginas solo se reemplazan dentro de comillas, en atributos o en los datos (`link:`, `enlace_interno`,
`canonical`, `og:url`). En el texto de los comentarios se corrigen a mano, solo si engañan:

| Enlace viejo (con su `#ancla` si la tiene) | Enlace nuevo |
|---|---|
| `index.html`, `./` (como enlace) | `/` |
| `portada.html` | `/portada/` |
| `proyectos.html`, `playground.html` | `/proyectos/` |
| `crtv-<id>.html` | `/crtv/<id>/` |
| `wakeup.html` | `/wakeup/` |
| `wakeup-program.html` | `/wakeup/programa/` |
| `lab.html` | `/lab/` |

- [ ] **Paso 2: Corregir a mano la lógica que arma rutas**

- `sitio/assets/js/minimal.js`, en el bloque "DETALLE DE UN CRTV": `here` deja de ser
  `location.pathname.split("/").pop()`. Pasa a ser la ruta sin `index.html` final y siempre con `/` al final, y se compara
  con `p.link`.
- `sitio/assets/js/wakeup-landing.js`: `next.value = location.origin + "/wakeup/programa/?correo=" + encodeURIComponent(…)`.
- `sitio/sitemap.xml`: quedan las 13 URLs nuevas, sin `.html`. Las páginas movidas llevan `lastmod` con la fecha de la
  mudanza, y `/` conserva la suya.
- `sitio/robots.txt`: quitar `Disallow: /assets/CRTVS/`. Lo demás queda igual.
- Los comentarios de `projects.js` y `escritorio.js` que dicen dónde subir imágenes pasan a las carpetas nuevas.

- [ ] **Paso 3: Correr el script**

Run: `python3 -m unittest discover -s scripts -p "test_*.py" && python3 scripts/armar-sitio.py`
Esperado: termina con `Listo: dist/ armado con 24 redirecciones y sin errores.` Si hay errores, corrige las rutas en
`sitio/` y vuelve a correrlo, sin aflojar el script.

- [ ] **Paso 4: Confirmar que la zona Oazis no cambió**

Run: `git diff main -M --name-status -- sitio/oazis.html sitio/assets/oazis.webmanifest sitio/assets/puramente sitio/assets/img/oazis sitio/assets/audio/oazis | grep -v '^R100'`
Esperado: no imprime nada.

- [ ] **Paso 5: Probar en el navegador, sobre `dist/`**

Sirve `dist/` con `python3 -m http.server -d dist 4188`, abrelo con la vista previa del navegador y revisa la consola
sin errores 404 en cada página:
- **`/` (escritorio):** íconos, logo, fondo por defecto, el pincel con las 6 miniaturas y cambiar de fondo, una ventana
  de Paint con un CRTV, Buscaminas, la ventana Contáctanos (sin enviar), Mynd, la carpeta Creatvfy, Wake Up!
  (abre `/wakeup/`) y Creative Dealers (abre `/portada/#dealing`).
- **`/proyectos/`:** las 14 tarjetas con su miniatura; al tocar una, abre `/crtv/<id>/`.
- **Anterior / Siguiente:** en `/crtv/forja-player/` y en `/crtv/forja-player/index.html`, los botones apuntan a
  otros `/crtv/<id>/`, no a `/proyectos/`.
- **`/portada/`:** los enlaces `#dealing`, `#wakeup` y `#playground`.
- **`/wakeup/` y `/wakeup/programa/?correo=prueba@ejemplo.com`:** en `/wakeup/`, el campo `_next` del formulario se
  llena con `/wakeup/programa/?correo=…` al enviar. Hay que verlo sin enviar de verdad: en la consola,
  `document.getElementById("lead-form").addEventListener("submit", e => { e.preventDefault(); console.log(document.getElementById("lead-next").value) })`
  y después enviar. Debe imprimir `http://localhost:4188/wakeup/programa/?correo=…`.
- **`/lab/`, `/mynd/`, `/love/`, `/onuha/` (con imágenes) y `/bryngrill/`:** se ven completas.
- **`/oazis.html`:** carga, suena al tocar play, y PuraMente abre el cerebro. La URL `/oazis` sin `.html` no se puede
  probar localmente, porque el servidor de Python no la resuelve; se prueba en vivo en la Task 8.
- **Carpetas sin barra:** `curl -sI http://localhost:4188/mynd` y `curl -sI http://localhost:4188/crtv/forja-player`
  responden `301` con `Location` terminada en `/`.
- **URLs viejas:** `curl -s http://localhost:4188/portada.html | grep -F 'location.replace("/portada/"'` encuentra la línea.

- [ ] **Paso 6: Commit**

```bash
git add -A sitio && git commit -m "Rutas que empiezan con / y enlaces a las carpetas nuevas; Anterior/Siguiente y el regreso de WAKE UP"
```

---

### Task 7: Workflows y documentación

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `.github/workflows/revisar.yml`
- Modify: `README.md`, `docs/escritorio.md`, `backend/apps-script-wakeup.gs` (solo el comentario de la línea 17)

- [ ] **Paso 1: `deploy.yml`**

El paso "Preparar los archivos del sitio" (con su bloque `run`) se reemplaza por esto:

```yaml
      - name: Armar el sitio (copia sitio/, crea las redirecciones y revisa los enlaces)
        run: python3 scripts/armar-sitio.py
```

El nombre, los disparadores, los permisos, la concurrencia, `environment` y los pasos de Pages quedan igual. El
comentario de arriba agrega: "Lo que se publica es la carpeta sitio/; ver README".

- [ ] **Paso 2: `revisar.yml`**

```yaml
name: Revisar el sitio

# En cada PR a main: pruebas del script y armado del sitio, sin publicar.
on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  revisar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Pruebas de armar-sitio
        run: python3 -m unittest discover -s scripts -p "test_*.py" -v
      - name: Armar y revisar el sitio
        run: python3 scripts/armar-sitio.py
```

- [ ] **Paso 3: README**

Se reescribe con estas secciones:
1. **Qué es.**
2. **Dónde va cada cosa:** las tablas de §5 y §6, resumidas, y la regla "lo de `sitio/` se publica y lo de afuera no".
3. **Editar proyectos:** `sitio/assets/contenido/projects.js`. Se conserva la explicación de `num`, `status`, `image`,
   `link` e `id`, con rutas nuevas.
4. **Ver el sitio en tu computador:** `python3 -m http.server -d sitio 4173`, y para probar las redirecciones
   `python3 scripts/armar-sitio.py` y luego `-d dist`.
5. **Publicar:** el workflow, qué hace `armar-sitio.py` y qué hacer cuando falla.
6. **Mudar o borrar una página:** agregar la línea en `redirecciones.txt`.
7. **Dominio:** la sección actual, tal cual.
8. **Formulario de WAKE UP:** la sección actual, con rutas nuevas.
9. **Recuperar algo borrado:** `git log --oneline -- <ruta vieja>` y `git checkout <commit>^ -- <ruta vieja>`.
10. **Oazis:** la zona congelada, el corte de §11 y la nota de cmsilo.

Se quita la sección "El cielo (video de fondo)". La fecha de vencimiento del dominio que dice la sección actual
(1 de octubre de 2026) ya pasó: no la cambies, se avisa en el PR.

- [ ] **Paso 4: `docs/escritorio.md` y el Apps Script**

En `docs/escritorio.md`, las rutas pasan a las nuevas: `assets/img/escritorio/iconos/…`, `…/fondos/…`,
`assets/contenido/escritorio.json`, `assets/js/escritorio.js`, `assets/css/escritorio.css` e `index.html` en `sitio/`.
La "lección" de publicación pasa a decir que todo lo de `sitio/` se publica solo. En el Apps Script, el comentario
dice que se publica solo `sitio/`.

- [ ] **Paso 5: Verificar**

Run: `grep -nE "LEEME|assets/(iconos|fondos|lab/|projects\.js|escritorio\.(js|css)|minimal\.|styles\.css|app\.js|sky|floor)|data/escritorio|crtv-[a-z-]+\.html|portada\.html|wakeup-program\.html|cp \*\.html" README.md docs/escritorio.md backend/*.gs .github/workflows/*.yml`
Esperado: solo aparecen menciones dentro de la sección de redirecciones del README, como ejemplo de URL vieja.

Run: `python3 -c "import yaml" 2>/dev/null && python3 -c "import yaml,sys;[yaml.safe_load(open(f)) for f in sys.argv[1:]]" .github/workflows/*.yml; echo ok`
Esperado: `ok`. Si no hay PyYAML, se revisa a ojo la indentación. La prueba de verdad es el check del PR en la Task 8.

- [ ] **Paso 6: Commit**

```bash
git add .github README.md docs/escritorio.md backend/
git commit -m "Publicar con armar-sitio.py, revisar en cada PR y documentar la estructura nueva"
```

---

### Task 8: PR, comparación con `main` y verificación en vivo

**Files:** ninguno nuevo.

- [ ] **Paso 1: Abrir el PR**

`git push -u origin estructura-del-sitio` y abrir el PR a `main`. La descripción lleva:
- la tabla de URLs de §7;
- las 24 redirecciones;
- lo borrado (§10);
- que la zona Oazis va intacta y la nota para cmsilo de §11;
- que quien exporte `onuha.html` debe escribir en `sitio/onuha/index.html` con rutas que empiecen con `/`;
- los enlaces rotos que ya existían, si la Task 3 encontró alguno;
- la fecha vencida del dominio en el README;
- lo que queda para el dueño (paso 5).

Esperado: el check "Revisar el sitio" del PR en verde.

- [ ] **Paso 2: Justo antes de fusionar, comparar con `main` (§13)**

Run: `git fetch origin && git log --oneline estructura-del-sitio..origin/main`
Esperado: no imprime nada. Si imprime commits, revisa con `git diff <base>..origin/main --stat` qué tocaron. Si tocaron
`assets/projects.js`, `data/escritorio.json` o la zona Oazis, rebasa sobre `origin/main`. Git sigue los renombres;
lo que no siga solo, pásalo a mano a la ruta nueva y ponle las rutas que empiezan con `/`. Luego repite los pasos 3 a
5 de la Task 6.

- [ ] **Paso 3: Fusionar**

Lo fusiona el dueño, que puede saltarse la aprobación. Esperado: el workflow "Deploy a producción" en verde.

- [ ] **Paso 4: Verificar en creatvmyndz.com**

```bash
grep -vE '^\s*(#|$)' redirecciones.txt | while read vieja destino; do curl -fsS "https://creatvmyndz.com$vieja" | grep -qF "location.replace(\"$destino\"" && echo "ok   $vieja" || echo "FALLA $vieja"; done
for u in / /portada/ /proyectos/ /wakeup/ /wakeup/programa/ /lab/ /mynd/ /love/ /onuha/ /bryngrill/ /oazis /crtv/forja-player/ /assets/contenido/escritorio.json /assets/img/marca/og.jpg; do curl -o /dev/null -sw "%{http_code} $u\n" "https://creatvmyndz.com$u"; done
curl -sI https://creatvmyndz.com/mynd | head -3
```

Esperado:
- 24 líneas `ok`;
- `200` en cada URL nueva;
- `/mynd` reenvía a `/mynd/` con `301`, o sirve el reenvío.

En el navegador: abre `https://creatvmyndz.com/wakeup-program.html?correo=prueba%40ejemplo.com` y debe quedar en
`/wakeup/programa/?correo=prueba%40ejemplo.com`; `https://creatvmyndz.com/portada.html#dealing` debe quedar en
`/portada/#dealing`; `https://creatvmyndz.com/crtv/no-existe/` debe mostrar el 404 con su estilo. Repite el recorrido
del paso 5 de la Task 6 en el escritorio, un CRTV y Oazis.

Si algo falla en vivo y no se arregla en minutos, se revierte el merge con un PR (§13). El sitio vuelve a como estaba,
y los links viejos vuelven a funcionar.

- [ ] **Paso 5: Lo del dueño y lo local (con su visto bueno)**

- Un envío real del formulario desde `https://creatvmyndz.com/wakeup/`. Si FormSubmit pide activar, el dueño confirma
  el correo de activación (§13).
- En la copia `/Users/colorado/Documents/GitHub/creatvmyndz`, después de traer `main`, `assets/` solo debe tener `CRTVS/`.
  Muévelo con `mkdir -p material && mv assets/CRTVS material/ && rmdir assets`.
- En `.claude/launch.json` (local), `runtimeArgs` de las dos configuraciones pasan a
  `["-m", "http.server", "<puerto>", "-d", "sitio"]`.
- Queda como tarea aparte: actualizar el paso 4 de la sección 13 del diseño de oazis-app con las rutas nuevas, y
  decidir si "Revisar el sitio" pasa a ser un check obligatorio en el ruleset.
- Borrar el worktree: `git worktree remove ../creatvmyndz-estructura`.
