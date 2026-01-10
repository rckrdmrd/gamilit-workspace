# ANALISIS PRE-EJECUCION: BUG-TEACHER-PROGRESS-001 - Datos Incorrectos en Teacher Progress

**Agente:** Arquitecto de Soluciones (Claude Opus 4.5)
**Tipo de tarea:** Bug Fix / Correccion Critica
**Prioridad:** P1 (Alto)
**Fecha analisis:** 2026-01-08
**Relacionado con:** [EAI-006], [TEACHER-PORTAL], [PROGRESS-TRACKING]

---

## CONTEXTO DE LA TAREA

### Solicitud Original
Se reporta que la informacion mostrada en la pagina `/teacher/progress` no es del todo correcta. Se requiere validar el consumo de la API y la base de datos para corregir el error.

### Sintomas Reportados
- Datos de progreso incorrectos o inflados
- Posible mezcla de datos entre diferentes classrooms
- Valores de estudiantes activos no coinciden con la realidad

### Objetivo Final
Corregir los calculos de datos en el endpoint `GET /api/v1/teacher/classrooms/:id/progress` para que muestre informacion precisa y correctamente segmentada por classroom.

---

## ANALISIS DETALLADO DEL FLUJO

### Flujo de Datos (Identificado)

```
+---------------------------------------------------------------------------+
| FRONTEND: TeacherProgressPage.tsx                                          |
| Hook: useClassroomData(classroomId)                                        |
| Llama a: classroomsApi.getClassroomProgress(classroomId)                   |
+------------------------------------+--------------------------------------+
                                     |
                                     v
+---------------------------------------------------------------------------+
| FRONTEND: classroomsApi.ts                                                 |
| GET /api/v1/teacher/classrooms/{id}/progress                               |
| Espera: { classroomData, moduleProgress }                                  |
+------------------------------------+--------------------------------------+
                                     |
                                     v
+---------------------------------------------------------------------------+
| BACKEND: teacher-classrooms.controller.ts                                  |
| Linea 493-499: getClassroomProgress()                                      |
| Llama a: classroomsCrudService.getClassroomProgress(id, teacherId)         |
+------------------------------------+--------------------------------------+
                                     |
                                     v
+---------------------------------------------------------------------------+
| BACKEND: teacher-classrooms-crud.service.ts                                |
| Metodo: getClassroomProgress() - Lineas 516-661                            |
| BUGS IDENTIFICADOS EN ESTE METODO                                          |
+---------------------------------------------------------------------------+
```

---

## BUGS IDENTIFICADOS

### BUG 1: activeStudentsCount usa .getCount() con GROUP BY (CRITICO)

**Ubicacion Exacta**
- **Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
- **Lineas:** 560-565 (antes de la correccion)

**Codigo Incorrecto**
```typescript
const activeStudentsCount = await this.moduleProgressRepo
  .createQueryBuilder('mp')
  .where('mp.user_id IN (:...studentIds)', { studentIds })
  .andWhere('mp.last_accessed_at >= :sevenDaysAgo', { sevenDaysAgo })
  .groupBy('mp.user_id')
  .getCount();  // ERROR: getCount() NO respeta GROUP BY en TypeORM
```

**Problema Raiz**
En TypeORM, `.getCount()` ignora el `GROUP BY` y cuenta TODOS los registros que coinciden con la clausula WHERE. Esto significa que si un estudiante tiene progreso en 3 modulos, se cuenta como 3 estudiantes activos en lugar de 1.

**Impacto**
- Valores de `active_students` inflados
- Ejemplo: 10 estudiantes reales con 3 modulos cada uno = 30 "estudiantes activos" reportados

---

### BUG 2: No se filtra por classroom_id en module_progress (CRITICO)

**Ubicacion Exacta**
- **Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
- **Lineas:** 560-565, 594-599, 621-634

**Codigo Incorrecto**
```typescript
// NO filtra por classroom_id
.where('mp.user_id IN (:...studentIds)', { studentIds })
```

