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

**Date:** 2025-11-01 | **Status:** ✅ Implemented | **Category:** Architecture

Consolidar 4 repositorios separados en un monorepo unificado.

**[→ Leer ADR completo](./ADR-0001-monorepo-architecture.md)**

---

### ✅ ADR-0002: Implementación del Sistema SIMCO

**Date:** 2025-11-05 | **Status:** ✅ Implemented | **Category:** Documentation

Sistema Indexado Modular por Contexto usando `_MAP.md` para AI agents y developers.

**[→ Leer ADR completo](./ADR-0002-simco-system.md)**

---

### ✅ ADR-0003: Team vs Guild en Social Features

**Date:** 2025-11-08 | **Status:** ✅ Implemented | **Category:** Social Features

Usar "Guild" en lugar de "Team" para funcionalidades sociales (coherente con temática Maya).

**[→ Leer ADR completo](./ADR-0003-team-vs-guild.md)**

---

### ✅ ADR-007: Schemas sin Tablas en PostgreSQL

**Date:** 2025-11-11 | **Status:** ✅ Accepted | **Category:** Database

Permitir schemas vacíos en PostgreSQL para reserva futura.

**[→ Leer ADR completo](./ADR-007-schemas-sin-tablas.md)**

---

### ✅ ADR-008: Sistema Dual exercise_type + Categorías Pedagógicas

**Date:** 2025-11-11 | **Status:** ✅ Implemented | **Category:** Database

Sistema dual con `exercise_type` (35 tipos) + mapeo a categorías pedagógicas.

**[→ Leer ADR completo](./ADR-008-sistema-dual-exercise-mechanics.md)**

---

### ✅ ADR-009: Duración del Ejercicio 3.4 - Podcast Argumentativo

**Date:** 2025-11-23 | **Status:** ✅ Implemented | **Category:** Content Design

Mantener duración de 2 minutos (vs 3) para podcast argumentativo.

**[→ Leer ADR completo](./ADR-009-duracion-podcast-ejercicio-3-4.md)**

---

### ✅ ADR-010: DocumentoDeDiseño como Fuente de Verdad

**Date:** 2025-11-23 | **Status:** ✅ Accepted | **Category:** Architecture

El `DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` es la fuente de verdad para módulos y ejercicios.

**[→ Leer ADR completo](./ADR-010-documento-diseno-fuente-verdad.md)**

---

### ✅ ADR-011: Estructura de API Clients en Frontend

**Date:** 2025-11-23 | **Status:** ✅ Accepted | **Category:** Frontend

Estructura estándar para API clients con módulos por dominio.

**[→ Leer ADR completo](./ADR-011-frontend-api-client-structure.md)**

---

### ✅ ADR-012: Inicialización Automática de Usuarios mediante Trigger

**Date:** 2025-11-24 | **Status:** ✅ Implemented | **Category:** Database

Trigger que inicializa automáticamente registros de gamificación al registrar usuarios.

**[→ Leer ADR completo](./ADR-012-automatic-user-initialization-trigger.md)**

---

### ✅ ADR-013: Adopción de React Query (TanStack Query v5)

**Date:** 2025-11-23 | **Status:** ✅ Implemented | **Category:** Frontend

TanStack Query v5 como solución estándar para manejo de estado asíncrono.

**[→ Leer ADR completo](./ADR-013-react-query-adoption.md)**

---

### ✅ ADR-014: Nil-Safety Patterns

**Date:** 2025-11-23 | **Status:** ✅ Accepted | **Category:** Frontend

Optional Chaining (`?.`) y Nullish Coalescing (`??`) como patrón estándar.

**[→ Leer ADR completo](./ADR-014-nil-safety-patterns.md)**

---

### ✅ ADR-015: Centralización de Rutas API en apiConfig.ts

**Date:** 2025-11-24 | **Status:** ✅ Implemented | **Category:** Frontend

Single Source of Truth para rutas API en `apiConfig.ts` (241 rutas).

**[→ Leer ADR completo](./ADR-015-centralized-api-routes-configuration.md)**

---

### ✅ ADR-016: Simplificar Backend XP Acumulación

**Date:** 2025-11-24 | **Status:** ✅ Implemented | **Category:** Backend

Delegar promoción de rangos completamente a triggers de base de datos.

**[→ Leer ADR completo](./ADR-016-simplificar-backend-xp-acumulacion.md)**

---

### ✅ ADR-017: Admin Portal Avanzado vs Alcance Inicial

**Date:** 2025-11-24 | **Status:** ✅ Accepted | **Category:** Architecture

Documentar discrepancia entre alcance inicial EAI-005 y portal admin implementado (~75 endpoints).

**[→ Leer ADR completo](./ADR-017-admin-portal-avanzado-vs-alcance-inicial.md)**

---

### ✅ ADR-018: Eliminación de Carpetas Migrations

**Date:** 2025-11-24 | **Status:** ✅ Accepted | **Category:** Database

Eliminar carpetas `migrations/` para cumplir Política de Carga Limpia.

**[→ Leer ADR completo](./ADR-018-removal-migrations-folders.md)**

---

### ✅ ADR-019: Adopción de Zod v3 para Runtime Validation

**Date:** 2025-11-23 | **Status:** ✅ Accepted | **Category:** Frontend

Zod v3 como solución estándar para validación de runtime en frontend.

