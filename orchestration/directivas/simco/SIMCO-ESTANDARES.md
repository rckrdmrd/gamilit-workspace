# SIMCO-ESTANDARES

**Version:** 2.0.1
**Fecha:** 2026-03-03
**Aplica a:** Todos los agentes que generen o modifiquen codigo o documentacion
**Criticidad:** OBLIGATORIA
**Tipo:** Directiva Operacional
**Alias:** @ESTANDARES
**Depende de:** SIMCO-DOCUMENTAR.md

---

## 1. Proposito

Centralizar la gestion de los 37 estandares del proyecto gamilit. Define que estandar aplica por dominio, orden de consulta recomendado, y dependencias entre estandares.

> **Nota:** 37 corresponde al conteo de archivos `.md` en `docs/40-standards/` (raiz + subdirectorios de capitulos, segun MASTER_INVENTORY.yml `standards_md_files: 37`). Los estandares ESTANDAR-MEMORIA-TOKENS.md y ESTANDAR-SKILLS.md (especificos de agentes IA externos) y ESTANDAR-BACKEND-PROFESIONAL.md (reemplazado por `backend-profesional/` modular) fueron eliminados del proyecto standalone.

---

## 2. Catalogo de Estandares

### 2.1 Base / Generales (5)

| # | Estandar | Archivo | Dominio |
|---|----------|---------|---------|
| 1 | Codigo | ESTANDAR-CODIGO.md | Todos |
| 2 | Nomenclatura | ESTANDAR-NOMENCLATURA.md | Todos |
| 3 | Git | ESTANDAR-GIT.md | DevOps |
| 4 | Documentacion | ESTANDAR-DOCUMENTACION.md | Docs |
| 5 | Estructura Docs | ESTANDAR-ESTRUCTURA-DOCS.md | Docs |

### 2.2 Backend (5)

| # | Estandar | Archivo | Dominio |
|---|----------|---------|---------|
| 6 | API | ESTANDAR-API.md | Backend |
| 7 | Nomenclatura API | ESTANDAR-NOMENCLATURA-API.md | Backend |
| 8 | Database Profesional | ESTANDAR-DATABASE-PROFESIONAL.md | Database |
| 9 | Cross-Schema References | ESTANDAR-CROSS-SCHEMA-REFERENCES.md | Database |
| 10 | Diagramas ER | ESTANDAR-DIAGRAMAS-ER.md | Database |

### 2.3 Frontend (9)

| # | Estandar | Archivo | Dominio | ADR Relacionado |
|---|----------|---------|---------|----------------|
| 11 | Frontend Profesional | ESTANDAR-FRONTEND-PROFESIONAL.md | Frontend | — |
| 12 | Frontend Component | ESTANDAR-FRONTEND-COMPONENT.md | Frontend | ADR-048 |
| 13 | Frontend Types | ESTANDAR-FRONTEND-TYPES.md | Frontend | — |
| 14 | Frontend Imports | ESTANDAR-FRONTEND-IMPORTS.md | Frontend | — |
| 15 | Frontend API | ESTANDAR-FRONTEND-API.md | Frontend | ADR-011, ADR-015 |
| 16 | Frontend Responsive (v1.2.0) | ESTANDAR-FRONTEND-RESPONSIVE.md | Frontend | ADR-050 |
| 17 | Frontend Modal Responsive | ESTANDAR-FRONTEND-MODAL-RESPONSIVE.md | Frontend | ADR-050 |
| 18 | Frontend Card Truncation | ESTANDAR-FRONTEND-CARD-TRUNCATION.md | Frontend | — |
| 19 | Frontend UX Patterns | ESTANDAR-FRONTEND-UX-PATTERNS.md | Frontend | ADR-046, ADR-049 |

### 2.4 Seguridad (3)

| # | Estandar | Archivo | Dominio |
|---|----------|---------|---------|
| 20 | Seguridad | ESTANDAR-SEGURIDAD.md | Todos |
| 21 | Seguridad API | ESTANDAR-SEGURIDAD-API.md | Backend |
| 22 | Seguridad Web | ESTANDAR-SEGURIDAD-WEB.md | Frontend, Backend |

