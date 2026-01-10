---
id: "CORR-006-ANALISIS"
title: "Análisis Pre-Ejecución - Corrección Datos Mock en Leaderboard"
type: "Análisis"
status: "Done"
priority: "P1"
assignee: "@Orquestador"
related_task: "CORR-006"
affected_modules: ["frontend", "portal-student", "gamification"]
labels: ["corrección", "frontend", "leaderboard", "mock-data", "api-integration"]
created_date: "2026-01-08"
updated_date: "2026-01-08"
---

# ANÁLISIS PRE-EJECUCIÓN: CORR-006 - Corrección Datos Mock en Leaderboard

**Agente:** Orquestador
**Tipo de tarea:** Corrección | Bug
**Prioridad:** P1
**Fecha análisis:** 2026-01-08
**Relacionado con:** Portal Student, Gamificación, APIs

---

## CONTEXTO DE LA TAREA

### Solicitud Original
La página de Leaderboard del portal de estudiantes no muestra información correcta. Se requiere análisis detallado de la fuente de datos, relación con base de datos y backend, validación del consumo de APIs, e identificación de la causa raíz del problema.

### Objetivo Final
Identificar y corregir los componentes que usan datos mock hardcodeados, integrándolos con las APIs reales del backend para mostrar datos correctos del leaderboard.

### Módulo Relacionado
**Módulo MVP:** Portal Student - Gamificación
**Sección:** Sistema de Rankings y Leaderboards

### Justificación
Los componentes de leaderboard usan datos mock hardcodeados en lugar de consumir las APIs reales del backend, causando que los usuarios vean información falsa o desactualizada.

---

## INVENTARIO ACTUAL

