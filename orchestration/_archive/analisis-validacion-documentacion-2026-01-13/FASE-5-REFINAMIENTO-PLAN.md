# FASE 5: REFINAMIENTO DEL PLAN

**Fecha:** 2026-01-13
**Ejecutado por:** Meta-Orquestador
**Sistema:** SIMCO + CAPVED
**Modo:** MODE-FULL

---

## 1. GAPS IDENTIFICADOS Y RESUELTOS

### Gap 1: Verificacion RLS Policies

**Problema:** Discrepancia 185 vs 32 no verificada

**Solucion:** Agregar paso de verificacion pre-ejecucion

**Comando de Verificacion:**
```sql
SELECT schemaname, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname
ORDER BY policy_count DESC;
```

**Nota:** Si el resultado confirma ~32 policies, usar ese valor. Si muestra mas, investigar antes de continuar.

### Gap 2: FRONTEND_INVENTORY.yml

**Estado:** EXISTE
**Ubicacion:** `orchestration/inventarios/FRONTEND_INVENTORY.yml`
**Version:** 4.0
**Ultima actualizacion:** 2026-01-10

**Discrepancias detectadas en el inventario:**

| Campo | Inventario | Real (Agente) | Accion |
|-------|------------|---------------|--------|
| total_components | 497 | 327 | ACTUALIZAR |
| total_pages | 64 | 74 | ACTUALIZAR |
| total_stores | 11 | 12 | ACTUALIZAR |
| total_api_services | 15 | 52 | ACTUALIZAR |
| total_hooks | 103 | 103 | CORRECTO |

### Gap 3: Changelog en Inventarios

**Solucion:** Agregar entrada de changelog en cada archivo modificado con formato:

```yaml
changelog:
  - date: "2026-01-13"
    type: "Validation Update"
    description: "Actualizacion de metricas post-validacion exhaustiva"
    changes:
      - "Campo X: valor_anterior -> valor_nuevo"
```

---

## 2. PLAN REFINADO FINAL

### PASO 0: Pre-Verificacion (NUEVO)

**Objetivo:** Verificar datos antes de modificar archivos

**Acciones:**
1. Ejecutar query de RLS policies en BD
2. Verificar que no hay cambios pendientes en archivos
3. Crear backup de archivos a modificar

### PASO 1: PROJECT-STATUS.md [P0]

**Cambios:**

```markdown
# Actualizar seccion de metricas tecnicas

## Metricas Tecnicas Actuales

| Capa | Objetos | Estado |
|------|---------|--------|
| Database | 16 schemas, 137 tablas, 110 funciones activas | Operativo |
| Backend | 17 modulos, 612 endpoints, 108 entities | Operativo |
| Frontend | 74 paginas, 327 componentes, 103 hooks | Operativo |
```

**Validacion:**
- [ ] Todas las metricas son numeros exactos
- [ ] No hay valores vagos ("80+", "50+")

### PASO 2: MASTER_INVENTORY.yml [P0]

**Cambios en resumen.database:**

```yaml
database:
  schemas: 16  # era 15
  tables: 137  # era 133
  views: 17
  materialized_views: 11
  enums: 42
  functions: 110  # era 150 - ahora solo activas
  triggers: 35  # era 112 - ahora solo activos
  policies_rls: 32  # era 185
  foreign_keys: 208
  seed_files: 169  # era 99
  ddl_files: 397
  status: "Clean creation compliant"
  last_verified: "2026-01-13"
  nota_funciones: "110 activas + 41 deprecadas = 151 archivos totales"
  nota_triggers: "35 activos + 77 deprecados = 112 archivos totales"
```

**Cambios en resumen.backend:**

```yaml
backend:
  modules: 17  # era 16
  entities: 108  # era 93
  dtos: 337  # era 327
  services: 105  # era 103
  controllers: 75  # era 76
  endpoints: 612  # era "300+"
  build_status: "Builds successfully"
  coherencia_bd: "97%"
  last_verified: "2026-01-13"
```

