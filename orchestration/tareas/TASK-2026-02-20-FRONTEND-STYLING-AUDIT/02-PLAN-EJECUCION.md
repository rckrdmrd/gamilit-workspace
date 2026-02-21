# 02-PLAN-EJECUCION — Correccion Frontend: Estilos, Temas e Integracion

**Fecha:** 2026-02-20
**Fases:** 4 fases secuenciales, cada una con subagentes paralelos
**Estimacion:** ~50 archivos a modificar

---

## Fase 1: Criticos Globales (5 agentes paralelos)

**Objetivo:** Corregir los 5 problemas que afectan TODA la aplicacion.

### Agente 1A: Button.tsx — Migrar variantes a Detective Theme
- **Archivo:** `shared/components/Button.tsx`
- **Cambios:**
  - primary: `bg-blue-600` → `bg-detective-orange hover:bg-detective-orange-dark`
  - outline: `border-blue-600 text-blue-600` → `border-detective-orange text-detective-orange`
  - ghost: `text-blue-600 hover:bg-blue-50` → `text-detective-orange hover:bg-detective-orange/10`
  - disabled: Agregar `bg-gray-300 text-gray-500` ademas de opacity-50
  - secondary: Mejorar contraste

### Agente 1B: UserDetailModal — Migrar a tema detective oscuro
- **Archivo:** `admin/components/users/UserDetailModal.tsx`
- **Cambios:**
  - Modal bg: `bg-white` → `bg-detective-dark`
  - Header gradient: `from-orange-500 to-amber-500` → `from-detective-orange to-detective-gold`
  - Tabs: `border-orange-500 text-orange-600` → `border-detective-orange text-detective-orange`
  - Tabs inactive: `text-gray-700 border-gray-200` → `text-detective-text-secondary border-detective-border`
  - Form fields: `text-gray-900 border-gray-300` → `text-detective-text border-detective-border bg-detective-card`
  - Status badges: `bg-green-100 text-green-800` → detective semantic colors

### Agente 1C: RoleEditor — Migrar gradientes y colores
- **Archivo:** `admin/components/roles/RoleEditor.tsx`
- **Cambios:**
  - Header: `from-blue-500 to-blue-600` → `from-detective-orange to-detective-orange-dark`
  - Footer: `bg-gray-50 border-gray-200` → `bg-detective-bg-secondary border-detective-border`
  - Buttons: Usar DetectiveButton en vez de custom
  - Text colors: `text-gray-*` → `text-detective-text*`

### Agente 1D: Timeline — Hacer visible el anio del evento
- **Archivo:** `mechanics/module1/Timeline/TimelineEvent.tsx`
- **Cambios:**
  - L26: Remover `className="hidden"` del span del anio
  - Estilizar con `text-detective-text font-bold`

### Agente 1E: CausaEfecto — Hacer visible boton eliminar
- **Archivo:** `mechanics/module2/ConstruccionHipotesis/CausaEfectoExercise.tsx`
- **Cambios:**
  - L339: Cambiar `opacity-0 group-hover:opacity-100` a siempre visible
  - Usar `text-red-400 hover:text-red-600` (siempre visible)
  - Agregar `aria-label="Eliminar"`

---

## Fase 2: Visibilidad de Botones y PageShell (5 agentes paralelos)

### Agente 2A: Student Portal — Migrar 13 paginas a StudentPageShell
- **Archivos (13):** AssignmentDetailPage, AssignmentsPage, EnhancedProfilePage, FriendsPage, GuildsPage, InventoryPage, LeaderboardPage, LearningPage, MissionsPage, ModuleDetailPage, NotificationPreferencesPage, NotificationsPage, ShopPage
- **Patron:** Reemplazar GamifiedHeader directo con StudentPageShell
- **Eliminar:** useAuth + useUserGamification manual, usar useStudentPageSetup via PageShell

### Agente 2B: Admin — Corregir botones y colores criticos
- **Archivos:** AdminRolesPage.tsx, UsersTable.tsx, RolesTable.tsx
- **Cambios:**
  - AdminRolesPage header: `text-gray-900` → `text-detective-text`
  - UsersTable botones: `text-blue/red/green-400` → detective semantic colors
  - RolesTable selection: `bg-blue-50 border-blue-500` → detective theme

### Agente 2C: Teacher — Corregir colores hardcodeados
- **Archivos:** ClassroomCard.tsx, TeacherNotifications.tsx, ClassroomsGrid.tsx
- **Cambios:**
  - ClassroomCard: Todos los `bg-gray-*` → `bg-detective-*` equivalentes
  - TeacherNotifications header: Integrar con tema detective
  - ClassroomsGrid: Skeleton y empty state con colores del tema