### Arquitectura del Sistema de Leaderboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE DATOS ESPERADO                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Frontend Component  →  Hook/Store  →  API Client  →  Backend API      │
│          ↓                                                               │
│  GET /api/v1/gamification/leaderboard/*  →  LeaderboardService         │
│          ↓                                                               │
│  gamification_system.user_stats + auth_management.profiles (PostgreSQL) │
└─────────────────────────────────────────────────────────────────────────┘
```

### Componentes Analizados

#### Componentes de Frontend:
| Archivo | Ubicación | Estado Inicial |
|---------|-----------|----------------|
| LeaderboardPage.tsx | `/apps/student/pages/` | ✅ Usa hook correcto |
| LeaderboardPreview.tsx | `/apps/student/components/gamification/` | ❌ mockTop3 hardcodeado |
| LiveLeaderboard.tsx | `/features/gamification/leaderboard/` | ❌ generateMockLeaderboardData |

#### Hooks y Store:
| Archivo | Ubicación | Estado |
|---------|-----------|--------|
| useLeaderboards.ts | `/features/gamification/social/hooks/` | ✅ Correcto |
| leaderboardsStore.ts | `/features/gamification/social/store/` | ✅ Consume APIs reales |

#### APIs:
| Archivo | Ubicación | Estado |
|---------|-----------|--------|
| socialAPI.ts | `/features/gamification/social/api/` | ✅ Endpoints configurados |

#### Backend:
| Archivo | Ubicación | Estado |
|---------|-----------|--------|
| leaderboard.controller.ts | `/modules/gamification/controllers/` | ✅ Endpoints implementados |
| leaderboard.service.ts | `/modules/gamification/services/` | ✅ Queries correctas |

---

## ANÁLISIS COMPARATIVO DETALLADO

### 1. Fuente de Datos por Componente

| Componente | Fuente Esperada | Fuente Actual | Estado |
|------------|-----------------|---------------|--------|
| LeaderboardPage | APIs vía useLeaderboards | APIs vía useLeaderboards | ✅ |
| LeaderboardPreview | APIs vía useLeaderboards | mockTop3 hardcodeado | ❌ |
| LiveLeaderboard | APIs vía socialAPI | generateMockLeaderboardData() | ❌ |

### 2. Datos Mock Identificados

#### LeaderboardPreview.tsx (líneas 33-55):
```typescript
// Mock top 3 data - DATOS FALSOS HARDCODEADOS
const mockTop3 = [
  { rank: 1, username: 'Albert Einstein', score: 5420, rankBadge: "K'uk'ulkan" },
  { rank: 2, username: 'Isaac Newton', score: 5180, rankBadge: 'Halach Uinic' },
  { rank: 3, username: 'Nikola Tesla', score: 4950, rankBadge: 'Halach Uinic' },
];
```

**Impacto:** El componente siempre muestra Einstein, Newton, Tesla como Top 3 independientemente de los datos reales.

#### LiveLeaderboard.tsx (líneas 171-295, 677-693):
```typescript
// Función que genera datos aleatorios
const generateMockLeaderboardData = (userId, type) => { ... }

// fetchLeaderboardData usa datos mock
const data = generateMockLeaderboardData(userId, selectedType);
```

**Impacto:** El componente muestra datos aleatorios generados localmente.

### 3. Flujo de Datos Correcto vs Incorrecto

| Flujo | LeaderboardPage | LeaderboardPreview | LiveLeaderboard |
|-------|-----------------|--------------------|-----------------|
| 1. Hook/Store | useLeaderboards ✅ | - ❌ | useState local ❌ |
| 2. API Call | getLeaderboard() ✅ | - ❌ | - ❌ |
| 3. Transform | socialAPI ✅ | mockTop3 ❌ | generateMockData ❌ |
| 4. Render | Datos reales ✅ | Datos fake ❌ | Datos random ❌ |

### 4. Dependencias de APIs Backend

| Endpoint | Usado Por | Estado Backend |
|----------|-----------|----------------|
| GET /gamification/leaderboard/global | LeaderboardPage, socialAPI | ✅ Implementado |
| GET /gamification/leaderboard/schools/:id | socialAPI | ✅ Implementado |
| GET /gamification/leaderboard/classrooms/:id | socialAPI | ✅ Implementado |
| GET /gamification/leaderboard/friends/:id | socialAPI | ✅ Implementado |
| GET /gamification/leaderboards/xp | socialAPI (Sprint 2) | ✅ Implementado |
| GET /gamification/leaderboards/streaks | socialAPI (Sprint 2) | ✅ Implementado |

---

## DIAGNÓSTICO

### Problemas Identificados

| # | Problema | Severidad | Componente |
|---|----------|-----------|------------|
| 1 | mockTop3 hardcodeado | 🔴 ALTA | LeaderboardPreview.tsx |
| 2 | generateMockLeaderboardData() | 🟡 MEDIA | LiveLeaderboard.tsx |
| 3 | Sin integración con authStore | 🟡 MEDIA | LiveLeaderboard.tsx |

### Causa Raíz
Los componentes `LeaderboardPreview` y `LiveLeaderboard` fueron desarrollados con datos mock placeholder y nunca se integraron con las APIs reales del backend, a pesar de que el flujo completo (hook → store → API → backend → BD) ya está implementado y funcional.

---

## SOLUCIÓN PROPUESTA

### Corrección 1: LeaderboardPreview.tsx
- Eliminar `mockTop3` hardcodeado
- Integrar con hook `useLeaderboards`
- Derivar Top 3 de `currentLeaderboard.entries.slice(0, 3)`
- Agregar estados de carga y vacío

### Corrección 2: LiveLeaderboard.tsx
- Importar APIs de `socialAPI.ts`
- Reemplazar `generateMockLeaderboardData` con llamadas a APIs reales
- Mapear tipos: xp→getXPLeaderboard, streak→getStreaksLeaderboard, detective→getGlobalLeaderboard
- Mantener mock data como fallback cuando API falla
- Agregar indicador visual de "Modo Demo"

### Corrección 3: Script de Verificación BD
- Crear script SQL para verificar datos en `user_stats`
- Validar que existen perfiles con estadísticas
- Diagnóstico automático de estado de datos

---

## ARCHIVOS A MODIFICAR

| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| LeaderboardPreview.tsx | Modificar | P1 |
| LiveLeaderboard.tsx | Modificar | P2 |
| verify-leaderboard-data.sql | Crear | P3 |

---

## VALIDACIONES REQUERIDAS

### Pre-ejecución
- [x] Identificar todos los componentes con datos mock
- [x] Verificar que APIs backend están implementadas
- [x] Confirmar estructura de respuesta de APIs

### Post-ejecución
- [ ] Build compila sin errores
- [ ] TypeScript sin errores en archivos modificados
- [ ] Componentes renderizan datos de API cuando están disponibles
- [ ] Fallback a mock funciona cuando API falla
- [ ] Script de verificación BD ejecutable

---

## REFERENCIAS

### Archivos de Referencia (Implementación Correcta)
- LeaderboardPage.tsx - Patrón correcto de integración
- leaderboardsStore.ts - Store con consumo de APIs
- socialAPI.ts - Cliente API configurado

### Documentación Relacionada
- `/docs/01-fase-alcance-inicial/EAI-003-gamificacion/historias-usuario/US-GAM-007-leaderboard-simple.md`
