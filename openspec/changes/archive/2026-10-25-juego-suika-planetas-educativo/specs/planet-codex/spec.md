# Spec Delta

## Purpose

Aporta la capa educativa del juego: cada cuerpo muestra datos reales de tamaño y tipo, y el progreso de descubrimientos persiste en un Codex coleccionable.

## ADDED Requirements

### Requirement: Ficha de datos reales por cuerpo
El sistema SHALL asociar a cada nivel un nombre, diámetro real en km, tipo y una curiosidad corta, y mostrarlos al crear ese cuerpo por fusión.

#### Scenario: Toast educativo en fusión
- **WHEN** aparece un cuerpo nuevo por fusión
- **THEN** se muestra su nombre y diámetro real más tipo durante al menos 2 segundos sin bloquear el juego

#### Scenario: Datos del Sol bonus
- **WHEN** se fusionan dos Júpiter
- **THEN** se muestra la ficha del Sol con su diámetro real aunque no quede cuerpo permanente

### Requirement: Codex persistente de descubiertos
El sistema SHALL registrar cada nivel descubierto por primera vez y permitir consultar la colección completa con estado descubierto/pendiente.

#### Scenario: Desbloqueo y persistencia
- **WHEN** el usuario crea un nivel por primera vez y recarga el juego después
- **THEN** ese nivel sigue marcado como descubierto en el Codex

#### Scenario: Consulta completa
- **WHEN** el usuario abre el Codex
- **THEN** ve los 11 niveles más el Sol con nombre, diámetro, tipo y si está descubierto o no

### Requirement: Disclaimer de escala adaptada
El sistema SHALL indicar que los tamaños visuales están adaptados para jugar y que el orden y los datos numéricos son reales.

#### Scenario: Aviso visible
- **WHEN** el usuario abre ayuda o Codex
- **THEN** lee el texto de que los tamaños están comprimidos por jugabilidad y que el orden por tamaño es el real
