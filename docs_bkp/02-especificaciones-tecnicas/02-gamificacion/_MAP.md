# _MAP: docs/02-especificaciones-tecnicas/02-gamificacion/

**Última actualización:** 2025-11-07
**Propósito:** Especificaciones técnicas del sistema de gamificación (achievements, rangos, economía)
**Audiencia:** Desarrolladores Backend/Frontend, Game Designers, Product Owners
**Estado:** 🟢 Completo

---

## 📁 Contenido de esta Carpeta

### Especificaciones Técnicas

| ID | Título | Archivo | Estado | Prioridad |
|----|--------|---------|--------|-----------|
| ET-GAM-001 | Sistema de Achievements | [ET-GAM-001-achievements.md](./ET-GAM-001-achievements.md) | ✅ Implementado | Alta |
| ET-GAM-002 | Sistema de Comodines (Power-ups) | [ET-GAM-002-comodines.md](./ET-GAM-002-comodines.md) | ✅ Implementado | Alta |
| ET-GAM-003 | Sistema de Rangos Maya | [ET-GAM-003-rangos-maya.md](./ET-GAM-003-rangos-maya.md) | ✅ Implementado | Alta |

**Total especificaciones:** 3

---

## 🔗 Interdependencias

### Requerimientos Relacionados

**Implementa:**
- [RF-GAM-001: Achievements](../../01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md)
- [RF-GAM-002: Comodines](../../01-requerimientos/02-gamificacion/RF-GAM-002-comodines.md)
- [RF-GAM-003: Rangos Maya](../../01-requerimientos/02-gamificacion/RF-GAM-003-rangos-maya.md)

### Módulos Relacionados

**Usado por:**
- [Progreso Seguimiento](../04-progreso-seguimiento/) - XP otorgado por progreso
- [Contenido Educativo](../03-contenido-educativo/) - Recompensas por ejercicios
- Portal de Estudiantes - Visualización de gamificación

### Documentación Relacionada

**Desarrollo:**
- Backend: `apps/backend/src/modules/gamification/`
- Frontend: `apps/frontend/src/features/gamification/`

**Database:**
- Schema: `gamification_system` → `apps/database/ddl/schemas/gamification_system/`

**Tipos Compartidos:**
- [TYPES-GAMIFICATION.md](../tipos-compartidos/TYPES-GAMIFICATION.md)

---

## 📊 Métricas

- **Total documentos:** 3
- **ETs completas:** 3/3 (100%)
- **Cobertura implementación:** 100% (3 de 3 RFs implementados)

---

## 🎯 Especificaciones Clave

### ET-GAM-001: Sistema de Achievements ⭐⭐⭐⭐⭐

**Calidad:** Excelente - Referencias completas en RF-GAM-001

**Cubre:**
- Tipos: `badge`, `milestone`, `special`, `rank_promotion`
- Categorías: `progress`, `streak`, `completion`, `social`, `special`, `mastery`, `exploration`
- Algoritmo de desbloqueo
- Sistema de recompensas (XP, ML Coins)
- Notificaciones de unlock

**Implementación:**
- ENUMs: `apps/database/ddl/00-prerequisites.sql:47-54`
- Tablas: `gamification_system.achievements`, `gamification_system.user_achievements`
- Service: `apps/backend/src/modules/gamification/services/achievement.service.ts`
- Componentes: `apps/frontend/src/components/gamification/AchievementGallery.tsx`

### ET-GAM-002: Sistema de Comodines (Power-ups) ⭐⭐⭐⭐⭐

**Calidad:** Excelente - Referencias completas en RF-GAM-002

**Cubre:**
- 3 tipos de comodines: Pistas (10 ML Coins), Visión Lectora (15 ML Coins), Segunda Oportunidad (20 ML Coins)
- Sistema de compra transaccional con ML Coins
- Inventario de comodines por usuario
- Uso de comodines en ejercicios
- Restricciones por tipo de ejercicio
- Límites de uso por ejercicio

