# 📱 Mi Billetera Lite - PWA (Progressive Web App)

Aplicación Web Progresiva (PWA) ultraligera diseñada para el control y registro de gastos diarios con soporte **100% Offline-First**, almacenamiento local persistente e instalabilidad nativa en dispositivos móviles y de escritorio.

---

## 🎯 Objetivo y Contexto

Pensada para usuarios que necesitan registrar sus gastos al instante sobre la marcha (transporte público, compras en mercados, pagos en zonas rurales) donde no hay cobertura de datos móviles o el dispositivo se encuentra en modo avión.

### ✨ Características Principales

- **Modo Offline Total**: Carga instantánea y operatividad plena sin conexión a internet ni dependencias externas.
- **Instalable (PWA Standalone)**: Se instala como una app nativa desde el navegador (sin barra de URLs ni botones de navegación del navegador).
- **Persistencia Local Segura**: Los datos se almacenan en el dispositivo mediante `LocalStorage`. Ningún dato se pierde al cerrar la pestaña o el navegador.
- **Totalizador en Tiempo Real**: Tarjeta superior con suma acumulada de los gastos y contador de movimientos.
- **Historial Ordenado**: Lista de gastos ordenada cronológicamente (del más reciente al más antiguo) con categorías ilustradas con iconos y fecha/hora legible.
- **Diseño Mobile-First**: Interfaz moderna, limpia, responsiva y táctil (estilo fintech moderno).
- **Indicador de Conexión en Vivo**: Badge interactivo que notifica si la app está "En línea" o en "Modo sin conexión".

---

## 📂 Estructura del Proyecto

```text
├── index.html              # Estructura semántica, meta tags PWA y contenedor de UI
├── styles.css              # Estilos Mobile-First, dark mode fintech y animaciones
├── app.js                  # Lógica de negocio, persistencia LocalStorage, eventos PWA
├── sw.js                   # Service Worker (Cache-First + Network Fallback)
├── manifest.json           # Manifiesto Web App W3C (standalone, theme_color, íconos)
├── icons/                  # Íconos optimizados para any y maskable
│   ├── icon-192.png        # Icono estándar 192x192
│   ├── icon-512.png        # Icono estándar 512x512
│   ├── icon-maskable-192.png # Icono adaptativo/maskable 192x192
│   ├── icon-maskable-512.png # Icono adaptativo/maskable 512x512
│   └── favicon.ico         # Favicon para navegadores de escritorio
└── README.md               # Documentación y guía de pruebas
```

---

## 🚀 Cómo Ejecutar en Local (Servidor de Desarrollo)

Los Service Workers requieren ejecutarse bajo un servidor local (`http://localhost`) o mediante un protocolo seguro (`https://`).

Puedes levantar un servidor local con cualquiera de las siguientes opciones:

### Opción A: Con Node.js (Recomendada)
Si tienes Node.js instalado, abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
npx serve .
```
O con `http-server`:
```bash
npx http-server -p 8080 -c-1
```
Luego abre en Chrome: `http://localhost:3000` (o el puerto que indique la terminal).

---

### Opción B: Con Python 3
Abre una terminal en la carpeta del proyecto y corre:

```bash
python -m http.server 8080
```
Luego abre en Chrome: `http://localhost:8080`

---

### Opción C: Con Visual Studio Code
Instala la extensión **Live Server** de VSCode, haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"**.

---

## 🧪 Guía para Escenarios de Evaluación (Criterios de Aceptación)

### 1. Prueba de Instalación
1. Abre la aplicación en Google Chrome (`http://localhost:...`).
2. Observa el botón **"Instalar"** en la esquina superior derecha o el icono de instalación en la barra de direcciones de Chrome.
3. Haz clic en **Instalar**.
4. **Resultado**: La aplicación se abrirá en una ventana propia sin barra de direcciones (modo *standalone*) como una app nativa.

### 2. Prueba de Auditoría Lighthouse
1. En Google Chrome, presiona `F12` (o `Ctrl + Shift + I`) para abrir las **DevTools**.
2. Dirígete a la pestaña **Lighthouse**.
3. Selecciona la categoría **Progressive Web App** (y Mobile).
4. Haz clic en **Analyze page load**.
5. **Resultado**: Verás el check verde/badge confirmando el registro de Service Worker y el manifiesto válido.

### 3. Prueba de Supervivencia Offline
1. Con las DevTools abiertas, dirígete a la pestaña **Network** (Red).
2. En el selector de velocidad (donde dice *No throttling* u *Online*), cámbialo a **Offline**.
3. Recarga la página presionando `F5` o `Ctrl + R`.
4. **Resultado**: La página carga al 100% de manera instantánea con todos sus estilos, fuentes e iconos, sin mostrar el dinosaurio de Chrome.

### 4. Prueba de Persistencia y Operación sin Red
1. Mantén la pestaña en modo **Offline** en DevTools (o pon tu computadora/teléfono en modo avión).
2. En el formulario de la app, ingresa:
   - **Concepto**: `Taxis`
   - **Monto**: `150`
   - **Categoría**: `Transporte`
3. Haz clic en **Guardar Gasto**.
4. Observa cómo aparece en la lista y el totalizador se actualiza a `$150.00`.
5. Cierra la pestaña por completo.
6. Vuelve a abrir la URL (aún en modo offline o modo avión).
7. **Resultado**: El gasto de `$150.00` ("Taxis") sigue en el historial y el total acumulado refleja exactamente la suma correcta.

---

## 🌐 Cómo Desplegar Gratis con HTTPS

Para entregar la URL funcional requerida en la rúbrica:

### Opción 1: GitHub Pages (Recomendada)
1. Inicializa el repositorio Git en la carpeta:
   ```bash
   git init
   git add .
   git commit -m "feat: PWA Mi Billetera Lite completada"
   ```
2. Crea un repositorio en tu cuenta de GitHub (ej. `mi-billetera-lite`).
3. Vincula y sube el código:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/mi-billetera-lite.git
   git push -u origin main
   ```
4. En GitHub, ve a **Settings** > **Pages**.
5. En **Branch**, selecciona `main` y la carpeta `/(root)`. Haz clic en **Save**.
6. En 1-2 minutos tendrás tu enlace HTTPS público: `https://TU-USUARIO.github.io/mi-billetera-lite/`.

### Opción 2: Vercel
1. Entra a [vercel.com](https://vercel.com).
2. Arrastra la carpeta del proyecto o conéctala a tu repositorio de GitHub.
3. Se generará un enlace HTTPS gratuito e instantáneo (ej. `https://mi-billetera-lite.vercel.app`).

### Opción 3: Netlify
1. Entra a [netlify.com](https://netlify.com).
2. Arrastra la carpeta completa al área de "Deploy manually".
3. Tendrás una URL HTTPS gratuita de inmediato.

---

## 🛠️ Tecnologías Empleadas
- **HTML5**: Semántica accesible, meta-etiquetas PWA completas.
- **CSS3 Moderno**: Variables personalizadas, soporte `safe-area-inset`, Flexbox/Grid responsivo.
- **JavaScript (ES6+)**: `LocalStorage` API, Service Worker API (`CacheStorage`), Eventos `beforeinstallprompt`, `online`/`offline`.
- **PWA**: Manifiesto W3C, estrategia Cache-First con fallback a red.
