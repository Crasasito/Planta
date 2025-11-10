# 🌟 PWA Infecciosas — Aurora UI Premium (Build v6)

## 📋 Descripción

**Versión Premium** de la PWA Infecciosas con mejoras significativas en diseño, rendimiento, accesibilidad y experiencia de usuario. Esta versión mantiene toda la funcionalidad original mientras añade características de nivel profesional.

---

## ✨ Mejoras Premium

### 🎨 Diseño Visual

**Tema Oscuro Automático**
- Soporte completo para `prefers-color-scheme`
- Toggle manual de tema con persistencia en localStorage
- Transiciones suaves entre temas
- Paleta de colores optimizada para ambos modos

**Animaciones Fluidas**
- Animaciones de entrada para tarjetas y elementos
- Transiciones suaves con curvas de Bézier premium
- Efectos hover mejorados con transformaciones
- Respeto a `prefers-reduced-motion` para accesibilidad

**Sistema de Sombras Mejorado**
- Múltiples niveles de sombra (xs, sm, md, lg, xl)
- Sombras adaptativas según tema
- Mayor profundidad visual

**Gradientes Aurora Mejorados**
- Cuarta capa de gradiente para mayor riqueza visual
- Gradientes direccionales (135deg) en headers
- Mejor integración con el tema oscuro

### ⚡ Rendimiento

**Service Worker Avanzado**
- Versión v6 con estrategias optimizadas
- Cache-first para assets estáticos
- Network-first para HTML
- Stale-while-revalidate para contenido dinámico
- Caché de imágenes con límite de tamaño
- Limpieza automática de cachés antiguas
- Manejo de errores robusto

**Optimizaciones JavaScript**
- Intersection Observer para animaciones lazy
- Precarga inteligente de recursos
- Mejor gestión de eventos

**Gestión de Caché**
- Límite de 50 items en caché dinámica
- Expiración automática después de 7 días
- Limpieza periódica de cachés

### ♿ Accesibilidad AAA

**Navegación Mejorada**
- Scroll behavior suave (respetando preferencias)
- Focus visible mejorado
- ARIA labels completos

**Reducción de Movimiento**
- Detección de `prefers-reduced-motion`
- Desactivación automática de animaciones
- Transiciones instantáneas cuando se requiere

**Contraste Optimizado**
- Paleta de colores ajustada para tema oscuro
- Mejor legibilidad en todos los modos
- Cumplimiento de WCAG 2.1 AAA

### 📱 PWA Avanzada

**Manifest Mejorado**
- Shortcuts para acceso rápido a secciones
- Share Target API para compartir contenido
- Screenshots para instalación
- Categorías y metadata completa
- Orientación preferida (portrait)

**Características Adicionales**
- Background Sync preparado
- Push Notifications preparado
- Mejor manejo de instalación
- Soporte para badges

### 🔧 Código Premium

**Arquitectura Mejorada**
- Código más modular y mantenible
- Mejores prácticas de ES6+
- Comentarios descriptivos
- Guards contra duplicados

**Compatibilidad**
- Soporte para navegadores modernos
- Fallbacks para características no soportadas
- Progressive Enhancement

---

## 📁 Estructura del Proyecto

```
infecciosas-premium/
├── index.html              # HTML principal con CSS y JS embebidos
├── manifest.webmanifest    # Manifest PWA con shortcuts y share target
├── sw.js                   # Service Worker v6 con estrategias avanzadas
├── firebase-config.js      # Configuración de Firebase
├── README.md              # Esta documentación
└── icons/                 # Iconos de la aplicación
    ├── icon-192.png       # Icono 192x192
    ├── icon-512.png       # Icono 512x512
    ├── maskable192.png    # Icono maskable 192x192
    └── maskable512.png    # Icono maskable 512x512
```

---

## 🚀 Despliegue

### GitHub Pages

1. **Subir archivos**
   ```bash
   # Clonar o crear repositorio
   git clone https://github.com/tu-usuario/tu-repo.git
   cd tu-repo
   
   # Copiar archivos
   cp -r infecciosas-premium/* .
   
   # Commit y push
   git add .
   git commit -m "Deploy PWA Infecciosas Premium v6"
   git push origin main
   ```

