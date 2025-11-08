# Métricas y Cobertura de Testing - GAMILIT

**Proyecto:** GAMILIT - Consolidación GAMILIT Platform
**Módulo:** Métricas y Estándares de Cobertura de Testing
**Fecha:** 2025-10-27
**Versión:** 1.0
**Documento RFC:** RFC-0001

---

## Introducción

Esta guía define los estándares de cobertura de código y métricas de calidad para el proyecto GAMILIT. El objetivo es mantener un nivel de testing consistente que garantice la confiabilidad del código sin sacrificar velocidad de desarrollo.

La cobertura de código no es un fin en sí misma, sino una herramienta para identificar áreas sin testear y garantizar que el código crítico de negocio está adecuadamente probado.

---

## Objetivo de Cobertura

### Estándar Mínimo: 80%

GAMILIT establece un objetivo de cobertura mínimo del **80%** en todas las métricas principales:

- **Lines (Líneas):** 80%
- **Functions (Funciones):** 80%
- **Branches (Ramas):** 80%
- **Statements (Sentencias):** 80%

### Priorización por Criticidad

No todo el código requiere el mismo nivel de cobertura:

| Nivel de Criticidad | Tipo de Código | Cobertura Objetivo |
|---------------------|----------------|-------------------|
| **Crítico** | Servicios de negocio, autenticación, pagos | 90-95% |
| **Alto** | Repositorios, controladores, validaciones | 80-90% |
| **Medio** | Components UI, hooks, utils | 70-80% |
| **Bajo** | Configuración, constantes, tipos | 50-70% |

---

## Métricas de Cobertura

### 1. Line Coverage (Cobertura de Líneas)

**Definición:** Porcentaje de líneas de código ejecutadas durante los tests.

**Ejemplo:**

```typescript
function calculateDiscount(price: number, isStudent: boolean): number {
  let discount = 0;

  if (isStudent) {              // Línea ejecutada
    discount = price * 0.2;     // Línea ejecutada
  }

  return price - discount;      // Línea ejecutada
}

// Test que cubre solo el caso isStudent=true
// Line Coverage: 100% (todas las líneas ejecutadas)
```

**Importancia:** Indica qué partes del código se ejecutan, pero no garantiza que todos los caminos lógicos se testean.

---

### 2. Function Coverage (Cobertura de Funciones)

**Definición:** Porcentaje de funciones llamadas al menos una vez durante los tests.

**Ejemplo:**

```typescript
class UserService {
  async getUser(id: string) {
    return this.repo.findById(id);
  }

  async createUser(data: UserData) {
    return this.repo.create(data);
  }

  async deleteUser(id: string) {
    return this.repo.delete(id);
  }
}

// Si solo testeamos getUser y createUser
// Function Coverage: 66.7% (2 de 3 funciones)
```

**Importancia:** Identifica funciones completamente sin testear.

---

### 3. Branch Coverage (Cobertura de Ramas)

**Definición:** Porcentaje de ramas de decisión (if, switch, ternarios) ejecutadas.

**Ejemplo:**

```typescript
function validateAge(age: number): string {
  if (age < 0) {
    return 'Invalid age';
  } else if (age < 18) {
    return 'Minor';
  } else {
    return 'Adult';
  }
}

// Test 1: validateAge(25) -> ejecuta rama "age >= 18"
// Test 2: validateAge(15) -> ejecuta rama "age < 18 && age >= 0"
// Test 3: validateAge(-5) -> ejecuta rama "age < 0"
// Branch Coverage: 100% (3 de 3 ramas)
```

**Importancia:** Métrica más crítica, asegura que todos los caminos lógicos se testean.

---

### 4. Statement Coverage (Cobertura de Sentencias)

**Definición:** Porcentaje de sentencias ejecutables (asignaciones, llamadas, returns) ejecutadas.

**Ejemplo:**

```typescript
function processOrder(order: Order): void {
  const total = calculateTotal(order);     // Sentencia 1
  const tax = total * 0.16;                // Sentencia 2
  order.total = total + tax;               // Sentencia 3
  order.status = 'processed';              // Sentencia 4
  saveOrder(order);                        // Sentencia 5
}

// Test que ejecuta processOrder una vez
// Statement Coverage: 100% (5 de 5 sentencias)
```

**Importancia:** Similar a line coverage, pero cuenta sentencias ejecutables.

---

## Configuración de Thresholds

### Backend (Jest)

**jest.config.js**

