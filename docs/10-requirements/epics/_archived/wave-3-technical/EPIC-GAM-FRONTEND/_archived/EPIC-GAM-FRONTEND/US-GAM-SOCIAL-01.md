---
titulo: "US-GAM-SOCIAL-01: Interacciones Sociales y Equipos"
tipo: user-story
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: archivado
---

# US-GAM-SOCIAL-01: Interacciones Sociales y Equipos

**Prefijo:** GAM | **Modulo:** social | **Prioridad:** P3 | **SP:** 5
**Epic:** EPIC-GAM-FRONTEND

---

## Historia de Usuario

**Como** estudiante que disfruta de la competencia y colaboracion,
**Quiero** unirme a equipos, participar en retos grupales y ver el feed de actividad social,
**Para** sentirme parte de una comunidad y motivarme a traves de la interaccion con companeros.

---

## Criterios de Aceptacion

### Escenario 1: Crear o unirse a equipo
**Given** un estudiante autenticado en una aula
**When** navega a la seccion "Equipos" del portal
**Then** puede crear un equipo (nombre, maximo 5 miembros) o unirse a uno existente
**And** el equipo tiene un score grupal basado en XP de todos sus miembros
**And** el equipo aparece en leaderboard de equipos

### Escenario 2: Ver feed de actividad social
**Given** un estudiante en el dashboard
**When** accede al feed social
**Then** ve actividad reciente de su aula: logros de companeros, promociones de rango, misiones completadas
**And** puede dar "reaccion" a las actividades (like, wow, felicidades)
**And** el feed respeta RLS (solo ve actividad de su tenant/aula)

### Escenario 3: Reto entre equipos
**Given** dos equipos de una misma aula
**When** el maestro crea un reto grupal (ej: "mas ejercicios completados esta semana")
**Then** ambos equipos ven el reto y su progreso comparativo
**And** al terminar el periodo, el equipo ganador recibe bonus de ML Coins
**And** todos los participantes reciben XP por participar

---

## Definition of Done

- [ ] CRUD de equipos funciona
- [ ] Feed de actividad social con reacciones
- [ ] Leaderboard de equipos
- [ ] Retos entre equipos (basico)
- [ ] RLS: actividad aislada por tenant/aula
- [ ] Tests para teams, feed, challenges

---

## Notas
Este modulo esta al 50% de implementacion. DDL y entities completos, logica de negocio parcial.
