# SISTEMA SIMCO - INDICE MAESTRO

**Single Instruction Matrix by Context and Operation**

**Version:** 5.2.0
**Fecha:** 2026-03-03
**Extension:** CCA + CAPVED + Niveles + Economia de Tokens + Git + Context Engineering + Subagentes + Git Remotes + Estandares Documentacion + Validacion SSOT + Normalizacion Documental + Delegacion Paralela + Multi-Agent + Work Items + Limpieza Post-Fase + Frontmatter Schema + Post-Task Sync + Orchestrator Pattern + Session Learning
**Archivos:** 75 activos + _INDEX + 15 archivados = 91 total

> **NOTA (2026-02-11):** 14 archivos solapados fueron consolidados y archivados en `_archive/`.
> Los archivos principales absorben la funcionalidad de los archivados.

---

## QUE ES SIMCO

SIMCO es un sistema de directivas organizadas por **tipo de operacion**, no por perfil de agente. Esto permite que cualquier agente, independientemente de su especializacion, pueda seguir las directivas correctas cuando realiza una operacion fuera de su dominio principal.

---

## ESTRUCTURA

> **NOTA:** Proyecto STANDALONE — todas las rutas son relativas a `orchestration/directivas/simco/`

```
simco/                                       # 72 DIRECTIVAS ACTIVAS + _INDEX + 15 archivadas
├── _INDEX.md                               ← ESTAS AQUI
│
│   # === CICLO DE VIDA (3) ===
├── SIMCO-TAREA.md                          # CICLO CAPVED - Punto de entrada para HUs
├── SIMCO-INICIALIZACION.md                 # Bootstrap de agentes (CCA) + Recovery
├── SIMCO-BOOTLOADER.md                     # Secuencia de arranque NEXUS
│
│   # === CONTEXT ENGINEERING (3) ===
├── SIMCO-CONTEXT-ENGINEERING.md            # Ingenieria de contexto para agentes
├── SIMCO-CONTEXT-MANAGEMENT-V2.md          # Gestion de contexto NEXUS v4.1
├── SIMCO-CONTEXT-CLEANUP.md                # Limpieza de contexto mid-session
│
│   # === OPERACIONES UNIVERSALES (6) ===
├── SIMCO-CREAR.md                          # Crear cualquier archivo
├── SIMCO-MODIFICAR.md                      # Modificar archivos existentes
├── SIMCO-VALIDAR.md                        # Validar codigo (build, lint)
├── SIMCO-DOCUMENTAR.md                     # Documentar trabajo realizado
├── SIMCO-BUSCAR.md                         # Buscar archivos e informacion
├── SIMCO-DELEGACION.md                     # Delegar a subagentes (con CCA)
│
│   # === POR DOMINIO TECNICO (5) ===
├── SIMCO-DDL.md                            # Operaciones de base de datos PostgreSQL
├── SIMCO-BACKEND.md                        # Operaciones de backend NestJS
├── SIMCO-FRONTEND.md                       # Operaciones de frontend React
├── SIMCO-DEVOPS.md                         # Operaciones DevOps y CI/CD
├── SIMCO-DEPLOY-PRODUCTION.md              # Despliegue a produccion
│
│   # === NIVELES Y STANDALONE (3) ===
├── SIMCO-NIVELES.md                        # Identificacion de nivel jerarquico
├── SIMCO-STANDALONE.md                     # Configuracion standalone
├── SIMCO-MONOREPO.md                       # Workflow monorepo
│
│   # === TOMA DE DECISIONES (3) ===
├── SIMCO-ALINEACION.md                     # Alineacion entre capas
├── SIMCO-DECISION-MATRIZ.md                # Matriz de decision para agentes
├── SIMCO-MODEL-SELECTION.md                # Seleccion de modelo AI
│
│   # === GIT Y GOBERNANZA (3) ===
├── SIMCO-GIT.md                            # Control de versiones y commits
├── SIMCO-GIT-REMOTES.md                    # Operaciones con repositorios remotos
├── SIMCO-ESCALAMIENTO.md                   # Escalamiento a Product Owner
│
│   # === SUBAGENTES Y ORQUESTACION (7) ===
├── SIMCO-SUBAGENTE.md                      # Protocolo para agentes en modo subagente
├── SIMCO-DELEGACION-PARALELA.md            # Orquestacion paralela (hasta 5 subagentes)
├── SIMCO-DELEGACION-GEMINI-CLI.md          # Delegacion especifica a Gemini CLI
├── SIMCO-MULTI-AGENT.md                    # Compatibilidad multi-agente (Claude/Gemini/Windsurf)
├── SIMCO-FLUJO-AGENTES.md                  # Flujo de trabajo entre agentes
├── SIMCO-PROMPTS-AGENTES.md                # Templates de prompts para agentes
├── SIMCO-ASIGNACION-PERFILES.md            # Asignacion de perfiles a agentes
│
│   # === REFERENCIA RAPIDA (1) ===
├── SIMCO-QUICK-REFERENCE.md                # Referencia rapida (optimizado para tokens)
│
│   # === DOCUMENTACION Y ESTANDARES (8) ===
├── SIMCO-DOCUMENTACION-PROYECTO.md         # Estructura base de documentacion
├── SIMCO-NOMENCLATURA.md                   # Convenciones de nomenclatura
├── SIMCO-ESTRUCTURA-DOCS.md                # Estructura interna de documentos
├── SIMCO-INVENTARIOS.md                    # Estandares de inventarios YAML
├── SIMCO-TESTING.md                        # Cobertura y estandares de testing
├── SIMCO-MIGRACIONES-BD.md                 # Migraciones y DDL
├── SIMCO-INTEGRACIONES-EXTERNAS.md         # Documentacion de integraciones
├── SIMCO-ESTANDAR-ORCHESTRATION.md         # Estandar de orquestacion
│
│   # === VALIDACION Y SINCRONIZACION (6) ===
├── SIMCO-VALIDACION-SSOT.md                # Validacion SSOT DDL↔Entity↔DTO↔API↔Frontend
├── SIMCO-ESTANDARES.md                     # Gestion centralizada de estandares
├── SIMCO-NORMALIZACION-DOCUMENTAL.md       # Normalizacion documental (1FN/2FN/3FN)
├── SIMCO-SINCRONIZACION-BD.md              # Sincronizacion BD ↔ Codigo ↔ Docs
├── SIMCO-PRE-POST-VALIDATION.md            # Validacion pre/post tarea
├── SIMCO-ORCHESTRATOR-VALIDATION-LOOP.md   # Loop de validacion del orquestador
│
│   # === WORK ITEMS Y GESTION (3) ===
├── SIMCO-WORK-ITEMS.md                     # Gestion de EPICs, Stories, Tasks
├── SIMCO-ESTRUCTURA-TAREAS.md              # Estructura de tareas
├── SIMCO-SCHEDULER-TAREAS.md               # Planificacion de tareas
│
│   # === CONTEXT LIFECYCLE (4) ===
├── SIMCO-LIMPIEZA-POST-FASE.md             # Limpieza de contexto post-fase CAPVED
├── SIMCO-POST-TASK-SYNC.md                 # Sincronizacion post-tarea de inventarios
├── SIMCO-ORCHESTRATOR-PATTERN.md           # Patron de orquestacion (orquestador→subagentes)
├── SIMCO-SESSION-LEARNING-PIPELINE.md      # Pipeline sesion→directiva para aprendizaje
│
│   # === METADATA Y ESQUEMAS (1) ===
├── SIMCO-FRONTMATTER-SCHEMA.md             # Schema YAML para metadata en documentos
│
│   # === RELACIONES Y DEPENDENCIAS (1) ===
├── SIMCO-RELACIONES-OBJETOS.md             # Documentar dependencias entre objetos
│
│   # === ARQUITECTURA Y PATRONES (2) ===
├── SIMCO-ARQUITECTURA.md                   # Directivas de arquitectura
├── SIMCO-ORCHESTRATION-PATTERNS.md         # Patrones de orquestacion
│
│   # === BASE DE DATOS AVANZADA (2) ===
├── SIMCO-RECREAR-BD.md                     # Recrear base de datos desde DDL
├── SIMCO-LOCAL-WSL.md                      # Configuracion local WSL
│
│   # === SEGURIDAD Y LIMITES (3) ===
├── SIMCO-EDICION-SEGURA.md                 # Edicion segura de archivos
├── SIMCO-LIMITES-EDICION-AGENTES.md        # Limites de edicion por agente
├── SIMCO-PURGA-SEGURA.md                   # Purga segura de archivos
│
│   # === SCRUM Y AGILE (4) ===
├── SIMCO-SCRUM-INTEGRATION.md              # Integracion con Scrum
├── SIMCO-SPRINT-EXECUTION.md               # Ejecucion de sprints
├── SIMCO-AGILE-METRICS.md                  # Metricas agiles
├── SIMCO-CAPVED-PLUS.md                    # Extension CAPVED
│
│   # === ANALISIS (2) ===
├── SIMCO-ANALISIS-PLANIFICACION.md         # Analisis y planificacion
├── SIMCO-AUDITORIA-FLUJOS-E2E.md           # Procedimiento de auditoria FE↔BE↔DB por flujo
│
│   # === ERRORES (1) ===
├── SIMCO-ERROR-RECURRENTE.md               # Gestion de errores recurrentes
│
│   # === FUNCIONALIDADES (1) ===
├── SIMCO-FUNCIONALIDADES.md                # Catalogo de funcionalidades
│
│   # === SERVICIOS (1) ===
├── SIMCO-SERVICE-DESCRIPTOR.md             # Descriptor de servicios
│
│   # === REPOS Y PLATAFORMA (2) ===
├── SIMCO-ESTRUCTURA-REPOS.md               # Estructura de repositorios
├── SIMCO-PLATFORM-CONSTRAINTS.md           # Restricciones de plataforma
│
│   # === ARCHIVADOS (15 archivos) ===
└── _archive/
    ├── README.md
    ├── PROTOCOLO-HANDOFF-SUBAGENTE.md
    ├── SIMCO-CCA-SUBAGENTE.md
    ├── SIMCO-CONTEXT-RESOLUTION.md
    ├── SIMCO-CONTROL-TOKENS.md
    ├── SIMCO-DDL-UNIFIED.md
    ├── SIMCO-DELEGACION-PARALELA.md
    ├── SIMCO-DOCUMENTACION-INDEX.md
    ├── SIMCO-GIT-WORKFLOW.md
    ├── SIMCO-IOC-CONTEXTO.md
    ├── SIMCO-MANTENIMIENTO-DOCUMENTACION.md
    ├── SIMCO-MEMORIA-TOKENS.md
    ├── SIMCO-MULTI-AGENT.md
    ├── SIMCO-NOMENCLATURA-TAREAS.md
    └── SIMCO-UBICACION-DOCUMENTACION.md
```

