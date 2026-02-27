---
titulo: Catálogo de Componentes Admin
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# Catalogo de Componentes Admin - GAMILIT

**Proyecto:** GAMILIT (EdTech - Gamification Platform)
**Ubicacion:** `apps/frontend/src/apps/admin/components/`
**Fecha:** 2026-01-25
**Total Componentes:** 92
**Task:** TASK-2026-01-25-001

---

## Indice

1. [Dashboard](#1-dashboard-9-componentes)
2. [Users](#2-users-4-componentes)
3. [Gamification](#3-gamification-6-componentes)
4. [Content](#4-content-4-componentes)
5. [Monitoring](#5-monitoring-9-componentes)
6. [Alerts](#6-alerts-7-componentes)
7. [Assignments](#7-assignments-4-componentes)
8. [Reports](#8-reports-3-componentes)
9. [Roles](#9-roles-3-componentes)
10. [Settings](#10-settings-2-componentes)
11. [Advanced](#11-advanced-8-componentes)
12. [Institutions](#12-institutions-4-componentes)
13. [Classroom-Teacher](#13-classroom-teacher-2-componentes)
14. [Progress](#14-progress-5-componentes)
15. [Analytics](#15-analytics-4-componentes)
16. [Interventions](#16-interventions-4-componentes)
17. [Layouts](#17-layouts-2-componentes)
18. [Common](#18-common-2-componentes)

---

## 1. Dashboard (9 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| AdminDashboardHero | `AdminDashboardHero.tsx` | Banner de health del sistema con metricas en tiempo real |
| SystemMetricsGrid | `SystemMetricsGrid.tsx` | Grid de 6 tarjetas de metricas con sparklines |
| QuickActionsGrid | `QuickActionsGrid.tsx` | Grid de acciones rapidas con navegacion |
| UserManagementTable | `UserManagementTable.tsx` | Tabla de gestion de usuarios con CRUD |
| RecentActionsTable | `RecentActionsTable.tsx` | Tabla de acciones recientes con paginacion |
| OrganizationsTable | `OrganizationsTable.tsx` | Tabla de organizaciones |
| SystemAlertsPanel | `SystemAlertsPanel.tsx` | Panel de alertas del sistema |
| SystemLogsViewer | `SystemLogsViewer.tsx` | Visor de logs del sistema |
| UserActivityChart | `UserActivityChart.tsx` | Grafico de actividad de usuarios |

### Props Clave

**AdminDashboardHero:**
```typescript
interface AdminDashboardHeroProps {
  health: SystemHealth | null;
  loading?: boolean;
  onRefresh?: () => void;
}
```

**SystemMetricsGrid:**
```typescript
interface SystemMetricsGridProps {
  metrics: SystemMetrics | null;
  loading?: boolean;
}
```

---

## 2. Users (4 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| CreateUserModal | `CreateUserModal.tsx` | Modal para crear usuarios con org |
| UserDetailModal | `UserDetailModal.tsx` | Modal detalle con 3 tabs |
| BulkActionsPanel | `BulkActionsPanel.tsx` | Panel de acciones bulk |
| UserDetailModal.example | `UserDetailModal.example.tsx` | Ejemplo de uso |

### Props Clave

**CreateUserModal:**
```typescript
interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData) => Promise<CreatedUserResult>;
  organizations: Organization[];
  isLoadingOrganizations?: boolean;
}
```

**UserDetailModal:**
```typescript
interface UserDetailModalProps {
  user: SystemUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (userId: string, userData: Partial<UserFormData>) => Promise<void>;
}
```

---

## 3. Gamification (6 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| AchievementsTab | `AchievementsTab.tsx` | Tab de gestion de logros |
| ParameterEditModal | `ParameterEditModal.tsx` | Modal edicion parametros |
| MayaRankEditModal | `MayaRankEditModal.tsx` | Modal edicion rangos Maya |
| BulkUpdateDialog | `BulkUpdateDialog.tsx` | Dialog actualizacion bulk |
| PreviewImpactDialog | `PreviewImpactDialog.tsx` | Dialog preview de impacto |
| RestoreDefaultsDialog | `RestoreDefaultsDialog.tsx` | Dialog restaurar defaults |

### Props Clave

**AchievementsTab:**
```typescript
interface AdminAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategoryEnum;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  rewards: { xp: number; ml_coins: number; };
}
```

---

## 4. Content (4 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| ExerciseContentEditor | `ExerciseContentEditor.tsx` | Editor de ejercicios CRUD |
| ContentApprovalQueue | `ContentApprovalQueue.tsx` | Cola de aprobacion |
| ContentVersionControl | `ContentVersionControl.tsx` | Control de versiones |
| MediaLibraryManager | `MediaLibraryManager.tsx` | Gestor de media |

### Props Clave

**ExerciseContentEditor:**
```typescript
interface Exercise {
  id?: string;
  title: string;
  description: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
  points: number;
  type: string;
  status: 'draft' | 'published' | 'archived';
}
```

---

## 5. Monitoring (9 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| SystemHealthIndicators | `SystemHealthIndicators.tsx` | Indicadores de salud |
| MetricsChart | `MetricsChart.tsx` | Grafico de metricas |
| SystemPerformanceDashboard | `SystemPerformanceDashboard.tsx` | Dashboard rendimiento |
| UserActivityMonitor | `UserActivityMonitor.tsx` | Monitor de actividad |
| ErrorTrackingPanel | `ErrorTrackingPanel.tsx` | Panel de errores |
| ErrorTrackingTab | `ErrorTrackingTab.tsx` | Tab de errores |
| MetricsTab | `MetricsTab.tsx` | Tab de metricas |
| AlertasTab | `AlertasTab.tsx` | Tab de alertas |
| LogsViewer | `LogsViewer.tsx` | Visor de logs |

### Props Clave

**MetricsChart:**
```typescript
interface MetricsChartProps {
  data: MetricsHistory[];
  label: string;
  color?: string;
  threshold?: number;
  unit?: string;
}
```

---

## 6. Alerts (7 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| AlertsList | `AlertsList.tsx` | Lista de alertas con paginacion |
| AlertCard | `AlertCard.tsx` | Tarjeta individual de alerta |
| AlertFilters | `AlertFilters.tsx` | Filtros de alertas |
| AlertsStats | `AlertsStats.tsx` | Estadisticas de alertas |
| AlertDetailsModal | `AlertDetailsModal.tsx` | Modal detalle de alerta |
| AcknowledgeAlertModal | `AcknowledgeAlertModal.tsx` | Modal reconocer alerta |
| ResolveAlertModal | `ResolveAlertModal.tsx` | Modal resolver alerta |

---

## 7. Assignments (4 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| AssignmentsTable | `AssignmentsTable.tsx` | Tabla de asignaciones |
| AssignmentFilters | `AssignmentFilters.tsx` | Filtros de asignaciones |
| AssignmentDetailModal | `AssignmentDetailModal.tsx` | Modal detalle |
| index | `index.ts` | Barrel export |

---

## 8. Reports (3 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| ReportsList | `ReportsList.tsx` | Lista de reportes |
| ReportGenerationForm | `ReportGenerationForm.tsx` | Formulario generacion |
| BetaBanner | `BetaBanner.tsx` | Banner beta |

---

## 9. Roles (3 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| RolesTable | `RolesTable.tsx` | Tabla de roles |
| RoleEditor | `RoleEditor.tsx` | Editor de roles |
| PermissionMatrix | `PermissionMatrix.tsx` | Matriz de permisos |

---

## 10. Settings (2 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| GeneralSettings | `GeneralSettings.tsx` | Config general |
| SecuritySettings | `SecuritySettings.tsx` | Config seguridad |

---

## 11. Advanced (8 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| FeatureFlagControls | `FeatureFlagControls.tsx` | Controles feature flags |
| FeatureFlagEditor | `FeatureFlagEditor.tsx` | Editor feature flags |
| FeatureFlagsPanel | `FeatureFlagsPanel.tsx` | Panel feature flags |
| TenantManagementPanel | `TenantManagementPanel.tsx` | Gestion multi-tenant |
| ABTestingDashboard | `ABTestingDashboard.tsx` | Dashboard A/B testing |
| EconomicInterventionPanel | `EconomicInterventionPanel.tsx` | Panel intervenciones |
| TargetingConfig | `TargetingConfig.tsx` | Config de targeting |
| RolloutSlider | `RolloutSlider.tsx` | Slider de rollout |

---

## 12. Institutions (4 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| InstitutionsTable | `InstitutionsTable.tsx` | Tabla instituciones |
| InstitutionDetailModal | `InstitutionDetailModal.tsx` | Modal detalle |
| InstitutionFilters | `InstitutionFilters.tsx` | Filtros |
| InstitutionStats | `InstitutionStats.tsx` | Stats instituciones |

---

## 13. Classroom-Teacher (2 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| ClassroomTeachersTab | `ClassroomTeachersTab.tsx` | Tab aulas-profesores |
| TeacherClassroomsTab | `TeacherClassroomsTab.tsx` | Tab profesores-aulas |

---

## 14. Progress (5 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| ClassroomSelector | `ClassroomSelector.tsx` | Selector de aula |
| ClassroomsView | `ClassroomsView.tsx` | Vista por aulas |
| OverviewView | `OverviewView.tsx` | Vista general |
| StudentDetailView | `StudentDetailView.tsx` | Detalle estudiante |
| StudentSearch | `StudentSearch.tsx` | Buscador estudiantes |

---

## 15. Analytics (4 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| OverviewTab | `OverviewTab.tsx` | Tab overview |
| EngagementTab | `EngagementTab.tsx` | Tab engagement |
| GamificationTab | `GamificationTab.tsx` | Tab gamificacion |
| RetentionTab | `RetentionTab.tsx` | Tab retencion |

---

## 16. Interventions (4 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| InterventionsList | `InterventionsList.tsx` | Lista intervenciones |
| InterventionCard | `InterventionCard.tsx` | Tarjeta intervencion |
| InterventionFilters | `InterventionFilters.tsx` | Filtros |
| InterventionDetailModal | `InterventionDetailModal.tsx` | Modal detalle |

---

## 17. Layouts (2 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| AdminLayout | `AdminLayout.tsx` | Layout principal admin |
| AdminSidebar | `AdminSidebar.tsx` | Sidebar de navegacion |

---

## 18. Common (2 componentes)

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| FeatureBadge | `FeatureBadge.tsx` | Badge de feature |
| UnderConstruction | `UnderConstruction.tsx` | Placeholder construccion |

---

## Patrones y Convenciones

### Estilo
- **Tema:** Detective dark theme con acentos naranja
- **Clases:** Tailwind CSS con utilidades `detective-*`
- **Colores:** `detective-orange`, `detective-bg`, `detective-bg-secondary`

### Estructura
- **Base:** `DetectiveCard`, `DetectiveButton` de shared/
- **Iconos:** `lucide-react`
- **Animaciones:** `framer-motion`
- **Forms:** `react-hook-form`
- **State:** React Query + Zustand
- **Notificaciones:** `react-hot-toast`

### Dependencias Comunes
```typescript
// UI Base
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';

// Animaciones
import { motion, AnimatePresence } from 'framer-motion';

// Iconos
import { Icon1, Icon2 } from 'lucide-react';

// Forms
import { useForm } from 'react-hook-form';

// Server State
import { useQuery, useMutation } from '@tanstack/react-query';
```

---

## Hooks Asociados

| Hook | Ubicacion | Descripcion |
|------|-----------|-------------|
| useUserManagement | `hooks/useUserManagement.ts` | CRUD usuarios |
| useSystemMetrics | `hooks/useSystemMetrics.ts` | Metricas sistema |
| useHealthStatus | `hooks/useHealthStatus.ts` | Health checks |
| useSystemConfig | `hooks/useSystemConfig.ts` | Configuracion |
| useExercises | `hooks/useExercises.ts` | CRUD ejercicios |
| useAdminAssignments | `hooks/useAdminAssignments.ts` | Asignaciones |
| useAuditLogs | `hooks/useAuditLogs.ts` | Audit logs |
| useAnalytics | `hooks/useAnalytics.ts` | Analytics |
| useProgress | `hooks/useProgress.ts` | Progreso |
| useFeatureFlags | `hooks/useFeatureFlags.ts` | Feature flags |

---

*Catalogo generado: 2026-01-25*
*Task: TASK-2026-01-25-001*
*Agente: ARQUITECTO-ORQUESTADOR*
