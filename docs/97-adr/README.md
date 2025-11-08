# Architecture Decision Records (ADR)

**Carpeta:** `docs/adr/`
**Propósito:** Documentar decisiones arquitectónicas importantes del proyecto
**Última actualización:** 2025-11-07

---

## 📋 ¿Qué son los ADRs?

**Architecture Decision Record (ADR)** es un documento que captura una decisión arquitectónica importante junto con su contexto y consecuencias.

### ¿Por qué usamos ADRs?

1. **Memoria del proyecto:** Explicar "por qué" se tomaron decisiones
2. **Onboarding:** Nuevos miembros entienden decisiones históricas
3. **Evitar rediscusión:** Decisiones documentadas no se recuestionan sin contexto
4. **Accountability:** Claridad sobre quién decidió qué y cuándo
5. **Learning:** Aprender de decisiones pasadas (buenas y malas)

### Cuándo crear un ADR

Crea un ADR cuando:
- ✅ Cambias arquitectura fundamental (monorepo, microservicios, etc.)
- ✅ Adoptas nueva tecnología importante (framework, database, etc.)
- ✅ Defines patrones de diseño a seguir
- ✅ Tomas decisión que afecta a múltiples equipos
- ✅ Eliges entre alternativas con trade-offs significativos

NO creas un ADR para:
- ❌ Decisiones triviales (naming conventions simples)
- ❌ Decisiones fácilmente reversibles
- ❌ Implementaciones específicas (eso va en docs técnicas)

---

## 📐 Formato de ADR

Usamos el formato [Michael Nygard ADR template](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/templates/decision-record-template-by-michael-nygard/index.md):

```markdown
# ADR-XXXX: [Título de la Decisión]

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Deciders:** [Lista de stakeholders]
**Tags:** [categorías]

---

## Context

[Descripción del problema o situación que motiva la decisión]
[Constraints, fuerzas en juego, contexto de negocio]

## Decision

[La decisión tomada, explicada claramente]
[Qué vamos a hacer]

## Alternatives Considered

### Alternative 1: [Nombre]
**Pros:**
- ...

**Cons:**
- ...

**Decisión:** Rechazada porque...

### Alternative 2: [Nombre]
...

## Consequences

### Positivas ✅
[Qué mejora con esta decisión]

### Negativas ⚠️
[Qué empeora o se complica]

## References

[Links a docs, papers, blog posts relevantes]

---

**Status:** [Current status]
**Date Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Supersedes:** [ADR anterior si aplica]
**Superseded by:** [ADR que reemplaza este]
```

---

## 📚 ADRs Existentes

### ✅ ADR-0001: Adopción de Arquitectura Monorepo

**Date:** 2025-11-01
**Status:** ✅ Accepted and Implemented
**Deciders:** Tech Lead, Backend Team, Frontend Team

**Decisión:** Consolidar 4 repositorios separados en un monorepo unificado.

**Context:**
- Antes: gamilit-docs, gamilit-platform-backend, gamilit-platform-web, gamilit-deployment-scripts (4 repos)
- Problemas: Sincronización manual, duplicación de configuración, onboarding complejo

**Key Points:**
- ✅ Cambios cross-app atómicos (1 PR vs 2-4 PRs)
- ✅ Búsqueda global con `grep -r`
- ✅ Configuración compartida (ESLint, Prettier, TS)
- ✅ Onboarding simplificado (2-3h vs 4-6h)
- ⚠️ Repo más grande (~130 MB)
- ⚠️ CI/CD potencialmente más lento

**Alternatives Considered:**
- Repos separados (rechazado)
- Monorepo con Nx/Lerna (pospuesto para Fase 2)
- **✅ Monorepo simple RFC-0001** (elegido)

**[Leer ADR completo →](./ADR-0001-monorepo-architecture.md)**

---

### ✅ ADR-0002: Implementación del Sistema SIMCO

**Date:** 2025-11-05
**Status:** ✅ Accepted and In Progress
**Deciders:** Tech Lead, AI Engineering Team

**Decisión:** Implementar sistema SIMCO (Sistema Indexado Modular por Contexto) usando archivos `_MAP.md` en directorios para proveer contexto a AI agents y developers.

**Context:**
- Workspace complejo: 2,269 archivos, 578 directorios, ~130k LOC
- AI agents sin contexto → 50k tokens/búsqueda, 30 segundos
- Developers sin contexto → 30 min explorando carpetas

