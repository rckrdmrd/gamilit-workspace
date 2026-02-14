# Overview General - GAMILIT Workspace

**Version:** 2.0.0
**Fecha:** 2026-02-11
**Estado:** Produccion Activa - MVP 98%
**SSOT Metricas:** `orchestration/inventarios/MASTER_INVENTORY.yml` (v7.0.0)

---

## 1. Identidad del Proyecto

**GAMILIT** (Gamificacion Maya para la Lectoescritura en Tecnologia) es un **workspace standalone** que funciona simultaneamente como repositorio de codigo fuente y como sistema de gobernanza para agentes de IA. Nacio como proyecto dentro de `workspace-arch` con gamilit como proyecto de referencia, y ahora opera de manera independiente con gobernanza local completa.

| Aspecto | Valor |
|---------|-------|
| Tipo | STANDALONE (workspace + proyecto) |
| Nivel | 2A (STANDALONE_HEREDERO) |
| Repositorio | `git@github.com:rckrdmrd/gamilit-workspace.git` (MONOREPO) |
| Stack | NestJS 11 + React 19 + PostgreSQL 15 + TypeORM 0.3.x + Socket.IO 4.8+ + Vite 6.x + Redis |
| Produccion | `74.208.126.102` (Backend :3006, Frontend :3005, PM2 fork mode) |
| Gobernanza | Local (SIMCO v4.0.0 + NEXUS v4.1 + SAAD v1.0.0) |

**Naturaleza dual:** Este repositorio contiene tanto el codigo fuente de la plataforma educativa (en `apps/`) como las directivas de orquestacion para agentes de IA (en `orchestration/`), junto con la documentacion del producto (en `docs/`). No hereda codigo de otros proyectos pero si utiliza patrones de referencia (auth, gamificacion, multi-tenancy) y sirve como fuente de referencia para otros proyectos.

---

## 2. Proposito y Vision

### Problema que Resuelve
- Baja comprension lectora en estudiantes K-12
- Falta de engagement en ejercicios de lectura tradicionales
- Necesidad de metricas de progreso academico para maestros y padres

### Propuesta de Valor
Plataforma educativa gamificada que utiliza mecanicas de videojuegos basadas en cultura maya para mejorar comprension lectora. Sistema completo con:
- **5 modulos educativos** progresivos (literal a produccion critica)
- **23 tipos de ejercicios** interactivos
- **4 portales** diferenciados (estudiante, maestro, admin, padres)
- **Gamificacion completa** (XP, rangos maya, logros, economia virtual con ML Coins)
- **Multi-tenancy** con aislamiento por escuela via RLS

### Objetivos Academicos
1. Guiar al estudiante desde comprension literal basica hasta produccion critica
2. Mantener motivacion mediante economia virtual, rangos y logros
3. Proveer metricas de progreso a maestros y padres en tiempo real
4. Adaptar dificultad y contenido segun desempeno individual
5. Integrar elementos de cultura maya como vehiculo tematico

---

## 3. Arquitectura Tecnica

### Stack Tecnologico

| Capa | Tecnologia | Version |
|------|------------|---------|
| Backend | NestJS | 11.x |
| Frontend | React + TypeScript | 19.x |
| Database | PostgreSQL | 15.x |
| ORM | TypeORM | 0.3.x |
| State Management | Zustand | 5.x |
| UI Framework | TailwindCSS | 4.x |
| Real-time | Socket.IO | 4.8+ |
| Build Tool | Vite | 6.x |
| Runtime | Node.js | 20.x |
| Cache | Redis | 7.x |

### Estructura Monorepo

```
gamilit-workspace/
+-- CLAUDE.md                    <- Instrucciones para agentes IA
+-- ecosystem.config.js          <- PM2 config (backend:3006, frontend:3005)
+-- apps/
|   +-- backend/                 <- NestJS 11 (22 modulos, 899 endpoints)
|   +-- frontend/                <- React 19 + Zustand + TailwindCSS
|   +-- database/                <- PostgreSQL 15 DDL (18 schemas, 169 tablas)
|   +-- devops/                  <- Scripts de deployment
+-- docs/                        <- Documentacion del producto (11 secciones)
+-- orchestration/               <- Gobernanza SIMCO (directivas, agentes, inventarios)
```

