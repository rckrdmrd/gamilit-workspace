# INDICE Y GUIA DE ASIGNACION DE PERFILES DE AGENTES

**Version:** 3.0.0
**Fecha:** 2026-02-26
**Sistema:** NEXUS v4.1 + SIMCO v4.5.0
**Proposito:** Guia para asignacion correcta de tareas a perfiles especializados

> Nota de normalizacion: `_MAP.md` es entrada operativa.
> Para detalle extendido de catalogo usar `CATALOG.md`.
> Contrato transversal full: `PERFIL-CONTRATO-TRANSVERSAL.md`.

---

## DIRECTIVA DE USO

> **OBLIGATORIO PARA AGENTES ORQUESTADORES**
>
> Antes de delegar una tarea a un subagente, el agente orquestador DEBE:
> 1. Consultar este mapa para identificar el perfil mas adecuado
> 2. Verificar que la tarea coincide con el dominio del perfil
> 3. Incluir el alias del perfil en la delegacion
> 4. Proporcionar contexto minimo requerido por el perfil

---

## CONTRATO TRANSVERSAL (OBLIGATORIO)

Antes de usar cualquier perfil full:
- Aplicar contrato de entrada/salida definido en `PERFIL-CONTRATO-TRANSVERSAL.md`.
- Resolver skills/contexto desde `PROFILE-SKILL-MAP.json` mediante `profile_skill_resolver.py`.
- Evitar rutas legacy no existentes en este workspace standalone.

```yaml
# PERFIL-CONTRATO-TRANSVERSAL.md
archivo: "PERFIL-CONTRATO-TRANSVERSAL.md"
dominio: "Contrato IoC + normalizacion obligatorio para todos los perfiles full"
descripcion_breve: |
  Define la estructura minima obligatoria que todo perfil full debe cumplir:
  CCA, Identidad, Referencias, Context Requirements. Aplica SOLID documental.
```

---

## MAPEO RAPIDO: TAREA → PERFIL

### Por Palabra Clave en la Tarea

| Si la tarea menciona... | Asignar a | Alias |
|-------------------------|-----------|-------|
| "crear tabla", "DDL", "migracion", "schema", "indice", "constraint" | Database | @PERFIL_DATABASE_POSTGRESQL |
| "endpoint", "API", "controller", "service", "NestJS", "DTO" | Backend | @PERFIL_BACKEND_NESTJS |
| "componente", "React", "CSS", "UI", "formulario", "pagina" | Frontend | @PERFIL_FRONTEND_REACT |
| "mobile", "app", "iOS", "Android", "React Native", "Flutter" | Mobile | @PERFIL_MOBILE |
| "modelo ML", "prediccion", "entrenamiento", "features", "dataset" | ML-Specialist | @PERFIL_ML_SPEC |
| "LLM", "ChatGPT", "Claude", "prompt", "embeddings", "RAG" | LLM-Agent | @PERFIL_LLM |
| "Docker", "CI/CD basico", "deploy simple", "nginx" | DevOps | @PERFIL_DEVOPS |
| "pipeline avanzado", "Jenkins", "GitHub Actions", "quality gates" | CICD-Specialist | @PERFIL_CICD_SPECIALIST |
| "produccion", "rollback", "ambiente prod", "deploy produccion" | Production-Manager | @PERFIL_PRODUCTION_MANAGER |
| "recrear bd dev", "wsl", "reset db local", "database local windows" | Database-PostgreSQL | @PERFIL_DATABASE_POSTGRESQL |
| "secretos", "credenciales", ".env", "API keys", "rotacion" | Secrets-Manager | @PERFIL_SECRETS_MANAGER |
| "Prometheus", "Grafana", "alertas", "metricas", "monitoreo" | Monitoring-Agent | @PERFIL_MONITORING_AGENT |
| "puertos", "entorno local", "conflictos de puertos" | DevEnv | @PERFIL_DEVENV |
| "test", "jest", "pytest", "cobertura", "e2e", "integracion" | Testing | @PERFIL_TESTING |
| "code review", "PR review", "revision de codigo" | Code-Reviewer | @PERFIL_REVIEWER |
| "bug", "fix", "corregir error", "debug" | Bug-Fixer | @PERFIL_BUGFIX |
| "seguridad", "vulnerabilidad", "OWASP", "auditoria seguridad" | Security-Auditor | @PERFIL_SEC_AUDITOR |
| "RLS", "policies", "auditoria BD" | Database-Auditor | @PERFIL_DB_AUDITOR |
| "documentar", "README", "JSDoc", "comentarios" | Documentation | @PERFIL_DOCS |
| "catalogar", "documentar catalogo", "knowledge base" | Documentation-Validator | @PERFIL_DOCS |
| "arquitectura", "patron", "decision tecnica", "trade-off" | Architecture-Analyst | @PERFIL_ARCHITECT |
| "coordinar", "delegar", "multiples agentes" | Orquestador | @PERFIL_ORQUESTADOR |
| "requerimientos", "historia usuario", "criterios aceptacion" | Requirements-Analyst | @PERFIL_REQUIREMENTS |
| "XP", "logros", "gamificacion", "recompensas", "rangos" | Gamification-Specialist | (proyecto gamilit) |
| "auditoria de flujos", "flujo end-to-end", "trazabilidad FE BE DB" | Documentation-Maintainer | @PERFIL_DOCS_MAINTAINER |
| "issue de consistencia", "estado parcial", "atomicidad rewards" | Backend-NestJS + Database-PostgreSQL | @PERFIL_BACKEND_NESTJS + @PERFIL_DATABASE_POSTGRESQL |
| "cobertura total de procesos", "riesgos residuales", "analisis vs implementacion documental" | Documentation-Maintainer + Orquestador | @PERFIL_DOCS_MAINTAINER + @PERFIL_ORQUESTADOR |
| "normalizacion documental", "enlaces rotos docs", "SSOT docs/orchestration" | Documentation-Maintainer + Orquestador | @PERFIL_DOCS_MAINTAINER + @PERFIL_ORQUESTADOR |
| "portal parents", "vinculacion padre-estudiante", "notificaciones padres" | Requirements-Analyst + Documentation-Maintainer | @PERFIL_REQUIREMENTS + @PERFIL_DOCS_MAINTAINER |
| "trading ML", "backtesting", "estrategia trading" | Trading-ML-Specialist | (proyecto trading) |

