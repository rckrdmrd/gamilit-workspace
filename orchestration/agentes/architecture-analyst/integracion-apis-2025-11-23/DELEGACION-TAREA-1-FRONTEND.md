# DELEGACIÓN: Tarea 1 - Integración API Gamificación

**Fecha:** 2025-11-23
**Delegado por:** Architecture-Analyst
**Delegado a:** Frontend-Developer
**Prioridad:** P0 - CRÍTICA para MVP
**Estimación:** 2-3 días (11.5 horas efectivas)
**Estado:** INICIADO

---

## 📋 CONTEXTO

Se ha completado el **análisis completo** de los portales Admin y Teacher, identificando que:

1. **Backend**: 100% funcional con 9 endpoints para gamificación (US-AE-005) YA implementados
2. **Frontend**: AdminGamificationPage usa datos HARDCODEADOS (líneas 38-71)
3. **Gap Crítico**: APIs existen pero NO están conectadas al frontend

**Reporte de Análisis:** `/orchestration/reportes/REPORTE-CONSOLIDADO-PORTALES-ADMIN-TEACHER-2025-11-23.md`

**Plan Completo:** `/orchestration/agentes/architecture-analyst/integracion-apis-2025-11-23/PLAN-DETALLADO-INTEGRACION-APIS.md`

**User Story:** US-AE-005 - Parametrización de Gamificación

---

## 🎯 OBJETIVO DE LA TAREA

**Eliminar datos hardcodeados** del `AdminGamificationPage.tsx` y conectarlo con los 9 endpoints backend ya implementados para consumir información REAL de la base de datos.

### Endpoints Backend Disponibles

Todos estos endpoints YA EXISTEN y están funcionales:

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| GET | `/api/admin/gamification/config/parameters` | Lista parámetros |
| GET | `/api/admin/gamification/config/parameters/:key` | Obtiene parámetro específico |
| PATCH | `/api/admin/gamification/config/parameters/:key` | Actualiza parámetro |
| POST | `/api/admin/gamification/config/parameters/:key/reset` | Resetea parámetro |
| POST | `/api/admin/gamification/config/parameters/bulk-update` | Actualización masiva |
| GET | `/api/admin/gamification/config/maya-ranks` | Lista rangos Maya |
| GET | `/api/admin/gamification/config/maya-ranks/:id` | Obtiene rango específico |
| PATCH | `/api/admin/gamification/config/maya-ranks/:id` | Actualiza rango |
| GET | `/api/admin/gamification/config/stats` | Estadísticas generales |

---

## 📂 ARCHIVOS A TRABAJAR

### Archivos Nuevos a Crear (3)

1. **`apps/frontend/src/types/admin/gamification.types.ts`**
   - Interfaces TypeScript para DTOs
   - 9 interfaces completas
   - Código completo en el plan detallado

2. **`apps/frontend/src/services/api/admin/gamificationConfigApi.ts`**
   - Cliente API con Axios
   - 9 métodos que consumen los endpoints backend
   - Código completo en el plan detallado

3. **`apps/frontend/src/apps/admin/hooks/useGamificationConfig.ts`**
   - Hook de React Query
   - 5 queries + 5 mutations
   - Código completo en el plan detallado

### Archivos a Modificar (1)

4. **`apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx`**
   - **ELIMINAR:** Líneas 38-71 (arrays hardcodeados)
   - **REEMPLAZAR:** Por llamadas a hooks `useGamificationConfig()`
   - Código de refactor completo en el plan detallado

---

## 🛠️ PASOS DE IMPLEMENTACIÓN

### Paso 1: Crear DTOs (30 min)

```bash
# Crear archivo de tipos
touch apps/frontend/src/types/admin/gamification.types.ts
```

**Contenido:** Ver sección 1.1 del plan detallado (líneas 98-196)

**Validación:**
```bash
# Compilar sin errores
npx tsc --noEmit
```

---

### Paso 2: Crear API Client (1 hora)

```bash
# Crear directorio si no existe
mkdir -p apps/frontend/src/services/api/admin

# Crear archivo
touch apps/frontend/src/services/api/admin/gamificationConfigApi.ts
```

**Contenido:** Ver sección 1.2 del plan detallado (líneas 202-348)

**Validación:**
```bash
# Compilar sin errores
npx tsc --noEmit

# Verificar imports
grep -r "gamificationConfigApi" apps/frontend/src/
```

---

### Paso 3: Crear Hook de React Query (1.5 horas)

```bash
# Crear archivo
touch apps/frontend/src/apps/admin/hooks/useGamificationConfig.ts
```

**Contenido:** Ver sección 1.3 del plan detallado (líneas 354-600+)

