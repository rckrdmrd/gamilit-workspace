# 📖 Quick Reference - GAMILIT Platform

**Carpeta:** `docs/QUICK-REFERENCE/`
**Propósito:** Cheatsheets y guías rápidas para desarrolladores
**Última actualización:** 2025-11-07

---

## 🎯 ¿Qué encontrarás aquí?

Esta carpeta contiene **guías de referencia rápida** (cheatsheets) para tareas comunes de desarrollo en GAMILIT Platform.

**Audiencia:**
- Desarrolladores (todos los niveles)
- Tech Leads
- DevOps Engineers
- Cualquier persona que necesite referencias rápidas durante desarrollo

**Diferencia con docs/03-desarrollo/:**
- **QUICK-REFERENCE/:** Cheatsheets concisos, ejemplos prácticos, formato de referencia rápida
- **03-desarrollo/:** Guías completas, explicaciones detalladas, tutoriales paso a paso

---

## 📚 Cheatsheets Disponibles

### ✅ Cheatsheets Completados

#### [API-CHEATSHEET.md](./API-CHEATSHEET.md)
**Audiencia:** Backend y Frontend developers
**Tiempo de lectura:** 10-15 minutos
**Última actualización:** 2025-11-07

**Qué contiene:**
- **177+ endpoints** organizados por módulo
- Códigos de estado HTTP y rate limits
- **Authentication:** Login, register, sessions, password reset
- **Educational:** Módulos, ejercicios, submit attempts
- **Gamification:** Stats, ML Coins, achievements, ranking
- **Progress:** Student progress, analytics, sessions
- **Social:** Schools, classrooms, friends, teams
- **Teacher:** Classroom management, assignments, grading
- **Notifications:** List, mark as read, send
- **Admin:** User management, system stats
- **Health:** Health checks, DB status
- **Ejemplos con curl** para cada endpoint
- Tips de debugging (verbose, jq, file upload)
- Ejemplos completos (login → use token → submit exercise)

**Cuándo usarlo:**
- Necesitas llamar a un endpoint específico
- Quieres ver ejemplos de requests/responses
- Estás integrando frontend con backend
- Debugging de API calls
- Escribiendo tests de integración

---

#### [DB-CHEATSHEET.md](./DB-CHEATSHEET.md)
**Audiencia:** Backend developers, DBAs, Tech Leads
**Tiempo de lectura:** 10-15 minutos
**Última actualización:** 2025-11-07

**Qué contiene:**
- **11 schemas, 44 tablas** con propósito de cada uno
- Conexión rápida con psql
- **Comandos útiles de psql** (\dt, \d, \df, \di)
- **Queries comunes** organizados por caso de uso:
  - Authentication (buscar usuario, sesiones activas, login attempts)
  - Gamification (stats, ML Coins balance, ranking, achievements)
  - Progress (módulos completados, ejercicios, analytics)
  - Teacher Dashboard (aulas, estudiantes, bajo rendimiento)
  - Analytics (actividad diaria, retención, conversión)
- **Relaciones principales** (User → Stats → Progress)
- **Funciones útiles** (now_mexico(), update_updated_at())
- **Índices y performance** (ver índices, uso, queries lentas)
- **RLS Policies** (verificar políticas, ejemplos)
- **Mantenimiento** (VACUUM, tamaño de tablas, locks)
- **Backups** (pg_dump, pg_restore)
- **Tips y best practices** (tenant_id, prepared statements, EXPLAIN, transactions)

**Cuándo usarlo:**
- Necesitas escribir una query específica
- Debugging de problemas de datos
- Optimización de queries lentas
- Checking de índices y performance
- Análisis de datos y reporting
- Backup/restore operations

---

#### [_MAP.md](./_MAP.md)
**Audiencia:** Agentes IA, Tech Leads
**Tiempo de lectura:** 3 minutos
**Última actualización:** 2025-11-07

