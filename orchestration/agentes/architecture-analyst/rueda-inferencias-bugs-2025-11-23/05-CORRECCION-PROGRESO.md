# CORRECCIÓN: Progreso Inconsistente Entre Páginas (BUG-005)

**Fecha:** 2025-11-23
**Implementado por:** Architecture-Analyst
**Tipo:** Backend - SQL Query Fix
**Estado:** IMPLEMENTED - READY FOR TESTING

---

## 1. RESUMEN DE LA CORRECCIÓN

**Problema:** DashboardComplete mostraba 4/5 ejercicios cuando realmente eran 5/5 completados

**Causa raíz:** Query SQL usando tabla incorrecta (`exercise_attempts` en lugar de `exercise_submissions`)

**Solución:** Actualizar query para usar tabla correcta con campo correcto

---

## 2. ARCHIVO MODIFICADO

**Ubicación:** `/apps/backend/src/modules/educational/services/modules.service.ts`

**Método:** `getUserModules()` (líneas 124-173)

**Endpoint afectado:** `GET /api/v1/educational/modules/user/:userId`

---

## 3. CAMBIOS REALIZADOS

### Antes (INCORRECTO):

```sql
LEFT JOIN LATERAL (
  SELECT COUNT(DISTINCT e.id) as completed
  FROM educational_content.exercises e
  INNER JOIN progress_tracking.exercise_attempts ea  -- ❌ Tabla incorrecta
    ON e.id = ea.exercise_id AND ea.user_id = $1
  WHERE e.module_id = m.id
    AND e.is_active = true
    AND ea.is_correct = true  -- ❌ Campo legacy/incorrecto
) completed_ex ON true
```

**Problemas:**
1. Usaba `progress_tracking.exercise_attempts` (tabla legacy)
2. Usaba campo `is_correct = true` (no confiable)
3. No sincronizado con el flujo de submissions actual

### Después (CORRECTO):

```sql
LEFT JOIN LATERAL (
  SELECT COUNT(DISTINCT e.id) as completed
  FROM educational_content.exercises e
  INNER JOIN progress_tracking.exercise_submissions es  -- ✅ Tabla correcta
    ON e.id = es.exercise_id AND es.user_id = $1
  WHERE e.module_id = m.id
    AND e.is_active = true
    AND es.status = 'graded'  -- ✅ Campo correcto
) completed_ex ON true
```

**Mejoras:**
1. Usa `progress_tracking.exercise_submissions` (tabla actual)
2. Usa `status = 'graded'` (campo estándar)
3. Sincronizado con flujo de calificación actual
4. Consistente con endpoint `/educational/modules` (con auth)

---

## 4. JUSTIFICACIÓN TÉCNICA

### Análisis de Tablas:

#### `exercise_submissions` (CORRECTO):
- Tabla principal para envíos de ejercicios
- Flujo completo: `draft` → `submitted` → `graded` → `reviewed`
- Campo `status = 'graded'` indica ejercicio completado
- Usada por `ExerciseSubmissionService`
- Actualizada por auto-grading system

#### `exercise_attempts` (LEGACY):
- Tabla legacy/histórica
- Campo `is_correct` puede estar NULL o incorrecto
- No sincronizada con flujo de submissions
- Posiblemente obsoleta o en desuso

### Endpoints Comparados:

#### `/educational/modules` (con JWT):
```typescript
// modules.controller.ts - findAll()
const allSubmissions = await this.exerciseSubmissionService.findByUserId(userId);
allSubmissions.forEach((submission) => {
  if (submission.status === 'graded') {  // ✅ Usa status = 'graded'
    completedExercisesMap.set(submission.exercise_id, true);
  }
});
```

#### `/educational/modules/user/:userId`:
```sql
-- ANTES: exercise_attempts con is_correct
-- AHORA: exercise_submissions con status = 'graded' ✅
```

**Conclusión:** Ambos endpoints ahora usan la misma lógica de verificación

---

## 5. IMPACTO

### Componentes Afectados:

✅ **Frontend:**
- `DashboardComplete` - Ahora mostrará progreso correcto
- `useUserModules` hook - Datos consistentes
- `ModulesSection` component - Visualización correcta

✅ **Backend:**
- `ModulesService.getUserModules()` - Query corregida
- Endpoint `/educational/modules/user/:userId` - Datos correctos

### Comportamiento Esperado:

