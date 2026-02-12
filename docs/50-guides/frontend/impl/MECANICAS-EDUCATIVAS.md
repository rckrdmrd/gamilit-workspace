# MECANICAS EDUCATIVAS - FRONTEND

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Version:** 1.0
**Fecha:** 2025-12-23
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

### Mecanicas Oficiales (5) - Todas Implementadas

| Mecanica | Carpeta | Componente | Estado |
|----------|---------|------------|--------|
| Tribunal Opiniones | TribunalOpiniones/ | TribunalOpinionesExercise.tsx | ✅ Implementado |
| Debate Digital | DebateDigital/ | DebateDigitalExercise.tsx | ✅ Implementado |
| Analisis Fuentes | AnalisisFuentes/ | AnalisisFuentesExercise.tsx | ✅ Implementado |
| Podcast Argumentativo | PodcastArgumentativo/ | PodcastArgumentativoExercise.tsx | ✅ Implementado |
| Matriz Perspectivas | MatrizPerspectivas/ | MatrizPerspectivasExercise.tsx | ✅ Implementado |

---

## MODULO 4: LECTURA DIGITAL Y MULTIMODAL

**Ubicacion:** `features/mechanics/module4/`

### Mecanicas Oficiales (5) - Todas Implementadas

| Mecanica | Carpeta | Componente | Estado |
|----------|---------|------------|--------|
| Verificador Fake News | VerificadorFakeNews/ | VerificadorFakeNewsExercise.tsx | ✅ Implementado |
| Infografia Interactiva | InfografiaInteractiva/ | InfografiaInteractivaExercise.tsx | ✅ Implementado |
| Quiz TikTok | QuizTikTok/ | QuizTikTokExercise.tsx | ✅ Implementado |
| Navegacion Hipertextual | NavegacionHipertextual/ | NavegacionHipertextualExercise.tsx | ✅ Implementado |
| Analisis Memes | AnalisisMemes/ | AnalisisMemesExercise.tsx | ✅ Implementado |

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

### Mecanicas Oficiales (3) - Todas Implementadas

> **Nota:** El estudiante elige 1 de 3 opciones

| Mecanica | Carpeta | Componente | Opcion |
|----------|---------|------------|--------|
| Diario Multimedia | DiarioMultimedia/ | DiarioMultimediaExercise.tsx | Opcion A |
| Comic Digital | ComicDigital/ | ComicDigitalExercise.tsx | Opcion B |
| Video Carta | VideoCarta/ | VideoCartaExercise.tsx | Opcion C |

### Caracteristicas M5

- **Evaluacion:** Requiere revision manual del docente
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
| Comprension Auditiva | ComprensiónAuditiva/ | ComprensiónAuditivaExercise.tsx | Ejercicios de audio |
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
| M3 | ✅ Match | Ninguna |
| M4 | 4 removidas | Documentar decision |
| M5 | ✅ Match | Ninguna |

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
