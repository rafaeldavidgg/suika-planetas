# Proposal

## Why

No existe en esta carpeta ningún juego web. Se quiere un juego estilo Suika (cuenco, soltar piezas, fusionar iguales para crear la siguiente mayor) con tema propio de planetas, 100% en navegador, mobile-first e instalable como PWA, que además enseñe de forma lúdica qué cuerpos son más grandes que otros.

## What Changes

- Juego web jugable a pantalla completa vertical: mover dropper arriba, soltar cuerpo, física de caída/colisión, fusión de dos iguales en el siguiente nivel, puntuación, preview del siguiente, game-over por desbordamiento con línea superior y temporizador de gracia.
- Cadena de evolución mixta de 11 niveles (asteroide/polvo → lunas pequeñas → planetas rocosos → gigantes → Júpiter, bonus Sol al fusionar 2 Júpiter). Radios comprimidos para jugabilidad, orden por tamaño real preservado, colisionadores siempre circulares (anillos de Saturno solo visuales).
- Capa educativa: cada fusión muestra nombre + diámetro real + tipo, y desbloquea entrada en un Codex/colección persistente (localStorage) con disclaimer "tamaños adaptados, orden y datos reales".
- Shell web mobile-first + PWA: layout portrait ≤420px, controles táctiles (drag = mover, lift = soltar) + ratón, Canvas 2D + Matter.js, sonidos WebAudio con pitch por nivel, best score local, mute, pausa, restart en 1 tap, `manifest.json` + iconos + service worker cache-first offline.
- Sin backend: todo cliente, un desplegable estático.

## Capabilities

### New Capabilities

- `planet-merge-gameplay`: bucle core drop/física/merge/score/game-over, cadena de 11 + bonus, radios jugables, cooldown, combos, estados.
- `planet-codex`: datos educativos por cuerpo (nombre, diámetro real, tipo, curiosidad), toast en merge, Codex persistente y disclaimer de escala.
- `web-pwa-shell`: layout mobile-first, input táctil/ratón, render Canvas, audio, persistencia local, PWA instalable offline.

### Modified Capabilities

- Ninguna (proyecto greenfield, `openspec/specs/` vacío).

## Impact

- Nuevo código estático web (`index.html`, JS/TS, CSS, `manifest.json`, `sw.js`, assets generados proceduralmente). Sin APIs ni dependencias de servidor.
- Dependencia runtime CDN/npm: Matter.js. Sin framework obligatorio.
- Riesgo principal: tuning físico (fricción, restitución, densidades, radios) y temporizador de game-over para que sea justo en móvil.
