# GAP-012: Errores de API en EnhancedProfilePage y SettingsPage

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Prioridad:** P0 (Crítico)
**Estado:** Identificado
**Afectados:** EnhancedProfilePage, SettingsPage, API Configuration

---

## 📋 RESUMEN EJECUTIVO

Se han identificado **3 problemas críticos** en las páginas de Profile y Settings:

1. **ERROR CRÍTICO:** API de achievements con ruta incorrecta
2. **ERROR CRÍTICO:** API de rank-progress con ruta incompleta
3. **MEJORA NECESARIA:** Formato y UX en SettingsPage

**Impacto:** Los usuarios no pueden ver sus achievements ni progreso de rango en la página de Profile.

---

## 🔍 ANÁLISIS DETALLADO

### GAP-012-A: Error en API de Achievements

#### Evidencia
```
Error en consola:
achievementsStore.ts:165 Error fetching achievements: APIError: Cannot read properties of undefined (reading 'list')
    at handleAPIError (apiErrorHandler.ts:261:12)
    at getAllAchievements (achievementsAPI.ts:94:11)
```

#### Causa Raíz
**Frontend intentando acceder a ruta inexistente:**
```typescript
// achievementsAPI.ts:89 - INCORRECTO
const { data } = await apiClient.get<ApiResponse<{ achievements: BackendAchievement[]; total: number }>>(
  API_ENDPOINTS.achievements.list  // ❌ Esta propiedad NO EXISTE
);
```

**Configuración API actual:**
```typescript
// api.config.ts:88 - ACTUAL
gamification: {
  achievements: '/gamification/achievements',  // ✅ String simple, no objeto
  userAchievements: (userId: string) => `/gamification/users/${userId}/achievements`,
}
```

**Backend correcto:**
```typescript
// achievements.controller.ts:45
@Get('achievements')  // ✅ GET /gamification/achievements
async getAllAchievements(@Query('includeSecret') includeSecret?: string) {
  return await this.achievementsService.findAll(include);
}
```

#### Solución
**OPCIÓN A (Recomendada):** Cambiar frontend para usar configuración existente
```typescript
// achievementsAPI.ts:89 - CORRECTO
const { data } = await apiClient.get<ApiResponse<{ achievements: BackendAchievement[]; total: number }>>(
  API_ENDPOINTS.gamification.achievements  // ✅ Usar esta ruta
);
```

**OPCIÓN B:** Agregar propiedad `.list` al config (menos recomendado)
```typescript
// api.config.ts - Alternativa
gamification: {
  achievements: {
    list: '/gamification/achievements',
    get: (id: string) => `/gamification/achievements/${id}`,
    userAchievements: (userId: string) => `/gamification/users/${userId}/achievements`,
  },
}
```

#### Impacto
- ❌ **Usuarios no pueden ver sus achievements en Profile**
- ❌ **achievementsStore usa mock data como fallback**
- ⚠️ **Stats de achievements muestran datos incorrectos**

---

### GAP-012-B: Error en API de Rank Progress

#### Evidencia
```
Error en consola:
ranksStore.ts:600  GET http://localhost:3006/api/v1/gamification/users/9c5300c0-df80-4498-9011-d1af92383987/rank-progress 404 (Not Found)
```

#### Causa Raíz
**Frontend llamando a ruta incompleta:**
```typescript
// ranksStore.ts:600 - INCORRECTO
const { data } = await apiClient.get(
  `/gamification/users/${userId}/rank-progress`  // ❌ Falta /ranks
);
```

**Backend correcto:**
```typescript
// ranks.controller.ts:153 - CORRECTO
@Get('users/:userId/rank-progress')  // ✅ Controller base: 'gamification/ranks'
async getUserRankProgress(@Param('userId') userId: string): Promise<RankProgressDto> {
  return await this.ranksService.calculateRankProgress(userId);
}

// Ruta completa: GET /gamification/ranks/users/:userId/rank-progress
```

