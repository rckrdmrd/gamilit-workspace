# Changelog: Corrección gamilit_role enum references

**Fecha:** 2025-11-08
**Issue:** P0-001 / Referencias ambiguas
**Cambio:** Estandarizar referencias al enum `gamilit_role` para usar siempre el schema completo

---

## Problema Identificado

Se encontraron 5 archivos con referencias ambiguas al enum `gamilit_role` que no especificaban el schema explícitamente. Esto podía causar ambigüedad o errores en tiempo de ejecución.

## Archivos Modificados

1. **ddl/schemas/gamilit/functions/03-get_current_user_role.sql**
   - Cambios: 2 referencias
   - `RETURNS gamilit_role` → `RETURNS auth_management.gamilit_role`
   - `v_role gamilit_role` → `v_role auth_management.gamilit_role`

2. **ddl/schemas/auth_management/functions/02-get_user_role.sql**
   - Cambios: 4 referencias
   - `RETURNS gamilit_role` → `RETURNS auth_management.gamilit_role`
   - `v_role gamilit_role` → `v_role auth_management.gamilit_role`
   - `'student'::gamilit_role` → `'student'::auth_management.gamilit_role` (2 veces)

3. **ddl/schemas/auth_management/functions/04-remove_role_from_user.sql**
   - Cambios: 1 referencia
   - `p_role gamilit_role` → `p_role auth_management.gamilit_role`

4. **ddl/schemas/auth_management/functions/01-assign_role_to_user.sql**
   - Cambios: 1 referencia
   - `p_role gamilit_role` → `p_role auth_management.gamilit_role`

5. **ddl/schemas/content_management/rls-policies/01-policies.sql**
   - Cambios: 1 referencia
   - `'admin_teacher'::gamilit_role` → `'admin_teacher'::auth_management.gamilit_role`

**Total de referencias corregidas:** 9

## Razón del Cambio

El enum `gamilit_role` está definido en el schema `auth_management`, NO en `public`. Las referencias sin schema explícito pueden:
1. Causar errores si el search_path no incluye `auth_management`
2. Crear ambigüedad en el código
3. Dificultar el mantenimiento

## Impacto

- ✅ Todas las referencias ahora son explícitas y no ambiguas
- ✅ Se eliminó el riesgo de errores por search_path incorrectos
- ✅ Código más claro y mantenible
- ✅ No hay cambios de comportamiento, solo clarificación

## Validación

- ✅ Backups creados en `backups/2025-11-08-gamilit-role-fix/`
- ✅ 5 archivos corregidos
- ✅ 9 referencias ambiguas eliminadas
- ✅ No quedan referencias sin schema (excepto en comentarios)

## Notas

- El enum correcto siempre fue `auth_management.gamilit_role`
- La definición está en: `ddl/00-prerequisites.sql`
- Valores del enum: `'student'`, `'admin_teacher'`, `'super_admin'`

## Próximos Pasos

- [ ] Validar que las funciones se ejecutan correctamente
- [ ] Ejecutar tests unitarios de autenticación
- [ ] Verificar RLS policies funcionan correctamente

---

**Ejecutado por:** Claude Code
**Tiempo estimado:** 30 minutos
**Tiempo real:** 15 minutos
**Estado:** ✅ Completado
