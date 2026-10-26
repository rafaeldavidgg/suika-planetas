# planet-visuals Specification

## Purpose

Define el acabado visual realista del juego: cada cuerpo se reconoce por su textura y sombreado esférico, y toda la interfaz comparte una dirección de marca espacial coherente, legible y respetuosa con el movimiento reducido.

## Requirements

### Requirement: Textura realista por nivel con caras conservadas
El sistema SHALL dibujar cada uno de los 12 niveles con una textura que evoque su aspecto real y mantener la cara kawaii y el nombre legible sobre ella.

#### Scenario: Tierra reconocible con cara
- **WHEN** aparece la Tierra en el cuenco, en el dropper o en el Codex
- **THEN** se distinguen masas continentales y océanos, y la cara y el nombre siguen visibles sin quedar tapados por la textura

#### Scenario: Gigantes gaseosos con bandas
- **WHEN** aparecen Júpiter, Saturno, Urano o Neptuno
- **THEN** se distinguen sus bandas o tono característico (incluida la Gran Mancha Roja en Júpiter y los anillos en Saturno)

#### Scenario: Rocosos con cráteres
- **WHEN** aparecen Meteorito, Deimos, Luna, Mercurio, Marte o Venus
- **THEN** su superficie muestra variación rocosa o cráteres y cada nivel es distinguible de los demás a simple vista

#### Scenario: Caras intactas tras la mejora
- **WHEN** se compara cualquier cuerpo con su versión anterior
- **THEN** los ojos y la sonrisa mantienen posición, tamaño relativo y color oscuro legible sobre la textura

### Requirement: Sombreado esférico y legibilidad del nombre
El sistema SHALL aplicar a cada cuerpo un sombreado que le dé volumen de esfera iluminada y garantizar que la etiqueta de nombre sea legible sobre cualquier textura.

#### Scenario: Volumen visible
- **WHEN** un cuerpo está en reposo en el cuenco
- **THEN** se percibe un degradado de luz a sombra coherente en todos los cuerpos (misma dirección de luz)

#### Scenario: Nombre legible
- **WHEN** se muestra la etiqueta del cuerpo sobre su textura
- **THEN** el texto alcanza contraste suficiente (halo o sombra si la textura es clara) y no se sale del cuerpo ni del canvas

### Requirement: Fondo espacial y dirección visual coherente
El sistema SHALL presentar un fondo estrellado con profundidad, una paleta espacial definida en tokens y los mismos estilos en HUD, controles, toast, combo, overlays y Codex.

#### Scenario: Fondo con estrellas
- **WHEN** se abre el juego
- **THEN** el fondo del cuenco y de la página muestra estrellas y una nebulosa sutil sin animaciones que distraigan ni coste de rendimiento perceptible

#### Scenario: Coherencia entre pantallas
- **WHEN** el usuario navega entre HUD, pausa, game over y Codex
- **THEN** colores, radios, tipografía y estilo de botones pertenecen a la misma paleta y ningún overlay usa estilos por defecto del navegador

#### Scenario: Codex con vista previa texturizada
- **WHEN** el usuario abre el Codex
- **THEN** cada cuerpo descubierto muestra su misma apariencia texturizada del juego en miniatura en lugar de un punto de color plano

### Requirement: Contraste y movimiento reducido
El sistema SHALL mantener contraste de texto 4.5:1 y respetar la preferencia de movimiento reducido del sistema en todos los efectos visuales nuevos.

#### Scenario: Contraste mínimo
- **WHEN** se audita cualquier texto de la interfaz (HUD, toast, botones, Codex, overlays)
- **THEN** su contraste frente al fondo es de al menos 4.5:1

#### Scenario: Sin animación con preferencia reducida
- **WHEN** el sistema tiene activado `prefers-reduced-motion` y ocurre una fusión o aparece el toast
- **THEN** no se reproducen animaciones de partículas, brillos ni transiciones, pero la fusión, los puntos y el toast siguen funcionando
