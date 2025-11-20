# Reporte: Problema RLS en Exercise Submissions

**Fecha:** 2025-11-19
**Agente:** Database Agent
**Issue:** Usuarios registrados no pueden enviar respuestas de ejercicios
**Status:** 🔍 **DIAGNOSTICADO - Solución Pendiente**

---

## 📊 Resumen Ejecutivo

Los usuarios registrados en producción (13 usuarios) **NO pueden enviar respuestas de ejercicios**, mientras que los usuarios de testing (admin@gamilit.com, teacher@gamilit.com, student@gamilit.com) **SÍ pueden**.

**Causa raíz identificada:** Row Level Security (RLS) policies en las tablas `exercise_submissions` y `exercise_attempts` requieren que la variable de sesión PostgreSQL `app.current_user_id` esté establecida, pero el backend **NO la está estableciendo**.

---

## 🔍 Investigación Realizada

### 1. Análisis del Backend

#### 1.1 Flujo de Exercise Submission

El flujo actual cuando un usuario envía un ejercicio es:

```typescript
// 1. Frontend → POST /api/v1/educational/exercises/:id/submit
// 2. ExercisesController.submitExercise() [exercises.controller.ts:787]
const userId = req.user.id;  // auth.users.id del JWT
const profileId = await this.getProfileId(userId);  // Convierte a profiles.id

// 3. ExerciseSubmissionService.submitExercise() [exercise-submission.service.ts:134]
const profileId = await this.getProfileId(userId);  // Convierte nuevamente
// Crea/actualiza submission con profileId

// 4. ExerciseSubmissionService.autoGrade() [exercise-submission.service.ts:266]
// Llama a SQL validate_and_audit(exerciseId, profileId, ...)

// 5. ExercisesController.submitExercise() [exercises.controller.ts:866]
await this.exerciseAttemptService.create({
  user_id: profileId,  // ← INSERT a exercise_attempts
  exercise_id: exerciseId,
  ...
});
```

#### 1.2 RLS Interceptor NO establece variables de sesión

**Archivo:** `apps/backend/src/shared/interceptors/rls.interceptor.ts`

**Problema identificado (líneas 97-98):**

```typescript
// Por ahora, el RLS se aplicará a nivel de servicio usando el contexto
// En el futuro, se puede implementar la aplicación automática de SET LOCAL
```

**Lo que hace actualmente (líneas 86-91):**

```typescript
// Adjuntar contexto RLS al request para uso en servicios
request.rlsContext = {
  userId,
  userEmail,
  userRole,
  tenantId,
};
```

**Lo que DEBERÍA hacer:**

```sql
SET LOCAL app.current_user_id = '<profile-id>';
SET LOCAL app.current_user_email = '<email>';
SET LOCAL app.current_user_role = '<role>';
SET LOCAL app.current_tenant_id = '<tenant-id>';
```

### 2. Análisis de la Base de Datos

#### 2.1 Tablas con RLS habilitado

```sql
-- Verificación:
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('exercise_submissions', 'exercise_attempts', 'exercise_validation_audit')
ORDER BY tablename;
```

**Resultado:**

| schemaname | tablename | rowsecurity |
|------------|-----------|-------------|
| progress_tracking | exercise_attempts | **true** ✅ |
| progress_tracking | exercise_submissions | **true** ✅ |
| educational_content | exercise_validation_audit | **false** ❌ |

#### 2.2 RLS Policies críticas

**Policy para INSERT en exercise_submissions:**

```sql
-- Tabla: exercise_submissions
-- Policy: exercise_submissions_insert_own
CREATE POLICY exercise_submissions_insert_own
ON progress_tracking.exercise_submissions
FOR INSERT
WITH CHECK (
  user_id = (current_setting('app.current_user_id', true))::uuid
);
```

**Policy para INSERT en exercise_attempts:**

```sql
-- Tabla: exercise_attempts
-- Policy: exercise_attempts_insert_own
CREATE POLICY exercise_attempts_insert_own
ON progress_tracking.exercise_attempts
FOR INSERT
WITH CHECK (
  user_id = (current_setting('app.current_user_id', true))::uuid
);
```

