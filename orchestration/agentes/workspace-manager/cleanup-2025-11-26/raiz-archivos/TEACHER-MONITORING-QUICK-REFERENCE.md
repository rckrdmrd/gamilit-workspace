# QUICK REFERENCE: Teacher Monitoring v2.0

**Para:** Desarrolladores Frontend
**Última actualización:** 2025-11-24

---

## 🚀 INICIO RÁPIDO

### Usar el Hook Mejorado

```typescript
import { useStudentMonitoring } from '@apps/teacher/hooks/useStudentMonitoring';

function MyComponent() {
  const {
    students,              // StudentMonitoring[]
    loading,               // boolean
    error,                 // Error | null
    refreshInterval,       // 0 | 15000 | 30000 | 60000
    setRefreshInterval,    // (interval: RefreshInterval) => void
    refresh,               // () => Promise<void>
    lastUpdate,            // Date | null
  } = useStudentMonitoring(classroomId, filters, { defaultInterval: 30000 });

  return (
    // Tu componente aquí
  );
}
```

---

## 📦 COMPONENTES

### RefreshControl

```typescript
import { RefreshControl } from '@apps/teacher/components/monitoring/RefreshControl';

<RefreshControl
  interval={refreshInterval}
  onIntervalChange={setRefreshInterval}
  onRefresh={refresh}
  loading={loading}
  lastUpdate={lastUpdate}
/>
```

**Props:**
- `interval`: RefreshInterval (0 | 15000 | 30000 | 60000)
- `onIntervalChange`: (interval: RefreshInterval) => void
- `onRefresh`: () => void
- `loading?`: boolean
- `lastUpdate`: Date | null

---

### StudentStatusCard (Mejorado)

```typescript
import { StudentStatusCard } from '@apps/teacher/components/monitoring/StudentStatusCard';

<StudentStatusCard
  student={student}
  onClick={() => handleStudentClick(student)}
/>
```

**Cambios visuales:**
- Borde lateral de color según status
- Badge con icono y descripción
- Sección de ejercicio mejorada

---

### Toast Notifications

```typescript
import { useToast, ToastContainer } from '@shared/components/base/Toast';

function MyComponent() {
  const { toasts, showToast } = useToast();

  const handleEvent = () => {
    showToast({
      type: 'success',
      title: 'Ejercicio completado',
      message: 'Juan Pérez completó un ejercicio',
      duration: 4000,
    });
  };

  return (
    <>
      <ToastContainer toasts={toasts} position="top-right" />
      {/* Tu contenido */}
    </>
  );
}
```

---

## 🎨 STATUS LOGIC

### Criterios de Status

```typescript
function getStudentStatus(student: StudentMonitoring): Status {
  const now = new Date();
  const last = new Date(student.last_activity);
  const diffMins = Math.floor((now.getTime() - last.getTime()) / 60000);

  if (diffMins < 5) {
    return 'active';          // Verde - Activity icon
  }

  if (student.current_exercise && diffMins < 30) {
    return 'in_exercise';     // Azul - BookOpen icon
  }

  if (diffMins >= 30) {
    return 'offline';         // Rojo - Dot icon
  }

  return 'inactive';          // Gris - Dot icon
}
```

---

## 🔧 TIPOS DE DATOS

### RefreshInterval

```typescript
export type RefreshInterval = 0 | 15000 | 30000 | 60000;

// Opciones disponibles:
// 0      → Manual (sin auto-refresh)
// 15000  → 15 segundos
// 30000  → 30 segundos (default)
// 60000  → 60 segundos
```

### StudentMonitoring

```typescript
interface StudentMonitoring {
  id: string;
  full_name: string;
  email: string;
  status: 'active' | 'inactive' | 'offline';
  current_module: string | null;
  current_exercise: string | null;
  last_activity: string;                    // ISO date
  progress_percentage: number;
  score_average: number;
  time_spent_minutes: number;
  exercises_completed: number;
  exercises_total: number;
}
```

---

## ⚡ PATRONES COMUNES

### Detectar Eventos de Estudiantes

```typescript
const previousStudentsRef = useRef<StudentMonitoring[]>([]);

useEffect(() => {
  if (!previousStudentsRef.current.length) {
    previousStudentsRef.current = students;
    return;
  }

  students.forEach((student) => {
    const prevStudent = previousStudentsRef.current.find(
      (s) => s.id === student.id
    );
    if (!prevStudent) return;

    // Detectar ejercicio completado
    if (student.exercises_completed > prevStudent.exercises_completed) {
      showToast({
        type: 'success',
        title: 'Ejercicio completado',
        message: `${student.full_name} completó un ejercicio`,
      });
    }
  });

  previousStudentsRef.current = students;
}, [students, showToast]);
```

---

### Cleanup de Intervalos

```typescript
const intervalRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  // Limpiar interval anterior
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  // Crear nuevo interval si no es manual
  if (refreshInterval > 0) {
    intervalRef.current = setInterval(() => {
      fetchData();
    }, refreshInterval);
  }

  // Cleanup al desmontar
  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, [refreshInterval]);
```

---

### Countdown Timer

```typescript
const [countdown, setCountdown] = useState(0);

useEffect(() => {
  if (interval === 0 || !lastUpdate) {
    setCountdown(0);
    return;
  }

  const updateCountdown = () => {
    const now = new Date();
    const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
    const timeUntilNext = interval - timeSinceUpdate;
    const secondsRemaining = Math.max(0, Math.ceil(timeUntilNext / 1000));
    setCountdown(secondsRemaining);
  };

  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);

  return () => clearInterval(timer);
}, [interval, lastUpdate]);
```

---

## 🎨 ESTILOS

### Borde de Color Según Status

