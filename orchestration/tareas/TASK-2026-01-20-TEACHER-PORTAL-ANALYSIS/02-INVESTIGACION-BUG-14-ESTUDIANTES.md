# Investigación: Bug de 14 Estudiantes
## TASK-2026-01-20-TEACHER-PORTAL-ANALYSIS - FASE 1-A

**Fecha:** 2026-01-20
**Estado:** EN VERIFICACIÓN

---

## RESUMEN EJECUTIVO

Después de una investigación exhaustiva del código fuente (frontend y backend), **NO se encontró ningún límite hardcodeado de 14 estudiantes**.

**Conclusión Preliminar:** El problema NO está en el código. Probablemente se debe a:
1. La cantidad real de estudiantes en la tabla `classroom_members` es 14
2. Un filtro de `status = 'active'` que excluye estudiantes
3. Estudiantes no asignados al classroom específico

---

## ANÁLISIS DEL CÓDIGO

### Frontend

**Archivo:** `/apps/frontend/src/apps/teacher/hooks/useClassrooms.ts:57-65`

```typescript
// CORR-2025-12-18: Agregado limit: 100 para obtener todos los estudiantes
const fetchClassroomStudents = useCallback(async (classroomId: string) => {
  try {
    const response = await classroomsApi.getClassroomStudents(classroomId, { limit: 100 });
    setStudents(response.data);
  } catch (err) {
    console.error('[useClassrooms] Error fetching students:', err);
  }
}, []);
```

**Resultado:** ✅ Frontend solicita correctamente `limit: 100`

---

### Frontend API

**Archivo:** `/apps/frontend/src/services/api/teacher/classroomsApi.ts:263-277`

```typescript
async getClassroomStudents(
  classroomId: string,
  query?: GetClassroomStudentsQueryDto,
): Promise<PaginatedResponse<StudentMonitoring>> {
  try {
    const { data } = await apiClient.get<PaginatedResponse<StudentMonitoring>>(
      API_ENDPOINTS.teacher.classroomStudents(classroomId),
      { params: query },
    );
    return data;
  } catch (error) {
    console.error('[ClassroomsAPI] Error fetching classroom students:', error);
    throw error;
  }
}
```

**Resultado:** ✅ API pasa correctamente los parámetros al endpoint

---

### Backend Controller

**Archivo:** `/apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts:310-355`

```typescript
@Get(':id/students')
async getClassroomStudents(
  @Param('id', new ParseUUIDPipe()) id: string,
  @Query() query: GetClassroomStudentsQueryDto,
  @Request() req: AuthRequest,
): Promise<PaginatedStudentsResponseDto> {
  const teacherId = req.user!.id;
  return this.classroomsCrudService.getClassroomStudents(id, teacherId, query);
}
```

**Swagger Define:** `limit` type Number, example 20

**Resultado:** ✅ Controller recibe y pasa el query correctamente

---

### Backend Service

**Archivo:** `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts:261-394`

```typescript
async getClassroomStudents(
  classroomId: string,
  teacherId: string,
  query: GetClassroomStudentsQueryDto,
): Promise<PaginatedStudentsResponseDto> {
  // Validar acceso
  await this.validateTeacherAccess(teacherId, classroomId);

  // LÍNEA CLAVE: limit por defecto es 100
  const { page = 1, limit = 100, search, status, sort_by = 'name', sort_order = 'asc' } = query;

  // FIX: Obtener estudiantes con búsqueda aplicada ANTES de paginación usando raw SQL
  const skip = (page - 1) * limit;
  const { students: members, total } = await this.getStudentsWithSearch(
    classroomId,
    search,
    status,
    skip,
    limit,
  );
  // ...
}
```

**Resultado:** ✅ Service usa `limit = 100` como default y respeta el parámetro

---

### SQL Query (Raw)

**Archivo:** `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts:912-987`

```sql
SELECT
  cm.student_id,
  cm.status,
  -- ...más campos
FROM social_features.classroom_members cm
LEFT JOIN auth_management.profiles p ON p.id = cm.student_id
LEFT JOIN auth.users u ON u.id = p.user_id
WHERE cm.classroom_id = $1
  AND ($2::text IS NULL OR $2 = ''
       OR LOWER(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')) LIKE LOWER('%' || $2 || '%')
       OR LOWER(COALESCE(u.email, '')) LIKE LOWER('%' || $2 || '%'))
  AND ($3::text IS NULL OR $3 = 'all' OR cm.status = $3)
ORDER BY COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')
LIMIT $4 OFFSET $5
```

