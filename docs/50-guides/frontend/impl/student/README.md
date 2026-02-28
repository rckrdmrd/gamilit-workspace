---
titulo: Portal Student - Documentacion
tipo: readme
fecha_creacion: 2025-10-01
ultima_actualizacion: 2026-02-28
estado: activo
---

# PORTAL STUDENT - DOCUMENTACION

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Portal:** Student
**Version:** 1.0
**Fecha:** 2025-12-23

---

## RESUMEN

| Metrica | Valor |
|---------|-------|
| **Paginas** | 70 |
| **Componentes** | 571 (production .tsx) |
| **Hooks** | 119 |
| **Zustand Stores** | 13 |
| **Ubicacion** | `apps/frontend/src/apps/student/` |

> **Nota:** Metricas verificadas 2026-02-18 (post Student Portal Refactoring Fases 0-4). Los counts incluyen todos los portales del frontend.

---

## ESTRUCTURA DE CARPETAS

```
apps/frontend/src/apps/student/
├── pages/                    # Paginas del portal (27)
│   ├── admin/               # Paginas admin (3 - ubicacion incorrecta)
│   └── __tests__/           # Tests de paginas
├── components/              # Componentes especificos
├── hooks/                   # Hooks del portal
├── layouts/                 # Layouts
└── router.tsx              # Configuracion de rutas
```

---

## PAGINAS DEL PORTAL

### 1. AUTENTICACION

| Pagina | Archivo | Descripcion |
|--------|---------|-------------|
| Login | `LoginPage.tsx` | Inicio de sesion |
| Register | `RegisterPage.tsx` | Registro de usuario |
| Password Recovery | `PasswordRecoveryPage.tsx` | Recuperar contrasena |
| Password Reset | `PasswordResetPage.tsx` | Restablecer contrasena |
| Email Verification | `EmailVerificationPage.tsx` | Verificar email |
| Two Factor Auth | `TwoFactorAuthPage.tsx` | Autenticacion 2FA |

### 2. DASHBOARD Y NAVEGACION

| Pagina | Archivo | Descripcion |
|--------|---------|-------------|
| Dashboard | `DashboardComplete.tsx` | Panel principal del estudiante |
| Not Found | `NotFoundPage.tsx` | Pagina 404 |

### 3. CONTENIDO EDUCATIVO

| Pagina | Archivo | Descripcion |
|--------|---------|-------------|
| Module Detail | `ModuleDetailPage.tsx` | Detalle de modulo educativo |
| Exercise | `ExercisePage.tsx` | Ejercicios interactivos |
| Assignments | `AssignmentsPage.tsx` | Tareas asignadas |

### 4. GAMIFICACION

| Pagina | Archivo | Descripcion |
|--------|---------|-------------|
| Gamification | `GamificationPage.tsx` | Vista general de gamificacion |
| Gamification Test | `GamificationTestPage.tsx` | Pagina de pruebas |
| Achievements | `AchievementsPage.tsx` | Logros desbloqueados |
| Leaderboard | `LeaderboardPage.tsx` | Tabla de clasificacion |
| New Leaderboard | `NewLeaderboardPage.tsx` | Nueva version leaderboard |
| Shop | `ShopPage.tsx` | Tienda de items |
| Inventory | `InventoryPage.tsx` | Inventario del estudiante |
| Missions | `MissionsPage.tsx` | Misiones diarias/semanales |

### 5. SOCIAL

| Pagina | Archivo | Descripcion |
|--------|---------|-------------|
| Friends | `FriendsPage.tsx` | Lista de amigos |
| Guilds | `GuildsPage.tsx` | Equipos/Gremios |

### 6. PERFIL Y CONFIGURACION

| Pagina | Archivo | Descripcion |
|--------|---------|-------------|
| Profile | `ProfilePage.tsx` | Perfil basico |
| Enhanced Profile | `EnhancedProfilePage.tsx` | Perfil extendido |
| Settings | `SettingsPage.tsx` | Configuracion general |
| Notifications | `NotificationsPage.tsx` | Centro de notificaciones |
| Notification Preferences | `NotificationPreferencesPage.tsx` | Preferencias de notificaciones |
| Device Management | `DeviceManagementSection.tsx` | Gestion de dispositivos |

