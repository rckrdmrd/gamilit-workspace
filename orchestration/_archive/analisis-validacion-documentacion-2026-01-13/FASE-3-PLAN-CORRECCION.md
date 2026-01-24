# FASE 3: PLAN DE CORRECCION - VALIDACION DOCUMENTACION GAMILIT

**Fecha:** 2026-01-13
**Ejecutado por:** Meta-Orquestador
**Sistema:** SIMCO + CAPVED
**Modo:** MODE-FULL

---

## RESUMEN DEL PLAN

| Prioridad | Archivos | Cambios | Tiempo Est. |
|-----------|----------|---------|-------------|
| P0 - Critico | 2 | 15 | 30 min |
| P1 - Alto | 4 | 25 | 45 min |
| P2 - Medio | 3 | 12 | 30 min |
| **TOTAL** | **9** | **52** | **~2 horas** |

---

## ORDEN DE EJECUCION

```
1. PROJECT-STATUS.md        [P0] - Documento mas desactualizado
2. MASTER_INVENTORY.yml     [P0] - Fuente de verdad principal
3. DATABASE_INVENTORY.yml   [P1] - Clarificar activos vs deprecated
4. BACKEND_INVENTORY.yml    [P1] - Actualizar endpoints y modulos
5. CONTEXTO-PROYECTO.md     [P1] - Metricas generales
6. _MAP.md                  [P1] - Sincronizar con CONTEXTO
7. FRONTEND_INVENTORY.yml   [P2] - Actualizar si existe, crear si no
8. Crear STORES_INVENTORY   [P2] - Nuevo archivo
9. Actualizar SEEDS conteo  [P2] - Ajustar numeros
```

---

## PLAN DETALLADO POR ARCHIVO

### 1. PROJECT-STATUS.md [P0 - CRITICO]

**Ubicacion:** `orchestration/00-guidelines/PROJECT-STATUS.md`
**Estado actual:** Completamente desactualizado
**Accion:** Reescritura completa de seccion de metricas

#### Cambios Requeridos

| Linea | Campo | Valor Actual | Valor Nuevo |
|-------|-------|--------------|-------------|
| ~15 | schemas | 6 | 16 |
| ~16 | tablas | 34 | 137 |
| ~20 | endpoints | 80+ | 612 |
| ~22 | modulos_backend | 15 | 17 |
| ~25 | componentes | 50+ | 327 |
| ~28 | estado_mvp | variable | 75% |

#### Template de Correccion

```yaml
metricas_tecnicas:
  database:
    schemas: 16
    tablas: 137
    funciones_activas: 110
    triggers_activos: 35
    politicas_rls: 32
    seeds: 169
  backend:
    modulos: 17
    controllers: 75
    services: 105
    entities: 108
    endpoints: 612
    dtos: 337
  frontend:
    paginas: 74
    componentes: 327
    hooks: 103
    stores: 12
    servicios_api: 52
```

#### Validacion Post-Cambio
- [ ] Todas las metricas coinciden con MASTER_INVENTORY
- [ ] No hay valores vagos ("80+", "50+")
- [ ] Fecha de actualizacion correcta

---

### 2. MASTER_INVENTORY.yml [P0 - CRITICO]

**Ubicacion:** `orchestration/inventarios/MASTER_INVENTORY.yml`
**Estado actual:** Parcialmente desactualizado
**Accion:** Actualizar metricas y agregar clarificaciones

#### Cambios Requeridos

| Seccion | Campo | Valor Actual | Valor Nuevo |
|---------|-------|--------------|-------------|
| resumen.database | schemas | 15 | 16 |
| resumen.database | tables | 133 | 137 |
| resumen.database | functions | 150 | 110 (+ nota: activas) |
| resumen.database | triggers | 112 | 35 (+ nota: activos) |
| resumen.database | policies_rls | 185 | 32 |
| resumen.backend | modules | 16 | 17 |
| resumen.backend | entities | 93 | 108 |
| resumen.backend | endpoints | "300+" | 612 |
| resumen.frontend | components | 497 | 327 |
| resumen.frontend | pages | 64 | 74 |
| resumen.frontend | stores | 11 | 12 |
| resumen.frontend | api_services | 15 | 52 |

#### Secciones Nuevas a Agregar

```yaml
# Agregar despues de resumen.database
notas_conteo:
  funciones:
    activas: 110
    deprecated: 41
    total_archivos: 151
  triggers:
    activos: 35
    deprecated: 77
    total_archivos: 112
  politicas_rls:
    verificado: "2026-01-13"
    query_usado: "SELECT COUNT(*) FROM pg_policies"
```

