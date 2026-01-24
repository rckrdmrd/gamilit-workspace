# PLAN DE IMPLEMENTACION: Estandares y Buenas Practicas GAMILIT

**Fecha:** 2025-11-29
**Analista:** Architecture-Analyst
**Version:** 1.0
**Basado en:** REPORTE-ANALISIS-ESTANDARES-2025-11-29.md

---

## RESUMEN DEL PLAN

### Objetivo
Implementar estandares y buenas practicas para eliminar duplicaciones, sincronizar types entre backend/frontend, y documentar patrones de desarrollo.

### Alcance
- Backend: DTOs, validaciones, patrones de servicio
- Frontend: Types consolidation, component patterns, hooks
- DevOps: Integracion CI/CD de validaciones
- Documentacion: Crear documentos faltantes

### Fases de Ejecucion

| Fase | Descripcion | Duracion Estimada | Dependencias |
|------|-------------|-------------------|--------------|
| A | Documentacion de Estandares | Grupo 1 | Ninguna |
| B | Consolidacion Backend (DTOs) | Grupo 2 | Fase A |
| C | Consolidacion Frontend (Types) | Grupo 3 | Fase A |
| D | Integracion DevOps | Grupo 4 | Fases B, C |

---

## FASE A: DOCUMENTACION DE ESTANDARES (PARALELO)

### Objetivo
Crear documentacion faltante ANTES de implementar cambios en codigo.

### Tareas

#### A.1: Crear DTO-CONVENTIONS.md
```yaml
Objetivo: Documentar convenciones de DTOs para backend
Ubicacion: docs/95-guias-desarrollo/backend/DTO-CONVENTIONS.md
Agente: Architecture-Analyst (documentacion directa)
Prioridad: P0 - CRITICA
Dependencias: Ninguna

Contenido_Requerido:
  - Patron de nombramiento de DTOs
  - Estructura de carpetas dto/
  - Uso de class-validator decorators
  - DTOs genericos (PaginatedResponseDto, BaseResponseDto)
  - Mapeo DTO <-> Entity <-> Frontend Types
  - Ejemplos de codigo

Criterios_Aceptacion:
  - [ ] Documento creado en ubicacion correcta
  - [ ] Cubre todos los patrones identificados en analisis
  - [ ] Incluye ejemplos de codigo reales del proyecto
  - [ ] Aprobado para uso en desarrollo
```

#### A.2: Crear COMPONENT-PATTERNS.md
```yaml
Objetivo: Documentar patrones de componentes React
Ubicacion: docs/95-guias-desarrollo/frontend/COMPONENT-PATTERNS.md
Agente: Architecture-Analyst (documentacion directa)
Prioridad: P1 - ALTA
Dependencias: Ninguna

Contenido_Requerido:
  - Anatomia de componente estandar
  - Props typing patterns
  - Composicion de componentes
  - Performance patterns (memo, useMemo, useCallback)
  - Error boundaries
  - Testing de componentes

Criterios_Aceptacion:
  - [ ] Documento creado
  - [ ] Patrones basados en componentes existentes
  - [ ] Ejemplos de 180+ componentes
```

#### A.3: Crear HOOK-PATTERNS.md
```yaml
Objetivo: Documentar patrones de custom hooks
Ubicacion: docs/95-guias-desarrollo/frontend/HOOK-PATTERNS.md
Agente: Architecture-Analyst (documentacion directa)
Prioridad: P1 - ALTA
Dependencias: Ninguna

Contenido_Requerido:
  - Estructura de custom hook
  - Naming conventions (useXxx)
  - Error handling en hooks
  - Dependencies array patterns
  - Testing de hooks
  - Integracion con React Query

Criterios_Aceptacion:
  - [ ] Documento creado
  - [ ] Patrones basados en 30+ hooks existentes
```

