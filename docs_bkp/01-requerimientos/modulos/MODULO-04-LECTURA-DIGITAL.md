# Módulo 4: Lectura Digital

**Proyecto:** Gamilit Platform
**Módulo:** Contenido Educativo
**Archivo original:** MODULOS-EDUCATIVOS.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## RESUMEN DEL MÓDULO

**Objetivo Pedagógico:** Desarrollar habilidades de **navegación en medios digitales**, fact-checking, análisis de contenido multimodal, literacidad mediática.

**Mecánicas Implementadas:** 9
**Estado:** ✅ Production-Ready (100% completitud)

### Mecánicas del Módulo

| # | Tipo | Descripción | Auto-gradable |
|---|------|-------------|---------------|
| 4.1 | `verificador_fake_news` | Fact-checker con checklist de verificación | ✅ Sí |
| 4.2 | `quiz_tiktok` | Quiz con UI tipo TikTok (swipe vertical) | ✅ Sí |
| 4.3 | `analisis_memes` | Analizador de elementos retóricos en memes | ⚠️ Semi |
| 4.4 | `infografia_interactiva` | Crear/interpretar infografías | ⚠️ Semi |
| 4.5 | `navegacion_hipertextual` | Navegar documento con enlaces | ✅ Sí |
| 4.6 | `resena_critica` | Escribir reseña de texto | ❌ Manual |
| 4.7 | `chat_literario` | Chat con personaje histórico (Marie Curie IA) | ⚠️ Semi |
| 4.8 | `email_formal` | Escribir email formal con validación | ⚠️ Semi |
| 4.9 | `ensayo_argumentativo` | Escribir ensayo estructurado | ❌ Manual |

---

## MECÁNICAS IMPLEMENTADAS

### 4.1 Verificador de Fake News

**Tipo:** `verificador_fake_news`
**Dificultad:** ⭐⭐⭐

#### Descripción

Fact-checker de artículos con checklist de verificación.

#### Características Técnicas

- Display de artículo completo (título, contenido, fuente, fecha, imagen)
- Checklist de criterios de verificación
- Sistema de claims (afirmaciones a verificar)
- Scoring de veracidad
- Cross-referencing de fuentes

#### Estructura de Contenido

```typescript
{
  article: {
    title: string,
    content: string,
    source: string,
    publishDate: Date,
    imageUrl?: string
  },
  claims: Array<{
    claim: string,
    veracity: 'true' | 'false' | 'misleading' | 'unverifiable',
    sources: string[],
    explanation: string
  }>,
  checklistCriteria: string[]
}
```

#### Checklist de Verificación

- ¿La fuente es confiable?
- ¿El autor tiene credenciales verificables?
- ¿Hay fuentes citadas?
- ¿El lenguaje es sensacionalista?
- ¿Hay evidencia de sesgo?
- ¿Otras fuentes confirman la información?

#### Ejemplo

**Título:** "Marie Curie inventó la máquina de rayos X durante la Primera Guerra Mundial"
**Veracity:** Misleading

**Claims:**
1. "Marie Curie trabajó en la Primera Guerra Mundial" → **True**
2. "Inventó la máquina de rayos X" → **False** (inventada por Röntgen en 1895)
3. "Creó unidades móviles de rayos X" → **True**

**Scoring:**
- Identificación correcta de claims: 60 puntos
- Uso correcto de checklist: 20 puntos
- Explicación de veracidad: 20 puntos

**Auto-gradable:** ✅ Sí

---

### 4.2 Quiz Estilo TikTok

**Tipo:** `quiz_tiktok`
**Dificultad:** ⭐⭐

#### Descripción

Quiz con UI tipo TikTok (swipe vertical).

#### Características Técnicas

- Scroll/swipe vertical entre preguntas
- Animaciones fluidas
- Timer por pregunta
- Feedback visual inmediato
- Progress bar vertical

#### Estructura de Contenido

```typescript
{
  questions: Array<{
    type: 'multiple_choice' | 'true_false' | 'image_based',
    question: string,
    mediaUrl?: string,
    options: Array<{label: string, isCorrect: boolean}>,
    timeLimit: number,
    explanation: string
  }>
}
```

#### Ejemplo (5 preguntas)

1. **Video:** Clip de laboratorio → "¿En qué año trabajó Marie Curie aquí?"
2. **Imagen:** Foto de pechblenda → "¿De qué mineral extrajo el radio?"
3. **Text:** "Marie Curie fue la primera mujer en..." → Opciones
4. **True/False:** "Marie murió de cáncer por radiación" → False
5. **Image-based:** Símbolo Po → "¿Por qué se llama así?"

**Scoring:**
- Correctness: 15 puntos por pregunta
- Speed Bonus: +5 puntos si <5 segundos
- Streak Bonus: +10 puntos por 3+ correctas consecutivas

**Auto-gradable:** ✅ Sí

---

### 4.3 Análisis de Memes