### Puertos y Credenciales

| Servicio | Puerto | Detalle |
|----------|--------|---------|
| Frontend Web | 3005 | Vite dev / Nginx prod |
| Backend API | 3006 | NestJS / PM2 prod |
| PostgreSQL | 5432 | BD: gamilit_platform, User: gamilit_user |
| Redis | 6379 | DB 0 |

### Ambientes

| Aspecto | Dev (Local/WSL) | Prod (74.208.126.102) |
|---------|-----------------|----------------------|
| Backend | http://localhost:3006 | HTTPS via Nginx:443 |
| Frontend | http://localhost:3005 | HTTPS via Nginx:443 |
| SSL | Sin SSL | Nginx + Certbot |
| Deploy | npm run dev | PM2 fork mode |
| Swagger | Habilitado | Deshabilitado |

---

## 4. Modulos del Sistema (22)

### Core Infrastructure (7)

| Modulo | ID | Estado | Descripcion |
|--------|----|--------|-------------|
| auth | GAM-AUTH | 100% | JWT + Passport + RBAC, multi-tenant, OAuth 2.0, 2FA |
| users | GAM-USERS | 100% | User management, perfiles diferenciados por rol |
| tenants | GAM-TENANTS | 100% | Multi-tenancy con RLS (207 policies) |
| core | GAM-CORE | 100% | Utilidades compartidas, base entities, interceptors |
| health | GAM-HEALTH | 100% | Health checks (DB, Redis, memoria, disco) |
| settings | GAM-SETTINGS | 100% | Configuracion global y por tenant, feature flags |
| notifications | GAM-NOTIF | 90% | Email, push, in-app (Socket.IO), SMS, multi-canal |

### Educational Content (5)

| Modulo | ID | Estado | Descripcion |
|--------|----|--------|-------------|
| modules | GAM-MODULES | 95% | 5 modulos educativos con progresion desbloqueable |
| exercises | GAM-EXERCISES | 95% | 23 tipos de ejercicio, motor modular, spaced repetition |
| content | GAM-CONTENT | 95% | CRUD lecturas, versionado, global vs local |
| classrooms | GAM-CLASS | 90% | Gestion de aulas, asignacion estudiantes/maestros |
| students | GAM-STUDENTS | 90% | Perfiles academicos, tracking de progreso |

### Gamification System (6)

| Modulo | ID | Estado | Descripcion |
|--------|----|--------|-------------|
| gamification | GAM-GAME | 95% | XP, rangos maya, event bus, progression engine |
| leaderboard | GAM-LEAD | 85% | Rankings multi-nivel, temporadas, Socket.IO real-time |
| missions | GAM-MISS | 85% | Misiones diarias (3/dia), semanales (5/semana), quests |
| store | GAM-SHOP | 75% | Tienda virtual ML Coins, power-ups, items |
| achievements | GAM-ACH | 90% | Logros, insignias, milestones, logros secretos |
| social | GAM-SOCIAL | 50% | Equipos, guilds, retos (DDL completo, logica parcial) |

### Support & Operations (4)

| Modulo | ID | Estado | Descripcion |
|--------|----|--------|-------------|
| teachers | GAM-TEACHERS | 95% | Dashboard, asignacion ejercicios, revision manual |
| parents | GAM-PARENTS | 100% | Vinculacion padre-hijo, dashboard, notificaciones |
| analytics | GAM-ANALYTICS | 85% | Learning analytics, metricas engagement, 7 MVs |
| reports | GAM-REP | 75% | Reportes progreso, exportacion PDF/Excel |

---

## 5. Modulos Educativos y Ejercicios (23 tipos)

### Modulo 1: Comprension Literal (5 ejercicios)
Nivel basico: identificar, recordar, ubicar informacion explicita.

| # | Ejercicio | Evaluacion |
|---|-----------|------------|
| 1 | Crucigrama | Automatica |
| 2 | Linea de tiempo | Automatica |
| 3 | Completar espacios | Automatica |
| 4 | Verdadero/Falso | Automatica |
| 5 | Sopa de letras | Automatica |

### Modulo 2: Comprension Inferencial (5 ejercicios)
Nivel intermedio: deducir, predecir, interpretar significados implicitos.

