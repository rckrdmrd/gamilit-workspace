---
titulo: Mecánicas Educativas Frontend
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# MECANICAS EDUCATIVAS - FRONTEND

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Version:** 1.1
**Fecha:** 2026-02-21 (actualizado: evaluacion M3-M5 exclusivamente por maestro)
**Auditoria:** Comparacion documentacion vs implementacion

---

## RESUMEN

| Modulo | Oficiales | Implementadas | Extras |
|--------|-----------|---------------|--------|
| M1 - Comprension Literal | 5 | 7 | +2 |
| M2 - Comprension Inferencial | 5 | 6 | +1 |
| M3 - Comprension Critica | 5 | 5 | 0 |
| M4 - Lectura Digital | 5 | 5 | 0 |
| M5 - Produccion Lectora | 3 | 3 | 0 |
| Auxiliares | - | 4 | - |
| **TOTAL** | **23** | **30** | **+3** |

---

## MODULO 1: COMPRENSION LITERAL

**Ubicacion:** `features/mechanics/module1/`

### Mecanicas Oficiales (5)

| Mecanica | Carpeta | Componente | Estado |
|----------|---------|------------|--------|
| Crucigrama | Crucigrama/ | CrucigramaExercise.tsx | ✅ Implementado |
| Linea de Tiempo | Timeline/ | TimelineExercise.tsx | ✅ Implementado |
| Completar Espacios | CompletarEspacios/ | CompletarEspaciosExercise.tsx | ✅ Implementado |
| Verdadero/Falso | VerdaderoFalso/ | VerdaderoFalsoExercise.tsx | ✅ Implementado |
| Sopa de Letras | SopaLetras/ | SopaLetrasExercise.tsx | ✅ Implementado (BONUS) |

### Mecanicas Extra (+2)

| Mecanica | Carpeta | Componente | Nota |
|----------|---------|------------|------|
| Emparejamiento | Emparejamiento/ | EmparejamientoExercise.tsx | No en doc oficial |
| Mapa Conceptual | MapaConceptual/ | MapaConceptualExercise.tsx | No en doc oficial |

---

## MODULO 2: COMPRENSION INFERENCIAL

**Ubicacion:** `features/mechanics/module2/`

### Mecanicas Oficiales (5)

| Mecanica | Carpeta | Componente | Estado |
|----------|---------|------------|--------|
| Detective Textual | DetectiveTextual/ | DetectiveTextualExercise.tsx | ✅ Implementado |
| Construccion Hipotesis | ConstruccionHipotesis/ | CausaEfectoExercise.tsx | ✅ Implementado |
| Prediccion Narrativa | PrediccionNarrativa/ | PrediccionNarrativaExercise.tsx | ✅ Implementado |
| Puzzle Contexto | PuzzleContexto/ | PuzzleContextoExercise.tsx | ✅ Implementado |
| Rueda Inferencias | RuedaInferencias/ | RuedaInferenciasExercise.tsx | ✅ Implementado |

### Mecanicas Extra (+1)

| Mecanica | Carpeta | Componente | Nota |
|----------|---------|------------|------|
| Lectura Inferencial | LecturaInferencial/ | LecturaInferencialExercise.tsx | No en doc oficial |

---

## MODULO 3: COMPRENSION CRITICA Y VALORATIVA

**Ubicacion:** `features/mechanics/module3/`
**Evaluacion:** Todos los ejercicios M3 son evaluados exclusivamente por el maestro (teacher-grade). No hay auto-scoring ni interaccion con IA.

### Mecanicas Oficiales (5) - Todas Implementadas

