# github-pages-hosting Specification

## Purpose

Publica el juego como sitio estático en GitHub Pages para que sea jugable e instalable desde una URL pública estable con HTTPS y redespliegue automático.

## Requirements

### Requirement: Juego accesible en URL pública HTTPS
El sistema SHALL servir el juego completo en la URL pública de GitHub Pages del repositorio (`https://rafaeldavidgg.github.io/suika-planetas/`).

#### Scenario: Carga del juego en la URL pública
- **WHEN** un visitante abre la URL pública de Pages
- **THEN** la página carga sin errores, el cuenco y el HUD son visibles y una partida puede iniciarse

#### Scenario: Assets vendorizados disponibles
- **WHEN** el juego arranca en la URL pública
- **THEN** la física (Matter.js vendorizado), estilos, iconos y manifiesto cargan desde el mismo origen sin errores 404

### Requirement: Redespliegue automático desde la rama principal
El sistema SHALL redesplegar el sitio automáticamente cuando se actualice la rama `main`, de modo que la URL pública refleje el último estado sin pasos manuales.

#### Scenario: Push a main actualiza el sitio
- **WHEN** se fusiona un cambio en `main` y finaliza el despliegue de Pages
- **THEN** la URL pública sirve el contenido actualizado en pocos minutos sin intervención manual

### Requirement: Funcionamiento bajo el subpath de Project Pages
El sistema SHALL funcionar íntegramente bajo el subpath `/suika-planetas/`, incluyendo resolución de assets, registro del Service Worker y alcance offline de la PWA.

#### Scenario: Sin rutas absolutas a la raíz del dominio
- **WHEN** el sitio se sirve bajo `/suika-planetas/`
- **THEN** todos los assets, el manifiesto y el Service Worker se resuelven con rutas relativas al subpath y no hay peticiones a la raíz del dominio

#### Scenario: Offline operativo bajo el scope de Pages
- **WHEN** el usuario carga una vez la URL pública con red y luego recarga sin red
- **THEN** el juego arranca y es jugable desde la caché del Service Worker con alcance al subpath