### 7. ADMIN

> **NOTA:** Los archivos admin que estaban en `student/pages/admin/` fueron eliminados
> el 2025-12-23 por ser codigo huerfano. Las paginas admin activas estan en
> `apps/admin/pages/`.

---

## FLUJOS DE NAVEGACION

### Flujo de Login
```
LoginPage -> DashboardComplete
    |
    └-> RegisterPage
    └-> PasswordRecoveryPage -> PasswordResetPage
```

### Flujo Educativo
```
DashboardComplete -> ModuleDetailPage -> ExercisePage
                  -> AssignmentsPage
```

### Flujo Gamificacion
```
DashboardComplete -> GamificationPage
                  -> AchievementsPage
                  -> LeaderboardPage
                  -> MissionsPage
                  -> ShopPage -> InventoryPage
```

### Flujo Social
```
DashboardComplete -> FriendsPage
                  -> GuildsPage
                  -> LeaderboardPage
```

---

## HOOKS PRINCIPALES

| Hook | Descripcion |
|------|-------------|
| `useAuth` | Autenticacion y sesion |
| `useModules` | Modulos educativos |
| `useExercises` | Ejercicios |
| `useProgress` | Progreso del estudiante |
| `useAchievements` | Logros |
| `useMissions` | Misiones |
| `useLeaderboard` | Tabla de clasificacion |
| `useNotifications` | Notificaciones |
| `useFriends` | Amistades |
| `useGuilds` | Equipos |
| `useShop` | Tienda |
| `useInventory` | Inventario |
| `useUserClassroom` | Aula del usuario |
| `useProfile` | Perfil del usuario |

---

## STORES (ZUSTAND)

| Store | Descripcion |
|-------|-------------|
| `authStore` | Estado de autenticacion |
| `progressStore` | Estado de progreso |
| `gamificationStore` | Estado de gamificacion |
| `notificationStore` | Estado de notificaciones |
| `socialStore` | Estado social |

---

## RUTAS PRINCIPALES

```typescript
// Publicas
/login
/register
/forgot-password
/reset-password/:token
/verify-email/:token

// Protegidas
/dashboard
/modules/:moduleId
/exercises/:exerciseId
/assignments
/achievements
/leaderboard
/missions
/shop
/inventory
/friends
/guilds
/profile
/settings
/notifications
```

---

## COMPONENTES DESTACADOS

### Dashboard
- `StudentDashboard`
- `ProgressOverview`
- `RecentActivity`
- `QuickActions`
- `ModuleCards`

### Gamificacion
- `RankBadge`
- `MLCoinsDisplay`
- `AchievementCard`
- `MissionCard`
- `LeaderboardTable`
- `ShopItemCard`
- `InventoryGrid`

### Ejercicios
- `ExerciseContainer`
- `ExerciseHeader`
- `ExerciseContent`
- `ExerciseFeedback`
- `ProgressIndicator`

### Social
- `FriendCard`
- `GuildCard`
- `LeaderboardEntry`

---

## INTEGRACION CON BACKEND

### APIs Consumidas

| Modulo Backend | Endpoints Usados |
|----------------|------------------|
| Auth | /auth/login, /auth/register, /auth/profile |
| Educational | /modules, /exercises |
| Progress | /progress, /attempts |
| Gamification | /achievements, /missions, /shop |
| Social | /friends, /guilds, /leaderboard |
| Notifications | /notifications |

---

## TESTS

| Archivo | Descripcion |
|---------|-------------|
| `LoginPage.test.tsx` | Tests de login |
| `RegisterPage.test.tsx` | Tests de registro |
| `EmailVerificationPage.test.tsx` | Tests de verificacion |
| `UserManagementPage.test.tsx` | Tests de admin |

---

## PENDIENTES / MEJORAS

1. ~~**P0:** Archivos admin huerfanos~~ ✅ ELIMINADOS (2025-12-23)
2. **P1:** Agregar mas tests de paginas
3. **P1:** Documentar componentes individuales
4. **P2:** Agregar screenshots

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
