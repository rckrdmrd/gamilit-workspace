# Guia de Architecture Testing

---
titulo: Guia de Architecture Testing
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [testing, arquitectura, ts-arch, boundaries]
aplica_a: [backend]
estado: vigente
---

**Proyecto:** GAMILIT
**Version:** 1.0.0
**Fecha:** 2026-02-14
**Aplica a:** Backend (NestJS 11 + TypeORM 0.3.x)

---

## 1. Proposito

Validar que las reglas arquitectonicas del proyecto gamilit se cumplen automaticamente mediante tests. Esto previene la degradacion gradual de la arquitectura conforme crece el codebase (23 modulos, 155 entities (156 classes), 173 services, 108 controllers).

Los architecture tests son tests automatizados que verifican:

- **Dependencias entre capas** — Controllers no acceden directamente a Repositories
- **Aislamiento de modulos** — Modulos no importan de otros modulos sin pasar por su API publica
- **Reglas de nomenclatura** — Archivos y clases siguen convenciones consistentes
- **Ausencia de ciclos** — No existen dependencias circulares entre modulos

Estos tests se ejecutan junto con el suite de tests existente (833 tests passing, 57 spec files) y no requieren infraestructura adicional.

---

## 2. Herramientas

### 2.1 ts-arch — Architecture Tests para TypeScript

Libreria de testing arquitectonico para proyectos TypeScript, inspirada en ArchUnit (Java). Permite definir reglas de dependencia entre carpetas y archivos de forma declarativa.

```bash
# Instalacion
cd apps/backend
npm install --save-dev ts-arch
```

**Ventajas:**
- API declarativa y legible
- Compatible con Jest (ya configurado en `apps/backend/jest.config.js`)
- Verifica dependencias a nivel de imports reales
- Soporta patron async/await nativo

### 2.2 eslint-plugin-boundaries — Reglas ESLint de Import Boundaries

Plugin de ESLint que refuerza limites entre zonas del proyecto. Define que modulos pueden importar de cuales.

```bash
npm install --save-dev eslint-plugin-boundaries
```

**Uso principal:**
- Prevenir imports cruzados entre modulos NestJS
- Forzar que `shared/` sea la unica zona importable por todos
- Detectar violaciones en tiempo de lint (antes de compilar)

### 2.3 madge — Deteccion de Dependencias Circulares

Herramienta CLI que genera grafos de dependencia y detecta ciclos automaticamente.

```bash
npm install --save-dev madge
```

**Uso principal:**
- Detectar dependencias circulares (problema comun con 22 modulos NestJS)
- Generar visualizacion SVG del grafo de dependencias
- Integrar en CI como check de pre-merge

---

## 3. Tests Recomendados para Gamilit

Archivo destino: `apps/backend/src/__tests__/architecture.spec.ts`

### 3.1 Controllers no importan Repositories directamente

Los controllers deben comunicarse con la capa de datos exclusivamente a traves de services. Esto garantiza que la logica de negocio no se filtre a la capa de presentacion.

```typescript
import { filesOfProject } from 'ts-arch';

describe('Architecture Rules', () => {
  it('controllers should not import repositories', async () => {
    const rule = filesOfProject()
      .inFolder('controllers')
      .shouldNot()
      .dependOnFiles()
      .inFolder('repositories');

    await expect(rule).toPassAsync();
  });
});
```

**Justificacion en gamilit:** Con 108 controllers y 173 services, es critico mantener esta separacion. Un controller que accede directamente al repository bypasa validaciones de negocio, guards y interceptors.

### 3.2 Entities no importan de infrastructure

Las entities de TypeORM deben ser POCOs (Plain Old Class Objects) sin dependencia de controladores, services o modulos de infraestructura.

```typescript
it('entities should not depend on controllers', async () => {
  const rule = filesOfProject()
    .inFolder('entities')
    .shouldNot()
    .dependOnFiles()
    .inFolder('controllers');

  await expect(rule).toPassAsync();
});

it('entities should not depend on services', async () => {
  const rule = filesOfProject()
    .inFolder('entities')
    .shouldNot()
    .dependOnFiles()
    .inFolder('services');

  await expect(rule).toPassAsync();
});
```

