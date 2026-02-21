# ADR-045: Clean Architecture Pragmatica

**Status:** Accepted
**Date:** 2026-02-17
**Deciders:** Tech Lead, Backend Team
**Tags:** architecture, backend, clean-architecture, domain-errors, nestjs

---

## Context

### Situacion Actual

El backend de GAMILIT esta construido con NestJS 11 y TypeORM 0.3.x. La arquitectura actual sigue el patron estandar de NestJS:

- **173 services** que contienen logica de negocio y acceden directamente a repositorios TypeORM.
- **155 entity files (156 @Entity classes)** que son clases TypeORM con decoradores ORM (`@Entity`, `@Column`, `@ManyToOne`).
- **108 controllers** que reciben requests HTTP y delegan a services.
- **399 DTOs** para validacion de entrada/salida.

### Problema

El equipo evaluo adoptar Clean Architecture (tambien conocida como Hexagonal Architecture o Ports & Adapters) para mejorar la separacion de concerns, testabilidad y mantenibilidad a largo plazo. La version clasica de Clean Architecture requiere:

1. **Entities de dominio puras** (sin dependencias de ORM).
2. **Use Cases / Interactors** como capa intermedia entre controllers y repositorios.
3. **Interfaces de repositorio** (Ports) con implementaciones concretas (Adapters).
4. **Dependency inversion** estricta entre capas.

Implementar esto de golpe implicaria:

- Refactorizar 173 services para separar logica de dominio de acceso a datos.
- Duplicar 155 entity files (una version dominio, otra ORM).
- Crear ~150+ interfaces de repositorio con sus implementaciones.
- Riesgo de regresion masivo en un sistema con 905 endpoints en produccion activa.

### Evaluacion

Se identificaron tres opciones:

1. **Clean Architecture completa (big-bang):** Refactoring masivo, alto riesgo, alto costo.
2. **Status quo:** No cambiar nada, acumular deuda tecnica gradualmente.
3. **Adopcion pragmatica e incremental:** Tomar los principios de Clean Architecture que aportan valor inmediato sin requerir refactoring global.

---

## Decision

**Adoptamos Clean Architecture Pragmatica:** una adopcion incremental y selectiva de los principios de Clean Architecture, adaptada a la realidad del stack NestJS + TypeORM y al estado actual del proyecto.

### Principios Adoptados

#### 1. Estructura de modulos NestJS (mantener)

Se mantiene la estructura de modulos de NestJS como unidad organizativa. No se implementa hexagonal puro con carpetas `domain/`, `application/`, `infrastructure/` dentro de cada modulo. La razon es que NestJS ya proporciona un nivel de modularidad adecuado mediante su sistema de modulos con inyeccion de dependencias.

#### 2. Jerarquia de errores de dominio (MQ-002, primer paso)

Se introduce una jerarquia de errores de dominio como primera capa de abstraccion del dominio:

```
DomainError (base)
  +-- EntityNotFoundError
  +-- BusinessRuleViolationError
  +-- ValidationError
  +-- ConflictError
  +-- AuthorizationError
```

Esto permite que los services lancen errores semanticos del dominio en lugar de excepciones HTTP directas (`NotFoundException`, `BadRequestException`). Un filtro global de excepciones traduce errores de dominio a respuestas HTTP apropiadas.

**Valor inmediato:** Services desacoplados de HTTP, errores mas descriptivos, testabilidad mejorada.

#### 3. Repository pattern (MQ-005, diferido)

Se difiere la introduccion del patron Repository (interfaces + implementaciones) hasta que:
- Los errores de dominio (MQ-002) esten estables y adoptados en al menos 50% de los services.
- Se identifiquen modulos especificos donde el beneficio justifique el costo (ej: modulos con logica de negocio compleja como `gamification` o `progress`).

**Razon del diferimiento:** Introducir repositorios sin errores de dominio primero crearia una abstraccion sin valor real, ya que los services seguirian lanzando excepciones HTTP.

#### 4. Services como capa de logica de negocio (mantener)

Los services NestJS siguen siendo la capa principal de logica de negocio. No se crean use cases / interactors separados. Cuando un service crece demasiado (>300 lineas), se divide en services mas pequenos y especializados dentro del mismo modulo.

#### 5. Entities TypeORM (mantener como estan)

Las entities siguen siendo clases TypeORM con decoradores ORM. No se crean entities de dominio puras separadas. La duplicacion de modelos (dominio vs ORM) se considera un costo excesivo para el beneficio obtenido en un proyecto de esta escala.

### Orden de Adopcion

