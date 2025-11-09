# PLAN DE PURGA: apps/database/

**Fecha:** 2025-11-08
**Versión:** 1.0
**Estado:** Pendiente aprobación
**Objetivo:** Limpiar archivos innecesarios manteniendo SOLO ddl/, scripts/ esenciales y seeds/

---

## RESUMEN EJECUTIVO

### Objetivo de la Purga

El proyecto `apps/database/` debe contener ÚNICAMENTE:
- ✅ **DDL SQL**: Definiciones de esquema (tablas, funciones, triggers, etc.)
- ✅ **Scripts operacionales**: Scripts de inicialización y gestión de BD
- ✅ **Seeds**: Datos iniciales para diferentes ambientes
- ❌ **NO documentación**: Los MD deben ir a `docs/`
- ❌ **NO reportes de agentes**: Los reportes van a `orchestration/`
- ❌ **NO archivos temporales**: TXT, JSON de análisis

### Estadísticas de Purga

| Categoría | Archivos | Acción |
|-----------|----------|--------|
| **Archivos MD en raíz** | 13 | 🔄 Mover 2 a docs/, Eliminar 11 |
| **Archivos TXT en raíz** | 5 | ❌ Eliminar |
| **Carpeta docs/** | 1 carpeta completa | 🔄 Mover a docs/ principal |
| **Carpeta reportes/** | 1 carpeta completa | 🔄 Mover a orchestration/ |
| **Carpeta backups/** | 2 subcarpetas | ⚠️ Revisar y eliminar o mover |
| **Migrations/** | 17 archivos SQL | ✅ Mantener (son migraciones válidas) |
| **Scripts deprecated/** | 3 archivos | ❌ Eliminar |
| **Scripts MD** | 7 archivos MD | 🔄 Mover 2 a docs/, Eliminar 5 |
| **Archivos _MAP.md en DDL** | 85+ archivos | ✅ MANTENER (documentación de estructura) |

**Total a procesar:** ~130 archivos/carpetas
**Estimado a eliminar:** ~30 archivos
**Estimado a mover:** ~90 archivos
**Mantener:** DDL, scripts esenciales, seeds

---

## CLASIFICACIÓN DETALLADA

### 1. ARCHIVOS MD EN RAÍZ DE apps/database/

#### 🔄 MOVER A docs/90-transversal/inventarios/

```
apps/database/README.md
  → docs/90-transversal/inventarios/DATABASE-README.md
  Razón: Es la documentación principal del proyecto de BD
  Contenido útil: Estructura de BD, estadísticas, guía de uso

apps/database/README-CREAR-BD.md
  → docs/90-transversal/guias/GUIA-CREAR-BASE-DATOS.md
  Razón: Guía de usuario para crear la BD
  Contenido útil: Instrucciones paso a paso
```

#### ❌ ELIMINAR (Información obsoleta o duplicada)

```
apps/database/INVENTARIO-COMPLETO-BD-2025-11-07.md (41KB)
  Razón: Ya existe en docs/90-transversal/inventarios/DATABASE_INVENTORY.yml
  Estado: Información duplicada

apps/database/MATRIZ-COBERTURA-MODULOS-PLATAFORMA-2025-11-07.md (61KB)
  Razón: Análisis temporal, información ya procesada
  Estado: Obsoleto

apps/database/CRITERIOS-VALIDACION.md (19KB)
  Razón: Ya integrado en docs/98-standards/
  Estado: Duplicado

apps/database/PLAN-ACTUALIZACION-DOCUMENTACION.md (19KB)
  Razón: Plan temporal de agente, información ya ejecutada
  Estado: Obsoleto

apps/database/PLAN-VALIDACION-COMPLETO.md (24KB)
  Razón: Plan temporal de agente, información ya ejecutada
  Estado: Obsoleto

apps/database/REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md (16KB)
  Razón: Reporte temporal de agente
  Acción: Mover a orchestration/01-analisis/ si se necesita histórico
  Estado: Temporal

apps/database/REPORTE-FASE-2-3-SCHEMAS-FUNCIONES-2025-11-07.md (9KB)
  Razón: Reporte temporal de agente
  Estado: Obsoleto

apps/database/REPORTE-VALIDACION-EXHAUSTIVA-DDL-2025-11-08.md (38KB)
  Razón: Reporte temporal de agente
  Acción: Mover a orchestration/05-validaciones/ si se necesita histórico
  Estado: Temporal

apps/database/RESUMEN-VALIDACION-Y-CORRECCIONES.md (9.5KB)
  Razón: Reporte temporal de agente
  Estado: Obsoleto

apps/database/SYNC-REPORT-2025-11-04.md (6.8KB)
  Razón: Reporte temporal de agente
  Estado: Obsoleto

apps/database/_MAP.md (6.7KB)
  Razón: Ya existe estructura _MAP.md en docs/
  Acción: Consolidar en docs/90-transversal/inventarios/_MAP.md
  Estado: Duplicado
```

---

### 2. ARCHIVOS TXT/JSON EN RAÍZ

#### ❌ ELIMINAR TODOS (Archivos temporales de análisis)

```
apps/database/FLOWCHART_COMPARISON.txt
apps/database/INDICADORES_VISUALES.txt
apps/database/RESUMEN_EJECUTIVO_ANALISIS.txt
apps/database/TABLA_COMPARATIVA_VISUAL.txt
apps/database/summary.txt
  Razón: Archivos temporales de análisis de agentes
  Estado: No contienen información crítica, pueden regenerarse
```

#### ⚠️ REVISAR

```
apps/database/database-credentials-dev.txt
  Razón: Credenciales de desarrollo
  Acción: ⚠️ SI CONTIENE CREDENCIALES REALES, NO DEBE ESTAR EN REPO
  Propuesta: Mover a .gitignore si no está ya, o eliminar del repo
```

---

### 3. CARPETA apps/database/docs/

#### 🔄 MOVER COMPLETA A docs/90-transversal/

```
apps/database/docs/
  → docs/90-transversal/inventarios-database/

Contiene:
  - inventarios/ (inventarios detallados de schemas, tablas, enums)
  - DECISIONES-ARQUITECTURALES-REQUERIDAS.md
  - GUIA-ACCION-RAPIDA-2025-11-07.md
  - MAPA-INCIDENCIAS-BASE-DATOS.md
  - REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md
  - REPORTE-VALIDACION-DUPLICACIONES-2025-11-07.md
  - TRACKING-CORRECCIONES.md

Razón: Toda esta documentación pertenece a docs/ principal
Estado: Documentación valiosa, MANTENER pero en lugar correcto
```

**Sub-clasificación de apps/database/docs/inventarios/**:

```
✅ MANTENER (son valiosos):
  - 01-SCHEMAS-INVENTORY.md
  - 02-TABLES-INVENTORY.md
  - 03-ENUMS-INVENTORY.md
  - INVENTORY-MASTER-REPORT.md

❌ ELIMINAR (archivos raw temporales):
  - raw-enums-output.txt
  - raw-functions-output.txt
  - raw-indexes-output.txt
  - raw-rls-output.txt
  - raw-seeds-output.txt
  - raw-tables-output.txt
  - raw-triggers-output.txt
  - raw-views-output.txt
  Razón: Archivos de salida temporal de scripts, pueden regenerarse
```

---

### 4. CARPETA apps/database/reportes/

#### 🔄 MOVER COMPLETA A orchestration/

```
apps/database/reportes/
  → orchestration/01-analisis/database-validation-reports/

Contiene:
  - 2025-11-01-migracion/
  - 2025-11-07-validacion/

Razón: Son reportes de análisis de agentes, pertenecen a orchestration/
Estado: Histórico de validaciones, puede ser útil para referencia
```

---

### 5. CARPETA apps/database/backups/

#### ⚠️ REVISAR Y DECIDIR

```
apps/database/backups/duplicados/2025-11-07/
  Contiene: 4 archivos SQL de objetos duplicados eliminados

  Archivos:
    - README.md (explicación)
    - public_trg_system_settings_updated_at.sql
    - public_trg_feature_flags_updated_at.sql
    - auth_get_current_user_id.sql

  Propuesta: ❌ ELIMINAR
  Razón: Si estos objetos ya fueron eliminados de DDL y la BD funciona,
         no necesitamos mantener backups de código incorrecto/duplicado
  Alternativa: Mover a orchestration/06-respaldos/ si se quiere histórico

apps/database/backups/2025-11-08-gamilit-role-fix/
  Contiene: 5 archivos SQL de funciones/policies antes de corrección

  Archivos:
    - 01-policies.sql
    - 01-assign_role_to_user.sql
    - 02-get_user_role.sql
    - 03-get_current_user_role.sql
    - 04-remove_role_from_user.sql

  Propuesta: ❌ ELIMINAR
  Razón: Si las correcciones ya están aplicadas en DDL, no necesitamos
         el código viejo
  Alternativa: Mover a orchestration/06-respaldos/ si se quiere histórico
```

**RECOMENDACIÓN:** Eliminar carpeta backups/ completa si las correcciones están aplicadas

---

### 6. CARPETA apps/database/migrations/

#### ✅ MANTENER TODOS

```
apps/database/migrations/
  ├── 2025-11-04-fix-exercises-default.sql
  ├── 2025-11-04-fix-notification-type-enum.sql
  ├── 2025-11-04-fix-processing-status-enum.sql
  ├── 2025-11-04-fix-team-role-enum.sql
  ├── 2025-11-04-sync-enums-p0.sql
  ├── 2025-11-07-align-notification-type-with-docs.sql
  ├── 2025-11-07-fix-achievement-enums-schema.sql
  ├── 2025-11-08-add-fk-profiles-school.sql
  ├── 2025-11-08-add-notification-priority.sql
  ├── 2025-11-08-migrate-auth-provider-enum.sql
  ├── 2025-11-08-migrate-comodin-type-enum.sql
  ├── 2025-11-08-migrate-content-management-enums.sql
  ├── 2025-11-08-migrate-difficulty-level-enum.sql
  ├── 2025-11-08-migrate-notification-enums.sql
  ├── 2025-11-08-migrate-progress-status-enum.sql
  ├── 2025-11-08-migrate-setting-type-enum.sql
  └── 2025-11-08-sync-transaction-type-enum.sql

Razón: Son migraciones válidas para actualizar BD existentes
Estado: ✅ ESENCIALES para el proyecto
```

#### ❌ ELIMINAR

```
apps/database/migrations/sprint-0/
  - README.md (solo contiene un README vacío o con info obsoleta)

  Razón: Carpeta vacía o con contenido obsoleto de sprint inicial
```

---

### 7. CARPETA apps/database/scripts/

#### ✅ MANTENER (Scripts esenciales)

```
apps/database/scripts/
  ├── init-database.sh              ✅ ESENCIAL (script maestro)
  ├── recreate-database.sh          ✅ ESENCIAL
  ├── reset-database.sh             ✅ ESENCIAL
  ├── manage-secrets.sh             ✅ ESENCIAL
  ├── update-env-files.sh           ✅ ESENCIAL
  ├── cleanup-duplicados.sh         ✅ ÚTIL
  ├── validate_integrity.py         ✅ ÚTIL
  ├── backup/                       ✅ MANTENER carpeta
  ├── restore/                      ✅ MANTENER carpeta
  ├── config/                       ✅ MANTENER carpeta
  ├── utilities/                    ✅ MANTENER carpeta
  ├── inventory/                    ✅ MANTENER carpeta
  └── migrations/                   ✅ MANTENER carpeta
```

#### ❌ ELIMINAR

```
apps/database/scripts/deprecated/
  - init-database-v1.sh
  - init-database-v2.sh
  - init-database.sh.backup-20251102-235826

  Razón: Scripts deprecados, ya existe versión actual
  Estado: Obsoletos
```

#### 🔄 MOVER Scripts de Corrección SQL (son temporales)

```
apps/database/scripts/add-on-delete-clauses.sql
apps/database/scripts/create-missing-functions.sql
apps/database/scripts/fix-broken-functions.sql
apps/database/scripts/fix-enum-schemas.sql
apps/database/scripts/fix-fk-references.sql
apps/database/scripts/fix-function-volatility.sql
apps/database/scripts/validate-post-correction.sql

Acción: Mover a orchestration/scripts-correccion/
Razón: Son scripts de corrección temporal, no son parte del flujo normal
       de creación de BD
Estado: Una vez aplicados, pueden archivarse
```

#### 🔄 MOVER Documentación MD de scripts/

```
apps/database/scripts/ANALISIS-SCRIPTS-2025-11-08.md
  → orchestration/01-analisis/analisis-scripts-database.md
  Razón: Análisis temporal de agente

apps/database/scripts/REPORTE-CONSOLIDACION-SCRIPTS-2025-11-08.md
  → orchestration/01-analisis/reporte-consolidacion-scripts.md
  Razón: Reporte temporal de agente

apps/database/scripts/README-SCRIPTS-CORRECCION.md
  → orchestration/scripts-correccion/README.md
  Razón: Documentación de scripts de corrección temporal
```

#### ✅ MANTENER Documentación esencial

```
apps/database/scripts/README.md                ✅ MANTENER
apps/database/scripts/README-SETUP.md          ✅ MANTENER
apps/database/scripts/INDEX.md                 ✅ MANTENER (o consolidar)
apps/database/scripts/QUICK-START.md           ✅ MANTENER (o consolidar)

Propuesta: Considerar consolidar estos 4 archivos en un solo README.md
          más completo para simplificar
```

---

### 8. ARCHIVOS EN apps/database/ddl/

#### ✅ MANTENER TODO (Son DDL esenciales)

```
apps/database/ddl/
  ├── 00-prerequisites.sql          ✅ ESENCIAL
  ├── schemas/                      ✅ TODO (323 archivos SQL)
  ├── functions/                    ✅ TODO
  ├── views/                        ✅ TODO
  └── migrations/                   ✅ TODO
```

#### ❌ ELIMINAR Archivos temporales en DDL

```
apps/database/ddl/schemas/INDEX_VALIDATION_SUMMARY.txt
apps/database/ddl/schemas/RLS-MIGRATION-REPORT-SA-DB-040.txt
apps/database/ddl/schemas/public/indexes/README.txt
apps/database/ddl/schemas/public/triggers/CONSOLIDACION-COMPLETA.txt
apps/database/ddl/schemas/public/triggers/IMPLEMENTATION_REPORT.txt
apps/database/ddl/schemas/public/triggers/REPORTE_FINAL_SA_DB_036.txt
apps/database/ddl/schemas/public/triggers/SA-DB-037-FINAL-REPORT.txt

Razón: Archivos de reporte temporal de agentes dentro de DDL
Estado: No pertenecen a la estructura DDL
```

#### ✅ MANTENER Archivos _MAP.md y documentación de estructura

```
apps/database/ddl/CHANGELOG-2025-11-08-gamilit-role-fix.md  ⚠️ REVISAR
  Propuesta: Mover a docs/90-transversal/changelog/ si se mantiene histórico

apps/database/ddl/GUIA-REFERENCIAS-SIMCO.md  ✅ MANTENER o mover a docs/
  Propuesta: Mover a docs/95-guias-desarrollo/

apps/database/ddl/schemas/*/[tipo]/_MAP.md (85+ archivos)  ✅ MANTENER
  Razón: Son índices de la estructura DDL, muy útiles para navegación
