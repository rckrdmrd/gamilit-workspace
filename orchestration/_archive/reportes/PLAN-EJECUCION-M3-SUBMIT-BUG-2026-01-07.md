# PLAN DE EJECUCIÓN: BUG-M3-SUBMIT-001 - Fallo en Envío de Respuestas M3

**Agente:** Arquitecto de Soluciones (Claude Opus 4.5)
**Tipo de tarea:** Bug Fix / Corrección Crítica
**Prioridad:** P0 (Crítico)
**Fecha creación:** 2026-01-07
**Relacionado con:** [CORR-M3M5-001], [EAI-007]

---

## 🎯 OBJETIVO

Corregir el bug que impide el correcto envío de respuestas en ejercicios del Módulo 3 (y M4-M5), asegurando que:
1. El backend retorne `status`, `requiresManualReview` y `message` en la respuesta
2. El frontend muestre correctamente el mensaje "pendiente de revisión"
3. El flujo completo funcione end-to-end

**Criterios de Aceptación:**
- [ ] Backend retorna `requiresManualReview: true` para ejercicios manuales
- [ ] Backend retorna `status: 'submitted'` o `'pending_review'`
- [ ] Backend retorna `message` con texto descriptivo
- [ ] Frontend muestra mensaje de confirmación al usuario
- [ ] Todos los ejercicios M3 funcionan correctamente

---

## 📐 DISEÑO DE SOLUCIÓN

### Cambios Requeridos

**1. Backend: exercises.controller.ts**
- Archivo: `apps/backend/src/modules/educational/controllers/exercises.controller.ts`
- Líneas: 1032-1042
- Acción: Agregar campos faltantes en respuesta

**2. Backend: submit-exercise-response.dto.ts**
- Archivo: `apps/backend/src/modules/educational/dto/exercises/submit-exercise-response.dto.ts`
- Acción: Agregar propiedades opcionales para revisión manual

---

## 🔄 CICLOS DE EJECUCIÓN

### CICLO 1: Actualización del DTO de Respuesta

**Objetivo:** Agregar campos opcionales al DTO para soportar revisión manual

**Tareas:**
1. [ ] Leer DTO actual
2. [ ] Agregar propiedad `status` opcional
3. [ ] Agregar propiedad `requiresManualReview` opcional
4. [ ] Agregar propiedad `message` opcional
5. [ ] Verificar decoradores @ApiProperty

**Artefactos:**
- `apps/backend/src/modules/educational/dto/exercises/submit-exercise-response.dto.ts`

**Código a agregar:**
```typescript
@ApiProperty({
  description: 'Estado de la submission (para ejercicios con revisión manual)',
  enum: ['draft', 'submitted', 'graded', 'reviewed', 'pending_review'],
  required: false,
})
status?: 'draft' | 'submitted' | 'graded' | 'reviewed' | 'pending_review';

@ApiProperty({
  description: 'Indica si el ejercicio requiere revisión manual del maestro',
  example: true,
  required: false,
})
requiresManualReview?: boolean;

@ApiProperty({
  description: 'Mensaje del backend para mostrar al usuario',
  example: 'Tu respuesta ha sido enviada para revisión del maestro.',
  required: false,
})
message?: string;
```

---

### CICLO 2: Corrección del Controlador

**Objetivo:** Modificar la respuesta del controlador para incluir campos de revisión manual

**Tareas:**
1. [ ] Leer controlador actual
2. [ ] Localizar bloque de manejo de ejercicios manuales (línea 1025)
3. [ ] Modificar respuesta para incluir campos faltantes
4. [ ] Agregar comentario documentando el fix

**Artefactos:**
- `apps/backend/src/modules/educational/controllers/exercises.controller.ts`

