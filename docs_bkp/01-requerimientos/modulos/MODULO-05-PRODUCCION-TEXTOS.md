# Módulo 5: Producción de Textos

**Proyecto:** Gamilit Platform
**Módulo:** Contenido Educativo
**Archivo original:** MODULOS-EDUCATIVOS.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## RESUMEN DEL MÓDULO

**Objetivo Pedagógico:** Desarrollar capacidad de **crear contenido multimedia propio** integrando comprensión lectora con producción creativa.

**Mecánicas Implementadas:** 3
**Estado:** ✅ Production-Ready (100% completitud)

### Mecánicas del Módulo

| # | Tipo | Descripción | Auto-gradable |
|---|------|-------------|---------------|
| 5.1 | `diario_multimedia` | Diario con texto, imagen, video, audio | ❌ Manual |
| 5.2 | `comic_digital` | Crear cómic con editor visual | ⚠️ Semi |
| 5.3 | `video_carta` | Grabar video carta dirigida a Marie Curie | ❌ Manual |

---

## MECÁNICAS IMPLEMENTADAS

### 5.1 Diario Multimedia

**Tipo:** `diario_multimedia`
**Dificultad:** ⭐⭐⭐⭐

#### Descripción

Diario digital donde estudiantes crean entradas multimedia combinando texto, imágenes, video y audio para documentar su aprendizaje sobre Marie Curie.

#### Características Técnicas

- Editor de texto con formato rich text
- Sistema de entradas con fecha automática
- Soporte multimedia completo:
  - Texto formateado (negrita, cursiva, listas)
  - Imágenes (upload o URL)
  - Video (embed o upload)
  - Audio (grabación o upload)
- Organización cronológica de entradas
- Vista de galería de todas las entradas
- Búsqueda y filtrado por fecha/tipo de contenido
- Export de diario completo como PDF

#### Estructura de Contenido

```typescript
interface DiarioEntry {
  id: string;
  date: Date;
  title: string;
  content: {
    text: string;
    images?: Array<{
      url: string;
      caption?: string;
    }>;
    videos?: Array<{
      url: string;
      caption?: string;
    }>;
    audio?: Array<{
      url: string;
      caption?: string;
    }>;
  };
  tags?: string[];
  mood?: 'happy' | 'curious' | 'inspired' | 'thoughtful';
}

interface DiarioExercise {
  id: string;
  prompt: string;
  minEntries: number;
  suggestedTopics: string[];
}
```

#### Ejemplo de Uso

**Prompt:** "Documenta tu aprendizaje sobre Marie Curie en un diario multimedia. Crea al menos 3 entradas diferentes."

**Entrada 1: "Descubriendo a Marie Curie"**
- Fecha: 2025-11-01
- Texto: "Hoy aprendí sobre Marie Curie. Lo que más me impresionó fue..."
- Imagen: Foto de Marie Curie trabajando en su laboratorio
- Mood: Curious

**Entrada 2: "Los descubrimientos científicos"**
- Fecha: 2025-11-02
- Texto: "El Radio y el Polonio cambiaron la ciencia..."
- Video: Clip explicativo sobre radioactividad
- Mood: Inspired

**Entrada 3: "Reflexión personal"**
- Fecha: 2025-11-03
- Texto: "Si yo viviera en 1900, ¿cómo enfrentaría los obstáculos que Marie enfrentó?"
- Audio: Grabación de reflexión oral (2 min)
- Mood: Thoughtful

#### Sistema de Scoring

**Criterios de Evaluación:**
1. **Cantidad de entradas** (30%) - Mínimo 3, óptimo 5+
2. **Variedad multimedia** (30%) - Uso de texto + imagen + video/audio
3. **Profundidad de reflexión** (25%) - Calidad del contenido textual
4. **Organización y presentación** (15%) - Uso de títulos, tags, coherencia

**Fórmula:**
```typescript
entriesScore = Math.min(100, (entries.length / minEntries) * 100);
multimediaScore = (uniqueMediaTypes / 4) * 100; // texto, imagen, video, audio
totalScore = (entriesScore * 0.3) + (multimediaScore * 0.3) +
             (reflectionScore * 0.25) + (organizationScore * 0.15);
```

**Bonificaciones:**
- **Diario Completo:** +20 puntos si crea 5+ entradas
- **Multimedia Rico:** +15 puntos si usa todos los tipos de media
- **Reflexión Profunda:** +10 puntos si cada entrada >150 palabras
- **Creatividad:** +10 puntos por uso innovador de multimedia

