# F1: ANALISIS INICIAL - TAREA-007 SHARED SCHEMAS

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-007 |
| **Modulos** | gamilit (utility), content_management |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Agente** | @PERFIL_ORQUESTADOR |

---

## 1. OBJETIVO

Realizar analisis inicial de los schemas compartidos/utilitarios (gamilit) y gestion de contenido (content_management) para completar el inventario de la base de datos del proyecto GAMILIT.

---

## 2. RESUMEN EJECUTIVO

### 2.1 Metricas por Schema

| Schema | Tablas | Enums | Funciones | Triggers | Views |
|--------|--------|-------|-----------|----------|-------|
| **gamilit** | 0 | 0 | 29 | 0* | 1 |
| **content_management** | 10 | 4 | 4 | 4 | 0 |
| **TOTAL** | 10 | 4 | 33 | 4 | 1 |

*gamilit provee funciones trigger que son invocadas por otros schemas

### 2.2 Naturaleza de los Schemas

| Schema | Tipo | Proposito |
|--------|------|-----------|
| **gamilit** | Utility/Shared | Funciones reutilizables, triggers, validaciones, inicializacion |
| **content_management** | Feature | Templates, multimedia, versionado, moderacion |

---

## 3. SCHEMA GAMILIT (UTILITY)

### 3.1 Descripcion

Schema de utilidades compartidas. **NO contiene tablas ni enums** - solo funciones reutilizables invocadas por otros schemas.

### 3.2 Funciones por Categoria (29 Total)

#### Autenticacion y Autorizacion (4)

| Funcion | Proposito |
|---------|-----------|
| get_current_user_id() | Retorna UUID del usuario autenticado (session variable) |
| get_current_user_role() | Retorna rol del usuario actual |
| is_admin() | Verifica si usuario tiene rol admin (SECURITY DEFINER) |
| is_super_admin() | Alias de is_admin() para compatibilidad RLS |

#### Inicializacion de Usuario (6)

| Funcion | Proposito |
|---------|-----------|
| initialize_user_stats() | TRIGGER: Crea registros gamification al crear profile |
| initialize_user_missions() | Crea 3 misiones diarias + 5 semanales |
| initialize_module_progress_for_users() | Backfill progress para usuarios existentes |
| assign_default_classroom() | TRIGGER: Asigna estudiantes a classroom default |
| set_profile_defaults() | TRIGGER: Valores default en nuevo profile |
| set_default_tenant() | TRIGGER: Asigna tenant principal |

#### Gamificacion y Stats (4)

| Funcion | Proposito |
|---------|-----------|
| update_user_stats_on_exercise_complete() | TRIGGER: Actualiza XP/ML Coins |
| update_user_stats_on_submission_graded() | TRIGGER: Stats para ejercicios calificados |
| update_module_progress_on_exercise_complete() | TRIGGER: Progreso de modulo |
| update_module_progress_on_submission_graded() | TRIGGER: Progreso por submissions |

#### Sistema de Misiones - Arquitectura Unificada (10)

| Funcion | Proposito |
|---------|-----------|
| update_mission_progress() | **CORE**: Funcion unificada parametrizada |
| trigger_missions_on_exercise_complete() | Wrapper: complete_exercises |
| trigger_missions_on_earn_xp() | Wrapper: earn_xp |
| trigger_missions_on_correct_streak() | Wrapper: correct_streak |
| trigger_missions_on_daily_streak() | Wrapper: daily_streak |
| trigger_missions_on_use_comodines() | Wrapper: use_comodines |
| trigger_missions_on_perfect_scores() | Wrapper: perfect_scores |
| trigger_missions_on_complete_modules() | Wrapper: complete_modules |
| trigger_missions_on_explore_modules() | Wrapper: explore_modules |
| trigger_missions_on_submission() | Wrapper: submit_exercises |

#### Auditoria y Actividad (3)

| Funcion | Proposito |
|---------|-----------|
| audit_profile_changes() | TRIGGER: Log cambios de rol/status |
| update_user_last_login() | Actualiza last_activity_at |
| update_classroom_member_count() | TRIGGER: Mantiene conteo de miembros |

#### Utilidades y Validacion (6)

| Funcion | Proposito |
|---------|-----------|
| now_mexico() | Timestamp en America/Mexico_City |
| normalize_text() | Normaliza texto (acentos, espacios) |
| validate_email_format() | Valida formato email con regex |
| validate_username() | Valida username (3-30 chars) |
| validate_date_range() | Valida rangos de fechas |
| update_updated_at_column() | TRIGGER: Auto-update timestamp |

### 3.3 Views (1)

| View | Proposito |
|------|-----------|
| number_series | Genera secuencia 1-1000 para operaciones batch |

### 3.4 Funciones Deprecadas (8)

Ubicacion: `functions/_deprecated/`
- Funciones de mision individuales reemplazadas por arquitectura unificada (DB-157)
- ~1,100 lineas reducidas a ~150 lineas

---

## 4. SCHEMA CONTENT_MANAGEMENT

### 4.1 Tablas (10)

| # | Tabla | Proposito |
|---|-------|-----------|
| 1 | content_templates | Templates reutilizables (exercise, module, assessment) |
| 2 | marie_curie_content | Contenido curado sobre Marie Curie |
| 3 | media_files | Almacenamiento multimedia (images, video, audio, docs) |
| 4 | media_metadata | Metadata extendida (duracion, resolucion, codec) |
| 5 | content_versions | Control de versiones con snapshots JSONB |
| 6 | flagged_content | Contenido reportado para moderacion |
| 7 | moderation_rules | Reglas automaticas de moderacion |
| 8 | tags | Catalogo maestro de tags |
| 9 | content_authors | Perfiles de creadores/teachers |
| 10 | content_categories | Categorias jerarquicas |

