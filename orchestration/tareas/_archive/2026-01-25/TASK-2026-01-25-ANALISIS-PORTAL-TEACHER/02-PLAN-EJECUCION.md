# 02-PLAN-EJECUCION.md - Portal Teacher GAMILIT

**Tarea:** TASK-2026-01-25-ANALISIS-PORTAL-TEACHER
**Fecha:** 2026-01-25
**Sistema:** SIMCO v4.3.0 + CAPVED

---

## 1. Diagrama de Dependencias

```
                    ┌─────────────────────────┐
                    │      FASE-1            │
                    │  Auditoría Coherencia   │
                    │      (Bloquea todas)    │
                    └───────────┬─────────────┘
                                │
        ┌───────────┬───────────┼───────────┬───────────┐
        ↓           ↓           ↓           ↓           ↓
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  FASE-2   │ │  FASE-3   │ │  FASE-5   │ │  FASE-6   │ │  FASE-7   │
│  Páginas  │ │   APIs    │ │   Purga   │ │Componentes│ │   Hooks   │
│ (18 docs) │ │(Contratos)│ │  (Docs)   │ │  (51 def) │ │  (23 def) │
└─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
      │             │             │             │             │
      │             │             └──────┬──────┘             │
      │             │                    │                    │
      └─────────────┴────────────────────┼────────────────────┘
                                         ↓
                              ┌─────────────────────┐
                              │      FASE-8         │
                              │    Inventarios      │
                              │ (Sincronización)    │
                              └──────────┬──────────┘
                                         │
      ┌──────────────────────────────────┤
      ↓                                  │
┌───────────────────┐                    │
│     FASE-4        │                    │
│  US Faltantes     │                    │
│(US-PM-006, 007)   │                    │
└────────┬──────────┘                    │
         │                               │
         └───────────────┬───────────────┘
                         ↓
              ┌─────────────────────┐
              │      FASE-9         │
              │   Plan Final        │
              │ (Consolidación)     │
              └─────────────────────┘
```

---

## 2. Fases Paralelizables

### Grupo A: Post-Auditoría (Ejecutar en Paralelo)
```
FASE-2, FASE-3, FASE-5, FASE-6, FASE-7
```

Estas fases pueden ejecutarse simultáneamente por diferentes agentes después de completar FASE-1.

### Grupo B: Secuencial
```
FASE-1 → Grupo A → FASE-8 → FASE-4 + FASE-9
```

---

## 3. Detalle de Subtareas Atómicas

### FASE-1: Auditoría de Coherencia (1 día)

| Subtarea | Descripción | Agente | Output |
|----------|-------------|--------|--------|
| 1.1 | Listar todas las páginas del código | Explore | Lista de archivos |
| 1.2 | Listar toda la documentación existente | Explore | Lista de docs |
| 1.3 | Crear matriz de coherencia | Claude | MATRIZ-COHERENCIA.md |
| 1.4 | Identificar gaps de documentación | Claude | GAPS-DOC.md |
| 1.5 | Identificar gaps de implementación | Claude | GAPS-IMPL.md |

### FASE-2: Documentación de Páginas (2 días)

| Subtarea | Página | Template |
|----------|--------|----------|
| 2.1 | TeacherDashboardPage | PAGE-DASHBOARD.md |
| 2.2 | TeacherClassesPage | PAGE-CLASSES.md |
| 2.3 | TeacherStudentsPage | PAGE-STUDENTS.md |
| 2.4 | TeacherAssignmentsPage | PAGE-ASSIGNMENTS.md |
| 2.5 | TeacherExerciseResponsesPage | PAGE-RESPONSES.md |
| 2.6 | TeacherReviewPanelPage | PAGE-REVIEW-PANEL.md |
| 2.7 | TeacherProgressPage | PAGE-PROGRESS.md |
| 2.8 | TeacherAlertsPage | PAGE-ALERTS.md |
| 2.9 | TeacherReportsPage | PAGE-REPORTS.md |
| 2.10 | TeacherAnalyticsPage | PAGE-ANALYTICS.md |
| 2.11 | TeacherMonitoringPage | PAGE-MONITORING.md |
| 2.12 | TeacherGamificationPage | PAGE-GAMIFICATION.md |
| 2.13 | TeacherContentPage | PAGE-CONTENT.md |
| 2.14 | TeacherCommunicationPage | PAGE-COMMUNICATION.md |
| 2.15 | TeacherSettingsPage | PAGE-SETTINGS.md |
| 2.16 | TeacherNotificationsPage | PAGE-NOTIFICATIONS.md |
| 2.17 | TeacherNotificationPreferencesPage | PAGE-NOTIFICATION-PREFS.md |
| 2.18 | TeacherContentManagement | PAGE-CONTENT-MANAGEMENT.md |