| # | Ejercicio | Evaluacion |
|---|-----------|------------|
| 6 | Detective textual | Automatica |
| 7 | Construccion de hipotesis | Automatica |
| 8 | Prediccion narrativa | Automatica |
| 9 | Puzzle de contexto | Automatica |
| 10 | Rueda de inferencias | Automatica |

### Modulo 3: Comprension Critica y Valorativa (5 ejercicios)
Nivel avanzado: evaluar, argumentar, opinar con fundamento.

| # | Ejercicio | Evaluacion |
|---|-----------|------------|
| 11 | Tribunal de opiniones | Manual (maestro) |
| 12 | Debate digital | Manual (maestro) |
| 13 | Analisis de fuentes | Manual (maestro) |
| 14 | Podcast argumentativo | Manual (maestro) |
| 15 | Matriz de perspectivas | Manual (maestro) |

### Modulo 4: Lectura Digital y Multimodal (5 ejercicios)
Competencias de lectura en entornos digitales.

| # | Ejercicio | Evaluacion |
|---|-----------|------------|
| 16 | Verificador de fake news | Manual (maestro) |
| 17 | Infografia interactiva | Manual (maestro) |
| 18 | Quiz TikTok | Automatica |
| 19 | Navegacion hipertextual | Manual (maestro) |
| 20 | Analisis de memes | Manual (maestro) |

### Modulo 5: Produccion y Expresion Lectora (3 ejercicios)
Nivel productivo: crear, expresar, comunicar (estudiante elige 1 de 3).

| # | Ejercicio | Evaluacion |
|---|-----------|------------|
| 21 | Diario multimedia | Manual (maestro) |
| 22 | Comic digital | Manual (maestro) |
| 23 | Video carta | Manual (maestro) |

---

## 6. Portales

### Portal Estudiante (~100%)
- Dashboard personal con progreso y estadisticas
- Acceso a 5 modulos educativos con 23 tipos de ejercicios
- Sistema de gamificacion: XP, rangos maya, logros, tienda virtual
- Leaderboards (aula, escuela, global)
- Componente social: equipos, retos
- Historial de actividades y ejercicios completados

### Portal Maestro (~95%)
- Gestion de aulas y estudiantes (19 paginas)
- Asignacion de ejercicios y lecturas
- Reportes de progreso individual y grupal
- Revision manual de ejercicios (M3, M4, M5)
- Comunicacion directa con padres
- Dashboard con alertas e intervenciones

### Portal Administrador (~90%)
- Gestion de contenido educativo (18 paginas)
- Configuracion global del sistema
- Analytics de engagement y uso
- Gestion de usuarios, roles y permisos
- Auditoria de actividades
- Gestion de escuelas y tenants

### Portal Padres (100%)
- Vinculacion padre-estudiante (codigo)
- Dashboard de progreso academico
- Notificaciones automaticas (email, push, SMS)
- Comunicacion maestro-padre
- Reportes descargables

---

## 7. Sistema de Gamificacion - Cultura Maya

### Rangos Jerarquicos Maya (5 Niveles — DB Seeds v2.1)

| Nivel | Rango | Titulo Maya | XP Min | XP Max | ML Bonus | Multiplicador |
|-------|-------|-------------|--------|--------|----------|---------------|
| 1 | Senor | Ajaw (Senor) | 0 | 499 | - | 1.00x |
| 2 | Capitan de Guerra | Nacom (Capitan de Guerra) | 500 | 999 | +100 ML | 1.10x |
| 3 | Sacerdote del Sol | Ah K'in (Sacerdote del Sol) | 1,000 | 1,499 | +250 ML | 1.15x |
| 4 | Hombre Verdadero | Halach Uinic (Hombre Verdadero) | 1,500 | 1,899 | +500 ML | 1.20x |
| 5 | Serpiente Emplumada | K'uk'ulkan (Serpiente Emplumada) | 1,900 | - | +1,000 ML | 1.25x |

### Economia Virtual (ML Coins)
- **Moneda:** ML Coins (Maya Literacy Coins)
- **Fuentes:** Ejercicios completados, misiones, logros, rachas, login diario
- **Tienda:** Avatares tematicos maya, fondos de perfil, power-ups, efectos visuales
- **Power-ups:** Pista (15 coins), Vision Lectora (25 coins), Segunda Oportunidad (40 coins)
- **Multiplicadores:** Earnings multiplicados por rango actual (1.00x a 1.25x)

