# Tasks

## 1. Scaffold web estático

- [x] 1.1 Crear `index.html` + CSS portrait mobile-first (cuenco, HUD score/best/next) y verificar que abre sin scroll horizontal a 360px
- [x] 1.2 Añadir Matter.js (npm o CDN con fallback local) y verificar que `Matter.Engine.create()` corre sin errores en consola
- [x] 1.3 Definir tabla `PLANETS` (11+Sol: nombre, diámetro real, tipo, curiosidad, radio jugable, color) y verificar que el orden es creciente y solo 0-4 son dropeables

## 2. Gameplay core

- [x] 2.1 Implementar mundo Matter (gravedad, paredes+suelo, dropper con clamp y cooldown 500ms) y verificar que 20 drops caen y reposan sin atravesar paredes
- [x] 2.2 Implementar fusión por `collisionStart` (mismo nivel → N+1 en punto medio + puntos, Júpiter+Júpiter → Sol bonus) y verificar con drops forzados que crea el nivel correcto y suma puntos crecientes
- [x] 2.3 Implementar score + combo (puntos por nivel, contador x2/x3 en <2s) y verificar que el total y el combo se muestran al encadenar fusiones
- [x] 2.4 Implementar game-over con línea + gracia 2.5s (solo cuerpos en reposo cuentan, reentrada reinicia, barra visible) y verificar que toque momentáneo no mata y permanencia sí congela con pantalla Game Over

## 3. Render, input y audio

- [x] 3.1 Dibujar en Canvas 2D cuerpos procedurales (gradiente + detalle por tipo, Saturno con anillos solo visuales) y verificar que cada nivel se ve estrictamente mayor que el anterior
- [x] 3.2 Soportar input drag/lift táctil y mover/clic ratón con misma lógica y verificar en emulación móvil y desktop que soltar coloca en la X final
- [x] 3.3 Sintetizar pops WebAudio con pitch por nivel + botón mute persistente y verificar que en mute no suena tras recarga

## 4. Codex educativo

- [x] 4.1 Mostrar toast con nombre + diámetro + tipo en cada fusión (2s, no bloqueante) y verificar que aparece con datos correctos del nivel creado
- [x] 4.2 Implementar Codex (11+Sol, descubierto/pendiente, ayuda con disclaimer "tamaños adaptados, orden y datos reales") con `localStorage codex:v1` y verificar que el desbloqueo sobrevive a recarga

## 5. PWA, persistencia e integración

- [x] 5.1 Guardar `best` en localStorage, pausa que congela/reanuda sin saltos y restart en 1 tap y verificar récord, pausa y reinicio en una sesión
- [x] 5.2 Añadir `manifest.json` (standalone, iconos 192/512 enmascarables) + `sw.js` cache-first y verificar que tras primera carga con red el juego arranca jugable en modo avión
- [x] 5.3 Pasar auditoría manual: jugar 5 min en móvil portrait, forzar merges hasta Tierra+, comprobar 60fps aprox, sin errores de consola y Lighthouse PWA en verde
