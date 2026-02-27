---
titulo: Estandar Frontend - Componentes
tipo: estandar-proyecto
version: 1.0.0
fecha_creacion: 2026-02-19
ultima_actualizacion: 2026-02-27
---

# ESTANDAR-FRONTEND-COMPONENT — Estándar de Componentes Frontend

**Version:** 1.0.0 | **Fecha:** 2026-02-19 | **Estado:** Activo
**Basado en:** 01-AUDIT-COMPONENT-PATTERNS.md (602 archivos analizados)

## 1. Export Patterns

### 1.1 Regla: Pages → `export default function`

```tsx
// ✅ CORRECTO — Todas las páginas
export default function DashboardPage() {
  return <div>...</div>;
}

// ❌ INCORRECTO
export const DashboardPage: React.FC = () => { ... };
export default DashboardPage;
```

**Razón:** Las páginas se importan con lazy loading (`React.lazy`) que requiere default export. Named function facilita debugging en React DevTools.

### 1.2 Regla: Components → `export function`

```tsx
// ✅ CORRECTO — Todos los componentes
export function StudentCard({ name, rank }: StudentCardProps) {
  return <div>...</div>;
}

// ❌ INCORRECTO
export const StudentCard: React.FC<StudentCardProps> = ({ name, rank }) => { ... };
```

**Razón:**
- `React.FC` está deprecated desde React 18 (ya no agrega `children` implícito)
- `export function` es más conciso y mejor para stack traces
- Consistente con ESTANDAR-FRONTEND-PROFESIONAL.md existente

### 1.3 Regla: NO dual exports

```tsx
// ❌ INCORRECTO — No tener ambos
export const MyComponent: React.FC = () => { ... };
export default MyComponent;

// ✅ CORRECTO — Solo uno
export function MyComponent() { ... }
```

**Excepción:** Componentes que son tanto importados con nombre como usados en lazy loading pueden tener dual export, pero esto debe ser explícito con un comentario.

---

## 2. Props Typing

### 2.1 Regla: `interface ComponentNameProps` (named, co-located)

```tsx
// ✅ CORRECTO
interface StudentCardProps {
  name: string;
  rank: string;
  xp: number;
}

export function StudentCard({ name, rank, xp }: StudentCardProps) { ... }

// ❌ INCORRECTO — interface genérica
interface Props { ... }

// ❌ INCORRECTO — type alias (usar interface para props)
type StudentCardProps = { ... };

// ❌ INCORRECTO — inline destructuring sin tipo
export function StudentCard({ name, rank, xp }) { ... }
```

**Nota:** El audit confirmó 318/602 archivos ya usan este patrón. Es el estándar de facto.

### 2.2 Regla: Props con children → explícito

```tsx
// ✅ CORRECTO
interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

// ❌ INCORRECTO — React.FC agregaba children implícitamente (ya no)
```

---

## 3. React Imports

### 3.1 Regla: Solo named imports, NO `import React`

```tsx
// ✅ CORRECTO — Solo lo necesario
import { useState, useEffect, useCallback } from 'react';

// ❌ INCORRECTO — innecesario desde React 17 + Vite JSX transform
import React from 'react';
import React, { useState } from 'react';
```

**Excepción:** `React.ReactNode`, `React.FC` (durante migración), `React.memo`, `React.lazy`, `React.Suspense` — si se usan, importar como named:

```tsx
// ✅ CORRECTO
import { memo, lazy, Suspense, type ReactNode } from 'react';
```

**Impacto:** ~201 archivos necesitan limpieza del `import React`.

---

## 4. Component Size

### 4.1 Regla: Máximo 300 LOC por componente

| Rango | Acción |
|-------|--------|
| < 50 LOC | OK |
| 50-150 LOC | OK — tamaño ideal |
| 150-300 LOC | Aceptable — revisar si se puede extraer |
| 300-500 LOC | **Requiere justificación** — considerar split |
| > 500 LOC | **Obligatorio split** — extraer subcomponentes |

### 4.2 Componentes que necesitan split (del audit)

| Archivo | LOC | Acción sugerida |
|---------|-----|-----------------|
| `ExerciseContentRenderer.tsx` | 1761 | Extraer renderers por tipo |
| `ResponseDetailModal.tsx` | 1002 | Extraer secciones en subcomponentes |
| `TeacherGamification.tsx` | 917 | Extraer tabs en componentes |

---

## 5. File Naming

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componente | PascalCase | `StudentCard.tsx` |
| Page | PascalCase + `Page` suffix | `DashboardPage.tsx` |
| Hook | camelCase + `use` prefix | `useStudentData.ts` |
| Type file | camelCase + `.types.ts` | `student.types.ts` |
| API file | camelCase + `API.ts` o `.api.ts` | `studentAPI.ts` |
| Utility | camelCase | `formatDate.ts` |
| Barrel | `index.ts` | `index.ts` |

---

## Migración

**Prioridad 1 (Quick):** Eliminar `import React` innecesarios (~201 archivos)
**Prioridad 2 (Gradual):** Migrar `export const: React.FC` → `export function` (~282 archivos)
**Prioridad 3 (Cuando se toque):** Split de componentes >500 LOC (~14 archivos)