---

## CATALOGO DE PERFILES

### 1. COORDINACION Y LIDERAZGO

#### PERFIL-ORQUESTADOR
```yaml
alias: "@PERFIL_ORQUESTADOR"
archivo: "PERFIL-ORQUESTADOR.md"
dominio: "Coordinacion general de tareas y agentes"

descripcion_breve: |
  Agente maestro que recibe tareas complejas, las descompone en subtareas
  y las delega a agentes especializados. Mantiene vision global del proyecto.

tipos_tarea:
  - "Implementar feature completa (multi-capa)"
  - "Coordinar refactorizacion grande"
  - "Gestionar sprint/milestone"
  - "Resolver tarea que requiere multiples especialidades"

directivas:
  - "@SIMCO/SIMCO-DELEGACION.md"
  - "@SIMCO/SIMCO-TAREA.md"
  - "@TPL_DELEGACION"

no_asignar_si:
  - "Tarea es especifica de una sola capa (DB, Backend, Frontend)"
  - "Tarea es simple y no requiere coordinacion"
```

#### PERFIL-TECH-LEADER
```yaml
alias: "@PERFIL_TECH_LEADER"
archivo: "PERFIL-TECH-LEADER.md"
dominio: "Decisiones tecnicas y escalaciones"

descripcion_breve: |
  Toma decisiones tecnicas criticas, resuelve conflictos entre enfoques,
  aprueba cambios arquitecturales. Punto de escalacion para bloqueos.

tipos_tarea:
  - "Decidir entre tecnologias/librerias"
  - "Aprobar cambio breaking"
  - "Resolver conflicto tecnico"
  - "Escalar bloqueo critico"

directivas:
  - "@SIMCO/SIMCO-ESCALAMIENTO.md"
  - "@PRINCIPIOS/PRINCIPIO-CAPVED.md"

no_asignar_si:
  - "Tarea es implementacion directa"
  - "No hay decision tecnica que tomar"
```

