# ESPECIFICACION TECNICA - FASE 5B
## Migracion de Funcionalidades Students a Monitoring (Medio Riesgo)

**Fecha:** 2025-12-15
**Prioridad:** MEDIA
**Riesgo:** MEDIO
**Prerequisito:** FASE 5A completada
**Tiempo estimado de implementacion:** 4-6 horas

---

## 1. OBJETIVO

Migrar las funcionalidades UNICAS de `TeacherStudents` a `StudentMonitoringPanel` para que el usuario no pierda capacidades al eliminar la pagina de Estudiantes del sidebar.

---

## 2. FUNCIONALIDADES A MIGRAR

### 2.1 Funcionalidades de TeacherStudents que NO existen en Monitoring:

| Funcionalidad | En Students | En Monitoring | Accion |
|---------------|-------------|---------------|--------|
| Filtro por rendimiento (Alto/Medio/Bajo) | SI | NO | MIGRAR |
| Vista en tabla sorteable | SI | NO | AGREGAR COMO OPCION |
| Ordenamiento multi-campo | SI | NO | MIGRAR |
| Estadisticas por rendimiento | SI | NO | MIGRAR |
| Vista consolidada todas las aulas | SI | NO | EVALUAR |

### 2.2 Funcionalidades que ya existen en Monitoring:

| Funcionalidad | Estado |
|---------------|--------|
| Busqueda por nombre | OK |
| Filtro por estado (Active/Inactive/Offline) | OK |
| Vista en tarjetas | OK |
| Detalle de estudiante (modal) | OK |
| Auto-refresh | OK |
| Notificaciones toast | OK |

---

## 3. ARCHIVOS A MODIFICAR

### 3.1 StudentMonitoringPanel.tsx

**Ruta:** `/home/isem/workspace/projects/gamilit/apps/frontend/src/apps/teacher/components/monitoring/StudentMonitoringPanel.tsx`

#### 3.1.1 CAMBIOS EN INTERFACE StudentFilter

**CODIGO ACTUAL (types/index.ts o inline):**
```typescript
interface StudentFilter {
  search?: string;
  status?: ('active' | 'inactive' | 'offline')[];
}
```

**CODIGO PROPUESTO:**
```typescript
interface StudentFilter {
  search?: string;
  status?: ('active' | 'inactive' | 'offline' | 'in_exercise')[];
  performanceLevel?: ('high' | 'medium' | 'low')[];
}
```

#### 3.1.2 AGREGAR ESTADO PARA VISTA

**AGREGAR despues de useState existentes (linea ~20):**
```typescript
const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
const [sortField, setSortField] = useState<'name' | 'score' | 'completion' | 'activity'>('name');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
```

#### 3.1.3 AGREGAR FUNCION calculatePerformanceLevel

**AGREGAR antes de getStudentStatus (linea ~95):**
```typescript
// Calculate performance level based on score
const calculatePerformanceLevel = (student: StudentMonitoring): 'high' | 'medium' | 'low' => {
  const score = student.score_average || 0;
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
};
```

#### 3.1.4 AGREGAR ESTADISTICAS DE RENDIMIENTO

**AGREGAR despues de offlineCount (linea ~110):**
```typescript
// Performance stats
const highPerformanceCount = students.filter((s) => calculatePerformanceLevel(s) === 'high').length;
const mediumPerformanceCount = students.filter((s) => calculatePerformanceLevel(s) === 'medium').length;
const lowPerformanceCount = students.filter((s) => calculatePerformanceLevel(s) === 'low').length;
```

#### 3.1.5 AGREGAR FILTRO DE RENDIMIENTO

**AGREGAR despues del handleStatusFilter (linea ~93):**
```typescript
const handlePerformanceFilter = (level: 'high' | 'medium' | 'low') => {
  setFilters((prev) => {
    const currentLevels = prev.performanceLevel || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level];

    return {
      ...prev,
      performanceLevel: newLevels.length > 0 ? newLevels : undefined,
    };
  });
};
```

#### 3.1.6 AGREGAR FUNCION DE ORDENAMIENTO

**AGREGAR despues de handlePerformanceFilter:**
```typescript
const handleSort = (field: typeof sortField) => {
  if (sortField === field) {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField(field);
    setSortDirection('asc');
  }
};

// Apply sorting to students
const sortedStudents = useMemo(() => {
  return [...students].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = a.full_name.toLowerCase();
        bValue = b.full_name.toLowerCase();
        break;
      case 'score':
        aValue = a.score_average || 0;
        bValue = b.score_average || 0;
        break;
      case 'completion':
        aValue = a.progress_percentage || 0;
        bValue = b.progress_percentage || 0;
        break;
      case 'activity':
        aValue = a.last_activity ? new Date(a.last_activity).getTime() : 0;
        bValue = b.last_activity ? new Date(b.last_activity).getTime() : 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}, [students, sortField, sortDirection]);
```

#### 3.1.7 AGREGAR TARJETAS DE RENDIMIENTO AL GRID DE STATS