**[→ Leer ADR completo](./ADR-019-runtime-validation-zod.md)**

---

### ✅ ADR-020: Soporte de Múltiples Alternativas en Completar Espacios

**Date:** 2025-11-24 | **Status:** ✅ Implemented | **Category:** Database

Función `validate_fill_in_blank` soporta múltiples respuestas válidas.

**[→ Leer ADR completo](./ADR-020-validacion-alternativas-ejercicio-completar-espacios.md)**

---

### ✅ ADR-021: Estandarización de Recompensas XP en Ejercicios

**Date:** 2025-11-24 | **Status:** ✅ Implemented | **Category:** Gamification

Estandarizar 100 XP / 20 ML Coins por ejercicio para progresión consistente.

**[→ Leer ADR completo](./ADR-021-estandarizacion-recompensas-xp-ejercicios.md)**

---

### ✅ ADR-026: SIMCO v2 - Estructura Modular

**Date:** 2025-11-08 | **Status:** ✅ Accepted | **Category:** Documentation

Evolucionar SIMCO a v2 con estructura modular y templates estandarizados.

**[→ Leer ADR completo](./ADR-026-simco-v2-estructura-modular.md)**

---

## 🗺️ Navegación

### Por Estado

**Implemented/Accepted (19):**
- [ADR-0001: Monorepo Architecture](./ADR-0001-monorepo-architecture.md)
- [ADR-0002: SIMCO System](./ADR-0002-simco-system.md)
- [ADR-0003: Team vs Guild](./ADR-0003-team-vs-guild.md)
- [ADR-007: Schemas sin Tablas](./ADR-007-schemas-sin-tablas.md)
- [ADR-008: Sistema Dual exercise_type](./ADR-008-sistema-dual-exercise-mechanics.md)
- [ADR-009: Duración Podcast Ejercicio 3.4](./ADR-009-duracion-podcast-ejercicio-3-4.md)
- [ADR-010: Documento Diseño Fuente Verdad](./ADR-010-documento-diseno-fuente-verdad.md)
- [ADR-011: Frontend API Client Structure](./ADR-011-frontend-api-client-structure.md)
- [ADR-012: Automatic User Initialization Trigger](./ADR-012-automatic-user-initialization-trigger.md)
- [ADR-013: React Query Adoption](./ADR-013-react-query-adoption.md)
- [ADR-014: Nil-Safety Patterns](./ADR-014-nil-safety-patterns.md)
- [ADR-015: Centralized API Routes](./ADR-015-centralized-api-routes-configuration.md)
- [ADR-016: Simplificar Backend XP](./ADR-016-simplificar-backend-xp-acumulacion.md)
- [ADR-017: Admin Portal Avanzado](./ADR-017-admin-portal-avanzado-vs-alcance-inicial.md)
- [ADR-018: Removal Migrations Folders](./ADR-018-removal-migrations-folders.md)
- [ADR-019: Runtime Validation Zod](./ADR-019-runtime-validation-zod.md)
- [ADR-020: Validación Alternativas Fill-in-Blank](./ADR-020-validacion-alternativas-ejercicio-completar-espacios.md)
- [ADR-021: Estandarización Recompensas XP](./ADR-021-estandarizacion-recompensas-xp-ejercicios.md)
- [ADR-026: SIMCO v2 Estructura Modular](./ADR-026-simco-v2-estructura-modular.md)

### Por Categoría

**Architecture (4):**
- ADR-0001: Monorepo Architecture
- ADR-0002: SIMCO System
- ADR-010: Documento Diseño Fuente Verdad
- ADR-017: Admin Portal Avanzado

**Database (5):**
- ADR-007: Schemas sin Tablas
- ADR-008: Sistema Dual exercise_type
- ADR-012: Automatic User Initialization Trigger
- ADR-018: Removal Migrations Folders
- ADR-020: Validación Alternativas Fill-in-Blank

**Frontend (5):**
- ADR-011: Frontend API Client Structure
- ADR-013: React Query Adoption
- ADR-014: Nil-Safety Patterns
- ADR-015: Centralized API Routes
- ADR-019: Runtime Validation Zod

**Backend (1):**
- ADR-016: Simplificar Backend XP

**Gamification (1):**
- ADR-021: Estandarización Recompensas XP

**Documentation (2):**
- ADR-0002: SIMCO
- ADR-026: SIMCO v2

**Social Features (1):**
- ADR-0003: Team vs Guild

**Content Design (1):**
- ADR-009: Duración Podcast Ejercicio 3.4

---

## 📝 Cómo Crear un Nuevo ADR

### Paso 1: Determinar el Número

```bash
# Ver último ADR
ls docs/97-adr/ | grep ADR | sort -V | tail -1
# Output: ADR-026-simco-v2-estructura-modular.md

# Siguiente número disponible: ADR-022, ADR-023, ADR-024, ADR-025, ADR-027...
```

**Convención de Numeración:**
- **Formato estándar:** ADR-XXX o ADR-0XXX (consistente por rango)
- **Próximos disponibles:** ADR-022, ADR-023, ADR-024, ADR-025, ADR-027+
- **Nota:** ADR-026 ya existe, continuar desde ADR-022 o ADR-027+

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

**Última actualización:** 2025-11-29
**Total ADRs:** 19 (Accepted/Implemented: 19)
**Coverage:** Architecture, Documentation, Database, Frontend, Backend, Gamification, Social Features, Content Design