### 2.5 Testing (5)

| # | Estandar | Archivo | Dominio | ADR Relacionado |
|---|----------|---------|---------|----------------|
| 23 | Testing | ESTANDAR-TESTING.md | Todos | ADR-044 |
| 24 | Testing Architecture | ESTANDAR-TESTING-ARCHITECTURE.md | Todos | ADR-044 |
| 25 | Testing Unit | ESTANDAR-TESTING-UNIT.md | Todos | ADR-044 |
| 26 | Testing Integration | ESTANDAR-TESTING-INTEGRATION.md | Backend | ADR-044 |
| 27 | Testing E2E | ESTANDAR-TESTING-E2E.md | Frontend | ADR-044 |

### 2.6 Infraestructura / Transversal (4)

| # | Estandar | Archivo | Dominio |
|---|----------|---------|---------|
| 28 | 12-Factor App | ESTANDAR-12-FACTOR-APP.md | DevOps, Backend |
| 29 | Performance | ESTANDAR-PERFORMANCE.md | Backend, Frontend |
| 30 | Observabilidad | ESTANDAR-OBSERVABILIDAD.md | Backend, DevOps |
| 31 | Metadata Items | ESTANDAR-METADATA-ITEMS.md | Backend, Database |

### 2.7 Subdirectorios Modulares (3 grupos)

#### 2.7.1 backend-profesional/ (8 capitulos)

Ruta: `docs/40-standards/backend-profesional/`
ADR relacionado: ADR-045 (Clean Architecture Pragmatica)

| # | Capitulo | Archivo |
|---|----------|---------|
| 1 | Principios SOLID | 01-principios-solid.md |
| 2 | Clean Architecture | 02-clean-architecture.md |
| 3 | Repository Pattern | 03-repository-pattern.md |
| 4 | Domain-Driven Design | 04-domain-driven-design.md |
| 5 | Manejo de Errores | 05-manejo-errores.md |
| 6 | Validacion de Datos | 06-validacion-datos.md |
| 7 | Testing Patterns | 07-testing-patterns.md |
| 8 | Referencias | 08-referencias.md |

#### 2.7.2 estandar-frontend/ (5 capitulos)

Ruta: `docs/40-standards/estandar-frontend/`
ADR relacionado: ADR-047 (State Architecture Zustand + React Query), ADR-013

| # | Capitulo | Archivo |
|---|----------|---------|
| 1 | Component Patterns | 01-COMPONENT-PATTERNS.md |
| 2 | State & Performance | 02-STATE-PERFORMANCE.md |
| 3 | Testing | 03-TESTING.md |
| 4 | Accessibility | 04-ACCESSIBILITY.md |
| 5 | Estructura Checklist | 05-ESTRUCTURA-CHECKLIST.md |

#### 2.7.3 estandar-api/ (5 capitulos)

Ruta: `docs/40-standards/estandar-api/`

| # | Capitulo | Archivo |
|---|----------|---------|
| 1 | RESTful Versioning | 01-RESTFUL-VERSIONING.md |
| 2 | Swagger | 02-SWAGGER.md |
| 3 | Responses | 03-RESPONSES.md |
| 4 | Pagination & Filters | 04-PAGINATION-FILTERS.md |
| 5 | Security Checklist | 05-SECURITY-CHECKLIST.md |

### 2.8 Directivas Operacionales Relacionadas (3)

Estas directivas complementan el catalogo de estandares y aplican a procesos de gobernanza y orquestacion:

| # | Directiva | Archivo | Tipo | Proposito |
|---|-----------|---------|------|-----------|
| 32 | Post-Task Sync | SIMCO-POST-TASK-SYNC.md | Operacional | Sincronizacion de inventarios post-tarea |
| 33 | Orchestrator Pattern | SIMCO-ORCHESTRATOR-PATTERN.md | Orquestacion | Patron orquestador→subagentes |
| 34 | Session Learning Pipeline | SIMCO-SESSION-LEARNING-PIPELINE.md | Gobernanza | Pipeline sesion→directiva |

