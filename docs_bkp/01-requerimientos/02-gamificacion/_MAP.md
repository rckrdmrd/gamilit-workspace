# Módulo 2: Gamificación - Requerimientos

## 📋 Índice de Requerimientos Funcionales

Este módulo contiene los requerimientos funcionales del sistema de gamificación de Gamilit, diseñado para motivar y mantener comprometidos a los estudiantes mediante mecánicas de juego.

---

## 📄 Requerimientos Funcionales (RF)

### RF-GAM-001: Sistema de Logros (Achievements)
**Archivo:** [`RF-GAM-001-achievements.md`](./RF-GAM-001-achievements.md)
**Estado:** ✅ Implementado
**Prioridad:** Alta

**Descripción:** Sistema completo de achievements con 4 tipos (badge, milestone, special, rank_promotion) y 7 categorías (progress, streak, completion, social, special, mastery, exploration) que reconocen logros y motiván comportamientos positivos.

**Implementación DDL:**
- ENUM `achievement_type`: `apps/database/ddl/00-prerequisites.sql:51-54`
- ENUM `achievement_category`: `apps/database/ddl/00-prerequisites.sql:47-50`
- Tablas: `gamification_system.achievements`, `gamification_system.user_achievements`
- Funciones: `check_and_unlock_achievement()`, `award_achievement_rewards()`
- Triggers: `trg_achievement_unlocked`, `trg_check_rank_promotion`

**Especificación Técnica:** [`ET-GAM-001-achievements.md`](../../02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md)

**Backend:**
- Enums: `AchievementTypeEnum`, `AchievementCategoryEnum`
- Service: `AchievementService`
- Listeners: `AchievementListener`

**Frontend:**
- Componentes: `AchievementGallery`, `AchievementCard`, `AchievementUnlockedModal`, `AchievementProgress`

---

### RF-GAM-002: Sistema de Comodines (Power-ups)
**Archivo:** [`RF-GAM-002-comodines.md`](./RF-GAM-002-comodines.md)
**Estado:** ✅ Implementado
**Prioridad:** Alta

**Descripción:** Power-ups comprables con ML Coins que ayudan a los estudiantes en ejercicios difíciles. Tres tipos: Pistas (10 coins), Visión Lectora (15 coins), Segunda Oportunidad (20 coins).

**Implementación DDL:**
- ENUM `comodin_type`: `apps/database/ddl/00-prerequisites.sql:55-58`
- Tabla: `gamification_system.comodines_inventory`
- Funciones: `purchase_comodin()`, `use_comodin()`

**Especificación Técnica:** [`ET-GAM-002-comodines.md`](../../02-especificaciones-tecnicas/02-gamificacion/ET-GAM-002-comodines.md)

**Backend:**
- Enum: `ComodinTypeEnum`
- Service: `ComodinService`
  - `purchaseComodin(userId, type)`
  - `useComodin(userId, exerciseId, type)`
  - `getInventory(userId)`

**Frontend:**
- Componentes: `ComodinShop`, `ComodinButton`, `ComodinInventory`

**Restricciones:**
- Pistas: Máx 3 por ejercicio
- Visión Lectora: 1 por ejercicio
- Segunda Oportunidad: 1 por ejercicio

---

### RF-GAM-003: Sistema de Rangos Maya
**Archivo:** [`RF-GAM-003-rangos-maya.md`](./RF-GAM-003-rangos-maya.md)
**Estado:** ✅ Implementado
**Prioridad:** Alta

**Descripción:** Sistema de rangos progresivos inspirados en la jerarquía maya. 5 rangos que se desbloquean al alcanzar umbrales de XP.

**Implementación DDL:**
- ENUM `maya_rank`: `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`
- Valores: `Ajaw`, `Nacom`, `Ah K'in`, `Halach Uinic`, `K'uk'ulkan`
- Tabla: `gamification_system.user_stats` (columna: `current_rank`)

**Especificación Técnica:** [`ET-GAM-003-rangos-maya.md`](../../02-especificaciones-tecnicas/02-gamificacion/ET-GAM-003-rangos-maya.md)

