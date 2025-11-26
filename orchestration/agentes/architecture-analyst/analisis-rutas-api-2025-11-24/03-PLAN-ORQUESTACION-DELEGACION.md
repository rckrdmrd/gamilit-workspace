# PLAN DE ORQUESTACIÓN Y DELEGACIÓN - CORRECCIÓN DE GAPS

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Estado:** Propuesto - Pendiente de aprobación
**Total Gaps:** 10 (4 Críticos, 3 Altos, 3 Medios)

---

## 📋 DECISIÓN: ORQUESTAR vs DELEGAR

Según el análisis realizado y siguiendo la directiva PROMPT-ARCHITECTURE-ANALYST.md, he decidido la siguiente estrategia:

### TAREAS A ORQUESTAR (Tool: Task) - RECOMENDADAS

Estas tareas son:
- ✅ Bien definidas y acotadas
- ✅ Contexto completo disponible
- ✅ NO requieren aprobación adicional
- ✅ Implementación inmediata deseada
- ✅ Especificación clara

**Total: 4 gaps (GAP-001, GAP-002, GAP-003, GAP-004)**

---

### TAREAS A DELEGAR (Manual) - REQUIEREN APROBACIÓN

Estas tareas son:
- ⚠️ Complejas o con múltiples fases
- ⚠️ Requieren decisiones arquitectónicas importantes
- ⚠️ Contexto requiere más investigación
- ⚠️ Mejor ejecutar con supervisión humana

**Total: 6 gaps (GAP-005 a GAP-010)**

---

## 🤖 PARTE 1: ORQUESTACIÓN INMEDIATA

### GAP-001: Fix Alerts Route (ORQUESTAR)

**Decisión:** ✅ ORQUESTAR con Frontend-Agent
**Razón:** Cambios simples y bien definidos, 3 archivos, modificaciones puntuales

**Especificación para orquestación:**

```markdown
AGENTE: Frontend-Developer
HERRAMIENTA: Task (subagent_type: "general-purpose")
DESCRIPCIÓN: Fix alerts route en portal admin

PROMPT COMPLETO:
"""
Lee el prompt PROMPT-FRONTEND-AGENT.md y actúa como Frontend-Agent.

TAREA: Corregir ruta de alerts en portal admin (GAP-001)

CONTEXTO:
El portal admin está intentando acceder a /admin/alerts pero el backend
expone /api/v1/admin/dashboard/alerts, causando errores 404.

PROBLEMA IDENTIFICADO:
- Frontend usa: /admin/alerts
- Backend expone: /api/v1/admin/dashboard/alerts
- Resultado: 404 Not Found

ARCHIVOS A MODIFICAR:

1. apps/frontend/src/services/api/apiConfig.ts
   Línea 304: Cambiar de '/admin/alerts' a '/v1/admin/dashboard/alerts'

2. apps/frontend/src/apps/admin/hooks/useSystemMonitoring.ts
   Línea 103: Reemplazar ruta hardcodeada por import de API_ENDPOINTS

3. apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts
   Línea 291: Reemplazar ruta hardcodeada por import de API_ENDPOINTS

ESPECIFICACIÓN DETALLADA:

Archivo 1: apiConfig.ts (línea 304)
ANTES:
alerts: '/admin/alerts',

DESPUÉS:
alerts: '/v1/admin/dashboard/alerts',

Archivo 2: useSystemMonitoring.ts (línea 103)
ANTES:
const response = await apiClient.get<{ success: boolean; data: SystemAlert[] }>(
  '/admin/alerts',
  { params: { dismissed: false, limit: 50 } }
);

DESPUÉS:
import { API_ENDPOINTS } from '@/services/api/apiConfig';

const response = await apiClient.get<{ success: boolean; data: SystemAlert[] }>(
  API_ENDPOINTS.admin.alerts,
  { params: { dismissed: false, limit: 50 } }
);

Archivo 3: useAdminDashboard.ts (línea 291)
ANTES:
await apiClient.post(`/admin/alerts/${alertId}/dismiss`);

DESPUÉS:
import { API_ENDPOINTS } from '@/services/api/apiConfig';

await apiClient.post(`${API_ENDPOINTS.admin.alerts}/${alertId}/dismiss`);

CRITERIOS DE ACEPTACIÓN:
- ✅ apiConfig.ts actualizado con ruta correcta
- ✅ useSystemMonitoring.ts importa API_ENDPOINTS
- ✅ useAdminDashboard.ts importa API_ENDPOINTS
- ✅ Código compila sin errores TypeScript
- ✅ No hay rutas hardcodeadas

RESTRICCIONES:
- NO modificar otros archivos fuera de los especificados
- NO cambiar lógica de negocio, solo rutas
- Mantener tipos TypeScript existentes
- Seguir ESTANDARES-NOMENCLATURA.md

VALIDACIÓN:
Después de los cambios:
1. Ejecutar npm run type-check
2. Verificar que compila sin errores
3. Buscar en código: grep -r "'/admin/alerts'" apps/frontend/src/apps/admin/
   (no debería encontrar nada hardcodeado)

REFERENCIAS:
- orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/01-MATRIZ-GAPS.yml (GAP-001)
- orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md (Sección 9.1, TAREA 1.2)
- orchestration/directivas/ESTANDARES-NOMENCLATURA.md
"""
```

