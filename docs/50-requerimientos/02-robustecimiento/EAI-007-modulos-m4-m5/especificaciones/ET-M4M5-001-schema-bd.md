---
id: ET-M4M5-001
title: Schema Base de Datos - Modulos M4-M5
rf: [RF-M4-001, RF-M5-001]
epic: EAI-007
status: Done
created: 2025-12-05
updated: 2026-01-20
---

# ET-M4M5-001: Schema Base de Datos

## Schema

**Nombre:** educational_content

## Tablas Afectadas

### exercises (existente)

Tipos de ejercicio implementados:
```sql
-- Modulo 4 (4 manual + 1 auto)
'verificador_fake_news',      -- Manual: Verificar afirmaciones + evidencia
'infografia_interactiva',     -- Manual: Drag-drop sobre imagen
'quiz_tiktok',                -- AUTO: Swipe gestures, respuestas verificables
'navegacion_hipertextual',    -- Manual: Explorar documento, responder preguntas
'analisis_memes'              -- Manual: Anotaciones visuales sobre meme

-- Modulo 5 (todos manual, estudiante elige 1)
'diario_multimedia',          -- Manual: 5 entradas con texto + multimedia
'comic_digital',              -- Manual: 6 vinetas narrativas
'video_carta'                 -- Manual: Video 2-3 min con 4 secciones
```

### student_responses (existente)

Campos utilizados:
- `response_data`: JSONB con estructura por tipo
- `status`: 'pending_review' para M4-M5
- `media_urls`: Array de URLs de archivos

### media_attachments (existente)

Almacena archivos multimedia:
- `file_path`: Ruta en Supabase Storage
- `file_type`: Tipo MIME
- `file_size`: Tamano en bytes
- `student_response_id`: FK a respuesta

## Funciones

### validate_module4_module5_answer

**Ubicacion:** `ddl/schemas/educational_content/functions/23-validate_module4_module5.sql`

```sql
CREATE OR REPLACE FUNCTION educational_content.validate_module4_module5_answer(
  p_exercise_type TEXT,
  p_answer JSONB
) RETURNS BOOLEAN
```

**Logica:**
1. Valida estructura de respuesta segun tipo
2. Verifica campos requeridos
3. Retorna TRUE si es valido para revision manual

## RLS Policies

Politicas existentes aplican:
- Estudiantes pueden crear/ver sus respuestas
- Docentes pueden ver respuestas de sus grupos
- Docentes pueden actualizar calificaciones

## Trazabilidad

**Funciones:**
- `apps/database/ddl/schemas/educational_content/functions/23-validate_module4_module5.sql`

**Seeds:**
- `apps/database/seeds/dev/05-exercises-module4.sql` (5 ejercicios)
- `apps/database/seeds/dev/06-exercises-module5.sql` (3 ejercicios)

**Entities:**
- `apps/backend/src/modules/progress/entities/manual-review.entity.ts`
- `apps/backend/src/modules/educational/entities/media-attachment.entity.ts`

**Triggers:**
- `apps/database/ddl/schemas/progress_tracking/triggers/16-trg_create_manual_review.sql`
- `apps/database/ddl/schemas/progress_tracking/triggers/17-trg_create_manual_review_on_update.sql`

---

**Estado:** Done
**Actualizado:** 2026-01-20 (TASK-2026-01-20-001: Sincronizar con implementacion real)
