# TRIGGER: SINCRONIZACION SSOT

**Version:** 1.0.0
**Fecha:** 2026-02-13
**Sistema:** SIMCO v4.0.0
**Alias:** @TRIGGER_SSOT_SYNC

---

## RESUMEN EJECUTIVO

Este trigger OBLIGA a verificar la sincronizacion entre los inventarios SSOT (Single Source of Truth) cuando se modifica codigo o DDL. Se activa automaticamente al detectar cambios en archivos que afectan la cadena de coherencia.

**PRINCIPIO:** "Los 8 inventarios YAML son la unica fuente de verdad. Todo cambio en codigo DEBE reflejarse en el inventario correspondiente antes de cerrar la tarea."

---

## CONDICIONES DE ACTIVACION

```yaml
activar_cuando:
  DDL:
    - Se crea o modifica tabla (CREATE TABLE, ALTER TABLE)
    - Se crea o modifica vista (CREATE VIEW, CREATE MATERIALIZED VIEW)
    - Se crea o modifica funcion/trigger
    - Se modifica schema (CREATE SCHEMA, DROP)
    - Se modifica seed data

  Backend:
    - Se crea o modifica entity (.entity.ts)
    - Se crea o modifica service (.service.ts)
    - Se crea o modifica controller (.controller.ts)
    - Se crea o modifica DTO (.dto.ts)
    - Se crea o modifica guard (.guard.ts)
    - Se crea o elimina modulo (.module.ts)
    - Se modifica app.module.ts (datasources, imports)

  Frontend:
    - Se crea o elimina componente (.tsx)
    - Se crea o elimina hook (use*.ts)
    - Se crea o elimina store (.store.ts)
    - Se crea o elimina pagina (pages/*.tsx)
    - Se crea o elimina ruta (App.tsx routes)
    - Se crea o elimina API service (services/api/*.ts)

  Inventarios:
    - Se modifica cualquier archivo en orchestration/inventarios/
    - Deben sincronizarse inventarios dependientes
```

---

## INVENTARIOS SSOT (8 archivos)

```yaml
inventarios:
  - archivo: "DATABASE_INVENTORY.yml"
    dominio: DDL
    contiene: schemas, tablas, vistas, funciones, triggers, RLS, FKs, ENUMs
    metricas_clave: [schemas, tablas, views, materialized_views, funciones, triggers, politicas_rls, foreign_keys, enums]

  - archivo: "BACKEND_INVENTORY.yml"
    dominio: Backend
    contiene: modulos, entities, services, controllers, endpoints, guards, decorators, DTOs
    metricas_clave: [modulos, entities, dtos, services, controllers, endpoints, guards, decorators]

  - archivo: "FRONTEND_INVENTORY.yml"
    dominio: Frontend
    contiene: componentes, hooks, paginas, stores, API services, rutas, mecanicas
    metricas_clave: [componentes, hooks, paginas, stores_zustand, api_services, api_calls, rutas, mecanicas]

  - archivo: "MASTER_INVENTORY.yml"
    dominio: Consolidado
    contiene: metricas globales de DB + BE + FE + tests
    metricas_clave: [todas las anteriores consolidadas]

  - archivo: "ENDPOINTS_INVENTORY.yml"
    dominio: API
    contiene: endpoints por modulo, metodos HTTP, rutas

  - archivo: "ENTITIES_INVENTORY.yml"
    dominio: Entities
    contiene: entities por modulo, campos, relaciones, datasource

  - archivo: "TESTS_INVENTORY.yml"
    dominio: Testing
    contiene: specs por modulo, tests passing, coverage

  - archivo: "DOCS_INVENTORY.yml"
    dominio: Documentacion
    contiene: documentos por seccion, estado, fecha
```

---

## VERIFICACIONES OBLIGATORIAS

### 1. Al Modificar DDL

