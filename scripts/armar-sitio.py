#!/usr/bin/env python3
"""Arma lo que se publica en creatvmyndz.com.

Copia sitio/ a dist/, crea las páginas que reenvían las URLs viejas (redirecciones.txt)
y revisa que ningún enlace quede roto. Lo corre el workflow de publicación; también
sirve a mano:  python3 scripts/armar-sitio.py

Solo usa la biblioteca estándar de Python (3.9 o más nuevo).
"""
from __future__ import annotations

import html
import json
import os
import re
import shutil
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

DOMINIO = "https://creatvmyndz.com"


class ErrorDeSitio(Exception):
    """Un problema que impide armar el sitio (por ejemplo, una línea mal escrita en redirecciones.txt)."""


# ---------------------------------------------------------------- redirecciones

def leer_redirecciones(texto: str) -> list[tuple[str, str]]:
    """Lee redirecciones.txt: una línea por redirección, «URL vieja  destino»; # es comentario."""
    redirecciones = []
    for n, linea in enumerate(texto.splitlines(), start=1):
        linea = linea.strip()
        if not linea or linea.startswith("#"):
            continue
        campos = linea.split()
        if len(campos) != 2:
            raise ErrorDeSitio(f"redirecciones.txt línea {n}: se esperan dos columnas (URL vieja y destino): {linea}")
        vieja, destino = campos
        if not vieja.startswith("/") or not (vieja.endswith(".html") or vieja.endswith("/")):
            raise ErrorDeSitio(f"redirecciones.txt línea {n}: la URL vieja debe empezar con / y terminar en .html o en /: {vieja}")
        if not (destino.startswith("/") or destino.startswith("https://")):
            raise ErrorDeSitio(f"redirecciones.txt línea {n}: el destino debe empezar con / o con https://: {destino}")
        redirecciones.append((vieja, destino))
    return redirecciones


def archivo_del_reenvio(vieja: str) -> str:
    """El archivo que atiende la URL vieja: /x.html → x.html, /x/ → x/index.html."""
    if vieja.endswith("/"):
        return vieja[1:] + "index.html"
    if vieja.endswith(".html"):
        return vieja[1:]
    raise ErrorDeSitio(f"{vieja}: una URL vieja termina en .html o en /")


def pagina_de_reenvio(destino: str) -> str:
    """La página que reenvía a `destino`, conservando ?consulta y #ancla."""
    canonical = destino if destino.startswith("https://") else DOMINIO + destino
    attr = html.escape(destino, quote=True)
    js = json.dumps(destino).replace("<", "\\u003c")
    return (
        "<!doctype html>\n"
        '<html lang="es"><head><meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        "<title>Esta página se mudó — CREATV MYNDZ</title>\n"
        '<meta name="robots" content="noindex">\n'
        f'<link rel="canonical" href="{html.escape(canonical, quote=True)}">\n'
        f'<meta http-equiv="refresh" content="0; url={attr}">\n'
        f"<script>location.replace({js} + location.search + location.hash)</script>\n"
        f'</head><body><a href="{attr}">Seguir a la página nueva →</a></body></html>\n'
    )


def existe_en_sitio(dist: Path, ruta: str) -> bool:
    """¿La ruta del sitio (/algo) existe en dist/, como la serviría GitHub Pages?"""
    ruta = unquote(ruta.split("#", 1)[0].split("?", 1)[0])
    relativa = ruta.lstrip("/")
    if relativa == "":
        return (dist / "index.html").is_file()
    if ruta.endswith("/"):
        if (dist / relativa / "index.html").is_file():
            return True
        return relativa.startswith("assets/") and (dist / relativa).is_dir()
    return ((dist / relativa).is_file()
            or (dist / relativa / "index.html").is_file()
            or (dist / (relativa + ".html")).is_file())