**Estado:** Listo para orquestar
**Prioridad:** P0
**Estimación:** 30 minutos

---

### GAP-002: Fix Classroom-Teacher Duplicate /api (ORQUESTAR)

**Decisión:** ✅ ORQUESTAR con Frontend-Agent
**Razón:** Cambio trivial de 1 línea, bien definido

**Especificación para orquestación:**

```markdown
AGENTE: Frontend-Developer
HERRAMIENTA: Task (subagent_type: "general-purpose")
DESCRIPCIÓN: Fix duplicación prefijo /api

PROMPT COMPLETO:
"""
Lee el prompt PROMPT-FRONTEND-AGENT.md y actúa como Frontend-Agent.

TAREA: Corregir duplicación de prefijo /api en classroomTeacherApi (GAP-002)

CONTEXTO:
El archivo classroomTeacherApi.ts define BASE_URL = '/api/admin', pero
apiClient ya tiene baseURL = 'http://localhost:3006/api', resultando en
rutas finales como /api/api/admin/... que causan 404.

PROBLEMA IDENTIFICADO:
- apiClient.baseURL: 'http://localhost:3006/api'
- classroomTeacherApi BASE_URL: '/api/admin'
- Resultado: http://localhost:3006/api/api/admin/... (404)

ARCHIVO A MODIFICAR:
apps/frontend/src/services/api/admin/classroomTeacherApi.ts

ESPECIFICACIÓN:

Línea 13:
ANTES:
const BASE_URL = '/api/admin';

DESPUÉS:
const BASE_URL = '/v1/admin';

RAZÓN DEL CAMBIO:
- Elimina duplicación de /api (ya está en apiClient.baseURL)
- Agrega versionamiento /v1/ consistente con backend
- Resultado final correcto: http://localhost:3006/api/v1/admin/...

CRITERIOS DE ACEPTACIÓN:
- ✅ BASE_URL cambiado a '/v1/admin'
- ✅ Código compila sin errores
- ✅ No hay otros cambios en el archivo

RESTRICCIONES:
- NO modificar otras partes del archivo
- NO cambiar lógica de funciones
- Solo modificar la constante BASE_URL

VALIDACIÓN:
1. Ejecutar npm run type-check
2. Verificar que compila sin errores
3. Revisar que BASE_URL = '/v1/admin' (sin /api)

REFERENCIAS:
- orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/01-MATRIZ-GAPS.yml (GAP-002)
- orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md (Sección 9.1, TAREA 1.1)
"""
```

