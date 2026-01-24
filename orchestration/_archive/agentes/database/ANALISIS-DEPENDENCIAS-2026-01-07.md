# ANÁLISIS DE DEPENDENCIAS - CONSOLIDACIÓN DE BD GAMILIT
## Fecha: 2026-01-07
## Estado: COMPLETO

---

## RESUMEN EJECUTIVO

Se analizaron exhaustivamente las dependencias entre la base de datos y las capas de aplicación (backend y frontend) para los objetos que serán modificados en el plan de consolidación.

### Métricas de Dependencias

| Capa | Archivos Analizados | Referencias a ENUMs | Referencias a Tablas |
|------|---------------------|---------------------|---------------------|
| **Backend** | 864 archivos TypeScript | 200+ | 130+ |
| **Frontend** | 500+ archivos | 350+ | N/A (vía API) |
| **DDL** | 200+ archivos SQL | 35 ENUMs | 137 tablas |

---

## 1. DEPENDENCIAS CRÍTICAS IDENTIFICADAS

### 1.1 Backend: Valores Hard-Coded de Maya Rank

**PROBLEMA CRÍTICO:**
- **Archivo:** `/modules/progress/services/exercise-submission.service.ts`
- **Líneas:** 1040-1115
- **Impacto:** Multiplicadores y umbrales XP están hard-coded, no consultan BD

```typescript
// CÓDIGO PROBLEMÁTICO
const rankMultipliers = {
  'Ajaw': 1.00,
  'Nacom': 1.10,
  'Ah K\'in': 1.15,
  'Halach Uinic': 1.20,
  'K\'uk\'ulkan': 1.25,
};
```

**ACCIÓN REQUERIDA:** Refactorizar para consultar `gamification_system.maya_ranks`

---

### 1.2 Backend: NotificationsService Deprecated

**PROBLEMA:**
- **Servicio:** `NotificationsService` (deprecated) aún en uso
- **Archivos afectados:**
  - `student-risk-alert.service.ts:212,262`
  - `notifications.controller.ts:21,44`

**ACCIÓN REQUERIDA:** Migrar a `NotificationService` (multi-canal)

---

### 1.3 Frontend: Inconsistencia de Roles

**PROBLEMA:**
- `GamilityRoleEnum` tiene 3 valores
- `UserRole` type tiene 6 valores
- Inconsistencia genera confusión

**ARCHIVOS:**
- `/shared/constants/enums.constants.ts`
- `/shared/types/user.types.ts`

**ACCIÓN REQUERIDA:** Consolidar en un solo enum

---

### 1.4 Frontend: Etiquetas de Achievement Faltantes

**PROBLEMA:**
- `CATEGORY_LABELS` no incluye 'collection' ni 'hidden'
- Enum ya tiene los valores, pero UI no los renderiza

**ARCHIVO:** `/apps/admin/components/gamification/AchievementsTab.tsx`

**ACCIÓN REQUERIDA:** Agregar etiquetas

---

## 2. MATRIZ DE IMPACTO POR COMPONENTE

### 2.1 ENUMs a Migrar

| ENUM | Backend Deps | Frontend Deps | Impacto Total | Riesgo |
|------|--------------|---------------|---------------|--------|
| gamilit_role | 26 archivos | 25 archivos | 51 | ALTO |
| maya_rank | 34 archivos | 20 archivos | 54 | CRÍTICO |
| exercise_type | 33 archivos | 100+ archivos | 133+ | CRÍTICO |
| notification_type | 56 archivos | 129 archivos | 185 | MEDIO |
| progress_status | 15 archivos | 15 archivos | 30 | BAJO |

### 2.2 Tablas a Modificar

| Tabla | Backend Deps | Triggers | Funciones | Riesgo |
|-------|--------------|----------|-----------|--------|
| gamification_system.notifications | 4 archivos | 1 | 0 | MEDIO |
| 22 tablas con updated_at | 0 | 22 | 1 | BAJO |

---

## 3. ORDEN DE EJECUCIÓN RECOMENDADO (REFINADO)

### FASE 0: Pre-Requisitos (NUEVA)
1. Refactorizar `exercise-submission.service.ts` para consultar maya_ranks de BD
2. Migrar `student-risk-alert.service.ts` a `NotificationService`
3. Migrar `notifications.controller.ts` a nuevo servicio

### FASE 1: Triggers updated_at (Sin cambios)
- Consolidar 22 archivos en 8
- Impacto: Solo DDL, sin dependencias de aplicación

### FASE 2: ENUMs (Con precaución)
- Migrar ENUMs manteniendo valores exactos
- Verificar sincronización con backend constants

### FASE 3: Notificaciones (Después de FASE 0)
- Eliminar tabla deprecated solo después de migrar backend

### FASE 4: Limpieza
- Funciones deprecated
- Documentación

---

## 4. ARCHIVOS CRÍTICOS POR PRIORIDAD

### PRIORIDAD CRÍTICA (Modificar antes de consolidación)

| Archivo | Líneas | Cambio | Estimado |
|---------|--------|--------|----------|
| `exercise-submission.service.ts` | 1040-1115 | Query a maya_ranks | 4h |
| `student-risk-alert.service.ts` | 212, 262 | Migrar NotificationService | 2h |
| `notifications.controller.ts` | 21, 44 | Migrar NotificationService | 1h |

### PRIORIDAD ALTA (Validar durante consolidación)

| Archivo | Cambio | Estimado |
|---------|--------|----------|
| `user.types.ts` | Consolidar UserRole | 1h |
| `AchievementsTab.tsx` | Agregar etiquetas | 0.5h |
| `progress.types.ts` | Remover ProgressStatus duplicado | 0.5h |

### PRIORIDAD MEDIA (Post-consolidación)

| Archivo | Cambio | Estimado |
|---------|--------|----------|
| 20+ archivos tests | Actualizar mocks | 4h |
| Documentación | Actualizar inventarios | 2h |

---

## 5. VALIDACIONES POST-MIGRACIÓN

### Backend
- [ ] Ejecutar suite de tests completa
- [ ] Verificar endpoints de notificaciones
- [ ] Validar cálculo de XP y multiplicadores
- [ ] Verificar asignación de roles

### Frontend
- [ ] Verificar renderizado de achievements
- [ ] Validar selección de roles en admin
- [ ] Verificar estados de progreso
- [ ] Validar sistema de notificaciones

### Base de Datos
- [ ] Verificar integridad referencial
- [ ] Confirmar RLS policies activas
- [ ] Validar triggers funcionando
- [ ] Ejecutar queries de validación

---

## 6. CONCLUSIONES

### Estado Actual
- **Backend:** Buena sincronización general, con 3 puntos críticos
- **Frontend:** Excelente sincronización, 2 puntos menores
- **DDL:** Requiere consolidación, sin bloqueos

### Riesgo General: MEDIO

**Factores de Riesgo:**
1. Hard-coded values en backend (CRÍTICO)
2. Servicio deprecated aún en uso (ALTO)
3. Inconsistencia de tipos en frontend (MEDIO)

### Recomendación Final

**EJECUTAR FASE 0 ANTES DE CONSOLIDACIÓN:**
1. Resolver los 3 problemas críticos de backend (7 horas)
2. Resolver los 2 problemas menores de frontend (1 hora)
3. Luego proceder con consolidación de DDL

---

**Generado por:** Claude Code (Arquitecto de Datos)
**Fecha:** 2026-01-07
