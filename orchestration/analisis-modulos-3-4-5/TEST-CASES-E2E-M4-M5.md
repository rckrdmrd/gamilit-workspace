# CASOS DE PRUEBA E2E - MÓDULOS 4 Y 5
## Gamilit Platform - Test Plan

**Fecha:** 2025-12-23
**Versión:** 1.0
**Estado:** DOCUMENTADO

---

## RESUMEN

Este documento define los casos de prueba E2E para validar el flujo completo de los módulos 4 (Lectura Digital) y 5 (Producción Creativa), incluyendo:
- Envío de respuestas
- Validación de estructura
- Integración con gamificación (XP, ML Coins)
- Revisión docente
- Otorgamiento de recompensas

---

## FLUJO COMPLETO A PROBAR

```
Estudiante completa ejercicio M4/M5
    ↓
Frontend: useExerciseSubmission.submit()
    ↓
Backend: exercises.controller.submit()
    ↓
Backend: validate_module4_module5_answer() [SQL]
    ↓
Backend: exercise-attempt.service.create()
    ↓
Database: progress_tracking.exercise_attempts
    ↓
Triggers: XP, ML Coins (auto-calificable) o pendiente (manual)
    ↓
[Si manual] Docente: ReviewPanel → RubricEvaluator → grade()
    ↓
Backend: grading.service.grade()
    ↓
Triggers: Otorgar rewards finales
    ↓
Estudiante ve feedback en dashboard
```

---

## CASOS DE PRUEBA - MÓDULO 4

### E2E-M4-01: Verificador Fake News - Respuesta Válida

**Precondiciones:**
- Usuario autenticado como estudiante
- Ejercicio 4.1 desbloqueado
- Usuario en rango Nacom (500+ XP)

**Pasos:**
1. Navegar a Módulo 4 > Ejercicio 4.1 (Verificador Fake News)
2. Completar 3 afirmaciones con veredictos (verdadero/falso/parcial)
3. Agregar evidencia para cada afirmación (≥10 caracteres)
4. Citar al menos 1 fuente
5. Enviar respuesta

**Datos de prueba:**
```json
{
  "claims_verified": [
    {
      "claim_id": "claim-1",
      "verdict": "verdadero",
      "evidence": "Según biografía oficial de Marie Curie"
    },
    {
      "claim_id": "claim-2",
      "verdict": "falso",
      "evidence": "No hay registros históricos de esto"
    },
    {
      "claim_id": "claim-3",
      "verdict": "parcial",
      "evidence": "Parcialmente correcto pero exagerado"
    }
  ],
  "is_fake": false,
  "evidence": "Fuente: Wikipedia + Enciclopedia Britannica"
}
```

**Resultado esperado:**
- ✅ Respuesta guardada exitosamente
- ✅ Estado: "pending_review"
- ✅ No se otorgan XP/ML Coins hasta revisión docente
- ✅ Aparece en lista de pendientes del Teacher Portal

---

### E2E-M4-02: Quiz TikTok - 3/3 Correctas (Auto-calificable)

**Precondiciones:**
- Usuario autenticado como estudiante
- Ejercicio 4.3 desbloqueado
- Es el PRIMER intento del usuario

**Pasos:**
1. Navegar a Módulo 4 > Ejercicio 4.3 (Quiz TikTok)
2. Responder 3 preguntas correctamente en <30s cada una
3. Enviar respuestas

**Datos de prueba:**
```json
{
  "answers": [0, 1, 1],
  "swipeHistory": [0, 1, 2],
  "score": 95
}
```

**Resultado esperado:**
- ✅ Score: 100 puntos (o cercano con penalización tiempo)
- ✅ XP otorgado: 150 XP base × 1.10 (Nacom) = 165 XP
- ✅ ML Coins otorgados: 50 base × 1.10 = 55 coins
- ✅ Bonus firstAttempt aplicado
- ✅ Estado: "completed" (no requiere revisión)

---

### E2E-M4-03: Quiz TikTok - Segundo Intento (Anti-farming)

**Precondiciones:**
- Usuario ya completó E2E-M4-02 previamente

**Pasos:**
1. Intentar hacer el ejercicio 4.3 nuevamente
2. Responder todas correctamente

