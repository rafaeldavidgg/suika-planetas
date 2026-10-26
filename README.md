# Órbitas — Suika de planetas

Juego web estilo Suika (suelta piezas, fusiona iguales para crear la siguiente mayor) con tema de planetas y toque educativo: cada fusión enseña qué cuerpo es más grande que otro. 100% cliente, mobile-first e instalable como PWA.

## Jugar online

Juega en **https://rafaeldavidgg.github.io/suika-planetas/** (HTTPS, instalable y offline tras la primera carga).

Despliegue: GitHub Pages sirve la rama `main` (carpeta `/`, raíz) con redespliegue automático en cada push.

## Jugar en local

Abre `index.html` en el navegador, o sirve la carpeta en local:

```bash
python -m http.server 8099
# http://localhost:8099/index.html
```

Arrastra arriba para apuntar y suelta para dejar caer el cuerpo. Dos cuerpos iguales al tocarse se fusionan en el siguiente nivel. Pierdes si algo queda por encima de la línea superior más de 2,5 s.

## Cadena de evolución

Meteorito → Deimos → Luna → Mercurio → Marte → Venus → Tierra → Neptuno → Urano → Saturno → Júpiter (+ Sol bonus al unir 2 Júpiter).

Los tamaños en pantalla están comprimidos para que sea jugable; el orden y los diámetros reales (mostrados en cada fusión y en el Codex) son los de verdad.

## PWA

Incluye `manifest.json` + `sw.js` (cache-first): tras la primera carga con red funciona offline y se puede instalar desde el navegador.

## Técnica

- Sin build ni framework: HTML + CSS + JS vanilla
- Física 2D con Matter.js (vendorizado en `vendor/`, funciona offline)
- Render Canvas propio, audio sintetizado con WebAudio
- Récord, Codex y silencio en `localStorage` (sin servidor)

```
index.html  shell + HUD + overlays
styles.css  layout mobile-first portrait
app.js      juego: física, merges, score, codex, audio, PWA
manifest.json / sw.js / icons/  PWA instalable offline
vendor/     Matter.js local
openspec/   specs y planning del proyecto
```
