# PLAN DE ANALISIS - PORTAL TEACHER GAMILIT

**Fecha**: 23 Diciembre 2025
**Version**: 1.0
**FASE**: 1 - Planeacion del Analisis
**Rol**: Requirements-Analyst
**Referencia**: Analisis previo 2025-12-18

---

## OBJETIVO

Realizar un analisis exhaustivo del Portal Teacher de Gamilit para:
1. Verificar que todas las paginas del sidebar esten correctamente desarrolladas
2. Identificar desarrollos incompletos o consumos a API rotos/hardcodeados
3. Crear plan de correcciones detallado
4. Validar dependencias de los cambios propuestos

---

## INVENTARIO SIDEBAR VS RUTAS

### Paginas en Sidebar (GamilitSidebar.tsx)

| # | Item Sidebar | Ruta | Icono |
|---|--------------|------|-------|
| 1 | Dashboard | /teacher/dashboard | Home |
| 2 | Mis Aulas | /teacher/classes | School |
| 3 | Monitoreo | /teacher/monitoring | User |
| 4 | Asignaciones | /teacher/assignments | Calendar |
| 5 | Respuestas | /teacher/responses | ClipboardList |
| 6 | Revisiones M3-M5 | /teacher/reviews | CheckCircle |
| 7 | Progreso | /teacher/progress | TrendingUp |
| 8 | Alertas | /teacher/alerts | AlertTriangle |
| 9 | Reportes | /teacher/reports | FileText |
| 10 | Gamificacion | /teacher/gamification | Trophy |

### Rutas Definidas en App.tsx (No en Sidebar)

| # | Ruta | Componente | Estado |
|---|------|------------|--------|
| 1 | /teacher/analytics | TeacherAnalyticsPage | Oculto |
| 2 | /teacher/communication | TeacherCommunicationPage | Oculto |
| 3 | /teacher/content | TeacherContentPage | Oculto |
| 4 | /teacher/students | TeacherStudentsPage | Oculto |
| 5 | /teacher/settings | TeacherSettingsPage | Oculto |
| 6 | /teacher/resources | Redirect to dashboard | Deshabilitado |

---

## ESTRUCTURA DEL ANALISIS (FASE 2)

### 2.1 Analisis por Pagina

Para CADA pagina del sidebar:

```yaml
TEMPLATE_ANALISIS_PAGINA:
  ruta: "/teacher/{page}"
  componente_principal: "Teacher{Page}Page.tsx"

  verificaciones:
    - existe_archivo: boolean
    - compila_sin_errores: boolean
    - tiene_layout_teacher: boolean

  consumos_api:
    - hook_usado: "useXxx"
    - endpoint: "GET/POST /api/v1/..."
    - tipo_respuesta: "OK | Mock | Hardcodeado | Error"

  componentes_hijos:
    - lista de componentes importados
    - estado de cada componente

  datos_hardcodeados:
    - variables con datos mock
    - fechas estaticas
    - usuarios de prueba

  gaps_identificados:
    - descripcion del gap
    - severidad: P0 | P1 | P2
    - archivos_afectados
```

### 2.2 Archivos a Analizar por Pagina

| Pagina | Frontend | Hooks | Backend |
|--------|----------|-------|---------|
| Dashboard | TeacherDashboardPage.tsx | useTeacherDashboard.ts | teacher-dashboard.service.ts |
| Mis Aulas | TeacherClassesPage.tsx | useClassrooms.ts | teacher-classrooms-crud.service.ts |
| Monitoreo | TeacherMonitoringPage.tsx | useStudentMonitoring.ts | student-progress.service.ts |
| Asignaciones | TeacherAssignmentsPage.tsx | useAssignments.ts | (pendiente verificar) |
| Respuestas | TeacherExerciseResponsesPage.tsx | useExerciseResponses.ts | exercise-responses.service.ts |
| Revisiones | ReviewPanelPage.tsx | useGrading.ts | manual-review.service.ts |
| Progreso | TeacherProgressPage.tsx | useStudentProgress.ts | student-progress.service.ts |
| Alertas | TeacherAlertsPage.tsx | useInterventionAlerts.ts | intervention-alerts.service.ts |
| Reportes | TeacherReportsPage.tsx | useAnalytics.ts | reports.service.ts |
| Gamificacion | TeacherGamificationPage.tsx | useEconomyAnalytics.ts, etc. | (pendiente verificar) |