> **PHANTOMS eliminados (v5.0.0):** SIMCO-REUTILIZAR, SIMCO-CONTRIBUIR-CATALOGO,
> SIMCO-MOBILE, SIMCO-ML, SIMCO-PROPAGACION, SIMCO-DOCUMENTAR-SUITE,
> CHECKLIST-FASE-D, LECCIONES-APRENDIDAS-CONSOLIDACION — NO existen en disco.

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
| **Auditoria de flujos** | `SIMCO-AUDITORIA-FLUJOS-E2E.md` | Ejecutar auditoria FE↔BE↔DB y registrar issues |

### Por Dominio Tecnico:

| Dominio | Archivo SIMCO | Cuando Usar |
|---------|---------------|-------------|
| **Database** | `SIMCO-DDL.md` | Operaciones con PostgreSQL/DDL |
| **Backend NestJS** | `SIMCO-BACKEND.md` | Operaciones con NestJS/TypeORM |
| **Backend Express** | `SIMCO-BACKEND.md` | Operaciones con Express.js (Prisma/Drizzle) |
| **Frontend** | `SIMCO-FRONTEND.md` | Operaciones con React/TypeScript |
| **DevOps** | `SIMCO-DEVOPS.md` | Operaciones DevOps y CI/CD |
| **Deploy** | `SIMCO-DEPLOY-PRODUCTION.md` | Despliegue a produccion |

