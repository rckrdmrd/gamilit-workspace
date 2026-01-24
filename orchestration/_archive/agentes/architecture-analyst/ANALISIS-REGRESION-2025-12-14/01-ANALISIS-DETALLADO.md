# ANÁLISIS DETALLADO - Regresión Student Portal
**Fecha:** 2025-12-14
**Agente:** Architecture-Analyst
**Ciclo:** CAPVED - Fase A (Análisis)

---

## RESUMEN DE HALLAZGOS

### Estado de Builds

| Componente | Build | Lint | Estado |
|------------|-------|------|--------|
| Frontend | ✅ PASA | ⚠️ Warnings | Funcional |
| Backend | ✅ PASA | - | Funcional |
| Database | - | - | Sin cambios DDL críticos |

### Clasificación de Cambios

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| 🔴 Regresiones | 2 | Cambios que rompen funcionalidad |
| 🟡 Cambios Significativos | 3 | Nuevas features que pueden afectar UX |
| 🟢 Mejoras Defensivas | 6 | Guardas y validaciones que mejoran estabilidad |
| ⚪ Sin Impacto | 57 | Cambios menores de tipado/estilo |

---

## 🔴 REGRESIONES IDENTIFICADAS

### REG-001: Navegación "Volver al Módulo" Rota

**Archivo:** `apps/frontend/src/apps/student/pages/ExercisePage.tsx`

**Cambio:**
```diff
# Línea 560
- navigate(`/modules/${exercise?.module_id || moduleId}`);
+ const targetModuleId = exercise?.module_id;
+ if (targetModuleId && targetModuleId !== 'undefined') {
+   navigate(`/modules/${targetModuleId}`);
+ } else {
+   navigate('/dashboard');  // ❌ REGRESIÓN: Siempre va al dashboard
+ }

# Línea 717
- onClick={() => navigate(`/modules/${moduleId || 'dashboard'}`)}
+ onClick={() => navigate('/dashboard')}  // ❌ REGRESIÓN

# Línea 720
- Volver al módulo
+ Volver al Dashboard  // ❌ REGRESIÓN: Cambio de texto
```

**Impacto:** 🔴 CRÍTICO
- Los estudiantes NO pueden volver al módulo desde el ejercicio
- El flujo de navegación está completamente roto
- Afecta TODOS los módulos (1-5)

**Causa raíz:** Se intentó manejar casos donde `module_id` es `undefined`, pero la solución eliminó la funcionalidad de navegación al módulo por completo.

**Solución propuesta:**
```typescript
// Restaurar comportamiento original con manejo defensivo
const handleBackToModule = () => {
  const targetModuleId = exercise?.module_id || moduleId;
  if (targetModuleId && targetModuleId !== 'undefined') {
    navigate(`/modules/${targetModuleId}`);
  } else {
    // Solo fallback a dashboard si realmente no hay moduleId
    console.warn('[ExercisePage] No module_id available, navigating to dashboard');
    navigate('/dashboard');
  }
};
```

---

### REG-002: Transformación de `module_id` Inconsistente

**Archivo:** `apps/frontend/src/apps/student/pages/ExercisePage.tsx`

**Cambio:**
```diff
# Línea 270
- module_id: exerciseData.module_id,
+ // API returns camelCase after apiClient transformation
+ module_id: exerciseData.moduleId || exerciseData.module_id,
```

**Impacto:** 🔴 ALTO
- Asume que `apiClient` transforma `snake_case` a `camelCase`
- Si el backend envía `module_id` y el frontend espera `moduleId`, hay inconsistencia
- Puede causar `undefined` en la navegación

**Dependencia:** Requiere verificar configuración de `apiClient` para transformación de keys

---

## 🟡 CAMBIOS SIGNIFICATIVOS

### SIG-001: Sistema de Puntuación con Penalización por Tiempo

**Archivo:** `apps/frontend/src/features/mechanics/module4/QuizTikTok/QuizTikTokExercise.tsx`

**Cambios principales:**
1. Nuevos estados: `questionTimes`, `questionScores`, `questionStartTime`
2. Nueva función: `calculateScoreWithTimePenalty()`
3. Timer por pregunta de 30 segundos
4. Penalización máxima del 50% por tiempo
5. Feedback mejorado con información de penalización

**Impacto:** 🟡 MEDIO
- Cambia la mecánica de juego significativamente
- Los estudiantes ahora tienen presión de tiempo
- La puntuación puede ser menor que antes (máximo 50% penalización)
- Puede frustrar a estudiantes que funcionaban bien con el sistema anterior

**Decisión requerida:** ¿Es este cambio intencional? ¿Se debe revertir o mantener?

---

### SIG-002: Interface ExerciseState Modificada

**Archivo:** `apps/frontend/src/features/mechanics/module4/QuizTikTok/QuizTikTokExercise.tsx`

**Cambio:**
```typescript
interface ExerciseState {
  currentIndex: number;
  answers: number[];
  questionTimes: number[];    // NUEVO
  questionScores: number[];   // NUEVO
}
```

