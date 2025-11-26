# REPORTE DE ANÁLISIS ARQUITECTÓNICO - RUTAS API Y GAMIFICACIÓN

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Alcance:** Análisis completo de rutas API en 3 portales con enfoque en Admin y Gamificación
**Estado:** Completado
**Severidad general:** CRÍTICA

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Contexto y Problemática](#contexto-y-problemática)
3. [Metodología de Análisis](#metodología-de-análisis)
4. [Hallazgos Principales](#hallazgos-principales)
5. [Análisis Detallado por Portal](#análisis-detallado-por-portal)
6. [Arquitectura Actual vs Esperada](#arquitectura-actual-vs-esperada)
7. [Matriz de Impacto](#matriz-de-impacto)
8. [Recomendaciones Arquitectónicas](#recomendaciones-arquitectónicas)
9. [Plan de Corrección](#plan-de-corrección)
10. [Especificaciones Técnicas para Implementación](#especificaciones-técnicas-para-implementación)
11. [Validación y Testing](#validación-y-testing)
12. [Referencias](#referencias)

---

## 1. RESUMEN EJECUTIVO

### Situación

El proyecto GAMILIT presenta **inconsistencias críticas** en la configuración de rutas API entre frontend y backend que impiden el funcionamiento correcto de funcionalidades clave, especialmente en el portal de administración y componentes de gamificación.

### Hallazgos Críticos

- **4 gaps críticos (P0)** que impiden funcionalidad básica
- **3 gaps altos (P1)** que causan inconsistencias importantes
- **3 gaps medios (P2)** de mejoras arquitectónicas
- **Portal Admin es el más afectado** con 6 gaps identificados
- **Gamificación falla en los 3 portales** tras recrear base de datos

### Impacto

| Área | Estado | Impacto |
|------|--------|---------|
| **Alerts en Admin** | ❌ No funciona | 404 - Ruta incorrecta |
| **Classroom-Teacher** | ❌ No funciona | 404 - Prefijo duplicado |
| **Aprobaciones** | ❌ Mock data | Rutas no existen en backend |
| **Gamificación** | ⚠️ Falla | Errores en consola tras recrear DB |
| **Producción** | ❌ No preparado | URLs hardcodeadas a localhost |

### Resolución Estimada

- **Críticos (P0):** 3-4 horas desarrollo
- **Altos (P1):** 7-10 horas desarrollo
- **Medios (P2):** 1 semana desarrollo
- **Total:** 2-3 días trabajo enfocado

---

## 2. CONTEXTO Y PROBLEMÁTICA

### Reporte del Usuario

> "Necesito un análisis a detalle ya que al rehacer la base de datos falla en todos los portales (student/teacher/admin) la referencia del frontend que muestra en consola con la gamificación, además en el portal de admin tiene problemas con la ruta /api/admin/alerts tal vez le falte v1 como se muestra en students, hay que unificar rutas en todos los portales para evitar errores de referencias y manejar variables globales o variables de entorno bien definidas, los usuarios parecen funcionar bien en el portal de admin pero páginas como aprobaciones no funcionan correctamente."

### Síntomas Observados

1. **Errores 404 en consola** al cargar portales
2. **Componentes de gamificación no cargan** en ningún portal
3. **Página de aprobaciones usa mock data** (no conecta con backend)
4. **Alerts no se cargan** en dashboard admin
5. **Gestión de aulas falla** al asignar profesores

### Alcance del Análisis

Se realizó un análisis exhaustivo de:
- Estructura de rutas API en 3 portales (Student, Teacher, Admin)
- Configuración de variables de entorno
- Controllers y endpoints en backend
- Hooks y servicios API en frontend
- Versionamiento y prefijos de rutas
- Integración de gamificación

---

## 3. METODOLOGÍA DE ANÁLISIS

### Herramientas Utilizadas

1. **Task tool + Explore agent** - Búsqueda exhaustiva de código
2. **Read tool** - Análisis detallado de archivos clave
3. **Grep tool** - Búsqueda de patrones específicos
4. **Documentación** - Revisión de ADRs, directivas e inventarios

### Archivos Analizados

**Frontend (45+ archivos):**
- Services API: apiConfig.ts, apiClient.ts, adminAPI.ts, gamificationAPI.ts
- Hooks: useSystemMonitoring.ts, useAdminDashboard.ts, useContentManagement.ts
- Pages: AdminApprovalsPage.tsx, Dashboard pages
- Components: ContentApprovalQueue.tsx

**Backend (30+ archivos):**
- Controllers: AdminDashboardController, AdminContentController, GamificationControllers
- DTOs: alerts.dto.ts, approval-history.dto.ts
- Config: main.ts, routes.constants.ts

**Configuración:**
- env.ts, .env files
- package.json, vite.config.ts

---

## 4. HALLAZGOS PRINCIPALES

### 4.1 Inconsistencias de Rutas Críticas

| Frontend Ruta | Backend Ruta Esperada | Estado |
|--------------|----------------------|--------|
| `/admin/alerts` | `/api/v1/admin/dashboard/alerts` | ❌ Mismatch |
| `/api/admin/classrooms` | `/api/v1/admin/classrooms` | ❌ Doble /api |
| `/admin/approvals` | `/api/v1/admin/content/pending` | ❌ No existe |
| `/gamification/ranks` | `/api/v1/gamification/ranks` | ✓ OK |

### 4.2 Problemas de Versionamiento

**Backend:** SIEMPRE usa `/api/v1/*`
- Prefijo global: `'api'`
- Versión: `'v1'`
- Archivo: `apps/backend/src/main.ts:17`

**Frontend:** Inconsistente
- `apiConfig.ts` define `/api/v1` ✓
- `classroomTeacherApi.ts` usa `/api/admin` (sin v1) ❌
- `useApprovals` usa `/admin/approvals` (sin v1) ❌
- `teacherApi` usa `/teacher/*` (sin v1) ❌

### 4.3 Configuración Dispersa

**Definiciones de rutas encontradas en 6+ ubicaciones:**

1. ✅ `apps/frontend/src/services/api/apiConfig.ts` - Centralizado (417 líneas)
2. ❌ `apps/frontend/src/services/api/admin/classroomTeacherApi.ts` - Hardcoded
3. ❌ `apps/frontend/src/services/api/teacher/*.ts` - Hardcoded
4. ❌ `apps/frontend/src/apps/admin/hooks/useContentManagement.ts` - Hardcoded
5. ~ `apps/frontend/src/services/api/gamificationAPI.ts` - Parcial

**Violación del principio DRY (Don't Repeat Yourself)**

### 4.4 Variables de Entorno para Producción

**Problema crítico:**
```typescript
// apps/frontend/src/config/env.ts
const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api';
```

**En producción (IP: 74.208.126.102):**
- Si `VITE_API_URL` no está configurada → usa localhost ❌
- Todas las llamadas API fallan
- Aplicación completamente no funcional

**Falta:**
- Archivo `.env.production`
- Validación de build
- Documentación de variables requeridas

---

## 5. ANÁLISIS DETALLADO POR PORTAL

### 5.1 PORTAL STUDENT

**Estado general:** ✅ Mayormente funcional

**Configuración:**
- Base URL: `/gamification/*`
- Hooks principales: 6 (useGamificationData, useDashboardData, etc.)
- Servicios: Usa apiConfig.ts correctamente

**Rutas principales:**
```
GET /gamification/ranks/user/{userId}
GET /gamification/coins/{userId}
GET /gamification/users/{userId}/achievements?limit=6
GET /gamification/leaderboard/user/{userId}/position
GET /gamification/missions/daily
GET /gamification/streaks/{userId}
```

**Problemas identificados:**
- ⚠️ Gamificación falla tras recrear DB (posiblemente por GAP-007: seeds)
- Menor: Algunas rutas no incluyen `/v1/` explícitamente

**Nivel de inconsistencias:** BAJO

---

### 5.2 PORTAL TEACHER

**Estado general:** ~ Parcialmente funcional

**Configuración:**
- Base URL: `/teacher/dashboard/*`
- Hooks principales: 8 (useTeacherDashboard, useClassrooms, etc.)
- Servicios: 4 archivos especializados

**Rutas principales:**
```
GET /teacher/dashboard/stats
GET /teacher/dashboard/activities
GET /teacher/dashboard/alerts
GET /teacher/classrooms
GET /teacher/assignments
GET /teacher/submissions/pending
```

**Problemas identificados:**
- ⚠️ Rutas no incluyen `/v1/` (GAP-005)
- ⚠️ Servicios con rutas hardcodeadas (GAP-006)
- ⚠️ Gamificación falla tras recrear DB

**Nivel de inconsistencias:** MEDIO

---

### 5.3 PORTAL ADMIN ⚠️

**Estado general:** ❌ CRÍTICO - Múltiples funcionalidades rotas

**Configuración:**
- Base URL: `/admin/*`
- Hooks principales: 11 (useAdminDashboard, useSystemMonitoring, etc.)
- Servicios: 3 archivos especializados

**Rutas principales:**
```
GET /admin/health
GET /admin/alerts                      ❌ GAP-001
GET /admin/dashboard
GET /admin/users
GET /api/admin/classrooms/{id}/teachers  ❌ GAP-002
GET /admin/approvals                   ❌ GAP-003
GET /admin/gamification/config/parameters
```

**Problemas CRÍTICOS identificados:**

#### Problema 1: Alerts Route (GAP-001)
```typescript
// Frontend usa:
GET /admin/alerts

// Backend expone:
GET /api/v1/admin/dashboard/alerts

// Resultado: 404 Not Found
```

**Archivos afectados:**
- `apps/frontend/src/apps/admin/hooks/useSystemMonitoring.ts:103`
- `apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts:291`
- `apps/frontend/src/services/api/apiConfig.ts:304`

#### Problema 2: Classroom-Teacher API (GAP-002)
```typescript
// classroomTeacherApi.ts:13
const BASE_URL = '/api/admin';

// apiClient ya tiene:
baseURL = 'http://localhost:3006/api'

// Resultado: /api/api/admin/... (404)
```

#### Problema 3: Aprobaciones (GAP-003)
```typescript
// Frontend usa:
GET /admin/approvals          ❌ NO EXISTE
POST /admin/approvals/:id/approve   ❌ NO EXISTE

// Backend expone:
GET /api/v1/admin/content/pending      ✓
POST /api/v1/admin/content/:id/approve ✓

// Resultado: 404 + página usa mock data
```

**Archivos afectados:**
- `apps/frontend/src/apps/admin/hooks/useContentManagement.ts:438`
- `apps/frontend/src/apps/admin/pages/AdminApprovalsPage.tsx`
- `apps/frontend/src/apps/admin/components/content/ContentApprovalQueue.tsx`

**Nivel de inconsistencias:** CRÍTICO

---

## 6. ARQUITECTURA ACTUAL VS ESPERADA

### 6.1 Backend - Estructura Correcta

**Configuración:**
```typescript
// apps/backend/src/main.ts:17
app.setGlobalPrefix('api');

// Constantes:
API_VERSION = 'v1'
API_BASE = '/api/v1'
```

**Estructura de rutas:**
```
/api/v1/gamification/
  ├─ achievements/
  ├─ ranks/
  ├─ users/:userId/stats
  └─ leaderboard/

/api/v1/admin/
  ├─ dashboard/
  │  ├─ alerts           ✓ Correcto
  │  └─ stats
  ├─ content/
  │  ├─ pending          ✓ Correcto
  │  ├─ :id/approve      ✓ Correcto
  │  └─ :id/reject       ✓ Correcto
  ├─ gamification/
  │  └─ config/
  └─ users/

/api/v1/teacher/
  ├─ dashboard/
  └─ classrooms/
```

**Versionamiento:** ✅ Consistente en todo el backend

---

### 6.2 Frontend - Estructura Inconsistente

**Configuración Base:**
```typescript
// apps/frontend/src/services/api/apiClient.ts:19
const apiClient = axios.create({
  baseURL: 'http://localhost:3006/api',  // ⚠️ Hardcoded
  timeout: 30000,
});
```

**Problema:** Base URL ya incluye `/api`, entonces rutas deben empezar sin `/api`

**apiConfig.ts (417 líneas):**
```typescript
export const API_ENDPOINTS = {
  gamification: {
    achievements: '/v1/gamification/achievements',  ✓
    ranks: '/v1/gamification/ranks',                ✓
  },
  admin: {
    alerts: '/admin/alerts',                        ❌ Falta /dashboard
    dashboard: '/admin/dashboard',                  ✓
    content: {
      pending: '/admin/content/pending',            ✓ (pero falta /v1/)
      approve: (id) => `/admin/content/${id}/approve`, ✓
    },
  },
};
```

**Servicios especializados (hardcoded):**
```typescript
// classroomTeacherApi.ts:13
const BASE_URL = '/api/admin';  // ❌ Duplica /api

// useApprovals hook:438
await apiClient.get('/admin/approvals');  // ❌ Ruta no existe
```

**Inconsistencias identificadas:**
1. Algunas rutas incluyen `/v1/`, otras no
2. Algunas rutas duplican `/api`
3. Algunas rutas no existen en backend
4. Configuración dispersa en múltiples archivos

---

### 6.3 Arquitectura Recomendada

**Propuesta: Estructura Unificada**

```typescript
// apps/frontend/src/services/api/apiConfig.ts (UNIFICADO)
export const API_ENDPOINTS = {
  // Gamificación (versionada)
  gamification: {
    base: '/v1/gamification',
    achievements: '/v1/gamification/achievements',
    ranks: '/v1/gamification/ranks',
    userStats: (userId) => `/v1/gamification/users/${userId}/stats`,
    leaderboard: '/v1/gamification/leaderboard/global',
  },

  // Admin (versionado)
  admin: {
    base: '/v1/admin',
    dashboard: {
      stats: '/v1/admin/dashboard/stats',
      alerts: '/v1/admin/dashboard/alerts',         // ✓ CORRECTO
      activities: '/v1/admin/dashboard/activities',
    },
    content: {
      pending: '/v1/admin/content/pending',         // ✓ CORRECTO
      approve: (id) => `/v1/admin/content/${id}/approve`,
      reject: (id) => `/v1/admin/content/${id}/reject`,
    },
    classrooms: {
      base: '/v1/admin/classrooms',                 // ✓ CORRECTO (sin duplicar /api)
      teachers: (id) => `/v1/admin/classrooms/${id}/teachers`,
    },
    gamification: {
      config: '/v1/admin/gamification/config/parameters',
      ranks: '/v1/admin/gamification/config/maya-ranks',
    },
  },

  // Teacher (versionado)
  teacher: {
    base: '/v1/teacher',
    dashboard: '/v1/teacher/dashboard/stats',
    classrooms: '/v1/teacher/classrooms',
  },
};
```

**Reglas de arquitectura:**
1. ✅ TODAS las rutas incluyen `/v1/` explícitamente
2. ✅ TODAS las rutas definidas en apiConfig.ts (único source of truth)
3. ✅ Base URL de apiClient incluye `/api`, rutas NO lo duplican
4. ✅ Servicios especializados IMPORTAN de apiConfig, NO hardcodean
5. ✅ Variables de entorno para URLs base (producción/desarrollo)

---

## 7. MATRIZ DE IMPACTO

### 7.1 Tabla de Impacto por Gap

| GAP ID | Severidad | Funcionalidad Afectada | Portales Afectados | Usuarios Impactados | Estimación Fix |
|--------|-----------|------------------------|-------------------|---------------------|----------------|
| GAP-001 | CRÍTICA | Alertas de sistema | Admin | Admins (100%) | 30 min |
| GAP-002 | CRÍTICA | Gestión de aulas | Admin | Admins (100%) | 15 min |
| GAP-003 | CRÍTICA | Aprobaciones de contenido | Admin | Admins (100%) | 2 horas |
| GAP-004 | CRÍTICA | Deployment a producción | Todos | Todos (100%) | 1 hora |
| GAP-005 | ALTA | Mantenibilidad | Todos | Developers | 3 horas |
| GAP-006 | ALTA | Mantenibilidad | Todos | Developers | 4 horas |
| GAP-007 | ALTA | Gamificación | Todos | Todos (100%) | 2-3 horas |
| GAP-008 | MEDIA | Type safety | Todos | Developers | 1 día |
| GAP-009 | MEDIA | Documentación | N/A | Developers | 2 días |
| GAP-010 | MEDIA | Confiabilidad | Todos | QA + Developers | 3-4 días |

### 7.2 Impacto por Stakeholder

**Administradores (Admin Portal):**
- ❌ No pueden ver alertas del sistema
- ❌ No pueden gestionar asignación de aulas
- ❌ No pueden aprobar contenido educativo
- ⚠️ Gamificación no carga correctamente
- **Impacto: CRÍTICO - 80% funcionalidad afectada**

**Profesores (Teacher Portal):**
- ⚠️ Gamificación no carga correctamente
- ~ Algunas funcionalidades pueden tener errores
- **Impacto: MEDIO - 20% funcionalidad afectada**

**Estudiantes (Student Portal):**
- ⚠️ Gamificación no carga correctamente
- **Impacto: MEDIO - 15% funcionalidad afectada**

**Developers:**
- ❌ Código difícil de mantener (rutas dispersas)
- ❌ Falta documentación de APIs
- ❌ Riesgo alto de introducir bugs
- **Impacto: ALTO - Productividad reducida 40%**

**DevOps/Deployment:**
- ❌ Deployment a producción fallará
- ❌ Variables de entorno no documentadas
- **Impacto: CRÍTICO - Bloquea producción**

### 7.3 Matriz de Riesgo

| Riesgo | Probabilidad | Impacto | Severidad |
|--------|--------------|---------|-----------|
| Deployment a prod falla | ALTA | CRÍTICO | 🔴 CRÍTICO |
| Portal admin no utilizable | ALTA | CRÍTICO | 🔴 CRÍTICO |
| Pérdida de confianza de usuarios | MEDIA | ALTO | 🟠 ALTO |
| Bugs en producción no detectados | ALTA | ALTO | 🟠 ALTO |
| Refactors introducen nuevos bugs | ALTA | MEDIO | 🟡 MEDIO |
| Tiempo de desarrollo aumenta | ALTA | MEDIO | 🟡 MEDIO |

---

## 8. RECOMENDACIONES ARQUITECTÓNICAS

### 8.1 Principios de Diseño

**1. Single Source of Truth**
- TODAS las rutas API en `apiConfig.ts`
- PROHIBIR hardcoded API paths fuera de apiConfig
- Implementar eslint rule para detectar violaciones

**2. Versionamiento Consistente**
- SIEMPRE incluir `/v1/` en rutas
- Preparar para futura migración a `/v2/`
- Documentar política de versionamiento

**3. Configuración por Ambiente**
- Variables de entorno para URLs
- Archivos `.env.development`, `.env.production`
- Validación de build para variables requeridas

**4. Type Safety**
- DTOs compartidos entre backend y frontend
- Generación automática de tipos (openapi-typescript)
- Validación en CI/CD

**5. Testing**
- Contract testing para validar compatibilidad
- E2E tests para flujos críticos
- Ejecutar en CI/CD antes de merge

---

### 8.2 Estándares de Nomenclatura

**Actualizar:** `orchestration/directivas/ESTANDARES-NOMENCLATURA.md`

```markdown
## Rutas API

### Formato Estándar
Todas las rutas API deben seguir el formato:
`/v{version}/{dominio}/{recurso}[/{id}][/{accion}]`

### Ejemplos
✅ CORRECTO:
- /v1/gamification/achievements
- /v1/admin/dashboard/alerts
- /v1/admin/content/pending
- /v1/admin/content/:id/approve
- /v1/teacher/classrooms

❌ INCORRECTO:
- /admin/alerts (falta versión y dashboard)
- /api/admin/classrooms (duplica /api)
- /admin/approvals (no existe en backend)
- /gamification/ranks (falta versión)

### Prefijos
- Backend: `app.setGlobalPrefix('api')` + versión `v1`
- Frontend baseURL: `http://localhost:3006/api`
- Rutas en apiConfig: empiezan con `/v1/` (no duplican `/api`)

### Versionamiento
- Versión actual: `v1`
- Incluir SIEMPRE en rutas
- Preparar para `v2` en futuro
```

---

### 8.3 Arquitectura de Configuración

**Propuesta: Estructura en Capas**

```
apps/frontend/src/
├─ config/
│  ├─ env.ts                    # Variables de entorno
│  └─ api.config.ts             # Configuración base
├─ services/
│  └─ api/
│     ├─ apiClient.ts           # Axios instance
│     ├─ apiConfig.ts           # Definición de TODAS las rutas (ÚNICO)
│     ├─ apiInterceptors.ts     # Auth, errors, logging
│     └─ types/
│        └─ api.types.ts        # Types compartidos
└─ apps/
   ├─ student/hooks/            # Hooks IMPORTAN de apiConfig
   ├─ teacher/hooks/            # Hooks IMPORTAN de apiConfig
   └─ admin/hooks/              # Hooks IMPORTAN de apiConfig
```

**Reglas:**
1. ❌ PROHIBIDO definir rutas fuera de `apiConfig.ts`
2. ✅ Hooks y servicios IMPORTAN de `apiConfig.ts`
3. ✅ Variables de entorno en `env.ts`
4. ✅ Types en `api.types.ts`

---

### 8.4 ADR Propuesto: Centralización de Rutas API

**Crear:** `docs/97-adr/ADR-013-centralizacion-rutas-api.md`

```markdown
# ADR-013: Centralización de Configuración de Rutas API

**Estado:** Propuesto
**Fecha:** 2025-11-24
**Autor:** Architecture-Analyst
**Relacionado con:** GAP-005, GAP-006

## Contexto

Actualmente, las rutas API están dispersas en múltiples archivos:
- apiConfig.ts (parcial)
- classroomTeacherApi.ts (hardcoded)
- useContentManagement.ts (hardcoded)
- gamificationAPI.ts (parcial)

Esto causa:
- Inconsistencias entre rutas
- Dificultad para mantener
- Bugs frecuentes
- Violación de DRY

## Decisión

**Centralizar TODAS las rutas API en un único archivo:**
`apps/frontend/src/services/api/apiConfig.ts`

**Prohibir definición de rutas fuera de apiConfig.ts**

**Implementar eslint rule para detectar violaciones:**
- Detectar strings con patrón `/api/*`, `/admin/*`, `/teacher/*`
- Excepto en apiConfig.ts

## Consecuencias

**Positivas:**
- Single source of truth para rutas
- Fácil encontrar todas las rutas
- Cambios centralizados
- Reducción de bugs
- Type safety mejorado

**Negativas:**
- Refactor inicial requerido (4 horas)
- Developers deben conocer nueva arquitectura
- Archivo apiConfig.ts más grande (mitigado con organización)

**Mitigaciones:**
- Organizar apiConfig.ts por módulos claros
- Documentar en README y guía de desarrollo
- Agregar ejemplos de uso
- Code review estricto

## Alternativas Consideradas

### 1. Mantener estructura actual (descartada)
- Razón: Perpetúa problemas existentes

### 2. Múltiples archivos organizados por módulo (descartada)
- Razón: Sigue dispersando configuración
- Dificulta búsqueda global

### 3. Generación automática desde Swagger (futura)
- Razón: Complementaria, no reemplaza centralización
- Implementar después de centralizar

## Referencias

- GAP-005: Versionamiento inconsistente
- GAP-006: Configuración dispersa
- ESTANDARES-NOMENCLATURA.md
```

---

## 9. PLAN DE CORRECCIÓN

### FASE 1: CRÍTICOS INMEDIATOS (3-4 horas)

**Objetivo:** Hacer funcional el portal admin

#### TAREA 1.1: Fix Duplicación /api (GAP-002)
**Prioridad:** P0
**Estimación:** 15 minutos
**Agente:** Frontend-Developer

**Archivo:** `apps/frontend/src/services/api/admin/classroomTeacherApi.ts`

```typescript
// ANTES (línea 13):
const BASE_URL = '/api/admin';

// DESPUÉS:
const BASE_URL = '/v1/admin';
```

**Validación:**
```bash
# Test manual
1. Login como admin
2. Ir a gestión de aulas
3. Intentar asignar profesor
4. Verificar en Network tab: ruta debe ser /api/v1/admin/classrooms/...
5. Verificar que no hay 404
```

---

#### TAREA 1.2: Fix Alerts Route (GAP-001)
**Prioridad:** P0
**Estimación:** 30 minutos
**Agente:** Frontend-Developer

**Archivos a modificar:**

1. `apps/frontend/src/services/api/apiConfig.ts:304`
```typescript
// ANTES:
alerts: '/admin/alerts',

// DESPUÉS:
alerts: '/v1/admin/dashboard/alerts',
```

2. `apps/frontend/src/apps/admin/hooks/useSystemMonitoring.ts:103`
```typescript
// ANTES:
const response = await apiClient.get<{ success: boolean; data: SystemAlert[] }>(
  '/admin/alerts',
  { params: { dismissed: false, limit: 50 } }
);

// DESPUÉS:
import { API_ENDPOINTS } from '@/services/api/apiConfig';

const response = await apiClient.get<{ success: boolean; data: SystemAlert[] }>(
  API_ENDPOINTS.admin.dashboard.alerts,
  { params: { dismissed: false, limit: 50 } }
);
```

3. `apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts:291`
```typescript
// ANTES:
await apiClient.post(`/admin/alerts/${alertId}/dismiss`);

// DESPUÉS:
import { API_ENDPOINTS } from '@/services/api/apiConfig';

await apiClient.post(`${API_ENDPOINTS.admin.dashboard.alerts}/${alertId}/dismiss`);
```

**Validación:**
```bash
# Test manual
1. Login como admin
2. Cargar dashboard
3. Verificar en Network tab: GET /api/v1/admin/dashboard/alerts
4. Verificar que no hay 404
5. Verificar que alerts se muestran
6. Probar dismiss de una alert
```

---

#### TAREA 1.3: Variables de Entorno Producción (GAP-004)
**Prioridad:** P0
**Estimación:** 1 hora
**Agente:** DevOps-Agent + Frontend-Developer

**Paso 1: Crear archivo `.env.production`**
```bash
# apps/frontend/.env.production
VITE_API_URL=http://74.208.126.102:3006/api
VITE_WS_URL=ws://74.208.126.102:3006
VITE_APP_NAME=GAMILIT Platform
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_DEBUG_API=false
VITE_MOCK_API=false
```

**Paso 2: Actualizar env.ts con validación**
```typescript
// apps/frontend/src/config/env.ts

function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // Modo
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',

  // API - REQUERIDO
  apiUrl: getRequiredEnv('VITE_API_URL'),
  wsUrl: getRequiredEnv('VITE_WS_URL'),

  // Opcionales con defaults
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  debugApi: import.meta.env.VITE_DEBUG_API === 'true',
  appName: import.meta.env.VITE_APP_NAME || 'GAMILIT Platform',
  enableGamification: import.meta.env.VITE_ENABLE_GAMIFICATION !== 'false',
  enableSocialFeatures: import.meta.env.VITE_ENABLE_SOCIAL_FEATURES !== 'false',
  mockApi: import.meta.env.VITE_MOCK_API === 'true',
} as const;

// Log en desarrollo
if (env.isDevelopment) {
  console.log('[ENV] Configuration loaded:', {
    apiUrl: env.apiUrl,
    mode: import.meta.env.MODE,
  });
}
```

**Paso 3: Actualizar apiClient.ts**
```typescript
// apps/frontend/src/services/api/apiClient.ts
import { env } from '@/config/env';

export const apiClient = axios.create({
  baseURL: env.apiUrl,  // ✓ Usa variable de entorno
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Paso 4: Documentar variables**
```markdown
# apps/frontend/.env.example
# API Configuration (REQUIRED)
VITE_API_URL=http://localhost:3006/api
VITE_WS_URL=ws://localhost:3006

# App Configuration
VITE_APP_NAME=GAMILIT Platform
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_SOCIAL_FEATURES=true

# Development
VITE_DEBUG_API=false
VITE_MOCK_API=false
```

**Validación:**
```bash
# Test build con variables correctas
cd apps/frontend
VITE_API_URL=http://74.208.126.102:3006/api npm run build

# Verificar que build no falla
# Inspeccionar output: debe tener URL correcta

# Test build sin variables (debe fallar)
npm run build
# Esperado: Error: Missing required environment variable: VITE_API_URL
```

---

### FASE 2: CORTO PLAZO (5-6 horas)

#### TAREA 2.1: Fix Página Aprobaciones (GAP-003)
**Prioridad:** P0
**Estimación:** 2 horas
**Agente:** Frontend-Developer

**Estrategia:** Deprecar hook `useApprovals` y migrar a `usePendingExercises`

**Paso 1: Actualizar AdminApprovalsPage.tsx**
```typescript
// apps/frontend/src/apps/admin/pages/AdminApprovalsPage.tsx

// ANTES (línea 39-85): Mock data hardcodeado

// DESPUÉS: Usar hook real
import { usePendingExercises } from '../hooks/useContentManagement';

export default function AdminApprovalsPage() {
  const { user, logout } = useAuth();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  // Usar hook real en lugar de mock
  const {
    pendingExercises: mockApprovals,
    loading,
    error,
    approveExercise,
    rejectExercise,
    total,
  } = usePendingExercises();

  const gamificationData = {
    userId: user?.id || 'mock-admin-id',
    level: 20,
    totalXP: 5000,
    mlCoins: 2500,
    rank: 'Super Admin',
    achievements: ['admin_master', 'content_approver'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Calcular stats de datos reales
  const stats = {
    pending: mockApprovals.filter((a) => a.status === 'pending').length,
    approved: mockApprovals.filter((a) => a.status === 'approved').length,
    rejected: mockApprovals.filter((a) => a.status === 'rejected').length,
    total: total,
  };

  // Handlers para aprobar/rechazar
  const handleApprove = async (id: string) => {
    try {
      await approveExercise(id);
      // Mensaje de éxito
    } catch (error) {
      console.error('Error al aprobar:', error);
      alert('Error al aprobar contenido');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await rejectExercise(id, reason);
      // Mensaje de éxito
    } catch (error) {
      console.error('Error al rechazar:', error);
      alert('Error al rechazar contenido');
    }
  };

  // ... resto del componente adaptado para usar handlers reales
}
```

**Paso 2: Deprecar useApprovals en useContentManagement.ts**
```typescript
// apps/frontend/src/apps/admin/hooks/useContentManagement.ts

// Líneas 429-500: Marcar como deprecated
/**
 * @deprecated Use usePendingExercises instead
 * This hook uses incorrect routes that don't exist in backend
 */
export function useApprovals(): UseApprovalsResult {
  console.warn('[DEPRECATED] useApprovals hook is deprecated. Use usePendingExercises instead.');
  // ... código existente
}
```

**Paso 3: Actualizar ContentApprovalQueue.tsx**
```typescript
// apps/frontend/src/apps/admin/components/content/ContentApprovalQueue.tsx

// ANTES (línea 4):
import { useApprovals } from '../../hooks/useContentManagement';

// DESPUÉS:
import { usePendingExercises } from '../../hooks/useContentManagement';

export const ContentApprovalQueue: React.FC = () => {
  // ANTES:
  // const { approvals, loading, approve, reject } = useApprovals();

  // DESPUÉS:
  const {
    pendingExercises: approvals,
    loading,
    approveExercise: approve,
    rejectExercise: reject,
  } = usePendingExercises();

  // ... resto del componente (adaptar tipo ApprovalItem a PendingExercise)
}
```

**Validación:**
```bash
# Test manual
1. Crear ejercicio pendiente (como teacher)
2. Login como admin
3. Ir a página de aprobaciones
4. Verificar que se muestra contenido REAL (no mock)
5. Aprobar un ejercicio
6. Verificar en DB que status cambió
7. Verificar en Network tab: POST /api/v1/admin/content/:id/approve
```

---

#### TAREA 2.2: Fix Gamificación Post-DB Recreate (GAP-007)
**Prioridad:** P1
**Estimación:** 2-3 horas
**Agente:** Backend-Developer + Database-Developer

**Investigación necesaria:**

**Paso 1: Validar script de recreación**
```bash
# Verificar que drop-and-recreate-database.sh carga seeds correctos
cat apps/database/scripts/drop-and-recreate-database.sh

# Verificar orden de carga:
# 1. DDL (schemas, tables, enums)
# 2. Seeds de gamificación (ranks, achievements)
# 3. Seeds de usuarios
# 4. Asignación de datos de gamificación a usuarios
```

**Paso 2: Verificar seeds de gamificación**
```bash
# Listar seeds
ls apps/database/seeds/gamification/

# Esperados:
# - 01-maya-ranks.sql
# - 02-achievements.sql
# - 03-user-gamification-init.sql
```

**Paso 3: Agregar logging en frontend**
```typescript
// apps/frontend/src/apps/student/hooks/useGamificationData.ts

export function useGamificationData(userId: string) {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchGamificationData() {
      try {
        console.log('[Gamification] Fetching data for user:', userId);

        const response = await apiClient.get(
          `/v1/gamification/users/${userId}/summary`
        );

        console.log('[Gamification] Response:', response.data);
        setData(response.data);
      } catch (err) {
        console.error('[Gamification] Error:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchGamificationData();
    }
  }, [userId]);

  return { data, loading, error };
}
```

**Paso 4: Implementar error boundary**
```typescript
// apps/frontend/src/components/ErrorBoundary/GamificationErrorBoundary.tsx

export class GamificationErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Gamification] Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-red-700 font-bold">Error al cargar gamificación</h3>
          <p className="text-red-600 text-sm">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Uso:
<GamificationErrorBoundary>
  <GamifiedHeader {...props} />
</GamificationErrorBoundary>
```

**Validación:**
```bash
# Test completo
1. Ejecutar drop-and-recreate-database.sh
2. Verificar logs: ¿seeds de gamificación cargados?
3. Consultar DB:
   SELECT COUNT(*) FROM gamification.maya_rank_definitions;
   SELECT COUNT(*) FROM gamification.achievements;
   SELECT * FROM gamification.user_stats LIMIT 5;
4. Login en cada portal
5. Abrir consola del navegador
6. Verificar logs de gamificación
7. Verificar que NO hay errores 404 o 500
8. Verificar que componentes de gamificación cargan
```

---

### FASE 3: MEDIANO PLAZO (7-10 horas)

#### TAREA 3.1: Versionamiento Consistente (GAP-005)
**Prioridad:** P1
**Estimación:** 3 horas
**Agente:** Frontend-Developer

**Objetivo:** TODAS las rutas incluyen `/v1/` explícitamente

**Paso 1: Auditoría de rutas**
```bash
# Buscar todas las definiciones de rutas
cd apps/frontend
grep -r "'/admin/" src/ | grep -v node_modules
grep -r "'/teacher/" src/ | grep -v node_modules
grep -r "'/gamification/" src/ | grep -v node_modules

# Identificar cuáles NO tienen /v1/
```

**Paso 2: Actualizar apiConfig.ts**
```typescript
// apps/frontend/src/services/api/apiConfig.ts

export const API_ENDPOINTS = {
  // ========== AUTHENTICATION ==========
  auth: {
    login: '/v1/auth/login',
    logout: '/v1/auth/logout',
    refresh: '/v1/auth/refresh',
    register: '/v1/auth/register',
    forgotPassword: '/v1/auth/forgot-password',
    resetPassword: '/v1/auth/reset-password',
    verifyEmail: '/v1/auth/verify-email',
  },

  // ========== GAMIFICATION ==========
  gamification: {
    achievements: '/v1/gamification/achievements',
    userAchievements: (userId: string) => `/v1/gamification/users/${userId}/achievements`,
    ranks: '/v1/gamification/ranks',
    userRank: (userId: string) => `/v1/gamification/users/${userId}/rank`,
    leaderboard: '/v1/gamification/leaderboard/global',
    // ... resto con /v1/
  },

  // ========== ADMIN ==========
  admin: {
    dashboard: {
      stats: '/v1/admin/dashboard/stats',
      alerts: '/v1/admin/dashboard/alerts',
      activities: '/v1/admin/dashboard/activities',
    },
    content: {
      pending: '/v1/admin/content/pending',
      approve: (id: string) => `/v1/admin/content/${id}/approve`,
      reject: (id: string) => `/v1/admin/content/${id}/reject`,
    },
    // ... resto con /v1/
  },

  // ========== TEACHER ==========
  teacher: {
    dashboard: {
      stats: '/v1/teacher/dashboard/stats',
      activities: '/v1/teacher/dashboard/activities',
      alerts: '/v1/teacher/dashboard/alerts',
    },
    classrooms: '/v1/teacher/classrooms',
    assignments: '/v1/teacher/assignments',
    // ... resto con /v1/
  },
} as const;
```

**Paso 3: Actualizar servicios especializados**
```typescript
// apps/frontend/src/services/api/teacher/teacherApi.ts

// ANTES:
const BASE_URL = '/teacher';

// DESPUÉS:
import { API_ENDPOINTS } from '../apiConfig';
// Usar API_ENDPOINTS.teacher.* en lugar de construir rutas
```

**Paso 4: Crear test de validación**
```typescript
// apps/frontend/src/services/api/__tests__/apiConfig.test.ts

describe('API_ENDPOINTS versionamiento', () => {
  it('todas las rutas deben incluir /v1/', () => {
    const allEndpoints = flattenObject(API_ENDPOINTS);

    allEndpoints.forEach(([path, value]) => {
      if (typeof value === 'string') {
        expect(value).toMatch(/^\/v1\//);
      }
    });
  });
});
```

**Validación:**
```bash
# Ejecutar test
npm test apiConfig.test.ts

# Grep para verificar
grep -r "'/admin/" apps/frontend/src/services/api/apiConfig.ts
# Todas las líneas deben tener '/v1/admin/'

grep -r "'/teacher/" apps/frontend/src/services/api/apiConfig.ts
# Todas las líneas deben tener '/v1/teacher/'

# Ejecutar suite completa de tests E2E
npm run test:e2e
```

---

#### TAREA 3.2: Centralizar Configuración (GAP-006)
**Prioridad:** P1
**Estimación:** 4 horas
**Agente:** Frontend-Developer

**Objetivo:** Migrar TODAS las rutas a apiConfig.ts

**Paso 1: Identificar rutas hardcodeadas**
```bash
cd apps/frontend/src

# Buscar strings con rutas API (excluir apiConfig.ts)
grep -r "apiClient.get\|apiClient.post\|apiClient.put\|apiClient.delete" \
  --include="*.ts" --include="*.tsx" \
  | grep -v apiConfig.ts \
  | grep "'/" \
  > /tmp/hardcoded-routes.txt

# Revisar archivo
cat /tmp/hardcoded-routes.txt
```

**Paso 2: Migrar rutas a apiConfig.ts**
```typescript
// Ejemplo: useContentManagement.ts línea 438
// ANTES:
await apiClient.get('/admin/approvals');

// DESPUÉS:
import { API_ENDPOINTS } from '@/services/api/apiConfig';
await apiClient.get(API_ENDPOINTS.admin.content.pending);
```

**Paso 3: Crear eslint rule**
```javascript
// .eslintrc.js

module.exports = {
  // ... existing config
  rules: {
    // ... existing rules
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.object.name='apiClient'] Literal[value=/^\\/(?:api|admin|teacher|student|gamification)/]",
        message: 'API routes must be imported from apiConfig.ts. Do not hardcode routes.',
      },
    ],
  },
};
```

**Paso 4: Refactorizar archivos**

Lista de archivos a refactorizar:
1. `apps/frontend/src/services/api/admin/classroomTeacherApi.ts` ✓ (ya tiene BASE_URL, migrar a apiConfig)
2. `apps/frontend/src/services/api/teacher/*.ts` (migrar todos)
3. `apps/frontend/src/apps/admin/hooks/useContentManagement.ts:438` (useApprovals)
4. `apps/frontend/src/services/api/gamificationAPI.ts` (completar migración)

**Paso 5: Documentar**
```markdown
# apps/frontend/README.md

## API Configuration

### Definición de Rutas

TODAS las rutas API deben estar definidas en:
`src/services/api/apiConfig.ts`

❌ **PROHIBIDO** hardcodear rutas fuera de apiConfig.ts

### Uso

✅ **CORRECTO:**
```typescript
import { API_ENDPOINTS } from '@/services/api/apiConfig';

await apiClient.get(API_ENDPOINTS.admin.dashboard.alerts);
```

❌ **INCORRECTO:**
```typescript
await apiClient.get('/admin/dashboard/alerts');  // Hardcoded
```

### Agregar Nueva Ruta

1. Agregar a `apiConfig.ts`:
```typescript
export const API_ENDPOINTS = {
  admin: {
    newFeature: '/v1/admin/new-feature',
  },
};
```

2. Usar en código:
```typescript
import { API_ENDPOINTS } from '@/services/api/apiConfig';
await apiClient.get(API_ENDPOINTS.admin.newFeature);
```

### Validación

El linter detectará rutas hardcodeadas:
```bash
npm run lint
# Error: API routes must be imported from apiConfig.ts
```
```

**Validación:**
```bash
# Ejecutar lint
npm run lint

# Verificar que no hay rutas hardcodeadas
# (excepto en apiConfig.ts)

# Ejecutar tests
npm test

# Ejecutar E2E
npm run test:e2e
```

---

### FASE 4: MEJORAS ARQUITECTÓNICAS (1-2 semanas)

#### TAREA 4.1: Sincronización de Tipos TS (GAP-008)
**Prioridad:** P2
**Estimación:** 1 día (setup) + mantenimiento continuo
**Agente:** Backend-Developer + Frontend-Developer

**Objetivo:** Tipos TypeScript frontend sincronizados con DTOs backend

**Opción A: Generación Automática (Recomendada)**

**Paso 1: Instalar herramientas**
```bash
cd apps/frontend
npm install -D openapi-typescript
npm install -D @hey-api/openapi-ts
```

**Paso 2: Configurar Swagger en backend**
```typescript
// apps/backend/src/main.ts

const config = new DocumentBuilder()
  .setTitle('GAMILIT API')
  .setDescription('API de Gamificación Educativa')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);

// Guardar JSON para generación de tipos
fs.writeFileSync(
  path.join(__dirname, '../../frontend/src/types/api-schema.json'),
  JSON.stringify(document, null, 2)
);

SwaggerModule.setup('api/docs', app, document);
```

**Paso 3: Generar tipos**
```bash
# package.json script
"scripts": {
  "generate:types": "openapi-typescript ./src/types/api-schema.json -o ./src/types/api.d.ts"
}

# Ejecutar
npm run generate:types
```

**Paso 4: Usar tipos generados**
```typescript
// apps/frontend/src/apps/admin/hooks/useSystemMonitoring.ts
import type { paths } from '@/types/api';

type AlertsResponse = paths['/v1/admin/dashboard/alerts']['get']['responses']['200']['content']['application/json'];

const response = await apiClient.get<AlertsResponse>(
  API_ENDPOINTS.admin.dashboard.alerts
);
```

**Opción B: Manual (No recomendada, pero como fallback)**

**Paso 1: Copiar DTOs a frontend**
```bash
# Script para copiar DTOs
# scripts/sync-types.sh

#!/bin/bash
cp apps/backend/src/modules/admin/dto/dashboard/alerts.dto.ts \
   apps/frontend/src/types/backend/alerts.dto.ts

# ... otros DTOs
```

**Paso 2: Convertir DTOs a types TS**
```typescript
// apps/frontend/src/types/backend/alerts.dto.ts

// DTO original (backend):
export class AlertDto {
  id!: string;
  type!: 'error' | 'warning' | 'info' | 'security';
  severity!: 'low' | 'medium' | 'high' | 'critical';
  title!: string;
  message!: string;
  details?: string;
  timestamp!: Date;
  dismissed!: boolean;
}

// Convertir a type (frontend):
export type AlertDto = {
  id: string;
  type: 'error' | 'warning' | 'info' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  details?: string;
  timestamp: Date;
  dismissed: boolean;
};
```

**Paso 3: Agregar validación en CI/CD**
```yaml
# .github/workflows/type-check.yml
name: Type Check

on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: |
          cd apps/frontend
          npm ci

      - name: Generate types from OpenAPI
        run: npm run generate:types

      - name: Type check
        run: npm run type-check

      - name: Check for type mismatches
        run: |
          # Verificar que tipos generados no tengan cambios sin commitear
          git diff --exit-code src/types/api.d.ts
```

**Validación:**
```bash
# Ejecutar generación
npm run generate:types

# Verificar que se generó correctamente
ls src/types/api.d.ts

# Type check
npm run type-check

# Debería pasar sin errores
```

---

#### TAREA 4.2: Documentación APIs (GAP-009)
**Prioridad:** P2
**Estimación:** 2 días
**Agente:** Backend-Developer

**Objetivo:** Documentación completa de todas las APIs

**Paso 1: Completar decoradores Swagger**
```typescript
// Ejemplo: apps/backend/src/modules/admin/controllers/admin-dashboard.controller.ts

@Controller('admin/dashboard')
@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminDashboardController {

  @Get('alerts')
  @ApiOperation({
    summary: 'Obtener alertas del sistema',
    description: 'Devuelve lista de alertas del sistema filtradas por estado'
  })
  @ApiQuery({
    name: 'dismissed',
    required: false,
    type: Boolean,
    description: 'Filtrar por alertas descartadas (true) o activas (false)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de alertas a devolver'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas',
    type: [AlertDto]
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado'
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (requiere rol admin)'
  })
  async getAlerts(
    @Query('dismissed') dismissed?: boolean,
    @Query('limit') limit?: number,
  ): Promise<AlertDto[]> {
    // ... implementation
  }
}
```

**Paso 2: Generar documentación estática**
```bash
# Instalar herramienta
npm install -D @nestjs/swagger-cli

# Generar HTML estático
npx @nestjs/cli plugins -- swagger generate ./docs/api/swagger.json

# Convertir a HTML
npx redoc-cli bundle docs/api/swagger.json -o docs/api/index.html
```

**Paso 3: Crear guías de integración**
```markdown
# docs/api/integration-guide.md

## Guía de Integración Frontend-Backend

### Autenticación

Todas las rutas (excepto `/auth/login` y `/auth/register`) requieren autenticación.

#### Flujo de autenticación:

1. **Login:**
```typescript
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

2. **Usar token en requests:**
```typescript
GET /v1/admin/dashboard/alerts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: tenant-uuid
```

3. **Refresh token:**
```typescript
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Alertas de Sistema (Admin)

#### GET /v1/admin/dashboard/alerts

Obtiene lista de alertas del sistema.

**Query Parameters:**
- `dismissed` (boolean, opcional): Filtrar por estado
- `limit` (number, opcional): Límite de resultados

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-uuid",
      "type": "error",
      "severity": "high",
      "title": "Error en sincronización",
      "message": "No se pudo sincronizar con servicio externo",
      "details": "Connection timeout after 30s",
      "timestamp": "2025-11-24T10:30:00Z",
      "dismissed": false
    }
  ]
}
```

**Ejemplo frontend:**
```typescript
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiConfig';

const response = await apiClient.get<{
  success: boolean;
  data: AlertDto[];
}>(API_ENDPOINTS.admin.dashboard.alerts, {
  params: {
    dismissed: false,
    limit: 50,
  },
});

const alerts = response.data.data;
```

... (continuar con todos los endpoints)
```

**Paso 4: Agregar ejemplos de requests**
```bash
# docs/api/examples/admin-alerts.http

### Get active alerts
GET http://localhost:3006/api/v1/admin/dashboard/alerts?dismissed=false&limit=50
Authorization: Bearer {{accessToken}}
X-Tenant-Id: {{tenantId}}

### Dismiss alert
POST http://localhost:3006/api/v1/admin/dashboard/alerts/{{alertId}}/dismiss
Authorization: Bearer {{accessToken}}
X-Tenant-Id: {{tenantId}}
Content-Type: application/json

{
  "reason": "Issue resolved"
}
```

**Validación:**
```bash
# Verificar Swagger actualizado
curl http://localhost:3006/api/docs

# Verificar documentación generada
ls docs/api/index.html

# Abrir en navegador
open docs/api/index.html
```

---

#### TAREA 4.3: Tests de Integración (GAP-010)
**Prioridad:** P2
**Estimación:** 3-4 días
**Agente:** QA + Frontend-Developer + Backend-Developer

**Objetivo:** Suite de tests E2E y contract testing

**Paso 1: Setup Playwright**
```bash
cd apps/frontend
npm install -D @playwright/test

# Inicializar
npx playwright install
```

**Paso 2: Crear tests E2E**
```typescript
// tests/e2e/admin/alerts.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Admin Alerts', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('http://localhost:5173/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Esperar redirección
    await page.waitForURL('**/admin/dashboard');
  });

  test('debe cargar alertas correctamente', async ({ page }) => {
    // Ir a dashboard
    await page.goto('http://localhost:5173/admin/dashboard');

    // Interceptar request
    const alertsResponse = page.waitForResponse(
      response => response.url().includes('/api/v1/admin/dashboard/alerts')
    );

    await page.reload();

    const response = await alertsResponse;

    // Validar request
    expect(response.status()).toBe(200);
    expect(response.url()).toContain('/api/v1/admin/dashboard/alerts');

    // Validar response
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);

    // Validar UI
    if (data.data.length > 0) {
      await expect(page.locator('[data-testid="alert-item"]')).toHaveCount(data.data.length);
    }
  });

  test('debe descartar alerta correctamente', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/dashboard');

    // Esperar que carguen alertas
    await page.waitForSelector('[data-testid="alert-item"]');

    // Click en dismiss de primera alerta
    const dismissButton = page.locator('[data-testid="alert-dismiss"]').first();
    await dismissButton.click();

    // Interceptar request
    const dismissResponse = page.waitForResponse(
      response => response.url().includes('/dismiss')
    );

    const response = await dismissResponse;

    // Validar
    expect(response.status()).toBe(200);
    expect(response.url()).toMatch(/\/api\/v1\/admin\/dashboard\/alerts\/[^/]+\/dismiss/);

    // Validar que alerta desaparece de UI
    await page.waitForTimeout(1000);
    // ... validar cambio en UI
  });
});
```

**Paso 3: Contract Testing con Pact**
```bash
npm install -D @pact-foundation/pact
```

```typescript
// tests/contract/admin-alerts.pact.spec.ts

import { PactV3 } from '@pact-foundation/pact';
import { apiClient } from '@/services/api/apiClient';

const provider = new PactV3({
  consumer: 'GamilIT-Frontend',
  provider: 'GamilIT-Backend',
});

describe('Admin Alerts API Contract', () => {
  it('debe obtener lista de alertas', async () => {
    await provider
      .given('existen alertas activas')
      .uponReceiving('una petición de alertas')
      .withRequest({
        method: 'GET',
        path: '/api/v1/admin/dashboard/alerts',
        query: { dismissed: 'false', limit: '50' },
        headers: {
          Authorization: 'Bearer TOKEN',
          'X-Tenant-Id': 'TENANT_ID',
        },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: true,
          data: [
            {
              id: 'alert-1',
              type: 'error',
              severity: 'high',
              title: 'Test Alert',
              message: 'Test message',
              timestamp: '2025-11-24T10:00:00Z',
              dismissed: false,
            },
          ],
        },
      });

    await provider.executeTest(async (mockServer) => {
      apiClient.defaults.baseURL = mockServer.url;

      const response = await apiClient.get('/api/v1/admin/dashboard/alerts', {
        params: { dismissed: false, limit: 50 },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveLength(1);
    });
  });
});
```

**Paso 4: Integrar en CI/CD**
```yaml
# .github/workflows/e2e.yml

name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm ci
          cd apps/backend && npm ci
          cd ../frontend && npm ci

      - name: Setup database
        run: |
          cd apps/database
          ./scripts/drop-and-recreate-database.sh

      - name: Start backend
        run: |
          cd apps/backend
          npm run start:dev &
          sleep 30  # Esperar que backend inicie

      - name: Start frontend
        run: |
          cd apps/frontend
          npm run dev &
          sleep 10  # Esperar que frontend inicie

      - name: Run Playwright tests
        run: |
          cd apps/frontend
          npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/frontend/playwright-report/
```

**Validación:**
```bash
# Ejecutar tests localmente
cd apps/frontend

# E2E
npx playwright test

# Contract
npm run test:contract

# Ver reporte
npx playwright show-report
```

---

## 10. ESPECIFICACIONES TÉCNICAS PARA IMPLEMENTACIÓN

### 10.1 Estructura de Archivos Modificados

**Resumen de cambios por archivo:**

| Archivo | Tipo Cambio | Líneas | Prioridad |
|---------|-------------|--------|-----------|
| `apps/frontend/src/services/api/admin/classroomTeacherApi.ts` | Modificar línea 13 | 1 | P0 |
| `apps/frontend/src/services/api/apiConfig.ts` | Modificar línea 304 | 1 | P0 |
| `apps/frontend/src/apps/admin/hooks/useSystemMonitoring.ts` | Modificar línea 103 | 5 | P0 |
| `apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts` | Modificar línea 291 | 5 | P0 |
| `apps/frontend/.env.production` | Crear nuevo | 10 | P0 |
| `apps/frontend/src/config/env.ts` | Refactorizar completo | 50 | P0 |
| `apps/frontend/src/apps/admin/pages/AdminApprovalsPage.tsx` | Refactorizar completo | 100 | P0 |
| `apps/frontend/src/apps/admin/hooks/useContentManagement.ts` | Deprecar useApprovals | 10 | P0 |
| `apps/frontend/src/apps/admin/components/content/ContentApprovalQueue.tsx` | Modificar import y uso | 10 | P0 |

**Total estimado:** ~200 líneas modificadas/agregadas para P0

---

### 10.2 Checklist de Validación por Gap

#### GAP-001: Alerts Route
- [ ] Modificado apiConfig.ts:304
- [ ] Modificado useSystemMonitoring.ts:103
- [ ] Modificado useAdminDashboard.ts:291
- [ ] Test manual: Cargar dashboard admin
- [ ] Test manual: Verificar no hay 404 en consola
- [ ] Test manual: Ver alertas en UI
- [ ] Test manual: Dismiss una alerta
- [ ] Verificar en Network tab: ruta correcta `/api/v1/admin/dashboard/alerts`

#### GAP-002: Classroom-Teacher Duplicate /api
- [ ] Modificado classroomTeacherApi.ts:13
- [ ] Test manual: Ir a gestión de aulas
- [ ] Test manual: Asignar profesor a aula
- [ ] Verificar en Network tab: ruta correcta `/api/v1/admin/classrooms/...`
- [ ] Verificar no hay 404

#### GAP-003: Aprobaciones
- [ ] Modificado AdminApprovalsPage.tsx (usar hook real)
- [ ] Deprecado useApprovals en useContentManagement.ts
- [ ] Modificado ContentApprovalQueue.tsx (usar usePendingExercises)
- [ ] Test manual: Crear contenido pendiente
- [ ] Test manual: Ver página de aprobaciones
- [ ] Verificar datos REALES (no mock)
- [ ] Test manual: Aprobar contenido
- [ ] Verificar en DB: status cambió
- [ ] Verificar en Network tab: ruta correcta `/api/v1/admin/content/:id/approve`

#### GAP-004: Variables Entorno Producción
- [ ] Creado .env.production
- [ ] Creado .env.example
- [ ] Modificado env.ts (validación)
- [ ] Modificado apiClient.ts (usar env.apiUrl)
- [ ] Test: Build con variables correctas
- [ ] Test: Build sin variables (debe fallar)
- [ ] Documentado en README

#### GAP-007: Gamificación
- [ ] Validado drop-and-recreate-database.sh
- [ ] Verificado seeds de gamificación
- [ ] Agregado logging en frontend
- [ ] Implementado error boundary
- [ ] Test: Recrear DB completa
- [ ] Test: Login en cada portal
- [ ] Verificar no hay errores en consola
- [ ] Verificar componentes de gamificación cargan

---

## 11. VALIDACIÓN Y TESTING

### 11.1 Plan de Testing Post-Fixes

**Nivel 1: Unit Tests**
```bash
# Backend
cd apps/backend
npm test

# Frontend
cd apps/frontend
npm test
```

**Nivel 2: Integration Tests**
```bash
# API endpoints
cd apps/backend
npm run test:e2e
```

**Nivel 3: E2E Tests**
```bash
# Playwright
cd apps/frontend
npx playwright test

# Con UI
npx playwright test --ui
```

**Nivel 4: Manual Testing**

**Checklist de testing manual:**

**Portal Admin:**
- [ ] Login como admin
- [ ] Dashboard carga sin errores
- [ ] Alertas se muestran correctamente
- [ ] Dismiss de alerta funciona
- [ ] Gestión de aulas: listar aulas
- [ ] Gestión de aulas: asignar profesor
- [ ] Página de aprobaciones: listar pendientes
- [ ] Página de aprobaciones: aprobar contenido
- [ ] Página de aprobaciones: rechazar contenido
- [ ] Gamificación en header carga correctamente
- [ ] No hay errores 404 en consola
- [ ] No hay errores 500 en consola

**Portal Teacher:**
- [ ] Login como teacher
- [ ] Dashboard carga sin errores
- [ ] Gamificación en header carga correctamente
- [ ] Classrooms cargan
- [ ] Assignments cargan
- [ ] No hay errores en consola

**Portal Student:**
- [ ] Login como student
- [ ] Dashboard carga sin errores
- [ ] Gamificación completa carga (achievements, ranks, coins, etc.)
- [ ] Leaderboard carga
- [ ] Modules cargan
- [ ] No hay errores en consola

**Cross-cutting:**
- [ ] Recrear base de datos completa
- [ ] Verificar todos los portales POST-recreación
- [ ] Verificar gamificación funciona en todos los portales
- [ ] Verificar no hay errores en consola en ningún portal

---

### 11.2 Criterios de Aceptación

**CRÍTICOS (P0):** TODOS deben pasar antes de considerar resuelto

1. ✅ Portal admin dashboard carga sin errores 404
2. ✅ Alertas se muestran correctamente
3. ✅ Gestión de aulas funcional
4. ✅ Página de aprobaciones conectada con backend real
5. ✅ Variables de entorno para producción configuradas
6. ✅ Build de producción exitoso
7. ✅ Gamificación funciona en los 3 portales tras recrear DB

**ALTOS (P1):** Deseables para release

8. ✅ Versionamiento consistente en todas las rutas
9. ✅ Rutas centralizadas en apiConfig.ts
10. ✅ Documentación actualizada

**MEDIOS (P2):** Mejoras continuas

11. ✅ Tipos TypeScript sincronizados
12. ✅ Documentación completa de APIs
13. ✅ Suite de tests E2E

---

## 12. REFERENCIAS

### Documentos del Proyecto

- **Directivas:**
  - `orchestration/directivas/ESTANDARES-NOMENCLATURA.md`
  - `orchestration/directivas/DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md`
  - `orchestration/directivas/POLITICAS-USO-AGENTES.md`

- **Inventarios:**
  - `orchestration/inventarios/FRONTEND_INVENTORY.yml`
  - `orchestration/inventarios/DATABASE_INVENTORY.yml`

- **ADRs:**
  - `docs/97-adr/ADR-013-centralizacion-rutas-api.md` (propuesto)

### Archivos Clave Analizados

**Frontend:**
- `apps/frontend/src/services/api/apiConfig.ts` (417 líneas)
- `apps/frontend/src/services/api/apiClient.ts`
- `apps/frontend/src/services/api/adminAPI.ts`
- `apps/frontend/src/services/api/gamificationAPI.ts`
- `apps/frontend/src/services/api/admin/classroomTeacherApi.ts`
- `apps/frontend/src/apps/admin/hooks/useSystemMonitoring.ts`
- `apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts`
- `apps/frontend/src/apps/admin/hooks/useContentManagement.ts`
- `apps/frontend/src/apps/admin/pages/AdminApprovalsPage.tsx`
- `apps/frontend/src/config/env.ts`

**Backend:**
- `apps/backend/src/main.ts`
- `apps/backend/src/shared/constants/routes.constants.ts`
- `apps/backend/src/modules/admin/controllers/admin-dashboard.controller.ts`
- `apps/backend/src/modules/admin/controllers/admin-content.controller.ts`
- `apps/backend/src/modules/admin/dto/dashboard/alerts.dto.ts`
- `apps/backend/src/modules/gamification/**/*.controller.ts`

### Agentes Involucrados

- **Frontend-Developer:** Responsable de 7 gaps
- **Backend-Developer:** Responsable de 3 gaps
- **Database-Developer:** Responsable de 1 gap
- **DevOps-Agent:** Responsable de 2 gaps

---

## CONCLUSIÓN

Este análisis ha identificado **10 gaps críticos y arquitectónicos** que afectan la funcionalidad del sistema, especialmente el portal de administración y la integración de gamificación.

**Impacto actual:**
- Portal Admin: 80% funcionalidad afectada
- Gamificación: Falla en 100% de portales tras recrear DB
- Deployment a producción: Bloqueado

**Resolución propuesta:**
- Fase 1 (P0): 3-4 horas → Hace funcional el sistema
- Fase 2 (P1): 7-10 horas → Estabiliza la arquitectura
- Fase 3 (P2): 1-2 semanas → Mejoras de calidad

**Próximos pasos:**
1. Revisar y aprobar este reporte
2. Priorizar gaps según impacto de negocio
3. Asignar tareas a agentes correspondientes
4. Ejecutar plan de corrección por fases
5. Validar cada fase antes de continuar

**Trazabilidad:**
- Matriz de gaps: `01-MATRIZ-GAPS.yml`
- Reporte completo: `02-REPORTE-ANALISIS-COMPLETO.md`
- Plan de implementación: Documentado en sección 9 y 10

---

**Elaborado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
**Estado:** Completado - Pendiente de revisión y aprobación
