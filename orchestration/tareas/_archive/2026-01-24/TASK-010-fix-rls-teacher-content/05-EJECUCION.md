# TASK-010: Ejecución

## Resumen de Cambios

**Archivos afectados:** 3 (2 eliminados, 1 creado)

---

## Cambios Realizados

### 1. Eliminado: 02-teacher_content-policies.sql

```bash
git rm apps/database/ddl/schemas/educational_content/rls-policies/02-teacher_content-policies.sql
```

**Razón:** Usaba sintaxis Supabase (`auth.uid()`) que no existe en este proyecto.

### 2. Eliminado: 02-teacher_content-policies-fixed.sql

```bash
git rm apps/database/ddl/schemas/educational_content/rls-policies/02-teacher_content-policies-fixed.sql
```

**Razón:** Consolidado en nuevo archivo con mejoras.

### 3. Creado: 03-teacher_content-policies.sql

**Ubicación:** `apps/database/ddl/schemas/educational_content/rls-policies/03-teacher_content-policies.sql`

**Mejoras sobre archivo anterior:**
- Agregado `DROP IF EXISTS` para TODAS las políticas (10 total)
- Documentación del patrón correcto en header
- Comentarios explicativos por sección

---

## Políticas RLS Incluidas

| # | Nombre | Operación | Descripción |
|---|--------|-----------|-------------|
| 1 | teacher_content_view_own | SELECT | Teachers ven su propio contenido |
| 2 | teacher_content_view_public | SELECT | Todos ven contenido público |
| 3 | teacher_content_view_school | SELECT | Teachers ven contenido del tenant |
| 4 | teacher_content_view_shared | SELECT | Contenido compartido explícitamente |
| 5 | teacher_content_create_own | INSERT | Teachers crean en su tenant |
| 6 | teacher_content_update_own | UPDATE | Teachers actualizan su contenido |
| 7 | teacher_content_update_shared | UPDATE | Actualizar contenido compartido |
| 8 | teacher_content_delete_own | DELETE | Teachers eliminan su contenido |
| 9 | teacher_content_admin_manage_all | ALL | Admins gestionan todo |
| 10 | teacher_content_student_view_classroom | SELECT | Estudiantes ven publicado |

---

## Estado Final de Archivos

```
apps/database/ddl/schemas/educational_content/rls-policies/
├── 01-enable-rls.sql                    (sin cambios)
├── 02-modules-exercises-policies.sql    (sin cambios)
└── 03-teacher_content-policies.sql      ← NUEVO (consolidado)
```

---

## Commits

| Hash | Mensaje | Repositorio |
|------|---------|-------------|
| `499edb23` | fix(database): Consolidar RLS policies para teacher_content (ALTA-001) | gamilit |
| `2c0b9dcd` | chore: Update gamilit submodule (fix RLS policies teacher_content) | workspace-v2 |

---

## Para Aplicar en BD

Para que los cambios surtan efecto en una base de datos existente:

```powershell
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' gamilit --drop
```

**Nota:** Esto recreará la BD completa. Si hay datos de producción, hacer backup primero.

---

*Ejecutado según SIMCO v4.3.0*
