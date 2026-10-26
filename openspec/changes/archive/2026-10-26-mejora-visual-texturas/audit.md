# Auditoría visual — Órbitas (`mejora-visual-texturas`)

Fecha: 2026-10-26 · Herramienta: `impeccable audit`/`detect` 4.7.0 + revisión manual.
Comando detector: `impeccable detect --json index.html styles.css app.js` y scan
renderizado de `http://127.0.0.1:8099/index.html` a 390x844 (sin hallazgos en render).

## Health Score

| # | Dimensión | Nota | Hallazgo clave |
|---|-----------|------|----------------|
| 1 | Accessibility | 2/4 | Blanco sobre `#3a86ff` = 3.5:1 (verificado por detector ×3, botones `.card button`); textos a opacidad .6–.7; sin `prefers-reduced-motion` |
| 2 | Performance | 3/4 | Gradiente radial por cuerpo y frame en `circleArt`; DPR capado a 2 (bien); sin layout thrash |
| 3 | Theming | 0/4 | Cero tokens: todos los colores hardcodeados en `styles.css` y `app.js` |
| 4 | Responsive | 3/4 | Mobile-first correcto, targets ≥44px, `touch-action:none` + Pointer Events; desktop solo centra a 420px (aceptable) |
| **Total** | | **11/20** | **Acceptable** — trabajo significativo necesario, sin bloqueos |

## Findings

- **[P1] Bajo contraste en CTA** — `styles.css:24` `.card button` blanco sobre `#3a86ff` (3.5:1 < 4.5:1). Categoría: Accessibility (WCAG 1.4.3). Fix con `polish`: oscurecer el fondo o engrosar/agrandar texto.
- **[P1] Texto secundario tenue** — `.hud-label` 11px a opacidad .7 (`styles.css:6`), `footer` a .6, `.disclaimer` a .8. No llegan a 4.5:1 sobre navy. Fix: subir opacidad/peso, mantener mayúsculas+tracking como firma (ref. SpaceX).
- **[P1] Sin alternativa a movimiento** — no existe `prefers-reduced-motion` en CSS ni JS; partículas y transiciones siempre activas. La spec nueva lo exige. Fix en tarea 3.3.
- **[P1] Planitud de planetas** — `app.js:247-286` `circleArt`: degradado de 2 paradas + 2-3 detalles geométricos; Júpiter/Saturno/Urano/Neptuno solo se distinguen por color y anillos genéricos. Es el núcleo del change (tareas 2.1–2.3).
- **[P2] Sin tokens** — ~15 colores hardcodeados repartidos entre CSS y JS; cualquier cambio de marca exige cazar valores. Fix en tarea 3.1.
- **[P2] Fondo plano** — `#game` usa un radial de 2 paradas que a 640px se ve como degradado liso; overlays con `rgba(4,6,18,.72)` sin firma. Fix en 2.4/3.1.
- **[P3] Controles genéricos** — botones `#controls` de relleno plano indistinguibles de cualquier app; oportunidad ghost-pill + ámbar de misión.

## Positivo (mantener)

- Canvas con `aria-label`, overlays con `role`, toast con `role="status"`; PWA offline real con Matter vendored; entrada unificada Pointer Events; enfriamiento de suelta y línea de game-over con progreso.

## Acciones recomendadas

1. [P1] `polish` tras implementar texturas+tokens (contraste, remates).
2. Referencia `design-ref-spacex.md` ya copiada al proyecto como dirección visual.
3. Re-ejecutar `audit` tras los fixes para ver la subida de nota.

> Re-run `/impeccable audit` after fixes to see your score improve.

## Re-verificación (tras implementar, 2026-10-26)

- Detector `impeccable detect` sobre `index.html`+`styles.css`+`app.js`: **0 hallazgos** (el contraste 3.5:1 desapareció).
- Contrastes calculados por pares: 9.8–17 (mínimo exigido 4.5).
- `prefers-reduced-motion` en CSS + gate en `burst()`; verificado con partida forzada (score=25, sin errores).
- Tokens: grep confirma literales de color solo en `:root`.
- Breakpoints capturados: 375 / 768 / 1024 / 1440 sin overflow, cuerpos reconocibles y etiquetas legibles.
- Estimación: A11y 4, Performance 4, Theming 3, Responsive 3, Integridad 4 → **18/20 Excellent**.
