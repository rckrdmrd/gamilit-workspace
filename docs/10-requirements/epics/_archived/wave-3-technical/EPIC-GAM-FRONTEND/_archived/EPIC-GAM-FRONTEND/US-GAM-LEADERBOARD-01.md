---
titulo: "US-GAM-LEADERBOARD-01: Leaderboards Competitivos con Temporadas"
tipo: user-story
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: archivado
---

# US-GAM-LEADERBOARD-01: Leaderboards Competitivos con Temporadas

**Prefijo:** GAM | **Modulo:** leaderboard | **Prioridad:** P1 | **SP:** 5
**Epic:** EPIC-GAM-FRONTEND

---

## Historia de Usuario

**Como** estudiante competitivo,
**Quiero** ver mi posicion en los rankings de mi aula, escuela y global, con temporadas que resetean periodicamente,
**Para** competir con companeros y tener metas de corto plazo renovables.

---

## Criterios de Aceptacion

### Escenario 1: Ver leaderboard de aula en tiempo real
**Given** un estudiante autenticado en una aula con 25 companeros
**When** accede a la seccion "Leaderboards" del portal
**Then** ve su posicion en el ranking del aula (actualizado en tiempo real via Socket.IO)
**And** muestra: posicion, nombre, avatar, rango maya, XP de la temporada actual
**And** puede ver tambien rankings por escuela y global

### Escenario 2: Actualizacion en tiempo real
**Given** un estudiante viendo el leaderboard de aula
**When** un companero gana XP por completar un ejercicio
**Then** el leaderboard se actualiza automaticamente sin refresh (Socket.IO)
**And** si la posicion del companero cambia, muestra animacion de movimiento
**And** si el estudiante actual pierde posicion, muestra indicador visual

### Escenario 3: Cierre de temporada
**Given** una temporada de 4 semanas que llega a su fin
**When** el sistema cierra la temporada automaticamente
**Then** los top 3 de cada aula reciben recompensas (ML Coins + badge exclusivo)
**And** las posiciones finales se guardan en historial
**And** una nueva temporada comienza con XP de leaderboard reseteado a 0
**And** el XP total del estudiante NO se resetea (solo el de temporada)

---

## Definition of Done

- [ ] Leaderboard por aula, escuela y global
- [ ] Actualizacion en tiempo real (Socket.IO)
- [ ] Temporadas de 4 semanas con cierre automatico
- [ ] Recompensas para top 3 por aula
- [ ] Historial de posiciones por temporada
- [ ] Materialized Views para performance
- [ ] Tests para rankings, temporadas, recompensas