### Misiones
- **Diarias:** 3 misiones/dia (rotacion automatica)
- **Semanales:** 5 misiones/semana
- **Quests:** Cadenas tematicas (cultura maya, eventos)

### Leaderboards
- Rankings: por aula, escuela, global, por modulo
- Temporadas con reset y recompensas de cierre
- Actualizacion en tiempo real (Socket.IO)

---

## 8. Metricas Actuales (SSOT: MASTER_INVENTORY v7.0.0)

### Base de Datos

| Metrica | Valor |
|---------|-------|
| Schemas | 18 (16 activos + 2 placeholder) |
| Tablas | 169 |
| Views | 22 |
| Materialized Views | 7 |
| Funciones | 183 (DDL) |
| Triggers | 67 |
| Politicas RLS | 207 |
| Foreign Keys | 298 |
| ENUMs | 40 |

### Backend

| Metrica | Valor |
|---------|-------|
| Modulos | 22 |
| Entities | 152 |
| DTOs | 399 |
| Services | 170 |
| Controllers | 107 |
| Endpoints | 899 |
| Guards | 15 |
| Decorators | 18 |
| Tests Backend | 620 |

### Frontend

| Metrica | Valor |
|---------|-------|
| Componentes | 475 |
| Hooks | 102 |
| Paginas | 68 |
| Stores Zustand | 14 |
| API Services | 52 |
| Portales | 4 |
| Mecanicas | 30 |
| Routes | 72 |
| Tests Frontend | 213 |

### Calidad

| Metrica | Valor |
|---------|-------|
| Tests Total | 833 passing |
| Coherencia DDL-Backend | 89% |
| Cobertura Target | 80% |

---

## 9. Sistema de Gobernanza (SIMCO + NEXUS)

### SIMCO v4.0.0 - Sistema Integral de Mando y Control

SIMCO es el sistema de directivas que gobierna como los agentes de IA operan sobre el codebase. Incluye:

**Ciclo CAPVED** (metodologia por defecto para toda tarea):
1. **C**ontexto - Cargar contexto relevante
2. **A**nalisis - Analizar dependencias y estado actual
3. **P**lanificacion - Planificar cambios
4. **V**alidacion - Validar build/lint/tests
5. **E**jecucion - Ejecutar cambios
6. **D**ocumentacion - Documentar cambios realizados

**Modos de ejecucion:**

| Modo | Fases | Uso |
|------|-------|-----|
| FULL | CAPVED completo | Features, bugs, refactor, BD |
| QUICK | E+D | Typos, fixes menores |
| ANALYSIS | C+A+P | Investigacion, auditoria |

### Directivas (~110 archivos)

| Categoria | Cantidad | Ubicacion | Descripcion |
|-----------|----------|-----------|-------------|
| SIMCO | 78 | `orchestration/directivas/simco/` | Procedimientos operativos por dominio y operacion |
| Principios | 15 | `orchestration/directivas/principios/` | Principios fundamentales (CAPVED, DRY, SOLID, KISS, etc.) |
| Triggers | 11 | `orchestration/directivas/triggers/` | Verificaciones automaticas pre/post tarea |
| Modos | 3 | `orchestration/directivas/modos/` | FULL, QUICK, ANALYSIS |
| Politicas | 2 | `orchestration/directivas/politicas/` | SSOT, env compartido |

**Directivas SIMCO clave:**
- SIMCO-DDL / SIMCO-DDL-UNIFIED: Operaciones de base de datos
- SIMCO-BACKEND: Desarrollo NestJS
- SIMCO-FRONTEND: Desarrollo React
- SIMCO-CREAR / SIMCO-MODIFICAR: Creacion y modificacion de artefactos
- SIMCO-DELEGACION / SIMCO-DELEGACION-PARALELA: Delegacion a subagentes
- SIMCO-CONTEXT-MANAGEMENT-V2: Gestion de contexto NEXUS
- SIMCO-DEPLOY-PRODUCTION: Procedimiento de deployment

