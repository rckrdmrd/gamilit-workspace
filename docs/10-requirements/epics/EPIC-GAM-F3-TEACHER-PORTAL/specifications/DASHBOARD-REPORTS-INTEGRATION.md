---
titulo: "Especificación: Integración Dashboard - Reports"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Especificación: Integración Dashboard - Reports

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | SPEC-DASH-REP-001 |
| **Tipo** | Especificación de Integración |
| **Estado** | Aprobado |
| **Versión** | 1.0.0 |
| **Creado** | 2026-01-20 |
| **Actualizado** | 2026-01-20 |

---

## Propósito

Este documento especifica la integración entre el Dashboard del Teacher Portal (US-PM-000)
y el módulo de Reports (US-PM-005b), definiendo:
- Puntos de acceso a Reports desde Dashboard
- Workflow de navegación
- Quick actions disponibles

**Resuelve:** GAP-3 (Integración Dashboard ↔ Reports no documentada)

---

## Puntos de Integración

### 1. Quick Actions Panel

**Ubicación:** Dashboard principal, sección lateral derecha

**Componente:** `QuickActionsPanel.tsx`

**Acción de Reportes:**
```tsx
<QuickActionButton
  icon={<FileText />}
  label="Generar Reporte"
  description="Crear reporte de progreso"
  onClick={() => navigate('/teacher/reports')}
/>
```

**Wireframe:**
```
┌─────────────────────────────────────┐
│  ACCIONES RÁPIDAS                   │
├─────────────────────────────────────┤
│  [📝] Crear Tarea                   │
│  [📊] Generar Reporte     ← AQUÍ    │
│  [📧] Enviar Mensaje                │
│  [👥] Ver Estudiantes               │
└─────────────────────────────────────┘
```

---

### 2. Classroom Card Actions

**Ubicación:** Cards de classroom en el grid del dashboard

**Componente:** `ClassroomCard.tsx`

**Acción de Reporte por Classroom:**
```tsx
<DropdownMenu>
  <DropdownMenuItem onClick={() => navigate(`/teacher/reports?classroom=${classroom.id}`)}>
    <FileText className="mr-2 h-4 w-4" />
    Generar Reporte
  </DropdownMenuItem>
</DropdownMenu>
```

**Wireframe:**
```
┌─────────────────────────────────────┐
│  Matemáticas 5A          [⋮]       │
│                           │         │
│  25 estudiantes          ┌┴────────┐│
│  85% promedio            │ Ver     ││
│  3 alertas pendientes    │ Editar  ││
│                          │ Reporte ←┤│
│  [Ver Progreso]          │ Eliminar││
└──────────────────────────└─────────┘┘
```

---

### 3. Estadísticas con Link a Reports

**Ubicación:** Stats cards en dashboard

**Comportamiento:** Click en "Ver detalles" navega a reports con filtro

```tsx
<StatCard
  title="Reportes Generados"
  value={stats.reports_this_month}
  subtitle="Este mes"
  action={{
    label: "Ver todos",
    onClick: () => navigate('/teacher/reports')
  }}
/>
```

---

### 4. Navegación Principal

**Ubicación:** Sidebar de navegación

**Ítem de menú:**
```tsx
{
  path: '/teacher/reports',
  icon: <FileBarChart />,
  label: 'Reportes',
  badge: stats.scheduled_reports > 0 ? stats.scheduled_reports : undefined
}
```

---

## Workflow de Navegación

### Flujo 1: Dashboard → Reports (General)

```
Dashboard
    │
    ├── Click "Generar Reporte" (Quick Actions)
    │         │
    │         ▼
    │   /teacher/reports
    │         │
    │         ▼
    │   ReportGenerator (sin classroom pre-seleccionado)
```

### Flujo 2: Dashboard → Reports (Por Classroom)

```
Dashboard
    │
    ├── Click "⋮" en ClassroomCard
    │         │
    │         ├── Click "Generar Reporte"
    │         │         │
    │         │         ▼
    │         │   /teacher/reports?classroom={id}
    │         │         │
    │         │         ▼
    │         │   ReportGenerator (classroom pre-seleccionado)
```

### Flujo 3: Progress → Reports

```
TeacherProgressPage
    │
    ├── Click "Exportar Reporte" (botón en toolbar)
    │         │
    │         ▼
    │   /teacher/reports?classroom={id}&type=progress
    │         │
    │         ▼
    │   ReportGenerator (classroom y tipo pre-seleccionados)
```

---

## Query Parameters

La página de Reports acepta los siguientes query parameters para pre-configuración:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `classroom` | UUID | Pre-selecciona el classroom |
| `type` | string | Pre-selecciona el tipo de reporte |
| `student` | UUID | Pre-selecciona un estudiante específico |
| `format` | string | Pre-selecciona el formato (pdf, excel, csv) |

