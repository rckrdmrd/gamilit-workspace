# Especificaciones de Mecanicas M5 - Produccion Lectora

**Version:** 1.1.0
**Fecha:** 2026-01-20
**Ultima Validacion:** 2026-01-20
**Modulo:** M5 - Produccion Creativa Multimedia
**Proyecto:** GAMILIT - Student Portal

---

## Resumen Ejecutivo

Este documento especifica las 3 mecanicas del Modulo 5 (Produccion Lectora) implementadas en GAMILIT. Estas son las mecanicas mas complejas del sistema, requiriendo produccion creativa multimedia y evaluacion manual obligatoria.

> **NOTA:** Las mecanicas M5 otorgan significativamente mas recompensas (500 XP, 50 ML Coins) debido a su complejidad y tiempo requerido.

---

## Indice de Mecanicas M5

| ID | Nombre | Evaluacion | Descripcion Breve |
|----|--------|------------|-------------------|
| M5-01 | DiarioMultimedia | Manual | Crear diario personal con multimedia |
| M5-02 | ComicDigital | Manual | Crear comic narrativo digital |
| M5-03 | VideoCarta | Manual | Grabar video-carta personal |

---

## Especificaciones Detalladas

### M5-01: DiarioMultimedia

#### Descripcion

Ejercicio de creacion de diario personal desde la perspectiva historica o reflexiva. El estudiante crea multiples entradas con texto, imagenes, audio y video, expresando reflexiones sobre el contenido estudiado.

#### Estructura de Contenido (content JSONB)

```json
{
  "prompts": ["string (sugerencias de temas)"],
  "themes": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "suggestedPrompts": ["string"]
    }
  ]
}
```

#### Configuracion (config JSONB)

```json
{
  "minEntries": "number (minimo 3-5)",
  "maxEntries": "number (maximo 10)",
  "minContentLength": "number (caracteres minimos, 150)",
  "allowMediaUpload": "boolean",
  "allowPrivateEntries": "boolean"
}
```

#### Formato de Respuesta del Estudiante

```json
{
  "entries": [
    {
      "id": "string",
      "date": "Date",
      "title": "string",
      "content": "string (texto de la entrada)",
      "media": [
        {
          "id": "string",
          "name": "string",
          "url": "string",
          "type": "image | audio | video | document"
        }
      ],
      "isPrivate": "boolean"
    }
  ],
  "hintsUsed": "number",
  "timeSpent": "number",
  "score": "number",
  "completed": "boolean"
}
```

#### Criterios de Evaluacion

- **Tipo:** Manual (requiere revision docente obligatoria)
- **Criterios:**
  - **Creatividad:** Originalidad y expresion personal
  - **Precision historica:** Coherencia con el contexto historico
  - **Expresion escrita:** Calidad de la redaccion
  - **Uso de multimedia:** Integracion efectiva de medios
  - **Reflexion:** Profundidad del analisis personal

#### Recompensas

- **XP Base:** 500
- **ML Coins Base:** 50

#### Ejemplo Completo

