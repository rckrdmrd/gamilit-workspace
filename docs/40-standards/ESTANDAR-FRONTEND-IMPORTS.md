# ESTANDAR-FRONTEND-IMPORTS — Estándar de Imports y Path Resolution

**Version:** 1.0.0 | **Fecha:** 2026-02-19 | **Estado:** Activo
**Basado en:** Audits 01-05 (cn() paths, React imports, type imports)

---

## 1. Import Order

### 1.1 Regla: 5 grupos separados por línea vacía

```tsx
// 1. React (solo named imports)
import { useState, useEffect, useCallback } from 'react';

// 2. Librerías externas (alphabetical)
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

// 3. Aliases del proyecto (@shared, @/apps, @/services, @/features)
import { cn } from '@shared/utils/cn';
import { ErrorMessage } from '@shared/components/feedback';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getStudents } from '@/services/api/educationalAPI';

// 4. Imports relativos (./  ../)
import { StudentCard } from './StudentCard';
import { StudentFilters } from '../components/StudentFilters';

// 5. Type imports (siempre al final, con `import type`)
import type { Student, Exercise } from '@shared/types/entities.types';
import type { StudentCardProps } from './StudentCard';
```

### 1.2 Regla: `import type` para solo-tipos

```tsx
// ✅ CORRECTO — type-only import
import type { Student } from '@shared/types/entities.types';
import type { LucideIcon } from 'lucide-react';

// ❌ INCORRECTO — import normal para tipos
import { Student } from '@shared/types/entities.types';
```

---

## 2. Path Aliases

### 2.1 Aliases canónicos

| Alias | Resuelve a | Uso |
|-------|-----------|-----|
| `@shared/` | `src/shared/` | Componentes, hooks, utils, types compartidos |
| `@/` | `src/` | Todo lo demás (apps, services, features, lib) |

### 2.2 Regla: `cn()` → único path

```tsx
// ✅ CORRECTO — path canónico
import { cn } from '@shared/utils/cn';

// ❌ INCORRECTO — paths alternativos
import { cn } from '@shared/utils';      // barrel (innecesario)
import { cn } from '@/shared/utils/cn';   // alias alternativo
import { cn } from '@/lib/utils';         // path legacy
```

**Impacto:** 29 archivos usan paths alternativos, migrar a `@shared/utils/cn`.

---

## 3. Barrel Exports

### 3.1 Regla: Barrels para directorios shared

```
shared/
  components/
    loading/
      index.ts          ← barrel: export { SkeletonCard, LoadingSpinner, ... }
    feedback/
      index.ts          ← barrel: export { ErrorMessage, EmptyState, ConfirmDialog }
  hooks/
    index.ts            ← barrel: export { useApiError, usePageTitle, ... }
  types/
    index.ts            ← barrel: export type { Student, Exercise, ... }
```

### 3.2 Regla: NO barrels profundos en portales

Los portales (`apps/student/`, `apps/teacher/`, `apps/admin/`) NO necesitan barrels excepto en `types/`:

```
apps/admin/
  types/
    index.ts            ← barrel para admin types
  components/           ← NO barrel (imports directos)
  hooks/                ← NO barrel (imports directos)
```

---

## 4. Icon Imports

### 4.1 Regla: Solo `lucide-react` (ya es estándar — 320+ imports)

```tsx
// ✅ CORRECTO
import { AlertCircle, Users, ChevronRight } from 'lucide-react';

// ❌ INCORRECTO — otras librerías
import { HiUsers } from 'react-icons/hi';
import { FaCheck } from 'react-icons/fa';
```

---

## Migración

**Prioridad 1:** Unificar `cn()` import path (29 archivos)
**Prioridad 2:** ~~Crear barrels para `shared/components/loading/` y `shared/components/feedback/`~~ — Completado (2026-02-19)
**Prioridad 3:** Agregar `import type` donde falte (gradual, con lint rule)
