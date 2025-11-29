# Integración con API Backend

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/frontend/src/

---

## Resumen

Este documento describe cómo el frontend se comunica con el backend de GAMILIT, incluyendo configuración de Axios, manejo de autenticación, y patrones de servicios.

---

## Configuración de Axios

### Instancia Base

```typescript
// shared/lib/axios.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});
```

### Interceptor de Autenticación

```typescript
// shared/lib/axios.ts
import { useAuthStore } from '@/features/auth/stores/auth.store';

// Request: Añadir token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: Manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Estructura de Servicios

### Servicio Básico

```typescript
// features/gamification/services/gamification.service.ts
import { api } from '@/shared/lib/axios';
import type { UserStats, Achievement, LeaderboardEntry } from '../types';
import type { PaginatedResponse } from '@/shared/types/api.types';

class GamificationService {
  private readonly basePath = '/gamification';

  async getMyStats(): Promise<UserStats> {
    const { data } = await api.get<UserStats>(`${this.basePath}/stats`);
    return data;
  }

  async getAchievements(): Promise<Achievement[]> {
    const { data } = await api.get<Achievement[]>(`${this.basePath}/achievements`);
    return data;
  }

  async getLeaderboard(
    params: LeaderboardParams
  ): Promise<PaginatedResponse<LeaderboardEntry>> {
    const { data } = await api.get<PaginatedResponse<LeaderboardEntry>>(
      `${this.basePath}/leaderboard`,
      { params }
    );
    return data;
  }

  async purchaseComodin(comodinId: string): Promise<void> {
    await api.post(`${this.basePath}/comodines/purchase`, { comodinId });
  }

  async useComodin(comodinId: string, exerciseId: string): Promise<void> {
    await api.post(`${this.basePath}/comodines/use`, { comodinId, exerciseId });
  }
}

export const gamificationService = new GamificationService();
```

### Servicio con CRUD Completo

```typescript
// features/exercises/services/exercises.service.ts
import { api } from '@/shared/lib/axios';
import type { Exercise, ExerciseFilters, SubmissionResult } from '../types';

class ExercisesService {
  private readonly basePath = '/educational/exercises';

  async getAll(filters: ExerciseFilters): Promise<PaginatedResponse<Exercise>> {
    const { data } = await api.get(this.basePath, { params: filters });
    return data;
  }

  async getById(id: string): Promise<Exercise> {
    const { data } = await api.get<Exercise>(`${this.basePath}/${id}`);
    return data;
  }

  async submitAnswer(exerciseId: string, answer: unknown): Promise<SubmissionResult> {
    const { data } = await api.post<SubmissionResult>(
      `${this.basePath}/${exerciseId}/submit`,
      { answer }
    );
    return data;
  }
}

export const exercisesService = new ExercisesService();
```

---

## Tipos de Respuesta

### Tipos Comunes

```typescript
// shared/types/api.types.ts

// Respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error de API
export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  errors?: Array<{
    field: string;
    messages: string[];
  }>;
}

// Params de paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### Tipos de Feature

```typescript
// features/gamification/types/user-stats.types.ts
export interface UserStats {
  id: string;
  userId: string;
  totalXp: number;
  currentLevel: number;
  mlCoins: number;
  currentStreak: number;
  longestStreak: number;
  globalRank?: number;
}

// features/gamification/types/achievement.types.ts
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  xpReward: number;
  coinsReward: number;
  category: AchievementCategory;
  isSecret: boolean;
  conditions: Record<string, unknown>;
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  achievement: Achievement;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  isClaimed: boolean;
}
```

---

## Integración con React Query

### Query Hooks

```typescript
// features/gamification/hooks/useUserStats.ts
import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '../services/gamification.service';

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => gamificationService.getMyStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// features/gamification/hooks/useAchievements.ts
export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: () => gamificationService.getAchievements(),
  });
};

// features/gamification/hooks/useLeaderboard.ts
export const useLeaderboard = (filters: LeaderboardFilters) => {
  return useQuery({
    queryKey: ['leaderboard', filters],
    queryFn: () => gamificationService.getLeaderboard(filters),
    placeholderData: keepPreviousData, // Mantener datos mientras carga
  });
};
```

