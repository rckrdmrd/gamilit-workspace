# SIMCO: ESTRUCTURA DE REPOSITORIOS

**Version:** 2.0.0
**Fecha:** 2026-01-16
**Aplica a:** Todos los agentes
**Prioridad:** OBLIGATORIA - Consultar antes de crear proyectos o navegar workspace
**Relacionado:** SIMCO-NIVELES.md, SIMCO-PROPAGACION.md
**Arquitectura:** Multi-Repo con Submodulos Anidados (84 repositorios)

---

## RESUMEN EJECUTIVO

> **El workspace-v2 utiliza una arquitectura multi-repositorio de 3 niveles.**
> - Nivel 0: workspace-v2 (1 repo)
> - Nivel 1: 17 proyectos (submodulos de workspace)
> - Nivel 2: 66 subrepositorios (backend, database, frontend, etc.)
> Cada componente es un repositorio Git independiente vinculado via submodulos.
> Ubicar codigo en nivel incorrecto = caos organizacional y referencias rotas.

---

## ARQUITECTURA DE 4 NIVELES

```
NIVEL 0: WORKSPACE ROOT
/home/isem/workspace-v2/
|
+-- NIVEL 1: CORE (core/)
|   |   Proposito: Recursos compartidos por TODOS los proyectos
|   |
|   +-- orchestration/          # Directivas, perfiles, templates SIMCO
|   +-- catalog/                # Funcionalidades reutilizables (auth, payments...)
|   +-- modules/                # Modulos TypeScript compartidos
|   +-- devtools/               # Scripts y herramientas de desarrollo
|
+-- NIVEL 1: CONTROL-PLANE (control-plane/)
|   |   Proposito: Registries, manifests, CI/CD
|   |
|   +-- registries/             # Puertos, dominios, databases
|   +-- manifests/              # Descriptores de servicios
|   +-- pipelines/              # Configuracion CI/CD
|
+-- NIVEL 2: PROJECTS (projects/)
    |
    +-- NIVEL 2A: STANDALONE (projects/{proyecto}/)
    |   |   Proposito: Proyectos independientes sin subproyectos
    |   |   Ejemplos: gamilit, trading-platform, betting-analytics
    |   |
    |   +-- apps/               # Aplicaciones del proyecto
    |   +-- docs/               # Documentacion tecnica
    |   +-- orchestration/      # Orquestacion local
    |
    +-- NIVEL 2B: SUITE (projects/{suite}/)
        |   Proposito: Proyectos multi-vertical con codigo compartido
        |   Ejemplo: erp-suite
        |
        +-- NIVEL 2B.1: SUITE-CORE (apps/{core}/)
        |   |   Proposito: Base de codigo compartida (60-70%)
        |   |
        |   +-- database/       # DDL compartido
        |   +-- backend/        # NestJS core
        |   +-- frontend/       # React core
        |
        +-- NIVEL 2B.2: VERTICALES (apps/verticales/{vertical}/)
            |   Proposito: Extensiones especializadas por industria
            |   Ejemplos: clinicas, construccion, retail
            |
            +-- database/       # DDL especifico vertical
            +-- backend/        # Extensiones NestJS
            +-- frontend/       # Extensiones React
```

---

## DESCRIPCION DE CADA NIVEL

### NIVEL 0: Workspace Root

| Aspecto | Descripcion |
|---------|-------------|
| **Ruta** | `/home/isem/workspace-v2/` |
| **Proposito** | Raiz del workspace, coordinacion global |
| **Contiene** | orchestration/ minimo, README.md, configuracion global |
| **NO contiene** | Codigo de aplicacion, logica de negocio |
| **Hereda de** | Nada (es la raiz) |
| **Propaga a** | Nada (es el destino final de propagacion) |

### NIVEL 1: Core

| Aspecto | Descripcion |
|---------|-------------|
| **Ruta** | `/home/isem/workspace-v2/core/` |
| **Proposito** | Recursos compartidos por TODOS los proyectos |
| **Contiene** | orchestration/, catalog/, modules/, devtools/ |
| **Proyectos que usan** | TODOS |
| **Hereda de** | Nada |
| **Propaga a** | Workspace (NIVEL 0) |

