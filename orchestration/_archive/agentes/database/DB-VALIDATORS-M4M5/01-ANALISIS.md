# ANÁLISIS: Validadores Básicos para Ejercicios Módulos 4 y 5

**Fecha:** 2025-11-29
**Agente:** Database-Agent
**Tarea:** DB-VALIDATORS-M4M5
**Estado:** En análisis

---

## 1. CONTEXTO

### 1.1. Objetivo de la Tarea
Crear funciones de validación SQL básicas para los ejercicios de Módulos 4 y 5 que:
- **NO evalúan contenido** (eso es responsabilidad del docente)
- **SÍ validan estructura JSONB** de las respuestas enviadas
- **SIEMPRE retornan** `requires_manual_review = true`
- Se integran con el sistema de validación existente

### 1.2. Contexto Arquitectónico
GAMILIT tiene dos tipos de ejercicios:

1. **Autocorregibles** (`auto_gradable = true`, `requires_manual_grading = false`)
   - Módulos 1, 2, 3
   - Validación automática completa
   - Almacenamiento en `progress_tracking.exercise_attempts`

2. **Revisión Manual** (`auto_gradable = false`, `requires_manual_grading = true`)
   - Módulos 4, 5
   - Validación SOLO de estructura
   - Almacenamiento en `progress_tracking.exercise_submissions`
   - Evaluación por docente en `progress_tracking.manual_reviews`

### 1.3. Inventario Consultado

**Archivo:** `orchestration/inventarios/DATABASE_INVENTORY.yml`

```yaml
educational_content:
  validators_by_module:
    module_1: 7  # autocorregibles
    module_2: 6  # autocorregibles
    module_3: 5  # autocorregibles
    module_4: 5  # PENDIENTE - validación estructura
    module_5: 3  # PENDIENTE - validación estructura
```

**Verificación:** No existen validadores para M4-M5 (grep negativo confirmado).

---

## 2. TIPOS DE EJERCICIOS A VALIDAR

### 2.1. Módulo 4: Lectura Digital y Multimodal

#### 4.1. Verificador Fake News
**Exercise Type:** `verificador_fake_news`

**Estructura esperada:**
```jsonb
{
  "claims_verified": [
    {
      "claim_id": "string",
      "is_fake": boolean,
      "evidence": "string"
    }
  ],
  "notes": "string (opcional)"
}
```

**Validaciones:**
- `claims_verified` existe y es array
- Cada elemento tiene `claim_id`, `is_fake`, `evidence`
- `is_fake` es boolean
- Mínimo 1 claim verificado

---

#### 4.2. Infografía Interactiva
**Exercise Type:** `infografia_interactiva`

**Estructura esperada:**
```jsonb
{
  "answers": {
    "question1": "answer1",
    "question2": "answer2"
  },
  "sections_explored": ["section1", "section2", ...]
}
```

**Validaciones:**
- `answers` existe y es objeto
- `sections_explored` existe y es array
- `sections_explored` tiene al menos 1 elemento

---

#### 4.3. Quiz TikTok
**Exercise Type:** `quiz_tiktok`

**Estructura esperada:**
```jsonb
{
  "answers": [1, 2, 3, 4, ...]
}
```

**Validaciones:**
- `answers` existe y es array de integers
- Cada elemento es un número entero >= 0
- Mínimo 1 respuesta

---

#### 4.4. Navegación Hipertextual
**Exercise Type:** `navegacion_hipertextual`

**Estructura esperada:**
```jsonb
{
  "path": ["page1", "page2", "page3", ...],
  "information_found": {
    "fact1": "value1",
    "fact2": "value2"
  }
}
```

**Validaciones:**
- `path` existe y es array
- `path` tiene al menos 2 elementos
- `information_found` existe y es objeto

---

#### 4.5. Análisis de Memes
**Exercise Type:** `analisis_memes`

**Estructura esperada:**
```jsonb
{
  "annotations": [
    {
      "element": "string",
      "interpretation": "string"
    }
  ],
  "analysis": {
    "tone": "string",
    "message": "string",
    "effectiveness": "string"
  }
}
```

