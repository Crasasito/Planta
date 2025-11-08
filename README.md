# Infecciosas — PWA (Planta · Tareas · Directorio)

## Estructura
- `index.html` — UI completa (One UI 8, accesible, responsive).
- `sw.js` — Service Worker cache-first + update silenciosa.
- `manifest.webmanifest` — Iconos `any` (PC) y `maskable` (Android).
- `icons/` — PNGs optimizados (192/512 + maskable + monochrome).
- `firebase-config.js` — Tus claves (Firestore + Auth).

## Despliegue
1. Sube todo al repositorio (raíz o subcarpeta como `/Planta/`).
2. GitHub Pages → activa la rama.
3. Carga la web, **Shift+F5**, e **instala** la PWA.