**Umbrales de XP:**
- Ajaw: 0-999 XP (Rango inicial)
- Nacom: 1,000-4,999 XP
- Ah K'in: 5,000-19,999 XP
- Halach Uinic: 20,000-99,999 XP
- K'uk'ulkan: 100,000+ XP

**Backend:**
- Enum: `MayaRankEnum`
- Service: `RankService`

**Frontend:**
- Componentes: `RankBadge`, `RankProgressBar`, `RankPromotionModal`

---

## 🗺️ Mapa de Relaciones

```
RF-GAM-001 (Achievements)
    ├──> ET-GAM-001 (Sistema de Achievements)
    ├──> DDL: 00-prerequisites.sql:47-54 (2 ENUMs)
    ├──> Backend: AchievementService, AchievementListener
    ├──> Frontend: AchievementGallery, AchievementCard
    └──> Triggers: trg_achievement_unlocked, trg_check_rank_promotion
         ├──> RF-GAM-003 (Rank Promotion)
         └──> RF-NOT-001 (Notificación achievement_unlocked)

RF-GAM-002 (Comodines)
    ├──> ET-GAM-002 (Sistema de Comodines)
    ├──> DDL: 00-prerequisites.sql:55-58
    ├──> Backend: ComodinService
    ├──> Frontend: ComodinShop, ComodinButton
    └──> Economía: ML Coins (user_stats.ml_coins)

RF-GAM-003 (Rangos Maya)
    ├──> ET-GAM-003 (Sistema de Rangos)
    ├──> DDL: gamification_system/enums/maya_rank.sql
    ├──> Backend: RankService
    └──> Triggered by: RF-GAM-001 (XP increase)
```

---

## 🎮 Flujo de Gamificación Completo

```
Estudiante completa ejercicio
        ↓
    +XP, +ML Coins
        ↓
    ┌───────────────────────────────────┐
    │  ¿Cumple criterios achievement?   │
    └───────────┬───────────────────────┘
                ↓ Sí
    ┌───────────────────────────────────┐
    │   Desbloquear Achievement         │
    │   - Registrar en user_achievements│
    │   - Otorgar recompensas (XP, ML) │
    │   - Enviar notificación           │
    └───────────┬───────────────────────┘
                ↓
    ┌───────────────────────────────────┐
    │  ¿XP alcanzó umbral de rango?     │
    └───────────┬───────────────────────┘
                ↓ Sí
    ┌───────────────────────────────────┐
    │   Promoción de Rango              │
    │   - Achievement rank_promotion    │
    │   - Actualizar current_rank       │
    │   - Desbloquear features de rango │
    │   - Notificación rank_up          │
    └───────────────────────────────────┘
```

---

## 📊 Estadísticas

- **Total Requerimientos:** 3
- **Estado:**
  - ✅ Implementados: 3 (100%)
  - 🔄 En desarrollo: 0 (0%)
- **ENUMs Definidos:** 3
  - `achievement_type` (4 valores)
  - `achievement_category` (7 valores)
  - `comodin_type` (3 valores)
  - `maya_rank` (5 valores)
- **Tablas:**
  - `gamification_system.achievements`
  - `gamification_system.user_achievements`
  - `gamification_system.comodines_inventory`
  - `gamification_system.user_stats`
  - `gamification_system.streaks`
  - `gamification_system.missions`
  - `gamification_system.user_missions`
- **Backend Services:** 4
  - `AchievementService`
  - `ComodinService`
  - `RankService`
  - `StreakService`
- **Frontend Components:** 10+
- **Triggers:** 3
- **Notificaciones:** 3 tipos
  - `achievement_unlocked`
  - `rank_up`
  - `ml_coins_earned`

---

## 💰 Economía de ML Coins

### Fuentes de ML Coins

| Acción | ML Coins | Frecuencia |
|--------|----------|-----------|
| Completar ejercicio (easy) | 5 | Por ejercicio |
| Completar ejercicio (medium) | 10 | Por ejercicio |
| Completar ejercicio (hard) | 15 | Por ejercicio |
| Achievement milestone | 20-100 | Por achievement |
| Achievement special | 100-300 | Por achievement |
| Racha de 7 días | 50 | Semanal |
| Completar módulo | 100 | Por módulo |

