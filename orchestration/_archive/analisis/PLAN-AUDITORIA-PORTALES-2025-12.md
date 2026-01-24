# PLAN DE AUDITORIA - PORTALES ADMIN Y TEACHER

**Fecha:** 2025-12-15
**Version:** 1.0
**Estado:** EN EJECUCION

---

## 1. OBJETIVO DE LA AUDITORIA

Realizar un analisis exhaustivo de los portales Admin y Teacher para:

1. **Verificar consumos de API:** Que cada pagina tenga endpoints reales implementados
2. **Verificar datos de BD:** Que los datos mostrados provengan de la base de datos
3. **Verificar componentes funcionales:** Que todos los componentes internos funcionen
4. **Identificar dependencias faltantes:** Hooks, APIs, tipos sin implementar
5. **Verificar integracion con Student:** Que las acciones del estudiante actualicen datos en Admin/Teacher

---

## 2. INVENTARIO DE PAGINAS

### 2.1 Portal ADMIN (15 paginas)

| # | Pagina | Archivo | Prioridad Auditoria |
|---|--------|---------|---------------------|
| 1 | Dashboard | AdminDashboardPage.tsx | CRITICA |
| 2 | Users | AdminUsersPage.tsx | CRITICA |
| 3 | Institutions | AdminInstitutionsPage.tsx | ALTA |
| 4 | Roles | AdminRolesPage.tsx | ALTA |
| 5 | Content | AdminContentPage.tsx | ALTA |
| 6 | Gamification | AdminGamificationPage.tsx | CRITICA |
| 7 | Monitoring | AdminMonitoringPage.tsx | ALTA |
| 8 | Alerts | AdminAlertsPage.tsx | ALTA |
| 9 | Analytics | AdminAnalyticsPage.tsx | MEDIA |
| 10 | Progress | AdminProgressPage.tsx | ALTA |
| 11 | Reports | AdminReportsPage.tsx | MEDIA |
| 12 | Settings | AdminSettingsPage.tsx | MEDIA |
| 13 | Advanced | AdminAdvancedPage.tsx | BAJA |
| 14 | Assignments | AdminAssignmentsPage.tsx | ALTA |
| 15 | ClassroomTeacher | AdminClassroomTeacherPage.tsx | MEDIA |

### 2.2 Portal TEACHER (Paginas Activas - excluir legacy/duplicados)

| # | Pagina | Archivo | Prioridad Auditoria |
|---|--------|---------|---------------------|
| 1 | Dashboard | TeacherDashboardPage.tsx | CRITICA |
| 2 | Classes | TeacherClassesPage.tsx | CRITICA |
| 3 | Monitoring | TeacherMonitoringPage.tsx | CRITICA |
| 4 | Assignments | TeacherAssignmentsPage.tsx | ALTA |
| 5 | Responses | TeacherExerciseResponsesPage.tsx | CRITICA |
| 6 | Progress | TeacherProgressPage.tsx | ALTA |
| 7 | Alerts | TeacherAlertsPage.tsx | ALTA |
| 8 | Reports | TeacherReportsPage.tsx | MEDIA |
| 9 | Gamification | TeacherGamificationPage.tsx | ALTA |
| 10 | Analytics | TeacherAnalyticsPage.tsx | MEDIA |
| 11 | Settings | TeacherSettingsPage.tsx | BAJA |
| 12 | Communication | TeacherCommunicationPage.tsx | BAJA (feature flag) |
| 13 | Content | TeacherContentPage.tsx | BAJA (feature flag) |

### 2.3 Archivos Legacy/Duplicados (NO AUDITAR)

```yaml
Teacher_Legacy:
  - TeacherDashboard.tsx (usa TeacherDashboardPage)
  - TeacherClasses.tsx (usa TeacherClassesPage)
  - TeacherAssignments.tsx (usa TeacherAssignmentsPage)
  - TeacherAnalytics.tsx (usa TeacherAnalyticsPage)
  - TeacherGamification.tsx (usa TeacherGamificationPage)
  - TeacherStudents.tsx (usa TeacherStudentsPage)
  - TeacherContentManagement.tsx (usa TeacherContentPage)
  - TeacherResourcesPage.tsx (REDIRECT en FASE 6A)
  - TeacherStudentsPage.tsx (legacy, funcionalidad en Monitoring)
```

---

## 3. CRITERIOS DE AUDITORIA

