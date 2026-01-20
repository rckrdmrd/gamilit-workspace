# PROMPT-SUBTASK-1.3: Validar FeedbackModal y ExerciseFeedback

## Perfil Asignado
**@PERFIL_FRONTEND**

## Objetivo
Validar que los componentes de feedback esten correctamente integrados, verificando:
1. Uso consistente de FeedbackModal (modal con confetti)
2. Uso de ExerciseFeedback (feedback inline)
3. Integracion con sistema de recompensas
4. Estados de feedback correctos (success, error, pending)

## Contexto Necesario

### Componentes de Feedback
```
/apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx
/apps/frontend/src/features/exercises/components/ExerciseFeedback.tsx
/apps/frontend/src/apps/student/components/exercise/CompletionModal.tsx
```

### Hooks Relacionados
```
/apps/frontend/src/features/exercises/hooks/useExerciseRewards.ts
/apps/frontend/src/features/gamification/hooks/useRewards.ts
```

### Sistema de Animaciones
```
/apps/frontend/src/shared/components/effects/Confetti.tsx (si existe)
/apps/frontend/src/shared/animations/ (si existe)
```

## Instrucciones

### Paso 1: Analizar Componentes de Feedback
1. Leer `FeedbackModal.tsx` - modal con animaciones y confetti
2. Leer `ExerciseFeedback.tsx` - feedback inline
3. Leer `CompletionModal.tsx` - modal de finalizacion
4. Documentar cuando usar cada uno

### Paso 2: Mapear Uso en Ejercicios
Para cada ejercicio:
1. Identificar que componente de feedback usa
2. Verificar props pasadas (score, message, rewards)
3. Verificar trigger correcto (despues de submit exitoso)
4. Documentar animaciones/efectos

### Paso 3: Validar Integracion con Recompensas
1. Verificar que feedback muestre XP ganado
2. Verificar que feedback muestre ML Coins ganados
3. Verificar que feedback muestre logros desbloqueados
4. Verificar consistencia visual

### Paso 4: Identificar Inconsistencias
1. Ejercicios sin feedback visual
2. Ejercicios con feedback incorrecto
3. Ejercicios sin animaciones de recompensa
4. Ejercicios con feedback duplicado

## Entregables Esperados

1. **VALIDACION-FEEDBACK-SYSTEM.md** en carpeta de tarea con:
   - Analisis de componentes de feedback
   - Casos de uso de cada componente
   - Tabla de uso por ejercicio
   - Integracion con recompensas
   - Inconsistencias encontradas

## Criterios de Aceptacion

- [ ] 3 componentes de feedback analizados
- [ ] Mapeo de uso por ejercicio
- [ ] Flujo de recompensas verificado
- [ ] Inconsistencias documentadas
- [ ] Recomendaciones de estandarizacion

## Matriz de Feedback Esperada

| Tipo Ejercicio | Evaluacion | Feedback Recomendado |
|----------------|------------|----------------------|
| M1-M2 (auto) | Inmediata | FeedbackModal con score |
| M3-M5 (manual) | Diferida | ExerciseFeedback inline |
| Auxiliares | Variable | Segun mecanica |

---

*Tiempo estimado: 2 horas*
*Dependencias: SUBTASK-1.1*
