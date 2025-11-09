# PWA Infecciosas — Aurora UI (Build v2)

## Estructura
- `index.html` — UI premium con Aurora, legibilidad AAA, SVG inline.
- `manifest.webmanifest` — Manifest PWA.
- `sw.js` — Service Worker con precache defensivo (ignora 404).
- `firebase-config.js` — Rellena tus credenciales de Firebase.
- `icons/` — Iconos 192/512 y maskable.

## Despliegue (GitHub Pages)
1) Sube todo el contenido a la carpeta del repo (raíz o `/Planta/`).
2) Asegura que los iconos están en `icons/`.
3) Si cambias la carpeta, respeta rutas relativas (`./`).

## Notas
- El aviso *Cross-Origin-Opener-Policy ... window.closed* viene de Firebase y es inofensivo.
- Tras actualizar `sw.js`, recarga forzando (Ctrl+F5) o borra el SW desde DevTools > Application.
