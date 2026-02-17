---
name: simco-validation-coherence
description: "Validacion de coherencia entre capas DDL, Entity, Endpoint y Frontend"
version: 1.0.0
simco_source: orchestration/directivas/simco/SIMCO-VALIDAR.md
category: sync
priority: P1
capved_required: false
agents_compatible:
  - claude-code
  - gemini-cli
  - windsurf
  - trae
dependencies:
  - simco-apply-standard
triggers:
  - on_validation
  - on_audit_request
  - on_inventory_sync
internal: true
estimated_tokens: 700
tags:
  - validacion
  - coherencia
  - ssot
  - cross-layer
  - metricas
input_schema:
  required:
    - validation_scope
  optional:
    - target_layer
    - specific_module
    - tolerance_threshold
output_schema:
  success:
    - validation_matrix
    - discrepancies_found
    - coherence_score
  error:
    - error_code
    - error_message
contract_version: 1.0.0
---

# simco-validation-coherence

## Proposito
Validar la coherencia entre las cuatro capas principales del proyecto gamilit: DDL (base de datos), Entities (backend ORM), Endpoints (API REST), y Frontend (API calls). Detectar discrepancias, objetos huerfanos, endpoints sin cobertura y llamadas API obsoletas. Mantener los inventarios SSOT actualizados con conteos reales.

## Cuando Usar
- Despues de cambios significativos que afectan multiples capas (nueva feature, refactor).
- Como parte de auditorias periodicas de coherencia del sistema.
- Cuando los inventarios (MASTER_INVENTORY, BACKEND_INVENTORY, etc.) necesitan revalidacion.
- Antes de releases o entregas para confirmar integridad del sistema.

## Cuando NO Usar
- Para cambios aislados en una sola capa que no afectan otras (typo en docs, CSS change).
- Durante prototipado rapido donde las capas aun no estan estabilizadas.
- Para validar logica de negocio (eso es testing, no coherencia de capas).

## Prerequisitos
- Acceso de lectura a todo el repositorio monorepo.
- Inventarios SSOT disponibles en `orchestration/inventarios/`.
- Conocimiento de los conteos baseline: 169 tablas, 152 entities, 901 endpoints, 570 API calls.

## Instrucciones

### Paso 1: Seleccionar alcance de validacion
Definir que se va a validar:
- **Full:** Todas las capas, todos los modulos (requiere mas tiempo y tokens).
- **Layer-specific:** Solo una capa (ej: solo DDL vs entities).
- **Module-specific:** Solo un modulo (ej: solo gamification en todas las capas).
- **Delta:** Solo los cambios desde el ultimo commit/release.

Documentar el alcance elegido antes de continuar.

### Paso 2: Contar objetos DDL
Recorrer `apps/database/ddl/schemas/` y contar:
```
- Tablas: CREATE TABLE (excluir MV) por schema
- Views: CREATE VIEW / CREATE OR REPLACE VIEW
- Materialized Views: CREATE MATERIALIZED VIEW
- Funciones: CREATE OR REPLACE FUNCTION (en archivos DDL, no .TEST.sql)
- Triggers: CREATE TRIGGER (no funciones trigger)
- RLS Policies: CREATE POLICY (no ALTER TABLE ENABLE RLS)
- ENUMs: CREATE TYPE ... AS ENUM
- Foreign Keys: REFERENCES o FOREIGN KEY
```
Comparar contra baseline: 169 tablas, 22 views, 7 MVs, 183 funciones, 67 triggers, 227 RLS, 42 ENUMs, 298 FKs.

### Paso 3: Mapear entities contra tablas DDL
Para cada entity en `apps/backend/src/modules/**/entities/*.entity.ts`:
- Extraer el nombre de tabla del decorador `@Entity('nombre_tabla')`.
- Verificar que existe el DDL correspondiente en `apps/database/ddl/schemas/`.
- Excepciones validas: data_warehouse (16 tablas DDL-only, sin entities).
- Detectar entities huerfanas (sin DDL) o tablas sin entity.

Baseline: 169 tablas DDL, 152 entities (153 @Entity classes, message.entity.ts tiene 2).