```yaml
ANTES_de_completar_tarea:
  verificar:
    - "¿DATABASE_INVENTORY.yml refleja el cambio?"
    - "¿Conteo de tablas/vistas/funciones sigue correcto?"
    - "¿MASTER_INVENTORY.yml seccion database actualizada?"
    - "¿CLAUDE.md metricas de BD coinciden?"

  si_no_sincronizado:
    accion: "BLOQUEAR hasta actualizar inventarios"
    prioridad: "DATABASE_INVENTORY > MASTER_INVENTORY > CLAUDE.md"
```

### 2. Al Modificar Backend

```yaml
ANTES_de_completar_tarea:
  verificar:
    - "¿BACKEND_INVENTORY.yml refleja el cambio?"
    - "¿ENTITIES_INVENTORY.yml actualizado si entity cambio?"
    - "¿ENDPOINTS_INVENTORY.yml actualizado si endpoint cambio?"
    - "¿MASTER_INVENTORY.yml seccion backend actualizada?"
    - "¿CLAUDE.md metricas de BE coinciden?"

  si_no_sincronizado:
    accion: "BLOQUEAR hasta actualizar inventarios"
    prioridad: "BACKEND > ENTITIES/ENDPOINTS > MASTER > CLAUDE.md"
```

### 3. Al Modificar Frontend

```yaml
ANTES_de_completar_tarea:
  verificar:
    - "¿FRONTEND_INVENTORY.yml refleja el cambio?"
    - "¿Conteo de componentes/hooks/paginas/stores correcto?"
    - "¿MASTER_INVENTORY.yml seccion frontend actualizada?"
    - "¿CLAUDE.md metricas de FE coinciden?"

  si_no_sincronizado:
    accion: "BLOQUEAR hasta actualizar inventarios"
    prioridad: "FRONTEND > MASTER > CLAUDE.md"

  errores_comunes:
    - "NO contar stores aspiracionales (solo 14 Zustand reales)"
    - "NO contar inline hooks como archivos hook"
    - "NO contar sub-views/tabs como paginas separadas"
    - "NO confundir gamification UI con mecanicas de ejercicio"
```

### 4. Al Modificar Inventarios Directamente

```yaml
ANTES_de_completar_tarea:
  verificar:
    - "¿Cambio en inventario dominio refleja realidad del codigo?"
    - "¿MASTER_INVENTORY.yml sincronizado con dominio?"
    - "¿CLAUDE.md metricas sincronizadas?"

  regla_cascada:
    - "Inventario dominio cambia → MASTER debe cambiar"
    - "MASTER cambia → CLAUDE.md metricas deben cambiar"
    - "NUNCA actualizar CLAUDE.md sin actualizar inventario primero"
```

---

## CADENA DE COHERENCIA

```
┌─────────────────────────────────────────────────────────────────┐
│                    CADENA DE SINCRONIZACION SSOT                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CODIGO FUENTE                                                 │
│   ├── DDL (apps/database/ddl/)                                 │
│   ├── Backend (apps/backend/src/modules/)                      │
│   └── Frontend (apps/frontend/src/)                            │
│         │                                                       │
│         ▼                                                       │
│   INVENTARIOS DOMINIO                                          │
│   ├── DATABASE_INVENTORY.yml                                   │
│   ├── BACKEND_INVENTORY.yml                                    │
│   ├── FRONTEND_INVENTORY.yml                                   │
│   ├── ENDPOINTS_INVENTORY.yml                                  │
│   ├── ENTITIES_INVENTORY.yml                                   │
│   ├── TESTS_INVENTORY.yml                                      │
│   └── DOCS_INVENTORY.yml                                       │
│         │                                                       │
│         ▼                                                       │
│   INVENTARIO CONSOLIDADO                                       │
│   └── MASTER_INVENTORY.yml                                     │
│         │                                                       │
│         ▼                                                       │
│   DOCUMENTACION PUBLICA                                        │
│   ├── CLAUDE.md (metricas)                                     │
│   └── PROJECT-CONTEXT.md (estado)                              │
│                                                                 │
│   REGLA: El flujo es SIEMPRE ascendente                        │
│          Codigo → Dominio → Master → CLAUDE.md                 │
│          NUNCA actualizar un nivel sin actualizar el anterior   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## TOLERANCIAS

```yaml
tolerancias:
  conteo_exacto:
    - entities: "DEBE coincidir exactamente (152 entities = 152 en inventario)"
    - tablas: "DEBE coincidir exactamente (169 tablas = 169 en inventario)"
    - modulos: "DEBE coincidir exactamente (22 modulos = 22 en inventario)"

  conteo_aproximado:
    - endpoints: "Tolerancia ±5% (899 ± 45)"
    - componentes: "Tolerancia ±3% (474 ± 14)"
    - api_calls: "Tolerancia ±5% (655 ± 33)"

  nota: "Tolerancia se aplica solo cuando el conteo exacto es impractico (endpoints con rutas dinamicas, componentes con variantes). Siempre preferir conteo exacto."
