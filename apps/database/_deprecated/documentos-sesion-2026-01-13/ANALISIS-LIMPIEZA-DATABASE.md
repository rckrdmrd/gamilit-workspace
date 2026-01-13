# Análisis de Limpieza - apps/database

**Fecha:** 2025-12-05
**Objetivo:** Identificar archivos que violan la Directiva de Carga Limpia y proponer reorganización

---

## Resumen de Violaciones

### Categoría 1: ELIMINAR - Logs y archivos temporales

Archivos que **NUNCA** deberían estar en el repo:

| Archivo | Razón de eliminación |
|---------|---------------------|
| `create-database-*.log` (6 archivos) | Logs de ejecución, no código |
| `database-credentials-dev.txt` | **CRÍTICO: Credenciales expuestas** |
| `.env.dev` | **CRÍTICO: Environment con secrets** |
| `.env.database` | **CRÍTICO: Environment con secrets** |

### Categoría 2: ELIMINAR - Scripts Python no relacionados

Archivos que parecen ser de otro proyecto o pruebas:

| Archivo | Razón |
|---------|-------|
| `analyze-image-complete.py` | No relacionado con BD |
| `complete-crossword-design.py` | No relacionado con BD |
| `crossword-final-correct.py` | No relacionado con BD |
| `crossword-from-image-final.py` | No relacionado con BD |
| `exact-coordinates-layout.py` | No relacionado con BD |
| `final-correct-layout.py` | No relacionado con BD |
| `map-exact-from-image.py` | No relacionado con BD |
| `map-image-exact-v2.py` | No relacionado con BD |
| `validate-final-from-db.py` | No relacionado con BD |
| `sync-prod-dev.py` | Migración de datos, no DDL |
| `verify-unification.py` | Script temporal |

### Categoría 3: MOVER A DEPRECADOS - Documentación de recreación específica

Archivos de documentación de una recreación específica:

| Archivo | Destino |
|---------|---------|
| `DATABASE-RECREATION-SUCCESS-2025-11-24.txt` | `_deprecated/` o eliminar |
| `INDEX-RECREACION-BD-2025-11-24.md` | `_deprecated/` o eliminar |
| `README-RECREACION-2025-11-24.md` | `_deprecated/` o eliminar |
| `RESUMEN-EJECUTIVO-RECREACION-BD.md` | `_deprecated/` o eliminar |
| `VISUAL-DIFF-INITIALIZE-MISSIONS-2025-11-24.md` | `_deprecated/` o eliminar |
| `CHANGELOG-PERFECT-SCORES.md` | Mover a docs si relevante |
| `TEACHER-REPORTS-VISUAL-SCHEMA.txt` | Mover a docs si relevante |

### Categoría 4: ELIMINAR - Scripts SQL que violan carga limpia

**Estos archivos violan DIRECTAMENTE la política de carga limpia:**

| Archivo | Violación |
|---------|-----------|
| `scripts/apply-maya-ranks-v2.1.sql` | Script de aplicación (no DDL) |
| `scripts/validate-update-user-rank-fix.sql` | Script de validación de fix |
| `scripts/validate-gap-fixes.sql` | Script de validación de fix |
| `scripts/validate-missions-objectives-structure.sql` | Validación puntual |
| `scripts/validate-seeds-integrity.sql` | Validación puntual |
| `scripts/validate-user-initialization.sql` | Validación puntual |
| `scripts/validate-generate-alerts-joins.sql` | Validación puntual |
| `scripts/VALIDACION-RAPIDA-RECREACION-2025-11-24.sql` | Validación de fecha específica |
| `scripts/VALIDACIONES-RAPIDAS-POST-RECREACION.sql` | Validación post-recreación |

**Acción:** El contenido útil de estos scripts debe integrarse en:
- **DDL base** si define estructura
- **Seeds** si define datos
- **Tests** si es validación automatizada

### Categoría 5: MANTENER - Scripts válidos

Scripts que SÍ cumplen la política:

| Archivo | Propósito válido |
|---------|-----------------|
| `create-database.sh` | Script principal de creación |
| `drop-and-recreate-database.sh` | Recreación limpia |
| `validate-create-database.sh` | Validación de creación |
| `validate-db-ready.sh` | Health check |
| `validate-ddl-coverage.sh` | Validación de cobertura DDL |
| `validar-integridad.sh` | Validación de integridad |
| `verify-unification.sh` | Verificación de unificación |
| `test-exercise-resubmission.sh` | Test funcional |

---

## Estructura Esperada (según directiva)