**Estado:** Listo para orquestar
**Prioridad:** P0
**Estimación:** 15 minutos

---

### GAP-003: Fix Página Aprobaciones (ORQUESTAR PARCIAL)

**Decisión:** ⚠️ ORQUESTAR FASE 1, DELEGAR FASE 2
**Razón:** Cambios bien definidos pero requieren testing extensivo

**FASE 1: ORQUESTAR - Deprecar useApprovals**

```markdown
AGENTE: Frontend-Developer
HERRAMIENTA: Task (subagent_type: "general-purpose")
DESCRIPCIÓN: Deprecar hook useApprovals

PROMPT COMPLETO:
"""
Lee el prompt PROMPT-FRONTEND-AGENT.md y actúa como Frontend-Agent.

TAREA: Deprecar hook useApprovals en useContentManagement.ts (GAP-003 Fase 1)

CONTEXTO:
El hook useApprovals usa rutas que no existen en backend (/admin/approvals).
Existe un hook usePendingExercises que SÍ usa rutas correctas del backend.
Debemos deprecar useApprovals para evitar su uso futuro.

ARCHIVO A MODIFICAR:
apps/frontend/src/apps/admin/hooks/useContentManagement.ts

ESPECIFICACIÓN:

Líneas 429-500 (función useApprovals):
AGREGAR al inicio de la función (después de la línea 429):

/**
 * @deprecated Use usePendingExercises instead
 * This hook uses incorrect routes that don't exist in backend:
 * - GET /admin/approvals (should be /v1/admin/content/pending)
 * - POST /admin/approvals/:id/approve (should be /v1/admin/content/:id/approve)
 *
 * Migration path:
 * Replace `useApprovals()` with `usePendingExercises()`
 * The API contracts are compatible.
 *
 * @see usePendingExercises for correct implementation
 * @see GAP-003 in orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/
 */
export function useApprovals(): UseApprovalsResult {
  // Add console warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[DEPRECATED] useApprovals hook is deprecated. Use usePendingExercises instead. ' +
      'This hook uses incorrect API routes. See GAP-003 for details.'
    );
  }

  // ... resto del código existente sin cambios
}

CRITERIOS DE ACEPTACIÓN:
- ✅ JSDoc @deprecated agregado correctamente
- ✅ Console.warn agregado para desarrollo
- ✅ Lógica existente NO modificada
- ✅ Código compila sin errores
- ✅ Exports de useContentManagement.ts siguen funcionando

RESTRICCIONES:
- NO modificar la lógica del hook (solo agregar deprecation)
- NO modificar otros hooks en el archivo
- NO eliminar el hook (otros componentes pueden usarlo aún)

VALIDACIÓN:
1. Ejecutar npm run type-check
2. Verificar que compila sin errores
3. Buscar @deprecated en el archivo (debe estar presente)
4. El hook debe seguir funcionando (solo muestra warning)

REFERENCIAS:
- orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/01-MATRIZ-GAPS.yml (GAP-003)
- orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md (Sección 9.2, TAREA 2.1)
"""
```

**FASE 2: DELEGAR - Migrar componentes**

Esta fase requiere:
- Testing extensivo
- Validación de contratos API
- Posibles ajustes en componentes
- Mejor ejecutar con supervisión humana

Documentado en sección "PARTE 2: DELEGACIÓN MANUAL" abajo.

---

### GAP-004: Variables de Entorno Producción (DELEGAR)

**Decisión:** ❌ DELEGAR (Manual)
**Razón:** Requiere configuración de servidor y validación de deployment

**Justificación:**
- Involucra configuración de servidor productivo (IP 74.208.126.102)
- Requiere acceso a entorno de producción
- Necesita validación de deployment
- Mejor ejecutar con supervisión DevOps

Documentado en sección "PARTE 2: DELEGACIÓN MANUAL" abajo.

---

## 📋 PARTE 2: DELEGACIÓN MANUAL

### GAP-003: Fix Página Aprobaciones (FASE 2)