**Resultado esperado:**
- ✅ Score calculado correctamente
- ❌ XP NO otorgado (anti-farming)
- ❌ ML Coins NO otorgados (anti-farming)
- ✅ Mensaje: "Ya completaste este ejercicio"

---

### E2E-M4-04: Análisis Memes - Estructura Inválida

**Precondiciones:**
- Usuario autenticado como estudiante

**Pasos:**
1. Navegar a ejercicio 4.5
2. Intentar enviar respuesta con estructura incorrecta

**Datos de prueba (inválidos):**
```json
{
  "annotations": [],
  "analysis": {
    "message": ""
  }
}
```

**Resultado esperado:**
- ❌ Error de validación
- ✅ Mensaje: "annotations debe tener al menos 1 elemento"
- ✅ Mensaje: "message no puede estar vacío"
- ✅ No se crea attempt

---

### E2E-M4-05: Infografía Interactiva - Flujo Completo

**Precondiciones:**
- Usuario en rango Ah K'in (1,000+ XP)

**Pasos:**
1. Explorar al menos 3 secciones de la infografía
2. Responder preguntas de síntesis
3. Enviar respuesta

**Datos de prueba:**
```json
{
  "answers": {
    "q1": "Polonia y Francia",
    "q2": "Física y Química"
  },
  "sections_explored": ["biografia", "descubrimientos", "premios"]
}
```

**Resultado esperado:**
- ✅ Respuesta guardada
- ✅ Estado: "pending_review"
- ✅ sections_explored validado (≥1)

---

## CASOS DE PRUEBA - MÓDULO 5

### E2E-M5-01: Diario Multimedia - 3 Entradas

**Precondiciones:**
- Usuario autenticado como estudiante
- Módulos 1-4 completados

**Pasos:**
1. Navegar a Módulo 5 > Ejercicio 5.1 (Diario Multimedia)
2. Crear 3 entradas de diario
3. Cada entrada con fecha, contenido (≥50 chars), y mood

**Datos de prueba:**
```json
{
  "entries": [
    {
      "date": "1898-12-21",
      "content": "Hoy hemos aislado un nuevo elemento. Lo llamaremos polonio en honor a mi amada Polonia...",
      "mood": "esperanzada"
    },
    {
      "date": "1903-11-10",
      "content": "El Premio Nobel ha llegado. Pierre y yo compartimos este honor con Becquerel...",
      "mood": "orgullosa"
    },
    {
      "date": "1911-11-04",
      "content": "Un segundo Premio Nobel, esta vez de Química. Pero Pierre ya no está aquí...",
      "mood": "melancólica"
    }
  ]
}
```

**Resultado esperado:**
- ✅ Respuesta guardada
- ✅ Estado: "pending_review"
- ✅ XP pendiente: 500 XP (se otorga al calificar)
- ✅ Validación: 1-5 entradas, ≥50 chars cada una

---

### E2E-M5-02: Video Carta - Solo Script (sin video)

**Precondiciones:**
- Usuario autenticado como estudiante

**Pasos:**
1. Navegar a ejercicio 5.3
2. Escribir script (≥100 caracteres)
3. NO subir video (opción válida)
4. Enviar

**Datos de prueba:**
```json
{
  "video_url": null,
  "script": "Querida Marie Curie, te escribo desde el año 2025 para agradecerte por tu valentía al enfrentar los prejuicios de tu época. Tu dedicación a la ciencia inspiró a generaciones de mujeres científicas. Gracias por demostrar que el conocimiento no tiene género.",
  "duration": null
}
```

**Resultado esperado:**
- ✅ Respuesta guardada (script válido como alternativa)
- ✅ Estado: "pending_review"
- ✅ Validación: script ≥100 caracteres

---

### E2E-M5-03: Comic Digital - Validación Paneles

**Precondiciones:**
- Usuario autenticado como estudiante

**Pasos:**
1. Navegar a ejercicio 5.2
2. Crear 5 paneles de cómic
3. Cada panel con diálogo y narración

