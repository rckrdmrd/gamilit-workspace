# Mecánicas Detalladas - Módulo 4: Lectura Digital

**Proyecto:** Gamilit Platform
**Módulo:** Contenido Educativo
**Archivo original:** MECANICAS-DOCUMENTACION-COMPLETA.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Contenido

Este documento contiene la documentación detallada de 3 mecánicas del Módulo 4 (Lectura Digital) que requieren especificaciones extendidas.

**Mecánicas incluidas:**
1. Infografía Interactiva
2. Navegación Hipertextual
3. Resumen de Mecánicas Restantes (Reseña Crítica, Chat Literario, Email Formal, Ensayo Argumentativo)

---

## 6.4 Infografía Interactiva

**Tipo:** `infografia_interactiva`
**Módulo:** 4
**Tipo de Comprensión:** Digital
**Dificultad:** ⭐⭐⭐

### Descripción

La Infografía Interactiva es una mecánica de lectura digital multimodal donde estudiantes exploran información presentada visualmente en forma de tarjetas interactivas revelables. A diferencia de leer un texto lineal, los estudiantes navegan libremente entre elementos visuales (cards), cada uno conteniendo un concepto o dato sobre Marie Curie.

La interfaz presenta 5 tarjetas distribuidas espacialmente en un canvas (posiciones definidas en %). Cada tarjeta muestra un ícono representativo (átomo, medalla, microscopio, estrella, corazón) y un título visible. Al hacer clic en una tarjeta no revelada, se expande con animación para mostrar el contenido completo (200-300 palabras explicando ese aspecto de Marie Curie).

Las tarjetas reveladas cambian su apariencia visual (borde dorado, fondo ligeramente destacado) para indicar progreso. Un componente DataVisualization muestra el mapa completo de tarjetas con líneas conectoras opcionales entre conceptos relacionados. Los estudiantes deben revelar todas las 5 tarjetas para completar el ejercicio, fomentando la exploración completa de la información.

La mecánica incluye botón "Revelar Todos" para estudiantes que prefieren ver todo de una vez, y botones "Guardar Progreso" y "Exportar" para descargar la infografía como JSON. Un contador visual muestra "X/5 elementos explorados", creando un sentido de progresión.

Visualmente, la interfaz usa un diseño de cards flotantes con Framer Motion para animaciones suaves al revelar. Los íconos de lucide-react proporcionan representación visual de cada concepto. El layout es responsive, adaptándose a pantallas pequeñas con grid vertical en móvil.

### Objetivo Pedagógico

Desarrollar competencias de lectura digital no-lineal, incluyendo:

1. Navegación hipertextual entre elementos de información
2. Construcción de conocimiento a través de exploración autónoma (vs. lectura secuencial)
3. Integración de información visual y textual multimodal
4. Identificación de relaciones entre conceptos dispersos espacialmente
5. Autorregulación del proceso de aprendizaje (elegir qué explorar primero)
6. Comprensión de formatos digitales modernos (infografías, dashboards, visualizaciones interactivas)

Esta mecánica refleja cómo se consume información en web moderna: no-lineal, visual, interactiva.

### Características Técnicas

- Grid de 5 tarjetas interactivas con posiciones configurables (x, y en %)
- Sistema de revelación con estado revealed: boolean por tarjeta
- Iconos diferenciados por tipo (atom, award, microscope, star, heart)
- Animaciones de Framer Motion en reveal/hide
- DataVisualization component con canvas visual de todas las tarjetas
- Progress tracking: calculado como (revealedCount / totalCards) * 100
- Botón "Revelar Todos" para exploración rápida
- Botón "Guardar Progreso" con save a localStorage
- Botón "Exportar" para descargar como JSON
- Auto-completado cuando todas las tarjetas están reveladas
- Responsive grid: 3 columnas desktop, 2 tablet, 1 móvil
- Color-coding opcional por categoría de información
- Hover effects en tarjetas no reveladas
- Confirmación visual con checkmark en tarjetas reveladas
- Auto-guardado cada 30 segundos

### Estructura de Contenido

