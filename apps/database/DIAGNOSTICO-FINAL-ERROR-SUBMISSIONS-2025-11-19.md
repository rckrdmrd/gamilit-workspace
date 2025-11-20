# Diagnóstico Final: Error "Exercise already submitted and graded"

**Fecha:** 2025-11-19
**Agente:** Database Agent
**Issue:** Usuarios registrados reciben error al enviar ejercicios
**Status:** 🎯 **CAUSA IDENTIFICADA**

---

## 🔍 Error Capturado

```
POST http://localhost:3006/api/educational/exercises/27a03ce2-1695-4496-9532-b86456feeec5/submit 400 (Bad Request)

Error submitting exercise: ValidationError: Exercise already submitted and graded. Cannot resubmit.
```

**Origen del error:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts:157-160`

```typescript
if (existingSubmission && existingSubmission.status === 'graded') {
  throw new BadRequestException(
    'Exercise already submitted and graded. Cannot resubmit.',
  );
}
```

---

## 🎯 Causa Raíz Identificada

### **PROBLEMA: Autenticación incorrecta o sesión compartida**

Los logs del backend muestran:

```
DEBUG [RlsInterceptor] Request completed with RLS context for user cccccccc-cccc-cccc-cccc-cccccccccccc
```

Ese UUID `cccccccc-cccc-cccc-cccc-cccccccccccc` corresponde a **student@gamilit.com** (usuario de testing), **NO a un usuario registrado**.

### Análisis

#### 1. Verificación de Submissions en Base de Datos

**Usuarios registrados migrados (13 usuarios):**

```sql
SELECT
  p.email,
  COUNT(es.id) as total_submissions
FROM auth_management.profiles p
LEFT JOIN progress_tracking.exercise_submissions es ON es.user_id = p.id
WHERE p.email NOT LIKE '%@gamilit.com'
GROUP BY p.email
ORDER BY total_submissions DESC;
```

**Resultado:**

| Email | Total Submissions |
|-------|-------------------|
| joseal.guirre34@gmail.com | **0** ✅ |
| sergiojimenezesteban63@gmail.com | **0** ✅ |
| Gomezfornite92@gmail.com | **0** ✅ |
| (todos los demás) | **0** ✅ |

**Conclusión:** **NINGÚN usuario migrado tiene submissions previas.** El error NO viene de la base de datos.

#### 2. Verificación de Lógica del Backend

```typescript
// exercise-submission.service.ts línea 154
const existingSubmission = await this.findByUserAndExercise(profileId, exerciseId);

// findByUserAndExercise() línea 119
const submission = await this.submissionRepo.findOne({
  where: { user_id: userId, exercise_id: exerciseId },  // ✅ CORRECTO
  order: { submitted_at: 'DESC' },
});
```

**Conclusión:** La lógica del backend es **CORRECTA**. Busca por `(user_id, exercise_id)` específicos.

#### 3. Simulación del Flujo

```sql
-- Simular backend buscando submission para joseal.guirre34@gmail.com
SELECT COUNT(*)
FROM progress_tracking.exercise_submissions
WHERE user_id = '9f5cde08-ae6a-468c-8092-c9a6fff34a5a'  -- profile_id de joseal
  AND exercise_id = '27a03ce2-1695-4496-9532-b86456feeec5';

-- Resultado: 0 (NO hay submissions previas)
```

**Conclusión:** Si el backend recibiera el `user_id` correcto, el INSERT funcionaría sin errores.

#### 4. Análisis del Log del RLS Interceptor

El log muestra que el request se completó con **user `cccccccc...`** (student@gamilit.com).

**Implicaciones:**

1. El JWT token que llegó al backend contiene `cccccccc...` como user.id
2. El backend autenticó la request como **student@gamilit.com**
3. student@gamilit.com SÍ tiene submissions previas (2 ejercicios completados)
4. Al buscar `existingSubmission` para student@gamilit.com, encuentra submissions graded
5. **El error "Cannot resubmit" es correcto** para student@gamilit.com

---

## 🚨 Posibles Causas del Problema

### Hipótesis 1: **Sesión compartida entre usuarios (MÁS PROBABLE)**

**Escenario:**

1. Usuario abre la aplicación y hace login como `student@gamilit.com` (testing)
2. Usuario completa algunos ejercicios
3. Usuario hace logout (o cree que lo hizo)
4. Usuario hace login con cuenta registrada (joseal.guirre34@gmail.com)
5. **BUG:** El frontend NO reemplaza el token JWT, sigue usando el de student@gamilit.com
6. Al enviar ejercicio, backend recibe token de student@gamilit.com
7. Backend rechaza porque student@gamilit.com ya completó ejercicios

**Evidencia:**
- Los logs muestran `user cccccccc...` (student@gamilit.com)
- El error "Cannot resubmit" es correcto para student@gamilit.com
- Los usuarios migrados NO tienen submissions en BD

### Hipótesis 2: **localStorage/sessionStorage no se limpia en logout**

**Escenario:**

El frontend guarda el JWT token en localStorage/sessionStorage pero:
- No lo elimina correctamente en logout
- No lo reemplaza correctamente en nuevo login
- Al hacer request, envía el token antiguo

### Hipótesis 3: **Cookie de sesión compartida**

**Escenario:**

Si el backend usa cookies para autenticación:
- La cookie de student@gamilit.com persiste después del logout
- Al hacer login con usuario registrado, la cookie vieja sigue activa
- El backend prioriza la cookie sobre el header de Authorization

---

## 📋 Verificación Inmediata Requerida

### 1. Verificar qué usuario está autenticado en el frontend

En la consola del navegador (DevTools Console):

```javascript
// Ver token JWT almacenado
console.log('Token:', localStorage.getItem('token'));
console.log('Token (session):', sessionStorage.getItem('token'));