| Mecanica | Carpeta | Componente | Estado |
|----------|---------|------------|--------|
| Tribunal Opiniones | TribunalOpiniones/ | TribunalOpinionesExercise.tsx | ✅ Implementado |
| Debate Digital | DebateDigital/ | DebateDigitalExercise.tsx | ✅ Implementado |
| Analisis Fuentes | AnalisisFuentes/ | AnalisisFuentesExercise.tsx | ✅ Implementado |
| Podcast Argumentativo | PodcastArgumentativo/ | PodcastArgumentativoExercise.tsx | ✅ Implementado |
| Matriz Perspectivas | MatrizPerspectivas/ | MatrizPerspectivasExercise.tsx | ✅ Implementado |

### Descripcion de Mecanicas M3

- **Tribunal Opiniones:** Estudiante emite veredicto escrito con justificacion argumentada. Sin IA.
- **Debate Digital:** Ensayo estructurado donde el estudiante escribe postura y argumentos. No es un chat con IA — es escritura libre evaluada por el maestro.
- **Analisis Fuentes:** Estudiante evalua credibilidad de fuentes con justificacion escrita. Sin llamadas a `analyzeSourceCredibility` ni servicios de IA.
- **Podcast Argumentativo:** Grabacion de audio + transcripcion. Revision manual por maestro.
- **Matriz Perspectivas:** Perspectivas pre-cargadas en los datos del ejercicio. El estudiante redacta analisis comparativo. Sin llamadas a `generatePerspectives` ni servicios de IA.

---

## MODULO 4: LECTURA DIGITAL Y MULTIMODAL

**Ubicacion:** `features/mechanics/module4/`
**Evaluacion:** Todos los ejercicios M4 son evaluados exclusivamente por el maestro (teacher-grade). No hay auto-scoring (`calculateScore()` eliminado), no hay interaccion con IA.

### Mecanicas Oficiales (5) - Todas Implementadas

| Mecanica | Carpeta | Componente | Estado |
|----------|---------|------------|--------|
| Verificador Fake News | VerificadorFakeNews/ | VerificadorFakeNewsExercise.tsx | ✅ Implementado |
| Infografia Interactiva | InfografiaInteractiva/ | InfografiaInteractivaExercise.tsx | ✅ Implementado |
| Quiz TikTok | QuizTikTok/ | QuizTikTokExercise.tsx | ✅ Implementado |
| Navegacion Hipertextual | NavegacionHipertextual/ | NavegacionHipertextualExercise.tsx | ✅ Implementado |
| Analisis Memes | AnalisisMemes/ | AnalisisMemesExercise.tsx | ✅ Implementado |

### Descripcion de Mecanicas M4

- **Verificador Fake News:** Estudiante analiza articulos y escribe justificacion de veracidad. Sin `analyzeArgument` ni scoring automatico.
- **Quiz TikTok:** Seleccion de respuestas con justificacion escrita obligatoria (textarea, min 30 chars). Revision manual por maestro — no es auto-graded. Timer de 30s/pregunta corre continuamente (NO se detiene al seleccionar respuesta); la tarjeta se atenua visualmente al responder. En la ultima pregunta, el boton "Siguiente" es reemplazado por "Enviar Respuestas" cuando todas las respuestas y justificaciones estan completas. El array de respuestas es saneado (dense array) antes del envio para evitar errores 400 por huecos. Rubrica en `exercise_type_rubrics`: 4 criterios (Precision de Respuestas 25%, Calidad de Justificaciones 30%, Pensamiento Critico 25%, Completitud 20%) — agregada 2026-03-03 (fix RUBRIC-REMEDIATION).
- **Navegacion Hipertextual:** Exploracion de documentos hipertextuales + seccion de reflexion escrita. Evaluado por maestro.
- **Infografia Interactiva:** Exploracion de infografia + reflexion escrita. Evaluado por maestro.
- **Analisis Memes:** Analisis textual de elementos visuales (intencionalidad, contexto, critica). Evaluado por maestro.

### Mecanicas Removidas (4)

Las siguientes mecanicas estaban en el enum pero fueron removidas:
- resena_critica
- chat_literario
- email_formal
- ensayo_argumentativo

> Comentario en ExercisePage.tsx:146: "exercises deleted"

---