**Justificacion en gamilit:** Las 155 entities (156 classes) del proyecto representan el modelo de datos de 18 schemas PostgreSQL. Deben ser independientes de la logica de negocio para permitir su reutilizacion en multiples services y modulos.

### 3.3 Sin dependencias circulares entre modulos

Las dependencias circulares entre modulos NestJS causan errores de inicializacion en runtime y dificultan el testing aislado.

```typescript
it('should have no circular dependencies between modules', async () => {
  const rule = filesOfProject()
    .inFolder('modules')
    .shouldNot()
    .haveCircularDependencies();

  await expect(rule).toPassAsync();
});
```

**Justificacion en gamilit:** Con 22 modulos interconectados (auth, educational, gamification, progress, etc.), las dependencias circulares son un riesgo real. NestJS tiene `forwardRef()` como escape, pero su uso debe ser excepcional y documentado.

> **Nota:** Los 22 modulos mencionados corresponden a los directorios fisicos listados en el test 3.4 a continuacion. El proyecto tiene 23 modulos conceptuales en total.

### 3.4 Cada modulo tiene su propio module.ts

Todo directorio bajo `apps/backend/src/modules/` debe contener un archivo `.module.ts` que defina el modulo NestJS correspondiente.

```typescript
import * as fs from 'fs';
import * as path from 'path';

it('each module directory should have a .module.ts file', () => {
  const modulesDir = path.resolve(__dirname, '../../modules');
  const moduleDirectories = [
    'admin',
    'assignments',
    'audit',
    'auth',
    'communication',
    'content',
    'educational',
    'etl',
    'gamification',
    'health',
    'lti',
    'mail',
    'ml',
    'notifications',
    'parents',
    'profile',
    'progress',
    'social',
    'tasks',
    'teacher',
    'visualization',
    'websocket',
  ];

  for (const dir of moduleDirectories) {
    const modulePath = path.join(modulesDir, dir);
    expect(fs.existsSync(modulePath)).toBe(true);

    const files = fs.readdirSync(modulePath);
    const hasModule = files.some((f) => f.endsWith('.module.ts'));
    expect(hasModule).withContext(`${dir} should have a .module.ts file`).toBe(true);
  }
});
```

**Nota:** Los 22 modulos listados corresponden a los directorios fisicos bajo `apps/backend/src/modules/`. Todos deben estar importados en `apps/backend/src/app.module.ts`.

### 3.5 Guards solo en auth o shared

Los guards de autorizacion y autenticacion deben residir exclusivamente en el modulo `auth` o en `shared/guards/`. Esto evita la dispersion de logica de seguridad.

```typescript
it('guards should only exist in auth or shared directories', async () => {
  const rule = filesOfProject()
    .matchingPattern('.*\\.guard\\.ts$')
    .should()
    .beInFolder('auth')
    .or()
    .beInFolder('shared');

  await expect(rule).toPassAsync();
});
```

**Justificacion en gamilit:** El proyecto tiene 15 guards. Centralizar su ubicacion en `auth/` y `shared/guards/` facilita la auditoria de seguridad y previene duplicacion de logica de acceso.

### 3.6 DTOs no contienen business logic

Los DTOs deben ser contenedores de datos con decoradores de validacion (`class-validator`), sin metodos de logica de negocio.

```typescript
it('DTOs should not import services or repositories', async () => {
  const rule = filesOfProject()
    .matchingPattern('.*\\.dto\\.ts$')
    .shouldNot()
    .dependOnFiles()
    .matchingPattern('.*\\.service\\.ts$');

  await expect(rule).toPassAsync();
});

it('DTOs should not import repositories', async () => {
  const rule = filesOfProject()
    .matchingPattern('.*\\.dto\\.ts$')
    .shouldNot()
    .dependOnFiles()
    .matchingPattern('.*\\.repository\\.ts$');

  await expect(rule).toPassAsync();
});
```

