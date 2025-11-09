# Guía: Agregar Referencias SIMCO en Código DDL

## 📋 Objetivo

Esta guía explica cómo agregar referencias bidireccionales entre la documentación (carpeta `docs/`) y el código de implementación (carpeta `apps/`) para cumplir con el estándar SIMCO (Sistema Indexado Modular por COntexto).

## ✅ Estado Actual

### Completado:
- ✅ **00-prerequisites.sql**: 16 ENUMs con referencias agregadas
- ✅ **auth_management.profiles**: Tabla de perfiles de usuario
- ✅ **gamification_system.comodines_inventory**: Tabla de inventario de comodines
- ✅ **educational_content.exercises**: Tabla de ejercicios

### Pendiente:
- ⏳ ~46 tablas SQL restantes
- ⏳ ~100 archivos TypeScript en Backend
- ⏳ ~80 componentes React en Frontend

---

## 📐 Patrón para Archivos SQL

### Formato de Referencias

Agregar un bloque de documentación **después del header existente** y **antes del código SQL**:

```sql
-- =====================================================
-- Table: nombre_schema.nombre_tabla
-- Description: Descripción de la tabla
-- ...header existente...
--
-- 📚 Documentación:
-- Requerimiento: docs/01-requerimientos/.../RF-XXX-xxx.md
-- Especificación: docs/02-especificaciones-tecnicas/.../ET-XXX-xxx.md
-- Ver también: docs/... (opcional, para referencias adicionales)
-- =====================================================
```

### Ejemplo Real: auth_management.profiles

```sql
-- =====================================================
-- Table: auth_management.profiles
-- Description: Perfiles de usuario con información básica, rol y configuraciones
-- Dependencies: auth_management.tenants, auth.users
-- Created: 2025-10-27
--
-- 📚 Documentación:
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md
-- Especificación: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md
-- Especificación: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-002-estados-cuenta.md
-- =====================================================

SET search_path TO auth_management, public;

CREATE TABLE auth_management.profiles (
    ...
);
```

### Ejemplo Real: educational_content.exercises

```sql
-- =====================================================
-- Table: educational_content.exercises
-- Description: Ejercicios con 27 mecánicas diferentes
--
-- 📚 Documentación:
-- Requerimiento: docs/01-requerimientos/03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md
-- Especificación: docs/02-especificaciones-tecnicas/03-contenido-educativo/ET-EDU-001-mecanicas-ejercicios.md
-- Ver también: docs/01-requerimientos/modulos/MODULOS-EDUCATIVOS.md
-- =====================================================
```

---

## 🗺️ Mapeo de Schemas → Documentación

### 1. auth_management

**Tablas:**
- `profiles` → RF-AUTH-001 (roles), RF-AUTH-002 (estados cuenta)
- `linked_providers` → RF-AUTH-003 (OAuth)
- `sessions`, `tokens` → RF-AUTH-001 (autenticación)

### 2. gamification_system

**Tablas:**
- `achievements`, `user_achievements` → RF-GAM-001 (achievements)
- `comodines_inventory` → RF-GAM-002 (comodines)
- `leaderboards`, `user_stats` → RF-GAM-003 (rangos Maya)
- `ml_coins_transactions` → RF-GAM-002 (ML Coins)
- `missions`, `user_missions` → RF-GAM-001 (misiones)

### 3. educational_content

**Tablas:**
- `modules` → RF-EDU-001 (módulos educativos)
- `exercises` → RF-EDU-001 (31 mecánicas)
- `media_resources` → RF-CNT-001 (gestión media)
- `assessment_rubrics` → RF-EDU-001 (evaluación)

### 4. progress_tracking

**Tablas:**
- `module_progress` → RF-PRG-001 (estados progreso)
- `learning_sessions` → RF-PRG-001 (sesiones)
- `exercise_attempts` → RF-PRG-001 (intentos)
- `exercise_submissions` → RF-PRG-001 (envíos)

### 5. social_features

**Tablas:**
- `classrooms` → RF-SOC-001 (aulas virtuales)
- `classroom_members` → RF-SOC-001
- `teams`, `team_members` → RF-SOC-001 (equipos)
- `friendships` → RF-SOC-001 (amistades)

### 6. audit_logging

**Tablas:**
- `audit_logs` → RF-AUD-001 (sistema auditoría)
- `admin_audit_log` → RF-AUD-001
- `security_alerts` → RF-AUD-001 (alertas)

### 7. content_management

**Tablas:**
- `media_files` → RF-CNT-001 (gestión media)
- `content_versions` → RF-CNT-001 (versionado)

---

## 📂 Archivos Pendientes por Schema

### Prioridad Alta (Core Functionality)

