# Quick Start: Nueva TeacherAssignmentsPage

## Resumen de Cambios

Se mejoró completamente la página de gestión de asignaciones con:
- **Wizard de 4 pasos** con preview de ejercicios
- **Cards visuales** con badges de estado
- **Modal avanzado** de submissions con filtros
- **Estados UI completos** (loading, error, empty)

---

## Componentes Nuevos

### 1. ImprovedAssignmentWizard
**Ubicación:** `apps/frontend/src/apps/teacher/components/assignments/ImprovedAssignmentWizard.tsx`

**Uso:**
```tsx
<ImprovedAssignmentWizard
  exercises={exercises}
  classroomId={classroomId}
  onComplete={handleCreateAssignment}
  onCancel={() => setIsWizardOpen(false)}
/>
```

**Características:**
- 4 pasos: Info Básica → Ejercicios → Configuración → Confirmación
- Preview de ejercicios seleccionados
- Validación en cada paso
- Resumen completo antes de crear

---

### 2. AssignmentCard
**Ubicación:** `apps/frontend/src/apps/teacher/components/assignments/AssignmentCard.tsx`

**Uso:**
```tsx
<AssignmentCard
  assignment={assignment}
  onViewSubmissions={handleViewSubmissions}
  onSendReminder={handleSendReminder}
/>
```

**Características:**
- Badges de estado y tipo
- Grid de estadísticas
- Botones de acción rápida
- Alerta de fecha próxima

---

### 3. SubmissionsModal
**Ubicación:** `apps/frontend/src/apps/teacher/components/assignments/SubmissionsModal.tsx`

**Uso:**
```tsx
<SubmissionsModal
  isOpen={isSubmissionsModalOpen}
  onClose={() => setIsSubmissionsModalOpen(false)}
  assignment={selectedAssignment}
  submissions={submissions}
  loading={submissionsLoading}
  onGradeSubmission={handleGradeSubmission}
/>
```

**Características:**
- Filtros por estado (clicables)
- Búsqueda de estudiantes
- Tabla con estados visuales
- Resumen de progreso

---

## Flujo Completo

### Crear Asignación

1. Usuario click "Crear Asignación"
2. Modal abre con ImprovedAssignmentWizard
3. **Paso 1:** Llenar título, descripción, tipo
4. **Paso 2:** Seleccionar ejercicios (con preview)
5. **Paso 3:** Configurar fecha, intentos, puntos
6. **Paso 4:** Revisar resumen completo
7. Click "Crear" → API call → Cierra modal → Refresh lista

### Ver Entregas

1. Usuario click "Ver Entregas" en AssignmentCard
2. API call para obtener submissions
3. SubmissionsModal abre con filtros
4. Usuario puede:
   - Filtrar por estado (click en stat card)
   - Buscar estudiante
   - Click "Calificar" → Abre GradeSubmissionModal

### Calificar

1. Usuario click "Calificar" en SubmissionsModal
2. GradeSubmissionModal abre
3. Usuario asigna puntos y feedback
4. Click "Submit" → API call → Actualiza lista

---

## APIs Utilizadas

Todos los componentes usan las APIs existentes:

```typescript
// Del hook useAssignments
const {
  assignments,           // Lista de asignaciones
  exercises,            // Ejercicios disponibles
  loading,              // Estado de carga
  error,                // Error si existe
  createAssignment,     // Crear nueva asignación
  getSubmissions,       // Obtener entregas
  gradeSubmission,      // Calificar entrega
  refresh,              // Refrescar lista
} = useAssignments();
```

---

## Tipos

### Assignment
```typescript
interface Assignment {
  id: string;
  title: string;
  type?: 'practice' | 'quiz' | 'exam' | 'homework';
  status: 'draft' | 'active' | 'completed' | 'expired';
  dueDate?: string;
  end_date: string;
  exercise_ids: string[];
  assigned_to?: string[];
  totalSubmissions?: number;
  pendingReviews?: number;
  classroomName?: string;
  // ... más campos
}
```

### Submission
```typescript
interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  status: 'pending' | 'graded' | 'late';
  score?: number;
  submitted_at: string;
  graded_at?: string;
}
```

---

## Estados UI

### Loading
```tsx
{loading && (
  <div className="flex flex-col items-center justify-center py-20">
    <Loader2 className="w-12 h-12 text-detective-orange animate-spin mb-4" />
    <p className="text-detective-text-secondary">Cargando asignaciones...</p>
  </div>
)}
```

