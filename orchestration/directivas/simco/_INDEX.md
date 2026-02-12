# SISTEMA SIMCO - INDICE MAESTRO

**Single Instruction Matrix by Context and Operation**

**Version:** 4.1.0
**Fecha:** 2026-02-11
**Extension:** CCA + CAPVED + Niveles + Economia de Tokens + Git + Context Engineering + Subagentes + Git Remotes + Estandares Documentacion

> **NOTA (2026-02-11):** 14 archivos solapados fueron consolidados y archivados en `_archive/`.
> Los archivos principales absorben la funcionalidad de los archivados.

---

## QUE ES SIMCO

SIMCO es un sistema de directivas organizadas por **tipo de operacion**, no por perfil de agente. Esto permite que cualquier agente, independientemente de su especializacion, pueda seguir las directivas correctas cuando realiza una operacion fuera de su dominio principal.

---

## ESTRUCTURA

```
core/
├── catalog/                         # CATALOGO DE FUNCIONALIDADES REUTILIZABLES
│   ├── CATALOG-INDEX.yml           # Indice maquina-readable (buscar aqui PRIMERO)
│   ├── auth/                       # Autenticacion y autorizacion
│   ├── session-management/         # Gestion de sesiones
│   ├── rate-limiting/              # Limitacion de tasa
│   ├── notifications/              # Sistema de notificaciones
│   ├── multi-tenancy/              # Soporte multi-tenant
│   ├── feature-flags/              # Feature flags dinamicos
│   ├── websocket/                  # Comunicacion WebSocket
│   └── payments/                   # Integracion de pagos
│
└── orchestration/
    ├── directivas/
    │   ├── simco/                       # DIRECTIVAS POR OPERACION (24 archivos)
    │   │   ├── _INDEX.md               ← ESTAS AQUI
    │   │   │
    │   │   │   # === CICLO DE VIDA ===
    │   │   ├── SIMCO-TAREA.md          # CICLO CAPVED - Punto de entrada para HUs
    │   │   ├── SIMCO-INICIALIZACION.md # Bootstrap de agentes (CCA) + Recovery
    │   │   │
    │   │   │   # === CONTEXT ENGINEERING ===
    │   │   ├── SIMCO-CONTEXT-ENGINEERING.md  # Ingenieria de contexto para agentes
    │   │   │
    │   │   │
    │   │   │   # === OPERACIONES UNIVERSALES ===
    │   │   ├── SIMCO-CREAR.md          # Crear cualquier archivo
    │   │   ├── SIMCO-MODIFICAR.md      # Modificar archivos existentes
    │   │   ├── SIMCO-VALIDAR.md        # Validar codigo (build, lint)
    │   │   ├── SIMCO-DOCUMENTAR.md     # Documentar trabajo realizado
    │   │   ├── SIMCO-BUSCAR.md         # Buscar archivos e informacion
    │   │   ├── SIMCO-DELEGACION.md     # Delegar a subagentes (con CCA)
    │   │   │
    │   │   │   # === CATALOGO ===
    │   │   ├── SIMCO-REUTILIZAR.md     # Reutilizar del catalogo
    │   │   ├── SIMCO-CONTRIBUIR-CATALOGO.md # Contribuir al catalogo
    │   │   │
    │   │   │   # === POR DOMINIO TECNICO ===
    │   │   ├── SIMCO-DDL.md            # Operaciones de base de datos
    │   │   ├── SIMCO-BACKEND.md        # Operaciones de backend NestJS
    │   │   ├── SIMCO-FRONTEND.md       # Operaciones de frontend React
    │   │   ├── SIMCO-MOBILE.md         # Operaciones React Native
    │   │   ├── SIMCO-ML.md             # Machine Learning y AI
    │   │   │
    │   │   │   # === NIVELES Y PROPAGACION ===
    │   │   ├── SIMCO-NIVELES.md        # Identificacion de nivel jerarquico
    │   │   ├── SIMCO-PROPAGACION.md    # Propagacion de documentacion
    │   │   │
    │   │   │   # === TOMA DE DECISIONES ===
    │   │   ├── SIMCO-ALINEACION.md     # Alineacion entre capas
    │   │   ├── SIMCO-DECISION-MATRIZ.md # Matriz de decision para agentes
    │   │   │
    │   │   │   # === GIT Y GOBERNANZA ===
    │   │   ├── SIMCO-GIT.md              # Control de versiones y commits
    │   │   ├── SIMCO-GIT-REMOTES.md      # Operaciones con repositorios remotos (push/pull/clone)
    │   │   ├── SIMCO-ESCALAMIENTO.md     # Escalamiento a Product Owner
    │   │   │
    │   │   │   # === SUBAGENTES ===
    │   │   ├── SIMCO-SUBAGENTE.md        # Protocolo para agentes en modo subagente (absorbe CCA-SUBAGENTE)
    │   │   │
    │   │   │   # === REFERENCIA ===
    │   │   ├── SIMCO-QUICK-REFERENCE.md # Referencia rapida (optimizado para tokens)
    │   │   │
    │   │   │   # === DOCUMENTACION Y ESTANDARES (v3.7) ===
    │   │   ├── SIMCO-DOCUMENTACION-PROYECTO.md  # Estructura base de documentacion
    │   │   ├── SIMCO-NOMENCLATURA.md            # Convenciones de nomenclatura
    │   │   ├── SIMCO-ESTRUCTURA-DOCS.md         # Estructura interna de documentos
    │   │   ├── SIMCO-INVENTARIOS.md             # Estandares de inventarios YAML
    │   │   ├── SIMCO-TESTING.md                 # Cobertura y estandares de testing
    │   │   ├── SIMCO-MIGRACIONES-BD.md          # Migraciones y DDL
    │   │   ├── SIMCO-INTEGRACIONES-EXTERNAS.md  # Documentacion de integraciones
    │   │   │
    │   │   │   # === MANTENIMIENTO Y SINCRONIZACION ===
    │   │   ├── SIMCO-SINCRONIZACION-BD.md       # Sincronizacion BD ↔ Codigo ↔ Docs
    │   │   │
    │   │   │   # === POST-TAREA Y CONSOLIDACION ===
    │   │   ├── CHECKLIST-FASE-D.md             # Checklist rapido 10 pasos para Fase D
    │   │   ├── SIMCO-RELACIONES-OBJETOS.md     # Documentar dependencias entre objetos
    │   │   ├── SIMCO-DOCUMENTAR-SUITE.md       # Documentacion en arquitectura Suite/Vertical
    │   │   ├── LECCIONES-APRENDIDAS-CONSOLIDACION.md # Sistema de lecciones aprendidas
    │   │   │
    │   │   └── _archive/                       # Archivos consolidados (14 files)
    │   │
    │   └── principios/                  # PRINCIPIOS FUNDAMENTALES (6)
    │       ├── PRINCIPIO-CAPVED.md      # Ciclo de vida de tareas
    │       ├── PRINCIPIO-DOC-PRIMERO.md
    │       ├── PRINCIPIO-ANTI-DUPLICACION.md
    │       ├── PRINCIPIO-VALIDACION-OBLIGATORIA.md
    │       ├── PRINCIPIO-ECONOMIA-TOKENS.md  # Limites y desglose de tareas
    │       └── PRINCIPIO-NO-ASUMIR.md   # No asumir, preguntar
    │
    ├── agents/
    │   └── perfiles/                    # PERFILES DE AGENTES (28 archivos)
    │       │
    │       │   # === PERFILES TECNICOS ===
    │       ├── PERFIL-DATABASE-POSTGRESQL.md  # PostgreSQL DDL (canonical)
    │       ├── PERFIL-BACKEND-NESTJS.md       # NestJS/TypeORM (canonical)
    │       ├── PERFIL-FRONTEND-REACT.md       # React Web (canonical)
    │       ├── PERFIL-MOBILE-AGENT.md      # React Native
    │       ├── PERFIL-ML.md                # Python/ML basic
    │       ├── PERFIL-ML-SPECIALIST.md     # Python/ML/AI avanzado
    │       ├── PERFIL-LLM-AGENT.md         # Integracion LLM/AI
    │       ├── PERFIL-TRADING-STRATEGIST.md # Estrategias de trading
    │       │
    │       │   # === PERFILES DE COORDINACION ===
    │       ├── PERFIL-ORQUESTADOR.md       # Coordinacion general
    │       ├── PERFIL-TECH-LEADER.md       # Liderazgo tecnico
    │       ├── PERFIL-ARCHITECTURE-ANALYST.md # Analisis de arquitectura
    │       ├── PERFIL-REQUIREMENTS-ANALYST.md # Analisis de requerimientos
    │       ├── PERFIL-WORKSPACE-MANAGER.md # Gestion de workspace
    │       │
    │       │   # === PERFILES DE CALIDAD ===
    │       ├── PERFIL-CODE-REVIEWER.md     # Revision de codigo
    │       ├── PERFIL-BUG-FIXER.md         # Correccion de bugs
    │       ├── PERFIL-TESTING.md           # QA y testing
    │       ├── PERFIL-QA.md                # Quality Assurance
    │       ├── PERFIL-DOCUMENTATION.md     # Documentacion
    │       ├── PERFIL-DOCUMENTATION-VALIDATOR.md # Validacion de documentacion
    │       │
    │       │   # === PERFILES DE AUDITORIA ===
    │       ├── PERFIL-SECURITY.md          # Seguridad
    │       ├── PERFIL-SECURITY-AUDITOR.md  # Auditoria de seguridad
    │       ├── PERFIL-DATABASE-AUDITOR.md  # Auditoria de BD
    │       ├── PERFIL-POLICY-AUDITOR.md    # Auditoria de cumplimiento
    │       ├── PERFIL-INTEGRATION-VALIDATOR.md # Validacion de integracion
    │       │
    │       │   # === PERFILES DE INFRAESTRUCTURA ===
    │       ├── PERFIL-DEVOPS.md            # DevOps y CI/CD
    │       └── PERFIL-DEVENV.md            # Ambiente de desarrollo
    │
    ├── templates/                          # TEMPLATES (19 archivos)
    │   │
    │   │   # === CONTEXTO POR NIVEL ===
    │   ├── CONTEXTO-NIVEL-STANDALONE.md      # Template para proyectos standalone
    │   ├── CONTEXTO-NIVEL-SUITE.md           # Template para suites multi-vertical
    │   ├── CONTEXTO-NIVEL-SUITE-CORE.md      # Template para core de suite
    │   ├── CONTEXTO-NIVEL-VERTICAL.md        # Template para verticales
    │   │
    │   │   # === CONTEXT ENGINEERING (NUEVO) ===
    │   ├── TEMPLATE-HERENCIA-CONTEXTO.md     # Herencia de contexto a subagentes
    │   ├── TEMPLATE-RECOVERY-CONTEXT.md      # Recovery de contexto
    │   │
    │   │   # === TEMPLATES DE AGENTES ===
    │   ├── TEMPLATE-DELEGACION-SUBAGENTE.md  # Delegacion a subagentes
    │   ├── TEMPLATE-CONTEXTO-SUBAGENTE.md    # Contexto para subagentes
    │   ├── TEMPLATE-PROJECT-CONTEXT.md     # Contexto de proyecto
    │   ├── TEMPLATES-SUBAGENTES.md           # Guia de subagentes
    │   │
    │   │   # === TEMPLATES DE TAREAS ===
    │   ├── TEMPLATE-TAREA-CAPVED.md          # Tarea con ciclo CAPVED
    │   ├── TEMPLATE-TAREA-TECNICA.md         # Tarea tecnica simple
    │   ├── TEMPLATE-HISTORIA-USUARIO.md      # Historia de usuario
    │   ├── TEMPLATE-EPICA.md                 # Epica
    │   ├── TEMPLATE-PLAN.md                  # Plan de implementacion
    │   │
    │   │   # === TEMPLATES DE VALIDACION ===
    │   ├── TEMPLATE-ANALISIS.md              # Analisis de impacto
    │   ├── TEMPLATE-VALIDACION.md            # Validacion de entregables
    │   ├── CHECKLIST-ESTRUCTURA-PROYECTO.md  # Estructura de proyecto
    │   └── _MAP.md                           # Mapa de templates
    │
    ├── patrones/                        # PATRONES DE CODIGO
    │   ├── MAPEO-TIPOS-DDL-TYPESCRIPT.md # Mapeo PostgreSQL ↔ TypeScript
    │   ├── PATRON-VALIDACION.md          # Validacion con class-validator/Zod
    │   ├── PATRON-EXCEPTION-HANDLING.md  # Manejo de errores y excepciones
    │   ├── PATRON-TESTING.md             # Patrones de testing
    │   ├── PATRON-LOGGING.md             # Logging estructurado
    │   ├── PATRON-CONFIGURACION.md       # Variables de entorno y config
    │   ├── PATRON-SEGURIDAD.md           # Seguridad y OWASP
    │   ├── PATRON-PERFORMANCE.md         # Optimizacion y caching
    │   ├── PATRON-TRANSACCIONES.md       # Transacciones de BD
    │   ├── ANTIPATRONES.md               # Lo que NUNCA hacer
    │   └── NOMENCLATURA-UNIFICADA.md     # Convenciones de nombres
    │
    ├── impactos/                        # IMPACTO DE CAMBIOS
    │   ├── IMPACTO-CAMBIOS-DDL.md       # Cascada de cambios en BD
    │   ├── IMPACTO-CAMBIOS-BACKEND.md   # Sincronizacion Backend↔Frontend
    │   ├── IMPACTO-CAMBIOS-ENTITY.md    # Cambios en Entities TypeORM
    │   ├── IMPACTO-CAMBIOS-API.md       # Cambios en endpoints REST
    │   └── MATRIZ-DEPENDENCIAS.md       # Matriz completa de dependencias
    │
    ├── procesos/                        # PROCESOS DE TRABAJO
    │   └── ORDEN-IMPLEMENTACION.md      # DDL-First, orden de capas
    │
    ├── checklists/                      # CHECKLISTS DE VERIFICACION
    │   ├── CHECKLIST-CODE-REVIEW-API.md    # Revision de codigo API
    │   ├── CHECKLIST-REFACTORIZACION.md    # Checklist de refactoring
    │   └── CHECKLIST-PROPAGACION.md        # Propagacion de cambios
    │
    ├── _historico/
    │   └── MAPA-CONTEXTO-AGENTE.md     # Trazabilidad (historico)
    │
    └── referencias/
        └── ALIASES.yml                  # SISTEMA DE ALIAS
```

