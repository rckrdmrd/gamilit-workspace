# US-GAM-GAM-01: Sistema XP, Rangos Maya y Logros

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-BACKEND, EPIC-GAM-FRONTEND
**Modulo(s):** gamification, achievements
**Story Points:** 13
**Prioridad:** P0
**Sprint:** Completado

## Descripcion
**Como** estudiante de K-12
**Quiero** ganar puntos de experiencia, subir de rango en la jerarquia maya y desbloquear logros
**Para** sentir progresion constante y motivarme a seguir practicando comprension lectora

## Criterios de Aceptacion

### CA-1: Calculo de XP por Ejercicio
**Given** un estudiante que completa un ejercicio con un puntaje de 0-100%
**When** el sistema procesa la evaluacion
**Then** calcula XP = puntaje_base * multiplicador_dificultad * bonus_racha, donde multiplicadores son 1x (facil), 1.5x (medio), 2x (dificil), 3x (experto), registra la transaccion de XP con detalle de origen, y emite evento WebSocket `xp:earned` al estudiante

### CA-2: Rangos Jerarquicos Maya (5 Niveles)
**Given** un estudiante cuyo XP acumulado alcanza un umbral de rango
**When** el sistema verifica el XP total despues de cada otorgamiento
**Then** promueve al estudiante al rango correspondiente (Ah K'in 0-999, Nacom 1000-4999, Batab 5000-14999, Halach Uinik 15000-49999, Ajaw 50000+), muestra animacion de promocion con iconografia maya, otorga recompensa de promocion (ML Coins + item exclusivo), y emite evento WebSocket `rank:promoted`

### CA-3: Bonificacion por Racha
**Given** un estudiante que ha completado al menos 1 ejercicio durante N dias consecutivos
**When** completa un ejercicio en el dia N+1
**Then** el sistema aplica bonificacion de racha (7 dias: +10% XP, 30 dias: +25% XP, 100 dias: +50% XP), muestra el contador de racha en el dashboard, y genera logro de racha si aplica

### CA-4: Sistema de Logros Desbloqueables
**Given** un estudiante que cumple las condiciones de un logro definido
**When** el motor de logros evalua las condiciones (despues de cada accion relevante)
**Then** desbloquea el logro automaticamente, muestra notificacion con animacion tematica maya, otorga recompensa asociada (XP, ML Coins, item), y agrega el logro al showcase del perfil del estudiante

### CA-5: Logros por Categoria
**Given** el catalogo de logros del sistema
**When** se consultan los logros disponibles
**Then** estan organizados en categorias: academicos (primer ejercicio, primer modulo, 100 ejercicios), consistencia (racha 7/30/100 dias), progreso (completar cada modulo al 100%), sociales (ayudar a compañeros, participar en equipos), secretos (easter eggs tematicos maya descubribles)

### CA-6: Dashboard de Gamificacion
**Given** un estudiante autenticado en su portal
**When** accede al dashboard principal
**Then** ve prominentemente: XP total y barra de progreso al siguiente rango, rango actual con icono maya, racha de dias consecutivos, ultimos logros desbloqueados, y posicion en leaderboard de su aula

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | NestJS 11, React 19, Socket.IO 4.8+, Redis (cache), PostgreSQL 15 |
| Entidades BD | xp_transactions, levels, rank_definitions, gamification_config, achievements, student_achievements, achievement_categories |
| Endpoints API | `GET /api/v1/gamification/xp/:studentId` `POST /api/v1/gamification/xp/award` `GET /api/v1/gamification/ranks` `GET /api/v1/gamification/ranks/:studentId` `GET /api/v1/achievements` `GET /api/v1/achievements/:studentId` `POST /api/v1/achievements/check` `GET /api/v1/gamification/dashboard/:studentId` |
| Componentes FE | XPBar, RankBadge, RankPromotionAnimation, AchievementCard, AchievementShowcase, StreakCounter, GamificationDashboard, XPEarnedToast |
| WebSocket Events | `xp:earned`, `rank:promoted`, `achievement:unlocked`, `streak:updated` |
| Dependencias | US-GAM-EDU-01 (Modulos), US-GAM-EDU-02 (Ejercicios), US-GAM-STD-01 (Portal Estudiante) |

## Definition of Done
- [ ] Motor de calculo de XP con multiplicadores implementado
- [ ] 5 rangos maya con promocion automatica
- [ ] Sistema de bonificacion por racha
- [ ] Motor de logros con evaluacion por condiciones
- [ ] Logros en 5 categorias (academicos, consistencia, progreso, sociales, secretos)
- [ ] Dashboard de gamificacion en portal estudiante
- [ ] Eventos WebSocket para actualizaciones en tiempo real
- [ ] Tests unitarios (cobertura >= 85%)
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-GAM-013, RF-GAM-014, RF-GAM-015, RF-GAM-016 |
| Epica padre | EPIC-GAM-BACKEND, EPIC-GAM-FRONTEND |
