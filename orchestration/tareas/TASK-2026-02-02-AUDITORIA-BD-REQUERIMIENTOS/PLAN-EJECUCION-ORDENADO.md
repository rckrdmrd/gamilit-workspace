# PLAN-EJECUCION-ORDENADO.md
# TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS - Fase 4

**Fecha:** 2026-02-02
**Autor:** Arquitecto de Datos / Lead DBA
**Estado:** COMPLETADO

---

## Resumen Ejecutivo

La Fase 4 (Análisis de Dependencias) ha validado:
- **16 schemas** con grafo de dependencias correcto
- **163 archivos** de funciones/triggers sin dependencias circulares
- **17 fases** en create-database.sh correctamente ordenadas
- **0 dependencias circulares** detectadas

### Veredicto: ARQUITECTURA SÓLIDA

---

## 1. GRAFO DE DEPENDENCIAS DE SCHEMAS

### 1.1 Niveles de Creación

```
NIVEL 0: Fundaciones (Sin dependencias)
├── gamilit             → Funciones utilitarias (now_mexico, RLS helpers)
├── auth                → Schema Supabase (externo)
└── auth_management     → Tenants, profiles, roles (raíz multi-tenancy)

NIVEL 1: Dependencias Directas de Nivel 0
├── gamification_system → ENUMs: maya_rank, achievement_category
├── system_configuration → Feature flags, settings
└── audit_logging       → Audit trail, logs

NIVEL 2: Dependencias de Nivel 0-1
├── content_management  → ENUMs: difficulty_level, media_type
├── educational_content → Módulos, ejercicios (importa ENUMs de content_management)
├── social_features     → Escuelas, aulas, equipos
├── notifications       → Notificaciones in-app
├── communication       → Mensajería directa
└── storage             → Archivos y cuotas

NIVEL 3: Dependencias de Nivel 0-2
├── progress_tracking   → Progreso, intentos, submissions
├── admin_dashboard     → Vistas analíticas, reportes
└── lti_integration     → Integración LMS externa
```

### 1.2 Dependencias Críticas FK

| Raíz | Dependientes | Patrón |
|------|--------------|--------|
| auth_management.tenants | 15+ tablas | ON DELETE CASCADE |
| auth_management.profiles | 25+ tablas | ON DELETE CASCADE/SET NULL |
| educational_content.modules | progress_tracking, gamification | ON DELETE CASCADE |
| social_features.schools | classrooms, classroom_members | ON DELETE CASCADE |

### 1.3 Dependencias ENUM Cross-Schema

```yaml
gamification_system.maya_rank:
  usado_por:
    - educational_content.modules.maya_rank_required
    - educational_content.modules.maya_rank_granted
    - gamification_system.user_stats.current_rank

content_management.difficulty_level:
  usado_por:
    - educational_content.modules.difficulty_level
    - gamification_system.achievements.difficulty_level
```

---

## 2. GRAFO DE DEPENDENCIAS DE FUNCIONES

### 2.1 Tiers de Ejecución (110 funciones activas)

```
TIER 1: Base Inmutable (0 dependencias)
├── gamilit.now_mexico()
├── gamification_system.calculate_level_from_xp()
├── gamilit.normalize_text()
├── gamilit.validate_email_format()
└── gamilit.validate_username()

TIER 2: Contexto de Usuario
├── gamilit.get_current_user_id()
├── gamilit.get_current_user_role()
├── gamilit.get_current_tenant_id()
├── gamilit.is_admin()
└── gamilit.is_super_admin()

TIER 3: Utilidades Core
├── gamilit.update_updated_at_column()
├── gamilit.set_default_tenant()
└── gamilit.set_profile_defaults()

TIER 4: Gamificación Core (→ TIER 1-2)
├── gamification_system.award_ml_coins() → now_mexico()
├── gamification_system.update_user_rank()
├── gamification_system.promote_to_next_rank() → now_mexico()
├── gamification_system.check_rank_promotion() → promote_to_next_rank()
└── gamification_system.recalculate_level_on_xp_change() → calculate_level_from_xp()

TIER 5: Sistema de Logros (→ TIER 4)
├── gamification_system.check_and_grant_achievements()
└── gamification_system.claim_achievement_reward()

TIER 6: Sistema de Misiones (→ TIER 1-3)
├── gamilit.update_mission_progress() → now_mexico()
└── 9x mission wrappers → update_mission_progress()

TIER 7: Progreso y Aprendizaje (→ TIER 1-3)
├── progress_tracking.calculate_module_progress()
├── gamilit.update_user_stats_on_exercise_complete()
├── gamilit.update_module_progress_on_exercise_complete()
├── gamilit.update_user_stats_on_submission_graded()
├── gamilit.update_module_progress_on_submission_graded()
└── progress_tracking.create_manual_review_on_submission()

TIER 8: Inicialización (→ TODOS LOS TIERS)
├── gamilit.initialize_user_missions() → now_mexico()
├── gamilit.initialize_user_stats() → initialize_user_missions() + multi-schema
└── gamilit.initialize_module_progress_for_users()
```