---

## 3. Estructura en Disco

```
docs/40-standards/
  ├── _INDEX.md                              <- Tabla de contenidos
  ├── _MAP.md                                <- Mapa y relaciones
  ├── ESTANDAR-12-FACTOR-APP.md
  ├── ESTANDAR-API.md
  ├── ESTANDAR-CODIGO.md
  ├── ESTANDAR-CROSS-SCHEMA-REFERENCES.md
  ├── ESTANDAR-DATABASE-PROFESIONAL.md
  ├── ESTANDAR-DIAGRAMAS-ER.md
  ├── ESTANDAR-DOCUMENTACION.md
  ├── ESTANDAR-ESTRUCTURA-DOCS.md
  ├── ESTANDAR-FRONTEND-API.md
  ├── ESTANDAR-FRONTEND-CARD-TRUNCATION.md
  ├── ESTANDAR-FRONTEND-COMPONENT.md
  ├── ESTANDAR-FRONTEND-IMPORTS.md
  ├── ESTANDAR-FRONTEND-MODAL-RESPONSIVE.md
  ├── ESTANDAR-FRONTEND-PROFESIONAL.md
  ├── ESTANDAR-FRONTEND-RESPONSIVE.md
  ├── ESTANDAR-FRONTEND-TYPES.md
  ├── ESTANDAR-FRONTEND-UX-PATTERNS.md
  ├── ESTANDAR-GIT.md
  ├── ESTANDAR-METADATA-ITEMS.md
  ├── ESTANDAR-NOMENCLATURA.md
  ├── ESTANDAR-NOMENCLATURA-API.md
  ├── ESTANDAR-OBSERVABILIDAD.md
  ├── ESTANDAR-PERFORMANCE.md
  ├── ESTANDAR-SEGURIDAD.md
  ├── ESTANDAR-SEGURIDAD-API.md
  ├── ESTANDAR-SEGURIDAD-WEB.md
  ├── ESTANDAR-TESTING.md
  ├── ESTANDAR-TESTING-ARCHITECTURE.md
  ├── ESTANDAR-TESTING-E2E.md
  ├── ESTANDAR-TESTING-INTEGRATION.md
  ├── ESTANDAR-TESTING-UNIT.md
  ├── backend-profesional/                   <- 8 capitulos (01-08) + _INDEX + _MAP
  ├── estandar-frontend/                     <- 5 capitulos (01-05) + _INDEX
  └── estandar-api/                          <- 5 capitulos (01-05) + _INDEX
```

---

## 4. Matriz de Aplicabilidad

### 4.1 Por Perfil de Agente

| Perfil | Estandares Obligatorios | Estandares Recomendados |
|--------|------------------------|------------------------|
| @PERFIL-BACKEND-NESTJS | CODIGO, API, NOMENCLATURA-API, backend-profesional/, TESTING, SEGURIDAD, SEGURIDAD-API | PERFORMANCE, DATABASE-PROFESIONAL, OBSERVABILIDAD |
| @PERFIL-DATABASE-POSTGRESQL | CODIGO, DATABASE-PROFESIONAL, NOMENCLATURA, DIAGRAMAS-ER, CROSS-SCHEMA-REFERENCES | SEGURIDAD |
| @PERFIL-FRONTEND-REACT | CODIGO, FRONTEND-PROFESIONAL, FRONTEND-COMPONENT, NOMENCLATURA, TESTING, FRONTEND-RESPONSIVE | PERFORMANCE, SEGURIDAD-WEB, FRONTEND-UX-PATTERNS |
| @PERFIL-DEVOPS | CODIGO, GIT, SEGURIDAD, 12-FACTOR-APP | PERFORMANCE, OBSERVABILIDAD |
| @PERFIL-DOCUMENTATION-* | DOCUMENTACION, NOMENCLATURA, ESTRUCTURA-DOCS | — |
| @PERFIL-TESTING | TESTING, TESTING-ARCHITECTURE, TESTING-UNIT, CODIGO, API | SEGURIDAD, PERFORMANCE |
| @PERFIL-ORQUESTADOR | DOCUMENTACION, ESTRUCTURA-DOCS | TODOS (referencia) |