#### PERFIL-ARCHITECTURE-ANALYST
```yaml
alias: "@PERFIL_ARCHITECT"
archivo: "PERFIL-ARCHITECTURE-ANALYST.md"
dominio: "Analisis arquitectonico y patrones"

descripcion_breve: |
  Analiza y diseña arquitectura de sistemas. Identifica patrones,
  evalua trade-offs, propone estructuras escalables.

tipos_tarea:
  - "Diseñar arquitectura de nuevo modulo"
  - "Evaluar patron a implementar"
  - "Analizar impacto de cambio estructural"
  - "Documentar decisiones arquitectonicas (ADR)"

directivas:
  - "@SIMCO/SIMCO-ARQUITECTURA.md"
  - "@PAT_*" (patrones)
  - "@ESTRUCTURA"

no_asignar_si:
  - "Tarea es implementacion de codigo"
  - "No hay componente de diseño/analisis"
```

---

### 2. DESARROLLO TECNICO

#### PERFIL-DATABASE-POSTGRESQL
```yaml
alias: "@PERFIL_DATABASE_POSTGRESQL"
archivo: "PERFIL-DATABASE-POSTGRESQL.md"
dominio: "PostgreSQL 15 especializado con RLS y funciones avanzadas"

descripcion_breve: |
  Especialista avanzado en PostgreSQL 15. RLS policies, materialized views,
  funciones PL/pgSQL, triggers complejos, optimizacion de queries.
  DDL-First workflow con politica de carga limpia.

tipos_tarea:
  - "Diseñar schema complejo con RLS"
  - "Crear materialized views y funciones PL/pgSQL"
  - "Optimizar queries con EXPLAIN ANALYZE"
  - "Implementar triggers complejos de auditoria"
  - "Diseñar politicas RLS multi-tenant"
  - "Crear funciones de agregacion personalizadas"

directivas:
  - "@OP_DDL"
  - "@SIMCO/SIMCO-DDL.md"
  - "@TRIGGER-DDL-WSL"

usar_cuando:
  - "Tarea compleja de PostgreSQL (RLS, funciones, triggers)"
  - "Diseño de schemas con relaciones complejas"
  - "Optimizacion de rendimiento de BD"

no_asignar_si:
  - "Tarea simple de BD (usar @PERFIL_DATABASE generico)"
  - "Es solo configuracion de ORM"
```

#### PERFIL-BACKEND-NESTJS
```yaml
alias: "@PERFIL_BACKEND_NESTJS"
archivo: "PERFIL-BACKEND-NESTJS.md"
dominio: "Desarrollo backend NestJS 11 especializado"

descripcion_breve: |
  Especialista en NestJS 11 con TypeORM 0.3.x, class-validator,
  Passport JWT, Swagger. Perfil detallado para tareas complejas de backend.

tipos_tarea:
  - "Crear modulo NestJS completo (entity+service+controller+DTOs)"
  - "Implementar guards y decorators personalizados"
  - "Configurar TypeORM entities con relaciones complejas"
  - "Integrar Socket.IO con NestJS"
  - "Implementar patrones avanzados (interceptors, pipes, middleware)"

directivas:
  - "@OP_BACKEND"
  - "@SIMCO/SIMCO-BACKEND.md"

usar_cuando:
  - "Tarea compleja de backend NestJS"
  - "Requiere conocimiento profundo de NestJS 11"

no_asignar_si:
  - "Tarea simple de backend (usar @PERFIL_BACKEND generico)"
  - "Proyecto usa Express"
```

#### PERFIL-DEPLOY-SERVER
```yaml
alias: "@PERFIL_DEPLOY"
archivo: "PERFIL-DEPLOY-SERVER.md"
dominio: "Deployment a servidor de produccion"

descripcion_breve: |
  Gestiona el proceso de deployment a produccion (74.208.126.102).
  git pull, build, PM2 restart, smoke tests, rollback.

tipos_tarea:
  - "Deploy a produccion"
  - "Rollback de deployment"
  - "Verificar estado de produccion"
  - "Actualizar configuracion de produccion"

directivas:
  - "@SIMCO/SIMCO-DEPLOY.md"

no_asignar_si:
  - "Es desarrollo local"
  - "No involucra el servidor de produccion"
```

#### PERFIL-DOCUMENTATION-MAINTAINER
```yaml
alias: "@PERFIL_DOCS_MAINTAINER"
archivo: "PERFIL-DOCUMENTATION-MAINTAINER.md"
dominio: "Mantenimiento de documentacion y gobernanza"

descripcion_breve: |
  Mantiene la integridad de la documentacion del proyecto.
  Indices, mapas, cross-references, inventarios.

tipos_tarea:
  - "Actualizar indices y mapas"
  - "Verificar cross-references"
  - "Mantener coherencia de inventarios"
  - "Auditar estructura de documentacion"

directivas:
  - "@SIMCO/SIMCO-DOCUMENTAR.md"

no_asignar_si:
  - "Es implementacion de codigo"
  - "No involucra documentacion"
```