**Triggers activos:**
- TRIGGER-FETCH-OBLIGATORIO: `git fetch` antes de operar
- TRIGGER-ANTI-DUPLICACION: Verificar catalogos antes de crear
- TRIGGER-COHERENCIA-CAPAS: DDL -> Backend -> Frontend coherentes
- TRIGGER-INVENTARIOS-SINCRONIZADOS: Inventarios actualizados post-cambio
- TRIGGER-COMMIT-PUSH-OBLIGATORIO: Commit+push despues de cambios
- TRIGGER-DOCUMENTACION-OBLIGATORIA: Documentar todos los cambios
- TRIGGER-DDL-RECREAR-BD-WSL: Recrear BD en WSL despues de cambios DDL
- TRIGGER-CIERRE-TAREA-OBLIGATORIO: Cerrar trazas al finalizar

### Perfiles de Agente (35)

| Categoria | Perfiles | Descripcion |
|-----------|----------|-------------|
| Orquestacion | Orquestador, Tech Leader | Coordinacion y decision |
| Backend | Backend, Backend-NestJS, Backend-Express | Desarrollo servidor |
| Frontend | Frontend, Frontend-React | Desarrollo cliente |
| Database | Database, Database-PostgreSQL, Database-Auditor | Base de datos |
| QA/Testing | QA, Testing, Integration-Validator | Calidad |
| DevOps | DevOps, CICD-Specialist, Deploy-Server, DevEnv | Infraestructura |
| Security | Security, Security-Auditor, Secrets-Manager, Policy-Auditor | Seguridad |
| Docs | Documentation, Doc-Maintainer, Doc-Validator | Documentacion |
| Especialistas | Gamification-Specialist, ML, Requirements-Analyst, Architecture-Analyst | Dominio |
| Operaciones | Code-Reviewer, Bug-Fixer, Production-Manager, Monitoring-Agent, LLM-Agent | Operaciones |

Cada perfil define: herramientas permitidas, dominio de responsabilidad, directivas aplicables y nivel de autonomia. Ver: `orchestration/agents/perfiles/_MAP.md`

### NEXUS v4.1 - Gestion de Contexto

Sistema de 4 niveles para gestionar eficientemente la ventana de contexto de los modelos de IA:

| Nivel | Nombre | Tokens | Contenido |
|-------|--------|--------|-----------|
| L0 | Sistema | 8,000 | CLAUDE.md, principios, perfil agente |
| L1 | Proyecto | 5,000 | PROJECT-CONTEXT, PROXIMA-ACCION, MASTER_INVENTORY |
| L2 | Operacion | 4,000 | SIMCO del dominio + inventario del dominio |
| L3 | Tarea | 3,000 | Archivos especificos de la tarea actual |

**Total base:** 20,000 tokens | **Disponible para tarea:** ~130,000 tokens (Claude 200K)

**Cleanup mid-session:** Clasificacion automatica de archivos en ACTIVE/REFERENCE/STALE con purga progresiva al alcanzar 50%+ de ventana usada.

### SAAD v1.0.0 - Activacion Automatica de Directivas

Sistema que activa automaticamente las directivas SIMCO relevantes segun el tipo de tarea detectada, sin necesidad de invocacion manual.

---

## 10. Requerimientos

### Requerimientos Funcionales (RF)

| RF | Titulo | Descripcion |
|----|--------|-------------|
| RF-01 | Autenticacion | JWT, OAuth 2.0, 4 roles, refresh tokens, 2FA |
| RF-02 | Multi-tenancy | RLS por escuela, datos compartidos vs aislados |
| RF-03 | Contenido | CRUD lecturas/ejercicios, 23 tipos, versionado |
| RF-04 | Ejercicios | Motor modular, evaluacion auto/manual, spaced repetition |
| RF-05 | Gamificacion | XP, rangos maya, logros, ML Coins, misiones, leaderboards |
| RF-06 | Analytics | Tracking progreso, metricas engagement, reportes |
| RF-07 | Notificaciones | In-app, email, push, SMS, preferencias por canal |
| RF-08 | Real-time | Leaderboards, notificaciones, XP via Socket.IO |

### Requerimientos No Funcionales (RNF)