**Antes:**
```
Módulo 2:
- Real: 5/5 ejercicios completados
- DashboardComplete: 4/5 ❌
- ModuleDetailPage: 5/5 ✅
```

**Después:**
```
Módulo 2:
- Real: 5/5 ejercicios completados
- DashboardComplete: 5/5 ✅
- ModuleDetailPage: 5/5 ✅
```

---

## 6. TESTING

### Test Manual:

1. **Preparación:**
   ```bash
   # Reiniciar backend
   cd apps/backend
   npm run start:dev
   ```

2. **Verificar datos en BD:**
   ```sql
   -- Verificar submissions (debe tener 5)
   SELECT COUNT(*) FROM progress_tracking.exercise_submissions
   WHERE user_id = '<user_id>'
     AND exercise_id IN (
       SELECT id FROM educational_content.exercises
       WHERE module_id = '<module_2_id>'
     )
     AND status = 'graded';

   -- Resultado esperado: 5
   ```

3. **Verificar API:**
   ```bash
   # Test endpoint
   curl -X GET "http://localhost:3006/api/v1/educational/modules/user/<user_id>" \
     -H "Authorization: Bearer <token>"

   # Verificar en response:
   # {
   #   "id": "module-2-id",
   #   "completedExercises": 5,  ✅
   #   "totalExercises": 5,
   #   "progress": 100
   # }
   ```

4. **Verificar Frontend:**
   - Abrir `DashboardComplete` (`/dashboard`)
   - Verificar card del Módulo 2
   - Debe mostrar: `5 / 5 ejercicios` ✅
   - Progreso: `100% completado` ✅

### Test Cases:

#### TC-001: Módulo Completo (5/5)
```
Given: Usuario completó 5/5 ejercicios del módulo 2
When: Visita /dashboard
Then:
  - ModulesSection muestra "5 / 5 ejercicios"
  - Progress bar muestra 100%
  - Status badge muestra "Completado ✓"
```

#### TC-002: Módulo Parcial (3/5)
```
Given: Usuario completó 3/5 ejercicios del módulo 1
When: Visita /dashboard
Then:
  - ModulesSection muestra "3 / 5 ejercicios"
  - Progress bar muestra 60%
  - Status badge muestra "En Progreso"
```

#### TC-003: Módulo Sin Comenzar (0/5)
```
Given: Usuario no ha comenzado módulo 3
When: Visita /dashboard
Then:
  - ModulesSection muestra "0 / 5 ejercicios"
  - Progress bar muestra 0%
  - Status badge muestra "Disponible"
```

#### TC-004: Consistencia con ModuleDetailPage
```
Given: Usuario completó 5/5 ejercicios del módulo 2
When:
  1. Visita /dashboard
  2. Visita /modules/2
Then:
  - Ambas páginas muestran "5 / 5 ejercicios"
  - Ambas muestran progress 100%
  - Datos son consistentes
```

---

## 7. TESTS AUTOMATIZADOS

### Unit Test para `getUserModules`:

```typescript
describe('ModulesService.getUserModules', () => {
  it('should count completed exercises based on graded submissions', async () => {
    // Arrange
    const userId = 'test-user-id';
    const moduleId = 'module-2-id';

    // Mock: 5 ejercicios en el módulo
    // Mock: 5 submissions con status = 'graded'

    // Act
    const modules = await modulesService.getUserModules(userId);
    const module2 = modules.find(m => m.id === moduleId);

    // Assert
    expect(module2.totalExercises).toBe(5);
    expect(module2.completedExercises).toBe(5);  // ✅ Debe ser 5, no 4
    expect(module2.progress).toBe(100);
  });

  it('should not count submissions that are not graded', async () => {
    // Arrange
    const userId = 'test-user-id';
    // Mock: 5 submissions, solo 3 con status = 'graded'
    // 2 con status = 'submitted' (no graded)

    // Act
    const modules = await modulesService.getUserModules(userId);

    // Assert
    expect(modules[0].completedExercises).toBe(3);  // ✅ Solo los graded
  });
});
```

### Integration Test:

```typescript
describe('GET /educational/modules/user/:userId', () => {
  it('should return correct progress for completed module', async () => {
    // Arrange: Crear usuario y módulo con 5 ejercicios
    // Crear 5 submissions con status = 'graded'

    // Act
    const response = await request(app.getHttpServer())
      .get(`/api/v1/educational/modules/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    // Assert
    expect(response.status).toBe(200);
    const module = response.body.find(m => m.id === moduleId);
    expect(module.completedExercises).toBe(5);
    expect(module.totalExercises).toBe(5);
    expect(module.progress).toBe(100);
  });
});
```

---

## 8. MIGRACIÓN DE DATOS

### Verificar Integridad:

```sql
-- Verificar que no hay inconsistencias
SELECT
  m.id as module_id,
  m.title,
  COUNT(DISTINCT e.id) as total_exercises,
  COUNT(DISTINCT CASE WHEN es.status = 'graded' THEN e.id END) as graded_submissions,
  COUNT(DISTINCT CASE WHEN ea.is_correct = true THEN e.id END) as correct_attempts
FROM educational_content.modules m
LEFT JOIN educational_content.exercises e ON e.module_id = m.id AND e.is_active = true
LEFT JOIN progress_tracking.exercise_submissions es
  ON es.exercise_id = e.id AND es.user_id = '<user_id>'
LEFT JOIN progress_tracking.exercise_attempts ea
  ON ea.exercise_id = e.id AND ea.user_id = '<user_id>'
WHERE m.is_published = true
GROUP BY m.id, m.title
ORDER BY m.order_index;
```

**Análisis esperado:**
- `graded_submissions` = Conteo correcto (5 para módulo 2)
- `correct_attempts` = Conteo posiblemente incorrecto (4 para módulo 2)
- La diferencia confirma el bug

### ⚠️ NO se requiere migración de datos:
- La tabla `exercise_submissions` ya tiene los datos correctos
- Solo cambiamos la query de lectura, no modificamos datos
- Backward compatible

---

## 9. ROLLBACK PLAN

Si surgen problemas:

```sql
-- Restaurar query original (temporal)
LEFT JOIN LATERAL (
  SELECT COUNT(DISTINCT e.id) as completed
  FROM educational_content.exercises e
  INNER JOIN progress_tracking.exercise_attempts ea
    ON e.id = ea.exercise_id AND ea.user_id = $1
  WHERE e.module_id = m.id
    AND e.is_active = true
    AND ea.is_correct = true
) completed_ex ON true
```

**Procedimiento:**
1. Revertir archivo `modules.service.ts`
2. Reiniciar backend
3. Investigar causa del problema

---

## 10. DOCUMENTACIÓN ACTUALIZADA

### Comentario en código:

```typescript
/**
 * Obtener módulos con progreso del usuario
 *
 * IMPORTANTE: Usa exercise_submissions (no exercise_attempts) para calcular
 * ejercicios completados. Un ejercicio se considera completado cuando su
 * submission tiene status = 'graded'.
 *
 * FIX BUG-005: Corregido 2025-11-23 - Cambio de exercise_attempts.is_correct
 * a exercise_submissions.status = 'graded' para consistencia con endpoint
 * /educational/modules
 *
 * @param userId - ID del usuario
 * @returns Módulos con información de progreso incluida
 */
```

---

## 11. CRITERIOS DE ACEPTACIÓN

- [x] Query SQL actualizada para usar `exercise_submissions`
- [x] Usa campo `status = 'graded'` en lugar de `is_correct`
- [ ] Backend compila sin errores (errores pre-existentes no relacionados)
- [ ] Test manual confirma progreso correcto (5/5)
- [ ] DashboardComplete y ModuleDetailPage muestran mismo progreso
- [ ] Tests automatizados pasan
- [ ] Documentación actualizada

---

## 12. PRÓXIMOS PASOS

### Inmediato:
1. ✅ Implementar corrección
2. ⏳ Testing manual
3. ⏳ Confirmar con Product Owner

### Seguimiento:
1. Revisar si `exercise_attempts` está en uso
2. Evaluar deprecar `exercise_attempts` si no se usa
3. Documentar tabla correcta para futuras implementaciones
4. Agregar tests de integración

### Opcional:
1. Migrar datos de `exercise_attempts` a `exercise_submissions` si es necesario
2. Crear índice en `exercise_submissions(status)` si no existe
3. Agregar monitoreo de inconsistencias entre tablas

---

**Corrección completada:** 2025-11-23 22:00 UTC-6
**Estado:** READY FOR TESTING
**Próximo paso:** Verificación manual y tests
