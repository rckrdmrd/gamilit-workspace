---
id: "ET-PERF-001"
title: "Perfil de Estudiante - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P1"
epic: "EXT-004"
module: "profile"
labels: ["profile", "student", "gamification", "personalization"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-PERF-001"]
related_us: ["US-PERF-001"]
---

# ET-PERF-001: Perfil de Estudiante - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-PERF-001 |
| **Epic** | EXT-004 - Perfiles Extendidos |
| **RF Relacionado** | RF-PERF-001 (Student Profile) |
| **US Relacionadas** | US-PERF-001 |
| **Prioridad** | P1 - Alta |
| **Estado** | Implementado |

---

## Descripcion Tecnica

El sistema de perfil de estudiante permite la visualizacion y personalizacion de informacion personal, estadisticas de gamificacion, logros y preferencias. Incluye dos versiones:

1. **ProfilePage**: Perfil basico con estadisticas y logros recientes
2. **EnhancedProfilePage**: Perfil extendido con graficos, historial de rangos y tabs interactivos

---

## Componentes Frontend

### Paginas Principales

| Componente | Path | Descripcion |
|------------|------|-------------|
| `ProfilePage` | `apps/frontend/src/apps/student/pages/ProfilePage.tsx` | Pagina basica de perfil con estadisticas |
| `EnhancedProfilePage` | `apps/frontend/src/apps/student/pages/EnhancedProfilePage.tsx` | Perfil extendido con graficos y tabs |
| `SettingsPage` | `apps/frontend/src/apps/student/pages/SettingsPage.tsx` | Configuracion de perfil |

### Componentes de Perfil

| Componente | Path | Descripcion |
|------------|------|-------------|
| `GamifiedHeader` | `apps/frontend/src/shared/components/layout/GamifiedHeader.tsx` | Header con datos de gamificacion |
| `DetectiveCard` | `apps/frontend/src/shared/components/base/DetectiveCard.tsx` | Card estilizada para mostrar info |
| `RankBadge` | `apps/frontend/src/shared/components/base/RankBadge.tsx` | Badge de rango del estudiante |
| `StreakIndicator` | `apps/frontend/src/features/gamification/components/StreakIndicator.tsx` | Indicador de racha |
| `AvatarUpload` | `apps/frontend/src/shared/components/AvatarUpload.tsx` | Subida de avatar personalizado |
| `Avatar` | `apps/frontend/src/shared/components/Avatar.tsx` | Componente de avatar |

### Hooks

| Hook | Path | Descripcion |
|------|------|-------------|
| `useUserGamification` | `apps/frontend/src/shared/hooks/useUserGamification.ts` | Datos de gamificacion del usuario |
| `useUserStatistics` | `apps/frontend/src/shared/hooks/useUserStatistics.ts` | Estadisticas reales del backend |
| `useAuthStore` | `apps/frontend/src/features/auth/store/authStore.ts` | Estado de autenticacion |
| `useRanksStore` | `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts` | Datos de rangos |
| `useEconomyStore` | `apps/frontend/src/features/gamification/economy/store/economyStore.ts` | Balance de ML Coins |
| `useAchievementsStore` | `apps/frontend/src/features/gamification/social/store/achievementsStore.ts` | Logros del usuario |

### Tipos

| Archivo | Path | Descripcion |
|---------|------|-------------|
| `profile.types.ts` | `apps/frontend/src/shared/types/profile.types.ts` | Tipos de perfil |

---

## Servicios Backend

### Servicios Principales

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `ProfileService` | `apps/backend/src/modules/profile/services/profile.service.ts` | Servicio CRUD de perfiles |

### Metodos del ProfileService

```typescript
class ProfileService {
  // Obtener perfil por user ID
  async getProfile(userId: string): Promise<Profile>;

  // Obtener perfil por profile ID
  async getProfileById(profileId: string): Promise<Profile>;

  // Actualizar perfil
  async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<Profile>;

  // Actualizar avatar
  async uploadAvatar(userId: string, avatarUrl: string): Promise<Profile>;

  // Actualizar ultima actividad
  async updateLastActivity(userId: string): Promise<Profile>;
}
```

### Controladores

| Controlador | Path | Descripcion |
|-------------|------|-------------|
| `ProfileController` | `apps/backend/src/modules/profile/controllers/profile.controller.ts` | Endpoints de perfil |

### DTOs

| DTO | Path | Descripcion |
|-----|------|-------------|
| `UpdateProfileDto` | `apps/backend/src/modules/profile/dto/` | DTO para actualizar perfil |

---

## Tablas/Schemas de Base de Datos

### Schema: `auth_management`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `profiles` | Perfiles de usuario | id, user_id, display_name, full_name, avatar_url, bio, last_activity_at |

### Campos de la Tabla `profiles`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK a users |
| `display_name` | VARCHAR(100) | Nombre para mostrar |
| `full_name` | VARCHAR(255) | Nombre completo |
| `avatar_url` | TEXT | URL del avatar |
| `bio` | VARCHAR(500) | Biografia del usuario |
| `last_activity_at` | TIMESTAMP | Ultima actividad |
| `created_at` | TIMESTAMP | Fecha de creacion |
| `updated_at` | TIMESTAMP | Fecha de actualizacion |

### Schema: `gamification_system`

| Tabla | Descripcion | Uso |
|-------|-------------|-----|
| `user_stats` | Estadisticas del usuario | ML Coins, XP, nivel |
| `user_achievements` | Logros desbloqueados | Logros obtenidos |
| `achievements` | Catalogo de logros | Definicion de logros |

---

## APIs Endpoints

### Perfil

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/profile/:userId` | GET | Obtener perfil de usuario |
| `/api/v1/profile/:userId` | PUT | Actualizar perfil |
| `/api/v1/profile/:userId/avatar` | POST | Subir avatar |
| `/api/v1/profile/:userId/stats` | GET | Obtener estadisticas |
| `/api/v1/profile/:userId/activity` | GET | Historial de actividad |
| `/api/v1/profile/:userId/validate-username` | POST | Validar username unico |

### Response: GET /api/v1/profile/:userId

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "display_name": "Detective Juan",
  "full_name": "Juan Perez",
  "avatar_url": "https://storage.example.com/avatars/user.jpg",
  "bio": "Estudiante de primaria",
  "last_activity_at": "2026-01-27T10:00:00Z"
}
```

### Response: GET /api/v1/profile/:userId/stats

```json
{
  "total_ml_coins": 1500,
  "achievements_earned": 12,
  "total_achievements": 50,
  "total_exercises": 45,
  "current_level": 5,
  "total_xp": 2500
}
```

---

## Flujos de Usuario

### Flujo 1: Ver Perfil

```
1. Usuario navega a /profile
2. ProfilePage carga con useAuth() para obtener user
3. useUserGamification(userId) obtiene datos de gamificacion
4. useUserStatistics(userId) obtiene estadisticas del backend
5. Se renderizan cards con avatar, nombre, estadisticas
6. Se muestra lista de logros recientes
```

### Flujo 2: Ver Perfil Extendido

```
1. Usuario navega a /profile/enhanced
2. EnhancedProfilePage carga stores de Zustand
3. fetchUserProgress(), fetchBalance(), fetchAchievements() en paralelo
4. Usuario selecciona tab (overview, stats, history, achievements)
5. Contenido del tab se renderiza con animaciones
6. Graficos de Recharts muestran datos de actividad
```

### Flujo 3: Actualizar Avatar

```
1. Usuario hace click en avatar para editar
2. AvatarUpload component abre selector de archivo
3. Validacion de tipo (JPG/PNG) y tamano (max 2MB)
4. Upload a storage service
5. ProfileService.uploadAvatar() actualiza URL
6. Avatar se actualiza en todos los componentes
```

---

## Dependencias

### Dependencias de Modulos

- `AuthModule` - Autenticacion y usuario actual
- `GamificationModule` - Datos de gamificacion, logros, rangos
- `ProgressModule` - Estadisticas de ejercicios

### Dependencias Externas

- `recharts` - Graficos de estadisticas
- `framer-motion` - Animaciones
- `zustand` - Estado global

---

## Criterios de Aceptacion

### CA-01: Visualizacion de Perfil Basico
- [x] Avatar visible con fallback a icono de usuario
- [x] Nombre y email del usuario mostrados
- [x] Badge de rango actual visible
- [x] Fecha de registro mostrada

### CA-02: Estadisticas de Gamificacion
- [x] ML Coins totales
- [x] Logros desbloqueados / total
- [x] Ejercicios completados
- [x] Nivel y XP actual

### CA-03: Logros Recientes
- [x] Lista de ultimos logros desbloqueados
- [x] Titulo, descripcion y fecha de cada logro
- [x] Navegacion a pagina completa de logros

### CA-04: Perfil Extendido
- [x] Tabs para navegacion (Overview, Stats, History, Achievements)
- [x] Graficos de actividad (AreaChart, BarChart)
- [x] Timeline de historial de rangos
- [x] Progress bar hacia siguiente rango

### CA-05: Responsive
- [x] Layout adaptable a desktop/tablet/mobile
- [x] Grid responsive para estadisticas
- [x] Tabs convierten a dropdown en mobile

### CA-06: Loading States
- [x] Skeleton durante carga
- [x] Spinner con mensaje de carga
- [x] Error state con mensaje descriptivo

---

## Notas de Implementacion

### Integracion con Stores

```typescript
// EnhancedProfilePage usa Zustand selectors para evitar re-renders
const user = useAuthStore((state) => state.user);
const userProgress = useRanksStore((state) => state.userProgress);
const balance = useEconomyStore((state) => state.balance);
const achievements = useAchievementsStore((state) => state.achievements);
```

### Validaciones

- Bio maximo 500 caracteres (validado en backend)
- Avatar: JPG/PNG, max 2MB
- Username: unico, 3-20 caracteres, alfanumerico

---

## Referencias

- US-PERF-001: Personalizacion Avanzada de Perfil
- Profile Entity: `apps/backend/src/modules/auth/entities/profile.entity.ts`
- TRACEABILITY.yml: Mapeo de implementacion

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