**Configuración backend:**
```typescript
// routes.constants.ts:73 - Backend tiene la ruta correcta
GAMIFICATION: {
  USER_RANK: (userId: string) => `/gamification/users/${userId}/rank`,
  RANK_HISTORY: (userId: string) => `/gamification/users/${userId}/rank/history`,
  // ❌ FALTA rank-progress en routes.constants.ts
}
```

#### Solución
**1. Actualizar ranksStore.ts:**
```typescript
// ranksStore.ts:600 - CORRECTO
const { data } = await apiClient.get(
  `/gamification/ranks/users/${userId}/rank-progress`  // ✅ Incluir /ranks
);
```

**2. Actualizar api.config.ts:**
```typescript
// api.config.ts - Agregar endpoint faltante
gamification: {
  userSummary: (userId: string) => `/gamification/users/${userId}/summary`,
  userStats: (userId: string) => `/gamification/users/${userId}/stats`,
  userRankProgress: (userId: string) => `/gamification/ranks/users/${userId}/rank-progress`,  // ✅ Agregar
  achievements: '/gamification/achievements',
  userAchievements: (userId: string) => `/gamification/users/${userId}/achievements`,
  // ...
}
```

**3. Actualizar routes.constants.ts (backend):**
```typescript
// routes.constants.ts - Agregar para consistencia
GAMIFICATION: {
  USER_RANK: (userId: string) => `/gamification/users/${userId}/rank`,
  RANK_PROGRESS: (userId: string) => `/gamification/ranks/users/${userId}/rank-progress`,  // ✅ Agregar
  RANK_HISTORY: (userId: string) => `/gamification/users/${userId}/rank/history`,
}
```

#### Impacto
- ❌ **Usuarios no pueden ver su progreso de rango**
- ❌ **Barra de progreso hacia siguiente rango no funciona**
- ⚠️ **Información de "Próximo Rango" no se muestra**

---

### GAP-012-C: Mejoras de UX en SettingsPage

#### Observaciones
**Estado actual:** ✅ Estructura correcta, 🔶 Necesita mejoras visuales

**Puntos positivos:**
- ✅ Usa componentes correctos (`EnhancedCard`, `ColorfulCard`)
- ✅ Diseño responsive funcional
- ✅ Navegación por tabs implementada
- ✅ Integración con profileAPI correcta

**Puntos a mejorar:**
1. **Contraste insuficiente** en algunos elementos de formulario
2. **Spacing inconsistente** entre secciones
3. **Feedback visual limitado** al guardar preferencias
4. **Avatar upload** no tiene indicador de progreso

#### Propuestas de Mejora

**1. Mejorar contraste en inputs:**
```tsx
// SettingsPage.tsx - Línea 343
// ACTUAL:
className="w-full px-4 py-2 border-2 border-detective-orange/30 rounded-lg focus:outline-none focus:border-detective-orange"

// MEJORADO:
className="w-full px-4 py-3 border-2 border-detective-orange/40 bg-white rounded-lg
  focus:outline-none focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/20
  transition-all"
```

**2. Agregar indicador de progreso para avatar:**
```tsx
// SettingsPage.tsx - Nueva funcionalidad
const [uploadProgress, setUploadProgress] = useState(0);

const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploadProgress(0);

  try {
    // Simularcarga con progreso
    const result = await profileAPI.uploadAvatar(user.id, file, (progress) => {
      setUploadProgress(progress);
    });

    toast.success('Avatar actualizado correctamente');
  } catch (error) {
    toast.error('Error al subir avatar');
  } finally {
    setUploadProgress(0);
  }
};

// Agregar barra de progreso
{uploadProgress > 0 && (
  <div className="mt-2">
    <div className="w-full bg-detective-bg rounded-full h-2">
      <div
        className="bg-detective-orange h-2 rounded-full transition-all"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
    <p className="text-xs text-detective-text-secondary mt-1">
      Subiendo... {uploadProgress}%
    </p>
  </div>
)}
```

