# Sistema de Achievements (Logros)

**Proyecto:** Gamilit Platform
**Módulo:** Gamificación
**Archivo original:** SISTEMA-GAMIFICACION.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## 1. CATEGORÍAS DE LOGROS

| Categoría | Descripción | Ejemplos | Rareza Típica |
|-----------|-------------|----------|---------------|
| **Progress** | Progreso acumulativo | "Completa 10 ejercicios", "Gana 500 ML Coins" | Common/Rare |
| **Streak** | Días consecutivos | "Mantén 7 días de racha", "Racha de 30 días" | Rare/Epic |
| **Completion** | Finalizar módulos/secciones | "Completa Módulo 1", "Maestro de todos los módulos" | Common/Legendary |
| **Mastery** | Perfección/dominio | "5 scores perfectos seguidos", "100% en módulo" | Epic |
| **Exploration** | Descubrimiento de contenido | "Completa todos los tipos de ejercicio" | Rare |
| **Social** | Interacciones sociales | "Únete a un guild", "10 amigos agregados" | Common |
| **Special** | Eventos especiales | "Celebración de aniversario", "Easter eggs" | Legendary |

---

## 2. SISTEMA DE RAREZA

| Rareza | ML Coins Reward | XP Reward | Frecuencia Típica |
|--------|-----------------|-----------|-------------------|
| **Common** | 25 | 50 | ~30% de achievements |
| **Rare** | 50 | 100 | ~40% de achievements |
| **Epic** | 100 | 250 | ~20% de achievements |
| **Legendary** | 200 | 500 | ~10% de achievements |

### 2.1 Multiplicadores de Rango

**IMPORTANTE:** Las recompensas de achievements aplican multiplicador de rango

**Ejemplo:**
- Achievement épico: 100 ML Coins base
- Estudiante en rango Ah K'in (1.5x)
- Recompensa final: 100 × 1.5 = **150 ML Coins**

---

## 3. ESTADO ACTUAL - BUG CRÍTICO

### 3.1 Descripción del Problema

**Problema:** Sistema de auto-detection de achievements no funciona

**Implementación actual:**
- Solo 2 achievements hardcoded: `'first_10_exercises'` y `'perfectionist'`
- Resto de achievements NO se desbloquean automáticamente
- Método `checkAchievements()` incompleto (líneas 48-106 de `achievements.service.ts`)

### 3.2 Impacto

- **Engagement reducido:** -30% retención estimada
- **Motivación limitada:** Estudiantes no reciben retroalimentación de logros
- **Diferenciador competitivo perdido:** Feature clave de gamificación inoperativa

### 3.3 Solución Requerida

**1. Implementar tabla `achievement_triggers` con condiciones**

```sql
CREATE TABLE gamification_system.achievement_triggers (
  achievement_id UUID PRIMARY KEY REFERENCES achievements(id),
  trigger_type VARCHAR(50), -- 'exercises_completed', 'streak_days', 'module_completed', etc.
  target_value INTEGER,
  operator VARCHAR(10), -- '>=', '==', '>'
  additional_conditions JSONB -- Filtros extra (ej: scoreThreshold: 90)
);
```

**2. Ejecutar `checkAchievements()` en eventos clave:**
- `onExerciseComplete`
- `onModuleComplete`
- `onStreakUpdate`
- `onRankPromotion`

**3. Migrar lógica de detección de `achievementsMockData.ts` (frontend) a backend**

**Tiempo estimado:** 3 días de desarrollo

**Prioridad:** P0 - Crítico para experiencia de usuario

---

## 4. ESTRUCTURA DE ACHIEVEMENT

