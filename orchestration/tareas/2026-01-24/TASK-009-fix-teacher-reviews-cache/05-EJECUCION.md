# TASK-009: Ejecución

## Resumen de Cambios

**Archivo modificado:** `apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx`

---

## Cambios Realizados

### 1. Import de useQueryClient (línea 2)

```typescript
// ANTES
import React, { useState, useCallback } from 'react';

// DESPUÉS
import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
```

### 2. Import de manualReviewKeys (línea 12)

```typescript
// AGREGADO
import { manualReviewKeys } from '../../hooks/useManualReviews';
```

### 3. Instancia de queryClient (línea 68-69)

```typescript
// Estado para mensaje de guardado de borrador
const [success, setSuccess] = useState<string | null>(null);
// FIX BUG-CACHE-INVALIDATION: Query client para invalidar cache después de completar
const queryClient = useQueryClient();
```

### 4. Invalidación de cache (línea 237-239)

```typescript
response = await manualReviewApi.completeReview(review.id);
console.log('[ReviewDetail] completeReview result:', response);

// FIX BUG-CACHE-INVALIDATION: Invalidar cache de reviews para que la lista se actualice
// Sin esto, la lista muestra datos cacheados y el review no aparece en "Completadas"
queryClient.invalidateQueries({ queryKey: manualReviewKeys.all });
```

---

## Diff Completo

```diff
diff --git a/apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx b/apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx
index 466df020..c34bad28 100644
--- a/apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx
+++ b/apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx
@@ -1,4 +1,5 @@
 import React, { useState, useCallback } from 'react';
+import { useQueryClient } from '@tanstack/react-query';
 import { X, Save, User, BookOpen, Calendar, FileText, Image as ImageIcon, Video, Music, CheckCircle, AlertTriangle } from 'lucide-react';
 import { ManualReview, RubricEvaluation, ReviewRewards, manualReviewApi } from '@/shared/api/manualReviewApi';
 import { RubricEvaluator } from '@/shared/components/mechanics/RubricEvaluator';
@@ -8,6 +9,7 @@ import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
 import { FeedbackData } from '@/shared/components/mechanics/mechanicsTypes';
 import { format } from 'date-fns';
 import { es } from 'date-fns/locale';
+import { manualReviewKeys } from '../../hooks/useManualReviews';

 /**
  * TASK-2026-01-18-010: Helper para transformar evaluaciones frontend a formato backend
@@ -63,6 +65,8 @@ export const ReviewDetail: React.FC<ReviewDetailProps> = ({ review, onClose }) =
   const [_assignedRewards, setAssignedRewards] = useState<ReviewRewards | null>(null);
   // Estado para mensaje de guardado de borrador
   const [success, setSuccess] = useState<string | null>(null);
+  // FIX BUG-CACHE-INVALIDATION: Query client para invalidar cache después de completar
+  const queryClient = useQueryClient();

   /**
    * Handle evaluation changes
@@ -230,6 +234,10 @@ export const ReviewDetail: React.FC<ReviewDetailProps> = ({ review, onClose }) =
       try {
         response = await manualReviewApi.completeReview(review.id);
         console.log('[ReviewDetail] completeReview result:', response);
+
+        // FIX BUG-CACHE-INVALIDATION: Invalidar cache de reviews para que la lista se actualice
+        // Sin esto, la lista muestra datos cacheados y el review no aparece en "Completadas"
+        queryClient.invalidateQueries({ queryKey: manualReviewKeys.all });
       } catch (completeError) {
```

---

## Validaciones

| Validación | Resultado |
|------------|-----------|
| Build Frontend | ✅ `built in 27.54s` |
| Lint | ✅ 0 errores (239 warnings pre-existentes) |
| TypeScript | ✅ Sin errores de tipos |

---

## Commits

| Hash | Mensaje | Repositorio |
|------|---------|-------------|
| `f63bafc5` | fix(teacher-reviews): Invalidar cache después de completar review | gamilit |
| `71094d55` | chore: Update gamilit submodule (fix teacher reviews cache) | workspace-v2 |

---

*Ejecutado según SIMCO v4.3.0 - Modo @QUICK*
