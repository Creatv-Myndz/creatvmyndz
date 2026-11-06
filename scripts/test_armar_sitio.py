"""Pruebas de scripts/armar-sitio.py.

Correr:  python3 -m unittest discover -s scripts -p "test_*.py" -v
"""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "armar-sitio.py"


def cargar():
    """Carga armar-sitio.py como módulo (el nombre lleva guion, así que no se importa directo)."""
    spec = importlib.util.spec_from_file_location("armar_sitio", SCRIPT)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def sitio_de_prueba(archivos: dict[str, str]) -> Path:
    """Crea un directorio temporal con esos archivos (ruta relativa → texto)."""
    raiz = Path(tempfile.mkdtemp(prefix="armar-sitio-"))
    for ruta, texto in archivos.items():
        destino = raiz / ruta
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(texto, encoding="utf-8")
    return raiz


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


if __name__ == "__main__":
    unittest.main()
