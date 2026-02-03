# Teacher Monitoring Endpoints - Mapping Guide

**Fecha:** 2025-11-26
**Contexto:** ISS-004, ISS-005, ISS-006 (P2)
**Decisión:** Documentar alternativas existentes (NO crear endpoints duplicados)

---

## 📋 Resumen

Durante la validación del Portal Teacher se identificaron 3 endpoints "faltantes" que en realidad tienen alternativas funcionales existentes. Este documento mapea las rutas solicitadas a las alternativas disponibles.

---

## 🗺️ Mapeo de Endpoints

### 1. Activity Monitoring

| | |
|---|---|
| **Solicitado** | `GET /teacher/monitoring/activity` |
| **Usar** | `GET /teacher/dashboard/activities` |
| **Controller** | `TeacherController` |
| **Service** | `TeacherDashboardService.getRecentActivities()` |

**Ejemplo de uso:**
```bash
GET /api/v1/teacher/dashboard/activities?limit=20

# Response: RecentActivity[]
{
  "data": [
    {
      "id": "uuid",
      "student_name": "Juan Pérez",
      "student_id": "uuid",
      "activity_type": "submission",
      "title": "Ejercicio Módulo 1",
      "timestamp": "2025-11-26T10:30:00Z",
      "status": "pending"
    }
  ]
}
```

**Parámetros:**
- `limit` (opcional): Número de actividades a retornar (default: 10)

---

### 2. Real-time Monitoring

| | |
|---|---|
| **Solicitado** | `GET /teacher/monitoring/realtime` |
| **Usar** | `GET /teacher/dashboard/stats` |
| **Controller** | `TeacherController` |
| **Service** | `TeacherDashboardService.getClassroomStats()` |

**Ejemplo de uso:**
```bash
GET /api/v1/teacher/dashboard/stats

# Response: ClassroomStats
{
  "total_students": 45,
  "active_students": 38,
  "average_score": 78.5,
  "average_completion": 65.2,
  "total_submissions_pending": 12,
  "students_at_risk": 3
}
```

**Datos "realtime" incluidos:**
- `total_submissions_pending`: Submissions con status 'submitted' o 'pending'
- `active_students`: Actividad en últimos 7 días
- `students_at_risk`: Estudiantes con score < 60 o inactivos

---

### 3. Progress Overview

| | |
|---|---|
| **Solicitado** | `GET /teacher/progress/overview` |
| **Usar** | Múltiples opciones según contexto |

**Opción A: Por módulo (general)**
```bash
GET /api/v1/teacher/dashboard/module-progress

# Response: ModuleProgressSummary[]
{
  "data": [
    {
      "module_id": "uuid",
      "module_name": "Módulo 1: Comprensión Literal",
      "students_active": 35,
      "average_completion": 72.3
    }
  ]
}
```

**Opción B: Por classroom (detallado)**
```bash
GET /api/v1/teacher/classrooms/:classroomId/progress

# Response:
{
  "classroomData": {
    "id": "uuid",
    "name": "5to Grado A",
    "student_count": 30,
    "active_students": 28,
    "average_completion": 68.5,
    "average_score": 75.2,
    "total_exercises": 50,
    "completed_exercises": 890
  },
  "moduleProgress": [...]
}
```

**Opción C: Por estudiante**
```bash
GET /api/v1/teacher/students/:studentId/progress

# Response: StudentProgressDetail
{
  "student_overview": {...},
  "stats": {...},
  "modules": [...],
  "recent_activity": [...],
  "struggle_areas": [...],
  "class_comparison": {...}
}
```

---

## 📊 Tabla de Servicios

| Endpoint | Service | Método |
|----------|---------|--------|
| `/dashboard/activities` | TeacherDashboardService | `getRecentActivities()` |
| `/dashboard/stats` | TeacherDashboardService | `getClassroomStats()` |
| `/dashboard/module-progress` | TeacherDashboardService | `getModuleProgressSummary()` |
| `/classrooms/:id/progress` | TeacherClassroomsCrudService | `getClassroomProgress()` |
| `/students/:id/progress` | StudentProgressService | `getStudentProgress()` |

---

## 📁 Ubicaciones en Codebase

```
apps/backend/src/modules/teacher/
├── controllers/
│   ├── teacher.controller.ts           # Endpoints dashboard/*
│   └── teacher-classrooms.controller.ts # Endpoints classrooms/*
├── services/
│   ├── teacher-dashboard.service.ts    # Stats, activities, module-progress
│   ├── student-progress.service.ts     # Student progress detail
│   └── teacher-classrooms-crud.service.ts # Classroom progress
└── dto/
    └── analytics.dto.ts               # DTOs relacionados
```

---

## ✅ Justificación de la Decisión

**¿Por qué NO crear los endpoints solicitados?**

1. **Redundancia:** Ya existen endpoints equivalentes consolidados
2. **API Design:** Single source of truth para cada funcionalidad
3. **Mantenimiento:** Evitar duplicación de lógica y código
4. **Frontend:** Ya consume las rutas existentes correctamente

---

**Documentado por:** Architecture-Analyst
**Fecha:** 2025-11-26
