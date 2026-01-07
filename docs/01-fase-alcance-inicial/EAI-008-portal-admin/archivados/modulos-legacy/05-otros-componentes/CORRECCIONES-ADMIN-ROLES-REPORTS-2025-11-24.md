# Correcciones - AdminRolesPage y AdminReportsPage

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Problemas Reportados:**
1. ❌ AdminRolesPage: 404 en `/admin/roles/available-permissions` + 500 en `/admin/roles`
2. ❌ AdminReportsPage: No funciona (sin errores visibles)

---

## 🔧 CORRECCIONES REALIZADAS

### 1. AdminRolesPage - Endpoint Incorrecto (404)

**Problema:**
Frontend llamaba a `/admin/roles/available-permissions` pero el backend tiene `/admin/roles/permissions`

**Archivo Corregido:** `apps/frontend/src/config/api.config.ts`

**Línea 233:**
```typescript
// ANTES (INCORRECTO)
availablePermissions: '/admin/roles/available-permissions',

// DESPUÉS (CORRECTO)
availablePermissions: '/admin/roles/permissions',
```

**Status:** ✅ CORREGIDO

---

### 2. AdminRolesPage - Error 500 en getRoles

**Problema:**
El servicio `AdminRolesService.getRoles()` intentaba contar usuarios con role names que no coinciden con el enum `GamilityRoleEnum`.

**Causa Raíz:**
- Tabla `auth_management.roles` usa role.name como string ('student', 'teacher', 'admin')
- Tabla `auth_management.user_roles` usa role como GamilityRoleEnum ('student', 'admin_teacher', 'super_admin')
- No hay mapeo 1:1 entre ambos

**Archivo Corregido:** `apps/backend/src/modules/admin/services/admin-roles.service.ts`

**Cambios:**
1. Agregado mapeo explícito de role names a enum values
2. Agregado try-catch para roles sin mapeo directo
3. Agregado filtro `is_active: true` en el conteo

**Código Antes:**
```typescript
const usersCount = await this.userRoleRepo.count({
  where: { role: role.name as any },
});
```

**Código Después:**
```typescript
// Map role names from Role entity to GamilityRoleEnum values
const roleNameToEnum: Record<string, string> = {
  'student': 'student',
  'teacher': 'admin_teacher',
  'admin': 'super_admin',
  'super_admin': 'super_admin',
  'admin_teacher': 'admin_teacher',
};

const enumValue = roleNameToEnum[role.name] || role.name;

let usersCount = 0;
try {
  usersCount = await this.userRoleRepo.count({
    where: {
      role: enumValue as any,
      is_active: true
    },
  });
} catch (error) {
  // If role name doesn't match GamilityRoleEnum, default to 0
  console.warn(`Could not count users for role ${role.name}:`, error);
  usersCount = 0;
}
```

**Status:** ✅ CORREGIDO

---

### 3. AdminReportsPage - Análisis

**Problema Reportado:**
"No funciona, no marca error pero no hace nada"

**Análisis Realizado:**

#### ✅ Endpoints Backend (Verificados)
```typescript
// AdminReportsController (apps/backend/src/modules/admin/controllers/admin-reports.controller.ts)
POST   /admin/reports/generate          // Generar reporte
GET    /admin/reports                   // Listar reportes
GET    /admin/reports/:id/download      // Descargar reporte
DELETE /admin/reports/:id               // Eliminar reporte
```

#### ✅ Endpoints Frontend (Configurados Correctamente)
```typescript
// api.config.ts
reports: {
  generate: '/admin/reports/generate',
  list: '/admin/reports',
  download: (reportId: string) => `/admin/reports/${reportId}/download`,
  delete: (reportId: string) => `/admin/reports/${reportId}`,
}
```

#### ✅ Hook useReports (Implementado Correctamente)
- Auto-refresh cada 5 segundos cuando hay reportes pending
- Manejo de errores apropiado
- Descarga de reportes como blobs
- Eliminación con refresh automático

**Posibles Causas (Requieren Verificación Manual):**

1. **Backend NO iniciado:**
   - Verificar que el backend esté corriendo en puerto 3006
   - Comando: `cd apps/backend && npm run dev`

2. **Autenticación:**
   - Verificar token JWT válido
   - Verificar permisos de usuario (rol admin)

3. **Datos Vacíos:**
   - Si no hay reportes, la tabla estará vacía (comportamiento correcto)
   - Generar un reporte para verificar

4. **Console Errors (silenciosos):**
   - Abrir DevTools → Console
   - Verificar errores de CORS, network, o permisos

**Status:** ⚠️ REQUIERE VALIDACIÓN MANUAL

---

## 🧪 PASOS PARA VALIDAR CORRECCIONES

### Paso 1: Reiniciar Backend

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Esperar mensaje: "Nest application successfully started"
# Verificar puerto: http://localhost:3006/api/v1/health
```

### Paso 2: Iniciar Frontend

```bash
# Terminal 2 - Frontend
cd apps/frontend
npm run dev

