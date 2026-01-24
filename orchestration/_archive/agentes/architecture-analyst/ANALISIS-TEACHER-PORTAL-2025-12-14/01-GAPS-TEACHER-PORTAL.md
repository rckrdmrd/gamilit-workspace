# GAPS IDENTIFICADOS - Teacher Portal

**Fecha:** 2025-12-14
**Agente:** Architecture-Analyst
**Proyecto:** GAMILIT

---

## GAP CRITICO: snake_case vs camelCase Mismatch

### Descripcion

El `apiClient` tiene un interceptor de respuesta que transforma automaticamente las propiedades de snake_case a camelCase:

```typescript
// apiClient.ts lineas 110-113
if (response.data && typeof response.data === 'object') {
  response.data = snakeToCamel(response.data);
}
```

**Problema:**
- Backend retorna: `{ full_name: "Juan", score_average: 85, last_activity: "2025-12-14" }`
- apiClient transforma a: `{ fullName: "Juan", scoreAverage: 85, lastActivity: "2025-12-14" }`
- Frontend espera: `student.full_name`, `student.score_average`, `student.last_activity`
- Resultado: **undefined** en todas las propiedades

### Archivos Afectados

#### Teacher Portal (18 archivos):
- `pages/TeacherStudents.tsx`
- `pages/TeacherProgressPage.tsx`
- `pages/TeacherReportsPage.tsx`
- `pages/TeacherMonitoringPage.tsx`
- `pages/TeacherClasses.tsx`
- `components/assignments/AssignmentCreator.tsx`
- `components/assignments/AssignmentWizard.tsx`
- `components/collaboration/ParentCommunicationHub.tsx`
- `components/communication/AnnouncementForm.tsx`
- `components/communication/FeedbackForm.tsx`
- `components/monitoring/StudentDetailModal.tsx`
- `components/monitoring/StudentMonitoringPanel.tsx`
- `components/monitoring/StudentStatusCard.tsx`
- `components/analytics/PerformanceInsightsPanel.tsx`
- `components/progress/ClassProgressDashboard.tsx`
- `components/progress/StudentProgressList.tsx`
- `components/reports/ReportGenerator.tsx`
- `types/index.ts`

#### Admin Portal (8 archivos):
- `pages/AdminUsersPage.tsx`
- `types/index.ts`
- `hooks/useUserManagement.ts`
- `components/users/UserDetailModal.tsx`
- `components/users/UserDetailModal.example.tsx`
- `components/dashboard/UserManagementTable.tsx`
- `components/progress/ClassroomsView.tsx`
- `components/progress/StudentDetailView.tsx`

#### Student Portal (2 archivos):
- `hooks/useGamificationData.ts`
- `components/gamification/GamificationHero.tsx`

### Solucion Recomendada

**Opcion elegida:** Remover la transformacion snake_case -> camelCase en apiClient

**Razon:**
- Todos los tipos TypeScript del frontend estan definidos en snake_case
- Todos los componentes acceden a propiedades en snake_case
- El backend retorna snake_case (convencion de PostgreSQL/NestJS)
- Cambiar +28 archivos seria mas riesgoso que modificar un solo archivo (apiClient)

### Cambio Requerido

**Archivo:** `src/services/api/apiClient.ts`

**Lineas a modificar:** 110-113 y 55-62

```typescript
// ANTES:
if (response.data && typeof response.data === 'object') {
  response.data = snakeToCamel(response.data);
}

// DESPUES:
// Mantener snake_case del backend (frontend types ya usan snake_case)
// response.data = snakeToCamel(response.data); // REMOVIDO
```

---

## GAPS MENORES

### GAP-T-001: Debug console.log en TeacherExerciseResponsesPage

**Archivo:** `pages/TeacherExerciseResponsesPage.tsx:136`
```typescript
console.log('[TeacherExerciseResponsesPage] Hook data:', { data, isLoading, error: error?.message });
```

**Severidad:** Baja
**Accion:** Remover o condicionar a DEBUG mode

---

## ESTADO DE ENDPOINTS

| Endpoint | Frontend | Backend | Estado |
|----------|----------|---------|--------|
| `/teacher/classrooms` | OK | OK | Funcional |
| `/teacher/classrooms/:id/students` | OK | OK | Funcional |
| `/teacher/assignments` | OK | OK | Funcional |
| `/teacher/attempts` | OK | OK | Funcional |
| `/teacher/submissions/:id/feedback` | OK | OK | Funcional |

**Nota:** Todos los endpoints existen y estan correctamente definidos. El problema es la transformacion de datos en el cliente.

---

## PLAN DE CORRECCION

1. **Fase 1 - Correccion Critica** (Inmediata)
   - Modificar `apiClient.ts` para NO transformar response data
   - Mantener transformacion de request data (camelCase -> snake_case)

2. **Fase 2 - Validacion**
   - Ejecutar build
   - Probar Teacher portal
   - Verificar Student y Admin portals

3. **Fase 3 - Limpieza**
   - Remover console.log de debug

---

**Ultima actualizacion:** 2025-12-14
