# ANÁLISIS CONSOLIDADO: Error de Ejecución en useMissions

**Fecha:** 2025-11-26
**Analista:** Architecture-Analyst
**Alcance:** Portal Students - Hook useMissions y dependencias

---

## RESUMEN EJECUTIVO

Se identificaron **7 problemas críticos** en el sistema de missions que causan errores de ejecución:

| # | Problema | Severidad | Impacto |
|---|----------|-----------|---------|
| 1 | Duplicidad de tipos `Mission` | CRÍTICA | Incompatibilidad de estructuras |
| 2 | Status `expired` faltante en Frontend | ALTA | Pérdida de información |
| 3 | Store usa tipo legacy con `objective` singular | ALTA | Error en runtime |
| 4 | Transformer no maneja `expired` | MEDIA | Mapeo incorrecto |
| 5 | Categorías inconsistentes entre capas | MEDIA | Datos incorrectos |
| 6 | Rachas no implementadas en backend | BAJA | Stats incompletos |
| 7 | Fallback de fechas inadecuado | BAJA | Expiración incorrecta |

---

## ESTRUCTURA DE ARCHIVOS ANALIZADOS

```
apps/frontend/src/
├── features/
│   ├── gamification/missions/
│   │   ├── hooks/useMissions.ts         ← HOOK PRINCIPAL (usa tipos nuevos)
│   │   ├── types/missionsTypes.ts       ← TIPOS CANÓNICOS (objectives[])
│   │   ├── utils/
│   │   │   ├── missionTransformer.ts    ← TRANSFORMER API→Frontend
│   │   │   └── missionHelpers.ts        ← HELPERS
│   │   └── components/
│   │       ├── MissionCard.tsx
│   │       ├── MissionGrid.tsx
│   │       ├── MissionTabs.tsx
│   │       ├── ActiveMissionTracker.tsx
│   │       └── RewardsPreview.tsx
│   └── missions/store/
│       └── missionsStore.ts             ← STORE LEGACY (usa objective singular)
├── services/api/
│   └── missionsAPI.ts                   ← API CLIENT LEGACY (deprecated)
└── apps/student/pages/
    └── MissionsPage.tsx                 ← PÁGINA (usa hook, NO store)

apps/backend/src/modules/gamification/
├── controllers/missions.controller.ts   ← ENDPOINTS REST
├── services/missions.service.ts         ← LÓGICA DE NEGOCIO
├── entities/mission.entity.ts           ← ENTITY TypeORM
└── dto/missions/*.dto.ts                ← DTOs

apps/database/ddl/schemas/gamification_system/
├── tables/06-missions.sql               ← DDL TABLA
├── functions/06-update_missions_updated_at.sql
└── triggers/17-missions_updated_at.sql
```

---

## PROBLEMA #1: DUPLICIDAD DE TIPOS `Mission`

### Descripción
Existen DOS interfaces `Mission` incompatibles en el codebase:

### Tipo LEGACY (missionsAPI.ts:21-51)
```typescript
// @deprecated
export interface Mission {
  objective: {                    // ← SINGULAR
    type: string;
    target: number;
    current: number;
  };
  status: 'active' | 'completed' | 'claimed' | 'expired';
}
```

### Tipo CANÓNICO (missionsTypes.ts:51-84)
```typescript
export interface Mission {
  objectives: MissionObjective[];  // ← PLURAL (array)
  status: MissionStatus;           // 'not_started' | 'in_progress' | 'completed' | 'claimed'
}
```

### Impacto
- **missionsStore.ts** importa `Mission` del tipo LEGACY
- **useMissions.ts** importa `Mission` del tipo CANÓNICO
- Línea 99 de missionsStore.ts intenta acceder a `m.objective` que NO existe en datos transformados

### Código Problemático (missionsStore.ts:99)
```typescript
const newObjective = { ...m.objective, current };  // ← FALLA: objective es undefined
```

---

## PROBLEMA #2: STATUS `expired` FALTANTE EN FRONTEND

### Comparación de Status