def escribir_reenvios(dist: Path, redirecciones: list[tuple[str, str]]) -> list[str]:
    """Escribe una página de reenvío por redirección. Si algo está mal, no escribe nada y devuelve los errores."""
    errores = []
    viejas = [v for v, _ in redirecciones]
    vistas = set()
    for vieja, destino in redirecciones:
        if vieja in vistas:
            errores.append(f"{vieja}: aparece dos veces")
            continue
        vistas.add(vieja)
        if (dist / archivo_del_reenvio(vieja)).exists():
            errores.append(f"{vieja}: ya existe una página en esa ruta")
        if destino.startswith("/"):
            limpio = destino.split("#", 1)[0].split("?", 1)[0]
            if limpio in viejas:
                errores.append(f"{vieja} → {destino}: el destino también es una URL vieja")
            elif not existe_en_sitio(dist, destino):
                errores.append(f"{vieja} → {destino}: el destino no existe")
    if errores:
        return errores
    for vieja, destino in redirecciones:
        archivo = dist / archivo_del_reenvio(vieja)
        archivo.parent.mkdir(parents=True, exist_ok=True)
        archivo.write_text(pagina_de_reenvio(destino), encoding="utf-8")
    return []


# ---------------------------------------------------------------- lectura de referencias
#
# Cada archivo del sitio se lee en una lista de referencias (tipo, valor):
#   "url"   → un enlace o archivo pedido desde HTML (src, href, srcset, poster, og:/twitter:),
#             un url() de CSS o un ícono del manifiesto. Si es relativo, se resuelve desde el archivo.
#   "texto" → un texto entre comillas dentro de JS (sin comentarios) o de un JSON.

ATRIBUTOS_URL = {"src", "href", "poster"}
IGNORADAS = ("#", "%23", "mailto:", "tel:", "javascript:", "data:", "//")
URL_CSS = re.compile(r"""url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]*))\s*\)""")


class _LectorHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.urls: list[str] = []
        self.css: list[str] = []
        self.js: list[str] = []
        self._dentro: str | None = None

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        for nombre in ATRIBUTOS_URL & a.keys():
            self.urls.append(a[nombre])
        if "srcset" in a and "data:" not in a["srcset"]:
            for parte in a["srcset"].split(","):
                if parte.strip():
                    self.urls.append(parte.split()[0])
        if "style" in a:
            self.css.append(a["style"])
        if tag == "meta":
            clave = a.get("property") or a.get("name") or ""
            valor = a.get("content", "")
            if clave.startswith(("og:", "twitter:")) and valor.startswith(("/", "http")):
                self.urls.append(valor)
        if tag == "style" or (tag == "script" and "src" not in a):
            self._dentro = tag

    def handle_endtag(self, tag):
        if tag == self._dentro:
            self._dentro = None

    def handle_data(self, data):
        if self._dentro == "style":
            self.css.append(data)
        elif self._dentro == "script":
            self.js.append(data)


def _urls_de_css(texto: str) -> list[str]:
    return [next(g for g in m.groups() if g is not None) for m in URL_CSS.finditer(texto)]


# Un / empieza un regex (no una división) si lo que va antes es uno de estos signos o palabras.
ANTES_DE_REGEX = set("(,=:[!&|?{};+-*%<>~^")
PALABRAS_ANTES_DE_REGEX = {"return", "typeof", "case", "do", "else", "in", "of", "new", "delete", "void",
                           "throw", "yield", "await"}


def _trozo_de_template(texto: str, i: int) -> tuple[int, str, str]:
    """Lee un template `…` desde i hasta el ` que lo cierra o hasta un ${. Devuelve (siguiente, texto, '`' o '${')."""
    partes, n = [], len(texto)
    while i < n:
        if texto[i] == "\\" and i + 1 < n:
            partes.append(texto[i:i + 2])
            i += 2
        elif texto[i] == "`":
            return i + 1, "".join(partes), "`"
        elif texto.startswith("${", i):
            return i + 2, "".join(partes), "${"
        else:
            partes.append(texto[i])
            i += 1
    return n, "".join(partes), "`"