**Auto-gradable:** ❌ Manual (requiere revisión de contenido y calidad de reflexión)

**ML Coins:** 50 coins
**XP Base:** 100 XP

**Tiempo Estimado:** 30-45 minutos total (10-15 min por entrada)

---

### 5.2 Cómic Digital

**Tipo:** `comic_digital`
**Dificultad:** ⭐⭐⭐⭐

#### Descripción

Editor visual de cómic donde estudiantes crean una historia sobre Marie Curie usando paneles, burbujas de diálogo y fondos temáticos.

#### Características Técnicas

- Editor de paneles configurables:
  - Layout: completo, mitad horizontal, mitad vertical, tercio
  - Fondos temáticos (laboratorio, París 1900, Premio Nobel, etc.)
  - Personajes predefinidos (Marie, Pierre, científicos, etc.)
- Burbujas de diálogo:
  - Speech bubble (diálogo)
  - Thought bubble (pensamiento)
  - Caption box (narración)
- Herramientas de dibujo básicas
- Biblioteca de assets:
  - Personajes en diferentes poses
  - Objetos científicos (tubos de ensayo, pechblenda, etc.)
  - Efectos visuales (brillos, líneas de movimiento)
- Preview en tiempo real
- Export como imagen o PDF

#### Estructura de Contenido

```typescript
interface ComicPanel {
  id: string;
  layout: 'full' | 'half-horizontal' | 'half-vertical' | 'third';
  background: {
    type: 'preset' | 'custom';
    value: string; // preset name o URL
  };
  characters: Array<{
    id: string;
    position: {x: number, y: number};
    pose: string;
    scale: number;
  }>;
  dialogues: Array<{
    type: 'speech' | 'thought' | 'caption';
    text: string;
    position: {x: number, y: number};
    targetCharacter?: string;
  }>;
  objects: Array<{
    id: string;
    position: {x: number, y: number};
  }>;
}

interface ComicExercise {
  id: string;
  prompt: string;
  minPanels: number;
  suggestedScenes: string[];
}
```

#### Ejemplo de Uso

**Prompt:** "Crea un cómic de 4-6 paneles contando un momento importante de la vida de Marie Curie."

**Panel 1:**
- Layout: Full
- Background: Universidad de la Sorbona
- Personaje: Marie joven, pose estudiando
- Caption: "París, 1891. Marie Skłodowska llega a la Sorbona."

**Panel 2:**
- Layout: Half-horizontal
- Background: Laboratorio
- Personajes: Marie y Pierre trabajando
- Speech Bubble (Marie): "Estas muestras de pechblenda son más radiactivas de lo esperado."
- Speech Bubble (Pierre): "¡Debe haber un elemento desconocido!"

**Panel 3:**
- Layout: Half-horizontal
- Background: Laboratorio nocturno
- Personaje: Marie, pose de sorpresa
- Objeto: Muestra brillante de radio
- Thought Bubble (Marie): "¡Brilla en la oscuridad!"

**Panel 4:**
- Layout: Full
- Background: Ceremonia del Nobel
- Personajes: Marie y Pierre recibiendo premio
- Caption: "1903. Primera mujer en ganar el Premio Nobel."

#### Sistema de Scoring

**Criterios de Evaluación:**
1. **Narrativa** (35%) - Historia coherente con inicio, desarrollo, final
2. **Uso de elementos** (25%) - Personajes, fondos, diálogos apropiados
3. **Creatividad visual** (20%) - Composición, layout variado
4. **Precisión histórica** (20%) - Representación fiel de eventos

**Fórmula:**
```typescript
narrativeScore = hasBeginning && hasMiddle && hasEnd ? 100 : 60;
elementsScore = (uniqueElements / requiredElements) * 100;
creativityScore = layoutVariety * 100;
accuracyScore = historicalCorrectness * 100;

totalScore = (narrativeScore * 0.35) + (elementsScore * 0.25) +
             (creativityScore * 0.20) + (accuracyScore * 0.20);
```

**Bonificaciones:**
- **Cómic Completo:** +15 puntos si crea 6+ paneles
- **Diálogos Ricos:** +10 puntos si usa 3+ tipos de burbujas
- **Detalle Visual:** +10 puntos si usa 5+ objetos/efectos
- **Historia Original:** +15 puntos por creatividad narrativa excepcional

**Auto-gradable:** ⚠️ Semi (elementos técnicos automáticos, narrativa requiere revisión)