**Código corregido:**
```typescript
// 6. MANEJO DE EJERCICIOS MANUALES
// ========================================
if (exercise.requires_manual_grading) {
  const submission = await this.exerciseSubmissionService.submitExercise(
    normalized.userId,
    exerciseId,
    normalized.answers,
  );

  // BUG-M3-SUBMIT-001 FIX 2026-01-07: Incluir campos de revisión manual
  // El frontend necesita estos campos para mostrar el mensaje correcto
  return {
    score: submission.score || 0,
    isPerfect: false,
    rewards: {
      xp: 0,
      mlCoins: 0,
      bonuses: [],
    },
    rankUp: null,
    feedback: 'Submission sent for teacher review',
    // Campos para revisión manual
    status: 'submitted',
    requiresManualReview: true,
    message: 'Tu respuesta ha sido enviada para revisión del maestro. Recibirás tus recompensas cuando sea evaluada.',
  };
}
```

---

### CICLO 3: Validación de Compilación

**Objetivo:** Verificar que el código compila sin errores

**Tareas:**
1. [ ] Ejecutar compilación TypeScript del backend
2. [ ] Verificar que no hay errores de tipos
3. [ ] Verificar que los tests existentes pasan

**Comandos:**
```bash
cd apps/backend && npm run build
```

---

### CICLO 4: Verificación de Componentes M3

**Objetivo:** Verificar que todos los componentes M3 manejan correctamente la respuesta

**Tareas:**
1. [x] Verificar DebateDigitalExercise.tsx - ✅ Tiene manejo en línea 178
2. [x] Verificar MatrizPerspectivasExercise.tsx - ✅ Tiene manejo en línea 192
3. [x] Verificar PodcastArgumentativoExercise.tsx - ✅ Tiene manejo en línea 299
4. [x] Verificar TribunalOpinionesExercise.tsx - ✅ Tiene manejo en línea 268
5. [x] Verificar AnalisisFuentesExercise.tsx - ✅ Tiene manejo en línea 247

**Resultado:** Todos los componentes ya tienen el manejo correcto.

---

## 📦 DEPENDENCIAS

### Depende de
- Ninguna modificación previa requerida

### Bloquea
- Funcionalidad de envío de ejercicios M3-M5

### Requerimientos Externos
- Ninguno

---

## ⚠️ RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Regresión en auto-graded | Baja | Alto | Verificar que el bloque else no se afecta |
| Type mismatch | Baja | Medio | Agregar campos al DTO |
| Tests fallando | Media | Bajo | Actualizar mocks si es necesario |

---

## ⏱️ ESTIMACIONES

| Fase | Tiempo Estimado |
|------|-----------------|
| Actualización DTO | 5 min |
| Corrección controlador | 5 min |
| Validación compilación | 5 min |
| Verificación componentes | 5 min (ya completado) |
| **Total** | **20 min** |

---

## ✅ CRITERIOS DE ÉXITO

### Código
- [ ] DTO incluye campos opcionales
- [ ] Controlador retorna campos de revisión manual
- [ ] Compilación sin errores

### Funcionalidad
- [ ] Endpoint retorna `requiresManualReview: true` para M3
- [ ] Endpoint retorna `status: 'submitted'`
- [ ] Endpoint retorna `message` descriptivo

### Frontend
- [ ] Todos los componentes M3 muestran mensaje "pendiente de revisión"

---

## 📚 REFERENCIAS

### Análisis
- `orchestration/reportes/ANALISIS-PRE-EJECUCION-M3-SUBMIT-BUG-2026-01-07.md`

### Código
- `apps/backend/src/modules/educational/controllers/exercises.controller.ts`
- `apps/backend/src/modules/educational/dto/exercises/submit-exercise-response.dto.ts`

---

## 🚀 APROBACIÓN PARA EJECUCIÓN

**Estado de Ciclos:**
- [ ] CICLO 1: Actualización del DTO - ⏳ PENDIENTE
- [ ] CICLO 2: Corrección del Controlador - ⏳ PENDIENTE
- [ ] CICLO 3: Validación de Compilación - ⏳ PENDIENTE
- [x] CICLO 4: Verificación de Componentes M3 - ✅ COMPLETADO

**Aprobado por:** Arquitecto de Soluciones
**Fecha:** 2026-01-07

---

*Documento generado según TEMPLATE-PLAN.md del sistema SIMCO*
