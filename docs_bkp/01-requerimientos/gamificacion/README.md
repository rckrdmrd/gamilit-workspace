# Sistema de Gamificación - GAMILIT

**Archivo original:** SISTEMA-GAMIFICACION.md (853 líneas) - Modularizado
**Fecha modularización:** 2025-11-01
**Fuente canónica:** Este directorio contiene la especificación oficial del sistema

---

## RESUMEN EJECUTIVO

El sistema de gamificación de GAMILITimplementa un **modelo educativo culturalmente relevante** basado en rangos Maya, economía de ML Coins con multiplicadores dinámicos, logros progresivos, power-ups consumibles y misiones diarias/semanales.

**Estado Global:** 78% completo - MVP funcional con correcciones menores requeridas

---

## ÍNDICE DE DOCUMENTOS

| Archivo | Descripción | Líneas | Estado |
|---------|-------------|--------|--------|
| [01-RANGOS-MAYA.md](./01-RANGOS-MAYA.md) | Sistema de 5 rangos (P0-001 resuelto) | ~200 | ✅ Operacional 100% |
| [02-ECONOMIA-ML-COINS.md](./02-ECONOMIA-ML-COINS.md) | Economía virtual ML Coins | ~250 | ✅ Operacional 100% |
| [03-ACHIEVEMENTS.md](./03-ACHIEVEMENTS.md) | Sistema de logros | ~230 | ⚠️ Parcial 20% |
| [04-SISTEMAS-COMPLEMENTARIOS.md](./04-SISTEMAS-COMPLEMENTARIOS.md) | Power-ups, misiones, streaks, leaderboards | ~280 | ✅ Operacional 90% |
| [05-ROADMAP-METRICAS.md](./05-ROADMAP-METRICAS.md) | Roadmap, métricas y KPIs | ~260 | ✅ Completo |

---

## SISTEMA DE RANGOS (P0-001 - Fuente Canónica)

**DECISIÓN OFICIAL:** Sistema de 5 rangos Maya

| Rango | Nivel | Módulos | Multiplicador | ML Coins Bonus |
|-------|-------|---------|---------------|----------------|
| Ajaw | 1 | 1 módulo | 1.0x | 50 |
| Nacom | 2 | 2 módulos | 1.25x | 75 |
| Ah K'in | 3 | 3 módulos | 1.5x | 100 |
| Halach Uinic | 4 | 4 módulos | 1.75x | 125 |
| K'uk'ulkan | 5 | 5 módulos | 2.0x | 150 |

**Ver detalles completos:** [01-RANGOS-MAYA.md](./01-RANGOS-MAYA.md)

---

## BUGS CONOCIDOS Y CORRECCIONES

### P0 - Crítico
- **Rangos Maya:** Case mismatch (backend lowercase, frontend UPPERCASE) - ✅ Solucionado
- **Achievements:** Auto-detection no funciona (solo 2 hardcoded) - ❌ Pendiente

### P1 - Importante
- **ML Coins:** Rate limiting no implementado - ❌ Pendiente
- **Streaks:** Verificar CRON jobs activos - ❌ Pendiente verificación

### P2 - Mejoras
- **Misiones:** No auto-progresan - ⚠️ Funciona manual
- **Leaderboards:** Redis cache para optimización - ❌ Pendiente

**Ver roadmap completo:** [05-ROADMAP-METRICAS.md](./05-ROADMAP-METRICAS.md)

---

## MÉTRICAS CLAVE

### Engagement (Targets)
- **Average streak:** >5 días
- **Spending rate:** 30-50% (indica economía balanceada)
- **Achievement rate:** >3 achievements/usuario/mes

### Progresión (Objetivos)
- **60%** usuarios alcanzan Ah K'in (3 módulos) en 1 mes
- **30%** usuarios alcanzan Halach Uinic (4 módulos) en 3 meses
- **10%** usuarios alcanzan K'uk'ulkan (5 módulos) en 6 meses

**Ver métricas detalladas:** [05-ROADMAP-METRICAS.md](./05-ROADMAP-METRICAS.md)

---

## GUÍA RÁPIDA POR SISTEMA

