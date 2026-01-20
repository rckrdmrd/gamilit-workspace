# PROMPT-SUBTASK-1.2: Validar Sistema de Hints/Ayudas

## Perfil Asignado
**@PERFIL_FRONTEND**

## Objetivo
Validar que el sistema de hints/ayudas este correctamente integrado en los ejercicios, verificando:
1. Consistencia entre HintModal y HintSystem
2. Integracion con sistema de gamificacion (ML Coins)
3. Flujo correcto de activacion de pistas
4. UI/UX coherente entre ejercicios

## Contexto Necesario

### Componentes de Hints
```
/apps/frontend/src/apps/student/components/exercise/HintModal.tsx
/apps/frontend/src/shared/components/mechanics/HintSystem.tsx
```

### Hooks Relacionados
```
/apps/frontend/src/features/exercises/hooks/useExerciseRewards.ts
/apps/frontend/src/apps/student/hooks/useExercisePowerUps.ts
```

### Sistema de Gamificacion
```
/apps/frontend/src/features/gamification/
├── hooks/useMLCoins.ts
├── hooks/useRewards.ts
└── components/MLCoinsDisplay.tsx
```

### Documentacion
- `docs/90-transversal/mecanicas/SPEC-MECANICAS-M1-M3.md` (seccion Hints)
- `docs/90-transversal/gamificacion/SPEC-GAMIFICACION.md`

## Instrucciones

### Paso 1: Analizar Componentes de Hints
1. Leer `HintModal.tsx` - sistema con costo ML Coins
2. Leer `HintSystem.tsx` - sistema sin costo
3. Identificar diferencias y casos de uso
4. Documentar props y flujo de cada uno

### Paso 2: Mapear Uso en Ejercicios
Para cada modulo (M1-M5):
1. Identificar cual sistema de hints usa
2. Verificar si hay hints definidos en el ejercicio
3. Verificar integracion con gamificacion
4. Documentar costo de hints (si aplica)

### Paso 3: Validar Flujo de Gamificacion
1. Verificar que useExerciseRewards este conectado
2. Verificar descuento de ML Coins al usar hint
3. Verificar que hints no se repitan tras uso
4. Verificar persistencia de hints usados

### Paso 4: Identificar Inconsistencias
1. Ejercicios sin sistema de hints
2. Ejercicios con hints pero sin costo
3. Ejercicios con hints duplicados
4. Ejercicios con flujo incorrecto

## Entregables Esperados

1. **VALIDACION-HINTS-SYSTEM.md** en carpeta de tarea con:
   - Analisis comparativo HintModal vs HintSystem
   - Tabla de uso por ejercicio
   - Flujo de gamificacion documentado
   - Inconsistencias encontradas
   - Recomendaciones

2. **Diagrama de flujo** (opcional) del sistema de hints

## Criterios de Aceptacion

- [ ] Ambos componentes de hints analizados
- [ ] Mapeo completo de uso por ejercicio
- [ ] Flujo de gamificacion verificado
- [ ] Inconsistencias documentadas
- [ ] Recomendaciones concretas

## Notas Importantes

1. **Ejercicios M1-M2**: Generalmente usan hints con costo (evaluacion automatica)
2. **Ejercicios M3-M5**: Pueden no necesitar hints (evaluacion manual)
3. **Auxiliares**: Pueden tener comportamiento especial

---

*Tiempo estimado: 2 horas*
*Dependencias: SUBTASK-1.1 (opcional)*