```json
// Contenido del ejercicio
{
  "prompts": [
    "Que aprendiste hoy sobre Marie Curie que no sabias?",
    "Como describirias la perseverancia de Marie Curie?",
    "Que desafios enfrento Marie como mujer en la ciencia?"
  ],
  "themes": [
    {
      "id": "learning",
      "name": "Mi Aprendizaje",
      "description": "Reflexiones sobre lo que has aprendido",
      "suggestedPrompts": [
        "Que aprendiste hoy sobre Marie Curie?",
        "Que te sorprendio mas de su historia?",
        "Como aplicarias sus ensenanzas en tu vida?"
      ]
    },
    {
      "id": "inspiration",
      "name": "Inspiracion",
      "description": "Como Marie Curie te inspira",
      "suggestedPrompts": [
        "Que cualidades de Marie Curie admiras?",
        "Como te motiva su perseverancia?"
      ]
    }
  ]
}

// Respuesta del estudiante
{
  "entries": [
    {
      "id": "entry-1",
      "date": "2026-01-20T10:00:00Z",
      "title": "Mi primera reflexion sobre Marie Curie",
      "content": "Hoy aprendi que Marie Curie tuvo que superar muchos obstaculos para convertirse en cientifica. Me impresiona su determinacion y como nunca se rindio ante las dificultades. Esto me hace pensar en mis propios desafios y como puedo enfrentarlos con la misma actitud.",
      "media": [
        {
          "id": "media-1",
          "name": "foto-laboratorio.jpg",
          "url": "/uploads/user123/foto-lab.jpg",
          "type": "image"
        }
      ],
      "isPrivate": false
    },
    {
      "id": "entry-2",
      "date": "2026-01-20T14:00:00Z",
      "title": "Lo que mas me inspira",
      "content": "La perseverancia de Marie es increible. Trabajo 4 anos para aislar el radio. Eso me ensena que los grandes logros requieren paciencia y dedicacion...",
      "media": [],
      "isPrivate": false
    }
  ],
  "hintsUsed": 0,
  "timeSpent": 1200,
  "score": 0,
  "completed": true
}
```

#### Notas de Implementacion

- **Frontend:** `apps/frontend/src/features/mechanics/module5/DiarioMultimedia/`
- **Componente:** `DiarioMultimediaExercise.tsx`
- **Tipos:** `diarioMultimediaTypes.ts`
- **Mock Data:** `diarioMultimediaMockData.ts`

---

### M5-02: ComicDigital

#### Descripcion

Ejercicio de narracion visual donde el estudiante crea un comic de 4-6 paneles. Incluye creacion de paneles, dialogo mediante globos de texto, y narracion de una historia relacionada con el contenido estudiado.

#### Estructura de Contenido (content JSONB)

```json
{
  "suggestedScenes": ["string (escenas sugeridas)"],
  "templates": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "panelCount": "number",
      "layouts": ["string (full | half | third)"]
    }
  ]
}
```

#### Configuracion (config JSONB)

```json
{
  "minPanels": "number (minimo 4-6)",
  "maxPanels": "number (maximo 12)",
  "allowImageUpload": "boolean",
  "requireSpeechBubbles": "boolean"
}
```

#### Formato de Respuesta del Estudiante

```json
{
  "title": "string",
  "panels": [
    {
      "id": "string",
      "layout": "full | half | third",
      "image": "string (URL, opcional)",
      "text": "string (narracion del panel)",
      "speechBubbles": [
        {
          "id": "string",
          "text": "string",
          "x": "number (posicion %)",
          "y": "number (posicion %)",
          "type": "speech | thought | caption"
        }
      ],
      "background": "string (color o imagen)"
    }
  ],
  "hintsUsed": "number",
  "timeSpent": "number",
  "score": "number"
}
```

#### Criterios de Evaluacion

- **Tipo:** Manual (requiere revision docente obligatoria)
- **Criterios:**
  - **Narrativa:** Coherencia y fluidez de la historia
  - **Visual:** Composicion y uso del espacio
  - **Precision historica:** Coherencia con el contenido estudiado
  - **Creatividad:** Originalidad en la presentacion
  - **Dialogo:** Uso efectivo de globos de texto

#### Recompensas

- **XP Base:** 500
- **ML Coins Base:** 50

#### Ejemplo Completo

