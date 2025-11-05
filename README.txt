PLANTA v2 — PWA (GitHub Pages + Firebase) 
==========================================

Novedades
---------
- Campo **Habitación (###-#)**, **Descripción (≥20)** y **Pendiente (≥15)**.
- Ordenación **ascendente por habitación** robusta mediante `sortKey` (###*10 + #).
- Validación client-side con toasts y ayudas de formato.
- Manejo de errores de **Google Sign-In** con mensajes visibles.
- Diseño responsive (One UI 8): cuadrícula 120px / 1fr / 180px en desktop y apilado en móvil.

Checklist de Google Sign-In si falla
------------------------------------
1) **Authorized domains**: añade `crasasito.github.io` en Firebase → Authentication → Settings.
2) **Habilitar proveedor**: Authentication → Sign-in method → **Google** → Enable.
3) **Credenciales Web**: apiKey, appId y messagingSenderId correctos en `firebase.config.js`.
4) **Terceros**: en Android/PC usa Chrome con cookies habilitadas. Si el popup falla, se usa **redirect** automático.
5) **Reglas Firestore**: usa `firebase.rules` para acceso por `uid` (publicadas).

Subida
------
1) Sustituye los archivos anteriores por los de esta carpeta (mantén `/icons/icon-192.png` y `/icon-512.png`).
2) Verifica `firebase.config.js` con tus credenciales reales.
3) GitHub Pages seguirá en: https://crasasito.github.io/Planta/ (PWA instalable).

Notas
-----
- Si ya tenías tareas con el esquema antiguo (`texto/prioridad`), seguirán visibles en Firestore pero esta UI espera
  `habitacion/descripcion/pendiente/sortKey`. Puedes migrarlas manualmente o dejar las antiguas en completadas.
