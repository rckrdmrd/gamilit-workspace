# QUICK REFERENCE - Admin Components

**Fecha:** 2025-11-26
**Archivo fuente:** `orchestration/inventarios/FRONTEND_INVENTORY.yml`

---

## PÁGINAS ADMIN (16)

```
/admin                     → AdminDashboard.tsx
/admin/dashboard           → AdminDashboardPage.tsx
/admin/institutions        → AdminInstitutionsPage.tsx
/admin/users               → AdminUsersPage.tsx
/admin/roles               → AdminRolesPage.tsx
/admin/content             → AdminContentPage.tsx
/admin/approvals           → AdminApprovalsPage.tsx
/admin/gamification        → AdminGamificationPage.tsx
/admin/monitoring          → AdminMonitoringPage.tsx
/admin/alerts              → AdminAlertsPage.tsx ⭐ NUEVO
/admin/analytics           → AdminAnalyticsPage.tsx ⭐ NUEVO
/admin/progress            → AdminProgressPage.tsx ⭐ NUEVO
/admin/reports             → AdminReportsPage.tsx
/admin/classroom-teachers  → AdminClassroomTeacherPage.tsx ⭐ NUEVO
/admin/advanced            → AdminAdvancedPage.tsx
/admin/settings            → AdminSettingsPage.tsx
```

---

## COMPONENTES ADMIN (59)

### 📢 Alerts (7)
```
components/alerts/
├── AcknowledgeAlertModal.tsx
├── AlertCard.tsx
├── AlertDetailsModal.tsx
├── AlertFilters.tsx
├── AlertsList.tsx
├── AlertsStats.tsx
└── ResolveAlertModal.tsx
```

### 📊 Analytics (4)
```
components/analytics/
├── EngagementTab.tsx
├── GamificationTab.tsx
├── OverviewTab.tsx
└── RetentionTab.tsx
```

### 🎮 Gamification (6)
```
components/gamification/
├── AchievementsTab.tsx
├── BulkUpdateDialog.tsx
├── MayaRankEditModal.tsx
├── ParameterEditModal.tsx
├── PreviewImpactDialog.tsx
└── RestoreDefaultsDialog.tsx
```

### 🖥️ Monitoring (7)
```
components/monitoring/
├── AlertasTab.tsx
├── ErrorTrackingPanel.tsx
├── ErrorTrackingTab.tsx
├── LogsViewer.tsx
├── MetricsChart.tsx
├── MetricsTab.tsx
├── SystemHealthIndicators.tsx
├── SystemPerformanceDashboard.tsx
└── UserActivityMonitor.tsx
```

### 📈 Progress (5)
```
components/progress/
├── ClassroomSelector.tsx
├── ClassroomsView.tsx
├── OverviewView.tsx
├── StudentDetailView.tsx
└── StudentSearch.tsx
```

### 📄 Reports (3)
```
components/reports/
├── BetaBanner.tsx
├── ReportGenerationForm.tsx
└── ReportsList.tsx
```

### ⚙️ Settings (2)
```
components/settings/
├── GeneralSettings.tsx
└── SecuritySettings.tsx
```

### 🔧 Advanced (4)
```
components/advanced/
├── ABTestingDashboard.tsx
├── EconomicInterventionPanel.tsx
├── FeatureFlagControls.tsx
└── TenantManagementPanel.tsx
```

### 🏫 Classroom Teacher (2)
```
components/classroom-teacher/
├── ClassroomTeachersTab.tsx
└── TeacherClassroomsTab.tsx
```

### 📚 Content (4)
```
components/content/
├── ContentApprovalQueue.tsx
├── ContentVersionControl.tsx
├── ExerciseContentEditor.tsx
└── MediaLibraryManager.tsx
```

### 📊 Dashboard (10)
```
components/dashboard/
├── AdminDashboardHero.tsx
├── OrganizationsTable.tsx
├── QuickActionsGrid.tsx
├── RecentActionsTable.tsx
├── SystemAlertsPanel.tsx
├── SystemLogsViewer.tsx
├── SystemMetricsGrid.tsx
├── UserActivityChart.tsx
└── UserManagementTable.tsx
```

### 👥 Users (3)
```
components/users/
├── BulkActionsPanel.tsx
├── UserDetailModal.tsx
└── UserDetailModal.example.tsx
```

---

## MÉTRICAS RÁPIDAS

| Métrica | Valor |
|---------|-------|
| Total Páginas Admin | 16 |
| Total Componentes Admin | 59 |
| Páginas Nuevas | 5 |
| Componentes Documentados | 59 |
| Categorías de Componentes | 12 |

---

## USO RÁPIDO

### Encontrar componente de alertas:
```bash
# Ver todos los componentes de alertas
ls apps/frontend/src/apps/admin/components/alerts/
```

### Encontrar página específica:
```bash
# Ver todas las páginas admin
ls apps/frontend/src/apps/admin/pages/
```

### Buscar por funcionalidad:
```bash
# Buscar componentes de analytics
find apps/frontend/src/apps/admin/components/analytics -name "*.tsx"
```

---

**Última actualización:** 2025-11-26
**Fuente:** FRONTEND_INVENTORY.yml v2.3.8