**Agente Responsable:** Frontend-Developer
**Prioridad:** P0
**Estimación:** 2 horas
**Estado:** Pendiente de aprobación

**ESPECIFICACIÓN COMPLETA:**

**Objetivo:** Migrar AdminApprovalsPage y ContentApprovalQueue para usar usePendingExercises en lugar de useApprovals

**Archivos a modificar:**
1. `apps/frontend/src/apps/admin/pages/AdminApprovalsPage.tsx`
2. `apps/frontend/src/apps/admin/components/content/ContentApprovalQueue.tsx`

**Cambios requeridos:**

**1. AdminApprovalsPage.tsx:**
- Reemplazar mock data por hook `usePendingExercises()`
- Implementar handlers reales para aprobar/rechazar
- Mantener UI existente (no cambiar diseño)
- Agregar manejo de errores

**2. ContentApprovalQueue.tsx:**
- Cambiar import de `useApprovals` a `usePendingExercises`
- Adaptar tipos `ApprovalItem` a `PendingExercise` (o crear adaptador)
- Verificar compatibilidad de contratos

**Criterios de aceptación:**
- ✅ Página de aprobaciones muestra datos REALES (no mock)
- ✅ Aprobar contenido funciona y actualiza DB
- ✅ Rechazar contenido funciona con razón
- ✅ No hay errores 404 en Network tab
- ✅ Rutas usadas son `/api/v1/admin/content/*`

**Testing requerido:**
1. Crear ejercicio pendiente como teacher
2. Login como admin
3. Ir a página de aprobaciones
4. Verificar lista de pendientes
5. Aprobar un ejercicio
6. Verificar cambio en DB
7. Rechazar un ejercicio con razón
8. Verificar cambio en DB

**Referencias:**
- `orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md` Sección 9.2 TAREA 2.1 para código completo de ejemplo

**¿Por qué manual?**
- Requiere testing extensivo
- Posibles ajustes en tipos TypeScript
- Mejor con supervisión para validar UX

---

### GAP-004: Variables de Entorno Producción

**Agente Responsable:** DevOps-Agent + Frontend-Developer
**Prioridad:** P0
**Estimación:** 1 hora
**Estado:** Pendiente de aprobación

**ESPECIFICACIÓN COMPLETA:**

**Objetivo:** Configurar variables de entorno para deployment en producción (IP: 74.208.126.102)

**Tareas:**

**1. Crear archivo `.env.production`**
Ubicación: `apps/frontend/.env.production`
Contenido:
```bash
VITE_API_URL=http://74.208.126.102:3006/api
VITE_WS_URL=ws://74.208.126.102:3006
VITE_APP_NAME=GAMILIT Platform
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_DEBUG_API=false
VITE_MOCK_API=false
```

**2. Actualizar `env.ts` con validación**
Ubicación: `apps/frontend/src/config/env.ts`
Agregar función `getRequiredEnv()` que valide variables obligatorias
Throw error si falta VITE_API_URL o VITE_WS_URL

**3. Actualizar `apiClient.ts`**
Ubicación: `apps/frontend/src/services/api/apiClient.ts`
Cambiar de:
```typescript
baseURL: 'http://localhost:3006/api',
```
A:
```typescript
import { env } from '@/config/env';
baseURL: env.apiUrl,
```

**4. Crear `.env.example`**
Documentar todas las variables requeridas

**5. Actualizar documentación**
Crear `docs/deployment/environment-variables.md`

**Criterios de aceptación:**
- ✅ Build con variables correctas: exitoso
- ✅ Build sin variables: falla con error claro
- ✅ Deployment en 74.208.126.102 funcional
- ✅ Todas las llamadas API van al servidor correcto

**Testing requerido:**
1. Build local con .env.production
2. Verificar que genera bundle correcto
3. Deploy en servidor productivo
4. Smoke test: login, dashboard, API calls
5. Verificar Network tab: todas las requests a 74.208.126.102

