# GAP-011: API Configuration Migration - Duplicated /v1/ in URLs

**ID:** GAP-011
**Categoría:** Arquitectura - Configuración API
**Severidad:** CRÍTICA
**Estado:** Identificado
**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst

---

## 📋 RESUMEN EJECUTIVO

### Síntoma
Frontend genera URLs con `/v1/v1/` duplicado al llamar APIs del backend, causando errores 404:
- ❌ `GET http://localhost:3006/api/v1/v1/educational/modules/user/...`
- ❌ `GET http://localhost:3006/api/v1/v1/progress/users/.../recent-activities`
- ❌ `GET http://localhost:3006/api/v1/v1/gamification/users/.../summary`

### Causa Raíz
**Migración incompleta** entre dos configuraciones de API que coexisten:
- **Configuración NUEVA:** `/config/api.config.ts` (baseURL incluye `/v1`, endpoints sin `/v1`)
- **Configuración VIEJA:** `/services/api/apiConfig.ts` (baseURL sin `/v1`, endpoints con `/v1`)
- `apiClient` usa configuración NUEVA pero APIs importan endpoints de configuración VIEJA

### Impacto
- ✅ Usuario registrado correctamente (trigger inicialización funciona)
- ✅ Datos inicializados en BD (user_stats, user_ranks)
- ❌ **Frontend NO puede obtener datos** por URLs incorrectas (404)
- ❌ **Dashboard no carga información** de módulos/progreso/gamificación

---

## 🔍 ANÁLISIS TÉCNICO DETALLADO

### 1. Configuración NUEVA (`/config/api.config.ts`)

**Ubicación:** `apps/frontend/src/config/api.config.ts`

**Características:**
```typescript
// Línea 39
export const API_BASE_URL = `${API_PROTOCOL}://${API_HOST}/api/${API_VERSION}`;
// Resultado: http://localhost:3006/api/v1 (INCLUYE /v1)

// Línea 52
export const API_CONFIG = {
  baseURL: API_BASE_URL,  // http://localhost:3006/api/v1
  ...
}

// Línea 65 - Comentario clave
// "API Endpoints - Todas las rutas relativas (sin /v1, ya está en baseURL)"

// Línea 102
userModules: (userId: string) => `/educational/modules/user/${userId}`,
// SIN /v1 al inicio
```

**Diseño:**
- `baseURL = "http://localhost:3006/api/v1"`
- Endpoints relativos SIN `/v1`: `/educational/modules/...`
- Axios concatena: `baseURL + endpoint = .../api/v1/educational/...` ✅ CORRECTO

---

### 2. Configuración VIEJA (`/services/api/apiConfig.ts`)

**Ubicación:** `apps/frontend/src/services/api/apiConfig.ts`

**Características:**
```typescript
// Línea 482
BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3006/api',
// Resultado: http://localhost:3006/api (SIN /v1)

// Línea 204
userModules: (userId: string) => `/v1/educational/modules/user/${userId}`,
// CON /v1 al inicio
```

**Diseño:**
- `BASE_URL = "http://localhost:3006/api"`
- Endpoints relativos CON `/v1`: `/v1/educational/modules/...`
- Axios concatena: `BASE_URL + endpoint = .../api/v1/educational/...` ✅ CORRECTO

---

### 3. El Conflicto (Causa del Bug)

**Archivo:** `apiClient.ts`
**Línea 10:**
```typescript
import { API_CONFIG, FEATURE_FLAGS } from '@/config/api.config';
```
**Resultado:** Importa de **configuración NUEVA**
- `apiClient.baseURL = "http://localhost:3006/api/v1"` (CON `/v1`)

**Archivo:** `educationalAPI.ts`
**Línea 9:**
```typescript
import { API_ENDPOINTS, FEATURE_FLAGS } from './apiConfig';
```
**Resultado:** Importa de **configuración VIEJA**
- Endpoints tienen `/v1` al inicio: `/v1/educational/modules/...`

**Concatenación:**
```
apiClient.baseURL + API_ENDPOINTS.educational.userModules(userId)
= "http://localhost:3006/api/v1" + "/v1/educational/modules/user/..."
= "http://localhost:3006/api/v1/v1/educational/modules/user/..."
❌ DUPLICADO
```

---

## 📊 ALCANCE DEL PROBLEMA

### Archivos Afectados

#### Importan del VIEJO `./apiConfig` o `../apiConfig` (8 archivos)
```
apps/frontend/src/services/api/
├── educationalAPI.ts ⚠️
├── adminAPI.ts ⚠️
├── index.ts ⚠️
└── teacher/
    ├── analyticsApi.ts ⚠️
    ├── assignmentsApi.ts ⚠️
    ├── classroomsApi.ts ⚠️
    └── teacherApi.ts ⚠️
