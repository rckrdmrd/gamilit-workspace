# PLAN DE HOMOLOGACIÓN DE RUTAS API

**Versión:** 1.0.0
**Fecha:** 2025-11-24
**Objetivo:** Centralizar configuración de rutas API eliminando paths hardcodeados

---

## RESUMEN EJECUTIVO

Este plan define los pasos para homologar la configuración de rutas API entre frontend y backend, utilizando variables de entorno y archivos de configuración centralizados.

### Configuración Objetivo

```
Frontend (puerto 3005) ──HTTP/WS──▶ Backend (puerto 3006)
                                            │
                                            ▼
                                    API: /api/v1/*
```

**Variables de entorno estándar:**
```env
# Frontend (.env)
VITE_API_PROTOCOL=http          # http | https
VITE_API_HOST=localhost         # localhost | IP | dominio
VITE_API_PORT=3006              # puerto del backend
VITE_WS_PROTOCOL=ws             # ws | wss

# Backend (.env)
PORT=3006
API_PREFIX=/api
API_VERSION=/v1
CORS_ORIGINS=http://localhost:3005
```

---

## PARTE 1: ARQUITECTURA DE CONFIGURACIÓN

### 1.1 Estructura Actual (Problemas)

```
apps/frontend/
├── .env                    # Variables de desarrollo
├── .env.production         # ⚠️ PROBLEMA: https sin soporte
├── src/config/
│   ├── api.config.ts       # ✅ 300+ rutas bien definidas
│   └── env.ts              # ⚠️ PROBLEMA: requiere variables legacy
└── src/services/api/
    ├── apiClient.ts        # ✅ Usa api.config.ts
    └── apiConfig.deprecated.ts  # ⚠️ Archivo obsoleto

apps/backend/
├── .env                    # Variables de desarrollo
├── .env.production         # Configuración de producción
└── src/
    ├── main.ts             # ✅ CORS configurado correctamente
    └── shared/middleware/
        └── cors.config.ts  # ⚠️ PROBLEMA: No utilizado
```

### 1.2 Estructura Objetivo

```
apps/frontend/
├── .env                    # Desarrollo (http, localhost)
├── .env.production         # Producción (http/https según decisión)
├── .env.test               # Tests (nuevo)
├── src/config/
│   ├── api.config.ts       # ✅ Mantener (single source of truth)
│   └── env.ts              # 🔄 Refactorizar (eliminar legacy)

apps/backend/
├── .env                    # Desarrollo
├── .env.production         # Producción
└── src/
    ├── main.ts             # ✅ Mantener
    └── shared/middleware/
        └── (eliminar cors.config.ts)
```

---

## PARTE 2: TAREAS DE HOMOLOGACIÓN

### TAREA 1: Decisión Arquitectónica - Protocolo de Producción

**Pregunta clave:** ¿El sistema requiere HTTPS en producción?

| Opción | Frontend | Backend | WebSocket | Complejidad |
|--------|----------|---------|-----------|-------------|
| **A: HTTP** | http://ip:3005 | http://ip:3006 | ws://ip:3006 | Baja |
| **B: HTTPS** | https://dominio | https://dominio:3006 | wss://dominio:3006 | Alta (requiere SSL) |
| **C: Proxy** | https://dominio | http://localhost:3006 | wss://dominio | Media (nginx/traefik) |

**Recomendación:** Opción C (Proxy reverso) para producción. HTTP en desarrollo.

**Acción requerida:** Decisión del usuario antes de continuar.

---

### TAREA 2: Homologar Variables de Entorno Frontend

**Archivo:** `apps/frontend/.env.example`

**Actual:**
```env
# Variables legacy (a eliminar)
VITE_API_URL=http://localhost:3006
VITE_WS_URL=ws://localhost:3006

# Variables nuevas (mantener)
VITE_API_PROTOCOL=http
VITE_API_HOST=localhost
VITE_API_PORT=3006
VITE_WS_PROTOCOL=ws
```

**Objetivo:**
```env
# API Configuration
VITE_API_PROTOCOL=http
VITE_API_HOST=localhost
VITE_API_PORT=3006
VITE_API_VERSION=v1

# WebSocket Configuration
VITE_WS_PROTOCOL=ws
VITE_WS_HOST=${VITE_API_HOST}
VITE_WS_PORT=${VITE_API_PORT}

# Feature Flags
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_DEBUG_MODE=true
```

**Agente:** Frontend-Agent
**Archivos a modificar:**
- `apps/frontend/.env`
- `apps/frontend/.env.example`
- `apps/frontend/.env.production`
- Crear: `apps/frontend/.env.test`

---

### TAREA 3: Refactorizar env.ts (Frontend)

**Archivo:** `apps/frontend/src/config/env.ts`

**Problema actual:** Requiere variables legacy (`VITE_API_URL`, `VITE_WS_URL`)

