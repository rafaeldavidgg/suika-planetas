# Proposal

## Why

El juego solo es jugable en local (abrir `index.html` o `python -m http.server`); no hay URL pública para jugar, compartir ni instalar la PWA desde un origen estable. Publicarlo en GitHub Pages da hosting gratuito con HTTPS usando el repo existente `rafaeldavidgg/suika-planetas`.

## What Changes

- Publicar el sitio estático actual (sin build) en GitHub Pages como Project Pages en `https://rafaeldavidgg.github.io/suika-planetas/`.
- Activar Pages con despliegue automático desde la rama `main` (carpeta `/ (root)`) mediante GitHub Actions, sin cambiar el código del juego salvo ajustes mínimos de compatibilidad con subruta si la verificación los exige.
- Verificar en la URL pública: carga del juego, assets vendorizados (`vendor/matter.min.js`), manifiesto + iconos, registro del Service Worker bajo el scope del subpath, y jugabilidad offline tras primera carga.
- Documentar en `README.md` la URL pública y cómo se despliega (qué rama/carpeta o workflow la sirve).

## Capabilities

### New Capabilities

- `github-pages-hosting`: publicación del juego como sitio estático en GitHub Pages (origen público HTTPS, despliegue automático desde `main`, funcionamiento bajo el subpath `/suika-planetas/` incluido el scope offline de la PWA).

### Modified Capabilities

- Ninguna. Los requisitos de `web-pwa-shell` (layout, entrada, PWA offline, audio, récord/pausa) no cambian; el hosting solo añade dónde se sirve lo ya especificado.

## Impact

- Afecta: configuración del repositorio GitHub (Pages, Actions), `README.md`, y potencialmente `sw.js`/`manifest.json`/`index.html` solo si la verificación bajo subruta detecta un problema (hoy usan rutas relativas `./`, por lo que no se esperan cambios).
- Sin backend, sin dependencias nuevas, sin build, sin coste. Sin cambios en gameplay, visuales ni Codex.
- Fuera de alcance: dominio personalizado, analytics, y cualquier feature nueva del juego.