// Decodificar token JWT (sin verificar firma)
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('JWT Payload:', payload);
  console.log('User ID:', payload.sub || payload.id || payload.userId);
  console.log('Email:', payload.email);
}
```

### 2. Verificar headers HTTP del request fallido

En la pestaña **Network** de DevTools:

1. Reproducir el error (enviar ejercicio)
2. Buscar el request `POST .../submit` que falló
3. Ver **Request Headers**:
   ```
   Authorization: Bearer eyJhbGc...
   ```
4. Copiar el token JWT completo
5. Decodificarlo en https://jwt.io
6. Verificar qué `user.id` y `email` contiene

### 3. Verificar proceso de login/logout

**En el código del frontend:**

Buscar archivos:
- `apps/frontend/src/features/auth/hooks/useAuth.ts`
- `apps/frontend/src/features/auth/context/AuthContext.tsx`
- `apps/frontend/src/features/auth/api/authAPI.ts`

Verificar:
1. ¿El `logout()` limpia localStorage/sessionStorage?
2. ¿El `login()` reemplaza el token existente?
3. ¿Hay múltiples lugares donde se guarda el token?

---

## 🔧 Solución Propuesta

### Solución Inmediata (Frontend)

**Archivo:** `apps/frontend/src/features/auth/hooks/useAuth.ts` o similar

```typescript
// En la función logout():
const logout = () => {
  // CRÍTICO: Limpiar TODOS los tokens
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');

  // Limpiar cookies si se usan
  document.cookie = 'token=; Max-Age=0; path=/';

  // Redirigir a login
  navigate('/login');
};

// En la función login():
const login = async (credentials) => {
  // ANTES de hacer login, limpiar sesiones anteriores
  logout();  // Limpiar todo primero

  // LUEGO hacer login
  const response = await authAPI.login(credentials);

  // Guardar nuevo token
  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(response.user));
};
```

### Solución a Mediano Plazo

**1. Agregar validación de userId en el frontend:**

```typescript
// Antes de enviar submission
const currentUser = JSON.parse(localStorage.getItem('user'));
const tokenPayload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));

if (currentUser.id !== tokenPayload.sub) {
  console.error('Token mismatch! Forcing logout...');
  logout();
  throw new Error('Session expired. Please login again.');
}
```

**2. Implementar refresh token rotation:**

- Tokens JWT de corta duración (15 minutos)
- Refresh automático del token
- Logout automático si refresh falla

**3. Agregar debug logging:**

```typescript
// En authAPI.ts o educationalAPI.ts
axios.interceptors.request.use(request => {
  const token = request.headers.Authorization;
  if (token) {
    const payload = JSON.parse(atob(token.split(' ')[1].split('.')[1]));
    console.log('[API Request] User:', payload.email, 'ID:', payload.sub);
  }
  return request;
});
```

---

## 🎯 Confirmación del Diagnóstico

Para confirmar que el problema es de autenticación incorrecta, ejecuta estos pasos:

### Test 1: Login fresco con usuario registrado

1. **Cerrar TODAS las pestañas** del navegador
2. **Borrar caché y cookies** del sitio
3. Abrir nueva pestaña en modo incógnito
4. Hacer login SOLO con usuario registrado (joseal.guirre34@gmail.com)
5. Intentar enviar ejercicio

**Resultado esperado:** ✅ **Debería funcionar** (si el problema es sesiones compartidas)

### Test 2: Verificar token en consola

1. Login con usuario registrado
2. Abrir DevTools Console
3. Ejecutar:
   ```javascript
   const token = localStorage.getItem('token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Logged in as:', payload.email || payload.sub);
   ```
4. Verificar que el email sea el del usuario registrado

**Resultado esperado:** Email del usuario registrado (NO student@gamilit.com)

### Test 3: Verificar headers HTTP

1. Login con usuario registrado
2. Abrir DevTools → Network
3. Enviar ejercicio
4. Buscar request `POST .../submit`
5. Ver Request Headers → Authorization
6. Copiar token JWT y decodificar en jwt.io
7. Verificar `sub`, `email`, `id`

**Resultado esperado:** IDs y email del usuario registrado

---

## 📊 Resumen del Diagnóstico

| Aspecto | Estado | Notas |
|---------|--------|-------|
| **Base de datos** | ✅ **OK** | Usuarios migrados NO tienen submissions previas |
| **Backend logic** | ✅ **OK** | Lógica de verificación es correcta |
| **RLS policies** | ⚠️ **Bypasseadas** | Backend usa superuser (tema separado) |
| **Autenticación** | ❌ **SOSPECHOSA** | Logs muestran student@gamilit.com en lugar de usuario registrado |
| **Frontend session** | ❌ **PROBLEMA PROBABLE** | Sesiones mezcladas o token no se reemplaza |

---

## 🎯 Conclusión

**El problema NO está en la base de datos ni en la migración de usuarios.**

**El problema ESTÁ en el frontend:** Los usuarios registrados están enviando requests con el **token JWT de student@gamilit.com** en lugar de su propio token.

**Causa probable:**
- Sesión de testing no se limpia correctamente en logout
- Token JWT antiguo persiste en localStorage/sessionStorage
- Al hacer login con usuario registrado, el token viejo sigue activo

**Solución:**
1. Verificar que `logout()` limpia TODO el almacenamiento local
2. Verificar que `login()` reemplaza tokens correctamente
3. Agregar validación de userId antes de requests críticos
4. Implementar modo incógnito para testing limpio

---

**Siguiente paso inmediato:** Ejecutar Test 1 (modo incógnito con login fresco) para confirmar el diagnóstico.

---

**Autor:** Database Agent
**Fecha:** 2025-11-19
**Status:** Diagnóstico completo - Requiere validación en frontend
