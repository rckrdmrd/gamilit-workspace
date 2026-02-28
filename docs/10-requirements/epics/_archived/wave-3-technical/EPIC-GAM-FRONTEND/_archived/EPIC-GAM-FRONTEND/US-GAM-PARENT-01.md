---
titulo: "US-GAM-PARENT-01: Portal de Padres con Seguimiento de Progreso"
tipo: user-story
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: archivado
---

# US-GAM-PARENT-01: Portal de Padres con Seguimiento de Progreso

**Prefijo:** GAM | **Modulo:** parents | **Prioridad:** P1 | **SP:** 5
**Epic:** EPIC-GAM-FRONTEND

---

## Historia de Usuario

**Como** padre o tutor de un estudiante,
**Quiero** vincularme con la cuenta de mi hijo y ver su progreso academico, logros y actividad,
**Para** estar informado de su avance en comprension lectora y apoyar su aprendizaje.

---

## Criterios de Aceptacion

### Escenario 1: Vincular con estudiante
**Given** un padre registrado en la plataforma con rol "parent"
**When** ingresa el codigo de vinculacion proporcionado por el maestro
**Then** se establece la relacion padre-estudiante
**And** el padre puede ver el dashboard del hijo
**And** el maestro puede comunicarse con el padre

### Escenario 2: Ver progreso academico
**Given** un padre vinculado con su hijo
**When** accede al dashboard de padres
**Then** ve: modulos completados, porcentaje de progreso, ejercicios realizados esta semana
**And** ve rango maya actual, XP total, racha de dias
**And** ve ultimos logros desbloqueados
**And** puede descargar reporte en PDF

### Escenario 3: Recibir notificaciones
**Given** un padre con notificaciones configuradas (email + push)
**When** su hijo alcanza un nuevo rango maya
**Then** recibe notificacion push y email con "Tu hijo alcanzo el rango Batab!"
**And** puede ver el detalle en el portal de padres
**And** puede configurar que tipo de eventos generan notificacion

---

## Definition of Done

- [ ] Vinculacion padre-estudiante con codigo
- [ ] Dashboard de progreso completo
- [ ] Reporte PDF descargable
- [ ] Notificaciones multi-canal (email, push, SMS)
- [ ] Configuracion de preferencias de notificacion
- [ ] RLS: padre solo ve datos de sus hijos vinculados
- [ ] Tests de integracion para vinculacion y dashboard