**Características:**
- 5 queries: `useParameters`, `useParameter`, `useMayaRanks`, `useMayaRank`, `useStats`
- 5 mutations: `updateParameter`, `resetParameter`, `bulkUpdateParameters`, `updateMayaRank`, `previewImpact`
- Invalidación automática de queries
- Toast notifications
- Error handling

**Validación:**
```bash
# Compilar sin errores
npx tsc --noEmit
```

---

### Paso 4: Refactorizar AdminGamificationPage (3-4 horas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx`

**Acción 1:** Eliminar datos hardcodeados (líneas 38-71)

**ANTES:**
```typescript
const mayaRanks = [
  { id: 1, name: 'AJAW', level: 1, minXp: 0, maxXp: 499, ... },
  // ... más datos hardcodeados
];

const achievements = [/* hardcoded */];
const economyStats = {/* hardcoded */};
```

**DESPUÉS:**
```typescript
const { useParameters, useMayaRanks, useStats } = useGamificationConfig();

const { data: stats, isLoading: statsLoading } = useStats();
const { data: parametersData, isLoading: parametersLoading } = useParameters();
const { data: mayaRanks, isLoading: ranksLoading } = useMayaRanks();
```

**Acción 2:** Actualizar componentes para usar data real

**Ver:** Sección 1.4 del plan detallado para código completo del refactor

**Validación:**
```bash
# Compilar sin errores
npm run build

# Verificar que no quedan datos hardcodeados
grep -n "const mayaRanks = \[" apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx
# Debe retornar VACÍO
```

---

### Paso 5: Crear Tests Básicos (2 horas)

**Archivo:** `apps/frontend/src/apps/admin/hooks/__tests__/useGamificationConfig.test.ts`

**Crear tests para:**
- Queries funcionan correctamente
- Mutations actualizan cache
- Error handling funciona
- Loading states correctos

**Ver:** Sección 1.5 del plan detallado para código de tests

---

### Paso 6: Testing Manual (1.5 horas)

**Checklist de validación:**

```bash
# 1. Iniciar backend
cd apps/backend
npm run dev

# 2. Iniciar frontend
cd apps/frontend
npm run dev

# 3. Login como admin
# Email: admin@gamilit.com
# Password: Test1234

# 4. Navegar a Admin → Gamificación
```

**Validaciones en UI:**

- [ ] Los rangos Maya se cargan desde API (no hardcodeados)
- [ ] Los parámetros se muestran con datos reales
- [ ] Las estadísticas reflejan datos de BD
- [ ] Se pueden editar parámetros y se guardan
- [ ] Los cambios se reflejan inmediatamente (invalidación de cache)
- [ ] Los errores muestran toasts apropiados
- [ ] Loading states funcionan correctamente

**Verificar en DevTools → Network:**

- [ ] Se hacen llamadas a `/api/admin/gamification/config/parameters`
- [ ] Se hacen llamadas a `/api/admin/gamification/config/maya-ranks`
- [ ] Se hacen llamadas a `/api/admin/gamification/config/stats`
- [ ] Respuestas tienen status 200
- [ ] NO hay errores 404 o 500

---

## 📊 CRITERIOS DE ACEPTACIÓN

### Funcionales

1. ✅ AdminGamificationPage carga datos desde API real (NO hardcoded)
2. ✅ Se pueden ver los 40+ parámetros de gamificación desde BD
3. ✅ Se pueden ver los 6 rangos Maya desde BD
4. ✅ Se pueden editar parámetros y cambios persisten en BD
5. ✅ Se pueden editar rangos Maya y cambios persisten en BD
6. ✅ Estadísticas reflejan datos reales de la base de datos
7. ✅ Loading states funcionan correctamente
8. ✅ Error handling muestra mensajes apropiados

### Técnicos

1. ✅ Código TypeScript sin errores de compilación
2. ✅ ESLint pasa sin warnings críticos
3. ✅ Tests unitarios del hook pasan (>80% coverage)
4. ✅ Build de frontend exitoso
5. ✅ No quedan datos hardcodeados en AdminGamificationPage
6. ✅ Separation of concerns: DTOs → API → Hook → Component
7. ✅ React Query configurado correctamente (staleTime, invalidation)

---

## 🚨 PUNTOS CRÍTICOS

### ⚠️ NO hacer

1. **NO modificar backend** - Los endpoints YA existen y funcionan
2. **NO modificar base de datos** - Los datos YA existen en seeds
3. **NO crear mocks** - Usar APIs reales
4. **NO cambiar estructura de DTOs backend** - Respetar contratos existentes

### ✅ Sí hacer

