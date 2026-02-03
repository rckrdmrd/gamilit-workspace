# PLAN DE CORRECCION: EJERCICIOS M3-M5 Y DOCUMENTACION

**Agente:** Claude Opus 4.5 (Orchestrator Agent)
**Fecha:** 2026-01-07
**Version:** 1.0
**Estado:** FASE 3 - PLANEACION
**Basado en:** ANALISIS-DETALLADO-EJERCICIOS-M3-M5-RECOMPENSAS-2026-01-07.md

---

## OBJETIVO

Corregir las inconsistencias identificadas entre la documentacion y el codigo implementado para los ejercicios de los modulos 3, 4 y 5, asegurando:

1. Documentacion sincronizada con el codigo
2. Quiz TikTok correctamente configurado
3. Sistema de recompensas funcionando correctamente
4. Portal Teacher mostrando todos los ejercicios pendientes

---

## RESUMEN DE CORRECCIONES

| ID | Descripcion | Prioridad | Tipo | Archivos |
|----|-------------|-----------|------|----------|
| CORR-DOC-M4-001 | Actualizar RF-M4-001 con tipos reales | P1 | Documentacion | 1 |
| CORR-DOC-M5-001 | Actualizar RF-M5-001 con tipos reales | P1 | Documentacion | 1 |
| CORR-SEED-M4-001 | Cambiar quiz_tiktok a auto-gradable | P0 | Codigo | 2 |
| CORR-DOC-FLUJO-001 | Actualizar flujo con nota sobre quiz_tiktok | P2 | Documentacion | 1 |

---

## CICLO 1: CORRECCION QUIZ_TIKTOK (P0)

### Objetivo
Cambiar `requires_manual_grading = false` para quiz_tiktok ya que tiene auto-grading implementado.

### Justificacion
- El ejercicio quiz_tiktok tiene funcion `gradeQuizTiktok()` en exercise-grading.service.ts
- Actualmente marcado como `requires_manual_grading = true` lo que crea ManualReview innecesario
- Esto genera trabajo adicional para los maestros sin necesidad

### Archivos a Modificar

**Archivo 1:** `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`

**Cambio:**
```sql
-- ANTES (linea ~88):
is_active, requires_manual_grading
true, true  -- Requiere evaluacion manual del maestro

-- DESPUES:
is_active, requires_manual_grading
true, false  -- CORR-SEED-M4-001: Auto-gradable (tiene gradeQuizTiktok())
```

**Archivo 2:** `apps/database/seeds/dev/educational_content/05-exercises-module4.sql`

**Cambio:** Mismo que Archivo 1

### Validacion
```sql
SELECT exercise_type, requires_manual_grading
FROM educational_content.exercises
WHERE exercise_type = 'quiz_tiktok';

-- Resultado esperado:
-- quiz_tiktok | false
```

### Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| ManualReviews existentes para quiz_tiktok | Baja | Medio | Verificar BD antes de aplicar |
| ON CONFLICT no actualiza | Baja | Alto | Incluir campo en UPDATE SET |

---

## CICLO 2: ACTUALIZACION RF-M4-001 (P1)

### Objetivo
Actualizar el documento de requerimientos del Modulo 4 para reflejar los tipos de ejercicios realmente implementados.

### Archivo a Modificar

**Archivo:** `docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M4-001-ejercicios-m4.md`

### Contenido Actualizado

```markdown
---
id: RF-M4-001
title: Ejercicios Modulo 4 - Lectura Digital y Multimodal
epic: EAI-007
status: Done
created: 2025-12-05
updated: 2026-01-07
---

# RF-M4-001: Ejercicios Modulo 4

## Descripcion

El sistema soporta 5 tipos de ejercicios para el Modulo 4 (Lectura Digital y Multimodal).

## Tipos de Ejercicios

| # | Tipo | Descripcion | Validacion |
|---|------|-------------|------------|
| 1 | verificador_fake_news | Verificador de Fake News | Manual |
| 2 | infografia_interactiva | Infografia Interactiva | Manual |
| 3 | quiz_tiktok | Quiz estilo TikTok | Auto |
| 4 | navegacion_hipertextual | Navegacion Hipertextual | Manual |
| 5 | analisis_memes | Analisis de Memes | Manual |

## Notas de Implementacion

**quiz_tiktok:** Es el unico ejercicio de M4 con evaluacion automatica porque tiene preguntas con respuestas unicas verificables. Implementado en `exercise-grading.service.ts:gradeQuizTiktok()`.

## Requisitos Funcionales

1. **RF-M4-001-01**: El sistema debe permitir envio de respuestas para cada tipo de ejercicio
2. **RF-M4-001-02**: El sistema debe validar formatos de archivo aceptados
3. **RF-M4-001-03**: El sistema debe almacenar archivos multimedia en storage
4. **RF-M4-001-04**: El sistema debe marcar ejercicios como "pendiente revision" (excepto quiz_tiktok)
5. **RF-M4-001-05**: El sistema debe notificar a docentes de nuevos envios

## Restricciones

- Tamano maximo de archivo: 50MB
- Formatos permitidos: PDF, PNG, JPG, MP3, MP4, WEBM
- Tiempo maximo de carga: 30 segundos

## Criterios de Aceptacion

- [x] Los 5 tipos de ejercicio aceptan envios
- [x] Validacion de formato funciona correctamente
- [x] Archivos se almacenan en Supabase Storage
- [x] Estado "pending_review" se asigna automaticamente (4/5 ejercicios)
- [x] quiz_tiktok se auto-califica inmediatamente
- [x] Notificaciones se generan para docentes

## Especificaciones Relacionadas

- [ET-M4M5-001](../especificaciones/ET-M4M5-001-schema-bd.md)
- [ET-M4M5-002](../especificaciones/ET-M4M5-002-backend-apis.md)

---

**Estado:** Done
**Actualizado:** 2026-01-07 (CORR-DOC-M4-001)
```

