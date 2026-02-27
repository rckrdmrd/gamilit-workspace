---
titulo: "ADR-014: Adopcion de Nil-Safety Patterns con Optional Chaining y Nullish Coalescing"
tipo: adr
fecha_creacion: "2025-11-23"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-014: Adopción de Nil-Safety Patterns con Optional Chaining y Nullish Coalescing

**Estado:** Aceptada
**Fecha:** 2025-11-23
**Autores:** Frontend-Developer, Architecture-Analyst
**Decisión:** Adoptar Optional Chaining (`?.`) y Nullish Coalescing (`??`) como patrón estándar para manejo de valores null/undefined
**Tags:** frontend, typescript, patterns, nil-safety, best-practices

---

## Contexto

El frontend de GAMILIT maneja datos que pueden ser `null` o `undefined` en múltiples escenarios:
- API responses durante loading states
- Datos opcionales del usuario (perfil incompleto)
- Datos anidados profundos (user.profile.gamification.rank)
- Arrays que pueden estar vacíos o undefined

### Situación Inicial

**Problema:** Sin un patrón estándar para manejar valores null/undefined

**Variantes encontradas en el código:**

```typescript
// Variante 1: Logical OR (||) - INCORRECTA
const rank = user.gamification.rank || 'Sin rango';
// ❌ Falla si rank = 0 o rank = ''

// Variante 2: Ternary con checks manuales - VERBOSE
const rank = user && user.gamification && user.gamification.rank
  ? user.gamification.rank
  : 'Sin rango';
// ❌ Difícil de leer

// Variante 3: Try-catch - ANTI-PATTERN
try {
  const rank = user.gamification.rank;
} catch {
  const rank = 'Sin rango';
}
// ❌ Try-catch NO es para control de flujo

// Variante 4: Lodash get - DEPENDENCIA INNECESARIA
import { get } from 'lodash';
const rank = get(user, 'gamification.rank', 'Sin rango');
// ❌ Requiere lodash (+25 KB)
```

### Problemas Identificados

#### 1. TypeError: Cannot Read Property

**Error más común en producción:**
```
TypeError: Cannot read property 'rank' of undefined
  at TeacherStudentsPage.tsx:42
```

**Causa:** Acceso a propiedades sin validar null/undefined

```typescript
// ❌ Código propenso a crash
const rank = user.gamification.rank;
//                ^^^^^^^^^^^^
// Si gamification es undefined → CRASH
```

#### 2. Logical OR (||) Con Falsy Values

**Bug real (BUG-FRONTEND-005):**

```typescript
// ❌ Lógica incorrecta
const count = comodinesInventory.pistas_count || 0;

// Si pistas_count = 0 (tiene 0 pistas)
// → count = 0 (CORRECTO por suerte)

// PERO si queremos mostrar:
const message = user.name || 'Anónimo';
// Si name = '' (string vacío válido)
// → message = 'Anónimo' ❌ (debería ser '')
```

**Problema:** `||` considera TODOS los falsy values (0, '', false, null, undefined)

#### 3. Nested Checks Verbosos

```typescript
// ❌ Código repetitivo y difícil de leer
const avatar = user && user.profile && user.profile.avatar
  ? user.profile.avatar
  : '/default-avatar.png';

// 4 líneas para un simple null check
```

---

## Decisión

**Adoptamos Optional Chaining (`?.`) + Nullish Coalescing (`??`)** como patrón estándar para nil-safety.

### Sintaxis

**Optional Chaining (`?.`):**
```typescript
// Acceso seguro a propiedades
user?.profile?.avatar

// Equivale a:
user !== null && user !== undefined
  && user.profile !== null && user.profile !== undefined
  ? user.profile.avatar
  : undefined
```

**Nullish Coalescing (`??`):**
```typescript
// Default value SOLO para null/undefined
value ?? defaultValue

// Equivale a:
value !== null && value !== undefined
  ? value
  : defaultValue
```

### Implementación Estándar