**ML Coins:** 45 coins
**XP Base:** 90 XP

**Tiempo Estimado:** 25-35 minutos

---

### 5.3 Video Carta

**Tipo:** `video_carta`
**Dificultad:** ⭐⭐⭐⭐⭐

#### Descripción

Grabación de video carta de 2-4 minutos dirigida a Marie Curie, donde estudiantes reflexionan sobre su legado y hacen conexiones personales.

#### Características Técnicas

- Grabación de video con cámara web
- Timer visible durante grabación
- Filtros visuales opcionales:
  - Sepia (estilo vintage)
  - Blanco y negro
  - Sin filtro
- Preview antes de finalizar
- Re-grabación permitida
- Sistema de descarga del video
- Compresión automática para storage eficiente
- Análisis opcional:
  - Duración
  - Calidad de audio
  - Estabilidad de video

#### Estructura de Contenido

```typescript
interface VideoCartaExercise {
  id: string;
  prompt: string;
  minDuration: number; // segundos
  maxDuration: number;
  suggestedTopics: string[];
  requiredElements: string[];
}

interface VideoCartaSubmission {
  id: string;
  videoUrl: string;
  duration: number;
  filter: 'sepia' | 'bw' | 'none';
  transcription?: string; // Opcional
  metadata: {
    recordedAt: Date;
    deviceType: string;
    audioQuality: number;
    videoQuality: number;
  };
}
```

#### Ejemplo de Uso

**Prompt:** "Graba una video carta de 2-4 minutos dirigida a Marie Curie. Comparte qué has aprendido de su vida, cómo te inspira, y qué pregunta le harías si pudieras hablar con ella."

**Elementos Requeridos:**
1. Introducción personal (quien eres, por qué escribes)
2. Reflexión sobre su vida/trabajo
3. Conexión personal (cómo te inspira)
4. Una pregunta que le harías
5. Despedida/agradecimiento

**Ejemplo de Contenido:**

"Hola Marie, mi nombre es [nombre] y te escribo desde el año 2025. Quiero agradecerte por todo lo que hiciste por la ciencia y por las mujeres.

He aprendido sobre los años que pasaste aislando el Radio, trabajando en condiciones difíciles cuando nadie creía en ti. Tu perseverancia me inspira porque yo también enfrento desafíos en mi camino educativo, y tu ejemplo me enseña que el esfuerzo vale la pena.

Lo que más me impresiona es que compartiste tus descubrimientos libremente, sin patentarlos, para que beneficiaran a la humanidad. En un mundo donde muchos priorizan el dinero, tu generosidad es notable.

Si pudiera hacerte una pregunta, sería: ¿Alguna vez dudaste de ti misma? Y si es así, ¿cómo superaste esas dudas?

Gracias, Marie, por abrir el camino. Tu legado vive en cada mujer que estudia ciencia hoy.

Con admiración, [nombre]."

#### Sistema de Scoring

**Criterios de Evaluación:**
1. **Estructura** (25%) - Presencia de elementos requeridos
2. **Reflexión** (30%) - Profundidad del contenido
3. **Conexión personal** (25%) - Autenticidad y relevancia
4. **Presentación** (20%) - Claridad, tono apropiado, calidad técnica

**Rúbrica:**

| Criterio | Excelente (90-100) | Bueno (75-89) | Satisfactorio (60-74) | Insuficiente (<60) |
|----------|-------------------|--------------|----------------------|-------------------|
| Estructura | Todos los elementos presentes | 4/5 elementos | 3/5 elementos | <3 elementos |
| Reflexión | Profunda, específica, analítica | Buena, algunos detalles | Básica, superficial | Mínima |
| Conexión | Auténtica, significativa | Presente, relevante | Básica | Ausente |
| Presentación | Excelente calidad A/V, tono perfecto | Buena calidad, tono apropiado | Aceptable | Deficiente |

**Bonificaciones:**
- **Duración Óptima:** +10 puntos si 3-4 minutos
- **Alta Calidad:** +10 puntos si audio/video claros
- **Creatividad:** +15 puntos por enfoque original
- **Emoción Auténtica:** +10 puntos por conexión genuina

**Penalizaciones:**
- **Demasiado corto:** -20 puntos si <90 segundos
- **Demasiado largo:** -10 puntos si >300 segundos
- **Audio inaudible:** Requiere re-grabación

**Auto-gradable:** ❌ Manual (requiere revisión completa de contenido)

**ML Coins:** 60 coins (mecánica más compleja)
**XP Base:** 120 XP

