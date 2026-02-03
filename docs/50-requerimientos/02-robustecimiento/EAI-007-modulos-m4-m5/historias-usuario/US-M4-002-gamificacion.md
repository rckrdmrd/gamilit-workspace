---
id: US-M4-002
title: XP/ML al completar M4
epic: EAI-007
et: ET-M4M5-001
status: Done
story_points: 3
sprint: 7
created: 2025-12-05
updated: 2026-01-04
---

# US-M4-002: XP/ML al completar M4

## Historia de Usuario

**Como** estudiante
**Quiero** recibir XP y ML coins al completar ejercicios del Modulo 4
**Para** avanzar en mi progreso hacia el rango K'uk'ulkan

## Criterios de Aceptacion

- [x] Al recibir calificacion >= 60%, se otorga XP base
- [x] XP se calcula segun formula: base_xp * (score/100) * multiplicador_rango
- [x] ML coins se calculan segun tabla de recompensas
- [x] Progreso de modulo se actualiza en student_progress
- [x] Si completa todos los ejercicios M4, desbloquea M5

## Notas de Implementacion

Implementado en Sprint 7. La logica de XP/ML usa los servicios existentes de gamificacion (EAI-003).

---

**Estado:** Done
