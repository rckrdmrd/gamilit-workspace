# GAP-013: Funcionalidades Incompletas en Portal de Estudiante

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Prioridad:** P1 (Alta)
**Estado:** Documentado
**Afectados:** Portal de Estudiante, APIs Backend/Frontend

---

## 📋 RESUMEN EJECUTIVO

### Objetivo del Análisis
Identificar páginas y funcionalidades en el portal de estudiante que:
- No tienen backend implementado
- Usan mock data como fallback
- Tienen TODOs pendientes de implementación
- Requieren mensaje "en construcción" para evitar enlaces rotos

### Hallazgos Clave

**✅ FUNCIONALIDADES COMPLETAMENTE IMPLEMENTADAS:**
- ✅ Authentication (login, register, password reset)
- ✅ Dashboard principal con estadísticas
- ✅ Progress tracking (modules, exercises)
- ✅ Achievements system
- ✅ Leaderboards
- ✅ User profile (partial)
- ✅ Settings page (mejorada en GAP-012)
- ✅ Power-ups/Comodines (backend completo)
- ✅ Missions system
- ✅ Friends/Friendships
- ✅ Teams/Guilds (backend completo)

**⚠️ FUNCIONALIDADES PARCIALMENTE IMPLEMENTADAS (con mock data fallback):**
- 🟡 EnhancedProfilePage - Rank history chart (mock)
- 🟡 EnhancedProfilePage - Activity stats chart (mock)
- 🟡 LeaderboardPage - Category breakdown stats (mock)
- 🟡 ShopPage - Solo power-ups funcionan, cosmetics/social items no implementados
- 🟡 InventoryPage - Cosmetic items no implementados

**❌ FUNCIONALIDADES NO IMPLEMENTADAS:**
- ❌ Shop: Cosmetics, profile items, guild items, social items
- ❌ Inventory: Cosmetic items
- ❌ Claim mission rewards (StreaksMissionsSection)
- ❌ Rank history API
- ❌ Activity stats API

---

## 🔍 ANÁLISIS DETALLADO POR PÁGINA

### 1. Dashboard (DashboardComplete.tsx)
**Estado:** ✅ FUNCIONAL con fallback a mock data
**Backend:** ✅ APIs implementadas
**Observaciones:**
- Usa `useUserGamification` hook que tiene fallback a mock data
- Si API falla, muestra datos de demostración sin error catastrófico
- **Acción requerida:** Ninguna (comportamiento correcto)

---

### 2. Enhanced Profile Page (EnhancedProfilePage.tsx)
**Estado:** 🟡 PARCIALMENTE FUNCIONAL

#### Funcionalidades Implementadas:
- ✅ Perfil de usuario básico
- ✅ Achievements section
- ✅ Rank display
- ✅ ML Coins balance

#### Funcionalidades con Mock Data:
**A. Rank History Chart** (línea 88-93)
```typescript
// Mock rank history (in real app, this would come from API)
const rankHistory = [
  { date: '2024-01', rank: 'Chaac', xp: 500 },
  // ... mock data
];
```
**Backend:** ❌ NO existe endpoint `/gamification/users/:userId/rank/history` implementado
- `routes.constants.ts:74` define la ruta pero NO hay controller endpoint

**B. Activity Data Chart** (línea 95-101)
```typescript
// Mock activity data for chart (in real app, this would come from API)
const activityData = [
  { date: '2024-01-01', exercises: 5, hours: 2 },
  // ... mock data
];
```
**Backend:** ❌ NO existe endpoint para activity timeline

**Acción requerida:**
1. Agregar tooltip en gráficos indicando "Datos de demostración"
2. O deshabilitar sección con mensaje "Próximamente"

---

### 3. Settings Page (SettingsPage.tsx)
**Estado:** ✅ FUNCIONAL (mejorado en GAP-012)
**Backend:** ✅ APIs implementadas
**Observaciones:**
- Mejoras UX aplicadas en GAP-012-C
- Avatar upload funcional
- Preferencias funcionando correctamente
- **Acción requerida:** Ninguna

---

### 4. Shop Page (ShopPage.tsx)
**Estado:** 🟡 PARCIALMENTE FUNCIONAL

#### Backend Implementado:
✅ **Comodines/Power-ups**: `comodines.controller.ts`
- `GET /gamification/comodines` - Listar comodines disponibles
- `POST /gamification/users/:userId/comodines/:type/purchase` - Comprar comodin
- `POST /gamification/users/:userId/comodines/:type/use` - Usar comodin

#### Backend NO Implementado:
❌ **Shop de Cosmetics/Social Items**
- NO existe controller para shop general
- NO existen endpoints para:
  - Cosmetics (avatares, bordes, efectos)
  - Profile items (títulos, banners)
  - Guild items (emblemas, colores)
  - Social items (emojis, stickers)

