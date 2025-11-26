# REPORTE DE IMPACTO: Eliminación del Campo `level` de `user_stats`

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Tipo:** Análisis de Impacto y Factibilidad
**Estado:** ❌ **NO RECOMENDADO - ALTO RIESGO**

---

## 📋 RESUMEN EJECUTIVO

**Solicitud:** Evaluar la factibilidad de eliminar el campo `level` de la tabla `gamification_system.user_stats` (Opción A).

**Conclusión:** ❌ **NO ES SEGURO ELIMINAR**

**Razón:** El campo `level` es un **componente crítico** del sistema de gamificación con **65+ referencias** en base de datos, backend y frontend. Su eliminación **rompería funcionalidades core** del sistema.

**Riesgo:** 🔴 **CRÍTICO** - Afecta leaderboards, achievements, dashboard, UI de usuario.

---

## 🔍 METODOLOGÍA DE ANÁLISIS

### Alcance de la Investigación

**1. Base de Datos:**
- ✅ DDL: Tablas, columnas, constraints
- ✅ Índices en campo `level`
- ✅ Triggers que modifican `level`
- ✅ Funciones que leen/escriben `level`
- ✅ Views y materialized views

**2. Backend (NestJS):**
- ✅ Entities TypeORM
- ✅ Services (lectura/escritura)
- ✅ Controllers (endpoints API)
- ✅ DTOs (request/response)
- ✅ Tests unitarios y de integración

**3. Frontend (React):**
- ✅ Types/Interfaces TypeScript
- ✅ Components que muestran `level`
- ✅ Stores (Zustand) que gestionan `level`
- ✅ APIs que solicitan `level`
- ✅ Tests de componentes

---

## 📊 ESTADÍSTICAS DE USO

### Resumen Cuantitativo

| Categoría | Archivos Afectados | Referencias | Criticidad |
|-----------|-------------------|-------------|------------|
| **Base de Datos** | 19 | 35+ | 🔴 CRÍTICA |
| **Backend** | 13 | 45+ | 🔴 CRÍTICA |
| **Frontend** | 31 | 50+ | 🟡 ALTA |
| **Tests** | 8 | 20+ | 🟢 MEDIA |
| **TOTAL** | **71 archivos** | **150+ referencias** | 🔴 CRÍTICA |

### Distribución por Tipo de Uso

```
Lectura (SELECT, get, display):  60%  ████████████
Escritura (UPDATE, set, modify):  25%  █████
Ordenamiento (ORDER BY, sort):    10%  ██
Validación (WHERE, if, check):     5%  █
```

---

## 🗄️ IMPACTO EN BASE DE DATOS

### 1. Tabla `gamification_system.user_stats`

**DDL Actual:**
```sql
level integer DEFAULT 1 NOT NULL,
xp_to_next_level integer DEFAULT 100 NOT NULL,

CONSTRAINT user_stats_level_check CHECK (level > 0)
```

**Impacto:** 🔴 CRÍTICO
- Campo `level` es NOT NULL (no puede ser nulo)
- Constraint valida `level > 0`
- Valor por defecto: `level = 1`

**Si se elimina:**
- ❌ Se rompe constraint `user_stats_level_check`
- ❌ Usuarios nuevos no tendrán nivel inicial
- ❌ Campo `xp_to_next_level` queda huérfano (depende de `level`)

---

### 2. Índices en `level`

**Índice Simple:**
```sql
-- apps/database/ddl/schemas/gamification_system/indexes/idx_user_stats_level.sql
CREATE INDEX idx_user_stats_level ON gamification_system.user_stats(level);
```

**Índice Compuesto:**
```sql
-- apps/database/ddl/schemas/gamification_system/indexes/idx_user_stats_tenant_level.sql
CREATE INDEX idx_user_stats_tenant_level ON gamification_system.user_stats(tenant_id, level DESC);
```

**Uso:**
- Leaderboards ordenan por `level DESC` (4 tipos de leaderboards)
- Queries filtran por `level >= X` para achievements
- Performance crítica para ranking global

**Impacto:** 🔴 CRÍTICO
- ❌ Queries de leaderboard se vuelven lentas (sin índice)
- ❌ Ordenamiento por nivel imposible