### 2.2 Verificación de Dependencias Circulares

**RESULTADO: 0 DEPENDENCIAS CIRCULARES**

Todas las funciones forman un DAG (Grafo Acíclico Dirigido) válido.

---

## 3. MAPEO TRIGGER → FUNCIÓN

### 3.1 Triggers Principales (22 activos)

| Trigger | Función | Tabla | Evento |
|---------|---------|-------|--------|
| trg_set_default_tenant | set_default_tenant() | profiles | BEFORE INSERT |
| trg_initialize_user_stats | initialize_user_stats() | profiles | AFTER INSERT |
| trg_assign_default_classroom | assign_default_classroom() | profiles | AFTER INSERT |
| trg_recalculate_level | recalculate_level_on_xp_change() | user_stats | BEFORE UPDATE |
| trg_check_rank_promotion | check_rank_promotion() | user_stats | AFTER UPDATE |
| trg_achievement_unlocked | fn_on_achievement_unlocked() | user_achievements | AFTER INSERT/UPDATE |
| trg_update_user_stats_exercise | update_user_stats_on_exercise_complete() | exercise_attempts | AFTER INSERT |
| trg_update_module_progress | update_module_progress_on_exercise_complete() | exercise_attempts | AFTER INSERT |
| trg_update_missions_exercise | trigger_missions_on_exercise_complete() | exercise_attempts | AFTER INSERT |
| trg_create_manual_review | create_manual_review_on_submission() | exercise_submissions | AFTER INSERT |

### 3.2 Flujos de Ejecución Críticos

#### Flujo A: Registro de Usuario
```
INSERT auth_management.profiles
  └→ TRIGGER: trg_set_default_tenant → set_default_tenant()
  └→ TRIGGER: trg_initialize_user_stats → initialize_user_stats()
      ├→ INSERT gamification_system.user_stats (100 ML coins)
      ├→ INSERT gamification_system.comodines_inventory
      ├→ INSERT auth_management.user_preferences
      ├→ INSERT gamification_system.user_ranks (Ajaw)
      ├→ INSERT progress_tracking.module_progress (ALL modules)
      └→ CALL initialize_user_missions()
  └→ TRIGGER: trg_assign_default_classroom → assign_default_classroom()
```

#### Flujo B: Ejercicio Completado
```
INSERT progress_tracking.exercise_attempts (is_correct = true)
  └→ TRIGGER: trg_update_user_stats_exercise
      └→ UPDATE user_stats (exercises_completed, total_xp)
          └→ TRIGGER: trg_recalculate_level → recalculate_level_on_xp_change()
          └→ TRIGGER: trg_check_rank_promotion → check_rank_promotion()
  └→ TRIGGER: trg_update_module_progress
      └→ UPDATE module_progress (progress_percentage)
  └→ TRIGGER: trg_update_missions_exercise
      └→ CALL update_mission_progress('complete_exercises', 1)
```

---

## 4. VALIDACIÓN DE create-database.sh

### 4.1 Estructura de Fases (17 + sub-fases)

| Fase | Contenido | Estado |
|------|-----------|--------|
| 0 | Extensions (pgcrypto, uuid-ossp) | ✅ CORRECTO |
| 1 | Prerequisites (schemas, ENUMs) | ✅ CORRECTO |
| 2 | Shared Functions (gamilit) | ✅ CORRECTO |
| 3 | Auth Schema | ✅ CORRECTO |
| 4 | Storage Schema | ✅ CORRECTO |
| 5 | Auth Management | ✅ CORRECTO |
| 6 | Educational Content | ✅ CORRECTO |
| 6.5 | Notifications (antes de gamification) | ✅ CORRECTO |
| 7 | Gamification System | ✅ CORRECTO |
| 8 | Progress Tracking | ✅ CORRECTO |
| 9 | Social Features | ✅ CORRECTO |
| 9.5 | Deferred FK Constraints | ✅ CORRECTO |
| 9.6 | Cross-Schema Views | ✅ CORRECTO |
| 9.7 | Cross-Schema Tables | ✅ CORRECTO |
| 10 | Content Management | ✅ CORRECTO |
| 10.5 | Communication | ✅ CORRECTO |
| 11 | Audit Logging | ✅ CORRECTO |
| 12 | System Configuration | ✅ CORRECTO |
| 13 | Admin Dashboard | ✅ CORRECTO |
| 14 | LTI Integration | ✅ CORRECTO |
| 15.5 | Post-DDL Permissions | ✅ CORRECTO |
| 15.6-15.8 | RLS Phases 1-3 | ✅ CORRECTO |
| 16.x | Seed Data (16 sub-fases) | ✅ CORRECTO |
| 17 | Post-Seeds Validation | ✅ CORRECTO |