#### Evidencia en Código:
**Frontend** (ShopPage.tsx:110-117):
```typescript
const categories = [
  { value: 'all', label: 'All Items', icon: Package },
  { value: 'cosmetics', label: 'Cosmetics', icon: Palette },      // ❌ NO IMPLEMENTADO
  { value: 'profile', label: 'Profile', icon: Users },            // ❌ NO IMPLEMENTADO
  { value: 'guild', label: 'Guild', icon: Crown },                // ❌ NO IMPLEMENTADO
  { value: 'premium', label: 'Premium', icon: Sparkles },         // ❌ NO IMPLEMENTADO
  { value: 'social', label: 'Social', icon: Star },               // ❌ NO IMPLEMENTADO
];
```

**API** (socialAPI.ts:198-217):
```typescript
export const getPowerUps = async (): Promise<PowerUp[]> => {
  try {
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [];  // ⚠️ Retorna array vacío en mock
    }
    // ... real API call
  }
}
```

**Acción requerida:**
1. Deshabilitar categorías no implementadas (cosmetics, profile, guild, social)
2. Mostrar solo categoría "Power-ups" funcional
3. Agregar tooltip: "Más categorías próximamente"

---

### 5. Inventory Page (InventoryPage.tsx)
**Estado:** 🟡 PARCIALMENTE FUNCIONAL

#### Funcionalidades Implementadas:
- ✅ Power-ups inventory (usando comodines backend)
- ✅ Use power-up functionality
- ✅ Power-up stats display

#### Funcionalidades NO Implementadas:
**A. Cosmetic Items** (línea 97-98)
```typescript
// TODO: Fetch cosmetic items when API is available
setInventoryItems([]);  // ⚠️ Siempre vacío
```

**Backend:** ❌ NO existe endpoint para cosmetic items

**Evidencia:**
- Tab "Cosmetic Items" visible pero siempre muestra "No cosmetic items yet"
- Backend solo tiene comodines, no sistema de items cosméticos

**Acción requerida:**
1. Deshabilitar tab "Cosmetic Items" o marcar como "Coming Soon"
2. Agregar mensaje: "Sistema de cosméticos en desarrollo"

---

### 6. Missions Page (MissionsPage.tsx)
**Estado:** ✅ FUNCIONAL con TODO menor

#### Funcionalidades Implementadas:
- ✅ Listar missions disponibles
- ✅ Missions en progreso
- ✅ Missions completadas
- ✅ Ver detalles de mission

#### Funcionalidad Pendiente:
**A. Claim Rewards** (StreaksMissionsSection.tsx:30)
```typescript
const handleClaimReward = (missionId: string) => {
  console.log('Claiming reward for mission:', missionId);
  // TODO: Implement claim reward API call
};
```

**Backend:** ⚠️ Verificar si existe endpoint para claim rewards
- `routes.constants.ts:197-198` define `/progress/scheduled-missions/:id/claim-rewards`
- Necesita validación si controller implementa este endpoint

**Acción requerida:**
1. Validar si backend tiene endpoint `/scheduled-missions/:id/claim-rewards`
2. Si NO existe: deshabilitar botón "Claim Reward" con tooltip "Próximamente"
3. Si SÍ existe: implementar llamada API

---

### 7. Guilds/Teams Page (GuildsPage.tsx)
**Estado:** ✅ BACKEND COMPLETO, frontend con mock fallback

**Backend Implementado:**
- ✅ `teams.controller.ts` (13 endpoints)
- ✅ `team-members.controller.ts` (8 endpoints)
- ✅ `team-challenges.controller.ts` (9 endpoints)

**Frontend:**
- Usa `useUserGamification` con fallback a mock data
- Si API funciona correctamente, página debería ser funcional

**Acción requerida:**
1. Validar manualmente que APIs de teams estén funcionando
2. Si funcionan: remover comentario de mock data
3. Si NO funcionan: investigar por qué backend no responde

---

### 8. Friends Page (FriendsPage.tsx)
**Estado:** ✅ BACKEND COMPLETO, frontend con mock fallback

**Backend Implementado:**
- ✅ `friendships.controller.ts` (10 endpoints)
- Friend requests, accept, reject, block, unblock

**Frontend:**
- Usa `useUserGamification` con fallback a mock data
- Debería ser completamente funcional

**Acción requerida:**
1. Validar manualmente que APIs de friends estén funcionando
2. Si funcionan: remover comentario de mock data
3. Si NO funcionan: investigar por qué backend no responde

---

### 9. Leaderboard Page (LeaderboardPage.tsx)
**Estado:** ✅ FUNCIONAL con mock en stats

#### Funcionalidades Implementadas:
- ✅ Global leaderboard
- ✅ School leaderboard
- ✅ Classroom leaderboard
- ✅ Filtros por período (weekly, monthly, all-time)

