# Inventario de Tablas - Base de Datos GAMILIT

**Fecha generación:** 2025-11-07
**Última actualización:** 2025-11-29
**Versión:** 1.2
**Total tablas:** 77+
**Método:** Análisis de archivos DDL + Validación de entities TypeORM

---

## 📑 Índice por Schema

| Schema | Tablas | % del Total | Actualizado |
|--------|--------|-------------|-------------|
| [auth_management](#auth_management-12-tablas) | 12 | 17% | 2025-11-07 |
| [gamification_system](#gamification_system-16-tablas) | 16 | 22% | **2025-11-29** |
| [public](#public-5-tablas) | 5 | 7% ✅ | **2025-11-29** |
| [social_features](#social_features-8-tablas) | 8 | 11% ✅ | **2025-11-29** |
| [audit_logging](#audit_logging-6-tablas) | 6 | 8% | 2025-11-07 |
| [content_management](#content_management-5-tablas) | 5 | 7% | 2025-11-07 |
| [progress_tracking](#progress_tracking-5-tablas) | 5 | 7% | 2025-11-07 |
| [educational_content](#educational_content-10-tablas) | 10+ | 13% | **2025-11-29** |
| [system_configuration](#system_configuration-3-tablas) | 3 | 4% | 2025-11-07 |
| [notifications](#notifications-6-tablas) | 6 | 8% ✨ | **2025-11-29** |
| [auth](#auth-1-tabla) | 1 | 1% | 2025-11-07 |
| **TOTAL** | **77+** | **100%** | |

> **Nota v1.2 (2025-11-29):**
> - Corregido errores de documentación en schema `public` (9→5 tablas)
> - Agregado schema `notifications` (6 tablas, EXT-003)
> - Movida `assignment_classrooms` de public a social_features
> - Eliminadas tablas fantasma: public.classrooms, public.notifications, public.classroom_students
> - Validadas duplicaciones potenciales: NO EXISTEN duplicados reales

---

## 🔍 Detalle de Tablas por Schema

### auth (1 tabla)

**Ubicación:** `apps/database/ddl/schemas/auth/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `users` | Tabla base de usuarios | ✅ |

**Contexto:**
- Tabla fundamental del sistema
- Extendida por `auth_management.profiles`
- Referenciada por todos los schemas

**Referencias SIMCO:**
- Seeds: `apps/database/seeds/auth/`
- Backend: `apps/backend/src/modules/auth/entities/user.entity.ts`

---

### auth_management (12 tablas)

**Ubicación:** `apps/database/ddl/schemas/auth_management/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `tenants` | Multi-tenancy (escuelas, instituciones) | ✅ |
| 2 | `auth_attempts` | Registro de intentos de autenticación | ✅ |
| 3 | `profiles` | Perfiles extendidos de usuarios | ✅ |
| 4 | `roles` | Roles del sistema (admin, teacher, student) | ✅ |
| 5 | `auth_providers` | Proveedores OAuth (Google, Facebook) | ✅ |
| 6 | `email_verification_tokens` | Tokens de verificación de email | ✅ |
| 7 | `password_reset_tokens` | Tokens de reset de contraseña | ✅ |
| 8 | `security_events` | Eventos de seguridad | ✅ |
| 9 | `user_preferences` | Preferencias de usuario | ✅ |
| 10 | `memberships` | Membresías usuario-tenant | ✅ |
| 11 | `user_sessions` | Sesiones activas de usuarios | ✅ |
| 12 | `user_suspensions` | Suspensiones de cuentas | ✅ |

**Relaciones Clave:**
- `tenants` → Raíz del multi-tenancy
- `profiles` → Extiende `auth.users`
- `memberships` → Liga users ↔ tenants
- `roles` → Define permisos (admin, teacher, student)

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/auth_management/`
- Backend: `apps/backend/src/modules/auth/`, `apps/backend/src/modules/users/`
- Seeds: `apps/database/seeds/auth_management/`

---

### gamification_system (16 tablas)

**Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/`
**Última actualización:** 2025-11-29

| # | Tabla | Propósito | Estado Doc | Entity TypeORM |
|---|-------|-----------|------------|----------------|
| 1 | `user_stats` | Estadísticas de usuario (puntos, nivel, racha) | ✅ | ✅ |
| 2 | `user_ranks` | Historial de rangos del usuario | ✅ | ✅ |
| 3 | `achievements` | Catálogo de logros | ✅ | ✅ |
| 4 | `user_achievements` | Logros desbloqueados por usuario | ✅ | ✅ |
| 5 | `ml_coins_transactions` | Transacciones de monedas ML (Maya Learning) | ✅ | ✅ |
| 6 | `missions` | Misiones diarias/semanales | ✅ | ✅ |
| 7 | `comodines_inventory` | Inventario de comodines (power-ups) | ✅ | ✅ |
| 8 | `notifications` | Notificaciones de gamificación | ✅ ⚠️ | ✅ |
| 9 | `leaderboard_metadata` | Metadata de leaderboards | ✅ | ✅ |
| 10 | `achievement_categories` | Categorías de logros | ✅ | ✅ |
| 11 | `active_boosts` | Boosts activos del usuario | ✅ | ✅ |
| 12 | `inventory_transactions` | Historial de transacciones de inventario | ✅ | ✅ |
| 13 | `maya_ranks` | **[NUEVO]** Configuración de rangos Maya (referencia) | ✅ | ✅ |
| 14 | `comodin_usage_log` | **[NUEVO]** Historial detallado de uso de comodines | ✅ | ✅ |
| 15 | `comodin_usage_tracking` | **[NUEVO]** Tracking agregado de uso de comodines | ✅ | ⚠️ |
| 16 | `classroom_missions` | **[NUEVO]** Misiones asignadas por classroom | ✅ | ✅ |

**⚠️ Posible Duplicación:**
- `notifications` existe en **gamification_system** Y en **public**
- **Acción requerida:** Verificar si son tablas diferentes o duplicadas

**Sistema de Rangos Maya (Actualizado 2025-11-29):**
Tabla `maya_ranks` - Configuración de referencia:
1. **Ajaw** (Orden 1) - Principiante
2. **Nacom** (Orden 2) - Guerrero
3. **Ah K'in** (Orden 3) - Sacerdote
4. **Halach Uinic** (Orden 4) - Gobernante
5. **K'uk'ulkan** (Orden 5) - Serpiente Emplumada (Maestro)

Tabla `user_ranks` - Historial de progresión del usuario con porcentaje de avance.

**Comodines (Power-ups):**
Tabla `comodin_usage_log` registra uso detallado con:
- Tipo: `pistas`, `vision_lectora`, `segunda_oportunidad`
- Contexto: exercise_id, attempt_id, module_id
- Efecto aplicado y valor proporcionado (JSONB)

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/gamification_system/`
- Backend: `apps/backend/src/modules/gamification/`
- Frontend: `apps/frontend/src/features/gamification/`
- Seeds: `apps/database/seeds/gamification_system/`

---

### public (5 tablas) - ACTUALIZADO 2025-11-29

**Ubicación:** `apps/database/ddl/schemas/public/tables/`
**Estado:** ✅ **VALIDADO - Errores de documentación corregidos**
**Última actualización:** 2025-11-29

| # | Tabla | Propósito | Estado Doc | Nota |
|---|-------|-----------|------------|------|
| 1 | `assignments` | Asignaciones de ejercicios | ✅ | RF-TEACH-002 |
| 2 | `assignment_exercises` | Relación assignments ↔ exercises | ✅ | RF-TEACH-002 |
| 3 | `assignment_students` | Relación assignments ↔ students | ✅ | RF-TEACH-002 |
| 4 | `assignment_submissions` | Entregas de estudiantes | ✅ | RF-TEACH-002 |
| 5 | `teacher_notes` | Notas de profesores | ✅ | RF-TEACH-002 |

> **✅ CORREGIDO (2025-11-29):** El inventario anterior tenía errores de documentación.
>
> **Tablas que NO existen en public (eliminadas del inventario):**
> - ~~`public.classrooms`~~ → Solo existe `social_features.classrooms`
> - ~~`public.classroom_students`~~ → Solo existe `social_features.classroom_members`
> - ~~`public.notifications`~~ → Solo existe `notifications.notifications` (EXT-003)
> - ~~`public.assignment_classrooms`~~ → Movida a `social_features.assignment_classrooms`

### ✅ Duplicaciones Resueltas (2025-11-29)

| Tabla Reportada | Schema Real | Estado |
|-----------------|-------------|--------|
| `public.classrooms` | `social_features.classrooms` | ✅ NO DUPLICADA - Solo existe en social_features |
| `public.notifications` | `notifications.notifications` | ✅ NO DUPLICADA - Solo existe en notifications schema |
| `public.assignment_classrooms` | `social_features.assignment_classrooms` | ✅ MOVIDA - Documentado en RF-TEACH-002 |

### Sobre `gamification_system.notifications` (DEPRECATED)

```
⚠️ DEPRECATED: gamification_system.notifications
✅ ACTUAL: notifications.notifications (EXT-003)

La tabla gamification_system.notifications existe pero está DEPRECADA.
El sistema consolidado de notificaciones multi-canal usa notifications.notifications.
Ver: modules/notifications/entities/multichannel/notification.entity.ts
```

**Referencias SIMCO:**
- RF-TEACH-002-assignment-system.md (documentación de assignments)
- EXT-003 (Sistema Multi-Canal de Notificaciones)

---

### social_features (19 tablas)

**Ubicación:** `apps/database/ddl/schemas/social_features/tables/`
**Última actualización:** 2026-01-04 (ISS-DB-005: Inventario actualizado)

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `friendships` | Relaciones de amistad entre usuarios | ✅ |
| 2 | `schools` | Escuelas | ✅ |
| 3 | `classrooms` | Aulas/Clases | ✅ |
| 4 | `classroom_members` | Miembros de clases | ✅ |
| 5 | `teams` | Equipos de estudiantes | ✅ |
| 6 | `team_members` | Miembros de equipos | ✅ |
| 7 | `team_challenges` | Desafíos entre equipos | ✅ |
| 8 | `teacher_reports` | Reportes generados por teachers (Portal Teacher) | ✅ |
| 9 | `user_activities` | Actividades de usuarios | ✅ |
| 10 | `friend_requests` | Solicitudes de amistad | ✅ |
| 11 | `peer_challenges` | Desafíos entre pares | ✅ |
| 12 | `challenge_participants` | Participantes en desafíos | ✅ |
| 13 | `challenge_results` | Resultados de desafíos | ✅ |
| 14 | `assignment_classrooms` | Relación assignments ↔ classrooms | ✅ |
| 15 | `discussion_threads` | Hilos de discusión | ✅ |
| 16 | `social_interactions` | Interacciones sociales | ✅ |
| 17 | `teacher_classrooms` | Relación teachers ↔ classrooms | ✅ |
| 18 | `user_follows` | Seguimiento entre usuarios | ✅ |

**✅ Sin conflictos (Validado 2026-01-04):**
- `social_features.classrooms` es la ÚNICA tabla de classrooms (no existe en public)
- `social_features.classroom_members` es la ÚNICA tabla de miembros (no existe en public)
- `social_features.teacher_reports` para reportes del Portal Teacher (no confundir con admin_dashboard.admin_reports)

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/social_features/`
- Backend: `apps/backend/src/modules/social/`, `apps/backend/src/modules/teacher/`
- Frontend: `apps/frontend/src/features/social/`, `apps/frontend/src/apps/teacher/`

---

### audit_logging (6 tablas)

**Ubicación:** `apps/database/ddl/schemas/audit_logging/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `audit_logs` | Logs de auditoría general | ✅ |
| 2 | `performance_metrics` | Métricas de performance del sistema | ✅ |
| 3 | `system_alerts` | Alertas del sistema | ✅ |
| 4 | `system_logs` | Logs del sistema | ✅ |
| 5 | `user_activity_logs` | Logs de actividad de usuarios | ✅ |
| 6 | `user_activity` | Actividad reciente de usuarios | ✅ |

**Patrón:**
- Todas las tablas de auditoría son append-only
- Requieren particionamiento por fecha para escalabilidad
- RLS: Solo admins pueden leer

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/audit_logging/`
- Backend: `apps/backend/src/modules/audit/`

---

### content_management (5 tablas)

**Ubicación:** `apps/database/ddl/schemas/content_management/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `content_templates` | Plantillas de contenido | ✅ |
| 2 | `marie_curie_content` | Contenido de Marie Curie (personaje guía) | ✅ |
| 3 | `media_files` | Archivos multimedia | ✅ |
| 4 | `content_versions` | Versionado de contenido | ✅ |
| 5 | `flagged_content` | Contenido reportado/moderado | ✅ |

**Integración con storage:**
- `media_files` se integra con schema `storage`
- Files almacenados en MinIO/S3
- BD solo guarda metadata

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/content_management/`
- Backend: `apps/backend/src/modules/content/`
- Storage: Schema `storage`, MinIO/S3

---

### progress_tracking (5 tablas)

**Ubicación:** `apps/database/ddl/schemas/progress_tracking/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `module_progress` | Progreso por módulo | ✅ |
| 2 | `learning_sessions` | Sesiones de aprendizaje | ✅ |
| 3 | `exercise_attempts` | Intentos de ejercicios | ✅ |
| 4 | `exercise_submissions` | Entregas de ejercicios | ✅ |
| 5 | `scheduled_missions` | Misiones programadas | ✅ |

**Tabla de alto tráfico:**
- `exercise_attempts` y `learning_sessions` son las más escritas
- Requiere indexes optimizados por usuario y fecha
- Candidatas para particionamiento

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/progress_tracking/`
- Backend: `apps/backend/src/modules/progress/`
- Frontend: `apps/frontend/src/features/student-dashboard/`

---

### educational_content (15+ tablas)

**Ubicación:** `apps/database/ddl/schemas/educational_content/tables/`
**Última actualización:** 2025-11-29

| # | Tabla | Propósito | Estado Doc | Entity TypeORM |
|---|-------|-----------|------------|----------------|
| 1 | `modules` | Módulos educativos | ✅ | ✅ |
| 2 | `exercises` | Ejercicios/Actividades | ✅ | ✅ |
| 3 | `assessment_rubrics` | Rúbricas de evaluación | ✅ | ✅ |
| 4 | `media_resources` | Recursos multimedia educativos | ✅ | ✅ |
| 5 | `assignments` | Tareas asignadas por profesores | ✅ | ✅ |
| 6 | `assignment_exercises` | Ejercicios en una tarea | ✅ | ✅ |
| 7 | `assignment_students` | Tareas asignadas a estudiantes | ✅ | ✅ |
| 8 | `assignment_submissions` | Entregas de estudiantes | ✅ | ✅ |
| 9 | `content_approvals` | Aprobaciones de contenido | ✅ | ✅ |
| 10 | `difficulty_criteria` | **[NUEVO]** Criterios CEFR (A1-C2+) | ✅ | ✅ |
| 11 | `exercise_mechanic_mapping` | Mapeo ejercicio → mecánica | ✅ | ✅ |
| 12 | `exercise_validation_config` | Configuración de validación | ✅ | ⚠️ |
| 13 | `classroom_modules` | Módulos asignados a classrooms | ✅ | ⚠️ |
| 14 | `teacher_content` | Contenido personalizado de profesor | ✅ | ✅ |
| 15+ | _otros_ | Tablas deprecadas/migradas | ⚠️ | - |

**Tabla difficulty_criteria (CEFR Levels):**
Define criterios por nivel de dificultad:
- **Niveles:** A1, A2, B1, B2, B2+, C1, C2, C2+
- **Criterios:** vocab_range, sentence_length, time_multiplier
- **Recompensas:** base_xp, base_coins por nivel
- **Promoción:** success_rate requerido, min_exercises

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/educational_content/`
- Backend: `apps/backend/src/modules/educational/`, `apps/backend/src/modules/assignments/`
- Frontend: `apps/frontend/src/features/learning/`, `apps/frontend/src/features/assignments/`

---

### system_configuration (3 tablas)

**Ubicación:** `apps/database/ddl/schemas/system_configuration/tables/`

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `system_settings` | Configuración global del sistema | ✅ |
| 2 | `feature_flags` | Feature flags (A/B testing, rollout) | ✅ |
| 3 | `notification_settings` | Configuración de notificaciones | ✅ |

**Patrón Key-Value:**
- Tablas diseñadas con patrón key-value para flexibilidad
- RLS: Solo role `admin` puede modificar
- Backend cachea estos valores

**Referencias SIMCO:**
- Docs: `docs/03-desarrollo/base-de-datos/schemas/system_configuration/`
- Backend: `apps/backend/src/modules/config/`

---

### notifications (6 tablas) ✨ NUEVO - EXT-003

**Ubicación:** `apps/database/ddl/schemas/notifications/tables/`
**Estado:** ✅ **Sistema Multi-Canal de Notificaciones**
**Última actualización:** 2025-11-29

| # | Tabla | Propósito | Estado Doc |
|---|-------|-----------|------------|
| 1 | `notifications` | Notificaciones multi-canal (in_app, email, push) | ✅ |
| 2 | `notification_preferences` | Preferencias de usuario por tipo/canal | ✅ |
| 3 | `notification_logs` | Historial de envíos y resultados | ✅ |
| 4 | `notification_templates` | Plantillas de notificaciones | ✅ |
| 5 | `notification_queue` | Cola de procesamiento asíncrono | ✅ |
| 6 | `user_devices` | Dispositivos registrados para push | ✅ |

**Arquitectura EXT-003:**
- Sistema consolidado que reemplaza `gamification_system.notifications` (deprecated)
- Soporte multi-canal: in_app, email, push
- Procesamiento asíncrono mediante cola
- Templates con variables dinámicas

**Referencias SIMCO:**
- Docs: `docs/03-fase-extensiones/EXT-003-notificaciones/`
- Backend: `apps/backend/src/modules/notifications/`
- Entity: `modules/notifications/entities/multichannel/`

---

## 📊 Análisis Estadístico

### Distribución por Schema (Actualizado 2025-11-29)

```
gamification_system  ████████████████████ 16 (20%)
auth_management      ████████████████ 12 (15%)
educational_content  ██████████████ 10+ (13%)
social_features      ██████████ 8 (10%)
audit_logging        ████████ 6 (8%)
notifications        ████████ 6 (8%) ✨ NUEVO EXT-003
content_management   ██████ 5 (6%)
progress_tracking    ██████ 5 (6%)
public               ██████ 5 (6%) ✅ CORREGIDO
system_config        ████ 3 (4%)
auth                 ██ 1 (1%)
```
**Total estimado: 77+ tablas**

### Por Tipo de Funcionalidad

| Tipo | Tablas | Schemas |
|------|--------|---------|
| **Core/Auth** | 13 | auth, auth_management |
| **Features** | 33 | gamification, educational, progress, content, social |
| **System** | 9 | system_config, audit |
| **Legacy/Unclear** | 9 | public ⚠️ |

### Tablas de Alto Tráfico (Writes)

1. `progress_tracking.exercise_attempts` - Alta escritura
2. `progress_tracking.learning_sessions` - Alta escritura
3. `gamification_system.ml_coins_transactions` - Media-Alta escritura
4. `audit_logging.user_activity_logs` - Alta escritura
5. `auth_management.user_sessions` - Media escritura

**Recomendación:** Considerar particionamiento por fecha para estas tablas.

---

## 🚨 Discrepancias y Problemas Identificados

### 1. Duplicación de Tablas (CRÍTICO)

| Tabla | Schema 1 | Schema 2 | Acción |
|-------|----------|----------|--------|
| `classrooms` | social_features | public | Consolidar |
| `classroom_members/students` | social_features | public | Consolidar |
| `notifications` | gamification_system | public | Consolidar |

### 2. Tablas en Schema Incorrecto

| Tabla | Schema Actual | Schema Sugerido | Razón |
|-------|---------------|-----------------|-------|
| `assignments` | public | educational_content | Funcionalidad educativa |
| `assignment_*` (5 tablas) | public | educational_content | Funcionalidad educativa |
| `teacher_notes` | public | educational_content | Funcionalidad educativa |

### 3. Conteo de Tablas Documentadas

**Documentado originalmente:** 48 tablas
**Real:** 64 tablas
**Diferencia:** +16 tablas

**Las 16+ tablas no documentadas probablemente son:**
1. Las 9 tablas de `public` (todas sin documentar)
2. Posibles tablas nuevas en otros schemas

### 4. Schema public - Análisis Requerido

**Total de tablas en public:** 9 tablas (14% del total)

**Estado:** Todas sin documentar

**Posibles escenarios:**
1. **Legacy de migración:** Tablas del sistema anterior no migradas
2. **Desarrollo temporal:** Tablas creadas durante desarrollo
3. **Funcionalidad activa:** Sistema de assignments que debería moverse

**Recomendación:**
- **Investigar uso actual:** Consultar backend para ver si hay EntityORMentities usando estas tablas
- **Si activo:** Migrar a schemas correctos
- **Si legacy:** Crear plan de deprecación
- **Si duplicado:** Consolidar con tablas existentes

---

## 🎯 Plan de Acción

### Fase 2A: Análisis de Duplicación (Urgente)

- [ ] **Comparar esquemas:**
  ```sql
  -- Comparar public.classrooms vs social_features.classrooms
  \d public.classrooms
  \d social_features.classrooms

  -- Comparar public.notifications vs gamification_system.notifications
  \d public.notifications
  \d gamification_system.notifications
  ```

- [ ] **Verificar uso en backend:**
  ```bash
  # Buscar referencias a public.classrooms
  grep -r "public.classrooms" apps/backend/
  grep -r "social_features.classrooms" apps/backend/
  ```

- [ ] **Contar registros:**
  ```sql
  SELECT 'public.classrooms' as tabla, count(*) FROM public.classrooms
  UNION ALL
  SELECT 'social_features.classrooms', count(*) FROM social_features.classrooms;
  ```

### Fase 2B: Documentar Tablas Faltantes

- [ ] Documentar las 9 tablas de `public`
- [ ] Identificar cualquier otra tabla no documentada
- [ ] Crear diagramas ERD completos

### Fase 2C: Plan de Consolidación

Una vez identificadas las duplicaciones:

1. **Determinar tabla "correcta"** (la más usada, mejor diseño)
2. **Migrar datos** de tabla incorrecta a correcta
3. **Actualizar referencias** en backend
4. **Deprecar tabla antigua** (no eliminar inmediatamente)
5. **Validar en QA/staging**
6. **Eliminar tabla deprecated** después de período de gracia

---

## 📎 Referencias SIMCO

**Este documento es parte del sistema SIMCO (Sistema Indexado Modular por Contexto)**

### Referencias Cruzadas
- **Inventario anterior:** `01-SCHEMAS-INVENTORY.md`
- **Siguiente inventario:** `03-ENUMS-INVENTORY.md`
- **Plan maestro:** `apps/database/PLAN-ACTUALIZACION-DOCUMENTACION.md`
- **Documentación schemas:** `docs/03-desarrollo/base-de-datos/schemas/`

### Scripts Relacionados
- **Script de inventario:** `apps/database/scripts/inventory/list-tables.sh`
- **DDL Source:** `apps/database/ddl/schemas/*/tables/*.sql`
- **Seeds:** `apps/database/seeds/*/`

---

**Generado por:** Sistema de inventario automatizado SIMCO
**Método:** Análisis de estructura DDL + scripts bash
**Estado:** ⚠️ Requiere validación de duplicaciones y consolidación de public schema
**Próxima acción:** Análisis de duplicación de tablas + inventario de ENUMs