**MODIFICAR el grid de stats (linea ~146-204) para agregar:**
```typescript
{/* Performance Stats - Nueva fila */}
<div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-4">
  <DetectiveCard hoverable={false}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold text-green-500">{highPerformanceCount}</p>
        <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
          <TrendingUp className="h-3 w-3" />
          Alto Rendimiento
        </p>
      </div>
    </div>
  </DetectiveCard>

  <DetectiveCard hoverable={false}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold text-yellow-500">{mediumPerformanceCount}</p>
        <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
          <Minus className="h-3 w-3" />
          Rendimiento Medio
        </p>
      </div>
    </div>
  </DetectiveCard>

  <DetectiveCard hoverable={false}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold text-red-500">{lowPerformanceCount}</p>
        <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
          <TrendingDown className="h-3 w-3" />
          Bajo Rendimiento
        </p>
      </div>
    </div>
  </DetectiveCard>
</div>
```

#### 3.1.8 AGREGAR BOTONES DE FILTRO POR RENDIMIENTO

**AGREGAR despues de los botones de filtro por estado (linea ~235):**
```typescript
{/* Separador */}
<div className="h-8 w-px bg-gray-700 mx-2" />

{/* Filtros de rendimiento */}
<DetectiveButton
  variant={filters.performanceLevel?.includes('high') ? 'primary' : 'secondary'}
  onClick={() => handlePerformanceFilter('high')}
  size="sm"
>
  Alto
</DetectiveButton>
<DetectiveButton
  variant={filters.performanceLevel?.includes('medium') ? 'primary' : 'secondary'}
  onClick={() => handlePerformanceFilter('medium')}
  size="sm"
>
  Medio
</DetectiveButton>
<DetectiveButton
  variant={filters.performanceLevel?.includes('low') ? 'primary' : 'secondary'}
  onClick={() => handlePerformanceFilter('low')}
  size="sm"
>
  Bajo
</DetectiveButton>
```

#### 3.1.9 AGREGAR TOGGLE DE VISTA (TARJETAS/TABLA)

**AGREGAR despues del RefreshControl (linea ~142):**
```typescript
{/* View Toggle */}
<div className="flex gap-2">
  <DetectiveButton
    variant={viewMode === 'cards' ? 'primary' : 'secondary'}
    onClick={() => setViewMode('cards')}
    size="sm"
  >
    <LayoutGrid className="h-4 w-4" />
  </DetectiveButton>
  <DetectiveButton
    variant={viewMode === 'table' ? 'primary' : 'secondary'}
    onClick={() => setViewMode('table')}
    size="sm"
  >
    <List className="h-4 w-4" />
  </DetectiveButton>
</div>
```

#### 3.1.10 AGREGAR VISTA DE TABLA OPCIONAL

**AGREGAR despues del grid de cards (linea ~260), condicional:**
```typescript
{/* Vista Tabla (alternativa a cards) */}
{viewMode === 'table' ? (
  <DetectiveCard>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-detective-orange"
              onClick={() => handleSort('name')}
            >
              Nombre {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
              Estado
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-detective-orange"
              onClick={() => handleSort('score')}
            >
              Puntuacion {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-detective-orange"
              onClick={() => handleSort('completion')}
            >
              Completitud {sortField === 'completion' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
              Rendimiento
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-detective-orange"
              onClick={() => handleSort('activity')}
            >
              Ultima Actividad {sortField === 'activity' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((student) => (
            <tr
              key={student.id}
              className="border-b border-gray-800 hover:bg-detective-bg-secondary cursor-pointer"
              onClick={() => setSelectedStudent(student)}
            >
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-detective-text">{student.full_name}</p>
                  <p className="text-xs text-gray-400">{student.email}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                  getStudentStatus(student) === 'active' ? 'bg-green-500/20 text-green-500' :
                  getStudentStatus(student) === 'in_exercise' ? 'bg-blue-500/20 text-blue-500' :
                  getStudentStatus(student) === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {getStudentStatus(student) === 'active' && 'Activo'}
                  {getStudentStatus(student) === 'in_exercise' && 'En ejercicio'}
                  {getStudentStatus(student) === 'inactive' && 'Inactivo'}
                  {getStudentStatus(student) === 'offline' && 'Offline'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`font-bold ${
                  (student.score_average || 0) >= 80 ? 'text-green-500' :
                  (student.score_average || 0) >= 60 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {(student.score_average || 0).toFixed(1)}%
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-full bg-gray-700">
                    <div
                      className={`h-2 rounded-full ${
                        (student.progress_percentage || 0) >= 70 ? 'bg-green-500' :
                        (student.progress_percentage || 0) >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${student.progress_percentage || 0}%` }}
                    />
                  </div>
                  <span className="text-sm">{(student.progress_percentage || 0).toFixed(0)}%</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`rounded px-2 py-1 text-xs font-medium ${
                  calculatePerformanceLevel(student) === 'high' ? 'bg-green-500/20 text-green-500' :
                  calculatePerformanceLevel(student) === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {calculatePerformanceLevel(student) === 'high' && 'Alto'}
                  {calculatePerformanceLevel(student) === 'medium' && 'Medio'}
                  {calculatePerformanceLevel(student) === 'low' && 'Bajo'}
                </span>
              </td>
              <td className="px-4 py-3 text-detective-text-secondary">
                {student.last_activity
                  ? new Date(student.last_activity).toLocaleDateString('es-ES')
                  : 'Sin actividad'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </DetectiveCard>
) : (
  /* Vista Cards existente */
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {sortedStudents.map((student) => (
      <StudentStatusCard
        key={student.id}
        student={student}
        onClick={() => setSelectedStudent(student)}
      />
    ))}
  </div>
)}
```

