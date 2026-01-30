# TASK-020: Fix SET LOCAL RLS Error en Teacher Reports

**Fecha:** 2026-01-25
**Prioridad:** P0 CRÍTICO (Bloquea funcionalidad del Portal Teacher)
**Agente:** CLAUDE-CODE
**Estado:** PENDIENTE APROBACIÓN

---

## 1. ANÁLISIS DEL ERROR

### 1.1 Síntoma
```
QueryFailedError: syntax error at or near "$1"
query: 'SET LOCAL app.current_user_id = $1',
parameters: [ 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' ]
```

### 1.2 Causa Raíz
**PostgreSQL NO soporta queries parametrizadas para comandos SET.**

El comando `SET LOCAL` requiere valores literales, no placeholders:
```sql
-- ❌ INCORRECTO - Causa el error
SET LOCAL app.current_user_id = $1

-- ✅ CORRECTO - Valor literal con comillas simples
SET LOCAL app.current_user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
```

### 1.3 Archivo Afectado
`apps/backend/src/modules/teacher/services/teacher-reports.service.ts`

**Líneas con el error:**
- Línea 49: `getRecentReports()`
- Línea 74: `getReportStats()`
- Línea 144: `getReportById()`
- Línea 207: `deleteReport()`

### 1.4 Origen del Bug
Introducido en **TASK-015-fix-teacher-reports-rls** (2026-01-25) donde se agregó soporte RLS, pero se usó sintaxis incorrecta de query parametrizada.

---

## 2. ANÁLISIS DE IMPACTO

### 2.1 Capas Afectadas

| Capa | Impacto | Descripción |
|------|---------|-------------|
| **Database** | ✅ Sin cambios | RLS policies están correctas |
| **Backend** | 🔴 AFECTADO | 1 archivo, 4 líneas a corregir |
| **Frontend** | ✅ Sin cambios | Solo consume la API |

### 2.2 Funcionalidades Bloqueadas

1. **GET /teacher/reports** - Lista de reportes del maestro
2. **GET /teacher/reports/stats** - Estadísticas de reportes
3. **GET /teacher/reports/:id** - Detalle de reporte
4. **DELETE /teacher/reports/:id** - Eliminar reporte

### 2.3 Usuarios Afectados
- Todos los usuarios con rol `teacher` o `admin_teacher`
- Portal Teacher: Página Reports completamente no funcional

### 2.4 Análisis de Seguridad

**Riesgo de SQL Injection:** BAJO
- El `teacherId` proviene del JWT validado
- Se validará formato UUID antes de interpolación
- Se usa función `isUUID()` existente en `validation.util.ts`

---

## 3. PLAN DE CORRECCIÓN

### 3.1 Solución Propuesta

Reemplazar queries parametrizadas por interpolación de string con validación UUID:

```typescript
// ANTES (incorrecto):
await manager.query('SET LOCAL app.current_user_id = $1', [teacherId]);

// DESPUÉS (correcto):
if (!isUUID(teacherId)) {
  throw new BadRequestException('Invalid teacher ID format');
}
await manager.query(`SET LOCAL app.current_user_id = '${teacherId}'`);
```

### 3.2 Cambios Específicos

**Archivo:** `teacher-reports.service.ts`

| Línea | Método | Cambio |
|-------|--------|--------|
| 13 | imports | Agregar `BadRequestException` |
| 18 | imports | Agregar `import { isUUID } from '@shared/utils/validation.util'` |
| 49 | `getRecentReports` | Validar UUID + usar literal |
| 74 | `getReportStats` | Validar UUID + usar literal |
| 144 | `getReportById` | Validar UUID + usar literal |
| 207 | `deleteReport` | Validar UUID + usar literal |

### 3.3 Patrón de Código Final

```typescript
import { isUUID } from '@shared/utils/validation.util';

// En cada método que use SET LOCAL:
async getRecentReports(teacherId: string, limit: number = 10): Promise<ReportMetadataDto[]> {
  // Validar UUID antes de usar en query
  if (!isUUID(teacherId)) {
    throw new BadRequestException(`Invalid teacher ID format: ${teacherId}`);
  }

  return this.dataSource.transaction(async (manager) => {
    // SET LOCAL requiere valor literal, no soporta $1 placeholder
    await manager.query(`SET LOCAL app.current_user_id = '${teacherId}'`);

    // ... resto del código sin cambios
  });
}
```

---

## 4. VALIDACIÓN PRE-IMPLEMENTACIÓN

### 4.1 Verificación de Database (RLS Policies)

```sql
-- Verificar que la policy usa current_setting correctamente
SELECT polname, polqual
FROM pg_policies
WHERE tablename = 'teacher_reports';

-- Esperado: Usar current_setting('app.current_user_id', true)
```

### 4.2 Verificación de Backend

```bash
# Build debe pasar
npm run build

# Tests existentes deben seguir pasando
npm run test -- --testPathPattern=teacher-reports
```

### 4.3 Verificación de Frontend

El frontend NO requiere cambios. Solo consume:
- `GET /teacher/reports`
- `GET /teacher/reports/stats`
- `GET /teacher/reports/:id`
- `DELETE /teacher/reports/:id`

---

## 5. PLAN DE EJECUCIÓN

### Fase 1: Preparación (2 min)
1. ✅ Leer archivo actual
2. ✅ Verificar imports existentes
3. ✅ Identificar todas las líneas a modificar

### Fase 2: Implementación (5 min)
1. Agregar import `BadRequestException` a NestJS imports
2. Agregar import `isUUID` desde validation.util
3. Modificar línea 49 en `getRecentReports`
4. Modificar línea 74 en `getReportStats`
5. Modificar línea 144 en `getReportById`
6. Modificar línea 207 en `deleteReport`

### Fase 3: Validación (3 min)
1. `npm run build` - Sin errores TypeScript
2. `npm run lint` - Sin errores de linting
3. Test manual de endpoint GET /teacher/reports

### Fase 4: Documentación (2 min)
1. Actualizar METADATA.yml de la tarea
2. Agregar entrada a TRAZA-BUGS.md

---

## 6. ROLLBACK PLAN

Si la corrección causa problemas:

1. **Revertir archivo:**
   ```bash
   git checkout HEAD~1 -- apps/backend/src/modules/teacher/services/teacher-reports.service.ts
   ```

2. **Alternativa temporal:** Deshabilitar RLS para la tabla mientras se investiga:
   ```sql
   ALTER TABLE social_features.teacher_reports DISABLE ROW LEVEL SECURITY;
   ```

---

## 7. CHECKLIST PRE-APROBACIÓN

- [x] Causa raíz identificada (SET LOCAL no soporta $1)
- [x] Archivo afectado localizado (1 archivo, 4 líneas)
- [x] Validación UUID disponible (isUUID en validation.util.ts)
- [x] Sin impacto en otras capas (Database y Frontend sin cambios)
- [x] Sin riesgo de SQL injection (UUID validado + valor de JWT)
- [x] Plan de rollback definido

---

## 8. SOLICITUD DE APROBACIÓN

**¿Proceder con la implementación según el plan descrito?**

Resumen de cambios:
- 1 archivo modificado
- 2 imports agregados
- 4 líneas de código cambiadas (SET LOCAL)
- 4 validaciones UUID agregadas
- 0 cambios en Database
- 0 cambios en Frontend

**Tiempo estimado:** 10-12 minutos total
