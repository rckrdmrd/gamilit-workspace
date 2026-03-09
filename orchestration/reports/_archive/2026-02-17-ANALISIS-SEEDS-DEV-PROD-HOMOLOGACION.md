# Analisis detallado de seeds DEV vs PROD y consistencia de inicializacion

Fecha: 2026-02-17  
Scope: `apps/database/seeds/*`, `apps/database/scripts/init-database.sh`, `apps/database/scripts/recreate-database.sh`, `apps/database/scripts/config/dev.conf`, `apps/database/scripts/config/prod.conf`, modulo admin organizaciones.

## 1) Resultado ejecutivo

- Se confirmo una brecha critica entre el inventario de seeds y lo que realmente ejecuta `init-database.sh`.
- La hipotesis de "multiples instituciones" esta bien sustentada por dos vectores:
  - Persistencia historica de tenants personales.
  - Superficie de API que permite crear tenants desde Admin.
- Hay configuracion por ambiente (`dev.conf`/`prod.conf`) y backup pre-drop en recreacion, pero faltan controles de consistencia funcional post-seed.
- No hay garantia fuerte de homologacion DEV/PROD mientras el shell siga:
  - omitiendo seeds existentes,
  - tolerando errores sin fail-fast,
  - y sin validaciones de tenant/school/classroom unicos.

## 2) Matriz de inventario DEV vs PROD

Conteo total de archivos `.sql`:
- DEV: 111
- PROD: 73
- Paths comunes: 72
- Solo DEV: 39
- Solo PROD: 1

### 2.1 Vista por dominio

| Dominio | DEV | PROD | Comunes | Solo DEV | Solo PROD |
|---|---:|---:|---:|---:|---:|
| `_testing` | 4 | 4 | 4 | 0 | 0 |
| `admin_dashboard` | 2 | 2 | 2 | 0 | 0 |
| `audit_logging` | 5 | 1 | 1 | 4 | 0 |
| `auth` | 3 | 2 | 2 | 1 | 0 |
| `auth_management` | 13 | 8 | 8 | 5 | 0 |
| `communication` | 2 | 2 | 2 | 0 | 0 |
| `content_management` | 6 | 4 | 4 | 2 | 0 |
| `educational_content` | 17 | 18 | 17 | 0 | 1 |
| `gamification_system` | 15 | 14 | 14 | 1 | 0 |
| `lti_integration` | 3 | 1 | 1 | 2 | 0 |
| `notifications` | 7 | 2 | 2 | 5 | 0 |
| `progress_tracking` | 15 | 1 | 1 | 14 | 0 |
| `social_features` | 12 | 9 | 9 | 3 | 0 |
| `system_configuration` | 6 | 5 | 5 | 1 | 0 |
| `00-dev-testing-student.sql` | 1 | 0 | 0 | 1 | 0 |

### 2.2 Clasificacion solicitada

#### `core_homologado` (deben existir en ambos)
- 72 archivos por path comun (base compartida).
- Nota: de esos 72, **25 tienen contenido diferente** entre DEV y PROD y requieren gobernanza explicita (ver `pendiente_decision`).

#### `dev_exclusivo` (validos solo para demo/testing)
- Total: 39
- Incluye principalmente:
  - `progress_tracking/*` de demo y telemetria local.
  - `audit_logging/*` de muestra.
  - `auth_management/03-profiles.sql`, `04-user_roles.sql`, `05-user_preferences.sql`, `06-auth_attempts.sql`, `07-security_events.sql`.
  - `notifications/02-user_devices_dev.sql`.
  - `auth/01b-demo-students.sql`.
  - `00-dev-testing-student.sql`.

#### `prod_exclusivo`
- Total: 1
- `educational_content/14-classroom_modules.sql`

#### `pendiente_decision` (mismo path, contenido distinto)
Archivos comunes con diferencia de contenido (25):
- `admin_dashboard/01-bulk_operations.sql`
- `admin_dashboard/02-admin_reports.sql`
- `auth_management/06-profiles-production.sql`
- `communication/01-system-messages.sql`
- `communication/02-message_participants.sql`
- `educational_content/05-assignments.sql`
- `educational_content/05-exercises-module4.sql`
- `educational_content/06-exercises-module5.sql`
- `educational_content/07-assessment-rubrics.sql`
- `educational_content/08-difficulty_criteria.sql`
- `educational_content/09-exercise_mechanic_mapping.sql`
- `gamification_system/02-leaderboard_metadata.sql`
- `gamification_system/04-achievements.sql`
- `gamification_system/05-user_stats.sql`
- `gamification_system/07-ml_coins_transactions.sql`
- `gamification_system/08-user_achievements.sql`
- `gamification_system/15-comodin_usage_tracking.sql`
- `lti_integration/01-lti_consumers.sql`
- `notifications/01-notification_templates.sql`
- `notifications/02-notification_preferences_defaults.sql`
- `social_features/02-classrooms.sql`
- `social_features/04-teams.sql`
- `social_features/08-peer_challenges.sql`
- `social_features/10-team_challenges.sql`
- `system_configuration/03-notification_settings_global.sql`

