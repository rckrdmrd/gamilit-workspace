---
titulo: Estandar de Testing — Architecture Tests
tipo: estandar-proyecto
version: 3.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
autor: Equipo de Arquitectura
categoria: estandares
tags:
  - testing
  - architecture-tests
  - ts-arch
  - madge
  - circular-dependencies
aplica_a:
  - backend
  - frontend
  - fullstack
estado: vigente
---

# Estandar de Testing — Architecture Tests

> Archivo especializado extraido de `ESTANDAR-TESTING.md`. Ver [ESTANDAR-TESTING.md](ESTANDAR-TESTING.md) para el indice completo y secciones de Cobertura y Checklists.

## Referencias Cruzadas

| Archivo | Contenido |
|---------|-----------|
| [ESTANDAR-TESTING.md](ESTANDAR-TESTING.md) | Indice, Cobertura Minima (Sec. 5), Checklists (Sec. 9), Referencias |
| [ESTANDAR-TESTING-UNIT.md](ESTANDAR-TESTING-UNIT.md) | Unit Tests, Naming Conventions, Mocking, Test Data |
| [ESTANDAR-TESTING-INTEGRATION.md](ESTANDAR-TESTING-INTEGRATION.md) | Integration Tests (backend, frontend, DB) |
| [ESTANDAR-TESTING-E2E.md](ESTANDAR-TESTING-E2E.md) | E2E Tests + Visual Regression |

---

## 10. Architecture Tests

### 10.1 Proposito

Validar automaticamente que las reglas arquitectonicas del proyecto se mantienen conforme el codebase crece. Estos tests actuan como guardianes de la arquitectura, detectando violaciones de las convenciones establecidas antes de que lleguen a produccion.

En gamilit, con 23 modulos, 156 entities (157 classes), 108 controllers y 172 services, es esencial automatizar la validacion de dependencias entre capas para prevenir acoplamiento indebido.

### 10.2 Herramientas

| Herramienta | Uso | Package |
|-------------|-----|---------|
| ts-arch | Enforcement de reglas arquitectonicas | `ts-arch` |
| madge | Deteccion de dependencias circulares | `madge` |
| eslint-plugin-boundaries | Enforcement de limites de importacion | `eslint-plugin-boundaries` |

### 10.3 Reglas Obligatorias para Gamilit

Las siguientes reglas arquitectonicas DEBEN validarse automaticamente:

```
REGLA 1: Controllers NO importan Repositories directamente
  Controllers → Services → Repositories (siempre via service)
  Razon: Separacion de responsabilidades

REGLA 2: Entities NO dependen de Controllers
  Entities son clases puras de datos, sin logica de presentacion
  Razon: Entities pertenecen a la capa de dominio

REGLA 3: Sin dependencias circulares entre los 23 modulos
  Modulo A → Modulo B → Modulo A = PROHIBIDO
  Razon: Acoplamiento inmanejable a escala

REGLA 4: Guards solo en auth/ o shared/
  Ningun modulo define sus propios guards fuera de estas ubicaciones
  Razon: Centralizacion de seguridad

REGLA 5: DTOs no contienen logica de negocio
  DTOs solo tienen decoradores de validacion (@IsString, @IsEmail, etc.)
  Razon: DTOs son contratos de transporte, no entidades de dominio
```

### 10.4 Ejemplo de Validacion con ts-arch

```typescript
// tests/architecture/architecture.spec.ts
import { filesOfProject } from 'ts-arch';

describe('Architecture Rules', () => {
  it('controllers should not import repositories directly', async () => {
    const rule = filesOfProject()
      .inFolder('controllers')
      .shouldNot()
      .dependOnFiles()
      .inFolder('repositories');

    await expect(rule).toPassAsync();
  });

  it('entities should not depend on controllers', async () => {
    const rule = filesOfProject()
      .inFolder('entities')
      .shouldNot()
      .dependOnFiles()
      .inFolder('controllers');

    await expect(rule).toPassAsync();
  });
});
```

### 10.5 Deteccion de Dependencias Circulares

```bash
## Verificar dependencias circulares en backend
cd apps/backend && npx madge --circular --extensions ts src/

## Verificar dependencias circulares en frontend
cd apps/frontend && npx madge --circular --extensions ts,tsx src/

## Generar grafico visual de dependencias
npx madge --image graph.svg --extensions ts src/modules/
```

### 10.6 Frecuencia de Ejecucion

| Validacion | Cuando | Donde |
|-----------|--------|-------|
| Dependencias circulares | En cada PR | CI/CD (GitHub Actions) |
| Reglas ts-arch | En cada PR | CI/CD (GitHub Actions) |
| Limites de importacion (ESLint) | En cada save | Pre-commit hook + CI |

Ver: [GUIA-ARCHITECTURE-TESTING](../50-guides/testing/GUIA-ARCHITECTURE-TESTING.md) para implementacion detallada.

---

## Referencias Cruzadas

### Estandares Relacionados
- [ESTANDAR-BACKEND-PROFESIONAL.md](ESTANDAR-BACKEND-PROFESIONAL.md) - Testing patterns para backend NestJS
- [ESTANDAR-FRONTEND-PROFESIONAL.md](ESTANDAR-FRONTEND-PROFESIONAL.md) - Testing patterns para React

### Guias de Implementacion
- [GUIA-ARCHITECTURE-TESTING](../50-guides/testing/GUIA-ARCHITECTURE-TESTING.md) - Implementacion detallada de architecture tests

### Principios Aplicados
- [PRINCIPIO-SOLID](../../orchestration/directivas/principios/PRINCIPIO-SOLID.md) - Diseño testeable (SRP, DIP)
- [PRINCIPIO-VALIDACION-OBLIGATORIA](../../orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md) - Principio de validacion obligatoria (build + lint + tests)

## Referencias
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Trophy - Kent C. Dodds](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
