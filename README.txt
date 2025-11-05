PLANTA — PWA (GitHub Pages + Firebase) 
======================================

Pasos rápidos
-------------
1) Firebase Console → proyecto: planta-59ff8
   - Project settings → Your apps → Web (</>) → copia apiKey, senderId y appId.
   - Authentication → Sign-in method → Google → Enable.
   - Authentication → Settings → Authorized domains → añade: <tuusuario>.github.io
   - Firestore Database → Create (Production) → Rules → pega el contenido de firebase.rules

2) Edita firebase.config.js y pega tus credenciales (apiKey, messagingSenderId, appId).

3) Sube TODO el contenido de esta carpeta al repo:
   https://github.com/Crasasito/Planta (branch: main, ruta raíz)

4) GitHub → Settings → Pages → Source: main → root.

5) Abre tu sitio de GitHub Pages (algo como: https://crasasito.github.io/Planta/)
   - Pulsa “➕ Instalar” si aparece el banner.
   - “Acceder con Google” y prueba a crear tareas en Planta / Interconsultas.

Notas
-----
- Los iconos actuales son “placeholder” neutros. Sustitúyelos por los definitivos (icon-192.png y icon-512.png)
  manteniendo el mismo nombre y ruta /icons/.
- Funciona offline (service worker) y sincroniza en tiempo real con Firestore. 
- Si no aparece el banner de instalación, entra desde Chrome y visita varias veces la página; 
  también puedes instalar desde el menú ⋮ → Añadir a pantalla de inicio.