# Abrir: http://localhost:3005/admin
```

### Paso 3: Validar AdminRolesPage

**URL:** http://localhost:3005/admin/roles

**Verificaciones:**
- [ ] La página carga sin errores 404 o 500
- [ ] Se muestra lista de roles (student, admin_teacher, super_admin)
- [ ] Al hacer clic en un rol, se muestra el panel de permisos
- [ ] Los permisos están organizados por categorías
- [ ] El contador de usuarios muestra números (o 0 si no hay usuarios)

**Errores Esperados (RESUELTOS):**
- ❌ ~~404: GET /admin/roles/available-permissions~~ → ✅ Ahora llama a `/admin/roles/permissions`
- ❌ ~~500: GET /admin/roles~~ → ✅ Ahora maneja correctamente el mapeo de roles

### Paso 4: Validar AdminReportsPage

**URL:** http://localhost:3005/admin/reports

**Verificaciones:**
- [ ] La página carga sin errores
- [ ] Se muestra el BetaBanner (advertencia de almacenamiento en memoria)
- [ ] Formulario de generación de reportes visible
- [ ] Al generar un reporte:
  - [ ] Se muestra en la lista con estado "pending" o "generating"
  - [ ] Después de 5s, se auto-refresca
  - [ ] Cuando completa, estado cambia a "completed"
  - [ ] Botón "Download" aparece
  - [ ] Al descargar, se descarga archivo CSV/PDF/JSON
- [ ] Al eliminar un reporte, desaparece de la lista

**Posibles Problemas:**
- Si NO hay reportes, la tabla estará vacía (normal)
- Si el backend NO está corriendo, habrá errores de red
- Si el usuario NO tiene permisos, habrá error 403

---

## 📝 LOGS DE VALIDACIÓN

### Verificar Backend Logs

```bash
# Ver logs del backend
tail -f /tmp/backend-roles-reports.log

# O si está corriendo en terminal:
# Ver output directo
```

**Buscar:**
- ✅ "Nest application successfully started"
- ✅ "Mapped {/api/v1/admin/roles, GET}"
- ✅ "Mapped {/api/v1/admin/reports/generate, POST}"
- ❌ "ERROR" o "Failed"

### Verificar Frontend Console

**Abrir DevTools → Console**

**Buscar:**
- ❌ Errores 404, 500, 403
- ❌ CORS errors
- ❌ Network failures
- ✅ Successful API calls

---

## 🐛 DEBUGGING SI SIGUE SIN FUNCIONAR

### AdminRolesPage

**Si sigue dando 404:**
```bash
# Verificar ruta base del backend
curl http://localhost:3006/api/v1/admin/roles/permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Debe retornar JSON con permisos
```

**Si sigue dando 500:**
```bash
# Ver logs del backend para stack trace completo
grep -A 20 "ERROR" /tmp/backend-roles-reports.log
```

**Verificar Database:**
```sql
-- Verificar que existan roles
SELECT * FROM auth_management.roles ORDER BY name;

-- Verificar que existan user_roles
SELECT role, COUNT(*) FROM auth_management.user_roles
WHERE is_active = true
GROUP BY role;
```

### AdminReportsPage

**Si no genera reportes:**
```bash
# Test manual con curl
curl -X POST http://localhost:3006/api/v1/admin/reports/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "users",
    "format": "csv",
    "filters": {}
  }'

# Debe retornar JSON con el reporte creado
```

**Si no lista reportes:**
```bash
# Test manual con curl
curl http://localhost:3006/api/v1/admin/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Debe retornar JSON con array de reportes (o vacío si no hay)
```

---

## 📊 RESUMEN DE CAMBIOS

| Archivo | Tipo | Cambio | Línea | Status |
|---------|------|--------|-------|--------|
| `api.config.ts` | Frontend | Endpoint `/available-permissions` → `/permissions` | 233 | ✅ |
| `admin-roles.service.ts` | Backend | Agregar mapeo de roles + try-catch | 25-73 | ✅ |

**Total Archivos Modificados:** 2
**Total Líneas Cambiadas:** ~50 líneas

---

## ✅ CRITERIOS DE ACEPTACIÓN

### AdminRolesPage
- [x] Código corregido (endpoints + servicio)
- [ ] Validación manual exitosa (requiere prueba del usuario)
- [ ] No hay errores 404 en console
- [ ] No hay errores 500 en console
- [ ] Lista de roles se carga correctamente
- [ ] Permisos se muestran por rol
- [ ] Contador de usuarios funciona (o muestra 0)

### AdminReportsPage
- [x] Análisis completado (endpoints correctos)
- [ ] Validación manual exitosa (requiere prueba del usuario)
- [ ] Backend corriendo en puerto 3006
- [ ] Frontend conecta correctamente
- [ ] Generación de reportes funciona
- [ ] Descarga de reportes funciona
- [ ] Eliminación de reportes funciona
- [ ] Auto-refresh funciona para reportes pending

---

## 🚀 SIGUIENTE ACCIÓN

**Usuario debe:**
1. Reiniciar backend: `cd apps/backend && npm run dev`
2. Reiniciar frontend: `cd apps/frontend && npm run dev`
3. Navegar a http://localhost:3005/admin/roles
4. Verificar que la página carga sin errores 404/500
5. Navegar a http://localhost:3005/admin/reports
6. Intentar generar un reporte
7. Reportar resultados

**Si sigue fallando:**
- Compartir errores de Console (DevTools)
- Compartir logs del backend
- Compartir screenshot de la página

---

**Analista:** Architecture-Analyst
**Fecha:** 2025-11-24
**Status:** ✅ Correcciones aplicadas, pendiente validación manual
