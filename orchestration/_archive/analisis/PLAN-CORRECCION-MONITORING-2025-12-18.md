# PLAN DE CORRECCIÓN: Teacher Monitoring

**Fecha:** 2025-12-18
**Caso:** Usuario no visible + Filtros/Paginación defectuosos
**Analista:** Requirements-Analyst
**Estado:** ✅ IMPLEMENTADO

---

## 1. RESUMEN EJECUTIVO

### Problema Reportado
- Usuario `rckrdmrd@gmail.com` no aparece en Teacher Monitoring
- Filtros, paginación y búsqueda no funcionan correctamente

### Causa Raíz Identificada
1. **BUG-001**: Búsqueda se aplica DESPUÉS de la paginación (no encuentra usuarios en otras páginas)
2. **BUG-002**: Total de registros no refleja resultados de búsqueda
3. **BUG-003**: Filtro de status solo envía primer elemento al backend

### Estado del Usuario
- ✅ Usuario existe en `auth.users` (ID: `aba6d60d-af33-4aad-b944-e702d36d75e6`)
- ✅ Profile existe en `auth_management.profiles` (role: student, status: active)
- ✅ Asignado al classroom DEFAULT (ID: `00000000-0000-0000-0000-000000000001`)
- ✅ Tiene 1 ejercicio completado
- ⚠️ Posición 47 de 47 estudiantes (página 2 con límite 25)

---

## 2. ARCHIVOS MODIFICADOS

### 2.1 Backend: teacher-classrooms-crud.service.ts

| Parámetro | Valor |
|-----------|-------|
| **Archivo** | `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` |
| **Tipo de Cambio** | Refactorización + Nuevo Método |
| **Prioridad** | P0 - Crítico |
| **Estado** | ✅ Implementado |

#### Cambios Implementados:

**A) Nuevo Método `getStudentsWithSearch()` (Líneas 865-940)**

```typescript
/**
 * Obtiene estudiantes con búsqueda aplicada ANTES de paginación usando raw SQL
 * FIX-2025-12-18: Resuelve limitación de TypeORM con JOINs cross-schema
 */
private async getStudentsWithSearch(
  classroomId: string,
  search: string | undefined,
  status: string | undefined,
  skip: number,
  limit: number,
): Promise<{
  students: Array<{
    student_id: string;
    status: string;
    enrollment_date: Date;
    attendance_percentage: number | null;
    teacher_notes: string | null;
    updated_at: Date;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email: string | null;
  }>;
  total: number;
}>
```

**SQL Implementado:**
```sql
-- Query para contar total (con filtros aplicados)
SELECT COUNT(*) as total
FROM social_features.classroom_members cm
LEFT JOIN auth_management.profiles p ON p.user_id = cm.student_id
LEFT JOIN auth.users u ON u.id = cm.student_id
WHERE cm.classroom_id = $1
  AND ($2::text IS NULL OR $2 = ''
       OR LOWER(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, ''))
          LIKE LOWER('%' || $2 || '%')
       OR LOWER(COALESCE(u.email, '')) LIKE LOWER('%' || $2 || '%'))
  AND ($3::text IS NULL OR $3 = 'all' OR cm.status = $3)

-- Query para obtener estudiantes (con filtros y paginación)
SELECT
  cm.student_id, cm.status, cm.enrollment_date,
  cm.attendance_percentage, cm.teacher_notes, cm.updated_at,
  p.first_name, p.last_name, p.avatar_url,
  u.email
FROM social_features.classroom_members cm
LEFT JOIN auth_management.profiles p ON p.user_id = cm.student_id
LEFT JOIN auth.users u ON u.id = cm.student_id
WHERE cm.classroom_id = $1
  AND ($2::text IS NULL OR $2 = ''
       OR LOWER(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, ''))
          LIKE LOWER('%' || $2 || '%')
       OR LOWER(COALESCE(u.email, '')) LIKE LOWER('%' || $2 || '%'))
  AND ($3::text IS NULL OR $3 = 'all' OR cm.status = $3)
ORDER BY COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')
LIMIT $4 OFFSET $5
```

**B) Refactorización de `getClassroomStudents()` (Líneas 260-389)**

```typescript
// ANTES (INCORRECTO):
// 1. Query base sin JOIN a profiles/users
// 2. Paginación (LIMIT/OFFSET)
// 3. Búsqueda EN MEMORIA (después de paginar) ❌

// DESPUÉS (CORRECTO):
// 1. Llamar a getStudentsWithSearch() con raw SQL
const { students: members, total } = await this.getStudentsWithSearch(
  classroomId,
  search,
  status,
  skip,
  limit,
);
// 2. Obtener datos adicionales (progreso, gamificación, actividad)
// 3. Mapear a DTO
// 4. Ordenamiento en memoria (flexible)
// 5. Retornar con total correcto ✅
```

**C) Código Eliminado:**
```typescript
// ELIMINADO (líneas 339-348 del código anterior):
// Aplicar filtro de búsqueda en memoria (después de mapear los datos)
if (search) {
  const searchLower = search.toLowerCase();
  data = data.filter((student) => {
    return (
      student.full_name.toLowerCase().includes(searchLower) ||
      (student.email && student.email.toLowerCase().includes(searchLower))
    );
  });
}
```