---

## GUIA RAPIDA

### Inicializacion de Agente (CCA)

```yaml
# Prompt minimo de inicializacion:
"Seras {PERFIL}-Agent trabajando en el proyecto {PROYECTO}
para realizar: {TAREA}

Antes de actuar, ejecuta el protocolo CCA (Carga de Contexto Automatica)."

# El agente debe:
1. Leer SIMCO-INICIALIZACION.md
2. Cargar contexto en cascada (Core → Proyecto → Operacion → Tarea)
3. Confirmar "READY_TO_EXECUTE" antes de implementar
4. Si detecta compactacion → Ejecutar Recovery antes de continuar

# Ver: @CONTEXT_ENGINEERING para principios de ingenieria de contexto
```

### Para TODO Agente - Siempre Leer:

| Principio | Archivo | Resumen |
|-----------|---------|---------|
| **CAPVED** | `PRINCIPIO-CAPVED.md` | Toda tarea pasa por Contexto→Analisis→Plan→Validacion→Ejecucion→Doc |
| Doc Primero | `PRINCIPIO-DOC-PRIMERO.md` | Consultar docs/ antes de implementar |
| Anti-Dup | `PRINCIPIO-ANTI-DUPLICACION.md` | Verificar que no existe antes de crear |
| Validacion | `PRINCIPIO-VALIDACION-OBLIGATORIA.md` | Build y lint DEBEN pasar |
| **Tokens** | `PRINCIPIO-ECONOMIA-TOKENS.md` | Desglosar tareas para evitar overload |
| **No Asumir** | `PRINCIPIO-NO-ASUMIR.md` | Verificar antes de asumir |

