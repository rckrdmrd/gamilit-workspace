# PLAN DE EJECUCION REFINADO - DOCUMENTACION BD GAMILIT
**Fecha:** 2026-01-14
**Estado:** LISTO PARA EJECUCION
**Viabilidad:** 87% (Validado)

---

## RESUMEN EJECUTIVO

### Objetivo
Incrementar la cobertura de documentacion de la base de datos GAMILIT de **73% a 95%** mediante:
- Reconciliacion de discrepancias P0
- Actualizacion de inventarios YAML
- Creacion de _MAP.md faltantes
- Validacion de coherencia

### Metricas de Exito
| Metrica | Actual | Objetivo | Diferencia |
|---------|--------|----------|------------|
| Cobertura Documentacion | 73% | 95% | +22% |
| Schemas con _MAP.md | 12/16 | 16/16 | +4 |
| Discrepancias P0 | 4 | 0 | -4 |
| RLS Policies Documentadas | 32 | ~121 | +89 |

### Timeline Total: 7.5 - 8.5 horas (1-2 dias)

---

## ORDEN DE EJECUCION (6 FASES)

### FASE 1: DATABASE_INVENTORY.yml (SSOT)
**Tiempo:** 60-75 min
**Riesgo:** BAJO
**Prioridad:** P0 - CRITICA

| Tarea | Archivo | Cambio | Tiempo |
|-------|---------|--------|--------|
| 1.1 | DATABASE_INVENTORY.yml | Actualizar policies_rls: 32 → ~121 | 30 min |
| 1.2 | DATABASE_INVENTORY.yml | Agregar +12 funciones faltantes | 15 min |
| 1.3 | DATABASE_INVENTORY.yml | Agregar +14 triggers faltantes | 15 min |
| 1.4 | DATABASE_INVENTORY.yml | Validar ENUMs (-4 deprecados) | 15 min |

**Dependencias Afectadas:** 136 archivos dependen de este archivo

**Validacion Post-Fase:**
```bash
# Verificar sintaxis YAML
yamllint orchestration/inventarios/DATABASE_INVENTORY.yml
```

---

### FASE 2: INVENTORY-MASTER-REPORT.md
**Tiempo:** 15-20 min
**Riesgo:** BAJO
**Prioridad:** P0

| Tarea | Archivo | Cambio | Tiempo |
|-------|---------|--------|--------|
| 2.1 | INVENTORY-MASTER-REPORT.md | Sincronizar metricas desde YAML | 10 min |
| 2.2 | INVENTORY-MASTER-REPORT.md | Actualizar tabla resumen ejecutivo | 5 min |

**Bloqueador:** Debe ejecutarse despues de FASE 1

---

### FASE 3: 16 _MAP.md en Schemas (Orden Jerarquico)
**Tiempo:** 90-120 min
**Riesgo:** MEDIO
**Prioridad:** P1

#### GRUPO A - Sin Dependencias (5 schemas)
| Schema | Archivo | Estado | Accion | Tiempo |
|--------|---------|--------|--------|--------|
| public | _MAP.md | NO EXISTE | CREAR | 15 min |
| auth | _MAP.md | EXISTE | VERIFICAR | 5 min |
| storage | _MAP.md | NO EXISTE | CREAR | 10 min |
| system_configuration | _MAP.md | EXISTE | VERIFICAR | 5 min |
| content_management | _MAP.md | EXISTE | VERIFICAR | 5 min |

#### GRUPO B - Depende de GRUPO A (1 schema)
| Schema | Archivo | Estado | Accion | Tiempo |
|--------|---------|--------|--------|--------|
| gamilit | _MAP.md | NO EXISTE | CREAR | 15 min |

#### GRUPO C - Depende de GRUPO A+B (4 schemas)
| Schema | Archivo | Estado | Accion | Tiempo |
|--------|---------|--------|--------|--------|
| auth_management | _MAP.md | EXISTE | ACTUALIZAR | 10 min |
| audit_logging | _MAP.md | EXISTE | VERIFICAR | 5 min |
| educational_content | _MAP.md | EXISTE | VERIFICAR | 5 min |
| progress_tracking | _MAP.md | EXISTE | ACTUALIZAR | 10 min |