### Paso 4: Verificar cobertura de endpoints
Para cada controller en `apps/backend/src/modules/**/controllers/*.controller.ts`:
- Contar endpoints por decorador (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`).
- Verificar que cada endpoint tiene su DTO de entrada/salida.
- Detectar endpoints no documentados o controllers sin service.

Baseline: 107 controllers, 901 endpoints, 399 DTOs.

### Paso 5: Validar llamadas API del frontend
Para cada archivo API en `apps/frontend/src/`:
- Contar llamadas a backend (axios, fetch, api client calls).
- Verificar que cada llamada corresponde a un endpoint existente.
- Detectar llamadas a endpoints obsoletos o inexistentes.
- Verificar que las rutas API del frontend coinciden con las del backend.

Baseline: 52 API service files, 570 API calls.

### Paso 6: Generar reporte de discrepancias
Compilar resultados en una matriz de coherencia:

```
| Capa          | Esperado | Real | Delta | Estado  |
|---------------|----------|------|-------|---------|
| Tablas DDL    | 169      | ???  | +/-   | OK/WARN |
| Entities      | 152      | ???  | +/-   | OK/WARN |
| Endpoints     | 901      | ???  | +/-   | OK/WARN |
| API Calls FE  | 570      | ???  | +/-   | OK/WARN |
```

Calcular coherence_score: porcentaje de capas sin discrepancias.
Documentar cada discrepancia con: capa, objeto, tipo de problema, severidad, accion sugerida.

## Manejo de Errores

| Escenario | Accion | Ejemplo |
|-----------|--------|---------|
| Count mismatch | Investigar delta, identificar objetos faltantes o sobrantes | Tablas DDL = 170 pero baseline = 169 -> encontrar tabla nueva |
| Orphan entity | Entity sin DDL correspondiente -> verificar si fue eliminada o renombrada | `OldTable.entity.ts` sin DDL -> marcar para limpieza |
| Missing endpoint | Tabla/entity sin controller -> documentar como gap intencional o pendiente | data_warehouse entities no necesitan endpoints |
| Stale API call | Frontend llama endpoint que ya no existe -> marcar para correccion | `/api/v1/old-route` eliminada pero frontend aun la llama |
| Inventory stale | Conteos en MASTER_INVENTORY no coinciden con realidad -> actualizar SSOT | MASTER dice 899 endpoints pero conteo real es 901 |

## Formato de Salida

```yaml
validation_coherence_result:
  scope: "full" | "layer-specific" | "module-specific" | "delta"
  timestamp: "2026-02-17T10:00:00Z"
  validation_matrix:
    ddl:
      tables: { expected: 169, actual: 169, delta: 0, status: "OK" }
      views: { expected: 22, actual: 22, delta: 0, status: "OK" }
      functions: { expected: 183, actual: 183, delta: 0, status: "OK" }
    backend:
      entities: { expected: 152, actual: 152, delta: 0, status: "OK" }
      endpoints: { expected: 901, actual: 901, delta: 0, status: "OK" }
    frontend:
      api_calls: { expected: 570, actual: 570, delta: 0, status: "OK" }
  discrepancies_found: []
  coherence_score: 100
  recommendations: []
```

## Checklist de Validacion
- [ ] El alcance de validacion fue definido explicitamente.
- [ ] Los conteos DDL fueron verificados contra archivos reales (no cache).
- [ ] El mapeo entity-DDL fue verificado bidireccionalmente.
- [ ] Los endpoints fueron contados desde decoradores de controllers.
- [ ] Las llamadas API del frontend fueron verificadas contra endpoints reales.
- [ ] Las discrepancias fueron documentadas con severidad y accion sugerida.
- [ ] Los inventarios SSOT fueron actualizados si hubo cambios.

## Referencias
- `orchestration/directivas/simco/SIMCO-VALIDAR.md`
- `orchestration/directivas/simco/SIMCO-VALIDACION-SSOT.md`
- `orchestration/inventarios/MASTER_INVENTORY.yml`
- `orchestration/inventarios/BACKEND_INVENTORY.yml`
- CLAUDE.md -- RC2: COHERENCIA ENTRE CAPAS