**Justificacion en gamilit:** Con 399 DTOs distribuidos en 23 modulos, mantener los DTOs como estructuras puras de datos es esencial para la mantenibilidad. La logica de transformacion pertenece a los services.

### 3.7 Interceptors en shared o su modulo especifico

```typescript
it('interceptors should be in shared or their specific module', async () => {
  const rule = filesOfProject()
    .matchingPattern('.*\\.interceptor\\.ts$')
    .should()
    .beInFolder('shared')
    .or()
    .beInFolder('audit');

  await expect(rule).toPassAsync();
});
```

**Justificacion en gamilit:** Los 5 interceptors del proyecto (RlsInterceptor, AuditInterceptor, TransformResponseInterceptor, etc.) deben estar centralizados. El `RlsInterceptor` en `shared/` aplica multi-tenancy a todos los queries.

---

## 4. Integracion con madge

### 4.1 Detectar dependencias circulares

```bash
# Detectar dependencias circulares en todos los modulos
npx madge --circular --extensions ts apps/backend/src/modules/

# Solo verificar un modulo especifico
npx madge --circular --extensions ts apps/backend/src/modules/auth/

# Excluir archivos de test
npx madge --circular --extensions ts --exclude '.*\\.spec\\.ts$' apps/backend/src/modules/
```

### 4.2 Generar grafico de dependencias

```bash
# Generar grafico SVG completo
npx madge --image deps.svg --extensions ts apps/backend/src/modules/

# Generar grafico de un modulo especifico
npx madge --image auth-deps.svg --extensions ts apps/backend/src/modules/auth/

# Generar grafico solo de dependencias circulares
npx madge --circular --image circular.svg --extensions ts apps/backend/src/modules/
```

### 4.3 Script npm para CI

Agregar al `package.json` de backend:

```json
{
  "scripts": {
    "test:arch": "jest --testPathPattern=architecture",
    "test:circular": "madge --circular --extensions ts src/modules/ && echo 'No circular dependencies found'",
    "deps:graph": "madge --image deps.svg --extensions ts src/modules/"
  }
}
```

---

## 5. Configuracion Jest para Architecture Tests

### 5.1 Ubicacion del archivo

```
apps/backend/src/
  __tests__/
    architecture.spec.ts    <-- Tests de arquitectura
    setup.ts                <-- Setup existente
```

### 5.2 Ejecutar architecture tests

```bash
# Ejecutar solo architecture tests
cd apps/backend
npx jest --testPathPattern="architecture"

# Ejecutar con verbose
npx jest --testPathPattern="architecture" --verbose

# Ejecutar junto con todos los tests
npx jest
```

### 5.3 Configuracion en jest.config.js existente

Los architecture tests ya son compatibles con la configuracion existente en `apps/backend/jest.config.js`:

- `preset: 'ts-jest'` — Compila TypeScript
- `testMatch: ['**/__tests__/**/*.spec.ts']` — Detecta el archivo
- `testEnvironment: 'node'` — Ejecucion en Node.js
- `maxWorkers: 1` — Ejecucion serial (compatible con ts-arch)

No se requieren cambios en la configuracion existente.

### 5.4 Integracion en CI Pipeline

```yaml
# Ejemplo para GitHub Actions
- name: Architecture Tests
  run: |
    cd apps/backend
    npx jest --testPathPattern="architecture" --ci
    npx madge --circular --extensions ts src/modules/
```

---

## 6. Configuracion de eslint-plugin-boundaries

### 6.1 Configuracion basica

Agregar al `.eslintrc.js` del backend:

```javascript
module.exports = {
  plugins: ['boundaries'],
  settings: {
    'boundaries/elements': [
      { type: 'shared', pattern: 'src/shared/*' },
      { type: 'config', pattern: 'src/config/*' },
      { type: 'module', pattern: 'src/modules/*', capture: ['module'] },
    ],
    'boundaries/ignore': ['**/*.spec.ts', '**/*.test.ts'],
  },
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          // Shared puede ser importado por cualquier modulo
          { from: 'module', allow: ['shared', 'config'] },
          // Shared no importa de modulos
          { from: 'shared', allow: ['shared', 'config'] },
          // Config no importa de modulos
          { from: 'config', allow: ['config'] },
          // Modulo puede importar de si mismo
          { from: [['module', { module: '${module}' }]], allow: [['module', { module: '${module}' }]] },
        ],
      },
    ],
  },
};
```

### 6.2 Excepciones conocidas en gamilit

Algunos modulos tienen dependencias legitimas entre si (registradas via `forwardRef()` en NestJS):

| Modulo Origen | Modulo Destino | Razon |
|---------------|----------------|-------|
| progress | educational | Tracking de progreso requiere definiciones de ejercicios |
| gamification | progress | XP y rangos dependen del progreso del estudiante |
| teacher | educational | Asignacion de ejercicios |
| notifications | auth | Notificaciones requieren datos de usuario |
| communication | auth | Mensajeria requiere contexto de usuario |

Estas excepciones deben configurarse explicitamente en las rules de boundaries.

---

## 7. Checklist de Architecture Tests

### Implementacion Inicial

- [ ] Instalar `ts-arch` como devDependency en `apps/backend/`
- [ ] Instalar `madge` como devDependency en `apps/backend/`
- [ ] Crear archivo `apps/backend/src/__tests__/architecture.spec.ts`
- [ ] Implementar regla: controllers no importan repositories
- [ ] Implementar regla: entities no dependen de controllers/services
- [ ] Implementar regla: sin dependencias circulares
- [ ] Implementar regla: cada modulo tiene .module.ts
- [ ] Implementar regla: guards centralizados en auth/shared
- [ ] Implementar regla: DTOs sin business logic
- [ ] Verificar que todos los tests pasan con `npx jest --testPathPattern="architecture"`

### Integracion Continua

- [ ] Agregar scripts `test:arch` y `test:circular` al package.json
- [ ] Configurar eslint-plugin-boundaries en .eslintrc.js
- [ ] Incluir architecture tests en pipeline CI
- [ ] Generar grafico de dependencias como artefacto de CI
- [ ] Documentar excepciones de boundaries legitimadas

### Mantenimiento

- [ ] Revisar architecture tests al agregar nuevo modulo
- [ ] Actualizar lista de modulos en test 3.4 al crear/eliminar modulo
- [ ] Verificar que nuevas dependencias inter-modulo estan documentadas
- [ ] Ejecutar `madge --circular` antes de cada merge a master

---

## 8. Reglas Arquitectonicas de gamilit (Resumen)

| Regla | Descripcion | Test |
|-------|-------------|------|
| R1 | Controllers no importan Repositories | 3.1 |
| R2 | Entities son independientes de infraestructura | 3.2 |
| R3 | Sin ciclos entre modulos | 3.3 |
| R4 | Todo modulo tiene .module.ts | 3.4 |
| R5 | Guards centralizados en auth/shared | 3.5 |
| R6 | DTOs sin logica de negocio | 3.6 |
| R7 | Interceptors centralizados | 3.7 |
| R8 | Shared es importable por todos; modulos no se importan entre si sin justificacion | boundaries |

---

## Referencias

- `apps/backend/jest.config.js` — Configuracion Jest existente
- `apps/backend/src/app.module.ts` — Registro de modulos e imports
- `docs/50-guides/testing/TESTING-GUIDE.md` — Guia general de testing
- `docs/50-guides/testing/GUIA-COVERAGE-TESTING.md` — Guia de cobertura
- [ts-arch](https://github.com/ts-arch/ts-arch) — Documentacion oficial
- [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) — Documentacion oficial
- [madge](https://github.com/pahen/madge) — Documentacion oficial