### Por Tipo de Operacion:

| Operacion | Archivo SIMCO | Cuando Usar |
|-----------|---------------|-------------|
| **Tarea/HU** | `SIMCO-TAREA.md` | **PUNTO DE ENTRADA** - Toda HU/tarea que modifica codigo |
| **Inicializacion** | `SIMCO-INICIALIZACION.md` | Bootstrap de agentes (protocolo CCA) + Recovery |
| **Context Engineering** | `SIMCO-CONTEXT-ENGINEERING.md` | Disenar, cargar y recuperar contexto |
| **Reutilizar** | `SIMCO-REUTILIZAR.md` | ANTES de implementar funcionalidad comun |
| **Contribuir** | `SIMCO-CONTRIBUIR-CATALOGO.md` | DESPUES de implementar funcionalidad reutilizable |
| **Crear** | `SIMCO-CREAR.md` | Al crear cualquier archivo nuevo |
| **Modificar** | `SIMCO-MODIFICAR.md` | Al modificar archivos existentes |
| **Validar** | `SIMCO-VALIDAR.md` | Antes de marcar tarea completa |
| **Documentar** | `SIMCO-DOCUMENTAR.md` | Al finalizar cualquier tarea |
| **Buscar** | `SIMCO-BUSCAR.md` | Para encontrar archivos/info |
| **Delegar** | `SIMCO-DELEGACION.md` | Al asignar trabajo a subagentes |
| **Subagente** | `SIMCO-SUBAGENTE.md` | Protocolo cuando RECIBES delegacion (incluye CCA ligero) |
| **Git Remotes** | `SIMCO-GIT-REMOTES.md` | Operaciones push/pull/clone con servidores remotos |
| **Alineacion** | `SIMCO-ALINEACION.md` | Validar alineacion entre capas (DDL↔Entity↔DTO) |
| **Decision** | `SIMCO-DECISION-MATRIZ.md` | Clarificar que directiva ejecutar |

