---
titulo: Student Portal Hooks Specification
tipo: portal
portal: student
ultima_actualizacion: 2026-02-28
---

# Student Portal Hooks Specification

**Version:** 1.1.0
**Fecha:** 2026-02-18 (v1.1.0: +2 hooks Phase 4)
**Autor:** @PERFIL_FRONTEND + @PERFIL_DOCUMENTATION
**Tarea:** P2-1 (TASK-2026-01-20-AUDITORIA-ANALISIS-PORTALES)

> **Este archivo es un hub.** El contenido detallado se encuentra dividido en 6 archivos bajo `hooks-spec/`.

---

## Resumen

Este documento especifica los 14 hooks custom del Student Portal ubicados en:
```
apps/frontend/src/apps/student/hooks/
```

| Categoria | Hooks | Descripcion |
|-----------|-------|-------------|
| Data Fetching | 4 | Obtienen datos del backend via API |
| State Management | 2 | Gestionan estado complejo de ejercicios |
| UI/UX | 4 | Responsive, gestos, teclado |
| Gamification | 2 | Achievements y Power-ups |
| Profile (Phase 4) | 2 | Datos de perfil y avatar |

---

## Tabla de Contenidos

| # | Archivo | Contenido |
|---|---------|-----------|
| 1 | [01-DATA-FETCHING.md](./hooks-spec/01-DATA-FETCHING.md) | Resumen + useDashboardData, useUserClassroom, useUserModules, useRecentActivities |
| 2 | [02-STATE-MANAGEMENT.md](./hooks-spec/02-STATE-MANAGEMENT.md) | useExerciseState, useExerciseAutoSave |
| 3 | [03-UI-UX.md](./hooks-spec/03-UI-UX.md) | useResponsiveLayout, useMediaQuery, useKeyboardShortcuts, useSwipeGesture/useSwipeableElement |
| 4 | [04-GAMIFICATION.md](./hooks-spec/04-GAMIFICATION.md) | useAchievementsEnhanced, useExercisePowerUps |
| 5 | [05-PROFILE.md](./hooks-spec/05-PROFILE.md) | useProfileData, useAvatarUpdate, useGamificationData (deprecated) |
| 6 | [06-RESUMEN-MATRIZ.md](./hooks-spec/06-RESUMEN-MATRIZ.md) | Resumen de exportaciones, Matriz de dependencias, Referencias |

---

**Indice:** [hooks-spec/_INDEX.md](./hooks-spec/_INDEX.md)
**Cobertura:** 14/14 hooks (100%)
**Actualizado:** 2026-02-28 (split en 6 archivos)
