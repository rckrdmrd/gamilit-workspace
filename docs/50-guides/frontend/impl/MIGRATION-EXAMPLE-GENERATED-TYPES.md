---
titulo: Ejemplo de Migración a Tipos Generados
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# Ejemplo de Migración a Tipos Generados

**Fecha:** 2025-11-24
**GAP:** GAP-008
**Relacionado:** [GENERATED-API-TYPES.md](./GENERATED-API-TYPES.md)

---

## 📋 Resumen

Este documento muestra ejemplos prácticos de cómo migrar código existente que usa tipos manuales a usar los tipos generados automáticamente desde el OpenAPI del backend.

---

## 🎯 Caso de Uso: Gamification API

### Antes (Tipos Manuales)

```typescript
// apps/frontend/src/services/api/gamification/gamificationAPI.ts

import apiClient from '@/services/api/apiClient';

// ❌ Tipos definidos manualmente - pueden desincronizarse con backend
interface UserStats {
  userId: string;
  level: number;
  totalXp: number;
  mlCoins: number;
  currentRank?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  unlocked: boolean;
}

interface Leaderboard {
  rank: number;
  userId: string;
  username: string;
  points: number;
}

export const gamificationApi = {
  // Get user stats
  getUserStats: async (userId: string): Promise<UserStats> => {
    const { data } = await apiClient.get(
      `/v1/gamification/users/${userId}/stats`
    );
    return data;
  },

  // Get user achievements
  getUserAchievements: async (userId: string): Promise<Achievement[]> => {
    const { data } = await apiClient.get(
      `/v1/gamification/users/${userId}/achievements`
    );
    return data;
  },

  // Get leaderboard
  getLeaderboard: async (classroomId: string): Promise<Leaderboard[]> => {
    const { data } = await apiClient.get(
      `/v1/gamification/classrooms/${classroomId}/leaderboard`
    );
    return data;
  },
};
```

**Problemas:**
- ❌ Tipos no sincronizados con backend
- ❌ Sin autocomplete de campos reales
- ❌ Cambios en backend no se reflejan automáticamente
- ❌ Posibles errores en runtime por campos faltantes

---

### Después (Tipos Generados)

```typescript
// apps/frontend/src/services/api/gamification/gamificationAPI.ts

import apiClient from '@/services/api/apiClient';
import type { paths, components } from '@/generated/api-types';

// ✅ Tipos generados desde OpenAPI - siempre sincronizados
type UserStats = components['schemas']['UserStatsDto'];
type Achievement = components['schemas']['AchievementDto'];
type Leaderboard = components['schemas']['LeaderboardEntryDto'];

// ✅ También podemos extraer tipos de respuestas específicas
type GetUserStatsResponse =
  paths['/v1/gamification/users/{userId}/stats']['get']['responses']['200']['content']['application/json'];

type GetUserAchievementsResponse =
  paths['/v1/gamification/users/{userId}/achievements']['get']['responses']['200']['content']['application/json'];

export const gamificationApi = {
  // Get user stats
  getUserStats: async (userId: string): Promise<UserStats> => {
    const { data } = await apiClient.get<UserStats>(
      `/v1/gamification/users/${userId}/stats`
    );
    return data;  // ✅ TypeScript valida estructura automáticamente
  },

  // Get user achievements
  getUserAchievements: async (userId: string): Promise<Achievement[]> => {
    const { data } = await apiClient.get<Achievement[]>(
      `/v1/gamification/users/${userId}/achievements`
    );
    return data;  // ✅ TypeScript valida que es un array de Achievement
  },

  // Get leaderboard
  getLeaderboard: async (classroomId: string): Promise<Leaderboard[]> => {
    const { data } = await apiClient.get<Leaderboard[]>(
      `/v1/gamification/classrooms/${classroomId}/leaderboard`
    );
    return data;
  },
};
```

**Beneficios:**
- ✅ Tipos 100% sincronizados con backend
- ✅ Autocomplete completo en VS Code
- ✅ Errores de tipo detectados en compile-time
- ✅ Cambios en backend se reflejan tras regenerar tipos

---

## 🔄 Proceso de Migración Paso a Paso

### Paso 1: Generar Tipos Actualizados

```bash
cd apps/frontend
npm run generate:api-types
```

**Output esperado:**
```
🚀 Generando tipos TypeScript desde OpenAPI...
✅ Especificación OpenAPI descargada
   Versión: 1.0.0
   Paths: 374
🔨 Generando tipos TypeScript...
✅ Tipos generados exitosamente: src/generated/api-types.ts
```

---

### Paso 2: Identificar Tipos en el Backend

