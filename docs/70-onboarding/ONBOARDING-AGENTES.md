# Onboarding para Agentes IA

> Guia esencial para agentes IA que trabajan en el proyecto gamilit

## Lectura Obligatoria

Antes de ejecutar cualquier tarea, lee estos archivos:

1. **[CLAUDE.md](../../CLAUDE.md)** - Instrucciones base (se auto-carga)
2. **[PRINCIPIO-CAPVED.md](../../orchestration/directivas/principios/PRINCIPIO-CAPVED.md)** - Ciclo de vida de tareas
3. **[SIMCO-TAREA.md](../../orchestration/directivas/simco/SIMCO-TAREA.md)** - Punto de entrada para cualquier tarea

## Conceptos Clave

### Proyecto gamilit
- **Tipo:** STANDALONE (monorepo, single Git repo)
- **Stack:** NestJS 11 + React 19 + PostgreSQL 15 + TypeORM 0.3.x + Redis + Socket.IO 4.8+ + Vite 6.x
- **Estado:** MVP 98% completado, produccion activa
- **Repositorio:** git@github.com:rckrdmrd/gamilit-workspace.git
- **DB:** gamilit_platform (usuario: gamilit_user, 18 schemas, 169 tablas)
- **Puertos:** Backend 3006, Frontend 3005

### Sistema SIMCO
El proyecto usa el **Sistema SIMCO** (Sistema Integrado de Metodologia, Coherencia y Orquestacion). Todas las operaciones siguen este framework. La gobernanza es LOCAL (todas las directivas estan en `orchestration/`).

### Ciclo CAPVED
Toda tarea sigue 6 fases:
```
C - Contexto:     Clasificar y vincular la tarea
A - Analisis:     Mapear impacto, dependencias, riesgos
P - Planeacion:   Desglosar subtareas por dominio
V - Validacion:   Gate antes de ejecutar
E - Ejecucion:    Implementar cambios
D - Documentacion: Actualizar inventarios y trazas
```

### Modos de Ejecucion

| Modo | Fases | Uso |
|------|-------|-----|
| FULL | CAPVED completo | Tareas normales (por defecto) |
| QUICK | E+D | Cambios menores, typos |
| ANALYSIS | C+A+P | Solo investigacion |

**NOTA:** NO aplica PROPAGATION (gamilit es standalone, no propaga a otros proyectos).

### Sistema NEXUS v4.1 (Gestion de Contexto)

| Nivel | Tokens | Contenido |
|-------|--------|-----------|
| L0 | 8,000 | CLAUDE.md, BOOTLOADER |
| L1 | 5,000 | PROJECT-CONTEXT, inventarios |
| L2 | 4,000 | Directivas SIMCO del dominio |
| L3 | 3,000 | Archivos de tarea actual |

## Reglas Criticas

### 1. Verificar Antes de Crear
```
ANTES de crear cualquier objeto nuevo:
1. Verificar en inventarios (orchestration/inventarios/)
2. Buscar archivos similares en apps/
3. SI EXISTE SIMILAR >= 70% → DETENER y preguntar
4. SI no existe → GENERAR + DOCUMENTAR
```

### 2. Analizar Dependencias
```
ANTES de modificar archivo existente:
1. Identificar archivos que importan este archivo
2. Identificar archivos que este archivo importa
3. Evaluar impacto del cambio
4. SI HAY BREAKING CHANGES → incluir en plan
```

### 3. Coherencia entre Capas
```
TODA MODIFICACION DEBE MANTENER COHERENCIA:
  DDL → Backend: Toda tabla DEBE tener entity (169 tablas = 152 entities)
  Backend → Frontend: Endpoints documentados (899 endpoints)
  Inventarios: DATABASE/BACKEND/FRONTEND/MASTER = sincronizados
```

### 4. Validar Antes de Cerrar
```
ANTES de marcar tarea como completada:
1. npm run build (backend + frontend) debe pasar
2. npm run lint debe pasar
3. npm run test (833 tests) debe pasar
4. Inventarios actualizados si aplica
```

### 5. Edicion Segura
```
PROHIBIDO: /​/ ..., /​* ... *​/, cualquier placeholder sin implementar
OBLIGATORIO: Edicion minima, verificar coherencia, documentar cambio
```

## Estructura del Proyecto