#### PERFIL-FRONTEND-REACT
```yaml
alias: "@PERFIL_FRONTEND_REACT"
archivo: "PERFIL-FRONTEND-REACT.md"
dominio: "Desarrollo frontend React 19 especializado"

descripcion_breve: |
  Especialista en React 19 con Zustand, TailwindCSS, Vite 6.x,
  React Router. Perfil detallado para componentes y paginas complejas.

tipos_tarea:
  - "Crear pagina completa con multiples componentes"
  - "Implementar formularios complejos con validacion"
  - "Crear hooks personalizados complejos"
  - "Optimizar rendimiento de componentes React"
  - "Integrar Socket.IO con componentes React"
  - "Implementar mecanicas de gamificacion en UI"

directivas:
  - "@OP_FRONTEND"
  - "@SIMCO/SIMCO-FRONTEND.md"

usar_cuando:
  - "Tarea compleja de frontend React"
  - "Requiere multiples componentes coordinados"
  - "Implementacion de gamificacion en UI"

no_asignar_si:
  - "Tarea simple de frontend (usar @PERFIL_FRONTEND generico)"
  - "Proyecto no usa React"
```

#### PERFIL-ML-SPECIALIST [ELIMINADO]
```yaml
estado: "ELIMINADO - No aplica a gamilit (plataforma educativa sin ML real)"
nota: "Perfil eliminado 2026-02-26 (recuperable via git history)"
```

---

### 3. INFRAESTRUCTURA Y DEVOPS

#### PERFIL-DEVOPS
```yaml
alias: "@PERFIL_DEVOPS"
archivo: "PERFIL-DEVOPS.md"
dominio: "CI/CD basico, Docker, Cloud general"

descripcion_breve: |
  Configura infraestructura de desarrollo y deployment basico.
  Docker, docker-compose, configuracion de servidores.

tipos_tarea:
  - "Crear Dockerfile"
  - "Configurar docker-compose"
  - "Setup basico de servidor"
  - "Configurar nginx basico"
  - "Deploy simple"

directivas:
  - "@OP_DEVOPS"
  - "@DOCKER"
  - "@WORKFLOWS"

delegar_a_especialista:
  - "Pipelines complejos → @PERFIL_CICD_SPECIALIST"
  - "Produccion critica → @PERFIL_PRODUCTION_MANAGER"
  - "Secretos → @PERFIL_SECRETS_MANAGER"
  - "Monitoreo avanzado → @PERFIL_MONITORING_AGENT"
```

#### PERFIL-CICD-SPECIALIST
```yaml
alias: "@PERFIL_CICD_SPECIALIST"
archivo: "PERFIL-CICD-SPECIALIST.md"
dominio: "Pipelines CI/CD avanzados"

descripcion_breve: |
  Especialista en pipelines de integracion y deployment continuo.
  Jenkins, GitHub Actions, quality gates, estrategias de release.

tipos_tarea:
  - "Crear pipeline Jenkins complejo"
  - "Configurar GitHub Actions workflow"
  - "Implementar quality gates"
  - "Estrategia de branching/release"
  - "Configurar shared libraries"
  - "Optimizar tiempos de build"

directivas:
  - "CICD-PIPELINES-INVENTORY.yml"
  - "@SIMCO/SIMCO-VALIDAR.md"

estandares:
  - "Jenkinsfile declarativo"
  - "Stages atomicos"
  - "Artifacts versionados"
  - "Notificaciones en Slack"

no_asignar_si:
  - "Es configuracion basica de Docker"
  - "No hay pipeline involucrado"
```