---

### 2.2 Frontend: useStudentMonitoring.ts

| Parámetro | Valor |
|-----------|-------|
| **Archivo** | `apps/frontend/src/apps/teacher/hooks/useStudentMonitoring.ts` |
| **Tipo de Cambio** | Corrección de lógica |
| **Prioridad** | P1 - Alto |
| **Estado** | ✅ Implementado |

#### Cambio Implementado (Líneas 126-131):

```typescript
// ANTES (INCORRECTO):
if (filters?.status && filters.status.length > 0) {
  query.status = filters.status[0] as 'active' | 'inactive';
}

// DESPUÉS (CORRECTO):
// CORR-2025-12-18: Solo enviar filtro de status cuando hay exactamente uno seleccionado
// Si hay múltiples status seleccionados, no enviamos filtro para obtener todos los estudiantes
// (el backend actual no soporta múltiples status en un solo request)
if (filters?.status && filters.status.length === 1) {
  query.status = filters.status[0] as 'active' | 'inactive';
}
```

---

## 3. FLUJO CORREGIDO

### Antes (INCORRECTO)
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Query: SELECT FROM classroom_members WHERE classroom_id  │
│ 2. Paginación: LIMIT 25 OFFSET 0 (página 1)                │
│ 3. Resultado: 25 estudiantes de 47                          │
│ 4. Búsqueda en memoria: filter(name.includes(search))       │
│ 5. Resultado: 0 coincidencias (usuario en página 2)     ❌  │
└─────────────────────────────────────────────────────────────┘
```

### Después (CORRECTO)
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Query: SELECT FROM classroom_members                     │
│           JOIN profiles JOIN users                          │
│           WHERE classroom_id AND name/email LIKE search     │
│ 2. COUNT: Total de coincidencias                            │
│ 3. Paginación: LIMIT 25 OFFSET 0                           │
│ 4. Resultado: Estudiantes que coinciden con búsqueda    ✅  │
│ 5. Total correcto refleja búsqueda                      ✅  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. VALIDACIÓN

### Build Backend
```bash
cd apps/backend && npm run build
# ✅ Compilación exitosa
```

### Verificación de Código
| Verificación | Resultado |
|--------------|-----------|
| Método `getStudentsWithSearch` existe | ✅ Línea 865 |
| `getClassroomStudents` usa nuevo método | ✅ Línea 272 |
| Búsqueda en memoria eliminada | ✅ |
| Filtro status corregido en frontend | ✅ Línea 129 |

---

## 5. CASOS DE PRUEBA

| # | Caso | Query | Resultado Esperado |
|---|------|-------|-------------------|
| TC-001 | Buscar email completo | `?search=rckrdmrd@gmail.com` | Usuario aparece |
| TC-002 | Buscar email parcial | `?search=rckrdmrd` | Usuario aparece |
| TC-003 | Buscar nombre | `?search=Usuario` | Usuarios con "Usuario" aparecen |
| TC-004 | Paginación página 2 | `?page=2&limit=25` | Usuario en posición 47 visible |
| TC-005 | Cambiar límite | `?limit=50` | Usuario visible en página 1 |
| TC-006 | Filtro status único | `?status=active` | Solo activos |
| TC-007 | Búsqueda + filtro | `?search=test&status=active` | Combinación funciona |
| TC-008 | Total correcto | `?search=xyz` | `pagination.total` = 0 si no hay coincidencias |

---

## 6. NOTAS TÉCNICAS

### Limitación de TypeORM Resuelta
```typescript
// ❌ TypeORM QueryBuilder NO soporta JOINs cross-schema:
.leftJoin('auth_management.profiles', 'p', 'p.user_id = cm.student_id')
// Error: Table "auth_management.profiles" not found

// ✅ Solución: Raw SQL con DataSource
await this.dataSource.query(`
  SELECT cm.*, p.first_name, u.email
  FROM social_features.classroom_members cm
  LEFT JOIN auth_management.profiles p ON p.user_id = cm.student_id
  LEFT JOIN auth.users u ON u.id = cm.student_id
  WHERE ...
`, [params]);
```

### Conversión de Tipos
```typescript
// PostgreSQL retorna null, TypeScript espera undefined
first_name: member.first_name ?? undefined,
avatar_url: member.avatar_url ?? undefined,
```

---

## 7. ARCHIVOS RELACIONADOS (Sin Modificación)

| Archivo | Razón |
|---------|-------|
| `classroomsApi.ts` | API client compatible |
| `StudentMonitoringPanel.tsx` | Usa hooks sin cambio |
| `StudentPagination.tsx` | Props compatibles |
| `GetClassroomStudentsQueryDto` | DTO ya tiene campos necesarios |
| `PaginatedStudentsResponseDto` | Formato de respuesta sin cambio |

---

## 8. REFERENCIAS

- Reporte de Análisis: `orchestration/reportes/CORRECCION-BUG-BUSQUEDA-PAGINACION-2025-12-18.md`
- Guía Anti-Regresión TypeORM: `orchestration/reportes/GUIA-ANTI-REGRESION-TYPEORM-CROSSSCHEMA.md`

---

*Plan de Corrección documentado por Requirements-Analyst | GAMILIT Project | 2025-12-18*