2. **Configurar GitHub Pages**
   - Ve a Settings > Pages
   - Selecciona la rama `main` y carpeta `/` (root)
   - Guarda y espera el despliegue

3. **Verificar**
   - Accede a `https://tu-usuario.github.io/tu-repo/`
   - Verifica que los iconos carguen correctamente
   - Prueba la instalación de la PWA

### Otros Servicios

**Netlify / Vercel**
- Arrastra la carpeta completa al dashboard
- Configuración automática
- HTTPS incluido

**Firebase Hosting**
```bash
firebase init hosting
# Selecciona la carpeta del proyecto
firebase deploy
```

---

## 🎯 Características Principales

### 🏥 Planta e Interconsultas
- Gestión de pacientes por habitación
- Diferenciación visual entre Planta (mint) e Interconsulta (teal)
- Píldoras de habitación con tipografía monospace
- Campos personalizables

### ✅ Tareas
- Sistema de tareas con gradación por fecha
- Color dinámico según días hasta vencimiento (rojo → ámbar → verde)
- Estados: Activas, Completadas, Papelera
- Ordenación automática

### 📞 Directorio
- Contactos agrupados por sección
- Enlaces telefónicos directos (`tel:`)
- Búsqueda y filtrado
- Deduplicación automática

### 📚 Biblioteca
- Recursos, guías y documentos
- Soporte para enlaces y archivos
- Sistema de etiquetas
- Fijado de recursos importantes
- Importación/Exportación JSON

### 📝 Libre/Notas
- Sección opcional de notas rápidas
- Plantillas personalizables

---

## 🔐 Autenticación

**Firebase Auth con Google**
- Sign-in con cuenta de Google
- Persistencia de sesión
- Popup en navegador, Redirect en PWA standalone
- Estado de conexión visible

**Firestore**
- Base de datos en tiempo real
- Persistencia local
- Soporte multi-tab
- Sincronización automática

---

## 🛠️ Configuración

### Firebase

1. **Crear proyecto en Firebase Console**
   - Ve a [console.firebase.google.com](https://console.firebase.google.com)
   - Crea un nuevo proyecto

2. **Habilitar servicios**
   - Authentication > Google Sign-in
   - Firestore Database

3. **Obtener credenciales**
   - Project Settings > General
   - Copia la configuración

4. **Actualizar `firebase-config.js`**
   ```javascript
   export const firebaseConfig = {
     apiKey: "TU_API_KEY",
     authDomain: "TU_PROYECTO.firebaseapp.com",
     projectId: "TU_PROYECTO",
     storageBucket: "TU_PROYECTO.firebasestorage.app",
     messagingSenderId: "TU_SENDER_ID",
     appId: "TU_APP_ID"
   };
   ```

### Iconos

Los iconos deben estar en la carpeta `icons/`:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)
- `maskable192.png` (192x192px con safe zone)
- `maskable512.png` (512x512px con safe zone)

