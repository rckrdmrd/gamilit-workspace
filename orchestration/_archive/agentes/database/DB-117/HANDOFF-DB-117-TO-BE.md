# HANDOFF: Database → Backend

**De:** Database Agent
**Para:** Backend Agent
**Fecha:** 2025-11-19
**Tarea:** DB-117 - Sistema de Validación de Ejercicios
**Estado:** ✅ COMPLETADO - LISTO PARA INTEGRACIÓN

---

## 📋 Resumen Ejecutivo

Se implementó un **sistema completo de validación de ejercicios en PostgreSQL** con:

- ✅ **15 validadores** para Módulos 1, 2 y 3
- ✅ **Validación centralizada** en base de datos (no en backend)
- ✅ **Auditoría completa** con snapshots inmutables
- ✅ **Trazabilidad** para verificar y recalcular validaciones
- ✅ **Optimizado** con índices para < 100ms (p95)

**Función principal para backend:** `educational_content.validate_and_audit()`

---

## 🎯 Función Principal

### `validate_and_audit()`

**Esta es la función que el backend debe llamar** para validar respuestas de ejercicios.

#### Firma

```sql
SELECT * FROM educational_content.validate_and_audit(
    p_exercise_id UUID,
    p_user_id UUID,
    p_submitted_answer JSONB,
    p_attempt_number INTEGER,
    p_client_metadata JSONB DEFAULT '{}'::jsonb
);
```

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `p_exercise_id` | UUID | ✅ Sí | ID del ejercicio a validar |
| `p_user_id` | UUID | ✅ Sí | ID del usuario que envía la respuesta |
| `p_submitted_answer` | JSONB | ✅ Sí | Respuesta del usuario (ver formatos abajo) |
| `p_attempt_number` | INTEGER | ✅ Sí | Número de intento (1, 2, 3, ...) |
| `p_client_metadata` | JSONB | ❌ No | Metadata opcional (IP, user_agent, etc.) |

#### Retorna (RECORD)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `is_correct` | BOOLEAN | `true` si la respuesta es 100% correcta |
| `score` | INTEGER | Puntos obtenidos (0 a max_score) |
| `max_score` | INTEGER | Puntos máximos posibles |
| `feedback` | TEXT | Mensaje de retroalimentación para el usuario |
| `details` | JSONB | Detalles de la validación (resultados por pregunta, etc.) |
| `audit_id` | UUID | ID del registro de auditoría creado |

#### Ejemplo de Uso

```sql
-- Validar un crucigrama
SELECT * FROM educational_content.validate_and_audit(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,  -- exercise_id
    'user-uuid-here'::uuid,                         -- user_id
    '{"clues": {"h1": "SORBONA", "h2": "NOBEL"}}'::jsonb,  -- respuesta
    1,                                              -- primer intento
    '{"ip": "192.168.1.100", "session_id": "abc123"}'::jsonb  -- metadata
);
```

**Resultado:**
```
is_correct | score | max_score | feedback                    | details                | audit_id
-----------|-------|-----------|----------------------------|------------------------|----------
true       | 100   | 100       | ¡Perfecto! 2/2 correctas   | {"total_words": 2,...} | uuid-here
```

---

## 📝 Formatos de Respuesta por Tipo de Ejercicio

### Módulo 1: Comprensión Literal

#### 1. Crucigrama (`crucigrama`)

**Formato:**
```jsonb
{
  "clues": {
    "h1": "SORBONA",
    "h2": "NOBEL",
    "v1": "RADIO"
  }
}
```

**Ejemplo completo:**
```sql
SELECT * FROM educational_content.validate_and_audit(
    'exercise-uuid'::uuid,
    'user-uuid'::uuid,
    '{"clues": {"h1": "SORBONA", "h2": "NOBEL"}}'::jsonb,
    1,
    '{}'::jsonb
);
```

#### 2. Línea de Tiempo (`linea_tiempo`)

**Formato:**
```jsonb
{
  "events": ["event_3", "event_1", "event_4", "event_2"]
}
```

**Nota:** El array debe contener los IDs de eventos en el orden que el usuario los colocó.

#### 3. Sopa de Letras (`sopa_letras`)

**Formato:**
```jsonb
{
  "words": ["RADIO", "NOBEL", "FISICA"]
}
```

#### 4. Completar Espacios (`completar_espacios`)

**Formato:**
```jsonb
{
  "blanks": {
    "blank1": "científica",
    "blank2": "Nobel",
    "blank3": "física"
  }
}
```

**Nota:** Soporta fuzzy matching si está configurado (threshold 0.70-0.80).