### 4.2 Por Tipo de Tarea

| Tipo Tarea | Estandares a Consultar |
|-----------|----------------------|
| Nueva tabla DDL | DATABASE-PROFESIONAL, NOMENCLATURA, SEGURIDAD (RLS), CROSS-SCHEMA-REFERENCES |
| Nuevo endpoint | API, estandar-api/, NOMENCLATURA-API, backend-profesional/, TESTING |
| Nuevo componente | FRONTEND-PROFESIONAL, FRONTEND-COMPONENT, NOMENCLATURA, TESTING, estandar-frontend/ |
| Modal / Dialog | FRONTEND-MODAL-RESPONSIVE, FRONTEND-RESPONSIVE, estandar-frontend/ |
| Card / Lista UI | FRONTEND-CARD-TRUNCATION, FRONTEND-UX-PATTERNS |
| Refactoring | CODIGO, backend-profesional/ o estandar-frontend/ segun dominio |
| Bug fix | TESTING, estandar del dominio afectado |
| Documentacion | DOCUMENTACION, NOMENCLATURA, ESTRUCTURA-DOCS |
| Deploy | GIT, SEGURIDAD, 12-FACTOR-APP, OBSERVABILIDAD |
| Items tienda / gamificacion | METADATA-ITEMS, DATABASE-PROFESIONAL |

---

## 5. Dependencias entre Estandares

```
ESTANDAR-CODIGO (base)
  |
  +-- ESTANDAR-NOMENCLATURA (naming general)
  |     +-- ESTANDAR-NOMENCLATURA-API (snake_case/camelCase)
  |
  +-- backend-profesional/ (SOLID, Clean Arch, DDD, errores, validacion)
  |     +-- ESTANDAR-API (RESTful, Swagger)
  |     |     +-- estandar-api/ (5 capitulos detalle)
  |     +-- ESTANDAR-DATABASE-PROFESIONAL (PostgreSQL)
  |           +-- ESTANDAR-DIAGRAMAS-ER
  |           +-- ESTANDAR-CROSS-SCHEMA-REFERENCES
  |
  +-- ESTANDAR-FRONTEND-PROFESIONAL (React 19 + Zustand)
  |     +-- ESTANDAR-FRONTEND-COMPONENT
  |     +-- ESTANDAR-FRONTEND-TYPES
  |     +-- ESTANDAR-FRONTEND-IMPORTS
  |     +-- ESTANDAR-FRONTEND-API
  |     +-- ESTANDAR-FRONTEND-RESPONSIVE
  |     |     +-- ESTANDAR-FRONTEND-MODAL-RESPONSIVE
  |     +-- ESTANDAR-FRONTEND-CARD-TRUNCATION
  |     +-- ESTANDAR-FRONTEND-UX-PATTERNS
  |     +-- estandar-frontend/ (5 capitulos detalle)
  |
  +-- ESTANDAR-TESTING (piramide 70-20-10)
  |     +-- ESTANDAR-TESTING-ARCHITECTURE
  |     +-- ESTANDAR-TESTING-UNIT
  |     +-- ESTANDAR-TESTING-INTEGRATION
  |     +-- ESTANDAR-TESTING-E2E
  |
  +-- ESTANDAR-SEGURIDAD (RLS, JWT, CORS)
        +-- ESTANDAR-SEGURIDAD-API
        +-- ESTANDAR-SEGURIDAD-WEB

ESTANDAR-GIT (independiente)
ESTANDAR-DOCUMENTACION (independiente)
ESTANDAR-ESTRUCTURA-DOCS (independiente)
ESTANDAR-12-FACTOR-APP (independiente)
ESTANDAR-PERFORMANCE (independiente)
ESTANDAR-OBSERVABILIDAD (independiente)
ESTANDAR-METADATA-ITEMS (independiente)
```

