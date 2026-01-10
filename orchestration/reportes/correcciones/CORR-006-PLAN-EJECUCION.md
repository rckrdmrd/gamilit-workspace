---
id: "CORR-006-PLAN"
title: "Plan de Ejecución - Corrección Datos Mock en Leaderboard"
type: "Plan"
status: "Done"
priority: "P1"
assignee: "@Frontend-Agent"
related_task: "CORR-006"
affected_modules: ["frontend", "portal-student", "database"]
labels: ["corrección", "frontend", "plan", "api-integration"]
created_date: "2026-01-08"
updated_date: "2026-01-08"
---

# PLAN DE EJECUCIÓN: CORR-006 - Corrección Datos Mock en Leaderboard

**Agente:** Frontend-Agent
**Tipo de tarea:** Corrección
**Prioridad:** P1
**Fecha creación:** 2026-01-08
**Relacionado con:** CORR-006-ANALISIS

---

## OBJETIVO

Eliminar datos mock hardcodeados en componentes de leaderboard e integrarlos con las APIs reales del backend.

**Criterios de Aceptación:**
- [x] LeaderboardPreview usa datos reales vía useLeaderboards hook
- [x] LiveLeaderboard consume APIs reales (getXPLeaderboard, getStreaksLeaderboard, getGlobalLeaderboard)
- [x] Mock data como fallback cuando API falla/vacío
- [x] Indicador visual de "Modo Demo" cuando usa mock
- [x] Script de verificación de BD creado
- [x] Build compila sin errores
- [x] TypeScript sin errores en archivos modificados

---

## FASES DE EJECUCIÓN

### FASE 1: ANÁLISIS Y PLANEACIÓN
**Estado:** ✅ Completado

| Tarea | Estado |
|-------|--------|
| Explorar estructura del proyecto | ✅ |
| Identificar componentes con mock data | ✅ |
| Analizar flujo de datos correcto | ✅ |
| Documentar hallazgos | ✅ |

---

### FASE 2: ANÁLISIS DETALLADO
**Estado:** ✅ Completado

| Tarea | Estado |
|-------|--------|
| Leer código de LeaderboardPreview.tsx | ✅ |
| Leer código de LiveLeaderboard.tsx | ✅ |
| Analizar socialAPI.ts | ✅ |
| Analizar leaderboardsStore.ts | ✅ |
| Identificar dependencias | ✅ |

---

### FASE 3: PLANEACIÓN BASADA EN ANÁLISIS
**Estado:** ✅ Completado

| Tarea | Estado |
|-------|--------|
| Definir correcciones necesarias | ✅ |
| Priorizar cambios | ✅ |
| Documentar plan | ✅ |

---

### FASE 4: VALIDACIÓN DE DEPENDENCIAS
**Estado:** ✅ Completado

| Dependencia | Estado |
|-------------|--------|
| useLeaderboards hook | ✅ Disponible |
| leaderboardsStore | ✅ Consume APIs |
| socialAPI | ✅ Endpoints configurados |
| Backend APIs | ✅ Implementados |
| authStore | ✅ Disponible |

---

## CICLOS DE EJECUCIÓN

### Ciclo 1: Corrección LeaderboardPreview.tsx

**Objetivo:** Eliminar mockTop3 e integrar con useLeaderboards hook

**Tareas:**
1. Agregar imports necesarios:
   - useMemo de react
   - useLeaderboards de @/features/gamification/social/hooks/useLeaderboards
   - RefreshCw de lucide-react

2. Modificar interface LeaderboardPreviewProps:
   - Agregar prop opcional topThree?: TopThreeEntry[]

3. Eliminar constante mockTop3

4. Agregar integración con hook useLeaderboards

5. Agregar estados de carga y vacío

6. Reemplazar referencias mockTop3[N] por topThree[N]

7. Agregar onError handler para imágenes de avatar

**Artefactos modificados:**
- /apps/frontend/src/apps/student/components/gamification/LeaderboardPreview.tsx

---

### Ciclo 2: Corrección LiveLeaderboard.tsx

**Objetivo:** Integrar con APIs reales manteniendo fallback a mock

**Tareas:**
1. Agregar imports de APIs reales
2. Agregar estados para tracking de modo (useMockData, apiError)
3. Obtener currentUserId de authStore
4. Modificar fetchLeaderboardData para usar APIs según selectedType
5. Agregar banner de advertencia "Modo Demo"
6. Actualizar documentación JSDoc del componente

**Artefactos modificados:**
- /apps/frontend/src/features/gamification/leaderboard/LiveLeaderboard.tsx

---

### Ciclo 3: Crear Script de Verificación BD

**Objetivo:** Script SQL para verificar datos del leaderboard

**Tareas:**
1. Crear archivo verify-leaderboard-data.sql
2. Implementar verificaciones de user_stats
3. Verificar perfiles vinculados
4. Simular query del leaderboard (Top 10)
5. Generar diagnóstico automático

**Artefactos creados:**
- /apps/database/scripts/verify-leaderboard-data.sql

---

### Ciclo 4: Validación Final

**Validaciones:**
- TypeScript sin errores
- Build compila correctamente
- Script de BD ejecutable

---

## RESUMEN DE ARTEFACTOS

### Archivos Modificados
| Archivo | Líneas | Tipo |
|---------|--------|------|
| LeaderboardPreview.tsx | ~100 | Corrección |
| LiveLeaderboard.tsx | ~80 | Corrección |

### Archivos Creados
| Archivo | Líneas | Tipo |
|---------|--------|------|
| verify-leaderboard-data.sql | ~180 | Script BD |

---

## REFERENCIAS

- CORR-006-ANALISIS-LEADERBOARD-MOCK-DATA.md
- leaderboardsStore.ts (patrón correcto)
- socialAPI.ts (endpoints disponibles)