**Datos de prueba:**
```json
{
  "panels": [
    { "dialogue": "Marie: ¡Pierre, mira esto!", "narration": "En el laboratorio de París, 1898" },
    { "dialogue": "Pierre: ¿Es... radiactivo?", "narration": "Los esposos examinan el mineral" },
    { "dialogue": "Marie: Lo llamaremos Radio.", "narration": "El descubrimiento que cambiaría el mundo" },
    { "dialogue": "Narrador: Años después...", "narration": "Estocolmo, 1903" },
    { "dialogue": "Marie: Este premio es para la ciencia.", "narration": "Primera mujer en ganar un Nobel" }
  ]
}
```

**Resultado esperado:**
- ✅ Respuesta guardada
- ✅ Estado: "pending_review"
- ✅ Validación: 4-6 paneles

---

### E2E-M5-04: Calificación por Docente

**Precondiciones:**
- Usuario autenticado como docente
- Existe submission pendiente de E2E-M5-01

**Pasos:**
1. Navegar a Teacher Portal > Review Panel
2. Seleccionar submission de Diario Multimedia
3. Evaluar con RubricEvaluator:
   - Precisión histórica: 4/5
   - Profundidad emocional: 5/5
   - Creatividad: 4/5
   - Voz auténtica: 4/5
4. Agregar feedback general
5. Guardar calificación

**Datos de entrada:**
```json
{
  "scores": [
    { "criterionId": "precision_historica", "selectedLevel": 4 },
    { "criterionId": "profundidad_emocional", "selectedLevel": 5 },
    { "criterionId": "creatividad", "selectedLevel": 4 },
    { "criterionId": "voz_autentica", "selectedLevel": 4 }
  ],
  "feedback": "Excelente trabajo. Las entradas reflejan una comprensión profunda de los sentimientos de Marie Curie."
}
```

**Resultado esperado:**
- ✅ Score final: 85% (calculado con pesos)
- ✅ XP otorgado al estudiante: 500 XP × (85/100) = 425 XP
- ✅ ML Coins otorgados: proporcional al score
- ✅ Estado cambia a "graded"
- ✅ Estudiante recibe notificación

---

## CASOS DE PRUEBA - GAMIFICACIÓN

### E2E-GAM-01: Promoción de Rango

**Precondiciones:**
- Usuario en rango Halach Uinic con 1,850 XP
- Necesita 50 XP más para K'uk'ulkan (1,900 XP)

**Pasos:**
1. Completar ejercicio que otorgue ≥50 XP

**Resultado esperado:**
- ✅ Total XP: 1,900+
- ✅ Trigger: promote_to_next_rank() ejecutado
- ✅ Nuevo rango: K'uk'ulkan
- ✅ ML Coins bonus: +1,000 coins
- ✅ Achievement: "Ascenso a K'uk'ulkan" desbloqueado
- ✅ Multiplicador actualizado: 1.25x
- ✅ Notificación enviada al usuario

---

### E2E-GAM-02: Multiplicador ML Coins por Rango

**Precondiciones:**
- Usuario en rango Nacom (multiplicador 1.10x)

**Pasos:**
1. Completar ejercicio con recompensa base 50 ML Coins

**Resultado esperado:**
- ✅ ML Coins finales: 50 × 1.10 = 55 coins
- ✅ Transacción registrada con multiplicador

---

## MATRIZ DE COBERTURA

| Ejercicio | Envío | Validación | Revisión | XP | ML Coins | Anti-farming |
|-----------|-------|------------|----------|-----|----------|--------------|
| 4.1 Verificador FN | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| 4.2 Infografía | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| 4.3 Quiz TikTok | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| 4.4 Nav Hipertextual | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| 4.5 Análisis Memes | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| 5.1 Diario Multi | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| 5.2 Cómic Digital | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| 5.3 Video-Carta | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |

---

## HERRAMIENTAS DE PRUEBA RECOMENDADAS

1. **Cypress** - E2E testing frontend
2. **Jest + Supertest** - Integration testing backend
3. **pgTAP** - Database function testing
4. **Postman/Newman** - API testing

---

## PRIORIDAD DE EJECUCIÓN

1. **P0 - Crítico:** E2E-M4-02, E2E-M4-03 (Quiz TikTok + anti-farming)
2. **P1 - Alto:** E2E-M5-04, E2E-GAM-01 (Calificación + Promoción)
3. **P2 - Medio:** Resto de casos M4-M5

---

**Documento generado:** 2025-12-23
**Estado:** LISTO PARA IMPLEMENTACIÓN DE TESTS