```javascript
module.exports = {
  // ... otras configuraciones
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.types.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/server.ts',
    '!src/**/*.config.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Thresholds específicos para módulos críticos
    './src/modules/auth/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/modules/payments/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

---

### Frontend (Vitest)

**vitest.config.ts**

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/types.ts',
        '**/constants.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      // Thresholds por archivo
      perFile: true,
      // Fallar CI si no se alcanza el threshold
      thresholdAutoUpdate: false,
    },
  },
});
```

---

## Reportes de Cobertura

### Formato de Reportes

GAMILIT genera reportes en múltiples formatos:

1. **Text (Terminal):** Vista rápida durante desarrollo
2. **HTML:** Reporte navegable para análisis detallado
3. **JSON:** Para integración con herramientas CI/CD
4. **LCOV:** Para integración con SonarQube/Codecov

### Generar Reportes

**Backend:**
```bash
npm run test:coverage

# Reporte generado en:
# coverage/
#   ├── lcov-report/index.html  (navegable)
#   ├── coverage-final.json
#   └── lcov.info
```

**Frontend:**
```bash
npm run test:coverage

# Reporte generado en:
# coverage/
#   ├── index.html              (navegable)
#   ├── coverage-final.json
#   └── lcov.info
```

---

### Interpretar Reportes HTML

El reporte HTML muestra:

- **Verde:** Líneas/ramas cubiertas (>80%)
- **Amarillo:** Líneas/ramas parcialmente cubiertas (50-80%)
- **Rojo:** Líneas/ramas sin cubrir (<50%)

**Ejemplo de vista:**

```
File                          | % Stmts | % Branch | % Funcs | % Lines |
------------------------------|---------|----------|---------|---------|
auth/                         |   95.2  |   90.5   |   100   |   95.2  |
  auth.service.ts             |   100   |   100    |   100   |   100   |
  auth.controller.ts          |   92.5  |   85.7   |   100   |   92.5  |
  auth.middleware.ts          |   90.0  |   83.3   |   100   |   90.0  |
exercises/                    |   82.3  |   78.6   |   88.9  |   82.3  |
  exercise.service.ts         |   88.0  |   82.1   |   100   |   88.0  |
  exercise.repository.ts      |   75.0  |   71.4   |   75.0  |   75.0  |
------------------------------|---------|----------|---------|---------|
All files                     |   85.5  |   81.2   |   90.0  |   85.5  |
```

---

## Exclusiones de Cobertura

### Archivos que NO Requieren Cobertura

**Backend:**
- `**/*.types.ts` - Definiciones de tipos TypeScript
- `**/*.d.ts` - Archivos de declaración
- `**/*.interface.ts` - Interfaces
- `**/*.config.ts` - Configuraciones
- `server.ts` - Entry point de servidor
- `migrations/` - Migraciones de base de datos
- `seeds/` - Datos de seed

**Frontend:**
- `**/*.d.ts` - Archivos de declaración
- `**/*.config.*` - Configuraciones (vite, tailwind, etc.)
- `main.tsx` - Entry point
- `vite-env.d.ts` - Tipos de Vite
- `**/types.ts` - Definiciones de tipos
- `**/constants.ts` - Constantes
- `**/mockData/` - Datos de prueba

### Comentarios de Exclusión

Para excluir líneas específicas:

**Jest/Vitest:**
```typescript
/* istanbul ignore next */
function legacyFunction() {
  // Código legacy que será removido
}

// o

function riskyOperation() {
  try {
    dangerousCode();
  } catch (error) {
    /* istanbul ignore next */
    throw new Error('Unexpected error');
  }
}
```

**IMPORTANTE:** Usar con moderación. Las exclusiones deben justificarse.

---

## Integración con CI/CD

### GitHub Actions

**Archivo:** `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: true

      - name: Check coverage thresholds
        run: |
          if [ $(cat coverage/coverage-summary.json | jq '.total.lines.pct') -lt 80 ]; then
            echo "Coverage is below 80%"
            exit 1
          fi
```

---

### SonarQube

**Archivo:** `sonar-project.properties`

```properties
sonar.projectKey=gamilit
sonar.projectName=GAMILIT Platform
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.spec.ts
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.ts,**/*.spec.ts,**/*.config.ts,**/*.d.ts

# Thresholds de calidad
sonar.coverage.line=80
sonar.coverage.branch=80
```

---

## Mejores Prácticas

### 1. Cobertura No Es Calidad