#### PERFIL-PRODUCTION-MANAGER
```yaml
alias: "@PERFIL_PRODUCTION_MANAGER"
archivo: "PERFIL-PRODUCTION-MANAGER.md"
dominio: "Gestion de ambientes productivos"

descripcion_breve: |
  Gestiona deployments a produccion, rollbacks, mantenimiento
  de servidores productivos. Responsable de uptime.

tipos_tarea:
  - "Deploy a produccion"
  - "Ejecutar rollback"
  - "Mantenimiento de servidor prod"
  - "Configurar SSL/dominios"
  - "Planificar ventana de mantenimiento"
  - "Gestionar backups"

directivas:
  - "PRODUCTION-INVENTORY.yml"
  - "@SIMCO/SIMCO-VALIDAR.md"

estandares:
  - "Approval requerido para prod"
  - "Backup antes de cambios"
  - "Rollback plan obligatorio"
  - "Notificar stakeholders"

no_asignar_si:
  - "Es ambiente de desarrollo/staging"
  - "No afecta produccion"
```

#### PERFIL-SECRETS-MANAGER
```yaml
alias: "@PERFIL_SECRETS_MANAGER"
archivo: "PERFIL-SECRETS-MANAGER.md"
dominio: "Gestion de secretos y credenciales"

descripcion_breve: |
  Gestiona secretos, credenciales, API keys de forma segura.
  Rotacion, auditoria, documentacion de variables de entorno.

tipos_tarea:
  - "Configurar .env para proyecto"
  - "Rotar credenciales"
  - "Auditar secretos expuestos"
  - "Documentar variables requeridas"
  - "Configurar vault (futuro)"

directivas:
  - "ENV-VARS-INVENTORY.yml"
  - Politicas de seguridad

estandares:
  - "Nunca commitear secretos"
  - ".env.example actualizado"
  - "Rotacion trimestral"
  - "Permisos 600 en archivos"

no_asignar_si:
  - "No involucra credenciales/secretos"
  - "Es codigo de aplicacion"
```

#### PERFIL-MONITORING-AGENT
```yaml
alias: "@PERFIL_MONITORING_AGENT"
archivo: "PERFIL-MONITORING-AGENT.md"
dominio: "Observabilidad y alertas"

descripcion_breve: |
  Configura y mantiene stack de monitoreo. Prometheus, Grafana,
  alertas, dashboards, metricas de aplicacion.

tipos_tarea:
  - "Configurar Prometheus"
  - "Crear dashboard Grafana"
  - "Definir reglas de alerta"
  - "Instrumentar aplicacion"
  - "Investigar incidente con metricas"
  - "Crear runbook"

directivas:
  - "MONITORING-CONFIG.yml"

estandares:
  - "Alertas con runbook"
  - "Dashboards documentados"
  - "Metricas con labels"
  - "Retencion definida"

no_asignar_si:
  - "No hay componente de monitoreo"
  - "Es desarrollo de features"
```

#### PERFIL-DEVENV
```yaml
alias: "@PERFIL_DEVENV"
archivo: "PERFIL-DEVENV.md"
dominio: "Gestion de entornos de desarrollo"

descripcion_breve: |
  Gestiona entornos locales de desarrollo. Asigna puertos,
  evita conflictos, documenta configuracion de ambiente.

tipos_tarea:
  - "Asignar puertos a nuevo proyecto"
  - "Resolver conflicto de puertos"
  - "Documentar setup de entorno"
  - "Auditar uso de puertos"

directivas:
  - "DEVENV-PORTS-INVENTORY.yml"

estandares:
  - "Rangos de puertos por proyecto"
  - "Inventario actualizado"
  - ".env.ports por proyecto"

no_asignar_si:
  - "Es configuracion de produccion"
  - "No involucra entorno local"
```

---

### 4. CALIDAD Y TESTING

#### PERFIL-TESTING
```yaml
alias: "@PERFIL_TESTING"
archivo: "PERFIL-TESTING.md"
dominio: "Testing automatizado"

descripcion_breve: |
  Escribe y mantiene tests automatizados. Unit tests, integration tests,
  e2e tests. Mejora cobertura de codigo.

tipos_tarea:
  - "Escribir unit tests"
  - "Crear tests de integracion"
  - "Implementar tests e2e"
  - "Aumentar cobertura"
  - "Configurar test framework"

directivas:
  - "@PAT_TESTING"

estandares:
  - "Cobertura minima 80%"
  - "Tests independientes"
  - "Mocks para dependencias externas"
  - "Nombres descriptivos"

no_asignar_si:
  - "Es implementacion de feature sin tests"
  - "Es configuracion de infra"
```

