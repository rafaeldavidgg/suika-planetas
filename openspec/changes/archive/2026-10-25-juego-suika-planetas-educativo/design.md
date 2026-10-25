# Design

## Context

Proyecto greenfield: `C:\workspace\juego` vacío salvo `openspec/` y `.opencode/`. Sin código, sin specs previas. Ver `proposal.md` para el porqué. Restricciones acordadas: todo cliente estático, mobile-first portrait, PWA offline, colisionadores circulares, radios comprimidos con orden real preservado.

## Goals / Non-Goals

**Goals:**
- Un HTML jugable con loop Suika estable a 60fps en móvil medio.
- Cadena mixta 11+Sol con datos reales y Codex local.
- PWA instalable con primera carga online y resto offline.
- Tuning documentado (radios, densidades, gracia) reproducible.

**Non-Goals:**
- Sin backend, cuentas, ranking online ni multi.
- Sin formas poligonales (nigiri alargado etc.); anillos de Saturno solo visuales.
- Sin motor 3D ni framework SPA; sin tienda ni monetización.

## Decisions

1. **Matter.js para física 2D + Canvas 2D propio para render.**
   Rationale: solo círculos, `collisionStart` para merges, barato en móvil, MIT.
   Alternativas: Planck.js (API más verbosa), Rapier WASM (overkill + peso), Phaser 3 (trae Matter dentro pero añade peso/ciclo si solo queremos un minijuego), física a mano (inestable, no hacer).
2. **Vanilla JS/TS en un solo bundle sin framework.**
   Rationale: menos peso, menos superficie PWA, despliegue estático trivial. Alternativa React/Vite solo si el Codex crece a pantallas complejas; no compensa ahora.
3. **Colisionador = círculo siempre; sprite = círculo con arte procedural.**
   Rationale: evita enganches/puentes de polígonos y mantiene merge en punto medio trivial. Saturno dibuja anillos fuera del collider. Procedural (gradientes + cráteres/bandas) evita assets con copyright.
4. **Radios comprimidos geométricos, no lineales ni reales.**
   Rationale: escala real injugable (Sol 109x Tierra). Progresión p.ej. `r(N)=base*k^N` ajustada para que Júpiter ≈ 35-40% del ancho del cuenco. Orden monótono preservado; datos reales solo en texto/Codex + disclaimer.
5. **Estados: `ready → falling → merging → gameover`, con `sleeping` de Matter para game-over-line.**
   Dropper con cooldown 500ms, preview current+next limitados a niveles 0-4. Game-over: muestreo cada frame de cuerpos en reposo sobre línea + temporizador 2.5s con barra visible; cualquier reentrada lo reinicia.
6. **PWA cache-first para shell (`index.html`, JS, CSS, iconos, audio sintético) + `manifest.json` standalone.**
   Rationale: instalable y offline sin servidor. Service worker versionado simple, sin push. iOS: documentar Añadir a inicio (sin prompt programable).
7. **Audio WebAudio sintetizado, pitch por nivel, mute en localStorage.**
   Rationale: cero assets, pop con oscilador + envolvente; frecuencia p.ej. `220*2^(N/12)`.
8. **Persistencia solo localStorage (`best`, `codex:v1`, `mute`).**
   Sin IndexedDB: datos triviales.

## Risks / Trade-offs

- [Tuning físico frágil] Restitución/fricción/densidad distintas por tamaño pueden causar rebotes eternos o pilas gelatinosas → Mitigación: set único por defecto + tabla de radios/densidades versionada y escena de prueba con drops scripted.
- [Merge dentro de pared] Spawn de N+1 solapando otro cuerpo/pared → Mitigación: resolver en punto medio con pequeño offset vertical + 1 paso de corrección; si solapa, empujar radialmente antes de añadir.
- [Game-over injusto] Pop que expulsa un cuerpo por encima de la línea → Mitigación: gracia 2.5s + requerir reposo (velocidad < umbral) + indicador visual parpadeante.
- [Rendimiento móvil] Muchos cuerpos + partículas → Mitigación: cap de partículas, `pixelRatio` limitado a 2, sleep de Matter, sin sombras costosas.
- [Misconcepción educativa] Visual no a escala puede enseñar mal → Mitigación: disclaimer + diámetro real siempre visible en toast y Codex.

## Migration Plan

Despliegue estático (GitHub Pages / Netlify / Vercel static): subir `index.html`, bundle, `manifest.json`, `sw.js`, `icons/`. Rollback = revertir a tag anterior. Sin migraciones de datos salvo versionar clave `codex:v1`.

## Open Questions

- Curiosidades finales por cuerpo (1 línea cada una) — redactar sin copiar de Wikipedia.
- Valor exacto de puntos por nivel (triangular vs custom) — fijar en implementación y dejar tabla en README.
- Paleta final planetas daltónica-safe — validar contraste en móvil con sol.