## MODULO 5: PRODUCCION Y EXPRESION LECTORA

**Ubicacion:** `features/mechanics/module5/`
**Evaluacion:** Todos los ejercicios M5 son evaluados exclusivamente por el maestro (teacher-grade). No hay auto-scoring ni interaccion con IA.

### Mecanicas Oficiales (3) - Todas Implementadas

> **Nota:** El estudiante elige 1 de 3 opciones

| Mecanica | Carpeta | Componente | Opcion |
|----------|---------|------------|--------|
| Diario Multimedia | DiarioMultimedia/ | DiarioMultimediaExercise.tsx | Opcion A |
| Comic Digital | ComicDigital/ | ComicDigitalExercise.tsx | Opcion B |
| Video Carta | VideoCarta/ | VideoCartaExercise.tsx | Opcion C |

### Caracteristicas M5

- **Evaluacion:** Requiere revision manual del docente (teacher-grade exclusivo, sin IA)
- **Entrega:** Proyecto creativo
- **Tiempo:** Sin limite estricto
- **Rubrica:** Evaluacion cualitativa

---

## MECANICAS AUXILIARES

**Ubicacion:** `features/mechanics/auxiliares/`

| Mecanica | Carpeta | Componente | Uso |
|----------|---------|------------|-----|
| Call to Action | CallToAction/ | CallToActionExercise.tsx | Ejercicios de engagement |
| Collage Prensa | CollagePrensa/ | CollagePrensaExercise.tsx | Ejercicios creativos |
| Comprension Auditiva | ComprensiónAuditiva/ | ComprensiónAuditivaExercise.tsx | Ejercicios de audio — BACKLOG — desactivada |
| Texto en Movimiento | TextoEnMovimiento/ | TextoEnMovimientoExercise.tsx | Ejercicios dinamicos |

---

## ESTRUCTURA DE CARPETAS

```
features/mechanics/
├── module1/
│   ├── Crucigrama/
│   │   ├── CrucigramaExercise.tsx
│   │   ├── CrucigramaGrid.tsx
│   │   ├── CrucigramaClue.tsx
│   │   ├── crucigramaTypes.ts
│   │   └── crucigramaSchemas.ts
│   ├── Timeline/
│   ├── CompletarEspacios/
│   ├── VerdaderoFalso/
│   ├── SopaLetras/
│   ├── Emparejamiento/ (EXTRA)
│   └── MapaConceptual/ (EXTRA)
│
├── module2/
│   ├── DetectiveTextual/
│   ├── ConstruccionHipotesis/
│   ├── PrediccionNarrativa/
│   ├── PuzzleContexto/
│   ├── RuedaInferencias/
│   └── LecturaInferencial/ (EXTRA)
│
├── module3/
│   ├── TribunalOpiniones/
│   ├── DebateDigital/
│   ├── AnalisisFuentes/
│   ├── PodcastArgumentativo/
│   └── MatrizPerspectivas/
│
├── module4/
│   ├── VerificadorFakeNews/
│   ├── InfografiaInteractiva/
│   ├── QuizTikTok/
│   ├── NavegacionHipertextual/
│   └── AnalisisMemes/
│
├── module5/
│   ├── DiarioMultimedia/
│   ├── ComicDigital/
│   └── VideoCarta/
│
└── auxiliares/
    ├── CallToAction/
    ├── CollagePrensa/
    ├── ComprensiónAuditiva/
    └── TextoEnMovimiento/
```

---

## MAPEO DE TIPOS (ENUM)

**Archivo:** `shared/constants/enums.constants.ts`