**Tipo:** `analisis_memes`
**Dificultad:** ⭐⭐⭐

#### Descripción

Analizador de elementos retóricos en memes educativos.

#### Características Técnicas

- Display de meme (imagen + texto)
- Identificación de elementos retóricos
- Análisis de mensaje implícito
- Evaluación de efectividad
- Detección de humor/ironía

#### Estructura de Contenido

```typescript
{
  meme: {
    imageUrl: string,
    topText?: string,
    bottomText?: string,
    format: string
  },
  analysis: {
    rhetoricalDevices: string[],
    implicitMessage: string,
    effectiveness: number,
    humorType: 'ironic' | 'parody' | 'wordplay'
  }
}
```

#### Ejemplo

**Formato:** Drake (rechaza/aprueba)
- Panel 1: "Descansar y dormir bien"
- Panel 2: "Trabajar 16 horas como Marie Curie"

**Análisis:**
- Dispositivo: Hipérbole, ironía
- Mensaje: "Marie era extraordinariamente dedicada"
- Humor: Irónico
- Efectividad: 85/100

**Scoring:**
- Dispositivos retóricos: 40 puntos
- Mensaje implícito: 30 puntos
- Efectividad: 30 puntos

**Auto-gradable:** ⚠️ Semi

---

### 4.4 Infografía Interactiva

**Tipo:** `infografia_interactiva`
**Dificultad:** ⭐⭐⭐

#### Descripción

Explorar infografías interactivas con tarjetas revelables.

#### Características Técnicas

- Grid de 5 tarjetas interactivas
- Sistema de revelación
- Progress tracking
- DataVisualization component
- Botón "Revelar Todos"
- Exportar como JSON

#### Estructura de Contenido

```typescript
{
  title: string,
  cards: InfoCard[],
  connections?: Connection[]
}

interface InfoCard {
  title: string,
  content: string,
  position: {x: number, y: number},
  icon: 'atom' | 'award' | 'microscope' | 'star',
  revealed: boolean
}
```

#### Ejemplo (5 tarjetas)

1. **Descubrimientos Científicos** (x:20, y:30) - Átomo
2. **Premios Nobel** (x:50, y:30) - Award
3. **Legado Científico** (x:80, y:30) - Microscopio
4. **Pionera en Ciencia** (x:35, y:70) - Estrella
5. **Impacto Mundial** (x:65, y:70) - Corazón

**Scoring:**
- Exploración: 80 puntos
- Tiempo invertido: 10 puntos
- Uso de funciones: 10 puntos

**Auto-gradable:** ✅ Sí

---

### 4.5 Navegación Hipertextual

**Tipo:** `navegacion_hipertextual`
**Dificultad:** ⭐⭐⭐

#### Descripción

Navegar documento con hipervínculos para alcanzar nodo objetivo.

#### Características Técnicas

- Sistema de nodos con grafo dirigido
- Hyperlinks interactivos
- Breadcrumb navigation
- Tracking de nodos visitados
- Detección de nodo objetivo

#### Estructura de Contenido

```typescript
{
  startNodeId: string,
  targetNodeId: string,
  nodes: HypertextNode[]
}

interface HypertextNode {
  id: string,
  title: string,
  content: string,
  links: HypertextLink[]
}
```

#### Ejemplo

**Nodo Inicial:** "Marie Curie: Una Introducción"
**Nodo Objetivo:** "Instituto Curie y su Legado Actual"

**Camino Óptimo:** inicio → medicina → instituto (2 clics)

**Scoring:**
- Alcanzar objetivo: 40 puntos
- Exploración: 30 puntos
- Eficiencia: 20 puntos
- Tiempo: 10 puntos

**Auto-gradable:** ✅ Sí

---

### 4.6 Reseña Crítica

**Tipo:** `resena_critica`
**Dificultad:** ⭐⭐⭐⭐

#### Descripción

Escribir reseña crítica de obra biográfica sobre Marie Curie.

#### Características Técnicas

- Select de obra a reseñar
- Rating con estrellas (1-5)
- Textareas: resumen, análisis, recomendación
- Checklist de 5 criterios
- Contador de caracteres

#### Estructura

- Resumen (mín 100 chars)
- Análisis crítico (mín 150 chars)
- Recomendación (mín 50 chars)
- Criterios: precisión, claridad, profundidad, relevancia, fuentes

**Scoring:** Completitud (70%) + Criterios (30%)

**Auto-gradable:** ⚠️ Híbrido

---

### 4.7 Chat Literario

**Tipo:** `chat_literario`
**Dificultad:** ⭐⭐⭐

#### Descripción

Conversación tipo chat con Marie Curie o Pierre Curie simulados por AI.

#### Características Técnicas

- Interfaz tipo WhatsApp
- Selector de personaje
- Responses contextuales
- Mínimo 5 mensajes
- Auto-scroll

**Scoring:** Participación (70%) + Engagement (30%)