```yaml
# Agregar en resumen.frontend
stores_detail:
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

#### Validacion Post-Cambio
- [ ] version incrementada a 4.1.0
- [ ] fecha_actualizacion = 2026-01-13
- [ ] Todas las metricas verificadas
- [ ] Notas de clarificacion agregadas

---

### 3. DATABASE_INVENTORY.yml [P1 - ALTO]

**Ubicacion:** `orchestration/inventarios/DATABASE_INVENTORY.yml`
**Estado actual:** Incluye deprecated en conteos
**Accion:** Clarificar activos vs deprecated

#### Cambios Requeridos

| Seccion | Campo | Valor Actual | Valor Nuevo |
|---------|-------|--------------|-------------|
| metadata | version | 4.3.0 | 4.4.0 |
| metadata | last_updated | 2026-01-08 | 2026-01-13 |
| database_counts | tables | 133 | 137 |
| database_counts | functions | 151 | 110 (activas) |
| database_counts | triggers | 112 | 35 (activos) |
| database_counts | policies | 185 | 32 |
| metadata | total_seed_files | 100 | 169 |

#### Secciones a Modificar

```yaml
# Modificar database_counts para clarificar
database_counts:
  schemas: 16
  tables: 137
  views: 17
  materialized_views: 11
  enums: 42
  functions_active: 110
  functions_deprecated: 41
  functions_total: 151
  triggers_active: 35
  triggers_deprecated: 77
  triggers_total: 112
  indexes_files: 21
  indexes_statements: 701
  policies_rls: 32
  foreign_keys: 208
```

#### Validacion Post-Cambio
- [ ] Distincion clara activos/deprecated
- [ ] Conteos verificados contra BD real
- [ ] Version incrementada

---

### 4. BACKEND_INVENTORY.yml [P1 - ALTO]

**Ubicacion:** `orchestration/inventarios/BACKEND_INVENTORY.yml`
**Estado actual:** Endpoints subestimados, modulos desactualizados
**Accion:** Actualizar metricas de modulos

#### Cambios Requeridos

| Seccion | Campo | Valor Actual | Valor Nuevo |
|---------|-------|--------------|-------------|
| metadata | version | 3.1.0 | 3.2.0 |
| metadata | last_updated | 2026-01-07 | 2026-01-13 |
| metadata | total_modules | 16 | 17 |
| metadata | total_entities | 107 | 108 |
| metadata | total_endpoints | "300+" | 612 |

#### Modulos a Actualizar

```yaml
# Actualizar conteos por modulo
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

#### Validacion Post-Cambio
- [ ] endpoints es numero exacto (612)
- [ ] Modulos actualizados con conteos reales
- [ ] Version incrementada

---

### 5. CONTEXTO-PROYECTO.md [P1 - ALTO]

**Ubicacion:** `orchestration/00-guidelines/CONTEXTO-PROYECTO.md`
**Estado actual:** Metricas desactualizadas
**Accion:** Actualizar seccion de metricas

#### Cambios Requeridos

| Campo | Valor Actual | Valor Nuevo |
|-------|--------------|-------------|
| tablas | 123 | 137 |
| endpoints | 417 | 612 |
| politicas_rls | 185 | 32 |

#### Validacion Post-Cambio
- [ ] Metricas sincronizadas con MASTER_INVENTORY
- [ ] Fecha de actualizacion correcta

---

### 6. _MAP.md (Orchestration) [P1 - ALTO]

**Ubicacion:** `orchestration/_MAP.md`
**Estado actual:** Metricas desactualizadas (igual que CONTEXTO)
**Accion:** Sincronizar con CONTEXTO-PROYECTO

#### Cambios Requeridos

| Campo | Valor Actual | Valor Nuevo |
|-------|--------------|-------------|
| tablas | 123 | 137 |
| endpoints | 417 | 612 |
| politicas_rls | 185 | 32 |

#### Validacion Post-Cambio
- [ ] Valores identicos a CONTEXTO-PROYECTO
- [ ] No hay discrepancias

---

### 7. FRONTEND_INVENTORY.yml [P2 - MEDIO]

**Ubicacion:** `orchestration/inventarios/FRONTEND_INVENTORY.yml`
**Estado actual:** Pendiente de verificar existencia
**Accion:** Actualizar o crear si no existe

#### Metricas a Documentar

```yaml
metadata:
  version: "4.1.0"
  last_updated: "2026-01-13"
  framework: "React + TypeScript + Vite"

resumen:
  total_pages: 74
  total_components: 327
  total_hooks: 103
  total_stores: 12
  total_api_services: 52
  total_mechanics: 33

pages_by_portal:
  admin: 17
  student: 25
  teacher: 25
  otros: 7

stores:
  - name: "authStore"
    path: "/features/auth/store/authStore.ts"
  - name: "economyStore"
    path: "/features/gamification/economy/store/economyStore.ts"
  # ... (12 stores)

api_services:
  core: 10
  features: 25
  teacher: 12
  admin: 5
```