def _textos_de_js(texto: str) -> list[str]:
    """Los textos entre comillas de un JS, sin mirar dentro de comentarios ni de regex.

    Sigue los templates `…${…}…` aunque lleven otros templates adentro. Un template con ${ se
    devuelve con el ${ adentro, así que las revisiones lo ignoran (es una ruta armada).
    """
    textos: list[str] = []
    n, i = len(texto), 0
    previo, palabra = "", ""          # lo último del código: un signo, o "a" si fue un valor
    llaves: list[int] = []            # por cada ${ abierto, cuántas { van abiertas adentro
    templates: list[str] = []         # el texto de cada template que espera a que cierre su ${

    def seguir_template(desde: int, acumulado: str) -> int:
        nonlocal previo, palabra
        j, trozo, fin = _trozo_de_template(texto, desde)
        if fin == "`":
            textos.append(acumulado + trozo)
            previo, palabra = "a", ""
        else:
            templates.append(acumulado + trozo + "${")
            llaves.append(0)
            previo, palabra = "(", ""
        return j

    while i < n:
        c = texto[i]
        if c.isspace():
            i += 1
        elif texto.startswith("//", i):
            fin = texto.find("\n", i)
            i = n if fin == -1 else fin
        elif texto.startswith("/*", i):
            fin = texto.find("*/", i + 2)
            i = n if fin == -1 else fin + 2
        elif c == "/" and (previo == "" or previo in ANTES_DE_REGEX or palabra in PALABRAS_ANTES_DE_REGEX):
            j, en_clase = i + 1, False
            while j < n and texto[j] != "\n":
                d = texto[j]
                if d == "\\":
                    j += 2
                    continue
                if en_clase:
                    en_clase = d != "]"
                elif d == "[":
                    en_clase = True
                elif d == "/":
                    break
                j += 1
            i = j + 1
            while i < n and texto[i].isalpha():
                i += 1
            previo, palabra = "a", ""
        elif c in "\"'":
            j, partes = i + 1, []
            while j < n and texto[j] != c and texto[j] != "\n":
                if texto[j] == "\\" and j + 1 < n:
                    partes.append(texto[j:j + 2])
                    j += 2
                else:
                    partes.append(texto[j])
                    j += 1
            textos.append("".join(partes))
            i = j + 1
            previo, palabra = "a", ""
        elif c == "`":
            i = seguir_template(i + 1, "")
        elif c == "}" and llaves and llaves[-1] == 0:
            llaves.pop()
            i = seguir_template(i + 1, templates.pop() + "}")
        elif c.isalnum() or c in "_$":
            j = i
            while j < n and (texto[j].isalnum() or texto[j] in "_$"):
                j += 1
            previo, palabra = "a", texto[i:j]
            i = j
        else:
            if llaves and c == "{":
                llaves[-1] += 1
            elif llaves and c == "}":
                llaves[-1] -= 1
            previo, palabra = c, ""
            i += 1
    return textos


def _textos_de_json(dato) -> list[str]:
    if isinstance(dato, str):
        return [dato]
    if isinstance(dato, list):
        return [t for x in dato for t in _textos_de_json(x)]
    if isinstance(dato, dict):
        return [t for x in dato.values() for t in _textos_de_json(x)]
    return []


def _referencias(archivo: Path) -> list[tuple[str, str]]:
    texto = archivo.read_text(encoding="utf-8", errors="replace")
    sufijo = archivo.suffix.lower()
    if sufijo in (".html", ".htm"):
        lector = _LectorHTML()
        lector.feed(texto)
        refs = [("url", u) for u in lector.urls]
        refs += [("url", u) for css in lector.css for u in _urls_de_css(css)]
        refs += [("texto", t) for js in lector.js for t in _textos_de_js(js)]
        return refs
    if sufijo == ".css":
        return [("url", u) for u in _urls_de_css(texto)]
    if sufijo in (".js", ".mjs"):
        return [("texto", t) for t in _textos_de_js(texto)]
    if sufijo in (".json", ".webmanifest"):
        try:
            dato = json.loads(texto)
        except ValueError:
            return [("error", "no es JSON válido")]
        refs = [("json", t) for t in _textos_de_json(dato)]
        if sufijo == ".webmanifest" and isinstance(dato, dict):
            refs += [("url", i.get("src", "")) for i in dato.get("icons", []) if isinstance(i, dict)]
        return refs
    return []