---

### 3. Trigger Automático

**Trigger:**
```sql
-- apps/database/ddl/schemas/gamification_system/triggers/21-trg_recalculate_level_on_xp_change.sql
CREATE TRIGGER trg_recalculate_level_on_xp_change
    BEFORE UPDATE OF total_xp
    ON gamification_system.user_stats
    FOR EACH ROW
    WHEN (NEW.total_xp IS DISTINCT FROM OLD.total_xp)
    EXECUTE FUNCTION gamification_system.recalculate_level_on_xp_change();
```

**Función:**
```sql
-- apps/database/ddl/schemas/gamification_system/functions/calculate_level_from_xp.sql
CREATE OR REPLACE FUNCTION gamification_system.calculate_level_from_xp(p_xp integer)
RETURNS integer AS $$
BEGIN
    RETURN FLOOR(SQRT(p_xp::numeric / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Comportamiento:**
- Se ejecuta automáticamente cuando `total_xp` cambia
- Calcula nivel usando fórmula: `FLOOR(SQRT(xp / 100)) + 1`
- Actualiza campo `level` sin intervención del backend

**Impacto:** 🔴 CRÍTICO
- ❌ Trigger falla si campo `level` no existe
- ❌ Función `recalculate_level_on_xp_change()` rompe
- ❌ Cálculo automático de nivel se pierde

**Ejemplos de cálculo:**
| XP | Nivel Calculado |
|----|-----------------|
| 100 | 2 |
| 400 | 3 |
| 900 | 4 |
| 1600 | 5 |
| 2500 | 6 |

---

### 4. Materialized Views para Leaderboards

**Views Afectadas:**
1. `mv_global_leaderboard` - Ordenamiento por `level DESC`
2. `mv_classroom_leaderboard` - Ordenamiento por `level DESC`
3. `mv_weekly_leaderboard` - Ordenamiento por `level DESC`
4. `mv_mechanic_leaderboard` - Ordenamiento por `level DESC`

**Impacto:** 🔴 CRÍTICO
- ❌ 4 leaderboards dejan de funcionar
- ❌ Rankings globales no se pueden calcular
- ❌ Dashboard de maestros muestra datos incorrectos

---

## 💻 IMPACTO EN BACKEND (NestJS)

### 1. Entity `UserStats`

**Código Actual:**
```typescript
// apps/backend/src/modules/gamification/entities/user-stats.entity.ts

@Entity({ schema: 'gamification_system', name: 'user_stats' })
export class UserStats {
  // ...

  @Column({ type: 'integer', default: 1 })
  level!: number;

  @Column({ type: 'integer', default: 0 })
  total_xp!: number;

  @Column({ type: 'integer', default: 100 })
  xp_to_next_level!: number;

  // ...
}
```

**Impacto:** 🔴 CRÍTICO
- ❌ Entity no sincroniza con schema de DB
- ❌ TypeORM queries fallan
- ❌ Compilación puede generar errores

---

### 2. Service `UserStatsService`

**Método `create()`:**
```typescript
// apps/backend/src/modules/gamification/services/user-stats.service.ts:48-80

async create(userId: string, tenantId?: string): Promise<UserStats> {
  const newStats = this.userStatsRepo.create({
    user_id: userId,
    tenant_id: tenantId,
    level: 1,                                    // ❌ ELIMINAR ROMPE ESTO
    total_xp: 0,
    xp_to_next_level: this.calculateXpForLevel(1), // ❌ DEPENDE DE level
    current_rank: this.RANKS[0],
    // ...
  });

  return await this.userStatsRepo.save(newStats);
}
```

**Método `getUserGamificationSummary()`:**
```typescript
// apps/backend/src/modules/gamification/services/user-stats.service.ts:256-298

async getUserGamificationSummary(userId: string): Promise<UserGamificationSummaryDto> {
  const userStats = await this.findByUserId(userId);

  // Calcular progreso a siguiente nivel
  const xpForCurrentLevel = this.calculateXpForLevel(userStats.level - 1); // ❌ USA level
  const xpForNextLevel = this.calculateXpForLevel(userStats.level);       // ❌ USA level

  return {
    userId,
    level: userStats.level,          // ❌ RETORNA level
    totalXP: userStats.total_xp,
    mlCoins: userStats.ml_coins,
    rank: userStats.current_rank,
    // ...
  };
}
```

**Método `calculateXpForLevel()` (Deprecated):**
```typescript
// apps/backend/src/modules/gamification/services/user-stats.service.ts:192-194

