---
titulo: "US-GAM-EXERCISES-02: Completar Ejercicio de Comprension Inferencial"
tipo: user-story
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: archivado
---

# US-GAM-EXERCISES-02: Completar Ejercicio de Comprension Inferencial

**Prefijo:** GAM | **Modulo:** exercises | **Prioridad:** P1 | **SP:** 5
**Epic:** EPIC-GAM-FRONTEND

---

## Historia de Usuario

**Como** estudiante que ha desbloqueado el Modulo 2,
**Quiero** completar ejercicios de comprension inferencial (detective textual, hipotesis, prediccion, puzzle de contexto, rueda de inferencias),
**Para** desarrollar mi capacidad de deducir informacion implicita del texto.

---

## Criterios de Aceptacion

### Escenario 1: Acceder a ejercicio inferencial
**Given** un estudiante que ha completado al menos 70% del Modulo 1
**When** navega al Modulo 2 (Comprension Inferencial)
**Then** el modulo esta desbloqueado y muestra los ejercicios disponibles
**And** cada ejercicio muestra dificultad, XP potencial y estado (nuevo, en progreso, completado)

### Escenario 2: Resolver detective textual
**Given** un estudiante que inicia un ejercicio de "Detective Textual"
**When** lee las pistas del texto e identifica las inferencias correctas
**Then** el sistema evalua mediante fuzzy matching y analisis de palabras clave
**And** otorga score parcial por inferencias parcialmente correctas
**And** muestra retroalimentacion explicativa (por que la inferencia es correcta/incorrecta)

### Escenario 3: Intentar ejercicio con respuesta insuficiente
**Given** un estudiante que envia una respuesta con menos del 30% de precision
**When** el sistema evalua la respuesta
**Then** muestra sugerencias de mejora sin revelar la respuesta completa
**And** permite reintentar con pistas adicionales (consumiendo ML Coins si aplica)
**And** registra el intento con score bajo

---

## Definition of Done

- [ ] Los 5 tipos de ejercicio inferencial funcionan
- [ ] Fuzzy matching evalua inferencias correctamente
- [ ] Retroalimentacion explicativa (no solo correcto/incorrecto)
- [ ] Pistas adicionales disponibles (opcional, con ML Coins)
- [ ] Integracion con gamification engine (XP + ML Coins)
- [ ] Tests para los 5 evaluadores inferenciales

---

## Notas Tecnicas
- Evaluacion mas compleja que Modulo 1 (fuzzy matching, keywords)
- DetectiveEvaluator, HypothesisEvaluator, PredictionEvaluator, etc.
- Score parcial: 0-100 con granularidad por sub-inferencia