**Subdirectorios:**

```yaml
core/
  orchestration/    # Sistema SIMCO, perfiles, templates
  catalog/          # Funcionalidades reutilizables
    auth/           # Autenticacion/autorizacion
    session-management/
    rate-limiting/
    notifications/
    multi-tenancy/
    feature-flags/
    websocket/
    payments/
  modules/          # Modulos TypeScript compartidos
    utils/          # Utilidades genericas
    auth/           # Modulo de autenticacion
    notifications/  # Sistema de notificaciones
    payments/       # Integracion pagos
    billing/        # Facturacion
    multitenant/    # Multi-tenancy
  devtools/         # Scripts de desarrollo
    scripts/        # Scripts bash/node
```

### NIVEL 2A: Proyecto Standalone

| Aspecto | Descripcion |
|---------|-------------|
| **Ruta** | `/home/isem/workspace-v2/projects/{proyecto}/` |
| **Proposito** | Proyecto autonomo sin subproyectos |
| **Caracteristica** | NO tiene carpeta `verticals/` o `verticales/` |
| **Ejemplos** | gamilit, trading-platform, betting-analytics |
| **Hereda de** | core/orchestration/, shared/catalog/, shared/modules/ |
| **Propaga a** | Workspace (NIVEL 0) |

**Estructura obligatoria:**

```yaml
projects/{proyecto}/
  apps/
    database/       # DDL del proyecto
    backend/        # API NestJS/Express
    frontend/       # React/Next.js
  docs/             # Documentacion tecnica
    00-vision-general/
    01-especificaciones/
  orchestration/
    00-guidelines/
      CONTEXTO-PROYECTO.md    # OBLIGATORIO
      HERENCIA-SIMCO.md       # OBLIGATORIO
    inventarios/
    trazas/
    PROXIMA-ACCION.md
```

### NIVEL 2B: Suite Multi-Vertical

| Aspecto | Descripcion |
|---------|-------------|
| **Ruta** | `/home/isem/workspace-v2/projects/{suite}/` |
| **Proposito** | Proyecto con multiples verticales/industrias |
| **Caracteristica** | TIENE carpeta `apps/verticales/` |
| **Ejemplo** | erp-suite |
| **Hereda de** | core/orchestration/, shared/catalog/, shared/modules/ |
| **Propaga a** | Workspace (NIVEL 0) |

### NIVEL 2B.1: Suite Core

| Aspecto | Descripcion |
|---------|-------------|
| **Ruta** | `/home/isem/workspace-v2/projects/{suite}/apps/{core}/` |
| **Proposito** | Base de codigo compartida (60-70% del codigo) |
| **Ejemplo** | erp-suite/apps/erp-core/ |
| **Hereda de** | Suite, core/ |
| **Propaga a** | Suite -> Workspace |
| **Consumidores** | Todos los verticales de la suite |

### NIVEL 2B.2: Vertical

| Aspecto | Descripcion |
|---------|-------------|
| **Ruta** | `/home/isem/workspace-v2/projects/{suite}/apps/verticales/{vertical}/` |
| **Proposito** | Extension especializada por industria (30-40%) |
| **Ejemplos** | clinicas, construccion, retail, mecanicas-diesel |
| **Hereda de** | Suite-Core, Suite, core/ |
| **Propaga a** | Suite -> Workspace |

---

## RUTAS CANONICAS

### Tabla de Rutas por Nivel

| Nivel | Ruta Base | Orchestration |
|-------|-----------|---------------|
| 0 WORKSPACE | `/home/isem/workspace-v2/` | `orchestration/` |
| 1 CORE | `/home/isem/workspace-v2/core/` | `orchestration/` |
| 1 CONTROL-PLANE | `/home/isem/workspace-v2/control-plane/` | N/A |
| 2A STANDALONE | `projects/{proyecto}/` | `orchestration/` |
| 2B SUITE | `projects/{suite}/` | `orchestration/` |
| 2B.1 SUITE-CORE | `projects/{suite}/apps/{core}/` | `orchestration/` |
| 2B.2 VERTICAL | `projects/{suite}/apps/verticales/{vertical}/` | `orchestration/` |

### Rutas de Aplicacion