## 3) Auditoria de orden y dependencias (init-database)

`init-database.sh` define 12 fases de seeds con orden semantico correcto en terminos generales, pero con brechas funcionales.

### 3.1 Hallazgos de cobertura (P0/P1)

Seeds existentes en repositorio que **no** se ejecutan desde `init-database.sh`:

- `auth_management/02-tenants-production.sql`  (P0)
  - Este seed contiene limpieza/normalizacion de tenants personales y validacion de tenant unico.
- `auth_management/07-profiles-production-additional.sql` (P1)
- `auth_management/07-user_roles.sql` (P0)
- `auth_management/08-assign-admin-schools.sql` (P0)
- `educational_content/14-classroom_modules.sql` (P1, existe solo en PROD)

Impacto:
- Recreate/init puede terminar "exitoso" pero sin aplicar normalizacion clave de multi-tenancy y asignaciones administrativas.

### 3.2 Hallazgos de robustez de ejecucion (P1)

- Si un seed falla, el script registra warning y continua (`continuando...`), sin fail-fast global.
- Si un archivo del arreglo no existe para el ambiente, se omite silenciosamente (`if [ -f "$seed_file" ]` sin else de error).
- Resultado: estado final potencialmente parcial y no determinista, especialmente al alternar DEV/PROD.

### 3.3 Dependencias criticas observadas

Cadena minima correcta esperada:
1. `auth_management/01-tenants.sql`
2. `auth_management/02-tenants-production.sql` (cleanup tenant personal)
3. users/auth + profiles + user_roles
4. `social_features/00-schools-default.sql`
5. `social_features/02-classrooms.sql`
6. `auth_management/08-assign-admin-schools.sql`
7. dominios de contenido/gamificacion/progreso

Brecha actual:
- Paso 2 y 6 no estan garantizados por shell canonico.

## 4) Diagnostico caso "institucion unica" (Admin)

## 4.1 Causa probable con evidencia

1) **Causa historica principal (muy probable):**
- Hubo etapa donde se creaban tenants personales por usuario.
- Existe seed de remediacion (`auth_management/02-tenants-production.sql`) que documenta exactamente ese problema y su limpieza.
- Ese seed no esta en el flujo de `init-database.sh`.

2) **Causa operativa adicional (probable):**
- API de admin permite `POST /admin/organizations` y el servicio crea tenants.
- Si esta ruta se usa sin guardas de negocio para "tenant unico", se pueden reintroducir organizaciones extras.

## 4.2 Queries de diagnostico (DEV y PROD)

### Q1: unicidad tenant principal
```sql
SELECT
  COUNT(*) FILTER (WHERE slug = 'gamilit-platform' AND is_active = true) AS main_tenant_active_count,
  COUNT(*) AS total_tenants
FROM auth_management.tenants
WHERE deleted_at IS NULL;
```

### Q2: tenants personales remanentes
```sql
SELECT id, name, slug, metadata
FROM auth_management.tenants
WHERE metadata->>'personal_tenant' = 'true'
  AND deleted_at IS NULL
ORDER BY created_at ASC;
```

### Q3: perfiles fuera del tenant principal
```sql
SELECT p.id, p.email, p.tenant_id, t.slug AS tenant_slug
FROM auth_management.profiles p
JOIN auth_management.tenants t ON t.id = p.tenant_id
WHERE p.deleted_at IS NULL
  AND t.slug <> 'gamilit-platform'
ORDER BY p.created_at ASC;
```

### Q4: coherencia roles vs tenant
```sql
SELECT ur.user_id, ur.tenant_id AS role_tenant_id, p.tenant_id AS profile_tenant_id
FROM auth_management.user_roles ur
JOIN auth_management.profiles p ON p.user_id = ur.user_id
WHERE p.deleted_at IS NULL
  AND ur.tenant_id <> p.tenant_id
ORDER BY ur.created_at DESC;
```

### Q5: instituciones/schools por tenant
```sql
SELECT s.id, s.name, s.code, s.tenant_id, t.slug
FROM social_features.schools s
JOIN auth_management.tenants t ON t.id = s.tenant_id
WHERE s.deleted_at IS NULL
ORDER BY s.created_at ASC;
```

