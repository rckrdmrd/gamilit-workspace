---
title: Portal Student - Flujos, Gamificación y Responsive
status: activo
last_updated: "2026-02-28"
---

# Portal Student - Flujos, Gamificación y Responsive

[<-- Volver al Hub](../PORTAL-STUDENT-GUIDE.md) | Anterior: [03-HOOKS-ESTADO.md](./03-HOOKS-ESTADO.md) | Siguiente: [05-CALIDAD.md](./05-CALIDAD.md)

---

## 8. Flujos Principales

### 8.1 Flujo: Completar Ejercicio

```
1. Student navega a /exercises/:exerciseId
   ↓
2. ExercisePage carga ejercicio: GET /educational/exercises/:exerciseId
   ↓
3. useExerciseState inicializa estado local
   ↓
4. useExerciseAutoSave inicia (cada 30s):
   POST /progress/exercises/:exerciseId/save
   ↓
5. Student completa ejercicio y presiona "Submit"
   ↓
6. POST /progress/exercises/:exerciseId/submit
   {
     answers: {...},
     timeSpent: 180,
     hintsUsed: 1,
     powerupsUsed: ['hint_revealer', 'pistas', 'segunda_oportunidad']  // Legacy + comodines usados
   }
   ↓
6b. Si comodín "Segunda Oportunidad" activo y score < 70:
    - FeedbackModal tipo "info" (no penaliza)
    - Estudiante reintenta (UI desbloqueada)
    - Segundo envío procesado normalmente
   ↓
7. Backend procesa submission:
   - **M1-M2 (auto-grade):** Calcula score, XP ganado, ML Coins automaticamente
   - **M3-M5 (teacher-grade):** Guarda submission con status=pending_review, NO calcula score
   ↓
8. Response:
   M1-M2:
   {
     score: 85,
     maxScore: 100,
     xpEarned: 120,
     mlCoinsEarned: 50,
     achievements: ['first_completion'],
     feedback: {...}
   }
   M3-M5:
   {
     status: 'pending_review',
     message: 'Tu trabajo fue enviado. El maestro lo revisara pronto.'
   }
   ↓
9. FeedbackModal muestra resultados (M1-M2) o confirmacion de envio (M3-M5)
   ↓
10. Si achievement desbloqueado → AchievementToast (solo M1-M2 inmediato)
   ↓
11. Si rank up → RankUpModal (solo M1-M2 inmediato)
   ↓
11b. Si cosméticos equipados → RankProgressWidget muestra frame/badge en dashboard
   ↓
12. Redirect a /modules o /dashboard
```

### 8.2 Flujo: Ganar XP y Subir de Rango

```
1. Student completa ejercicio → Gana XP (ej: 120 XP)
   ↓
2. Backend actualiza user_stats.total_xp
   ↓
3. Backend verifica si XP >= siguiente rank:
   SELECT * FROM gamification_system.maya_ranks
   WHERE xp_required <= :totalXP
   ORDER BY xp_required DESC LIMIT 1
   ↓
4. Si cambió rank:
   - Actualizar user_rank.current_rank
   - Crear entry en rank_progression_history
   - Crear achievement 'rank_up_{rankName}'
   ↓
5. Response incluye:
   {
     rankUp: true,
     newRank: 'Nacom',
     newMultiplier: 1.2,
     prestigePoints: 0
   }
   ↓
6. Frontend muestra RankUpModal con celebración
   ↓
7. ranksStore.fetchUserProgress() actualiza estado
```

### 8.3 Flujo: Comprar Item en Shop

```
1. Student navega a /shop
   ↓
2. GET /gamification/shop/items → Lista items disponibles
   ↓
3. Student selecciona item → Modal de confirmación
   ↓
4. Verificar balance suficiente
   ↓
5. POST /gamification/shop/purchase
   {
     itemId: 'hint_revealer',
     quantity: 1
   }
   ↓
6. Backend:
   - Verifica balance >= item.price
   - Deducir ML Coins
   - Agregar item a inventory
   - Crear transaction log
   ↓
7. Response:
   {
     success: true,
     newBalance: 450,
     item: {...}
   }
   ↓
8. Frontend:
   - economyStore.fetchBalance() (actualiza balance)
   - Toast: "Item comprado exitosamente"
   - Modal cierra
   - Para items consumibles (Pista de Detective, Vision Lectora, Segunda Oportunidad): la compra también incrementa el inventario de comodines disponibles en ejercicios
```

---

## 9. Sistema de Gamificación Detallado

### 9.1 Cálculo de XP

**Fórmula Base:**

```typescript
baseXP = exercise.points; // Ej: 100 XP

// Multiplicadores
scoreMultiplier = (score / maxScore); // Ej: 85/100 = 0.85
rankMultiplier = userRank.multiplier;  // Ej: 1.2x (Nacom)
streakBonus = min(currentStreak * 0.05, 0.5); // Max +50%

totalXP = baseXP * scoreMultiplier * rankMultiplier * (1 + streakBonus);

// Ejemplo:
// 100 XP * 0.85 * 1.2 * 1.15 = 117.3 XP → 117 XP
```

**Bonuses Adicionales:**

- **Perfect Score:** +20% XP si score = 100%
- **Speed Bonus:** +10% XP si completa en < 50% tiempo estimado
- **No Hints Used:** +15% XP si no usó pistas
- **First Try:** +25% XP si completa en primer intento

### 9.2 Cálculo de ML Coins

