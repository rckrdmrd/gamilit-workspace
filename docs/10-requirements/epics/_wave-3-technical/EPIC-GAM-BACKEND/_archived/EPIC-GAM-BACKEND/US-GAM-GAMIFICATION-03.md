# US-GAM-GAMIFICATION-03: Misiones Diarias y Semanales

**Prefijo:** GAM | **Modulo:** missions | **Prioridad:** P2 | **SP:** 5
**Epic:** EPIC-GAM-BACKEND

---

## Historia de Usuario

**Como** estudiante que ingresa diariamente a la plataforma,
**Quiero** ver y completar misiones diarias y semanales con recompensas,
**Para** tener objetivos claros de corto plazo que me motiven a participar consistentemente.

---

## Criterios de Aceptacion

### Escenario 1: Ver misiones diarias
**Given** un estudiante que ingresa a la plataforma en un nuevo dia
**When** accede a la seccion "Misiones" del dashboard
**Then** ve 3 misiones diarias (rotadas automaticamente a las 00:00)
**And** cada mision muestra: descripcion, progreso, recompensa (XP + ML Coins)
**And** las misiones del dia anterior que no se completaron aparecen como "Expiradas"

### Escenario 2: Completar mision diaria
**Given** una mision diaria "Completa 3 ejercicios del Modulo 1" con progreso 2/3
**When** el estudiante completa un tercer ejercicio del Modulo 1
**Then** la mision se marca como completada automaticamente
**And** muestra boton "Reclamar recompensa"
**And** al reclamar, otorga 25 XP + 15 ML Coins
**And** muestra animacion de recompensa obtenida

### Escenario 3: Progreso en mision semanal
**Given** una mision semanal "Alcanza una racha de 5 dias" con progreso 3/5
**When** el estudiante completa su actividad diaria
**Then** el progreso se actualiza a 4/5
**And** muestra notificacion "1 dia mas para completar tu mision semanal!"
**And** la mision semanal expira el domingo a las 23:59

---

## Definition of Done

- [ ] 3 misiones diarias se rotan cada dia
- [ ] 5 misiones semanales se rotan cada lunes
- [ ] Progreso se actualiza automaticamente
- [ ] Recompensas se otorgan al reclamar
- [ ] Misiones expiradas se marcan correctamente
- [ ] Notificaciones de progreso funcionan
- [ ] Tests para rotation, progress tracking, reward claim
