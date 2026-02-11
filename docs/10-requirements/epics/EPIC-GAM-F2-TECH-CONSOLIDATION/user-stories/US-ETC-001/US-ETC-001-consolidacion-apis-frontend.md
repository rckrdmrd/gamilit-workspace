# US-ETC-001: Consolidacion de APIs Frontend

**Historia de Usuario ID:** US-ETC-001
**EPIC:** ETC-001 - Consolidacion Tecnica
**Sprint:** 2
**Story Points:** 8
**Estado:** Planificada

---

## Historia

**Como** desarrollador frontend
**Quiero** tener una unica fuente de verdad para cada API service
**Para** evitar confusion, bugs por desincronizacion y reducir el bundle size

---

## Contexto

Durante el desarrollo iterativo del frontend, se crearon multiples versiones de los mismos API services en diferentes ubicaciones:

| API Service | Versiones | Ubicaciones |
|-------------|-----------|-------------|
| gamificationAPI | 3 | services/api/, features/gamification/api/, lib/api/ |
| adminAPI | 2 | services/api/, features/admin/api/ |
| educationalAPI | 2 | services/api/, lib/api/ |
| progressAPI | 2 | features/progress/api/, lib/api/ |

Esta duplicacion genera:
- Riesgo de bugs por implementaciones divergentes
- Confusion sobre cual version usar
- Aumento innecesario del bundle size
- Dificultad de mantenimiento

---

## Tareas

### TASK-001: Consolidar gamificationAPI
**Estimacion:** 4h

1. Analizar las 3 versiones existentes
2. Identificar funcionalidades unicas de cada una
3. Crear version consolidada en `lib/api/gamification.api.ts`
4. Actualizar imports en componentes afectados
5. Eliminar versiones redundantes
6. Verificar build y tests

**Archivos a modificar:**
- `apps/frontend/src/services/api/gamificationAPI.ts` (ELIMINAR)
- `apps/frontend/src/features/gamification/api/gamificationAPI.ts` (ELIMINAR)
- `apps/frontend/src/lib/api/gamification.api.ts` (CONSOLIDAR)
- Componentes que importan de las versiones eliminadas

### TASK-002: Consolidar adminAPI
**Estimacion:** 2h

1. Comparar `services/api/adminAPI.ts` (50K) vs `features/admin/api/adminAPI.ts` (8K)
2. Mantener version completa en `services/api/`
3. Actualizar imports
4. Eliminar version parcial

**Archivos a modificar:**
- `apps/frontend/src/features/admin/api/adminAPI.ts` (ELIMINAR)
- Componentes que importan de la version eliminada

### TASK-003: Consolidar educationalAPI
**Estimacion:** 1h

1. Comparar versiones
2. Consolidar en ubicacion canonica
3. Actualizar imports
4. Eliminar redundante

### TASK-004: Consolidar progressAPI
**Estimacion:** 1h

1. Comparar versiones
2. Consolidar en ubicacion canonica
3. Actualizar imports
4. Eliminar redundante

---

## Criterios de Aceptacion

- [ ] Solo 1 version de cada API service existe
- [ ] Todos los imports actualizados correctamente
- [ ] Build exitoso sin warnings
- [ ] Tests pasando
- [ ] Bundle size reducido (verificar con `npm run build`)

---

## Definition of Done

- [ ] Codigo consolidado y revisado
- [ ] Imports actualizados en todos los archivos afectados
- [ ] Build `npm run build` exitoso
- [ ] Tests `npm run test` pasando
- [ ] FRONTEND_INVENTORY.yml actualizado
- [ ] Commit con mensaje descriptivo

---

## Notas Tecnicas

### Convencion de Ubicacion
Despues de la consolidacion:
- APIs principales: `lib/api/{nombre}.api.ts`
- Re-exports opcionales: `services/api/index.ts`

### Patron de Import
```typescript
// Correcto
import { gamificationApi } from '@/lib/api/gamification.api';

// Evitar
import { gamificationApi } from '@/services/api/gamificationAPI';
import { gamificationApi } from '@/features/gamification/api/gamificationAPI';
```

---

**Creado:** 2026-01-16
**Asignado:** NEXUS-FRONTEND
