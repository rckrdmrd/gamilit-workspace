# Implementación: Notificación de RankUp en Ejercicios

**Documento Técnico de Implementación**
**Fecha**: 2025-11-26
**Tipo**: Corrección de Bug + Feature
**Afecta**: Backend, Frontend, Database

---

## 1. Contexto del Problema

### 1.1 Descripción del Bug

Los ejercicios M1-E5 (Sopa de Letras) y M2-E1 a M2-E5 no mostraban notificación de subida de rango al usuario, aunque el sistema de gamificación procesaba correctamente las promociones en la base de datos.

### 1.2 Causa Raíz Identificada

| Capa | Problema |
|------|----------|
| Backend DTO | `ExerciseSubmissionResponseDto` no exponía campos `xp_earned`, `ml_coins_earned`, `rankUp` |
| Backend Service | `claimRewards()` no detectaba si había ocurrido promoción de rango |
| Frontend | Componentes de ejercicio no integraban `RankUpModal` |

---

## 2. Solución Implementada

### 2.1 Cambios en Base de Datos

**Archivo**: `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`

```sql
-- Columnas agregadas a la tabla exercise_submissions
xp_earned integer DEFAULT 0,
ml_coins_earned integer DEFAULT 0,
```

**Migración para BD existente**:
```sql
ALTER TABLE progress_tracking.exercise_submissions
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ml_coins_earned INTEGER DEFAULT 0;
```

### 2.2 Cambios en Backend Entity

**Archivo**: `apps/backend/src/modules/progress/entities/exercise-submission.entity.ts`

```typescript
@Column({ type: 'integer', default: 0 })
xp_earned!: number;

@Column({ type: 'integer', default: 0 })
ml_coins_earned!: number;
```

### 2.3 Cambios en Backend DTO

**Archivo**: `apps/backend/src/modules/progress/dto/exercise-submission-response.dto.ts`

```typescript
@Expose()
xp_earned?: number;

@Expose()
ml_coins_earned?: number;

@Expose()
rankUp?: {
  newRank: string;
  previousRank?: string;
  bonusMLCoins: number;
  newMultiplier: number;
} | null;
```

### 2.4 Cambios en Backend Service

**Archivo**: `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Método `claimRewards()` modificado**:

1. Guarda rango actual ANTES de `addXp()`
2. Ejecuta `addXp()` (trigger de BD hace promoción)
3. Consulta rango DESPUÉS de `addXp()`
4. Compara rangos y construye objeto `rankUp` si hubo cambio
5. Persiste `xp_earned` y `ml_coins_earned` en submission
6. Retorna objeto completo incluyendo `rankUp`

**Tipo de retorno actualizado**:
```typescript
Promise<{
  submission: ExerciseSubmission;
  xp_earned: number;
  ml_coins_earned: number;
  rankUp: { newRank, previousRank, bonusMLCoins, newMultiplier } | null;
}>
```

### 2.5 Cambios en Frontend

#### Hook Nuevo: useRankUpNotification

**Archivo**: `apps/frontend/src/features/gamification/ranks/hooks/useRankUpNotification.ts`

Maneja la lógica de cascada de modales:
- FeedbackModal (resultado del ejercicio)
- RankUpModal (celebración de promoción, si aplica)

#### Componentes de Ejercicio Modificados

| Archivo | Cambios |
|---------|---------|
| `SopaLetrasExercise.tsx` | Import RankUpModal, estados, integración en JSX |
| `DetectiveTextualExercise.tsx` | Import RankUpModal, estados, integración en JSX |
| `CausaEfectoExercise.tsx` | Import RankUpModal, estados, integración en JSX |
| `PrediccionNarrativaExercise.tsx` | Import RankUpModal, estados, integración en JSX |
| `PuzzleContextoExercise.tsx` | Import RankUpModal, estados, integración en JSX |
| `RuedaInferenciasExercise.tsx` | Import RankUpModal, estados, integración en JSX |

---

## 3. Flujo de Datos

```
Usuario completa ejercicio
         │
         ▼
Frontend: submitExercise(exerciseId, userId, answers)
         │
         ▼
Backend: ExerciseSubmissionService.submitExercise()
         │
         ├─► gradeSubmission() - Califica respuestas
         │
         └─► claimRewards() - Otorga recompensas
                  │
                  ├─► Guarda previousRank
                  ├─► userStatsService.addXp() ──► TRIGGER BD
                  ├─► Consulta newRank              │
                  ├─► Compara rangos                ▼
                  │                          check_rank_promotion()
                  │                          promote_to_next_rank()
                  │
                  └─► Retorna { xp_earned, ml_coins_earned, rankUp }
         │
         ▼