```
Fase 1 (actual):  Domain Errors Hierarchy (MQ-002)
                   +-- DomainError base class
                   +-- Subclases semanticas
                   +-- Global exception filter
                   +-- Migracion gradual de services

Fase 2 (futura):  Repository Pattern selectivo (MQ-005)
                   +-- Solo modulos con logica compleja
                   +-- Interfaces + implementaciones
                   +-- Inyeccion via NestJS DI

Fase 3 (evaluacion): Use Cases (si se justifica)
                   +-- Solo para flujos de negocio criticos
                   +-- Evaluacion caso por caso
```

---

## Alternatives Considered

### Alternativa 1: Clean Architecture Completa

**Pros:**
- Separacion total de concerns.
- Entities de dominio puras, testables sin ORM.
- Facilidad para cambiar de ORM o framework.

**Cons:**
- Refactoring de 173 services, 155 entity files.
- Alto riesgo de regresion en sistema en produccion (905 endpoints).
- Duplicacion significativa de modelos.
- Tiempo estimado: 3-4 sprints solo para la migracion.

**Decision:** Rechazada por costo/beneficio desfavorable.

### Alternativa 2: Status Quo

**Pros:**
- Sin riesgo de regresion.
- Sin costo de desarrollo adicional.

**Cons:**
- Deuda tecnica se acumula.
- Services crecen sin estructura.
- Errores HTTP esparcidos por toda la capa de negocio.
- Testabilidad no mejora.

**Decision:** Rechazada por acumulacion de deuda tecnica.

### Alternativa 3: Adopcion Pragmatica (Elegida)

**Pros:**
- Valor inmediato desde Fase 1 (domain errors).
- Sin big-bang refactor.
- Compatible con estructura NestJS existente.
- Cada fase es reversible e independiente.

**Cons:**
- No es Clean Architecture "pura".
- Entities siguen acopladas al ORM.
- Puede generar inconsistencia temporal durante migracion gradual.

**Decision:** ELEGIDA por balance optimo entre mejora y riesgo.

---

## Consequences

### Positivas

1. **Valor incremental:** Cada fase aporta mejoras independientes sin requerir la completitud de las demas.
2. **Sin big-bang refactor:** El sistema en produccion no se expone a regresiones masivas.
3. **Errores semanticos:** Los domain errors mejoran la depuracion, los mensajes de error, y el testing de services.
4. **Compatibilidad NestJS:** No se lucha contra el framework; se aprovechan sus mecanismos nativos (DI, modules, exception filters).
5. **Camino abierto:** Si en el futuro se necesita Clean Architecture completa, los domain errors y repository pattern ya estaran en su lugar como base.

### Negativas

1. **No es puro:** Puristas de Clean Architecture encontrarian que las entities acopladas al ORM y la ausencia de use cases no cumplen con los principios.
2. **Entities acopladas:** Un cambio de ORM (de TypeORM a Prisma, por ejemplo) aun requeriria tocar las entities.
3. **Inconsistencia temporal:** Durante la migracion gradual, algunos services usaran domain errors y otros seguiran con excepciones HTTP directas.

### Trade-off Aceptado

**Pragmatismo sobre pureza:** Se acepta conscientemente que la arquitectura no sera "Clean Architecture" en el sentido academico. El objetivo es obtener los beneficios mas impactantes (domain errors, testing mejorado) con el menor costo de migracion posible.

---

## Dependencies

| Dependencia | Tipo | Estado | Descripcion |
|-------------|------|--------|-------------|
| MQ-002 | Pre-requisito | Pendiente | Domain Errors Hierarchy — primer paso hacia domain layer |
| MQ-005 | Diferida | Pendiente | Repository Pattern — se implementara despues de MQ-002 estable |

---

## References

- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS Documentation - Exception Filters](https://docs.nestjs.com/exception-filters)
- [ADR-040: Adopcion de Arquitectura Monorepo](./ADR-040-monorepo-architecture.md)
- [ADR-044: Estrategia Test Coverage](./ADR-044-test-coverage-strategy.md)
- CLAUDE.md -- Stack: NestJS 11 + TypeORM 0.3.x, 173 services, 155 entity files (156 classes)

---

**Status:** Accepted
**Date Created:** 2026-02-17
**Last Updated:** 2026-02-17
**Supersedes:** N/A
**Superseded by:** N/A

**Revision:** Esta decision se revisara despues de completar MQ-002 (domain errors) para evaluar si MQ-005 (repository pattern) aporta valor suficiente o si la Fase 1 es suficiente para el proyecto.
