# Architecture Decision Records (ADR)

**Carpeta:** `docs/97-adr/`
**Propósito:** Documentar decisiones arquitectónicas importantes del proyecto
**Última actualización:** 2025-11-23

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

### ✅ ADR-0003: Team vs Guild en Social Features

**Date:** 2025-11-08
**Status:** ✅ Accepted and Implemented
**Deciders:** Tech Lead, Product Owner, Backend Team

**Decisión:** Usar el término "Guild" en lugar de "Team" para las funcionalidades sociales de GAMILIT.

**Context:**
- Sistema de gamificación requiere grupos sociales competitivos
- "Team" es genérico y poco gamificado
- "Guild" evoca cultura gaming y contexto Maya

**Key Points:**
- ✅ Mayor engagement (término gamificado)
- ✅ Coherente con temática Maya/cultura
- ✅ Diferenciación de "classroom" (contexto académico)
- ✅ Nomenclatura consistente en BD, backend, frontend

**[Leer ADR completo →](./ADR-0003-team-vs-guild.md)**

---

### ✅ ADR-007: Schemas sin Tablas en PostgreSQL

**Date:** 2025-11-11
**Status:** ✅ Accepted
**Deciders:** Database Team, Tech Lead

**Decisión:** Permitir schemas vacíos (sin tablas) en PostgreSQL para reserva futura.

**Context:**
- Base de datos multi-schema requiere planificación
- Algunos schemas se implementarán en fases futuras
- Necesidad de estructura clara desde el inicio

**Key Points:**
- ✅ Planificación clara de estructura futura
- ✅ Evita cambios arquitectónicos posteriores
- ✅ Documentación de intenciones
- ⚠️ Requiere documentación de propósito

**[Leer ADR completo →](./ADR-007-schemas-sin-tablas.md)**

---

### ✅ ADR-008: Sistema Dual exercise_type + Categorías Pedagógicas

**Date:** 2025-11-11
**Status:** ✅ Accepted and Implemented
**Deciders:** Database Team, Tech Lead, Product Owner

**Decisión:** Implementar sistema dual con `exercise_type` (35 tipos específicos GAMILIT) + mapeo a categorías pedagógicas universales.

**Context:**
- Documentación define categorías pedagógicas genéricas
- Implementación usa tipos específicos de GAMILIT
- Necesidad de coherencia entre docs y código

**Key Points:**
- ✅ Mantiene granularidad de implementación
- ✅ Provee categorización pedagógica
- ✅ Evita refactoring masivo
- ✅ Documenta mapeo explícito

**[Leer ADR completo →](./ADR-008-sistema-dual-exercise-mechanics.md)**

---

### ✅ ADR-009: Duración del Ejercicio 3.4 - Podcast Argumentativo

**Date:** 2025-11-23
**Status:** ✅ Accepted and Implemented
**Deciders:** Architecture-Analyst, Product Owner

**Decisión:** Mantener duración de 2 minutos (vs 3 minutos) para el ejercicio de podcast argumentativo.

**Context:**
- Contradicción en documento de diseño de mecánicas v6.4
- Título indicaba 2 minutos, descripción mencionaba 3 minutos
- Necesidad de decisión definitiva

**Key Points:**
- ✅ Coherente con v6.4 ya implementado
- ✅ Más manejable para estudiantes
- ✅ Facilita evaluación y retroalimentación
- ✅ Alineado con formatos digitales modernos
- ⚠️ Menos tiempo para argumentación profunda

**Estructura:** Introducción (30s) + Desarrollo (60s) + Conclusión (30s) = 120s

**[Leer ADR completo →](./ADR-009-duracion-podcast-ejercicio-3-4.md)**

---

### ✅ ADR-026: SIMCO v2 - Estructura Modular

**Date:** 2025-11-08
**Status:** ✅ Accepted
**Deciders:** Tech Lead, AI Engineering Team

**Decisión:** Evolucionar SIMCO a v2 con estructura modular y templates estandarizados.

**Context:**
- SIMCO v1 exitoso pero sin estructura consistente
- Necesidad de templates para diferentes tipos de carpetas
- Escalabilidad a 300+ _MAP.md

**Key Points:**
- ✅ Templates por tipo (código, docs, tests, etc.)
- ✅ Secciones estándar reutilizables
- ✅ Más fácil de mantener
- ✅ AI agents procesan estructura predecible

**[Leer ADR completo →](./ADR-026-simco-v2-estructura-modular.md)**

---

### ✅ ADR-012: Inicialización Automática de Usuarios mediante Trigger

**Date:** 2025-11-24
**Status:** ✅ Accepted and Implemented
**Deciders:** Architecture-Analyst, Database-Agent, Backend-Agent, Frontend-Agent

**Decisión:** Implementar trigger de base de datos que inicializa automáticamente todos los registros necesarios al registrar un usuario nuevo.

**Context:**
- Bug crítico: Usuarios nuevos veían "No modules available"
- Causa raíz: Trigger incompleto, no creaba `module_progress`
- Gamificación rota para nuevos usuarios

**Key Points:**
- ✅ Trigger crea 4 tablas automáticamente (user_stats, comodines_inventory, user_ranks, module_progress)
- ✅ 100% usuarios inicializados correctamente
- ✅ 0% errores "no modules available"
- ✅ UX mejorada: 5 módulos disponibles inmediatamente
- ✅ Backend/Frontend compatible sin cambios
- ✅ 5 bugs críticos corregidos (FK references, ON CONFLICT, etc.)