**Referencias:**
- `orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md` Sección 9.1 TAREA 1.3 para código completo

**¿Por qué manual?**
- Requiere acceso a servidor productivo
- Involucra configuración de deployment
- Necesita validación en ambiente real
- Crítico para producción (mejor supervisión)

---

### GAP-005: Versionamiento Consistente

**Agente Responsable:** Frontend-Developer
**Prioridad:** P1
**Estimación:** 3 horas
**Estado:** Pendiente de aprobación

**ESPECIFICACIÓN COMPLETA:**

**Objetivo:** Agregar `/v1/` a TODAS las rutas API en frontend

**Tareas:**

**1. Auditoría de rutas**
Ejecutar:
```bash
cd apps/frontend/src
grep -r "'/admin/" --include="*.ts" --include="*.tsx" | grep -v "/v1/"
grep -r "'/teacher/" --include="*.ts" --include="*.tsx" | grep -v "/v1/"
grep -r "'/gamification/" --include="*.ts" --include="*.tsx" | grep -v "/v1/"
```

**2. Actualizar `apiConfig.ts`**
Revisar TODAS las rutas y agregar `/v1/` donde falte
Formato estándar: `/v1/{dominio}/{recurso}`

**3. Actualizar servicios especializados**
- `apps/frontend/src/services/api/teacher/*.ts`
- `apps/frontend/src/services/api/admin/*.ts`
Migrar rutas hardcodeadas a `API_ENDPOINTS`

**4. Crear test de validación**
Test: Todas las rutas en `API_ENDPOINTS` deben incluir `/v1/`

**5. Actualizar `ESTANDARES-NOMENCLATURA.md`**
Documentar estándar de versionamiento

**Criterios de aceptación:**
- ✅ TODAS las rutas incluyen `/v1/`
- ✅ Test de validación pasa
- ✅ Suite E2E pasa
- ✅ No hay rutas sin versión

**Referencias:**
- `orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md` Sección 9.3 TAREA 3.1

**¿Por qué manual?**
- Afecta muchos archivos (~15-20)
- Requiere testing exhaustivo
- Decisión arquitectónica importante
- Mejor con revisión humana

---

### GAP-006: Centralizar Configuración

**Agente Responsable:** Frontend-Developer
**Prioridad:** P1
**Estimación:** 4 horas
**Estado:** Pendiente de aprobación

**ESPECIFICACIÓN COMPLETA:**

**Objetivo:** Migrar TODAS las rutas hardcodeadas a `apiConfig.ts`

**Tareas:**

**1. Identificar rutas hardcodeadas**
```bash
grep -r "apiClient.get\|apiClient.post\|apiClient.put\|apiClient.delete" \
  apps/frontend/src \
  --include="*.ts" --include="*.tsx" \
  | grep -v apiConfig.ts \
  | grep "'/" > /tmp/hardcoded-routes.txt
```

**2. Migrar rutas a apiConfig.ts**
Para cada ruta hardcodeada encontrada:
- Agregar a `apiConfig.ts` si no existe
- Reemplazar hardcoded por import de `API_ENDPOINTS`

**3. Crear eslint rule**
Detectar rutas hardcodeadas automáticamente

**4. Refactorizar servicios**
Lista de archivos a migrar (del análisis):
- `apps/frontend/src/services/api/admin/classroomTeacherApi.ts`
- `apps/frontend/src/services/api/teacher/*.ts`
- `apps/frontend/src/apps/admin/hooks/useContentManagement.ts`

**5. Documentar en README**
Agregar sección sobre configuración de APIs

**Criterios de aceptación:**
- ✅ apiConfig.ts es único source of truth
- ✅ Lint detecta rutas hardcodeadas
- ✅ No hay rutas fuera de apiConfig.ts
- ✅ Tests pasan

**Referencias:**
- `orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md` Sección 9.3 TAREA 3.2
- `docs/97-adr/ADR-013-centralizacion-rutas-api.md` (propuesto)

