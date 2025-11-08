# Feature: Gamificación (Gamification)

**Proyecto:** GAMILIT Platform
**Feature:** Gamification System
**Versión:** 2.0
**Fecha:** 2025-11-07
**Ubicación:** `apps/frontend/src/features/gamification/`

---

## 📋 Índice de Documentación

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [GAMIF-Economy.md](./GAMIF-Economy.md) | Economía ML Coins y transacciones | ✅ |
| [GAMIF-Ranks.md](./GAMIF-Ranks.md) | Sistema de Rangos Maya | ✅ |
| [GAMIF-Social.md](./GAMIF-Social.md) | Achievements, Leaderboards, PowerUps | ✅ |
| [GAMIF-Missions.md](./GAMIF-Missions.md) | Misiones diarias/semanales | ✅ |

---

## 🎯 Propósito

Sistema completo de gamificación que implementa un **modelo educativo culturalmente relevante** basado en:
- **5 Rangos Maya** progresivos con significado histórico
- **Economía ML Coins** cerrada (no pay-to-win)
- **Achievements** (50+ logros) en 7 categorías
- **PowerUps** estratégicos (3 tipos)
- **Misiones** diarias/semanales/especiales
- **Leaderboards** por contexto (aula, escuela, global, semanal)
- **Streaks** para consistencia diaria
- **Sistema Social** (amigos, guilds, competencia sana)

**Estado Global:** 78% completo - MVP funcional con correcciones menores

---

## 📚 Referencias a Documentación Base

### Requerimientos
- **Sistema de Gamificación:** [`docs/01-requerimientos/gamificacion/README.md`](../../../../01-requerimientos/gamificacion/README.md)
  - 5 documentos modulares (Rangos, Economía, Achievements, Sistemas Complementarios, Roadmap)

- **Rangos Maya:** [`docs/01-requerimientos/gamificacion/01-RANGOS-MAYA.md`](../../../../01-requerimientos/gamificacion/01-RANGOS-MAYA.md)
  - 5 rangos: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan
  - Multiplicadores, bonificaciones, progresión

- **Economía ML Coins:** [`docs/01-requerimientos/gamificacion/02-ECONOMIA-ML-COINS.md`](../../../../01-requerimientos/gamificacion/02-ECONOMIA-ML-COINS.md)
  - Formas de ganar/gastar, transacciones, balance económico

- **Achievements:** [`docs/01-requerimientos/gamificacion/03-ACHIEVEMENTS.md`](../../../../01-requerimientos/gamificacion/03-ACHIEVEMENTS.md)
  - 50+ achievements en 7 categorías, sistema de rareza

- **Sistemas Complementarios:** [`docs/01-requerimientos/gamificacion/04-SISTEMAS-COMPLEMENTARIOS.md`](../../../../01-requerimientos/gamificacion/04-SISTEMAS-COMPLEMENTARIOS.md)
  - Streaks, Power-ups, Misiones, Leaderboards, Notificaciones

### Especificaciones Técnicas
- **ADR-004:** [`docs/02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md`](../../../../02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md)
  - Decisiones de diseño del sistema completo
  - Principios: Learning-First, Fair Progression, Cultural Relevance