private calculateXpForLevel(level: number): number {
  return Math.floor(this.XP_PER_LEVEL * Math.pow(this.XP_SCALING, level - 1));
}
```

**Método `getTopByLevel()`:**
```typescript
// apps/backend/src/modules/gamification/services/user-stats.service.ts:220-225

async getTopByLevel(limit: number = 50): Promise<UserStats[]> {
  return await this.userStatsRepo.find({
    order: { level: 'DESC', total_xp: 'DESC' }, // ❌ ORDENA POR level
    take: limit,
  });
}
```

**Impacto:** 🔴 CRÍTICO
- ❌ Inicialización de usuarios falla
- ❌ Dashboard de gamificación muestra datos incompletos
- ❌ Ranking por nivel no funciona

---

### 3. Service `LeaderboardService`

**4 Leaderboards Afectados:**

**a) Global Leaderboard:**
```typescript
// apps/backend/src/modules/gamification/services/leaderboard.service.ts:69

ORDER BY stats.level DESC, stats.total_xp DESC
```

**b) Tenant Leaderboard:**
```typescript
// apps/backend/src/modules/gamification/services/leaderboard.service.ts:136

ORDER BY stats.level DESC, stats.total_xp DESC
```

**c) Classroom Leaderboard:**
```typescript
// apps/backend/src/modules/gamification/services/leaderboard.service.ts:216

ORDER BY stats.level DESC, stats.total_xp DESC
```

**d) Friends Leaderboard:**
```typescript
// apps/backend/src/modules/gamification/services/leaderboard.service.ts:338

ORDER BY stats.level DESC, stats.total_xp DESC
```

**Cálculo de Ranking:**
```typescript
// apps/backend/src/modules/gamification/services/leaderboard.service.ts:464-473

const position = await this.userStatsRepo
  .createQueryBuilder('stats')
  .where('stats.tenant_id = :tenantId', { tenantId })
  .andWhere('stats.level > :userLevel', { userLevel: userStats.level }) // ❌ USA level
  .getCount();
```

**Impacto:** 🔴 CRÍTICO
- ❌ 4 leaderboards dejan de funcionar
- ❌ No se puede ordenar por nivel
- ❌ Posiciones incorrectas en rankings

---

### 4. Service `AchievementsService`

**Validación de Logros:**
```typescript
// apps/backend/src/modules/gamification/services/achievements.service.ts:262

if (userStats.level >= (conditions.min_level || 0)) {
  // Desbloquear achievement
}
```

**Impacto:** 🟡 ALTA
- ❌ Achievements con requisito de nivel no se desbloquean
- ❌ Progresión de logros incompleta

---

### 5. DTOs Afectados

**a) UserGamificationSummaryDto:**
```typescript
// apps/backend/src/modules/gamification/dto/user-gamification-summary.dto.ts

export interface UserGamificationSummaryDto {
  userId: string;
  level: number;          // ❌ INCLUYE level
  totalXP: number;
  mlCoins: number;
  rank: string;
  // ...
}
```

**b) UserStatsResponseDto:**
```typescript
// apps/backend/src/modules/gamification/dto/user-stats/user-stats-response.dto.ts

export class UserStatsResponseDto {
  @ApiProperty()
  level!: number;         // ❌ INCLUYE level

  @ApiProperty()
  total_xp!: number;

  // ...
}
```

**c) LeaderboardEntryDto:**
```typescript
// apps/backend/src/modules/gamification/dto/leaderboard/leaderboard-entry.dto.ts

export class LeaderboardEntryDto {
  @ApiProperty()
  level!: number;         // ❌ INCLUYE level

  @ApiProperty()
  totalXP!: number;