**¿Por qué manual?**
- Refactor grande (~15-20 archivos)
- Requiere crear eslint rule
- Decisión arquitectónica importante
- Mejor con revisión de código

---

### GAP-007: Fix Gamificación Post-DB Recreate

**Agente Responsable:** Backend-Developer + Database-Developer
**Prioridad:** P1
**Estimación:** 2-3 horas (después de resolver GAP-001 a GAP-003)
**Estado:** Pendiente de aprobación

**ESPECIFICACIÓN COMPLETA:**

**Objetivo:** Resolver errores de gamificación en consola tras recrear base de datos

**DEPENDENCIAS:**
- ⚠️ DEBE ejecutarse DESPUÉS de resolver GAP-001, GAP-002, GAP-003
- Razón: Primero resolver rutas incorrectas, luego validar que gamificación funciona

**Hipótesis del problema:**
1. Rutas incorrectas (GAP-001, GAP-002 arriba)
2. Seeds de gamificación no se cargan correctamente
3. Foreign keys rotos entre usuarios y gamificación
4. Orden incorrecto de carga de seeds

**Tareas de investigación:**

**1. Validar script de recreación**
```bash
cat apps/database/scripts/drop-and-recreate-database.sh
```
Verificar que carga seeds en orden correcto:
- DDL primero
- Seeds de gamificación (ranks, achievements)
- Seeds de usuarios
- Asignación de gamificación a usuarios

**2. Validar seeds de gamificación**
Verificar que existen y son correctos:
- `apps/database/seeds/gamification/01-maya-ranks.sql`
- `apps/database/seeds/gamification/02-achievements.sql`
- `apps/database/seeds/gamification/03-user-gamification-init.sql`

**3. Agregar logging en frontend**
Modificar hooks de gamificación para capturar errores:
- `apps/frontend/src/apps/student/hooks/useGamificationData.ts`
- Agregar console.log detallados
- Capturar response completos

**4. Implementar error boundary**
Crear `GamificationErrorBoundary` component
Envolver componentes de gamificación

**5. Testing completo**
```bash
# Recrear DB
./drop-and-recreate-database.sh

# Verificar seeds cargados
psql -d gamilit_platform -c "SELECT COUNT(*) FROM gamification.maya_rank_definitions;"
psql -d gamilit_platform -c "SELECT COUNT(*) FROM gamification.achievements;"
psql -d gamilit_platform -c "SELECT * FROM gamification.user_stats LIMIT 5;"

# Login en cada portal
# Verificar consola del navegador
# Verificar que NO hay errores 404/500
```

**Criterios de aceptación:**
- ✅ drop-and-recreate-database.sh carga gamificación correctamente
- ✅ Login en student: gamificación carga sin errores
- ✅ Login en teacher: gamificación carga sin errores
- ✅ Login en admin: gamificación carga sin errores
- ✅ NO hay errores 404 en consola relacionados con gamificación
- ✅ NO hay errores 500 en consola

**Referencias:**
- `orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md` Sección 9.2 TAREA 2.2

**¿Por qué manual?**
- Requiere investigación inicial
- Depende de resolver GAP-001 a GAP-003 primero
- Involucra backend + database + frontend
- Puede requerir ajustes en múltiples capas
- Mejor con supervisión para diagnosticar

---

### GAP-008: Sincronización de Tipos TS

**Agente Responsable:** Backend-Developer + Frontend-Developer
**Prioridad:** P2
**Estimación:** 1 día (setup) + mantenimiento continuo
**Estado:** Mejora arquitectónica - No urgente

**ESPECIFICACIÓN COMPLETA:**

**Objetivo:** Tipos TypeScript frontend sincronizados automáticamente con DTOs backend

**Opción recomendada:** Generación automática con `openapi-typescript`

**Tareas:**

**1. Configurar Swagger en backend**
Completar decoradores en todos los controllers
Exportar schema JSON para frontend