**Auto-gradable:** ⚠️ Híbrido

---

### 4.8 Email Formal

**Tipo:** `email_formal`
**Dificultad:** ⭐⭐⭐

#### Descripción

Redactar email formal académico con análisis de tono.

#### Características Técnicas

- Templates (Solicitud, Agradecimiento, Invitación)
- Campos: Para, Asunto, Cuerpo
- Análisis AI: Formalidad, Claridad, Profesionalismo
- Sugerencias de mejora

**Métricas:** 0-100 cada una

**Scoring:** Promedio de métricas

**Auto-gradable:** ⚠️ Híbrido

---

### 4.9 Ensayo Argumentativo

**Tipo:** `ensayo_argumentativo`
**Dificultad:** ⭐⭐⭐⭐⭐

#### Descripción

Escribir ensayo estructurado (500+ palabras) con 5 secciones.

#### Características Técnicas

- Select de tema (4 opciones)
- Campo de tesis
- 5 textareas: Intro, Arg1, Arg2, Arg3, Conclusión
- Contador de palabras por sección
- Stats card
- Auto-guardado cada 30s

#### Secciones

- Introducción (mín 100 palabras)
- Argumento 1 (mín 80 palabras)
- Argumento 2 (mín 80 palabras)
- Argumento 3 (mín 80 palabras)
- Conclusión (mín 100 palabras)

**Scoring:** Progreso + Bonuses por completitud

**Auto-gradable:** ❌ Manual

---

## INTEGRACIÓN CON GAMIFICACIÓN

### ML Coins y XP por Mecánica

| Mecánica | ML Coins | XP | Dificultad |
|----------|----------|-----|-----------|
| Verificador Fake News | 30 | 60 | Medium |
| Quiz TikTok | 20 | 40 | Easy |
| Análisis de Memes | 25 | 50 | Medium |
| Infografía Interactiva | 25 | 50 | Medium |
| Navegación Hipertextual | 30 | 60 | Medium |
| Reseña Crítica | 35 | 70 | Hard |
| Chat Literario | 25 | 50 | Medium |
| Email Formal | 30 | 60 | Medium |
| Ensayo Argumentativo | 50 | 100 | Very Hard |

---

## RESPONSIVE DESIGN Y ACCESIBILIDAD

### Estándares WCAG 2.1 AA

- ✅ Contraste de color >4.5:1
- ✅ ARIA labels en elementos interactivos
- ✅ Navegación por teclado
- ✅ Touch targets >44px en móvil
- ✅ Screen reader support

### Consideraciones Especiales

- **Quiz TikTok:** Gestos swipe adaptados a touch
- **Navegación Hipertextual:** Breadcrumbs navegables por teclado
- **Ensayo:** Auto-guardado para prevenir pérdida de progreso

---

## 🔗 Referencias a Implementación

### Documento Principal
📄 **[MODULOS-EDUCATIVOS.md](./MODULOS-EDUCATIVOS.md#-referencias-a-implementación)** - Referencias completas de las 31 mecánicas

### Específico para Módulo 4 - Lectura Digital

**Database:**
- `educational_content.exercises` WHERE `type` IN ('timeline_interactiva', 'mapa_interactivo', 'video_comprension', 'infografia_interactiva', 'redes_sociales', 'audio_transcripcion', 'presentacion_interactiva', 'identificar_sesgos', 'respuesta_abierta')
- `educational_content.modules` WHERE `name` = 'Lectura Digital'

**Backend:**
- `apps/backend/src/modules/educational/services/grading/timeline-interactiva.grader.ts`
- `apps/backend/src/modules/educational/services/grading/mapa-interactivo.grader.ts`
- `apps/backend/src/modules/educational/services/grading/video-comprension.grader.ts`
- `apps/backend/src/modules/educational/services/grading/infografia-interactiva.grader.ts`
- `apps/backend/src/modules/educational/services/grading/redes-sociales.grader.ts`
- (+ 4 graders adicionales)

**Frontend:**
- `apps/frontend/src/features/educational/components/exercises/TimelineInteractivaExercise.tsx` - Timeline digital
- `apps/frontend/src/features/educational/components/exercises/MapaInteractivoExercise.tsx` - Leaflet/Google Maps
- `apps/frontend/src/features/educational/components/exercises/VideoComprensionExercise.tsx` - React Player
- `apps/frontend/src/features/educational/components/exercises/InfografiaInteractivaExercise.tsx` - Infografía interactiva
- `apps/frontend/src/features/educational/components/exercises/RedesSocialesExercise.tsx` - Simulación de feed social
- (+ 4 componentes adicionales)

**Seed Data:**
- `apps/database/seed/exercises/modulo-4-ejercicios.json` - 9 ejercicios sobre Marie Curie

---

**Documento preparado por:** Equipo de Análisis Técnico
**Última actualización:** 2025-11-01
**Versión:** 2.0 (Modularizado)
