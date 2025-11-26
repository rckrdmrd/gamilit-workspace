# Reporte de Implementación: Integración MissionsService en ExerciseAttemptService

**Fecha:** 2025-11-24
**Tarea:** Integrar MissionsService para actualizar misiones al completar ejercicios
**Archivo modificado:** `apps/backend/src/modules/progress/services/exercise-attempt.service.ts`
**Estado:** ✅ COMPLETADO

---

## 📋 Resumen Ejecutivo

Se ha integrado exitosamente `MissionsService` en `ExerciseAttemptService` para que las misiones diarias y semanales se actualicen automáticamente cuando un estudiante completa un ejercicio correctamente.

---

## 🔧 Cambios Realizados

### 1. Imports Agregados (Líneas 10-11)

```typescript
import { MissionsService } from '@/modules/gamification/services/missions.service';
import { MissionTypeEnum } from '@/modules/gamification/entities/mission.entity';
```

**Justificación:** Necesarios para inyectar el servicio y usar el enum de tipos de misión.

---

### 2. Inyección en Constructor (Línea 36)

```typescript
constructor(
  @InjectRepository(ExerciseAttempt, 'progress')
  private readonly attemptRepo: Repository<ExerciseAttempt>,
  @InjectRepository(Exercise, 'educational')
  private readonly exerciseRepo: Repository<Exercise>,
  private readonly mlCoinsService: MLCoinsService,
  private readonly userStatsService: UserStatsService,
  private readonly missionsService: MissionsService,  // ⬅️ NUEVO
  @InjectEntityManager('progress')
  private readonly entityManager: EntityManager,
) {}
```

**Justificación:** Dependency Injection de NestJS para acceder a MissionsService.

---

### 3. Llamada en método `create()` (Línea 78)

```typescript
if (savedAttempt.is_correct && (savedAttempt.xp_earned > 0 || savedAttempt.ml_coins_earned > 0)) {
  await this.updateModuleProgressAfterCompletion(
    savedAttempt.user_id,
    savedAttempt.exercise_id,
    savedAttempt.xp_earned,
    savedAttempt.ml_coins_earned,
  );

  // NUEVO: Actualizar progreso de misiones diarias/semanales
  await this.updateMissionsProgress(savedAttempt.user_id, savedAttempt.is_correct);
}
```

**Justificación:** Se ejecuta solo cuando el ejercicio es correcto y otorga recompensas, después de actualizar el progreso del módulo.

---

### 4. Nuevo Método Privado `updateMissionsProgress()` (Líneas 561-607)

```typescript
/**
 * Actualiza el progreso de misiones después de completar un ejercicio correctamente
 * @param userId - ID del usuario (auth.users.id - será convertido a profiles.id internamente)
 * @param isCorrect - Si el ejercicio fue completado correctamente
 */
private async updateMissionsProgress(userId: string, isCorrect: boolean): Promise<void> {
  if (!isCorrect) return;

  try {
    // Obtener misiones diarias y semanales activas del usuario
    const [dailyMissions, weeklyMissions] = await Promise.all([
      this.missionsService.findByTypeAndUser(userId, MissionTypeEnum.DAILY),
      this.missionsService.findByTypeAndUser(userId, MissionTypeEnum.WEEKLY),
    ]);

    const allMissions = [...dailyMissions, ...weeklyMissions];

    // Actualizar cada misión que tenga objetivo 'complete_exercises'
    for (const mission of allMissions) {
      // Solo procesar misiones activas o en progreso
      if (mission.status !== 'active' && mission.status !== 'in_progress') continue;

      // Verificar si la misión tiene objetivo de completar ejercicios
      const hasExerciseObjective = mission.objectives.some(
        obj => obj.type === 'complete_exercises',
      );

      if (hasExerciseObjective) {
        try {
          await this.missionsService.updateProgress(
            mission.id,
            userId,
            'complete_exercises',
            1,
          );
          this.logger.log(`Mission ${mission.id} progress updated for user ${userId}`);
        } catch (missionError) {
          // Log pero no bloquear si una misión específica falla
          this.logger.warn(`Failed to update mission ${mission.id}`, missionError);
        }
      }
    }
  } catch (error) {
    // No bloquear el flujo principal si falla la actualización de misiones
    this.logger.warn(`Failed to update missions progress for user ${userId}`, error);
  }
}
```

**Características:**
- ✅ Manejo robusto de errores (try-catch anidados)
- ✅ No bloquea el flujo principal si falla
- ✅ Actualiza solo misiones activas o en progreso
- ✅ Filtra misiones por tipo de objetivo 'complete_exercises'
- ✅ Logging detallado para debugging

---

## ✅ Validación

### Compilación TypeScript
```bash
cd apps/backend && npm run build
```
**Resultado:** ✅ Sin errores de compilación

