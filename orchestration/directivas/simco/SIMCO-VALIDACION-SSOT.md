# SIMCO-VALIDACION-SSOT

**Version:** 1.0.0
**Fecha:** 2026-02-13
**Aplica a:** Todos los agentes que modifiquen DDL, Backend, Frontend o Inventarios
**Criticidad:** BLOQUEANTE
**Tipo:** Directiva Obligatoria
**Alias:** @VALIDACION-SSOT
**Depende de:** SIMCO-INVENTARIOS.md, TRIGGER-COHERENCIA-CAPAS

---

## 1. Proposito

Garantizar la sincronizacion entre las 4 capas SSOT del proyecto gamilit:
DDL (169 tablas) -> Backend (152 entities, 899 endpoints) -> Frontend (474 componentes, 655 API calls) -> Inventarios (8 YAMLs).

Toda modificacion en cualquier capa DEBE reflejarse en las demas para mantener coherencia (RC2 de CLAUDE.md).

---

## 2. Archivos SSOT del Proyecto

### 2.1 Inventarios Maestros

| Archivo | Alias | Rol | Version |
|---------|-------|-----|---------|
| MASTER_INVENTORY.yml | @INV_MASTER | Estado consolidado del proyecto | v8.0.0 |
| DATABASE_INVENTORY.yml | @INV_DB | Schemas, tablas, funciones, triggers | v8.0.0 |
| BACKEND_INVENTORY.yml | @INV_BE | Modulos, entities, endpoints, services | v4.0.0 |
| FRONTEND_INVENTORY.yml | @INV_FE | Componentes, paginas, hooks, stores | v5.0.0 |

### 2.2 Fuentes de Codigo (Ground Truth)

| Fuente | Ubicacion | Rol |
|--------|-----------|-----|
| DDL | apps/database/ddl/ | Definicion de tablas, schemas, funciones |
| Entities | apps/backend/src/modules/*/entities/ | Mapeo TypeORM de tablas |
| Controllers | apps/backend/src/modules/*/controllers/ | Endpoints API |
| Frontend API | apps/frontend/src/lib/api/ | Llamadas a endpoints |
| Frontend Types | apps/frontend/src/types/ | Tipos TypeScript del frontend |

---

## 3. Cadena de Coherencia

```
DDL (tabla)
  |
  v
Entity (TypeORM @Entity + @Column)
  |
  v
DTO (CreateDto, UpdateDto, ResponseDto)
  |
  v
Controller (endpoint @Get/@Post/@Put/@Delete)
  |
  v
Frontend API Service (.api.ts)
  |
  v
Frontend Types (interfaces/types .ts)
  |
  v
Frontend Component (.tsx)
```

### 3.1 Regla de Propagacion

```
CUANDO se modifica la CAPA N:
  TODAS las capas N+1...N+K DEBEN actualizarse en la MISMA tarea
  Los inventarios correspondientes DEBEN reflejar el cambio

EJEMPLO:
  Modificar tabla DDL "users" (agregar columna "reputation"):
    1. DDL: ALTER TABLE auth.users ADD COLUMN reputation INTEGER DEFAULT 0
    2. Entity: @Column({ default: 0 }) reputation: number
    3. DTO: CreateUserDto { reputation?: number }, UserResponseDto { reputation: number }
    4. Controller: ya expuesto via DTO
    5. Frontend type: User { reputation: number }
    6. Frontend API: ya mapea via type
    7. Inventarios: actualizar conteos si cambian
```

---

## 4. Reglas de Validacion

### R1: DDL <-> Entity (BLOQUEANTE)

```yaml
regla: "Toda tabla DDL activa DEBE tener entity TypeORM correspondiente"
excepcion: "Tablas de sistema (pg_*, information_schema) excluidas"
verificacion:
  comando: |
    # Contar tablas DDL (excluyendo views)
    grep -r "CREATE TABLE" apps/database/ddl/ | wc -l
    # Contar entities
    find apps/backend/src -name "*.entity.ts" | wc -l
  esperado: "169 tablas >= 152 entities (17 tablas sin entity son aceptables: logs, audit, temporal)"
  gap_maximo: 25
```

### R2: Entity <-> DTO (BLOQUEANTE)

```yaml
regla: "Toda entity con controller DEBE tener al menos CreateDto y ResponseDto"
verificacion:
  metodo: "Por modulo: contar entities con controller vs DTOs disponibles"
  esperado: "152 entities -> 399 DTOs (ratio ~2.6 DTOs/entity)"
```

### R3: Controller <-> Endpoint Documentado (RECOMENDADO)

```yaml
regla: "Todo endpoint en controller DEBE estar documentado en Swagger"
verificacion:
  comando: |
    # Contar decoradores de endpoint
    grep -r "@Get\|@Post\|@Put\|@Delete\|@Patch" apps/backend/src/modules/ | wc -l
  esperado: "899 endpoints"
```

### R4: Backend Endpoint <-> Frontend API Call (INFORMATIVO)

