# PROJECT-CONTEXT - GAMILIT

**Sistema:** NEXUS v4.1 (L1 Context) | **Version:** 4.1.1 | **Fecha:** 2026-02-27

---

## IDENTIDAD DEL PROYECTO

**Nombre:** GAMILIT (Gamificacion Maya para la Lectoescritura en Tecnologia)
**Tipo:** STANDALONE
**Estado:** Produccion Activa - MVP 98% Completado
**Wave:** 3
**Prioridad:** P1

---

## NEXUS L1 - CONTEXTO ESENCIAL

### Dominio de Negocio

**Sector:** EdTech (Tecnologia Educativa)
**Vertical:** Educacion K-12 (comprension lectora)
**Sub-dominio:** Gamificacion educativa con cultura maya

**Problema que resuelve:**
- Baja comprension lectora en estudiantes
- Falta de engagement en ejercicios de lectura tradicionales
- Necesidad de metricas de progreso academico para maestros y padres

**Propuesta de valor:**
- Sistema gamificado completo (XP, rangos maya, logros, economia virtual)
- 23 tipos de ejercicios interactivos en 5 modulos progresivos
- 4 portales diferenciados (estudiante, maestro, admin, padres)
- Analytics y reportes de progreso academico

### Usuarios Principales

| Rol | Portal | Funcionalidades Clave |
|-----|--------|----------------------|
| Estudiante | Portal Estudiante | Ejercicios, gamificacion, leaderboards |
| Maestro | Portal Maestro | Gestion aulas, asignacion, reportes |
| Administrador | Portal Admin | Gestion contenido, configuracion, analytics |
| Padre/Tutor | Portal Padres | Seguimiento progreso, notificaciones |

---

## ARQUITECTURA TECNICA

### Stack Tecnologico

| Capa | Tecnologia | Version |
|------|------------|---------|
| Backend | NestJS | 11.x |
| Frontend | React | 19.x |
| Database | PostgreSQL | 15.x |
| ORM | TypeORM | 0.3.x |
| State Management | Zustand | 5.x |
| UI Framework | TailwindCSS | 4.x |
| Real-time | Socket.IO | 4.8+ |
| Build Tool | Vite | 6.x |
| Runtime | Node.js | 20.x |

### Tipo de Repositorio

**MONOREPO** (Single Git Repository)
- apps/backend (NestJS)
- apps/frontend (React)
- apps/database (PostgreSQL DDL)
- apps/devops (Deployment)

**Remote:** git@github.com:rckrdmrd/gamilit-workspace.git
**Branch:** master

### Puertos

| Servicio | Puerto |
|----------|--------|
| Frontend Web | 3005 |
| Backend API | 3006 |
| PostgreSQL | 5432 |
| Redis | 6379 (DB 0) |

### Base de Datos

| Campo | Valor |
|-------|-------|
| Nombre BD | gamilit_platform |
| Usuario | gamilit_user |
| Password | gamilit_dev_2026 |
| Puerto | 5432 |
| Redis DB | 0 |
| Schemas | 18 (16 activos + 2 placeholder) |

---

## MODULOS DEL SISTEMA (23)

### Core Infrastructure (7)
auth, users, tenants, core, health, settings, notifications

### Educational Content (5)
modules, exercises, content, classrooms, students

### Gamification System (7)
gamification, leaderboard, missions, store, achievements, social, mail

### Support & Operations (4)
teachers, parents, analytics, reports

---

## MODULOS EDUCATIVOS (5)

1. **Comprension Literal:** Crucigrama, linea de tiempo, completar espacios, V/F, sopa de letras
2. **Comprension Inferencial:** Detective, hipotesis, prediccion, puzzle contexto, rueda inferencias
3. **Comprension Critica:** Tribunal, debate, analisis fuentes, podcast, matriz perspectivas
4. **Lectura Digital:** Fake news, infografia, quiz TikTok, hipertextual, memes
5. **Produccion y Expresion:** Diario multimedia, comic digital, video carta

---

## METRICAS ACTUALES

**Fuente:** orchestration/inventarios/MASTER_INVENTORY.yml (v14.5.0)

### Base de Datos
18 schemas | 173 tablas | 18 views | 7 MVs | 158 funciones (DDL) | 68 triggers | 251 RLS policies | 42 ENUMs

### Backend
23 modulos | 156 files (157 classes) | 401 DTOs | 172 services | 108 controllers | 912 endpoints | 15 guards | 18 decorators

### Frontend
575 componentes | 132 hooks | 72 paginas | 74 routes | 13 stores | 65 API services | 4 portales | 30 mecanicas

### Testing
2324 tests (2296 passed + 28 skipped, 63 spec files) | Target 80% cobertura | Coherencia DDL-Backend: 90.2%

### Documentacion
Health Score: ~98/100 (era 85/100, remediacion completada 2026-02-27) | API coverage: ~69% (631/912 endpoints) | Frontmatter: >90% | Standards: 35 archivos (post-split)

---

## HERENCIA Y RELACIONES

**Tipo:** STANDALONE
- NO hereda codigo de otros proyectos
- Gobernanza local completa (directivas, agentes, inventarios)
- NO propaga codigo a otros proyectos

---

## COMANDOS FRECUENTES

```bash
# Backend
cd apps/backend && npm run build && npm run lint && npm run test

# Frontend
cd apps/frontend && npm run build && npm run lint && npm run typecheck

# Database
bash apps/database/scripts/recreate-database.sh

# Git (Monorepo)
git add . && git commit -m "[GAM-XXX] desc" && git push origin master
```

---

## ALIASES CONTEXTUALES

| Alias | Ruta |
|-------|------|
| @BACKEND | apps/backend/src/modules/ |
| @FRONTEND | apps/frontend/src/ |
| @DDL | apps/database/ddl/ |
| @INVENTORY | orchestration/inventarios/ |
| @DOCS-LOCAL | docs/ |
| @DOCS | docs/ |
| @ORCHESTRATION | orchestration/ |
| @ESTANDARES | docs/40-standards/ |

---

*Sistema NEXUS v4.1 - Context Management L1*
*SSOT: orchestration/inventarios/MASTER_INVENTORY.yml*
*Ultima actividad: 2026-02-27 — Doc Health Remediation 85->98/100 completada*
