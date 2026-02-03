# Hook: useClassroomsList

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Ubicacion:** `apps/frontend/src/apps/admin/hooks/useClassroomsList.ts`

---

## PROPOSITO

Hook simple y especializado para obtener lista de aulas (classrooms) para selectores en el modulo de progreso administrativo. Reemplaza datos mock con datos reales del API.

---

## API

### Parametros de Entrada

```typescript
interface UseClassroomsListParams {
  schoolId?: string;      // Filtrar por institucion especifica
  enabled?: boolean;      // Control de ejecucion (default: true)
}
```

### Retorno

```typescript
interface UseClassroomsListReturn {
  classrooms: ClassroomBasic[];  // Lista de aulas
  isLoading: boolean;             // Estado de carga
  error: Error | null;            // Error si aplica
  refetch: () => void;            // Funcion para recargar
}
```

---

## CONFIGURACION DE REACT QUERY

| Configuracion | Valor |
|---------------|-------|
| Query Key | `['admin', 'classrooms', schoolId]` |
| staleTime | 5 minutos |
| gcTime | 10 minutos |
| refetchOnFocus | false |
| retry | 2 intentos |

---

## EJEMPLO DE USO

### Basico

```typescript
import { useClassroomsList } from '../hooks/useClassroomsList';

function ClassroomSelector() {
  const { classrooms, isLoading, error } = useClassroomsList();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <select>
      {classrooms.map(classroom => (
        <option key={classroom.id} value={classroom.id}>
          {classroom.name}
        </option>
      ))}
    </select>
  );
}
```

### Con Filtro por Institucion

```typescript
function ClassroomSelectorBySchool({ schoolId }: { schoolId: string }) {
  const { classrooms, isLoading, error, refetch } = useClassroomsList({
    schoolId,
    enabled: !!schoolId
  });

  // Solo ejecuta query cuando schoolId esta disponible

  return (
    <div>
      <button onClick={() => refetch()}>Actualizar</button>
      <ClassroomList classrooms={classrooms} />
    </div>
  );
}
```

### Control Manual de Ejecucion

```typescript
function ConditionalClassrooms() {
  const [shouldFetch, setShouldFetch] = useState(false);

  const { classrooms, isLoading } = useClassroomsList({
    enabled: shouldFetch
  });

  return (
    <div>
      <button onClick={() => setShouldFetch(true)}>
        Cargar Aulas
      </button>
      {isLoading && <Spinner />}
      {classrooms.length > 0 && <ClassroomList classrooms={classrooms} />}
    </div>
  );
}
```

---

## DEPENDENCIAS

| Dependencia | Uso |
|-------------|-----|
| @tanstack/react-query | Gestion de queries |
| @/services/api/adminAPI | Cliente API |
| @/services/api/adminTypes | Tipos (ClassroomBasic) |

---

## TIPOS RELACIONADOS

### ClassroomBasic

```typescript
interface ClassroomBasic {
  id: string;
  name: string;
  grade?: string;
  section?: string;
  schoolId?: string;
  teacherId?: string;
  studentCount?: number;
  isActive?: boolean;
}
```

---

## NOTAS DE IMPLEMENTACION

1. **Cache inteligente:** El query se invalida automaticamente cuando cambia `schoolId`
2. **Fallback a array vacio:** Si el API falla, retorna array vacio en lugar de undefined
3. **Retry limitado:** Maximo 2 reintentos para evitar sobrecarga

---

## REFERENCIAS

- `AdminProgressPage.tsx` - Pagina que usa este hook
- `adminAPI.ts` - Cliente API
- `adminTypes.ts` - Definiciones de tipos

---

**Ultima actualizacion:** 2025-12-18