```yaml
regla: "Endpoints activos DEBEN tener consumidor en frontend"
verificacion:
  backend_endpoints: 899
  frontend_api_calls: 655
  gap: 244
  justificacion: "Endpoints admin-only, internos, y background jobs no tienen frontend"
```

### R5: Inventarios <-> Codigo Real (BLOQUEANTE)

```yaml
regla: "Los conteos en inventarios DEBEN coincidir con conteos reales del codigo"
archivos_verificar:
  - MASTER_INVENTORY.yml vs CLAUDE.md
  - BACKEND_INVENTORY.yml vs conteo real de entities/services/controllers
  - FRONTEND_INVENTORY.yml vs conteo real de componentes/hooks/stores
  - DATABASE_INVENTORY.yml vs conteo real de tablas/schemas/funciones
tolerancia: 5%  # Maximo 5% diferencia antes de requerir actualizacion
```

---

## 5. Proceso de Validacion

### 5.1 Validacion Pre-Commit (Automatica)

```
ANTES de commit que modifica DDL, Entity, DTO, Controller o Frontend:
  1. Identificar capa modificada
  2. Verificar propagacion a capas dependientes
  3. Si hay gap: BLOQUEAR commit hasta completar propagacion
  4. Actualizar inventarios si conteos cambiaron
```

### 5.2 Validacion Post-Tarea (Manual)

```
AL FINALIZAR tarea que involucra multiples capas:
  1. Ejecutar checklist de coherencia:
     [ ] DDL coincide con Entity
     [ ] Entity tiene DTOs correspondientes
     [ ] Controller expone endpoints documentados
     [ ] Frontend consume endpoints nuevos (si aplica)
     [ ] Inventarios actualizados
     [ ] CLAUDE.md metricas vigentes
  2. Documentar gaps aceptados con justificacion
```

### 5.3 Auditoria Periodica (Semanal)

```
CADA semana o despues de sprint significativo:
  1. Contar objetos reales por capa
  2. Comparar con inventarios
  3. Si diferencia > 5%: actualizar inventarios
  4. Generar reporte de coherencia
```

---

## 6. Matriz de Impacto por Cambio

| Cambio en... | Impacta DDL | Impacta Entity | Impacta DTO | Impacta Controller | Impacta Frontend | Impacta Inventario |
|-------------|-------------|---------------|-------------|-------------------|-----------------|-------------------|
| Nueva tabla | SI | SI | SI | SI | POSIBLE | SI |
| Nueva columna | SI | SI | SI | NO | POSIBLE | NO |
| Nuevo endpoint | NO | NO | POSIBLE | SI | SI | SI |
| Nuevo componente | NO | NO | NO | NO | SI | SI |
| Nuevo schema | SI | NO | NO | NO | NO | SI |
| Cambio de tipo | SI | SI | SI | NO | SI | NO |
| Eliminar tabla | SI | SI | SI | SI | SI | SI |

---

## 7. Datasources y Schemas

gamilit tiene 10 datasources en app.module.ts mapeando a schemas PostgreSQL:

| Datasource | Schema(s) | Entities |
|-----------|-----------|---------|
| default | auth, core | users, roles, permissions, tenants |
| educational | educational | modules, exercises, content |
| gamification | gamification | xp, ranks, achievements, economy |
| progress | progress | student_progress, scores |
| social | social | friends, guilds, messages |
| notifications | notifications | notifications, templates |
| analytics | analytics | events, reports |
| parents | parents | parent_links, communications |
| tasks | tasks | assignments, submissions |
| teacher | teacher | teacher_tools, reviews |

**Regla especial:** El modulo `communication` tiene entities pero NO tiene .module.ts ni datasource. Este es un gap conocido (ver PROXIMA-ACCION.md).

---

## 8. Integracion con Triggers

```yaml
trigger_asociado: TRIGGER-COHERENCIA-CAPAS
  dispara_cuando:
    - "Commit modifica archivos en apps/database/ddl/"
    - "Commit modifica archivos *.entity.ts"
    - "Commit modifica archivos *.controller.ts"
    - "Commit agrega/elimina archivos en apps/frontend/src/"
  accion:
    - "Verificar propagacion a capas dependientes"
    - "Alertar si inventarios desincronizados"

trigger_futuro: TRIGGER-SSOT-SYNC
  dispara_cuando:
    - "Inventario modificado"
    - "CLAUDE.md modificado"
  accion:
    - "Verificar coherencia MASTER vs capas"
```

---

## 9. Referencias

| Directiva | Relacion |
|-----------|---------|
| SIMCO-INVENTARIOS.md | Define estructura de inventarios |
| SIMCO-BACKEND.md | Operaciones backend NestJS |
| SIMCO-DDL.md | Operaciones DDL PostgreSQL |
| SIMCO-FRONTEND.md | Operaciones frontend React |
| TRIGGER-COHERENCIA-CAPAS | Trigger automatico de coherencia |
| CLAUDE.md RC2 | Regla critica de coherencia entre capas |

---

**Creado por:** TASK-2026-02-13-ANALISIS-MEJORAS-INTEGRABLES
**Basado en:** workspace-arch/SIMCO-VALIDACION-SSOT.md (adaptado para standalone)