| Componente | Ruta Relativa desde Proyecto |
|------------|------------------------------|
| DDL | `apps/database/` |
| Backend NestJS | `apps/backend/` |
| Frontend React | `apps/frontend/` |
| Mobile RN | `apps/mobile/` |
| ML/AI | `apps/ml/` |
| Docs | `docs/` |

---

## REGLAS DE UBICACION DE CODIGO

### Regla 1: Codigo Compartido va a Core

```yaml
SI:
  - Es usado por 2+ proyectos
  - Es funcionalidad generica (auth, payments, notifications)
  - No tiene logica de negocio especifica

ENTONCES:
  - Ubicar en shared/modules/ o shared/catalog/
  - Documentar en core/orchestration/
  - Registrar consumidores
```

### Regla 2: Codigo de Proyecto va a Proyecto

```yaml
SI:
  - Es especifico de un proyecto
  - Contiene logica de negocio del proyecto
  - No es reutilizable fuera del proyecto

ENTONCES:
  - Ubicar en projects/{proyecto}/apps/
  - Documentar en projects/{proyecto}/orchestration/
```

### Regla 3: Codigo de Suite-Core va a Suite-Core

```yaml
SI:
  - Es compartido entre TODOS los verticales de la suite
  - Es base comun (60-70% del codigo)
  - Verticales lo extienden pero no lo modifican

ENTONCES:
  - Ubicar en projects/{suite}/apps/{core}/
  - Documentar dependientes en CONSUMIDORES.yml
```

### Regla 4: Codigo de Vertical va a Vertical

```yaml
SI:
  - Es especifico de UNA industria/vertical
  - Extiende Suite-Core sin modificarlo
  - Representa el 30-40% especializado

ENTONCES:
  - Ubicar en projects/{suite}/apps/verticales/{vertical}/
  - Documentar herencia de Suite-Core
```

---

## FLUJO DE DECISION

### ¿Donde ubico mi codigo?

```
INICIO
  |
  v
¿Es usado por multiples proyectos?
  |
  +-- SI --> ¿Es funcionalidad generica (auth, payments)?
  |            |
  |            +-- SI --> shared/catalog/
  |            |
  |            +-- NO --> shared/modules/
  |
  +-- NO --> ¿Estoy en un proyecto con verticales?
               |
               +-- NO --> projects/{proyecto}/apps/  (STANDALONE)
               |
               +-- SI --> ¿Es compartido entre TODOS los verticales?
                            |
                            +-- SI --> apps/{core}/  (SUITE-CORE)
                            |
                            +-- NO --> apps/verticales/{vertical}/  (VERTICAL)
```

### ¿Como identifico mi nivel actual?

```yaml
PASO_1_ANALIZAR_RUTA:
  ruta: "{extraer del contexto}"

PASO_2_CLASIFICAR:
  contiene "core/orchestration":     NIVEL_1_CORE
  contiene "shared/catalog":           NIVEL_3_CATALOGO
  contiene "shared/modules":           NIVEL_1_CORE
  contiene "verticales/":            NIVEL_2B2_VERTICAL
  contiene "/apps/" AND tiene_verticales: NIVEL_2B1_SUITE_CORE
  es "projects/{p}/" AND tiene_verticales/: NIVEL_2B_SUITE
  es "projects/{p}/" AND no_verticales: NIVEL_2A_STANDALONE
  default:                           NIVEL_0_WORKSPACE

PASO_3_CONFIRMAR:
  - Verificar estructura de orchestration/
  - Verificar existencia de CONTEXTO-PROYECTO.md
  - Verificar HERENCIA-SIMCO.md
```

---

## INTEGRACION CON OTROS SIMCO

### Con SIMCO-NIVELES

```yaml
# SIMCO-ESTRUCTURA-REPOS define la arquitectura
# SIMCO-NIVELES define como identificar donde estoy

flujo:
  1. Consultar SIMCO-ESTRUCTURA-REPOS para entender arquitectura
  2. Ejecutar SIMCO-NIVELES para identificar nivel actual
  3. Aplicar reglas de ubicacion correspondientes
```

### Con SIMCO-PROPAGACION