---

### 8. Crear STORES_INVENTORY.yml [P2 - MEDIO]

**Ubicacion:** `orchestration/inventarios/STORES_INVENTORY.yml` (NUEVO)
**Accion:** Crear archivo nuevo con inventario de stores Zustand

#### Contenido

```yaml
# STORES INVENTORY - GAMILIT
# Inventario de Zustand stores del frontend

metadata:
  version: "1.0.0"
  created: "2026-01-13"
  framework: "Zustand"

total_stores: 12

stores:
  - name: "authStore"
    path: "/features/auth/store/authStore.ts"
    description: "Gestion de autenticacion"

  - name: "economyStore"
    path: "/features/gamification/economy/store/economyStore.ts"
    description: "Gestion de economia y monedas"

  - name: "ranksStore"
    path: "/features/gamification/ranks/store/ranksStore.ts"
    description: "Gestion de rangos/ranks"

  - name: "achievementsStore"
    path: "/features/gamification/social/store/achievementsStore.ts"
    description: "Gestion de logros"

  - name: "friendsStore"
    path: "/features/gamification/social/store/friendsStore.ts"
    description: "Gestion de amigos"

  - name: "guildsStore"
    path: "/features/gamification/social/store/guildsStore.ts"
    description: "Gestion de gremios"

  - name: "leaderboardsStore"
    path: "/features/gamification/social/store/leaderboardsStore.ts"
    description: "Gestion de tablas de clasificacion"

  - name: "newLeaderboardsStore"
    path: "/features/gamification/social/store/newLeaderboardsStore.ts"
    description: "Nueva version de leaderboards"

  - name: "powerUpsStore"
    path: "/features/gamification/social/store/powerUpsStore.ts"
    description: "Gestion de power-ups"

  - name: "missionsStore"
    path: "/features/missions/store/missionsStore.ts"
    description: "Gestion de misiones"

  - name: "notificationsStore"
    path: "/features/notifications/store/notificationsStore.ts"
    description: "Gestion de notificaciones"

  - name: "studentAssignmentsStore"
    path: "/features/assignments/store/studentAssignmentsStore.ts"
    description: "Gestion de tareas de estudiantes"
```

---

## MATRIZ DE DEPENDENCIAS

### Archivos que Dependen de Otros

```
MASTER_INVENTORY.yml (fuente de verdad)
    ├── PROJECT-STATUS.md (debe coincidir)
    ├── CONTEXTO-PROYECTO.md (debe coincidir)
    │       └── _MAP.md (debe coincidir)
    ├── DATABASE_INVENTORY.yml (debe ser consistente)
    ├── BACKEND_INVENTORY.yml (debe ser consistente)
    └── FRONTEND_INVENTORY.yml (debe ser consistente)
```

### Orden de Propagacion

1. Actualizar MASTER_INVENTORY.yml primero
2. Luego propagar a inventarios especificos (DB, Backend, Frontend)
3. Finalmente actualizar documentos MD (PROJECT-STATUS, CONTEXTO, _MAP)

---

## CRITERIOS DE VALIDACION

### Por Cada Archivo Modificado

1. **Sintaxis valida:** YAML parseables, MD rendereable
2. **Metricas coherentes:** Valores coinciden con codigo real
3. **Referencias cruzadas:** Sin discrepancias entre archivos
4. **Versionamiento:** Version incrementada apropiadamente
5. **Timestamps:** fecha_actualizacion = fecha de cambio

### Validacion Global

1. **Consistencia:** Todos los archivos reportan mismos numeros
2. **Completitud:** No hay campos vacios o con "TBD"
3. **Trazabilidad:** Cambios documentados en changelog

---

## CHECKLIST PRE-EJECUCION

- [ ] Crear backup de archivos a modificar
- [ ] Verificar que no hay otros cambios pendientes en archivos
- [ ] Confirmar metricas reales con comandos de verificacion
- [ ] Preparar mensaje de commit descriptivo

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Mitigacion |
|--------|--------------|------------|
| Introducir nuevos errores | Media | Validar sintaxis despues de cada cambio |
| Romper referencias | Baja | Verificar links despues de cambios |
| Numeros incorrectos | Media | Doble verificacion con codigo |

---

**Generado por:** Meta-Orquestador SIMCO
**Sistema:** SAAD v1.0.0
**Siguiente Fase:** FASE 4 - Validacion del Plan