**Patrón recomendado:**
```typescript
// ✅ CORRECTO: Optional chaining + Nullish coalescing
const rank = user?.gamification?.rank ?? 'Sin rango';
```

**Por qué funciona:**
1. `user?.gamification?.rank` retorna el valor o `undefined`
2. `?? 'Sin rango'` aplica default SOLO si es `null` o `undefined`
3. Respeta falsy values válidos (0, '', false)

---

## Alternativas Consideradas

### Alternativa 1: Logical OR (`||`)

**Descripción:** Usar operador OR lógico para default values

**Pros:**
- ✅ Sintaxis corta
- ✅ Soportado en ES5+ (no requiere transpiling)

**Cons:**
- ❌ Falla con falsy values válidos (0, '', false)
- ❌ Comportamiento inesperado para principiantes
- ❌ No es semánticamente correcto (|| es para lógica booleana)

**Ejemplo:**
```typescript
const count = inventory.pistas_count || 0;
// ❌ Si count = 0 → retorna 0 (correcto por casualidad)
// ❌ Si name = '' → retorna 'Anónimo' (INCORRECTO)
```

**Veredicto:** ❌ **RECHAZADA** - Comportamiento inconsistente con falsy values

---

### Alternativa 2: Default Parameters

**Descripción:** Usar default parameters en funciones

**Pros:**
- ✅ Type-safe
- ✅ Semánticamente correcto
- ✅ Solo aplica para undefined (no null)

**Cons:**
- ⚠️ Solo funciona en function parameters (no object properties)
- ❌ No sirve para nested access

**Ejemplo:**
```typescript
function greet(name: string = 'Anónimo') {
  return `Hola, ${name}`;
}

// ✅ Funciona para parameters
greet();  // 'Hola, Anónimo'
greet(undefined);  // 'Hola, Anónimo'

// ❌ NO funciona para object access
const rank = user.gamification?.rank = 'Sin rango';  // Syntax error
```

**Veredicto:** ⚠️ **USO LIMITADO** - Solo para function parameters, no reemplaza nil-safety

---

### Alternativa 3: Lodash `get()`

**Descripción:** Usar `_.get()` de Lodash para safe property access

**Pros:**
- ✅ Safe deep property access
- ✅ Default value support
- ✅ Battle-tested (usado por millones)

**Cons:**
- ❌ Requiere dependencia externa (+25 KB con tree-shaking, +70 KB sin)
- ❌ Performance overhead (función adicional)
- ❌ String-based paths (no type-safe)
- ❌ Menos legible que native syntax

**Ejemplo:**
```typescript
import { get } from 'lodash';

const rank = get(user, 'gamification.rank', 'Sin rango');
//                      ^^^^^^^^^^^^^^^^^^
// ❌ String path: no autocomplete, no type checking
```

**Veredicto:** ❌ **RECHAZADA** - Bundle size injustificado cuando TypeScript tiene sintaxis nativa

---

### Alternativa 4: Optional Chaining + Nullish Coalescing (TypeScript Native)

**Descripción:** Usar sintaxis nativa de TypeScript/ES2020

**Pros:**
- ✅ Sintaxis nativa (0 KB bundle overhead)
- ✅ Type-safe (TypeScript valida en compile-time)
- ✅ Legible y conciso
- ✅ Performance óptimo (compila a checks simples)
- ✅ Estándar ECMAScript (ES2020)
- ✅ Soportado por todos los browsers modernos

**Cons:**
- ⚠️ Requiere TypeScript 3.7+ (ya lo tenemos)
- ⚠️ Requires transpiling para IE11 (no es concern - no soportamos IE11)

**Ejemplo:**
```typescript
const rank = user?.gamification?.rank ?? 'Sin rango';
// ✅ Type-safe
// ✅ Autocomplete
// ✅ Compila a código eficiente
```

**Veredicto:** ✅ **SELECCIONADA** - Mejor opción en todos los aspectos

---

## Tabla Comparativa