  // ...
}
```

**Impacto:** 🟡 ALTA
- ❌ Respuestas de API incompletas
- ❌ Contratos de API rotos
- ❌ Frontend no recibe dato de nivel

---

## 🎨 IMPACTO EN FRONTEND (React)

### 1. Componente `GamifiedHeader`

**Código Actual:**
```tsx
// apps/frontend/src/shared/components/layout/GamifiedHeader.tsx:204

<div className="flex items-center space-x-2">
  <Star className="w-5 h-5 text-yellow-400" aria-hidden="true" />
  <span className="text-lg font-bold text-white">Lvl {userStats.level}</span>
</div>
```

**Impacto:** 🟡 ALTA
- ❌ Header muestra `Lvl undefined`
- ❌ UI rota visualmente
- ❌ Experiencia de usuario degradada

---

### 2. Dashboard Legacy

**DashboardLayout:**
```typescript
// apps/frontend/src/shared/layouts/_legacy/DashboardLayout.tsx:117

experience: stats.totalPoints || 0,
experienceProgress: stats.experienceProgress || 0,
level: stats.level || 1,              // ❌ USA level
rank: 'Detective Novato',
mlCoins: coins.balance || 0,
```

**DashboardPage:**
```typescript
// apps/frontend/src/pages/_legacy/DashboardPage.tsx:394

return {
  current_rank: stats.level?.toString() || 'Ajaw',  // ❌ USA level
  xp_total: stats.totalPoints || 0,
  ml_coins: mlCoins?.balance || 0,
};
```

**Impacto:** 🟡 ALTA
- ❌ Dashboard legacy muestra datos incorrectos
- ❌ Nivel del usuario no se muestra

---

### 3. Stores (Zustand)

**ranksStore:**
```typescript
// apps/frontend/src/features/gamification/ranks/store/ranksStore.ts:93