**Ejemplo:**
```
/teacher/reports?classroom=abc-123&type=monthly_progress&format=pdf
```

---

## Componentes de Integración

### DashboardReportLink

```tsx
// components/dashboard/DashboardReportLink.tsx
interface DashboardReportLinkProps {
  classroomId?: string;
  reportType?: 'monthly_progress' | 'final_evaluation' | 'intervention' | 'custom';
  children: React.ReactNode;
}

export function DashboardReportLink({
  classroomId,
  reportType,
  children
}: DashboardReportLinkProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    const params = new URLSearchParams();
    if (classroomId) params.set('classroom', classroomId);
    if (reportType) params.set('type', reportType);

    const query = params.toString();
    navigate(`/teacher/reports${query ? `?${query}` : ''}`);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
}
```

### useReportQueryParams

```tsx
// hooks/useReportQueryParams.ts
export function useReportQueryParams() {
  const [searchParams] = useSearchParams();

  return {
    classroomId: searchParams.get('classroom') || undefined,
    reportType: searchParams.get('type') || undefined,
    studentId: searchParams.get('student') || undefined,
    format: searchParams.get('format') || undefined,
  };
}
```

---

## Estados de UI

### Dashboard con Reportes Recientes

```
┌─────────────────────────────────────────────────────────┐
│  DASHBOARD DEL MAESTRO                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 3 Clases │ │25 Alumnos│ │ 5 Alertas│ │2 Reportes│   │
│  │ activas  │ │ activos  │ │pendientes│ │este mes  │   │
│  └──────────┘ └──────────┘ └──────────┘ └────┬─────┘   │
│                                              │          │
│                                        [Ver todos] ─────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  REPORTES RECIENTES                    [+ Nuevo] │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  📄 Progreso Mensual - Mat 5A    hace 2 días    │   │
│  │  📄 Evaluación Final - Cien 4B   hace 1 semana  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## API Endpoints Relacionados

### Dashboard Stats (incluye reports)

**Endpoint:** `GET /api/v1/teacher/dashboard/stats`

**Response incluye:**
```json
{
  "classrooms_count": 3,
  "students_count": 75,
  "pending_alerts": 5,
  "reports": {
    "total_generated": 12,
    "this_month": 2,
    "scheduled": 1
  }
}
```

### Recent Reports (para widget)

**Endpoint:** `GET /api/v1/teacher/reports/recent?limit=3`

**Response:**
```json
{
  "reports": [
    {
      "id": "uuid",
      "report_name": "Progreso Mensual - Matemáticas 5A",
      "report_type": "monthly_progress",
      "generated_at": "2026-01-18T10:30:00Z",
      "classroom_name": "Matemáticas 5A"
    }
  ]
}
```

---

## Responsive Behavior

### Desktop (≥1024px)
- Quick Actions en panel lateral
- Stats cards en fila de 4
- Widget de reportes recientes visible

### Tablet (768px - 1023px)
- Quick Actions en dropdown menu
- Stats cards en grid 2x2
- Widget de reportes colapsado

### Mobile (<768px)
- Quick Actions en FAB (Floating Action Button)
- Stats cards en scroll horizontal
- Widget de reportes oculto (acceso via nav)

---

## Implementación Requerida

### Archivos a Modificar

1. **Dashboard:**
   - `TeacherDashboardPage.tsx` - Agregar widget de reportes
   - `QuickActionsPanel.tsx` - Agregar acción de reporte
   - `ClassroomCard.tsx` - Agregar opción en menú

2. **Reports:**
   - `TeacherReportsPage.tsx` - Leer query params
   - `ReportGenerator.tsx` - Pre-seleccionar valores

3. **Navegación:**
   - `TeacherLayout.tsx` - Badge en menú de reportes

### Nuevos Componentes

1. `RecentReportsWidget.tsx`
2. `DashboardReportLink.tsx`
3. `useReportQueryParams.ts`

---

## Testing

### Casos de Prueba

1. **Navegación básica:** Click en "Generar Reporte" → Navega a /reports
2. **Pre-selección classroom:** Click en reporte desde card → classroom pre-seleccionado
3. **Query params:** URL con params → valores pre-cargados en formulario
4. **Responsive:** Quick actions visible/oculto según viewport
5. **Stats link:** Click en stats → navega a reports filtrado

---

## Changelog

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0.0 | 2026-01-20 | Documento inicial - Especificación de integración |

---

**Documento creado:** 2026-01-20
**Aprobado por:** Arquitecto de Soluciones