def _archivos_de_texto(dist: Path):
    for archivo in sorted(dist.rglob("*")):
        if archivo.is_file() and archivo.suffix.lower() in (".html", ".htm", ".css", ".js", ".mjs", ".json", ".webmanifest"):
            yield archivo


def _ignorada(valor: str) -> bool:
    v = valor.strip()
    return (not v or "${" in v or v.startswith(IGNORADAS)
            or (v.startswith(("http://", "https://")) and not v.startswith(DOMINIO)))


# ---------------------------------------------------------------- revisión de enlaces

def revisar_enlaces(dist: Path) -> list[str]:
    """Un error por cada enlace o archivo del sitio que no existe en dist/."""
    primer_nivel = {p.name for p in dist.iterdir()} | {p.stem for p in dist.iterdir() if p.suffix == ".html"}
    errores: list[str] = []
    for archivo in _archivos_de_texto(dist):
        relativo = archivo.relative_to(dist).as_posix()
        base = "http://sitio.local/" + relativo
        for tipo, valor in _referencias(archivo):
            if tipo == "error":
                errores.append(f"{relativo}: {valor}")
                continue
            if _ignorada(valor):
                continue
            ruta = valor.strip()
            if ruta.startswith(DOMINIO):
                ruta = ruta[len(DOMINIO):] or "/"
            if tipo in ("texto", "json"):
                if not ruta.startswith("/") or any(c.isspace() for c in ruta):
                    continue
                # En JS un texto con / puede ser cualquier cosa ("/thumb/"); solo cuenta si nombra algo
                # del primer nivel del sitio. En un JSON de contenido, todo texto que empieza con / es una ruta.
                primero = re.split(r"[/?#]", ruta[1:], maxsplit=1)[0]
                if tipo == "texto" and primero not in primer_nivel:
                    continue
            elif not ruta.startswith("/"):
                ruta = urlparse(urljoin(base, ruta)).path
            if not existe_en_sitio(dist, ruta):
                mensaje = f"{relativo}: {valor.strip()} no existe"
                if mensaje not in errores:
                    errores.append(mensaje)
    return errores


# ---------------------------------------------------------------- rutas que empiezan con /

# Oazis se mudó tal cual (sale del sitio en el corte, ver README): conserva sus rutas relativas.
ZONA_OAZIS = ("oazis.html", "assets/oazis.webmanifest", "assets/puramente/", "assets/img/oazis/", "assets/audio/oazis/")
PERMITIDAS = ("/", "https:", "http:", "mailto:", "tel:", "#", "data:", "javascript:")


def _en_zona_oazis(relativo: str) -> bool:
    return any(relativo == z or (z.endswith("/") and relativo.startswith(z)) for z in ZONA_OAZIS)


def revisar_rutas_absolutas(dist: Path) -> list[str]:
    """Un error por cada ruta del sitio escrita como relativa (assets/…, ../, foto.png) fuera de la zona Oazis."""
    errores: list[str] = []
    for archivo in _archivos_de_texto(dist):
        relativo = archivo.relative_to(dist).as_posix()
        if _en_zona_oazis(relativo):
            continue
        for tipo, valor in _referencias(archivo):
            v = valor.strip()
            if not v or "${" in v:
                continue
            relativa = (tipo == "url" and not v.startswith(PERMITIDAS)) or (
                tipo in ("texto", "json") and v.startswith(("assets/", "data/")))
            if relativa:
                mensaje = f"{relativo}: {v} es relativa; las rutas del sitio empiezan con /"
                if mensaje not in errores:
                    errores.append(mensaje)
    return errores


# ---------------------------------------------------------------- guardia

