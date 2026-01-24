---
id: "CORR-002-ANALISIS"
title: "Analisis Detallado - Problemas en LeaderboardPage y AchievementsPage"
type: "Analisis"
status: "Done"
priority: "P0"
assignee: "@Orquestador"
related_task: "CORR-002"
affected_modules: ["frontend", "portal-student", "gamification"]
labels: ["correccion", "frontend", "bug-critico", "leaderboard", "achievements"]
created_date: "2026-01-07"
updated_date: "2026-01-07"
---

# ANALISIS DETALLADO: CORR-002 - Problemas en LeaderboardPage y AchievementsPage

**Agente:** Orquestador (Tech Lead)
**Tipo de tarea:** Correccion | Bug Critico
**Prioridad:** P0 (Critico)
**Fecha analisis:** 2026-01-07
**Relacionado con:** Portal Student, Gamificacion, Social Features

---

## RESUMEN EJECUTIVO

Se identifico un **BUG CRITICO** en LeaderboardPage que impide la carga de datos. Adicionalmente se encontro un archivo duplicado de AchievementsPage que causa confusion en el mantenimiento.

### Problemas Identificados

| # | Severidad | Componente | Descripcion |
|---|-----------|------------|-------------|
| 1 | **CRITICO** | LeaderboardPage | NO carga datos - falta useEffect inicial |
| 2 | MEDIA | AchievementsPage | Archivo duplicado causa confusion |
| 3 | BAJA | Codigo muerto | Archivo `/apps/student/pages/AchievementsPage.tsx` no usado |

---

## CONTEXTO

### Antecedentes
El 2026-01-04 se realizaron correcciones (CORR-001) para alinear las paginas de Leaderboard y Achievements con los patrones del portal student (GamifiedHeader, estilos, layout). Esas correcciones fueron parcialmente exitosas pero NO resolvieron el problema funcional de carga de datos.

### Estado Actual de Archivos

| Archivo | Ubicacion | Estado | En Uso |
|---------|-----------|--------|--------|
| LeaderboardPage.tsx | `/apps/student/pages/` | Bug critico | SI |
| AchievementsPage.tsx | `/pages/` | Funcional | SI |
| AchievementsPage.tsx | `/apps/student/pages/` | Codigo muerto | NO |

---

## PROBLEMA 1: LEADERBOARD NO CARGA DATOS (CRITICO)

### Descripcion del Bug

La pagina de Leaderboard muestra contenido vacio porque **no existe ninguna llamada inicial para cargar los datos del backend**.

### Analisis Tecnico

**Archivo:** `/apps/frontend/src/apps/student/pages/LeaderboardPage.tsx`

**El store `leaderboardsStore` tiene:**
```typescript
// Linea 38-43
currentLeaderboard: emptyLeaderboard, // Lista vacia
selectedType: 'global',
selectedPeriod: 'all-time',
loading: true, // Inicia en loading pero nadie dispara la carga
error: null,
```

**El problema:** El store espera que alguien llame `setLeaderboardType('global')` o `refreshLeaderboard()` para iniciar la carga de datos, pero en `LeaderboardPage.tsx` **NO existe ningun `useEffect` que lo haga**.

### Busqueda en el codigo

```bash
# Buscar useEffect que cargue datos
grep -n "useEffect.*setLeaderboardType\|useEffect.*refreshLeaderboard\|useEffect.*fetch" LeaderboardPage.tsx
# Resultado: No matches found
```

### Comparacion con MissionsPage (funcional)

**MissionsPage.tsx - Linea 75-81:**
```typescript
// Auto-fetch missions on component mount
useEffect(() => {
  if (user?.id) {
    refreshMissions();
  }
}, [user?.id, refreshMissions]);
```

**LeaderboardPage.tsx:**
```typescript
// NO tiene useEffect equivalente para cargar datos
```

### Impacto

- Usuario ve pagina vacia o con datos placeholder
- Datos del leaderboard nunca se cargan del backend
- WebSocket puede actualizar pero no hay datos iniciales
- Funcionalidad de leaderboard completamente rota

### Solucion Propuesta

Agregar `useEffect` para cargar datos al montar:

```typescript
// Despues de la linea 80 en LeaderboardPage.tsx
// Auto-fetch leaderboard on component mount
useEffect(() => {
  setLeaderboardType('global');
}, [setLeaderboardType]);
```

**Lineas a modificar:** ~5 lineas