**Generar iconos maskable:**
- Usa [maskable.app](https://maskable.app/)
- Asegura que el contenido importante esté en la zona segura

---

## 📱 Instalación PWA

### Android (Chrome)
1. Abre la app en Chrome
2. Toca el menú (⋮) > "Añadir a pantalla de inicio"
3. Confirma la instalación
4. La app aparecerá como aplicación nativa

### iOS (Safari)
1. Abre la app en Safari
2. Toca el botón de compartir
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma

### Desktop (Chrome/Edge)
1. Busca el icono de instalación en la barra de direcciones
2. Clic en "Instalar"
3. La app se abrirá en ventana independiente

---

## 🎨 Personalización

### Paleta de Colores

Edita las variables CSS en `index.html`:

```css
:root {
  --ivory: #F8FFE5;
  --mint: #06D6A0;
  --teal: #1B9AAA;
  --coral: #EF476F;
  --gold: #FFC43D;
}
```

### Tipografía

Ajusta los tamaños fluidos:

```css
:root {
  --title: clamp(24px, 3.2vw, 36px);
  --h2: clamp(19px, 2.4vw, 24px);
  --base: clamp(15px, 1vw + .4vh, 17px);
}
```

### Animaciones

Controla las velocidades de transición:

```css
:root {
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 🐛 Solución de Problemas

### La PWA no se instala
- Verifica que `manifest.webmanifest` esté accesible
- Comprueba que los iconos existan en `/icons/`
- Asegura que estés usando HTTPS (o localhost)
- Revisa la consola de DevTools > Application

### Service Worker no actualiza
- Fuerza recarga: Ctrl+F5 (Windows) o Cmd+Shift+R (Mac)
- DevTools > Application > Service Workers > Unregister
- Incrementa VERSION en `sw.js`

### Firebase no conecta
- Verifica las credenciales en `firebase-config.js`
- Comprueba que los servicios estén habilitados en Firebase Console
- Revisa la consola del navegador para errores

### Tema oscuro no funciona
- Verifica que tu navegador soporte `prefers-color-scheme`
- Limpia localStorage: `localStorage.clear()`
- Recarga la página

### Advertencia COOP de Firebase
El mensaje "Cross-Origin-Opener-Policy ... window.closed" es normal y no afecta la funcionalidad. Proviene de Firebase Auth.

---

## 📊 Performance

### Lighthouse Score Esperado
- **Performance**: 95-100
- **Accessibility**: 95-100
- **Best Practices**: 95-100
- **SEO**: 90-100
- **PWA**: 100

### Optimizaciones Implementadas
- ✅ Service Worker con caché inteligente
- ✅ Lazy loading de animaciones
- ✅ Imágenes optimizadas
- ✅ CSS y JS embebidos (sin requests adicionales)
- ✅ Tipografía del sistema (sin fuentes externas)
- ✅ Precarga de recursos críticos

---

## 🔄 Actualización desde Versión Original

Si ya tienes la versión original desplegada:

1. **Backup de datos**
   - Exporta tus datos desde cada sección
   - Guarda los JSON

2. **Reemplazar archivos**
   - Sustituye `index.html`, `manifest.webmanifest`, `sw.js`
   - Mantén `firebase-config.js` con tus credenciales

3. **Limpiar caché**
   - Desregistra el Service Worker antiguo
   - Limpia caché del navegador

4. **Importar datos**
   - Usa las funciones de importación en cada sección

---

## 📄 Licencia

Este proyecto es de código abierto. Puedes usarlo, modificarlo y distribuirlo libremente.

---

## 🤝 Contribuciones

Las mejoras y sugerencias son bienvenidas. Para contribuir:

1. Fork del repositorio
2. Crea una rama para tu feature
3. Commit de cambios
4. Push a la rama
5. Abre un Pull Request

---

## 📞 Soporte

Para problemas, dudas o sugerencias:
- Abre un issue en GitHub
- Consulta la documentación de [Firebase](https://firebase.google.com/docs)
- Revisa [MDN Web Docs](https://developer.mozilla.org) para APIs web

---

## 🎉 Changelog

### v6 (Premium) - 2025
- ✨ Tema oscuro completo con toggle manual
- ✨ Animaciones fluidas y micro-interacciones
- ✨ Service Worker v6 con estrategias avanzadas
- ✨ Manifest mejorado con shortcuts y share target
- ✨ Accesibilidad AAA con soporte para reduced-motion
- ✨ Sistema de sombras premium de 5 niveles
- ✨ Gradientes Aurora mejorados con 4 capas
- ✨ Intersection Observer para animaciones lazy
- ✨ Caché inteligente con límites y expiración
- ✨ Documentación completa y profesional
- 🐛 Mejoras de rendimiento y optimización
- 🐛 Mejor manejo de errores

### v5 (Original)
- Versión base con funcionalidad completa
- Aurora UI con paleta de colores
- PWA básica con Service Worker
- Firebase Auth y Firestore

---

## 🌟 Créditos

**Diseño**: Aurora UI Premium  
**Paleta**: Ivory, Mint, Teal, Coral, Gold  
**Iconografía**: SVG inline custom  
**Framework**: Vanilla JS (sin dependencias)  
**Backend**: Firebase (Auth + Firestore)  

---

**¡Gracias por usar Infecciosas PWA Premium!** 🚀