#### Funcionalidad con Mock Data:
**A. Category Breakdown Stats** (línea 96)
```typescript
// Category breakdown stats (mock data - replace with real API)
const categoryStats = [
  { name: 'Exercises', value: 45, color: '#f97316' },
  // ... mock data
];
```

**Backend:** ❌ NO existe endpoint específico para category breakdown

**Acción requerida:**
1. Agregar disclaimer: "Estadísticas de demostración"
2. O remover sección hasta que API esté lista

---

## 📊 RESUMEN DE BACKEND ENDPOINTS

### ✅ Controllers Implementados:
```
Backend Controllers Found:
├── health.controller.ts                        ✅
├── gamification/
│   ├── achievements.controller.ts              ✅
│   ├── leaderboard.controller.ts               ✅
│   ├── ranks.controller.ts                     ✅
│   ├── user-stats.controller.ts                ✅
│   ├── ml-coins.controller.ts                  ✅
│   ├── comodines.controller.ts                 ✅ (Power-ups)
│   └── missions.controller.ts                  ✅
├── progress/
│   ├── module-progress.controller.ts           ✅
│   ├── exercise-submission.controller.ts       ✅
│   ├── exercise-attempt.controller.ts          ✅
│   ├── learning-session.controller.ts          ✅
│   └── scheduled-mission.controller.ts         ✅
├── educational/
│   ├── modules.controller.ts                   ✅
│   ├── exercises.controller.ts                 ✅
│   └── media.controller.ts                     ✅
├── auth/
│   ├── auth.controller.ts                      ✅
│   ├── users.controller.ts                     ✅
│   └── password.controller.ts                  ✅
├── social/
│   ├── teams.controller.ts                     ✅
│   ├── team-members.controller.ts              ✅
│   ├── team-challenges.controller.ts           ✅
│   └── friendships.controller.ts               ✅
├── notifications/
│   ├── notifications.controller.ts             ✅
│   ├── notification-devices.controller.ts      ✅
│   ├── notification-templates.controller.ts    ✅
│   └── notification-preferences.controller.ts  ✅
└── content/
    ├── content-templates.controller.ts         ✅
    ├── marie-curie-content.controller.ts       ✅
    └── media-files.controller.ts               ✅
```

### ❌ Endpoints NO Implementados:
```
Missing Backend:
├── Economy/Shop (excepto comodines)
│   ├── Cosmetics Shop                          ❌
│   ├── Profile Items Shop                      ❌
│   ├── Guild Items Shop                        ❌
│   └── Social Items Shop                       ❌
├── Gamification Stats
│   ├── Rank History Timeline                   ❌
│   ├── Activity Data Timeline                  ❌
│   └── Category Breakdown Stats                ❌
└── Inventory
    └── Cosmetic Items Inventory                ❌
```

---

## 🎯 PLAN DE ACCIÓN

### Fase 1: Documentación y Placeholders (Inmediato - P1)

#### 1.1 Crear Componente UnderConstruction
**Archivo:** `apps/frontend/src/shared/components/common/UnderConstruction.tsx`
```typescript
interface UnderConstructionProps {
  feature: string;
  description?: string;
  estimatedDate?: string;
  variant?: 'page' | 'section' | 'button';
}
```

**Variantes:**
- `page`: Full page placeholder (para páginas completas)
- `section`: Section dentro de página existente
- `button`: Tooltip/disabled state para botones

#### 1.2 Implementar Placeholders en Páginas

**A. ShopPage - Categorías No Implementadas**
```typescript
// Deshabilitar categorías sin backend
const categories = [
  { value: 'all', label: 'All Items', icon: Package, disabled: false },
  { value: 'powerups', label: 'Power-ups', icon: Zap, disabled: false },    // ✅ Funcional
  { value: 'cosmetics', label: 'Cosmetics', icon: Palette, disabled: true },  // ⚠️ Próximamente
  // ... resto disabled: true
];

// Mostrar UnderConstruction cuando se seleccione categoría disabled
{selectedCategory !== 'all' && selectedCategory !== 'powerups' && (
  <UnderConstruction
    feature={`${selectedCategory} Shop`}
    description="Esta categoría estará disponible próximamente"
    variant="section"
  />
)}
```

**B. InventoryPage - Cosmetic Items Tab**
```typescript
// En cosmetic items tab
{activeTab === 'cosmetic' && (
  <UnderConstruction
    feature="Inventario de Cosméticos"
    description="El sistema de items cosméticos estará disponible próximamente"
    variant="section"
  />
)}
```

**C. EnhancedProfilePage - Mock Charts**
```typescript
// Agregar badge en charts con mock data
<div className="relative">
  <div className="absolute top-2 right-2 z-10">
    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-700 text-xs rounded">
      Datos de demostración
    </span>
  </div>
  {/* Chart component */}
</div>
```