**Cambios en resumen.frontend:**

```yaml
frontend:
  files: 900+
  components: 327  # era 497
  hooks: 103  # era 102
  pages: 74  # era 64
  stores: 12  # era 11
  api_services: 52  # era 15
  mechanics: 33
  routes: 18
  lines_of_code: ~100000
  status: "Builds successfully"
  last_verified: "2026-01-13"
```

**Agregar seccion nueva:**

```yaml
stores_detail:
  total: 12
  list:
    - authStore.ts
    - economyStore.ts
    - ranksStore.ts
    - achievementsStore.ts
    - friendsStore.ts
    - guildsStore.ts
    - leaderboardsStore.ts
    - newLeaderboardsStore.ts
    - powerUpsStore.ts
    - missionsStore.ts
    - notificationsStore.ts
    - studentAssignmentsStore.ts
```

**Agregar al changelog:**

```yaml
changelog:
  - date: "2026-01-13"
    type: "Validation Audit"
    description: "Actualizacion completa de metricas post-validacion exhaustiva"
    agent: "Meta-Orquestador SIMCO"
    changes:
      - "database.schemas: 15 -> 16"
      - "database.tables: 133 -> 137"
      - "database.functions: 150 -> 110 (solo activas)"
      - "database.triggers: 112 -> 35 (solo activos)"
      - "database.policies_rls: 185 -> 32"
      - "backend.modules: 16 -> 17"
      - "backend.entities: 93 -> 108"
      - "backend.endpoints: '300+' -> 612"
      - "frontend.components: 497 -> 327"
      - "frontend.pages: 64 -> 74"
      - "frontend.stores: 11 -> 12"
      - "frontend.api_services: 15 -> 52"
      - "Agregada seccion stores_detail"
```

### PASO 3: DATABASE_INVENTORY.yml [P1]

**Cambios en metadata:**

```yaml
metadata:
  version: "4.4.0"  # era 4.3.0
  last_updated: "2026-01-13"  # era 2026-01-08
```

**Cambios en database_counts:**

```yaml
database_counts:
  schemas: 16
  tables: 137  # era 133
  views: 17
  materialized_views: 11
  enums: 42
  functions_active: 110  # NUEVO - clarifica conteo
  functions_deprecated: 41  # NUEVO
  functions_total: 151  # era functions: 151
  triggers_active: 35  # NUEVO
  triggers_deprecated: 77  # NUEVO
  triggers_total: 112  # era triggers: 112
  indexes: 21
  policies: 32  # era 185
  foreign_keys: 208
```

**Agregar al changelog del archivo:**

```yaml
  - date: "2026-01-13"
    type: "Validation Audit"
    description: "Clarificacion de conteos activos vs deprecados"
    changes:
      - "tables: 133 -> 137"
      - "policies: 185 -> 32 (solo RLS activas)"
      - "Agregados campos functions_active/deprecated"
      - "Agregados campos triggers_active/deprecated"
```

### PASO 4: BACKEND_INVENTORY.yml [P1]

**Cambios en metadata:**

```yaml
metadata:
  version: "3.2.0"  # era 3.1.0
  last_updated: "2026-01-13"
  total_modules: 17  # era 16
  total_entities: 108  # era 107
  total_endpoints: 612  # era "300+"
```

**Cambios en modulos:**

```yaml
modules:
  - name: "notifications"
    entities: 7  # era 1
    services: 7  # era 1
    controllers: 5  # era 1

  - name: "teacher"
    services: 18  # era 5
    controllers: 8  # era 2

  - name: "admin"
    entities: 16  # era 6
```

### PASO 5: CONTEXTO-PROYECTO.md [P1]

**Cambios:**

```markdown
# Actualizar metricas en seccion tecnica

- Tablas: 137 (era 123)
- Endpoints: 612 (era 417)
- Politicas RLS: 32 (era 185)
```

