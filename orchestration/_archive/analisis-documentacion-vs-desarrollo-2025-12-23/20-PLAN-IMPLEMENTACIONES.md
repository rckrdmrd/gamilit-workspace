# PLAN DE IMPLEMENTACIONES - PORTAL TEACHER GAMILIT

**Fecha**: 23 Diciembre 2025
**Version**: 1.0
**FASE**: 3 - Planificacion de Implementaciones
**Rol**: Requirements-Analyst

---

## RESUMEN DE TAREAS

| Prioridad | Total Tareas | Impacto |
|-----------|--------------|---------|
| **P0 - Critico** | 4 tareas | Bloquean produccion |
| **P1 - Alta** | 6 tareas | Afectan funcionalidad core |
| **P2 - Media** | 5 tareas | Mejoras importantes |

---

## P0 - TAREAS CRITICAS (Bloquean produccion)

### TAREA P0-01: Registrar TeacherMessagesService en Module

**Gap**: G01 - Servicio NO registrado en providers
**Severidad**: CRITICA - Inyeccion fallara
**Archivo a modificar**:
- `/home/isem/workspace/projects/gamilit/apps/backend/src/modules/teacher/teacher.module.ts`

**Cambio requerido**:
Agregar `TeacherMessagesService` al array de providers en la linea 182.

```typescript
providers: [
  // ... otros providers
  TeacherMessagesService, // AGREGAR ESTA LINEA
],
```

**Validacion**:
- Verificar que el servicio se inyecte correctamente
- Verificar que los endpoints de /teacher/messages funcionen

**Dependencias**: Ninguna
**Esfuerzo**: 5 minutos
**Subagente**: Backend-Developer

---

### TAREA P0-02: Agregar Indicador de Mock Data en TeacherReportsPage

**Gap**: G02 - Mock data fallback sin indicador visual
**Severidad**: CRITICA - Usuarios ven datos ficticios sin saberlo
**Archivo a modificar**:
- `/home/isem/workspace/projects/gamilit/apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx`

**Cambios requeridos**:

1. Agregar estado para tracking de mock data:
```typescript
const [isUsingMockData, setIsUsingMockData] = useState(false);
```

2. En cada catch block de fallback, setear flag:
```typescript
// En loadStudents (linea ~178)
catch {
  setIsUsingMockData(true);
  setStudents([...mockStudents]);
}

// En loadRecentReports (linea ~199)
catch {
  setIsUsingMockData(true);
  setRecentReports([...mockReports]);
}

// En loadReportStats (linea ~243)
catch {
  setIsUsingMockData(true);
  setReportStats({...mockStats});
}
```

3. Agregar banner visible cuando isUsingMockData es true:
```typescript
{isUsingMockData && (
  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
    <p className="font-bold">Datos de Demostracion</p>
    <p>No se pudo conectar al servidor. Mostrando datos de ejemplo.</p>
  </div>
)}
```

**Validacion**:
- Desconectar API y verificar banner aparece
- Conectar API y verificar banner NO aparece

**Dependencias**: Ninguna
**Esfuerzo**: 30 minutos
**Subagente**: Frontend-Developer

---

### TAREA P0-03: Agregar Filtrado por Teacher en DashboardService

**Gap**: G03 - Dashboard muestra datos de TODOS los estudiantes
**Severidad**: CRITICA - Problema de seguridad/privacidad
**Archivo a modificar**:
- `/home/isem/workspace/projects/gamilit/apps/backend/src/modules/teacher/services/teacher-dashboard.service.ts`

**Cambio requerido** (linea ~77):

Cambiar la query para filtrar por classrooms del teacher:

```typescript
// ANTES (problematico)
const students = await this.profileRepository.find({
  where: { role: 'student' }
});

// DESPUES (correcto)
const teacherClassrooms = await this.classroomRepository.find({
  where: { teacher_id: teacherId }
});
const classroomIds = teacherClassrooms.map(c => c.id);

const students = await this.classroomMemberRepository
  .createQueryBuilder('cm')
  .innerJoinAndSelect('cm.student', 'student')
  .where('cm.classroom_id IN (:...classroomIds)', { classroomIds })
  .getMany();
```

**Validacion**:
- Crear teacher con 2 aulas
- Verificar que solo ve estudiantes de SUS aulas
- Verificar que NO ve estudiantes de otras aulas

**Dependencias**: Ninguna
**Esfuerzo**: 1 hora
**Subagente**: Backend-Developer

---

### TAREA P0-04: Implementar Generacion PDF con Puppeteer

**Gap**: G04 - ReportsService sin generacion real de PDF
**Severidad**: CRITICA - Reportes PDF vacios
**Archivos a modificar**:
- `/home/isem/workspace/projects/gamilit/apps/backend/src/modules/teacher/services/reports.service.ts`
- `package.json` (agregar dependencia puppeteer)

**Cambios requeridos**:

1. Instalar puppeteer:
```bash
cd apps/backend && npm install puppeteer
```

2. Implementar generatePDFReport():
```typescript
import puppeteer from 'puppeteer';

async generatePDFReport(config: ReportConfig): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const html = this.generateReportHTML(config);
  await page.setContent(html);

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}
```