### Validacion
- Verificar que los 5 tipos coincidan con seeds
- Verificar que quiz_tiktok este marcado como Auto

---

## CICLO 3: ACTUALIZACION RF-M5-001 (P1)

### Objetivo
Actualizar el documento de requerimientos del Modulo 5 para reflejar los tipos de ejercicios realmente implementados.

### Archivo a Modificar

**Archivo:** `docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M5-001-ejercicios-m5.md`

### Contenido Actualizado

```markdown
---
id: RF-M5-001
title: Ejercicios Modulo 5 - Produccion y Expresion Lectora
epic: EAI-007
status: Done
created: 2025-12-05
updated: 2026-01-07
---

# RF-M5-001: Ejercicios Modulo 5

## Descripcion

El sistema soporta 3 tipos de ejercicios para el Modulo 5 (Produccion y Expresion Lectora). El estudiante elige UNO de los tres para completar el modulo. Todos requieren evaluacion manual por docentes.

## Tipos de Ejercicios

| # | Tipo | Descripcion | Validacion | XP | ML Coins |
|---|------|-------------|------------|-----|----------|
| 1 | diario_multimedia | Diario Multimedia de Marie Curie | Manual | 200 | 40 |
| 2 | comic_digital | Comic Digital Narrativo | Manual | 200 | 40 |
| 3 | video_carta | Video-Carta a Marie Curie | Manual | 200 | 40 |

## Descripcion de Ejercicios

### diario_multimedia (Diario Multimedia)
El estudiante crea 5 entradas de diario desde la perspectiva de Marie Curie, combinando texto, imagenes y audio.

### comic_digital (Comic Digital)
El estudiante crea un comic de 6 vinetas narrando un momento clave del descubrimiento del radio.

### video_carta (Video-Carta)
El estudiante graba un video de 2-3 minutos enviando un mensaje a Marie Curie desde la perspectiva actual.

## Requisitos Funcionales

1. **RF-M5-001-01**: El sistema debe permitir envio de texto enriquecido
2. **RF-M5-001-02**: El sistema debe soportar adjuntos multimedia
3. **RF-M5-001-03**: El sistema debe permitir multiples archivos por ejercicio
4. **RF-M5-001-04**: El sistema debe asignar rubrica de evaluacion
5. **RF-M5-001-05**: El sistema debe calcular XP/ML basado en calificacion

## Restricciones

- Longitud minima de texto: 200 caracteres
- Longitud maxima de texto: 10,000 caracteres
- Maximo adjuntos: 5 archivos
- Tamano total maximo: 100MB
- Duracion video: 2-3 minutos

## Criterios de Aceptacion

- [x] Los 3 tipos de ejercicio aceptan envios
- [x] Soporte para texto + multimedia
- [x] Rubrica de calificacion disponible para docentes
- [x] Calculo de XP/ML correcto post-calificacion
- [x] Progreso hacia K'uk'ulkan se actualiza

## Especificaciones Relacionadas

- [ET-M4M5-001](../especificaciones/ET-M4M5-001-schema-bd.md)
- [ET-M4M5-002](../especificaciones/ET-M4M5-002-backend-apis.md)

---

**Estado:** Done
**Actualizado:** 2026-01-07 (CORR-DOC-M5-001)
```

### Validacion
- Verificar que los 3 tipos coincidan con seeds
- Verificar XP y ML Coins correctos

---

## CICLO 4: ACTUALIZACION FLUJO VALIDACION (P2)

### Objetivo
Agregar nota explicativa en el documento de flujo sobre quiz_tiktok.

### Archivo a Modificar

**Archivo:** `docs/90-transversal/sistema-recompensas/03-FLUJO-VALIDACION-MAESTRO-M3-M5.md`

### Cambio

Agregar seccion despues de la tabla de Modulo 4:

```markdown
### Nota sobre Quiz TikTok

El ejercicio `quiz_tiktok` es una **excepcion** al flujo de validacion manual:

- **Razon:** Tiene preguntas con respuestas unicas verificables (`correctAnswers: [1, 1, 2]`)
- **Implementacion:** `exercise-grading.service.ts:gradeQuizTiktok()`
- **Flujo:** El estudiante recibe feedback y recompensas inmediatamente (igual que M1-M2)
- **requires_manual_grading:** `false`

Por tanto, de los 5 ejercicios de M4, solo 4 requieren evaluacion manual.
```

---

## DEPENDENCIAS ENTRE CICLOS

```
CICLO 1: CORR-SEED-M4-001 (quiz_tiktok)
    |
    +-- No depende de nada
    |
    v
CICLO 2: CORR-DOC-M4-001 (RF-M4-001)
    |
    +-- Depende de CICLO 1 (para documentar correctamente)
    |
    v
CICLO 3: CORR-DOC-M5-001 (RF-M5-001)
    |
    +-- No depende de nada (paralelo a CICLO 2)
    |
    v
CICLO 4: CORR-DOC-FLUJO-001 (Flujo validacion)
    |
    +-- Depende de CICLO 1 y 2
```

---

## ORDEN DE EJECUCION

| Orden | Ciclo | ID | Descripcion |
|-------|-------|-----|-------------|
| 1 | CICLO 1 | CORR-SEED-M4-001 | Corregir quiz_tiktok en seeds |
| 2 | CICLO 2 | CORR-DOC-M4-001 | Actualizar RF-M4-001 |
| 3 | CICLO 3 | CORR-DOC-M5-001 | Actualizar RF-M5-001 |
| 4 | CICLO 4 | CORR-DOC-FLUJO-001 | Actualizar flujo validacion |

---

## ESTIMACIONES

| Ciclo | Duracion Estimada |
|-------|-------------------|
| CICLO 1 | 15 min |
| CICLO 2 | 10 min |
| CICLO 3 | 10 min |
| CICLO 4 | 5 min |
| Validacion | 15 min |
| **TOTAL** | **55 min** |

---

## CRITERIOS DE EXITO

### Para CICLO 1
- [ ] quiz_tiktok tiene `requires_manual_grading = false`
- [ ] Seed ejecuta sin errores
- [ ] No se crean ManualReviews para quiz_tiktok

### Para CICLO 2-4
- [ ] Documentos actualizados con tipos correctos
- [ ] Fechas de actualizacion incluidas
- [ ] IDs de correccion referenciados

### General
- [ ] Todos los archivos sincronizados
- [ ] Sin regresiones en funcionalidad
- [ ] Documentacion completa

---

## VALIDACION POST-EJECUCION

### Queries SQL

```sql
-- Verificar M4
SELECT exercise_type, requires_manual_grading
FROM educational_content.exercises e
JOIN educational_content.modules m ON e.module_id = m.id
WHERE m.module_code = 'MOD-04-DIGITAL'
ORDER BY e.order_index;

-- Resultado esperado:
-- verificador_fake_news    | true
-- infografia_interactiva   | true
-- quiz_tiktok              | false  <- CORREGIDO
-- navegacion_hipertextual  | true
-- analisis_memes           | true

-- Verificar totales por modulo
SELECT m.module_code,
       COUNT(*) as total,
       SUM(CASE WHEN requires_manual_grading THEN 1 ELSE 0 END) as manual
FROM educational_content.exercises e
JOIN educational_content.modules m ON e.module_id = m.id
WHERE m.module_code LIKE 'MOD-0%'
GROUP BY m.module_code
ORDER BY m.module_code;

-- Resultado esperado:
-- MOD-01-LITERAL     | 5 | 0
-- MOD-02-INFERENCIAL | 5 | 0
-- MOD-03-CRITICA     | 5 | 5
-- MOD-04-DIGITAL     | 5 | 4  <- quiz_tiktok es auto
-- MOD-05-PRODUCCION  | 3 | 3
```

### Verificacion de Documentacion

```bash
# Verificar tipos en RF-M4-001
grep -E "verificador_fake_news|infografia_interactiva|quiz_tiktok|navegacion_hipertextual|analisis_memes" \
  docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M4-001-ejercicios-m4.md

# Verificar tipos en RF-M5-001
grep -E "diario_multimedia|comic_digital|video_carta" \
  docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M5-001-ejercicios-m5.md
```

---

## ROLLBACK

En caso de problemas, revertir cambios con:

```sql
-- Revertir quiz_tiktok si es necesario
UPDATE educational_content.exercises
SET requires_manual_grading = true
WHERE exercise_type = 'quiz_tiktok';
```

Para documentacion, usar git revert.

---

**Creado por:** Claude Opus 4.5 (Orchestrator Agent)
**Fecha:** 2026-01-07
**Version:** 1.0
**Estado:** PLAN LISTO PARA VALIDACION