### PASO 6: _MAP.md (Orchestration) [P1]

**Cambios:**
Sincronizar con los mismos valores de CONTEXTO-PROYECTO.md

### PASO 7: FRONTEND_INVENTORY.yml [P2]

**Cambios en summary:**

```yaml
summary:
  total_files: 900+
  total_components: 327  # era 497
  total_hooks: 103
  total_features: 10
  total_pages: 74  # era 64
  total_stores: 12  # era 11
  total_api_services: 52  # era 15
  total_mechanics: 33
  total_routes: 18
```

**Agregar seccion stores_detail:**

```yaml
stores_detail:
  total: 12
  by_feature:
    auth: 1
    gamification_economy: 1
    gamification_ranks: 1
    gamification_social: 5
    missions: 1
    notifications: 1
    assignments: 1
    legacy: 1
```

### PASO 8: Crear STORES_INVENTORY.yml (Opcional) [P2]

Este paso se puede omitir si la seccion stores_detail en MASTER_INVENTORY y FRONTEND_INVENTORY es suficiente.

---

## 3. CHECKLIST DE EJECUCION

### Pre-Ejecucion

- [ ] Verificar RLS policies con query SQL
- [ ] Crear backup de archivos (comando: `cp archivo archivo.bak`)
- [ ] Verificar que no hay cambios pendientes en archivos

### Durante Ejecucion

- [ ] Modificar un archivo a la vez
- [ ] Validar sintaxis despues de cada cambio
- [ ] Verificar que valores son consistentes entre archivos

### Post-Ejecucion

- [ ] Verificar que todos los archivos parsean correctamente
- [ ] Comparar metricas entre MASTER y otros inventarios
- [ ] Verificar archivos dependientes listados en FASE-4

---

## 4. COMANDOS DE VERIFICACION POST-CAMBIO

```bash
# Verificar sintaxis YAML
python3 -c "import yaml; yaml.safe_load(open('archivo.yml'))"

# Verificar que no hay discrepancias de metricas
grep -E "tables:|tablas:|endpoints:|components:" orchestration/inventarios/*.yml orchestration/00-guidelines/*.md

# Verificar version incrementada
grep -E "version:" orchestration/inventarios/*.yml
```

---

## 5. RESUMEN FINAL DEL PLAN REFINADO

| Paso | Archivo | Prioridad | Cambios | Dependencias |
|------|---------|-----------|---------|--------------|
| 0 | Pre-verificacion | - | Query + Backup | Ninguna |
| 1 | PROJECT-STATUS.md | P0 | 6 metricas | Ninguna |
| 2 | MASTER_INVENTORY.yml | P0 | 15+ campos | Ninguna |
| 3 | DATABASE_INVENTORY.yml | P1 | 8 campos | Paso 2 |
| 4 | BACKEND_INVENTORY.yml | P1 | 6 campos | Paso 2 |
| 5 | CONTEXTO-PROYECTO.md | P1 | 3 campos | Paso 2 |
| 6 | _MAP.md | P1 | 3 campos | Paso 5 |
| 7 | FRONTEND_INVENTORY.yml | P2 | 5 campos | Paso 2 |

**Total estimado:** ~2 horas de ejecucion

---

## 6. DECISION POINT

Antes de proceder a FASE 6 (Ejecucion), se requiere confirmacion del usuario:

**Pregunta:** ¿Desea proceder con la ejecucion del plan refinado?

Las opciones son:
1. **Ejecutar completo** - Aplicar todos los cambios del plan
2. **Ejecutar parcial** - Aplicar solo cambios P0 (criticos)
3. **Revisar primero** - Mostrar preview de cambios antes de aplicar
4. **Modificar plan** - Hacer ajustes antes de ejecutar

---

**Generado por:** Meta-Orquestador SIMCO
**Sistema:** SAAD v1.0.0
**Siguiente Fase:** FASE 6 - Ejecucion del Plan (pendiente confirmacion)