| Característica | `||` | Default Params | Lodash `get()` | `?.` + `??` |
|----------------|------|----------------|----------------|-------------|
| **Bundle Size** | 0 KB | 0 KB | 25 KB | 0 KB |
| **Type-Safe** | ❌ No | ✅ Sí | ❌ No | ✅ Sí |
| **Falsy Values** | ❌ Falla | ✅ OK | ✅ OK | ✅ OK |
| **Deep Nesting** | ⚠️ Verbose | ❌ No | ✅ Sí | ✅ Sí |
| **Legibilidad** | ⚠️ Media | ✅ Alta | ⚠️ Media | ✅ Alta |
| **Performance** | ✅ Alta | ✅ Alta | ⚠️ Media | ✅ Alta |
| **Standard** | ES5 | ES6 | N/A | ES2020 |

**Conclusión:** Optional Chaining + Nullish Coalescing es la mejor opción.

---

## Consecuencias

### Positivas ✅

#### 1. Código Más Conciso

**Antes:**
```typescript
const rank = user && user.gamification && user.gamification.rank
  ? user.gamification.rank
  : 'Sin rango';
```

**Después:**
```typescript
const rank = user?.gamification?.rank ?? 'Sin rango';
```

**Reducción:** 4 líneas → 1 línea (75% menos código)

#### 2. Type-Safety Garantizado

```typescript
// ✅ TypeScript valida tipos
interface User {
  gamification?: {
    rank?: string;
  };
}

const rank = user?.gamification?.rank ?? 'Sin rango';
//                                  ^^^^
// TypeScript sabe que rank es string | undefined
```

#### 3. Prevención de TypeError

**Antes (propenso a crashes):**
```typescript
const rank = user.gamification.rank;  // ❌ Crash si gamification undefined
```

**Después (safe):**
```typescript
const rank = user?.gamification?.rank ?? 'Sin rango';  // ✅ Nunca crashea
```

#### 4. Zero Bundle Overhead

**Comparación:**
- Lodash `get()`: +25 KB
- Optional Chaining + Nullish Coalescing: **0 KB** (sintaxis nativa)

**Transpiled output (TypeScript → JavaScript):**
```javascript
// Input TypeScript
const rank = user?.gamification?.rank ?? 'Sin rango';

// Output JavaScript (ES2020 target)
const rank = user?.gamification?.rank ?? 'Sin rango';

// Output JavaScript (ES5 target - legacy)
var _a, _b;
const rank = (_b = (_a = user) === null || _a === void 0
  ? void 0
  : _a.gamification) === null || _b === void 0
  ? void 0
  : _b.rank) !== null && _b !== void 0
  ? _b
  : 'Sin rango';
```

**Bundle impact:** Mínimo (<1% overhead en ES5 target)

---

### Negativas ⚠️

#### 1. Curva de Aprendizaje Inicial

**Conceptos nuevos:**
- Diferencia entre `?.` y `.`
- Diferencia entre `??` y `||`
- Cuándo usar cada operador

**Mitigación:**
- ✅ Documentación interna con ejemplos
- ✅ ESLint rule para detectar uso de `||` donde debería ser `??`
- ✅ Code reviews

#### 2. Puede Ocultar Bugs de Datos Faltantes

**Ejemplo:**
```typescript
// ❌ Anti-pattern: ocultar bugs
const rank = user?.gamification?.rank ?? 'Sin rango';

// Si gamification DEBERÍA existir siempre, este code oculta el bug
// Mejor validar explícitamente:
if (!user?.gamification) {
  console.error('User missing gamification data');
  Sentry.captureException(new Error('Missing gamification'));
}
const rank = user.gamification.rank ?? 'Sin rango';
```

**Guía:**
- ✅ Usar `?.` cuando datos son OPCIONALMENTE opcionales
- ❌ NO usar `?.` para "esconder" datos que DEBERÍAN existir

---

## Guía de Uso

### Caso 1: Nested Property Access

