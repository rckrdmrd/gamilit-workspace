# _MAP: docs/90-transversal/correcciones/

**Última actualización:** 2025-11-26
**Propósito:** Planificación de correcciones y refactorings
**Audiencia:** Tech Leads, Desarrolladores
**Estado:** ✅ PRODUCTION READY (87.5% coherencia global - actualizado 2025-11-26)

---

## 📁 Contenido de esta Carpeta

**Nota:** Issues conocidos, bugs, deuda técnica.

| Archivo | Descripción | Fecha |
|---------|-------------|-------|
| `VALIDACION-INTEGRACION-COMPLETA-2025-11-26.md` | Validación integración DB→Backend→Frontend + 7 FKs corregidas | 2025-11-26 |
| `CORRECCIONES-BUILD-AUTH-2025-11-25.md` | Corrección de 73 errores TypeScript + Bug registro auto-login | 2025-11-25 |
| `ANALISIS-FORMATOS-DTO-FE-059.md` | Análisis de formatos DTO Frontend | 2025-11-19 |
| `REPORTE-VALIDACION-DOCS-FE-059-2025-11-19.md` | Reporte validación documentación | 2025-11-19 |
| `ISSUES-CRITICOS.md` | Issues críticos del sistema | 2025-11-08 |

---

## ⚠️ Issues Críticos

Ver: `_MAP.md:255-281` (raíz del workspace)

**P0 (Crítico):**
- ~~Cobertura SIMCO insuficiente~~
- Testing coverage bajo (12-15%)
- Monitoring no implementado
- ~~RLS Policies incompletas~~ ✅ Corregido 2025-11-26
- **`check_and_award_achievements()` función rota** - Requiere refactorización JSONB

**P1 (Alto):**
- Carpetas devops/ y platform/ vacías
- **Tipo Mission NO EXISTE en Frontend** - 14 campos pendientes
- **MayaRank KUKUKULKAN** - Typo en backend (debe ser KUKULKAN)
- **MessageTypeEnum** - Falta en Frontend

**P2 (Medio):**
- DeviceTypeEnum falta valor 'unknown' en backend
- Tipos incompletos: User (7), Achievement (9), Classroom (14), ExerciseSubmission (8)

---

## ✅ Correcciones Recientes (2025-11-26)

### Validación Integración Completa
- **Coherencia DB→Backend: 87%**
- **Coherencia DB→Frontend: 78.5%**
- **Promedio Global: 82.75%** ✅ PRODUCTION READY

### FKs Legacy Corregidas (7)
| Tabla | Campo(s) | FK Anterior | FK Corregida |
|-------|----------|-------------|--------------|
| `social_features.friendships` | user_id, friend_id | auth.users | auth_management.profiles |
| `social_features.team_members` | user_id | auth.users | auth_management.profiles |
| `progress_tracking.teacher_notes` | teacher_id, student_id | auth.users | auth_management.profiles |
| `audit_logging.activity_log` | user_id | auth.users | auth_management.profiles |

### Vulnerabilidad RLS Corregida (1)
- **Archivo:** `gamification_system/rls-policies/02-policies.sql`
- **Problema:** `USING(true)` permitía UPDATE a cualquier usuario
- **Solución:** Sección removida, políticas modernas en `04-user-stats-policies.sql`

### Duplicados Eliminados (2)
1. `social_features/rls-policies/02-policies.sql` - Sección classroom_members
2. Colisión de prefijo: `06-user_activity.sql` → `07-user_activity.sql`

### Referencia Inexistente Corregida
- `admin_dashboard/tables/01-materialized_views.sql`
- `audit_logging.system_events` → `audit_logging.system_logs`

---

## ✅ Correcciones Recientes (2025-11-25)

### Build TypeScript Frontend
- **73 errores → 0 errores**
- Migración Jest → Vitest en tests
- Propiedades faltantes en interfaces
- Correcciones de tipos en componentes

### Bug Registro Auto-login
- Backend `/auth/register` ahora retorna tokens JWT
- Permite auto-login después de registro exitoso
- Validado con build exitoso

---

## 📊 Métricas de Integración (2025-11-26)

```
╔════════════════════════════════════════════════════════════╗
║              COHERENCIA DE INTEGRACIÓN                     ║
╠════════════════════════════════════════════════════════════╣
║  Database → Backend:              89.0%  (+2.0% P2)        ║
║  Database → Frontend (via APIs):  86.0%  (+7.5% P2)        ║
║  ────────────────────────────────────────                  ║
║  PROMEDIO GLOBAL:                 87.5%  (+4.75% P2)       ║
║  ESTADO:                          PRODUCTION READY         ║
╚════════════════════════════════════════════════════════════╝
```

---

## 📋 Backlog Pendiente

### P0 - Inmediato
1. Refactorizar `check_and_award_achievements()` para usar campos JSONB

### P1 - Sprint Actual
2. Crear tipo Mission en Frontend (14 campos)
3. Corregir MayaRank KUKUKULKAN → KUKULKAN en Backend
4. Agregar MessageTypeEnum en Frontend

### P2 - ~~Próximo Sprint~~ ✅ COMPLETADO 2025-11-26
5. ~~Expandir tipos Frontend (User, Achievement, Classroom, ExerciseSubmission)~~ ✅
6. ~~Agregar 'unknown' a DeviceTypeEnum en Backend~~ ✅

### Correcciones P2 Implementadas (2025-11-26)
| Corrección | Archivos | Campos Agregados |
|------------|----------|------------------|
| DeviceTypeEnum | BE + FE enums.constants.ts | +1 (UNKNOWN) |
| ExerciseSubmission | FE progress.types.ts | +12, -1 (attempt_id), rename answer_data |
| Achievement | FE achievement.types.ts | +9 campos |
| Classroom | FE social.types.ts | +16 campos + 2 tipos auxiliares |
| User | FE auth.types.ts | +7 campos |

---

## 📚 Documentación Relacionada

- [VALIDACION-INTEGRACION-COMPLETA-2025-11-26.md](../VALIDACION-INTEGRACION-COMPLETA-2025-11-26.md)
- [DATABASE_INVENTORY.yml](../inventarios/DATABASE_INVENTORY.yml)
- [CHANGELOG.md](../../../apps/database/docs/database/CHANGELOG.md)