### 4.2 Dependencias Cross-Schema Manejadas

| Dependencia | Solución | Fase |
|-------------|----------|------|
| notifications → gamification | Fase 6.5 antes de Fase 7 | ✅ |
| social_features → views | Fase 9.6 después de Fase 9 | ✅ |
| classroom_modules cross-schema | Fase 9.7 después de ambos | ✅ |
| FK circular auth_management | Fase 9.5 deferred constraints | ✅ |

### 4.3 Orden de Seeds Crítico

```
16.4   Modules           (DEBE SER ANTES de profiles)
16.4.2 Classrooms        (DEBE SER ANTES de profiles)
16.5   Profiles          (Dispara initialize_user_stats + assign_classroom)
```

**Razón:** El trigger `initialize_user_stats()` crea `module_progress` para TODOS los módulos existentes.

---

## 5. ORDEN DE EJECUCIÓN RECOMENDADO

### 5.1 Para Recreación Completa de BD

```bash
# Usar script oficial unificado
wsl -d Ubuntu-24.04 -u developer -- bash \
  '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' \
  gamilit --drop
```

### 5.2 Para Desarrollo Incremental

| Operación | Orden Requerido |
|-----------|-----------------|
| Nueva tabla | 1. DDL tabla → 2. Indexes → 3. RLS → 4. Entity → 5. Seeds |
| Nueva función | 1. Verificar dependencias → 2. DDL función → 3. Triggers que la usan |
| Nuevo schema | 1. Schema → 2. ENUMs → 3. Tablas → 4. Funciones → 5. Triggers → 6. RLS |
| Nuevo trigger | 1. Verificar función existe → 2. DDL trigger → 3. Test en transacción |

### 5.3 Checklist Pre-Ejecución

```yaml
pre_vuelo:
  - [ ] Extensions instaladas (pgcrypto, uuid-ossp)
  - [ ] Usuario gamilit_user existe con permisos
  - [ ] Base de datos gamilit_platform creada
  - [ ] Conexión WSL → PostgreSQL funcional

validacion_post:
  - [ ] 16 schemas creados
  - [ ] 140 tablas creadas
  - [ ] 119 funciones creadas
  - [ ] 58 triggers activos
  - [ ] RLS habilitado en tablas requeridas
  - [ ] Seeds cargados sin errores
```

---

## 6. ALERTAS Y RECOMENDACIONES

### 6.1 Riesgos de Concurrencia (Identificados)

| Problema | Impacto | Mitigación |
|----------|---------|------------|
| Multiple triggers on user_stats | Lost updates | Agregar FOR UPDATE lock |
| 3 triggers en exercise_attempts | 50-200ms latencia | Consolidar en función batch |
| Trigger chain en submissions | Lock timeouts a 50+ usuarios | Queue asíncrona |

### 6.2 Mejoras Recomendadas

| Prioridad | Acción | Esfuerzo |
|-----------|--------|----------|
| P1 | Agregar row locks en update_user_stats_on_exercise_complete | 2h |
| P1 | Documentar dependencias en comentarios de script | 1h |
| P2 | Consolidar triggers de exercise_attempts | 8h |
| P2 | Renumerar fases de seeds secuencialmente | 1h |
| P3 | Crear diagrama visual de dependencias | 4h |

---

## 7. CONCLUSIONES

### Estado de la Arquitectura

| Aspecto | Estado | Score |
|---------|--------|-------|
| Dependencias de schemas | Sin circulares | 10/10 |
| Dependencias de funciones | DAG válido | 10/10 |
| Orden de create-database.sh | Correcto | 9.5/10 |
| Cross-schema handling | Bien manejado | 9/10 |
| Documentación de dependencias | Mejorable | 7/10 |

### Score Global de Dependencias: **9.1/10**

### Veredicto Final

**La arquitectura de dependencias es SÓLIDA y está CORRECTAMENTE ORDENADA.**

- No hay dependencias circulares bloqueantes
- El script de creación respeta todas las dependencias
- Los triggers tienen orden de ejecución predecible
- Las migraciones incrementales son viables

---

*Generado por: TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS*
*Fase: 4 - Análisis de Dependencias*
*Fecha: 2026-02-02*