**3. Mejorar spacing entre secciones:**
```tsx
// SettingsPage.tsx - Agregar className consistente
<div className="space-y-8">  {/* Cambiar de space-y-6 a space-y-8 */}
  {/* Secciones del formulario */}
</div>
```

**4. Agregar animaciones de guardado:**
```tsx
// SettingsPage.tsx - Mejorar feedback visual
{saveStatus === 'saved' && (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="flex items-center gap-2 text-green-600"
  >
    <Check className="w-5 h-5" />
    <span className="font-medium">¡Guardado!</span>
  </motion.div>
)}
```

#### Impacto
- 🔶 **Mejora experiencia de usuario** (no crítico)
- 🔶 **Mayor claridad visual** en formularios
- 🔶 **Mejor feedback** durante operaciones asíncronas

---

## 📊 MATRIZ DE PRIORIDADES

| Gap | Severidad | Prioridad | Tipo | Tiempo Estimado |
|-----|-----------|-----------|------|-----------------|
| GAP-012-A | 🔴 **CRÍTICA** | P0 | Bug - API | 15 min |
| GAP-012-B | 🔴 **CRÍTICA** | P0 | Bug - API | 20 min |
| GAP-012-C | 🟡 **MEDIA** | P2 | Enhancement - UX | 2-3 horas |

---

## 🎯 PLAN DE CORRECCIÓN

### Fase 1: Correcciones Críticas (Inmediato - P0)

#### 1.1 Fix Achievements API (GAP-012-A)
**Responsable:** Frontend-Developer
**Archivos a modificar:**
- ✅ `apps/frontend/src/features/gamification/social/api/achievementsAPI.ts`
- ✅ `apps/frontend/src/config/api.config.ts` (opcional)

**Cambios:**
```typescript
// achievementsAPI.ts:89
// ANTES:
const { data } = await apiClient.get<ApiResponse<{ achievements: BackendAchievement[]; total: number }>>(
  API_ENDPOINTS.achievements.list  // ❌
);

// DESPUÉS:
const { data } = await apiClient.get<ApiResponse<{ achievements: BackendAchievement[]; total: number }>>(
  API_ENDPOINTS.gamification.achievements  // ✅
);
```

**Validación:**
- ✅ Eliminar error en consola sobre `.list`
- ✅ Achievements se cargan correctamente en Profile
- ✅ Stats de achievements muestran datos reales

---

#### 1.2 Fix Rank Progress API (GAP-012-B)
**Responsable:** Frontend-Developer
**Archivos a modificar:**
- ✅ `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts`
- ✅ `apps/frontend/src/config/api.config.ts`
- ✅ `apps/backend/src/shared/constants/routes.constants.ts` (consistencia)

**Cambios:**
```typescript
// 1. ranksStore.ts:600
// ANTES:
const { data } = await apiClient.get(`/gamification/users/${userId}/rank-progress`);

// DESPUÉS:
const { data } = await apiClient.get(
  API_ENDPOINTS.gamification.userRankProgress(userId)
);

// 2. api.config.ts - Agregar endpoint
gamification: {
  userRankProgress: (userId: string) => `/gamification/ranks/users/${userId}/rank-progress`,
  // ...
}

// 3. routes.constants.ts - Agregar para consistencia (backend)
GAMIFICATION: {
  RANK_PROGRESS: (userId: string) => `/gamification/ranks/users/${userId}/rank-progress`,
}
```

**Validación:**
- ✅ Eliminar 404 en consola
- ✅ Progreso de rango se muestra en Profile
- ✅ Barra de "Próximo Rango" funciona correctamente

---

### Fase 2: Mejoras de UX (P2 - No urgente)

