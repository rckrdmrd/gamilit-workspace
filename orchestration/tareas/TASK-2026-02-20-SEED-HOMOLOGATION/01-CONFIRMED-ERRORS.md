# 01-CONFIRMED-ERRORS: Seed Homologation Dev/Prod

**Tarea:** TASK-2026-02-20-SEED-HOMOLOGATION
**Fecha:** 2026-02-20
**Contexto:** Deploy a produccion revelo errores en seeds por desincronizacion DDL↔Seeds

---

## Resumen

- **Errores confirmados tras analisis:** 8 (de 18 reportados originalmente)
- **Falsos positivos:** 10 (ya corregidos en sesiones anteriores)
- **Archivos modificados:** ~15 (dev + prod + init-database.sh)
- **Estado final:** **TODOS RESUELTOS** (2026-02-20)

---

## Errores Confirmados

### A1: content_management/01-default-templates.sql (dev + prod)
- **Error:** `column "structure" of relation "content_templates" does not exist`
- **DDL SSOT:** `apps/database/ddl/schemas/content_management/tables/01-content_templates.sql`
  - Columna correcta: `template_structure JSONB DEFAULT '{}' NOT NULL`
  - No existe `is_active` — hay `is_public BOOLEAN` + `is_system_template BOOLEAN`
  - `updated_at` tiene DEFAULT trigger, no necesita INSERT explicito
- **Seed:** `seeds/dev/content_management/01-default-templates.sql` (y prod copia identica)
- **Fix:** Renombrar `structure` → `template_structure`, `is_active` → `is_public`, agregar `is_system_template`, quitar `updated_at`
- **Estado:** **RESUELTO**

### A2: content_management/02-marie_curie_content.sql (prod only)
- **Error:** `relation "content_management.marie_curie_content" does not exist`
- **DDL SSOT:** `apps/database/ddl/schemas/content_management/tables/02-marie_curie_content.sql`
  - Tabla correcta: `marie_curie_contents` (plural)
- **Seed:** `seeds/prod/content_management/02-marie_curie_content.sql` (10 ocurrencias de singular)
- **Fix:** Reemplazar `marie_curie_content` → `marie_curie_contents` en todos los statements
- **Estado:** **RESUELTO**

### A11: _testing/01-test-exercises-validation.sql (dev + prod)
- **Error:** `column "is_active" of relation "modules" does not exist`
- **DDL SSOT:** `apps/database/ddl/schemas/educational_content/tables/01-modules.sql`
  - Columna correcta: `is_published BOOLEAN DEFAULT false` + `status module_status DEFAULT 'draft'`
- **Seed:** `seeds/dev/_testing/01-test-exercises-validation.sql` linea 32
- **Fix:** Renombrar `is_active` → `is_published` en INSERT de modulo de prueba
- **Estado:** **RESUELTO**

### B1: auth/01-demo-users.sql — scope incorrecto en init-database.sh
- **Error:** FK violation en cascada — `04-profiles-complete.sql` referencia usuarios que no se cargaron
- **Causa raiz:** `01-demo-users.sql` tiene scope `demo_users`, en prod con `ENV_LOAD_DEMO_USERS=false` se salta
  - Pero crea usuarios testing esenciales (admin@gamilit.com, teacher@gamilit.com, student@gamilit.com)
  - Estos son requeridos por profiles-complete y muchos otros seeds
- **Archivo:** `apps/database/scripts/init-database.sh` linea 1052
- **Fix:** Cambiar `"auth/01-demo-users.sql|all|demo_users"` → `"auth/01-demo-users.sql|all|core"`
- **Estado:** **RESUELTO**

### B2: content_management/04-moderation_rules.sql (dev + prod)
- **Error:** FK violation — inserta directamente en `auth.users` (gamilit_user no tiene permisos)
- **DDL SSOT:** `moderation_rules.created_by` es nullable UUID (no FK explicito en DDL)
- **Seed:** Inserta `system@gamilit.com` en `auth.users` directamente → falla porque seeds corren como gamilit_user
- **Fix:** Eliminar INSERT a auth.users, usar dynamic profile lookup para `created_by`
- **Archivo adicional:** Re-habilitar en init-database.sh (quitar exclusion linea 1137)
- **Estado:** **RESUELTO**

### B4/B5: gamification demo seeds existen en prod/ (no deberian)
- **Error:** En prod, si alguien los carga manualmente → FK violations por UUIDs demo inexistentes
- **Archivos:** `seeds/prod/gamification_system/17-user_purchases-demo.sql`, `18-user_equipped_items-demo.sql`
- **Nota:** En init-database.sh ya estan como `dev|demo_gamification` (no cargan en prod)
- **Fix:** Eliminar copias de prod/ para evitar confusion
- **Estado:** **RESUELTO**

### C2: admin_dashboard/02-admin_reports.sql (dev + prod)
- **Error:** `tenant_id` usa UUID hardcodeado que podria no existir en install fresca
- **Seed:** Usa `'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid` directamente
- **Fix:** Cambiar a dynamic lookup: `(SELECT id FROM auth_management.tenants WHERE slug = 'gamilit' OR name ILIKE '%gamilit%' LIMIT 1)`
- **Estado:** **RESUELTO**

### Pipeline: Re-habilitar seeds excluidos en init-database.sh
- **Linea 1136:** `01-default-templates.sql` excluido → re-habilitar tras Fix A1
- **Linea 1137:** `04-moderation_rules.sql` excluido → re-habilitar tras Fix B2
- **Estado:** **RESUELTO**

---

## Falsos Positivos (ya corregidos en sesiones anteriores)

| # | Error Original | Estado Real |
|---|---------------|-------------|
| A3 | `rubric_type` no existe | Ya usa `assessment_type` (correcto) |
| A4 | `varchar(5)` overflow | Todos los valores caben: A1, A2, B1, B2, C1, C2, C2+, NAT |
| A5 | Tabla `exercise_mechanic_mapping` singular | Ya usa `exercise_mechanic_mappings` (plural) |
| A6 | Tabla `leaderboard_metadata` singular | Ya usa `leaderboard_metadatas` (plural) |
| A7 | `related_entity_type` no existe | Ya usa `reference_type`/`reference_id` (correcto) |
| A8 | Tabla `notification_settings_global` singular | Ya usa `notification_settings_globals` (plural) |
| A9 | `classroom_id` FK falla | Seed tiene guards con RETURN si no hay classrooms |
| A10 | `is_active` en peer_challenges | Seed usa `status` (correcto), `is_active` es de profiles lookup |
| B3 | `started_by` FK wrong table | Ya usa profiles join pattern correcto |
| C1 | `ON CONFLICT(template_key)` wrong | Ya usa `ON CONFLICT (template_key, version)` correcto |

---

## Plan de Ejecucion

1. Fix A1: `01-default-templates.sql` (dev) → sync a prod
2. Fix A2: `02-marie_curie_content.sql` (prod) — pluralizar tabla
3. Fix A11: `01-test-exercises-validation.sql` (dev) → sync a prod
4. Fix B1: init-database.sh scope change
5. Fix B2: `04-moderation_rules.sql` (dev) → sync a prod + re-habilitar pipeline
6. Fix B4/B5: Eliminar demo seeds de prod/
7. Fix C2: `02-admin_reports.sql` (dev) → sync a prod
8. Homologar todos los `|all|` seeds dev↔prod
9. Validar pipeline completo