### 1. Rangos Maya
- **Archivo:** [01-RANGOS-MAYA.md](./01-RANGOS-MAYA.md)
- **Contenido:** Jerarquía, algoritmo de promoción, multiplicadores, integración educativa
- **Estado:** ✅ 100% operacional (bug de case mismatch resuelto)

### 2. Economía ML Coins
- **Archivo:** [02-ECONOMIA-ML-COINS.md](./02-ECONOMIA-ML-COINS.md)
- **Contenido:** Formas de ganar/gastar, transacciones, balance, métricas económicas
- **Estado:** ✅ 100% operacional (rate limiting pendiente)

### 3. Achievements (Logros)
- **Archivo:** [03-ACHIEVEMENTS.md](./03-ACHIEVEMENTS.md)
- **Contenido:** Categorías, rareza, estructura, 30+ achievements planeados
- **Estado:** ⚠️ 20% operacional (solo 2 achievements hardcoded)
- **Bug crítico:** Auto-detection no implementado

### 4. Sistemas Complementarios
- **Archivo:** [04-SISTEMAS-COMPLEMENTARIOS.md](./04-SISTEMAS-COMPLEMENTARIOS.md)
- **Contenido:**
  - Streaks (rachas diarias)
  - Power-ups (3 tipos: Pistas, Visión Lectora, Segunda Oportunidad)
  - Misiones (daily/weekly/special)
  - Leaderboards (global/school/classroom/weekly)
  - Notificaciones y feedback
  - Dashboard de estadísticas
- **Estado:** ✅ 90% operacional (mejoras pendientes)

### 5. Roadmap y Métricas
- **Archivo:** [05-ROADMAP-METRICAS.md](./05-ROADMAP-METRICAS.md)
- **Contenido:**
  - KPIs de engagement y progresión
  - Queries de análisis (SQL)
  - Roadmap de correcciones (Sprint 0, Sprint 3, Backlog)
  - Anexos (esquemas DB, 43 endpoints backend)
- **Estado:** ✅ Completo

---

## ENDPOINTS BACKEND (Resumen)

**Total:** 43 endpoints

- **Rangos:** 7 endpoints
- **ML Coins:** 7 endpoints
- **Achievements:** 5 endpoints
- **Power-ups:** 4 endpoints
- **Leaderboards:** 5+ endpoints
- **Misiones:** 9 endpoints
- **Streaks:** 3 endpoints
- **Legacy:** 3 endpoints

**Ver documentación completa:** [05-ROADMAP-METRICAS.md](./05-ROADMAP-METRICAS.md#32-endpoints-backend-43-total)

---

## ESQUEMAS DE BASE DE DATOS

**Schemas principales:**
- `gamification_system.user_stats` (tabla central)
- `gamification_system.ml_coins_transactions`
- `gamification_system.achievements`
- `gamification_system.user_achievements`
- `gamification_system.user_ranks`
- `gamification_system.powerups`
- `gamification_system.missions`
- `gamification_system.leaderboard_*` (vistas materializadas)

**Ver esquemas completos:** [05-ROADMAP-METRICAS.md](./05-ROADMAP-METRICAS.md#31-esquemas-de-base-de-datos)

---

## ARCHIVO ORIGINAL

**Respaldo:** SISTEMA-GAMIFICACION.md.backup
- **Líneas:** 853
- **Fecha:** Octubre 2025
- **Versión:** 1.0

El archivo original ha sido modularizado para mejorar la mantenibilidad y navegación de la documentación.

---

## DOCUMENTOS HISTÓRICOS

**Fuentes originales:**
- Análisis de gamificación (histórico - glit-analisys)
- Análisis ejecutivo (histórico - glit-analisys)
- Validación cruzada (histórico - glit-analisys)

**Nota:** Documentos históricos archivados (no incluidos en este proyecto)

---

## NAVEGACIÓN

- [⬅️ Volver a Requerimientos](../README.md)
- [⬆️ Índice principal](../../README.md)

---

**Documento preparado por:** Equipo de Análisis Técnico
**Fecha modularización:** 2025-11-01
**Versión:** 2.0 (Modularizado - RFC-0001)
