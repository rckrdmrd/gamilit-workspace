# DEAD-FEATURES-VALIDATED - Resultado de Validacion Sprint 0

**Task:** TASK-2026-02-06-ANALISIS-INTEGRAL-DOCUMENTACION
**Subtarea:** S0-01 | **Fecha:** 2026-02-06

---

## Resumen Ejecutivo

TASK-2026-02-05 clasifico 4 features como "DEAD". La validacion en codigo real revela que **NINGUNA es completamente dead**. Todas tienen infraestructura activa (DDL + entities). La clasificacion correcta es **PARTIAL** para las 4.

| Feature | Clasificacion Original | Clasificacion Corregida | DDL | Entity | Service | Controller | Frontend |
|---------|----------------------|------------------------|-----|--------|---------|------------|----------|
| boosts | DEAD | **PARTIAL (dormant)** | 100% | 100% | 0% | 0% | 40% mock |
| forum | DEAD | **PARTIAL (orphaned)** | 100% | 100% (no reg) | 0% | 0% | 0% |
| social_interactions | DEAD | **PARTIAL (45-50%)** | 100% | 100% (no reg) | 0% | 0% | 50% |
| team_vs_team | DEAD | **PARTIAL (infra-only)** | 100% | 100% (no reg) | 0% | 0% | 0% |

**Causa raiz de la misclasificacion:** Criterio demasiado agresivo en TASK-2026-02-05: "DDL + Entity sin service/controller = DEAD". Esto ignora infraestructura activa, integraciones cruzadas, y tipos frontend.

---

## 1. BOOSTS - PARTIAL (Dormant/Zombie)

### Estado por Capa
- **DDL:** `gamification_system.active_boosts` - 11 columnas, 5 indexes, CHECK constraints
- **Function:** `apply_xp_boost()` - STABLE, calcula multiplicadores
- **Seeds:** 2 items en shop ("Boost XP 2x 24h", "Boost Coins 1.5x 12h")
- **Entity:** `ActiveBoost` - 84 lineas, registrada en GamificationModule, exportada
- **Service:** NO existe (ComodinesService menciona boosts pero no los crea)
- **Controller:** NO existe
- **Frontend:** Tipos PowerUpEffect incluyen 'boost', InventoryPage tiene placeholder

### Hallazgo Clave
ComodinesService (linea 265): "No crea boost temporal - los comodines se usan inmediatamente en el frontend". **Hubo un pivot de diseno:** boosts temporales → comodines instantaneos. La tabla `active_boosts` quedo huerfana.

### Recomendacion
**DEFER** - Mantener infraestructura, documentar como "feature dormant, awaiting Phase 2 activation". No purgar DDL/entity.

---

## 2. FORUM - PARTIAL (Orphaned Infrastructure)

### Estado por Capa
- **DDL:** `social_features.discussion_threads` + `social_features.social_interactions` - tablas completas
- **Entities:** `DiscussionThread` (260 lineas) + `SocialInteraction` (68 lineas) - exportadas pero **NO registradas en TypeORM module**
- **DTOs:** 3 DTOs para discussion_threads existen
- **Permissions:** `can_use_forum` implementado en UpdateStudentPermissionsDto
- **Service:** NO existe
- **Controller:** NO existe
- **Frontend:** 0 componentes, 0 paginas

### Hallazgo Clave
La table `discussion_threads` es para discusiones en aula/equipo, NO un foro general. Las entidades estan al 90% pero no fueron registradas en el modulo NestJS.

### Recomendacion
**DEFER** - Mantener entidades y DDL. Registrar en modulo cuando se active feature de discusiones. Documentar como "Phase 2 - Classroom Discussions".

---

## 3. SOCIAL_INTERACTIONS - PARTIAL (45-50% Complete, Alta Prioridad)

### Estado por Capa
- **DDL:** `social_features.social_interactions` - 8 columnas, 5 indexes, RLS (2 policies)
- **Entity:** `SocialInteraction` - 67 lineas, exportada, **NO registrada en module**
- **Constants:** `DB_TABLES.SOCIAL.SOCIAL_INTERACTIONS` registrado (linea 171)
- **Service:** NO existe (13 services sociales existen, este falta)
- **Controller:** NO existe
- **Frontend Types:** `SocialInteractionType` (28 lineas, 7 valores) - exportado, usado en 9 archivos
- **Frontend UI:** `RecentActivityPanel.tsx` referencia social_interaction (lineas 22, 69, 92)
- **Integracion:** `engagement_metrics.social_interactions` columna ACTIVA - cuenta interacciones diarias

### Hallazgo Clave
A diferencia de las otras features, social_interactions tiene **integracion cruzada activa** con engagement_metrics y **UI que la referencia**. Es la feature mas cercana a estar completa.

### Recomendacion
**PRIORITIZE** - Completar feature (estimado 2-3h: registrar entity en module, crear service basico, crear controller). Alta prioridad por integracion existente con EXT-004.

---

## 4. TEAM_VS_TEAM - PARTIAL (Infrastructure Only, 60%)

### Estado por Capa
- **DDL:** `social_features.team_vs_team_challenges` - **37+ columnas** (production-grade), 14 indexes, 4 FKs, 4 RLS policies
- **Entity:** `TeamVsTeamChallenge` - 225 lineas, **NO registrada en module**
- **Constants:** Registrado en database.constants.ts (linea 183)
- **Service:** NO existe
- **Controller:** NO existe
- **Frontend:** 0 (ni tipos)
- **NOTA:** Es DIFERENTE de `team_challenges` (simple, 6 cols, COMPLETAMENTE implementado)

### Hallazgo Clave
DDL es el mas completo de las 4 features (37+ columnas con scoring methods, lifecycle states, rewards JSONB). Creado en 2026-02-03 durante H-039 remediation. Infraestructura solida pero sin logica de negocio.

### Recomendacion
**DEFER** - Mantener infraestructura. Completar cuando roadmap competitivo se confirme. Estimado: 6-8h API-ready, 18-25h full feature.

---

## Tabla de Decision Final

| Feature | Accion | Justificacion | Esfuerzo si se activa |
|---------|--------|---------------|----------------------|
| boosts | **DEFER** | Pivot a comodines instantaneos | 8-12h |
| forum | **DEFER** | Infraestructura lista para discusiones Phase 2 | 16-24h |
| social_interactions | **PRIORITIZE** | 50% complete, integracion cruzada activa | 2-3h |
| team_vs_team | **DEFER** | Infraestructura production-grade, awaiting roadmap | 18-25h |

---

## Impacto en Sprint 4 (Purga)

**CAMBIO CRITICO:** Sprint 4 NO debe purgar refs a estas features. En su lugar:
1. Actualizar docs para clasificar como "PARTIAL/DEFERRED" en vez de "DEAD"
2. Agregar notas en cada doc referenciado: "Feature parcialmente implementada, ver DEAD-FEATURES-VALIDATED.md"
3. NO eliminar DDL, entities, ni tipos frontend
4. social_interactions: considerar completar en Sprint paralelo (Quick Win 2-3h)