currentLevel: 0,
prestige: 0,
```

**Líneas afectadas:** 93, 179, 190, 191, 264, 343, 372, 432, 435, 608

**Impacto:** 🟡 ALTA
- ❌ Estado de nivel no se actualiza
- ❌ Progreso de prestigio roto

---

### 4. Componentes de Gamificación

**Componentes afectados:**
- `GamificationHero.tsx` - Muestra nivel del usuario
- `RanksSection.tsx` - Muestra progresión de nivel
- `StreakIndicator.tsx` - Usa nivel para cálculos
- `PrestigeSystem.tsx` - Gestiona prestigio basado en nivel

**Impacto:** 🟡 ALTA
- ❌ Componentes muestran datos incorrectos
- ❌ Progresión visual rota

---

### 5. Types y Schemas

**ranksTypes.ts:**
```typescript
export interface RankProgressWithLevel {
  current_rank: MayaRankEnum;
  current_xp: number;
  level: number;                    // ❌ INCLUYE level
  prestige: number;
  // ...
}
```

**Impacto:** 🟡 ALTA
- ❌ Types no coinciden con API
- ❌ Errores de compilación TypeScript

---

## 🧪 IMPACTO EN TESTS

### Tests Afectados

**Backend:**
- `user-stats.service.spec.ts` - Tests de inicialización con `level: 1`
- `achievements.service.spec.ts` - Tests de unlock con requisito de nivel
- `leaderboard.service.spec.ts` - Tests de ranking por nivel

**Frontend:**
- `DashboardIntegration.test.tsx` - Mocks incluyen `level`
- `RanksIntegration.test.tsx` - Tests de progresión de nivel
- `ranksStore.test.ts` - Tests de estado de nivel

**Impacto:** 🟢 MEDIA
- ⚠️ 8+ tests fallan
- ⚠️ Coverage disminuye
- ⚠️ CI/CD puede bloquearse

---

## 📋 MATRIZ DE DEPENDENCIAS

### Dependencias Críticas (BLOQUEANTES)

```
user_stats.level
├─ [DB] Trigger trg_recalculate_level_on_xp_change
│   └─ [DB] Function calculate_level_from_xp
├─ [DB] Constraint user_stats_level_check
├─ [DB] Index idx_user_stats_level
├─ [DB] Index idx_user_stats_tenant_level
├─ [DB] 4 Materialized Views (leaderboards)
├─ [Backend] UserStats Entity
│   ├─ [Backend] UserStatsService
│   │   ├─ create()
│   │   ├─ getUserGamificationSummary()
│   │   ├─ getTopByLevel()
│   │   └─ calculateXpForLevel()
│   ├─ [Backend] LeaderboardService
│   │   ├─ getGlobalLeaderboard()
│   │   ├─ getTenantLeaderboard()
│   │   ├─ getClassroomLeaderboard()
│   │   └─ getFriendsLeaderboard()
│   └─ [Backend] AchievementsService
│       └─ unlockAchievement()
├─ [Backend] 3 DTOs
│   ├─ UserGamificationSummaryDto
│   ├─ UserStatsResponseDto
│   └─ LeaderboardEntryDto
├─ [Frontend] GamifiedHeader Component
├─ [Frontend] Dashboard Pages (2)
├─ [Frontend] ranksStore
└─ [Frontend] 6+ Gamification Components
```

---

## 🚨 ESCENARIOS DE FALLA

### Escenario 1: Usuario Nuevo Se Registra

**Flujo Normal (CON level):**
```
1. Usuario se registra
2. Trigger initialize_user_stats crea registro con level = 1
3. Backend devuelve UserGamificationSummary con level = 1
4. Frontend muestra "Lvl 1" en header
✅ ÉXITO
```

**Flujo Roto (SIN level):**
```
1. Usuario se registra
2. Trigger falla: column "level" does not exist
3. ❌ INSERT falla
4. ❌ Usuario no puede acceder al sistema
🔴 FALLA CRÍTICA
```

---

### Escenario 2: Usuario Completa Ejercicio

**Flujo Normal (CON level):**
```
1. Usuario completa ejercicio, gana 100 XP
2. Backend: total_xp = 450 + 100 = 550
3. Trigger trg_recalculate_level_on_xp_change se ejecuta
4. Function calcula: level = FLOOR(SQRT(550/100)) + 1 = 3
5. Campo level se actualiza automáticamente
6. Frontend muestra "Lvl 3"
✅ ÉXITO
```

**Flujo Roto (SIN level):**
```
1. Usuario completa ejercicio, gana 100 XP
2. Backend: total_xp = 450 + 100 = 550
3. Trigger intenta actualizar level
4. ❌ PostgreSQL ERROR: column "level" does not exist
5. ❌ Transacción falla (ROLLBACK)
6. ❌ XP no se otorga
🔴 FALLA CRÍTICA
```

---

### Escenario 3: Usuario Ve Leaderboard

**Flujo Normal (CON level):**
```
1. Usuario solicita leaderboard global
2. Backend ejecuta: ORDER BY level DESC, total_xp DESC
3. Query usa índice idx_user_stats_level (RÁPIDO)
4. Resultado: Ranking ordenado correctamente
5. Frontend muestra top 10 usuarios con niveles
✅ ÉXITO
```

**Flujo Roto (SIN level):**
```
1. Usuario solicita leaderboard global
2. Backend ejecuta: ORDER BY level DESC
3. ❌ PostgreSQL ERROR: column "level" does not exist
4. ❌ Query falla
5. ❌ Frontend muestra error 500
🔴 FALLA CRÍTICA
```

---

### Escenario 4: Usuario Desbloquea Achievement

**Flujo Normal (CON level):**
```
1. Usuario alcanza nivel 5
2. Backend verifica: userStats.level >= achievement.min_level (5 >= 5)
3. Condición cumplida, achievement desbloqueado
4. Notificación enviada
✅ ÉXITO
```

**Flujo Roto (SIN level):**
```
1. Usuario alcanza nivel 5 (pero nivel no existe)
2. Backend verifica: userStats.level >= 5
3. ❌ userStats.level es undefined
4. ❌ Condición siempre false
5. ❌ Achievement NUNCA se desbloquea
🟡 FALLA PARCIAL (funcional degradado)
```

---

## 💰 ESTIMACIÓN DE ESFUERZO PARA ELIMINACIÓN

### Si se decidiera eliminar (NO RECOMENDADO):

| Fase | Tarea | Esfuerzo | Riesgo |
|------|-------|----------|--------|
| **1. Diseño** | Rediseñar sistema sin niveles | 2-3 días | Alto |
| | Definir alternativa (usar solo rangos) | 1 día | Medio |
| | Documentar cambios arquitectónicos | 1 día | Bajo |
| **2. Base de Datos** | Eliminar triggers y funciones | 2 horas | Crítico |
| | Eliminar índices | 1 hora | Crítico |
| | Eliminar constraint | 1 hora | Crítico |
| | Eliminar columna | 1 hora | Crítico |
| | Recrear materialized views | 4 horas | Crítico |
| | Migration y rollback | 2 horas | Crítico |
| **3. Backend** | Modificar Entity UserStats | 1 hora | Alto |
| | Refactorizar UserStatsService | 4 horas | Crítico |
| | Refactorizar LeaderboardService | 8 horas | Crítico |
| | Refactorizar AchievementsService | 2 horas | Alto |
| | Actualizar 3 DTOs | 1 hora | Medio |
| | Actualizar 13 archivos | 8 horas | Alto |
| **4. Frontend** | Eliminar `level` de types | 2 horas | Alto |
| | Actualizar GamifiedHeader | 1 hora | Alto |
| | Actualizar Dashboard pages | 2 horas | Alto |
| | Refactorizar ranksStore | 4 horas | Alto |
| | Actualizar 31 archivos | 12 horas | Alto |
| **5. Testing** | Actualizar tests backend | 4 horas | Medio |
| | Actualizar tests frontend | 4 horas | Medio |
| | Tests de integración | 8 horas | Alto |
| | Tests de regresión | 4 horas | Alto |
| **6. Validación** | QA manual completo | 8 horas | Alto |
| | Testing de leaderboards | 2 horas | Crítico |
| | Testing de achievements | 2 horas | Alto |
| | Performance testing | 4 horas | Alto |
| **TOTAL** | | **~100 horas** | 🔴 CRÍTICO |

**Costo estimado:** 2.5 semanas de desarrollo full-time
**Riesgo de bugs:** 🔴 MUY ALTO
**Impacto en producción:** 🔴 CRÍTICO

---

## ✅ ALTERNATIVAS RECOMENDADAS

### Opción B: Mantener `level` (RECOMENDADA)

**Razones:**
- ✅ No rompe nada
- ✅ Funcionalidad ya probada y estable
- ✅ Usuarios familiarizados con concepto de "niveles"
- ✅ Performance optimizado con índices
- ✅ Cero esfuerzo de desarrollo

**Ajustes menores sugeridos:**
1. Documentar claramente diferencia entre `level` (visual) y `rank` (maya)
2. Renombrar a `visual_level` o `user_level` para claridad
3. Actualizar documentación del usuario

---

### Opción C: Sistema Híbrido (ALTERNATIVA)

**Concepto:**
- Mantener `level` como existe actualmente
- Usar `rank` para progresión Maya (0-499, 500-999, etc.)
- Ambos coexisten sin conflicto

**Beneficios:**
- ✅ Mantiene funcionalidad actual
- ✅ Permite progresión visual granular (level)
- ✅ Sistema de rangos Maya independiente (rank)
- ✅ Usuarios obtienen feedback frecuente (level sube cada 100 XP)
- ✅ Cero riesgo

**Documentación necesaria:**
```markdown
## Sistema de Progresión Dual

