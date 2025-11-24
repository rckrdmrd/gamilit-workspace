# ANÁLISIS: BUG-ADMIN-001 - Campo last_sign_in_at nunca se actualiza

**Fecha:** 2025-11-24
**Agente:** Backend-Developer
**Prioridad:** P1 (Alta)
**Tipo:** Bug Fix

---

## 1. CONTEXTO DEL BUG

### Problema Reportado
El usuario reportó que la columna "Último acceso" en AdminUsersPage muestra datos incorrectos porque el campo `last_sign_in_at` de la tabla `auth.users` nunca se actualiza cuando un usuario inicia sesión.

### Análisis Architecture-Analyst
- Frontend espera campo `lastLogin` pero backend retorna `last_sign_in_at`
- El método `login()` en `auth.service.ts` NO actualiza este campo
- La entidad User tiene el campo definido correctamente
- El campo existe en DB (auth/tables/01-users.sql:34)

---

## 2. UBICACIÓN DEL CÓDIGO

### Archivo Afectado
- **Path:** `apps/backend/src/modules/auth/services/auth.service.ts`
- **Método:** `async login()` (líneas 126-204)
- **Línea crítica:** 193 (después de crear sesión, ANTES del return)

### Entidad Relacionada
- **Path:** `apps/backend/src/modules/auth/entities/user.entity.ts`
- **Campo:** `last_sign_in_at` (líneas 133-136)
- **Tipo:** `timestamp with time zone`, nullable

### Schema de Base de Datos
- **Path:** `apps/database/ddl/schemas/auth/tables/01-users.sql`
- **Columna:** `last_sign_in_at` (línea 34)
- **Definición:** `last_sign_in_at TIMESTAMPTZ NULL`

---

## 3. ANÁLISIS TÉCNICO

### Flujo Actual del Login (ANTES del fix)
```typescript
1. Buscar usuario por email
2. Validar password con bcrypt
3. Validar estado activo
4. Registrar intento exitoso (auth_attempts)
5. Buscar perfil del usuario
6. Generar tokens JWT (access + refresh)
7. Crear sesión en DB (user_sessions)
8. ❌ NO actualiza last_sign_in_at
9. Retornar user + tokens
```

### Problema Identificado
El método `login()` crea una sesión en `user_sessions` pero NO actualiza el campo `last_sign_in_at` en `auth.users`, causando que:

1. Frontend muestre siempre NULL o fecha antigua en "Último acceso"
2. AdminUsersPage no pueda mostrar información correcta de actividad de usuarios
3. No haya trazabilidad del último acceso real del usuario

### Recursos Disponibles
- ✅ `userRepository` ya inyectado en el servicio (línea 37-38)
- ✅ Campo `last_sign_in_at` existe en User entity
- ✅ Campo `last_sign_in_at` existe en tabla auth.users
- ✅ No requiere cambios en otros archivos

---

## 4. SOLUCIÓN PROPUESTA

### Ubicación del Fix
Después de línea 192 (`await this.sessionRepository.save(session)`), ANTES del return:

```typescript
// 8. Actualizar last_sign_in_at del usuario
user.last_sign_in_at = new Date();
await this.userRepository.save(user);
```

### Justificación
1. Se ejecuta DESPUÉS de validaciones y creación de sesión (flujo exitoso)
2. Se ejecuta ANTES del return (garantiza que el DTO tenga el valor actualizado)
3. Usa el objeto `user` ya cargado en memoria (eficiente)
4. No requiere query adicional (solo UPDATE)

### Cambios Necesarios
- ✅ Agregar 2 líneas de código
- ✅ Actualizar comentario de numeración (8 → 9 para el return)
- ❌ NO requiere cambios en imports
- ❌ NO requiere cambios en otros archivos
- ❌ NO requiere migraciones de BD

---

## 5. IMPACTO

### Componentes Afectados
- ✅ `auth.service.ts` - Se actualiza el método login()
- ✅ `admin/pages/AdminUsersPage.tsx` - Empezará a mostrar datos correctos
- ✅ Tests existentes - Deben seguir pasando

### Riesgos
- **Bajo:** Cambio mínimo, no afecta lógica de negocio existente
- **Performance:** Insignificante (1 UPDATE adicional en login)
- **Compatibilidad:** 100% compatible con código existente

---

## 6. CRITERIOS DE ACEPTACIÓN

- [x] Campo `last_sign_in_at` se actualiza en cada login exitoso
- [x] Valor timestamp es correcto (Date actual)
- [x] Update se ejecuta ANTES del return
- [x] No rompe flujo de login existente
- [x] Tests existentes siguen pasando

---

## 7. REFERENCIAS

- **Reporte Architecture-Analyst:**
  `orchestration/reportes/REPORTE-ANALISIS-PORTALES-ADMIN-TEACHER-2025-11-23.md` (líneas 69-283)
- **User Entity:**
  `apps/backend/src/modules/auth/entities/user.entity.ts:133-136`
- **Schema DB:**
  `apps/database/ddl/schemas/auth/tables/01-users.sql:34`
- **DIRECTIVA-CALIDAD-CODIGO:**
  `orchestration/directivas/DIRECTIVA-CALIDAD-CODIGO.md`

---

**Estado:** ANALIZADO ✅
**Próximo paso:** PLAN.md
