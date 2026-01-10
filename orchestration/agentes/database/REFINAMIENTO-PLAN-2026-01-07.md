# REFINAMIENTO DEL PLAN DE CONSOLIDACIÓN
## Fecha: 2026-01-07
## Versión: 2.0 (Refinado con Análisis de Dependencias)

---

## CAMBIOS RESPECTO AL PLAN ORIGINAL

### Nuevo: FASE 0 - Pre-Requisitos de Aplicación

Se agrega una fase previa para resolver dependencias críticas de backend antes de tocar la base de datos.

| Tarea | Prioridad | Estimado | Bloquea |
|-------|-----------|----------|---------|
| Refactorizar maya_ranks hard-coded | CRÍTICA | 4h | FASE 2 |
| Migrar NotificationsService deprecated | ALTA | 3h | FASE 3 |
| Consolidar UserRole en frontend | MEDIA | 1h | - |

### Ajustes a Fases Existentes

| Fase | Cambio | Razón |
|------|--------|-------|
| FASE 1 | Sin cambios | No tiene dependencias de aplicación |
| FASE 2 | Agregar validación de constants | Asegurar sincronización |
| FASE 3 | Ejecutar después de FASE 0 | Depende de migración backend |
| FASE 4 | Sin cambios | Limpieza final |

---

## PLAN REFINADO COMPLETO

### FASE 0: PRE-REQUISITOS DE APLICACIÓN (NUEVA)

**Objetivo:** Resolver dependencias críticas de aplicación antes de modificar DDL

#### 0.1 Refactorizar Maya Ranks Hard-Coded

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
**Líneas:** 1040-1115

**Antes:**
```typescript
const rankMultipliers = {
  'Ajaw': 1.00,
  'Nacom': 1.10,
  // ... hard-coded
};
```

**Después:**
```typescript
// Inyectar RanksService
private readonly ranksService: RanksService

// En método
const rankConfig = await this.ranksService.getRankMultiplier(userRank);
```

**Validación:** Tests de cálculo de XP

---

#### 0.2 Migrar NotificationsService a NotificationService

**Archivos a modificar:**
1. `student-risk-alert.service.ts`
2. `notifications.controller.ts`

**Antes:**
```typescript
this.notificationsService.sendNotification({...})
```

**Después:**
```typescript
this.notificationService.create({...})
```

**Validación:** Verificar notificaciones en UI

---

#### 0.3 Consolidar UserRole en Frontend

**Archivo:** `apps/frontend/src/shared/types/user.types.ts`

**Antes:**
```typescript
export type UserRole =
  | 'student' | 'teacher' | 'admin'
  | 'institution_admin' | 'super_admin' | 'content_creator';
```

**Después:**
```typescript
// Usar solo GamilityRoleEnum
import { GamilityRoleEnum } from '../constants/enums.constants';
export type UserRole = GamilityRoleEnum;
```

**Validación:** Verificar rutas protegidas

---

### FASE 1: CONSOLIDACIÓN DE TRIGGERS (Sin cambios)

- Consolidar 22 triggers en 8 archivos
- Impacto: Solo DDL
- Riesgo: BAJO
- Estimado: 5 días

---

### FASE 2: MIGRACIÓN DE ENUMs (Ajustada)

**Agregar paso de validación:**

Antes de migrar cada ENUM:
```sql
-- Verificar valores coinciden con backend constants
SELECT enumlabel FROM pg_enum
WHERE enumtypid = 'gamilit_role'::regtype;

-- Comparar con:
-- /apps/backend/src/shared/constants/enums.constants.ts
```

**Orden de migración (sin cambios):**
1. PRIORIDAD 1: gamilit_role, maya_rank, exercise_type
2. PRIORIDAD 2-8: Resto de ENUMs

---

### FASE 3: ELIMINACIÓN DE TABLA NOTIFICACIONES (Después de FASE 0)

**Pre-requisito:** FASE 0.2 completada

**Pasos:**
1. Verificar migración de datos
2. Crear RLS policies en notifications.notifications
3. Validar endpoints
4. Eliminar tabla deprecated

---

### FASE 4: LIMPIEZA (Sin cambios)

- Eliminar funciones deprecated
- Actualizar inventarios
- Documentar cambios

---

## CRONOGRAMA REFINADO

### Semana 0: Pre-Requisitos (NUEVA)

| Día | Actividad | Responsable |
|-----|-----------|-------------|
| L | Refactorizar maya_ranks (parte 1) | Backend Dev |
| M | Refactorizar maya_ranks (parte 2) + tests | Backend Dev |
| Mi | Migrar NotificationsService | Backend Dev |
| J | Consolidar UserRole frontend | Frontend Dev |
| V | Validación integral | QA |

### Semanas 1-4: Consolidación de DDL (Como original)

---

## LISTA DE VERIFICACIÓN REFINADA

### Pre-FASE 0
- [ ] Notificar equipo de cambios planificados
- [ ] Crear branch de feature
- [ ] Backup de BD

### Post-FASE 0
- [ ] maya_ranks consultados de BD (no hard-coded)
- [ ] NotificationService usado en todos los módulos
- [ ] UserRole consolidado
- [ ] Tests pasando

### Post-FASE 1
- [ ] Todos los triggers consolidados
- [ ] updated_at funcionando en todas las tablas

### Post-FASE 2
- [ ] ENUMs migrados a schemas correctos
- [ ] 00-prerequisites.sql limpio
- [ ] Backend constants sincronizados

### Post-FASE 3
- [ ] Datos migrados a notifications.notifications
- [ ] RLS policies activas
- [ ] gamification_system.notifications eliminada

### Post-FASE 4
- [ ] Funciones deprecated eliminadas
- [ ] Inventarios actualizados
- [ ] Documentación completa

---

## MÉTRICAS DE ÉXITO (REFINADAS)

### Cuantitativas
- [ ] 0 valores hard-coded de maya_ranks
- [ ] 0 usos de NotificationsService deprecated
- [ ] 100% tests pasando
- [ ] Reducción de 80%+ en líneas duplicadas
- [ ] 0 ENUMs en schema public

### Cualitativas
- [ ] Aplicación funcionando sin regresiones
- [ ] Documentación reflejando estado real
- [ ] Arquitectura alineada con políticas

---

## RIESGOS ACTUALIZADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Regresión en cálculo XP | Media | CRÍTICO | Tests exhaustivos en FASE 0 |
| Notificaciones no enviadas | Baja | Alto | Validar en staging |
| Rutas no protegidas | Baja | Alto | Tests de autenticación |
| Dependencia no detectada | Baja | Medio | Análisis completo realizado |

---

**Refinamiento completado por:** Claude Code (Arquitecto de Datos)
**Fecha:** 2026-01-07
**Próximo paso:** Aprobación para FASE 0
