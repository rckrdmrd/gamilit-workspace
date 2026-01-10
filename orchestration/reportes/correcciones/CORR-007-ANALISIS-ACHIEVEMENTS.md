---
id: "CORR-007-ANALISIS"
title: "Análisis Pre-Ejecución - Corrección Página de Achievements"
type: "Análisis"
status: "Done"
priority: "P1"
assignee: "@Frontend-Agent"
related_task: "CORR-007"
affected_modules: ["frontend", "portal-student", "gamification"]
labels: ["corrección", "frontend", "achievements", "api-integration", "data-transformation"]
created_date: "2026-01-08"
updated_date: "2026-01-08"
---

# ANÁLISIS PRE-EJECUCIÓN: CORR-007 - Corrección Página de Achievements

**Agente:** Frontend-Agent
**Tipo de tarea:** Corrección | Bug
**Prioridad:** P1
**Fecha análisis:** 2026-01-08
**Relacionado con:** Portal Student, Gamificación, APIs

---

## CONTEXTO DE LA TAREA

### Solicitud Original
La página de Achievements del portal de estudiantes no funciona correctamente. Se requiere análisis detallado de la fuente de datos, validación del consumo de APIs e identificación de la causa raíz del problema.

### Objetivo Final
Identificar y corregir los componentes que no transforman correctamente los datos del backend (snake_case) al formato esperado por el frontend (camelCase).

### Módulo Relacionado
**Módulo MVP:** Portal Student - Gamificación
**Sección:** Sistema de Achievements/Logros

---

## INVENTARIO DE ARCHIVOS

### Páginas y Componentes
| Archivo | Ubicación | Función |
|---------|-----------|---------|
| AchievementsPage.tsx | `/pages/` | Página principal de logros |
| AchievementCard.tsx | `/shared/components/` | Tarjeta individual de logro |
| AchievementModal.tsx | `/shared/components/` | Modal de detalle de logro |
| AchievementFilter.tsx | `/shared/components/` | Filtros de logros |

### APIs
| Archivo | Ubicación | Función |
|---------|-----------|---------|
| gamification.api.ts | `/lib/api/` | API principal usada por AchievementsPage |
| achievementsAPI.ts | `/features/gamification/social/api/` | API alternativa para social features |

### Store y Hooks
| Archivo | Ubicación | Función |
|---------|-----------|---------|
| achievementsStore.ts | `/features/gamification/social/store/` | Zustand store |
| useAchievements.ts | `/features/gamification/social/hooks/` | Hook principal |

### Transformers
| Archivo | Ubicación | Función |
|---------|-----------|---------|
| achievementTransformer.ts | `/features/gamification/achievements/utils/` | Transforma UserAchievements (snake_case → camelCase) |

---

## DIAGNÓSTICO DEL PROBLEMA

### Flujo de Datos Actual

```
AchievementsPage.tsx
    ├── gamificationApi.getAllAchievements()
    │       └── apiClient.get('/gamification/achievements')
    │               └── Backend retorna: { rewards: { ml_coins, xp }, is_secret, ... }
    │               └── ❌ NO HAY TRANSFORMACIÓN → Frontend recibe snake_case
    │
    └── gamificationApi.getUserAchievements()
            └── apiClient.get('/gamification/users/:id/achievements')
                    └── transformUserAchievements() ✅ (Transforma correctamente)
```

### Problema Identificado: Falta de Transformación

**1. `gamification.api.ts::getAllAchievements()`**
```typescript
getAllAchievements: async (): Promise<Achievement[]> => {
  const { data } = await apiClient.get<Achievement[]>('/gamification/achievements');
  return data; // ❌ Retorna datos sin transformar!
},
```

**Resultado:** El frontend recibe datos en formato backend (snake_case):
```json
{
  "id": "...",
  "name": "Primer Paso",
  "rewards": {
    "xp": 100,
    "ml_coins": 50  // ← snake_case
  },
  "is_secret": false,  // ← snake_case
  "is_active": true    // ← snake_case
}
```

**2. AchievementCard.tsx espera:**
```typescript
achievement.rewards.mlCoins  // ← camelCase (undefined!)
achievement.isHidden         // ← camelCase (undefined!)
```

### Consecuencias del Bug

| Campo Backend | Campo Frontend Esperado | Resultado |
|---------------|------------------------|-----------|
| `rewards.ml_coins` | `rewards.mlCoins` | `undefined` → No muestra ML Coins |
| `is_secret` | `isHidden` | `undefined` → Logros ocultos no funcionan |
| `is_active` | `isActive` | `undefined` → Filtrado incorrecto |
| `is_repeatable` | `isRepeatable` | `undefined` → Lógica de repetición falla |
| `ml_coins_reward` | - | No mapeado |
| `points_value` | `pointsValue` | `undefined` |

---

## SOLUCIÓN PROPUESTA

### Crear Transformer para Achievements

Crear una función `transformAchievement` y `transformAchievements` en `achievementTransformer.ts` que mapee:

| Backend (snake_case) | Frontend (camelCase) |
|---------------------|----------------------|
| `rewards.ml_coins` | `rewards.mlCoins` |
| `is_secret` | `isHidden` (también `is_secret`) |
| `is_active` | `isActive` |
| `is_repeatable` | `isRepeatable` |
| `ml_coins_reward` | `mlCoinsReward` |
| `points_value` | `pointsValue` |
| `order_index` | `orderIndex` |
| `difficulty_level` | `difficultyLevel` |
| `unlock_message` | `unlockMessage` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

### Modificar gamification.api.ts

```typescript
getAllAchievements: async (): Promise<Achievement[]> => {
  const { data } = await apiClient.get<any[]>('/gamification/achievements');
  return transformAchievements(data); // ✅ Aplicar transformación
},
```

---

## ARCHIVOS A MODIFICAR

| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| achievementTransformer.ts | Agregar funciones de transformación para Achievement | P1 |
| gamification.api.ts | Aplicar transformación en getAllAchievements | P1 |
| achievementsAPI.ts | Verificar y corregir funciones similares | P2 |

---

## VALIDACIONES DE BASE DE DATOS

### Datos Existentes
```sql
SELECT COUNT(*) FROM gamification_system.achievements;       -- 35 registros
SELECT COUNT(*) FROM gamification_system.user_achievements;  -- 24 registros
```

### Estado de Datos
- ✅ 35 achievements definidos en la base de datos
- ✅ 24 user_achievements con progreso de usuarios
- ✅ Backend API funcional y retornando datos

---

## REFERENCIAS

### Archivos de Referencia (Implementación Correcta)
- `achievementTransformer.ts` - Patrón de transformación para UserAchievements
- `missionTransformer.ts` - Patrón similar para misiones

### Documentación Relacionada
- `/shared/types/achievement.types.ts` - Tipos TypeScript esperados

---

**FIN DEL ANÁLISIS**