Frontend: Recibe response con rankUp
         │
         ├─► FeedbackModal (muestra score)
         │
         └─► [Si rankUp existe]
                  │
                  ▼
             RankUpModal (celebración 8s)
                  │
                  ▼
             onComplete()
```

---

## 4. Estructura de Datos

### 4.1 Objeto rankUp

```typescript
interface RankUpInfo {
  newRank: string;        // 'Nacom', 'Ah K\'in', etc.
  previousRank?: string;  // Rango anterior
  bonusMLCoins: number;   // 100, 250, 500, 1000
  newMultiplier: number;  // 1.10, 1.15, 1.20, 1.25
}
```

### 4.2 Configuración de Rangos Maya

| Rango | XP Mínimo | XP Máximo | Bonus ML Coins | Multiplicador |
|-------|-----------|-----------|----------------|---------------|
| Ajaw | 0 | 499 | 0 | 1.00 |
| Nacom | 500 | 999 | 100 | 1.10 |
| Ah K'in | 1,000 | 1,499 | 250 | 1.15 |
| Halach Uinic | 1,500 | 1,899 | 500 | 1.20 |
| K'uk'ulkan | 1,900 | ∞ | 1,000 | 1.25 |

---

## 5. Archivos Modificados

### Backend (4 archivos)

| Archivo | Tipo de Cambio |
|---------|----------------|
| `dto/exercise-submission-response.dto.ts` | Agregados campos @Expose() |
| `entities/exercise-submission.entity.ts` | Agregadas columnas @Column() |
| `services/exercise-submission.service.ts` | Modificado claimRewards() |
| `04-exercise_submissions.sql` | Agregadas columnas DDL |

### Frontend (8 archivos)

| Archivo | Tipo de Cambio |
|---------|----------------|
| `hooks/useRankUpNotification.ts` | NUEVO - Hook de cascada |
| `hooks/index.ts` | Export del hook |
| `SopaLetrasExercise.tsx` | Integración RankUpModal |
| `DetectiveTextualExercise.tsx` | Integración RankUpModal |
| `CausaEfectoExercise.tsx` | Integración RankUpModal |
| `PrediccionNarrativaExercise.tsx` | Integración RankUpModal |
| `PuzzleContextoExercise.tsx` | Integración RankUpModal |
| `RuedaInferenciasExercise.tsx` | Integración RankUpModal |

---

## 6. Testing

### 6.1 Escenarios de Prueba

| ID | Escenario | Precondición | Resultado Esperado |
|----|-----------|--------------|-------------------|
| T1 | Sin promoción | 300 XP (Ajaw) | Solo FeedbackModal |
| T2 | Promoción a Nacom | 450 XP → +100 XP | FeedbackModal → RankUpModal |
| T3 | Promoción a Ah K'in | 950 XP → +100 XP | FeedbackModal → RankUpModal |
| T4 | Rango máximo | K'uk'ulkan | Solo FeedbackModal |
| T5 | Error en ejercicio | Cualquier XP | Solo FeedbackModal (error) |

### 6.2 Verificación de Compilación

```bash
# Backend
cd apps/backend && npm run build

# Frontend
cd apps/frontend && npm run type-check
```

---

## 7. Notas de Implementación

### 7.1 Timing de Modales

- FeedbackModal se cierra por acción del usuario
- RankUpModal aparece 300ms después del cierre de FeedbackModal
- RankUpModal tiene auto-cierre de 8 segundos
- `onComplete()` se ejecuta solo después de cerrar ambos modales

### 7.2 Compatibilidad

- Los campos `xp_earned`, `ml_coins_earned` son opcionales en el DTO
- Submissions antiguas tendrán estos campos en 0
- `rankUp` es `null` para submissions sin promoción

### 7.3 Performance

- Una consulta adicional a `user_stats` después de `addXp()` para detectar cambio de rango
- Sin impacto significativo en latencia (consulta por índice PK)

---

## 8. Referencias

- Especificación de Rangos: `docs/00-vision-general/ESPECIFICACION-TECNICA-RANGOS-MAYA-v2.1.md`
- Documentación Frontend: `apps/frontend/docs/RANKUP-NOTIFICATION-IMPLEMENTATION-2025-11-26.md`
- Seed de Rangos: `apps/database/seeds/dev/gamification_system/03-maya_ranks.sql`