**Impacto:** 🟡 MEDIO
- Estados guardados en localStorage pueden ser incompatibles
- Estudiantes con progreso guardado podrían tener problemas al cargar

---

### SIG-003: Nuevos Archivos en InfografiaInteractiva

**Archivos nuevos:**
- `apps/frontend/src/features/mechanics/module4/InfografiaInteractiva/DraggableCard.tsx`
- `apps/frontend/src/features/mechanics/module4/InfografiaInteractiva/DroppableZone.tsx`

**Impacto:** 🟡 BAJO
- Son componentes auxiliares para drag & drop
- No deberían causar regresiones si se usan correctamente

---

## 🟢 MEJORAS DEFENSIVAS (NO REGRESIONES)

### DEF-001: Guard en useModules.ts

**Archivo:** `apps/frontend/src/shared/hooks/useModules.ts`

**Cambio:**
```diff
- if (!moduleId) {
+ if (!moduleId || moduleId === 'undefined') {
```

**Impacto:** 🟢 POSITIVO - Previene llamadas a API con `moduleId` inválido

---

### DEF-002: Guards en CrucigramaExercise.tsx

**Cambios:**
- Guard para grid vacío: `if (!grid || grid.length === 0 || !grid[0]) return 0;`
- Guards en loops para prevenir acceso a índices undefined
- Validación de `length === 0` antes de verificar respuestas

**Impacto:** 🟢 POSITIVO - Previene crashes con datos malformados

---

### DEF-003: Guard en DetectiveTextualExercise.tsx

**Cambio:**
```diff
- <span>{question.inference_type.replace('_', ' ')}</span>
+ {question.inference_type && (
+   <span>{question.inference_type.replace('_', ' ')}</span>
+ )}
```

**Impacto:** 🟢 POSITIVO - Previene crash si `inference_type` es undefined

---

### DEF-004: Guards en VerificadorFakeNewsExercise.tsx

**Cambios:**
- Variable auxiliar: `const contentLength = selectedArticle?.content?.length ?? 0;`
- Guard para división por cero: `if (articleResults.length === 0)`

**Impacto:** 🟢 POSITIVO - Previene crashes con datos vacíos

---

### DEF-005: Tipado Mejorado en Backend

**Archivos afectados:**
- `exercises.controller.ts`: `any` → `AuthRequest`, `Record<string, unknown>`
- `modules.controller.ts`: `any` → `AuthRequest`, `ParseUUIDPipe`

**Impacto:** 🟢 POSITIVO - Mejor type safety

---

### DEF-006: Soporte snake_case en DTOs

**Archivo:** `submit-exercise.dto.ts`

**Campos agregados (deprecated):**
- `started_at?: number`
- `powerups_used?: string[]`

**Impacto:** 🟢 POSITIVO - Compatibilidad con frontends que envían snake_case

---

## ANÁLISIS DE DEPENDENCIAS

### Cadena de Impacto REG-001

```
ExercisePage.tsx (navegación rota)
    │
    ├── ModuleDetailPage.tsx (no puede recibir navegación de vuelta)
    │
    ├── useModules.ts (puede recibir moduleId='undefined')
    │
    └── Dashboard (recibe todo el tráfico de navegación)
```

### Cadena de Impacto SIG-001

```
QuizTikTokExercise.tsx (nuevo sistema de puntuación)
    │
    ├── ExercisePage.tsx (recibe scores diferentes)
    │
    ├── Progress API (envía scores con penalización)
    │
    └── Gamification System (XP/ML Coins basados en nuevo score)
```

---

## VERIFICACIÓN DE BASE DE DATOS

### Cambios en DDL

| Archivo | Tipo | Impacto |
|---------|------|---------|
| `mission_templates.sql` | NUEVO | Reemplaza `team_missions.sql` |
| `friend_requests.sql` | NUEVO | Feature social |
| `friendships.sql` | MODIFICADO | Mejoras schema |

**Evaluación:** Sin impacto directo en módulos de estudiantes

---

## RECOMENDACIONES

### Prioridad 1: Corrección Inmediata
1. **REG-001:** Restaurar navegación "Volver al Módulo"
2. **REG-002:** Verificar y corregir transformación de `module_id`

### Prioridad 2: Decisión de Negocio
1. **SIG-001:** Decidir si mantener o revertir sistema de penalización por tiempo

### Prioridad 3: Opcional
1. Mantener todas las mejoras defensivas (DEF-001 a DEF-006)
2. Revisar nuevos componentes de InfografiaInteractiva

---

## ARCHIVOS A MODIFICAR

| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `ExercisePage.tsx` | Restaurar navegación | P1 |
| `QuizTikTokExercise.tsx` | Evaluar revertir | P2 |
| `useModules.ts` | Mantener | - |
| `CrucigramaExercise.tsx` | Mantener | - |
| `DetectiveTextualExercise.tsx` | Mantener | - |
| `VerificadorFakeNewsExercise.tsx` | Mantener | - |

---

**Estado:** ANÁLISIS COMPLETADO
**Próximo paso:** FASE P - Plan de Correcciones
**Última actualización:** 2025-12-14
