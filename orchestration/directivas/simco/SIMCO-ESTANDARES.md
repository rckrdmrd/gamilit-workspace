# SIMCO-ESTANDARES

**Version:** 1.0.0
**Fecha:** 2026-02-13
**Aplica a:** Todos los agentes que generen o modifiquen codigo o documentacion
**Criticidad:** OBLIGATORIA
**Tipo:** Directiva Operacional
**Alias:** @ESTANDARES
**Depende de:** SIMCO-DOCUMENTAR.md

---

## 1. Proposito

Centralizar la gestion de los 16 estandares del proyecto gamilit. Define que estandar aplica por dominio, orden de consulta recomendado, y dependencias entre estandares.

---

## 2. Catalogo de Estandares (16 Activos)

### 2.1 Estandares Generales (6)

| # | Estandar | Archivo | Dominio |
|---|----------|---------|---------|
| 1 | Codigo | ESTANDAR-CODIGO.md | Todos |
| 2 | Nomenclatura | ESTANDAR-NOMENCLATURA.md | Todos |
| 3 | Documentacion | ESTANDAR-DOCUMENTACION.md | Docs |
| 4 | Git | ESTANDAR-GIT.md | DevOps |
| 5 | Performance | ESTANDAR-PERFORMANCE.md | Backend, Frontend |
| 6 | Seguridad | ESTANDAR-SEGURIDAD.md | Todos |

### 2.2 Estandares por Dominio (7)

| # | Estandar | Archivo | Dominio |
|---|----------|---------|---------|
| 7 | API | ESTANDAR-API.md | Backend |
| 8 | Nomenclatura API | ESTANDAR-NOMENCLATURA-API.md | Backend |
| 9 | Backend Profesional | ESTANDAR-BACKEND-PROFESIONAL.md | Backend |
| 10 | Database Profesional | ESTANDAR-DATABASE-PROFESIONAL.md | Database |
| 11 | Frontend Profesional | ESTANDAR-FRONTEND-PROFESIONAL.md | Frontend |
| 12 | Testing | ESTANDAR-TESTING.md | Todos |
| 13 | Diagramas ER | ESTANDAR-DIAGRAMAS-ER.md | Database |

### 2.3 Estandares Especializados (3)

| # | Estandar | Archivo | Dominio |
|---|----------|---------|---------|
| 14 | Memoria/Tokens | ESTANDAR-MEMORIA-TOKENS.md | Agentes IA |
| 15 | Skills | ESTANDAR-SKILLS.md | Agentes IA |
| 16 | Backend Profesional (modular) | backend-profesional/ (8 archivos) | Backend |

### 2.4 Subdirectorio backend-profesional/ (8 modulos)

| # | Modulo | Archivo |
|---|--------|---------|
| 1 | Principios SOLID | 01-principios-solid.md |
| 2 | Clean Architecture | 02-clean-architecture.md |
| 3 | Repository Pattern | 03-repository-pattern.md |
| 4 | Domain-Driven Design | 04-domain-driven-design.md |
| 5 | Manejo de Errores | 05-manejo-errores.md |
| 6 | Validacion de Datos | 06-validacion-datos.md |
| 7 | Testing Patterns | 07-testing-patterns.md |
| 8 | Referencias | 08-referencias.md |

---

## 3. Matriz de Aplicabilidad

### 3.1 Por Perfil de Agente

| Perfil | Estandares Obligatorios | Estandares Recomendados |
|--------|------------------------|------------------------|
| @PERFIL-BACKEND-NESTJS | CODIGO, API, NOMENCLATURA-API, BACKEND-PROFESIONAL, TESTING, SEGURIDAD | PERFORMANCE, DATABASE |
| @PERFIL-DATABASE-POSTGRESQL | CODIGO, DATABASE-PROFESIONAL, NOMENCLATURA, DIAGRAMAS-ER | SEGURIDAD |
| @PERFIL-FRONTEND-REACT | CODIGO, FRONTEND-PROFESIONAL, NOMENCLATURA, TESTING | PERFORMANCE, SEGURIDAD |
| @PERFIL-DEVOPS | CODIGO, GIT, SEGURIDAD | PERFORMANCE |
| @PERFIL-DOCUMENTATION-* | DOCUMENTACION, NOMENCLATURA | MEMORIA-TOKENS |
| @PERFIL-TESTING | TESTING, CODIGO, API | SEGURIDAD, PERFORMANCE |
| @PERFIL-ORQUESTADOR | MEMORIA-TOKENS, SKILLS, DOCUMENTACION | TODOS (referencia) |

### 3.2 Por Tipo de Tarea

| Tipo Tarea | Estandares a Consultar |
|-----------|----------------------|
| Nueva tabla DDL | DATABASE-PROFESIONAL, NOMENCLATURA, SEGURIDAD (RLS) |
| Nuevo endpoint | API, NOMENCLATURA-API, BACKEND-PROFESIONAL, TESTING |
| Nuevo componente | FRONTEND-PROFESIONAL, NOMENCLATURA, TESTING |
| Refactoring | CODIGO, BACKEND/FRONTEND-PROFESIONAL |
| Bug fix | TESTING, estandar del dominio afectado |
| Documentacion | DOCUMENTACION, NOMENCLATURA |
| Deploy | GIT, SEGURIDAD |