### Mutation Hooks

```typescript
// features/gamification/hooks/usePurchaseComodin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationService } from '../services/gamification.service';
import { toast } from 'sonner';

export const usePurchaseComodin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comodinId: string) =>
      gamificationService.purchaseComodin(comodinId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['comodines-inventory'] });
      toast.success('Comodín comprado exitosamente');
    },

    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al comprar comodín';
      toast.error(message);
    },
  });
};
```

---

## Manejo de Errores

### Error Handler Global

```typescript
// shared/lib/axios.ts
import { toast } from 'sonner';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    switch (status) {
      case 400:
        // Validation errors - handled locally
        break;
      case 401:
        useAuthStore.getState().logout();
        window.location.href = '/login';
        break;
      case 403:
        toast.error('No tienes permiso para realizar esta acción');
        break;
      case 404:
        // Usually handled locally
        break;
      case 500:
        toast.error('Error del servidor. Intenta de nuevo más tarde.');
        break;
      default:
        toast.error(message || 'Ocurrió un error inesperado');
    }

    return Promise.reject(error);
  }
);
```

### Error en Componente

```typescript
const ExerciseForm = () => {
  const { mutate: submit, error, isPending } = useSubmitAnswer();

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="text-red-500">
          {error.response?.data?.message || 'Error al enviar'}
        </div>
      )}
      <Button type="submit" disabled={isPending}>
        Enviar
      </Button>
    </form>
  );
};
```

---

## WebSocket Integration

### Configuración

```typescript
// features/notifications/hooks/useWebSocket.ts
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth';

let socket: Socket | null = null;

export const useWebSocket = () => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
      auth: { token },
    });

    socket.on('notification', (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.info(notification.message);
    });

    socket.on('achievement_unlocked', (achievement) => {
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      showAchievementModal(achievement);
    });

    socket.on('xp_gained', (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    });

    return () => {
      socket?.disconnect();
    };
  }, [token, queryClient]);

  return socket;
};
```

---

## Endpoints Principales

### Auth

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/refresh` | Refrescar token |
| GET | `/auth/me` | Usuario actual |

### Gamification

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/gamification/stats` | Stats del usuario |
| GET | `/gamification/achievements` | Logros disponibles |
| GET | `/gamification/achievements/user` | Logros del usuario |
| GET | `/gamification/leaderboard` | Tabla de posiciones |
| GET | `/gamification/ranks` | Rangos Maya |
| POST | `/gamification/comodines/purchase` | Comprar comodín |
| POST | `/gamification/comodines/use` | Usar comodín |

### Educational

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/educational/modules` | Módulos educativos |
| GET | `/educational/exercises` | Ejercicios |
| GET | `/educational/exercises/:id` | Detalle de ejercicio |
| POST | `/educational/exercises/:id/submit` | Enviar respuesta |

### Progress

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/progress/module/:id` | Progreso por módulo |
| GET | `/progress/submissions` | Entregas del usuario |
| GET | `/progress/sessions` | Sesiones de aprendizaje |

---

## Buenas Prácticas

1. **Un servicio por dominio**: Agrupar endpoints relacionados
2. **Tipos para todo**: Request y response tipados
3. **Query keys consistentes**: `['resource', id, 'sub-resource']`
4. **Manejar loading/error**: En cada componente
5. **Invalidar queries**: Después de mutaciones exitosas
6. **Mensajes de error claros**: Toast con mensaje específico

---

## Ver También

- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - React Query y Zustand
- [ESTRUCTURA-FEATURES.md](./ESTRUCTURA-FEATURES.md) - Dónde ubicar servicios
- [../backend/API-CONVENTIONS.md](../backend/API-CONVENTIONS.md) - Convenciones del backend