**2. Instalar herramientas**
```bash
npm install -D openapi-typescript @hey-api/openapi-ts
```

**3. Crear script de generación**
```json
"scripts": {
  "generate:types": "openapi-typescript ./src/types/api-schema.json -o ./src/types/api.d.ts"
}
```

**4. Integrar en CI/CD**
Validar que tipos están sincronizados en cada PR

**5. Migrar código a tipos generados**
Usar tipos generados en hooks y componentes

**Criterios de aceptación:**
- ✅ Tipos se generan automáticamente desde Swagger
- ✅ Type check pasa sin errores
- ✅ CI/CD valida sincronización

**Referencias:**
- `orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md` Sección 9.4 TAREA 4.1

**¿Por qué manual?**
- Requiere setup inicial complejo
- Decisión de tooling (openapi-typescript vs alternativas)
- Integración con CI/CD
- No es urgente (P2)
- Mejor con planificación y consenso del equipo

---

### GAP-009: Documentación APIs

**Agente Responsable:** Backend-Developer
**Prioridad:** P2
**Estimación:** 2 días
**Estado:** Mejora arquitectónica - No urgente

**ESPECIFICACIÓN COMPLETA:**

**Objetivo:** Documentación completa de todas las APIs con Swagger

**Tareas:**

**1. Completar decoradores Swagger**
Revisar todos los controllers y agregar:
- `@ApiOperation()`
- `@ApiQuery()`
- `@ApiParam()`
- `@ApiResponse()`
- `@ApiBody()`

**2. Generar documentación estática**
```bash
npx @nestjs/swagger-cli generate ./docs/api/swagger.json
npx redoc-cli bundle ./docs/api/swagger.json -o ./docs/api/index.html
```

**3. Crear guías de integración**
`docs/api/integration-guide.md`
Incluir:
- Flujo de autenticación
- Ejemplos de requests/responses
- Errores comunes

**4. Agregar ejemplos HTTP**
`docs/api/examples/*.http`
Ejemplos ejecutables con REST Client

**Criterios de aceptación:**
- ✅ Todos los endpoints documentados en Swagger
- ✅ Documentación HTML generada
- ✅ Guía de integración completa
- ✅ Ejemplos HTTP disponibles

**Referencias:**
- `orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md` Sección 9.4 TAREA 4.2

**¿Por qué manual?**
- Tarea grande (30+ controllers)
- Requiere conocimiento de dominio para describir APIs
- No es urgente (P2)
- Mejor como tarea asignada con tiempo dedicado

---

### GAP-010: Tests de Integración

**Agente Responsable:** QA + Frontend-Developer + Backend-Developer
**Prioridad:** P2
**Estimación:** 3-4 días
**Estado:** Mejora arquitectónica - No urgente

**ESPECIFICACIÓN COMPLETA:**

**Objetivo:** Suite completa de tests E2E y contract testing

**Tareas:**

**1. Setup Playwright**
```bash
npm install -D @playwright/test
npx playwright install
```

**2. Crear tests E2E**
Tests para flujos críticos:
- Login y autenticación
- Dashboard admin (incluye alerts, aprobaciones)
- Gamificación en cada portal
- CRUD de recursos principales

**3. Contract testing con Pact**
```bash
npm install -D @pact-foundation/pact
```
Validar contratos entre frontend y backend

**4. Integrar en CI/CD**
`.github/workflows/e2e.yml`
Ejecutar tests en cada PR

**Criterios de aceptación:**
- ✅ Suite E2E cubre flujos críticos
- ✅ Contract tests validan APIs
- ✅ Tests ejecutan en CI/CD
- ✅ Reportes generados automáticamente

**Referencias:**
- `orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md` Sección 9.4 TAREA 4.3

**¿Por qué manual?**
- Proyecto grande (3-4 días)
- Requiere coordinación de múltiples developers
- Setup de infraestructura (CI/CD)
- No es urgente (P2)
- Mejor como sprint dedicado

---

