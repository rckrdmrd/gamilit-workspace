---
id: "CORR-001-PLAN"
title: "Plan de Ejecución - Corrección Páginas Leaderboard y Achievements"
type: "Plan"
status: "Done"
priority: "P1"
assignee: "@Frontend-Agent"
related_task: "CORR-001"
affected_modules: ["frontend", "portal-student"]
labels: ["corrección", "frontend", "plan"]
created_date: "2026-01-04"
updated_date: "2026-01-04"
---

# PLAN DE EJECUCIÓN: CORR-001 - Corrección Páginas Leaderboard y Achievements

**Agente:** Frontend-Agent
**Tipo de tarea:** Corrección
**Prioridad:** P1
**Fecha creación:** 2026-01-04
**Relacionado con:** CORR-001-ANALISIS

---

## OBJETIVO

Alinear LeaderboardPage y AchievementsPage con los patrones establecidos en DashboardComplete y MissionsPage.

**Criterios de Aceptación:**
- [x] Ambas páginas usan GamifiedHeader
- [x] Fondo consistente: `bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100`
- [x] Layout container: `mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8`
- [x] Usan `useAuth()` y `useUserGamification()` hooks
- [x] Bottom spacing presente
- [x] Build compila sin errores

---

## CICLOS DE EJECUCIÓN

### Ciclo 1: Corrección LeaderboardPage.tsx

**Objetivo:** Alinear LeaderboardPage con el patrón establecido

**Tareas:**
1. Agregar imports necesarios:
   - `GamifiedHeader` de `@shared/components/layout/GamifiedHeader`
   - `useAuth` de `@/features/auth/hooks/useAuth`
   - `useUserGamification` de `@shared/hooks/useUserGamification`

2. Modificar componente:
   - Cambiar `useAuthStore()` por `useAuth()`
   - Agregar `useUserGamification(user?.id)`
   - Cambiar fondo de `bg-gray-50 dark:bg-gray-900` a `bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100`
   - Reemplazar header sticky propio por `GamifiedHeader`
   - Ajustar layout container
   - Agregar bottom spacing

**Artefactos modificados:**
- `/apps/student/pages/LeaderboardPage.tsx`

**Validación:**
```bash
cd apps/frontend && npm run build
```

---

### Ciclo 2: Corrección AchievementsPage.tsx

**Objetivo:** Completar alineación de AchievementsPage

**Tareas:**
1. Agregar import de `useUserGamification`
2. Agregar hook call `useUserGamification(user?.id)`
3. Pasar `gamificationData` al `GamifiedHeader`
4. Agregar bottom spacing

**Artefactos modificados:**
- `/pages/AchievementsPage.tsx`

**Validación:**
```bash
cd apps/frontend && npm run build
```

---

### Ciclo 3: Validación Final

**Objetivo:** Verificar que todo funciona correctamente

**Validaciones:**
```bash
# Frontend build
cd apps/frontend && npm run build
# Debe compilar sin errores

# Lint (opcional)
npm run lint
```

**Checklist de Validación:**
- [ ] LeaderboardPage muestra GamifiedHeader
- [ ] AchievementsPage muestra ML Coins en header
- [ ] Fondo naranja consistente en ambas páginas
- [ ] Build compila sin errores
- [ ] Sin errores de TypeScript

---

## CRITERIOS DE ÉXITO

La tarea se considera **COMPLETADA** cuando:

- [x] LeaderboardPage usa GamifiedHeader
- [x] LeaderboardPage tiene fondo correcto
- [x] AchievementsPage pasa gamificationData al header
- [x] Ambas páginas tienen bottom spacing
- [x] Build compila sin errores
- [x] Documentación actualizada

---

**Versión:** 1.0
**Última actualización:** 2026-01-04
**Aprobado para ejecución:** Sí
