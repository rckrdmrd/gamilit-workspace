---
titulo: Schema 11 - Missions (gamification_system)
tipo: arquitectura
subtipo: schema-reference
schema: gamification_system
ultima_actualizacion: 2026-02-27
---

# Schema 11: Missions — gamification_system (3 tablas, RLS via 07d)

> **Version:** 2.1.0 | **Fecha:** 2026-02-21
> Las misiones residen en `gamification_system`, no en un schema separado.
> DDL: `apps/database/ddl/schemas/gamification_system/tables/`

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

## Arquitectura del Sistema de Misiones

El sistema usa un modelo **template → instancia por usuario**:

1. **mission_templates** — Catalogo de plantillas (12 templates: 5 daily + 6 weekly + 2 special)
2. **missions** — Instancias por usuario generadas desde templates (3 daily + 5 weekly al registrarse)
3. **classroom_missions** — Misiones asignadas por maestros a aulas

### Ciclo de Vida

```
DB trigger (registro) → 8 missions iniciales (3 daily + 5 weekly)
Cron diario 00:00 MX → expira missions pasadas
Cron semanal lunes 00:00 MX → expira missions semanales pasadas
Backend on-demand → genera nuevas si no existen activas
Cron 03:00 MX → cleanup expired > 90 dias (REC-010)
```

---

### gamification_system.mission_templates
Catalogo de plantillas para generar misiones automaticamente.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre del template |
| description | TEXT | NULL | NULL | Descripcion |
| type | mission_type | NOT NULL | - | daily, weekly, special, classroom |
| category | VARCHAR(50) | NOT NULL | 'exercise' | exercise, streak, progress, mastery, strategy, exploration, completion |
| target_type | VARCHAR(50) | NOT NULL | - | complete_exercises, correct_streak, earn_xp, perfect_scores, use_comodines, daily_streak, explore_modules, complete_modules |
| target_value | INTEGER | NOT NULL | 1 | Cantidad objetivo |
| xp_reward | INTEGER | NOT NULL | 0 | XP recompensa |
| ml_coins_reward | INTEGER | NOT NULL | 0 | ML Coins recompensa |
| badge_id | UUID | NULL | NULL | FK gamification_system.badges |
| difficulty | VARCHAR(20) | NOT NULL | 'normal' | easy, normal, hard, epic |
| is_active | BOOLEAN | NOT NULL | true | Template activo |
| priority | INTEGER | NOT NULL | 50 | Prioridad para seleccion aleatoria |
| min_level | INTEGER | NOT NULL | 1 | Nivel minimo requerido |
| max_level | INTEGER | NULL | NULL | Nivel maximo (NULL = sin limite) |
| required_module | VARCHAR(100) | NULL | NULL | Modulo especifico requerido |
| required_exercise_type | VARCHAR(50) | NULL | NULL | Tipo de ejercicio requerido (e.g., crucigrama, detective_textual) |
| exercise_id | UUID | NULL | NULL | FK educational_content.exercises — vincula template a ejercicio concreto |
| icon | VARCHAR(10) | NULL | NULL | Emoji del template |
| color | VARCHAR(20) | NULL | NULL | Color hex |
| metadata | JSONB | NOT NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | now_mexico() | - |
| created_by | UUID | NULL | NULL | FK auth_management.profiles |

**RLS:** SI (via 07d)
**Entity:** `MissionTemplate` (`gamification/entities/mission-template.entity.ts`)
**Seeds:** 12 templates (5 daily + 6 weekly + 2 special) en `seeds/*/gamification_system/10-mission_templates.sql`

---

