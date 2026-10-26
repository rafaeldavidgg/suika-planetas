# Design

## Context

Estado actual: `app.js` dibuja cada cuerpo en cada frame con `circleArt` (degradado radial plano + 2-3 detalles geométricos + cara + etiqueta). `styles.css` usa colores hardcodeados sin tokens, fondo con degradado simple, overlays con estilos mínimos. Restricciones: sin build ni dependencias nuevas (Matter.js vendored), PWA offline con `sw.js` cache-first, canvas 400x640 con DPR máx. 2, 60 fps en móvil, caras kawaii y etiquetas conservadas (decisión de usuario). Ver `proposal.md` para motivación y `specs/` para requisitos.

Router de diseño (`design-router`, lista verificada el 2026-10-26: impeccable, awesome-design-md, ui-ux-pro-max, diagram-design): la tarea es clase B (mejora de UI existente) → herramienta `impeccable` en modo audit-first (`audit`/`critique` → `polish`), sin `init` para no romper identidad. No hay brief de sistema de diseño desde cero (no aplica `ui-ux-pro-max`); si falta dirección de marca se toma una `DESIGN.md` oscura/cósmica de `awesome-design-md` como referencia visual. Cierre con gate Playwright + contraste + movimiento reducido.

## Goals / Non-Goals

**Goals:** texturas reconocibles por nivel manteniendo caras; sprites prerenderizados sin perder 60 fps; tokens CSS y coherencia HUD/overlays/Codex; offline total; verificación visual automatizada.

**Non-Goals:** cambiar física, fusiones, puntuación o persistencia; añadir frameworks, fuentes web externas o dependencias de runtime; rediseñar el layout o el flujo de juego; modo multijugador o nuevos niveles.

## Decisions

- **Texturas procedurales en Canvas como base (no imágenes generadas por IA).** En este entorno no hay modelo de generación de imágenes disponible; además lo procedural garantiza peso cero en red, cero riesgo de licencia y coherencia con el estilo cartoon+realista. Alternativa considerada: descargar texturas NASA (dominio público) y vendorarlas — solo se evalúa en apply para 1-2 cuerpos (Tierra, Júpiter) si cada asset pesa poco (presupuesto total ≤ 300 KB, formatos WebP/PNG) y con licencia verificada + `ATTRIBUTION.md`; si no cumple, todo procedural. Referencias NASA se usan como guía visual aunque no se vendore nada.
- **Prerender a sprites offscreen en el arranque, uno por nivel y DPR.** `circleArt` por frame pasa de pintar N formas a `drawImage` del sprite + cara + anillo de Saturno. Alternativa (pintar textura cada frame) se descarta por coste en móviles con muchos cuerpos. Los sprites se generan con recetas por nivel: ruido de cráteres (Meteorito, Luna, Mercurio, Deimos), bandas sinusoidales + Gran Mancha Roja (Júpiter), bandas suaves + anillos con gradiente (Saturno), continentes fbm + casquetes (Tierra), casquete + cañones (Marte), remolinos (Venus, Neptuno, Urano), limb-darkening y granulación (Sol). Detalle escalado al radio: niveles pequeños reciben variación gruesa, no ruido fino que se vuelve barro.
- **Caras y etiquetas como capa posterior fija.** Se dibujan después de la textura con contorno oscuro y halo claro bajo el texto; en texturas claras (Venus, Saturno) la cara lleva placa de contraste sutil. Así la decisión de usuario "realista + caras" no depende del fondo.
- **Tokens CSS con custom properties, sin fuentes externas.** Paleta: navy espacial profundo, violeta cuenco, ámbar `#ffd166` (ya es acento del juego) + un cian estrella; radios, sombras y espaciados centralizados. Se mantiene la pila del sistema (garantía offline y cero dependencias) diferenciada con pesos, tracking y mayúsculas en HUD en vez de una display font.
- **Fondo estrellado estático prerenderizado.** Una capa offscreen con estrellas (densidades distintas) + nebulosa radial muy sutil, dibujada una vez y reutilizada; parallax leve solo sin `prefers-reduced-motion`. Alternativa (fondo animado con twinkle por frame) descartada por batería y distracción.
- **Movimiento reducido y contraste como requisitos, no adornos.** `matchMedia('(prefers-reduced-motion: reduce)')` desactiva partículas, brillos y transiciones; el toast usa opacidad instantánea. Contraste auditado a 4.5:1 en todos los textos.

## Risks / Trade-offs

- [Riesgo] Ruido procedural ilegible en radios pequeños (Deimos r=14) → Mitigación: recetas con escala mínima de detalle por nivel y revisión en captura 375px.
- [Riesgo] Cara o etiqueta ilegible sobre textura clara → Mitigación: halo/placa de contraste y captura de verificación por nivel.
- [Riesgo] Olvidar versionar `sw.js` si se añaden assets vendored → Mitigación: tarea explícita de bump de caché + prueba offline en tasks.
- [Riesgo] Textura NASA con licencia o peso inadecuado → Mitigación: criterio de aceptación (dominio público verificado, ≤ 300 KB total); fallback procedural ya contemplado.
- [Trade-off] Realismo frente a identidad kawaii: se prioriza que cada cuerpo sea reconocible a golpe de vista sobre el fotorrealismo.