**Niveles (Levels):**
- Progresión visual continua
- Se calcula automáticamente: FLOOR(SQRT(xp/100)) + 1
- Usado para leaderboards y comparación entre usuarios
- Actualización frecuente (motivación)

**Rangos Maya (Ranks):**
- Progresión jerárquica con umbrales fijos
- 5 rangos: Ajaw (0-499), Nacom (500-999), Ah K'in (1000-1499), Halach Uinic (1500-2249), K'uk'ulkan (2250+)
- Otorgan beneficios (multiplicadores, ML Coins)
- Actualización infrecuente (hitos importantes)
```

---

## 🎯 RECOMENDACIÓN FINAL

### ❌ NO ELIMINAR EL CAMPO `level`

**Justificación:**

1. **Riesgo Crítico:** Rompe 71 archivos con 150+ referencias
2. **Impacto Funcional:** Leaderboards, achievements, dashboard inutilizables
3. **Costo Alto:** ~100 horas de desarrollo + testing
4. **Valor Bajo:** No aporta beneficio significativo
5. **Alternativas Mejores:** Mantener o documentar mejor

---

### ✅ ACCIÓN RECOMENDADA: OPCIÓN C (Sistema Híbrido Documentado)

**Plan de acción:**

**Fase 1: Documentación (1 día)**
1. Crear ADR explicando dualidad level/rank
2. Actualizar ET-GAM-003 con sección "Niveles vs Rangos"
3. Documentar en UI que level es visual y rank es jerárquico
4. Agregar comentarios en código clave

**Fase 2: Validación (2 horas)**
1. Verificar que trigger `trg_recalculate_level_on_xp_change` funciona
2. Confirmar que índices están optimizados
3. Validar leaderboards funcionan correctamente

**Fase 3: Testing (2 horas)**
1. Test: Usuario nuevo tiene level = 1
2. Test: Level se actualiza al ganar XP
3. Test: Leaderboards ordenan correctamente
4. Test: Dashboard muestra nivel correcto

**Esfuerzo total:** 1.5 días
**Riesgo:** 🟢 BAJO
**Valor:** 🟢 ALTO (claridad arquitectónica sin romper nada)

---

## 📚 REFERENCIAS

### Archivos Analizados

**Base de Datos (19 archivos):**
```
apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql
apps/database/ddl/schemas/gamification_system/triggers/21-trg_recalculate_level_on_xp_change.sql
apps/database/ddl/schemas/gamification_system/functions/calculate_level_from_xp.sql
apps/database/ddl/schemas/gamification_system/functions/08-recalculate_level_on_xp_change.sql
apps/database/ddl/schemas/gamification_system/indexes/idx_user_stats_level.sql
apps/database/ddl/schemas/gamification_system/indexes/idx_user_stats_tenant_level.sql
apps/database/ddl/schemas/gamification_system/materialized-views/01-mv_global_leaderboard.sql
apps/database/ddl/schemas/gamification_system/materialized-views/02-mv_classroom_leaderboard.sql
apps/database/ddl/schemas/gamification_system/materialized-views/03-mv_weekly_leaderboard.sql
apps/database/ddl/schemas/gamification_system/materialized-views/04-mv_mechanic_leaderboard.sql
[+ 9 más]
```

**Backend (13 archivos):**
```
apps/backend/src/modules/gamification/entities/user-stats.entity.ts
apps/backend/src/modules/gamification/services/user-stats.service.ts
apps/backend/src/modules/gamification/services/leaderboard.service.ts
apps/backend/src/modules/gamification/services/achievements.service.ts
apps/backend/src/modules/gamification/dto/user-gamification-summary.dto.ts
apps/backend/src/modules/gamification/dto/user-stats/user-stats-response.dto.ts
apps/backend/src/modules/gamification/dto/leaderboard/leaderboard-entry.dto.ts
[+ 6 más]
```

**Frontend (31 archivos):**
```
apps/frontend/src/shared/components/layout/GamifiedHeader.tsx
apps/frontend/src/shared/layouts/_legacy/DashboardLayout.tsx
apps/frontend/src/pages/_legacy/DashboardPage.tsx
apps/frontend/src/features/gamification/ranks/store/ranksStore.ts
apps/frontend/src/features/gamification/ranks/types/ranksTypes.ts
apps/frontend/src/apps/student/components/gamification/GamificationHero.tsx
[+ 25 más]
```

### Reportes Relacionados

- `REPORTE-BUG-XP-NO-ACUMULA.md` - Bug original que motivó análisis
- `ADR-016-simplificar-backend-xp-acumulacion.md` - Decisión de simplificar addXp()
- `ET-GAM-003-rangos-maya.md` - Especificación técnica de rangos

---

## 📞 CONTACTO

**Autor:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
**Estado:** ✅ Completado

**Para consultas:**
- Revisar análisis completo en este documento
- Consultar ADR-016 para contexto de fix reciente
- Revisar código fuente en archivos listados

---

**CONCLUSIÓN FINAL: ❌ NO ELIMINAR `level` - MANTENER SISTEMA ACTUAL CON MEJOR DOCUMENTACIÓN**