#### PERFIL-CODE-REVIEWER
```yaml
alias: "@PERFIL_REVIEWER"
archivo: "PERFIL-CODE-REVIEWER.md"
dominio: "Revision de codigo"

descripcion_breve: |
  Revisa PRs y codigo. Identifica problemas, sugiere mejoras,
  verifica cumplimiento de estandares.

tipos_tarea:
  - "Revisar PR"
  - "Auditar calidad de codigo"
  - "Verificar estandares"

directivas:
  - "@CHK_CODE_REVIEW"

no_asignar_si:
  - "Es implementacion, no revision"
```

---

### 5. SEGURIDAD Y AUDITORIA

#### PERFIL-SECURITY-AUDITOR
```yaml
alias: "@PERFIL_SEC_AUDITOR"
archivo: "PERFIL-SECURITY-AUDITOR.md"
dominio: "Auditoria de seguridad"

descripcion_breve: |
  Audita seguridad de codigo y sistemas. Identifica vulnerabilidades,
  propone mitigaciones, verifica OWASP.

tipos_tarea:
  - "Auditoria de seguridad"
  - "Identificar vulnerabilidades"
  - "Verificar OWASP Top 10"
  - "Revisar autenticacion/autorizacion"

directivas:
  - "@PAT_SECURITY"

no_asignar_si:
  - "Es implementacion de features"
  - "No hay componente de seguridad"
```

#### PERFIL-POLICY-AUDITOR
```yaml
alias: "@PERFIL_POLICY"
archivo: "PERFIL-POLICY-AUDITOR.md"
dominio: "Auditoria de politicas RLS y permisos de base de datos"

descripcion_breve: |
  Audita politicas RLS, permisos de base de datos, y cumplimiento
  de reglas de acceso multi-tenant. Valida que RLS policies cubran
  todas las tablas y operaciones requeridas.

tipos_tarea:
  - "Auditar politicas RLS"
  - "Verificar permisos de BD"
  - "Validar cobertura de policies multi-tenant"
  - "Revisar grants y privilegios"

directivas:
  - "@OP_DDL"
  - "@SIMCO/SIMCO-DDL.md"

no_asignar_si:
  - "Es auditoria de codigo (usar Security-Auditor)"
  - "Es desarrollo de features"
```

---

### 6. DOCUMENTACION Y KNOWLEDGE BASE

#### NOTA: PERFILES DE PROPAGACION NO APLICAN EN GAMILIT
```yaml
# KB-Manager y Propagation-Tracker no aplican en gamilit
# Gamilit es STANDALONE - sin propagacion (ver CLAUDE.md RC3)
# Para documentacion y catalogacion: usar Documentation-Validator
```

---

### 7. PERFILES ESPECIALIZADOS POR PROYECTO

#### PERFIL-TRADING-ML-SPECIALIST (trading-platform)
```yaml
alias: "(proyecto especifico)"
archivo: "projects/trading-platform/orchestration/agents/perfiles/PERFIL-TRADING-ML-SPECIALIST.md"
dominio: "ML para trading"

descripcion_breve: |
  Especialista en ML aplicado a trading. Modelos predictivos,
  backtesting, feature engineering para mercados financieros.

tipos_tarea:
  - "Crear modelo de prediccion de precios"
  - "Implementar backtesting"
  - "Feature engineering para trading"
  - "Optimizar estrategia ML"

contexto_requerido:
  - "Solo para proyecto trading-platform"
```

#### PERFIL-GAMIFICATION-SPECIALIST (gamilit)
```yaml
alias: "(proyecto especifico)"
archivo: "projects/gamilit/orchestration/agentes/perfiles/PERFIL-GAMIFICATION-SPECIALIST.md"
dominio: "Gamificacion educativa"

descripcion_breve: |
  Especialista en gamificacion para educacion. Sistemas de XP,
  logros, economia virtual, engagement de estudiantes.

tipos_tarea:
  - "Diseñar sistema de XP"
  - "Crear logros"
  - "Balancear economia virtual"
  - "Mejorar engagement"

contexto_requerido:
  - "Solo para proyecto gamilit"
```

---

## MATRIZ DE DECISION RAPIDA

### Por Capa de Arquitectura