**Key Points:**
- ✅ AI agents 25x más rápidos (2s vs 30s)
- ✅ 96% menos tokens (2k vs 50k)
- ✅ Onboarding 5x más rápido (15 min vs 75 min)
- ✅ Conocimiento explícito vs implícito
- ⚠️ Mantenimiento manual requerido
- ⚠️ Riesgo de desincronización

**Progress:**
- Fase 0-3: ✅ Completadas (109 _MAP.md, 18.9% coverage)
- Fase 4: Planeada Q1 2025 (150 maps, 26%)
- Fase 5: Planeada Q2 2025 (300 maps, 52%)

**Alternatives Considered:**
- Auto-generated README (rechazado - sin contexto)
- Wiki externo Confluence (rechazado - desconectado del código)
- Código auto-documentado JSDoc (complementario)
- **✅ _MAP.md manuales con template RFC-0001** (elegido)

**[Leer ADR completo →](./ADR-0002-simco-system.md)**

---

## ⏳ ADRs Planeados

### ADR-0003: Selección de Stack Tecnológico

**Status:** ⏳ Planeado
**Priority:** P1 (Alta)
**Target Date:** 2025-11-20

**Decisión a documentar:**
- Por qué NestJS para backend (vs Express, Fastify, Koa)
- Por qué React 19 para frontend (vs Vue, Angular, Svelte)
- Por qué PostgreSQL para database (vs MySQL, MongoDB, etc.)
- Por qué TypeScript (vs JavaScript puro)

**Context:**
- Decisiones ya tomadas e implementadas
- Falta documentación formal del "por qué"

**Esfuerzo estimado:** 3-4 horas

---

### ADR-0004: Arquitectura Multi-Schema en PostgreSQL

**Status:** ⏳ Planeado
**Priority:** P1 (Alta)
**Target Date:** 2025-11-25

**Decisión a documentar:**
- Por qué 9 schemas separados (vs 1 schema público)
- Ventajas de separación lógica
- Trade-offs de mantenimiento
- Esquema de naming conventions

**Schemas:**
- auth_management
- educational_content
- gamification_system
- progress_tracking
- social_features
- content_management
- audit_logging
- system_configuration
- public

**Context:**
- Arquitectura DB ya implementada
- Falta documentación de decisión

**Esfuerzo estimado:** 2-3 horas

---

### ADR-0005: Estrategia de Autenticación JWT

**Status:** ⏳ Planeado
**Priority:** P2 (Media)
**Target Date:** 2025-12-01

**Decisión a documentar:**
- Por qué JWT (vs session-based, OAuth only)
- Access token + Refresh token strategy
- Token expiration times (7 days refresh, 1h access)
- Storage strategy (httpOnly cookies vs localStorage)

**Context:**
- Sistema de autenticación implementado
- Necesita documentación formal

**Esfuerzo estimado:** 2-3 horas

---

### ADR-0006: Constants SSOT System

**Status:** ⏳ Planeado
**Priority:** P2 (Media)
**Target Date:** 2025-12-05

**Decisión a documentar:**
- Por qué Constants SSOT (vs hardcoding)
- Arquitectura de sincronización Backend ↔ Frontend
- Trade-offs de type-safety vs flexibilidad
- Enforcement en CI/CD

**Context:**
- Sistema implementado en Fase 0 - Ciclo 5
- Documentación técnica existe pero falta ADR

**Esfuerzo estimado:** 2-3 horas

---

### ADR-0007: Feature-Sliced Design en Frontend

**Status:** ⏳ Planeado
**Priority:** P2 (Media)
**Target Date:** 2025-12-10

**Decisión a documentar:**
- Por qué Feature-Sliced Design (vs Atomic Design, etc.)
- Estructura de carpetas features/
- Bounded contexts
- Shared components strategy

**Context:**
- Frontend ya estructurado con FSD
- Falta documentación de decisión

**Esfuerzo estimado:** 2-3 horas

---

## 🗺️ Navegación

### Por Estado

**Implemented (2):**
- [ADR-0001: Monorepo](./ADR-0001-monorepo-architecture.md)
- [ADR-0002: SIMCO](./ADR-0002-simco-system.md)

**Planned (5):**
- ADR-0003: Stack tecnológico
- ADR-0004: Multi-schema DB
- ADR-0005: JWT authentication
- ADR-0006: Constants SSOT
- ADR-0007: Feature-Sliced Design

### Por Categoría

**Architecture (2):**
- ADR-0001: Monorepo
- ADR-0002: SIMCO

**Technology Stack (1 planned):**
- ADR-0003: Stack selection

**Database (1 planned):**
- ADR-0004: Multi-schema

**Security (1 planned):**
- ADR-0005: JWT