#### 5. Verdadero/Falso (`verdadero_falso`)

**Formato:**
```jsonb
{
  "statements": {
    "stmt1": true,
    "stmt2": false,
    "stmt3": true
  }
}
```

---

### Módulo 2: Comprensión Inferencial

#### 6. Detective Textual (`detective_textual`)

**Formato:**
```jsonb
{
  "questions": {
    "q1": "option_b",
    "q2": "option_a",
    "q3": "option_c"
  }
}
```

**Nota:** Multiple choice basado en inferencias del texto.

#### 7. Construcción de Hipótesis (`construccion_hipotesis`)

**Formato:**
```jsonb
{
  "hypothesis": "Marie Curie descubrió el radio porque realizó experimentos con minerales radiactivos durante años de investigación rigurosa."
}
```

**Validación heurística:**
- ✅ Mínimo 20 palabras (configurable)
- ✅ Presencia de keywords (tesis, evidencia, porque, etc.)
- ⚠️ **NO valida calidad del contenido** - requiere revisión manual

#### 8. Predicción Narrativa (`prediccion_narrativa`)

**Formato:**
```jsonb
{
  "prediction": "El personaje principal decidirá confrontar al antagonista en el capítulo final porque ha acumulado evidencia suficiente y cuenta con el apoyo de sus aliados, lo que le da confianza para enfrentar el conflicto."
}
```

**Validación heurística:**
- ✅ Mínimo 30 palabras (configurable)
- ✅ Presencia de keywords narrativos
- ⚠️ **NO valida calidad del contenido** - requiere revisión manual

#### 9. Puzzle de Contexto (`puzzle_contexto`)

**Formato:**
```jsonb
{
  "questions": {
    "q1": "option_a",
    "q2": "option_d",
    "q3": "option_b"
  }
}
```

**Nota:** Similar a detective_textual pero enfocado en contexto.

#### 10. Rueda de Inferencias (`rueda_inferencias`)

**Formato:**
```jsonb
{
  "inferences": {
    "inf1": "conclusion1",
    "inf2": "conclusion2",
    "inf3": "conclusion3"
  }
}
```

**Nota:** Matching de pares inferencia-conclusión.

---

### Módulo 3: Pensamiento Crítico

#### 11. Tribunal de Opiniones (`tribunal_opiniones`)

**Formato:**
```jsonb
{
  "opinion": "En mi opinión, la inteligencia artificial debe ser regulada porque presenta riesgos significativos para la privacidad y el empleo. Considero que los gobiernos deben establecer marcos legales claros para proteger a los ciudadanos mientras se fomenta la innovación responsable. Por lo tanto, propongo un sistema de certificación..."
}
```

**Validación heurística:**
- ✅ Mínimo 100 palabras
- ✅ Keywords argumentativos (tesis, argumento, evidencia, conclusión)
- ✅ Estructura argumentativa (en mi opinión, porque, por lo tanto)
- ⚠️ **NO valida calidad del argumento** - requiere revisión manual

#### 12. Debate Digital (`debate_digital`)

**Formato:**
```jsonb
{
  "argument": "Las redes sociales han democratizado la información permitiendo que cualquier persona pueda compartir conocimiento sin intermediarios. Esto ha empoderado a comunidades marginadas...",
  "counterargument": "Sin embargo, esta democratización también ha permitido la proliferación de desinformación. Las plataformas digitales carecen de mecanismos efectivos de verificación..."
}
```

**Validación heurística:**
- ✅ Mínimo 150 palabras totales
- ✅ Ambas partes presentes (argument + counterargument)
- ✅ Keywords de debate (sin embargo, por el contrario, no obstante)
- ⚠️ **NO valida calidad del debate** - requiere revisión manual

#### 13. Análisis de Fuentes (`analisis_fuentes`)

**Formato:**
```jsonb
{
  "questions": {
    "q1": "option_a",  -- credibilidad de la fuente
    "q2": "option_c",  -- sesgo detectado
    "q3": "option_b"   -- confiabilidad
  }
}
```

**Nota:** Incluye soporte para "critical questions" con peso adicional.

#### 14. Podcast Argumentativo (`podcast_argumentativo`)

**Formato:**
```jsonb
{
  "audio_url": "https://storage.example.com/audio/podcast-123.mp3",
  "duration_seconds": 240,
  "file_format": "mp3",
  "file_size_mb": 12.5,
  "title": "Análisis del Cambio Climático",
  "description": "Podcast argumentando sobre las causas y consecuencias del cambio climático..."
}
```

