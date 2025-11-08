# State Management con Zustand

**Código que mapea:** `apps/frontend/src/stores/`
**Última actualización:** 2025-11-07

---

## 📋 Propósito

Documenta los **8 Zustand stores** del frontend para gestión de estado.

---

## 🗂️ Stores Implementados

| # | Store | Path | Propósito | Estado |
|---|-------|------|-----------|--------|
| 1 | **auth** | `stores/auth.store.ts` | Autenticación y usuario actual | ✅ |
| 2 | **gamification** | `stores/gamification.store.ts` | Achievements, badges, coins | ✅ |
| 3 | **progress** | `stores/progress.store.ts` | Progreso del estudiante | ✅ |
| 4 | **exercise** | `stores/exercise.store.ts` | Estado de ejercicio actual | ✅ |
| 5 | **notification** | `stores/notification.store.ts` | Notificaciones | ✅ |
| 6 | **social** | `stores/social.store.ts` | Aulas, amigos, chat | ✅ |
| 7 | **tenant** | `stores/tenant.store.ts` | Multi-tenancy | ✅ |
| 8 | **ui** | `stores/ui.store.ts` | Estado UI global | ✅ |

**Total stores:** 8

---

## 🎯 Uso de Stores

### auth.store.ts

**Estado:**
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: GamilotRole | null;
}
```

**Uso:**
```typescript
import { useAuthStore } from '@/stores/auth.store';

const { user, isAuthenticated, login, logout } = useAuthStore();

// Login
await login(email, password);

// Logout
logout();
```

---

### gamification.store.ts

**Estado:**
```typescript
interface GamificationState {
  achievements: Achievement[];
  mlCoins: number;
  rank: MayaRank;
  badges: Badge[];
}
```

**Uso:**
```typescript
import { useGamificationStore } from '@/stores/gamification.store';

const { achievements, mlCoins, rank } = useGamificationStore();
```

---

### progress.store.ts

**Estado:**
```typescript
interface ProgressState {
  moduleProgress: ModuleProgress[];
  currentModule: Module | null;
  completedExercises: number;
}
```

---

### exercise.store.ts

**Estado:**
```typescript
interface ExerciseState {
  currentExercise: Exercise | null;
  answer: any;
  isSubmitting: boolean;
  feedback: Feedback | null;
}
```

---

## 📚 Referencias

- [Zustand Docs](https://github.com/pmndrs/zustand)
- [ESTRUCTURA-FEATURES.md](./ESTRUCTURA-FEATURES.md)

---

**Última actualización:** 2025-11-07