**Fórmula Base:**

```typescript
baseCoins = Math.floor(exercise.points / 10); // Ej: 100 XP → 10 ML Coins

// Multiplicadores
scoreMultiplier = (score / maxScore);
difficultyBonus = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0
}[exercise.difficulty];

totalCoins = baseCoins * scoreMultiplier * difficultyBonus;

// Ejemplo (hard, 85% score):
// 10 * 0.85 * 2.0 = 17 ML Coins
```

### 9.3 Sistema de Streaks

**Cómo funciona:**

- **Racha (Streak):** Días consecutivos con al menos 1 ejercicio completado
- **Zona horaria:** UTC-5 (Colombia)
- **Reset:** Si pasa 1 día completo sin actividad → streak = 0
- **Bonus XP:** +5% por cada día de racha (max +50% a 10 días)

**Guardado:**

```sql
-- En user_stats
current_streak: integer DEFAULT 0
longest_streak: integer DEFAULT 0
last_activity_date: date
```

**Lógica:**

```typescript
const today = new Date().toISOString().split('T')[0];
const lastActivity = user.lastActivityDate;

if (lastActivity === today) {
  // Mismo día, no cambiar streak
} else {
  const daysSince = daysBetween(lastActivity, today);

  if (daysSince === 1) {
    // Día consecutivo
    user.currentStreak++;
    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
  } else {
    // Se rompió la racha
    user.currentStreak = 1;
  }

  user.lastActivityDate = today;
}
```

### 9.4 ConsumablesPanel (Comodines en Ejercicios)

**Ruta:** `apps/frontend/src/features/exercises/components/ConsumablesPanel.tsx`

Panel lateral que muestra el inventario real de comodines del estudiante durante un ejercicio. Permite usar comodines directamente.

**Comodines disponibles:**

| Tipo | Label | Efecto |
|------|-------|--------|
| `pistas` | Pistas | Revela una pista para ayudar |
| `vision_lectora` | Visión Lectora | Resalta palabras clave del texto |
| `segunda_oportunidad` | Segunda Oportunidad | Permite corregir respuesta incorrecta |

**Estados del panel:**

- **Loading:** Spinner mientras carga inventario
- **Sin inventario:** Panel oculto (null)
- **Con inventario:** Muestra cada comodin con cantidad disponible (`x{N}`), usos (`{used}/{max}`), costo en ML Coins, y botón "Usar"
- **Activo:** Borde verde + badge "Activo" cuando un comodin está en uso

**Props/Context:** Usa `useExerciseContext()` → `comodines` que provee `inventory`, `canUse()`, `useComodin()`, `usageLimits`, `isLoading`, `error`.

**Integración:** El inventario se sincroniza desde las compras en la tienda vía `incrementFromShopPurchase()` bridge en `comodines.service.ts`.

### 9.5 Achievements: Triggers y Lógica

**Ejemplos de Achievements:**

| ID | Nombre | Trigger | Condición | Recompensa |
|----|--------|---------|-----------|------------|
| first_steps | Primeros Pasos | exercise_completed | count === 1 | 20 XP, 10 ML Coins |
| speed_demon | Demonio de Velocidad | exercise_completed | timeSpent < estimatedTime * 0.5 | 50 XP, 25 ML Coins |
| perfectionist | Perfeccionista | exercise_completed | score === 100 && attempts === 1 | 100 XP, 50 ML Coins |
| rank_nacom | Ascenso a Nacom | rank_up | newRank === 'Nacom' | 200 XP, 100 ML Coins |
| module_master | Maestro de Módulo | module_completed | completionRate === 100% | 500 XP, 200 ML Coins |
| streak_warrior | Guerrero Constante | daily_activity | currentStreak === 7 | 150 XP, 75 ML Coins |
| coin_collector | Coleccionista | ml_coins_earned | totalCoinsEarned >= 1000 | 100 XP, 50 ML Coins |

**Backend Logic:**

```typescript
// En exercise-submission.service.ts
async checkAchievements(userId: string, context: AchievementContext) {
  const triggers = await this.achievementsRepo.find({
    where: { trigger: context.trigger }
  });

  for (const achievement of triggers) {
    const meetsCondition = await this.evaluateCondition(
      achievement.condition,
      userId,
      context
    );

    if (meetsCondition) {
      await this.unlockAchievement(userId, achievement.id);
    }
  }
}
```

---

## 10. Responsive Design

### 10.1 Breakpoints

```typescript
// tailwind.config.js
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px'  // Extra large
}
```

### 10.2 Layout Adaptations

**Mobile (< 768px):**
- BottomNavigation visible
- Single column layouts
- Swipeable carousels
- Collapsible sections
- Touch-optimized controls (min 44x44px)

**Tablet (768px - 1024px):**
- BottomNavigation hidden
- GamifiedHeader expanded
- 2-column grids
- Sidebars overlay

**Desktop (> 1024px):**
- Full navigation
- 3-4 column grids
- Persistent sidebars
- Hover states

**Hook:**

```typescript
const { isMobile, isTablet, isDesktop } = useResponsiveLayout();

// Usage
{isMobile && <MobileView />}
{isDesktop && <DesktopSidebar />}
```

---

[<-- Volver al Hub](../PORTAL-STUDENT-GUIDE.md) | Anterior: [03-HOOKS-ESTADO.md](./03-HOOKS-ESTADO.md) | Siguiente: [05-CALIDAD.md](./05-CALIDAD.md)
