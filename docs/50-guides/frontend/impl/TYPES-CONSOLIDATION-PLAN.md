# Plan de Consolidación de Types - Frontend GAMILIT

**Fecha:** 2025-11-29
**Versión:** 1.0
**Estado:** PENDIENTE VALIDACIÓN (FASE 2)
**Basado en:** TYPES-CONSOLIDATION-ANALYSIS.md

---

## Principios del Plan

1. **Documentación PRIMERO** - No se ejecuta código hasta tener documentación aprobada
2. **Sin breaking changes** - Mantener compatibilidad con imports existentes
3. **Incremental** - Una categoría de types a la vez
4. **Validación continua** - Build check después de cada cambio

---

## BLOQUE A: Documentación (OBLIGATORIO ANTES DE CÓDIGO)

### A.1 Crear TYPES-CONVENTIONS.md
**Objetivo:** Establecer política permanente de manejo de types
**Objetos afectados:** Ninguno (solo documentación)
**Dependencias:** Ninguna
**Prioridad:** P0 - CRÍTICA

**Contenido requerido:**
- [ ] Definición de SSOT (Single Source of Truth) por categoría
- [ ] Reglas de importación (@shared/types, NO desde features)
- [ ] Convención naming (snake_case para DB, camelCase para UI)
- [ ] Política de no duplicación
- [ ] Proceso para agregar nuevos types
- [ ] Lista de barrel exports autorizados

**Ubicación:** `docs/50-guides/frontend/TYPES-CONVENTIONS.md`

---

### A.2 Actualizar ESTRUCTURA-FEATURES.md
**Objetivo:** Documentar features faltantes
**Objetos afectados:** Documentación existente
**Dependencias:** Ninguna
**Prioridad:** P1

**Cambios:**
- [ ] Agregar documentación de `mechanics/`
- [ ] Agregar documentación de `missions/`
- [ ] Agregar documentación de `assignments/`
- [ ] Actualizar diagrama de estructura

**Ubicación:** `docs/50-guides/frontend/ESTRUCTURA-FEATURES.md`

---

## BLOQUE B: Consolidación de Types (Post-Documentación)

### B.1 MayaRank - Resolución de Conflicto de Nombres
**Objetivo:** Eliminar ambigüedad de 3 significados diferentes
**Criticidad:** 🔴 CRÍTICA
**Prioridad:** P0

#### Subtarea B.1.1: Renombrar interface a MayaRankConfig
**Objetos afectados:**

| Capa | Archivo | Cambio |
|------|---------|--------|
| Types Admin | `/types/admin/gamification.types.ts` | `MayaRank` → `MayaRankConfig` |
| API Admin | `/services/api/adminTypes.ts` | `MayaRank` → `MayaRankConfig` |
| Components | Componentes que usen MayaRank como config | Actualizar imports |

**Dependencias:** Ninguna (es renombramiento)

#### Subtarea B.1.2: Eliminar duplicados de enum
**Objetos afectados:**

| Capa | Archivo | Cambio |
|------|---------|--------|
| SSOT ✅ | `/shared/constants/ranks.constants.ts` | MANTENER como fuente |
| Duplicado ❌ | `/shared/types/gamification.types.ts` | ELIMINAR enum, re-exportar |
| Duplicado ❌ | `/features/progress/api/progressTypes.ts` | ELIMINAR enum, importar desde SSOT |
| Duplicado ❌ | `/features/gamification/ranks/types/ranksTypes.ts` | ELIMINAR type union, importar |

**Dependencias:** B.1.1 debe completarse primero

#### Subtarea B.1.3: Actualizar imports en consumidores
**Objetos afectados:**
- Todos los archivos que importen MayaRank
- Estimado: ~15-20 archivos

**Dependencias:** B.1.1, B.1.2

---

### B.2 Achievement - Consolidación
**Objetivo:** Reducir de 12 a 1 SSOT + re-exports
**Criticidad:** 🔴 CRÍTICA
**Prioridad:** P0

#### Subtarea B.2.1: Validar SSOT actual
**Objetos afectados:**

| Archivo | Estado | Acción |
|---------|--------|--------|
| `/shared/types/achievement.types.ts` | SSOT ✅ | Validar completitud |

**Verificar que contiene:**
- [ ] `Achievement` interface completa
- [ ] `AchievementCategory` enum
- [ ] `AchievementReward` interface
- [ ] `UserAchievement` interface

#### Subtarea B.2.2: Eliminar definiciones duplicadas
**Objetos afectados:**

| Capa | Archivo | Cambio |
|------|---------|--------|
| API Gamification | `/features/gamification/api/gamificationAPI.ts` | ELIMINAR interface, importar |
| Types Social | `/features/gamification/social/types/achievementsTypes.ts` | EVALUAR: deprecar o eliminar |
| API Social | `/features/gamification/social/api/achievementsAPI.ts` | ELIMINAR interface, importar |
| Types Admin | `/types/admin/achievements.types.ts` | Extender desde SSOT, no duplicar |
| API Admin | `/services/api/adminTypes.ts` | Importar desde SSOT |

**Dependencias:** B.2.1

#### Subtarea B.2.3: Crear transformers si es necesario
**Objetivo:** Normalizar respuestas API que usen `name` vs `title`
**Objetos afectados:**
- Nuevo archivo: `/shared/transformers/achievement.transformer.ts`

**Dependencias:** B.2.2

---

### B.3 UserStats y UserRank
**Objetivo:** Consolidar en gamification.types.ts
**Criticidad:** 🔴 CRÍTICA
**Prioridad:** P1

#### Subtarea B.3.1: Validar SSOT
**Objetos afectados:**
- SSOT: `/shared/types/gamification.types.ts`