**Validaciones:**
- `annotations` existe y es array
- Cada anotación tiene `element` e `interpretation`
- `analysis` existe y es objeto
- `analysis` tiene al menos `message` no vacío

---

### 2.2. Módulo 5: Producción y Expresión Lectora

#### 5.1. Diario Multimedia
**Exercise Type:** `diario_multimedia`

**Estructura esperada:**
```jsonb
{
  "entries": [
    {
      "date": "YYYY-MM-DD",
      "content": "string",
      "multimedia": "uuid (opcional)"
    }
  ]
}
```

**Validaciones:**
- `entries` existe y es array
- Cada entrada tiene `date` y `content`
- `content` tiene longitud >= 50 caracteres
- Mínimo 1 entrada

---

#### 5.2. Cómic Digital
**Exercise Type:** `comic_digital`

**Estructura esperada:**
```jsonb
{
  "panels": [
    {
      "image": "uuid (opcional)",
      "dialogue": "string",
      "narration": "string (opcional)"
    }
  ]
}
```

**Validaciones:**
- `panels` existe y es array
- Cada panel tiene al menos `dialogue` o `narration`
- Mínimo 3 paneles

---

#### 5.3. Video Carta
**Exercise Type:** `video_carta`

**Estructura esperada:**
```jsonb
{
  "video_url": "string (opcional si hay script)",
  "script": "string (opcional si hay video_url)",
  "duration": integer
}
```

**Validaciones:**
- Al menos uno de `video_url` o `script` debe existir
- `duration` es entero > 0
- Si existe `script`, longitud >= 100 caracteres

---

## 3. PATRÓN DE VALIDADORES EXISTENTES

### 3.1. Análisis de validate_tribunal_opiniones (Módulo 3)

**Archivo:** `apps/database/ddl/schemas/educational_content/functions/15-validate_tribunal_opiniones.sql`

**Características:**
- Función `IMMUTABLE` con parámetros estándar
- Retorna RECORD con: `is_correct`, `score`, `feedback`, `details`
- Validación heurística (no contenido real)
- Usa `gamilit.normalize_text()` si aplica
- Retorna `details` JSONB con métricas

**Firma:**
```sql
CREATE OR REPLACE FUNCTION educational_content.validate_tribunal_opiniones(
    p_solution JSONB,
    p_submitted_answer JSONB,
    p_max_points INTEGER,
    p_fuzzy_threshold NUMERIC DEFAULT 0.70,
    p_normalize_text BOOLEAN DEFAULT true,
    p_special_rules JSONB DEFAULT '{}'::jsonb,
    OUT is_correct BOOLEAN,
    OUT score INTEGER,
    OUT feedback TEXT,
    OUT details JSONB
)
RETURNS RECORD
LANGUAGE plpgsql
IMMUTABLE
```

### 3.2. Integración con validate_answer

**Archivo:** `apps/database/ddl/schemas/educational_content/functions/02-validate_answer.sql`

**Patrón:**
```sql
WHEN 'validate_tribunal_opiniones' THEN
    SELECT * INTO v_result
    FROM educational_content.validate_tribunal_opiniones(
        v_exercise.solution,
        p_submitted_answer,
        max_score,
        v_config.fuzzy_matching_threshold,
        v_config.normalize_text,
        v_config.special_rules
    );
```

**Implicación:** Necesitamos registrar función en `exercise_validation_config`.

---

## 4. ANÁLISIS DE IMPACTO

### 4.1. Archivos a Crear
- `apps/database/ddl/schemas/educational_content/functions/23-validate_module4_module5.sql`

### 4.2. Archivos a Modificar
- `apps/database/ddl/schemas/educational_content/functions/02-validate_answer.sql` (agregar CASE para M4-M5)
- Seeds de `exercise_validation_config` (registrar validadores)

### 4.3. Inventarios a Actualizar
- `orchestration/inventarios/DATABASE_INVENTORY.yml`
  - `validators_by_module.module_4: 5` (era 0)
  - `validators_by_module.module_5: 3` (era 0)
  - `functions: 32` (era 31)

