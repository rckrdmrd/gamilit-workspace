# ERR-BE-001: Endpoints con Prefijo Duplicado

## Descripcion
Los controladores de backend definen rutas que ya incluyen el prefijo `/api/v1`, causando que la ruta final tenga prefijo duplicado (`/api/v1/api/v1/resource`).

## Sintomas
- Error 404 en todas las llamadas al endpoint
- Ruta funciona en desarrollo pero no en produccion
- Swagger muestra rutas correctas pero no funcionan
- Logs muestran rutas con prefijo duplicado

## Causa Raiz
1. El `main.ts` ya configura prefijo global: `app.setGlobalPrefix('api/v1')`
2. El controlador tambien incluye `/api/v1` en su decorador `@Controller`
3. Resultado: `/api/v1` + `/api/v1/resource` = `/api/v1/api/v1/resource`

## Solucion

### 1. Verificar configuracion global
```typescript
// main.ts
app.setGlobalPrefix('api/v1'); // Ya define el prefijo
```

### 2. Corregir controlador
```typescript
// ANTES (incorrecto)
@Controller('api/v1/users')
export class UsersController { ... }

// DESPUES (correcto)
@Controller('users')
export class UsersController { ... }
```

### 3. Verificar frontend
```typescript
// ANTES (frontend con prefijo)
const response = await fetch('/api/v1/api/v1/users');

// DESPUES (frontend correcto)
const response = await fetch('/api/v1/users');
// O mejor: usar API_ENDPOINTS
const response = await apiClient.get(API_ENDPOINTS.users.list);
```

## Prevencion

1. **Nunca incluir `/api/v1`** en decoradores `@Controller()`
2. **Revisar main.ts** antes de agregar controladores
3. **Probar endpoints** con curl o Postman antes de commit
4. **Swagger**: Verificar que las rutas en /api/docs sean correctas

### Checklist para nuevos controladores:
- [ ] `@Controller()` NO tiene `/api/v1`
- [ ] Solo tiene el nombre del recurso (ej: `users`, `products`)
- [ ] Endpoint responde correctamente en `/api/v1/recurso`
- [ ] Swagger muestra ruta correcta

### Comando de verificacion
```bash
# Buscar controladores con prefijo incorrecto
grep -r "@Controller.*api/v1" apps/backend/src --include="*.ts"
```

## Ocurrencias

| Fecha | Controlador | Ruta Incorrecta | Estado |
|-------|-------------|-----------------|--------|
| 2025-12-28 | schoolsAPI.ts (FE) | /api/v1/api/v1/social/schools | Resuelto |
| 2025-11-24 | AlertsController | /api/v1/api/v1/alerts | Resuelto |
| 2025-10-27 | AdminController | /api/v1/api/v1/admin | Resuelto |

## Referencias

- **main.ts:** `apps/backend/src/main.ts`
- **Patron rutas:** `docs/98-standards/API-ROUTES-STANDARD.md`
- **Swagger:** http://localhost:3006/api/docs

---

**Severidad:** Critica (bloqueador)
**Frecuencia:** 3+ ocurrencias
**Tiempo de resolucion:** 5-10 min
**Ultimo update:** 2025-12-28