### Error
```tsx
{error && !loading && (
  <DetectiveCard variant="danger" className="mb-6">
    <div className="flex items-start gap-4">
      <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="text-lg font-bold text-detective-text mb-2">
          Error al cargar asignaciones
        </h3>
        <p className="text-detective-text-secondary mb-4">
          No se pudieron cargar las asignaciones. Por favor, intenta nuevamente.
        </p>
        <p className="text-sm text-red-400 mb-4 font-mono bg-red-950 p-2 rounded">
          {error.message}
        </p>
        <DetectiveButton onClick={refresh} variant="primary">
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </DetectiveButton>
      </div>
    </div>
  </DetectiveCard>
)}
```

### Empty
```tsx
{!loading && !error && assignments.length === 0 && (
  <DetectiveCard>
    <div className="text-center py-16">
      <Target className="w-20 h-20 text-detective-text-secondary mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-bold text-detective-text mb-2">No hay asignaciones</h3>
      <p className="text-detective-text-secondary mb-6">
        Comienza creando tu primera asignación para los estudiantes
      </p>
      <DetectiveButton variant="primary" onClick={() => setIsWizardOpen(true)}>
        <Plus className="w-5 h-5" />
        Crear Primera Asignación
      </DetectiveButton>
    </div>
  </DetectiveCard>
)}
```

---

## Personalización

### Colores de Estado
```typescript
// En AssignmentCard
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/20 text-green-500';
    case 'completed': return 'bg-blue-500/20 text-blue-500';
    case 'expired': return 'bg-red-500/20 text-red-500';
    case 'draft': return 'bg-gray-500/20 text-gray-500';
  }
};
```

### Colores de Tipo
```typescript
const getTypeColor = (type?: string) => {
  switch (type) {
    case 'practice': return 'bg-blue-500/20 text-blue-500';
    case 'quiz': return 'bg-purple-500/20 text-purple-500';
    case 'exam': return 'bg-red-500/20 text-red-500';
    case 'homework': return 'bg-green-500/20 text-green-500';
  }
};
```

---

## Testing

### Verificar TypeScript
```bash
cd apps/frontend
npx tsc --noEmit --skipLibCheck
```

### Probar Localmente
```bash
cd apps/frontend
npm run dev
```

Navegar a: `http://localhost:5173/teacher/assignments`

---

## TODOs Pendientes

### En Código
- [ ] Obtener `classroomId` desde contexto/props (línea 60 en TeacherAssignments.tsx)
- [ ] Cargar respuestas reales al calificar (línea 111 en TeacherAssignments.tsx)
- [ ] Calcular maxScore desde ejercicios (línea 113 en TeacherAssignments.tsx)
- [ ] Implementar send reminder (línea 153 en TeacherAssignments.tsx)

### Funcionalidades Futuras
- [ ] Bulk grading (calificar múltiples a la vez)
- [ ] Export submissions (CSV/Excel)
- [ ] Assignment templates
- [ ] Real-time notifications
- [ ] View detailed responses page

---

## Archivos Relacionados

### Componentes
```
apps/frontend/src/apps/teacher/components/assignments/
├── ImprovedAssignmentWizard.tsx (NUEVO)
├── AssignmentCard.tsx (NUEVO)
├── SubmissionsModal.tsx (NUEVO)
├── AssignmentWizard.tsx (VIEJO - puede deprecarse)
├── AssignmentCreator.tsx (VIEJO - puede deprecarse)
└── AssignmentList.tsx (VIEJO - puede deprecarse)
```

### Páginas
```
apps/frontend/src/apps/teacher/pages/
├── TeacherAssignments.tsx (ACTUALIZADO)
└── TeacherAssignmentsPage.tsx (Wrapper con layout)
```

### Hooks
```
apps/frontend/src/apps/teacher/hooks/
└── useAssignments.ts (Sin cambios)
```

### APIs
```
apps/frontend/src/services/api/teacher/
├── assignmentsApi.ts (Sin cambios)
└── index.ts (Sin cambios)
```

---

## Troubleshooting

### Error: Modal size="large" not found
**Fix:** Cambiar a `size="xl"` (ya corregido)

### Error: Imports no encontrados
**Fix:** Verificar que todos los componentes base existan:
- `@shared/components/base/DetectiveCard`
- `@shared/components/base/DetectiveButton`
- `@shared/components/common/Modal`
- `@shared/components/common/DataTable`

### Warning: classroomId is hardcoded
**Expected:** Es temporal, debe obtenerse desde contexto

---

## Soporte

Para más detalles ver:
- **Reporte completo:** `IMPLEMENTATION-REPORT-TEACHER-ASSIGNMENTS-IMPROVED-2025-11-24.md`
- **Comparación visual:** `TEACHER-ASSIGNMENTS-VISUAL-COMPARISON.md`
- **Código fuente:** `apps/frontend/src/apps/teacher/`

---

**Actualizado:** 2025-11-24
**Frontend-Agent**
