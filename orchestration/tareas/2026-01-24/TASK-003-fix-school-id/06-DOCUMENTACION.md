# TASK-003: Documentacion - Correccion school_id Usuarios

**Fecha:** 2026-01-25
**Fase:** D (Documentacion)
**Estado:** Completada

---

## 1. Resumen de Cambios

### Problema Resuelto
Los usuarios de GAMILIT no tenian asignada la institucion default (school_id = NULL),
lo cual afectaba la integridad referencial y las consultas que dependian de este campo.

### Solucion Implementada
1. **Trigger modificado:** `set_default_tenant` ahora asigna `school_id` ademas de `tenant_id`
2. **Migracion ejecutada:** 48 usuarios actualizados con school_id correcto

### Impacto
- **Usuarios afectados:** 48 (46 students, 1 admin_teacher, 1 super_admin)
- **Tablas modificadas:** auth_management.profiles
- **Funciones modificadas:** gamilit.set_default_tenant()

---

## 2. Archivos Afectados

### Creados
| Archivo | Lineas | Descripcion |
|---------|--------|-------------|
| `apps/database/migrations/2026-01-25-fix-profiles-school-id.sql` | 85 | Script de migracion para datos existentes |

### Modificados
| Archivo | Cambio |
|---------|--------|
| `apps/database/ddl/schemas/gamilit/functions/11-set_default_tenant.sql` | Agregado Paso 6 para asignar school_id |

---

## 3. Inventarios Actualizados

### DATABASE_INVENTORY.yml
No requiere actualizacion - la funcion ya existia, solo se modifico su logica.

### Notas
- La migracion es idempotente (puede ejecutarse multiples veces sin efectos adversos)
- El trigger solo asigna school_id si es NULL, respetando valores preexistentes

---

## 4. Propagacion

### Evaluacion
| Pregunta | Respuesta |
|----------|-----------|
| Afecta otros proyectos? | No |
| Requiere cambios en Backend? | No |
| Requiere cambios en Frontend? | No |
| Es security fix? | No |

### Conclusion
**No requiere propagacion.** Los cambios son especificos a la logica de asignacion
de datos en GAMILIT y no afectan otros proyectos del ecosystem.

---

## 5. Prevencion Futura

### Comportamiento Esperado
A partir de esta correccion, todo nuevo usuario registrado recibira automaticamente:
- `tenant_id` = GAMILIT Platform (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)
- `school_id` = GAMILIT-DEFAULT (99999999-9999-9999-9999-999999999999)

### Logica de Asignacion
```
1. Buscar school con settings->>'is_default' = 'true'
2. Si no existe, buscar por code = 'GAMILIT-DEFAULT'
3. Asignar si se encontro, caso contrario dejar NULL (warning silencioso)
```

---

## 6. Validaciones Realizadas

| Validacion | Comando | Resultado |
|------------|---------|-----------|
| Trigger compila | psql -f 11-set_default_tenant.sql | CREATE FUNCTION |
| Migracion ejecuta | psql -f migration.sql | UPDATE 48 |
| Datos correctos | SELECT school_id, COUNT(*) ... | GAMILIT-DEFAULT: 48 |

---

## 7. Lecciones Aprendidas

1. **Triggers deben ser completos:** Al crear triggers de asignacion automatica,
   verificar que TODAS las foreign keys obligatorias esten cubiertas.

2. **Validar integridad periodicamente:** Agregar queries de validacion de
   integridad que puedan ejecutarse para detectar problemas tempranamente.

3. **Documentar la logica de negocio:** La regla "todos los usuarios pertenecen
   a la institucion default" debe estar documentada en el DDL y en la documentacion
   tecnica.

---

## 8. Referencias

### Commits
- gamilit: `4e5aa582` - [FIX-SCHOOL-ID] fix: Assign school_id to all users
- workspace-v2: `1eb19507` - [FIX-SCHOOL-ID] chore: Update gamilit submodule

### Documentacion Relacionada
- `apps/database/ddl/schemas/social_features/tables/02-schools.sql`
- `apps/database/seeds/dev/social_features/00-schools-default.sql`

---

## 9. Checklist de Cierre

- [x] Codigo ejecutado y validado
- [x] Commits realizados con mensaje descriptivo
- [x] Push a repositorio remoto
- [x] Submodule actualizado en workspace-v2
- [x] Documentacion de tarea completada (C, E, D)
- [x] METADATA.yml actualizado
- [ ] Indice de tareas actualizado (_INDEX.yml)

---

*Documentacion generada: 2026-01-25*
*Agente: ARQUITECTO-DATOS (Claude Opus 4.5)*
