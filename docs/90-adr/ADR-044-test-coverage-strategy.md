# ADR-044: Estrategia de Test Coverage (50% enforced, 80% aspiracional)

**Status:** Accepted
**Date:** 2026-02-17
**Deciders:** Tech Lead
**Tags:** testing, quality, ci, backend

---

## Context

### Situacion Actual

El proyecto GAMILIT presenta una contradiccion documentada entre la configuracion real de test coverage y la meta declarada:

1. **`apps/backend/jest.config.js`** define umbrales de cobertura en **50%** para branches, functions, lines y statements:
   ```js
   coverageThreshold: {
     global: {
       branches: 50,
       functions: 50,
       lines: 50,
       statements: 50
     }
   }
   ```

2. **`CLAUDE.md`** (documento de gobernanza del proyecto) declaraba:
   > "Minimo 80% test coverage objetivo"

3. **Cobertura real observada:** El proyecto tiene **2324 tests** (2296 passed + 28 skipped, 63 spec files) con una cobertura cercana al 50%. Alcanzar 80% de forma inmediata requeriria duplicar el volumen de tests existentes, lo cual no es viable sin impactar el desarrollo de features en curso.

### Problema

- Si se sube el threshold de jest a 80%, el CI fallaria en practicamente todos los modulos, bloqueando cualquier merge.
- Si se deja CLAUDE.md con "80% minimo" sin calificacion, los agentes y desarrolladores interpretan un requisito estricto que no se cumple, generando confusion.
- No existe documentacion clara sobre la estrategia de mejora gradual.

---

## Decision

**Mantener 50% como umbral enforced en CI. Establecer 80% como meta aspiracional para codigo nuevo. Documentar la ruta de mejora gradual.**

### Reglas Concretas

| Aspecto | Valor |
|---------|-------|
| **Threshold CI (jest.config.js)** | 50% global (branches, functions, lines, statements) |
| **Meta codigo nuevo** | 80% para archivos creados a partir de esta fecha |
| **Meta proyecto largo plazo** | 80% global (evaluacion trimestral) |
| **Revision del threshold** | Trimestral — subir cuando el promedio global supere el threshold actual + 10% |

### Ruta de Mejora Gradual

1. **Fase actual (Q1 2026):** Mantener 50% enforced. Nuevos modulos/services deben aspirar a 80%.
2. **Q2 2026:** Evaluar cobertura global. Si supera 60%, subir threshold a 60%.
3. **Q3 2026:** Evaluar nuevamente. Subir a 70% si la cobertura lo permite.
4. **Q4 2026:** Objetivo 80% enforced si el proyecto alcanza esa cobertura de forma organica.

### Actualizaciones Realizadas

- `CLAUDE.md` actualizado: "Minimo 50% coverage enforced (objetivo 80% gradual — ver ADR-044)"
- `jest.config.js` sin cambios (ya estaba en 50%)

---

## Alternatives Considered

### Alternativa 1: Subir threshold a 80% inmediatamente

**Pros:**
- Fuerza escritura de tests a todo el equipo
- Meta ambiciosa impulsa calidad

**Cons:**
- CI roto en casi todos los modulos existentes
- Bloquea merges de features en progreso
- Genera tests superficiales para "cumplir el numero" sin valor real

**Decision:** Rechazada — el costo inmediato supera el beneficio.

### Alternativa 2: Bajar la meta documentada a 50% sin plan de mejora

**Pros:**
- Elimina la contradiccion de forma simple
- Alinea documentacion con realidad

**Cons:**
- Pierde la ambicion de calidad
- No incentiva mejora
- 50% es bajo para un proyecto en produccion activa

**Decision:** Rechazada — necesitamos un plan de mejora, no solo aceptar el status quo.

### Alternativa 3: Coverage por modulo diferenciado

**Pros:**
- Modulos criticos (auth, gamification) con threshold alto
- Modulos nuevos con threshold alto
- Modulos legacy con threshold permisivo

**Cons:**
- Configuracion compleja en jest.config.js
- Dificil de mantener con 23 modulos
- Genera confusion sobre que threshold aplica

**Decision:** Pospuesta — considerar cuando se implemente Nx/Turborepo (ver ADR-040).

---

## Consequences

### Positivas

1. **CI estable:** No se rompe el pipeline existente.
2. **Expectativas claras:** Desarrolladores y agentes saben que 50% es el piso y 80% es la meta.
3. **Mejora incremental:** El plan trimestral permite subir el threshold de forma organica.
4. **Codigo nuevo con mayor calidad:** La meta de 80% para archivos nuevos mejora la cobertura gradualmente.

### Negativas

1. **50% es bajo para produccion:** Algunos modulos criticos podrian tener gaps de cobertura.
2. **Requiere disciplina:** Sin enforcement automatico del 80% para codigo nuevo, depende de code review.
3. **Revision manual trimestral:** Alguien debe evaluar y ajustar el threshold periodicamente.

### Mitigaciones

- Code reviews deben verificar cobertura de archivos nuevos.
- Reportes de cobertura (lcov, html) disponibles para inspeccion manual.
- El plan trimestral tiene fechas concretas para revision.

---

## References

- `apps/backend/jest.config.js` — Configuracion actual de coverage thresholds
- `CLAUDE.md` — Documento de gobernanza del proyecto (seccion Flujo de Desarrollo)
- [Jest Coverage Configuration](https://jestjs.io/docs/configuration#coveragethreshold-object)

---

**Status:** Accepted
**Date Created:** 2026-02-17
**Last Updated:** 2026-02-17
**Supersedes:** N/A
**Superseded by:** N/A