---

## 6. Orden de Lectura Recomendado

### 6.1 Nuevo Desarrollador

```
1. ESTANDAR-CODIGO.md          (convenciones base)
2. ESTANDAR-NOMENCLATURA.md    (naming)
3. ESTANDAR-GIT.md             (workflow)
4. ESTANDAR-TESTING.md         (testing)
5. [Estandar de su dominio]    (backend/frontend/database)
```

### 6.2 Agente Backend

```
1. backend-profesional/01-principios-solid.md
2. backend-profesional/02-clean-architecture.md
3. ESTANDAR-API.md
4. estandar-api/01-RESTFUL-VERSIONING.md
5. ESTANDAR-NOMENCLATURA-API.md
6. ESTANDAR-TESTING.md + ESTANDAR-TESTING-ARCHITECTURE.md
7. ESTANDAR-SEGURIDAD-API.md
```

### 6.3 Agente Frontend

```
1. ESTANDAR-FRONTEND-PROFESIONAL.md
2. ESTANDAR-FRONTEND-COMPONENT.md
3. estandar-frontend/01-COMPONENT-PATTERNS.md
4. ESTANDAR-FRONTEND-RESPONSIVE.md
5. ESTANDAR-NOMENCLATURA.md
6. ESTANDAR-TESTING.md + ESTANDAR-TESTING-E2E.md
7. ESTANDAR-FRONTEND-UX-PATTERNS.md
```

### 6.4 Agente Database

```
1. ESTANDAR-DATABASE-PROFESIONAL.md
2. ESTANDAR-DIAGRAMAS-ER.md
3. ESTANDAR-CROSS-SCHEMA-REFERENCES.md
4. ESTANDAR-NOMENCLATURA.md
5. ESTANDAR-SEGURIDAD.md (RLS)
```

---

## 7. Protocolo de Consulta

### 7.1 Antes de Crear/Modificar Codigo

```
1. Identificar dominio de la tarea (DDL, Backend, Frontend, Docs)
2. Consultar matriz de aplicabilidad (seccion 4)
3. Leer estandares obligatorios del dominio
4. Aplicar convenciones durante implementacion
5. Validar cumplimiento antes de commit
```

### 7.2 Verificacion de Cumplimiento

```yaml
checklist_estandares:
  - nombre: "Nomenclatura correcta"
    estandar: ESTANDAR-NOMENCLATURA.md
    verificacion: "Nombres siguen convenciones (camelCase TS, snake_case SQL)"

  - nombre: "API RESTful"
    estandar: ESTANDAR-API.md
    verificacion: "Endpoints siguen /api/v1/{resource}, metodos HTTP correctos"

  - nombre: "Tests incluidos"
    estandar: ESTANDAR-TESTING.md
    verificacion: "Spec file creado para nuevo codigo (piramide 70-20-10)"

  - nombre: "Seguridad verificada"
    estandar: ESTANDAR-SEGURIDAD.md
    verificacion: "RLS en tablas nuevas, JWT en endpoints protegidos"

  - nombre: "Responsive para componentes UI"
    estandar: ESTANDAR-FRONTEND-RESPONSIVE.md
    verificacion: "Breakpoints sm/md/lg aplicados; modales con scroll mobile"

  - nombre: "Truncacion en cards"
    estandar: ESTANDAR-FRONTEND-CARD-TRUNCATION.md
    verificacion: "line-clamp + title= en textos de longitud variable"
```

---

## 8. Mantenimiento de Estandares

### 8.1 Cuando Actualizar

| Evento | Accion |
|--------|--------|
| Nuevo patron adoptado | Agregar a estandar correspondiente |
| ADR aprobado que afecta estandar | Actualizar estandar + referenciar ADR |
| Stack cambia (e.g. nueva version NestJS) | Actualizar estandar del dominio |
| Estandar obsoleto | Archivar con nota en _INDEX.md |
| Nuevo estandar creado | Actualizar este catalogo + MASTER_INVENTORY.yml (`standards_md_files`) |