#### GRUPO D - Depende de GRUPO A+B+C (6 schemas)
| Schema | Archivo | Estado | Accion | Tiempo |
|--------|---------|--------|--------|--------|
| gamification_system | _MAP.md | EXISTE | VERIFICAR | 5 min |
| social_features | _MAP.md | EXISTE | VERIFICAR | 5 min |
| notifications | _MAP.md | EXISTE | ACTUALIZAR | 10 min |
| communication | _MAP.md | EXISTE | ACTUALIZAR | 10 min |
| lti_integration | _MAP.md | EXISTE | VERIFICAR | 5 min |
| admin_dashboard | _MAP.md | NO EXISTE | CREAR | 15 min |

---

### FASE 4: Mapas Maestros
**Tiempo:** 15-20 min
**Riesgo:** BAJO
**Prioridad:** P1

| Tarea | Archivo | Cambio | Tiempo |
|-------|---------|--------|--------|
| 4.1 | orchestration/_MAP.md | Sincronizar metricas | 5 min |
| 4.2 | docs/90-transversal/_MAP.md | Sincronizar navegacion | 5 min |
| 4.3 | apps/database/_MAP.md | Verificar coherencia | 5 min |

---

### FASE 5: Documentacion Adicional
**Tiempo:** 45-60 min
**Riesgo:** BAJO
**Prioridad:** P2

| Tarea | Archivo | Proposito | Tiempo |
|-------|---------|-----------|--------|
| 5.1 | VALIDATORS_INVENTORY.md | Documentar 15 validadores | 20 min |
| 5.2 | GAMIFICATION_ARCHITECTURE.md | Sistema de rangos Maya | 20 min |
| 5.3 | DEPENDENCY_GRAPH.yml | Grafo de dependencias | 15 min |

---

### FASE 6: Validacion Final
**Tiempo:** 30-45 min
**Riesgo:** BAJO
**Prioridad:** P0 POST-EJECUCION

| Tarea | Script/Comando | Proposito | Tiempo |
|-------|----------------|-----------|--------|
| 6.1 | validate-ddl-coverage.sh | Cobertura DDL | 10 min |
| 6.2 | drop-and-recreate-database.sh | Carga limpia | 15 min |
| 6.3 | Revision manual | Links y coherencia | 15 min |

---

## ARCHIVOS A CREAR (4 nuevos)

### 1. public/_MAP.md
```markdown
# _MAP: public/
**Estado:** Reservado para PostgreSQL
**Objetos:** Minimos (extension functions)
**Notas:** No usar para objetos de aplicacion
```

### 2. storage/_MAP.md
```markdown
# _MAP: storage/
**Estado:** Deprecado
**ENUMs:** 1 (buckettype - deprecated)
**Notas:** Schema reservado para futuras integraciones de almacenamiento
```

### 3. gamilit/_MAP.md
```markdown
# _MAP: gamilit/
**Estado:** Core/Utilities
**Funciones:** 27 activas + 8 deprecated
**Funciones Criticas:**
- update_updated_at_column() - Usada por 30+ triggers
- get_current_user_id() - Base para RLS
- now_mexico() - Timezone consistente
```

### 4. admin_dashboard/_MAP.md
```markdown
# _MAP: admin_dashboard/
**Estado:** Produccion
**Tablas:** 4 (materialized_views, bulk_operations, admin_reports, metrics_history)
**Vistas:** 7 (user_stats_summary, classroom_overview, etc.)
**MVs:** 3 (system_overview_mv, user_analytics_mv, classroom_summary_mv)
```

---

## ARCHIVOS A ACTUALIZAR (12 existentes)

