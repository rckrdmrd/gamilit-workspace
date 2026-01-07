# MATRIZ DE DEPENDENCIAS BIDIRECCIONALES
## Student Portal - Correcciones P0

**Fecha:** 2025-11-24
**Última actualización:** 2025-11-24 (Post-GAP-008)
**Alcance:** GAP-001, GAP-006, GAP-007, GAP-008
**Tipo:** Análisis de dependencias bidireccionales (consume + es consumido)
**Estado:** ✅ COMPLETADO

---

## 📋 INTRODUCCIÓN

Este documento mapea TODAS las dependencias bidireccionales entre los componentes implementados en las correcciones P0. Cada entrada muestra:

**CONSUME (Dependencias salientes):**
- Objetos/servicios/librerías que este componente necesita para funcionar

**ES CONSUMIDO POR (Dependencias entrantes):**
- Objetos/componentes que dependen de este componente

**Formato:**
```
[COMPONENTE A]
  ├─ CONSUME → [COMPONENTE B, C, D]
  └─ ES CONSUMIDO POR → [COMPONENTE E, F]
```

---

## 🗂️ ÍNDICE DE COMPONENTES

### Backend (4 archivos)
1. [MissionsService](#1-missionsservice)
2. [MissionsController](#2-missionscontroller)
3. [AuthService.getUserStatistics()](#3-authservicegetuserstatistics) ✨ **NUEVO (GAP-008)**
4. [UsersController](#4-userscontroller) ✨ **NUEVO (GAP-008)**

### Frontend (4 archivos)
5. [useUserStatistics Hook](#5-useuserstatistics-hook)
6. [ProfilePage Component](#6-profilepage-component)
7. [profileAPI Service](#7-profileapi-service)
8. [SettingsPage Component](#8-settingspage-component)

### Base de Datos (10 tablas)
9. [gamification.missions](#9-gamificationmissions-tabla)
10. [gamification_system.user_stats](#10-gamification_systemuser_stats-tabla)
11. [gamification.user_ranks](#11-gamificationuser_ranks-tabla)
12. [gamification.user_achievements](#12-gamificationuser_achievements-tabla) ✨ **NUEVO (GAP-008)**
13. [gamification.achievements](#13-gamificationachievements-tabla) ✨ **NUEVO (GAP-008)**
14. [economy.ml_coins_transactions](#14-economyml_coins_transactions-tabla)
15. [progress_tracking.exercise_submissions](#15-progress_trackingexercise_submissions-tabla) ✨ **NUEVO (GAP-008)**

### Servicios Externos (4 packages)
16. [React Query](#16-react-query-tanstackreact-query)
17. [react-hot-toast](#17-react-hot-toast)
18. [apiClient](#18-apiclient-axios-instance)
19. [useAuth Hook](#19-useauth-hook)

---

## 🔗 MATRIZ COMPLETA DE DEPENDENCIAS

### 1. MissionsService

**Archivo:** `apps/backend/src/modules/gamification/services/missions.service.ts`
**Gap:** STUDENT-GAP-001
**Tipo:** NestJS Service (Backend)

#### CONSUME (Dependencias Salientes)

| # | Componente | Tipo | Método/Propiedad | Propósito | Impacto si Falla |
|---|------------|------|------------------|-----------|------------------|
| 1.1 | **Mission Entity** | TypeORM Repository | `findOne()`, `save()` | Consultar y actualizar misiones en BD | 🔴 Crítico - No funciona |
| 1.2 | **MLCoinsService** | NestJS Service | `addCoins(userId, amount, reason, metadata)` | Otorgar ML Coins al student | 🔴 Crítico - Coins no se otorgan |
| 1.3 | **UserStatsService** | NestJS Service | `addXp(userId, amount)` | Otorgar XP al student | 🔴 Crítico - XP no se otorga |
| 1.4 | **RanksService** | NestJS Service | `getCurrentRank(userId)` | Obtener rango actual para detectar promoción | 🟡 Medio - No detecta promoción |

**Detalles de Dependencias:**

**1.1 Mission Entity (TypeORM Repository)**
```typescript
// Inyección en constructor
constructor(
  @InjectRepository(Mission)
  private readonly missionsRepository: Repository<Mission>,
) {}

// Uso en claimRewards()
const mission = await this.missionsRepository.findOne({
  where: { id: missionId, user_id: userId, status: 'completed' },
});

mission.status = 'claimed';
mission.claimed_at = new Date();
await this.missionsRepository.save(mission);
```
- Tabla BD: `gamification.missions`
- Operaciones: SELECT (findOne), UPDATE (save)
- Impacto: Si falla, método lanza exception

**1.2 MLCoinsService**
```typescript
// Inyección en constructor
private readonly mlCoinsService: MLCoinsService

// Uso en claimRewards()
await this.mlCoinsService.addCoins(
  userId,
  ml_coins_reward,
  `Recompensa por completar misión: ${mission.title}`,
  {
    mission_id: missionId,
    mission_type: mission.type,
    mission_title: mission.title,
  }
);
```
- Módulo: `economy/services/ml-coins.service.ts`
- Tabla BD afectada: `economy.ml_coins_transactions`
- Impacto: Si falla, misión se reclamaría pero coins NO se otorgarían (inconsistencia)

**1.3 UserStatsService**
```typescript
// Inyección en constructor
private readonly userStatsService: UserStatsService

// Uso en claimRewards()
await this.userStatsService.addXp(userId, xp_reward);
// NOTA: Este método activa trigger check_user_promotion_on_xp_update
```
- Módulo: `users/services/user-stats.service.ts`
- Tabla BD afectada: `users.user_stats` (total_xp)
- Trigger activado: `check_user_promotion_on_xp_update`
- Impacto: Si falla, XP no se otorga (inconsistencia crítica)

**1.4 RanksService**
```typescript
// Inyección en constructor
private readonly ranksService: RanksService

// Uso en claimRewards() (llamado 2 veces)
const previousRank = await this.ranksService.getCurrentRank(userId); // Antes de otorgar XP
// ... otorgar XP ...
const newRank = await this.ranksService.getCurrentRank(userId); // Después de otorgar XP

const rankPromotion = previousRank.rank !== newRank.rank;
```
- Módulo: `gamification/services/ranks.service.ts`
- Tabla BD consultada: `gamification.user_ranks`
- Impacto: Si falla, promoción NO se detecta pero XP se otorga correctamente

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Tipo | Método que Consume | Propósito | Flujo |
|---|------------|------|-------------------|-----------|-------|
| 1.5 | **MissionsController** | NestJS Controller | `claimMissionRewards(@Param('id'))` | Exponer endpoint HTTP POST /missions/:id/claim | Controller → Service → BD |
| 1.6 | **Frontend: useMissions Hook** | React Query | `useClaimMissionRewards()` mutation | Permitir al student reclamar misión desde UI | UI → HTTP → Controller → Service |

**Detalles de Consumidores:**

**1.5 MissionsController**
```typescript
// apps/backend/src/modules/gamification/controllers/missions.controller.ts
@Post(':id/claim')
@UseGuards(JwtAuthGuard, RolesGuard)
async claimMissionRewards(
  @Param('id') missionId: string,
  @Req() req: Request,
) {
  const userId = req.user.id;
  return this.missionsService.claimRewards(missionId, userId);
}
```
- Endpoint: `POST /missions/:id/claim`
- Autenticación: JWT required
- Autorización: Solo el owner puede reclamar

**1.6 Frontend: useMissions Hook**
```typescript
// apps/frontend/src/apps/student/hooks/useMissions.ts
const useClaimMissionRewards = () => {
  return useMutation({
    mutationFn: (missionId: string) =>
      apiClient.post(`/missions/${missionId}/claim`),
    onSuccess: (data) => {
      // Invalidar caché de misiones
      queryClient.invalidateQueries(['missions']);
      // Mostrar toast con recompensas
      toast.success(`Recompensas reclamadas: +${data.rewards_granted.xp_awarded} XP`);
    },
  });
};
```
- Componente que lo usa: `MissionsPage.tsx`
- Acción del usuario: Hacer clic en botón "Reclamar"

---

### 2. MissionsController

**Archivo:** `apps/backend/src/modules/gamification/controllers/missions.controller.ts`
**Gap:** STUDENT-GAP-001
**Tipo:** NestJS Controller (Backend)

#### CONSUME (Dependencias Salientes)

| # | Componente | Tipo | Método/Propiedad | Propósito | Impacto si Falla |
|---|------------|------|------------------|-----------|------------------|
| 2.1 | **MissionsService** | NestJS Service | `claimRewards(missionId, userId)` | Delegar lógica de negocio | 🔴 Crítico - Endpoint no funciona |
| 2.2 | **JwtAuthGuard** | NestJS Guard | Validate JWT token | Autenticación | 🔴 Crítico - Endpoint desprotegido |
| 2.3 | **RolesGuard** | NestJS Guard | Validate user role | Autorización | 🟡 Medio - Sin control de roles |

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Tipo | Endpoint | Propósito | Flujo |
|---|------------|------|----------|-----------|-------|
| 2.4 | **Frontend: apiClient** | Axios | `POST /missions/:id/claim` | Cliente HTTP desde frontend | Browser → API Gateway → Controller |
| 2.5 | **API Gateway** | NestJS | Global prefix `/api` | Routing HTTP | Internet → Gateway → Controller |

---

### 3. AuthService.getUserStatistics()

**Archivo:** `apps/backend/src/modules/auth/services/auth.service.ts`
**Gap:** STUDENT-GAP-008
**Tipo:** NestJS Service Method (Backend)

#### CONSUME (Dependencias Salientes)

| # | Componente | Tipo | Método/Propiedad | Propósito | Impacto si Falla |
|---|------------|------|------------------|-----------|------------------|
| 3.1 | **UserStats Entity** | TypeORM Repository | `findOne()` | Consultar XP, modules, streak del usuario | 🔴 Crítico - Stats incorrectos |
| 3.2 | **UserRank Entity** | TypeORM Repository | `findOne({ is_current: true })` | Consultar rank actual del usuario | 🔴 Crítico - Rank incorrecto |
| 3.3 | **UserAchievement Entity** | TypeORM Repository | `count({ is_completed: true })` | Contar logros completados | 🟡 Medio - Stats incompletos |
| 3.4 | **Achievement Entity** | TypeORM Repository | `count({ is_active: true })` | Contar logros totales disponibles | 🟡 Medio - Stats incompletos |
| 3.5 | **MLCoinsTransaction Entity** | TypeORM Repository | `createQueryBuilder().select(SUM)` | Calcular balance de ML Coins | 🔴 Crítico - Balance incorrecto |
| 3.6 | **ExerciseSubmission Entity** | TypeORM Repository | `count({ is_correct: true })` | Contar ejercicios completados | 🟡 Medio - Stats incompletos |

**Detalles de Dependencias:**

**3.1-3.6 TypeORM Repositories (Multi-Schema)**
```typescript
// Inyección en constructor (6 repositorios)
constructor(
  @InjectRepository(UserStats, 'gamification')
  private readonly userStatsRepository: Repository<UserStats>,
  @InjectRepository(UserRank, 'gamification')
  private readonly userRanksRepository: Repository<UserRank>,
  @InjectRepository(UserAchievement, 'gamification')
  private readonly userAchievementsRepository: Repository<UserAchievement>,
  @InjectRepository(Achievement, 'gamification')
  private readonly achievementsRepository: Repository<Achievement>,
  @InjectRepository(MLCoinsTransaction, 'gamification')
  private readonly mlCoinsTransactionsRepository: Repository<MLCoinsTransaction>,
  @InjectRepository(ExerciseSubmission, 'progress')
  private readonly exerciseSubmissionsRepository: Repository<ExerciseSubmission>,
) {}

// Query 1: ML Coins Balance (SUM aggregation)
const mlCoinsResult = await this.mlCoinsTransactionsRepository
  .createQueryBuilder('transaction')
  .select('COALESCE(SUM(transaction.amount), 0)', 'ml_coins')
  .where('transaction.user_id = :userId', { userId })
  .getRawOne();

// Query 2: User Stats
const userStats = await this.userStatsRepository.findOne({
  where: { user_id: userId },
});

// Query 3: Current Rank (filter by is_current=true)
const userRank = await this.userRanksRepository.findOne({
  where: { user_id: userId, is_current: true },
});

// Query 4-6: Counts
const achievementsEarned = await this.userAchievementsRepository.count({
  where: { user_id: userId, is_completed: true },
});
```

- **Multi-Schema Integration:**
  - 'gamification' connection: user_stats, user_ranks, achievements, user_achievements, ml_coins_transactions
  - 'progress' connection: exercise_submissions
- **Edge Cases Manejados:**
  - Usuario sin transacciones: COALESCE retorna 0
  - Usuario sin stats: operador `||` fallback a 0
  - Usuario sin rank: fallback a 'Ajaw' (rank inicial)
  - Todos los counts retornan 0 si no hay datos

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Tipo | Método que Consume | Propósito | Flujo |
|---|------------|------|-------------------|-----------|-------|
| 3.7 | **UsersController** | NestJS Controller | `getUserStatistics(@Param('id'))` | Exponer endpoint HTTP GET /users/:id/statistics | Controller → Service → BD (6 queries) |
| 3.8 | **Frontend: useUserStatistics Hook** | React Query | `useQuery()` | Fetch de estadísticas desde frontend | UI → HTTP → Controller → Service |

---

### 4. UsersController

**Archivo:** `apps/backend/src/modules/auth/controllers/users.controller.ts`
**Gap:** STUDENT-GAP-008
**Tipo:** NestJS Controller (Backend)

#### CONSUME (Dependencias Salientes)

| # | Componente | Tipo | Método/Propiedad | Propósito | Impacto si Falla |
|---|------------|------|------------------|-----------|------------------|
| 4.1 | **AuthService** | NestJS Service | `getUserStatistics(userId)` | Delegar lógica de negocio | 🔴 Crítico - Endpoint no funciona |
| 4.2 | **JwtAuthGuard** | NestJS Guard | Validate JWT token | Autenticación | 🔴 Crítico - Endpoint desprotegido |

**Detalles:**
```typescript
@Get(':id/statistics')
@UseGuards(JwtAuthGuard)
async getUserStatistics(@Param('id') userId: string) {
  return this.authService.getUserStatistics(userId);
}
```

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Tipo | Endpoint | Propósito | Flujo |
|---|------------|------|----------|-----------|-------|
| 4.3 | **Frontend: apiClient** | Axios | `GET /users/:id/statistics` | Cliente HTTP desde frontend | Browser → API → Controller |
| 4.4 | **Frontend: useUserStatistics Hook** | React Query | `useQuery()` | Fetch con caché de 2 minutos | Hook → apiClient → Endpoint |

---

### 5. useUserStatistics Hook

**Archivo:** `apps/frontend/src/shared/hooks/useUserStatistics.ts`
**Gap:** STUDENT-GAP-006
**Tipo:** React Custom Hook (Frontend)

#### CONSUME (Dependencias Salientes)

| # | Componente | Tipo | Método/Propiedad | Propósito | Impacto si Falla |
|---|------------|------|------------------|-----------|------------------|
| 3.1 | **React Query** | Library | `useQuery()` | Gestión de estado del servidor con caché | 🔴 Crítico - Hook no compila |
| 3.2 | **apiClient** | Axios instance | `get('/users/:userId/statistics')` | Fetch de estadísticas desde backend | 🔴 Crítico - No carga datos |
| 3.3 | **Backend: GET /users/:userId/statistics** | REST API | Endpoint HTTP | Obtener stats del usuario | 🔴 Crítico - Hook devuelve error |

**Detalles de Dependencias:**

**3.1 React Query**
```typescript
import { useQuery } from '@tanstack/react-query';

export function useUserStatistics(userId: string | undefined) {
  return useQuery<UserStatistics>({
    queryKey: ['userStatistics', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await apiClient.get(`/users/${userId}/statistics`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,       // 2 minutos
    refetchOnWindowFocus: true,
  });
}
```
- Funcionalidades usadas:
  - `queryKey` - Caché identification
  - `queryFn` - Async function para fetch
  - `enabled` - Conditional fetching
  - `staleTime` - Tiempo antes de considerar datos obsoletos
  - `refetchOnWindowFocus` - Refetch automático al volver a la ventana
- Return: `{ data, isLoading, error, refetch }`

**3.2 apiClient**
```typescript
import { apiClient } from '../services/api/apiClient';

const response = await apiClient.get(`/users/${userId}/statistics`);
```
- Archivo: `apps/frontend/src/services/api/apiClient.ts`
- Interceptors aplicados:
  - Request: Agregar JWT token automáticamente
  - Response: Manejar errores 401 (redirect a login)
- Headers enviados: `Authorization: Bearer <JWT>`

**3.3 Backend Endpoint**
- URL: `GET /api/users/:userId/statistics`
- Controller: `UsersController.getUserStatistics()`
- Service: `AuthService.getUserStatistics()`
- Response esperado:
```typescript
{
  ml_coins: number,
  achievements_unlocked: number,
  achievements_available: number,
  total_xp: number,
  current_rank: { rank: string, icon: string, color: string },
  exercises_completed: number
}
```
- **NOTA:** Backend actualmente devuelve valores "0" (mock) - Ver GAP-008

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Tipo | Uso | Propósito | Frecuencia |
|---|------------|------|-----|-----------|------------|
| 3.4 | **ProfilePage Component** | React Component | `const { data, isLoading, error } = useUserStatistics(user?.id)` | Mostrar stats dinámicos en perfil | 1x por mount + refetch on focus |

**Detalles de Consumidores:**

**3.4 ProfilePage Component**
```typescript
// apps/frontend/src/apps/student/pages/ProfilePage.tsx
export default function ProfilePage() {
  const { user } = useAuth();
  const { data: userStats, isLoading, error } = useUserStatistics(user?.id);

  if (isLoading) return <Loader2 />;
  if (error) return <ErrorMessage />;

  const stats = [
    { label: 'ML Coins', value: userStats.ml_coins.toString() },
    { label: 'Logros', value: `${userStats.achievements_unlocked}/${userStats.achievements_available}` },
    // ...
  ];

  return <div>{/* Renderizar stats */}</div>;
}
```

---

### 4. ProfilePage Component

**Archivo:** `apps/frontend/src/apps/student/pages/ProfilePage.tsx`
**Gap:** STUDENT-GAP-006
**Tipo:** React Component (Frontend)

#### CONSUME (Dependencias Salientes)

| # | Componente | Tipo | Método/Propiedad | Propósito | Impacto si Falla |
|---|------------|------|------------------|-----------|------------------|
| 4.1 | **useUserStatistics Hook** | Custom Hook | `useUserStatistics(userId)` | Fetch de estadísticas desde API | 🔴 Crítico - Stats no cargan |
| 4.2 | **useAuth Hook** | Context Hook | `user.id`, `logout()` | Obtener usuario autenticado | 🔴 Crítico - No sabe qué user mostrar |
| 4.3 | **Lucide Icons** | Library | `Loader2`, `Coins`, `Trophy`, `Zap`, `Crown` | Íconos de UI | 🟡 Medio - No compila |

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Tipo | Ruta | Propósito | Trigger |
|---|------------|------|------|-----------|---------|
| 4.4 | **React Router** | Routing | `/student/profile` | Renderizar página de perfil | Usuario navega a URL |

---

### 5. profileAPI Service

**Archivo:** `apps/frontend/src/services/api/profileAPI.ts`
**Gap:** STUDENT-GAP-007
**Tipo:** API Service (Frontend)

#### CONSUME (Dependencias Salientes)

| # | Componente | Tipo | Endpoint | Propósito | Impacto si Falla |
|---|------------|------|----------|-----------|------------------|
| 5.1 | **apiClient** | Axios instance | `put()`, `post()` | Cliente HTTP con JWT | 🔴 Crítico - Requests no funcionan |
| 5.2 | **Backend: PUT /users/:id/profile** | REST API | Actualizar perfil | Persistir cambios de perfil | 🔴 Crítico - No guarda |
| 5.3 | **Backend: PUT /users/:id/preferences** | REST API | Actualizar preferencias | Persistir configuraciones | 🔴 Crítico - No guarda |
| 5.4 | **Backend: POST /users/:id/avatar** | REST API | Subir avatar | Persistir nueva imagen | 🔴 Crítico - No guarda |
| 5.5 | **Backend: PUT /users/:id/password** | REST API | Cambiar contraseña | Persistir nueva contraseña | 🔴 Crítico - No guarda |

**Detalles de Dependencias:**

**5.1 apiClient**
```typescript
import { apiClient } from './apiClient';

export const profileAPI = {
  updateProfile: async (userId: string, data: UpdateProfileDto) => {
    const response = await apiClient.put(`/users/${userId}/profile`, data);
    return response.data;
  },
  // ... otros métodos
};
```

**5.2 Backend: PUT /users/:id/profile**
```typescript
// Request
PUT /api/users/user-123/profile
Headers: { Authorization: 'Bearer <JWT>', Content-Type: 'application/json' }
Body: { first_name: 'Juan', last_name: 'Pérez', email: 'juan@example.com' }

// Response esperado
200 OK
Body: { id: 'user-123', first_name: 'Juan', last_name: 'Pérez', email: 'juan@example.com', ... }
```
- **NOTA:** Backend NO implementado completamente (no persiste en BD) - Ver GAP-008

**5.3 Backend: PUT /users/:id/preferences**
```typescript
// Request
PUT /api/users/user-123/preferences
Body: {
  preferences: {
    notifications: { email: true, push: false, in_app: true },
    language: 'es',
    theme: 'dark'
  }
}

// Response esperado
200 OK
Body: { id: 'user-123', preferences: { ... }, ... }
```

**5.4 Backend: POST /users/:id/avatar**
```typescript
// Request
POST /api/users/user-123/avatar
Headers: { Content-Type: 'multipart/form-data' }
Body: FormData { avatar: <File> }

// Response esperado
200 OK
Body: { avatar_url: 'https://storage.gamilit.com/avatars/user-123-timestamp.webp' }
```
- **NOTA:** Backend NO implementado (devuelve 501 Not Implemented) - Ver GAP-008

**5.5 Backend: PUT /users/:id/password**
```typescript
// Request
PUT /api/users/user-123/password
Body: { current_password: 'oldPass123', new_password: 'newPass456' }

// Response esperado
200 OK (sin body)

// Errores posibles
400 Bad Request: "La contraseña actual es incorrecta"
400 Bad Request: "La nueva contraseña debe tener al menos 8 caracteres"
```
- **NOTA:** Backend NO implementado (devuelve 501 Not Implemented) - Ver GAP-008

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Tipo | Métodos Usados | Propósito | Frecuencia |
|---|------------|------|----------------|-----------|------------|
| 5.6 | **SettingsPage Component** | React Component | `updateProfile()`, `updatePreferences()`, `uploadAvatar()`, `updatePassword()` | Persistir cambios de settings | On-demand (clic en botones) |

**Detalles de Consumidores:**

**5.6 SettingsPage Component**
```typescript
// apps/frontend/src/apps/student/pages/SettingsPage.tsx

// Método 1: handleSave() usa updateProfile + updatePreferences
const handleSave = async () => {
  await profileAPI.updateProfile(user!.id, profileData);
  await profileAPI.updatePreferences(user!.id, preferencesData);
};

// Método 2: handleAvatarUpload() usa uploadAvatar
const handleAvatarUpload = async (file: File) => {
  const result = await profileAPI.uploadAvatar(user!.id, file);
  setProfile(prev => ({ ...prev, avatar: result.avatar_url }));
};

// Método 3: handlePasswordChange() usa updatePassword
const handlePasswordChange = async () => {
  await profileAPI.updatePassword(user!.id, passwordsData);
};
```

---

### 6. SettingsPage Component

**Archivo:** `apps/frontend/src/apps/student/pages/SettingsPage.tsx`
**Gap:** STUDENT-GAP-007
**Tipo:** React Component (Frontend)

#### CONSUME (Dependencias Salientes)

| # | Componente | Tipo | Método/Propiedad | Propósito | Impacto si Falla |
|---|------------|------|------------------|-----------|------------------|
| 6.1 | **profileAPI Service** | API Service | `updateProfile()`, `updatePreferences()`, `uploadAvatar()`, `updatePassword()` | Persistir cambios en backend | 🔴 Crítico - No guarda cambios |
| 6.2 | **useAuth Hook** | Context Hook | `user.id` | Obtener ID del usuario autenticado | 🔴 Crítico - No sabe qué user editar |
| 6.3 | **react-hot-toast** | Library | `toast.success()`, `toast.error()` | Mostrar notificaciones | 🟡 Medio - No compila (pero UX pobre) |
| 6.4 | **Lucide Icons** | Library | `Loader2`, `User`, `Lock`, `Bell`, `Globe`, `Palette` | Íconos de UI y spinner | 🟡 Medio - No compila |

**Detalles de Dependencias:**

**6.1 profileAPI Service**
```typescript
import { profileAPI } from '@/services/api/profileAPI';

// 1. Guardar perfil y preferencias
const handleSave = async () => {
  try {
    await profileAPI.updateProfile(user!.id, profileData);
    await profileAPI.updatePreferences(user!.id, preferencesData);
    toast.success('Configuración guardada correctamente');
  } catch (error) {
    toast.error('Error al guardar');
  }
};

// 2. Subir avatar
const handleAvatarUpload = async (file: File) => {
  try {
    const result = await profileAPI.uploadAvatar(user!.id, file);
    setProfile(prev => ({ ...prev, avatar: result.avatar_url }));
    toast.success('Avatar actualizado');
  } catch (error) {
    toast.error('Error al subir avatar');
  }
};

// 3. Cambiar contraseña
const handlePasswordChange = async () => {
  try {
    await profileAPI.updatePassword(user!.id, passwordsData);
    toast.success('Contraseña actualizada');
  } catch (error) {
    toast.error('Error al cambiar contraseña');
  }
};
```

**6.2 useAuth Hook**
```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  // user.id se usa en todos los métodos:
  await profileAPI.updateProfile(user!.id, ...);
  await profileAPI.uploadAvatar(user!.id, ...);
}
```

**6.3 react-hot-toast**
```typescript
import toast from 'react-hot-toast';

// Éxito
toast.success('Configuración guardada correctamente');

// Error
toast.error(error.response?.data?.message || 'Error al guardar');
```
- Toast duration: 3-5 segundos por defecto
- Position: top-right (configurado en App.tsx con `<Toaster />`)

**6.4 Lucide Icons**
```typescript
import { Loader2, User, Lock, Bell, Globe, Palette } from 'lucide-react';

// Loading spinner
<Loader2 className="h-4 w-4 animate-spin" />

// Íconos de secciones
<User className="h-5 w-5" />  // Perfil
<Lock className="h-5 w-5" />  // Contraseña
<Bell className="h-5 w-5" />  // Notificaciones
```

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Tipo | Ruta | Propósito | Trigger |
|---|------------|------|------|-----------|---------|
| 6.5 | **React Router** | Routing | `/student/settings` | Renderizar página de settings | Usuario navega a URL |

---

### 7. gamification.missions (Tabla)

**Tipo:** PostgreSQL Table
**Gap:** STUDENT-GAP-001
**Schema:** gamification

#### ES CONSUMIDO POR (Dependencias Entrantes - Escritura)

| # | Componente | Operación | Campos Modificados | Propósito | Frecuencia |
|---|------------|-----------|-------------------|-----------|------------|
| 7.1 | **MissionsService.claimRewards()** | UPDATE | `status`, `claimed_at` | Marcar misión como reclamada | On-demand (student reclama) |

**Detalles:**

**7.1 MissionsService UPDATE**
```sql
-- Operación realizada por TypeORM
UPDATE gamification.missions
SET status = 'claimed',
    claimed_at = NOW()
WHERE id = $1 AND user_id = $2;
```
- Triggered by: Student hace clic en "Reclamar" en MissionsPage
- Validación previa: Mission status = 'completed' AND claimed_at IS NULL

#### ES CONSUMIDO POR (Dependencias Entrantes - Lectura)

| # | Componente | Operación | Filtros | Propósito | Frecuencia |
|---|------------|-----------|---------|-----------|------------|
| 7.2 | **MissionsService.claimRewards()** | SELECT | `id`, `user_id`, `status='completed'` | Validar que misión existe y está completada | On-demand |
| 7.3 | **MissionsService.getUserMissions()** | SELECT | `user_id`, `status IN (...)` | Listar misiones del student | Multiple veces (mount, refetch) |

---

### 8. users.user_stats (Tabla)

**Tipo:** PostgreSQL Table
**Gap:** STUDENT-GAP-001, STUDENT-GAP-006
**Schema:** users

#### ES CONSUMIDO POR (Dependencias Entrantes - Escritura)

| # | Componente | Operación | Campos Modificados | Propósito | Frecuencia |
|---|------------|-----------|-------------------|-----------|------------|
| 8.1 | **UserStatsService.addXp()** | UPDATE | `total_xp` | Incrementar XP del student | On-demand (misión, ejercicio) |

**Detalles:**

**8.1 UserStatsService UPDATE**
```sql
-- Operación realizada por TypeORM
UPDATE users.user_stats
SET total_xp = total_xp + $1
WHERE user_id = $2;

-- Trigger automático después del UPDATE
EXECUTE FUNCTION gamification.check_user_promotion();
```
- Trigger: `check_user_promotion_on_xp_update` se ejecuta AFTER UPDATE
- Efecto: Actualiza `gamification.user_ranks` si XP cruza umbral

#### ES CONSUMIDO POR (Dependencias Entrantes - Lectura)

| # | Componente | Operación | Filtros | Propósito | Frecuencia |
|---|------------|-----------|---------|-----------|------------|
| 8.2 | **AuthService.getUserStatistics()** | SELECT | `user_id` | Obtener total_xp para stats | On-demand (ProfilePage mount) |

---

### 9. gamification.user_ranks (Tabla)

**Tipo:** PostgreSQL Table
**Gap:** STUDENT-GAP-001, STUDENT-GAP-006
**Schema:** gamification

#### ES CONSUMIDO POR (Dependencias Entrantes - Escritura)

| # | Componente | Operación | Campos Modificados | Propósito | Trigger |
|---|------------|-----------|-------------------|-----------|---------|
| 9.1 | **check_user_promotion() Function** | UPDATE | `rank`, `promoted_at` | Promocionar student a nuevo rango | Trigger automático (XP update) |

**Detalles:**

**9.1 check_user_promotion() Function**
```sql
-- Función PL/pgSQL ejecutada por trigger
CREATE OR REPLACE FUNCTION gamification.check_user_promotion()
RETURNS TRIGGER AS $$
DECLARE
  current_xp INTEGER;
  new_rank VARCHAR;
BEGIN
  -- Obtener XP actual del student
  SELECT total_xp INTO current_xp
  FROM users.user_stats
  WHERE user_id = NEW.user_id;

  -- Determinar nuevo rango según XP
  new_rank := CASE
    WHEN current_xp >= 2000 THEN 'K''uk''ulkan'
    WHEN current_xp >= 1000 THEN 'Halach Uinic'
    WHEN current_xp >= 500 THEN 'Ah K''in'
    WHEN current_xp >= 200 THEN 'Nacom'
    ELSE 'Ajaw'
  END;

  -- Actualizar rango si cambió
  UPDATE gamification.user_ranks
  SET rank = new_rank,
      promoted_at = NOW()
  WHERE user_id = NEW.user_id
    AND rank != new_rank;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
- Triggered by: UPDATE en `users.user_stats.total_xp`
- Frecuencia: Cada vez que un student gana XP (misión, ejercicio)

#### ES CONSUMIDO POR (Dependencias Entrantes - Lectura)

| # | Componente | Operación | Filtros | Propósito | Frecuencia |
|---|------------|-----------|---------|-----------|------------|
| 9.2 | **RanksService.getCurrentRank()** | SELECT | `user_id` | Obtener rango actual del student | Multiple (antes/después de XP, ProfilePage) |
| 9.3 | **AuthService.getUserStatistics()** | SELECT | `user_id` | Incluir rango en stats | On-demand (ProfilePage mount) |

---

### 10. economy.ml_coins_transactions (Tabla)

**Tipo:** PostgreSQL Table
**Gap:** STUDENT-GAP-001
**Schema:** economy

#### ES CONSUMIDO POR (Dependencias Entrantes - Escritura)

| # | Componente | Operación | Campos Insertados | Propósito | Frecuencia |
|---|------------|-----------|------------------|-----------|------------|
| 10.1 | **MLCoinsService.addCoins()** | INSERT | `user_id`, `amount`, `reason`, `metadata`, `created_at` | Registrar transacción de coins | On-demand (misión, ejercicio) |

**Detalles:**

**10.1 MLCoinsService INSERT**
```sql
-- Operación realizada por TypeORM
INSERT INTO economy.ml_coins_transactions
  (user_id, amount, reason, metadata, created_at)
VALUES
  ($1, $2, $3, $4, NOW());

-- Ejemplo de transacción al reclamar misión
-- user_id: 'user-123'
-- amount: 50
-- reason: 'Recompensa por completar misión: Completa 5 ejercicios'
-- metadata: { mission_id: 'mission-456', mission_type: 'daily', mission_title: 'Completa 5 ejercicios' }
```
- Registro de auditoría: Todas las transacciones quedan registradas (no se eliminan)
- Saldo calculado: `SELECT SUM(amount) FROM ml_coins_transactions WHERE user_id = $1`

---

### 11. React Query (@tanstack/react-query)

**Tipo:** External Library (npm package)
**Gap:** STUDENT-GAP-006
**Versión:** ^4.x o ^5.x

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Hook/Método Usado | Propósito | Configuración |
|---|------------|------------------|-----------|---------------|
| 11.1 | **useUserStatistics Hook** | `useQuery()` | Fetch de estadísticas con caché | `staleTime: 120000`, `refetchOnWindowFocus: true` |
| 11.2 | **useMissions Hook** | `useQuery()`, `useMutation()` | Fetch de misiones + mutación de claim | N/A (no modificado en este sprint) |

---

### 12. react-hot-toast

**Tipo:** External Library (npm package)
**Gap:** STUDENT-GAP-007
**Versión:** ^2.x

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Métodos Usados | Propósito | Tipos de Toast |
|---|------------|---------------|-----------|----------------|
| 12.1 | **SettingsPage Component** | `toast.success()`, `toast.error()` | Notificaciones de operaciones | Success: guardado exitoso, Error: fallo al guardar |

**Detalles:**

**12.1 SettingsPage Toast Usage**
```typescript
// Éxito
toast.success('Configuración guardada correctamente');
toast.success('Avatar actualizado correctamente');
toast.success('Contraseña actualizada correctamente');

// Error
toast.error(error.response?.data?.message || 'Error al guardar la configuración');
toast.error('La imagen no puede superar los 2MB');
toast.error('Formato inválido. Usa JPG, PNG o WebP');
```

---

### 13. apiClient (Axios Instance)

**Tipo:** Internal Service
**Archivo:** `apps/frontend/src/services/api/apiClient.ts`
**Gap:** STUDENT-GAP-006, STUDENT-GAP-007

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Métodos Usados | Endpoints Llamados | Propósito |
|---|------------|---------------|-------------------|-----------|
| 13.1 | **useUserStatistics Hook** | `get()` | `GET /users/:id/statistics` | Fetch de stats |
| 13.2 | **profileAPI Service** | `put()`, `post()` | `PUT /users/:id/profile`, `PUT /users/:id/preferences`, `POST /users/:id/avatar`, `PUT /users/:id/password` | Operaciones de settings |

**Características:**
- Base URL: `process.env.REACT_APP_API_URL` (ej: `https://api.gamilit.com`)
- Request Interceptor: Agrega `Authorization: Bearer <JWT>` automáticamente
- Response Interceptor: Maneja errores 401 (redirect a login), errores de red

---

### 14. useAuth Hook

**Tipo:** Context Hook
**Archivo:** `apps/frontend/src/contexts/AuthContext.tsx`
**Gap:** STUDENT-GAP-006, STUDENT-GAP-007

#### ES CONSUMIDO POR (Dependencias Entrantes)

| # | Componente | Propiedades Usadas | Propósito | Frecuencia |
|---|------------|-------------------|-----------|------------|
| 14.1 | **ProfilePage Component** | `user.id`, `logout()` | Obtener ID del usuario + opción de logout | 1x por mount |
| 14.2 | **SettingsPage Component** | `user.id` | Obtener ID del usuario para editar perfil | 1x por mount |
| 14.3 | **useUserStatistics Hook** | `user.id` (vía ProfilePage) | Construir URL del endpoint | Indirecto |

---

## 📊 MATRIZ DE ACOPLAMIENTO

### Nivel de Acoplamiento por Componente

| Componente | Dependencias Salientes | Dependencias Entrantes | Nivel de Acoplamiento | Evaluación |
|------------|------------------------|------------------------|-----------------------|------------|
| **MissionsService** | 4 | 2 | Alto | ⚠️ Refactorizar si crece |
| **MissionsController** | 3 | 2 | Medio | ✅ Aceptable |
| **AuthService.getUserStatistics()** | 6 | 2 | Alto | ⚠️ Queries a 6 tablas (aceptable para stats) |
| **UsersController** | 2 | 2 | Bajo | ✅ Excelente |
| **useUserStatistics** | 3 | 1 | Bajo | ✅ Excelente |
| **ProfilePage** | 3 | 1 | Bajo | ✅ Excelente |
| **profileAPI** | 5 | 1 | Medio-Alto | ⚠️ Muchos endpoints |
| **SettingsPage** | 4 | 1 | Medio | ✅ Aceptable |

**Interpretación:**
- **Bajo (1-2):** Excelente - Fácil de mantener y testear
- **Medio (3-4):** Aceptable - Atención a cambios
- **Alto (5+):** ⚠️ Refactorizar - Difícil de mantener

---

## 🔄 DIAGRAMAS DE FLUJO DE DATOS

### Flujo: Reclamar Misión (GAP-001)

```
[Student UI]
    ↓ (1) Click "Reclamar"
[MissionsPage.tsx]
    ↓ (2) useClaimMissionRewards.mutate(missionId)
[apiClient]
    ↓ (3) POST /api/missions/:id/claim (+ JWT token)
[MissionsController]
    ↓ (4) claimMissionRewards(missionId, userId)
[MissionsService]
    ├─ (5a) SELECT mission (missionsRepository)
    ├─ (5b) Validate mission completed & not claimed
    ├─ (6a) getCurrentRank(userId) → previousRank
    ├─ (7a) MLCoinsService.addCoins() → INSERT ml_coins_transactions
    ├─ (7b) UserStatsService.addXp() → UPDATE user_stats.total_xp
    ├─ (7c) [Trigger] check_user_promotion() → UPDATE user_ranks (si aplica)
    ├─ (6b) getCurrentRank(userId) → newRank
    ├─ (8) Compare previousRank vs newRank → detect promotion
    ├─ (9) UPDATE mission (status='claimed', claimed_at=NOW)
    └─ (10) Return mission + rewards_granted
[Frontend]
    ├─ (11) Invalidate ['missions'] query cache
    ├─ (12) Show toast: "Recompensas reclamadas: +100 XP, +50 coins"
    └─ (13) If rank_promotion: Show toast: "¡Promoción! Ahora eres Nacom"
```

### Flujo: Cargar Perfil (GAP-006)

```
[Student UI]
    ↓ (1) Navigate to /student/profile
[React Router]
    ↓ (2) Mount ProfilePage component
[ProfilePage]
    ├─ (3) useAuth() → get user.id
    └─ (4) useUserStatistics(user.id) → React Query
        ├─ (5) Check cache: Has ['userStatistics', user.id]?
        │   ├─ YES + fresh (< 2 min) → (6a) Return cached data (skip fetch)
        │   └─ NO or stale → (6b) Execute queryFn
        ├─ (7) apiClient.get('/users/user-123/statistics') (+ JWT)
        └─ (8) Backend: GET /users/:id/statistics → UsersController
            ├─ (9) AuthService.getUserStatistics() → 6 queries reales (GAP-008)
            │   ├─ Query 1: SUM ml_coins_transactions → balance
            │   ├─ Query 2: SELECT user_stats → XP, modules, streak
            │   ├─ Query 3: SELECT user_ranks (is_current=true) → rank
            │   ├─ Query 4: COUNT user_achievements (is_completed=true) → earned
            │   ├─ Query 5: COUNT achievements (is_active=true) → available
            │   └─ Query 6: COUNT exercise_submissions (is_correct=true) → completed
            ├─ (10) Manejar edge cases (NULLs, usuarios nuevos, fallbacks)
            └─ (11) Return UserStatistics object con datos reales
[React Query]
    ├─ (12) Cache response (key: ['userStatistics', 'user-123'], staleTime: 2min)
    └─ (13) Trigger re-render with data
[ProfilePage]
    ├─ (14) Construct stats array from userStats
    └─ (15) Render stats cards with real values
```

### Flujo: Guardar Settings (GAP-007)

```
[Student UI]
    ↓ (1) Edit fields + Click "Guardar cambios"
[SettingsPage]
    ├─ (2) handleSave() async
    ├─ (3) setSaveStatus('saving') → Button shows "Guardando..." + Loader2
    ├─ (4) profileAPI.updateProfile(user.id, profileData)
    │   ├─ (5) PUT /api/users/user-123/profile (+ JWT)
    │   └─ (6) Backend: UsersController.updateProfile()
    │       ├─ (7) Validate email unique
    │       ├─ (8) UPDATE users.users SET first_name=..., last_name=..., email=...
    │       └─ (9) Return updated user
    ├─ (10) profileAPI.updatePreferences(user.id, preferencesData)
    │   ├─ (11) PUT /api/users/user-123/preferences (+ JWT)
    │   └─ (12) Backend: UsersController.updatePreferences()
    │       ├─ (13) UPDATE users.users SET preferences=... (JSONB)
    │       └─ (14) Return updated user
    ├─ (15) [Success] setSaveStatus('saved') → Button shows "Guardado ✓"
    ├─ (16) toast.success('Configuración guardada correctamente')
    └─ (17) setTimeout → setSaveStatus('idle') (after 2s)

[Error Path]
    ├─ (E1) [Catch] setSaveStatus('error') → Button shows "Error ✗"
    ├─ (E2) toast.error(error.response?.data?.message || 'Error al guardar')
    └─ (E3) setTimeout → setSaveStatus('idle') (after 3s)
```

---

## 🎯 RECOMENDACIONES

### Reducir Acoplamiento

1. **MissionsService (4 dependencias salientes):**
   - Considerar patrón Event-Driven: Emitir evento `MissionClaimedEvent` en lugar de llamar directamente a MLCoinsService, UserStatsService
   - Beneficio: Otros listeners podrían reaccionar (ej: AchievementsService detecta "Completa 10 misiones")
   - Implementación: NestJS EventEmitter

2. **profileAPI (5 endpoints):**
   - Ya está bien estructurado (cada método = 1 endpoint)
   - Mantener como está, no refactorizar innecesariamente

### Mejorar Testabilidad

1. **Agregar tests unitarios para componentes con alto acoplamiento:**
   - `MissionsService.claimRewards()` - Mockear 4 dependencias
   - `SettingsPage.handlePasswordChange()` - Mockear profileAPI y validar lógica

2. **Agregar tests de integración para flujos completos:**
   - Flujo: Reclamar misión → Validar XP/coins en BD
   - Flujo: Cambiar contraseña → Validar login con nueva password

### Monitorear Dependencias Externas

1. **React Query:**
   - Considerar migrar a v5 si estamos en v4 (mejoras de performance)
   - Configurar QueryClient global con defaults (staleTime, cacheTime)

2. **react-hot-toast:**
   - Evaluar alternativas si hay problemas (ej: react-toastify)
   - Considerar implementar toast queue para múltiples toasts simultáneos

---

## ✅ CONCLUSIÓN

### Resumen de Dependencias

| Capa | Componentes Analizados | Dependencias Salientes (Avg) | Dependencias Entrantes (Avg) | Acoplamiento Promedio |
|------|------------------------|------------------------------|------------------------------|----------------------|
| **Backend** | 4 | 3.75 | 2.0 | Medio-Alto |
| **Frontend** | 4 | 3.5 | 1.0 | Medio-Bajo |
| **Database** | 10 | 0 | 1.5 | Bajo |
| **External** | 4 | 0 | 1.5 | Bajo |

### Estado de Dependencias

- ✅ **Arquitectura limpia:** Separación de concerns bien definida
- ✅ **Bajo acoplamiento frontend:** Hooks reutilizables, componentes independientes
- ⚠️ **Acoplamiento medio backend:** MissionsService con 4 dependencias (acceptable)
- ✅ **Dependencias externas bien gestionadas:** Npm packages estables y populares

### Próximos Pasos

1. **✅ COMPLETADO (2025-11-24):** Implementar backend real (GAP-008) ✅
   - AuthService.getUserStatistics() con 6 queries reales
   - Multi-schema integration (gamification, progress)
   - Edge cases manejados

2. **Importante (P1):** Agregar tests unitarios (mockear dependencias)
   - AuthService.getUserStatistics() - mockear 6 repositorios
   - MissionsService.claimRewards() - mockear 4 dependencias
   - useUserStatistics hook - testing con React Query

3. **Mejora (P2):** Considerar Event-Driven architecture para reducir acoplamiento
   - Emitir MissionClaimedEvent en lugar de llamar directamente a servicios
   - Permite extensibilidad sin modificar MissionsService

4. **Pendiente (P2):** Implementar PUT/POST endpoints para Settings
   - updateProfile(), updatePreferences(), uploadAvatar(), updatePassword()
   - Frontend ya implementado (GAP-007)

---

**Matriz generada:** 2025-11-24
**Última actualización:** 2025-11-24 (Post-GAP-008)
**Versión:** 1.1.0
**Estado:** ✅ COMPLETADO