### 3.1 Por Cada Pagina Verificar

```yaml
API_Integration:
  - [ ] Tiene hook(s) para consumir API
  - [ ] Hook llama endpoints reales (no mock data)
  - [ ] Maneja estados: loading, error, success
  - [ ] Tiene refresh/refetch capability

Database_Connection:
  - [ ] Datos vienen de endpoints backend
  - [ ] Backend tiene queries a BD implementadas
  - [ ] Datos se actualizan con acciones del usuario

Component_Functionality:
  - [ ] Todos los botones tienen handlers
  - [ ] Formularios tienen validacion
  - [ ] Modales abren/cierran correctamente
  - [ ] Tablas tienen sorting/filtering si aplica
  - [ ] Paginacion funciona si aplica

Dependencies:
  - [ ] Imports resuelven correctamente
  - [ ] Tipos estan definidos
  - [ ] Hooks exportan todas las funciones usadas
  - [ ] APIs tienen todos los endpoints necesarios

Student_Integration:
  - [ ] Acciones del estudiante actualizan datos
  - [ ] Progreso del estudiante se refleja
  - [ ] Estadisticas son calculadas correctamente
```

### 3.2 Clasificacion de Issues

```yaml
CRITICO:
  - API no implementada (datos mock hardcoded)
  - Backend endpoint no existe
  - Componente crashea

ALTO:
  - Funcion no implementada (TODO en codigo)
  - Datos no se actualizan en tiempo real
  - Validaciones faltantes

MEDIO:
  - UI inconsistente
  - Performance issues
  - Falta paginacion

BAJO:
  - Mejoras de UX
  - Documentacion faltante
  - Estilos menores
```

---

## 4. ESTRATEGIA DE EJECUCION

### 4.1 FASE 2: Ejecucion de Analisis

Usar 4 subagentes en paralelo:

```yaml
Agente_1_Admin_Core:
  paginas:
    - AdminDashboardPage
    - AdminUsersPage
    - AdminRolesPage
    - AdminInstitutionsPage
  foco: Gestion de usuarios y permisos

Agente_2_Admin_Operations:
  paginas:
    - AdminGamificationPage
    - AdminContentPage
    - AdminMonitoringPage
    - AdminAlertsPage
  foco: Operaciones y contenido

Agente_3_Admin_Analytics:
  paginas:
    - AdminAnalyticsPage
    - AdminProgressPage
    - AdminReportsPage
    - AdminSettingsPage
    - AdminAdvancedPage
    - AdminAssignmentsPage
    - AdminClassroomTeacherPage
  foco: Analitica y configuracion

Agente_4_Teacher_All:
  paginas:
    - TeacherDashboardPage
    - TeacherClassesPage
    - TeacherMonitoringPage
    - TeacherAssignmentsPage
    - TeacherExerciseResponsesPage
    - TeacherProgressPage
    - TeacherAlertsPage
    - TeacherReportsPage
    - TeacherGamificationPage
    - TeacherAnalyticsPage
  foco: Todo el portal Teacher
```

### 4.2 Formato de Reporte por Agente

```yaml
Pagina: [NombrePagina]
Archivo: [ruta/archivo.tsx]
Hooks_Usados: [lista de hooks]
APIs_Consumidas: [lista de endpoints]
Estado_General: [COMPLETO | PARCIAL | MOCK | PLACEHOLDER]

Checklist:
  API_Integration:
    tiene_hook: [SI/NO]
    endpoints_reales: [SI/NO/PARCIAL]
    maneja_loading: [SI/NO]
    maneja_error: [SI/NO]
    tiene_refresh: [SI/NO]

  Components:
    botones_funcionales: [SI/NO/PARCIAL]
    formularios_validan: [SI/NO/NA]
    modales_funcionan: [SI/NO/NA]
    tablas_sorting: [SI/NO/NA]
    paginacion: [SI/NO/NA]

  Issues_Encontrados:
    - severity: [CRITICO|ALTO|MEDIO|BAJO]
      descripcion: [descripcion del issue]
      archivo: [archivo afectado]
      linea: [numero de linea si aplica]
      solucion_propuesta: [como corregirlo]

  Dependencies_Faltantes:
    - tipo: [HOOK|API|TYPE|COMPONENT]
      nombre: [nombre del objeto faltante]
      usado_en: [donde se usa]
```

---

## 5. HOOKS Y APIS A AUDITAR

