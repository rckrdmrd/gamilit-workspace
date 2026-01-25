# TASK-010: Consolidar RLS Policies para teacher_content

## Contexto

**Fecha:** 2026-01-25
**Agente:** CLAUDE-CODE
**Modo:** @QUICK
**Origen:** Hallazgo ALTA-001 de TASK-2026-01-25-VALIDACION-PORTAL-TEACHER

---

## Problema Reportado (ALTA-001)

> "RLS Policies de teacher_content No Documentadas"
>
> No se encontró archivo de políticas RLS dedicado para la tabla `teacher_content` (49 campos), la más grande del módulo teacher.

## Investigación

Al investigar, se descubrió que el problema era diferente al reportado:

### Archivos Encontrados

```
apps/database/ddl/schemas/educational_content/rls-policies/
├── 01-enable-rls.sql
├── 02-modules-exercises-policies.sql
├── 02-teacher_content-policies.sql          ← PROBLEMA
└── 02-teacher_content-policies-fixed.sql    ← CORRECTO
```

### Problema Real

1. **Existían DOS archivos** de políticas para teacher_content
2. **Archivo 1** (`02-teacher_content-policies.sql`):
   - Usaba `auth.uid()`, `auth.current_tenant_id()`, `auth.has_role()`
   - Estas funciones **NO EXISTEN** en este proyecto
   - Es sintaxis de **Supabase**, pero este proyecto usa **PostgreSQL + NestJS**

3. **Archivo 2** (`02-teacher_content-policies-fixed.sql`):
   - Usaba `current_setting('app.current_user_id', true)::UUID`
   - Este **SÍ es el patrón correcto** del proyecto
   - Consistente con otros archivos como `02-modules-exercises-policies.sql`

### Impacto

El script `init-database.sh` carga **todos** los archivos `.sql` de `rls-policies/`:

```bash
for policy_file in "$policies_dir"/*.sql; do
    execute_sql_file "$policy_file"
done
```

Esto causaría:
1. Archivo con auth.* fallará al ejecutarse (funciones inexistentes)
2. O ambos archivos intentarían crear las mismas políticas (conflicto)

---

## Patrón Correcto del Proyecto

Verificado en `gamilit.get_current_user_id()`:

```sql
-- apps/database/ddl/schemas/gamilit/functions/02-get_current_user_id.sql
RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
```

Y en `02-modules-exercises-policies.sql`:

```sql
WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
```

---

## Solución

1. **Eliminar** `02-teacher_content-policies.sql` (sintaxis incorrecta)
2. **Consolidar** en `03-teacher_content-policies.sql`:
   - Basado en archivo `-fixed` con sintaxis correcta
   - Agregado `DROP IF EXISTS` para todas las políticas (idempotente)
   - Documentado patrón correcto en comentarios

---

*Documentado según SIMCO v4.3.0*