**Qué contiene:**
- Mapa de navegación de esta carpeta
- Archivos planeados vs completados
- Próximos pasos y roadmap

---

### ⏳ Cheatsheets Planeados

Los siguientes cheatsheets están planeados pero aún no creados:

#### GIT-CHEATSHEET.md (Pendiente)
**Audiencia:** Todos los developers
**Prioridad:** P1 (Alta)
**Esfuerzo estimado:** 2-3 horas
**Líneas estimadas:** 200-250

**Contenido planeado:**
- Comandos básicos (clone, add, commit, push, pull)
- Branching strategy (feature, fix, hotfix)
- Merge y rebase
- Resolver conflictos
- Git hooks (pre-commit, pre-push)
- Conventional commits
- Undo changes (reset, revert, checkout)
- Stashing
- Cherry-pick
- Bisect para debugging
- Submodules
- Git tags y releases

**Cuándo será útil:**
- Quick reference para comandos Git comunes
- Resolver conflictos de merge
- Aplicar Git workflow del proyecto
- Debugging con git bisect

---

#### TESTING-CHEATSHEET.md (Pendiente)
**Audiencia:** Developers escribiendo tests
**Prioridad:** P1 (Alta)
**Esfuerzo estimado:** 2-3 horas
**Líneas estimadas:** 200-250

**Contenido planeado:**
- **Backend testing (Jest):**
  - Unit tests (servicios, funciones)
  - Integration tests (endpoints completos)
  - Mocking (databases, external APIs)
  - Test fixtures y factories
  - Test coverage commands
- **Frontend testing (Vitest + Testing Library):**
  - Component tests
  - Hook tests
  - User interaction testing
  - Mock de API calls
  - Snapshot testing
- **E2E testing (Playwright/Cypress):**
  - Setup básico
  - Tests de flujos completos
  - Page Object Model
- **Test patterns y best practices**
- **CI/CD integration**

**Cuándo será útil:**
- Escribiendo nuevos tests
- Debugging de tests fallidos
- Mejorar test coverage
- Setting up CI/CD

---

#### DOCKER-CHEATSHEET.md (Pendiente)
**Audiencia:** DevOps, Backend developers
**Prioridad:** P2 (Media)
**Esfuerzo estimado:** 1-2 horas
**Líneas estimadas:** 150-200

**Contenido planeado:**
- Docker compose para desarrollo local
- Comandos básicos (build, run, stop, logs)
- Docker networks
- Volumes y persistencia
- Multi-stage builds
- Docker debugging
- Optimización de imágenes

---

#### DEPLOYMENT-CHEATSHEET.md (Pendiente)
**Audiencia:** DevOps
**Prioridad:** P2 (Media)
**Esfuerzo estimado:** 2-3 horas
**Líneas estimadas:** 200-250

**Contenido planeado:**
- PM2 commands y ecosystem.config.js
- Nginx configuration
- SSL/TLS setup
- Environment variables
- Database migrations en producción
- Rollback procedures
- Monitoring y logs
- Health checks

---

## 🗺️ Navegación Rápida

### Por Caso de Uso

**Necesito llamar a un endpoint del backend:**
→ [API-CHEATSHEET.md](./API-CHEATSHEET.md) → Busca el módulo (Auth, Educational, etc.) → Copia ejemplo curl

**Necesito escribir una query SQL:**
→ [DB-CHEATSHEET.md](./DB-CHEATSHEET.md) → Busca caso de uso (Authentication, Gamification, etc.) → Copia query

**Necesito comando Git específico:**
→ ⏳ GIT-CHEATSHEET.md (pendiente) → Mientras tanto: [docs/standards/GIT-WORKFLOW.md](../standards/GIT-WORKFLOW.md)

**Necesito escribir un test:**
→ ⏳ TESTING-CHEATSHEET.md (pendiente) → Mientras tanto: [docs/03-desarrollo/TESTING-GUIDE.md](../03-desarrollo/TESTING-GUIDE.md)