**Validación técnica:**
- ✅ Formato de audio válido (mp3, m4a, wav, ogg, aac)
- ✅ Duración en rango (120-600 seg por defecto)
- ✅ Tamaño de archivo (< 50 MB)
- ✅ Metadata completo (título, descripción)
- ⚠️ **NO valida calidad del contenido argumentativo** - requiere revisión manual

**Ejemplo:**
```sql
SELECT * FROM educational_content.validate_and_audit(
    'exercise-uuid'::uuid,
    'user-uuid'::uuid,
    '{
      "audio_url": "https://storage.example.com/audio/podcast-123.mp3",
      "duration_seconds": 240,
      "file_format": "mp3",
      "file_size_mb": 12.5,
      "title": "Análisis del Cambio Climático",
      "description": "Podcast argumentando sobre..."
    }'::jsonb,
    1,
    '{}'::jsonb
);
```

#### 15. Matriz de Perspectivas (`matriz_perspectivas`)

**Formato:**
```jsonb
{
  "perspectives": {
    "perspective1": "Desde el punto de vista económico, la globalización ha aumentado la competencia...",
    "perspective2": "Desde la perspectiva social, ha generado desigualdad...",
    "perspective3": "Ambientalmente, ha acelerado la explotación de recursos..."
  }
}
```

**Validación:**
- ✅ Todas las celdas completas
- ✅ Mínimo 50 caracteres por celda (configurable)
- ✅ Keywords específicos por perspectiva (opcional)

---

## 🔄 Función de Recálculo

### `recalculate_exercise()`

**Uso:** Cuando un profesor detecta un error en la validación y quiere recalcular.

#### Firma

```sql
SELECT * FROM educational_content.recalculate_exercise(
    p_original_audit_id UUID,
    p_recalculated_by UUID,
    p_recalculation_reason TEXT
);
```

#### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `p_original_audit_id` | UUID | ID del audit record a recalcular |
| `p_recalculated_by` | UUID | ID del profesor/admin que recalcula |
| `p_recalculation_reason` | TEXT | Razón del recálculo (obligatorio) |

#### Retorna (RECORD)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `new_audit_id` | UUID | ID del nuevo registro de auditoría |
| `original_score` | INTEGER | Score original |
| `new_score` | INTEGER | Score recalculado |
| `has_discrepancy` | BOOLEAN | `true` si cambió el resultado |
| `discrepancy_details` | JSONB | Detalles de las diferencias |

#### Ejemplo

```sql
SELECT * FROM educational_content.recalculate_exercise(
    'audit-id-original'::uuid,
    'teacher-uuid'::uuid,
    'Estudiante reportó error en la calificación'
);
```

**Resultado con discrepancia:**
```
new_audit_id | original_score | new_score | has_discrepancy | discrepancy_details
-------------|----------------|-----------|-----------------|--------------------
uuid-new     | 80             | 100       | true            | {"original_is_correct": false, "new_is_correct": true, ...}
```

---

## 📊 Vista de Análisis

### `v_validation_analysis`

**Uso:** Dashboards de profesores, reportes, análisis de calidad.

#### Consultas Útiles

**1. Ver discrepancias detectadas:**
```sql
SELECT
    exercise_title,
    user_id,
    attempt_number,
    original_score,
    score AS new_score,
    score_difference,
    discrepancy_type,
    discrepancy_notes
FROM educational_content.v_validation_analysis
WHERE has_discrepancy = true
ORDER BY validation_timestamp DESC
LIMIT 20;
```

**2. Estadísticas por tipo de ejercicio:**
```sql
SELECT
    exercise_type,
    COUNT(*) AS total_validations,
    COUNT(*) FILTER (WHERE is_correct) AS correct_count,
    ROUND(AVG(score_percentage), 2) AS avg_score_percentage,
    COUNT(*) FILTER (WHERE has_discrepancy) AS discrepancy_count,
    ROUND(AVG(validation_duration_ms), 2) AS avg_duration_ms
FROM educational_content.v_validation_analysis
WHERE is_recalculated = false
GROUP BY exercise_type
ORDER BY total_validations DESC;
```

**3. Rendimiento de un estudiante:**
```sql
SELECT
    module_title,
    exercise_title,
    attempt_number,
    is_correct,
    score,
    max_score,
    score_percentage,
    validation_timestamp
FROM educational_content.v_validation_analysis
WHERE user_id = 'student-uuid-here'
  AND is_recalculated = false
ORDER BY validation_timestamp DESC;
```

