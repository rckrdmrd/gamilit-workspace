
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: RF-GAM-001 -->
<!-- ID Nuevo: M-GAM-REQ-001 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-GAM-REQ-001: Sistema de Logros (Achievements)

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-GAM-001 |
| **Módulo** | Gamificación |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha creación** | 2025-11-07 |
| **Última actualización** | 2025-11-07 |

## 🔗 Referencias

### Especificación Técnica
📐 [ET-GAM-001: Sistema de Achievements](../../02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md)

### Implementación DDL
🗄️ **ENUMs Canónicos:**

**achievement_type:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:51-54`
- **Tipo:** `gamification_system.achievement_type`
- **Valores:** `badge`, `milestone`, `special`, `rank_promotion`

**achievement_category:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:47-50`
- **Tipo:** `gamification_system.achievement_category`
- **Valores:** `progress`, `streak`, `completion`, `social`, `special`, `mastery`, `exploration`

🗄️ **Tablas:**
1. `gamification_system.achievements` → `apps/database/ddl/schemas/gamification_system/tables/01-achievements.sql`
   - Columnas: `type achievement_type`, `category achievement_category`
2. `gamification_system.user_achievements` → `apps/database/ddl/schemas/gamification_system/tables/02-user_achievements.sql`
   - Tracking de achievements desbloqueados por usuario

🗄️ **Funciones:**
- `gamification_system.check_and_unlock_achievement()` → Verifica y desbloquea achievements
- `gamification_system.award_achievement_rewards()` → Otorga recompensas (XP, ML Coins)

🗄️ **Triggers:**
- `trg_achievement_unlocked` → Ejecuta al desbloquear achievement
- `trg_check_rank_promotion` → Verifica si XP alcanza siguiente rango

### Backend
💻 **Implementación:**
- **Enums:**
  - `apps/backend/src/modules/gamification/enums/achievement-type.enum.ts`
  - `apps/backend/src/modules/gamification/enums/achievement-category.enum.ts`
- **Service:** `apps/backend/src/modules/gamification/services/achievement.service.ts`
- **Listeners:** `apps/backend/src/modules/gamification/listeners/achievement.listener.ts`
- **DTOs:** `apps/backend/src/modules/gamification/dto/unlock-achievement.dto.ts`

### Frontend
🎨 **Componentes:**
- **Types:** `apps/frontend/src/types/gamification.types.ts`
- **Componentes:**
  - `apps/frontend/src/components/gamification/AchievementGallery.tsx`
  - `apps/frontend/src/components/gamification/AchievementCard.tsx`
  - `apps/frontend/src/components/gamification/AchievementUnlockedModal.tsx`
  - `apps/frontend/src/components/gamification/AchievementProgress.tsx`