### Por Dominio Tecnico:

| Dominio | Archivo SIMCO | Cuando Usar |
|---------|---------------|-------------|
| **Database** | `SIMCO-DDL.md` | Operaciones con PostgreSQL/DDL |
| **Backend NestJS** | `SIMCO-BACKEND.md` | Operaciones con NestJS/TypeORM |
| **Backend Express** | `SIMCO-BACKEND.md` | Operaciones con Express.js (Prisma/Drizzle) |
| **Frontend** | `SIMCO-FRONTEND.md` | Operaciones con React/TypeScript |
| **Mobile** | `SIMCO-MOBILE.md` | Operaciones con React Native |
| **ML/AI** | `SIMCO-ML.md` | Machine Learning, LLM integration, FastAPI |

### Por Nivel Jerarquico:

| Operacion | Archivo SIMCO | Cuando Usar |
|-----------|---------------|-------------|
| **Identificar Nivel** | `SIMCO-NIVELES.md` | PASO 0 de toda tarea - identificar donde estoy |
| **Propagar** | `SIMCO-PROPAGACION.md` | Al completar tarea - actualizar niveles superiores |

---

## ALIAS MAS USADOS

```yaml
# CICLO DE VIDA Y BOOTSTRAP
@CAPVED:        core/orchestration/directivas/principios/PRINCIPIO-CAPVED.md
@TAREA:         core/orchestration/directivas/simco/SIMCO-TAREA.md
@INICIALIZACION: core/orchestration/directivas/simco/SIMCO-INICIALIZACION.md
@TPL_CAPVED:    core/orchestration/templates/TEMPLATE-TAREA-CAPVED.md

# CONTEXT ENGINEERING (NUEVO)
@CONTEXT_ENGINEERING: core/orchestration/directivas/simco/SIMCO-CONTEXT-ENGINEERING.md
@TPL_RECOVERY_CTX:    core/orchestration/templates/TEMPLATE-RECOVERY-CONTEXT.md
@TPL_HERENCIA_CTX:    core/orchestration/templates/TEMPLATE-HERENCIA-CONTEXTO.md

# CATALOGO DE FUNCIONALIDADES (CONSULTAR PRIMERO)
@CATALOG:       shared/catalog/
@CATALOG_INDEX: shared/catalog/CATALOG-INDEX.yml

# OPERACIONES UNIVERSALES
@REUTILIZAR: core/orchestration/directivas/simco/SIMCO-REUTILIZAR.md
@CREAR:      core/orchestration/directivas/simco/SIMCO-CREAR.md
@MODIFICAR:  core/orchestration/directivas/simco/SIMCO-MODIFICAR.md
@VALIDAR:    core/orchestration/directivas/simco/SIMCO-VALIDAR.md
@DOCUMENTAR: core/orchestration/directivas/simco/SIMCO-DOCUMENTAR.md
@BUSCAR:     core/orchestration/directivas/simco/SIMCO-BUSCAR.md
@DELEGAR:    core/orchestration/directivas/simco/SIMCO-DELEGACION.md

# POR DOMINIO TECNICO
@OP_DDL:      core/orchestration/directivas/simco/SIMCO-DDL.md
@OP_BACKEND:  core/orchestration/directivas/simco/SIMCO-BACKEND.md
@OP_FRONTEND: core/orchestration/directivas/simco/SIMCO-FRONTEND.md
@OP_MOBILE:   core/orchestration/directivas/simco/SIMCO-MOBILE.md
@OP_ML:       core/orchestration/directivas/simco/SIMCO-ML.md

# NIVELES Y PROPAGACION
@NIVELES:     core/orchestration/directivas/simco/SIMCO-NIVELES.md
@PROPAGACION: core/orchestration/directivas/simco/SIMCO-PROPAGACION.md

# TOMA DE DECISIONES
@ALINEACION:      core/orchestration/directivas/simco/SIMCO-ALINEACION.md
@DECISION_MATRIZ: core/orchestration/directivas/simco/SIMCO-DECISION-MATRIZ.md

# SUBAGENTES
@SUBAGENTE:       orchestration/directivas/simco/SIMCO-SUBAGENTE.md
@CHK_DELEGACION:  orchestration/checklists/CHECKLIST-PRE-DELEGACION.md
@PERFILES_COMPACT: orchestration/agents/perfiles/compact/

# GIT Y REPOSITORIOS REMOTOS
@GIT_REMOTES:     orchestration/directivas/simco/SIMCO-GIT-REMOTES.md
@GIT_CREDENTIALS: orchestration/referencias/GIT-CREDENTIALS-CONFIG.md

# DOCUMENTACION Y ESTANDARES (v3.7)
@DOC_PROYECTO:     orchestration/directivas/simco/SIMCO-DOCUMENTACION-PROYECTO.md
@NOMENCLATURA:     orchestration/directivas/simco/SIMCO-NOMENCLATURA.md
@ESTRUCTURA_DOCS:  orchestration/directivas/simco/SIMCO-ESTRUCTURA-DOCS.md
@INVENTARIOS:      orchestration/directivas/simco/SIMCO-INVENTARIOS.md
@TESTING:          orchestration/directivas/simco/SIMCO-TESTING.md
@MIGRACIONES:      orchestration/directivas/simco/SIMCO-MIGRACIONES-BD.md
@INTEGRACIONES:    orchestration/directivas/simco/SIMCO-INTEGRACIONES-EXTERNAS.md

# SINCRONIZACION
@SYNC_BD:            orchestration/directivas/simco/SIMCO-SINCRONIZACION-BD.md

# TEMPLATES DE CONTEXTO
@CTX_STANDALONE: core/orchestration/templates/CONTEXTO-NIVEL-STANDALONE.md
@CTX_SUITE:      core/orchestration/templates/CONTEXTO-NIVEL-SUITE.md
@CTX_SUITE_CORE: core/orchestration/templates/CONTEXTO-NIVEL-SUITE-CORE.md
@CTX_VERTICAL:   core/orchestration/templates/CONTEXTO-NIVEL-VERTICAL.md

# PRINCIPIOS
@PRINCIPIOS: core/orchestration/directivas/principios/
@TOKENS:     core/orchestration/directivas/principios/PRINCIPIO-ECONOMIA-TOKENS.md

# PATRONES Y REFERENCIAS
@PATRONES:   core/orchestration/patrones/
@IMPACTOS:   core/orchestration/impactos/
@QUICK_REF:  core/orchestration/directivas/simco/SIMCO-QUICK-REFERENCE.md

# PROYECTO
@INVENTORY:  orchestration/inventarios/MASTER_INVENTORY.yml
@ALIASES:    core/orchestration/referencias/ALIASES.yml
```