**Template por página:**
```markdown
# PAGE-{NAME}.md

## Información General
- Ruta: /teacher/{path}
- Componente: Teacher{Name}Page.tsx
- Roles: teacher, admin_teacher

## Hooks Utilizados
- useHook1() - Descripción
- useHook2() - Descripción

## Componentes Principales
- ComponentA - Descripción
- ComponentB - Descripción

## Endpoints API
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /teacher/xxx | ... |

## Funcionalidades
1. Funcionalidad A
2. Funcionalidad B

## Estados
- Loading: Skeleton/Spinner
- Error: Mensaje de error
- Empty: Estado vacío
- Success: Datos renderizados

## Capturas (opcional)
- [ ] Desktop
- [ ] Mobile
```

### FASE-3: Documentación de APIs (1 día)

| Subtarea | Descripción | Output |
|----------|-------------|--------|
| 3.1 | Documentar TeacherController endpoints | API-TEACHER-MAIN.md |
| 3.2 | Documentar ClassroomsController endpoints | API-CLASSROOMS.md |
| 3.3 | Documentar AlertsController endpoints | API-ALERTS.md |
| 3.4 | Documentar ReviewController endpoints | API-REVIEWS.md |
| 3.5 | Crear manualReviewApi.ts (gap) | Código nuevo |
| 3.6 | Consolidar en API-CONTRACTS.md | API-CONTRACTS.md |

### FASE-4: User Stories Faltantes (2 días)

#### 4.1 US-PM-006: Bloquear/Desbloquear Alumnos

| Subtarea | Capa | Descripción | LOC Est. |
|----------|------|-------------|----------|
| 4.1.1 | DDL | Agregar columnas a profiles | ~10 |
| 4.1.2 | DDL | Crear índices y triggers | ~20 |
| 4.1.3 | Backend | Crear UpdateStudentStatusDto | ~15 |
| 4.1.4 | Backend | Crear método en TeacherService | ~40 |
| 4.1.5 | Backend | Crear endpoint en TeacherController | ~20 |
| 4.1.6 | Frontend | Crear useStudentStatus hook | ~50 |
| 4.1.7 | Frontend | Crear SuspendStudentModal | ~80 |
| 4.1.8 | Frontend | Integrar en TeacherStudentsPage | ~30 |
| 4.1.9 | Test | Tests unitarios backend | ~50 |
| 4.1.10 | Test | Tests unitarios frontend | ~40 |

#### 4.2 US-PM-007: Configuración de Alertas

| Subtarea | Capa | Descripción | LOC Est. |
|----------|------|-------------|----------|
| 4.2.1 | DDL | Crear tabla teacher_alert_configurations | ~30 |
| 4.2.2 | DDL | Crear RLS policies | ~20 |
| 4.2.3 | Backend | Crear AlertConfigService | ~80 |
| 4.2.4 | Backend | Crear AlertConfigController | ~50 |
| 4.2.5 | Backend | Crear DTOs | ~30 |
| 4.2.6 | Frontend | Crear useAlertConfig hook | ~50 |
| 4.2.7 | Frontend | Crear AlertConfigCard | ~60 |
| 4.2.8 | Frontend | Crear ThresholdSlider | ~40 |
| 4.2.9 | Frontend | Crear TeacherAlertConfigPage | ~100 |
| 4.2.10 | Frontend | Agregar ruta en App.tsx | ~5 |
| 4.2.11 | Test | Tests unitarios backend | ~60 |
| 4.2.12 | Test | Tests unitarios frontend | ~50 |

### FASE-5: Purga de Documentación (0.5 días)

| Subtarea | Archivo | Acción |
|----------|---------|--------|
| 5.1 | _MAP.md | Actualizar conteos |
| 5.2 | ARQUITECTURA-TEACHER-PORTAL.md | Actualizar a v2.0 |
| 5.3 | US-PM-009 | Actualizar estado a "Partial" |
| 5.4 | Tareas obsoletas | Archivar si aplica |

### FASE-6: Definiciones de Componentes (2 días)

**Por carpeta:**

