# PLAN DE CORRECCIONES - GAMIFICACION
## Gamilit - Portal Students v2.0

**Fecha:** 2025-12-14
**Autor:** Tech-Leader Agent
**Version:** 2.0
**Estado:** LISTO PARA IMPLEMENTACION

---

## RESUMEN DE HALLAZGOS

### Estado de la Base de Datos
| Tabla | Registros | Estado |
|-------|-----------|--------|
| achievements | 30 | OK |
| shop_categories | 5 | OK |
| shop_items | 20 | OK |
| maya_ranks | 5 | OK |
| user_stats | 17 | OK |
| user_achievements | 43 | OK |

**Los datos existen correctamente en la BD.**

### Estado del Backend
- Health: **DEGRADED**
- Problema: Faltan tablas `auth_management.users` y `content_management.user_content`
- Los endpoints de gamificacion funcionan pero el login puede estar fallando

### Estado del Frontend
- Transformacion snake_case -> camelCase: **CONFIGURADA** en apiClient.ts
- Mapeo de tipos: **IMPLEMENTADO** en achievementsAPI.ts
- Stores: Usan **mock data como fallback** cuando API falla

---

## PROBLEMAS IDENTIFICADOS

### PROB-001: Backend en Estado Degraded
**Impacto:** CRITICO
**Causa:** El backend espera `auth_management.users` pero los usuarios estan en `auth.users`

**Solucion:**
1. Verificar que el modulo auth del backend use el schema correcto
2. O crear view/tabla `auth_management.users` apuntando a `auth.users`

### PROB-002: Login Fallando
**Impacto:** CRITICO
**Causa:** El endpoint de login no encuentra usuarios

**Solucion:**
1. Verificar configuracion del AuthModule en backend
2. Verificar que UserEntity apunte al schema `auth` no `auth_management`

### PROB-003: Achievements Page - No Carga Datos
**Impacto:** ALTO
**Causa:** Si el login falla, no hay token JWT, todas las llamadas a API fallan

**Dependencia:** Requiere PROB-001 y PROB-002 resueltos primero

### PROB-004: Shop Page - No Carga Items
**Impacto:** ALTO
**Causa:** Mismo problema de autenticacion

**Dependencia:** Requiere PROB-001 y PROB-002 resueltos primero

### PROB-005: Progreso de Ejercicios No Se Actualiza
**Impacto:** MEDIO
**Causa:** El endpoint `/progress/users/:userId/modules/:moduleId` puede no devolver `completed_exercise_ids`

**Solucion:**
Verificar que el backend devuelva la lista de ejercicios completados

---

## PLAN DE IMPLEMENTACION

### FASE 1: Corregir Configuracion de Auth (CRITICO)

#### Paso 1.1: Verificar User Entity en Backend
```bash
# Ubicacion del archivo
apps/backend/src/modules/auth/entities/user.entity.ts
```

**Verificar que use:**
```typescript
@Entity({ schema: 'auth', name: 'users' })
export class User {
  // ...
}
```

#### Paso 1.2: Crear Vista de Compatibilidad (si es necesario)
```sql
-- Si el backend espera auth_management.users
CREATE OR REPLACE VIEW auth_management.users AS
SELECT * FROM auth.users;
```

#### Paso 1.3: Verificar Health Check
```bash
curl http://localhost:3006/api/v1/health
# Debe mostrar status: "healthy"
```

### FASE 2: Verificar Endpoints de Gamificacion

#### Paso 2.1: Probar Achievements
```bash
# Con token valido
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3006/api/v1/gamification/achievements
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Primeros Pasos",
      "category": "progress",
      "rarity": "common",
      "ml_coins_reward": 10,
      "rewards": { "xp": 50, "ml_coins": 10 }
    }
  ]
}
```

#### Paso 2.2: Probar Shop
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3006/api/v1/gamification/shop/categories
```

### FASE 3: Verificar Transformacion de Datos

El apiClient ya transforma:
- `ml_coins_reward` -> `mlCoinsReward`
- `is_active` -> `isActive`

**Verificar que el mapeo en `achievementsAPI.ts` funcione:**
```typescript
// mapToFrontendAchievement debe producir:
{
  id: "...",
  title: "Primeros Pasos",  // de name
  mlCoinsReward: 10,        // de ml_coins_reward (transformado)
  xpReward: 50,             // de rewards.xp
  isUnlocked: false
}
```

### FASE 4: Verificar Progreso de Ejercicios

**Verificar endpoint:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3006/api/v1/progress/users/{userId}/modules/{moduleId}
```

**Respuesta debe incluir:**
```json
{
  "progress_percentage": 50,
  "completed_exercises": 3,
  "total_exercises": 6,
  "completed_exercise_ids": ["ex-1", "ex-2", "ex-3"]
}
```

---

## CORRECCIONES DE CODIGO SUGERIDAS

### CORR-001: Agregar completed_exercise_ids al Progreso

**Archivo:** `apps/backend/src/modules/progress/services/progress.service.ts`

```typescript
async getModuleProgress(userId: string, moduleId: string) {
  const progress = await this.moduleProgressRepo.findOne({
    where: { user_id: userId, module_id: moduleId }
  });

  // Agregar IDs de ejercicios completados
  const completedExercises = await this.exerciseProgressRepo.find({
    where: {
      user_id: userId,
      module_id: moduleId,
      is_completed: true
    },
    select: ['exercise_id']
  });

  return {
    ...progress,
    completed_exercise_ids: completedExercises.map(e => e.exercise_id)
  };
}
```

### CORR-002: Usar completed_exercise_ids en Frontend

**Archivo:** `apps/frontend/src/shared/hooks/useModules.ts`

```typescript
// Despues de obtener exercises y progress
if (progress?.completedExerciseIds) {
  const exercisesWithStatus = sortedExercises.map(exercise => ({
    ...exercise,
    completed: progress.completedExerciseIds.includes(exercise.id)
  }));
  setExercises(exercisesWithStatus);
}
```

---

## VERIFICACION FINAL

### Checklist de Correcciones

- [ ] Backend health status = "healthy"
- [ ] Login endpoint funciona correctamente
- [ ] GET /gamification/achievements devuelve 30 logros
- [ ] GET /gamification/shop/categories devuelve 5 categorias
- [ ] GET /gamification/shop/items devuelve 20 items
- [ ] GET /progress/users/:userId/modules/:moduleId devuelve completed_exercise_ids
- [ ] Frontend AchievementsPage carga datos reales
- [ ] Frontend ShopPage carga items
- [ ] Frontend ModuleDetailPage muestra ejercicios con estado correcto
- [ ] Dashboard muestra rango actualizado
- [ ] Dashboard muestra estadisticas actualizadas

---

## DOCUMENTOS RELACIONADOS

| Documento | Ubicacion |
|-----------|-----------|
| Analisis Inicial | `reportes/GAMIFICATION-INTEGRATION-ANALYSIS-2025-12-14.md` |
| Script Verificacion | `scripts/verify-gamification-data.sql` |
| Reporte Anterior | `reportes/TECH-LEADER-VALIDATION-REPORT-2025-12-14.md` |

---

## PROXIMOS PASOS INMEDIATOS

1. **Revisar User Entity en Backend** - Verificar schema correcto
2. **Probar Login** - Una vez corregido, obtener token valido
3. **Probar Endpoints** - Verificar respuestas con token
4. **Verificar Frontend** - Confirmar que datos se cargan correctamente

---

**Firmado:** Tech-Leader Agent
**Fecha:** 2025-12-14
**Estado:** PENDIENTE IMPLEMENTACION