Para saber qué tipos usar, busca en el backend el DTO correspondiente:

```typescript
// Backend: apps/backend/src/modules/gamification/dto/user-stats.dto.ts
export class UserStatsDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  level: number;

  @ApiProperty()
  totalXp: number;

  @ApiProperty()
  mlCoins: number;

  @ApiProperty({ required: false })
  currentRank?: string;
}
```

Este DTO se genera en el frontend como:
```typescript
components['schemas']['UserStatsDto']
```

---

### Paso 3: Importar Tipos Generados

```typescript
// En tu archivo API
import type { components } from '@/generated/api-types';

// Extraer el tipo específico
type UserStats = components['schemas']['UserStatsDto'];
```

---

### Paso 4: Actualizar Funciones API

**Antes:**
```typescript
export const getUserStats = async (userId: string) => {
  const { data } = await apiClient.get(`/v1/gamification/users/${userId}/stats`);
  return data;  // ❌ Sin tipo, TypeScript no valida
};
```

**Después:**
```typescript
export const getUserStats = async (userId: string): Promise<UserStats> => {
  const { data } = await apiClient.get<UserStats>(
    `/v1/gamification/users/${userId}/stats`
  );
  return data;  // ✅ TypeScript valida que data es UserStats
};
```

---

### Paso 5: Actualizar Hooks que Usan la API

```typescript
// apps/frontend/src/hooks/useUserStats.ts

import { useState, useEffect } from 'react';
import { gamificationApi } from '@/services/api/gamification/gamificationAPI';
import type { components } from '@/generated/api-types';

type UserStats = components['schemas']['UserStatsDto'];

export function useUserStats(userId: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await gamificationApi.getUserStats(userId);
        setStats(data);  // ✅ TypeScript valida que data es UserStats
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  return { stats, loading, error };
}
```

---

### Paso 6: Usar en Componentes

```typescript
// apps/frontend/src/components/UserStatsCard.tsx

import { useUserStats } from '@/hooks/useUserStats';
import type { components } from '@/generated/api-types';

type UserStats = components['schemas']['UserStatsDto'];

interface UserStatsCardProps {
  userId: string;
}

export function UserStatsCard({ userId }: UserStatsCardProps) {
  const { stats, loading, error } = useUserStats(userId);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return null;

  return (
    <div className="stats-card">
      <h3>Estadísticas</h3>
      <p>Nivel: {stats.level}</p>              {/* ✅ Autocomplete funciona */}
      <p>XP Total: {stats.totalXp}</p>         {/* ✅ TypeScript valida */}
      <p>ML Coins: {stats.mlCoins}</p>
      {stats.currentRank && (                  {/* ✅ Maneja campo opcional */}
        <p>Rango: {stats.currentRank}</p>
      )}
    </div>
  );
}
```

---

## 🧪 Ejemplo: Request Body Types

Para endpoints que reciben datos (POST, PUT, PATCH):

```typescript
// Backend DTO
export class UpdateUserProfileDto {
  @ApiProperty({ required: false })
  displayName?: string;

  @ApiProperty({ required: false })
  avatar?: string;
}

// Frontend - Uso del tipo generado
import type { paths } from '@/generated/api-types';

type UpdateProfileEndpoint = paths['/v1/users/{userId}']['patch'];
type UpdateProfileRequest = UpdateProfileEndpoint['requestBody']['content']['application/json'];

export const updateUserProfile = async (
  userId: string,
  updates: UpdateProfileRequest
): Promise<void> => {
  await apiClient.patch(`/v1/users/${userId}`, updates);
};

// Uso en componente
const handleUpdate = async () => {
  await updateUserProfile(userId, {
    displayName: 'Nuevo Nombre',  // ✅ TypeScript valida campos
    avatar: 'https://...',
    // extraField: 'foo'  // ❌ Error: campo no existe en el tipo
  });
};
```

---

## 🔍 Explorar Tipos Generados

Para ver qué tipos están disponibles:

```typescript
// Ver todos los schemas disponibles
import type { components } from '@/generated/api-types';

// Hover sobre 'schemas' en VS Code para ver lista completa
type AllSchemas = components['schemas'];

// Ver todos los paths disponibles
import type { paths } from '@/generated/api-types';

// Hover sobre 'paths' para ver lista completa de rutas
type AllPaths = paths;
```

O abre el archivo directamente:
```bash
code apps/frontend/src/generated/api-types.ts
```

---

## 📝 Checklist de Migración

Para migrar un módulo API existente:

- [ ] Generar tipos actualizados: `npm run generate:api-types`
- [ ] Identificar DTOs correspondientes en el backend
- [ ] Importar tipos generados: `import type { components } from '@/generated/api-types'`
- [ ] Extraer tipos específicos: `type UserStats = components['schemas']['UserStatsDto']`
- [ ] Reemplazar interfaces manuales con tipos generados
- [ ] Actualizar funciones API con tipos de retorno correctos
- [ ] Actualizar hooks que consumen la API
- [ ] Actualizar componentes que usan los datos
- [ ] Verificar TypeScript compile sin errores: `npm run type-check`
- [ ] Probar funcionalidad en runtime
- [ ] Eliminar interfaces manuales antiguas
- [ ] Actualizar tests si es necesario

---

## 🚀 Workflow Diario

### Cuando Backend Cambia un DTO

1. **Backend Developer hace cambio:**
   ```typescript
   // Backend agrega nuevo campo
   export class UserStatsDto {
     // ... campos existentes
     @ApiProperty()
     streakDays: number;  // ← NUEVO CAMPO
   }
   ```

2. **Frontend Developer regenera tipos:**
   ```bash
   cd apps/frontend
   npm run generate:api-types
   ```

3. **TypeScript detecta el nuevo campo automáticamente:**
   ```typescript
   // Ahora streakDays está disponible con autocomplete
   <p>Racha: {stats.streakDays} días</p>  // ✅ Funciona
   ```

### Cuando Backend Agrega Nuevo Endpoint

1. **Backend Developer crea endpoint:**
   ```typescript
   @Get('/v1/gamification/users/:userId/badges')
   @ApiResponse({ type: [BadgeDto] })
   async getUserBadges(@Param('userId') userId: string) {
     // ...
   }
   ```

2. **Frontend Developer regenera tipos:**
   ```bash
   npm run generate:api-types
   ```

3. **Nuevo path está disponible:**
   ```typescript
   type GetBadgesResponse =
     paths['/v1/gamification/users/{userId}/badges']['get']['responses']['200']['content']['application/json'];

   export const getUserBadges = async (userId: string): Promise<GetBadgesResponse> => {
     const { data } = await apiClient.get(`/v1/gamification/users/${userId}/badges`);
     return data;
   };
   ```

---

## 🎓 Tips y Mejores Prácticas

### 1. Regenerar Tipos Regularmente

```bash
# Antes de empezar a trabajar
git pull
npm run generate:api-types

# Durante desarrollo
npm run generate:api-types:watch  # Auto-regenera cuando backend cambia
```

### 2. Crear Type Aliases para Tipos Comunes

```typescript
// apps/frontend/src/types/gamification.types.ts

import type { components } from '@/generated/api-types';

// ✅ Crear aliases legibles
export type UserStats = components['schemas']['UserStatsDto'];
export type Achievement = components['schemas']['AchievementDto'];
export type Leaderboard = components['schemas']['LeaderboardEntryDto'];

// Re-exportar para uso fácil
export type { components, paths } from '@/generated/api-types';
```

Luego importar donde se necesite:
```typescript
import type { UserStats, Achievement } from '@/types/gamification.types';
```

### 3. Usar Utility Types

```typescript
// Extraer parámetros de path
type GetUserStatsPath = paths['/v1/gamification/users/{userId}/stats'];
type GetUserStatsParams = GetUserStatsPath['parameters']['path'];
// { userId: string }

// Extraer query parameters
type SearchParams = paths['/v1/search']['get']['parameters']['query'];
// { q: string; limit?: number; offset?: number }
```

### 4. Validar Response Status Codes

```typescript
type LoginEndpoint = paths['/v1/auth/login']['post'];

// Success
type LoginSuccess = LoginEndpoint['responses']['200']['content']['application/json'];

// Errors
type LoginUnauthorized = LoginEndpoint['responses']['401']['content']['application/json'];
type LoginBadRequest = LoginEndpoint['responses']['400']['content']['application/json'];

// Usar en manejo de errores
try {
  const response = await login(credentials);
  return response as LoginSuccess;
} catch (err) {
  if (err.status === 401) {
    const error = err.data as LoginUnauthorized;
    console.error(error.message);
  }
}
```

---

## 🔗 Referencias

- [Documentación Completa: GENERATED-API-TYPES.md](./GENERATED-API-TYPES.md)
- [openapi-typescript Documentation](https://github.com/drwpow/openapi-typescript)
- [Transversal References](../../../80-references/transversal/README.md)

---

**Versión:** 1.0.0
**Fecha:** 2025-11-24
**Autor:** Architecture-Analyst
**GAP:** GAP-008