| Carpeta | Componentes | Prioridad |
|---------|-------------|-----------|
| dashboard/ | 10 | Alta |
| assignments/ | 6 | Alta |
| monitoring/ | 5 | Alta |
| progress/ | 4 | Media |
| analytics/ | 3 | Media |
| communication/ | 6 | Media |
| reports/ | 2 | Baja |
| collaboration/ | 2 | Baja |
| alerts/ | 2 | Baja |

**Output:** COMPONENTS-CATALOG.md

### FASE-7: Documentación de Hooks (1 día)

| Hook | Categoría | Prioridad |
|------|-----------|-----------|
| useTeacherDashboard | Dashboard | Alta |
| useClassrooms | Dashboard | Alta |
| useAssignments | Assignments | Alta |
| useStudentProgress | Monitoring | Alta |
| useInterventionAlerts | Alerts | Alta |
| useManualReviews | Review | Alta |
| Resto (17) | Varios | Media |

**Output:** HOOKS-REFERENCE.md

### FASE-8: Actualización de Inventarios (0.5 días)

| Inventario | Cambios |
|------------|---------|
| FRONTEND_INVENTORY.yml | Actualizar teacher portal section |
| BACKEND_INVENTORY.yml | Validar conteos endpoints |
| MASTER_INVENTORY.yml | Sincronizar totales |

### FASE-9: Plan Final (0.5 días)

| Entregable | Descripción |
|------------|-------------|
| PLAN-IMPLEMENTACION-US.md | Plan detallado para US-PM-006/007 |
| INFORME-FINAL.md | Resumen de análisis y recomendaciones |
| _INDEX.yml actualizado | Registro de tarea en índice |

---

## 4. Estimación de Tiempo

| Fase | Días | Agentes Requeridos |
|------|------|-------------------|
| FASE-1 | 1 | 1 (Claude Code) |
| FASE-2 | 2 | 2-3 (paralelo) |
| FASE-3 | 1 | 1 |
| FASE-4 | 2 | 1 (planificación) |
| FASE-5 | 0.5 | 1 |
| FASE-6 | 2 | 2-3 (paralelo) |
| FASE-7 | 1 | 1 |
| FASE-8 | 0.5 | 1 |
| FASE-9 | 0.5 | 1 |
| **TOTAL** | **~5-6 días** | - |

**Con paralelización óptima:** ~3-4 días

---

## 5. Asignación de Agentes

### Sesión 1: FASE-1 (Auditoría)
```
Claude Code → Auditoría completa
```

### Sesión 2: Grupo A (Paralelo)
```
Agente 1 (Windsurf) → FASE-2 (páginas 1-9)
Agente 2 (Trae)     → FASE-2 (páginas 10-18)
Agente 3 (Claude)   → FASE-3 (APIs)
```

### Sesión 3: Grupo A Continuación
```
Agente 1 → FASE-6 (componentes)
Agente 2 → FASE-7 (hooks)
Agente 3 → FASE-5 (purga)
```

### Sesión 4: Consolidación
```
Claude Code → FASE-8 + FASE-9
```

### Sesión 5: Implementación (si aplica)
```
Claude Code → FASE-4 (planificación US)
Windsurf   → Implementación siguiendo plan
```

---

## 6. Checkpoints de Validación

| Checkpoint | Criterio | Fase |
|------------|----------|------|
| CP-1 | Matriz de coherencia completa | Post FASE-1 |
| CP-2 | 18 páginas documentadas | Post FASE-2 |
| CP-3 | API-CONTRACTS.md completo | Post FASE-3 |
| CP-4 | Plan US detallado | Post FASE-4 |
| CP-5 | Documentación purgada | Post FASE-5 |
| CP-6 | COMPONENTS-CATALOG.md completo | Post FASE-6 |
| CP-7 | HOOKS-REFERENCE.md completo | Post FASE-7 |
| CP-8 | Inventarios actualizados | Post FASE-8 |
| CP-9 | Informe final generado | Post FASE-9 |

---

## 7. Próximos Pasos Inmediatos

1. **Completar FASE-1** (Auditoría de Coherencia)
   - Crear MATRIZ-COHERENCIA.md
   - Crear GAPS-DOC.md
   - Crear GAPS-IMPL.md

2. **Preparar templates**
   - Template de página
   - Template de hook
   - Template de componente

3. **Iniciar documentación paralela**
   - Lanzar agentes para FASE-2, FASE-3

---

**Generado:** 2026-01-25
**Sistema:** SIMCO v4.3.0 + CAPVED
**Agente:** Claude Code (Arquitecto/Orquestador)