---

## MANTENIMIENTO

| Archivo | Actualizar Cuando |
|---------|-------------------|
| SIMCO-*.md | Cambian procesos universales |
| PRINCIPIO-*.md | Cambian principios fundamentales (raro) |
| PERFIL-*.md | Cambian responsabilidades de agentes |
| ALIASES.yml | Se agregan proyectos o rutas |
| _INDEX.md | Se agregan nuevas directivas SIMCO |

---

## CHANGELOG

- **v3.8.0** (2026-01-10): Mantenimiento de Documentacion (SIMCO-MANTENIMIENTO-DOCUMENTACION, SIMCO-SINCRONIZACION-BD, CHECKLIST-MANTENIMIENTO-DOCS, CHECKLIST-SINCRONIZACION-BD, TEMPLATE-DEPRECACION, PERFIL-DOCUMENTATION-MAINTAINER)
- **v3.7.0** (2026-01-10): Estandarizacion de Documentacion (SIMCO-DOCUMENTACION-PROYECTO, SIMCO-NOMENCLATURA, SIMCO-ESTRUCTURA-DOCS, SIMCO-INVENTARIOS, SIMCO-TESTING, SIMCO-MIGRACIONES-BD, SIMCO-INTEGRACIONES-EXTERNAS, 3 templates, 3 checklists)
- **v2.6.0** (2026-01-07): Git Remotes y Credenciales (SIMCO-GIT-REMOTES, GIT-CREDENTIALS-CONFIG)
- **v2.5.0** (2026-01-07): Subagentes y Economia de Tokens (SIMCO-SUBAGENTE, SIMCO-CCA-SUBAGENTE, SIMCO-CONTROL-TOKENS, perfiles compactos, templates escalonados)
- **v2.4.0** (2026-01-03): Agregado Context Engineering (SIMCO-CONTEXT-ENGINEERING.md, templates de herencia y recovery)
- **v2.3.0** (2025-12-12): Git y Escalamiento (SIMCO-GIT, SIMCO-ESCALAMIENTO)
- **v2.2.0** (2025-12-08): Integracion principio ECONOMIA DE TOKENS + SIMCO-QUICK-REFERENCE
- **v2.1.0** (2025-12-08): Integracion principio CAPVED (ciclo de vida de tareas)
- **v2.0.0** (2025-12-08): Implementacion sistema SIMCO

---

**Version:** 4.1.0 | **Sistema:** SIMCO + CAPVED + NEXUS + Context Engineering | **Mantenido por:** Tech Lead