---

## PROBLEMA 2: ARCHIVO DUPLICADO DE ACHIEVEMENTSPAGE

### Descripcion

Existen **dos archivos diferentes** llamados `AchievementsPage.tsx`:

| Archivo | Ubicacion | Tamano | En Uso |
|---------|-----------|--------|--------|
| AchievementsPage.tsx | `/pages/` | 467 lineas | SI (App.tsx linea 11) |
| AchievementsPage.tsx | `/apps/student/pages/` | 567 lineas | NO |

### Comparacion de Implementaciones

| Caracteristica | `/pages/` (EN USO) | `/apps/student/pages/` (NO USADO) |
|----------------|-------------------|-----------------------------------|
| Header | GamifiedHeader | Hero Section "Sala de Trofeos" |
| Estilo fondo | Naranja (orange-50) | Purpura (purple-50) |
| Filtros | AchievementFilter component | Filtros inline custom |
| Progress Tree | NO | SI (ProgressTreeVisualizer) |
| Auth hook | useAuth (via AuthContext) | useAuthStore (directo) |
| Data hook | gamificationApi directo | useAchievements store |
| Animaciones | Basicas | Framer Motion avanzadas |
| Claim rewards | Via gamificationApi | Via claimAchievementRewards API |

### Routing en App.tsx (lineas 441-448)

```typescript
import { AchievementsPage } from '@/pages/AchievementsPage';
// ...
<Route path="/achievements" element={
  <ProtectedRoute allowedRoles={['student']}>
    <AchievementsPage />
  </ProtectedRoute>
} />
```

### Impacto

- Confusion para desarrolladores
- Codigo muerto en el repositorio
- Potencial fuente de bugs al editar el archivo incorrecto
- El archivo no usado tiene features mejores (Progress Tree) que podrian aprovecharse

### Opciones de Solucion

| Opcion | Descripcion | Pros | Contras |
|--------|-------------|------|---------|
| A | Eliminar archivo no usado | Simple, limpia codigo | Pierde features avanzadas |
| B | Migrar al archivo student | Mejor UX | Requiere mas cambios |
| C | Fusionar funcionalidades | Mejor de ambos | Mas complejo |

**Recomendacion:** Opcion A (eliminar) + documentar features a migrar en futuro

---

## PROBLEMA 3: VALIDACION DE ARCHIVOS EN USO

### AchievementsPage (`/pages/AchievementsPage.tsx`) - FUNCIONAL

**Checklist de funcionalidad:**
- [x] Usa GamifiedHeader correctamente (linea 303)
- [x] Usa useAuth via AuthContext (linea 35)
- [x] Usa useUserGamification (linea 38)
- [x] Carga achievements via useEffect (lineas 69-85)
- [x] Carga user achievements via useEffect (lineas 90-113)
- [x] Filtrado y ordenamiento funcional
- [x] Claim rewards funcional (lineas 270-290)
- [x] Bottom spacing presente (linea 461)
- [x] Fondo correcto (orange gradient, linea 302)

**Estado:** FUNCIONAL - Sin problemas criticos

### LeaderboardPage (`/apps/student/pages/LeaderboardPage.tsx`) - CON BUG

**Checklist de funcionalidad:**
- [x] Usa GamifiedHeader correctamente (lineas 166-170)
- [x] Usa useAuth (linea 50)
- [x] Usa useUserGamification (linea 53)
- [ ] **Carga datos iniciales** - FALTA
- [x] Filtros por tipo funcionan (si hay datos)
- [x] Filtros por periodo funcionan (si hay datos)
- [x] WebSocket conecta (linea 71)
- [x] Bottom spacing presente (linea 542)
- [x] Fondo correcto (linea 164)

**Estado:** BUG CRITICO - No carga datos

---

## ANALISIS DE DEPENDENCIAS

### LeaderboardPage - Dependencias

```
LeaderboardPage.tsx
├── useAuth (auth/hooks/useAuth)
├── useUserGamification (shared/hooks/useUserGamification)
├── useLeaderboards (gamification/social/hooks/useLeaderboards)
│   └── useLeaderboardsStore (Zustand store)
│       └── socialAPI.getLeaderboard() <-- NUNCA SE LLAMA AL MONTAR
├── useLeaderboardWebSocket
├── useUserClassroom
├── useDashboardData
├── GamifiedHeader
├── LeaderboardTabs
├── SeasonSelector
└── LeaderboardLayout
```