```typescript
interface InfografiaInteractivaData {
  id: string;
  title: string;
  description: string;
  topic: string;  // Ej: "Vida y Legado de Marie Curie"
  cards: InfoCard[];
  backgroundImage?: string;  // Opcional: imagen de fondo
  connections?: Connection[];  // Opcional: líneas entre cards relacionadas
}

interface InfoCard {
  id: string;
  title: string;  // Ej: "Descubrimientos Científicos"
  content: string;  // Texto completo (200-300 palabras)
  position: {
    x: number;  // 0-100 (porcentaje)
    y: number;  // 0-100 (porcentaje)
  };
  icon: 'atom' | 'award' | 'microscope' | 'star' | 'heart' | 'book' | 'globe';
  revealed: boolean;  // Estado de revelación
  category?: string;  // Opcional: para agrupar
}

interface Connection {
  from: string;  // card id
  to: string;    // card id
  label?: string;  // Opcional: describe la relación
}

interface InfografiaAnswer {
  cardsRevealed: string[];  // IDs de cards reveladas
  timeSpent: number;
  revealOrder: string[];  // Orden en que fueron reveladas
}

interface InfografiaEvaluation {
  score: number;  // 100 si todas reveladas, proporcional si no
  explorationScore: number;  // Basado en % explorado
  completeness: boolean;  // true si 100% revelado
}
```

### Ejemplo de Contenido (Marie Curie)

**Título:** "Marie Curie: Ciencia, Pionerismo y Legado"

**Descripción:** "Explora la vida y contribuciones de Marie Curie a través de esta infografía interactiva. Haz clic en cada elemento para descubrir información clave."

#### Tarjeta 1: Descubrimientos Científicos
- **Posición:** x:20, y:30
- **Ícono:** atom
- **Contenido:** "Entre 1898 y 1902, Marie Curie, junto a su esposo Pierre, aislaron dos nuevos elementos químicos: el Polonio (Po, nombrado por Polonia, su país natal) y el Radio (Ra). Estos descubrimientos revolucionaron la física y la química. El Radio, en particular, resultó ser 400 veces más radiactivo que el uranio, fenómeno que Marie estudió intensamente. Acuñó el término 'radioactividad' para describir esta propiedad. Su método meticuloso implicaba procesar toneladas de pechblenda (mineral de uranio) en condiciones precarias, trabajando en un cobertizo sin calefacción. El aislamiento del Radio puro tomó 4 años de trabajo extenuante. Este descubrimiento sentó las bases de la física nuclear moderna y abrió el campo de la radiología médica."

#### Tarjeta 2: Premios Nobel
- **Posición:** x:50, y:30
- **Ícono:** award
- **Contenido:** "Marie Curie es la única persona en la historia en ganar Premios Nobel en dos disciplinas científicas diferentes. En 1903, compartió el Nobel de Física con Pierre Curie y Henri Becquerel por sus investigaciones sobre radiación. Fue la primera mujer en recibir este honor. En 1911, ganó el Nobel de Química por el descubrimiento del Radio y Polonio, esta vez como única galardonada, convirtiéndose en la primera persona (y hasta 1962, la única mujer) en ganar dos Nobels. Curiosamente, en 1903 inicialmente no iba a ser incluida en el premio; fue Pierre quien insistió en que el trabajo era conjunto. Su segundo Nobel solidificó su estatus como gigante de la ciencia, pero también enfrentó misoginia: algunos miembros de la Academia Francesa de Ciencias votaron en contra de su admisión."

#### Tarjeta 3: Legado Científico
- **Posición:** x:80, y:30
- **Ícono:** microscope
- **Contenido:** "Las investigaciones de Marie Curie tuvieron aplicaciones médicas inmediatas y profundas. El Radio se usó para tratar tumores cancerígenos, naciendo así la radioterapia. Durante la Primera Guerra Mundial (1914-1918), Marie equipó ambulancias con máquinas de rayos X portátiles, llamadas 'petites Curies', que ayudaron a localizar balas y metralla en soldados heridos, salvando incontables vidas. Entrenó a técnicos en el uso de equipos de rayos X, democratizando esta tecnología. Su trabajo también inspiró a su hija Irène Joliot-Curie, quien ganó el Nobel de Química en 1935 por descubrir la radioactividad artificial. El Instituto Curie, fundado en 1909, sigue siendo un centro líder en investigación oncológica. Sin el trabajo de Marie, la medicina moderna sería irreconocible."

