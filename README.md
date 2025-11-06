# Planta · Tareas · Directorio — v3 (Push solo con FCM)

## Qué necesitas (según tu captura ya hecho)
- ✅ **Firebase Cloud Messaging (v1) habilitado**.
- ✅ **Par de claves Web Push (VAPID) generado**.
- ⬜ **Añadir la clave pública VAPID** en `index.html` → `VAPID_PUBLIC_KEY`.
- ⬜ **Rellenar `firebase-messaging-sw.js` y `firebase-config.js`** con la config de tu proyecto.
- ⬜ **Subir estos archivos a la misma carpeta** (GitHub Pages) y servirlos bajo la misma ruta.
- ⬜ (Para recordatorios cuando la PWA esté cerrada) **Cloud Functions programadas** para enviar el push a su hora.

> FCM es gratuito. Las **funciones programadas** pueden requerir activar **plan Blaze** (pago por uso); a este volumen el coste habitual es ~0€.

## Archivos
```
index.html
sw.js
firebase-config.js          ← pega aquí tu config
firebase-messaging-sw.js    ← pega aquí tu config (compat)
manifest.webmanifest        ← incluye gcm_sender_id
firebase.rules
icons/icon-192.png
icons/icon-512.png
functions/
  ├─ package.json
  └─ index.mjs              ← scheduler: envía push cuando toca
```

## Pasos
1) **Config FCM**
   - Firebase Console → *Project Settings* → **Cloud Messaging** → *Certificados push web* → copia la **clave pública** y pégala en `index.html` (const `VAPID_PUBLIC_KEY`).
2) **Service worker de FCM**
   - Rellena `firebase-messaging-sw.js` con tu `firebaseConfig`.
   - Debe estar en **la misma carpeta** que `index.html`.
3) **Manifest**
   - `manifest.webmanifest` ya incluye `"gcm_sender_id": "103953800507"`.
4) **Firestore rules**
   - En Firestore Rules pega el contenido de `firebase.rules` y publica.
5) **Deploy**
   - Sube todos los archivos a tu repo (GitHub Pages). Asegúrate de que `index.html`, `sw.js` y `firebase-messaging-sw.js` quedan juntos.
6) **Probar**
   - Abre la app, **inicia sesión con Google** y **acepta Notificaciones**.
   - Crea una tarea con recordatorio (hora + antelación). Verás el doc en `users/{uid}/scheduledReminders`.
   - **Con la app abierta**, el aviso también salta localmente a la hora.
7) **Push con la app cerrada (recomendado)**
   - Inicializa **Firebase CLI** y despliega sólo *Functions* (hosting no es necesario si usas GitHub Pages):
     ```bash
     cd functions
     npm i
     cd ..
     firebase deploy --only functions
     ```
   - La función `dispatchDueReminders` se ejecuta **cada minuto** y envía el push a todos tus dispositivos.

## Nota sobre dominios
- Si usas **Auth con Google**, añade el dominio de tu GitHub Pages a *Authentication → Settings → Authorized domains*.

## Seguridad
- Cada usuario sólo accede a sus colecciones: `users/{uid}/…` (reglas adjuntas).

---