```

#### Importan del VIEJO `@/services/api/apiConfig` (16 archivos)
```
apps/frontend/src/
├── apps/admin/hooks/
│   ├── useAdminDashboard.ts ⚠️
│   └── useSystemMonitoring.ts ⚠️
├── features/
│   ├── auth/api/authAPI.ts ⚠️
│   ├── content/api/contentAPI.ts ⚠️
│   ├── progress/api/progressAPI.ts ⚠️
│   ├── gamification/
│   │   ├── api/gamificationAPI.ts ⚠️
│   │   ├── economy/api/economyAPI.ts ⚠️
│   │   ├── economy/api/inventoryAPI.ts ⚠️
│   │   ├── ranks/api/ranksAPI.ts ⚠️
│   │   └── social/api/
│   │       ├── achievementsAPI.ts ⚠️
│   │       └── socialAPI.ts ⚠️
│   ├── admin/api/adminAPI.ts ⚠️
│   └── mechanics/shared/api/
│       ├── mechanicsAPI.ts ⚠️
│       └── aiServiceAPI.ts ⚠️
└── (más archivos...)
```

**Total:** 24 archivos afectados

#### Archivos que YA usan NUEVO `@/config/api.config` ✅
```
apps/frontend/src/services/api/
├── apiClient.ts ✅ (CORRECTO - baseURL del nuevo)
└── admin/
    ├── classroomTeacherApi.ts ✅
    └── gamificationConfigApi.ts ✅
```

---

## 🎯 SOLUCIÓN PROPUESTA

### Opción Seleccionada: **Completar migración a configuración NUEVA**

**Justificación:**
1. ✅ Configuración NUEVA es más limpia (comentarios claros, mejor organizada)
2. ✅ Sigue patrón estándar de Axios (baseURL con prefijo, rutas relativas simples)
3. ✅ `apiClient` ya usa la nueva configuración
4. ✅ ADR-015 documenta la arquitectura centralizada

**Acciones:**
1. **Migrar imports** en 24 archivos:
   - Cambiar `from './apiConfig'` → `from '@/config/api.config'`
   - Cambiar `from '@/services/api/apiConfig'` → `from '@/config/api.config'`

2. **Deprecar archivo viejo:**
   - Mover `/services/api/apiConfig.ts` → `/services/api/apiConfig.deprecated.ts`
   - Agregar warning en archivo deprecado

3. **Actualizar exports** en `/services/api/index.ts`:
   - Re-exportar desde `@/config/api.config`

4. **Validar** que todas las rutas funcionan

---

## ✅ CRITERIOS DE ACEPTACIÓN

1. **Funcional:**
   - [ ] Frontend genera URLs correctas: `/api/v1/educational/...` (un solo `/v1`)
   - [ ] Dashboard carga datos correctamente para usuario recién registrado
   - [ ] No más errores 404 en consola para rutas válidas

2. **Técnico:**
   - [ ] Todos los imports apuntan a `@/config/api.config`
   - [ ] Archivo viejo deprecado correctamente
   - [ ] Tests pasan (si existen)
   - [ ] Build sin errores TypeScript

3. **Documentación:**
   - [ ] ADR-015 actualizado con resultado de migración
   - [ ] Comentarios en código deprecado
   - [ ] CHANGELOG.md actualizado

---

## 🔧 PLAN DE IMPLEMENTACIÓN

### Fase 1: Preparación
- [x] Análisis completo (este documento)
- [ ] Backup de archivos a modificar

### Fase 2: Migración (Frontend-Agent)
- [ ] Migrar 8 archivos en `/services/api/`
- [ ] Migrar 16 archivos en `/features/` y `/apps/`
- [ ] Actualizar `/services/api/index.ts`
- [ ] Deprecar `/services/api/apiConfig.ts`

### Fase 3: Validación
- [ ] Build exitoso
- [ ] Smoke test manual
- [ ] Verificar URLs en consola browser
- [ ] Validar dashboard con usuario de prueba

### Fase 4: Documentación
- [ ] Actualizar ADR-015
- [ ] Agregar entrada en CHANGELOG.md
- [ ] Actualizar TRAZA-ANALISIS-ARQUITECTURA.md

---

## 📝 NOTAS ADICIONALES

### Usuario Recién Registrado - Estado Verificado ✅

**Usuario:** `9c5300c0-df80-4498-9011-d1af92383987` (rckrdmrd@gmail.com)

**Datos en BD:**
```sql
SELECT * FROM auth_management.profiles WHERE id = '9c5300c0-df80-4498-9011-d1af92383987';
-- ✅ Usuario existe, created_at: 2025-11-24 07:08:38

SELECT * FROM gamification_system.user_stats WHERE user_id = '9c5300c0-df80-4498-9011-d1af92383987';
-- ✅ Datos inicializados:
--    total_xp: 0
--    ml_coins: 100 (valor inicial correcto)
--    current_rank: 'Ajaw' (rank inicial correcto)
```

**Trigger de inicialización:**
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trg_initialize_user_stats';
-- ✅ Trigger existe y funciona
-- trg_initialize_user_stats | INSERT | profiles
```

**Conclusión:**
- ✅ Registro de usuarios funciona correctamente
- ✅ Trigger de inicialización funciona correctamente
- ❌ **Frontend NO puede obtener los datos** por problema de URLs duplicadas

---

## 🔗 REFERENCIAS

- **ADR-015:** Centralized API Routes Configuration
- **Archivo NUEVO:** `apps/frontend/src/config/api.config.ts`
- **Archivo VIEJO:** `apps/frontend/src/services/api/apiConfig.ts`
- **Backend Routes:** `apps/backend/src/shared/constants/routes.constants.ts`
- **Traza:** `orchestration/trazas/TRAZA-ANALISIS-ARQUITECTURA.md`

---

**Próximo paso:** Orquestar Frontend-Agent para ejecutar migración de imports.