### gamification_system.missions
Instancias de misiones por usuario, generadas desde templates.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| template_id | UUID | NOT NULL | - | FK gamification_system.mission_templates (REC-009: migrado de TEXT a UUID) |
| exercise_id | UUID | NULL | NULL | FK educational_content.exercises — propagado desde template al crear mision |
| title | VARCHAR(200) | NOT NULL | - | Titulo de la mision |
| description | TEXT | NULL | NULL | Descripcion |
| mission_type | mission_type | NOT NULL | - | daily, weekly, special, classroom |
| objectives | JSONB | NOT NULL | '[]' | Array de objetivos con progreso |
| rewards | JSONB | NOT NULL | '{}' | { xp, ml_coins, badge_id } |
| progress | NUMERIC(5,2) | NOT NULL | 0 | Progreso 0-100% |
| status | mission_status | NOT NULL | 'active' | active, in_progress, completed, claimed, expired |
| start_date | TIMESTAMPTZ | NOT NULL | NOW() | Inicio |
| end_date | TIMESTAMPTZ | NOT NULL | - | Expiracion |
| completed_at | TIMESTAMPTZ | NULL | NULL | Cuando se completo |
| claimed_at | TIMESTAMPTZ | NULL | NULL | Cuando se reclamo |
| created_at | TIMESTAMPTZ | NOT NULL | now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | now_mexico() | - |

**Constraints:**
- `missions_template_id_fkey` FK → `mission_templates(id)` (REC-009)
- `missions_user_template_type_date_unique` UNIQUE (`user_id`, `template_id`, `mission_type`, `end_date`) (REC-001)
- `missions_exercise_id_fkey` FK → `educational_content.exercises(id)` ON DELETE SET NULL

**RLS:** SI (via 07d)
**Entity:** `Mission` (`gamification/entities/mission.entity.ts`)

---

### gamification_system.classroom_missions (cross-schema)
Misiones asignadas por maestros a aulas completas.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| classroom_id | UUID | NOT NULL | - | FK social_features.classrooms |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles |
| mission_template_id | UUID | NOT NULL | - | FK gamification_system.mission_templates (REC-009) |
| title | VARCHAR(200) | NOT NULL | - | Titulo personalizado |
| description | TEXT | NULL | NULL | Descripcion personalizada |
| objectives | JSONB | NOT NULL | '[]' | Objetivos |
| rewards | JSONB | NOT NULL | '{}' | Recompensas |
| start_date | TIMESTAMPTZ | NOT NULL | NOW() | Inicio |
| end_date | TIMESTAMPTZ | NOT NULL | - | Expiracion |
| status | VARCHAR(20) | NOT NULL | 'active' | active, completed, cancelled |
| created_at | TIMESTAMPTZ | NOT NULL | now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | now_mexico() | - |

**RLS:** SI (via 07d)
**Entity:** `ClassroomMission` (`gamification/entities/classroom-mission.entity.ts`)
**DDL:** `tables/_cross_schema/16-classroom_missions.sql`

---

## Funciones Relacionadas

| Funcion | Archivo | Descripcion |
|---------|---------|-------------|
| `initialize_user_missions(UUID)` | `gamilit/functions/18-initialize_user_missions.sql` | Crea 8 misiones iniciales (3 daily + 5 weekly) usando UUID lookup de templates |
| `check_and_award_achievements()` | `gamification_system/functions/check_and_award_achievements.sql` | **@DEPRECATED (REC-005)** — Evaluacion de logros se hace en backend |

## Cron Jobs

| Job | Schedule | Timezone | Descripcion |
|-----|----------|----------|-------------|
| `daily-missions-reset` | `0 0 * * *` | America/Mexico_City | Expira misiones diarias pasadas |
| `weekly-missions-reset` | `0 0 * * 1` | America/Mexico_City | Expira misiones semanales pasadas |
| `check-missions-progress` | `*/5 * * * *` | America/Mexico_City | Monitoreo (progreso via DB triggers) |
| `cleanup-expired-missions` | `0 3 * * *` | America/Mexico_City | Elimina expired > 90 dias (REC-010) |

---

*Generado: 2026-02-21 | Sistema SIMCO v4.0.0*
