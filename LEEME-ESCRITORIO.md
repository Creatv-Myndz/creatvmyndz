# Escritorio retro de CREATV MYNDZ

Página: **creatvmyndz.com/escritorio** (`escritorio.html`).
Viene del escritorio que estaba en la rama `escritorio` de `creatvmyndz/camilovegga`, pasado a la marca
CREATV MYNDZ y a estilo retro (Windows 95/98 + XP + Vista).

Todo el contenido vive en **`data/escritorio.json`**. Para cambiar algo casi nunca hay que tocar el código.

| Archivo | Qué es |
| --- | --- |
| `escritorio.html` | la página |
| `assets/escritorio.css` | estilos retro (bordes biselados, barra azul XP, barra de tareas) |
| `assets/escritorio.js` | lógica: fondo, íconos, ventanas, menús, reloj |
| `data/escritorio.json` | **el contenido**: fondos, proyectos, programas, ideas |
| `assets/fondos/` | fondos de pantalla |
| `assets/iconos/` | íconos retro propios (`.png` = pixel art 32×32, `.svg` = brillantes estilo XP/Vista) |

---

## Agregar un proyecto

Cada proyecto es un ícono en el escritorio, con su nombre debajo en letra retro.
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
- La **papelera** (`"id": "papelera"`) son las ideas sueltas: `"ideas": [{ "titulo": "…", "texto": "…" }]`.
  Si tiene ideas, usa el ícono `iconoLleno`.

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
- **Las ventanas no tapan la barra de tareas:** si una ventana se pasa, se sube sola (`keepAboveTaskbar`).
- **Celular:** las ventanas salen como hoja desde abajo, por encima de la barra de tareas.
- **Doble clic contra toque:** en PC se abre con doble clic; en celular con un toque. Arrastrar no abre.
- **`hidden` y `display`:** si un elemento con `hidden` tiene `display:flex` en el CSS, sigue visible y tapa los
  clics. Por eso existe `.menu[hidden]{display:none!important}`.
- **Publicación:** el workflow `.github/workflows/deploy.yml` copia `data/` al sitio; sin eso el escritorio
  no carga su contenido.
- **Íconos:** son dibujos propios inspirados en esa época. No se usan logos de Microsoft, Adobe, Winamp
  ni el logo de Instagram.
