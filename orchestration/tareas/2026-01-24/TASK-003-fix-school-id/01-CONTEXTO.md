# TASK-003: Contexto - Correccion school_id Usuarios

**Fecha:** 2026-01-25
**Fase:** C (Contexto)
**Estado:** Completada

---

## 1. Origen de la Tarea

### Solicitante
Usuario via Claude Code

### Descripcion del Problema
En el portal de admin de GAMILIT, se detectaron multiples instituciones registradas
cuando solo deberia haber una institucion default. Los usuarios no estaban
referenciados correctamente a esta institucion.

### Sintomas Reportados
- Usuarios sin institucion asignada
- Inconsistencia en datos de profiles
- school_id = NULL en todos los usuarios

---

## 2. Clasificacion

| Campo | Valor |
|-------|-------|
| Tipo | Bugfix |
| Prioridad | P1 |
| Impacto | Alto - Integridad de datos |
| Urgencia | Media |

---

## 3. Contexto Tecnico

### Proyecto Afectado
- **Nombre:** GAMILIT
- **Modulo:** auth_management, social_features
- **Capas:** Database

### Estado Actual (ANTES)
```
Instituciones (schools):     1 (GAMILIT-DEFAULT) ✓
Usuarios (profiles):        48
  - Con school_id:           0 ✗
  - Sin school_id (NULL):   48 ✗
Clases (classrooms):         1 (vinculada correctamente) ✓
```

### Estado Esperado (DESPUES)
```
Instituciones (schools):     1 (GAMILIT-DEFAULT) ✓
Usuarios (profiles):        48
  - Con school_id:          48 ✓
  - Sin school_id (NULL):    0 ✓
Clases (classrooms):         1 ✓
```

### Causa Raiz Identificada
El trigger `gamilit.set_default_tenant()` solo asignaba `tenant_id` a nuevos
usuarios pero **no asignaba** `school_id`. Esto causaba que todos los usuarios
quedaran sin institucion asignada.

**Archivo afectado:**
`apps/database/ddl/schemas/gamilit/functions/11-set_default_tenant.sql`

**Linea del problema (antes):**
```sql
-- Paso 5: Asignar el tenant principal al nuevo perfil
NEW.tenant_id := v_main_tenant_id;
-- FALTABA: NEW.school_id := v_default_school_id;
```

---

## 4. Referencias Consultadas

| Documento | Proposito |
|-----------|-----------|
| `02-schools.sql` | Estructura de tabla schools |
| `03-profiles.sql` | Estructura de tabla profiles con FK school_id |
| `00-schools-default.sql` | Seed de institucion default |
| `11-set_default_tenant.sql` | Trigger de asignacion automatica |

---

## 5. Criterios de Exito

1. [ ] Todos los usuarios existentes tienen school_id asignado
2. [ ] Nuevos usuarios reciben school_id automaticamente
3. [ ] school_id apunta a GAMILIT-DEFAULT (99999999-9999-9999-9999-999999999999)
4. [ ] Trigger modificado funciona correctamente
5. [ ] Migracion de datos ejecutada sin errores
6. [ ] Commits realizados en gamilit y workspace-v2

---

## 6. Decision de Continuacion

**Modo seleccionado:** @QUICK (C+E+D)

**Justificacion:** Es un bugfix con solucion clara y alcance limitado a database.
No requiere analisis extenso ni plan detallado.

---

## 7. Archivos Relacionados

```
apps/database/ddl/schemas/
├── gamilit/functions/
│   └── 11-set_default_tenant.sql  ← MODIFICAR
├── social_features/tables/
│   └── 02-schools.sql             ← CONSULTAR
└── auth_management/tables/
    └── 03-profiles.sql            ← CONSULTAR

apps/database/migrations/
└── 2026-01-25-fix-profiles-school-id.sql  ← CREAR
```