```typescript
export enum ExerciseType {
  // Modulo 1
  CRUCIGRAMA = 'crucigrama',
  LINEA_TIEMPO = 'linea_tiempo',
  COMPLETAR_ESPACIOS = 'completar_espacios',
  VERDADERO_FALSO = 'verdadero_falso',
  SOPA_LETRAS = 'sopa_letras',
  EMPAREJAMIENTO = 'emparejamiento',
  MAPA_CONCEPTUAL = 'mapa_conceptual',

  // Modulo 2
  DETECTIVE_TEXTUAL = 'detective_textual',
  CONSTRUCCION_HIPOTESIS = 'construccion_hipotesis',
  PREDICCION_NARRATIVA = 'prediccion_narrativa',
  PUZZLE_CONTEXTO = 'puzzle_contexto',
  RUEDA_INFERENCIAS = 'rueda_inferencias',
  LECTURA_INFERENCIAL = 'lectura_inferencial',

  // ... etc
}
```

---

---

## Rúbricas por Ejercicio (M3/M4/M5)

> Auditoría completada 2026-03-03. 13 rúbricas validadas, 12 correcciones aplicadas.

| Módulo | Ejercicio | Criterios | Pesos | Notas |
|--------|-----------|-----------|-------|-------|
| M3 | tribunal_opiniones | Clasificación, Veredicto, Justificación | 35/40/25 | 3 criterios |
| M3 | debate_digital | Claridad, Evidencias, Lógica, Contraargumentos | 20/30/25/25 | Sin cambios |
| M3 | analisis_fuentes | Orden, Comparación, CRAAP | 40/30/30 | 3 criterios; CRAAP revalorizado |
| M3 | podcast_argumentativo | Claridad, Argumentación, Pensamiento Crítico, Presentación | 25/30/25/20 | Descripciones sin ref. audio |
| M3 | matriz_perspectivas | Comprensión, Análisis, Evidencia, Síntesis | 25/25/20/30 | "Identificación" → "Comprensión" |
| M4 | verificador_fake_news | Identificación, Razonamiento, Referencia Fuentes, Conclusión | 25/30/25/20 | Criterios renombrados |
| M4 | infografia_interactiva | Contenido, Organización, Interactividad, Respuestas | 25/20/20/35 | Respuestas priorizadas |
| M4 | navegacion_hipertextual | Eficiencia, Relevancia, Síntesis, Respuesta | 25/25/25/25 | Balanceado |
| M4 | analisis_memes | Decodificación, Contexto, Intertextualidad, Crítica | 30/25/20/25 | Decodificación priorizada |
| M4 | quiz_tiktok | Precisión, Justificaciones, Pensamiento Crítico, Completitud | 30/30/20/20 | Precisión priorizada |
| M5 | diario_multimedia | Creatividad, Precisión, Multimedia, Expresión | 30/30/15/25 | Multimedia reducido (opcional) |
| M5 | comic_digital | Narrativa, Organización Visual, Precisión, Creatividad | 30/20/25/25 | "Composición" → "Organización" |
| M5 | video_carta | Autenticidad, Mensaje, Producción, Emoción | 25/25/25/25 | Typo corregido |

**Seed file:** `apps/database/seeds/dev/educational_content/13-exercise_type_rubrics.sql`
**Reporte:** `orchestration/tareas/TASK-2026-03-03-RUBRIC-AUDIT/AUDIT-REPORT.md`

---

## RECOMENDACIONES

### Documentacion Pendiente

1. **Actualizar documento de diseno** con mecanicas extra:
   - Emparejamiento (M1)
   - Mapa Conceptual (M1)
   - Lectura Inferencial (M2)

2. **Documentar decision** de remover mecanicas M4:
   - resena_critica
   - chat_literario
   - email_formal
   - ensayo_argumentativo

### Estado por Modulo

| Modulo | Doc vs Impl | Accion Requerida |
|--------|-------------|------------------|
| M1 | +2 extras | Documentar extras |
| M2 | +1 extra | Documentar extra |
| M3 | ✅ Match, teacher-grade | Ninguna |
| M4 | 4 removidas, teacher-grade | Documentar decision |
| M5 | ✅ Match, teacher-grade | Ninguna |

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
**Última actualización de rúbricas:** 2026-03-03
