---
titulo: "ADR-045: Clean Architecture Pragmatica"
tipo: adr
fecha_creacion: "2026-02-17"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-045: Clean Architecture Pragmatica

**Estado:** Aceptada
**Date:** 2026-02-17
**Deciders:** Tech Lead, Backend Team
**Tags:** architecture, backend, clean-architecture, domain-errors, nestjs

> **ESTADO DE IMPLEMENTACION (verificado 2026-02-27):**
> Infrastructure lista, adopcion pendiente.
> - 45 domain error classes creadas (25 auth + 17 gamification + 3 educational + 6 base compartidas).
> - Adoption real: solo 2 modulos han migrado parcialmente (auth: 100%, gamification: ~10%).
> - 683 HTTP exceptions activas en `.service.ts` files. 93 service files (de 172 total) aun sin migrar.
> - Ver seccion "Estado de Migracion" mas abajo para detalle por modulo.

---

## Context

### Situacion Actual

El backend de GAMILIT esta construido con NestJS 11 y TypeORM 0.3.x. La arquitectura actual sigue el patron estandar de NestJS:

- **172 services** que contienen logica de negocio y acceden directamente a repositorios TypeORM.
- **156 entity files (157 @Entity classes)** que son clases TypeORM con decoradores ORM (`@Entity`, `@Column`, `@ManyToOne`).
- **108 controllers** que reciben requests HTTP y delegan a services.
- **401 DTOs** para validacion de entrada/salida.

### Problema

El equipo evaluo adoptar Clean Architecture (tambien conocida como Hexagonal Architecture o Ports & Adapters) para mejorar la separacion de concerns, testabilidad y mantenibilidad a largo plazo. La version clasica de Clean Architecture requiere:

1. **Entities de dominio puras** (sin dependencias de ORM).
2. **Use Cases / Interactors** como capa intermedia entre controllers y repositorios.
3. **Interfaces de repositorio** (Ports) con implementaciones concretas (Adapters).
4. **Dependency inversion** estricta entre capas.

Implementar esto de golpe implicaria:

- Refactorizar 172 services para separar logica de dominio de acceso a datos.
- Duplicar 156 entity files (una version dominio, otra ORM).
- Crear ~150+ interfaces de repositorio con sus implementaciones.
- Riesgo de regresion masivo en un sistema con 914 endpoints en produccion activa.

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
Fase 1 (infraestructura completa, adopcion parcial):
                   Domain Errors Hierarchy (MQ-002)
                   +-- DomainError base class              [DONE]
                   +-- Subclases semanticas (6 base)       [DONE]
                   +-- Global exception filter             [DONE]
                   +-- auth module: 100% migrado           [DONE]
                   +-- gamification: ~10% migrado          [EN PROGRESO]
                   +-- 21 modulos restantes                [PENDIENTE]

Fase 2 (diferida — MQ-005 bloqueado hasta MQ-002 >=50%):
                   Repository Pattern selectivo
                   +-- Solo modulos con logica compleja
                   +-- Interfaces + implementaciones
                   +-- Inyeccion via NestJS DI

Fase 3 (evaluacion): Use Cases (si se justifica)
                   +-- Solo para flujos de negocio criticos
                   +-- Evaluacion caso por caso
```

---

## Estado de Migracion

> Seccion de estado real. Actualizar despues de cada wave de migracion.

### Resumen (verificado 2026-02-27)

| Metrica | Valor |
|---------|-------|
| Domain error classes creadas | 45 total (25 auth + 17 gamification + 3 educational + 6 base compartidas) |
| Service files con domain errors | 8 de 172 (4.6%) |
| Domain error throws en `.service.ts` | 39 (32 auth + 7 gamification) |
| HTTP exceptions en `.service.ts` | 683 throw sites |
| Service files sin migrar | 164 de 172 (95.3%) |

### Por Modulo

| Modulo | Estado | HTTP Exceptions | Domain Error Throws | Notas |
|--------|--------|-----------------|---------------------|-------|
| **auth** | COMPLETADO | 0 | 32 en 5/6 services | Unico modulo 100% migrado |
| **gamification** | EN PROGRESO | 72 | 7 en 3/18 services | inventory, shop, user-stats migrados parcialmente |
| **educational** | INFRAESTRUCTURA LISTA | ~65+ | 0 | 3 error classes creadas, ninguna en uso |
| Todos los demas (20 modulos) | PENDIENTE | 608 | 0 | Sin migracion iniciada |

### Clarificacion: "129 throw sites migrados"

La entrada del 2026-02-27 en el historial de revisiones afirmaba "129 throw sites migrados". Esta cifra no corresponde al estado real del codigo. El conteo verificado es:

- **39 domain error throws** en archivos `.service.ts` (32 en auth, 7 en gamification).
- **683 HTTP exceptions** activas en archivos `.service.ts`.
- La cifra de 129 probablemente incluyó lanzamientos en tests, guards, o conteo erroneo.

**Conclusion:** La infraestructura (clases, filtro global, registration en `main.ts`) esta completa. La migracion de services es la tarea pendiente.

---

## Alternatives Considered

### Alternativa 1: Clean Architecture Completa

**Pros:**
- Separacion total de concerns.
- Entities de dominio puras, testables sin ORM.
- Facilidad para cambiar de ORM o framework.

**Cons:**
- Refactoring de 172 services, 156 entity files.
- Alto riesgo de regresion en sistema en produccion (914 endpoints).
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
| MQ-002 | Pre-requisito | Infraestructura Completa / Adopcion Pendiente | Domain Errors Hierarchy — 45 classes (25 auth, 17 gamification, 3 educational, 6 base compartidas). 39 throw sites en services (32 auth + 7 gamification). 683 HTTP exceptions activas en services. Migration guide: docs/50-guides/backend/DOMAIN-ERROR-MIGRATION.md |
| MQ-005 | Diferida | Pendiente | Repository Pattern — se implementara despues de MQ-002 estable |

---

## References

- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS Documentation - Exception Filters](https://docs.nestjs.com/exception-filters)
- [ADR-040: Adopcion de Arquitectura Monorepo](./ADR-040-monorepo-architecture.md)
- [ADR-044: Estrategia Test Coverage](./ADR-044-test-coverage-strategy.md)
- CLAUDE.md -- Stack: NestJS 11 + TypeORM 0.3.x, 172 services, 156 entity files (157 classes)

---

**Estado:** Aceptada
**Date Created:** 2026-02-17
**Last Updated:** 2026-02-27
**Supersedes:** N/A
**Superseded by:** N/A

**Revision:** Esta decision se revisara despues de completar MQ-002 (domain errors) para evaluar si MQ-005 (repository pattern) aporta valor suficiente o si la Fase 1 es suficiente para el proyecto.

---

## Revision History

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-02-17 | ADR creado | Tech Lead |
| 2026-02-27 | MQ-002: Infraestructura completada (45 domain error classes, DomainExceptionFilter registrado). Adopcion real: auth 100% migrado (32 domain throws, 0 HTTP exceptions en services), gamification ~10% migrado (7 domain throws, 72 HTTP exceptions restantes), 20 modulos sin iniciar. Total: 39 domain throws vs 683 HTTP exceptions activas en services. NOTA: entrada anterior indicaba "129 throw sites migrados" — cifra incorrecta, corregida a 39. Fase 1 infraestructura finalizada; migracion de services pendiente. MQ-005 bloqueado hasta MQ-002 >=50%. | Backend Team |