| Capa | Perfil Principal | Alternativa |
|------|------------------|-------------|
| Base de Datos | @PERFIL_DATABASE_POSTGRESQL | @PERFIL_DB_AUDITOR (auditoria) |
| Backend NestJS | @PERFIL_BACKEND_NESTJS | - |
| Frontend | @PERFIL_FRONTEND_REACT | - |
| Mobile | @PERFIL_MOBILE | - |
| ML/Data | @PERFIL_ML_SPEC | Especializado por proyecto |
| Infra Dev | @PERFIL_DEVENV | @PERFIL_DEVOPS |
| Infra Prod | @PERFIL_PRODUCTION_MANAGER | @PERFIL_DEVOPS |
| CI/CD | @PERFIL_CICD_SPECIALIST | @PERFIL_DEVOPS (basico) |
| Monitoreo | @PERFIL_MONITORING_AGENT | - |
| Seguridad | @PERFIL_SEC_AUDITOR | @PERFIL_SECRETS_MANAGER |

### Por Tipo de Operacion

| Operacion | Perfil |
|-----------|--------|
| CREAR nuevo | Perfil de la capa correspondiente |
| MODIFICAR existente | Perfil de la capa correspondiente |
| VALIDAR/REVISAR | @PERFIL_REVIEWER o auditor especializado |
| DOCUMENTAR | @PERFIL_DOCS |
| COORDINAR | @PERFIL_ORQUESTADOR |
| DECIDIR | @PERFIL_TECH_LEADER o @PERFIL_ARCHITECT |
| DEPLOY | @PERFIL_PRODUCTION_MANAGER o @PERFIL_DEVOPS |
| CATALOGAR | @PERFIL_DOCS |

---

## PROCEDIMIENTO DE ASIGNACION

```yaml
procedimiento_asignacion:
  paso_1:
    accion: "Identificar capa/dominio de la tarea"
    ejemplo: "Crear endpoint → Backend"

  paso_2:
    accion: "Buscar en mapeo por palabra clave"
    ejemplo: "'endpoint' → @PERFIL_BACKEND"

  paso_3:
    accion: "Verificar que la tarea coincide con 'tipos_tarea' del perfil"
    verificar: "descripcion_breve del perfil"

  paso_4:
    accion: "Verificar 'no_asignar_si'"
    resultado: "Si coincide alguna condicion, buscar perfil alternativo"

  paso_5:
    accion: "Preparar delegacion con contexto minimo"
    incluir:
      - "Alias del perfil"
      - "Descripcion clara de la tarea"
      - "Archivos relevantes a cargar"
      - "Criterios de aceptacion"
```

---

## TEMPLATE DE DELEGACION

```markdown
## Delegacion a {ALIAS_PERFIL}

**Tarea:** {descripcion breve}

**Contexto:**
- Proyecto: {nombre_proyecto}
- Ubicacion: {ruta_relevante}

**Archivos a cargar:**
- {archivo_1}
- {archivo_2}

**Criterios de aceptacion:**
- [ ] {criterio_1}
- [ ] {criterio_2}

**Directivas aplicables:**
- {directiva_1}
- {directiva_2}
```

---

## PERFILES COMPACTOS (PARA SUBAGENTES)

Ubicacion: `compact/`

| Perfil | Uso | Tokens |
|--------|-----|--------|
| PERFIL-BACKEND-COMPACT.md | Subagente Backend | ~250 |
| PERFIL-FRONTEND-COMPACT.md | Subagente Frontend | ~250 |
| PERFIL-DATABASE-COMPACT.md | Subagente Database | ~250 |
| PERFIL-DEVOPS-COMPACT.md | Subagente DevOps | ~250 |
| PERFIL-ML-COMPACT.md | Subagente ML | ~250 |
| PERFIL-DOCUMENTATION-COMPACT.md | Subagente Documentacion | ~250 |
| PERFIL-TESTING-COMPACT.md | Subagente Testing | ~250 |
| PERFIL-SECURITY-COMPACT.md | Subagente Seguridad | ~250 |
| PERFIL-QA-COMPACT.md | Subagente QA | ~250 |
| PERFIL-ARCHITECTURE-ANALYST-COMPACT.md | Subagente Arquitectura | ~250 |
| PERFIL-INTEGRATION-VALIDATOR-COMPACT.md | Subagente Integracion | ~250 |
| PERFIL-DATABASE-AUDITOR-COMPACT.md | Subagente Auditoria BD | ~250 |
| PERFIL-CODE-REVIEWER-COMPACT.md | Subagente Code Review | ~250 |
| PERFIL-REQUIREMENTS-ANALYST-COMPACT.md | Subagente Requerimientos | ~250 |
| PERFIL-GENERIC-SUBAGENT.md | Subagente generico | ~200 |

