# VALIDACIÓN PRE-IMPLEMENTACIÓN
## Integración Student-Teacher Portal

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Task ID:** ARCH-INT-003

---

## 1. ARCHIVOS A MODIFICAR - CONFIRMACIÓN

### Backend

| Archivo | Líneas | Cambio | Conflicto |
|---------|--------|--------|-----------|
| `teacher-classrooms-crud.service.ts` | 855, 883 | `score_percentage` → `average_score` | ❌ Ninguno |
| `classroom-response.dto.ts` | 197-264 | Agregar 8 campos a StudentInClassroomDto | ❌ Ninguno |
| `teacher.module.ts` | providers | Agregar TeacherAnalyticsController | ❌ Ninguno |

### Nuevo Archivo Backend

| Archivo | Contenido |
|---------|-----------|
| `teacher-analytics.controller.ts` | NUEVO - Endpoint /teacher/analytics/economy |
| `analytics.dto.ts` | NUEVO - EconomyAnalyticsDto |

### Frontend

| Archivo | Líneas | Cambio | Conflicto |
|---------|--------|--------|-----------|
| `apps/teacher/types/index.ts` | Tipos | Agregar EconomyAnalytics interface | ❌ Ninguno |
| `TeacherGamification.tsx` | 68-174 | Reemplazar mock data con API real | ❌ Ninguno |

---

## 2. VERIFICACIÓN DE CAMPO INEXISTENTE

**Archivo:** `apps/backend/src/modules/progress/entities/module-progress.entity.ts`

**Campos confirmados en ModuleProgress:**
- ✅ `average_score` (existe)
- ❌ `score_percentage` (NO existe)

**Queries incorrectas encontradas:**
```typescript
// teacher-classrooms-crud.service.ts:855
.addSelect('AVG(mp.score_percentage)', 'avg_score')  // ❌ INCORRECTO

// teacher-classrooms-crud.service.ts:883
.addSelect('AVG(mp.score_percentage)', 'avg_score')  // ❌ INCORRECTO
```

---

## 3. DEPENDENCIAS CONFIRMADAS

### No hay dependencias circulares

| Módulo | Depende de |
|--------|------------|
| TeacherModule | ProgressModule (entidades) |
| TeacherModule | GamificationModule (user_stats) |
| TeacherModule | SocialModule (classrooms) |

### Imports necesarios para nuevo controller

```typescript
// teacher-analytics.controller.ts necesitará:
import { UserStats } from '../../gamification/entities/user-stats.entity';
import { ClassroomMember } from '../../social/entities/classroom-member.entity';
import { ModuleProgress } from '../../progress/entities/module-progress.entity';
```

---

## 4. MOCK DATA IDENTIFICADO

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherGamification.tsx`

| Variable | Líneas | Tipo | Estado |
|----------|--------|------|--------|
| `classStats` | 68-78 | ClassEconomyStats | 🔴 HARDCODED |
| `students` | 80-126 | StudentEconomyData[] | 🔴 HARDCODED |
| `achievements` | 128-157 | Achievement[] | 🔴 HARDCODED |
| `economyConfig` | 159-174 | Config | 🟡 READONLY (OK) |

---

## 5. CHECKLIST DE VALIDACIÓN

- [x] `score_percentage` NO existe en ModuleProgress entity
- [x] `average_score` SÍ existe en ModuleProgress entity
- [x] StudentInClassroomDto existe y puede extenderse
- [x] No existe teacher-analytics.controller.ts
- [x] TeacherGamification usa mock data
- [x] No hay conflictos con otras ramas
- [x] Build actual pasa sin errores relacionados

---

## 6. APROBACIÓN

### Checklist Final

- [x] Archivos identificados correctamente
- [x] Cambios no generan conflictos
- [x] Dependencias verificadas
- [x] Mock data identificado para reemplazo
- [x] Plan de rollback disponible (git revert)

### Estado

✅ **VALIDACIÓN COMPLETA - PROCEDER CON EJECUCIÓN**

---

**Próximo Paso:** Ejecutar FASE 3 - Ronda 1 (Backend Corrections)