### Agente 2D: Exercise Mechanics Fixes (Batch 1)
- **Archivos:** AnnotationMarker.tsx, VerdaderoFalsoExercise.tsx, CompletarEspaciosExercise.tsx, DraggableCard.tsx
- **Cambios:**
  - AnnotationMarker: `hidden group-hover:block` → siempre visible o toggle
  - VerdaderoFalso: opacity-75 post-submit → full opacity con estado visual
  - CompletarEspacios: Mejorar contraste de palabras no seleccionadas
  - DraggableCard: `opacity: 0.5` → `shadow-lg scale-105` al arrastrar

### Agente 2E: Exercise Mechanics Fixes (Batch 2)
- **Archivos:** CrucigramaGrid.tsx, SopaLetrasGrid.tsx, MatchingCard.tsx, CausaEfectoExercise.tsx (drag)
- **Cambios:**
  - Crucigrama: Agregar `bg-blue-50` ademas de ring al seleccionar
  - SopaLetras: Mejorar contraste letras encontradas
  - Matching: `opacity-50` matched → `bg-green-50 border-green-300` visible
  - CausaEfecto drag: `opacity-50 scale-95` → `shadow-lg scale-105`

---

## Fase 3: Contraste y Consistencia (5 agentes paralelos)

### Agente 3A: Student — Tabs y badges con contraste
- **Archivos:** NotificationsPage, AssignmentsPage, InventoryPage, ShopPage
- **Patron:** Todos los tabs inactivos `bg-gray-100 text-gray-700` → `bg-detective-bg text-detective-text-secondary`
- **Badges:** Mejorar contraste de status/rarity badges

### Agente 3B: Teacher — Forms, tables y charts
- **Archivos:** TeacherAnalytics.tsx, TeacherReports.tsx, CreateAssignmentModal.tsx
- **Cambios:**
  - ChartJS config: Usar colores del tema
  - Tables: Estandarizar en `text-detective-text-secondary`
  - Forms: Inputs con `border-detective-border bg-detective-card`

### Agente 3C: Admin — Modals y forms restantes
- **Archivos:** CreateUserModal.tsx, SystemHealthCard.tsx, GeneralSettings.tsx, FeatureFlagsPanel.tsx
- **Cambios:**
  - CreateUserModal inputs: `bg-gray-800` → `bg-detective-card`
  - SystemHealthCard: Status badges tema detective
  - GeneralSettings: Usar DetectiveButton
  - FeatureFlagsPanel: Filtros con colores detective

### Agente 3D: Fondos de pagina estandarizados
- **Archivos:** LeaderboardPage, NotificationsPage, EnhancedProfilePage, TeacherMonitoring
- **Cambios:** Gradientes hardcodeados → `bg-detective-bg` o variable CSS
- **Status badges** en TeacherMonitoring: colores tema claro → detective semantic

### Agente 3E: Iconos y elementos secundarios
- **Archivos transversales:** Todos los `text-gray-400` para iconos
- **Patron:** `text-gray-400` → `text-detective-text-secondary`
- **AlertsNotificationsCard, NotificationItem, DashboardStatsGrid**

---

## Fase 4: Estandarizacion Avanzada (3 agentes paralelos)

### Agente 4A: Adopcion de useApiError
- Migrar 10-15 paginas de error handling custom a useApiError
- Foco en paginas con try-catch inline

### Agente 4B: Loading states estandarizados
- Migrar paginas de condicionales inline a LoadingSpinner/SkeletonCard
- Foco en 10 paginas mas visitadas

### Agente 4C: Progreso de ejercicios
- Mejorar barra de progreso `bg-white/30` → mayor contraste
- Verificar feedback visual de XP/rewards post-ejercicio

---

## Verificacion End-to-End

Tras cada fase:
1. `cd apps/frontend && npm run build` — Verificar que compila
2. `cd apps/frontend && npm run typecheck` — Sin errores de tipos
3. Grep verificacion de colores residuales hardcodeados
4. Verificacion visual de paginas criticas

---

## Metricas de Exito

| Criterio | Objetivo |
|----------|----------|
| Button.tsx variantes | 100% detective-orange |
| StudentPageShell adoption | 17/21 paginas (4 exempt) |
| Modals en tema detective | 100% |
| Ejercicios sin elementos hidden | 0 elementos bloqueantes |
| Contraste WCAG AA | 100% botones interactivos |
| CSS variables en uso | >10 refs por portal |