```yaml
# SIMCO-ESTRUCTURA-REPOS define donde crear
# SIMCO-PROPAGACION define como propagar hacia arriba

flujo:
  1. Crear en nivel correspondiente (segun SIMCO-ESTRUCTURA-REPOS)
  2. Propagar documentacion hacia niveles superiores (SIMCO-PROPAGACION)
```

### Con SIMCO-MODULOS-COMPARTIDOS

```yaml
# SIMCO-ESTRUCTURA-REPOS define donde estan los modulos
# SIMCO-MODULOS-COMPARTIDOS define como usarlos

flujo:
  1. Identificar si necesito funcionalidad compartida
  2. Buscar en shared/modules/ o shared/catalog/
  3. Importar siguiendo SIMCO-MODULOS-COMPARTIDOS
```

---

## CHECKLIST DE VALIDACION

### Al Crear Proyecto Nuevo

```markdown
- [ ] Identificar tipo: STANDALONE o SUITE
- [ ] Crear estructura base segun nivel
- [ ] Crear orchestration/ con:
  - [ ] 00-guidelines/CONTEXTO-PROYECTO.md
  - [ ] 00-guidelines/HERENCIA-SIMCO.md
  - [ ] inventarios/
  - [ ] trazas/
- [ ] Verificar herencia de core/
- [ ] Registrar en workspace si es nuevo
```

### Al Crear Vertical Nuevo

```markdown
- [ ] Verificar que suite-core existe
- [ ] Crear estructura en apps/verticales/{vertical}/
- [ ] Crear orchestration/ del vertical
- [ ] Documentar HERENCIA-ERP-CORE.md
- [ ] Documentar DEPENDENCIAS-CORE.yml
- [ ] Registrar en VERTICALES-INDEX.yml de suite
```

### Al Navegar Workspace

```markdown
- [ ] Identificar nivel actual
- [ ] Cargar contexto correspondiente
- [ ] Verificar herencia activa
- [ ] Conocer rutas de propagacion
```

---

## ERRORES COMUNES

| Error | Causa | Solucion |
|-------|-------|----------|
| Codigo duplicado entre proyectos | No se identifico como compartido | Mover a shared/modules/ |
| Vertical modifica suite-core | No respeta herencia | Extender, no modificar |
| Proyecto sin orchestration/ | Estructura incompleta | Crear estructura minima |
| Referencias rotas entre niveles | Rutas mal calculadas | Usar rutas relativas canonicas |
| Documentacion en nivel incorrecto | No identifico nivel | Ejecutar SIMCO-NIVELES |

---

## EJEMPLOS PRACTICOS

### Ejemplo 1: Proyecto Standalone (gamilit)

```
projects/gamilit/
+-- apps/
|   +-- database/
|   |   +-- ddl/
|   |   +-- seeds/
|   +-- backend/
|   |   +-- src/modules/
|   +-- frontend/
|       +-- src/
+-- docs/
|   +-- 00-vision-general/
+-- orchestration/
    +-- 00-guidelines/
    |   +-- CONTEXTO-PROYECTO.md
    |   +-- HERENCIA-SIMCO.md
    +-- inventarios/
    +-- trazas/
```

### Ejemplo 2: Suite Multi-Vertical (erp-suite)

```
projects/erp-suite/
+-- apps/
|   +-- erp-core/               # NIVEL 2B.1
|   |   +-- database/
|   |   +-- backend/
|   |   +-- frontend/
|   |   +-- orchestration/
|   +-- verticales/
|       +-- clinicas/           # NIVEL 2B.2
|       +-- construccion/       # NIVEL 2B.2
|       +-- retail/             # NIVEL 2B.2
+-- docs/
+-- orchestration/              # NIVEL 2B
    +-- VERTICALES-INDEX.yml
```

---

## REFERENCIAS

- **Niveles:** `SIMCO-NIVELES.md`
- **Propagacion:** `SIMCO-PROPAGACION.md`
- **Modulos:** `SIMCO-MODULOS-COMPARTIDOS.md`
- **Indice Workspace:** `INDICE-DIRECTIVAS-WORKSPACE.yml`

---

**Version:** 1.0.0 | **Sistema:** SIMCO | **Tipo:** Directiva de Arquitectura