#### Tarjeta 4: Pionera en Ciencia
- **Posición:** x:35, y:70
- **Ícono:** star
- **Contenido:** "Marie Curie (nacida Maria Skłodowska) rompió innumerables barreras de género. En 1891, viajó sola de Polonia a París para estudiar en la Sorbona, una de las pocas universidades que aceptaban mujeres en ciencias. Fue la primera mujer en obtener un doctorado en Física en Francia (1903). En 1906, tras la muerte trágica de Pierre en un accidente, Marie se convirtió en la primera profesora mujer de la Sorbona, ocupando la cátedra de su esposo. Enfrentó discriminación constante: colegas masculinos cuestionaban su capacidad, y en 1911, un escándalo personal (relación con Paul Langevin) casi la destruye profesionalmente. Sin embargo, perseveró, inspirando a generaciones de mujeres a seguir carreras en STEM. Hoy, su imagen es sinónimo de mujer en ciencia."

#### Tarjeta 5: Impacto Mundial
- **Posición:** x:65, y:70
- **Ícono:** heart
- **Contenido:** "El impacto de Marie Curie trasciende sus descubrimientos. En términos humanitarios, la radioterapia derivada de su investigación ha salvado millones de vidas en el tratamiento del cáncer. Sus unidades móviles de rayos X durante la Primera Guerra Mundial trataron a más de un millón de soldados. En términos educativos, fundó el Instituto del Radio en París (1909, ahora Instituto Curie) y el Instituto del Radio en Varsovia (1925), centros de investigación y formación científica. Culturalmente, su figura ha sido representada en películas, obras de teatro, libros (incluida la biografía de su hija Ève), y hasta en billetes de 500 francos franceses. UNESCO estableció las becas Marie Curie para promover a mujeres en ciencia. Su legado vive en cada científica que enfrenta obstáculos y persevera."

#### Conexiones visuales (opcionales)
- Tarjeta 1 → Tarjeta 3: "Sus descubrimientos llevaron a aplicaciones médicas"
- Tarjeta 2 → Tarjeta 4: "Los Nobels validaron su trabajo a pesar de la discriminación"
- Tarjeta 4 → Tarjeta 5: "Su ejemplo pionero inspiró a generaciones"

### Sistema de Scoring

**Fórmula Base:**
```typescript
explorationScore = (cardsRevealed / totalCards) * 100;
// Mecánica simple: completitud = score
baseScore = explorationScore;

// Bonus por exploración completa
completionBonus = explorationScore === 100 ? 20 : 0;

totalScore = Math.min(100, baseScore + completionBonus);
```

**Criterios de Evaluación:**

1. **Exploración Completa** (peso: 80%) - % de tarjetas reveladas
2. **Tiempo Invertido** (peso: 10%) - Bonus si dedica >5 minutos leyendo
3. **Guardado de Progreso** (peso: 5%) - Bonus si usa funciones de guardado/export
4. **Orden de Exploración** (peso: 5%) - Bonus si explora en orden lógico

**Bonificaciones:**
- **Exploración Completa:** +20 puntos si revela todas las 5 tarjetas
- **Lectura Profunda:** +10 puntos si dedica >60 segundos por tarjeta en promedio
- **Uso de Funciones:** +5 puntos si exporta infografía
- **Primera Vez:** +10 puntos si completa sin usar "Revelar Todos"

**Penalizaciones:**
- Ninguna (mecánica de exploración libre sin penalizaciones)
- Nota: Usar "Revelar Todos" no penaliza, solo no otorga bonus de exploración orgánica

**Multiplicadores aplicables:**
- Rango Maya: 1.0x - 2.0x
- Dificultad: 1.1x (mecánica medium)
- Streak: +2% por día

### Auto-gradabilidad

**Nivel:** ✅ Automático (100%)

**Métricas Automáticas:**
- Conteo de tarjetas reveladas (simple boolean check)
- Cálculo de porcentaje de exploración
- Tracking de tiempo por tarjeta (timestamp de revelación)
- Orden de revelación (array de IDs)
- Uso de funciones (guardado, export)

**No requiere revisión humana:**
Esta mecánica es puramente de exploración y lectura, sin producción de contenido por parte del estudiante. El scoring es objetivo y calculable automáticamente.

### Validaciones

- **Mínimo 50% explorado:** Para permitir completar ejercicio (3/5 tarjetas)
- **Confirmación de lectura:** No aplicable (se asume que revelar = leer)
- **Timeout:** Ninguno (exploración a ritmo propio)
- **Re-exploración:** Permitir ocultar y revelar tarjetas múltiples veces