**Necesito setup de Docker:**
→ ⏳ DOCKER-CHEATSHEET.md (pendiente) → Mientras tanto: [docs/00-overview/ONBOARDING.md](../00-overview/ONBOARDING.md)

---

### Por Tecnología

**PostgreSQL:**
→ [DB-CHEATSHEET.md](./DB-CHEATSHEET.md)

**REST API (Express/NestJS):**
→ [API-CHEATSHEET.md](./API-CHEATSHEET.md)

**Git:**
→ ⏳ GIT-CHEATSHEET.md (pendiente)

**Jest/Vitest:**
→ ⏳ TESTING-CHEATSHEET.md (pendiente)

**Docker:**
→ ⏳ DOCKER-CHEATSHEET.md (pendiente)

---

## 🔍 Búsqueda Rápida

### API Endpoints

```bash
# Buscar endpoint específico en API-CHEATSHEET.md
grep -n "POST.*login" API-CHEATSHEET.md
grep -n "gamification" API-CHEATSHEET.md
```

### Database Queries

```bash
# Buscar query específica en DB-CHEATSHEET.md
grep -n "SELECT.*profiles" DB-CHEATSHEET.md
grep -n "ml_coins" DB-CHEATSHEET.md
```

---

## 💡 Tips de Uso

### 1. Keep cheatsheets open en otra ventana

Mientras desarrollas, mantén el cheatsheet relevante abierto en:
- Otra ventana de terminal
- Otro monitor
- Split screen en tu editor
- Browser tab

### 2. Usa Ctrl+F / Command+F para búsqueda rápida

Los cheatsheets están diseñados para búsqueda con Ctrl+F:
```
Ctrl+F "POST /login"
Ctrl+F "ml_coins balance"
Ctrl+F "EXPLAIN"
```

### 3. Copia y adapta ejemplos

Todos los ejemplos son funcionales - solo necesitas:
1. Copiar el comando/query
2. Reemplazar UUIDs/tokens con valores reales
3. Ejecutar

### 4. Alias útiles

Crea alias en tu shell para acceso rápido:

```bash
# En ~/.bashrc o ~/.zshrc
alias api-docs="cat /path/to/docs/QUICK-REFERENCE/API-CHEATSHEET.md | less"
alias db-docs="cat /path/to/docs/QUICK-REFERENCE/DB-CHEATSHEET.md | less"

# Usar
api-docs  # Ver API cheatsheet
db-docs   # Ver DB cheatsheet
```

---

## 🔗 Enlaces Relacionados

### Documentación Completa

**Para más detalles sobre temas en cheatsheets:**
- [docs/03-desarrollo/backend/API-ENDPOINTS.md](../03-desarrollo/backend/API-ENDPOINTS.md) - Documentación completa de API
- [docs/03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md](../03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md) - Esquema completo de DB
- [docs/standards/GIT-WORKFLOW.md](../standards/GIT-WORKFLOW.md) - Git workflow completo
- [docs/03-desarrollo/TESTING-GUIDE.md](../03-desarrollo/TESTING-GUIDE.md) - Guía de testing

### Otros Quick References

- [README de overview](../00-overview/README.md) - Quick start del proyecto
- [ONBOARDING.md](../00-overview/ONBOARDING.md) - Setup rápido de entorno

---

## 📋 Checklist: ¿Qué cheatsheet necesito?

**Quiero llamar a un endpoint:**
- ✅ [API-CHEATSHEET.md](./API-CHEATSHEET.md)

**Quiero escribir una query SQL:**
- ✅ [DB-CHEATSHEET.md](./DB-CHEATSHEET.md)

**Quiero hacer commit/merge/branch en Git:**
- ⏳ GIT-CHEATSHEET.md (pendiente)
- Mientras tanto: [GIT-WORKFLOW.md](../standards/GIT-WORKFLOW.md)