```typescript
// ✅ CORRECTO
const avatar = user?.profile?.avatar ?? '/default-avatar.png';

// ❌ INCORRECTO
const avatar = (user && user.profile && user.profile.avatar) || '/default-avatar.png';
```

### Caso 2: Array Length

```typescript
// ✅ CORRECTO
const count = students?.length ?? 0;

// ❌ INCORRECTO
const count = students ? students.length : 0;
```

### Caso 3: Falsy Values Válidos

```typescript
// ✅ CORRECTO (respeta 0)
const pistas = inventory?.pistas_count ?? 0;
// Si pistas_count = 0 → retorna 0 ✅

// ❌ INCORRECTO (falla con 0)
const pistas = inventory?.pistas_count || 0;
// Si pistas_count = 0 → retorna 0 (correcto por suerte, pero mal pattern)
```

### Caso 4: Optional Function Calls

```typescript
// ✅ CORRECTO
const result = obj?.method?.();

// Equivale a:
const result = obj && obj.method ? obj.method() : undefined;
```

---

## Anti-Patterns a Evitar

### Anti-Pattern 1: Usar `||` Para Default Values

```typescript
// ❌ MALO
const name = user.name || 'Anónimo';  // Falla si name = ''

// ✅ BUENO
const name = user.name ?? 'Anónimo';  // Respeta ''
```

### Anti-Pattern 2: Over-using Optional Chaining

```typescript
// ❌ MALO (oculta bugs)
const rank = user?.gamification?.rank ?? 'Sin rango';
// Si gamification SIEMPRE debería existir, esto esconde el bug

// ✅ BUENO (valida explícitamente)
if (!user.gamification) {
  throw new Error('User missing gamification data');
}
const rank = user.gamification.rank ?? 'Sin rango';
```

### Anti-Pattern 3: Mixing `||` and `??`

```typescript
// ❌ CONFUSO
const value = data?.field || defaultValue ?? fallback;

// ✅ CLARO
const value = data?.field ?? defaultValue;
```

---

## Ejemplos Reales del Proyecto

### Ejemplo 1: TeacherStudentsPage

```typescript
// apps/frontend/src/apps/teacher/pages/TeacherStudents.tsx

// ✅ Safe rank display
const rank = student.user?.gamification?.rank ?? 'Sin rango';

// ✅ Safe student count
const studentCount = students?.length ?? 0;

// ✅ Safe classroom name
const classroomName = selectedClassroom?.name ?? 'Todos los estudiantes';
```

### Ejemplo 2: GamificationWidget

```typescript
// ✅ Safe XP display
const xp = gamificationData?.xp ?? 0;

// ✅ Safe coins display
const coins = gamificationData?.coins ?? 0;

// ✅ Safe achievements count
const achievementsCount = gamificationData?.achievements?.length ?? 0;
```

---

## TypeScript Configuration

**Requerido en tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,  // ✅ REQUERIDO
    "target": "ES2020",         // ✅ Para native support
    "lib": ["ES2020", "DOM"]
  }
}
```

**Con `strictNullChecks: true`:**
- TypeScript diferencia `T` vs `T | null` vs `T | undefined`
- Fuerza uso explícito de null checks
- Previene accesos inseguros en compile-time

---

## ESLint Rules (Recomendadas)

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Warn cuando se usa || con objetos (probablemente debería ser ??)
    'prefer-nullish-coalescing': 'warn',

    // Warn cuando se usa && para property access (debería ser ?.)
    'prefer-optional-chain': 'warn',
  },
};
```

---

## Referencias

- [TC39 Optional Chaining Proposal](https://github.com/tc39/proposal-optional-chaining)
- [TC39 Nullish Coalescing Proposal](https://github.com/tc39/proposal-nullish-coalescing)
- [TypeScript 3.7 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html)
- [MDN: Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [MDN: Nullish Coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- [Implementation in TeacherStudentsPage](../../apps/frontend/src/apps/teacher/pages/TeacherStudents.tsx)

---

**Versión:** 1.0.0
**Última actualización:** 2025-11-24
**Estado:** Aceptada e Implementada
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
