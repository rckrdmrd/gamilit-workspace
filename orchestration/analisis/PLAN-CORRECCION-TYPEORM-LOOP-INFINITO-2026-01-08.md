# PLAN DE CORRECCION: TypeORM Relation Error y Loop Infinito React

**Agente:** Claude Code (Orquestador Full-Stack)
**Tipo de tarea:** Bug Fix / Correccion
**Prioridad:** P0 (Critico)
**Fecha planificacion:** 2026-01-08
**Estado:** EJECUTADO Y COMPLETADO

---

## 1. DESCRIPCION DEL PROBLEMA

### 1.1 Error Principal (Backend)
```
TypeORMError: Relation with property path module in entity was not found.
GET /api/v1/teacher/classrooms/:id/students (500 Internal Server Error)
```

### 1.2 Error Secundario (Frontend)
```
Maximum update depth exceeded. This can happen when a component calls setState
inside useEffect, but useEffect either doesn't have a dependency array, or one
of the dependencies changes on every render.
```

### 1.3 Pagina Afectada
- **Ruta:** `/teacher/reviews`
- **Endpoint:** `GET /api/v1/teacher/classrooms/:id/students`

---

## 2. ANALISIS DE CAUSA RAIZ

### 2.1 Error TypeORM (Backend)

**Ubicacion:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

**Metodo problematico:** `getTotalExercisesForClassroom()` (linea 1125)

**Causa:**
El metodo usaba `.innerJoin('e.module', 'm')` pero la entidad `Exercise` NO tiene una relacion `@ManyToOne` hacia `Module`. Solo tiene:
```typescript
@Column({ type: 'uuid' })
module_id!: string;  // Columna simple, NO relacion
```

TypeORM QueryBuilder requiere decoradores de relacion (`@ManyToOne`, `@OneToMany`) para resolver joins con alias. Sin estos decoradores, lanza el error "Relation not found".

### 2.2 Error Loop Infinito (Frontend)

**Ubicacion:** `apps/frontend/src/apps/teacher/hooks/useStudentMonitoring.ts`

**Causa:**
1. El hook tenia `filters` (objeto) como dependencia de `useCallback` (linea 162)
2. Cuando el API fallaba con error 500, se ejecutaba `setError()`
3. El `setInterval` de auto-refresh (cada 30s) continuaba intentando fetch
4. Cada error actualizaba estado, causando re-renders
5. Multiples actualizaciones rapidas causaban "Maximum update depth exceeded"

---

## 3. MAPA DE DEPENDENCIAS

### 3.1 Backend

```
Endpoint: GET /api/v1/teacher/classrooms/:id/students
    │
    ▼
TeacherClassroomsController.getClassroomStudents()
    │   [teacher-classrooms.controller.ts:309-354]
    ▼
TeacherClassroomsCrudService.getClassroomStudents()
    │   [teacher-classrooms-crud.service.ts:260-392]
    │
    ├── validateTeacherAccess()
    ├── getStudentsWithSearch()           [Raw SQL]
    ├── getStudentsProgress()
    ├── getStudentsUserStats()
    ├── getStudentsCurrentActivity()       [Raw SQL]
    └── getTotalExercisesForClassroom()   [ERROR AQUI -> CORREGIDO]
```

### 3.2 Frontend

```
TeacherMonitoringPage.tsx
    │
    ▼
StudentMonitoringPanel.tsx
    │   Props: { classroomId: string }
    │
    ▼
useStudentMonitoring(classroomId, filters)
    │   [Hook con problema de loop]
    │
    ▼
classroomsApi.getClassroomStudents()
    │
    ▼
apiClient.get('/teacher/classrooms/:id/students')
```

---

## 4. PLAN DE CORRECCION

### 4.1 Correccion Backend

**Estado:** YA CORREGIDO EN CODIGO FUENTE (FIX-2026-01-08)

**Problema identificado:** El servidor no habia sido reiniciado despues de la correccion.

**Acciones planificadas:**
1. [x] Recompilar el proyecto: `npm run build`
2. [x] Reiniciar el servidor (ts-node-dev con hot-reload)
3. [x] Verificar que el endpoint responde correctamente

**Solucion aplicada en codigo:**
```typescript
// FIX-2026-01-08: Usar raw SQL en lugar de TypeORM QueryBuilder
private async getTotalExercisesForClassroom(): Promise<number> {
  const sql = `
    SELECT COUNT(*) as count
    FROM educational_content.exercises e
    INNER JOIN educational_content.modules m ON m.id = e.module_id
    WHERE e.is_active = true
      AND m.is_published = true
  `;
  const result = await this.dataSource.query(sql);
  return parseInt(result[0]?.count || '0') || 50;
}
```

### 4.2 Correccion Frontend

**Archivo a modificar:** `apps/frontend/src/apps/teacher/hooks/useStudentMonitoring.ts`