### Verificación de Imports
- ✅ `MissionsService` está exportado desde `GamificationModule`
- ✅ `GamificationModule` está importado en `ProgressModule`
- ✅ `MissionTypeEnum` está disponible desde mission.entity.ts

### Verificación de Métodos
- ✅ `findByTypeAndUser(userId, type)` existe en MissionsService
- ✅ `updateProgress(missionId, userId, objectiveType, increment)` existe en MissionsService
- ✅ Conversión interna de `auth.users.id` → `profiles.id` manejada por MissionsService

---

## 🔍 Flujo de Ejecución

```
1. Usuario completa ejercicio correctamente
   ↓
2. ExerciseAttemptService.create() guarda el intento
   ↓
3. Si is_correct = true Y (xp_earned > 0 OR ml_coins_earned > 0):
   ↓
   3a. updateModuleProgressAfterCompletion() - Actualiza módulo
   ↓
   3b. updateMissionsProgress() - Actualiza misiones ⬅️ NUEVO
       ↓
       - Obtiene misiones DAILY y WEEKLY activas
       - Para cada misión con objetivo 'complete_exercises':
         - Llama missionsService.updateProgress(..., +1)
         - MissionsService actualiza objective.current
         - Si alcanza target, marca misión como completed
   ↓
4. Retorna intento guardado
```

---

## 📝 Notas Técnicas

1. **Conversión de IDs:** MissionsService maneja internamente la conversión de `auth.users.id` a `profiles.id` mediante el método `getProfileId()`.

2. **Tipo de Objetivo:** Las misiones deben tener un objetivo con `type: 'complete_exercises'` para ser actualizadas.

3. **No Bloqueo:** Si falla la actualización de misiones, el flujo continúa normalmente (solo se loggea el error).

4. **Misiones Especiales:** Solo procesa misiones DAILY y WEEKLY, no SPECIAL.

5. **Estados Válidos:** Solo actualiza misiones en estado 'active' o 'in_progress'.

---

## 🧪 Pruebas Recomendadas

### Test Unitario Sugerido
```typescript
describe('ExerciseAttemptService - Missions Integration', () => {
  it('should update missions progress when exercise completed correctly', async () => {
    const userId = 'test-user-id';
    const exerciseId = 'test-exercise-id';

    const dto: CreateExerciseAttemptDto = {
      user_id: userId,
      exercise_id: exerciseId,
      is_correct: true,
      xp_earned: 100,
      ml_coins_earned: 10,
    };

    await service.create(dto);

    // Verificar que se llamó missionsService.findByTypeAndUser
    expect(missionsService.findByTypeAndUser).toHaveBeenCalledWith(
      userId,
      MissionTypeEnum.DAILY
    );
    expect(missionsService.findByTypeAndUser).toHaveBeenCalledWith(
      userId,
      MissionTypeEnum.WEEKLY
    );

    // Verificar que se llamó missionsService.updateProgress
    expect(missionsService.updateProgress).toHaveBeenCalledWith(
      expect.any(String), // mission.id
      userId,
      'complete_exercises',
      1
    );
  });
});
```

### Test E2E Sugerido
```bash
# 1. Crear misión diaria con objetivo 'complete_exercises'
# 2. Completar un ejercicio correctamente
# 3. Verificar que mission.objectives[0].current se incrementó
# 4. Verificar que mission.progress se actualizó
```

---

## 🎯 Criterios de Aceptación Cumplidos

- [x] Import de MissionsService agregado correctamente
- [x] Import de MissionTypeEnum agregado correctamente
- [x] MissionsService inyectado en constructor
- [x] Método updateMissionsProgress() creado con manejo de errores robusto
- [x] Llamada a updateMissionsProgress() agregada en create() después de updateModuleProgressAfterCompletion
- [x] El código compila sin errores

---

## 🚀 Siguientes Pasos Recomendados

1. **Testing:** Crear tests unitarios y e2e para validar la integración
2. **Monitoring:** Verificar logs en producción para confirmar que las misiones se actualizan
3. **Documentación:** Actualizar Swagger si es necesario
4. **Frontend:** Verificar que el frontend muestre correctamente el progreso actualizado de misiones

---

## 📚 Referencias

- `apps/backend/src/modules/gamification/services/missions.service.ts` - Líneas 84-109 (findByTypeAndUser)
- `apps/backend/src/modules/gamification/services/missions.service.ts` - Líneas 379-445 (updateProgress)
- `apps/backend/src/modules/gamification/entities/mission.entity.ts` - Líneas 16-20 (MissionTypeEnum)
- `apps/backend/src/modules/progress/progress.module.ts` - Línea 80 (import GamificationModule)

---

**Implementado por:** Backend-Agent
**Revisión:** Pendiente
**Deploy:** Pendiente