### Por Nivel Jerarquico:

| Operacion | Archivo SIMCO | Cuando Usar |
|-----------|---------------|-------------|
| **Identificar Nivel** | `SIMCO-NIVELES.md` | PASO 0 de toda tarea - identificar donde estoy |
| **Standalone** | `SIMCO-STANDALONE.md` | Configuracion standalone (sin propagacion) |

---

## ALIAS MAS USADOS

```yaml
# CICLO DE VIDA Y BOOTSTRAP
@CAPVED:        orchestration/directivas/principios/PRINCIPIO-CAPVED.md
@TAREA:         orchestration/directivas/simco/SIMCO-TAREA.md
@INICIALIZACION: orchestration/directivas/simco/SIMCO-INICIALIZACION.md
# CONTEXT ENGINEERING (NUEVO)
@CONTEXT_ENGINEERING: orchestration/directivas/simco/SIMCO-CONTEXT-ENGINEERING.md

# OPERACIONES UNIVERSALES
@CREAR:      orchestration/directivas/simco/SIMCO-CREAR.md
@MODIFICAR:  orchestration/directivas/simco/SIMCO-MODIFICAR.md
@VALIDAR:    orchestration/directivas/simco/SIMCO-VALIDAR.md
@DOCUMENTAR: orchestration/directivas/simco/SIMCO-DOCUMENTAR.md
@BUSCAR:     orchestration/directivas/simco/SIMCO-BUSCAR.md
@DELEGAR:    orchestration/directivas/simco/SIMCO-DELEGACION.md

# POR DOMINIO TECNICO
@OP_DDL:      orchestration/directivas/simco/SIMCO-DDL.md
@OP_BACKEND:  orchestration/directivas/simco/SIMCO-BACKEND.md
@OP_FRONTEND: orchestration/directivas/simco/SIMCO-FRONTEND.md
@OP_DEVOPS:   orchestration/directivas/simco/SIMCO-DEVOPS.md
@OP_DEPLOY:   orchestration/directivas/simco/SIMCO-DEPLOY-PRODUCTION.md

# NIVELES (standalone — no propagation)
@NIVELES:     orchestration/directivas/simco/SIMCO-NIVELES.md
@STANDALONE:  orchestration/directivas/simco/SIMCO-STANDALONE.md

# TOMA DE DECISIONES
@ALINEACION:      orchestration/directivas/simco/SIMCO-ALINEACION.md
@DECISION_MATRIZ: orchestration/directivas/simco/SIMCO-DECISION-MATRIZ.md

# SUBAGENTES Y ORQUESTACION
@SUBAGENTE:           orchestration/directivas/simco/SIMCO-SUBAGENTE.md
@DELEGACION_PARALELA: orchestration/directivas/simco/SIMCO-DELEGACION-PARALELA.md
@MULTI_AGENT:         orchestration/directivas/simco/SIMCO-MULTI-AGENT.md
@PERFILES_COMPACT:    orchestration/agents/perfiles/compact/

# GIT Y REPOSITORIOS REMOTOS
@GIT_REMOTES:     orchestration/directivas/simco/SIMCO-GIT-REMOTES.md
@GIT_CREDENTIALS: orchestration/referencias/GIT-CREDENTIALS-CONFIG.md

# DOCUMENTACION Y ESTANDARES (v3.7+)
@DOC_PROYECTO:     orchestration/directivas/simco/SIMCO-DOCUMENTACION-PROYECTO.md
@NOMENCLATURA:     orchestration/directivas/simco/SIMCO-NOMENCLATURA.md
@ESTRUCTURA_DOCS:  orchestration/directivas/simco/SIMCO-ESTRUCTURA-DOCS.md
@INVENTARIOS:      orchestration/directivas/simco/SIMCO-INVENTARIOS.md
@TESTING:          orchestration/directivas/simco/SIMCO-TESTING.md
@MIGRACIONES:      orchestration/directivas/simco/SIMCO-MIGRACIONES-BD.md
@INTEGRACIONES:    orchestration/directivas/simco/SIMCO-INTEGRACIONES-EXTERNAS.md

# VALIDACION Y NORMALIZACION (v4.2)
@VALIDACION_SSOT:       orchestration/directivas/simco/SIMCO-VALIDACION-SSOT.md
@ESTANDARES:            orchestration/directivas/simco/SIMCO-ESTANDARES.md
@NORMALIZACION_DOC:     orchestration/directivas/simco/SIMCO-NORMALIZACION-DOCUMENTAL.md

# WORK ITEMS Y GESTION
@WORK_ITEMS:         orchestration/directivas/simco/SIMCO-WORK-ITEMS.md

# CONTEXT LIFECYCLE
@LIMPIEZA_POST_FASE:    orchestration/directivas/simco/SIMCO-LIMPIEZA-POST-FASE.md
@POST_TASK_SYNC:        orchestration/directivas/simco/SIMCO-POST-TASK-SYNC.md
@ORCHESTRATOR_PATTERN:  orchestration/directivas/simco/SIMCO-ORCHESTRATOR-PATTERN.md
@SESSION_LEARNING:      orchestration/directivas/simco/SIMCO-SESSION-LEARNING-PIPELINE.md

# METADATA Y ESQUEMAS
@FRONTMATTER_SCHEMA: orchestration/directivas/simco/SIMCO-FRONTMATTER-SCHEMA.md

# SINCRONIZACION
@SYNC_BD:            orchestration/directivas/simco/SIMCO-SINCRONIZACION-BD.md

# PRINCIPIOS
@PRINCIPIOS: orchestration/directivas/principios/
@TOKENS:     orchestration/directivas/principios/PRINCIPIO-ECONOMIA-TOKENS.md

# PATRONES Y REFERENCIAS
@PATRONES:   orchestration/patrones/
@QUICK_REF:  orchestration/directivas/simco/SIMCO-QUICK-REFERENCE.md

# PROYECTO
@INVENTORY:  orchestration/inventarios/MASTER_INVENTORY.yml
@ALIASES:    orchestration/agents/ALIASES.yml
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

- **v5.2.0** (2026-03-03): Added 3 new directives: SIMCO-POST-TASK-SYNC (inventory sync), SIMCO-ORCHESTRATOR-PATTERN (orchestration pattern), SIMCO-SESSION-LEARNING-PIPELINE (session learning pipeline), updated CONTEXT LIFECYCLE section (1->4), total 75 active directives
- **v5.1.0** (2026-02-25): Cleanup: added SIMCO-DELEGACION-GEMINI-CLI.md, fixed ANALISIS count (1->2), removed 10 phantom aliases from ALIAS MAS USADOS, total 72 active directives
- **v5.0.0** (2026-02-14): Auditoria integral: rewrite ESTRUCTURA con 70 archivos reales, eliminados 8 phantoms (REUTILIZAR, CONTRIBUIR-CATALOGO, MOBILE, ML, PROPAGACION, DOCUMENTAR-SUITE, CHECKLIST-FASE-D, LECCIONES-APRENDIDAS), corregidos core/ → orchestration/ paths, removido catalogo shared/
- **v4.5.0** (2026-02-13): Limpieza Post-Fase CAPVED (SIMCO-LIMPIEZA-POST-FASE); Frontmatter Schema (SIMCO-FRONTMATTER-SCHEMA); LOCAL-WSL-ENVIRONMENT.yml; Perfiles _MAP.md con NEXUS v4.1; 3 stubs archivados; Guia Coverage Testing
- **v4.4.0** (2026-02-13): Gestion de Work Items (SIMCO-WORK-ITEMS); TRIGGER-SSOT-SYNC; Catalogo errores expandido 10→25
- **v4.3.0** (2026-02-13): Reactivacion Delegacion Paralela y Multi-Agent (SIMCO-DELEGACION-PARALELA, SIMCO-MULTI-AGENT); CHECKLIST-SSOT-SYNC actualizado para standalone; @DEF_VAL_* en perfiles especializados
- **v4.2.0** (2026-02-13): Validacion SSOT, Estandares centralizados, Normalizacion Documental (SIMCO-VALIDACION-SSOT, SIMCO-ESTANDARES, SIMCO-NORMALIZACION-DOCUMENTAL)
- **v4.1.0** (2026-02-11): Consolidacion 14 archivos solapados a _archive/
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

**Version:** 5.1.0 | **Sistema:** SIMCO + CAPVED + NEXUS + Context Engineering | **Mantenido por:** Tech Lead