### Integración con Gamificación

- **ML Coins base:** 25 coins
- **XP base:** 50 XP
- **Achievements desbloqueables:**
  - "Explorador Completo" - Revelar 100% de infografías en 3 ejercicios
  - "Lector Digital" - Dedicar >10 minutos explorando infografía
  - "Curador de Conocimiento" - Exportar 5 infografías
- **Power-ups utilizables:**
  - Visión Lectora (15 ML Coins): Resalta palabras clave en todas las tarjetas
  - Mapa Mental (25 ML Coins): Muestra conexiones entre tarjetas

### Tiempo Estimado

7-10 minutos para exploración completa de calidad:
- Exploración de 5 tarjetas: 5-7 min (1-1.5 min por tarjeta)
- Revisión de conexiones: 1-2 min
- Exportación/guardado (opcional): 1 min

**Tiempo mínimo:** 5 minutos (lectura rápida de todas las tarjetas)
**Tiempo óptimo:** 10-12 minutos (lectura profunda con reflexión)

### Prerequisitos

- Nivel mínimo: Rango Kʼaal (nivel 1) - mecánica accesible para principiantes
- No requiere completar ejercicios previos
- Recomendado: Familiaridad básica con infografías (concepto explicado en tutorial)

### Notas de Implementación

**Frontend:**
- Componente: `InfografiaInteractivaExercise.tsx`
- Sub-componentes: `InteractiveCard.tsx`, `DataVisualization.tsx`
- Estado: Array de InfoCard con revealed boolean
- Animaciones: Framer Motion para reveal transitions
- Layout: CSS Grid responsive

**Backend:**
- Endpoint: `GET /api/exercises/infografia/:id` (obtener datos)
- Endpoint: `POST /api/exercises/infografia/:id/submit` (enviar progreso)
- Almacenamiento: JSON en base de datos con array de cards
- No requiere procesamiento complejo

**Consideraciones:**
- **Performance:** Lazy load de imágenes si las tarjetas incluyen fotos
- **Accessibility:** ARIA labels en todas las tarjetas, navegación por teclado
- **Mobile:** Touch events para reveal, grid 1-column en móvil
- **Export:** JSON.stringify() con pretty print para legibilidad

---

## 6.5 Navegación Hipertextual

**Tipo:** `navegacion_hipertextual`
**Módulo:** 4
**Tipo de Comprensión:** Digital
**Dificultad:** ⭐⭐⭐

### Descripción

Navegación Hipertextual es una mecánica que simula la experiencia de leer un artículo web con múltiples enlaces internos, reflejando cómo se consume información en la web moderna. Los estudiantes navegan entre "nodos" de texto conectados por hipervínculos, construyendo comprensión a través de un recorrido no-lineal.

La interfaz presenta un documento de texto (300-500 palabras) con palabras/frases resaltadas como hipervínculos (color azul, subrayado). Al hacer clic en un enlace, el usuario es transportado a un nuevo nodo con contenido relacionado. Un componente "Breadcrumbs" en la parte superior muestra la ruta de navegación (Inicio > Descubrimiento del Radio > Aplicaciones Médicas), permitiendo retroceder fácilmente.

El ejercicio define un nodo objetivo que los estudiantes deben alcanzar navegando estratégicamente por los enlaces. Un contador muestra "Nodos visitados: X/Y", y un indicador visual (checkmark verde) señala cuando se alcanza el nodo objetivo. La mecánica evalúa la capacidad de navegar eficientemente, entendiendo las relaciones semánticas entre nodos para llegar al destino.

Los nodos están estructurados como un grafo dirigido donde cada nodo puede tener 2-5 enlaces salientes hacia otros nodos. Algunos caminos son más directos (2-3 saltos) mientras que otros son serpenteantes (5+ saltos). Los estudiantes con mejor comprensión lectora eligen enlaces semánticamente relevantes para llegar más rápido al objetivo.

Visualmente, la interfaz usa un diseño limpio tipo artículo de blog, con breadcrumbs prominentes en la parte superior, el documento en el centro con enlaces destacados, y un panel lateral mostrando progreso (nodos visitados, objetivo alcanzado). Animaciones suaves de Framer Motion transicionan entre nodos.

### Objetivo Pedagógico

Desarrollar competencias de lectura hipertextual digital, incluyendo:

1. Navegación estratégica entre documentos interconectados
2. Construcción de modelos mentales de estructuras no-lineales de información
3. Predicción semántica (elegir enlaces que probablemente lleven al objetivo)
4. Uso de breadcrumbs y otras ayudas de navegación web
5. Comprensión de relaciones entre fragmentos de texto distribuidos
6. Tolerancia a la no-linealidad (vs. lectura secuencial tradicional)

Esta mecánica refleja la lectura en Wikipedia, artículos de noticias con enlaces incrustados, y documentación técnica con referencias cruzadas - formatos ubicuos en la web moderna.

### Características Técnicas

- Sistema de nodos con estructura de grafo dirigido
- Hyperlinks interactivos con hover effects
- Navegación por clics en enlaces (no URLs reales, interno a la app)
- Breadcrumb navigation component (NavigationBreadcrumbs.tsx)
- Tracking de nodos visitados con array de IDs
- Detección de nodo objetivo alcanzado
- HypertextDocument component para renderizar nodo actual
- Progress bar mostrando exploración (visitedNodes / totalNodes)
- Indicador visual de objetivo alcanzado (CheckCircle icon)
- Auto-completado cuando se alcanza nodo objetivo
- History de navegación para análisis post-ejercicio
- Botón opcional "Reset" para reiniciar exploración
- Animaciones de transición entre nodos (fade in/out)
- Responsive: Links con touch targets grandes en móvil
- Auto-guardado de estado cada 30 segundos

### Estructura de Contenido

```typescript
interface NavegacionHipertextualData {
  id: string;
  title: string;
  description: string;
  startNodeId: string;  // Nodo inicial
  targetNodeId: string;  // Nodo objetivo a alcanzar
  nodes: HypertextNode[];
}

interface HypertextNode {
  id: string;
  title: string;
  content: string;  // Texto con placeholders para links
  links: HypertextLink[];
}

interface HypertextLink {
  id: string;
  text: string;  // Texto del enlace
  targetNodeId: string;  // A qué nodo lleva
  position?: {  // Opcional: dónde insertar el link en el content
    startIndex: number;
    endIndex: number;
  };
}

interface NavegacionAnswer {
  visitedNodes: string[];  // IDs en orden de visita
  targetReached: boolean;
  navigationPath: string[];  // Camino específico hasta el objetivo
  timeSpent: number;
  totalClicks: number;  // Número de enlaces clickeados
}

interface NavegacionEvaluation {
  score: number;
  efficiency: number;  // Qué tan directo fue el camino (optimal / actual)
  exploration: number;  // % de nodos visitados
  targetReached: boolean;
}
```

### Sistema de Scoring

**Fórmula Base:**
```typescript
// Score basado en exploración y eficiencia
explorationScore = (visitedNodes.length / totalNodes) * 60;
targetScore = targetReached ? 40 : 0;

// Bonus por eficiencia (camino corto)
optimalClicks = 2;  // Camino más corto posible
actualClicks = navigationPath.length - 1;
efficiencyBonus = targetReached ? Math.max(0, 20 - (actualClicks - optimalClicks) * 5) : 0;

totalScore = Math.min(100, explorationScore + targetScore + efficiencyBonus);
```

**Criterios de Evaluación:**

1. **Alcanzar Objetivo** (peso: 40%) - Binary: llegó o no llegó al nodo objetivo
2. **Exploración** (peso: 30%) - % de nodos visitados (fomenta exploración amplia)
3. **Eficiencia** (peso: 20%) - Qué tan directo fue el camino
4. **Tiempo** (peso: 10%) - Bonus por completar rápidamente

**Bonificaciones:**
- **Camino Óptimo:** +20 puntos si usa el camino más corto posible
- **Exploración Completa:** +15 puntos si visita 100% de nodos
- **Primera Ruta:** +10 puntos si alcanza objetivo en primer intento sin retrocesos
- **Tiempo Rápido:** +10 puntos si completa en <3 minutos

**Multiplicadores:** Rango Maya (1.0x - 2.0x), Dificultad (1.1x), Streak (+2%)

### Auto-gradabilidad

**Nivel:** ✅ Automático (100%)

La mecánica es puramente de navegación. Todas las métricas son objetivas y calculables automáticamente.

### Integración con Gamificación

- **ML Coins:** 30 coins
- **XP:** 60 XP
- **Achievements:**
  - "Navegador Experto" - Camino óptimo 3 veces
  - "Explorador Digital" - 100% de nodos visitados

