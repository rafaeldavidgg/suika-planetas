# Spec Delta

## Purpose

Define el bucle jugable core del Suika de planetas: soltar cuerpos en un cuenco, fusionar iguales al siguiente nivel y perder por desbordamiento, con puntuación y progresión educativa por tamaño.

## ADDED Requirements

### Requirement: Control de soltado
El sistema SHALL permitir mover horizontalmente el cuerpo actual sobre el cuenco y soltarlo con una acción del usuario, con un breve enfriamiento entre sueltas.

#### Scenario: Mover y soltar
- **WHEN** el usuario arrastra o mueve el puntero y suelta
- **THEN** el cuerpo cae desde la posición X elegida con la velocidad inicial vertical nula y se bloquea una nueva suelta hasta que expira el enfriamiento

#### Scenario: Límite de movimiento
- **WHEN** el usuario intenta mover fuera del ancho interior del cuenco
- **THEN** el dropper se fija al borde interior sin salir del cuenco

### Requirement: Fusión por igualdad
El sistema SHALL fusionar dos cuerpos del mismo nivel que se tocan en un único cuerpo del nivel inmediatamente superior, situado en el punto medio, otorgando puntos según el nivel creado.

#### Scenario: Fusión simple
- **WHEN** dos cuerpos de nivel N colisionan y ninguno está en animación de fusión
- **THEN** ambos desaparecen y aparece un cuerpo de nivel N+1 con efecto pop y suma de puntos

#### Scenario: Doble Júpiter crea Sol bonus
- **WHEN** dos cuerpos de nivel máximo (Júpiter) se tocan
- **THEN** ambos desaparecen con efecto especial y se otorgan los puntos máximos sin crear un cuerpo permanente

#### Scenario: Niveles distintos no fusionan
- **WHEN** colisionan dos cuerpos de niveles distintos
- **THEN** ambos permanecen y solo rebotan/apilan sin puntos

### Requirement: Cadena de evolución ordenada por tamaño
El sistema SHALL usar una cadena fija de 11 niveles en orden creciente de tamaño real más el bonus Sol, y solo los 5 primeros son soltables aleatoriamente.

#### Scenario: Orden preservado
- **WHEN** se lista la cadena de evolución en el juego y en el Codex
- **THEN** el orden es Meteorito → Deimos → Luna → Mercurio → Marte → Venus → Tierra → Neptuno → Urano → Saturno → Júpiter (+ Sol bonus) sin alteraciones

#### Scenario: Solo iniciales dropeables
- **WHEN** el sistema elige cuerpo actual y siguiente
- **THEN** ambos pertenecen siempre a los 5 primeros niveles con distribución aleatoria

### Requirement: Tamaños visuales jugables monótonos
El sistema SHALL dibujar cada nivel con un radio mayor que el anterior, comprimido para que el Júpiter quepa en el cuenco, sin pretender escala real.

#### Scenario: Monotonía visual
- **WHEN** se comparan visualmente dos niveles consecutivos
- **THEN** el de nivel superior ocupa más área en pantalla que el inferior

### Requirement: Puntuación y combos
El sistema SHALL otorgar más puntos cuanto mayor sea el nivel creado en la fusión y mostrar el total y el récord durante la partida.

#### Scenario: Puntos crecientes
- **WHEN** se produce una fusión a nivel N+1
- **THEN** los puntos sumados son estrictamente mayores que los de una fusión a nivel N

#### Scenario: Combo en cadena visible
- **WHEN** una fusión provoca otra en menos de 2 segundos
- **THEN** se muestra un multiplicador o contador de combo

### Requirement: Game over por desbordamiento con gracia
El sistema SHALL terminar la partida solo si un cuerpo en reposo permanece por encima de la línea superior durante el tiempo de gracia configurado.

#### Scenario: Toque momentáneo no mata
- **WHEN** un cuerpo cruza la línea pero vuelve a entrar antes de que expire la gracia
- **THEN** la partida continúa y el temporizador se reinicia

#### Scenario: Desbordamiento sostenido termina
- **WHEN** un cuerpo permanece sobre la línea más allá de la gracia
- **THEN** el sistema congela la simulación, muestra Game Over con puntuación y botón de reinicio en 1 tap