1. **SÍ eliminar TODO el código hardcodeado** de AdminGamificationPage
2. **SÍ usar React Query** para data fetching
3. **SÍ manejar loading states** apropiadamente
4. **SÍ manejar errores** con toasts
5. **SÍ hacer commits atómicos** (un commit por archivo/funcionalidad)

---

## 📝 COMMITS SUGERIDOS

```bash
# Commit 1
git add apps/frontend/src/types/admin/gamification.types.ts
git commit -m "feat(admin): add gamification DTOs for US-AE-005

- Add GamificationParameter interface
- Add MayaRank interface
- Add GamificationStats interface
- Add update DTOs for parameters and ranks

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 2
git add apps/frontend/src/services/api/admin/gamificationConfigApi.ts
git commit -m "feat(admin): add gamification config API client

- Implement 9 methods for gamification endpoints
- Parameters CRUD operations
- Maya Ranks CRUD operations
- Stats and preview endpoints

Connects to existing US-AE-005 backend endpoints

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 3
git add apps/frontend/src/apps/admin/hooks/useGamificationConfig.ts
git commit -m "feat(admin): add useGamificationConfig React Query hook

- Add 5 queries (parameters, maya ranks, stats)
- Add 5 mutations (update, reset, bulk update)
- Implement cache invalidation
- Add toast notifications

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 4
git add apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx
git commit -m "refactor(admin): connect AdminGamificationPage to real API

- Remove hardcoded mayaRanks array (lines 38-71)
- Remove hardcoded achievements and stats
- Connect to useGamificationConfig hook
- Consume real data from backend

Completes US-AE-005 frontend integration

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 5
git add apps/frontend/src/apps/admin/hooks/__tests__/useGamificationConfig.test.ts
git commit -m "test(admin): add tests for useGamificationConfig hook

- Test all queries work correctly
- Test mutations update cache
- Test error handling
- Test loading states

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 📚 RECURSOS DE REFERENCIA

### Documentación

- **Plan Detallado Completo:** `/orchestration/agentes/architecture-analyst/integracion-apis-2025-11-23/PLAN-DETALLADO-INTEGRACION-APIS.md`
- **Reporte de Análisis:** `/orchestration/reportes/REPORTE-CONSOLIDADO-PORTALES-ADMIN-TEACHER-2025-11-23.md`
- **Diseño de Mecánicas:** `/docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md`

### Backend Existente

- **Controller:** `apps/backend/src/modules/admin/controllers/admin-gamification-config.controller.ts`
- **Service:** `apps/backend/src/modules/admin/services/gamification-config.service.ts`
- **DTOs Backend:** `apps/backend/src/modules/admin/dto/gamification-config/`
- **Tests Backend:** `apps/backend/src/modules/admin/__tests__/admin-gamification-config-us-ae-005.controller.spec.ts`

### Frontend Existente

- **Página a Modificar:** `apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx`
- **API Client Base:** `apps/frontend/src/services/api/apiClient.ts`
- **Hooks Ejemplo:** `apps/frontend/src/apps/admin/hooks/useOrganizations.ts`

---

## ⏱️ TIMELINE DETALLADO

| Hora | Actividad | Entregable |
|------|-----------|------------|
| 0-0.5h | Crear DTOs | `gamification.types.ts` |
| 0.5-1.5h | Crear API Client | `gamificationConfigApi.ts` |
| 1.5-3h | Crear Hook React Query | `useGamificationConfig.ts` |
| 3-7h | Refactorizar AdminGamificationPage | Página sin hardcode |
| 7-9h | Crear tests básicos | Tests del hook |
| 9-10.5h | Testing manual + ajustes | Validación completa |
| 10.5-11.5h | Code review + commits | Git history limpio |

**Total: 11.5 horas → 2 días de trabajo**

---

## 🎯 PRÓXIMOS PASOS POST-TAREA-1

Una vez completada la Tarea 1, se procederá con:

1. **Tarea 2:** Seeds de Assignments (4 horas) - Database-Agent
2. **Tarea 3:** UI Classroom-Teacher (3 días) - Frontend-Agent
3. **Tarea 4:** Fix Wrappers (4 horas) - Frontend-Agent

**NO iniciar otras tareas hasta que Tarea 1 esté completa y validada.**

---

## 📞 CONTACTO Y SOPORTE

**Delegado por:** Architecture-Analyst
**Para dudas:** Consultar plan detallado o escalar a Architecture-Analyst
**Validación:** Architecture-Analyst revisará al completar

---

**FIN DE LA DELEGACIÓN**

**Fecha:** 2025-11-23
**Estado:** INICIADO - Esperando ejecución de Frontend-Developer
**Próxima Revisión:** Al completar Paso 6 (Testing Manual)