#### A.4: Actualizar TYPES-CONVENTIONS.md
```yaml
Objetivo: Agregar seccion sobre sincronizacion Backend-Frontend
Ubicacion: docs/95-guias-desarrollo/frontend/TYPES-CONVENTIONS.md
Agente: Architecture-Analyst (documentacion directa)
Prioridad: P0 - CRITICA
Dependencias: Ninguna

Cambios_Requeridos:
  - Agregar seccion "Sincronizacion con Backend"
  - Documentar uso de generated/api-types.ts
  - Definir cuando usar types generados vs manuales
  - Proceso para agregar nuevo type compartido

Criterios_Aceptacion:
  - [ ] Seccion agregada
  - [ ] Flujo de sincronizacion claro
```

---

## FASE B: CONSOLIDACION BACKEND (SECUENCIAL)

### Objetivo
Eliminar duplicaciones de DTOs y crear patrones reutilizables.

### Tareas

#### B.1: Crear DTOs Genericos Base
```yaml
Objetivo: Crear DTOs base reutilizables
Archivos_Nuevos:
  - apps/backend/src/shared/dto/common/paginated-response.dto.ts
  - apps/backend/src/shared/dto/common/base-response.dto.ts
  - apps/backend/src/shared/dto/common/index.ts
Agente: Backend-Agent
Prioridad: P0 - CRITICA
Dependencias: A.1 (DTO-CONVENTIONS.md)

Especificacion:
  PaginatedResponseDto<T>:
    - data: T[]
    - total: number
    - page: number
    - limit: number
    - total_pages: number
    - Decorators: @ApiProperty con generics

  BaseResponseDto:
    - id: string
    - created_at: Date
    - updated_at: Date
    - Decorators: @Expose, @Type

Criterios_Aceptacion:
  - [ ] DTOs genericos creados
  - [ ] Decorators de Swagger correctos
  - [ ] Exportados en barrel file
  - [ ] Compila sin errores
```

#### B.2: Refactorizar DTOs Paginados Existentes
```yaml
Objetivo: Reemplazar 8 DTOs paginados duplicados con genericos
Archivos_Modificados:
  - admin/dto/alerts/paginated-alerts.dto.ts
  - admin/dto/content/paginated-content.dto.ts
  - admin/dto/content/paginated-media.dto.ts
  - admin/dto/interventions/paginated-interventions.dto.ts
  - admin/dto/organizations/paginated-organizations.dto.ts
  - admin/dto/system/paginated-audit-log.dto.ts
  - admin/dto/users/paginated-users.dto.ts
  - notifications/dto/paginated-notifications.dto.ts
Agente: Backend-Agent
Prioridad: P0 - CRITICA
Dependencias: B.1

Cambio_Requerido:
  Antes:
    export class PaginatedAlertsDto {
      data: AlertDto[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    }

  Despues:
    import { PaginatedResponseDto } from '@shared/dto/common';
    export class PaginatedAlertsDto extends PaginatedResponseDto<AlertDto> {}

Criterios_Aceptacion:
  - [ ] 8 archivos refactorizados
  - [ ] Imports actualizados
  - [ ] Backend compila
  - [ ] Tests pasan
```

#### B.3: Actualizar DATABASE_INVENTORY y BACKEND_INVENTORY
```yaml
Objetivo: Documentar nuevos DTOs en inventarios
Archivos_Modificados:
  - orchestration/inventarios/BACKEND_INVENTORY.yml
Agente: Architecture-Analyst (documentacion directa)
Prioridad: P1
Dependencias: B.1, B.2

Criterios_Aceptacion:
  - [ ] Inventario actualizado con DTOs genericos
  - [ ] Trazabilidad completa
```

---

## FASE C: CONSOLIDACION FRONTEND (PARALELO CON B.2+)

### Objetivo
Eliminar duplicaciones de types y consolidar en SSOT.

### Tareas

