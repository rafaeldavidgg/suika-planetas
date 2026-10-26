# Design

## Context

Ver `proposal.md` (Why) y `specs/github-pages-hosting/spec.md` (requisitos). Estado actual verificado en el repo:

- Sitio 100% estático sin build: `index.html`, `styles.css`, `app.js`, `manifest.json`, `sw.js`, `icons/`, `vendor/matter.min.js`. Sin backend ni variables de entorno.
- Todas las referencias son relativas (`href="manifest.json"`, `src="vendor/matter.min.js"`, `start_url: "./index.html"`, `scope: "./"`, `ASSETS` con `./...`), por lo que el subpath `/suika-planetas/` de Project Pages no rompe nada en principio.
- Remoto `origin = https://github.com/rafaeldavidgg/suika-planetas.git`, rama `main` limpia y sincronizada con `origin/main`. Repo público.
- Sin workflow de CI ni `gh-pages` branch actualmente.

## Goals / Non-Goals

**Goals:**

- URL pública estable con HTTPS y despliegue automático desde `main`.
- Cero cambios en el juego salvo que la verificación bajo subruta demuestre lo contrario.
- PWA instalable y offline operativa bajo el scope de Pages.

**Non-Goals:**

- Dominio personalizado, analytics, previews por PR, entornos múltiples.
- Cambios de gameplay, visuales o Codex.

## Decisions

### 1. Fuente de despliegue: Pages desde rama `main` + `/(root)`

- **Decisión**: activar en Settings → Pages → *Deploy from a branch*, rama `main`, carpeta `/(root)`.
- **Por qué**: el sitio no tiene build; publicar la raíz evita añadir archivos (sin workflow YAML, sin `gh-pages` branch, sin artefactos). Es la ruta con menos piezas móviles.
- **Alternativa considerada**: GitHub Actions (`upload-pages-artifact` + `deploy-pages`). Más control y logs visibles, pero añade `.github/workflows/*.yml` sin beneficio para un estático sin build. Reservar como plan B si el despliegue por rama falla o se quiere historial de deploys.

### 2. Sin cambios de código a priori; verificación como puerta

- **Decisión**: no tocar `sw.js`/`manifest.json`/`index.html` salvo hallazgo en la verificación (p. ej. un 404 o scope inesperado del SW bajo el subpath).
- **Por qué**: inspección estática muestra rutas relativas en todos los puntos de acoplamiento al origen. Cambiar por precaución añadiría riesgo sin evidencia.
- **Alternativa considerada**: reescribir preventivamente a rutas absolutas con base — rechazada, rompería el uso local por `file://` y servidor simple.

### 3. `README.md` como única edición de contenido

- **Decisión**: añadir sección "Jugar online" con la URL pública y una línea sobre el mecanismo (Pages desde `main`).
- **Por qué**: es el contrato visible de dónde se sirve el juego y evita que la URL viva solo en Settings.

## Risks / Trade-offs

- [Riesgo] Primer despliegue tarda minutos y el certificado HTTPS puede demorar → Mitigación: reintentar tras 5–10 min antes de diagnosticar; documentar la espera en tasks.
- [Riesgo] Caché del SW (`orbitas-v2`) sirve versión vieja tras el deploy → Mitigación: el SW ya versiona el caché; si se edita un asset cacheado en el futuro, subir la versión del caché.
- [Riesgo] Repo privado requeriría plan de pago para Pages → Mitigación: no aplica (repo público), registrado como supuesto.
- [Riesgo] `localStorage` (récord/mute/codex) es por origen: el récord local no migra a la URL pública → Mitigación: comportamiento esperado; no requiere acción, solo no prometer migración.

## Migration Plan

1. Activar Pages (Settings → Pages → rama `main`, `/(root)`).
2. Esperar el deploy, abrir la URL pública y ejecutar la verificación (carga, consola sin 404, SW registrado con scope al subpath, manifiesto válido, partida jugable, offline tras primera carga).
3. Si la verificación falla por subruta, aplicar el ajuste mínimo (p. ej. ruta del SW) y re-verificar.
4. Commit de `README.md` con la URL (dispara redespliegue automático).
5. Rollback: desactivar Pages en Settings o revertir el commit de docs; el juego local sigue intacto en todo caso.

## Open Questions

Ninguna que bloquee el plan. Supuestos registrados: repo público, el solicitante (o alguien con admin) puede activar Pages, y basta la URL `github.io` sin dominio propio.
