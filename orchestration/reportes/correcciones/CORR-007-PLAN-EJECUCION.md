---
id: "CORR-007-PLAN"
title: "Plan de Ejecución - Corrección Página de Achievements"
type: "Plan"
status: "Done"
priority: "P1"
assignee: "@Frontend-Agent"
related_task: "CORR-007"
affected_modules: ["frontend", "portal-student", "gamification"]
labels: ["corrección", "frontend", "plan", "data-transformation"]
created_date: "2026-01-08"
updated_date: "2026-01-08"
validation_date: "2026-01-08"
validation_status: "Aprobado"
---

# PLAN DE EJECUCIÓN: CORR-007 - Corrección Página de Achievements

**Agente:** Frontend-Agent
**Tipo de tarea:** Corrección
**Prioridad:** P1
**Fecha creación:** 2026-01-08
**Relacionado con:** CORR-007-ANALISIS

---

## OBJETIVO

Corregir la transformación de datos del backend (snake_case) al formato del frontend (camelCase) para que la página de Achievements funcione correctamente.

**Criterios de Aceptación:**
- [ ] Transformer para Achievement implementado
- [ ] gamification.api.ts aplicando transformación
- [ ] achievementsAPI.ts verificado y corregido si necesario
- [ ] Rewards (ml_coins) mostrados correctamente
- [ ] Logros ocultos (is_secret → isHidden) funcionando
- [ ] Build compila sin errores TypeScript
- [ ] Página de Achievements muestra datos reales

---

## CICLOS DE EJECUCIÓN

### Ciclo 1: Crear Transformer para Achievement

**Archivo:** `/features/gamification/achievements/utils/achievementTransformer.ts`

**Agregar:**

1. Interface `ApiAchievementResponse` para respuesta del backend
2. Función `transformAchievement(apiResponse)` → `Achievement`
3. Función `transformAchievements(apiResponses[])` → `Achievement[]`

**Mapeos:**
```typescript
// Backend → Frontend
{
  id: apiResponse.id,
  name: apiResponse.name,
  description: apiResponse.description,
  icon: apiResponse.icon,
  category: apiResponse.category,
  rarity: apiResponse.rarity,
  
  // Rewards transformation
  rewards: {
    xp: apiResponse.rewards?.xp ?? apiResponse.points_value ?? 0,
    mlCoins: apiResponse.rewards?.ml_coins ?? apiResponse.ml_coins_reward ?? 0,
    items: apiResponse.rewards?.items,
  },
  
  // Boolean flags
  isHidden: apiResponse.is_secret ?? false,
  isActive: apiResponse.is_active ?? true,
  isRepeatable: apiResponse.is_repeatable ?? false,
  is_secret: apiResponse.is_secret ?? false,
  is_active: apiResponse.is_active ?? true,
  is_repeatable: apiResponse.is_repeatable ?? false,
  
  // Other fields
  conditions: apiResponse.conditions,
  type: apiResponse.type ?? 'badge',
  pointsValue: apiResponse.points_value ?? 0,
  order_index: apiResponse.order_index ?? 0,
  
  // Timestamps
  createdAt: apiResponse.created_at,
  updatedAt: apiResponse.updated_at,
}
```

---

### Ciclo 2: Modificar gamification.api.ts

**Archivo:** `/lib/api/gamification.api.ts`

**Cambios:**

1. Importar transformer:
```typescript
import { transformAchievements } from '@/features/gamification/achievements/utils/achievementTransformer';
```

2. Modificar `getAllAchievements`:
```typescript
getAllAchievements: async (): Promise<Achievement[]> => {
  const { data } = await apiClient.get<any[]>('/gamification/achievements');
  // FIX: CORR-007 - Transformar respuesta del backend
  return transformAchievements(data);
},
```

3. Modificar `getAchievementById`:
```typescript
getAchievementById: async (achievementId: string): Promise<Achievement> => {
  const { data } = await apiClient.get<any>(`/gamification/achievements/${achievementId}`);
  // FIX: CORR-007 - Transformar respuesta del backend
  return transformAchievement(data);
},
```

---

### Ciclo 3: Verificar achievementsAPI.ts

**Archivo:** `/features/gamification/social/api/achievementsAPI.ts`

**Verificar funciones:**
- `getAllAchievements()` - Verificar si necesita transformación
- `getAchievementById()` - Verificar extracción de data
- `getUserAchievements()` - Ya usa transformación, verificar estructura

**Potencial corrección en línea 145:**
```typescript
// ANTES
const userAchievements = data.data.achievements;

// VERIFICAR - Puede requerir:
const userAchievements = data?.achievements || data?.data?.achievements || [];
```

---

### Ciclo 4: Validación TypeScript

**Validaciones:**
```bash
npx tsc --noEmit 2>&1 | grep -E "(achievementTransformer|gamification.api|achievementsAPI)"
```

---

## RESUMEN DE CAMBIOS

### Archivos Modificados
| Archivo | Líneas | Tipo |
|---------|--------|------|
| achievementTransformer.ts | ~60 | Agregar funciones |
| gamification.api.ts | ~10 | Modificar |
| achievementsAPI.ts | ~5 | Verificar/Modificar |

### Dependencias
| Archivo Fuente | Depende De |
|----------------|------------|
| AchievementsPage.tsx | gamification.api.ts |
| achievementsStore.ts | achievementsAPI.ts |
| AchievementCard.tsx | Achievement type |

---

## MATRIZ DE VALIDACIÓN

| Criterio | Validación |
|----------|------------|
| Transformer creado | Archivo existe y exporta funciones |
| API modificada | getAllAchievements usa transformer |
| TypeScript OK | npx tsc --noEmit sin errores |
| Datos en UI | rewards.mlCoins muestra valor |
| isHidden funciona | Logros ocultos se filtran correctamente |

---

**FIN DEL PLAN**
