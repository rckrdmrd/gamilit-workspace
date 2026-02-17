---
id: TASK-RLS-FIX-C06
title: Fix RLS Incompleto en Ejercicios
epic: EXT-002
us_parent: null
status: To Do
priority: P0
severity: CRITICA
created: 2026-01-04
updated: 2026-01-04
---

# TASK-RLS-FIX-C06: Fix RLS Incompleto en Ejercicios

## Descripcion del Problema

**GAP-C06:** Las politicas RLS en ejercicios estan incompletas, permitiendo potencialmente que usuarios accedan a datos de otros tenants.

**Identificado en:** Analisis de documentacion 2025-11-29
**Severidad:** CRITICA - Vulnerabilidad de seguridad multi-tenant

## Contexto

En el modulo admin-extendido (EXT-002), se identifico que las politicas RLS para la tabla `exercises` y tablas relacionadas no estan completamente implementadas para el rol de administrador.

## Archivos Afectados

```
apps/database/ddl/schemas/educational_content/policies/
├── exercises_policy.sql
├── exercise_options_policy.sql
└── student_responses_policy.sql
```

## Criterios de Aceptacion

- [ ] Verificar politicas RLS existentes en educational_content
- [ ] Identificar gaps en politicas para rol admin
- [ ] Implementar politicas faltantes
- [ ] Agregar tests de aislamiento multi-tenant
- [ ] Documentar cambios en TRACEABILITY.yml

## Pasos de Implementacion

1. **Auditoria de RLS actual:**
   ```sql
   SELECT schemaname, tablename, policyname, cmd, qual
   FROM pg_policies
   WHERE schemaname = 'educational_content';
   ```

2. **Verificar acceso admin:**
   - Admin debe ver todos los ejercicios de su institucion
   - Admin NO debe ver ejercicios de otras instituciones
   - Admin puede modificar ejercicios de su institucion

3. **Implementar politicas faltantes:**
   ```sql
   CREATE POLICY admin_view_exercises ON educational_content.exercises
     FOR SELECT TO authenticated
     USING (
       auth.jwt() ->> 'role' = 'admin'
       AND institution_id = (SELECT institution_id FROM auth.users WHERE id = auth.uid())
     );
   ```

4. **Tests requeridos:**
   - Test: Admin A no ve ejercicios de Institucion B
   - Test: Admin puede CRUD ejercicios propios
   - Test: Estudiante solo ve ejercicios asignados

## Notas

Este fix es prerequisito para certificar seguridad multi-tenant en produccion.

## Referencias

- [ET-GAPS-CRITICOS-STUDENTS-ADMIN-2025-11-29.md](../specifications/ET-GAPS-CRITICOS-STUDENTS-ADMIN-2025-11-29.md)
- [TRACEABILITY.yml](../implementacion/TRACEABILITY.yml)

---

**Estado:** To Do
**Asignado:** Pendiente