## 📊 RESUMEN DE DECISIONES

### ORQUESTAR INMEDIATAMENTE (Tool: Task)

| GAP | Tarea | Agente | Prioridad | Estimación | Estado |
|-----|-------|--------|-----------|------------|--------|
| GAP-001 | Fix alerts route | Frontend-Developer | P0 | 30 min | ✅ Listo |
| GAP-002 | Fix /api duplicate | Frontend-Developer | P0 | 15 min | ✅ Listo |
| GAP-003 (Fase 1) | Deprecar useApprovals | Frontend-Developer | P0 | 30 min | ✅ Listo |

**Total orquestación inmediata:** ~1.5 horas

---

### DELEGAR MANUAL (Requieren aprobación/supervisión)

| GAP | Tarea | Agente | Prioridad | Estimación | Razón Delegación |
|-----|-------|--------|-----------|------------|-----------------|
| GAP-003 (Fase 2) | Migrar componentes aprobaciones | Frontend-Developer | P0 | 2 horas | Testing extensivo requerido |
| GAP-004 | Variables entorno producción | DevOps + Frontend | P0 | 1 hora | Requiere acceso servidor |
| GAP-005 | Versionamiento consistente | Frontend-Developer | P1 | 3 horas | Refactor grande |
| GAP-006 | Centralizar configuración | Frontend-Developer | P1 | 4 horas | Decisión arquitectónica |
| GAP-007 | Fix gamificación | Backend + Database | P1 | 2-3 horas | Investigación requerida |
| GAP-008 | Sync tipos TS | Backend + Frontend | P2 | 1 día | Setup complejo |
| GAP-009 | Documentación APIs | Backend-Developer | P2 | 2 días | Tarea grande |
| GAP-010 | Tests integración | QA + Developers | P2 | 3-4 días | Proyecto grande |

**Total delegación manual:** ~13-17 horas (P0-P1) + 1-2 semanas (P2)

---

## ✅ RECOMENDACIÓN FINAL

**ESTRATEGIA PROPUESTA:**

**AHORA (Orquestar inmediatamente):**
1. Orquestar GAP-001 (Frontend-Agent)
2. Orquestar GAP-002 (Frontend-Agent)
3. Orquestar GAP-003 Fase 1 (Frontend-Agent)

**Resultado:** Portal admin parcialmente funcional en ~1.5 horas

---

**DESPUÉS (Manual con supervisión):**
1. Ejecutar GAP-003 Fase 2 (migrar componentes)
2. Configurar GAP-004 (variables producción)
3. Investigar y resolver GAP-007 (gamificación)

**Resultado:** Sistema completamente funcional en ~5-6 horas

---

**SPRINT SIGUIENTE (Mejoras):**
1. GAP-005: Versionamiento
2. GAP-006: Centralización
3. GAP-008, GAP-009, GAP-010: Calidad

**Resultado:** Arquitectura sólida y mantenible en 1-2 semanas

---

## 🎯 PRÓXIMOS PASOS

1. **Revisar y aprobar** este plan de orquestación/delegación
2. **Decidir:** ¿Orquestar GAP-001, GAP-002, GAP-003 Fase 1 ahora?
3. **Si aprobado:** Ejecutar orquestaciones con Tool: Task
4. **Validar** resultados de cada orquestación
5. **Priorizar** tareas delegadas según impacto de negocio
6. **Asignar** tareas delegadas a agentes correspondientes

---

**Elaborado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
**Estado:** Propuesto - Pendiente de aprobación del usuario

---

## 📎 ANEXO: PROMPTS COMPLETOS LISTOS PARA ORQUESTAR

Los prompts completos para orquestar GAP-001, GAP-002 y GAP-003 Fase 1 están documentados arriba en la sección "PARTE 1: ORQUESTACIÓN INMEDIATA".

Si el usuario aprueba, puedo ejecutar las orquestaciones inmediatamente usando la herramienta Task.

**¿Procedo con la orquestación?**
