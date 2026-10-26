# Proposal

## Why

La app funciona y es jugable, pero su acabado visual es plano y genérico: planetas dibujados con dos colores planos, caras kawaii sobre fondos sin textura, HUD y overlays con estilos por defecto sin dirección de marca. Para un juego educativo sobre el sistema solar, cuerpos que no se parecen a los reales debilitan la promesa educativa y la primera impresión en móvil.

## What Changes

- Render de cuerpos con texturas realistas por nivel (bandas de Júpiter/Saturno, continentes en la Tierra, casquetes en Marte, cráteres en Luna/Mercurio, Gran Mancha Roja, anillos de Saturno con textura), manteniendo las caras kawaii y la legibilidad del nombre.
- Sistema de texturas 100% offline: pintura procedural en Canvas como base; si se usan imágenes externas (p. ej. NASA, dominio público), se venden en el repo con atribución y entran en la caché del service worker.
- Dirección visual coherente mobile-first: fondo estrellado con nebulosa sutil, tokens de diseño (colores, tipografía, radios, sombras) aplicados a HUD, controles, toast/combo, overlays y Codex.
- Codex con vista previa texturizada de cada cuerpo en lugar del punto de color plano.
- Puerta de calidad `impeccable` (audit-first) y verificación visual con Playwright en 375/768/1024/1440 + contraste 4.5:1 + `prefers-reduced-motion`.

## Capabilities

### New Capabilities

- `planet-visuals`: render realista y sistema visual del juego. Cubre texturas y sombreado esférico por nivel, conservación de caras y etiquetas, fondo espacial, tokens de diseño, estados de HUD/overlays/Codex y requisitos de contraste y movimiento reducido.

### Modified Capabilities

- `web-pwa-shell`: el requisito PWA instalable y offline se extiende para cubrir los nuevos assets de textura (vendored + caché del service worker, juego completo sin red).

## Impact

- Afecta a `app.js` (función `circleArt`, `drawNext`, `renderCodex`, fondo del canvas), `styles.css` (tokens, HUD, overlays, Codex, responsive) e `index.html` solo si hacen falta nodos/atributos menores.
- Nuevos ficheros posibles: `textures/` (assets vendored con `ATTRIBUTION.md`) y `DESIGN.md` de referencia; `sw.js` (lista de caché) si hay assets nuevos.
- Sin cambios en física, reglas de fusión, puntuación, cadena de evolución ni persistencia. Sin dependencias nuevas de runtime (Matter.js sigue vendored; sin frameworks).
- Limitación honesta: en este entorno no dispongo de un modelo de generación de imágenes; las texturas serán procedurales en Canvas y/o imágenes de dominio público (NASA) vendored con licencia verificada. La elección final se documenta en `design.md`.