```bash
# auth_management (5 tablas)
apps/database/ddl/schemas/auth_management/tables/01-tenants.sql
apps/database/ddl/schemas/auth_management/tables/02-tenant_metadata.sql
apps/database/ddl/schemas/auth_management/tables/04-linked_providers.sql
apps/database/ddl/schemas/auth_management/tables/05-sessions.sql
apps/database/ddl/schemas/auth_management/tables/06-auth_tokens.sql

# gamification_system (8 tablas)
apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql
apps/database/ddl/schemas/gamification_system/tables/02-achievements.sql
apps/database/ddl/schemas/gamification_system/tables/03-user_achievements.sql
apps/database/ddl/schemas/gamification_system/tables/04-leaderboards.sql
apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql
apps/database/ddl/schemas/gamification_system/tables/06-missions.sql
apps/database/ddl/schemas/gamification_system/tables/08-user_missions.sql
apps/database/ddl/schemas/gamification_system/tables/09-notifications.sql

# educational_content (3 tablas)
apps/database/ddl/schemas/educational_content/tables/01-modules.sql
apps/database/ddl/schemas/educational_content/tables/03-assessment_rubrics.sql
apps/database/ddl/schemas/educational_content/tables/04-media_resources.sql

# progress_tracking (5 tablas)
apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql
apps/database/ddl/schemas/progress_tracking/tables/02-learning_sessions.sql
apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql
apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql
apps/database/ddl/schemas/progress_tracking/tables/05-scheduled_missions.sql

# social_features (6 tablas)
apps/database/ddl/schemas/social_features/tables/01-classrooms.sql
apps/database/ddl/schemas/social_features/tables/02-classroom_members.sql
apps/database/ddl/schemas/social_features/tables/03-teams.sql
apps/database/ddl/schemas/social_features/tables/04-team_members.sql
apps/database/ddl/schemas/social_features/tables/05-friendships.sql
apps/database/ddl/schemas/social_features/tables/06-user_activity.sql

# audit_logging (3 tablas)
apps/database/ddl/schemas/audit_logging/tables/01-audit_logs.sql
apps/database/ddl/schemas/audit_logging/tables/02-admin_audit_log.sql
apps/database/ddl/schemas/audit_logging/tables/03-security_alerts.sql

# content_management (2 tablas)
apps/database/ddl/schemas/content_management/tables/01-media_files.sql
apps/database/ddl/schemas/content_management/tables/02-content_versions.sql
```

---

## 🔄 Proceso para Agregar Referencias

### 1. Identificar la tabla
```bash
# Ejemplo
vim apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql
```

### 2. Leer el header existente
```sql
-- =====================================================
-- Table: gamification_system.user_stats
-- Description: Estadísticas de gamificación por usuario
-- Created: 2025-10-27
-- =====================================================
```

### 3. Agregar bloque de documentación
```sql
-- =====================================================
-- Table: gamification_system.user_stats
-- Description: Estadísticas de gamificación por usuario
-- Created: 2025-10-27
--
-- 📚 Documentación:
-- Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
-- Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-003-rangos-maya.md
-- Especificación: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md
-- Especificación: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-003-rangos-maya.md
-- =====================================================
```

### 4. Verificar que las rutas existan
```bash
ls -la ../../docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
ls -la ../../docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md
```

### 5. Commit con mensaje descriptivo
```bash
git add apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql
git commit -m "docs(ddl): Agregar referencias SIMCO en user_stats

- RF-GAM-001: Sistema de Achievements
- RF-GAM-003: Sistema de Rangos Maya
- ET-GAM-001: Implementación Achievements
- ET-GAM-003: Implementación Rangos Maya

Parte de Fase 3.2: Referencias en código DDL"
```

---

## 🎯 Próximos Pasos

### Fase 3.2: DDL (restante)
- [ ] Completar 32 tablas restantes (~4-6 horas)
- [ ] Agregar referencias en funciones SQL (~2 horas)
- [ ] Agregar referencias en vistas (~1 hora)

### Fase 3.3: Backend TypeScript
Agregar JSDoc con referencias:

```typescript
/**
 * Service para gestionar achievements de gamificación
 *
 * @see {@link RF-GAM-001} docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
 * @see {@link ET-GAM-001} docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md
 */
export class AchievementService {
  // ...
}
```

### Fase 3.4: Frontend React
Agregar JSDoc con referencias:

```typescript
/**
 * Componente para mostrar galería de achievements desbloqueados
 *
 * @see {@link RF-GAM-001} docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
 * @see {@link TEACHER-PORTAL-API} docs/02-especificaciones-tecnicas/apis/TEACHER-PORTAL-API.md#achievements
 */
export const AchievementGallery: React.FC<Props> = () => {
  // ...
}
```

---

## 📊 Progreso Estimado

| Fase | Estado | Archivos | Tiempo Estimado |
|------|--------|----------|-----------------|
| **3.1: ENUMs** | ✅ Completado | 1 archivo (16 ENUMs) | 1 hora |
| **3.2: Tablas DDL** | ⏳ 10% (4/46) | 42 archivos restantes | 5-7 horas |
| **3.3: Backend** | ⏳ Pendiente | ~100 archivos | 8-10 horas |
| **3.4: Frontend** | ⏳ Pendiente | ~80 archivos | 6-8 horas |

**Total Fase 3:** 20-26 horas de trabajo

---

## ✅ Validación

Para verificar que las referencias están correctas:

```bash
# Validar que todos los archivos referenciados existen
cd apps/database/ddl
grep -r "Requerimiento: docs/" . | while read line; do
  file=$(echo "$line" | sed 's/.*Requerimiento: docs/docs/g' | sed 's/\.md.*/\.md/g')
  if [ ! -f "../../$file" ]; then
    echo "❌ FALTA: $file"
  else
    echo "✅ OK: $file"
  fi
done
```

---

## 📚 Referencias

- **Plan SIMCO Original**: `docs/PROGRESO-PLAN-SIMCO-2025-11-07.md`
- **Ejemplo completo**: `apps/database/ddl/00-prerequisites.sql`
- **Documentación SIMCO**: `docs/_MAP.md`

---

**Última actualización**: 2025-11-07
**Autor**: Database Team
**Estado**: 🟡 En progreso (Fase 3.2)
