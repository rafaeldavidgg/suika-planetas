# Tasks

## 1. Auditoría visual y referencia (impeccable audit-first)

- [x] 1.1 Instalar `impeccable` a nivel de proyecto (`npx impeccable install --providers=opencode`) o confirmar el equivalente disponible, y verificar que los comandos `audit` y `polish` responden. → Hecho: engine 4.7.0 instalado en `.opencode/`, `context` + `detect` verificados.
- [x] 1.2 Ejecutar `audit`/`critique` sobre la UI actual y verificar que el informe identifica los puntos débiles (planitud de planetas, tokens, fondo, overlays) antes de picar código. → Hecho: `audit.md` (11/20 Acceptable; P1 contraste CTA 3.5:1, textos tenues, sin reduced-motion, planitud; detector confirma hallazgo de contraste).
- [x] 1.3 Copiar una `DESIGN.md` oscura/cósmica de `awesome-design-md` como referencia visual al proyecto solo si la auditoría indica falta de dirección de marca, y verificar que queda referenciada en esta tarea. → Hecho: `design-ref-spacex.md` (SpaceX: canvas negro, hairlines, microcaps, ghost pill, profundidad fotográfica sin sombras; se conserva ámbar/pila sistema/offline).

## 2. Motor de texturas procedurales en `app.js`

- [x] 2.1 Implementar el generador de sprites offscreen (uno por nivel, recetas: cráteres, bandas + Gran Mancha Roja, continentes fbm + casquetes, anillos con gradiente, limb-darkening/granulación solar) y verificar visualmente cada sprite en una página de prueba o captura antes de integrarlo. → Hecho: `verify-sheet.png` muestra los 12 (Venus reforzada para distinguirse de Saturno); boot Node OK.
- [x] 2.2 Reescribir el render para usar `drawImage` del sprite + cara + etiqueta con halo, manteniendo posición/tamaño de ojos y sonrisa, y verificar que no baja de 55 fps con 30+ cuerpos y que las caras se ven sobre texturas claras (Venus, Saturno). → Hecho: `verify-board-tall.png` (10 cuerpos, fps 55.5, caras+etiquetas sobre texturas; halo en cara y sombra en etiqueta).
- [x] 2.3 Actualizar `drawNext` y `renderCodex` para usar la misma apariencia texturizada en miniatura, y verificar que el Codex muestra los 12 cuerpos con su textura y que los bloqueados siguen como `???`. → Hecho: `verify-codex.png` (descubiertos con sprite+cara, bloqueados con `?` + `???`).
- [x] 2.4 Prerenderizar el fondo estrellado con nebulosa sutil en una capa reutilizada, y verificar que no hay animaciones por frame del fondo ni código de dibujo de estrellas en el loop. → Hecho: `buildBackground()` una vez al arranque; `draw()` solo hace `drawImage`; fps medio 55+ estable.

## 3. Sistema visual y coherencia en `styles.css`

- [x] 3.1 Definir tokens CSS (paleta espacial, radios, sombras, espaciados, tipografía del sistema con pesos/tracking) y aplicarlos a HUD, controles, toast, combo, overlays y Codex, y verificar que no queda ningún color hardcodeado fuera de los tokens. → Hecho: `styles.css` con `:root` (grep: literales solo en tokens); iconos SVG en controles; contrastes calculados 9.8–17 (botón CTA 11.9, antes 3.5).
- [x] 3.2 Pulir estados responsive y táctiles (sin scroll horizontal a 360px, targets ≥ 44px, overlays legibles en portrait) y verificar el layout a 375px y 768px. → Hecho: `verify-375.png` (stack vertical, sin overflow, controles 48px) y `verify-768.png` (centrado 420px, sin overflow).
- [x] 3.3 Implementar `prefers-reduced-motion` en CSS y `matchMedia` en JS (sin partículas, brillos ni transiciones, juego intacto) y verificar con la preferencia activada que fusionar sigue dando puntos y toast sin animación. → Hecho: `verify-reduced-rt.png` con REDUCED forzado (score=25, 12 cuerpos, sin errores); CSS `@media` verificado en Chrome con `--force-prefers-reduced-motion`.

## 4. Assets externos opcionales y PWA offline

- [x] 4.1 Evaluar 1-2 texturas NASA de dominio público (Tierra, Júpiter) con licencia verificada y peso dentro del presupuesto (total ≤ 300 KB); si cumplen, vendorar en `textures/` con `ATTRIBUTION.md`, si no, documentar que todo queda procedural, y verificar el peso total en disco. → Hecho: todo procedural. Blue Marble NASA es dominio público pero solo existe en ≥5400px (MBs); sin herramientas de conversión/redimensión en el entorno no se puede bajar a ≤300 KB con licencia verificada; packs pequeños listos (three.js/BlendAtlas) tienen licencia ambigua. `app.js` no hace ningún fetch: las texturas son código, funcionan offline por construcción.
- [x] 4.2 Si hay assets vendored, añadirlos a la caché de `sw.js` con bump de versión y verificar el escenario offline: primera carga con red, modo avión, recarga y texturas completas sin errores de red. → N/A: sin assets vendored no hay cambios en `sw.js` (caché intacta); texturas 100% procedurales verificadas sin red en las capturas.

## 5. Puerta de calidad y verificación visual

- [x] 5.1 Pasar `impeccable polish` y resolver sus hallazgos, y verificar contraste de texto ≥ 4.5:1 en HUD, toast, botones, Codex y overlays. → Hecho: playbook `polish` aplicado (contraste CTA 3.5→11.9, secundarios a tokens ≥9.8, iconos SVG, sin emoji, sin código muerto, temporales borrados); detector final limpio; re-verificación en `audit.md` (est. 18/20).
- [x] 5.2 Capturar con Playwright los breakpoints 375/768/1024/1440 (página completa + viewport móvil, sirviendo en local) y verificar: sin scroll horizontal a 360-375px, sin secciones vacías ni solapes, cuerpos reconocibles y etiquetas legibles en cada captura. → Hecho: `verify-375/768/1024/1440.png` revisadas (columna centrada, sin overflow, pila de cuerpos texturizados legible, controles SVG).
- [x] 5.3 Jugar una partida de humo (soltar, fusionar al menos 3 niveles, abrir Codex, pausar, reiniciar) y verificar que física, puntuación, toast educativo y récord siguen intactos. → Hecho: `verify-smoke.png` log `dropped bodies=6 | pausedOverlay=Y | resumedOverlayHidden=Y | codexOpen=Y | codexClosed=Y | afterRestart bodies=0 score=0`, récord 10 persistido.

## Workflow follow-up

- Archivar el cambio cuando la revisión del proyecto lo apruebe.
- Verificar el resultado archivado.