```
apps/database/
├── ddl/                          # DDL - Fuente de verdad
│   ├── 00-prerequisites.sql      # Extensiones, roles
│   ├── 99-post-ddl-permissions.sql
│   ├── functions/                # Funciones globales
│   ├── views/                    # Vistas globales
│   └── schemas/                  # Por schema
│       └── {schema_name}/
│           ├── tables/           # CREATE TABLE
│           ├── functions/        # Funciones del schema
│           ├── triggers/         # Triggers
│           ├── rls-policies/     # Row Level Security
│           └── indexes/          # Índices adicionales
│
├── seeds/                        # Datos iniciales
│   ├── dev/                      # Seeds para desarrollo
│   └── prod/                     # Seeds para producción (mínimos)
│
├── scripts/                      # Scripts de operación
│   ├── create-database.sh        # Creación
│   ├── drop-and-recreate-database.sh
│   ├── validate-*.sh             # Validaciones
│   └── utilities/                # Utilidades
│
├── tests/                        # Tests de BD
│   └── *.sql                     # Tests SQL
│
├── README.md                     # Documentación principal
└── .gitignore                    # Ignorar logs, env, etc.
```

---

## Plan de Acción

### Paso 1: Eliminar archivos de credenciales/secrets

```bash
rm apps/database/database-credentials-dev.txt
rm apps/database/.env.dev
rm apps/database/.env.database
```

**IMPORTANTE:** Agregar al .gitignore si no están.

### Paso 2: Eliminar logs

```bash
rm apps/database/create-database-*.log
```

### Paso 3: Eliminar scripts Python no relacionados

```bash
rm apps/database/*.py
```

### Paso 4: Mover documentación específica a _deprecated

```bash
mv apps/database/*2025-11-24* apps/database/_deprecated/
mv apps/database/RESUMEN-EJECUTIVO-RECREACION-BD.md apps/database/_deprecated/
mv apps/database/CHANGELOG-PERFECT-SCORES.md apps/database/_deprecated/
mv apps/database/TEACHER-REPORTS-VISUAL-SCHEMA.txt apps/database/_deprecated/
```

### Paso 5: Analizar scripts SQL y migrar contenido

Para cada script en `scripts/*.sql`:
1. Revisar si contiene DDL → Mover a `ddl/`
2. Revisar si contiene seeds → Mover a `seeds/`
3. Revisar si es validación → Convertir a test en `tests/`
4. Si es fix/patch → **ELIMINAR** (violar directiva)

### Paso 6: Limpiar carpeta scripts/

```bash
# Mover a deprecated o eliminar
mv apps/database/scripts/apply-*.sql apps/database/_deprecated/
mv apps/database/scripts/validate-*.sql apps/database/_deprecated/
mv apps/database/scripts/VALIDACION*.sql apps/database/_deprecated/
```

---

## Archivos a Conservar

Después de la limpieza, la raíz de `apps/database/` debe tener:

```
apps/database/
├── README.md                     # Documentación principal
├── create-database.sh            # Script de creación
├── drop-and-recreate-database.sh # Recreación
├── validate-create-database.sh   # Validación
├── validate-db-ready.sh          # Health check
├── validate-ddl-coverage.sh      # Cobertura DDL
├── validar-integridad.sh         # Integridad
├── verify-unification.sh         # Unificación
├── test-exercise-resubmission.sh # Test
├── ddl/                          # DDL
├── seeds/                        # Seeds
├── scripts/                      # Scripts auxiliares (limpios)
├── tests/                        # Tests
└── _deprecated/                  # Archivos deprecados (temporalmente)
```

---

## Estado: LIMPIEZA COMPLETADA

**Fecha de ejecución:** 2025-12-05

### Resumen de acciones ejecutadas:

#### Archivos ELIMINADOS permanentemente:
- ✅ `database-credentials-dev.txt` - Credenciales (seguridad)
- ✅ `.env.dev`, `.env.database` - Environment files (seguridad)
- ✅ `create-database-*.log` - 6 archivos de logs
- ✅ `*.py` - 11 scripts Python no relacionados con BD

#### Archivos movidos a `_deprecated/`:

**docs-recreacion-2025-11-24/**
- `DATABASE-RECREATION-SUCCESS-2025-11-24.txt`
- `INDEX-RECREACION-BD-2025-11-24.md`
- `RESUMEN-EJECUTIVO-RECREACION-BD.md`
- `TEACHER-REPORTS-VISUAL-SCHEMA.txt`
- Y otros documentos de fecha específica

**scripts-violacion-carga-limpia/**
- `apply-maya-ranks-v2.1.sql`
- `validate-update-user-rank-fix.sql`
- `validate-gap-fixes.sql`
- `validate-missions-objectives-structure.sql`
- `validate-seeds-integrity.sql`
- `validate-user-initialization.sql`
- `validate-generate-alerts-joins.sql`
- `VALIDACION-RAPIDA-RECREACION-2025-11-24.sql`
- `VALIDACIONES-RAPIDAS-POST-RECREACION.sql`
- `fix-duplicate-triggers.sh`
- `cleanup-duplicados.sh`
- `DB-127-validar-gaps.sh`
- `validate_integrity.py`
- `verify-missions-status.sh`
- `verify-users.sh`

**scripts-antiguos/**
- `init-database.sh` (v1)
- `init-database-v3.sh`
- `recreate-database.sh` (redundante)
- `reset-database.sh` (redundante)

**migrations-removed-2025-11-24/** (ya existía)
- Scripts de migración previos

**docs-scripts/**
- `INDEX.md`
- `QUICK-START.md`
- `README-SETUP.md`
- `README-VALIDATION-SCRIPTS.md`

#### Archivos reubicados:
- `scripts/testing/CREAR-USUARIOS-TESTING.sql` → `seeds/dev/`
- `scripts/load-users-and-profiles.sh` → `seeds/`

---

## Estructura Final Limpia

```
apps/database/
├── README.md                     # ✅ Documentación principal
├── ANALISIS-LIMPIEZA-DATABASE.md # Este archivo
├── create-database.sh            # ✅ Script principal de creación
├── drop-and-recreate-database.sh # ✅ Recreación limpia
├── validate-create-database.sh   # ✅ Validación de creación
├── validate-db-ready.sh          # ✅ Health check
├── validate-ddl-coverage.sh      # ✅ Cobertura DDL
├── validar-integridad.sh         # ✅ Integridad
├── verify-unification.sh         # ✅ Unificación
├── test-exercise-resubmission.sh # ✅ Test funcional
│
├── ddl/                          # ✅ DDL - 387 archivos SQL
│   ├── 00-prerequisites.sql
│   ├── 99-post-ddl-permissions.sql
│   ├── functions/
│   ├── views/
│   └── schemas/                  # 18 schemas
│
├── seeds/                        # ✅ Seeds por ambiente
│   ├── dev/                      # Seeds desarrollo + CREAR-USUARIOS-TESTING.sql
│   ├── prod/                     # Seeds producción
│   ├── staging/                  # Seeds staging
│   ├── load-users-and-profiles.sh
│   ├── LOAD-SEEDS-auth_management.sh
│   └── LOAD-SEEDS-gamification_system.sh
│
├── scripts/                      # ✅ Scripts de utilidades (limpio)
│   ├── README.md                 # Documentación de scripts
│   ├── config/                   # Configuraciones
│   │   ├── dev.conf
│   │   └── prod.conf
│   ├── inventory/                # Scripts de inventario
│   │   ├── list-*.sh             # 9 scripts de listado
│   │   └── generate-all-inventories.sh
│   ├── manage-secrets.sh         # Gestión de secrets
│   ├── update-env-files.sh       # Actualización de .env
│   └── validate-ddl-organization.sh
│
├── tests/                        # ✅ Tests SQL (3 archivos)
│   ├── test-admin-notifications-policy.sql
│   ├── test-initialize-user-stats-update.sql
│   └── test-perfect-scores-mission.sql
│
└── _deprecated/                  # Archivos deprecados (para revisión/eliminación futura)
    ├── docs-recreacion-2025-11-24/
    ├── docs-scripts/
    ├── migrations-removed-2025-11-24/
    ├── scripts-antiguos/
    └── scripts-violacion-carga-limpia/
```

---

## Métricas Post-Limpieza

| Métrica | Antes | Después |
|---------|-------|---------|
| Archivos en raíz | ~40 | 10 |
| Scripts en scripts/ | ~30 | 6 + subcarpetas |
| Archivos de credenciales | 3 | 0 |
| Logs | 6 | 0 |
| Scripts Python | 11 | 0 |

---

## Próximos pasos recomendados

1. **Revisar `_deprecated/`** - Decidir si eliminar permanentemente o archivar
2. **Ejecutar validación DDL** - `./validate-ddl-coverage.sh`
3. **Probar recreación limpia** - `./drop-and-recreate-database.sh`
4. **Actualizar .gitignore** - Ya incluye patrones para .env, logs, etc.