### 4.4. No se Crean Duplicados
**Verificación:**
```bash
grep -r "validate_module4_module5" apps/database/
# Resultado: No existe
```

---

## 5. DECISIONES DE DISEÑO

### 5.1. Estrategia: Función Única vs Múltiples Funciones

**Opción A: Una función por tipo (8 funciones)**
- ✅ Modular y especializado
- ❌ Overhead: 8 funciones casi idénticas
- ❌ Mantenimiento complejo

**Opción B: Una función maestra (1 función)**
- ✅ DRY: No repetir código
- ✅ Fácil mantenimiento
- ✅ Validación coherente
- ✅ Patrón usado en validate_answer

**DECISIÓN:** Opción B - Una función `validate_module4_module5_answer()`

### 5.2. Firma de Función

```sql
CREATE OR REPLACE FUNCTION educational_content.validate_module4_module5_answer(
    p_exercise_type educational_content.exercise_type,
    p_submitted_answer JSONB,
    p_max_points INTEGER DEFAULT 100,
    OUT is_valid BOOLEAN,
    OUT validation_errors TEXT[],
    OUT requires_manual_review BOOLEAN,
    OUT details JSONB
)
RETURNS RECORD
LANGUAGE plpgsql
IMMUTABLE
```

**Diferencias con validadores M1-M3:**
- No retorna `is_correct` (no autocorregible)
- Retorna `is_valid` (estructura válida)
- Retorna `validation_errors[]` (lista de errores encontrados)
- **SIEMPRE** retorna `requires_manual_review = true`

### 5.3. Integración con validate_answer

**NO** se integrará directamente en `validate_answer` porque:
- `validate_answer` es para ejercicios `auto_gradable = true`
- M4-M5 tienen `auto_gradable = false`
- M4-M5 usan flujo de `exercise_submissions` (no `exercise_attempts`)

**SÍ** estará disponible como función RPC para:
- Backend validar estructura antes de guardar
- Evitar guardar respuestas inválidas

---

## 6. VALIDACIÓN ANTI-DUPLICACIÓN

### 6.1. Búsqueda de Validadores Existentes

```bash
# Buscar funciones similares
find apps/database/ddl/schemas/educational_content/functions -name "*validate*module*"
# Resultado: No existe

# Buscar referencias a tipos M4-M5
grep -r "verificador_fake_news\|diario_multimedia\|comic_digital\|video_carta" \
  apps/database/ddl/schemas/educational_content/functions/
# Resultado: No existe

# Verificar inventario
grep -A 10 "validators_by_module" orchestration/inventarios/DATABASE_INVENTORY.yml
```

**RESULTADO:** No existen validadores duplicados.

### 6.2. Verificación de ENUM exercise_type

**Archivo:** `apps/database/ddl/00-prerequisites.sql`

**Verificado que existen:**
- `verificador_fake_news`
- `infografia_interactiva`
- `quiz_tiktok`
- `navegacion_hipertextual`
- `analisis_memes`
- `diario_multimedia`
- `comic_digital`
- `video_carta`

---

## 7. CONCLUSIONES

### 7.1. Viabilidad
✅ **VIABLE** - No hay conflictos con implementación existente.

### 7.2. Estrategia
✅ Crear función única `validate_module4_module5_answer()` que:
- Valida estructura JSONB según exercise_type
- NO evalúa calidad de contenido
- Retorna errores descriptivos si estructura inválida
- SIEMPRE marca `requires_manual_review = true`

### 7.3. Impacto
- **Bajo:** 1 archivo nuevo
- **Mínimo:** No modifica validadores existentes
- **Documentado:** Sigue patrón establecido

---

## 8. PRÓXIMOS PASOS

1. ✅ **FASE 1:** Análisis completado
2. ⏭️ **FASE 2:** Crear plan de implementación (02-PLAN.md)
3. ⏭️ **FASE 3:** Implementar función SQL
4. ⏭️ **FASE 4:** Validar con carga limpia
5. ⏭️ **FASE 5:** Actualizar inventarios

---

**Fecha finalización análisis:** 2025-11-29
**Próxima fase:** 02-PLAN.md