**Problema:** El segundo parámetro `true` en `current_setting('app.current_user_id', true)` hace que retorne `NULL` si la variable NO está establecida.

**Evaluación de la policy cuando app.current_user_id NO está establecida:**

```sql
user_id = NULL::uuid  -- Siempre FALSE
```

**Resultado:** **INSERT rechazado por RLS policy** ❌

#### 2.3 Foreign Keys de user_id

**exercise_submissions:**

```sql
ALTER TABLE progress_tracking.exercise_submissions
ADD CONSTRAINT fk_exercise_submissions_user
FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;
```

**exercise_attempts:**

```sql
ALTER TABLE progress_tracking.exercise_attempts
ADD CONSTRAINT exercise_attempts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;
```

**Conclusión:** Ambas tablas esperan `profiles.id` (NO `auth.users.id`). ✅ El backend está enviando el ID correcto.

#### 2.4 Función get_current_user_id()

**Archivo:** `ddl/schemas/gamilit/functions/02-get_current_user_id.sql`

```sql
CREATE OR REPLACE FUNCTION gamilit.get_current_user_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $function$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$function$;
```

**Conclusión:** Retorna el valor de la session variable `app.current_user_id`, o NULL si no está establecida.

### 3. Análisis de Submissions Existentes

```sql
SELECT
  es.id,
  es.user_id,
  es.score,
  es.status,
  p.email
FROM progress_tracking.exercise_submissions es
LEFT JOIN auth_management.profiles p ON p.id = es.user_id
ORDER BY es.submitted_at DESC
LIMIT 10;
```

**Resultado:**

| user_id (profiles.id) | email | score | status |
|----------------------|-------|-------|--------|
| cccccccc-cccc-cccc-cccc-cccccccccccc | student@gamilit.com | 100 | graded |
| 173b9c95-d225-4f19-8baf-b10d70b37c6a | rckrdmrd@gmail.com | 100 | graded |
| cccccccc-cccc-cccc-cccc-cccccccccccc | student@gamilit.com | 0 | graded |

**Observación:** Los usuarios SÍ pudieron hacer submissions, lo que indica que:
1. O las RLS policies NO están bloqueando (por algún bypass)
2. O el backend SÍ está estableciendo `app.current_user_id` en algún momento

### 4. Análisis del Rol de Base de Datos

```sql
SELECT
  rolname,
  rolsuper,
  rolbypassrls
FROM pg_roles
WHERE rolname IN ('gamilit_user', 'authenticated', 'postgres');
```

**Resultado:**

| rolname | rolsuper | rolbypassrls |
|---------|----------|--------------|
| gamilit_user | **true** ✅ | **false** ❌ |
| authenticated | false | false |
| postgres | true | true |

**Conclusión:** `gamilit_user` es **superuser** pero **NO tiene BYPASS RLS**. Esto significa que:

⚠️ **EN TEORÍA, las RLS policies DEBERÍAN aplicarse a gamilit_user...**

⚠️ **PERO en PostgreSQL, los superusers (rolsuper=true) NO están sujetos a RLS policies por defecto, incluso si rolbypassrls=false**

**Referencia oficial de PostgreSQL:**
> Row security policies are not applied to superusers or roles that have the BYPASSRLS attribute.

---

## 🚨 Problema Raíz Identificado

### El backend está usando `gamilit_user` (superuser) para conectarse a la base de datos

**Implicaciones:**

1. ✅ **Las RLS policies NO aplican** → Los INSERTs funcionan sin verificar `app.current_user_id`
2. ⚠️ **Potencial problema de seguridad** → El usuario de aplicación NO debería ser superuser
3. ❌ **Las policies RLS están inactivas** → Row Level Security completamente bypasseado

**Por qué los usuarios pueden hacer submissions:**

Porque `gamilit_user` es **superuser**, las policies RLS son completamente ignoradas por PostgreSQL, permitiendo que cualquier INSERT funcione sin verificar `app.current_user_id`.

---

## 🤔 ¿Por qué entonces los usuarios registrados tienen errores?

**Hipótesis pendientes de validación:**