---

## SUBAGENTES REQUERIDOS

### FASE 2: Ejecucion del Analisis

| Subagente | Tipo | Responsabilidad |
|-----------|------|-----------------|
| SA-FRONTEND-001 | Explore | Analizar paginas 1-5 del sidebar |
| SA-FRONTEND-002 | Explore | Analizar paginas 6-10 del sidebar |
| SA-BACKEND-001 | Explore | Verificar endpoints y servicios |
| SA-DATABASE-001 | Explore | Verificar tablas, vistas, RLS |

### FASE 3: Planeacion de Implementaciones

| Subagente | Tipo | Responsabilidad |
|-----------|------|-----------------|
| SA-PLAN-001 | Plan | Crear plan detallado de correcciones |

### FASE 4: Validacion

| Subagente | Tipo | Responsabilidad |
|-----------|------|-----------------|
| SA-VALID-001 | Explore | Verificar dependencias del plan |

### FASE 5: Ejecucion

| Subagente | Tipo | Responsabilidad |
|-----------|------|-----------------|
| SA-IMPL-XXX | general-purpose | Ejecutar correcciones segun plan |

---

## CONTEXTO DEL ANALISIS PREVIO (2025-12-18)

### Estado Reportado

| Area | Completitud | Items Criticos |
|------|-------------|----------------|
| Frontend | 85% | 3 placeholders, sin WebSocket |
| Backend | 95% | 10 TODOs, NotificationService |
| Mecanicas | 70% | Emparejamiento, manuales sin UI |
| Integraciones | 60% | Mock data, 5 hooks faltantes |
| Database | 90% | RLS teacher_notes, indices |

### Gaps P0 Previos

1. G01: Mock data en TeacherGamification.tsx - **Verificar si resuelto**
2. G02: Emparejamiento no envia a backend - **Verificar**
3. G03: Mecanicas manuales sin visualizacion - **Verificar**
4. G04: NotificationService no integrado - **Verificar**

### Cambios Desde Ultimo Analisis

Verificar commits desde 2025-12-18:
- Nuevas rutas: /teacher/responses, /teacher/reviews
- Sidebar actualizado con nuevos items
- Posibles correcciones de gaps

---

## CRITERIOS DE VALIDACION

Una pagina se considera **COMPLETA** si:

1. [ ] Archivo existe y compila sin errores
2. [ ] Usa TeacherLayout como wrapper
3. [ ] Consume APIs reales (no mock data)
4. [ ] No tiene URLs hardcodeadas
5. [ ] Maneja estados: loading, error, empty
6. [ ] Componentes hijos funcionales
7. [ ] No tiene TODOs criticos

Una pagina se considera **INCOMPLETA** si:

1. [ ] Usa SHOW_UNDER_CONSTRUCTION = true
2. [ ] Tiene mock data hardcodeado
3. [ ] Consume endpoints inexistentes
4. [ ] Falta manejo de errores
5. [ ] Componentes placeholder

---

## ENTREGABLES POR FASE

### FASE 1 (Este documento)
- [x] Plan de analisis detallado
- [x] Inventario sidebar vs rutas
- [x] Criterios de validacion
- [x] Asignacion de subagentes

### FASE 2 (Siguiente)
- [ ] 10-ANALISIS-DASHBOARD.md
- [ ] 11-ANALISIS-AULAS.md
- [ ] 12-ANALISIS-MONITOREO.md
- [ ] 13-ANALISIS-ASIGNACIONES.md
- [ ] 14-ANALISIS-RESPUESTAS.md
- [ ] 15-ANALISIS-REVISIONES.md
- [ ] 16-ANALISIS-PROGRESO.md
- [ ] 17-ANALISIS-ALERTAS.md
- [ ] 18-ANALISIS-REPORTES.md
- [ ] 19-ANALISIS-GAMIFICACION.md
- [ ] 20-RESUMEN-ANALISIS.md

### FASE 3
- [ ] 30-PLAN-IMPLEMENTACIONES.md

### FASE 4
- [ ] 40-VALIDACION-PLAN.md

### FASE 5
- [ ] 50-REPORTE-EJECUCION.md

---

## SIGUIENTE PASO

Proceder con **FASE 2**: Ejecutar analisis detallado de cada pagina del sidebar usando subagentes especializados.

---

*Plan creado: 2025-12-23*
*Proyecto: GAMILIT - Portal Teacher*