| Capa | Status Disponibles | Total |
|------|-------------------|-------|
| **Database** | active, in_progress, completed, claimed, **expired** | 5 |
| **Backend** | active, in_progress, completed, claimed, **expired** | 5 |
| **Frontend** | not_started, in_progress, completed, claimed | 4 |

### Código del Transformer (missionTransformer.ts:72-85)
```typescript
export function mapApiStatusToFrontend(apiStatus: string): MissionStatus {
  switch (apiStatus) {
    case 'active': return 'not_started';
    case 'in_progress': return 'in_progress';
    case 'completed': return 'completed';
    case 'claimed': return 'claimed';
    default: return 'not_started';  // ← expired cae aquí
  }
}
```

### Impacto
- Si backend envía `status: 'expired'`, frontend lo muestra como `'not_started'`
- Usuario ve misión "disponible" cuando realmente está expirada
- Comportamiento confuso en UI

---

## PROBLEMA #3: STORE USA TIPO LEGACY

### Archivo: missionsStore.ts

```typescript
// Línea 9 - Importa tipo LEGACY
import { missionsAPI, Mission } from '@/services/api/missionsAPI';

// Línea 94-108 - Intenta usar .objective que no existe
updateMissionProgress: (missionId: string, current: number) => {
  set((state) => {
    const updateMission = (missions: Mission[]) =>
      missions.map((m) => {
        if (m.id !== missionId) return m;
        // ERROR: m.objective es undefined con datos transformados
        const newObjective = { ...m.objective, current };  // ← CRASH
        // ...
      });
  });
},
```

### Causa del Error
1. La API devuelve datos con `objectives[]` (array)
2. El transformer los convierte correctamente
3. Pero el store espera `objective` (singular)
4. Al acceder a `m.objective`, obtiene `undefined`
5. El spread `{ ...undefined }` no falla pero pierde datos
6. El acceso a propiedades posteriores puede fallar

---

## PROBLEMA #4: MissionFromAPI INCOMPLETA

### Archivo: missionTransformer.ts:40

```typescript
export interface MissionFromAPI {
  // ...
  status: 'active' | 'in_progress' | 'completed' | 'claimed';  // ← Falta 'expired'
}
```

### Impacto
- TypeScript no advierte sobre status `expired`
- Sin validación en compile time
- Error silencioso en runtime

---

## PROBLEMA #5: CATEGORÍAS INCONSISTENTES

### Frontend (missionsTypes.ts)
```typescript
export type MissionCategory =
  | 'exercises' | 'xp' | 'time' | 'social' | 'achievement' | 'streak';
```

### Legacy API (missionsAPI.ts)
```typescript
category: 'exercises' | 'modules' | 'score' | 'streak'
        | 'achievements' | 'social' | 'coins' | 'xp';
```

### Diferencias
- Frontend NO tiene: `modules`, `score`, `coins`
- Legacy NO tiene: `time`, `achievement`
- `achievements` vs `achievement` (plural vs singular)

---

## PROBLEMA #6: RACHAS NO IMPLEMENTADAS

### Backend (missions.service.ts)
```typescript
// getStats() retorna:
const currentStreak = 0;   // TODO: Implementar cálculo
const longestStreak = 0;   // TODO: Implementar cálculo
```

### Impacto
- Stats siempre muestran racha = 0
- Funcionalidad de gamificación incompleta

---

## PROBLEMA #7: FALLBACK DE FECHAS INADECUADO

### Transformer (missionTransformer.ts:190-192)
```typescript
const expiresAt = apiMission.expires_at
  ? new Date(apiMission.expires_at)
  : new Date(Date.now() + 86400000);  // ← 24 horas fijo
```

### Impacto
- Si API no envía `expires_at`, se asume 24 horas
- Incorrecto para misiones semanales (deberían ser 7 días)
- Incorrecto para misiones especiales (duración variable)

---