### Tiempo Estimado

6-10 minutos total

---

## RESUMEN: Mecánicas Restantes del Módulo 4

### 6.6 Reseña Crítica

**Tipo:** `resena_critica` | **Dificultad:** ⭐⭐⭐⭐

Escribir reseña crítica (300+ palabras) de obra biográfica. Incluye rating, resumen, análisis, recomendación, checklist de criterios.

**Auto-gradabilidad:** ⚠️ Híbrido | **Tiempo:** 15-20 min

---

### 6.7 Chat Literario

**Tipo:** `chat_literario` | **Dificultad:** ⭐⭐⭐

Conversación tipo WhatsApp con Marie/Pierre Curie AI. Mínimo 5 mensajes.

**Auto-gradabilidad:** ⚠️ Híbrido | **Tiempo:** 8-12 min

---

### 6.8 Email Formal

**Tipo:** `email_formal` | **Dificultad:** ⭐⭐⭐

Redactar email formal académico con análisis de Formalidad, Claridad, Profesionalismo.

**Auto-gradabilidad:** ⚠️ Híbrido | **Tiempo:** 10-15 min

---

### 6.9 Ensayo Argumentativo

**Tipo:** `ensayo_argumentativo` | **Dificultad:** ⭐⭐⭐⭐⭐

Ensayo estructurado (500+ palabras): Intro, 3 Argumentos, Conclusión.

**Auto-gradabilidad:** ❌ Manual | **Tiempo:** 30-40 min

---

## 🔗 Referencias a Implementación

### Documento Principal
📄 **[MODULOS-EDUCATIVOS.md](./MODULOS-EDUCATIVOS.md#-referencias-a-implementación)** - Referencias completas de las 31 mecánicas
📄 **[MODULO-04-LECTURA-DIGITAL.md](./MODULO-04-LECTURA-DIGITAL.md#-referencias-a-implementación)** - Referencia del módulo completo

### Específico para Mecánicas Módulo 4

**Database:**
- `educational_content.exercises` WHERE `module_id` = (SELECT id FROM modules WHERE name = 'Lectura Digital')
- Tipos: 'timeline_interactiva', 'mapa_interactivo', 'video_comprension', 'infografia_interactiva', 'redes_sociales', 'audio_transcripcion', 'presentacion_interactiva', 'identificar_sesgos', 'respuesta_abierta'

**Backend Graders (9 graders):**
- `apps/backend/src/modules/educational/services/grading/timeline-interactiva.grader.ts` - Validación de secuencias
- `apps/backend/src/modules/educational/services/grading/mapa-interactivo.grader.ts` - Geolocalización correcta
- `apps/backend/src/modules/educational/services/grading/video-comprension.grader.ts` - Quiz sobre video
- `apps/backend/src/modules/educational/services/grading/infografia-interactiva.grader.ts` - Hotspots interactivos
- `apps/backend/src/modules/educational/services/grading/redes-sociales.grader.ts` - Análisis de posts
- (+ 4 graders adicionales para audio, presentación, sesgos, respuesta abierta)

**Frontend Components (9 componentes):**
- `apps/frontend/src/features/educational/components/exercises/TimelineInteractivaExercise.tsx` - Timeline digital
- `apps/frontend/src/features/educational/components/exercises/MapaInteractivoExercise.tsx` - Leaflet/Google Maps
- `apps/frontend/src/features/educational/components/exercises/VideoComprensionExercise.tsx` - React Player con quiz
- `apps/frontend/src/features/educational/components/exercises/InfografiaInteractivaExercise.tsx` - SVG interactivo
- `apps/frontend/src/features/educational/components/exercises/RedesSocialesExercise.tsx` - Feed simulado
- (+ 4 componentes para audio, presentación, sesgos, respuesta abierta)

**Libraries Clave:**
- Leaflet o Google Maps API para mapas interactivos
- React Player para reproducción de video
- MediaRecorder API para audio (transcripción)
- Swiper para gestos tipo TikTok

**Seed Data:**
- `apps/database/seed/exercises/modulo-4-ejercicios.json` - 9 ejercicios multimedia sobre Marie Curie

---

**Documento preparado por:** Equipo de Análisis Técnico
**Última actualización:** 2025-11-01
**Versión:** 2.0 (Modularizado)