### Gastos de ML Coins

| Item | Costo | Uso |
|------|-------|-----|
| Comodin: Pistas | 10 | Hasta 3 por ejercicio |
| Comodin: Visión Lectora | 15 | 1 por ejercicio |
| Comodin: Segunda Oportunidad | 20 | 1 por ejercicio |
| Cosmético: Avatar personalizado | 500 | Permanente |
| Cosmético: Badge frame | 200 | Permanente |

**Balance Diseñado:**
- Estudiante activo: ~100-150 coins por semana
- Costo promedio comodines: ~30 coins por sesión
- Superávit permite ahorrar para cosméticos

---

## 🔗 Enlaces Relacionados

### Especificaciones Técnicas
- [ET-GAM-001: Sistema de Achievements](../../02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md)
- [ET-GAM-002: Sistema de Comodines](../../02-especificaciones-tecnicas/02-gamificacion/ET-GAM-002-comodines.md)
- [ET-GAM-003: Sistema de Rangos Maya](../../02-especificaciones-tecnicas/02-gamificacion/ET-GAM-003-rangos-maya.md)

### Otros Módulos Relacionados
- [RF-NOT-001: Tipos de Notificaciones](../../06-notificaciones/RF-NOT-001-tipos-notificaciones.md) - `achievement_unlocked`, `rank_up`, `ml_coins_earned`
- [RF-PRG-001: Tracking de Progreso](../../04-progreso-seguimiento/RF-PRG-001-tracking-progreso.md) - Triggers de achievements
- [RF-SOC-001: Sistema de Aulas](../../05-caracteristicas-sociales/RF-SOC-001-aulas-virtuales.md) - Achievements sociales

### ADRs
- [ADR-007: Elección de Rangos Maya vs Niveles Numéricos](../../02-especificaciones-tecnicas/adr/ADR-007-rangos-maya.md)
- [ADR-008: Economía de ML Coins](../../02-especificaciones-tecnicas/adr/ADR-008-economia-ml-coins.md)

### Mapeo Completo
- [Mapeo: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#módulo-2-gamificación)

---

## 🎓 Teoría de Gamificación Aplicada

### Octalysis Framework (Yu-kai Chou)

El sistema de gamificación de Gamilit aplica 5 de los 8 Core Drives:

1. **Epic Meaning & Calling** (Rangos Maya)
   - Identidad cultural con jerarquía maya
   - Sentido de progreso significativo

2. **Development & Accomplishment** (Achievements)
   - Logros visuales que marcan progreso
   - Feedback constante de avance

3. **Empowerment of Creativity** (Comodines)
   - Estudiante decide cuándo usar power-ups
   - Estrategia en gestión de recursos

4. **Social Influence** (Achievements sociales)
   - Comparación con amigos
   - Colaboración en equipos

5. **Scarcity & Impatience** (ML Coins limitados)
   - Economía de recursos escasos
   - Decisiones estratégicas de gasto

---

## 📅 Historial

| Fecha | Evento | Descripción |
|-------|--------|-------------|
| 2025-11-07 | Creación | Estructura inicial del módulo de gamificación |
| 2025-11-07 | RF-GAM-001 | Sistema de achievements implementado |
| 2025-11-07 | RF-GAM-002 | Sistema de comodines implementado |
| 2025-11-07 | Documentación | Creación de mapeo y referencias |

---

## 📈 Roadmap

### Completado (✅)
- [x] Sistema de achievements (tipos y categorías)
- [x] Sistema de comodines (3 tipos)
- [x] Sistema de rangos Maya (5 rangos jerárquicos)
- [x] Economía de ML Coins
- [x] Galería de achievements
- [x] Notificaciones de desbloqueo

### En Desarrollo (🔄)
- [ ] Achievements secretos
- [ ] Leaderboards por aula

### Planificado (📅)
- [ ] Sistema de misiones diarias
- [ ] Eventos temporales especiales
- [ ] Cosméticos para avatares
- [ ] Sistema de equipos competitivos

---

**Ruta:** `docs/01-requerimientos/02-gamificacion/_MAP.md`
**Última actualización:** 2025-11-07
