# 📲 Mi Billetera Lite - Versión Móvil con Expo (React Native)

Esta carpeta contiene la versión nativa de **Mi Billetera Lite** desarrollada con **React Native + Expo** para ejecutarse directamente en tu teléfono móvil con **Expo Go**.

---

## 🚀 Pasos para ejecutar en tu celular

### 1. Instalar la app en tu teléfono
- **Android**: Descarga [Expo Go en Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
- **iPhone / iOS**: Descarga [Expo Go en App Store](https://apps.apple.com/app/expo-go/id982107779).

---

### 2. Instalar dependencias en tu computadora
Abre una terminal en esta carpeta (`billetera-mobile-expo`):

```bash
cd billetera-mobile-expo
npm install
```

---

### 3. Iniciar el servidor de desarrollo
En la misma terminal ejecuta:

```bash
npx expo start
```
*(Opcional: Si tu celular y tu PC están en redes WiFi distintas o tienes problemas de conexión local, usa el modo túnel ejecutando `npx expo start --tunnel`)*.

---

### 4. Abrir la app en tu celular
1. Verás un **código QR** grande en la terminal.
2. Abre la cámara (en iOS) o la aplicación **Expo Go** (en Android) y selecciona **"Scan QR code"**.
3. Escanea el código QR de la pantalla.
4. ¡Listo! La aplicación compilará y se abrirá de inmediato en tu celular.

---

## 💡 Recordatorio sobre la entrega escolar (PWA)
Recuerda que para tu evaluación escolar según el documento PDF:
- El proyecto principal en la raíz es una **PWA (Progressive Web App)** con Service Worker, Manifiesto y modo offline para Chrome.
- Esta versión de Expo te permite experimentar y presentar la app de forma nativa en tu dispositivo móvil con **Expo Go**.
