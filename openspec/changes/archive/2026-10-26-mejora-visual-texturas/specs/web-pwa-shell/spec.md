# Spec Delta

## MODIFIED Requirements

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
