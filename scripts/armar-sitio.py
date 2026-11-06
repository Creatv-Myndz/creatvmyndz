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
from pathlib import Path
from urllib.parse import unquote

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