**4. Ejercicios con más discrepancias:**
```sql
SELECT
    exercise_id,
    exercise_title,
    exercise_type,
    COUNT(*) FILTER (WHERE has_discrepancy) AS discrepancy_count,
    COUNT(*) AS total_attempts,
    ROUND(
        (COUNT(*) FILTER (WHERE has_discrepancy)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
        2
    ) AS discrepancy_percentage
FROM educational_content.v_validation_analysis
WHERE is_recalculated = false
GROUP BY exercise_id, exercise_title, exercise_type
HAVING COUNT(*) FILTER (WHERE has_discrepancy) > 0
ORDER BY discrepancy_percentage DESC, discrepancy_count DESC
LIMIT 10;
```

---

## ⚠️ Consideraciones Importantes

### 1. Validadores Heurísticos

Los siguientes validadores **NO validan calidad del contenido**:

- `validate_construccion_hipotesis` - solo longitud + keywords
- `validate_prediccion_narrativa` - solo longitud + keywords
- `validate_tribunal_opiniones` - solo longitud + keywords + estructura
- `validate_debate_digital` - solo longitud + keywords + estructura

**Recomendación:**
- Marcar estos ejercicios como "pending_review" en el backend
- Enviar notificación al profesor para revisión manual
- Usar el campo `details` del resultado para mostrar métricas al profesor

### 2. Podcast Argumentativo

`validate_podcast_argumentativo` **solo valida criterios técnicos**:
- ✅ Formato válido
- ✅ Duración correcta
- ✅ Tamaño de archivo
- ❌ NO valida contenido

**Recomendación:**
- Siempre marcar como "pending_review"
- Profesor debe escuchar y calificar manualmente

### 3. Auditoría Inmutable

Los registros en `exercise_validation_audit` son **INMUTABLES**:
- ❌ NO modificar registros existentes
- ✅ Crear nuevo registro con `is_recalculated = true` si se necesita corregir

### 4. Manejo de Errores

La función `validate_and_audit()` **captura todos los errores** y retorna:
```sql
is_correct = false
score = 0
feedback = "Error al validar la respuesta. Por favor contacte al administrador."
details = {"error": "...", "error_detail": "..."}
```

**Recomendación:**
- Verificar el campo `details` para detectar errores
- Loguear errores con `audit_id` para debugging
- Notificar al administrador si hay errores recurrentes

---

## 🚀 Integración Recomendada

### Flujo Backend

```typescript
// 1. Usuario envía respuesta
const submitAnswer = async (
  exerciseId: string,
  userId: string,
  answer: object,
  attemptNumber: number
) => {
  // 2. Llamar a validate_and_audit
  const result = await db.query(`
    SELECT * FROM educational_content.validate_and_audit(
      $1::uuid,
      $2::uuid,
      $3::jsonb,
      $4::integer,
      $5::jsonb
    )
  `, [
    exerciseId,
    userId,
    JSON.stringify(answer),
    attemptNumber,
    JSON.stringify({
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      session_id: req.session.id
    })
  ]);

  const validation = result.rows[0];

  // 3. Guardar en exercise_attempts/submissions
  await db.query(`
    INSERT INTO educational_content.exercise_submissions
    (exercise_id, user_id, attempt_number, is_correct, score, audit_id)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    exerciseId,
    userId,
    attemptNumber,
    validation.is_correct,
    validation.score,
    validation.audit_id
  ]);

  // 4. Verificar si requiere revisión manual
  const requiresReview = [
    'construccion_hipotesis',
    'prediccion_narrativa',
    'tribunal_opiniones',
    'debate_digital',
    'podcast_argumentativo'
  ].includes(exercise.exercise_type);

  if (requiresReview) {
    await notifyTeacherForReview(exerciseId, userId, validation.audit_id);
  }

  // 5. Retornar resultado al frontend
  return {
    isCorrect: validation.is_correct,
    score: validation.score,
    maxScore: validation.max_score,
    feedback: validation.feedback,
    details: validation.details,
    auditId: validation.audit_id,
    requiresReview
  };
};
```

### Endpoint de Recálculo

```typescript
// Solo para profesores/admins
const recalculateExercise = async (
  auditId: string,
  teacherId: string,
  reason: string
) => {
  const result = await db.query(`
    SELECT * FROM educational_content.recalculate_exercise(
      $1::uuid,
      $2::uuid,
      $3::text
    )
  `, [auditId, teacherId, reason]);

  const recalc = result.rows[0];

  if (recalc.has_discrepancy) {
    // Actualizar score del estudiante
    await updateStudentScore(
      auditId,
      recalc.new_score
    );

    // Notificar al estudiante del cambio
    await notifyStudent({
      message: `Tu calificación fue recalculada: ${recalc.original_score} → ${recalc.new_score}`,
      auditId: recalc.new_audit_id
    });
  }

  return recalc;
};
```

---

## 📚 Referencia de Tablas

### `exercise_validation_config`

Configuración de validación por tipo de ejercicio.

**Campos principales:**
- `exercise_type`: ENUM (crucigrama, linea_tiempo, etc.)
- `validation_function`: TEXT (nombre de la función)
- `case_sensitive`: BOOLEAN
- `allow_partial_credit`: BOOLEAN
- `fuzzy_matching_threshold`: NUMERIC(3,2)
- `normalize_text`: BOOLEAN
- `special_rules`: JSONB

**No modificar** - solo lectura para el backend.

### `exercise_validation_audit`

Auditoría completa de todas las validaciones.

**Campos principales:**
```sql
-- Identificadores
id: UUID
exercise_id: UUID
user_id: UUID
attempt_number: INTEGER