**Cambios planificados:**

| # | Cambio | Linea Aprox | Justificacion |
|---|--------|-------------|---------------|
| 1 | Agregar `useMemo` a imports | 31 | Necesario para memoizar filtersKey |
| 2 | Agregar `consecutiveErrorsRef` | 105 | Contador de errores consecutivos |
| 3 | Agregar `MAX_CONSECUTIVE_ERRORS = 3` | 106 | Limite antes de pausar auto-refresh |
| 4 | Crear `filtersKey` memoizado | 108 | JSON.stringify(filters) para comparacion estable |
| 5 | Resetear contador en exito | 153 | Cuando API responde exitosamente |
| 6 | Incrementar contador en error | 155 | Trackear errores consecutivos |
| 7 | Pausar auto-refresh despues de 3 errores | 158-163 | Prevenir loops infinitos |
| 8 | Actualizar dependencias de useCallback | 162 | Usar filtersKey en lugar de filters |
| 9 | Actualizar dependencias de useEffect | 182 | Usar filtersKey para reset de pagina |

---

## 5. VALIDACION DEL PLAN

### 5.1 Checklist Pre-Ejecucion

- [x] Analisis de causa raiz completado
- [x] Archivos afectados identificados
- [x] Dependencias mapeadas
- [x] Riesgos evaluados
- [x] Solucion validada contra patrones existentes

### 5.2 Criterios de Exito

| Criterio | Metrica | Esperado |
|----------|---------|----------|
| Error 500 resuelto | Status code del endpoint | 200 o 401 (auth) |
| Loop infinito resuelto | Console errors | Sin "Maximum update depth" |
| Backend compila | `npm run build` | Sin errores |
| Frontend compila | `tsc --noEmit` | Sin nuevos errores |

### 5.3 Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Romper otra funcionalidad | Baja | Alto | Cambios minimos y focalizados |
| Introducir errores TypeScript | Baja | Medio | Verificar compilacion |
| Cambiar comportamiento del hook | Media | Medio | Mantener API del hook identica |

---

## 6. IMPACTO EN BASE DE DATOS

**Impacto:** NINGUNO

La correccion es puramente a nivel de codigo TypeScript:
- Backend: Cambio de TypeORM QueryBuilder a raw SQL
- Frontend: Mejora de manejo de estado en hook React

**NO se requiere:**
- Modificar schemas
- Crear/modificar tablas
- Actualizar scripts DDL
- Recrear base de datos

---

## 7. ARCHIVOS INVOLUCRADOS

### 7.1 Backend (Sin modificaciones - solo reinicio)

| Archivo | Estado | Accion |
|---------|--------|--------|
| `teacher-classrooms-crud.service.ts` | Codigo corregido | Recompilar y reiniciar |

### 7.2 Frontend (Modificacion requerida)

| Archivo | Lineas | Accion |
|---------|--------|--------|
| `useStudentMonitoring.ts` | +36/-3 | Agregar proteccion contra loops |

---

## 8. CRONOGRAMA DE EJECUCION

| Fase | Actividad | Duracion Est. |
|------|-----------|---------------|
| 1 | Analisis y planeacion | 30 min |
| 2 | Recompilar y reiniciar backend | 5 min |
| 3 | Modificar hook frontend | 15 min |
| 4 | Validacion | 10 min |
| 5 | Documentacion | 20 min |
| **Total** | | **80 min** |

---

## 9. ESTADO DE EJECUCION

| Fase | Estado | Fecha/Hora |
|------|--------|------------|
| Analisis y planeacion | COMPLETADO | 2026-01-08 06:30 |
| Recompilar backend | COMPLETADO | 2026-01-08 06:53 |
| Reiniciar servidor | COMPLETADO | 2026-01-08 06:53 |
| Modificar hook frontend | COMPLETADO | 2026-01-08 06:55 |
| Validacion | COMPLETADO | 2026-01-08 06:56 |
| Documentacion | COMPLETADO | 2026-01-08 07:05 |

---

## 10. REFERENCIAS

- [ANALISIS-TYPEORM-RELATION-ERROR-2026-01-08.md](../reportes/ANALISIS-TYPEORM-RELATION-ERROR-2026-01-08.md)
- [ANALISIS-ROOT-CAUSE-TYPEORM-CROSSSCHEMA-2025-12-18.md](../reportes/ANALISIS-ROOT-CAUSE-TYPEORM-CROSSSCHEMA-2025-12-18.md)
- [REPORTE-CORRECCION-TYPEORM-LOOP-INFINITO-2026-01-08.md](../reportes/REPORTE-CORRECCION-TYPEORM-LOOP-INFINITO-2026-01-08.md)

---

**Planificado por:** Claude Code (Orquestador Full-Stack)
**Fecha:** 2026-01-08
**Version:** 1.0
**Estado:** EJECUTADO Y COMPLETADO