```json
// Contenido del ejercicio
{
  "suggestedScenes": [
    "Infancia de Marie en Varsovia, Polonia",
    "Llegada a Paris y la Sorbona",
    "Conoce a Pierre Curie en el laboratorio",
    "Descubrimiento del Polonio y Radio",
    "Primer Premio Nobel de Fisica (1903)",
    "Segundo Premio Nobel de Quimica (1911)"
  ],
  "templates": [
    {
      "id": "biography",
      "name": "Biografia en 6 Vinetas",
      "description": "Cuenta la vida de Marie Curie en 6 momentos clave",
      "panelCount": 6,
      "layouts": ["full", "half", "half", "third", "third", "full"]
    },
    {
      "id": "discovery",
      "name": "El Descubrimiento",
      "description": "Narra el proceso de descubrimiento del radio",
      "panelCount": 4,
      "layouts": ["full", "half", "half", "full"]
    }
  ]
}

// Respuesta del estudiante
{
  "title": "El Descubrimiento del Radio",
  "panels": [
    {
      "id": "panel-1",
      "layout": "full",
      "text": "Varsovia, Polonia - 1867",
      "speechBubbles": [
        {
          "id": "bubble-1",
          "text": "Un dia sere cientifica!",
          "x": 60,
          "y": 30,
          "type": "speech"
        }
      ],
      "background": "home"
    },
    {
      "id": "panel-2",
      "layout": "half",
      "text": "Marie estudia en la Sorbona",
      "speechBubbles": [
        {
          "id": "bubble-2",
          "text": "Debo estudiar mas que nadie",
          "x": 50,
          "y": 40,
          "type": "thought"
        }
      ],
      "background": "university"
    },
    {
      "id": "panel-3",
      "layout": "half",
      "text": "Conoce a Pierre",
      "speechBubbles": [
        {
          "id": "bubble-3",
          "text": "Juntos lograremos grandes cosas",
          "x": 30,
          "y": 50,
          "type": "speech"
        }
      ],
      "background": "lab"
    },
    {
      "id": "panel-4",
      "layout": "full",
      "text": "1898 - El Radio brilla en la oscuridad",
      "speechBubbles": [
        {
          "id": "bubble-4",
          "text": "Lo logramos!",
          "x": 70,
          "y": 20,
          "type": "speech"
        }
      ],
      "background": "research"
    }
  ],
  "hintsUsed": 1,
  "timeSpent": 1800,
  "score": 0
}
```

#### Tipos de Globos de Texto

| Tipo | Descripcion | Uso |
|------|-------------|-----|
| `speech` | Globo de dialogo | Para palabras habladas |
| `thought` | Globo de pensamiento | Para pensamientos internos |
| `caption` | Caja de narracion | Para narracion en tercera persona |

#### Opciones de Layout

| Layout | Columnas | Descripcion |
|--------|----------|-------------|
| `full` | 1 | Panel completo (toda la fila) |
| `half` | 2 | Mitad del ancho |
| `third` | 3 | Tercio del ancho |

#### Notas de Implementacion

- **Frontend:** `apps/frontend/src/features/mechanics/module5/ComicDigital/`
- **Componente:** `ComicDigitalExercise.tsx`
- **Tipos:** `comicDigitalTypes.ts`
- **Mock Data:** `comicDigitalMockData.ts`

---

### M5-03: VideoCarta

#### Descripcion

Ejercicio de expresion oral donde el estudiante graba un video-carta dirigido a un personaje historico o destinatario especifico. Incluye multiples secciones guiadas por prompts y opcion de filtros visuales.

#### Estructura de Contenido (content JSONB)

```json
{
  "sections": [
    {
      "id": "string",
      "name": "string (nombre de la seccion)",
      "duration": "number (segundos sugeridos)",
      "prompt": "string (pregunta guia)"
    }
  ],
  "recipient": {
    "name": "string",
    "description": "string",
    "imageUrl": "string (opcional)"
  }
}
```

#### Configuracion (config JSONB)

```json
{
  "maxDuration": "number (segundos, default 180)",
  "allowFilters": "boolean",
  "allowReRecording": "boolean",
  "requireAllSections": "boolean"
}
```

#### Formato de Respuesta del Estudiante

```json
{
  "filter": "string (filtro aplicado)",
  "sectionRecordings": [
    {
      "sectionId": "string",
      "blob": "Blob | null",
      "url": "string | null",
      "duration": "number",
      "completed": "boolean"
    }
  ],
  "videoBlob": "Blob | null (video completo)",
  "videoUrl": "string | null",
  "duration": "number (total)",
  "hintsUsed": "number",
  "timeSpent": "number",
  "score": "number"
}
```