---

## 4. Dependencias entre Estandares

```
ESTANDAR-CODIGO (base)
  |
  +-- ESTANDAR-NOMENCLATURA (naming general)
  |     +-- ESTANDAR-NOMENCLATURA-API (snake_case/camelCase)
  |
  +-- ESTANDAR-BACKEND-PROFESIONAL (NestJS)
  |     +-- backend-profesional/ (8 modulos SOLID/DDD)
  |     +-- ESTANDAR-API (RESTful, Swagger)
  |
  +-- ESTANDAR-DATABASE-PROFESIONAL (PostgreSQL)
  |     +-- ESTANDAR-DIAGRAMAS-ER
  |
  +-- ESTANDAR-FRONTEND-PROFESIONAL (React)
  |
  +-- ESTANDAR-TESTING (piramide 70-20-10)
  |
  +-- ESTANDAR-SEGURIDAD (RLS, JWT, CORS)
  |
  +-- ESTANDAR-PERFORMANCE (optimizacion)

ESTANDAR-GIT (independiente)
ESTANDAR-DOCUMENTACION (independiente)
ESTANDAR-MEMORIA-TOKENS (independiente, agentes IA)
ESTANDAR-SKILLS (independiente, agentes IA)
```

---

## 5. Orden de Lectura Recomendado

### 5.1 Nuevo Desarrollador

```
1. ESTANDAR-CODIGO.md          (convenciones base)
2. ESTANDAR-NOMENCLATURA.md    (naming)
3. ESTANDAR-GIT.md             (workflow)
4. ESTANDAR-TESTING.md         (testing)
5. [Estandar de su dominio]    (backend/frontend/database)
```

### 5.2 Agente Backend

```
1. ESTANDAR-BACKEND-PROFESIONAL.md  (overview)
2. backend-profesional/01-principios-solid.md
3. backend-profesional/02-clean-architecture.md
4. ESTANDAR-API.md
5. ESTANDAR-NOMENCLATURA-API.md
6. ESTANDAR-TESTING.md
```

### 5.3 Agente Frontend

```
1. ESTANDAR-FRONTEND-PROFESIONAL.md
2. ESTANDAR-NOMENCLATURA.md
3. ESTANDAR-TESTING.md
4. ESTANDAR-PERFORMANCE.md
```

### 5.4 Agente Database

```
1. ESTANDAR-DATABASE-PROFESIONAL.md
2. ESTANDAR-DIAGRAMAS-ER.md
3. ESTANDAR-NOMENCLATURA.md
4. ESTANDAR-SEGURIDAD.md (RLS)
```

---

## 6. Protocolo de Consulta

### 6.1 Antes de Crear/Modificar Codigo

```
1. Identificar dominio de la tarea (DDL, Backend, Frontend, Docs)
2. Consultar matriz de aplicabilidad (seccion 3)
3. Leer estandares obligatorios del dominio
4. Aplicar convenciones durante implementacion
5. Validar cumplimiento antes de commit
```

### 6.2 Verificacion de Cumplimiento

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
```

---

## 7. Mantenimiento de Estandares

### 7.1 Cuando Actualizar

| Evento | Accion |
|--------|--------|
| Nuevo patron adoptado | Agregar a estandar correspondiente |
| ADR aprobado que afecta estandar | Actualizar estandar + referenciar ADR |
| Stack cambia (e.g. nueva version NestJS) | Actualizar estandar del dominio |
| Estandar obsoleto | Archivar con nota en _INDEX.md |

### 7.2 Ubicacion

```
docs/40-standards/
  ├── _INDEX.md           <- Tabla de contenidos (actualizado 2026-02-13)
  ├── _MAP.md             <- Mapa y relaciones
  ├── ESTANDAR-*.md       <- 16 archivos de estandares
  └── backend-profesional/
      ├── _INDEX.md
      └── 01-08 modulos
```

---

## 8. Referencias

| Directiva | Relacion |
|-----------|---------|
| SIMCO-DOCUMENTAR.md | Protocolo de documentacion |
| SIMCO-BACKEND.md | Operaciones backend (aplica estandares) |
| SIMCO-FRONTEND.md | Operaciones frontend (aplica estandares) |
| SIMCO-DDL.md | Operaciones DDL (aplica estandares) |
| docs/40-standards/_INDEX.md | Indice de estandares |
| docs/90-adr/ | ADRs que fundamentan estandares |

---

**Creado por:** TASK-2026-02-13-ANALISIS-MEJORAS-INTEGRABLES
**Basado en:** workspace-arch/SIMCO-ESTANDARES.md (adaptado para gamilit standalone, 16 estandares)