```
gamilit-workspace/
├── CLAUDE.md                 ← Auto-cargado (punto de entrada)
├── apps/                     ← MONOREPO (single Git repo, NO submodules)
│   ├── backend/              ← NestJS 11 (22 modulos, 899 endpoints)
│   │   └── src/modules/      ← @BACKEND
│   ├── frontend/             ← React 19 + Zustand + TailwindCSS
│   │   └── src/              ← @FRONTEND
│   ├── database/             ← PostgreSQL 15 DDL
│   │   ├── ddl/              ← @DDL (18 schemas, 170 tablas)
│   │   └── seeds/            ← @SEEDS
│   └── devops/
├── docs/                     ← Documentacion del producto
│   ├── 40-standards/         ← @ESTANDARES
│   └── 90-adr/               ← @ADRS (39 ADRs)
└── orchestration/            ← @ORCHESTRATION - Sistema SIMCO local
    ├── directivas/           ← @SIMCO (~110 archivos)
    │   ├── simco/            ← Directivas SIMCO
    │   ├── principios/       ← @PRINCIPIOS
    │   └── triggers/         ← @TRIGGERS
    ├── agents/perfiles/      ← @PERFILES-MAP (42 perfiles)
    ├── inventarios/          ← @INVENTORY (8 YAMLs SSOT)
    ├── work-items/           ← @WORK-ITEMS
    ├── PROJECT-CONTEXT.md    ← @PROJECT-CTX
    └── CONTEXT-MAP.yml       ← @CONTEXT-MAP
```

## Aliases Mas Usados

| Alias | Ruta | Descripcion |
|-------|------|-------------|
| `@BACKEND` | `apps/backend/src/modules/` | Modulos del backend |
| `@FRONTEND` | `apps/frontend/src/` | Codigo frontend |
| `@DDL` | `apps/database/ddl/` | Definiciones de tablas |
| `@SEEDS` | `apps/database/seeds/` | Datos iniciales |
| `@INVENTORY` | `orchestration/inventarios/` | Inventarios SSOT |
| `@SIMCO` | `orchestration/directivas/simco/` | Directivas SIMCO |
| `@PRINCIPIOS` | `orchestration/directivas/principios/` | Principios |
| `@ESTANDARES` | `docs/40-standards/` | Estandares de codigo |
| `@PROJECT-CTX` | `orchestration/PROJECT-CONTEXT.md` | Contexto del proyecto |

## Flujo de Desarrollo

```
DDL primero → Entity → Endpoints → Frontend → Tests → Documentacion
```

1. Modificar DDL en `apps/database/ddl/`
2. Crear/actualizar entity en `apps/backend/src/modules/{modulo}/entities/`
3. Crear/actualizar endpoints (controller + service + DTOs)
4. Crear/actualizar componentes frontend
5. Escribir tests (objetivo 80% coverage)
6. Documentar cambios

## Errores Comunes a Evitar

1. **NO crear sin verificar inventarios** → Revisar `orchestration/inventarios/`
2. **NO modificar sin analizar dependencias** → Verificar imports/exports
3. **NO cerrar tarea sin validar build** → `npm run build && npm run lint && npm run test`
4. **NO usar placeholders** → Prohibido `// ...` o `/* ... */`
5. **NO tratar como multi-repo** → Es MONOREPO (NO hay submodules, NO hay Gitea)
6. **NO propagar cambios** → gamilit es STANDALONE, no propaga

## Metricas del Proyecto

| Categoria | Metrica | Valor |
|-----------|---------|-------|
| DB | Schemas | 18 (16 activos + 2 placeholder) |
| DB | Tablas | 170 |
| Backend | Modulos | 22 |
| Backend | Entities | 152 |
| Backend | Endpoints | 850 |
| Backend | Tests | 833 passing |
| Frontend | Componentes | 458 |
| Frontend | Paginas | 85 |
| Frontend | Portales | 4 |

## Recursos Adicionales

- [CLAUDE.md](../../CLAUDE.md) - Fuente de verdad para configuracion
- [docs/40-standards/](../40-standards/) - Estandares de codigo y documentacion
- [docs/90-adr/](../90-adr/) - Decisiones arquitectonicas (39 ADRs)
- [orchestration/CONTEXT-MAP.yml](../../orchestration/CONTEXT-MAP.yml) - Variables y aliases
- [orchestration/PROXIMA-ACCION.md](../../orchestration/PROXIMA-ACCION.md) - Estado actual

---

*Proyecto gamilit - Sistema SIMCO v4.0.0 + NEXUS v4.1*
