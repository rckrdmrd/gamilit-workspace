# US-GAM-TEACHER-01: Asignar Ejercicios y Revisar Producciones

**Prefijo:** GAM | **Modulo:** teachers | **Prioridad:** P1 | **SP:** 5
**Epic:** EPIC-GAM-BACKEND

---

## Historia de Usuario

**Como** maestro responsable del aprendizaje de mis estudiantes,
**Quiero** asignar ejercicios especificos a mi aula y revisar manualmente las producciones del Modulo 5,
**Para** personalizar el aprendizaje y evaluar las habilidades de produccion textual.

---

## Criterios de Aceptacion

### Escenario 1: Asignar ejercicio a aula
**Given** un maestro en su portal con una lectura seleccionada
**When** elige ejercicios asociados y selecciona el aula destinataria
**Then** crea una asignacion con fecha limite configurable
**And** todos los estudiantes del aula reciben notificacion
**And** la asignacion aparece en el dashboard de cada estudiante

### Escenario 2: Revisar produccion de Modulo 5
**Given** un maestro con 3 producciones pendientes de revision (comics digitales)
**When** accede a la seccion "Revisiones Pendientes"
**Then** ve la lista de producciones enviadas con: estudiante, tipo, fecha de envio
**And** puede abrir cada produccion, evaluarla con rubrica (creatividad, contenido, estructura)
**And** asignar un score de 0 a 100 con comentarios

### Escenario 3: Evaluacion genera recompensas
**Given** un maestro que asigna score de 90/100 a un comic digital
**When** confirma la evaluacion
**Then** el estudiante recibe notificacion con score y comentarios
**And** el sistema calcula y otorga XP y ML Coins correspondientes
**And** el progreso del Modulo 5 se actualiza

---

## Definition of Done

- [ ] Asignacion de ejercicios a aulas funciona
- [ ] Notificaciones a estudiantes al asignar
- [ ] Cola de revisiones pendientes
- [ ] Rubrica de evaluacion configurable
- [ ] XP/ML Coins se otorgan al evaluar
- [ ] Tests para flujo assign -> submit -> review -> reward
