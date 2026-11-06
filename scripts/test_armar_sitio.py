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


if __name__ == "__main__":
    unittest.main()