**Refactorización:**
```typescript
// env.ts - NUEVO
export const env = {
  api: {
    protocol: import.meta.env.VITE_API_PROTOCOL || 'http',
    host: import.meta.env.VITE_API_HOST || 'localhost',
    port: import.meta.env.VITE_API_PORT || '3006',
    version: import.meta.env.VITE_API_VERSION || 'v1',
    get baseUrl() {
      return `${this.protocol}://${this.host}:${this.port}/api/${this.version}`;
    }
  },
  ws: {
    protocol: import.meta.env.VITE_WS_PROTOCOL || 'ws',
    host: import.meta.env.VITE_WS_HOST || import.meta.env.VITE_API_HOST || 'localhost',
    port: import.meta.env.VITE_WS_PORT || import.meta.env.VITE_API_PORT || '3006',
    get url() {
      return `${this.protocol}://${this.host}:${this.port}`;
    }
  },
  features: {
    enableWebSocket: import.meta.env.VITE_ENABLE_WEBSOCKET === 'true',
    debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  }
};
```

**Agente:** Frontend-Agent
**Archivos a modificar:**
- `apps/frontend/src/config/env.ts`

---

### TAREA 4: Corregir WebSocket Hardcodeado

**Archivo:** `apps/frontend/src/apps/student/pages/LeaderboardPage.tsx`

**Línea 62 (actual - comentada):**
```typescript
// const socket = io('http://localhost:3006', {
//   auth: { token: getToken() }
// });
```

**Corrección:**
```typescript
import { env } from '@/config/env';

// En el componente:
const socket = io(env.ws.url, {
  auth: { token: getToken() }
});
```

**Agente:** Frontend-Agent
**Archivos a modificar:**
- `apps/frontend/src/apps/student/pages/LeaderboardPage.tsx`

---

### TAREA 5: Eliminar Archivo CORS Obsoleto

**Archivo:** `apps/backend/src/shared/middleware/cors.config.ts`

**Estado:** No utilizado (CORS configurado en main.ts)

**Acción:** Eliminar archivo

**Agente:** Backend-Agent
**Archivos a eliminar:**
- `apps/backend/src/shared/middleware/cors.config.ts`

---

### TAREA 6: Verificar CORS en Backend

**Archivo:** `apps/backend/src/main.ts`

**Verificar que soporta:**
- `http://localhost:3005` (desarrollo frontend)
- `http://localhost:3006` (desarrollo backend)
- IP de producción (configurable por env)

**Configuración recomendada:**
```typescript
// main.ts
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3005',
  'http://localhost:3006',
];

app.enableCors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
```

**Agente:** Backend-Agent
**Archivos a verificar/modificar:**
- `apps/backend/src/main.ts`
- `apps/backend/.env.example`

---

### TAREA 7: Crear Archivo .env.test

**Nuevo archivo:** `apps/frontend/.env.test`

**Contenido:**
```env
# Test Environment
VITE_API_PROTOCOL=http
VITE_API_HOST=localhost
VITE_API_PORT=3006
VITE_API_VERSION=v1
VITE_WS_PROTOCOL=ws
VITE_ENABLE_WEBSOCKET=false
VITE_ENABLE_DEBUG_MODE=true
```

**Agente:** Frontend-Agent
**Archivos a crear:**
- `apps/frontend/.env.test`

---

### TAREA 8: Eliminar apiConfig.deprecated.ts

**Archivo:** `apps/frontend/src/services/api/apiConfig.deprecated.ts`

**Estado:** Marcado como deprecated

**Acción:** Eliminar después de verificar que no hay imports

**Agente:** Frontend-Agent
**Archivos a eliminar:**
- `apps/frontend/src/services/api/apiConfig.deprecated.ts`

---

## PARTE 3: ORDEN DE EJECUCIÓN

### Fase A: Preparación (Secuencial)

```
1. Decisión arquitectónica HTTPS (Usuario)
   └─▶ 2. Actualizar .env files (Frontend-Agent)
       └─▶ 3. Refactorizar env.ts (Frontend-Agent)
```

### Fase B: Correcciones (Paralelo)

```
4. Corregir WebSocket (Frontend-Agent)  ─┐
5. Eliminar cors.config.ts (Backend-Agent) ├─▶ Verificar funcionamiento
6. Verificar CORS main.ts (Backend-Agent) ─┘
```

### Fase C: Limpieza (Secuencial)

```
7. Crear .env.test (Frontend-Agent)
   └─▶ 8. Eliminar apiConfig.deprecated.ts (Frontend-Agent)
       └─▶ 9. Validar build y tests
```

---

## PARTE 4: CRITERIOS DE ACEPTACIÓN

### Por Tarea

| Tarea | Criterio de Aceptación |
|-------|------------------------|
| 2 | Variables de entorno documentadas y consistentes entre archivos .env |
| 3 | env.ts NO usa variables legacy, construye URLs correctamente |
| 4 | WebSocket usa env.ws.url, no hay localhost hardcodeado |
| 5 | cors.config.ts eliminado, sin errores de import |
| 6 | CORS permite localhost:3005 y orígenes de producción |
| 7 | .env.test creado y funcional para tests |
| 8 | apiConfig.deprecated.ts eliminado, sin errores de import |

### Validación Final

```bash
# Frontend
cd apps/frontend
npm run build          # Sin errores
npm run type-check     # Sin errores de tipos
npm run test           # Tests pasan

# Backend
cd apps/backend
npm run build          # Sin errores
npm run start:dev      # CORS funciona correctamente
```

---

## PARTE 5: DOCUMENTACIÓN A ACTUALIZAR

Después de completar las tareas:

1. **README.md** - Actualizar sección de configuración
2. **docs/deployment/** - Actualizar guías de deployment
3. **orchestration/inventarios/FRONTEND_INVENTORY.yml** - Actualizar estado de archivos
4. **orchestration/inventarios/BACKEND_INVENTORY.yml** - Actualizar estado de archivos

---

## PRÓXIMOS PASOS

1. ⏳ Esperar decisión arquitectónica sobre HTTPS
2. ⏳ Orquestar agentes según plan de ejecución
3. ⏳ Validar criterios de aceptación
4. ⏳ Actualizar documentación

---

*Plan generado por Architecture-Analyst v2.1*
