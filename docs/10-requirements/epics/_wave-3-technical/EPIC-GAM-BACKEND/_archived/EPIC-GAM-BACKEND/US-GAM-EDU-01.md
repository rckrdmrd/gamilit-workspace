# US-GAM-EDU-01: Modulos de Aprendizaje Progresivo

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-BACKEND, EPIC-GAM-FRONTEND
**Modulo(s):** modules, exercises, content, students
**Story Points:** 21
**Prioridad:** P0
**Sprint:** Completado

## Descripcion
**Como** estudiante de K-12
**Quiero** acceder a 5 modulos educativos progresivos con ejercicios interactivos
**Para** mejorar mi comprension lectora de forma gradual, desde comprension literal hasta produccion critica

## Criterios de Aceptacion

### CA-1: Estructura de 5 Modulos Progresivos
**Given** un estudiante autenticado en el portal estudiante
**When** accede a la seccion de modulos educativos
**Then** el sistema muestra 5 modulos ordenados progresivamente (1-Literal, 2-Inferencial, 3-Critica, 4-Digital, 5-Produccion), donde cada modulo tiene un icono tematico maya, porcentaje de progreso, y estado de desbloqueo visible

### CA-2: Desbloqueo Progresivo por Completitud
**Given** un estudiante que ha completado el 70% o mas de los ejercicios del Modulo N
**When** el sistema evalua el progreso del estudiante
**Then** el Modulo N+1 se desbloquea automaticamente, se genera una notificacion de desbloqueo con animacion tematica maya, y se otorgan XP de bonificacion por milestone de modulo

### CA-3: Ejercicios por Modulo
**Given** un estudiante que accede a un modulo desbloqueado
**When** navega al listado de ejercicios del modulo
**Then** el sistema muestra todos los tipos de ejercicios disponibles para ese modulo (5 tipos en modulos 1-4, 3 tipos en modulo 5), con indicador de progreso individual, dificultad, y XP potencial

### CA-4: Progreso por Modulo Visible
**Given** un estudiante con actividad en uno o mas modulos
**When** accede al dashboard principal o al listado de modulos
**Then** el sistema muestra: porcentaje de completitud por modulo, ejercicios completados vs total, tiempo promedio por ejercicio, y nota promedio por modulo

### CA-5: Configuracion de Dificultad por Aula
**Given** un maestro autenticado en el portal maestro
**When** configura los parametros de un aula
**Then** puede habilitar/deshabilitar modulos especificos para esa aula, ajustar el umbral de desbloqueo (default 70%), y seleccionar los tipos de ejercicios disponibles por modulo

### CA-6: Repeticion Espaciada de Ejercicios
**Given** un estudiante que completo un ejercicio hace N dias
**When** el motor de repeticion espaciada determina que es momento de reforzar ese contenido
**Then** el sistema sugiere el ejercicio nuevamente en la seccion de repaso, con variacion aleatoria en las opciones, y el XP otorgado es proporcional a la dificultad del repaso

## Flujo Principal
1. El estudiante inicia sesion y accede a su dashboard
2. Selecciona la seccion de modulos educativos
3. Ve los 5 modulos con estado de progreso y desbloqueo
4. Selecciona un modulo desbloqueado
5. Elige un tipo de ejercicio dentro del modulo
6. Completa el ejercicio y recibe evaluacion + XP
7. El progreso del modulo se actualiza en tiempo real
8. Al alcanzar 70%, el siguiente modulo se desbloquea

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | NestJS 11, TypeORM 0.3, PostgreSQL 16, React 19, Socket.IO 4.8+ |
| Entidades BD | educational_modules, module_progress, module_config, exercises, exercise_types, exercise_attempts, exercise_results, contents, content_versions, student_profiles, student_progress |
| Endpoints API | `GET /api/v1/modules` `GET /api/v1/modules/:id` `GET /api/v1/modules/:id/progress` `POST /api/v1/modules/:id/unlock-check` `GET /api/v1/modules/:id/exercises` `PATCH /api/v1/modules/:moduleId/config` |
| Componentes FE | ModuleList, ModuleCard, ModuleProgressBar, ExerciseSelector, UnlockAnimation, ModuleDashboard, DifficultyBadge |
| Dependencias | US-GAM-EDU-02 (Ejercicios), US-GAM-GAM-01 (XP y Rangos), US-GAM-STD-01 (Portal Estudiante) |
| WebSocket Events | `module:unlocked`, `module:progress-updated` |

## Definition of Done
- [ ] 5 modulos educativos implementados con progresion secuencial
- [ ] Motor de desbloqueo por completitud (70% default, configurable)
- [ ] 23 tipos de ejercicios distribuidos correctamente en 5 modulos
- [ ] Progreso visible en dashboard y listado de modulos
- [ ] Tests unitarios (cobertura >= 80%)
- [ ] Tests de integracion para flujo de desbloqueo
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-GAM-005, RF-GAM-006, RF-GAM-012 |
| Epica padre | EPIC-GAM-BACKEND, EPIC-GAM-FRONTEND |
| Vision | docs/10-requirements/VISION-ALCANCE.md |