# Carpetas del primer nivel del repo donde un .html no es una página perdida.
FUERA_DE_LA_GUARDIA = {".git", "dist", "docs", ".worktrees", "material", ".claude", ".superpowers", "sitio"}
# Archivos del sitio que antes vivían en la raíz del repo.
SUELTOS_DEL_SITIO = {"CNAME", "robots.txt", "sitemap.xml", "favicon.ico"}
# Los que cambiaron de carpeta con la mudanza.
NUEVO_LUGAR = {"assets/projects.js": "sitio/assets/contenido/projects.js",
               "data/escritorio.json": "sitio/assets/contenido/escritorio.json"}


def _donde_va(ruta: str) -> str | None:
    """A dónde va un archivo del sitio que quedó fuera de sitio/, o None si no es del sitio."""
    if ruta in NUEVO_LUGAR:
        return NUEVO_LUGAR[ruta]
    if _en_zona_oazis(ruta) or ruta in SUELTOS_DEL_SITIO:
        return "sitio/" + ruta
    if ruta.lower().endswith((".html", ".htm")):
        carpeta, _, nombre = ruta.rpartition("/")
        base = nombre.rsplit(".", 1)[0]
        if base == "index":
            destino = f"sitio/{carpeta}/index.html" if carpeta else "sitio/index.html"
        elif not carpeta and base.startswith("crtv-"):
            destino = f"sitio/crtv/{base[len('crtv-'):]}/index.html"
        else:
            destino = "sitio/" + (carpeta + "/" if carpeta else "") + base + "/index.html"
        return destino + " (las rutas empiezan con /)"
    if ruta.startswith(("assets/", "data/")):
        return "dentro de sitio/assets/ (ver README, «Dónde va cada cosa»)"
    return None


def revisar_guardia(repo: Path) -> list[str]:
    """Un error por cada archivo del sitio que quedó fuera de sitio/ (no se publicaría), con a dónde va."""
    errores = []
    for carpeta, subcarpetas, archivos in os.walk(repo):
        if Path(carpeta) == repo:
            subcarpetas[:] = [d for d in subcarpetas if d not in FUERA_DE_LA_GUARDIA]
        for nombre in archivos:
            ruta = (Path(carpeta) / nombre).relative_to(repo).as_posix()
            destino = _donde_va(ruta)
            if destino:
                va = destino if destino.startswith("dentro") else "en " + destino
                errores.append(f"{ruta}: está fuera de sitio/ y no se publicaría; va {va}")
    return sorted(errores)


# ---------------------------------------------------------------- armado

def armar(repo: Path) -> list[str]:
    """Copia sitio/ a dist/, crea los reenvíos y revisa todo. Devuelve los errores (vacío = listo)."""
    errores = revisar_guardia(repo)
    sitio, dist = repo / "sitio", repo / "dist"
    if not sitio.is_dir():
        return errores + ["falta la carpeta sitio/"]
    if dist.exists():
        shutil.rmtree(dist)
    shutil.copytree(sitio, dist, ignore=shutil.ignore_patterns(".DS_Store"))
    lista = repo / "redirecciones.txt"
    redirecciones: list[tuple[str, str]] = []
    if not lista.is_file():
        errores.append("falta redirecciones.txt")
    else:
        try:
            redirecciones = leer_redirecciones(lista.read_text(encoding="utf-8"))
        except ErrorDeSitio as e:
            errores.append(str(e))
    errores += escribir_reenvios(dist, redirecciones)
    (dist / ".nojekyll").touch()
    errores += revisar_enlaces(dist)
    errores += revisar_rutas_absolutas(dist)
    return errores


def main(argv: list[str] | None = None) -> int:
    repo = Path.cwd()
    errores = armar(repo)
    if errores:
        print(*errores, sep="\n")
        print(f"\n{len(errores)} errores: el sitio no se publica así. Ver README, sección «Publicar».")
        return 1
    n = len(leer_redirecciones((repo / "redirecciones.txt").read_text(encoding="utf-8")))
    print(f"Listo: dist/ armado con {n} redirecciones y sin errores.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
