---
titulo: "US-GAM-EXERCISES-03: Completar Ejercicio de Comprension Critica"
tipo: user-story
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: archivado
---

# US-GAM-EXERCISES-03: Completar Ejercicio de Comprension Critica

**Prefijo:** GAM | **Modulo:** exercises | **Prioridad:** P1 | **SP:** 8
**Epic:** EPIC-GAM-FRONTEND

---

## Historia de Usuario

**Como** estudiante avanzado que ha desbloqueado el Modulo 3,
**Quiero** completar ejercicios de comprension critica (tribunal de opiniones, debate digital, analisis de fuentes, podcast argumentativo, matriz de perspectivas),
**Para** desarrollar mi capacidad de evaluar, argumentar y opinar con fundamento.

---

## Criterios de Aceptacion

### Escenario 1: Participar en tribunal de opiniones
**Given** un estudiante en el Modulo 3 con ejercicio "Tribunal de Opiniones" asignado
**When** lee el texto y elabora su posicion (a favor, en contra, neutro)
**Then** debe fundamentar su posicion con al menos 3 argumentos basados en el texto
**And** el sistema evalua cobertura de argumentos (semi-automatica)
**And** opcionalmente, el maestro revisa y asigna score de calidad argumentativa

### Escenario 2: Debate digital asincrono
**Given** un estudiante que inicia un "Debate Digital" con companeros del aula
**When** redacta su argumento y lo publica
**Then** otros estudiantes pueden responder con contra-argumentos
**And** el sistema evalua estructura argumentativa basica (rubrica automatica)
**And** el maestro puede intervenir y calificar la calidad del debate

### Escenario 3: Ejercicio con evaluacion manual
**Given** un estudiante que envia ejercicio de "Podcast Argumentativo"
**When** el maestro aun no ha evaluado
**Then** el estudiante ve estado "Pendiente de revision"
**And** recibe notificacion cuando el maestro completa la evaluacion
**And** XP y ML Coins se otorgan al recibir la calificacion

---

## Definition of Done

- [ ] Los 5 tipos de ejercicio critico funcionan
- [ ] Evaluacion semi-automatica con rubrica
- [ ] Soporte para evaluacion manual por maestro
- [ ] Notificacion al estudiante cuando se evalua manualmente
- [ ] XP diferido (se otorga al recibir calificacion)
- [ ] Tests para evaluadores semi-automaticos

---

## Notas Tecnicas
- Evaluacion: semi-automatica (rubrica) + manual (maestro)
- Endpoint: POST /teachers/reviews/:id para evaluacion manual
- Notificacion via Socket.IO cuando maestro califica