#### Alternativa: Script (sin video)

```json
{
  "type": "script",
  "script": {
    "introduction": "string",
    "sections": [
      {
        "sectionId": "string",
        "content": "string"
      }
    ],
    "conclusion": "string"
  },
  "wordCount": "number",
  "themes_covered": ["string"]
}
```

#### Criterios de Evaluacion

- **Tipo:** Manual (requiere revision docente obligatoria)
- **Criterios:**
  - **Autenticidad:** Conexion personal con el mensaje
  - **Contenido:** Relevancia y profundidad del mensaje
  - **Presentacion:** Claridad y fluidez de expresion
  - **Emocion:** Transmision de sentimientos genuinos
  - **Estructura:** Seguimiento de las secciones guiadas

#### Recompensas

- **XP Base:** 500
- **ML Coins Base:** 50

#### Ejemplo Completo

```json
// Contenido del ejercicio
{
  "sections": [
    {
      "id": "intro",
      "name": "Introduccion",
      "duration": 30,
      "prompt": "Quien eres y por que escribes?"
    },
    {
      "id": "main",
      "name": "Mensaje Principal",
      "duration": 90,
      "prompt": "Que quieres decirle a Marie Curie?"
    },
    {
      "id": "reflection",
      "name": "Reflexiones",
      "duration": 45,
      "prompt": "Que aprendiste de ella?"
    },
    {
      "id": "closing",
      "name": "Cierre",
      "duration": 15,
      "prompt": "Despedida y agradecimiento"
    }
  ],
  "recipient": {
    "name": "Marie Curie",
    "description": "Cientifica polaco-francesa, pionera en la investigacion de la radioactividad",
    "imageUrl": "/images/marie-curie-portrait.jpg"
  }
}

// Respuesta del estudiante (video)
{
  "filter": "sepia",
  "sectionRecordings": [
    {
      "sectionId": "intro",
      "url": "/uploads/user123/intro.webm",
      "duration": 28,
      "completed": true
    },
    {
      "sectionId": "main",
      "url": "/uploads/user123/main.webm",
      "duration": 85,
      "completed": true
    },
    {
      "sectionId": "reflection",
      "url": "/uploads/user123/reflection.webm",
      "duration": 42,
      "completed": true
    },
    {
      "sectionId": "closing",
      "url": "/uploads/user123/closing.webm",
      "duration": 12,
      "completed": true
    }
  ],
  "videoUrl": "/uploads/user123/complete-video.webm",
  "duration": 167,
  "hintsUsed": 0,
  "timeSpent": 600,
  "score": 0
}

// Respuesta del estudiante (script alternativo)
{
  "type": "script",
  "script": {
    "introduction": "Buenos dias, Madame Curie. Mi nombre es Juan y soy estudiante de secundaria. Le escribo porque su historia me ha inspirado profundamente...",
    "sections": [
      {
        "sectionId": "main",
        "content": "Quiero decirle que su perseverancia frente a los obstaculos me ensena que los suenos son posibles. Usted trabajo 4 anos para aislar el radio..."
      },
      {
        "sectionId": "reflection",
        "content": "De usted aprendi que la curiosidad es mas fuerte que cualquier barrera social. Como mujer en una epoca dificil, demostro que el talento no tiene genero..."
      }
    ],
    "conclusion": "Gracias por su legado, Madame Curie. Su ejemplo me motiva a seguir adelante con mis estudios."
  },
  "wordCount": 287,
  "themes_covered": ["perseverance", "education", "legacy"]
}
```

#### Filtros de Video Disponibles

| Filtro | Nombre | CSS Filter |
|--------|--------|------------|
| `none` | Sin filtro | `none` |
| `sepia` | Sepia | `sepia(100%)` |
| `grayscale` | Blanco y Negro | `grayscale(100%)` |
| `vintage` | Vintage | `sepia(50%) contrast(90%)` |
| `bright` | Brillante | `brightness(110%) saturate(120%)` |
| `warm` | Calido | `sepia(20%) saturate(110%)` |