**Cuando usar perfiles compactos:**
- Agente recibe delegacion (opera como subagente)
- Tarea especifica de 1-2 archivos
- Optimizacion de tokens necesaria

**Ahorro:** ~550 tokens por perfil vs perfil completo

**Ver:** `compact/_MAP-COMPACT.md`

---

## NEXUS v4.1 — INTEGRACION CON PERFILES

### Triggers que Afectan Perfiles

| Trigger | Impacto en Perfil |
|---------|------------------|
| @TRIGGER_COHERENCIA | Todo perfil tecnico DEBE verificar coherencia DDL↔BE↔FE al completar |
| @TRIGGER_SSOT_SYNC | Todo perfil DEBE verificar inventarios SSOT actualizados post-cambio |
| @TRIGGER_CIERRE | Gate de cierre aplica a TODOS los perfiles (checklist obligatorio) |
| @TRIGGER_INVENTARIOS | Inventarios deben reflejar cambios de codigo |

### Schema de Carga Automatica (@DEF_*)

Los perfiles especializados cargan validaciones canonicas automaticamente:

| Perfil | Validacion | Alias |
|--------|-----------|-------|
| PERFIL-BACKEND-NESTJS | Validacion Backend canonica | @DEF_VAL_BE |
| PERFIL-DATABASE-POSTGRESQL | Validacion DDL canonica | @DEF_VAL_DDL |
| PERFIL-FRONTEND-REACT | Validacion Frontend canonica | @DEF_VAL_FE |

### Checkpoint Protocol (Context Recovery)

Cuando un agente detecta compactacion inminente:

```yaml
recovery_protocol:
  1: "Escribir PROXIMA-ACCION.md con estado actual"
  2: "Incluir: perfil activo, fase CAPVED actual, archivos pendientes"
  3: "Al recuperar: cargar perfil + PROXIMA-ACCION + CONTEXT-MAP"
  referencia: "@SIMCO-CONTEXT-CLEANUP"
```

### Modelo de Tokens por Perfil

| Tipo Perfil | Tokens Estimados | Uso |
|-------------|-----------------|-----|
| Full (canonical) | 800-1,500 | Tarea principal, sesion completa |
| Compact | 200-300 | Subagente, tarea delegada |
| Stub (deprecated) | N/A | Eliminados 2026-02-26 (git history) |

---

## REFERENCIAS

- Aliases completos: `orchestration/referencias/ALIASES.yml`
- Directivas SIMCO: `orchestration/directivas/simco/`
- Templates: `orchestration/templates/`
- Perfiles compactos: `orchestration/agents/perfiles/compact/`
- Protocolo subagente: `orchestration/directivas/simco/SIMCO-SUBAGENTE.md`
- Context Cleanup: `orchestration/directivas/simco/SIMCO-CONTEXT-CLEANUP.md`
- Limpieza Post-Fase: `orchestration/directivas/simco/SIMCO-LIMPIEZA-POST-FASE.md`

---

## PERFILES ELIMINADOS (2026-02-26)

Perfiles deprecated eliminados del repo (recuperables via git history):

| Perfil Eliminado | Reemplazo | Fecha Original |
|---|---|---|
| PERFIL-SECURITY.md | PERFIL-SECURITY-AUDITOR.md | 2026-02-13 |
| PERFIL-QA.md | PERFIL-TESTING.md | 2026-02-13 |
| PERFIL-DOCUMENTATION.md | PERFIL-DOCUMENTATION-VALIDATOR.md | 2026-02-13 |
| PERFIL-ML.md | N/A (no aplica a gamilit) | 2026-02-12 |
| PERFIL-BACKEND-EXPRESS.md | N/A (gamilit usa NestJS) | 2026-02-12 |
| PERFIL-BACKEND.md (stub) | PERFIL-BACKEND-NESTJS.md | 2026-02-26 |
| PERFIL-DATABASE.md (stub) | PERFIL-DATABASE-POSTGRESQL.md | 2026-02-26 |
| PERFIL-FRONTEND.md (stub) | PERFIL-FRONTEND-REACT.md | 2026-02-26 |
| PERFIL-DB-DEV-WSL.md | N/A (env-specific) | 2026-02-26 |

---

**Version:** 3.0.0 | **Sistema:** NEXUS v4.1 + SIMCO v5.0.0 | **Mantenido por:** Architecture-Analyst