**Tiempo Estimado:** 20-30 minutos (planificación + grabación + revisión)

---

## INTEGRACIÓN CON GAMIFICACIÓN

### Resumen de Recompensas

| Mecánica | ML Coins | XP Base | Dificultad | Tiempo |
|----------|----------|---------|-----------|---------|
| Diario Multimedia | 50 | 100 | ⭐⭐⭐⭐ | 30-45 min |
| Cómic Digital | 45 | 90 | ⭐⭐⭐⭐ | 25-35 min |
| Video Carta | 60 | 120 | ⭐⭐⭐⭐⭐ | 20-30 min |

### Achievements Desbloqueables

- **Cronista Multimedia:** Completar Diario con 5+ entradas
- **Artista Digital:** Crear cómic de 6+ paneles con alta creatividad
- **Comunicador Auténtico:** Video Carta con score >90
- **Productor Completo:** Completar las 3 mecánicas del módulo
- **Maestro Creativo:** Obtener 85+ puntos en todas las mecánicas del módulo

### Power-ups Utilizables

- **Inspiración Creativa** (30 ML Coins): Sugerencias de contenido
- **Plantillas Premium** (25 ML Coins): Templates avanzados para cómic
- **Filtros Adicionales** (20 ML Coins): Más filtros para video
- **Segunda Oportunidad** (50 ML Coins): Re-grabar video sin penalización

---

## CONSIDERACIONES TÉCNICAS

### Almacenamiento

- **Diario:** Texto en DB, multimedia en S3/CDN
- **Cómic:** Exportado como PNG/PDF, almacenado en S3
- **Video:** Compresión automática, almacenamiento en S3 con límite de 100MB

### Requisitos del Navegador

- **Diario:** Cualquier navegador moderno
- **Cómic:** Canvas API, drag-and-drop support
- **Video:** getUserMedia API (Chrome, Firefox, Safari moderno)

### Accesibilidad

- **Diario:** Screen reader support, navegación por teclado
- **Cómic:** Alt text para elementos visuales, descripción de paneles
- **Video:** Alternativa: Upload de video grabado externamente

---

## RESPONSIVE DESIGN

### Mobile Considerations

- **Diario:** Editor táctil optimizado, upload desde galería
- **Cómic:** Touch gestures para drag-and-drop de elementos
- **Video:** Grabación con cámara frontal/trasera, preview responsive

### Breakpoints

- **Mobile:** <640px - Editor simplificado
- **Tablet:** 640px-1024px - Interface completa con menos paneles
- **Desktop:** >1024px - Experiencia completa con preview lado a lado

---

## 🔗 Referencias a Implementación

### Documento Principal
📄 **[MODULOS-EDUCATIVOS.md](./MODULOS-EDUCATIVOS.md#-referencias-a-implementación)** - Referencias completas de las 31 mecánicas

### Específico para Módulo 5 - Producción de Textos

**Database:**
- `educational_content.exercises` WHERE `type` IN ('diario_multimedia', 'comic_digital', 'video_carta')
- `educational_content.modules` WHERE `name` = 'Producción de Textos'
- `storage.media_files` - Almacenamiento de uploads (imágenes, audio, video)

**Backend:**
- `apps/backend/src/modules/educational/services/grading/diario-multimedia.grader.ts` - Manual grading
- `apps/backend/src/modules/educational/services/grading/comic-digital.grader.ts` - Manual grading
- `apps/backend/src/modules/educational/services/grading/video-carta.grader.ts` - Manual grading
- `apps/backend/src/modules/storage/services/media-upload.service.ts` - Upload de archivos a S3

**Frontend:**
- `apps/frontend/src/features/educational/components/exercises/DiarioMultimediaExercise.tsx`
  - **Features:** Upload imágenes, audio recording, text editor
- `apps/frontend/src/features/educational/components/exercises/ComicDigitalExercise.tsx`
  - **Library:** Canvas API para dibujo, drag & drop de elementos
- `apps/frontend/src/features/educational/components/exercises/VideoCartaExercise.tsx`
  - **Features:** MediaRecorder API para grabar video, upload

**Seed Data:**
- `apps/database/seed/exercises/modulo-5-ejercicios.json` - 3 ejercicios creativos sobre Marie Curie

---

**Documento preparado por:** Equipo de Análisis Técnico
**Última actualización:** 2025-11-01
**Versión:** 2.0 (Modularizado)
**Prioridad:** Alta - Todas las mecánicas están listas para producción