**Alternativa**: Si Puppeteer es muy pesado, usar `pdfkit` o `jsPDF` como alternativa ligera.

**Validacion**:
- Generar reporte PDF
- Verificar que descarga archivo valido
- Abrir PDF y verificar contenido

**Dependencias**: Ninguna
**Esfuerzo**: 2-3 horas
**Subagente**: Backend-Developer

---

## P1 - TAREAS DE ALTA PRIORIDAD

### TAREA P1-01: Unificar organizationName Dinamico

**Gap**: G05 - organizationName hardcodeado en 6 paginas
**Archivos a modificar**:
- TeacherClassesPage.tsx
- TeacherMonitoringPage.tsx
- TeacherAssignmentsPage.tsx (wrapper)
- TeacherExerciseResponsesPage.tsx
- TeacherAlertsPage.tsx
- TeacherReportsPage.tsx

**Cambio requerido** en cada archivo:
```typescript
// ANTES
organizationName="GLIT Platform"

// DESPUES
organizationName={user?.organization?.name || 'Mi Institucion'}
```

**Dependencias**: Ninguna
**Esfuerzo**: 30 minutos (6 archivos * 5 min)
**Subagente**: Frontend-Developer

---

### TAREA P1-02: Mejorar Fallback Gamification

**Gap**: G06 - Fallback con datos dummy sin indicador
**Archivos a modificar**: 10 paginas del teacher portal

**Opcion A - Indicador visual**:
```typescript
{gamificationError && (
  <span className="text-xs text-gray-400">(datos no disponibles)</span>
)}
```

**Opcion B - Reintentar automatico**:
```typescript
const { retry } = useUserGamification(userId, { retryCount: 3 });
```

**Dependencias**: Ninguna
**Esfuerzo**: 1 hora
**Subagente**: Frontend-Developer

---

### TAREA P1-03: Crear Endpoint economyConfig

**Gap**: G08 - economyConfig hardcodeado en TeacherGamification
**Archivos a crear/modificar**:
- Crear: `/apps/backend/src/modules/teacher/controllers/economy-config.controller.ts`
- Crear: `/apps/backend/src/modules/teacher/services/economy-config.service.ts`
- Modificar: `teacher.module.ts`
- Modificar: `TeacherGamification.tsx`

**Endpoint**: `GET /teacher/analytics/economy-config`

**Response**:
```json
{
  "earning_rates": {
    "exercise_completion": 50,
    "daily_login": 10,
    "streak_bonus": 20,
    "achievement": 100,
    "perfect_score": 150
  },
  "spending_costs": {
    "hint": 20,
    "skip_exercise": 50,
    "powerup_vision": 30,
    "powerup_time": 40,
    "cosmetic_item": 100
  }
}
```

**Dependencias**: Tabla de configuracion en DB (opcional, puede ser config file)
**Esfuerzo**: 2 horas
**Subagente**: Backend-Developer

---

### TAREA P1-04: Estandarizar Cliente HTTP (apiClient)

**Gap**: G09 - Inconsistencia apiClient vs axiosInstance
**Archivos a modificar** (7 servicios):
- teacherApi.ts
- classroomsApi.ts
- assignmentsApi.ts
- gradingApi.ts
- analyticsApi.ts
- studentProgressApi.ts
- bonusCoinsApi.ts

**Cambio requerido** en cada archivo:
```typescript
// ANTES
import { axiosInstance } from '@/services/api/axiosInstance';
// ... uso de axiosInstance.get()

// DESPUES
import { apiClient } from '@/shared/api';
// ... uso de apiClient.get()
```

**Dependencias**: Verificar que apiClient tenga mismos interceptors
**Esfuerzo**: 1-2 horas
**Subagente**: Frontend-Developer

---

### TAREA P1-05: Centralizar Rutas en API_ENDPOINTS

**Gap**: G10 - 6 servicios no usan API_ENDPOINTS
**Archivo a modificar**:
- `/home/isem/workspace/projects/gamilit/apps/frontend/src/config/api.config.ts`

**Agregar a API_ENDPOINTS.teacher**:
```typescript
teacher: {
  // ... existentes ...

  // AGREGAR:
  submissions: '/teacher/submissions',
  submissionById: (id: string) => `/teacher/submissions/${id}`,
  bulkGrade: '/teacher/submissions/bulk-grade',

  studentProgress: (id: string) => `/teacher/students/${id}/progress`,
  studentOverview: (id: string) => `/teacher/students/${id}/overview`,
  studentStats: (id: string) => `/teacher/students/${id}/stats`,
  studentNotes: (id: string) => `/teacher/students/${id}/notes`,
  addStudentNote: (id: string) => `/teacher/students/${id}/note`,

  attempts: '/teacher/attempts',
  attemptById: (id: string) => `/teacher/attempts/${id}`,
  attemptsByStudent: (id: string) => `/teacher/attempts/student/${id}`,
  exerciseResponses: (id: string) => `/teacher/exercises/${id}/responses`,
}
```