## FLUJO DE DATOS Y PUNTOS DE FALLA

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE DATOS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  DATABASE                     BACKEND                   FRONTEND     │
│  ────────                     ───────                   ────────     │
│                                                                      │
│  missions table               missions.service.ts       useMissions  │
│  ├─ objectives (JSONB)   →    ├─ findByTypeAndUser()   ├─ fetch..() │
│  ├─ status (5 valores)   →    ├─ MissionResponseDto    ├─ transform │
│  └─ rewards (JSONB)      →    └─ endpoints REST   →    └─ render    │
│                                                                      │
│  PUNTOS DE FALLA:                                                    │
│  ────────────────                                                    │
│  [1] status='expired' no mapeado ────────────────────→ ❌ FALLA      │
│  [2] objectives[] vs objective ──────────────────────→ ❌ FALLA      │
│  [3] categorías no coinciden ────────────────────────→ ⚠️ WARNING   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## DIAGNÓSTICO DEL ERROR DE EJECUCIÓN

### Hipótesis Principal
El error ocurre cuando:
1. Usuario accede a `/student/missions`
2. `useMissions` hook hace fetch a `/gamification/missions/daily`
3. API retorna misiones con `status: 'expired'` o estructura inesperada
4. Transformer procesa pero mapea a `'not_started'`
5. Componentes intentan renderizar datos inconsistentes

### Verificación Necesaria
1. ¿Qué respuesta exacta devuelve el backend?
2. ¿Hay misiones con status `expired` en la DB?
3. ¿El error ocurre en el transformer o después?

---

## OBJETOS AFECTADOS

### Base de Datos
| Objeto | Schema | Tipo | Estado |
|--------|--------|------|--------|
| missions | gamification_system | TABLE | OK |
| scheduled_missions | progress_tracking | TABLE | OK |
| update_missions_updated_at | gamification_system | FUNCTION | OK |
| update_missions_on_exercise_complete | gamilit | FUNCTION | OK |
| trg_update_missions_on_exercise | progress_tracking | TRIGGER | OK |

### Backend
| Objeto | Archivo | Estado |
|--------|---------|--------|
| MissionsController | missions.controller.ts | OK |
| MissionsService | missions.service.ts | OK pero rachas TODO |
| Mission Entity | mission.entity.ts | OK |
| MissionResponseDto | mission-response.dto.ts | OK |
| MissionStatusEnum | mission.entity.ts | 5 valores (incluye expired) |

### Frontend
| Objeto | Archivo | Estado |
|--------|---------|--------|
| useMissions hook | useMissions.ts | OK (usa tipos nuevos) |
| Mission type | missionsTypes.ts | FALTA expired |
| MissionStatus type | missionsTypes.ts | FALTA expired |
| MissionFromAPI | missionTransformer.ts | FALTA expired |
| missionsStore | missionsStore.ts | USA TIPO LEGACY |
| missionsAPI | missionsAPI.ts | DEPRECATED pero en uso |

---

## DEPENDENCIAS ENTRE OBJETOS

```
missionsTypes.ts (CANÓNICO)
    ↑
    │ importa tipos
    │
useMissions.ts ←──────── MissionsPage.tsx
    │
    │ usa
    ↓
missionTransformer.ts
    │
    │ transforma
    ↓
Backend API Response


missionsAPI.ts (LEGACY) ←─── missionsStore.ts ←─── SOLO EN TESTS
    │
    └─ DEPRECATED pero aún referenciado
```

---

## CONCLUSIONES

### Error Principal Identificado
El error de ejecución probablemente se produce por:

1. **Incompatibilidad de tipos** entre el store legacy y los datos transformados
2. **Status `expired`** que no se maneja correctamente en frontend
3. **Datos de API** que no coinciden con las interfaces definidas

### Confirmación Necesaria
Para confirmar el error exacto, se requiere:
1. Ver los logs de consola del browser
2. Verificar respuesta exacta del endpoint `/gamification/missions/daily`
3. Verificar si hay misiones con status `expired` en producción

---

## PRÓXIMOS PASOS

1. **FASE 2: PLANEACIÓN** - Definir correcciones específicas
2. Priorizar fixes por impacto
3. Orquestar agentes para implementación

---

**Documento generado por:** Architecture-Analyst
**Fecha:** 2025-11-26
**Estado:** ANÁLISIS COMPLETADO - PENDIENTE VALIDACIÓN
