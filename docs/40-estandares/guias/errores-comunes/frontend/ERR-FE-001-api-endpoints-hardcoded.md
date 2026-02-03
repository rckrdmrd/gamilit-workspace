# ERR-FE-001: Endpoints API Hardcodeados

## Descripcion
Los servicios de API en el frontend usan rutas hardcodeadas en lugar del archivo centralizado `api.config.ts`, causando inconsistencias y errores difíciles de detectar.

## Sintomas
- Errores 404 en producción cuando el prefijo de API cambia
- Cambiar una ruta requiere modificar múltiples archivos
- Dificultad para identificar todos los endpoints usados
- Prefijo `/api/v1` duplicado (ej: `/api/v1/api/v1/resource`)

## Causa Raiz
Los desarrolladores crean nuevos servicios API copiando código existente sin usar el sistema centralizado `API_ENDPOINTS` definido en `src/config/api.config.ts`.

## Solucion

### 1. Identificar endpoints hardcodeados
```bash
# Buscar rutas hardcodeadas en servicios API
grep -r "api/v1" src/services/api/ --include="*.ts"
grep -r "fetch\|axios" src/services/api/ --include="*.ts" | grep -v "API_ENDPOINTS"
```

### 2. Agregar endpoint a api.config.ts
```typescript
// src/config/api.config.ts
export const API_ENDPOINTS = {
  // ... existentes ...

  // Agregar nuevo namespace
  newFeature: {
    list: '/new-feature',
    get: (id: string) => `/new-feature/${id}`,
    create: '/new-feature',
    update: (id: string) => `/new-feature/${id}`,
  },
};
```

### 3. Usar en el servicio
```typescript
// ANTES (incorrecto)
const response = await apiClient.get('/api/v1/new-feature');

// DESPUES (correcto)
import { API_ENDPOINTS } from '@/config/api.config';
const response = await apiClient.get(API_ENDPOINTS.newFeature.list);
```

## Prevencion

1. **Revisar PRs** para detectar rutas hardcodeadas en servicios API
2. **Linting rule** (opcional): Crear regla ESLint para detectar strings con `/api/`
3. **Template de servicio**: Usar template que importe API_ENDPOINTS
4. **Documentacion**: Referir a api.config.ts en onboarding

### Checklist antes de crear servicio API:
- [ ] Endpoints definidos en `api.config.ts`
- [ ] Servicio importa `API_ENDPOINTS`
- [ ] No hay strings con `/api/` hardcodeados
- [ ] Rutas usan funciones para IDs dinamicos

## Ocurrencias

| Fecha | Archivo | Commit | Estado |
|-------|---------|--------|--------|
| 2025-12-28 | schoolsAPI.ts | - | Resuelto |
| 2025-12-28 | missionsAPI.ts | - | Resuelto |
| 2025-12-28 | teacherMessagesApi.ts | - | Resuelto |
| 2025-11-24 | Multiple files | - | Resuelto |
| 2025-11-23 | interventionAlertsApi.ts | - | Resuelto |
| 2025-10-27 | Varios servicios | - | Resuelto |

## Referencias

- **Archivo centralizado:** `apps/frontend/src/config/api.config.ts`
- **Informe correccion:** `orchestration/agentes/requirements-analyst/INFORME-FINAL-VALIDACION-INTEGRACION-2025-12-28.md`
- **Patron recomendado:** `docs/98-standards/API-NAMING-CONVENTIONS.md`

---

**Severidad:** Alta
**Frecuencia:** 6+ ocurrencias
**Tiempo de resolucion:** 15-30 min por servicio
**Ultimo update:** 2025-12-28