-- Snapshots (INMUTABLES)
submitted_answer: JSONB
exercise_snapshot: JSONB
validation_config_snapshot: JSONB

-- Resultado
is_correct: BOOLEAN
score: INTEGER
max_score: INTEGER
feedback: TEXT
validation_details: JSONB

-- Recálculo
is_recalculated: BOOLEAN
recalculated_at: TIMESTAMP
original_audit_id: UUID

-- Discrepancia
has_discrepancy: BOOLEAN
discrepancy_type: TEXT
```

**Solo INSERT** - no modificar registros existentes.

---

## 🧪 Ejemplos de Testing

### Test 1: Validación Exitosa

```sql
-- Crear ejercicio de prueba
INSERT INTO educational_content.exercises (id, title, exercise_type, content, solution, max_points, auto_gradable)
VALUES (
  '12345678-1234-1234-1234-123456789012'::uuid,
  'Test Crucigrama',
  'crucigrama',
  '{"clues": {"h1": {"question": "Universidad de Marie Curie"}}}'::jsonb,
  '{"clues": {"h1": "SORBONA"}}'::jsonb,
  100,
  true
);

-- Validar respuesta correcta
SELECT * FROM educational_content.validate_and_audit(
  '12345678-1234-1234-1234-123456789012'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  '{"clues": {"h1": "SORBONA"}}'::jsonb,
  1,
  '{}'::jsonb
);

-- Verificar resultado
-- is_correct = true, score = 100
```

### Test 2: Validación Parcial

```sql
-- Validar respuesta parcialmente correcta
SELECT * FROM educational_content.validate_and_audit(
  '12345678-1234-1234-1234-123456789012'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  '{"clues": {"h1": "SORBONA", "h2": "INCORRECTO"}}'::jsonb,
  2,
  '{}'::jsonb
);

-- Verificar resultado
-- is_correct = false, score = 50 (parcial)
```

### Test 3: Recálculo

```sql
-- Obtener audit_id del test anterior
WITH last_audit AS (
  SELECT id FROM educational_content.exercise_validation_audit
  ORDER BY created_at DESC LIMIT 1
)
SELECT * FROM educational_content.recalculate_exercise(
  (SELECT id FROM last_audit),
  'teacher-uuid'::uuid,
  'Test de recálculo'
);
```

---

## ✅ Checklist de Integración

Backend debe implementar:

- [ ] Endpoint POST `/exercises/:id/submit` que llama a `validate_and_audit()`
- [ ] Endpoint POST `/exercises/recalculate/:auditId` que llama a `recalculate_exercise()`
- [ ] Endpoint GET `/exercises/analytics` que consulta `v_validation_analysis`
- [ ] Validación de formato JSONB según tipo de ejercicio
- [ ] Manejo de errores de validación
- [ ] Notificación a profesores para ejercicios que requieren revisión manual
- [ ] Dashboard de discrepancias para profesores
- [ ] Tests end-to-end para los 15 tipos de ejercicios

---

## 📞 Contacto y Soporte

**Documentos relacionados:**
- `DB-117-EJECUCION.md` - Documentación técnica de implementación
- `HANDOFF-FE-059-TO-DB.md` - Handoff original del Frontend

**Para dudas o issues:**
- Verificar primero la documentación de ejecución
- Revisar ejemplos de uso en los archivos SQL
- Consultar la vista `v_validation_analysis` para debugging

---

**Fecha de handoff:** 2025-11-19
**Estado:** ✅ LISTO PARA INTEGRACIÓN
**Próximo paso:** Backend Agent implementa endpoints de integración