**Resultado:** ✅ Query usa parámetro $4 para LIMIT (no hardcodeado)

---

### Búsqueda de "LIMIT 14"

```bash
grep -r "LIMIT.*14" apps/
# Resultado: No files found
```

**Resultado:** ✅ No existe LIMIT 14 hardcodeado en ningún archivo

---

## HIPÓTESIS PROBABLE

Dado que el código es correcto, el problema debe estar en uno de estos escenarios:

### Hipótesis 1: Solo hay 14 estudiantes en el classroom

La tabla `classroom_members` para el classroom específico solo tiene 14 registros.

**Verificación requerida:**
```sql
SELECT COUNT(*)
FROM social_features.classroom_members
WHERE classroom_id = '{classroom_id}';
```

### Hipótesis 2: Filtro de status excluye estudiantes

Solo hay 14 estudiantes con `status = 'active'`, los demás tienen otro status (inactive, suspended, withdrawn).

**Verificación requerida:**
```sql
SELECT status, COUNT(*)
FROM social_features.classroom_members
WHERE classroom_id = '{classroom_id}'
GROUP BY status;
```

### Hipótesis 3: JOIN con profiles falla

Algunos estudiantes no tienen profile asociado y el JOIN los excluye.

**Verificación requerida:**
```sql
SELECT
  cm.student_id,
  p.id AS profile_id,
  CASE WHEN p.id IS NULL THEN 'MISSING' ELSE 'OK' END as status
FROM social_features.classroom_members cm
LEFT JOIN auth_management.profiles p ON p.id = cm.student_id
WHERE cm.classroom_id = '{classroom_id}';
```

### Hipótesis 4: Datos de producción vs testing

Los seeds solo crean 3 usuarios de testing. Los >30 estudiantes mencionados deben haberse creado manualmente en producción/staging.

**Verificación requerida:**
```sql
-- Total usuarios con rol student
SELECT COUNT(*)
FROM auth_management.profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.role = 'student';
```

---

## ACCIONES REQUERIDAS

### Acción 1: Verificar Datos en BD (Usuario)

El usuario debe ejecutar las siguientes queries en la base de datos de staging/producción:

```sql
-- 1. Contar estudiantes en el classroom
SELECT COUNT(*) as total_students
FROM social_features.classroom_members
WHERE classroom_id = '{CLASSROOM_ID_AQUÍ}';

-- 2. Ver distribución por status
SELECT status, COUNT(*) as count
FROM social_features.classroom_members
WHERE classroom_id = '{CLASSROOM_ID_AQUÍ}'
GROUP BY status;

-- 3. Ver si hay estudiantes sin profile
SELECT
  COUNT(*) FILTER (WHERE p.id IS NOT NULL) as with_profile,
  COUNT(*) FILTER (WHERE p.id IS NULL) as without_profile
FROM social_features.classroom_members cm
LEFT JOIN auth_management.profiles p ON p.id = cm.student_id
WHERE cm.classroom_id = '{CLASSROOM_ID_AQUÍ}';

-- 4. Ver total de estudiantes en el sistema
SELECT COUNT(*) as total_students_system
FROM auth_management.profiles
WHERE role = 'student';
```

### Acción 2: Si hay más de 14 en BD pero frontend muestra 14

Verificar en Network tab del navegador:
1. Abrir DevTools → Network
2. Navegar a la página Progress
3. Buscar el request a `/teacher/classrooms/{id}/students`
4. Ver el response completo
5. Verificar `pagination.total` y `data.length`

### Acción 3: Si `pagination.total` > 14 pero `data.length` = 14

Significa que hay un problema de paginación en el frontend que no carga todas las páginas.

**Posible solución:** Implementar paginación infinita o botón "Cargar más"

---

## CONCLUSIÓN

**El código es correcto.** No hay LIMIT 14 hardcodeado.

**Próximo paso:** Verificar los datos reales en la base de datos siguiendo las queries de Acción 1.

Si los datos confirman que hay >14 estudiantes:
1. Verificar que el endpoint retorna `pagination.total` correcto
2. Verificar que el frontend no está filtrando en memoria
3. Implementar paginación infinita si es necesario

---

**Documento creado:** 2026-01-20
**Investigador:** Sistema de Análisis Automático