**D. StreaksMissionsSection - Claim Rewards**
```typescript
<button
  onClick={handleClaimReward}
  disabled={true}  // ⚠️ Deshabilitar hasta implementar
  className={cn(
    "px-4 py-2 rounded-lg transition-colors",
    "bg-gray-300 cursor-not-allowed"  // Disabled style
  )}
  title="Próximamente"  // Tooltip
>
  Reclamar Recompensa
</button>
```

---

### Fase 2: Validación Manual (P1)

#### 2.1 Validar APIs Funcionales
**Páginas a validar manualmente:**
1. GuildsPage - Verificar que teams API responda correctamente
2. FriendsPage - Verificar que friendships API responda correctamente
3. MissionsPage - Verificar endpoint claim-rewards existe

**Comando de validación:**
```bash
# Verificar backend corriendo en puerto 3006
curl http://localhost:3006/api/v1/health

# Test teams endpoint
curl -H "Authorization: Bearer <token>" \
  http://localhost:3006/api/v1/social/teams

# Test friendships endpoint
curl -H "Authorization: Bearer <token>" \
  http://localhost:3006/api/v1/social/users/<userId>/friends
```

#### 2.2 Actualizar Comentarios de Mock Data
Si APIs funcionan correctamente, remover comentarios:
```typescript
// REMOVER:
// Use useUserGamification hook (currently with mock data until backend endpoint is ready)

// REEMPLAZAR CON:
// Fetches real data from backend via useUserGamification hook
```

---

### Fase 3: Mejoras Futuras (P2 - No urgente)

#### 3.1 Implementar Backend Faltante
**Shop Categories:**
- Cosmetics shop endpoints
- Profile items endpoints
- Guild items endpoints
- Social items endpoints

**Gamification Stats:**
- Rank history timeline API
- Activity data timeline API
- Category breakdown stats API

**Inventory:**
- Cosmetic items inventory API

#### 3.2 Remover Mock Data Fallbacks
Una vez backend completo:
- Remover `getMockGamificationData()` de useGamificationData
- Remover mock data de EnhancedProfilePage charts
- Remover mock data de LeaderboardPage stats

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Fase 1 (Placeholders):
- [ ] Componente UnderConstruction creado con 3 variantes
- [ ] ShopPage muestra placeholder para categorías no implementadas
- [ ] InventoryPage muestra placeholder en cosmetic items tab
- [ ] EnhancedProfilePage muestra badge "Datos de demostración" en charts
- [ ] LeaderboardPage muestra disclaimer en category stats
- [ ] StreaksMissionsSection: botón claim rewards deshabilitado con tooltip
- [ ] NO hay enlaces rotos ni funciones que causen errores catastróficos

### Fase 2 (Validación):
- [ ] Teams API validada manualmente (responde correctamente)
- [ ] Friendships API validada manualmente (responde correctamente)
- [ ] Missions claim-rewards endpoint verificado (existe o no)
- [ ] Comentarios de mock data actualizados según resultado de validación

---

## 📄 ARCHIVOS AFECTADOS

### Nuevos Archivos a Crear:
```
apps/frontend/src/
└── shared/components/common/
    └── UnderConstruction.tsx  (CREAR)
```

### Archivos a Modificar:
```
apps/frontend/src/apps/student/pages/
├── ShopPage.tsx                          (Agregar placeholders)
├── InventoryPage.tsx                     (Agregar placeholders)
├── EnhancedProfilePage.tsx               (Agregar badges "demo data")
├── LeaderboardPage.tsx                   (Agregar disclaimer)
└── components/gamification/
    └── StreaksMissionsSection.tsx        (Deshabilitar claim button)
```

---

## 🔗 REFERENCIAS

**Documentación:**
- GAP-012: Profile & Settings API Errors (relacionado)
- GAP-011: API Config Migration (relacionado)
- ADR-015: Centralized API Routes Configuration

**Backend Routes:**
- `apps/backend/src/shared/constants/routes.constants.ts`
- Controllers en `apps/backend/src/modules/`

**Frontend Hooks:**
- `apps/frontend/src/shared/hooks/useUserGamification.ts`
- `apps/frontend/src/apps/student/hooks/useGamificationData.ts`

---

## ⚠️ NOTAS IMPORTANTES

1. **NO remover mock data fallbacks** - Son necesarios para desarrollo y testing
2. **NO bloquear funcionalidades parciales** - Si algo funciona parcialmente, mostrar lo que funciona + placeholder para lo que falta
3. **Priorizar experiencia de usuario** - Mensajes claros > errores confusos
4. **Validar antes de marcar como "no implementado"** - Algunos backends pueden estar implementados pero no usados correctamente

---

**Fin del reporte GAP-013**