**Bugs Fixed:**
1. module_progress NUNCA se creaba (CRÍTICO)
2. user_ranks sin protección contra duplicados
3. FK reference incorrecta (profiles.id vs auth.users.id)
4. Referencia a columna inexistente (deleted_at)
5. Migration con FK incorrecta

**Validation:**
- ✅ Database-Agent: APROBADO para carga limpia
- ✅ Backend-Agent: APROBADO sin cambios necesarios (riesgo BAJO)
- ✅ Frontend-Agent: APROBADO para producción (confianza 95%+)

**[Leer ADR completo →](./ADR-012-automatic-user-initialization-trigger.md)**

---

## ⏳ ADRs Planeados

### ADR-010: Selección de Stack Tecnológico

**Status:** ⏳ Planeado
**Priority:** P1 (Alta)
**Target Date:** 2025-12-10

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

### ADR-011: Arquitectura Multi-Schema en PostgreSQL

**Status:** ⏳ Planeado
**Priority:** P1 (Alta)
**Target Date:** 2025-12-15

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

### ADR-015: Estrategia de Autenticación JWT

**Status:** ⏳ Planeado
**Priority:** P2 (Media)
**Target Date:** 2025-12-20

**Decisión a documentar:**
- Por qué JWT (vs session-based, OAuth only)
- Access token + Refresh token strategy
- Token expiration times (7 days refresh, 1h access)
- Storage strategy (httpOnly cookies vs localStorage)

**Context:**
- Sistema de autenticación implementado
- Necesita documentación formal

**Esfuerzo estimado:** 2-3 horas

**Nota:** Renumerado de ADR-012 a ADR-015 (ADR-012 usado para User Initialization Trigger)

---

### ADR-013: Constants SSOT System

**Status:** ⏳ Planeado
**Priority:** P2 (Media)
**Target Date:** 2025-12-25

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

### ADR-014: Feature-Sliced Design en Frontend

**Status:** ⏳ Planeado
**Priority:** P2 (Media)
**Target Date:** 2025-12-30

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

**Implemented (8):**
- [ADR-0001: Monorepo Architecture](./ADR-0001-monorepo-architecture.md)
- [ADR-0002: SIMCO System](./ADR-0002-simco-system.md)
- [ADR-0003: Team vs Guild](./ADR-0003-team-vs-guild.md)
- [ADR-007: Schemas sin Tablas](./ADR-007-schemas-sin-tablas.md)
- [ADR-008: Sistema Dual exercise_type](./ADR-008-sistema-dual-exercise-mechanics.md)
- [ADR-009: Duración Podcast Ejercicio 3.4](./ADR-009-duracion-podcast-ejercicio-3-4.md)
- [ADR-012: Automatic User Initialization Trigger](./ADR-012-automatic-user-initialization-trigger.md)
- [ADR-026: SIMCO v2 Estructura Modular](./ADR-026-simco-v2-estructura-modular.md)

**Planned (5):**
- ADR-010: Stack tecnológico
- ADR-011: Multi-schema DB
- ADR-013: Constants SSOT
- ADR-014: Feature-Sliced Design
- ADR-015: JWT authentication

### Por Categoría

**Architecture (3):**
- ADR-0001: Monorepo
- ADR-0002: SIMCO
- ADR-026: SIMCO v2

**Database (3 + 1 planned):**
- ADR-007: Schemas sin Tablas
- ADR-008: Sistema Dual exercise_type
- ADR-012: Automatic User Initialization Trigger
- ADR-011: Multi-schema (planned)

**Technology Stack (1 planned):**
- ADR-010: Stack selection (planned)

**Security (1 planned):**
- ADR-015: JWT (planned)

**Code Organization (2 planned):**
- ADR-013: Constants SSOT (planned)
- ADR-014: Feature-Sliced Design (planned)

**Social Features (1):**
- ADR-0003: Team vs Guild

**Content Design (1):**
- ADR-009: Duración Podcast Ejercicio 3.4

---

## 📝 Cómo Crear un Nuevo ADR

### Paso 1: Determinar el Número

```bash
# Ver último ADR
ls docs/97-adr/ | grep ADR | sort | tail -1
# Output: ADR-009-duracion-podcast-ejercicio-3-4.md

# Siguiente es ADR-010
```

**Convención de Numeración:**
- **Formato estándar:** ADR-00XX (padding a 4 dígitos con ceros)
- **Ejemplos:** ADR-0001, ADR-0002, ADR-0003, ..., ADR-0010, ADR-0011
- **Próximo ADR:** ADR-010 (después de ADR-009)

**Nota:** ADRs históricos mantienen su numeración original (ADR-007, ADR-008, ADR-026). Nuevos ADRs deben usar formato de 4 dígitos (ADR-00XX o ADR-0XXX según corresponda).

### Paso 2: Crear Archivo

```bash
# Copiar template (si existe)
cp docs/97-adr/ADR-TEMPLATE.md docs/97-adr/ADR-010-nombre-decision.md

# O crear desde cero
touch docs/97-adr/ADR-010-nombre-decision.md

# Editar con tu editor
code docs/97-adr/ADR-010-nombre-decision.md
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
grep -i "database" docs/97-adr/ADR-*.md

# Buscar decisiones sobre "performance"
grep -i "performance" docs/97-adr/ADR-*.md
```

### Por Status

```bash
# Ver ADRs accepted
grep "Status.*Accepted" docs/97-adr/ADR-*.md

# Ver ADRs deprecated
grep "Status.*Deprecated" docs/97-adr/ADR-*.md
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

**Última actualización:** 2025-11-24
**Total ADRs:** 8 (Accepted: 8, Planned: 5)
**Coverage:** Architecture, Documentation, Database, Technology Stack, Social Features, Content Design, User Initialization