### 4.1 Interface TypeScript

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string; // URL o emoji
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  mlCoinsReward: number;
  xpReward: number;
  isSecret: boolean; // Oculto hasta desbloquear
  conditions: {
    type: string; // 'exercises_completed', 'streak_days', etc.
    target: number;
    operator: '>=' | '==' | '>';
    additionalParams?: any;
  };
}
```

### 4.2 Ejemplo de Achievement

```json
{
  "id": "first_module_master",
  "name": "Maestro del Módulo 1",
  "description": "Completa todos los ejercicios del Módulo 1 con score ≥90%",
  "category": "completion",
  "icon": "🏆",
  "rarity": "rare",
  "mlCoinsReward": 50,
  "xpReward": 100,
  "isSecret": false,
  "conditions": {
    "type": "module_completion",
    "target": 1,
    "operator": "==",
    "scoreThreshold": 90
  }
}
```

---

## 5. ACHIEVEMENTS HARDCODED (Actuales)

### 5.1 First 10 Exercises

```json
{
  "id": "first_10_exercises",
  "name": "Estudiante Dedicado",
  "description": "Completa tus primeros 10 ejercicios",
  "category": "progress",
  "rarity": "common",
  "mlCoinsReward": 25,
  "xpReward": 50,
  "isSecret": false,
  "conditions": {
    "type": "exercises_completed",
    "target": 10,
    "operator": ">="
  }
}
```

### 5.2 Perfectionist

```json
{
  "id": "perfectionist",
  "name": "Perfeccionista",
  "description": "Obtén 5 scores perfectos (100%) consecutivos",
  "category": "mastery",
  "rarity": "epic",
  "mlCoinsReward": 100,
  "xpReward": 250,
  "isSecret": false,
  "conditions": {
    "type": "perfect_scores_consecutive",
    "target": 5,
    "operator": ">="
  }
}
```

**NOTA:** Estos 2 achievements funcionan porque están implementados manualmente en el código.

---

## 6. ACHIEVEMENTS PLANIFICADOS (30+)

### 6.1 Categoría Progress

| ID | Nombre | Descripción | Rareza | ML Coins |
|----|--------|-------------|--------|----------|
| `first_exercise` | Primer Paso | Completa tu primer ejercicio | Common | 25 |
| `first_10_exercises` | Estudiante Dedicado | Completa 10 ejercicios | Common | 25 |
| `first_50_exercises` | Aprendiz Comprometido | Completa 50 ejercicios | Rare | 50 |
| `first_100_exercises` | Maestro Estudioso | Completa 100 ejercicios | Epic | 100 |
| `first_500_coins` | Ahorrador Novato | Gana 500 ML Coins | Common | 25 |
| `first_1000_coins` | Coleccionista de Coins | Gana 1000 ML Coins | Rare | 50 |

### 6.2 Categoría Streak

| ID | Nombre | Descripción | Rareza | ML Coins |
|----|--------|-------------|--------|----------|
| `streak_3_days` | Racha Iniciada | Mantén 3 días de racha | Common | 25 |
| `streak_7_days` | Semana Imparable | Mantén 7 días de racha | Rare | 50 |
| `streak_30_days` | Mes de Dedicación | Mantén 30 días de racha | Epic | 100 |
| `streak_100_days` | Leyenda Persistente | Mantén 100 días de racha | Legendary | 200 |

### 6.3 Categoría Completion

| ID | Nombre | Descripción | Rareza | ML Coins |
|----|--------|-------------|--------|----------|
| `module_1_complete` | Iniciado Maya | Completa Módulo 1 | Common | 25 |
| `module_2_complete` | Explorador Maya | Completa Módulo 2 | Common | 25 |
| `module_3_complete` | Analítico Maya | Completa Módulo 3 | Rare | 50 |
| `module_4_complete` | Crítico Maya | Completa Módulo 4 | Rare | 50 |
| `module_5_complete` | Maestro Maya | Completa Módulo 5 | Epic | 100 |
| `all_modules_complete` | Gran Maestro | Completa todos los módulos | Legendary | 200 |

### 6.4 Categoría Mastery

| ID | Nombre | Descripción | Rareza | ML Coins |
|----|--------|-------------|--------|----------|
| `perfectionist` | Perfeccionista | 5 scores perfectos consecutivos | Epic | 100 |
| `no_hints_master` | Sin Ayuda | Completa 20 ejercicios sin usar hints | Rare | 50 |
| `speed_demon` | Velocista | Completa ejercicio en <30 segundos | Rare | 50 |
| `module_perfect` | Módulo Impecable | 100% en todos los ejercicios de un módulo | Epic | 100 |

### 6.5 Categoría Special

| ID | Nombre | Descripción | Rareza | ML Coins |
|----|--------|-------------|--------|----------|
| `first_login` | Bienvenido | Ingresa a la plataforma por primera vez | Common | 25 |
| `early_adopter` | Pionero | Únete en los primeros 1000 usuarios | Legendary | 200 |
| `birthday_login` | Cumpleañero | Inicia sesión el día de tu cumpleaños | Rare | 50 |
| `easter_egg_1` | Descubridor | Encuentra el easter egg secreto | Legendary | 200 |

---

## 7. ESQUEMA DE BASE DE DATOS

### 7.1 Tabla `achievements`

```sql
CREATE TABLE gamification_system.achievements (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  icon VARCHAR(255),
  rarity VARCHAR(20),
  ml_coins_reward INTEGER,
  xp_reward INTEGER,
  is_secret BOOLEAN DEFAULT false,
  conditions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.2 Tabla `user_achievements`

```sql
CREATE TABLE gamification_system.user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress_current INTEGER DEFAULT 0,
  progress_target INTEGER,
  is_completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);
```

---

## 8. ENDPOINTS BACKEND

### 8.1 API de Achievements

```
GET  /api/gamification/achievements                     - Lista todos los achievements
GET  /api/gamification/achievements/user/:userId        - Achievements del usuario
POST /api/gamification/achievements/check               - Verificar desbloqueos
POST /api/gamification/achievements/unlock              - Desbloquear achievement
GET  /api/gamification/achievements/progress/:userId    - Progreso de achievements
```

---

## 9. FLUJO DE AUTO-DETECTION (A Implementar)

```
1. Evento trigger (ej: ejercicio completado)
2. AchievementsService.checkAchievements(userId, eventType, eventData)
3. Query achievements con trigger_type = eventType
4. Para cada achievement:
   a. Evaluar condiciones (target, operator)
   b. Si cumple y no está desbloqueado:
      - Crear registro en user_achievements
      - Otorgar ML Coins (con multiplicador de rango)
      - Otorgar XP
      - Dispara notificación
5. Return lista de achievements desbloqueados
```

---

## 10. INTEGRACIÓN CON EVENTOS

### 10.1 Eventos a Implementar

```typescript
// En scoring.service.ts
await AchievementsService.checkAchievements(userId, 'exercise_completed', {
  exerciseId,
  exerciseType,
  score: finalScore,
  isPerfect: finalScore === 100,
  usedHints: hintsUsed > 0
});

// En streaks.service.ts
await AchievementsService.checkAchievements(userId, 'streak_updated', {
  currentStreak,
  longestStreak
});

// En ranks.service.ts
await AchievementsService.checkAchievements(userId, 'rank_promotion', {
  newRank,
  modulesCompleted
});

// En modules.service.ts
await AchievementsService.checkAchievements(userId, 'module_completed', {
  moduleId,
  averageScore,
  allExercisesCompleted
});
```

---

## 11. NOTIFICACIONES DE ACHIEVEMENTS

### 11.1 Evento de Desbloqueo

**Tipo:** `achievement_unlocked`

**Payload:**
```json
{
  "userId": "uuid",
  "achievementId": "first_module_master",
  "achievementName": "Maestro del Módulo 1",
  "rarity": "rare",
  "mlCoinsReward": 75,
  "xpReward": 100,
  "unlockedAt": "2025-11-01T12:00:00Z"
}
```

### 11.2 Animaciones

- **Common:** Toast notification
- **Rare:** Modal con animación de badge
- **Epic:** Modal + confeti
- **Legendary:** Modal + confeti + efectos de sonido

---

## 12. MÉTRICAS DE ACHIEVEMENTS

### 12.1 KPIs

**Por Usuario:**
- Total achievements desbloqueados
- Achievements por categoría
- Achievements por rareza
- Achievement unlock rate: `achievements / días_activo`

**Globales:**
- Achievement unlock rate: `total_unlocked / total_users`
- Distribución de rareza desbloqueada
- Top achievements más comunes
- Achievements "raros" (pocos usuarios los tienen)

### 12.2 Queries de Análisis

```sql
-- Achievements más desbloqueados
SELECT
  a.name,
  a.rarity,
  COUNT(ua.id) as unlock_count,
  ROUND(COUNT(ua.id) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM gamification_system.achievements a
LEFT JOIN gamification_system.user_achievements ua ON a.id = ua.achievement_id
GROUP BY a.id, a.name, a.rarity
ORDER BY unlock_count DESC
LIMIT 10;

-- Usuario con más achievements
SELECT
  u.username,
  COUNT(ua.id) as total_achievements
FROM users u
JOIN gamification_system.user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.username
ORDER BY total_achievements DESC
LIMIT 10;
```

---

## Ver también

- [Índice del sistema de gamificación](./README.md)
- [Sistema de Rangos Maya](./01-RANGOS-MAYA.md)
- [Economía ML Coins](./02-ECONOMIA-ML-COINS.md)
- [Sistemas Complementarios](./04-SISTEMAS-COMPLEMENTARIOS.md)
- [Roadmap y Métricas](./05-ROADMAP-METRICAS.md)

---

**Documento preparado por:** Equipo de Análisis Técnico
**Fecha modularización:** 2025-11-01
**Estado:** ⚠️ PARCIAL - 20% completo - P0 (auto-detection crítico)
**Bug conocido:** Solo 2 achievements hardcoded funcionan