- 80% de cobertura con tests mal escritos es peor que 50% con tests significativos
- Priorizar tests que validan comportamiento de negocio
- Evitar tests triviales solo para alcanzar cobertura

### 2. Test de Comportamiento, No Implementación

**Malo:**
```typescript
it('should call repository.findById', async () => {
  await service.getUser('user-123');
  expect(mockRepo.findById).toHaveBeenCalled(); // Test de implementación
});
```

**Bueno:**
```typescript
it('should return user when user exists', async () => {
  mockRepo.findById.mockResolvedValue(mockUser);
  const result = await service.getUser('user-123');
  expect(result).toEqual(mockUser); // Test de comportamiento
});
```

### 3. Branch Coverage es Clave

- Priorizar branch coverage sobre line coverage
- Testear todos los caminos de decisión (if/else, switch, ternarios)
- Incluir casos de error y edge cases

### 4. Revisar Reportes Regularmente

- Revisar coverage/index.html después de cada feature
- Identificar archivos con baja cobertura
- Priorizar testing de código crítico

### 5. Coverage en Code Reviews

- Verificar que nuevos PRs no disminuyen cobertura global
- Requerir tests para nuevas features
- Discutir exclusiones de cobertura en revisiones

---

## Estrategia de Mejora de Cobertura

### Identificar Áreas Sin Cubrir

1. **Generar reporte HTML:**
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

2. **Filtrar por cobertura baja:**
   - Ordenar archivos por % de cobertura
   - Identificar archivos <80%
   - Priorizar archivos críticos

3. **Analizar líneas sin cubrir:**
   - Click en archivo para ver líneas rojas
   - Identificar ramas sin testear
   - Determinar si son casos importantes

### Plan de Acción

**Ejemplo:**

```
Archivo: src/modules/exercises/exercise.service.ts
Cobertura actual: 68%
Líneas sin cubrir: 45, 67-72, 89

Plan:
1. Línea 45: Error handling cuando ejercicio no existe
   -> Agregar test: "should throw error when exercise not found"

2. Líneas 67-72: Validación de config de crucigrama
   -> Agregar test: "should validate crossword config"

3. Línea 89: Límite de intentos máximos
   -> Agregar test: "should prevent submission after max attempts"
```

---

## Comandos Útiles

### Cobertura Completa

```bash
# Backend
npm run test:coverage

# Frontend
npm run test:coverage

# Ambos (desde raíz)
npm run test:coverage --workspaces
```

### Cobertura de Archivo Específico

```bash
# Backend (Jest)
npm test -- auth.service.test.ts --coverage

# Frontend (Vitest)
npm run test -- LoginPage.test.tsx --coverage
```

### Cobertura por Módulo

```bash
# Backend
npm test -- --coverage --collectCoverageFrom="src/modules/auth/**/*.ts"

# Frontend
npm run test -- --coverage src/features/auth
```

### Ver Solo Archivos con Baja Cobertura

```bash
# Generar JSON y filtrar
npm run test:coverage -- --json --outputFile=coverage.json
jq '.coverageMap | to_entries | map(select(.value.lines.pct < 80))' coverage.json
```

---

## Métricas de Calidad Adicionales

### Mutation Testing

Considera implementar mutation testing para validar calidad de tests:

- **Stryker:** Framework de mutation testing
- **Objetivo:** Detectar tests que no fallan cuando el código cambia
- **Configuración futura**

### Test Performance

Monitorear tiempo de ejecución de tests:

```bash
# Backend
npm test -- --verbose --maxWorkers=50%

# Frontend
npm run test -- --reporter=verbose
```

**Objetivo:** Suite de tests <5 minutos en CI/CD

---

## Referencias

### Documentación Oficial
- [Jest Coverage](https://jestjs.io/docs/configuration#collectcoverage-boolean)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [Istanbul Documentation](https://istanbul.js.org/)
- [c8 Coverage](https://github.com/bcoe/c8)

### Herramientas de Análisis
- [Codecov](https://about.codecov.io/)
- [SonarQube](https://www.sonarqube.org/)
- [Coveralls](https://coveralls.io/)

### Documentación Interna GAMILIT
- [Testing Backend](./Testing-Backend.md)
- [Testing Frontend](./Testing-Frontend.md)
- [Testing Integración](./Testing-Integracion.md)

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Autor:** Equipo GAMILIT
**RFC:** RFC-0001
**Cobertura objetivo:** 80%
