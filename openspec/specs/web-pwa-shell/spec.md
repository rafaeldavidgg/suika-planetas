# web-pwa-shell Specification

## Purpose

Garantiza que el juego sea usable primero en móvil, funcione offline e instalable como PWA, con controles táctiles simples y persistencia local sin servidor.

## Requirements

### Requirement: Layout mobile-first portrait
El sistema SHALL presentar el cuenco y HUD utilizables en viewport vertical de 360px de ancho sin scroll horizontal y con área táctil mínima adecuada.

#### Scenario: Sin scroll en móvil
- **WHEN** se abre el juego en un móvil portrait de 360x740
- **THEN** cuenco, puntuación y siguiente son visibles sin desplazamiento horizontal y el dropper es arrastrable con el pulgar

### Requirement: Entrada táctil y ratón
El sistema SHALL soportar mover con drag/movimiento y soltar al levantar, tanto táctil como ratón.

#### Scenario: Ciclo táctil completo
- **WHEN** el usuario arrastra sobre la zona superior y levanta el dedo
- **THEN** el cuerpo se suelta en la X final

#### Scenario: Equivalencia con ratón
- **WHEN** el usuario mueve el ratón y hace clic
- **THEN** ocurre el mismo mover y soltar que en táctil

### Requirement: PWA instalable y offline
El sistema SHALL ser instalable (manifiesto + iconos) y jugable sin red tras la primera carga mediante caché del shell y assets; las texturas de los cuerpos son procedurales generadas en runtime y no requieren assets de red.

#### Scenario: Juego offline tras primera visita
- **WHEN** el usuario carga una vez con red, luego activa modo avión y recarga
- **THEN** el juego arranca y es jugable sin errores de red

#### Scenario: Criterio instalable
- **WHEN** se audita el manifiesto
- **THEN** existe nombre, short_name, display standalone, theme/background color e iconos 192 y 512 con fondo transparente (propósito any)

#### Scenario: Texturas disponibles sin red
- **WHEN** el usuario juega en modo avión tras la primera carga con red
- **THEN** todos los cuerpos muestran sus texturas completas sin huecos ni sustituciones planas, porque se generan proceduralmente en el dispositivo sin descargas

### Requirement: Audio conmutable
El sistema SHALL emitir un pop al fusionar con tono más agudo/grave según nivel y permitir silenciar con persistencia.

#### Scenario: Mute persistente
- **WHEN** el usuario silencia, recarga y fusiona
- **THEN** no suena ningún efecto y el estado mute sigue activo

### Requirement: Best score y pausa local
El sistema SHALL guardar el récord en el dispositivo, permitir pausar/congelar la física y reiniciar en una acción.

#### Scenario: Récord sobrevive recarga
- **WHEN** el usuario supera su récord y recarga
- **THEN** el nuevo récord sigue mostrado

#### Scenario: Pausa congela
- **WHEN** el usuario pausa
- **THEN** la simulación se detiene y al reanudar continúa sin saltos

#### Scenario: Reinicio en 1 tap
- **WHEN** el usuario pulsa reiniciar desde game over o pausa
- **THEN** el cuenco queda vacío, score a cero y nuevo actual+siguiente generados