### 4.2 Enums (4)

| Enum | Valores | Uso |
|------|---------|-----|
| content_status | draft, published, archived, under_review | Estado de contenido |
| content_type | video, text, interactive, quiz, game, simulation | Tipo de contenido |
| media_type | image, video, audio, document, interactive, animation | Tipo de multimedia |
| processing_status | uploading, processing, ready, error, optimizing | Estado de procesamiento |

### 4.3 Funciones (4)

| Funcion | Proposito |
|---------|-----------|
| apply_moderation_rules() | Motor principal de moderacion |
| check_keyword_rule() | Helper: verifica keywords prohibidos |
| check_pattern_rule() | Helper: verifica patrones regex |
| auto_moderate_content() | Wrapper: retorna resultados como JSONB |

### 4.4 Triggers (4)

| Trigger | Tabla | Proposito |
|---------|-------|-----------|
| trg_content_templates_updated_at | content_templates | Auto-update timestamp |
| trg_marie_curie_content_updated_at | marie_curie_content | Auto-update timestamp |
| trg_media_files_updated_at | media_files | Auto-update timestamp |
| trg_auto_moderate | Multiple | Aplica reglas de moderacion automaticamente |

### 4.5 Dependencias Externas

| Schema Externo | Tipo | Referencias |
|----------------|------|-------------|
| auth_management | FK | tenants, profiles |
| auth | FK | users (flagged_content, moderation_rules) |
| educational_content | Type | difficulty_level enum |
| gamilit | Utility | now_mexico(), is_admin(), update_updated_at_column() |
| audit_logging | Optional | audit_logs (trg_auto_moderate) |

---

## 5. PATRONES DE ARQUITECTURA

### 5.1 SECURITY DEFINER Pattern

Usado en funciones criticas que requieren privilegios elevados:
- Todas las funciones de inicializacion
- Funciones de actualizacion de stats
- Sistema de misiones

### 5.2 UPSERT Pattern

```sql
INSERT ... ON CONFLICT DO NOTHING
```
- Previene errores de llave duplicada
- Usado en inicializacion de user_stats, comodines, preferences

### 5.3 Error Resilience

- Excepciones capturadas pero no bloquean transaccion principal
- Errores logueados a `pending_user_initialization`
- Meta: Nunca bloquear creacion/login de usuario

### 5.4 Unified Mission System (DB-157)

```
Antes: 8 funciones separadas (~1,100 lineas)
Despues: 1 funcion core + 9 wrappers (~150 lineas)
```

---

## 6. FLUJO DE DATOS: EJERCICIO COMPLETADO

```
exercise_attempts INSERT
    |
    +---> trg_update_user_stats_on_exercise_complete
    |         └─> user_stats.total_xp, ml_coins
    |
    +---> trg_update_module_progress_on_exercise_complete
    |         └─> module_progress.percentage
    |
    +---> trg_update_missions_on_exercise_complete
              └─> update_mission_progress('complete_exercises')
                      └─> Todas las misiones activas
```

---

## 7. CARACTERISTICAS CLAVE

### 7.1 Multi-Tenancy
- Todas las tablas de content_management tienen tenant_id
- Cascade delete configurado

### 7.2 JSONB Storage
- content, metadata, processing_info, rule_config
- Flexibilidad para datos semi-estructurados

### 7.3 Content Moderation (EXT-002)
- Motor de reglas sofisticado
- Checks: keyword, pattern, length, frequency
- Acciones: flag, block, notify, escalate

### 7.4 Version Control
- Snapshots completos de contenido
- Historial de cambios

---

## 8. ARCHIVOS RELACIONADOS

### gamilit Schema
- `/apps/database/ddl/schemas/gamilit/functions/` (29 archivos activos)
- `/apps/database/ddl/schemas/gamilit/functions/_deprecated/` (8 archivos)
- `/apps/database/ddl/schemas/gamilit/views/` (1 archivo)

### content_management Schema
- `/apps/database/ddl/schemas/content_management/tables/` (10 archivos)
- `/apps/database/ddl/schemas/content_management/enums/` (4 archivos)
- `/apps/database/ddl/schemas/content_management/functions/` (4 archivos)
- `/apps/database/ddl/schemas/content_management/triggers/` (4 archivos)

---

## 9. CRITERIOS DE EXITO PARA F2

- [ ] Validar funciones gamilit vs Backend services
- [ ] Verificar enums content_management vs Backend
- [ ] Validar flujo de moderacion (DDL -> Backend)
- [ ] Verificar integracion media_files con storage service

---

## 10. DECISION RAPIDA

**GAMILIT SCHEMA: UTILITY ONLY**
- No requiere validacion de entities (no tiene tablas)
- Funciones son invocadas por otros schemas
- Arquitectura unificada de misiones ya validada

**CONTENT_MANAGEMENT: VALIDACION OPCIONAL**
- Sistema de moderacion es backend-admin only
- Templates y media files tienen bajo acoplamiento con frontend
- Priorizacion: BAJA

**RECOMENDACION:** Marcar TAREA-007 como completada (F1 only) o proceder a F2 con alcance reducido.

---

**Documento generado por:** @PERFIL_ORQUESTADOR
**Fecha:** 2026-01-10
**Version:** 1.0.0