#### Notas de Implementacion

- **Frontend:** `apps/frontend/src/features/mechanics/module5/VideoCarta/`
- **Componente:** `VideoCartaExercise.tsx`
- **Tipos:** `videoCartaTypes.ts`
- **Mock Data:** `videoCartaMockData.ts`
- **Permisos requeridos:** Camara y microfono (o alternativa script)

---

## Tabla Resumen M5

| Mecanica | Auto-gradable | XP | ML Coins | Tiempo Est. |
|----------|---------------|-----|----------|-------------|
| DiarioMultimedia | No | 500 | 50 | 20-30 min |
| ComicDigital | No | 500 | 50 | 25-40 min |
| VideoCarta | No | 500 | 50 | 15-25 min |

---

## Notas Importantes para Docentes

### Evaluacion M5

Las mecanicas M5 **siempre** requieren revision manual. El sistema no asigna puntuacion automatica. Los criterios de evaluacion incluyen:

1. **Rubricas especificas** por tipo de mecanica (disponibles en `exercise_type_rubrics`)
2. **Feedback estructurado** mediante el sistema de Manual Review
3. **Subida de archivos multimedia** que deben revisarse

### Tiempos de Revision

- DiarioMultimedia: 5-10 minutos por estudiante
- ComicDigital: 5-8 minutos por estudiante
- VideoCarta: 3-5 minutos por estudiante (video) o 2-3 minutos (script)

### Consideraciones de Privacidad

- DiarioMultimedia permite entradas privadas que no se comparten
- VideoCarta requiere consentimiento para grabacion de video
- Alternativa de script siempre disponible para estudiantes sin camara

---

## Referencias de Codigo

### Frontend

```
apps/frontend/src/features/mechanics/
  module5/
    DiarioMultimedia/
      DiarioMultimediaExercise.tsx
      diarioMultimediaTypes.ts
      diarioMultimediaMockData.ts
    ComicDigital/
      ComicDigitalExercise.tsx
      comicDigitalTypes.ts
      comicDigitalMockData.ts
    VideoCarta/
      VideoCartaExercise.tsx
      videoCartaTypes.ts
      videoCartaMockData.ts
```

### Exportaciones

```typescript
// apps/frontend/src/features/mechanics/index.ts
export { DiarioMultimediaExercise } from './module5/DiarioMultimedia/DiarioMultimediaExercise';
export { ComicDigitalExercise } from './module5/ComicDigital/ComicDigitalExercise';
export { VideoCartaExercise } from './module5/VideoCarta/VideoCartaExercise';
```

---

---

## Notas de Validacion 2026-01-20

### Resumen de Validacion

| Aspecto | Estado | Observaciones |
|---------|--------|---------------|
| Fecha de validacion | 2026-01-20 | FASE 3 - Validacion de ejercicios |
| Validado por | Agente Claude | Perfil @PERFIL_DOCUMENTATION |
| Metodo | Revision de implementacion vs SPEC | Analisis de DTOs y flujos |

### Hallazgos Relevantes

#### GAP-EX-004: Multimedia usa Blob URLs - CONFIRMADO

- **Estado:** GAP CONFIRMADO
- **Descripcion:** Las mecanicas M5 que manejan multimedia (DiarioMultimedia, ComicDigital, VideoCarta) utilizan `Blob` y `URL.createObjectURL()` para archivos multimedia
- **Problema:** Los blob URLs son temporales y no persisten entre sesiones. Si el estudiante cierra el navegador antes de enviar, los archivos se pierden
- **Impacto:** Afecta las 3 mecanicas M5
- **Solucion requerida:** Implementar servicio de upload que:
  1. Suba archivos a almacenamiento persistente (S3, CloudStorage, etc.)
  2. Retorne URLs permanentes
  3. Gestione limpieza de archivos huerfanos