### Mapeo Completo
📊 [Ver mapeo completo: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#21-sistema-de-logros-achievements)

---

## 📝 Descripción del Requerimiento

### Contexto

El sistema educativo Gamilit necesita motivar y mantener comprometidos a los estudiantes mediante mecánicas de gamificación. Los achievements (logros) son un elemento fundamental para:
- Reconocer el progreso del estudiante
- Motivar la continuidad en el aprendizaje
- Celebrar hitos importantes
- Fomentar comportamientos positivos (rachas, exploración, dominio)
- Proporcionar feedback visual del desarrollo

### Necesidad del Negocio

**Problema:**
Sin un sistema de achievements:
- Estudiantes pierden motivación tras completar ejercicios
- No hay reconocimiento visible del progreso
- Difícil fomentar hábitos de estudio consistentes
- Falta de incentivos para explorar contenido nuevo

**Solución:**
Implementar un sistema de achievements clasificados por **tipo** y **categoría** que recompense diversos comportamientos y logros, proporcionando feedback constante y motivación intrínseca.

---

## 🎯 Requerimiento Funcional

### M-GAM-REQ-001.1: Tipos de Achievements

El sistema **DEBE** soportar 4 tipos de achievements:

#### 1. Badge (Insignia) 🏅
**Descripción:** Insignias coleccionables por completar acciones específicas

**Características:**
- Coleccionables (el estudiante puede tener múltiples)
- Visuales llamativas con iconografía única
- Permanentes una vez desbloqueados
- Mostrados en perfil público del estudiante

**Ejemplos:**
- "Primer Paso" - Completar primer ejercicio
- "Lector Ávido" - Leer 10 textos completos
- "Explorador" - Probar 5 mecánicas diferentes

**Recompensas Típicas:**
- 10-50 XP
- Badge visible en perfil
- Entrada en galería de achievements

---

#### 2. Milestone (Hito) 📍
**Descripción:** Hitos que marcan progreso significativo en el aprendizaje

**Características:**
- Marca progreso cuantificable
- Desbloqueables en secuencia
- Asociados a métricas específicas

**Ejemplos:**
- "Módulo Maestro" - Completar módulo al 100%
- "50 Ejercicios" - Resolver 50 ejercicios correctamente
- "Nivel 10" - Alcanzar nivel de usuario 10

**Recompensas Típicas:**
- 50-200 XP
- 20-100 ML Coins
- Badge + título especial

---

#### 3. Special (Especial) ⭐
**Descripción:** Achievements especiales para eventos, temporadas, o logros únicos

**Características:**
- Tiempo limitado (eventos)
- Únicos o muy difíciles de obtener
- Mayor valor social (prestigio)

**Ejemplos:**
- "Racha de Fuego" - 30 días consecutivos practicando
- "Perfeccionista" - Completar módulo con 100% accuracy en primer intento
- "Pionero" - Ser de los primeros 100 usuarios en probar nueva feature

**Recompensas Típicas:**
- 200-500 XP
- 100-300 ML Coins
- Badge dorado/animado
- Título exclusivo

---

#### 4. Rank Promotion (Promoción de Rango) 👑
**Descripción:** Achievement otorgado al ascender de rango Maya

**Características:**
- Automático al alcanzar XP requerido
- Jerárquico (solo puedes tener un rank activo)
- Visible en toda la UI del estudiante

**Ejemplos:**
- "Nacom" - Alcanzar 1000 XP (Rango 2)
- "Ah K'in" - Alcanzar 5000 XP (Rango 3)
- "Halach Uinic" - Alcanzar 20000 XP (Rango 4)

**Recompensas:**
- Nuevo título de rango
- Desbloqueo de features exclusivas del rango
- Badge de rango + animación especial
- Notificación destacada a amigos

---

### M-GAM-REQ-001.2: Categorías de Achievements

El sistema **DEBE** clasificar achievements en 7 categorías:

#### 1. Progress (Progreso) 📈
Relacionados con avance general en el sistema
- Ejemplos: "Nivel 5", "50% del curso", "Primera semana completada"

#### 2. Streak (Racha) 🔥
Relacionados con consistencia y hábitos
- Ejemplos: "3 días consecutivos", "Racha de 30 días", "Sin faltar en un mes"

#### 3. Completion (Completitud) ✅
Relacionados con finalizar contenido
- Ejemplos: "Módulo completado", "Todos los ejercicios del tema", "Curso finalizado"

#### 4. Social (Social) 👥
Relacionados con interacción social
- Ejemplos: "Primer amigo", "Equipo de 5", "Ayudó a 10 compañeros"

#### 5. Special (Especiales) 🌟
Eventos, temporadas, logros únicos
- Ejemplos: "Evento de Halloween", "Beta Tester", "Aniversario 1 año"

#### 6. Mastery (Dominio) 🎓
Relacionados con dominar contenido
- Ejemplos: "100% accuracy en 10 ejercicios", "Maestro de gramática", "Sin errores en módulo"

#### 7. Exploration (Exploración) 🗺️
Relacionados con descubrir contenido nuevo
- Ejemplos: "Probó todas las mecánicas", "Exploró 3 módulos", "Primera simulación"

---

### M-GAM-REQ-001.3: Matriz de Achievements

El sistema **DEBE** permitir combinar tipos y categorías:

| Tipo | Category | Ejemplo | Criterio | Recompensa |
|------|----------|---------|----------|------------|
| badge | progress | "Principiante" | Completar tutorial | 10 XP |
| badge | streak | "Constante" | 7 días consecutivos | 50 XP |
| badge | social | "Amigable" | Agregar 5 amigos | 30 XP |
| milestone | completion | "Módulo 1 Completo" | 100% Módulo 1 | 100 XP + 50 ML Coins |
| milestone | mastery | "Maestro del Análisis" | 10 ejercicios >90% | 150 XP |
| special | streak | "Racha Épica" | 30 días | 300 XP + Badge oro |
| special | exploration | "Aventurero" | Probar 20 mecánicas | 200 XP |
| rank_promotion | progress | "Nacom" | 1000 XP alcanzados | Rango 2 + features |

---

### M-GAM-REQ-001.4: Criterios de Desbloqueo

Cada achievement **DEBE** tener criterios explícitos almacenados en JSONB:

```json
{
  "achievement_id": "ach_001",
  "name": "Racha de Fuego",
  "type": "special",
  "category": "streak",
  "criteria": {
    "type": "streak_days",
    "required_days": 30,
    "consecutive": true,
    "min_activities_per_day": 1
  },
  "rewards": {
    "xp": 300,
    "ml_coins": 100,
    "badge_url": "/badges/fire-streak.png",
    "title": "Imparable"
  }
}
```

**Tipos de Criterios:**
- `streak_days`: Días consecutivos
- `exercise_count`: Cantidad de ejercicios
- `completion_percentage`: Porcentaje de completitud
- `accuracy_threshold`: Precisión mínima
- `xp_reached`: XP alcanzado
- `social_connections`: Conexiones sociales
- `exploration_count`: Contenido explorado

---

### M-GAM-REQ-001.5: Sistema de Recompensas

Al desbloquear achievement, el sistema **DEBE**:

1. **Registrar desbloqueo:**
```sql
INSERT INTO gamification_system.user_achievements (
    user_id, achievement_id, unlocked_at
) VALUES (
    user_id, achievement_id, NOW()
);
```

2. **Otorgar recompensas:**
- Sumar XP a `user_stats.total_xp`
- Sumar ML Coins a `user_stats.ml_coins`
- Verificar si XP alcanza nuevo rango → disparar `rank_promotion`

3. **Notificar usuario:**
```typescript
await notificationService.send({
  userId,
  type: 'achievement_unlocked',
  priority: 'medium',
  data: {
    achievementName: 'Racha de Fuego',
    badgeUrl: '/badges/fire-streak.png',
    xpEarned: 300,
    mlCoinsEarned: 100,
  }
});
```

4. **Disparar confetti/animación:**
- Frontend muestra modal de celebración
- Animación de confetti
- Sonido de logro

5. **Actualizar galería:**
- Achievement aparece como "desbloqueado" en galería
- Badge visible en perfil público

---

## 📊 Casos de Uso

### UC-GAM-001: Estudiante desbloquea achievement por completar módulo
**Actor:** Estudiante
**Precondiciones:** Estudiante completó último ejercicio del módulo

**Flujo:**
1. Estudiante completa ejercicio final del módulo
2. Sistema actualiza `module_progress.status` → `'completed'`
3. **Trigger automático** verifica criterios de achievements:
   ```sql
   SELECT * FROM gamification_system.achievements
   WHERE criteria->>'type' = 'completion_percentage'
     AND criteria->>'module_id' = current_module_id
     AND criteria->>'percentage' = '100';
   ```
4. Sistema encuentra achievement "Módulo Maestro"
5. Sistema ejecuta `gamification_system.check_and_unlock_achievement(user_id, achievement_id)`
6. Sistema registra desbloqueo en `user_achievements`
7. Sistema otorga recompensas:
   - +100 XP → `user_stats.total_xp`
   - +50 ML Coins → `user_stats.ml_coins`
8. Sistema envía notificación `achievement_unlocked`
9. Frontend muestra modal de celebración con confetti
10. Achievement aparece en galería del estudiante

**Resultado:** Achievement desbloqueado, recompensas otorgadas, estudiante motivado

---

### UC-GAM-002: Estudiante ve galería de achievements
**Actor:** Estudiante
**Precondiciones:** Usuario autenticado

**Flujo:**
1. Estudiante navega a "Mis Logros"
2. Sistema carga achievements:
   ```typescript
   const achievements = await achievementService.getGallery(userId);
   // Retorna: { unlocked: [], locked: [], progress: {} }
   ```
3. Frontend renderiza galería en grid:
   - **Achievements desbloqueados:** Full color, con fecha
   - **Achievements bloqueados:** Silueta con "???" (si es secreto)
   - **Achievements en progreso:** Barra de progreso visible
4. Estudiante hace click en achievement desbloqueado
5. Sistema muestra detalle:
   - Nombre y descripción
   - Fecha de desbloqueo
   - Recompensas obtenidas
   - Rareza (% de usuarios que lo tienen)
6. Estudiante puede compartir achievement en redes

**Resultado:** Estudiante visualiza su colección y progreso

---

### UC-GAM-003: Achievement de racha de 7 días consecutivos
**Actor:** Sistema (automático)
**Precondiciones:** Estudiante tiene 6 días consecutivos registrados

**Flujo:**
1. Estudiante completa al menos 1 ejercicio hoy (día 7)
2. **Cron job nocturno** ejecuta:
   ```typescript
   await streakService.updateStreaks(); // Actualiza todas las rachas
   ```
3. Sistema detecta que estudiante alcanzó 7 días consecutivos
4. Sistema verifica criterios del achievement "Semana Perfecta":
   ```json
   {
     "type": "streak_days",
     "required_days": 7,
     "consecutive": true
   }
   ```
5. Criterio cumplido → Sistema desbloquea achievement
6. Sistema otorga recompensas:
   - +50 XP
   - Badge "Semana Perfecta"
7. **Al día siguiente:** Usuario recibe notificación matutina:
   > "🔥 ¡7 días consecutivos! Desbloqueaste 'Semana Perfecta'"

**Resultado:** Racha reconocida, estudiante motivado a continuar

---

## 🔐 Consideraciones de Seguridad

### 1. Prevención de Manipulación

**Problema:** Usuario podría intentar manipular criterios de achievements

**Soluciones:**
```typescript
// Backend valida criterios antes de desbloquear
async function unlockAchievement(userId: string, achievementId: string) {
  // 1. Verificar que criterios se cumplan REALMENTE
  const criteriaMetFlagg = await verifyCriteria(userId, achievementId);
  if (!criteriaMetFlagg) {
    throw new ForbiddenException('Criteria not met');
  }

  // 2. Verificar que no esté ya desbloqueado
  const alreadyUnlocked = await checkIfUnlocked(userId, achievementId);
  if (alreadyUnlocked) {
    throw new ConflictException('Already unlocked');
  }

  // 3. Rate limiting (max 5 achievements por minuto)
  await rateLimiter.check(`unlock:${userId}`, 5, 60);

  // 4. Desbloquear
  await unlockAndReward(userId, achievementId);
}
```

### 2. Integridad de Recompensas

**Problema:** Recompensas podrían duplicarse por race conditions

**Solución:**
```sql
-- Transaction con locks
BEGIN;

-- Lock row del user
SELECT * FROM gamification_system.user_stats
WHERE user_id = $1
FOR UPDATE;

-- Insertar achievement (UNIQUE constraint previene duplicados)
INSERT INTO gamification_system.user_achievements (user_id, achievement_id)
VALUES ($1, $2)
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- Otorgar recompensas solo si se insertó
GET DIAGNOSTICS rows_inserted = ROW_COUNT;
IF rows_inserted > 0 THEN
    UPDATE gamification_system.user_stats
    SET total_xp = total_xp + $3,
        ml_coins = ml_coins + $4
    WHERE user_id = $1;
END IF;

COMMIT;
```

### 3. Secretos vs Públicos

Algunos achievements pueden ser **secretos** (sorpresas):
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  isSecret: boolean; // Si true, no mostrar en galería hasta desbloquear
  hints?: string[]; // Pistas opcionales
}
```

---

## ✅ Criterios de Aceptación

### AC-001: ENUMs Implementados
- [x] ENUM `achievement_type` con 4 valores
- [x] ENUM `achievement_category` con 7 valores
- [x] Tabla `achievements` usa ambos ENUMs
- [x] Tabla `user_achievements` tracking desbloqueos

### AC-002: Criterios Verificables
- [x] Todos los achievements tienen criterios en JSONB
- [x] Sistema verifica criterios antes de desbloquear
- [x] Triggers automáticos verifican después de acciones clave

### AC-003: Recompensas Otorgadas
- [x] XP se suma correctamente a `user_stats`
- [x] ML Coins se suman correctamente
- [x] Badges aparecen en perfil del usuario
- [x] Rank promotions se disparan automáticamente

### AC-004: Notificaciones Enviadas
- [x] Notificación `achievement_unlocked` enviada
- [x] Modal de celebración muestra en frontend
- [x] Confetti/animación visible

### AC-005: Galería Funcional
- [x] Galería muestra achievements desbloqueados
- [x] Achievements bloqueados visibles (o secretos)
- [x] Progreso visible para achievements en curso
- [x] Detalle completo al hacer click

---

## 🧪 Testing

### Test Case 1: Desbloquear achievement al completar módulo
```typescript
test('Achievement unlocks when module completed', async () => {
  const user = await createUser();
  const module = await createModule();

  // Completar todos los ejercicios del módulo
  await completeAllExercises(user.id, module.id);

  // Verificar achievement desbloqueado
  const achievements = await getUnlockedAchievements(user.id);
  expect(achievements).toContainEqual(
    expect.objectContaining({
      name: 'Módulo Maestro',
      type: 'milestone',
      category: 'completion',
    })
  );

  // Verificar recompensas
  const userStats = await getUserStats(user.id);
  expect(userStats.total_xp).toBeGreaterThanOrEqual(100);
  expect(userStats.ml_coins).toBeGreaterThanOrEqual(50);
});
```

### Test Case 2: No duplicar achievement
```typescript
test('Cannot unlock same achievement twice', async () => {
  const user = await createUser();
  const achievement = await createAchievement();

  // Desbloquear primera vez
  await unlockAchievement(user.id, achievement.id);

  // Intentar desbloquear segunda vez
  await expect(
    unlockAchievement(user.id, achievement.id)
  ).rejects.toThrow(ConflictException);

  // Verificar que solo hay 1 registro
  const count = await countUserAchievements(user.id, achievement.id);
  expect(count).toBe(1);
});
```

### Test Case 3: Galería muestra correctamente
```typescript
test('Gallery shows unlocked and locked achievements', async () => {
  const user = await createUser();

  // Crear 3 achievements
  const ach1 = await createAchievement({ name: 'First' });
  const ach2 = await createAchievement({ name: 'Second' });
  const ach3 = await createAchievement({ name: 'Third' });

  // Desbloquear solo el primero
  await unlockAchievement(user.id, ach1.id);

  // Obtener galería
  const gallery = await getAchievementGallery(user.id);

  expect(gallery.unlocked).toHaveLength(1);
  expect(gallery.unlocked[0].name).toBe('First');
  expect(gallery.locked).toHaveLength(2);
});
```

---

## 📚 Referencias Adicionales

### Documentos Relacionados
- 📄 [RF-GAM-002: Sistema de Comodines](./RF-GAM-002-comodines.md)
- 📄 [RF-NOT-001: Tipos de Notificaciones](../../06-notificaciones/RF-NOT-001-tipos-notificaciones.md) - `achievement_unlocked`
- 📄 [RF-PRG-001: Tracking de Progreso](../../04-progreso-seguimiento/RF-PRG-001-tracking-progreso.md) - Triggers de achievements

### Teoría de Gamificación
- [Octalysis Framework](https://yukaichou.com/gamification-examples/octalysis-complete-gamification-framework/) - Core drives
- [Bartle's Player Types](https://en.wikipedia.org/wiki/Bartle_taxonomy_of_player_types) - Achievers, Explorers, Socializers, Killers

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación inicial del requerimiento |

---

**Documento:** `docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md`
**Ruta relativa desde docs/:** `01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md`