#### 2.1 Mejorar SettingsPage (GAP-012-C)
**Responsable:** Frontend-Developer
**Archivos a modificar:**
- ✅ `apps/frontend/src/apps/student/pages/SettingsPage.tsx`
- ⚠️ `apps/frontend/src/services/api/profileAPI.ts` (agregar soporte para progress)

**Cambios:**
1. Mejorar contraste en inputs (ver sección GAP-012-C)
2. Agregar indicador de progreso para upload de avatar
3. Mejorar spacing entre secciones
4. Agregar animaciones de feedback

**Validación:**
- ✅ Inputs tienen mejor contraste
- ✅ Upload de avatar muestra progreso
- ✅ Espaciado consistente entre secciones
- ✅ Animaciones de feedback funcionan

---

## 🧪 CRITERIOS DE ACEPTACIÓN

### GAP-012-A (Achievements API)
- [ ] Error "Cannot read properties of undefined (reading 'list')" eliminado
- [ ] `getAllAchievements()` usa `API_ENDPOINTS.gamification.achievements`
- [ ] Achievements se cargan correctamente en EnhancedProfilePage
- [ ] Stats de achievements muestran datos reales (no mock)
- [ ] Sección "Logros Recientes" muestra achievements del usuario

### GAP-012-B (Rank Progress API)
- [ ] 404 eliminado para `/rank-progress`
- [ ] `fetchUserProgress()` usa ruta correcta: `/gamification/ranks/users/:userId/rank-progress`
- [ ] Endpoint agregado a `api.config.ts`
- [ ] Progreso de rango se muestra correctamente en Profile
- [ ] Barra de "Próximo Rango" muestra porcentaje correcto
- [ ] No hay errores en consola relacionados con rank-progress

### GAP-012-C (Settings UX)
- [ ] Inputs tienen contraste mejorado (border más visible)
- [ ] Upload de avatar muestra barra de progreso
- [ ] Spacing consistente (space-y-8) entre todas las secciones
- [ ] Animaciones de guardado funcionan correctamente
- [ ] Feedback visual claro en todas las operaciones asíncronas

---

## 📄 ARCHIVOS AFECTADOS

### Frontend
```
apps/frontend/src/
├── config/
│   └── api.config.ts (⚠️ Agregar userRankProgress)
├── features/gamification/
│   ├── social/
│   │   └── api/achievementsAPI.ts (🔴 Fix achievements.list)
│   └── ranks/
│       └── store/ranksStore.ts (🔴 Fix rank-progress route)
└── apps/student/pages/
    └── SettingsPage.tsx (🟡 Mejoras UX)
```

### Backend (Solo documentación)
```
apps/backend/src/
└── shared/constants/
    └── routes.constants.ts (📝 Agregar RANK_PROGRESS para consistencia)
```

---

## 🔗 DEPENDENCIAS

### GAP-012-A → GAP-012-B
- Independientes, se pueden corregir en paralelo

### GAP-012-C
- Independiente, puede hacerse después de A y B

---

## ⚠️ RESTRICCIONES Y NOTAS

1. **NO modificar rutas del backend** - El backend está correcto
2. **Seguir DIRECTIVA-API-CENTRALIZED.md** - Todos los endpoints en api.config.ts
3. **Validar con usuario real** - No usar mock data para validación
4. **Testing:** Validar en desarrollo antes de merge

---

## 📚 REFERENCIAS

**Documentación:**
- ADR-015: Centralized API Routes Configuration
- DIRECTIVA-API-CENTRALIZED.md
- GAP-011: API Config Migration (relacionado)

**Archivos Backend (consulta):**
- `apps/backend/src/modules/gamification/controllers/achievements.controller.ts:45` (GET /achievements)
- `apps/backend/src/modules/gamification/controllers/ranks.controller.ts:153` (GET /rank-progress)

**Issues relacionados:**
- GAP-011: Migración de API endpoints
- GAP-003: Sincronización Frontend-Backend

---

**Fin del reporte GAP-012**