**Evidencia de que DEBERIA filtrarse**
En el servicio de admin (`admin-progress.service.ts` linea 122), SI se filtra:
```sql
LEFT JOIN progress_tracking.module_progress mp ON u.id = mp.user_id AND mp.classroom_id = $1
```

**Problema Raiz**
La tabla `module_progress` tiene un campo `classroom_id` para segmentar el progreso por classroom. Sin embargo, el metodo `getClassroomProgress()` no utiliza este filtro, causando que se mezclen datos de multiples classrooms si un estudiante pertenece a mas de uno.

**Impacto**
- Datos de progreso mezclados entre classrooms
- Un estudiante en 2 classrooms duplica sus metricas en ambos

---

### BUG 3: Calculo de promedios sobre registros en lugar de usuarios (MODERADO)

**Ubicacion Exacta**
- **Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
- **Lineas:** 594-602

**Codigo Incorrecto**
```typescript
const completionStats = await this.moduleProgressRepo
  .createQueryBuilder('mp')
  .select('AVG(mp.progress_percentage)', 'avg_completion')
  .addSelect('AVG(mp.average_score)', 'avg_score')
  .where('mp.user_id IN (:...studentIds)', { studentIds })
  .getRawOne();
```

**Problema Raiz**
El `AVG()` se aplica directamente sobre todos los registros de `module_progress`, sin primero calcular el promedio por usuario. Esto causa que estudiantes con mas modulos tengan mayor peso en el promedio global.

**Ejemplo Ilustrativo**
| Estudiante | Modulos | Progreso por Modulo | Promedio Individual |
|------------|---------|---------------------|---------------------|
| A          | 3       | 100%, 50%, 0%       | 50%                 |
| B          | 1       | 100%                | 100%                |

- **Calculo actual (incorrecto):** (100+50+0+100) / 4 = **62.5%**
- **Calculo correcto:** (50% + 100%) / 2 = **75%**

---

## ARCHIVOS AFECTADOS

### A Modificar

| # | Archivo | Lineas | Cambio |
|---|---------|--------|--------|
| 1 | `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` | 556-570 | Corregir calculo activeStudentsCount |
| 2 | `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` | 594-621 | Agregar filtro classroom_id y mejorar calculo de promedios |
| 3 | `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` | 638-655 | Agregar filtro classroom_id en bucle de modulos |

### Consumidores (Sin cambios requeridos)

| Componente | Tipo | Razon |
|------------|------|-------|
| `TeacherProgressPage.tsx` | Frontend | Estructura de respuesta no cambia |
| `ClassProgressDashboard.tsx` | Frontend | Estructura de respuesta no cambia |
| `useClassroomData.ts` | Hook | Estructura de respuesta no cambia |
| `classroomsApi.ts` | API Client | Estructura de respuesta no cambia |
| `teacher-classrooms.controller.ts` | Controller | Solo invoca al servicio |

---

## ANALISIS DE IMPACTO

### Impacto en Base de Datos
**NO se requieren cambios en la base de datos.**

La tabla `module_progress` ya tiene:
- Campo `classroom_id` (uuid, nullable) - Ya existe
- Indice `idx_module_progress_classroom` - Ya existe
- FK constraint configurado correctamente

Los cambios son unicamente en la **logica de consulta** del backend.

### Impacto en DTOs
**NO se requieren cambios en DTOs.**

La estructura de respuesta `ClassroomProgressResponseDto` se mantiene identica:
```typescript
{
  classroomData: ClassroomProgressDataDto,
  moduleProgress: ModuleProgressItemDto[]
}
```

Solo cambian los **valores calculados**, no la estructura.

### Dependencias Verificadas

| Dependencia | Estado | Notas |
|-------------|--------|-------|
| `this.dataSource` | Ya inyectado | Linea 96-97 del servicio |
| `progress_tracking.module_progress` | Existe | DDL verificado |
| `classroom_id` en module_progress | Existe | Campo nullable UUID |