```typescript
const statusInfo = getStatusInfo(student);

<DetectiveCard
  className={`border-l-4 ${statusInfo.color}`}
>
  {/* contenido */}
</DetectiveCard>
```

### Badge con Icono

```typescript
<div className={`
  flex items-center gap-2 px-3 py-1.5 rounded-lg
  ${statusInfo.bgColor} bg-opacity-10
  border ${statusInfo.color}
`}>
  <span className={statusInfo.textColor}>
    {statusInfo.icon}
  </span>
  <span className={`text-xs font-semibold ${statusInfo.textColor}`}>
    {statusInfo.label}
  </span>
</div>
```

---

## 🐛 DEBUGGING

### Verificar Intervalos Activos

```typescript
// En DevTools Console:
console.log('Interval active:', intervalRef.current !== null);
console.log('Refresh interval:', refreshInterval);
console.log('Last update:', lastUpdate);
```

### Log de Eventos

```typescript
useEffect(() => {
  console.log('[StudentMonitoring] Students updated:', students.length);
  console.log('[StudentMonitoring] Previous count:', previousStudentsRef.current.length);
}, [students]);
```

### Verificar Memory Leaks

```typescript
// Componente de prueba
function TestComponent() {
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
      console.log('Component unmounted - cleanup ejecutado');
    };
  }, []);

  // ...
}
```

---

## ⚠️ GOTCHAS

### 1. No usar `setInterval` sin cleanup
```typescript
// ❌ MAL
useEffect(() => {
  setInterval(() => {
    fetchData();
  }, 1000);
}, []); // Memory leak!

// ✅ BIEN
useEffect(() => {
  const timer = setInterval(() => {
    fetchData();
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

### 2. Comparación de arrays con useEffect
```typescript
// ❌ MAL - infinite loop
useEffect(() => {
  // ...
}, [students]); // Array cambia en cada render

// ✅ BIEN
const previousStudentsRef = useRef([]);
useEffect(() => {
  // Comparar con ref
  previousStudentsRef.current = students;
}, [students]);
```

### 3. Toast notifications duplicadas
```typescript
// ❌ MAL
useEffect(() => {
  students.forEach(student => {
    showToast({ ... }); // Se ejecuta en cada render!
  });
}, [students, showToast]);

// ✅ BIEN
useEffect(() => {
  if (!previousStudentsRef.current.length) return;

  // Solo mostrar toast si realmente cambió
  students.forEach(student => {
    const prev = previousStudentsRef.current.find(s => s.id === student.id);
    if (prev && student.exercises_completed > prev.exercises_completed) {
      showToast({ ... });
    }
  });
}, [students, showToast]);
```

---

## 📚 RECURSOS

### Archivos Relacionados
```
apps/frontend/src/apps/teacher/
├── hooks/useStudentMonitoring.ts
├── components/monitoring/
│   ├── RefreshControl.tsx
│   ├── StudentMonitoringPanel.tsx
│   └── StudentStatusCard.tsx
└── pages/TeacherMonitoringPage.tsx
```

### Documentación Completa
- [IMPLEMENTATION-REPORT](./IMPLEMENTATION-REPORT-TEACHER-MONITORING-IMPROVEMENTS-2025-11-24.md)
- [VISUAL-GUIDE](./TEACHER-MONITORING-VISUAL-GUIDE.md)
- [FILES-SUMMARY](./TEACHER-MONITORING-FILES-SUMMARY.md)

### APIs Backend
- `GET /api/teacher/classrooms/:id/students`
- Query params: `status`, `sort_by`, `sort_order`

---

## 🧪 TESTING SNIPPETS

### Test de Hook

```typescript
import { renderHook, act } from '@testing-library/react';
import { useStudentMonitoring } from './useStudentMonitoring';

test('should update countdown', async () => {
  const { result } = renderHook(() =>
    useStudentMonitoring('classroom-1', {}, { defaultInterval: 15000 })
  );

  expect(result.current.refreshInterval).toBe(15000);

  act(() => {
    result.current.setRefreshInterval(30000);
  });

  expect(result.current.refreshInterval).toBe(30000);
});
```

### Test de Componente

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { RefreshControl } from './RefreshControl';

test('should show dropdown on click', () => {
  const mockOnChange = jest.fn();

  render(
    <RefreshControl
      interval={30000}
      onIntervalChange={mockOnChange}
      onRefresh={jest.fn()}
      lastUpdate={new Date()}
    />
  );

  fireEvent.click(screen.getByText('30 segundos'));
  expect(screen.getByText('Manual')).toBeInTheDocument();
});
```

---

## 💡 TIPS & TRICKS

### Optimización: Evitar re-renders

```typescript
// Usar useCallback para funciones que se pasan como props
const handleRefresh = useCallback(async () => {
  await refresh();
}, [refresh]);

// Usar useMemo para cálculos costosos
const filteredStudents = useMemo(() => {
  return students.filter(s => s.status === 'active');
}, [students]);
```

### Debugging: React DevTools

```typescript
// Agregar displayName para mejor debugging
RefreshControl.displayName = 'RefreshControl';
StudentStatusCard.displayName = 'StudentStatusCard';
```

### Performance: Lazy loading

```typescript
// Si tienes muchos estudiantes, considera virtualización
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={3}
  columnWidth={300}
  height={600}
  rowCount={Math.ceil(students.length / 3)}
  rowHeight={200}
  width={1000}
>
  {({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      <StudentStatusCard student={students[rowIndex * 3 + columnIndex]} />
    </div>
  )}
</FixedSizeGrid>
```

---

**Última actualización:** 2025-11-24
**Mantenedor:** Frontend-Agent
**Versión:** 2.0
