# EJECUCION: Teacher Reports RLS Fix

**TASK:** TASK-2026-01-25-GAMILIT-REPORTS-FIX
**Fecha Ejecucion:** 2026-01-25
**Estado:** COMPLETADO

---

## CAMBIOS REALIZADOS

### Archivo Modificado

**Ruta:** `projects/gamilit/apps/backend/src/modules/teacher/services/teacher-reports.service.ts`

### Resumen de Cambios

| Linea | Tipo | Descripcion |
|-------|------|-------------|
| 9-10 | ADD | Comentario de documentacion del fix |
| 14 | MODIFY | Agregar `InjectDataSource` al import |
| 15 | MODIFY | Agregar `DataSource` al import de typeorm |
| 29-31 | ADD | Inyeccion de `DataSource` con `@InjectDataSource('social')` |
| 47-58 | MODIFY | `getRecentReports()` - usar transaccion con SET LOCAL |
| 72-125 | MODIFY | `getReportStats()` - usar transaccion con SET LOCAL |
| 142-163 | MODIFY | `getReportById()` - usar transaccion con SET LOCAL |
| 205-226 | MODIFY | `deleteReport()` - usar transaccion con SET LOCAL |

### Patron Aplicado

Cada metodo que lee de `teacher_reports` ahora usa el patron:

```typescript
return this.dataSource.transaction(async (manager) => {
  // Establecer contexto RLS para esta transaccion
  await manager.query('SET LOCAL app.current_user_id = $1', [teacherId]);

  // Ejecutar queries con RLS activo
  const reports = await manager.find(TeacherReport, { ... });

  return reports;
});
```

---

## VALIDACIONES

### Build

```
> @gamilit/backend@1.0.0 build
> tsc

(Sin errores)
```

**Estado:** PASS

### Lint

```
npx eslint src/modules/teacher/services/teacher-reports.service.ts

(Sin errores ni warnings para el archivo modificado)
```

**Estado:** PASS

---

## VERIFICACION PENDIENTE

Para confirmar que el fix funciona correctamente, ejecutar:

### 1. Verificar Backend Responde

```bash
# Iniciar backend
cd projects/gamilit/apps/backend
npm run start:dev

# En otra terminal, probar endpoint (requiere token valido)
curl -X GET http://localhost:3001/api/teacher/reports/recent \
  -H "Authorization: Bearer <TOKEN>"
```

### 2. Verificar UI

1. Navegar a http://localhost:5173 (frontend)
2. Login como teacher
3. Ir a `/teacher/reports`
4. Verificar que:
   - NO aparece el banner amarillo "Datos de Demostracion"
   - Aparece lista de reportes (o mensaje "No hay reportes generados aun" si no hay datos)
   - Las estadisticas muestran valores correctos

---

## NOTAS TECNICAS

### Por que transacciones?

`SET LOCAL` solo tiene efecto dentro de una transaccion. Si se usa fuera de una transaccion, el valor se resetea inmediatamente despues del comando.

```sql
-- INCORRECTO (sin transaccion):
SET LOCAL app.current_user_id = 'uuid';  -- Se pierde inmediatamente
SELECT * FROM teacher_reports;            -- RLS no aplica el filtro

-- CORRECTO (con transaccion):
BEGIN;
SET LOCAL app.current_user_id = 'uuid';  -- Persiste hasta COMMIT/ROLLBACK
SELECT * FROM teacher_reports;            -- RLS aplica correctamente
COMMIT;
```

### Por que no modificar createReport()?

El metodo `createReport()` no necesita SET LOCAL porque:

1. Las RLS policies en `teacher_reports` solo aplican a SELECT (FOR SELECT)
2. INSERT es manejado a nivel de aplicacion (no hay policy FOR INSERT)
3. El DTO ya incluye `teacherId` y `tenantId` explicitos

---

## CHECKLIST FINAL

- [x] Build exitoso
- [x] Lint sin errores nuevos
- [x] Archivo modificado documentado
- [x] Patron explicado
- [ ] Prueba manual en ambiente local (pendiente usuario)
- [ ] Verificacion UI (pendiente usuario)