**Verificar contiene:**
- [ ] `UserStats` interface completa
- [ ] `UserRank` interface completa

#### Subtarea B.3.2: Eliminar duplicados
**Objetos afectados:**

| Archivo | Cambio |
|---------|--------|
| Features que dupliquen | Importar desde SSOT |
| APIs que definan tipos inline | Importar desde SSOT |

**Dependencias:** B.3.1

---

### B.4 Profile
**Objetivo:** Resolver duplicación auth vs shared
**Criticidad:** 🔴 CRÍTICA
**Prioridad:** P1

#### Subtarea B.4.1: Determinar SSOT definitivo
**Decisión requerida:**

| Opción | Archivo | Justificación |
|--------|---------|---------------|
| A | `/features/auth/types/auth.types.ts` | Más cercano al dominio de auth |
| B | `/shared/types/profile.types.ts` | Más accesible globalmente |

**Recomendación:** Opción A con re-export en B

#### Subtarea B.4.2: Implementar re-export
**Objetos afectados:**

| Archivo | Cambio |
|---------|--------|
| `/shared/types/profile.types.ts` | Re-export desde auth.types |
| `/shared/types/auth.types.ts` | Marcar como deprecated, re-export |

**Dependencias:** B.4.1

---

### B.5 Mission
**Objetivo:** Eliminar código deprecated, consolidar
**Criticidad:** 🔴 CRÍTICA
**Prioridad:** P1

#### Subtarea B.5.1: Identificar código deprecated
**Objetos afectados:**
- `missionsAPI.ts` marcado como deprecated

#### Subtarea B.5.2: Migrar a SSOT
**SSOT:** `/features/gamification/missions/types/missionsTypes.ts`

| Archivo | Cambio |
|---------|--------|
| APIs deprecated | Eliminar o migrar |
| Consumidores | Actualizar imports |

---

### B.6 Exercise (Prioridad Media)
**Objetivo:** Consolidar 35+ ubicaciones
**Criticidad:** 🟡 MEDIA
**Prioridad:** P2

**Nota:** Debido a la complejidad (35+ archivos), se recomienda:
1. Documentar estado actual exhaustivamente
2. Crear plan específico separado
3. Ejecutar en fases pequeñas

---

## BLOQUE C: Validación

### C.1 Validación Post-Consolidación
**Objetivo:** Verificar que no hay breaking changes
**Dependencias:** Todos los bloques B completados

**Checklist:**
- [ ] `npm run build` sin errores
- [ ] `npm run type-check` sin errores
- [ ] Importaciones desde @shared/types funcionan
- [ ] No hay tipos duplicados en bundle

### C.2 Actualización de Documentación
**Objetivo:** Reflejar cambios realizados
**Dependencias:** C.1

**Acciones:**
- [ ] Actualizar TYPES-CONSOLIDATION-ANALYSIS.md con estado final
- [ ] Actualizar inventarios si aplica
- [ ] Crear reporte de implementación

---

## Orden de Ejecución Sugerido

```
FASE 2.1: Documentación (Bloque A)
├── A.1 TYPES-CONVENTIONS.md ─────────────────── [PRIMERO]
└── A.2 Actualizar ESTRUCTURA-FEATURES.md

FASE 2.2: Consolidación Crítica (Bloque B - P0)
├── B.1 MayaRank ─────────────────────────────── [Resolver conflicto]
│   ├── B.1.1 Renombrar a MayaRankConfig
│   ├── B.1.2 Eliminar duplicados enum
│   └── B.1.3 Actualizar imports
└── B.2 Achievement ──────────────────────────── [12 → 1]
    ├── B.2.1 Validar SSOT
    ├── B.2.2 Eliminar duplicados
    └── B.2.3 Crear transformers

FASE 2.3: Consolidación P1 (Bloque B)
├── B.3 UserStats/UserRank
├── B.4 Profile
└── B.5 Mission

FASE 2.4: Validación (Bloque C)
├── C.1 Build & Type Check
└── C.2 Documentación Final

FASE 2.5 (Futuro): Exercise (P2)
└── B.6 Plan separado
```

---

## Criterios de Éxito

| Métrica | Antes | Objetivo | Validación |
|---------|-------|----------|------------|
| Ubicaciones MayaRank | 7 (3 significados) | 2 (enum + config) | Grep |
| Ubicaciones Achievement | 12 | 1 SSOT + re-exports | Grep |
| Documentos de types | 0 | 1+ (TYPES-CONVENTIONS.md) | Archivo existe |
| Conflictos de nombre | 3 | 0 | TypeScript compile |
| Build errors | 0 | 0 | npm run build |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Breaking changes en imports | Media | Alto | Re-exports de compatibilidad |
| Tipos faltantes en SSOT | Baja | Medio | Validar completitud antes de eliminar |
| Conflictos de merge | Media | Medio | Comunicar cambios, PRs pequeños |
| Regresión en runtime | Baja | Alto | Tests E2E post-cambio |

---

## Referencias

- **Análisis base:** `docs/50-guides/frontend/TYPES-CONSOLIDATION-ANALYSIS.md`
- **Estructura actual:** `docs/50-guides/frontend/ESTRUCTURA-FEATURES.md`
- **Types compartidos:** `apps/frontend/src/shared/types/`
- **Constants:** `apps/frontend/src/shared/constants/`

---

## Aprobación

| Rol | Nombre | Estado | Fecha |
|-----|--------|--------|-------|
| Arquitecto | - | PENDIENTE | - |
| Tech Lead | - | PENDIENTE | - |
| QA | - | PENDIENTE | - |