**Dependencias**: Ninguna
**Esfuerzo**: 30 minutos
**Subagente**: Frontend-Developer

---

### TAREA P1-06: Reemplazar alert() con Toast

**Gap**: Varias paginas usan alert() en lugar de Toast
**Archivos a modificar**:
- TeacherAssignments.tsx
- TeacherClasses.tsx

**Cambio requerido**:
```typescript
// ANTES
alert('Error al crear aula');

// DESPUES
import { useToast } from '@/shared/hooks/useToast';
const { showError } = useToast();
showError('Error al crear aula');
```

**Dependencias**: Hook useToast disponible
**Esfuerzo**: 30 minutos
**Subagente**: Frontend-Developer

---

## P2 - TAREAS DE MEDIA PRIORIDAD

### TAREA P2-01: Dinamizar Ejercicios en ReviewPanelPage

**Gap**: G11 - Ejercicios hardcodeados en dropdown
**Archivo a modificar**: ReviewPanelPage.tsx

**Cambio**: Obtener ejercicios desde API o config
**Esfuerzo**: 1 hora

---

### TAREA P2-02: Centralizar Tipos de Alertas

**Gap**: G12 - Tipos hardcodeados en TeacherAlertsPage
**Cambio**: Mover a shared/constants o obtener de API
**Esfuerzo**: 30 minutos

---

### TAREA P2-03: Calcular Stats en Servidor (Respuestas)

**Gap**: G13 - Stats calculados en cliente
**Cambio**: Agregar endpoint /teacher/attempts/stats
**Esfuerzo**: 1 hora

---

### TAREA P2-04: Enriquecer Nombres en TeacherMessages

**Gap**: G14 - Nombres truncados (User_abc12345)
**Cambio**: Implementar join manual con auth.profiles
**Esfuerzo**: 2 horas

---

### TAREA P2-05: Implementar ML Real en Predictor

**Gap**: G07 - Solo heuristicas, no ML real
**Cambio**: Integrar TensorFlow.js o microservicio Python
**Esfuerzo**: Sprint completo (fuera de scope inmediato)

---

## GRAFO DE DEPENDENCIAS

```
P0-01 (MessagesService) ────────────────────→ Independiente

P0-02 (Mock Data Banner) ───────────────────→ Independiente

P0-03 (Filtrado Teacher) ───────────────────→ Independiente

P0-04 (Puppeteer PDF) ──────────────────────→ Independiente

P1-01 (organizationName) ───────────────────→ Independiente

P1-02 (Fallback Gamification) ──────────────→ Independiente

P1-03 (economyConfig) ─────────────→ P1-04 (Estandarizar apiClient)

P1-04 (apiClient) ─────────────────→ P1-05 (API_ENDPOINTS)

P1-05 (API_ENDPOINTS) ──────────────────────→ Independiente

P1-06 (Toast) ──────────────────────────────→ Independiente
```

---

## ORDEN DE EJECUCION RECOMENDADO

### Sprint Inmediato (Esta semana)

1. **P0-01**: Registrar TeacherMessagesService (5 min)
2. **P0-02**: Banner mock data en Reportes (30 min)
3. **P0-03**: Filtrado por teacher en Dashboard (1 hora)
4. **P1-01**: Unificar organizationName (30 min)
5. **P1-06**: Reemplazar alert() con Toast (30 min)

### Sprint Siguiente

6. **P0-04**: Implementar Puppeteer PDF (2-3 horas)
7. **P1-03**: Endpoint economyConfig (2 horas)
8. **P1-04**: Estandarizar apiClient (1-2 horas)
9. **P1-05**: Centralizar API_ENDPOINTS (30 min)
10. **P1-02**: Mejorar fallback gamification (1 hora)

### Backlog

11. P2-01 a P2-05 (segun prioridad del equipo)

---

## ARCHIVOS IMPACTADOS (RESUMEN)

### Backend (4 archivos)
- teacher.module.ts
- teacher-dashboard.service.ts
- reports.service.ts
- (nuevo) economy-config.service.ts

### Frontend Pages (10 archivos)
- TeacherReportsPage.tsx
- TeacherClassesPage.tsx
- TeacherMonitoringPage.tsx
- TeacherAssignmentsPage.tsx
- TeacherExerciseResponsesPage.tsx
- TeacherAlertsPage.tsx
- TeacherGamification.tsx
- TeacherClasses.tsx
- TeacherAssignments.tsx
- ReviewPanelPage.tsx

### Frontend APIs (7 archivos)
- teacherApi.ts
- classroomsApi.ts
- assignmentsApi.ts
- gradingApi.ts
- analyticsApi.ts
- studentProgressApi.ts
- bonusCoinsApi.ts

### Config (1 archivo)
- api.config.ts

---

## SIGUIENTE PASO

**FASE 4**: Validar este plan verificando:
- Todas las dependencias estan cubiertas
- No faltan objetos que deban impactarse
- Archivos mencionados existen
- Orden de ejecucion es correcto

---

*Plan creado: 2025-12-23*
*Proyecto: GAMILIT - Portal Teacher*
