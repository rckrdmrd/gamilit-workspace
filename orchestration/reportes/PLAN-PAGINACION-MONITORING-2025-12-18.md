# PLAN DE IMPLEMENTACION: Paginacion Completa - Teacher Monitoring

**Fecha:** 2025-12-18
**Referencia:** ANALISIS-PAGINACION-MONITORING-2025-12-18.md
**Proyecto:** Gamilit

---

## ORDEN DE IMPLEMENTACION

### PASO 1: Crear componente StudentPagination (NUEVO)

**Archivo:** `apps/frontend/src/apps/teacher/components/monitoring/StudentPagination.tsx`

**Funcionalidad:**
- Selector de limite por pagina (10, 25, 50, 100)
- Botones de navegacion (anterior, siguiente)
- Numeros de pagina clickeables
- Info de registros mostrados

**Codigo propuesto:**
```typescript
interface StudentPaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const LIMIT_OPTIONS = [10, 25, 50, 100];
```

---

### PASO 2: Modificar hook useStudentMonitoring

**Archivo:** `apps/frontend/src/apps/teacher/hooks/useStudentMonitoring.ts`

**Cambios:**
1. Agregar estados de paginacion: `page`, `limit`, `pagination`
2. Agregar funciones: `setPage`, `setPageLimit`, `goToFirstPage`
3. Pasar page y limit en la query a la API
4. Almacenar respuesta de paginacion
5. Resetear a pagina 1 al cambiar filtros o limite

**Nuevo return del hook:**
```typescript
return {
  students,
  loading,
  error,
  // Paginacion
  page,
  limit,
  pagination,
  setPage,
  setPageLimit,
  // Refresh
  refreshInterval,
  setRefreshInterval,
  refresh,
  lastUpdate,
};
```

---

### PASO 3: Modificar StudentMonitoringPanel

**Archivo:** `apps/frontend/src/apps/teacher/components/monitoring/StudentMonitoringPanel.tsx`

**Cambios:**
1. Importar StudentPagination
2. Obtener props de paginacion del hook
3. Agregar StudentPagination despues de la tabla/cards
4. Remover ordenamiento client-side (usar server-side)
5. Actualizar stats totales con `pagination.total`

**Ubicacion del componente:**
- Al final de la vista de tabla/cards
- Antes del modal de detalle

---

### PASO 4: Opcional - Revertir limite hardcoded en useClassrooms

**Archivo:** `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts`

Si se usa este hook en otras partes, considerar si tambien necesita paginacion.

---

## ESPECIFICACION TECNICA

### StudentPagination.tsx

```typescript
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';

interface StudentPaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const LIMIT_OPTIONS = [10, 25, 50, 100];

export function StudentPagination({
  page,
  limit,
  total,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  loading,
  onPageChange,
  onLimitChange,
}: StudentPaginationProps) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-gray-700 bg-detective-bg-secondary px-4 py-3">
      {/* Info y Selector de Limite */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-detective-text-secondary">
          Mostrando <span className="font-semibold text-detective-text">{startItem}</span> -{' '}
          <span className="font-semibold text-detective-text">{endItem}</span> de{' '}
          <span className="font-semibold text-detective-text">{total}</span> estudiantes
        </span>

        <div className="flex items-center gap-2">
          <span className="text-sm text-detective-text-secondary">Por pagina:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={loading}
            className="rounded-lg border border-gray-600 bg-detective-bg px-2 py-1 text-sm text-detective-text"
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Controles de Navegacion */}
      <div className="flex items-center gap-2">
        <DetectiveButton
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </DetectiveButton>

        {/* Numeros de pagina */}
        <div className="flex items-center gap-1">
          {generatePageNumbers(page, totalPages).map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-detective-text-secondary">...</span>
            ) : (
              <DetectiveButton
                key={pageNum}
                variant={page === pageNum ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onPageChange(pageNum as number)}
                disabled={loading}
              >
                {pageNum}
              </DetectiveButton>
            )
          ))}
        </div>

        <DetectiveButton
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </DetectiveButton>
      </div>
    </div>
  );
}

// Helper para generar numeros de pagina con ellipsis
function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}
```

---

### useStudentMonitoring.ts (Modificaciones)

```typescript
// Nuevos estados
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(25);
const [pagination, setPagination] = useState<PaginationInfo | null>(null);

// Modificar fetchStudents
const query: GetClassroomStudentsQueryDto = {
  page,
  limit,
  ...(filters?.status?.[0] && { status: filters.status[0] as 'active' | 'inactive' }),
};

const response = await classroomsApi.getClassroomStudents(classroomId, query);
setStudents(response.data || []);
setPagination(response.pagination);

// Funcion para cambiar limite (resetea a pagina 1)
const setPageLimit = useCallback((newLimit: number) => {
  setLimit(newLimit);
  setPage(1); // Resetear a primera pagina
}, []);

// Actualizar return
return {
  students,
  loading,
  error,
  page,
  limit,
  pagination,
  setPage,
  setPageLimit,
  refreshInterval,
  setRefreshInterval,
  refresh,
  lastUpdate,
};
```

---

### StudentMonitoringPanel.tsx (Modificaciones)

```typescript
// Imports adicionales
import { StudentPagination } from './StudentPagination';

// Obtener datos del hook
const {
  students,
  loading,
  error,
  page,
  limit,
  pagination,
  setPage,
  setPageLimit,
  refreshInterval,
  setRefreshInterval,
  refresh,
  lastUpdate,
} = useStudentMonitoring(classroomId, filters);

// En stats overview, usar pagination.total en lugar de students.length
<p className="text-2xl font-bold text-detective-text">
  {pagination?.total ?? students.length}
</p>

// Agregar StudentPagination al final
{pagination && (
  <StudentPagination
    page={page}
    limit={limit}
    total={pagination.total}
    totalPages={pagination.totalPages}
    hasNextPage={pagination.hasNextPage}
    hasPreviousPage={pagination.hasPreviousPage}
    loading={loading}
    onPageChange={setPage}
    onLimitChange={setPageLimit}
  />
)}
```

---

## VALIDACIONES POST-IMPLEMENTACION

1. [ ] Con 10 estudiantes, paginacion muestra "1 de 1" paginas
2. [ ] Con 44 estudiantes y limit=25, muestra "1-25 de 44" y 2 paginas
3. [ ] Cambiar a pagina 2 muestra estudiantes 26-44
4. [ ] Cambiar limite de 25 a 10 resetea a pagina 1
5. [ ] Aplicar filtro de status resetea a pagina 1
6. [ ] Stats overview muestra total real (44) no solo pagina actual (25)
7. [ ] Boton "anterior" deshabilitado en pagina 1
8. [ ] Boton "siguiente" deshabilitado en ultima pagina
9. [ ] Loading spinner al cambiar de pagina

---

## RIESGOS

| Riesgo | Impacto | Mitigacion |
|--------|---------|------------|
| Stats calculados client-side incorrectos | Medio | Obtener stats del backend separadamente |
| Filtrado performance client-side | Bajo | Mover todo filtrado a server-side |
| Orden no consistente entre paginas | Medio | Siempre pasar sort_by y sort_order |

---

## ARCHIVOS A MODIFICAR

| Orden | Archivo | Accion |
|-------|---------|--------|
| 1 | monitoring/StudentPagination.tsx | CREAR |
| 2 | hooks/useStudentMonitoring.ts | MODIFICAR |
| 3 | monitoring/StudentMonitoringPanel.tsx | MODIFICAR |
| 4 | monitoring/index.ts (si existe) | EXPORTAR |

---

**Siguiente Fase:** Validacion del plan contra el analisis y dependencias.