### 5.1 Admin Hooks

| Hook | Usado Por | Endpoints |
|------|-----------|-----------|
| useAdminDashboard | AdminDashboardPage | /admin/dashboard/* |
| useUserManagement | AdminUsersPage | /admin/users/* |
| useOrganizations | AdminInstitutionsPage | /admin/organizations/* |
| useRoles | AdminRolesPage | /admin/roles/* |
| useContentManagement | AdminContentPage | /admin/content/* |
| useGamificationConfig | AdminGamificationPage | /admin/gamification/* |
| useMonitoring | AdminMonitoringPage | /admin/monitoring/* |
| useAlerts | AdminAlertsPage | /admin/alerts/* |
| useAnalytics | AdminAnalyticsPage | /admin/analytics/* |
| useProgress | AdminProgressPage | /admin/progress/* |
| useReports | AdminReportsPage | /admin/reports/* |
| useSettings | AdminSettingsPage | /admin/settings/* |
| useFeatureFlags | AdminAdvancedPage | /admin/feature-flags/* |
| useAdminAssignments | AdminAssignmentsPage | /admin/assignments/* |
| useClassroomTeacher | AdminClassroomTeacherPage | /admin/classroom-teachers/* |

### 5.2 Teacher Hooks

| Hook | Usado Por | Endpoints |
|------|-----------|-----------|
| useTeacherDashboard | TeacherDashboardPage | /teacher/dashboard/* |
| useClassrooms | TeacherClassesPage | /classrooms/* |
| useStudentMonitoring | TeacherMonitoringPage | /teacher/monitoring/* |
| useAssignments | TeacherAssignmentsPage | /teacher/assignments/* |
| useExerciseResponses | TeacherExerciseResponsesPage | /teacher/responses/* |
| useStudentProgress | TeacherProgressPage | /progress/* |
| useInterventionAlerts | TeacherAlertsPage | /teacher/alerts/* |
| useAnalytics | TeacherAnalyticsPage | /teacher/analytics/* |
| useAchievementsStats | TeacherGamificationPage | /teacher/gamification/* |

---

## 6. INTEGRACION CON STUDENT PORTAL

### 6.1 Flujos a Verificar

```yaml
Ejercicios_Completados:
  student_action: Completar ejercicio
  expected_update:
    - Teacher: TeacherMonitoringPage (estudiante activo)
    - Teacher: TeacherProgressPage (progreso actualizado)
    - Teacher: TeacherExerciseResponsesPage (nueva respuesta)
    - Admin: AdminProgressPage (estadisticas)

Logros_Desbloqueados:
  student_action: Desbloquear achievement
  expected_update:
    - Teacher: TeacherGamificationPage (logros de clase)
    - Admin: AdminGamificationPage (estadisticas globales)

Compras_Tienda:
  student_action: Comprar item en tienda
  expected_update:
    - Teacher: TeacherGamificationPage (economia de clase)
    - Admin: AdminGamificationPage (transacciones)

Progreso_Modulo:
  student_action: Avanzar en modulo
  expected_update:
    - Teacher: TeacherProgressPage (progreso individual)
    - Teacher: TeacherMonitoringPage (estado actual)
    - Admin: AdminProgressPage (metricas agregadas)
```

---

## 7. ENTREGABLES POR FASE

### FASE 2: Analisis
- 4 reportes de auditoria (1 por agente)
- Lista consolidada de issues encontrados
- Matriz de dependencias faltantes

### FASE 3: Planeacion
- SPEC de correcciones priorizadas
- Estimacion de impacto por correccion
- Orden de implementacion

### FASE 4: Validacion
- Verificacion de dependencias cruzadas
- Validacion de no regresiones
- Checklist de componentes afectados

### FASE 5: Ejecucion
- Implementacion de correcciones CRITICAS
- Implementacion de correcciones ALTAS
- Verificacion post-implementacion

---

## 8. CRITERIOS DE EXITO

```yaml
Minimo_Aceptable:
  - 0 issues CRITICOS sin resolver
  - 90% de APIs con endpoints reales
  - 100% de paginas sin crashes

Objetivo:
  - 0 issues CRITICOS y ALTOS
  - 100% de APIs con endpoints reales
  - Todas las paginas con datos de BD
  - Integracion Student verificada
```

---

**Documento generado:** 2025-12-15
**Estado:** LISTO PARA FASE 2
