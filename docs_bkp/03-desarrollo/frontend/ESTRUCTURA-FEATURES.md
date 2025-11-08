# Estructura de Features Frontend

**Código que mapea:** `apps/frontend/src/features/`
**Última actualización:** 2025-11-07

---

## 📋 Propósito

Documenta la estructura de features del frontend React organizado por Feature-Sliced Design.

---

## 🗂️ Features Implementadas

| # | Feature | Path | Propósito | Componentes | Estado |
|---|---------|------|-----------|-------------|--------|
| 1 | **admin** | `apps/frontend/src/features/admin/` | Portal de administrador | ~52 | ✅ |
| 2 | **auth** | `apps/frontend/src/features/auth/` | Autenticación y login | ~15 | ✅ |
| 3 | **content** | `apps/frontend/src/features/content/` | Gestión de contenido | ~20 | ✅ |
| 4 | **education** | `apps/frontend/src/features/education/` | Módulos educativos | ~35 | ✅ |
| 5 | **exercises** | `apps/frontend/src/features/exercises/` | Ejercicios interactivos | ~40 | ✅ |
| 6 | **gamification** | `apps/frontend/src/features/gamification/` | Sistema de gamificación | ~30 | ✅ |
| 7 | **mechanics** | `apps/frontend/src/features/mechanics/` | 33 mecánicas educativas | ~33 | ✅ |
| 8 | **missions** | `apps/frontend/src/features/missions/` | Sistema de misiones | ~15 | ✅ |
| 9 | **notifications** | `apps/frontend/src/features/notifications/` | Notificaciones | ~12 | ✅ |
| 10 | **progress** | `apps/frontend/src/features/progress/` | Tracking de progreso | ~25 | ✅ |

**Total features:** 10
**Total componentes en features:** ~277

---

## 📐 Estructura Estándar de una Feature

```
features/{nombre}/
├── components/           # Componentes específicos de la feature
│   ├── {Feature}Card.tsx
│   ├── {Feature}List.tsx
│   └── {Feature}Modal.tsx
├── pages/                # Páginas de la feature
│   ├── {Feature}Page.tsx
│   └── {Feature}DetailPage.tsx
├── hooks/                # Custom hooks de la feature
│   └── use{Feature}.ts
├── services/             # API calls de la feature
│   └── {feature}.service.ts
├── types/                # Tipos TypeScript
│   └── {feature}.types.ts
├── utils/                # Utilidades específicas
│   └── {feature}.utils.ts
└── index.ts              # Exports públicos
```

---

## 🗺️ Desglose por Feature

### 1. admin/ - Portal de Administrador

**Path:** `apps/frontend/src/features/admin/`

**Propósito:** Dashboard y gestión del administrador

**Componentes principales:**
- UserManagement
- ClassroomManagement
- ContentManagement
- AnalyticsDashboard
- SystemConfiguration

**Total componentes:** ~52

**Rol requerido:** `super_admin`

---

### 2. auth/ - Autenticación

**Path:** `apps/frontend/src/features/auth/`

**Propósito:** Login, registro y autenticación

**Componentes principales:**
- LoginForm
- RegisterForm
- OAuthButtons (Google, Facebook, Apple, etc.)
- PasswordReset

**Total componentes:** ~15

**Público:** Sí

---

### 3. content/ - Gestión de Contenido

**Path:** `apps/frontend/src/features/content/`

**Propósito:** Upload y gestión de contenido multimedia

**Componentes principales:**
- FileUploader
- MediaGallery
- ContentEditor

**Total componentes:** ~20

---

### 4. education/ - Módulos Educativos

**Path:** `apps/frontend/src/features/education/`

**Propósito:** 5 módulos educativos de lectoescritura

**Módulos:**
1. Comprensión Literal
2. Comprensión Inferencial
3. Comprensión Crítica
4. Lectura Digital
5. Producción de Textos

**Total componentes:** ~35

---

### 5. exercises/ - Ejercicios Interactivos

**Path:** `apps/frontend/src/features/exercises/`

**Propósito:** Sistema de ejercicios interactivos

**Componentes principales:**
- ExerciseViewer
- ExerciseSubmit
- FeedbackPanel
- HintSystem

**Total componentes:** ~40

---

### 6. gamification/ - Gamificación

**Path:** `apps/frontend/src/features/gamification/`

**Propósito:** Sistema de gamificación (achievements, badges, coins)

**Componentes principales:**
- AchievementCard
- BadgeDisplay
- LeaderboardTable
- MLCoinsDisplay
- RankProgressBar

**Total componentes:** ~30

---

### 7. mechanics/ - 33 Mecánicas Educativas

**Path:** `apps/frontend/src/features/mechanics/`

**Propósito:** 33 mecánicas interactivas de ejercicios

**Mecánicas implementadas:**
1. MultipleChoice
2. TrueFalse
3. FillInBlank
4. Matching
5. Ordering
6. Categorization
7. DragAndDrop
8. Hotspot
9. TextInput
10. Essay
... (33 total)

**Total componentes:** ~33 (1 por mecánica)

---

### 8. missions/ - Misiones

**Path:** `apps/frontend/src/features/missions/`

**Propósito:** Sistema de misiones y desafíos

**Componentes principales:**
- MissionCard
- MissionProgress
- MissionRewards

**Total componentes:** ~15

---

### 9. notifications/ - Notificaciones

**Path:** `apps/frontend/src/features/notifications/`

**Propósito:** Sistema de notificaciones en tiempo real

**Componentes principales:**
- NotificationBell
- NotificationList
- NotificationToast

**Total componentes:** ~12

---

### 10. progress/ - Progreso

**Path:** `apps/frontend/src/features/progress/`

**Propósito:** Visualización de progreso del estudiante

**Componentes principales:**
- ProgressCard
- ProgressDashboard
- ProgressChart
- ActivityHistory

**Total componentes:** ~25

---

## 🔗 Dependencias entre Features

### Features independientes

```
auth/
notifications/
```

### Features con dependencias

```
exercises/ → education/ (requiere módulos)
progress/ → exercises/ (requiere ejercicios)
gamification/ → progress/ (requiere progreso)
```

---

## 📚 Referencias

- [ESTRUCTURA-SHARED.md](./ESTRUCTURA-SHARED.md) - Componentes compartidos
- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Zustand stores

---

**Última actualización:** 2025-11-07