#### C.1: Ejecutar Plan de Consolidacion Achievement
```yaml
Objetivo: Eliminar 12 duplicaciones de Achievement
Archivos_Modificados:
  - Eliminar definiciones duplicadas en 11 archivos
  - Mantener SSOT en /shared/types/achievement.types.ts
  - Actualizar imports en todos los consumidores
Agente: Frontend-Agent
Prioridad: P0 - CRITICA
Dependencias: A.4

Proceso:
  1. Identificar todos los archivos que definen Achievement
  2. Verificar que SSOT tiene todos los campos necesarios
  3. Eliminar definiciones duplicadas
  4. Actualizar imports a @shared/types
  5. Verificar que compila

Criterios_Aceptacion:
  - [ ] Solo 1 definicion de Achievement
  - [ ] Todos los imports desde @shared/types
  - [ ] Frontend compila
  - [ ] No hay errores TypeScript
```

#### C.2: Ejecutar Plan de Consolidacion MayaRank
```yaml
Objetivo: Eliminar 7 duplicaciones de MayaRank
Archivos_Modificados:
  - Mantener SSOT en /shared/constants/ranks.constants.ts
  - Eliminar duplicados en otros archivos
  - Actualizar imports
Agente: Frontend-Agent
Prioridad: P0 - CRITICA
Dependencias: A.4

Criterios_Aceptacion:
  - [ ] Solo 1 definicion de MayaRank (enum)
  - [ ] Todos los imports desde @shared/constants
  - [ ] Frontend compila
```

#### C.3: Configurar Uso de Generated API Types
```yaml
Objetivo: Usar types generados de OpenAPI como SSOT para API responses
Archivos_Modificados:
  - apps/frontend/src/services/api/*.ts
Agente: Frontend-Agent
Prioridad: P1
Dependencias: C.1, C.2

Especificacion:
  - Importar types desde @/generated/api-types
  - Eliminar definiciones manuales duplicadas
  - Crear alias para types comunes

Criterios_Aceptacion:
  - [ ] API services usan types generados
  - [ ] Eliminados types manuales duplicados
```

#### C.4: Actualizar FRONTEND_INVENTORY
```yaml
Objetivo: Documentar consolidacion de types
Archivos_Modificados:
  - orchestration/inventarios/FRONTEND_INVENTORY.yml
Agente: Architecture-Analyst
Dependencias: C.1, C.2, C.3

Criterios_Aceptacion:
  - [ ] Inventario actualizado
  - [ ] SSOT documentados
```

---

## FASE D: INTEGRACION DEVOPS

### Objetivo
Automatizar validaciones en CI/CD.

### Tareas

#### D.1: Integrar validate:all en CI
```yaml
Objetivo: Ejecutar validaciones automaticamente en CI
Archivos_Modificados:
  - .github/workflows/ci.yml (crear si no existe)
  - package.json (verificar scripts)
Agente: DevOps-Agent o Workspace-Manager
Prioridad: P2
Dependencias: Fases B y C

Especificacion:
  Jobs:
    - npm run sync:enums (verificar sincronizacion)
    - npm run validate:constants (detectar hardcoding)
    - npm run validate:api-contract (validar rutas)
    - npm run generate:api-types (regenerar y comparar)

Criterios_Aceptacion:
  - [ ] Workflow CI creado
  - [ ] Validaciones ejecutan en cada PR
  - [ ] Fallo bloquea merge si hay problemas
```

#### D.2: Extender sync-enums para DTOs
```yaml
Objetivo: Sincronizar DTOs compartidos automaticamente
Archivos_Nuevos:
  - apps/devops/scripts/sync-shared-types.ts
Agente: DevOps-Agent
Prioridad: P1
Dependencias: C.3

Especificacion:
  - Sincronizar shared/dto/ -> frontend equivalente
  - O generar tipos desde OpenAPI automaticamente
  - Agregar a postinstall

Criterios_Aceptacion:
  - [ ] Script creado y funcional
  - [ ] Integrado en npm scripts
  - [ ] Documentado en README
```

---

