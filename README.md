# Infecciosas — Hub PWA (Planta · Tareas · Directorio)

## Estructura
- `index.html`
- `sw.js`
- `manifest.webmanifest` (rutas relativas)
- `icons/icon-192.png`, `icons/icon-512.png`
- `firebase-config.js`

## Deploy
1) Sube todo a tu repo (por ejemplo `Planta`) en la raíz.
2) Activa GitHub Pages (branch `main`, carpeta `/root`).
3) Abre la URL en Chrome y pulsa **Instalar**.

## Firebase
Habilita Authentication (Google) y Firestore. Reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Notificaciones locales
Funcionan con la app abierta y permiso de notificaciones concedido.