### 8.2 Historial de Cambios del Catalogo

| Version | Fecha | Cambio |
|---------|-------|--------|
| 1.0.0 | 2026-02-13 | Inicial — 16 estandares |
| 2.0.0 | 2026-03-03 | Actualizado a 37 estandares + 3 directivas operacionales: +SEGURIDAD-API, +SEGURIDAD-WEB, +TESTING-ARCHITECTURE/UNIT/INTEGRATION/E2E, +FRONTEND-COMPONENT/TYPES/IMPORTS/API/RESPONSIVE/MODAL-RESPONSIVE/CARD-TRUNCATION/UX-PATTERNS, +12-FACTOR-APP, +OBSERVABILIDAD, +METADATA-ITEMS, +CROSS-SCHEMA-REFERENCES, +ESTRUCTURA-DOCS, +estandar-frontend/ (5 caps), +estandar-api/ (5 caps). Eliminados: MEMORIA-TOKENS, SKILLS (AI-agent-only), BACKEND-PROFESIONAL (reemplazado por backend-profesional/ modular). |
| 2.0.1 | 2026-03-03 | +Directivas operacionales: SIMCO-POST-TASK-SYNC, SIMCO-ORCHESTRATOR-PATTERN, SIMCO-SESSION-LEARNING-PIPELINE (seccion 2.8). Updated ESTANDAR-FRONTEND-RESPONSIVE to v1.2.0 (breakpoints consolidados, detective-theme.css integration). |

---

## Referencia ADR

Este documento esta formalizado por [ADR-041 — Implementacion del Sistema SIMCO](../../docs/90-adr/ADR-041-simco-system.md).

---

## 9. Referencias

| Directiva / Documento | Relacion |
|----------------------|---------|
| SIMCO-DOCUMENTAR.md | Protocolo de documentacion |
| SIMCO-BACKEND.md | Operaciones backend (aplica estandares) |
| SIMCO-FRONTEND.md | Operaciones frontend (aplica estandares) |
| SIMCO-DDL.md | Operaciones DDL (aplica estandares) |
| SIMCO-POST-TASK-SYNC.md | Sincronizacion de inventarios post-tarea |
| SIMCO-ORCHESTRATOR-PATTERN.md | Patron orquestador→subagentes |
| SIMCO-SESSION-LEARNING-PIPELINE.md | Pipeline sesion→directiva |
| docs/40-standards/_INDEX.md | Indice de estandares |
| docs/90-adr/ | ADRs que fundamentan estandares |
| orchestration/inventarios/MASTER_INVENTORY.yml | standards_md_files: 37 (SSOT del conteo) |

---

## 10. Integracion con Agentes y Gates Operativos

Para convertir cumplimiento normativo en ejecucion verificable:

1. Cargar perfil y directivas desde `orchestration/referencias/MATRIZ-PERFIL-DIRECTIVAS.yml`.
2. Aplicar gates con checklists:
   - `orchestration/checklists/CHECKLIST-GATE-PRE-EJECUCION.md`
   - `orchestration/checklists/CHECKLIST-GATE-POST-EJECUCION.md`
   - `orchestration/checklists/CHECKLIST-VALIDACION-INTEGRAL.md`
3. Registrar trazabilidad en:
   - `orchestration/trazabilidad/TRACEABILITY-MASTER.yml`
4. Ejecutar validacion automatizada:
   - `node orchestration/scripts/validate-traceability.js`

### Regla de cierre estandares

No marcar tarea como completada si falta evidencia de:
- Estandar aplicado por dominio
- Gate pre/post ejecutado
- Trazabilidad y validacion documental

---

**Creado por:** TASK-2026-02-13-ANALISIS-MEJORAS-INTEGRABLES
**Actualizado por:** TASK-2026-03-03-DOC-STANDARDS-CATALOG (v2.0.0 — 37 estandares, 31 root-level + 3 subdirectorios modulares)