| Archivo | Tipo Cambio | Descripcion |
|---------|-------------|-------------|
| DATABASE_INVENTORY.yml | MAJOR | Reconciliar metricas |
| INVENTORY-MASTER-REPORT.md | MINOR | Sincronizar |
| auth_management/_MAP.md | MINOR | Agregar parent_* tables |
| progress_tracking/_MAP.md | MINOR | Actualizar triggers count |
| notifications/_MAP.md | MINOR | Completar funciones |
| communication/_MAP.md | MINOR | Completar descripcion |
| orchestration/_MAP.md | MINOR | Metricas |
| docs/90-transversal/_MAP.md | MINOR | Navegacion |
| apps/database/_MAP.md | VERIFICAR | Coherencia |
| gamification_system/_MAP.md | VERIFICAR | OK |
| social_features/_MAP.md | VERIFICAR | OK |
| educational_content/_MAP.md | VERIFICAR | OK |

---

## ARCHIVOS A NO MODIFICAR (Protegidos)

- orchestration/CONTEXT-MAP.yml
- orchestration/PROXIMA-ACCION.md
- apps/database/create-database.sh
- orchestration/trazas/*
- apps/backend/* (no es scope)
- apps/frontend/* (no es scope)

---

## CHECKPOINTS DE VALIDACION

### Checkpoint 1: Post FASE 1
```bash
yamllint orchestration/inventarios/DATABASE_INVENTORY.yml
# Debe retornar: 0 errores
```

### Checkpoint 2: Post FASE 3
```bash
ls apps/database/ddl/schemas/*/_MAP.md | wc -l
# Debe retornar: 16
```

### Checkpoint 3: Post FASE 6
```bash
./apps/database/validate-ddl-coverage.sh
# Debe retornar: "All DDL files covered"
```

---

## CRITERIOS DE ACEPTACION

1. [ ] DATABASE_INVENTORY.yml actualizado con metricas correctas
2. [ ] 16/16 schemas tienen _MAP.md
3. [ ] 0 discrepancias P0 pendientes
4. [ ] validate-ddl-coverage.sh pasa sin errores
5. [ ] drop-and-recreate-database.sh ejecuta exitosamente
6. [ ] Cobertura documentacion >= 95%

---

## ROLLBACK PROCEDURE

En caso de error critico:

```bash
# 1. Restaurar DATABASE_INVENTORY.yml
git checkout HEAD -- orchestration/inventarios/DATABASE_INVENTORY.yml

# 2. Restaurar _MAP.md modificados
git checkout HEAD -- apps/database/ddl/schemas/*/_MAP.md

# 3. Verificar estado
git status

# 4. Re-ejecutar validaciones
./apps/database/validate-ddl-coverage.sh
```

---

## TIMELINE DETALLADO

| Fase | Inicio | Duracion | Fin Estimado |
|------|--------|----------|--------------|
| FASE 1 | T+0:00 | 75 min | T+1:15 |
| FASE 2 | T+1:15 | 20 min | T+1:35 |
| FASE 3 | T+1:35 | 120 min | T+3:35 |
| FASE 4 | T+3:35 | 20 min | T+3:55 |
| FASE 5 | T+3:55 | 60 min | T+4:55 |
| FASE 6 | T+4:55 | 45 min | T+5:40 |

**Total: 5 horas 40 minutos** (con margen de contingencia)

---

## RESPONSABLES

| Fase | Rol Recomendado | Aprobacion |
|------|-----------------|------------|
| FASE 1-2 | DBA / Tech Lead | Auto-aprobacion |
| FASE 3 | Developer | Revision por DBA |
| FASE 4-5 | Documentation Lead | Auto-aprobacion |
| FASE 6 | QA / Tech Lead | Aprobacion final |

---

**Documento Generado:** 2026-01-14
**Sistema:** SIMCO v3.8+ - Modo @ANALYSIS/@FULL
**Fase:** 6 - Refinamiento del Plan
**Estado:** LISTO PARA EJECUCION - Pendiente aprobacion