**Implementación:**
- ENUM: `apps/database/ddl/00-prerequisites.sql:55-58` (`comodin_type`)
- Tabla: `gamification_system.comodines_inventory`
- Functions: `purchase_comodin()`, `use_comodin()`, `get_comodin_inventory()`
- Service: `apps/backend/src/modules/gamification/services/comodin.service.ts`
- Componentes: `apps/frontend/src/components/gamification/ComodinShop.tsx`

### ET-GAM-003: Sistema de Rangos Maya ⭐⭐⭐⭐⭐

**Calidad:** Excelente - Referencias completas en RF-GAM-003

**Cubre:**
- 5 rangos jerárquicos: Ajaw (0-999 XP) → Nacom (1K-4.9K) → Ah K'in (5K-19.9K) → Halach Uinic (20K-99.9K) → K'uk'ulkan (100K+)
- Promoción automática mediante triggers PostgreSQL
- Historial inmutable de promociones (`rank_history`)
- Multiplicadores de XP por rango (1.0x a 1.20x)
- Desbloqueo progresivo de contenido y funcionalidades
- Integración con achievements (achievement `rank_promotion`)
- Notificaciones en tiempo real de promoción

**Implementación:**
- ENUM: `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql:1-8` (`maya_rank`)
- Tablas: `user_stats` (current_rank), `rank_history` (historial)
- Functions: `check_rank_promotion()`, `promote_to_next_rank()`, `get_rank_benefits()`, `get_rank_multiplier()`
- Trigger: `trg_check_rank_promotion_on_xp_gain` (automático en UPDATE de total_xp)
- Service: `apps/backend/src/modules/gamification/services/rank.service.ts`
- Componentes: `RankBadge.tsx`, `RankProgressBar.tsx`, `RankPromotionModal.tsx`, `RankHistoryTimeline.tsx`

---

## 🚀 Próximos Pasos

### Módulo Completo ✅
Todas las especificaciones técnicas del módulo de gamificación están completas (3/3).

### Planeado (Futuras Extensiones)
- [ ] ET-GAM-004: Sistema de Misiones (Quests)
- [ ] ET-GAM-005: Leaderboards (Tablas de Clasificación)
- [ ] ET-GAM-006: Sistema de Rachas Avanzado (Streaks)
- [ ] ET-GAM-007: Eventos Temporales (Seasonal Events)

---

## 🎮 Balance de Economía

### Tasas de Ganancia de ML Coins

**Por ejercicios:**
- Ejercicio fácil completado: 10 ML Coins
- Ejercicio medio completado: 20 ML Coins
- Ejercicio difícil completado: 30 ML Coins
- Bonus por primera vez: +50%
- Bonus por perfect score: +25%

**Por achievements:**
- Badge común: 50 ML Coins
- Milestone: 100 ML Coins
- Special: 200 ML Coins
- Rank promotion: 500 ML Coins

**Por rachas:**
- 7 días consecutivos: 100 ML Coins
- 30 días consecutivos: 500 ML Coins
- 90 días consecutivos: 2000 ML Coins

### Precios de Power-ups

- **Pista (hint):** 50 ML Coins
- **Visión Lectora:** 100 ML Coins
- **Segunda Oportunidad:** 150 ML Coins

---

## 📚 Guía de Navegación

**Si buscas...**
- **Achievements:** Ver [ET-GAM-001-achievements.md](./ET-GAM-001-achievements.md)
- **Comodines (Power-ups):** Ver [ET-GAM-002-comodines.md](./ET-GAM-002-comodines.md)
- **Rangos Maya:** Ver [ET-GAM-003-rangos-maya.md](./ET-GAM-003-rangos-maya.md)
- **Tipos compartidos:** Ver [TYPES-GAMIFICATION.md](../tipos-compartidos/TYPES-GAMIFICATION.md)
- **Implementación backend:** Ver `apps/backend/src/modules/gamification/`
- **Implementación frontend:** Ver `apps/frontend/src/components/gamification/`
- **Database schema:** Ver `apps/database/ddl/schemas/gamification_system/`