```

---

## ERRORES COMUNES DE METRICAS

```yaml
errores_frecuentes:
  stores:
    error: "Documentar 32 stores cuando solo existen 14 Zustand reales"
    causa: "Contar stores aspiracionales que nunca se crearon"
    prevencion: "Contar SOLO archivos .store.ts que existen en disco"

  hooks:
    error: "Contar inline hooks dentro de componentes como archivos hook"
    causa: "Confundir useState/useEffect inline con custom hook files"
    prevencion: "Contar SOLO archivos use*.ts en hooks/ directories"

  paginas:
    error: "Contar sub-views y tabs como paginas separadas"
    causa: "Tabs dentro de una pagina no son paginas independientes"
    prevencion: "Contar SOLO archivos en pages/ con rutas propias"

  mecanicas:
    error: "Contar 40 mecanicas incluyendo gamification UI"
    causa: "Confundir componentes de gamificacion con tipos de ejercicio"
    prevencion: "Contar SOLO exercise type evaluators (30 reales)"

  rutas:
    error: "Contar Route groups como rutas individuales"
    causa: "Un <Route> wrapper no es una ruta navegable"
    prevencion: "Contar SOLO <Route path=...> con componente de pagina"
```

---

## INTEGRACION CON OTROS TRIGGERS

```yaml
secuencia_triggers:
  1: "TRIGGER-ANALISIS-DEPENDENCIAS"     # Mapear impacto
  2: "TRIGGER-COHERENCIA-CAPAS"          # DDL↔Entity↔DTO coherente
  3: "TRIGGER-SSOT-SYNC"                 # ← ESTE TRIGGER
  4: "TRIGGER-INVENTARIOS-SINCRONIZADOS" # Inventarios actualizados
  5: "TRIGGER-CIERRE-TAREA-OBLIGATORIO"  # Gate de cierre

orden: "TRIGGER-SSOT-SYNC se ejecuta DESPUES de COHERENCIA-CAPAS y ANTES de INVENTARIOS"
razon: "Primero verificar que el codigo es coherente, luego que los inventarios reflejan el codigo"
```

---

## CHECKLIST RAPIDO

```markdown
[ ] Identificar dominio del cambio (DDL/BE/FE)
[ ] Verificar inventario de dominio actualizado
[ ] Verificar MASTER_INVENTORY.yml sincronizado
[ ] Verificar CLAUDE.md metricas coinciden
[ ] Verificar PROJECT-CONTEXT.md estado correcto
[ ] No hay metricas aspiracionales (solo conteos reales)
```

---

## REFERENCIAS

| Alias | Descripcion |
|-------|-------------|
| @TRIGGER_SSOT_SYNC | Este trigger |
| @TRIGGER_COHERENCIA | Coherencia entre capas |
| @TRIGGER_INVENTARIOS | Inventarios sincronizados |
| @DEF_CHK_SSOT_SYNC | Checklist SSOT completo |
| @VALIDACION_SSOT | Directiva de validacion SSOT |
| @INVENTORY | MASTER_INVENTORY.yml |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Trigger Preventivo