| RNF | Titulo | Target |
|-----|--------|--------|
| RNF-01 | Performance | API < 200ms (P95), render < 1.5s |
| RNF-02 | Seguridad | RLS, JWT 15min, rate limiting 100req/min |
| RNF-03 | Escalabilidad | Multi-tenancy horizontal, Redis cache |
| RNF-04 | Disponibilidad | 99.5% uptime, health checks |
| RNF-05 | Usabilidad | Mobile-first, responsive, accesibilidad WCAG 2.1 AA |
| RNF-06 | Mantenibilidad | 22 modulos independientes, tests >= 80% |

### EPICs (34 completados)

| EPIC | Titulo | SP | Estado |
|------|--------|----|--------|
| EPIC-GAM-SCAFFOLD | Scaffolding Gamilit | 5 | COMPLETADO |
| EPIC-GAM-REQUIREMENTS | Requerimientos Gamilit | 13 | COMPLETADO |
| EPIC-GAM-ARCHITECTURE | Arquitectura Gamificacion | 13 | COMPLETADO |
| EPIC-GAM-DATABASE | Esquema BD Gamilit | 21 | COMPLETADO |
| EPIC-GAM-BACKEND | Backend Gamilit | 34 | COMPLETADO |
| EPIC-GAM-FRONTEND | Frontend Gamilit | 34 | COMPLETADO |
| EPIC-GAM-INTEGRATION | Integracion Gamilit | 5 | COMPLETADO |
| EPIC-GAM-K8S | Kubernetes Gamilit | 8 | EN PROGRESO |
| EPIC-GAM-TESTING | Tests Gamilit | 13 | EN PROGRESO |
| EPIC-GAM-DEVOPS | DevOps Gamilit | 8 | EN PROGRESO |
| EPIC-GAM-DOCS | Documentacion Gamilit | 8 | EN PROGRESO |

**Total:** 162 Story Points | **User Stories:** 15 L3 (83 SP)

### ADRs (34 decisiones arquitectonicas)

Decisiones documentadas en `docs/90-adr/`:
- ADR-001: Gamificacion con cultura maya
- ADR-002: Socket.IO para real-time
- ADR-003: RLS multi-tenancy
- ADR-004: Exercise engine modular (23 tipos)
- ADR-0001: Monorepo architecture
- ADR-0002: Sistema SIMCO
- ADR-033: Expansion schemas 8 a 18
- ... y 27 ADRs adicionales

---

## 11. Estructura de Documentacion

### docs/ (Documentacion del Producto)

| Seccion | Contenido |
|---------|-----------|
| `00-overview/` | **Este directorio** - Vision, modulos, testing, devops, onboarding, glosario |
| `10-requirements/` | EPICs (13 con estructura jerarquica), User Stories L3 (15), testing guides |
| `20-architecture/` | Stack tecnologico, modelo datos, gamificacion, coherencia DDL-Backend |
| `30-ux-ui/` | Wireframes, mockups, flujos de usuario |
| `40-api/` | API Reference, endpoints admin portal, web push migration |
| `40-standards/` | Estandares de nomenclatura API, guias por dominio (frontend, backend, testing) |
| `70-onboarding/` | Guias de setup para nuevos desarrolladores |
| `80-references/` | Material transversal de referencia |
| `90-adr/` | 34 Architecture Decision Records |
| `99-delivery/` | Entregas y entregables |

### orchestration/ (Gobernanza SIMCO)

| Seccion | Contenido |
|---------|-----------|
| `_INDEX.yml` | Indice maestro de orquestacion |
| `_inheritance.yml` | Declaracion de herencia STANDALONE |
| `PROJECT-CONTEXT.md` | Contexto NEXUS L1 del proyecto |
| `CONTEXT-MAP.yml` | Variables, aliases, contexto por nivel |
| `PROXIMA-ACCION.md` | Estado actual, historial de tareas, proximos pasos |
| `directivas/` | ~110 archivos: SIMCO, principios, triggers, modos, politicas |
| `agents/perfiles/` | 35 perfiles de agente + perfiles compactos |
| `inventarios/` | 4 inventarios YAML: MASTER, DATABASE, BACKEND, FRONTEND |
| `work-items/` | EPICs, sprints, releases |
| `trazas/` | Logs de ejecucion por dominio |
| `tareas/` | Carpetas de tareas ejecutadas con metadata |
| `scrum/` | Backlog, sprint actual |
| `templates/` | Templates reutilizables |
| `referencias/` | Aliases, prompts, matrices de referencia |

