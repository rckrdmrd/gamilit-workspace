# QUICK REFERENCE - API GAMIFICACION

**Status:** ✅ Implementado
**Date:** 2025-11-23

---

## ARCHIVOS MODIFICADOS

### Backend (1)
```
✏️ apps/backend/src/modules/gamification/controllers/user-stats.controller.ts
```

### Frontend (4 + 1 nuevo)
```
✏️ apps/frontend/src/shared/hooks/useUserGamification.ts
✏️ apps/frontend/src/features/gamification/economy/store/economyStore.ts
✏️ apps/frontend/src/features/gamification/ranks/store/ranksStore.ts
✅ apps/frontend/src/shared/components/Skeleton.tsx (ya existía)
➕ apps/frontend/src/features/gamification/components/GamificationErrorBoundary.tsx
```

---

## API ENDPOINTS

### User Stats
```typescript
// Get stats
GET /api/v1/gamification/users/:userId/stats

// Update stats (with increments)
PATCH /api/v1/gamification/users/:userId/stats
Body: {
  total_xp_increment?: number,
  ml_coins_increment?: number,
  ml_coins_decrement?: number,
  xp_source?: string,
  source?: string,
  description?: string
}

// Get rank
GET /api/v1/gamification/users/:userId/rank
```

### Achievements
```typescript
// Get user achievements
GET /api/v1/gamification/users/:userId/achievements
```

### Ranks
```typescript
// Get rank progress
GET /api/v1/gamification/users/:userId/rank-progress

// Promote user
POST /api/v1/gamification/ranks/promote/:userId
```

---

## CODIGO COMUN

### Usar datos de gamificación
```typescript
import { useUserGamification } from '@/shared/hooks/useUserGamification';

function MyComponent() {
  const { user } = useAuth();
  const { gamificationData, loading, error } = useUserGamification(user?.id);

  if (loading) return <Skeleton className="h-20 w-full" />;
  if (error) return <ErrorMessage error={error} />;

  return <GamifiedHeader gamificationData={gamificationData} />;
}
```

### Ganar XP
```typescript
import { useRanksStore } from '@/features/gamification/ranks/store/ranksStore';

const { addXP } = useRanksStore();
await addXP(50, 'exercise_completion', 'Completed Detective Textual');
```

### Ganar ML Coins
```typescript
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';

const { addCoins } = useEconomyStore();
await addCoins(100, 'achievement', 'Unlocked First Steps');
```

### Gastar ML Coins
```typescript
const { spendCoins } = useEconomyStore();
const success = await spendCoins(30, 'Power Up', 'power-up-1');
```

### Error Boundary
```typescript
import { GamificationErrorBoundary } from '@/features/gamification/components/GamificationErrorBoundary';

<GamificationErrorBoundary>
  <YourComponent />
</GamificationErrorBoundary>
```

### Loading State
```typescript
import { Skeleton } from '@/shared/components/Skeleton';

if (loading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
```

---

## TESTING

### Manual Test Checklist
```bash
✅ Login con usuario real
✅ Ver stats reales en dashboard
✅ Completar ejercicio → gana XP → persiste
✅ Desbloquear achievement → gana ML Coins → persiste
✅ Comprar comodín → gasta ML Coins → persiste
✅ Level up automático
✅ Navegar 33 páginas sin errores
✅ Error handling funciona
✅ Loading states funcionan
```

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test -- --coverage
```

---

## TRANSFORMACION DE DATOS

### Backend → Frontend
```typescript
// Backend (snake_case)
{
  user_id: "uuid",
  total_xp: 250,
  ml_coins: 500,
  current_rank: "Nacom"
}

// Frontend (camelCase)
{
  userId: "uuid",
  totalXP: 250,
  mlCoins: 500,
  rank: "Nacom"
}
```

---

## TROUBLESHOOTING

### Error: "User not authenticated"
**Causa:** No hay userId en auth store
**Fix:** Verificar que user está logueado antes de llamar hooks

### Error: "Failed to fetch gamification data"
**Causa:** API no responde o JWT inválido
**Fix:** Verificar backend está corriendo y token es válido

### Warning: "Mock data" en consola
**Causa:** Hook todavía en modo mock
**Fix:** Verificar imports de apiClient están presentes

### Loading infinito
**Causa:** API call falla silenciosamente
**Fix:** Revisar Network tab, verificar CORS y autenticación

---

## DEPLOYMENT

### Dev
```bash
cd apps/frontend
npm run dev
```

### Staging
```bash
npm run build
npm run preview
```

### Production
```bash
npm run build
# Deploy build/ folder
```

---

## CONTACTOS

- **Backend issues:** Backend-Agent
- **Frontend issues:** Frontend-Agent
- **Coordination:** Orchestrator Agent

---

## DOCUMENTOS

- **Reporte completo:** `REPORTE-IMPLEMENTACION.md`
- **Resumen cambios:** `RESUMEN-CAMBIOS.md`
- **Guías originales:**
  - `orchestration/agentes/frontend/frontend-gamification-api-2025-11-23/GUIA-IMPLEMENTACION-FRONTEND.md`
  - `orchestration/agentes/backend/backend-gamification-api-2025-11-23/GUIA-IMPLEMENTACION-BACKEND.md`

---

**Last updated:** 2025-11-23