---

## DECISION DE APPROACH

### Approach Seleccionado
Usar **raw SQL** con `this.dataSource.query()` para las consultas que requieren:
1. `COUNT(DISTINCT user_id)` - TypeORM QueryBuilder no lo soporta correctamente con getCount()
2. Cross-schema joins - Ya documentado en `ANALISIS-ROOT-CAUSE-TYPEORM-CROSSSCHEMA-2025-12-18.md`
3. Subconsultas para promedios ponderados correctamente

**Razones:**
1. Consistencia con patron ya establecido en el proyecto (ver lineas 1084-1096 del mismo servicio)
2. Evita limitaciones conocidas de TypeORM QueryBuilder
3. Mayor control sobre la logica de calculos

### Alternativas Consideradas

**Alternativa 1:** Usar solo TypeORM QueryBuilder
- **Contras:** No soporta `COUNT(DISTINCT)` con `getCount()`, limitado para subconsultas complejas
- **Razon de descarte:** Documentado como anti-patron en el proyecto

---

## RIESGOS Y MITIGACION

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Cambio de valores rompe expectativas frontend | Baja | Bajo | Estructura de respuesta no cambia |
| Performance de raw SQL | Baja | Bajo | Las consultas son simples y ya tienen indices |
| Regresion en otros endpoints | Baja | Medio | Compilacion TypeScript valida sintaxis |

---

## ESTIMACION

| Fase | Duracion | Notas |
|------|----------|-------|
| Analisis | 30 min | Completado |
| Planificacion | 10 min | Este documento |
| Ejecucion | 15 min | 3 ediciones en 1 archivo |
| Validacion | 10 min | Compilacion + revision manual |
| Documentacion | 20 min | 3 documentos de reporte |
| **TOTAL** | **~85 min** | |

---

## REFERENCIAS CONSULTADAS

### Codigo Existente
- `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` - Archivo a modificar
- `apps/backend/src/modules/admin/services/admin-progress.service.ts` - Referencia de filtro classroom_id correcto
- `apps/backend/src/modules/teacher/dto/classroom-progress.dto.ts` - Estructura de respuesta

### Documentacion del Proyecto
- `orchestration/reportes/ANALISIS-ROOT-CAUSE-TYPEORM-CROSSSCHEMA-2025-12-18.md` - Patron raw SQL
- `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql` - DDL de la tabla

---

## CONCLUSION DEL ANALISIS

### Resumen
Se identificaron 3 bugs en el metodo `getClassroomProgress()` del servicio `TeacherClassroomsCrudService`. El mas critico es el uso incorrecto de `.getCount()` con `GROUP BY` que causa valores inflados. El segundo es la falta de filtro por `classroom_id` que mezcla datos entre classrooms. El tercero es un calculo de promedios que no considera correctamente el peso por usuario.

### Decisiones Clave
1. **Approach:** Usar raw SQL para consultas complejas (patron establecido)
2. **Subagentes:** No requeridos - cambios localizados en 1 archivo
3. **Objetos a crear:** Ninguno - solo modificaciones
4. **Impacto en BD:** Ninguno - solo cambios de logica

### Aprobacion para Proceder
- [x] Analisis completo y documentado
- [x] Sin bloqueadores identificados
- [x] Recursos disponibles (dataSource ya inyectado)
- [x] Estimaciones validadas
- [x] **APROBADO PARA EJECUCION**

---

## PROXIMO PASO

**Accion:** Crear documento de plan de correccion

**Template:** PLAN-CORRECCION-TEACHER-PROGRESS-CLASSROOM-DATA-2026-01-08.md

---

**Analizado por:** Claude Opus 4.5 (Arquitecto de Soluciones)
**Fecha:** 2026-01-08
**Version:** 1.0
**Estado:** Aprobado