---

## 12. Estado Actual y Features

### Completado (98%)
- 22 modulos backend operativos (899 endpoints)
- 5 modulos educativos con 23 tipos de ejercicios
- 4 portales diferenciados y funcionales
- Sistema completo de gamificacion maya
- 833 tests pasando
- Produccion activa con usuarios reales
- 18 schemas con 207 politicas RLS
- Sistema de gobernanza SIMCO completo con 110+ directivas

### Features Parciales
- **social (50%):** DDL+entities completos, logica de negocio parcial
- **team-vs-team:** DDL listo, sin logica de negocio completa
- **boosts:** DDL+entity, pivoteado a comodines
- **forum:** DDL+entities sin registrar en module

### Pendiente (Post-MVP)
- Cobertura tests target 80% (actualmente ~75% backend, ~65% frontend)
- E2E testing completo
- Kubernetes deployment
- Optimizacion Materialized Views

---

## 13. Comandos de Validacion

```bash
# Backend
cd apps/backend && npm run build && npm run lint && npm run test

# Frontend
cd apps/frontend && npm run build && npm run lint && npm run typecheck

# Database (recrear desde DDL)
bash apps/database/scripts/recreate-database.sh

# Git (Monorepo)
git add . && git commit -m "[GAM-XXX] desc" && git push origin master
```

---

## 14. Documentos en Esta Seccion

| Documento | Descripcion | Estado |
|-----------|-------------|--------|
| [VISION-ALCANCE.md](VISION-ALCANCE.md) | Vision, objetivos, alcance MVP, RF y RNF | Actualizado (2026-02-07) |
| [MODULOS.md](MODULOS.md) | 22 modulos detallados con metricas | Actualizado (2026-02-07) |
| [TESTING-STRATEGY.md](TESTING-STRATEGY.md) | 833 tests, piramide, cobertura | Actualizado (2026-02-07) |
| [DEVOPS.md](DEVOPS.md) | Docker, WSL, deployment, Kubernetes | Actualizado (2026-02-07) |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Guia de deployment a produccion | Referencia |
| [ONBOARDING.md](ONBOARDING.md) | Redirect a guias por rol en `docs/70-onboarding/` | Redirect |
| [GLOSARIO.md](GLOSARIO.md) | Terminologia (gamificacion, educacion, tecnico) | Requiere actualizacion |
| [REPORTE-INTEGRAL-2026-01-20.md](REPORTE-INTEGRAL-2026-01-20.md) | Reporte integral de estado | Referencia historica |
| [DATOS-GAMIFICACION.md](../20-architecture/DATOS-GAMIFICACION.md) | Estructuras de datos gamificacion (canonical en 20-architecture) | Referencia |
| [MECANICAS-GAMIFICACION-V6.md](../20-architecture/MECANICAS-GAMIFICACION-V6.md) | Documento de diseno de mecanicas (canonical en 20-architecture) | Referencia |

---

## 15. Aliases de Invocacion Rapida

| Alias | Ruta |
|-------|------|
| @BACKEND | apps/backend/src/modules/ |
| @FRONTEND | apps/frontend/src/ |
| @DDL | apps/database/ddl/ |
| @SEEDS | apps/database/seeds/ |
| @DOCS | docs/ |
| @INVENTORY | orchestration/inventarios/ |
| @SIMCO | orchestration/directivas/simco/ |
| @PRINCIPIOS | orchestration/directivas/principios/ |
| @TRIGGERS | orchestration/directivas/triggers/ |
| @PERFILES | orchestration/agents/perfiles/ |
| @PROJECT-CTX | orchestration/PROJECT-CONTEXT.md |
| @PROXIMA-ACCION | orchestration/PROXIMA-ACCION.md |
| @ESTANDARES | docs/40-standards/ |
| @ADRS | docs/90-adr/ |

---

*GAMILIT - Gamificacion Maya para la Lectoescritura en Tecnologia*
*Plataforma Educativa - Produccion Activa - MVP 98%*
*SSOT: orchestration/inventarios/MASTER_INVENTORY.yml (v7.0.0)*