```typescript
// Ejemplo de solucion requerida
interface MediaUploadService {
  uploadFile(blob: Blob, type: 'image' | 'audio' | 'video'): Promise<string>; // URL permanente
  deleteFile(url: string): Promise<void>;
}
```

**Estado:** PENDIENTE - Requiere implementacion de backend upload service

#### Estructura de Respuestas M5

Las mecanicas M5 envian respuestas al backend, pero los archivos multimedia solo son referencias locales (blob URLs):

| Campo | Tipo Actual | Tipo Requerido |
|-------|-------------|----------------|
| `media[].url` | Blob URL (temporal) | URL permanente |
| `videoBlob` | Blob (memoria) | URL permanente |
| `sectionRecordings[].blob` | Blob (memoria) | URL permanente |
| `panels[].image` | Blob URL | URL permanente |

### Estado de Implementacion M5

| Mecanica | Implementada | Funcional | Envia Backend | Multimedia Persiste | Observaciones |
|----------|--------------|-----------|---------------|---------------------|---------------|
| M5-01 DiarioMultimedia | Si | Si | Si | NO | GAP-EX-004 |
| M5-02 ComicDigital | Si | Si | Si | NO | GAP-EX-004 |
| M5-03 VideoCarta | Si | Si | Si | NO | GAP-EX-004 |

### Requisitos Pendientes para M5

#### 1. Servicio de Upload (Backend)

```yaml
Endpoint: POST /api/v1/exercises/media/upload
Funcionalidad:
  - Recibir archivo multipart/form-data
  - Validar tipo y tamano
  - Subir a storage persistente
  - Retornar URL permanente
Configuracion:
  - Max size imagen: 5MB
  - Max size audio: 10MB
  - Max size video: 50MB
  - Formatos imagen: jpg, png, gif, webp
  - Formatos audio: mp3, wav, webm
  - Formatos video: mp4, webm
```

#### 2. Componente de Upload (Frontend)

```yaml
Componente: MediaUploader
Funcionalidad:
  - Preview local con blob URL
  - Upload en background
  - Progress indicator
  - Reemplazo de blob URL por URL permanente
  - Manejo de errores de upload
```

#### 3. Migracion de Datos Existentes

- Revisar si hay ejercicios M5 guardados con blob URLs
- Migrar a URLs permanentes cuando el servicio este disponible

### Componentes UI Sin Uso en M5

| Componente | Uso en M5 | Observacion |
|------------|-----------|-------------|
| SubmitExerciseButton | 0% | Mismo patron que M1-M4 |
| HintModal | 0% | Hints integrados |
| CompletionModal | 0% | Feedback inline |

### Consideraciones de Privacidad M5

Las notas de privacidad documentadas en la SPEC estan correctamente implementadas:

| Consideracion | Implementado | Observacion |
|---------------|--------------|-------------|
| Entradas privadas DiarioMultimedia | Si | Campo `isPrivate` funcional |
| Alternativa script VideoCarta | Si | Opcion sin camara disponible |
| Consentimiento grabacion | Parcial | Falta UI explicita de consentimiento |

### Proximos Pasos

1. **CRITICO: Implementar servicio de upload multimedia** - Sin esto, M5 no es production-ready
2. **Agregar UI de consentimiento** para grabacion de video en VideoCarta
3. **Definir politica de retencion** de archivos multimedia
4. **Implementar limpieza de archivos huerfanos** (ejercicios abandonados)

### Prioridad de Resolucion

| Item | Prioridad | Bloqueante | Esfuerzo Est. |
|------|-----------|------------|---------------|
| Servicio upload backend | P0 | Si | 3-5 dias |
| Componente MediaUploader | P0 | Si | 2-3 dias |
| UI consentimiento video | P1 | No | 1 dia |
| Politica retencion | P2 | No | 1 dia |
| Limpieza huerfanos | P2 | No | 1-2 dias |

---

*Documento SSOT - GAMILIT Student Portal*
*Version 1.1.0 - 2026-01-20*