---

## 4. IMPORTS ADICIONALES REQUERIDOS

**Agregar al inicio del archivo:**
```typescript
import {
  // ... imports existentes
  TrendingUp,
  TrendingDown,
  Minus,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useMemo } from 'react';
```

---

## 5. MODIFICAR useStudentMonitoring HOOK

**Ruta:** `/home/isem/workspace/projects/gamilit/apps/frontend/src/apps/teacher/hooks/useStudentMonitoring.ts`

**Agregar soporte para filtro de rendimiento en el hook si el filtrado se hace del lado cliente:**

```typescript
// Filtrar por rendimiento si se especifica
if (filters?.performanceLevel && filters.performanceLevel.length > 0) {
  filtered = filtered.filter((student) => {
    const level = calculatePerformanceLevel(student.score_average);
    return filters.performanceLevel!.includes(level);
  });
}
```

---

## 6. PLAN DE PRUEBAS

### 6.1 Pruebas Funcionales

```yaml
Prueba_1_Toggle_Vista:
  precondicion: "Login como teacher, navegar a /teacher/monitoring"
  pasos:
    - Click en icono de tabla
    - Verificar que se muestra la vista tabla
    - Click en icono de tarjetas
    - Verificar que se muestra la vista tarjetas
  resultado_esperado: "Cambio de vista sin perder datos"

Prueba_2_Filtro_Rendimiento:
  precondicion: "Login como teacher, navegar a /teacher/monitoring"
  pasos:
    - Click en boton "Alto"
    - Verificar que solo se muestran estudiantes con score >= 80
    - Click en boton "Bajo"
    - Verificar que solo se muestran estudiantes con score < 60
    - Click en ambos
    - Verificar que se muestran Alto y Bajo
  resultado_esperado: "Filtrado correcto por rendimiento"

Prueba_3_Ordenamiento_Tabla:
  precondicion: "Login como teacher, vista tabla activa"
  pasos:
    - Click en header "Puntuacion"
    - Verificar orden ascendente
    - Click de nuevo
    - Verificar orden descendente
    - Repetir para otros campos
  resultado_esperado: "Ordenamiento correcto multi-campo"

Prueba_4_Stats_Rendimiento:
  precondicion: "Login como teacher, clase con estudiantes"
  pasos:
    - Verificar que aparecen tarjetas de Alto/Medio/Bajo rendimiento
    - Verificar que los conteos son correctos
  resultado_esperado: "Estadisticas de rendimiento visibles y precisas"

Prueba_5_Funcionalidad_Existente:
  precondicion: "Login como teacher, navegar a /teacher/monitoring"
  pasos:
    - Verificar busqueda funciona
    - Verificar filtros de estado funcionan
    - Verificar auto-refresh funciona
    - Verificar toast notifications funcionan
    - Verificar modal de detalle funciona
  resultado_esperado: "Funcionalidad existente sin regresiones"
```

### 6.2 Criterios de Aceptacion

- [ ] Toggle de vista funciona correctamente
- [ ] Filtro por rendimiento funciona
- [ ] Ordenamiento en vista tabla funciona
- [ ] Estadisticas de rendimiento son precisas
- [ ] Funcionalidad existente sin regresiones
- [ ] Responsive en mobile
- [ ] No hay errores en consola

---

## 7. CONSIDERACIONES

### 7.1 Vista Consolidada de Todas las Aulas

La funcionalidad de ver TODOS los estudiantes de TODAS las aulas (que existe en TeacherStudents) NO se migrara en esta fase porque:

1. StudentMonitoringPanel requiere un `classroomId` especifico
2. El Dashboard permite seleccionar una clase
3. Para ver todos los estudiantes, el usuario puede seleccionar "Todas las clases" en TeacherProgressPage

**Alternativa futura:** Crear un componente AllStudentsView que agregue datos de todas las aulas.

### 7.2 Rendimiento

El ordenamiento y filtrado se hace del lado cliente, lo cual es aceptable para:
- Clases con < 100 estudiantes
- Si hay clases mas grandes, considerar paginacion server-side

---

## 8. ROLLBACK

En caso de necesitar revertir:
1. Restaurar StudentMonitoringPanel.tsx al estado anterior
2. Restaurar useStudentMonitoring.ts si fue modificado
3. Re-agregar "Estudiantes" al sidebar (revertir FASE 5A parcialmente)

---

**Estado:** LISTO PARA IMPLEMENTAR
**Prerequisitos:** FASE 5A completada
**Siguiente fase:** FASE 5C (Fusion Analytics)

