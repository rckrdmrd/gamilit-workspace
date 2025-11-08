# Sistema de Rangos Maya

**Proyecto:** Gamilit Platform
**Módulo:** Gamificación
**Archivo original:** SISTEMA-GAMIFICACION.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## FUENTE CANÓNICA - P0-001 ACTUALIZADO

**DECISIÓN OFICIAL (2025-11-02):** Sistema de 5 rangos Maya según seed data
Este documento contiene la especificación canónica del sistema de rangos para el proyecto GAMILIT, alineado con la base de datos de producción.

**Fuente de verdad:** Seed data de base de datos (`03-seed-maya-ranks.sql`)

---

## 1. JERARQUÍA DE RANGOS

Sistema de progresión inspirado en la estructura social de la civilización Maya clásica, adaptado para contexto educativo moderno.

> **Referencia:** Los requisitos de módulos educativos están definidos en [Módulos Educativos](../modulos/README-MODULOS-EDUCATIVOS.md)

| Rango | Significado Cultural | Requisitos | Multiplicador | ML Coins Bonus |
|-------|---------------------|------------|---------------|----------------|
| **Ajaw** | Señor/Gobernante (Iniciado) | 1 módulo completado ([Comprensión Literal](../modulos/MODULO-01-COMPRENSION-LITERAL.md)), score ≥70% | 1.0x | 50 |
| **Nacom** | Capitán de Guerra (Explorador) | 2 módulos completados ([Comprensión Inferencial](../modulos/MODULO-02-COMPRENSION-INFERENCIAL.md)), score ≥70% | 1.25x | 75 |
| **Ah K'in** | Sacerdote del Sol (Analítico) | 3 módulos completados ([Comprensión Crítica](../modulos/MODULO-03-COMPRENSION-CRITICA.md)), score ≥70% | 1.5x | 100 |
| **Halach Uinic** | Hombre Verdadero (Crítico) | 4 módulos completados ([Lectura Digital](../modulos/MODULO-04-LECTURA-DIGITAL.md)), score ≥70% | 1.75x | 125 |
| **K'uk'ulkan** | Serpiente Emplumada (Maestro) | 5 módulos completados ([Producción Lectora](../modulos/MODULO-05-PRODUCCION-TEXTOS.md)), score ≥70% | 2.0x | 150 |

---

## 2. ALGORITMO DE PROMOCIÓN

### 2.1 Fórmula de Progreso

```
progress = (modulesProgress × 0.8) + (scoreProgress × 0.2)

donde:
  modulesProgress = modulesCompletados / modulesRequeridos
  scoreProgress = averageScore / 70
```

### 2.2 Criterios para Ascender

1. **Primary requirement (80% peso):** `modules_completed >= modulesRequired`
2. **Quality gate (20% peso):** `average_score >= 70%`
3. **NO se consideran:** XP total, ML Coins, Achievements (decisión de diseño pedagógico)

### 2.3 Flujo de Promoción

```
1. Usuario completa ejercicio
2. Sistema actualiza `user_stats.modules_completed` si módulo completado
3. Backend ejecuta `ranks.autoCheckPromotion(userId)`
4. Si cumple requisitos:
   a. Marca rango actual como `is_current = false`
   b. Crea nuevo registro en `user_ranks` con nuevo rango
   c. Otorga ML Coins bonus (transacción tipo `'rank_promotion'`)
   d. Actualiza `user_stats.current_rank`
   e. Dispara notificación de rank up
```

---

## 3. CAPITALIZACIÓN Y FORMATO

### 3.1 Regla de Capitalización

**REGLA OFICIAL (2025-11-02):** Usar dato original de base de datos (Title Case)

**Formato en BD:** Title Case con excepciones culturales
- `Ajaw`, `Nacom`, `Ah K'in`, `Halach Uinic`, `K'uk'ulkan`

### 3.2 Uso por Contexto

**Backend (TypeScript/NestJS):**
- Usar dato original de BD: `user.rank = 'Nacom'`
- NO transformar a uppercase ni lowercase

**Frontend (Angular/TypeScript):**
- Para display: `<span>{{user.rank}}</span>` → "Nacom"
- Para tipos: `type MayaRank = 'Ajaw' | 'Nacom' | 'Ah K\'in' | 'Halach Uinic' | 'K\'uk\'ulkan';`

**Base de Datos:**
- Fuente de verdad: Title Case
- Ejemplo: `rank_name VARCHAR(50)` contiene `'Nacom'`, NO `'nacom'` ni `'Ajaw'`

### 3.3 Excepciones Tecnológicas

**Documentar transformaciones cuando la tecnología lo requiera:**
- GraphQL enums: Pueden requerir UPPERCASE (documentar en schema)
- URLs: Usar encoding apropiado
- CSS classes: Usar kebab-case (`nacom` → `rank-nacom`)

**Ver detalles:** `/docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md`

---

## 4. MULTIPLICADORES DE RANGO

Los multiplicadores de rango se aplican a las siguientes recompensas:

### 4.1 Aplicados a ML Coins

- Completar ejercicio (15 base)
- Score perfecto (+6 a +12 según dificultad)
- Primer intento exitoso (+15)
- Daily streak (+2 × días)
- Completar módulo (+50)
- Achievement rewards (+25 a +200)

### 4.2 NO Aplicados

- Daily login (+10 ML Coins fijo)
- Promoción de rango (bonus fijo por rango)
- Misiones diarias (+50 a +200 ML Coins predefinido)
- Misiones semanales (+300 a +500 ML Coins predefinido)

---

## 5. INTEGRACIÓN CON SISTEMA EDUCATIVO

### 5.1 Módulos y Niveles de Comprensión

| Rango | Módulo Requerido | Nivel de Comprensión |
|-------|------------------|---------------------|
| Ajaw | Módulo 1 | Comprensión Literal |
| Nacom | Módulo 2 | Comprensión Inferencial |
| Ah K'in | Módulo 3 | Comprensión Crítica |
| Halach Uinic | Módulo 4 | Lectura Digital |
| K'uk'ulkan | Módulo 5 | Producción Lectora |

### 5.2 Puntos de Integración

```
EDUCATIONAL MODULE
        │
        ├─► RanksService.getUserRankInfo()
        │     → Obtiene multiplicador para scoring
        │
        └─► RanksService.autoCheckPromotion()
              → Verifica rank up después de módulo completado
```

---

## 6. ESQUEMA DE BASE DE DATOS

### 6.1 Tabla `user_stats`

**Campo relacionado con rangos:**
- `current_rank`: String (enum de rangos)

### 6.2 Tabla `user_ranks` (Historial)

**Estructura:**
```sql
CREATE TABLE gamification_system.user_ranks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  rank_name VARCHAR(50), -- 'Ajaw', 'Nacom', 'Ah K''in', 'Halach Uinic', 'K''uk''ulkan'
  achieved_at TIMESTAMP DEFAULT NOW(),
  is_current BOOLEAN DEFAULT true,
  modules_completed INTEGER,
  average_score DECIMAL(5,2)
);
```

---

## 7. ENDPOINTS BACKEND

### 7.1 API de Rangos

```
GET  /api/gamification/ranks                      - Lista todos los rangos disponibles
GET  /api/gamification/ranks/user/:userId         - Rango actual del usuario
POST /api/gamification/ranks/check-promotion      - Verifica si puede ascender
POST /api/gamification/ranks/promote              - Ejecuta promoción manual (admin)
GET  /api/gamification/ranks/history/:userId      - Historial de rangos
GET  /api/gamification/ranks/multiplier/:userId   - Multiplicador actual
```

---

## 8. MÉTRICAS Y KPIs

### 8.1 Distribución de Rangos (Target)

**Objetivos de progresión:**
- 60% usuarios alcanzan rango Ah K'in (3 módulos) en 1 mes
- 30% usuarios alcanzan rango Halach Uinic (4 módulos) en 3 meses
- 10% usuarios alcanzan rango K'uk'ulkan (5 módulos) en 6 meses

### 8.2 Métricas por Rango

```sql
-- Distribución actual
SELECT
  current_rank,
  COUNT(*) as usuarios,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM user_stats), 2) as porcentaje
FROM gamification_system.user_stats
GROUP BY current_rank
ORDER BY
  CASE current_rank
    WHEN 'Ajaw' THEN 1
    WHEN 'Nacom' THEN 2
    WHEN 'Ah K''in' THEN 3
    WHEN 'Halach Uinic' THEN 4
    WHEN 'K''uk''ulkan' THEN 5
  END;
```

---

## 9. NOTIFICACIONES DE RANK UP

### 9.1 Evento de Promoción

**Tipo:** `rank_promotion`

**Payload:**
```json
{
  "userId": "uuid",
  "previousRank": "Nacom",
  "newRank": "Ah K'in",
  "mlCoinsBonus": 100,
  "newMultiplier": 1.5,
  "achievedAt": "2025-11-01T12:00:00Z"
}
```

### 9.2 Canales de Notificación

- ✅ In-app notification (modal con animación de confeti)
- ✅ Real-time via WebSocket
- ❌ Email notification (no implementado)
- ❌ Push notification (no implementado)

---

## Ver también

- [Índice del sistema de gamificación](./README.md)
- [Economía ML Coins](./02-ECONOMIA-ML-COINS.md)
- [Sistema de Achievements](./03-ACHIEVEMENTS.md)
- [Sistemas Complementarios](./04-SISTEMAS-COMPLEMENTARIOS.md)
- [Roadmap y Métricas](./05-ROADMAP-METRICAS.md)

---

**Documento preparado por:** Equipo de Análisis Técnico
**Fecha modularización:** 2025-11-01
**Última actualización:** 2025-11-02 (Actualización LOG-005)
**Estado:** P0-001 ACTUALIZADO - Sistema de 5 rangos según seed data oficial