- **Tipos Compartidos:** [`docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md)
  - MayaRank, UserStats, Achievement, MLCoinsTransaction, PowerupInventory

- **API Reference:** [`docs/02-especificaciones-tecnicas/apis/GAMIFICATION-API.md`](../../../../02-especificaciones-tecnicas/apis/GAMIFICATION-API.md)
  - 43 endpoints de gamificación

- **Trazabilidad:** [`docs/02-especificaciones-tecnicas/trazabilidad/04-gamification-progression.md`](../../../../02-especificaciones-tecnicas/trazabilidad/04-gamification-progression.md)
  - Flujo completo Frontend → Backend → Database

### Casos de Uso
- **UC-STU-003:** [`docs/01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md`](../../../../01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md)
  - Ganancia de XP y ML Coins al resolver ejercicios

---

## 🏗️ Arquitectura del Feature

### Estructura de Archivos

```
apps/frontend/src/features/gamification/
├── api/                    # API clients compartidos
│   └── gamificationAPI.ts
├── components/             # Componentes compartidos
│   └── GamificationBadge.tsx
├── economy/               # 💰 ML Coins Economy
│   ├── api/
│   │   └── coinsAPI.ts
│   ├── components/
│   │   ├── CoinsBalance.tsx
│   │   ├── CoinsHistory.tsx
│   │   └── TransactionsList.tsx
│   ├── hooks/
│   │   └── useCoins.ts
│   ├── store/
│   │   └── coinsStore.ts
│   ├── types/
│   │   └── coinsTypes.ts
│   └── schemas/
│       └── coinsSchemas.ts
├── ranks/                 # 🏆 Maya Ranks System
│   ├── api/
│   │   └── ranksAPI.ts
│   ├── components/
│   │   ├── RankBadge.tsx
│   │   ├── RankProgress.tsx
│   │   └── RankPromotion.tsx
│   ├── hooks/
│   │   └── useRanks.ts
│   ├── store/
│   │   └── ranksStore.ts
│   ├── types/
│   │   └── ranksTypes.ts
│   └── mockData/
│       └── ranksMockData.ts
├── social/                # 👥 Social Features
│   ├── components/
│   │   ├── Achievements/
│   │   │   ├── AchievementCard.tsx
│   │   │   ├── AchievementGrid.tsx
│   │   │   └── AchievementNotification.tsx
│   │   ├── Leaderboards/
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── LeaderboardEntry.tsx
│   │   │   └── LeaderboardFilters.tsx
│   │   ├── PowerUps/
│   │   │   ├── PowerUpCard.tsx
│   │   │   ├── PowerUpShop.tsx
│   │   │   └── PowerUpInventory.tsx
│   │   ├── Friends/
│   │   │   ├── FriendsList.tsx
│   │   │   └── AddFriend.tsx
│   │   └── Guilds/
│   │       ├── GuildCard.tsx
│   │       └── GuildLeaderboard.tsx
│   ├── api/
│   │   ├── achievementsAPI.ts
│   │   ├── leaderboardsAPI.ts
│   │   └── powerupsAPI.ts
│   ├── store/
│   │   ├── achievementsStore.ts
│   │   ├── leaderboardsStore.ts
│   │   └── powerupsStore.ts
│   ├── hooks/
│   │   ├── useAchievements.ts
│   │   ├── useLeaderboard.ts
│   │   └── usePowerUps.ts
│   └── types/
│       ├── achievementsTypes.ts
│       └── leaderboardTypes.ts
├── missions/              # 📋 Daily/Weekly Missions
│   ├── components/
│   │   ├── MissionCard.tsx
│   │   ├── MissionsList.tsx
│   │   └── MissionProgress.tsx
│   ├── types/
│   │   └── missionsTypes.ts
│   └── hooks/
│       └── useMissions.ts
├── leaderboard/           # 🏅 General Leaderboard
│   └── components/
│       └── LeaderboardWidget.tsx
└── index.ts               # Public exports
```

**Total:** ~132 archivos TypeScript

---

## 🔑 Componentes Clave

### 1. Economy (ML Coins)

**Moneda Virtual:** ML Coins (🪙)

**Funcionalidades:**
- Ganar ML Coins por ejercicios completados
- Sistema de multiplicadores (rank, streak, perfect, speed)
- Transacciones registradas en historial
- Balance en tiempo real
- Límites diarios (anti-inflación)

**Ver:** [GAMIF-Economy.md](./GAMIF-Economy.md)

---

### 2. Ranks (Rangos Maya)

**5 Rangos Progresivos:**

| Rango | Nivel | Multiplicador | ML Coins Bonus | Módulos Requeridos |
|-------|-------|---------------|----------------|--------------------|
| **Ajaw** | 1 | 1.0x | 50 | 1 |
| **Nacom** | 2 | 1.25x | 75 | 2 |
| **Ah K'in** | 3 | 1.5x | 100 | 3 |
| **Halach Uinic** | 4 | 1.75x | 125 | 4 |
| **K'uk'ulkan** | 5 | 2.0x | 150 | 5 |

**Funcionalidades:**
- Promoción automática al cumplir requisitos
- Barra de progreso visual
- Insignias y badges
- Multiplicadores permanentes
- Integración cultural (lecciones históricas)

**Ver:** [GAMIF-Ranks.md](./GAMIF-Ranks.md)

---

### 3. Social Features

#### 3.1 Achievements (Logros)

**50+ Achievements** en 7 categorías:
- **Progress:** Completar ejercicios/módulos
- **Mastery:** Excelencia académica (perfect scores, speedruns)
- **Social:** Interacción con compañeros
- **Streak:** Consistencia diaria
- **Special:** Logros ocultos y eventos
- **Exploration:** Descubrir contenido opcional
- **Completion:** Completar colecciones

**Raridades:** Common, Uncommon, Rare, Epic, Legendary

#### 3.2 Leaderboards (Tablas de Clasificación)

**4 Tipos:**
- **Global:** Todos los estudiantes de la plataforma
- **School:** Estudiantes de la misma escuela
- **Classroom:** Estudiantes del mismo salón
- **Weekly:** Ranking semanal (reset cada lunes)

**Criterios:** Total XP, ML Coins, Ejercicios completados, Streaks

#### 3.3 PowerUps (Comodines)

**3 Tipos:**
1. **Pistas (Hints)** - 15 ML
   - Revela ayuda sobre el ejercicio
   - Máximo 3 por ejercicio
   - Penalización: -10% XP/Coins

2. **Visión Lectora** - 25 ML
   - Resalta palabras clave
   - 1 uso por ejercicio
   - Penalización: -5% XP

3. **Segunda Oportunidad** - 40 ML
   - Reintentar sin penalización en historial
   - Solo si primer intento <80%
   - Penalización: -15% XP/Coins

**Ver:** [GAMIF-Social.md](./GAMIF-Social.md)

---

### 4. Missions (Misiones)

**3 Tipos:**
- **Daily:** Misiones diarias (reset a medianoche)
- **Weekly:** Misiones semanales (reset lunes)
- **Special:** Eventos temporales

**Ejemplos:**
- "Completa 5 ejercicios hoy" → 50 ML + 25 XP
- "Obtén 3 puntuaciones perfectas esta semana" → 100 ML + 50 XP
- "Ayuda a 2 compañeros" → 75 ML + 30 XP

**Ver:** [GAMIF-Missions.md](./GAMIF-Missions.md)

---

## 🔄 Flujos Principales

### 1. Completar Ejercicio → Ganancia de Recompensas

```
Usuario completa ejercicio
  ↓
Sistema calcula puntuación
  ↓
Obtiene stats del usuario (rank, streak)
  ↓
Aplica multiplicadores:
  - Difficulty (1.0x - 2.5x)
  - Rank (1.0x - 2.0x)
  - Streak (1.0x - 1.3x)
  ↓
Calcula bonuses:
  - Perfect score (+1.5x)
  - Speed bonus (+1.1x)
  - No hints (+1.2x)
  ↓
Otorga recompensas:
  - XP calculated
  - ML Coins calculated
  ↓
Actualiza user_stats:
  - total_xp += xp
  - ml_coins += coins
  - exercises_completed += 1
  ↓
Crea transacción ML Coins
  ↓
Verifica achievements
  ↓
Verifica promoción de rango
  ↓
Muestra animaciones y notificaciones
```

**Referencia:** [`04-gamification-progression.md`](../../../../02-especificaciones-tecnicas/trazabilidad/04-gamification-progression.md)

---

### 2. Promoción de Rango

```
Sistema verifica requisitos:
  - XP mínimo ✓
  - Módulos completados ✓
  - Puntuación promedio ≥70% ✓
  ↓
Si cumple todos:
  - Update current_rank
  - Otorga ML Coins bonus
  - Activa nuevo multiplier
  - Desbloquea contenido
  - Muestra animación de promoción
  - Lección histórica Maya
```

---

### 3. Uso de PowerUp

```
Usuario selecciona PowerUp
  ↓
Verifica ML Coins suficientes
  ↓
Descuenta costo de balance
  ↓
Crea transacción "spent_powerup"
  ↓
Activa efecto del PowerUp:
  - Pista: Muestra hint
  - Visión: Resalta keywords
  - Segunda Op: Reset ejercicio
  ↓
Aplica penalización a recompensa final
```

---

## 🧪 Testing

### Cobertura

| Subsistema | Tests | Cobertura |
|------------|-------|-----------|
| **Economy** | 25 | 85% |
| **Ranks** | 18 | 82% |
| **Social** | 35 | 78% |
| **Missions** | 15 | 75% |
| **TOTAL** | 93 | 80% |

### Estrategia

- **Unit tests:** Vitest para stores, hooks, utils
- **Integration tests:** MSW para APIs
- **E2E tests:** Playwright para flujos completos
- **Visual tests:** Storybook para componentes

---

## 🔗 Integraciones

### Backend

- **Módulo:** `apps/backend/src/modules/gamification/`
- **Endpoints:** 43 endpoints
- **Servicios:** coins, ranks, achievements, powerups, leaderboard, missions

**Referencias:**
- Backend: [`docs/03-desarrollo/backend/api/API-Gamification.md`](../../../backend/api/API-Gamification.md)

### Base de Datos

- **Schema:** `gamification_system`
- **Tablas:** 8 principales
  - `user_stats` (tabla central)
  - `user_ranks`
  - `ml_coins_transactions`
  - `achievements`
  - `user_achievements`
  - `powerups_inventory`
  - `missions`
  - `leaderboards`

**Referencias:**
- Database: Esquemas en `apps/database/ddl/schemas/gamification_system/`

### Otros Features

- **Progress:** XP ganado por ejercicios completados
- **Auth:** user_id para asociar stats
- **Content:** Desbloqueo de módulos por rango

---

## 📊 Métricas

### Engagement (Objetivos)

| Métrica | Baseline | Target 3M | Target 6M |
|---------|----------|-----------|-----------|
| **DAU** | 40% | 60% | 70% |
| **Ejercicios/usuario/semana** | 8 | 12 | 15 |
| **Retention Day 7** | 45% | 65% | 75% |
| **Average streak** | 3 días | 5 días | 7 días |

### Economía (Salud)

| Métrica | Target | Frecuencia |
|---------|--------|------------|
| **Inflación mensual** | 2-4% | Mensual |
| **Velocity** | 0.8-1.2 | Semanal |
| **Gini coefficient** | <0.45 | Mensual |
| **% usuarios con balance >0** | >85% | Semanal |

### Progresión (Objetivos)

- **60%** usuarios alcanzan Ah K'in (rango 3) en 1 mes
- **30%** usuarios alcanzan Halach Uinic (rango 4) en 3 meses
- **10%** usuarios alcanzan K'uk'ulkan (rango 5) en 6 meses

**Referencia:** [`05-ROADMAP-METRICAS.md`](../../../../01-requerimientos/gamificacion/05-ROADMAP-METRICAS.md)

---

## 🚀 Roadmap

### ✅ Completo (78%)

- [x] Sistema de rangos Maya (100%)
- [x] Economía ML Coins (100%)
- [x] Multiplicadores y bonificaciones
- [x] PowerUps (Pistas, Visión, Segunda Op)
- [x] Leaderboards (90%)
- [x] Misiones básicas (70%)
- [x] Streaks (90%)

### 🚧 En Progreso

- [ ] Achievements auto-detection (actualmente solo 2 hardcoded)
- [ ] Rate limiting de ML Coins
- [ ] Optimización de leaderboards con Redis cache
- [ ] Misiones auto-progresivas

### 📋 Backlog

- [ ] OAuth integration para social features
- [ ] Guilds/Clans (grupos colaborativos)
- [ ] Misiones narrativas (storytelling)
- [ ] Eventos temporales escolares
- [ ] Sistema de mentores
- [ ] Personalización avanzada de avatares

**Referencia:** [`05-ROADMAP-METRICAS.md`](../../../../01-requerimientos/gamificacion/05-ROADMAP-METRICAS.md#4-roadmap-de-correcciones)

---

## 🐛 Bugs Conocidos

### P0 - Crítico

- **Achievements:** Auto-detection no funciona (solo 2 hardcoded) - ❌ Pendiente
  - **Workaround:** Achievements "Primera Victoria" y "Estudiante Dedicado" funcionan
  - **Fix estimado:** Sprint 0 (2 semanas)

### P1 - Importante

- **ML Coins:** Rate limiting no implementado - ❌ Pendiente
  - **Riesgo:** Usuarios pueden ganar >500 ML/día (límite teórico)
  - **Fix estimado:** Sprint 3 (1 semana)

- **Streaks:** Verificar CRON jobs activos - ⚠️ Pendiente verificación
  - **Impacto:** Streaks pueden no resetear correctamente

### P2 - Mejoras

- **Misiones:** No auto-progresan - ⚠️ Funciona manual
  - **Workaround:** Usuarios deben refrescar para ver progreso

- **Leaderboards:** Redis cache para optimización - ❌ Pendiente
  - **Impacto:** Queries lentos con >1,000 usuarios

**Tracking:** Issues en repositorio con labels `P0`, `P1`, `P2`

---

## 📝 Principios de Diseño

### 1. Learning-First (Aprendizaje Primero)

Todas las mecánicas refuerzan el aprendizaje, no distraen.

**Implementación:**
- XP y ML Coins solo por actividades educativas
- PowerUps ayudan, no regalan respuestas
- Achievements alineados con curriculum

### 2. Cultural Relevance (Relevancia Cultural)

Integración de elementos culturales mexicanos con valor pedagógico.

**Implementación:**
- Rangos basados en jerarquía Maya auténtica
- Lecciones históricas al promocionar
- Iconografía revisada por historiadores

### 3. Fair Progression (Progresión Justa)

No pay-to-win. Basado en esfuerzo educativo.

**Implementación:**
- ML Coins NO se compran con dinero real
- Límites diarios de ganancias
- Leaderboards por contexto (aula, no solo global)

### 4. Social Engagement (Interacción Social Positiva)

Fomentar colaboración y competencia sana.

**Implementación:**
- Sistema de amigos
- Leaderboards de aula
- Opción de ocultar posición (anti-presión)

### 5. Teacher Visibility (Visibilidad para Maestros)

Maestros pueden monitorear y ajustar.

**Implementación:**
- Dashboard de maestro con progreso de estudiantes
- Control de PowerUps
- Reportes de estudiantes en riesgo

**Referencia:** [`ADR-004`](../../../../02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md#principios-de-diseño)

---

## 💡 Notas de Implementación

### Decisiones Técnicas

1. **Zustand para cada subsistema:** Mejor modularidad que store único
2. **MSW para testing:** Mock endpoints de gamificación
3. **Transacciones atómicas:** Balance siempre consistente
4. **Optimistic UI:** Actualizar balance antes de confirmación backend

### Lecciones Aprendidas

1. Balanceo económico requiere tuning continuo (mensual)
2. Multiplicadores deben ser cuidadosamente probados (riesgo de inflación)
3. Achievements auto-detection es más complejo que hardcoded
4. Leaderboards en tiempo real requieren caché (Redis)

---

**Mantenedores:** @frontend-team, @gamification-owner
**Última actualización:** 2025-11-07
**Próxima revisión:** Mensual