### Q6: aula default unica y anidada
```sql
SELECT
  COUNT(*) FILTER (WHERE code = 'DEFAULT' AND is_active = true) AS default_classroom_count,
  MIN(tenant_id) FILTER (WHERE code = 'DEFAULT' AND is_active = true) AS default_tenant_id
FROM social_features.classrooms
WHERE deleted_at IS NULL;
```

### Q7: admins sin school asignada
```sql
SELECT p.id, p.email, p.school_id, p.tenant_id
FROM auth_management.profiles p
JOIN auth_management.user_roles ur ON ur.user_id = p.user_id
WHERE p.deleted_at IS NULL
  AND ur.role::text IN ('admin_teacher', 'super_admin')
  AND p.school_id IS NULL
ORDER BY p.created_at ASC;
```

## 5) Evaluacion shell DEV/PROD

## 5.1 Fortalezas actuales

- `recreate-database.sh` carga config por ambiente (`ENV_DB_HOST`, `ENV_DB_PORT`).
- `prod.conf` define `ENV_SEEDS_DIR=seeds/prod`.
- Existe `create_pre_drop_backup()` condicionado por `ENV_CREATE_BACKUP_BEFORE_DROP=true` para PROD.
- Se separan credenciales via variables de entorno y se evitan defaults hardcoded en scripts ya corregidos.

## 5.2 Brechas de control

P0:
- Falta control post-seed obligatorio para invariantes de negocio:
  - 1 tenant principal activo,
  - 0 tenants personales,
  - 1 escuela default,
  - 1 aula default.

P1:
- Flags de ambiente para demo (`ENV_LOAD_DEMO_*`) no gobiernan el arreglo real de seeds.
- No hay "allowlist/denylist" por ambiente para bloquear seeds no permitidos en PROD.
- No hay verificacion de "todos los seeds esperados del ambiente fueron ejecutados" (cobertura).

P2:
- Falta reporte final machine-readable (json/tsv) con: executed, skipped, failed, elapsed_ms.

## 6) Backlog de remediacion priorizado (P0/P1/P2)

### P0 (integridad/negocio)

1. `apps/database/scripts/init-database.sh`
- Incluir explicitamente:
  - `auth_management/02-tenants-production.sql`
  - `auth_management/07-user_roles.sql`
  - `auth_management/08-assign-admin-schools.sql`
- Convertir error en seed a fail-fast en PROD (`exit 1`) con opcion override solo en DEV.

2. `apps/database/scripts/init-database.sh` (post-check obligatorio)
- Agregar bloque SQL de validacion hard-fail para:
  - tenant principal unico,
  - cero tenants personales,
  - escuela default unica,
  - aula default unica.

3. `apps/backend/src/modules/admin/controllers/admin-organizations.controller.ts` y servicio asociado
- Restringir creacion de organizaciones en modo tenant-unico:
  - o deshabilitar endpoint en prod,
  - o permitir solo `super_admin` + feature flag explicita.

### P1 (homologacion)

4. `apps/database/scripts/init-database.sh`
- Integrar:
  - `auth_management/07-profiles-production-additional.sql`
  - `educational_content/14-classroom_modules.sql` (solo PROD o clasificar formalmente).

5. `apps/database/scripts/init-database.sh` + `config/*.conf`
- Implementar control real por flags `ENV_LOAD_DEMO_*` para incluir/excluir bloques de seeds.

6. `apps/database/seeds/*` (gobernanza)
- Resolver 25 archivos `pendiente_decision` con criterio documentado:
  - `same_logic_diff_volume` o
  - `fork_intencional_por_ambiente` con justificacion.

### P2 (observabilidad y operacion)

7. `apps/database/scripts/init-database.sh`
- Emitir reporte estructurado (`logs/init-<env>-summary.json`) con resumen de ejecucion por archivo.

8. `apps/database/scripts/validate-db-ready.sh`
- Consumir esos checks y fallar si invariantes de tenant/school/classroom no cumplen.

## 7) Checklist de validacion de aceptacion

Para cerrar la homologacion DEV/PROD:
- [ ] Lista `core_homologado` aprobada y versionada.
- [ ] `init-database.sh` ejecuta todos los seeds P0 obligatorios.
- [ ] Invariantes de tenant unico pasan en DEV y PROD.
- [ ] No se observan organizaciones espurias en Admin tras recreate.
- [ ] Se dispone de reporte de ejecucion por seed (ejecutado/omitido/error).

## 8) Conclusiones

- El modelo objetivo "tenant unico + institucion unica + aula default unica" esta bien definido en seeds, pero la orquestacion actual no garantiza su aplicacion completa en todos los escenarios.
- El gap principal no es de DDL sino de **cobertura y enforcement del shell de inicializacion**.
- La correccion debe priorizarse en `init-database.sh` (P0) y en guardas de API admin para evitar recidiva funcional.