### Archivos que se modificaran

| Archivo | Tipo de cambio | Lineas estimadas |
|---------|----------------|------------------|
| `/apps/student/pages/LeaderboardPage.tsx` | Agregar useEffect | ~5 |
| `/apps/student/pages/AchievementsPage.tsx` | Eliminar (opcional) | -567 |

### Archivos dependientes (NO modificar)

| Archivo | Razon |
|---------|-------|
| leaderboardsStore.ts | Funciona correctamente |
| useLeaderboards.ts | Funciona correctamente |
| socialAPI.ts | Funciona correctamente |
| AchievementsPage.tsx (/pages/) | Funciona correctamente |

---

## PLAN DE CORRECCION

### Fase 1: Correccion Critica (P0)
**Objetivo:** Hacer que LeaderboardPage cargue datos

**Cambios:**
1. Agregar import de `useEffect` (ya existe)
2. Agregar `useEffect` para cargar leaderboard inicial

**Codigo a agregar despues de linea 80:**
```typescript
// Auto-fetch leaderboard on component mount
useEffect(() => {
  setLeaderboardType('global');
}, [setLeaderboardType]);
```

### Fase 2: Limpieza de Codigo (P2)
**Objetivo:** Eliminar archivo duplicado

**Cambios:**
1. Eliminar `/apps/student/pages/AchievementsPage.tsx`
2. Actualizar index.ts si existe exportacion

### Fase 3: Documentacion (P2)
**Objetivo:** Documentar la correccion

**Cambios:**
1. Crear CORR-002-REPORTE-EJECUCION.md
2. Actualizar trazas

---

## VALIDACION CRUZADA CON HISTORIAS DE USUARIO

### US-GAM-007 - Leaderboard simple

| Criterio de Aceptacion | Estado Actual | Despues de Fix |
|------------------------|---------------|----------------|
| CA-01: Top 10 por XP | NO (sin datos) | SI |
| CA-02: Actualizacion en tiempo real | PARCIAL (WS ok, sin datos iniciales) | SI |
| CA-03: Posicion, nombre, XP, rango | NO (sin datos) | SI |
| CA-04: Resalta usuario actual | NO (sin datos) | SI |
| CA-05: Posicion si no en top 10 | NO (sin datos) | SI |
| CA-06: Accesible desde navbar | SI | SI |
| CA-07: Responsive design | SI | SI |

**Cumplimiento actual:** 2/7 (28%)
**Cumplimiento esperado:** 7/7 (100%)

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| API no responde | Baja | Alto | El store ya maneja errores |
| Render loop por dependencias | Baja | Alto | setLeaderboardType es estable |
| Regresion en otras paginas | Muy Baja | Medio | Cambio aislado |

---

## ESTIMACIONES

**Fase 1 (Critica):**
- Tiempo: 5-10 minutos
- Complejidad: Baja

**Fase 2 (Limpieza):**
- Tiempo: 5 minutos
- Complejidad: Trivial

**Fase 3 (Documentacion):**
- Tiempo: 15 minutos
- Complejidad: Baja

**Total:** ~30 minutos

---

## DECISION DE SUBAGENTES

**Criterios:**
- Numero de archivos: 1-2 -> Simple
- Complejidad del cambio: Baja
- Lineas a modificar: ~5-10

**Decision:** NO usar subagentes - Ejecutar directamente

---

## CONCLUSIONES

### Problema Principal Identificado
**LeaderboardPage tiene un bug critico:** El componente se renderiza pero nunca dispara la carga inicial de datos del backend. El store `leaderboardsStore` espera una llamada explicita a `setLeaderboardType()` que nunca ocurre.

### Solucion Requerida
Agregar un `useEffect` que cargue el leaderboard global al montar el componente, siguiendo el mismo patron usado en otras paginas funcionales como `MissionsPage`.

### Problema Secundario
Existe un archivo duplicado de `AchievementsPage.tsx` que no se usa y deberia eliminarse para evitar confusion.

---

## APROBACION

- [x] Analisis completo
- [x] Causa raiz identificada
- [x] Solucion propuesta
- [x] Dependencias analizadas
- [x] Riesgos evaluados
- [x] **APROBADO PARA EJECUCION**

---

**Analizado por:** Orquestador (Tech Lead)
**Fecha:** 2026-01-07
**Version:** 1.0