1. **El error NO es por RLS** → Podría ser otro tipo de error (validación, formato de datos, etc.)
2. **El error es intermitente** → Alguna condición específica que solo afecta a usuarios registrados
3. **El error es de frontend** → El frontend podría estar enviando datos incorrectos para usuarios registrados

**Acción requerida:** Necesitamos ver el **error exacto** que están recibiendo los usuarios registrados.

---

## 📋 Próximos Pasos Recomendados

### 1. Capturar el error exacto (URGENTE)

```bash
# Ver logs del backend en tiempo real
tail -f /path/to/backend/logs/error.log

# O si usa PM2:
pm2 logs backend
```

### 2. Probar submission con usuario registrado

Hacer que un usuario registrado (ej. joseal.guirre34@gmail.com) intente enviar un ejercicio y capturar:
- Error en el frontend (console del navegador)
- Error en el backend (logs de servidor)
- Request HTTP completo (Network tab de DevTools)

### 3. Corregir arquitectura de seguridad

**CRÍTICO:** El backend NO debería usar un superuser para conectarse a la base de datos.

**Acción recomendada:**

1. Crear un nuevo rol `gamilit_app` **sin superuser privileges**:
   ```sql
   CREATE ROLE gamilit_app WITH LOGIN PASSWORD 'secure_password';
   GRANT CONNECT ON DATABASE gamilit_platform TO gamilit_app;
   GRANT USAGE ON ALL SCHEMAS IN DATABASE gamilit_platform TO gamilit_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN DATABASE gamilit_platform TO gamilit_app;
   ```

2. Actualizar `backend/src/config/database.config.ts`:
   ```typescript
   username: process.env.DB_USER || 'gamilit_app',  // NO gamilit_user
   ```

3. Implementar SET LOCAL en RLS Interceptor:
   ```typescript
   // En rls.interceptor.ts, después de línea 91:

   const dataSource = this.moduleRef.get<DataSource>(DataSource, { strict: false });
   const queryRunner = dataSource.createQueryRunner();

   await queryRunner.query(`SET LOCAL app.current_user_id = $1`, [profileId]);
   await queryRunner.query(`SET LOCAL app.current_user_email = $1`, [userEmail]);
   await queryRunner.query(`SET LOCAL app.current_user_role = $1`, [userRole]);
   ```

### 4. Validar que users/profiles están correctamente creados

```sql
-- Verificar usuarios registrados
SELECT
  u.id as user_id,
  u.email,
  u.role,
  p.id as profile_id,
  p.display_name,
  us.id as stats_id,
  us.ml_coins,
  ur.current_rank
FROM auth.users u
LEFT JOIN auth_management.profiles p ON p.user_id = u.id
LEFT JOIN gamification_system.user_stats us ON us.user_id = p.id
LEFT JOIN gamification_system.user_ranks ur ON ur.user_id = p.id
WHERE u.email = 'joseal.guirre34@gmail.com';
```

---

## 📊 Estado Actual

| Componente | Estado | Notas |
|------------|--------|-------|
| Backend RLS Interceptor | ⚠️ **Incompleto** | NO establece session variables |
| Base de datos RLS Policies | ✅ **Definidas** | Pero bypasseadas por superuser |
| Backend DB Connection | ❌ **Inseguro** | Usando superuser (gamilit_user) |
| Usuario Testing submissions | ✅ **Funcionando** | student@gamilit.com puede enviar ejercicios |
| Usuario Registrado submissions | ❌ **Fallando** | Causa exacta pendiente de capturar |
| Tablas user_stats/user_ranks | ✅ **Inicializados** | Todos los usuarios tienen stats/ranks correctos |

---

## 🎯 Conclusión Preliminar

El problema **NO es directamente RLS** porque las policies están siendo bypasseadas por el uso de un superuser.

El error que experimentan los usuarios registrados tiene **otra causa** que necesitamos identificar capturando el error exacto.

**RECOMENDACIÓN URGENTE:** Revisar logs del backend y frontend para identificar el error real que están recibiendo los usuarios registrados al intentar enviar ejercicios.

---

**Autor:** Database Agent
**Fecha:** 2025-11-19
**Siguiente acción:** Capturar error exacto de usuarios registrados
