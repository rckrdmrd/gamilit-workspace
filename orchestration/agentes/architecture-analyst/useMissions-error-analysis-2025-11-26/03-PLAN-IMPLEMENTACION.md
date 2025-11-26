# PLAN DE IMPLEMENTACIÓN Y CORRECCIONES

**Fecha:** 2025-11-26
**Autor:** Architecture-Analyst
**Estado:** PLANEACIÓN

---

## RESUMEN DEL PLAN

| Grupo | Tareas | Agentes | Ejecución |
|-------|--------|---------|-----------|
| G1 - Fix Crítico | 3 tareas | 1 Frontend-Agent | Secuencial (mismo archivo) |
| G2 - Deuda Técnica | 3 tareas | 1 Frontend-Agent | Paralelo posible |
| G3 - Mejoras | 2 tareas | Backend-Agent | Futuro (no urgente) |

---

## GRUPO 1: FIX CRÍTICO - Status `expired`

### Objetivo
Agregar soporte completo para status `expired` en el frontend de missions.

### Tareas

#### TAREA 1.1: Agregar `expired` a MissionStatus
**Archivo:** `apps/frontend/src/features/gamification/missions/types/missionsTypes.ts`
**Línea:** 19-23
**Cambio:**
```typescript
// ANTES
export type MissionStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'claimed';

// DESPUÉS
export type MissionStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'claimed'
  | 'expired';  // ← NUEVO
```

#### TAREA 1.2: Agregar `expired` a MissionFromAPI
**Archivo:** `apps/frontend/src/features/gamification/missions/utils/missionTransformer.ts`
**Línea:** 40
**Cambio:**
```typescript
// ANTES
status: 'active' | 'in_progress' | 'completed' | 'claimed';

// DESPUÉS
status: 'active' | 'in_progress' | 'completed' | 'claimed' | 'expired';
```

#### TAREA 1.3: Actualizar mapApiStatusToFrontend()
**Archivo:** `apps/frontend/src/features/gamification/missions/utils/missionTransformer.ts`
**Línea:** 72-85
**Cambio:**
```typescript
// ANTES
export function mapApiStatusToFrontend(apiStatus: string): MissionStatus {
  switch (apiStatus) {
    case 'active': return 'not_started';
    case 'in_progress': return 'in_progress';
    case 'completed': return 'completed';
    case 'claimed': return 'claimed';
    default: return 'not_started';
  }
}

// DESPUÉS
export function mapApiStatusToFrontend(apiStatus: string): MissionStatus {
  switch (apiStatus) {
    case 'active': return 'not_started';
    case 'in_progress': return 'in_progress';
    case 'completed': return 'completed';
    case 'claimed': return 'claimed';
    case 'expired': return 'expired';  // ← NUEVO
    default: return 'not_started';
  }
}
```

### Agente a Orquestar
- **Agente:** Frontend-Agent
- **Prompt:** PROMPT-FRONTEND-AGENT.md
- **Ejecución:** Secuencial (mismos archivos relacionados)

### Criterios de Aceptación
- [ ] MissionStatus type incluye 'expired'
- [ ] MissionFromAPI incluye 'expired' en status union
- [ ] mapApiStatusToFrontend mapea 'expired' → 'expired'
- [ ] TypeScript compila sin errores
- [ ] No hay regresiones en funcionalidad existente

---

## GRUPO 2: DEUDA TÉCNICA - Consolidación de Tipos

### Objetivo
Eliminar código legacy y consolidar en tipos canónicos.

### Tareas

#### TAREA 2.1: Deprecar missionsStore
**Archivo:** `apps/frontend/src/features/missions/store/missionsStore.ts`
**Acción:** Agregar comentario @deprecated más prominente, NO eliminar aún (tests lo usan)
**Cambio:**
```typescript
/**
 * @deprecated Este store usa tipos legacy. NO USAR en código nuevo.
 *
 * Para nuevas implementaciones usar:
 * - Hook: useMissions de @/features/gamification/missions/hooks/useMissions
 * - Types: @/features/gamification/missions/types/missionsTypes.ts
 *
 * Este store será eliminado en próxima limpieza de código.
 * Ref: useMissions-error-analysis-2025-11-26
 */
```

#### TAREA 2.2: Actualizar deprecation en missionsAPI
**Archivo:** `apps/frontend/src/services/api/missionsAPI.ts`
**Acción:** Ya tiene @deprecated, verificar que esté visible

#### TAREA 2.3: Documentar ruta de migración
**Archivo:** Crear `apps/frontend/src/features/missions/MIGRATION-GUIDE.md`
**Contenido:** Guía para migrar de store/API legacy a hook nuevo

### Agente a Orquestar
- **Agente:** Frontend-Agent
- **Ejecución:** Puede ser paralelo a G1 si son archivos diferentes

### Criterios de Aceptación
- [ ] missionsStore tiene deprecation prominente
- [ ] missionsAPI tiene deprecation prominente
- [ ] Existe guía de migración
- [ ] No se rompen tests existentes

---

## GRUPO 3: MEJORAS FUTURAS (NO URGENTE)

### Tareas

#### TAREA 3.1: Implementar cálculo de rachas
**Archivo:** `apps/backend/src/modules/gamification/services/missions.service.ts`
**Método:** `getStats()`
**Acción:** Implementar lógica para calcular `currentStreak` y `longestStreak`

#### TAREA 3.2: Mejorar fallback de fechas
**Archivo:** `apps/frontend/src/features/gamification/missions/utils/missionTransformer.ts`
**Acción:** Ajustar fallback de `expiresAt` según tipo de misión

