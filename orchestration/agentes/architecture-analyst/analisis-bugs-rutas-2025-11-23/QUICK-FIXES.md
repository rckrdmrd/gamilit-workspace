# Quick Fixes - Acciones Inmediatas (P0)

**Estimado:** 2-3 horas de trabajo
**Impacto:** Resolver bugs criticos que causan 404 errors

---

## Fix 1: AssignmentsController Prefix Duplicado

**Severidad:** CRITICO
**Tiempo:** 15 minutos
**Archivo:** `/apps/backend/src/modules/assignments/controllers/assignments.controller.ts:32`

### Cambio:

```diff
- @Controller('api/teacher/assignments')
+ @Controller('teacher/assignments')
- // @UseGuards(JwtAuthGuard, RolesGuard)
- // @Roles('teacher', 'admin_teacher')
+ @UseGuards(JwtAuthGuard, RolesGuard)
+ @Roles('teacher', 'admin_teacher')
```

### Validacion:

```bash
# Test que el endpoint responde correctamente
curl -X GET http://localhost:3006/api/teacher/assignments \
  -H "Authorization: Bearer YOUR_TOKEN"

# Deberia retornar 200, no 404
```

---

## Fix 2: Corregir api-endpoints.ts Variable de Entorno

**Severidad:** CRITICO
**Tiempo:** 10 minutos
**Archivo:** `/apps/frontend/src/shared/constants/api-endpoints.ts:19`

### Cambio:

```diff
- const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
+ const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api';
```

### Validacion:

```bash
# Verificar que .env tiene la variable correcta
grep VITE_API_URL apps/frontend/.env
# Deberia mostrar: VITE_API_URL=http://localhost:3006/api

# Rebuild frontend
cd apps/frontend
npm run build
```

---

## Fix 3: Estandarizar Controllers que Hardcodean Rutas

**Severidad:** ALTO
**Tiempo:** 30 minutos

### Archivos a Modificar:

#### 1. MissionsController
**Archivo:** `/apps/backend/src/modules/gamification/controllers/missions.controller.ts:42`

```diff
- @Controller('gamification/missions')
+ @Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))
```

Luego actualizar routes en endpoints usando el path correcto:
```typescript
@Get('missions')  // Ahora ruta relativa
@Post('missions')
// etc...
```

#### 2. RanksController
**Archivo:** `/apps/backend/src/modules/gamification/controllers/ranks.controller.ts:55`

```diff
- @Controller('gamification/ranks')
+ @Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))
```

#### 3. ComodinesController
**Archivo:** `/apps/backend/src/modules/gamification/controllers/comodines.controller.ts:57`

```diff
- @Controller('gamification/comodines')
+ @Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))
```

### Nota Importante:

Estos controllers comparten base path `gamification/`. Necesitaran subdirectorios en sus decoradores:

```typescript
@Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))
export class MissionsController {
  @Get('missions')  // Resulta en /api/gamification/missions
  // ...
}
```

O, agregar rutas especificas a `routes.constants.ts`:

```typescript
GAMIFICATION: {
  BASE: '/gamification',
  MISSIONS_BASE: '/gamification/missions',
  RANKS_BASE: '/gamification/ranks',
  COMODINES_BASE: '/gamification/comodines',
}
```

Y usar:
```typescript
@Controller(extractBasePath(API_ROUTES.GAMIFICATION.MISSIONS_BASE))
```

---

## Fix 4: Corregir Tenant Header Case

**Severidad:** MEDIO
**Tiempo:** 5 minutos

### Archivo 1: `/apps/frontend/src/services/api/apiClient.ts:59`

```diff
- config.headers['X-Tenant-Id'] = tenantId;
+ config.headers['X-Tenant-ID'] = tenantId;
```

### Archivo 2: Ya correcto en `/apps/frontend/src/features/auth/api/apiClient.ts:34`

```typescript
config.headers['X-Tenant-ID'] = user.tenantId;  // ✓ Correcto
```

### Validacion:

Verificar que backend espera `X-Tenant-ID`:

```bash
grep -r "X-Tenant" apps/backend/src
```

---

## Fix 5: Agregar Rutas Faltantes a routes.constants.ts

**Severidad:** MEDIO
**Tiempo:** 20 minutos
**Archivo:** `/apps/backend/src/shared/constants/routes.constants.ts`

### Agregar:

```typescript
export const API_ROUTES = {
  // ... existing routes ...

  // Teacher Module (NUEVO)
  TEACHER: {
    BASE: '/teacher',
    ASSIGNMENTS: '/teacher/assignments',
    ASSIGNMENT_BY_ID: (id: string) => `/teacher/assignments/${id}`,
    ASSIGNMENT_ASSIGN: (id: string) => `/teacher/assignments/${id}/assign`,
    ASSIGNMENT_SUBMISSIONS: (id: string) => `/teacher/assignments/${id}/submissions`,
    GRADE_SUBMISSION: (assignmentId: string, submissionId: string) =>
      `/teacher/assignments/${assignmentId}/submissions/${submissionId}/grade`,
    PATCH_ASSIGNMENT: (id: string) => `/teacher/assignments/${id}`,
    DISTRIBUTE_ASSIGNMENT: (id: string) => `/teacher/assignments/${id}/distribute`,
    DUPLICATE_ASSIGNMENT: (id: string) => `/teacher/assignments/${id}/duplicate`,
  },

  // ... rest of routes ...
} as const;
```

---

## Fix 6: Validacion de Deployment

**Tiempo:** 10 minutos

### Checklist Pre-Deploy:

```bash
# 1. Backend - Verificar que compila
cd apps/backend
npm run build

# 2. Backend - Run tests
npm run test

# 3. Frontend - Verificar que compila
cd ../frontend
npm run build

# 4. Frontend - Run tests
npm run test

# 5. Verificar que .env esta correcto
cat .env | grep VITE_API_URL

# 6. Start backend
cd ../backend
npm run start:dev

# 7. En otra terminal, verificar endpoints
curl http://localhost:3006/api/health
curl http://localhost:3006/api/teacher/assignments \
  -H "Authorization: Bearer YOUR_TOKEN"

# 8. Start frontend
cd ../frontend
npm run dev

# 9. Probar en browser
# Navegar a http://localhost:5173
# Login como teacher
# Intentar crear/ver assignments
```

---

## Fix 7: Update Documentation

**Tiempo:** 15 minutos

Crear archivo de migracion para otros desarrolladores:

```markdown
# API Migration Notes - 2025-11-23

## Breaking Changes

### AssignmentsController Routes Fixed

**OLD (broken):**
- `/api/api/teacher/assignments/*` (404)

**NEW (fixed):**
- `/api/teacher/assignments/*` (200)

### Action Required:

Si tienes codigo que llama a assignments:

```typescript
// ANTES (workaround para bug)
const response = await fetch('/api/api/teacher/assignments');

// AHORA (correcto)
import { apiClient } from '@/services/api/apiClient';
const response = await apiClient.get('/teacher/assignments');
```

### Frontend Constants Updated

- Variable `VITE_API_BASE_URL` removed
- Use `VITE_API_URL` instead
- Port changed from 3000 to 3006

Update your local `.env`:
```bash
VITE_API_URL=http://localhost:3006/api
```
```

---

## Testing Checklist

Despues de aplicar fixes, verificar:

- [ ] Backend compila sin errores
- [ ] Frontend compila sin errores
- [ ] Health endpoint responde: `GET /api/health`
- [ ] Assignments endpoints responden: `GET /api/teacher/assignments`
- [ ] Login funciona en frontend
- [ ] Teacher puede crear assignment
- [ ] Teacher puede ver assignments
- [ ] No hay errores 404 en console
- [ ] Tests pasan (backend + frontend)

---

## Rollback Plan

Si algo sale mal:

```bash
# Backend
git checkout HEAD -- apps/backend/src/modules/assignments/controllers/assignments.controller.ts

# Frontend
git checkout HEAD -- apps/frontend/src/shared/constants/api-endpoints.ts

# Rebuild
cd apps/backend && npm run build
cd ../frontend && npm run build

# Restart
npm run dev
```

---

## Estimated Timeline

| Fix | Time | Cumulative |
|-----|------|------------|
| Fix 1: AssignmentsController | 15 min | 15 min |
| Fix 2: api-endpoints.ts | 10 min | 25 min |
| Fix 3: Estandarizar Controllers | 30 min | 55 min |
| Fix 4: Tenant Header | 5 min | 60 min |
| Fix 5: routes.constants.ts | 20 min | 80 min |
| Fix 6: Validacion | 10 min | 90 min |
| Fix 7: Documentation | 15 min | 105 min |
| **TOTAL** | **1h 45min** | |

Buffer adicional: +30min para issues inesperados = **~2 horas**

---

## Next Steps (No Urgente)

Despues de aplicar quick fixes, seguir con:

1. Unificar axios instances (Fase 2)
2. Reemplazar fetch() calls (Fase 2)
3. Implementar validacion automatica (Fase 2)
4. Ver REPORTE-ANALISIS-BUGS.md para plan completo

---

**Created:** 2025-11-23
**Author:** Architecture Analyst Agent
