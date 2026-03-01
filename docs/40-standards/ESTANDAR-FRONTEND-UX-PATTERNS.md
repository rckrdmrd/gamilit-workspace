---
titulo: Estandar Frontend - Patrones UX (Error, Loading, Forms)
tipo: estandar-proyecto
version: 1.0.0
fecha_creacion: 2026-02-19
ultima_actualizacion: 2026-02-27
---

# ESTANDAR-FRONTEND-UX-PATTERNS — Estándar de Patrones UX (Error, Loading, Forms)

**Version:** 1.0.0 | **Fecha:** 2026-02-19 | **Estado:** Activo
**Basado en:** 05-AUDIT-ERROR-LOADING-FORMS.md (277 try/catch, 163 empty states, 25+ forms)

## 1. Error Handling

### 1.1 Regla: ErrorBoundary en cada portal root

```tsx
// App.tsx — cada portal route envuelto
<Route path="/student/*" element={
  <ErrorBoundary fallback={<PortalErrorFallback portal="student" />}>
    <StudentLayout />
  </ErrorBoundary>
} />
```

**Hallazgo:** 2 ErrorBoundary existen pero NINGUNO se usa en rutas. Un error de render crashea toda la app.

### 1.2 Regla: Componente `ErrorMessage` estándar

```tsx
// shared/components/feedback/ErrorMessage.tsx
interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title, message, onRetry }: ErrorMessageProps) {
  // detective-theme styling, icon, retry button
}
```

**Uso obligatorio:** Reemplaza los 5 patrones actuales de error display inline.

### 1.3 Regla: Toast para feedback de acciones

```tsx
// ✅ CORRECTO — toast para mutations
onSuccess: () => toast.success('Guardado exitosamente'),
onError: (error) => toast.error(error.message || 'Error al guardar'),

// ❌ INCORRECTO — sin feedback
onSuccess: () => { /* silencio */ },
onError: (error) => console.error(error),
```

**Librería:** `react-hot-toast` (ya estándar, 44 archivos). **Parent portal necesita adopción (0 toasts).**

---

## 2. Loading States

### 2.1 Regla: Componentes de Loading canónicos

| Componente | Uso | Path |
|-----------|-----|------|
| `SkeletonCard` | Cards, list items | `shared/components/loading/SkeletonCard.tsx` |
| `SkeletonTable` | Tablas | `shared/components/loading/SkeletonTable.tsx` |
| `SkeletonStats` | Stat counters | `shared/components/loading/SkeletonStats.tsx` |
| `LoadingSpinner` | Inline small loading | `shared/components/loading/LoadingSpinner.tsx` |
| `LoadingOverlay` | Full-page overlay | `shared/components/loading/LoadingOverlay.tsx` |

### 2.2 Regla: SOLO detective-theme skeletons

```tsx
// ✅ CORRECTO — detective theme
<div className="animate-pulse bg-detective-bg-secondary rounded-xl h-24" />

// ❌ INCORRECTO — raw tailwind gray
<div className="animate-pulse bg-gray-200 rounded h-6" />
```

**Impacto:** ~48 archivos con skeletons inline raw necesitan migración.

### 2.3 Regla: NO spinners inline

```tsx
// ❌ INCORRECTO
{loading && <div className="animate-spin h-5 w-5 border-2 ..." />}

// ✅ CORRECTO
import { LoadingSpinner } from '@shared/components/loading';
{loading && <LoadingSpinner size="sm" />}
```

**Impacto:** ~40 archivos con inline spinners.

### 2.4 Barrel export

```tsx
// shared/components/loading/index.ts
export { SkeletonCard } from './SkeletonCard';
export { SkeletonTable } from './SkeletonTable';
export { SkeletonStats } from './SkeletonStats';
export { LoadingSpinner } from './LoadingSpinner';
export { LoadingOverlay } from './LoadingOverlay';
```

---

## 3. Empty States

### 3.1 Regla: Componente `EmptyState` estándar

```tsx
// shared/components/feedback/EmptyState.tsx
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  // detective-theme styling, centered layout
}
```

**Hallazgo:** 163 archivos tienen empty states inline sin componente compartido.

### 3.2 Regla: Idioma consistente — Español

Todos los textos de empty state en español:
```tsx
// ✅ CORRECTO
<EmptyState title="No hay estudiantes" description="Agrega estudiantes a tu aula" />

// ❌ INCORRECTO
<EmptyState title="No students found" />
```

---

## 4. Forms

### 4.1 Regla: react-hook-form + Zod para formularios con validación

```tsx
// ✅ CORRECTO
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
});

type FormData = z.infer<typeof schema>;

export function CreateStudentForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  // ...
}

// ❌ INCORRECTO — manual useState validation
const [name, setName] = useState('');
const [errors, setErrors] = useState({});
const validate = () => { if (!name) setErrors({ name: 'Required' }); };
```

**Excepción:** Formularios simples de 1-2 campos (search, filter) pueden usar controlled inputs sin Zod.

### 4.2 Regla: react-hook-form para formularios sin validación compleja

Para formularios simples que no necesitan Zod pero tienen >2 campos:

```tsx
const { register, handleSubmit } = useForm<FilterFormData>();
```

---

## 5. Confirmation Dialogs

### 5.1 Regla: SIEMPRE `ConfirmDialog` para acciones destructivas

```tsx
// ✅ CORRECTO
import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog';

<ConfirmDialog
  isOpen={showConfirm}
  title="Eliminar estudiante"
  message="Esta acción no se puede deshacer."
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
  variant="danger"
/>

// ❌ INCORRECTO
if (window.confirm('¿Estás seguro?')) { handleDelete(); }
```

**Impacto:** 9 instancias de `window.confirm()` + 32 ubicaciones sin confirmación para acciones destructivas.

---

## Migración

**Prioridad 1 (Quick Win):** Crear `ErrorMessage` y `EmptyState` compartidos
**Prioridad 2 (Quick Win):** Consolidar loading components con barrel export
**Prioridad 3:** Envolver rutas de portal en ErrorBoundary
**Prioridad 4:** Reemplazar `window.confirm` → `ConfirmDialog` (9 archivos)
**Prioridad 5 (Gradual):** Migrar forms manuales → react-hook-form + Zod

---

## Estándares Relacionados

- [ESTANDAR-FRONTEND-CARD-TRUNCATION.md](./ESTANDAR-FRONTEND-CARD-TRUNCATION.md) — Truncación de texto en cards: line-clamp + title tooltip