### Estado
- **Prioridad:** BAJA
- **Ejecución:** Diferida para futura iteración
- **Agente:** Backend-Agent (3.1), Frontend-Agent (3.2)

---

## ORDEN DE EJECUCIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE DE EJECUCIÓN                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GRUPO 1 (Secuencial - Crítico)                                  │
│  ├─ TAREA 1.1: MissionStatus += 'expired'                       │
│  ├─ TAREA 1.2: MissionFromAPI += 'expired'                      │
│  └─ TAREA 1.3: mapApiStatusToFrontend += 'expired'              │
│                                                                  │
│  ────────────────── VALIDACIÓN ──────────────────               │
│                                                                  │
│  GRUPO 2 (Paralelo posible - Deuda técnica)                     │
│  ├─ TAREA 2.1: Deprecar missionsStore                           │
│  ├─ TAREA 2.2: Verificar deprecation missionsAPI                │
│  └─ TAREA 2.3: Crear guía migración                             │
│                                                                  │
│  ────────────────── VALIDACIÓN ──────────────────               │
│                                                                  │
│  GRUPO 3 (Futuro - Mejoras)                                     │
│  └─ Diferido para próxima iteración                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## PROMPTS PARA ORQUESTACIÓN

### Frontend-Agent - Grupo 1 (Fix Crítico)

```markdown
Lee el prompt orchestration/prompts/PROMPT-FRONTEND-AGENT.md y actúa como Frontend-Agent.

TAREA: Agregar soporte para status 'expired' en el sistema de missions

CONTEXTO:
- El backend envía misiones con status 'expired' pero el frontend no lo maneja
- Actualmente 'expired' se mapea a 'not_started' causando comportamiento incorrecto
- Se requiere agregar 'expired' en 3 ubicaciones del frontend

ARCHIVOS A MODIFICAR:

1. apps/frontend/src/features/gamification/missions/types/missionsTypes.ts
   - Línea 19-23: Agregar | 'expired' al type MissionStatus

2. apps/frontend/src/features/gamification/missions/utils/missionTransformer.ts
   - Línea 40: Agregar | 'expired' al union type de status en MissionFromAPI
   - Línea 72-85: Agregar case 'expired': return 'expired'; en mapApiStatusToFrontend()

CRITERIOS DE ACEPTACIÓN:
- ✅ MissionStatus incluye 'expired'
- ✅ MissionFromAPI.status incluye 'expired'
- ✅ mapApiStatusToFrontend mapea 'expired' → 'expired'
- ✅ npx tsc --noEmit compila sin errores
- ✅ No hay cambios en otros archivos

RESTRICCIONES:
- NO modificar otros archivos
- NO cambiar lógica existente
- Mantener compatibilidad hacia atrás
- Seguir estándares del proyecto

REFERENCIAS:
- orchestration/agentes/architecture-analyst/useMissions-error-analysis-2025-11-26/
```

### Frontend-Agent - Grupo 2 (Deuda Técnica)

```markdown
Lee el prompt orchestration/prompts/PROMPT-FRONTEND-AGENT.md y actúa como Frontend-Agent.

TAREA: Mejorar documentación de deprecation en código legacy de missions

ARCHIVOS A MODIFICAR:

1. apps/frontend/src/features/missions/store/missionsStore.ts
   - Agregar bloque JSDoc @deprecated más visible al inicio del archivo
   - Explicar que se debe usar useMissions hook en su lugar
   - Referenciar: useMissions-error-analysis-2025-11-26

2. apps/frontend/src/services/api/missionsAPI.ts
   - Verificar y mejorar deprecation existente si es necesario

3. CREAR: apps/frontend/src/features/missions/MIGRATION-GUIDE.md
   - Documentar cómo migrar de store/API legacy a hook nuevo
   - Incluir ejemplos de código antes/después

CRITERIOS DE ACEPTACIÓN:
- ✅ missionsStore tiene JSDoc @deprecated prominente
- ✅ missionsAPI tiene deprecation actualizado
- ✅ Existe MIGRATION-GUIDE.md con instrucciones claras
- ✅ No se rompe funcionalidad existente

RESTRICCIONES:
- NO eliminar código (solo documentar)
- NO modificar lógica
- Mantener tests funcionando
```

---

## VALIDACIÓN POST-IMPLEMENTACIÓN

Después de cada grupo, verificar:

### Grupo 1
```bash
# Verificar compilación TypeScript
cd apps/frontend && npx tsc --noEmit

# Verificar que el tipo incluye expired
grep -n "expired" src/features/gamification/missions/types/missionsTypes.ts
grep -n "expired" src/features/gamification/missions/utils/missionTransformer.ts
```

### Grupo 2
```bash
# Verificar deprecation
grep -n "@deprecated" src/features/missions/store/missionsStore.ts
grep -n "@deprecated" src/services/api/missionsAPI.ts

# Verificar guía existe
ls -la src/features/missions/MIGRATION-GUIDE.md
```

---

## ESTIMACIÓN

| Grupo | Complejidad | Riesgo | Impacto |
|-------|-------------|--------|---------|
| G1 | Baja | Bajo | Alto (fix crítico) |
| G2 | Baja | Bajo | Medio (documentación) |
| G3 | Media | Medio | Bajo (mejora futura) |

---

## DEPENDENCIAS

```
G1 (Fix expired) ──→ No depende de nada
                 └──→ Debe completarse primero

G2 (Deuda técnica) ──→ Puede ejecutarse en paralelo con G1
                   └──→ No bloquea funcionalidad

G3 (Mejoras) ──→ Depende de G1 completado
             └──→ Puede diferirse
```

---

**Plan creado por:** Architecture-Analyst
**Fecha:** 2025-11-26
**Estado:** PENDIENTE VALIDACIÓN