```

---

### 9. CARPETA apps/database/seeds/

#### ✅ MANTENER TODO (Datos iniciales)

```
apps/database/seeds/
  ├── dev/                          ✅ MANTENER
  ├── prod/                         ✅ MANTENER
  ├── staging/                      ✅ MANTENER
  └── production/                   ✅ MANTENER
```

#### ⚠️ NOTA: Hay duplicación prod/ vs production/

```
Carpetas duplicadas:
  - seeds/prod/
  - seeds/production/

Acción recomendada: Consolidar en una sola (prod/ por convención)
```

#### ❌ ELIMINAR Archivos temporales en seeds

```
apps/database/seeds/dev/educational_content/SEED-REPORT.json
  Razón: Reporte temporal de generación de seeds
  Estado: No es un archivo de datos inicial
```

---

### 10. CREAR NUEVO apps/database/README.md

Después de la purga, crear un README.md simplificado que contenga:

```markdown
# Database - GAMILIT

Proyecto de base de datos PostgreSQL para GAMILIT

## Estructura

- **ddl/** - Definiciones DDL (schemas, tablas, funciones, etc.)
- **scripts/** - Scripts de gestión de BD (init, recreate, reset)
- **seeds/** - Datos iniciales (dev, staging, prod)
- **migrations/** - Migraciones para actualizar BD existentes
- **create-database.sh** - Script maestro de creación

## Quick Start

Ver `scripts/README.md` para instrucciones de uso

## Documentación

La documentación completa está en `docs/90-transversal/inventarios-database/`
```

---

## PLAN DE EJECUCIÓN

### Fase 1: Crear Respaldo

```bash
# Crear respaldo completo antes de hacer cambios
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit
tar -czf backup-apps-database-pre-purga-2025-11-08.tar.gz apps/database/
mv backup-apps-database-pre-purga-2025-11-08.tar.gz orchestration/06-respaldos/
```

### Fase 2: Mover Archivos a Destinos Correctos

```bash
# 1. Mover docs/ interna a docs/ principal
mkdir -p docs/90-transversal/inventarios-database
mv apps/database/docs/* docs/90-transversal/inventarios-database/

# 2. Mover reportes/ a orchestration/
mkdir -p orchestration/01-analisis/database-validation-reports
mv apps/database/reportes/* orchestration/01-analisis/database-validation-reports/

# 3. Mover scripts de corrección
mkdir -p orchestration/scripts-correccion/database
mv apps/database/scripts/*.sql orchestration/scripts-correccion/database/
mv apps/database/scripts/ANALISIS-SCRIPTS-2025-11-08.md orchestration/01-analisis/
mv apps/database/scripts/REPORTE-CONSOLIDACION-SCRIPTS-2025-11-08.md orchestration/01-analisis/

# 4. Mover backups (opcional, o eliminar)
mkdir -p orchestration/06-respaldos/database-backups
mv apps/database/backups/* orchestration/06-respaldos/database-backups/

# 5. Mover README.md y guías a docs/
mv apps/database/README.md docs/90-transversal/inventarios-database/DATABASE-PROJECT-README.md
mv apps/database/README-CREAR-BD.md docs/95-guias-desarrollo/GUIA-CREAR-BASE-DATOS.md
```

### Fase 3: Eliminar Archivos Obsoletos

```bash
# Eliminar archivos MD obsoletos en raíz
cd apps/database
rm -f INVENTARIO-COMPLETO-BD-2025-11-07.md
rm -f MATRIZ-COBERTURA-MODULOS-PLATAFORMA-2025-11-07.md
rm -f CRITERIOS-VALIDACION.md
rm -f PLAN-ACTUALIZACION-DOCUMENTACION.md
rm -f PLAN-VALIDACION-COMPLETO.md
rm -f REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md
rm -f REPORTE-FASE-2-3-SCHEMAS-FUNCIONES-2025-11-07.md
rm -f REPORTE-VALIDACION-EXHAUSTIVA-DDL-2025-11-08.md
rm -f RESUMEN-VALIDACION-Y-CORRECCIONES.md
rm -f SYNC-REPORT-2025-11-04.md
rm -f _MAP.md

# Eliminar archivos TXT temporales
rm -f FLOWCHART_COMPARISON.txt
rm -f INDICADORES_VISUALES.txt
rm -f RESUMEN_EJECUTIVO_ANALISIS.txt
rm -f TABLA_COMPARATIVA_VISUAL.txt
rm -f summary.txt

# Eliminar carpetas que ya fueron movidas
rm -rf docs/
rm -rf reportes/
rm -rf backups/

# Eliminar deprecated
rm -rf scripts/deprecated/

# Eliminar sprint-0 vacío
rm -rf migrations/sprint-0/

# Eliminar archivos temporales en DDL
rm -f ddl/schemas/INDEX_VALIDATION_SUMMARY.txt
rm -f ddl/schemas/RLS-MIGRATION-REPORT-SA-DB-040.txt
rm -f ddl/schemas/public/indexes/README.txt
rm -f ddl/schemas/public/triggers/CONSOLIDACION-COMPLETA.txt
rm -f ddl/schemas/public/triggers/IMPLEMENTATION_REPORT.txt
rm -f ddl/schemas/public/triggers/REPORTE_FINAL_SA_DB_036.txt
rm -f ddl/schemas/public/triggers/SA-DB-037-FINAL-REPORT.txt

# Eliminar archivos raw en inventarios (ya movidos a docs)
# (después de mover la carpeta docs/)
find docs/90-transversal/inventarios-database/inventarios/ -name "raw-*.txt" -delete

# Eliminar SEED-REPORT.json temporal
find seeds/ -name "SEED-REPORT.json" -delete

# Revisar credenciales (NO ELIMINAR si no está en .gitignore)
# ⚠️ MANUAL: Verificar database-credentials-dev.txt
```

### Fase 4: Crear Nuevo README.md Simplificado

```bash
# Crear nuevo README.md en apps/database/
cat > apps/database/README.md << 'EOF'
# Database - GAMILIT

Proyecto de base de datos PostgreSQL para GAMILIT

## Estructura

- **ddl/** - Definiciones DDL (schemas, tablas, funciones, triggers, etc.)
- **scripts/** - Scripts de gestión de BD (inicialización, reset, backups)
- **seeds/** - Datos iniciales por ambiente (dev, staging, prod)
- **migrations/** - Migraciones para actualizar BD existentes
- **create-database.sh** - Script maestro para crear BD desde cero

## Quick Start

### Crear Base de Datos Nueva

\`\`\`bash
./create-database.sh
\`\`\`

### Inicializar Base de Datos con Usuario

\`\`\`bash
./scripts/init-database.sh --env dev
\`\`\`

Ver más opciones en [scripts/README.md](scripts/README.md)

## Documentación Completa

La documentación detallada está en:
- \`docs/90-transversal/inventarios-database/\` - Inventarios de objetos DB
- \`docs/95-guias-desarrollo/GUIA-CREAR-BASE-DATOS.md\` - Guía de creación

## Estructura de Directorios

\`\`\`
apps/database/
├── ddl/                     # DDL SQL files
│   ├── 00-prerequisites.sql # Schemas + ENUMs base
│   └── schemas/             # 13 schemas con todos los objetos
├── scripts/                 # Scripts operacionales
│   ├── init-database.sh     # Inicializar BD
│   ├── recreate-database.sh # Recrear BD
│   └── reset-database.sh    # Reset BD
├── seeds/                   # Datos iniciales
│   ├── dev/                 # Desarrollo
│   ├── staging/             # Staging
│   └── prod/                # Producción
├── migrations/              # Migraciones SQL
└── create-database.sh       # Script maestro
\`\`\`

## Mantenimiento

- Los archivos _MAP.md dentro de ddl/schemas/ documentan la estructura
- Los scripts de inventory/ en scripts/ regeneran inventarios
- Los backups están en orchestration/06-respaldos/
EOF
```

### Fase 5: Consolidar Seeds (Opcional)

```bash
# Si hay duplicación entre prod/ y production/, consolidar
# Analizar contenido primero
diff -r seeds/prod seeds/production

# Si son iguales, eliminar uno
# rm -rf seeds/production  # o viceversa
```

### Fase 6: Validación Post-Purga

```bash
# Verificar estructura final
tree -L 3 apps/database/

# Verificar que scripts esenciales funcionan
./apps/database/create-database.sh --help
./apps/database/scripts/init-database.sh --help

# Contar archivos restantes
find apps/database -type f | wc -l
```

---

## RESULTADO ESPERADO POST-PURGA

```
apps/database/
├── ddl/                              ✅ DDL (323 archivos SQL + _MAP.md)
│   ├── 00-prerequisites.sql
│   ├── GUIA-REFERENCIAS-SIMCO.md     ✅ (o mover a docs/)
│   └── schemas/
│       ├── [13 schemas con archivos SQL y _MAP.md]
│       └── ...
├── scripts/                          ✅ Scripts esenciales
│   ├── init-database.sh
│   ├── recreate-database.sh
│   ├── reset-database.sh
│   ├── manage-secrets.sh
│   ├── update-env-files.sh
│   ├── cleanup-duplicados.sh
│   ├── validate_integrity.py
│   ├── README.md                     ✅ Mantener
│   ├── README-SETUP.md               ✅ Mantener
│   ├── INDEX.md                      ✅ Mantener
│   ├── QUICK-START.md                ✅ Mantener
│   ├── backup/
│   ├── restore/
│   ├── config/
│   ├── utilities/
│   ├── inventory/
│   └── migrations/
├── seeds/                            ✅ Datos iniciales
│   ├── dev/
│   ├── staging/
│   └── prod/                         ✅ (consolidado)
├── migrations/                       ✅ Migraciones (17 archivos SQL)
├── create-database.sh                ✅ Script maestro
├── database-credentials-dev.txt      ⚠️ Revisar si debe estar en repo
└── README.md                         ✅ Nuevo simplificado

ELIMINADO:
  ❌ Todos los MD de reportes (11 archivos)
  ❌ Todos los TXT temporales (5 archivos)
  ❌ Carpeta docs/ (movida a docs/ principal)
  ❌ Carpeta reportes/ (movida a orchestration/)
  ❌ Carpeta backups/ (movida o eliminada)
  ❌ Carpeta scripts/deprecated/
  ❌ Scripts SQL de corrección temporal (movidos)
  ❌ Archivos TXT/JSON de reportes en ddl/
  ❌ migrations/sprint-0/

MOVIDO A docs/:
  ✅ README.md → DATABASE-PROJECT-README.md
  ✅ README-CREAR-BD.md → GUIA-CREAR-BASE-DATOS.md
  ✅ docs/* → inventarios-database/

MOVIDO A orchestration/:
  ✅ reportes/* → 01-analisis/database-validation-reports/
  ✅ scripts/*.sql → scripts-correccion/database/
  ✅ Reportes de scripts → 01-analisis/
  ✅ backups/* → 06-respaldos/database-backups/ (opcional)
```

---

## CHECKLIST DE VERIFICACIÓN PRE-APROBACIÓN

Antes de ejecutar la purga, verificar:

- [ ] ¿Existe backup completo de apps/database/?
- [ ] ¿Se verificó que la información de archivos a eliminar está en docs/ o es obsoleta?
- [ ] ¿Se confirmó que migrations/ contiene migraciones válidas que deben mantenerse?
- [ ] ¿Se revisó database-credentials-dev.txt para asegurar que no contenga secretos?
- [ ] ¿Se verificó que scripts esenciales están identificados correctamente?
- [ ] ¿Se confirmó que archivos _MAP.md en DDL son útiles y deben mantenerse?
- [ ] ¿Se revisó que seeds/prod y seeds/production no tienen divergencias importantes?

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Eliminar archivo necesario | Media | Alto | ✅ Backup completo antes de purga |
| Perder información valiosa de reportes | Baja | Medio | ✅ Mover a orchestration/ en lugar de eliminar |
| Romper scripts que referencian archivos | Media | Alto | ✅ Probar scripts después de purga |
| Perder credenciales importantes | Baja | Crítico | ✅ Verificar database-credentials-dev.txt primero |

---

## APROBACIÓN REQUERIDA

Este plan requiere aprobación del usuario antes de ejecutarse.

**Preguntas para el usuario:**

1. ¿Aprobar eliminación de reportes MD temporales de agentes?
2. ¿Aprobar mover carpeta docs/ a docs/90-transversal/?
3. ¿Aprobar mover carpeta reportes/ a orchestration/?
4. ¿Aprobar eliminación de carpeta backups/ o preferir moverla a orchestration/?
5. ¿Aprobar consolidación de seeds/prod y seeds/production/?
6. ¿Qué hacer con database-credentials-dev.txt?
7. ¿Aprobar eliminación de scripts/deprecated/?

---

**Documento generado:** 2025-11-08
**Estado:** Pendiente aprobación del usuario
**Acción siguiente:** Presentar plan al usuario para revisión y aprobación