**Code Organization (2 planned):**
- ADR-0006: Constants SSOT
- ADR-0007: Feature-Sliced Design

---

## 📝 Cómo Crear un Nuevo ADR

### Paso 1: Determinar el Número

```bash
# Ver último ADR
ls docs/adr/ | grep ADR | sort | tail -1
# Output: ADR-0002-simco-system.md

# Siguiente es ADR-0003
```

### Paso 2: Crear Archivo

```bash
# Copiar template
cp docs/adr/ADR-TEMPLATE.md docs/adr/ADR-0003-nombre-decision.md

# Editar con tu editor
code docs/adr/ADR-0003-nombre-decision.md
```

### Paso 3: Llenar Secciones

1. **Context:** ¿Qué problema estamos resolviendo? ¿Por qué ahora?
2. **Decision:** ¿Qué vamos a hacer? Sea específico.
3. **Alternatives Considered:** ¿Qué otras opciones había? ¿Por qué no las elegimos?
4. **Consequences:** ¿Qué mejora? ¿Qué empeora?

### Paso 4: Review

1. Pedir review a stakeholders relevantes
2. Discutir en team meeting si es controversial
3. Mergear cuando hay consenso

### Paso 5: Actualizar README

```bash
# Agregar a este README.md en sección "ADRs Existentes"
```

---

## 💡 Best Practices

### 1. Escribe ADRs en Tiempo Presente

**❌ Malo:**
> "We decided to use React"

**✅ Bueno:**
> "We use React for frontend development"

### 2. Explica el "Por Qué", no el "Cómo"

**❌ Malo:**
> "React uses virtual DOM for rendering"

**✅ Bueno:**
> "We chose React because our team has 3 years of experience with it, and the component ecosystem is mature"

### 3. Documenta Alternatives Seriously

No escribas strawman alternatives. Si no consideraste seriamente una alternativa, no la incluyas.

**✅ Bueno:**
```markdown
### Alternative: Vue 3
**Pros:**
- Composition API similar to React hooks
- Smaller bundle size (30% smaller)
- Better TypeScript support than Vue 2

**Cons:**
- Team no tiene experiencia
- Ecosystem menos maduro para enterprise
- Menos candidatos en hiring pipeline

**Decisión:** Rechazada - Team experience outweighs technical benefits
```

### 4. Actualiza Status

Si una decisión cambia:
```markdown
**Status:** ~~Accepted~~ → **Superseded by ADR-0010**
```

### 5. Link Related ADRs

```markdown
## Related ADRs
- [ADR-0001: Monorepo](./ADR-0001-monorepo-architecture.md) - Enables SIMCO
- [ADR-0005: JWT](./ADR-0005-jwt-auth.md) - Authentication strategy
```

---

## 🔍 Búsqueda de ADRs

### Por Keyword

```bash
# Buscar ADRs sobre "database"
grep -i "database" docs/adr/ADR-*.md

# Buscar decisiones sobre "performance"
grep -i "performance" docs/adr/ADR-*.md
```

### Por Status

```bash
# Ver ADRs accepted
grep "Status.*Accepted" docs/adr/ADR-*.md

# Ver ADRs deprecated
grep "Status.*Deprecated" docs/adr/ADR-*.md
```

---

## 📚 Recursos

**ADR Methodologies:**
- [Michael Nygard's ADR Template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Template que usamos
- [ADR GitHub Org](https://adr.github.io/) - Colección de ADRs públicos
- [ADR Tools](https://github.com/npryce/adr-tools) - CLI para gestionar ADRs

**Examples from Open Source:**
- [Kubernetes ADRs](https://github.com/kubernetes/enhancements/tree/master/keps)
- [Elasticsearch ADRs](https://github.com/elastic/elasticsearch/tree/main/docs/reference/how-to)

**Books:**
- [Documenting Software Architectures (Bass, Clements, Kazman)](https://www.amazon.com/Documenting-Software-Architectures-Views-Beyond/dp/0321552687)

---

## 📞 Contacto

**Preguntas sobre ADRs:**
- Slack: #gamilit-architecture
- Owner: @tech-lead

**Proponer nuevo ADR:**
1. Crear issue en GitHub con label "adr"
2. Discutir en #gamilit-architecture
3. Si hay consenso, crear ADR

**Review de ADR:**
- Requiere aprobación de Tech Lead + 2 stakeholders relevantes

---

**Última actualización:** 2025-11-07
**Total ADRs:** 2 (Accepted: 2, Planned: 5)
**Coverage:** Architecture, Documentation, Technology Stack
