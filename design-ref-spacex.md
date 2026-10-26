# DESIGN.md de referencia — SpaceX (awesome-design-md)

> Fuente: `VoltAgent/awesome-design-md`, vía `https://getdesign.md/spacex/design-md`
> (fichero original: `design-md/spacex/DESIGN.md`). Análisis independiente de
> patrones observables, sin afiliación con SpaceX. Se usa SOLO como referencia
> visual para la dirección "negro espacial + fotografía a sangre + mayúsculas
> técnicas" de este change (`mejora-visual-texturas`). La identidad incumbente
> del juego (navy espacial + ámbar `#ffd166` + colores de planetas + caras kawaii)
> se conserva; de aquí se toman prestados: canvas negro profundo, hairlines
> sutiles, microtexto en mayúsculas con tracking positivo, botones ghost pill y
> la regla de "profundidad fotográfica, sin sombras CSS".

---
version: alpha
name: Spacex-Inspired-design-analysis
description: An inspired interpretation of Spasex's design language — a mission-oriented aerospace brand built on pure black canvas, full-bleed photographic and video heroes of rockets and Mars landscapes, and uppercase D-DIN display type set in tight vertical leading. UI chrome is intentionally minimal a single ghost outlined pill button per band, all-caps eyebrow microtext, and a fixed top nav over photography. The system is unapologetically austere — black, white, and the imagery itself.

colors:
  primary: "#000000"
  ink: "#000000"
  on-primary: "#ffffff"
  on-primary-mute: "#f0f0fa"
  canvas-night: "#000000"
  canvas-night-soft: "#0a0a0a"
  canvas-light: "#ffffff"
  canvas-cool: "#f0f0fa"
  hairline-on-dark: "#3a3a3f"
  hairline-on-light: "#e0e0e8"
  link-on-dark: "#ffffff"
  ink-mute: "#5a5a5f"

typography:
  display-xxl:
    fontFamily: "D-DIN-Bold, Arial Narrow, Arial, Verdana, sans-serif"
    fontSize: 80px
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: 1.6px
  body-md:
    fontFamily: "D-DIN, Arial, Verdana, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.32px
  button-cap:
    fontFamily: "D-DIN, Arial, Verdana, sans-serif"
    fontSize: 13.008px
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: 1.17px
  micro-cap:
    fontFamily: "D-DIN, Arial, Verdana, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 2.0
    letterSpacing: 0.96px
  caption:
    fontFamily: "D-DIN, Arial, Verdana, sans-serif"
    fontSize: 13.008px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 8px
  md: 16px
  pill: 32px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 18px
  xl: 24px
  xxl: 32px
  huge: 48px
---

## Préstamos aplicables al juego (lectura guiada)

- **Canvas negro profundo + hairlines**: el cuenco ya es navy (`#0d1230`); llevar el
  fondo de página hacia negro puro y los bordes a hairline sutil da aire "espacial".
- **Microtexto en mayúsculas con tracking**: ya existe (`.hud-label`); subir su
  contraste lo convierte en firma en vez de deuda.
- **Ghost pill**: los botones de control pueden pasar de relleno plano a ghost con
  borde hairline + texto en mayúsculas, manteniendo el ámbar `#ffd166` como acento
  de misión (aquí SÍ hay color de acento, a diferencia de SpaceX: el ámbar es
  identidad incumbente del juego y se conserva).
- **Profundidad fotográfica, sin sombras CSS**: las texturas de los planetas y el
  fondo estrellado aportan la profundidad; nada de `box-shadow`/glows.
- **Qué NO se toma**: D-DIN externa (offline y cero dependencias mandan; se usa la
  pila del sistema con tracking), display a 80px (escala de juego móvil), ni la
  regla "sin color de acento".
