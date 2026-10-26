# Tasks

## 1. Activación de GitHub Pages

- [x] 1.1 Activar Pages en `rafaeldavidgg/suika-planetas` (Settings → Pages → Deploy from a branch, rama `main`, carpeta `/(root)`; alternativa por CLI: crear el sitio vía API de Pages) y verificar que GitHub muestra el sitio publicado en `https://rafaeldavidgg.github.io/suika-planetas/` con el build de Pages en verde (esperar 5–10 min en el primer deploy antes de diagnosticar).
- [ ] 1.2 Confirmar redespliegue automático: comprobar en la pestaña de deploys de Pages / Actions que cada push a `main` genera un despliegue, y verificar que un cambio visible queda reflejado en la URL pública en pocos minutos.

## 2. Verificación del sitio publicado

- [ ] 2.1 Abrir la URL pública en escritorio y en viewport móvil 360px y verificar carga sin errores de consola ni 404 (juego arranca, `vendor/matter.min.js`, estilos e iconos cargan), con una partida jugable de prueba (soltar y fusionar al menos una vez).
- [ ] 2.2 Verificar PWA bajo el subpath: comprobar en DevTools que el Service Worker está registrado con scope `https://rafaeldavidgg.github.io/suika-planetas/`, que el manifiesto resuelve nombre/iconos 192 y 512, y corregir con el ajuste mínimo de rutas relativas solo si aparece algún 404 o scope inesperado (re-verificar 2.1 tras el ajuste).
- [ ] 2.3 Verificar modo offline: cargar una vez con red, activar modo avión / offline en DevTools, recargar y verificar que el juego arranca y es jugable desde la caché.

## 3. Documentación de la URL pública

- [ ] 3.1 Añadir a `README.md` una sección "Jugar online" con la URL pública y una línea sobre el mecanismo (Pages sirve `main` / raíz con redespliegue automático) y verificar que el enlace abre el juego publicado.