**Quiero escribir un test:**
- ⏳ TESTING-CHEATSHEET.md (pendiente)
- Mientras tanto: [TESTING-GUIDE.md](../03-desarrollo/TESTING-GUIDE.md)

**Quiero hacer deploy o usar Docker:**
- ⏳ DOCKER-CHEATSHEET.md (pendiente)
- ⏳ DEPLOYMENT-CHEATSHEET.md (pendiente)
- Mientras tanto: [ONBOARDING.md](../00-overview/ONBOARDING.md)

---

## 🚨 Issues Conocidos

### P0 (Crítico)

Ninguno en esta carpeta actualmente.

### P1 (Alto)

- **P1-001:** Falta GIT-CHEATSHEET.md
  - **Esfuerzo:** 2-3 horas
  - **Impacto:** Developers buscan comandos Git comunes frecuentemente

- **P1-002:** Falta TESTING-CHEATSHEET.md
  - **Esfuerzo:** 2-3 horas
  - **Impacto:** Test coverage bajo (15% backend, 13% frontend)

### P2 (Medio)

- **P2-001:** Falta DOCKER-CHEATSHEET.md
  - **Esfuerzo:** 1-2 horas
  - **Impacto:** Setup de Docker aún no implementado

- **P2-002:** Falta DEPLOYMENT-CHEATSHEET.md
  - **Esfuerzo:** 2-3 horas
  - **Impacto:** Deployment procedures no documentadas

---

## 🎯 Próximos Pasos

### Fase 1 (Esta Semana - 4-6 horas)

1. ✅ API-CHEATSHEET.md creado
2. ✅ DB-CHEATSHEET.md creado
3. ✅ README.md creado (este archivo)
4. ⬜ Crear GIT-CHEATSHEET.md (2-3 horas)
5. ⬜ Crear TESTING-CHEATSHEET.md (2-3 horas)

**Owner:** @tech-lead
**Deadline:** 2025-11-14

### Fase 2 (Próximas 2 Semanas - 3-5 horas)

6. ⬜ Crear DOCKER-CHEATSHEET.md (1-2 horas)
7. ⬜ Crear DEPLOYMENT-CHEATSHEET.md (2-3 horas)

---

## 📞 Contacto

**Preguntas sobre cheatsheets:**
- Slack: #gamilit-help
- Owner: @tech-lead

**Sugerencias de contenido:**
- Crear issue en GitHub con label "documentation"
- Proponer en #gamilit-docs

**Contribuir:**
1. Fork repository
2. Crear cheatsheet siguiendo formato existente
3. Abrir Pull Request
4. Solicitar review a @tech-lead

---

## 📐 Formato de Cheatsheet (Para Contribuidores)

**Estructura recomendada:**

```markdown
# [Tecnología] Cheatsheet - GAMILIT Platform

**Versión:** 1.0
**Última actualización:** YYYY-MM-DD
**[Metadata específica]**

> **Nota:** Link a documentación completa

---

## Quick Reference (tabla o lista)

## Secciones por caso de uso

### Caso de Uso 1
Ejemplos prácticos con comandos/code

### Caso de Uso 2
Ejemplos prácticos con comandos/code

## Tips y Best Practices

## Troubleshooting Común

## Recursos

---

**Última actualización:** YYYY-MM-DD
```

**Criterios de calidad:**
- ✅ Conciso (200-300 líneas ideales, máximo 800)
- ✅ Ejemplos prácticos copiables
- ✅ Organizado por caso de uso
- ✅ Sin explicaciones largas (eso va en docs/03-desarrollo/)
- ✅ Link a documentación completa al inicio
- ✅ Formato markdown consistente
- ✅ Code blocks con syntax highlighting

---

**Última actualización:** 2025-11-07
**Versión:** 1.0
**Método:** Sistema SIMCO - Fase 3 (Option A - Complete Content)
