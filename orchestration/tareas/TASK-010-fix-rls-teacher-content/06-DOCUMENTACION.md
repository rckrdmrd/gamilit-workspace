# TASK-010: Documentación

## Resumen Ejecutivo

| Campo | Valor |
|-------|-------|
| ID | TASK-010 |
| Título | Consolidar RLS Policies para teacher_content |
| Tipo | bugfix (security) |
| Prioridad | P1 |
| Hallazgo | ALTA-001 |
| Estado | Completada |
| Story Points | 2 |

---

## Problema Resuelto

**Hallazgo original (ALTA-001):** "RLS Policies de teacher_content no documentadas"

**Problema real:** Existían DOS archivos de políticas RLS con sintaxis incompatible:
- Uno con `auth.uid()` (Supabase - NO funciona)
- Otro con `current_setting()` (PostgreSQL - correcto)

**Impacto potencial:**
- Error al recrear BD (funciones inexistentes)
- Políticas RLS no aplicadas correctamente
- Posible exposición de contenido entre tenants

---

## Solución Implementada

1. **Eliminado** archivo con sintaxis incorrecta
2. **Consolidado** en archivo único idempotente
3. **Documentado** patrón correcto del proyecto

### Patrón Correcto

```sql
-- INCORRECTO (Supabase)
auth.uid()
auth.current_tenant_id()
auth.has_role('teacher')

-- CORRECTO (PostgreSQL + NestJS)
(current_setting('app.current_user_id', true))::UUID
(current_setting('app.current_tenant_id', true))::UUID
EXISTS (SELECT 1 FROM auth_management.user_roles ur WHERE ur.user_id = ... AND ur.role = 'admin_teacher')
```

---

## Archivos

| Archivo | Acción |
|---------|--------|
| `02-teacher_content-policies.sql` | ELIMINADO |
| `02-teacher_content-policies-fixed.sql` | ELIMINADO |
| `03-teacher_content-policies.sql` | CREADO (consolidado) |

---

## Verificación de Calidad

| Check | Estado |
|-------|--------|
| Sintaxis SQL | ✅ Correcta |
| Patrón current_setting | ✅ Consistente |
| DROP IF EXISTS | ✅ Todas las políticas |
| Commits | ✅ gamilit + workspace |
| Documentación SIMCO | ✅ Completa |

---

## Aplicación de Cambios

Para aplicar en BD existente:

```powershell
# Desde Windows PowerShell
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' gamilit --drop
```

**Importante:** Hacer backup de datos antes si es ambiente de producción.

---

## Lecciones Aprendidas

1. **Verificar patrón del proyecto** antes de crear archivos DDL
   - Este proyecto usa `current_setting()`, NO `auth.*()`
   - Revisar archivos existentes como referencia

2. **Archivos DDL deben ser idempotentes**
   - Usar `DROP IF EXISTS` para evitar conflictos
   - Permite re-ejecutar sin errores

3. **Revisar script de carga**
   - `init-database.sh` carga TODOS los `.sql` de cada carpeta
   - Duplicados causarán conflictos

---

## Referencias

- `apps/database/ddl/schemas/gamilit/functions/02-get_current_user_id.sql` - Patrón correcto
- `apps/database/scripts/init-database.sh:884` - Carga de políticas RLS
- TASK-2026-01-25-VALIDACION-PORTAL-TEACHER/04-HALLAZGOS.md - Origen del hallazgo

---

*Documentado según SIMCO v4.3.0*
*Completado: 2026-01-26*
