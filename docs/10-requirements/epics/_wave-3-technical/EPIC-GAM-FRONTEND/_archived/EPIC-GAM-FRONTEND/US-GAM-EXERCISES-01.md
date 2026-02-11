# US-GAM-EXERCISES-01: Completar Ejercicio de Comprension Literal

**Prefijo:** GAM | **Modulo:** exercises | **Prioridad:** P1 | **SP:** 5
**Epic:** EPIC-GAM-FRONTEND

---

## Historia de Usuario

**Como** estudiante registrado en la plataforma,
**Quiero** completar ejercicios de comprension literal (crucigrama, sopa de letras, V/F, completar espacios, linea de tiempo),
**Para** demostrar mi comprension del texto asignado y ganar XP y ML Coins.

---

## Criterios de Aceptacion

### Escenario 1: Iniciar ejercicio de comprension literal
**Given** un estudiante autenticado con acceso al Modulo 1 (Comprension Literal)
**When** selecciona un ejercicio disponible de tipo "crucigrama" asociado a una lectura
**Then** el sistema carga la lectura y el ejercicio interactivo en la misma pantalla
**And** un temporizador comienza a contar (configurable por maestro)
**And** el estudiante puede interactuar con el ejercicio (llenar casillas del crucigrama)

### Escenario 2: Enviar respuesta y recibir evaluacion
**Given** un estudiante que ha completado todas las casillas del ejercicio
**When** presiona el boton "Enviar Respuesta"
**Then** el sistema evalua automaticamente las respuestas
**And** muestra un score de 0 a 100 con retroalimentacion detallada
**And** indica cuales respuestas fueron correctas e incorrectas
**And** calcula y otorga XP basado en: score * multiplicador de dificultad * racha

### Escenario 3: Ejercicio parcialmente correcto
**Given** un estudiante que envio respuestas con errores parciales
**When** el sistema evalua las respuestas
**Then** otorga XP proporcional al porcentaje de respuestas correctas
**And** permite reintentar el ejercicio (maximo 3 intentos)
**And** registra el intento en el historial de progreso

---

## Definition of Done

- [ ] Los 5 tipos de ejercicio literal funcionan correctamente
- [ ] Evaluacion automatica retorna score preciso
- [ ] XP se otorga y se refleja en el dashboard de gamificacion
- [ ] ML Coins se acreditan al balance del estudiante
- [ ] El progreso se actualiza en el Modulo 1
- [ ] Spaced repetition agenda proxima repeticion del ejercicio
- [ ] Tests unitarios para evaluadores de los 5 tipos
- [ ] Retroalimentacion visual clara (correcto/incorrecto)

---

## Notas Tecnicas
- Endpoint: POST /exercises/:id/submit
- Evaluador: CrosswordEvaluator, WordSearchEvaluator, etc.
- XP formula: base_xp * (score/100) * difficulty_multiplier * streak_bonus