## MATRIZ DE AGENTES Y TAREAS

| Tarea | Agente | Prompt | Paralelo |
|-------|--------|--------|----------|
| A.1 | Architecture-Analyst | Directo (Write) | Si |
| A.2 | Architecture-Analyst | Directo (Write) | Si |
| A.3 | Architecture-Analyst | Directo (Write) | Si |
| A.4 | Architecture-Analyst | Directo (Edit) | Si |
| B.1 | Backend-Agent | PROMPT-BACKEND-AGENT.md | No (secuencial) |
| B.2 | Backend-Agent | PROMPT-BACKEND-AGENT.md | No (depende B.1) |
| B.3 | Architecture-Analyst | Directo (Write) | Si (con C.4) |
| C.1 | Frontend-Agent | PROMPT-FRONTEND-AGENT.md | Si (con C.2) |
| C.2 | Frontend-Agent | PROMPT-FRONTEND-AGENT.md | Si (con C.1) |
| C.3 | Frontend-Agent | PROMPT-FRONTEND-AGENT.md | No (depende C.1, C.2) |
| C.4 | Architecture-Analyst | Directo (Write) | Si (con B.3) |
| D.1 | DevOps-Agent | PROMPT-WORKSPACE-MANAGER.md | No (final) |
| D.2 | DevOps-Agent | PROMPT-WORKSPACE-MANAGER.md | No (final) |

---

## ORDEN DE EJECUCION

### Grupo 1: Documentacion (PARALELO - 4 agentes)
```
A.1 + A.2 + A.3 + A.4
(Architecture-Analyst ejecuta directamente)
```

### Grupo 2: Backend Consolidacion (SECUENCIAL)
```
B.1 -> B.2 -> B.3
(Backend-Agent para B.1, B.2)
(Architecture-Analyst para B.3)
```

### Grupo 3: Frontend Consolidacion (PARALELO + SECUENCIAL)
```
C.1 || C.2 -> C.3 -> C.4
(Frontend-Agent para C.1, C.2, C.3)
(Architecture-Analyst para C.4)
```

### Grupo 4: DevOps (SECUENCIAL - Final)
```
D.1 -> D.2
(DevOps-Agent o Workspace-Manager)
```

---

## DIAGRAMA DE DEPENDENCIAS

```
FASE A (Paralelo)
  A.1 ─┐
  A.2 ─┼─> FASE B
  A.3 ─┤
  A.4 ─┴─> FASE C

FASE B (Secuencial)
  B.1 -> B.2 -> B.3 ─┐
                     ├─> FASE D
FASE C (Mixto)       │
  C.1 ──┬─> C.3 -> C.4 ─┘
  C.2 ──┘

FASE D (Secuencial - Final)
  D.1 -> D.2 -> COMPLETADO
```

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Breaking changes en DTOs | ALTA | ALTO | Refactorizar gradualmente, tests primero |
| Imports rotos frontend | ALTA | MEDIO | Ejecutar tsc --noEmit despues de cada cambio |
| Conflictos de merge | MEDIA | BAJO | Trabajar en rama feature aislada |
| CI falla en PR existentes | MEDIA | BAJO | Implementar como warning primero |

---

## CRITERIOS DE EXITO GLOBALES

| Metrica | Actual | Objetivo | Verificacion |
|---------|--------|----------|--------------|
| DTOs paginados duplicados | 8 | 0 | grep "PaginatedResponseDto" |
| Definiciones Achievement | 12 | 1 | grep "interface Achievement" |
| Definiciones MayaRank | 7 | 1 | grep "enum MayaRank" |
| Documentos faltantes | 3 | 0 | ls docs/95-guias-desarrollo/ |
| Validaciones en CI | 0 | 4 | Workflow status |

---

## ESTADO DEL PLAN

**Listo para FASE 3:** Validacion de Planeacion contra Analisis

---

**Firma:** Architecture-Analyst
**Fecha:** 2025-11-29
