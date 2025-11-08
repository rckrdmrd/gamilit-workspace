# Documentación Detallada de Mecánicas - GAMILIT Platform

**Proyecto:** Gamilit Platform
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Índice de Documentación de Mecánicas

Este directorio contiene la documentación extendida de mecánicas específicas que requieren especificaciones técnicas detalladas más allá de la documentación estándar de los módulos educativos.

### Estructura Modularizada

El archivo original `MECANICAS-DOCUMENTACION-COMPLETA.md` (1,181 líneas) ha sido dividido en 3 archivos especializados:

| Archivo | Módulo | Mecánicas | Líneas | Estado |
|---------|--------|-----------|--------|--------|
| `MECANICA-DEBATE-DIGITAL.md` | 3 - Crítica | 1 | ~380 | ✅ Completo |
| `MECANICAS-MODULO-3-CRITICA.md` | 3 - Crítica | 1 (+resumen) | ~395 | ✅ Completo |
| `MECANICAS-MODULO-4-LECTURA-DIGITAL.md` | 4 - Digital | 2 (+resúmenes) | ~380 | ✅ Completo |

**Total:** 9 mecánicas documentadas en detalle

---

## Mecánicas Documentadas

### Módulo 3: Comprensión Crítica

#### 1. Debate Digital

**Archivo:** `MECANICA-DEBATE-DIGITAL.md`

**Descripción:** Chat en tiempo real con oponente AI sobre temas controversiales relacionados con Marie Curie.

**Características Clave:**
- Interfaz de chat conversacional
- AI con personalidad definida y contra-argumentos contextuales
- Análisis de fuerza argumentativa en tiempo real
- Mínimo 3 mensajes para completar

**Especificaciones Técnicas:**
- React state management para mensajes
- Indicador "AI está escribiendo"
- Auto-scroll a último mensaje
- AnimatePresence para transiciones

**Auto-gradabilidad:** ⚠️ Híbrido (70% Automático, 30% Revisión)

**Tiempo Estimado:** 8-12 minutos

**ML Coins:** 35 | **XP:** 70

---

#### 2. Podcast Argumentativo

**Archivo:** `MECANICAS-MODULO-3-CRITICA.md`

**Descripción:** Grabación de argumento oral de 2-3 minutos con análisis en 4 dimensiones (Claridad, Lógica, Evidencia, Persuasión).

**Características Clave:**
- Grabación con Web Audio API
- Transcripción automática (preparado para Speech-to-Text)
- Análisis de estructura argumentativa
- Elementos requeridos: intro, tesis, evidencias, conclusión

**Especificaciones Técnicas:**
- MediaRecorder API para captura
- Timer en tiempo real
- Player de audio HTML5
- Formato: audio/webm

**Auto-gradabilidad:** ❌ Manual (con asistencia AI opcional)

**Tiempo Estimado:** 15-20 minutos

**ML Coins:** 50 | **XP:** 100

---

### Módulo 4: Lectura Digital

#### 3. Infografía Interactiva

**Archivo:** `MECANICAS-MODULO-4-LECTURA-DIGITAL.md`

**Descripción:** Explorar infografías con 5 tarjetas interactivas revelables sobre Marie Curie.

**Características Clave:**
- Grid de tarjetas con posicionamiento configurable
- Sistema de revelación con animaciones
- DataVisualization component
- Botones: "Revelar Todos", "Guardar", "Exportar"

**Especificaciones Técnicas:**
- Framer Motion para animaciones
- Iconos lucide-react diferenciados
- Progress tracking automático
- Export como JSON

**Auto-gradabilidad:** ✅ Automático (100%)

**Tiempo Estimado:** 7-10 minutos

**ML Coins:** 25 | **XP:** 50

---

#### 4. Navegación Hipertextual

**Archivo:** `MECANICAS-MODULO-4-LECTURA-DIGITAL.md`

**Descripción:** Navegar entre nodos de texto conectados por hipervínculos para alcanzar un nodo objetivo.

**Características Clave:**
- Grafo dirigido de nodos
- Breadcrumb navigation
- Tracking de nodos visitados
- Detección de camino óptimo

**Especificaciones Técnicas:**
- Hyperlinks internos (no URLs reales)
- NavigationBreadcrumbs component
- HypertextDocument renderer
- Animaciones de transición

**Auto-gradabilidad:** ✅ Automático (100%)

**Tiempo Estimado:** 6-10 minutos

**ML Coins:** 30 | **XP:** 60

---

## Resumen de Mecánicas Adicionales

### Módulo 4: Otras Mecánicas Documentadas (Resumen)

**Archivo:** `MECANICAS-MODULO-4-LECTURA-DIGITAL.md` (sección resumen)

#### 5. Reseña Crítica
- **Tipo:** `resena_critica`
- **Dificultad:** ⭐⭐⭐⭐
- **Descripción:** Escribir reseña de obra biográfica (300+ palabras)
- **Auto-gradabilidad:** ⚠️ Híbrido
- **Tiempo:** 15-20 min

#### 6. Chat Literario
- **Tipo:** `chat_literario`
- **Dificultad:** ⭐⭐⭐
- **Descripción:** Conversación con Marie/Pierre Curie AI
- **Auto-gradabilidad:** ⚠️ Híbrido
- **Tiempo:** 8-12 min

#### 7. Email Formal
- **Tipo:** `email_formal`
- **Dificultad:** ⭐⭐⭐
- **Descripción:** Redactar email académico formal
- **Auto-gradabilidad:** ⚠️ Híbrido
- **Tiempo:** 10-15 min

#### 8. Ensayo Argumentativo
- **Tipo:** `ensayo_argumentativo`
- **Dificultad:** ⭐⭐⭐⭐⭐
- **Descripción:** Ensayo estructurado 500+ palabras
- **Auto-gradabilidad:** ❌ Manual
- **Tiempo:** 30-40 min

---

## Estadísticas Generales

### Por Auto-gradabilidad

| Tipo | Mecánicas | Porcentaje |
|------|-----------|-----------|
| ✅ Automático | 2 | 22% |
| ⚠️ Híbrido | 5 | 56% |
| ❌ Manual | 2 | 22% |

### Por Dificultad

| Nivel | Mecánicas | Porcentaje |
|-------|-----------|-----------|
| ⭐⭐⭐ Media | 3 | 33% |
| ⭐⭐⭐⭐ Alta | 5 | 56% |
| ⭐⭐⭐⭐⭐ Muy Alta | 1 | 11% |

### Por Tiempo Estimado

| Rango | Mecánicas | Porcentaje |
|-------|-----------|-----------|
| <10 min | 2 | 22% |
| 10-20 min | 5 | 56% |
| >20 min | 2 | 22% |

### Recompensas Totales

| Métrica | Total |
|---------|-------|
| ML Coins | ~265 |
| XP | ~530 |

---

## Comparación con Documentación Estándar

### Diferencias Clave

**Documentación Estándar (README-MODULOS-EDUCATIVOS.md):**
- Vista general de 27 mecánicas
- Especificaciones básicas
- Ejemplos resumidos
- ~50-100 líneas por mecánica

**Documentación Detallada (este directorio):**
- Profundidad en 9 mecánicas específicas
- Especificaciones técnicas completas
- Ejemplos de contenido extensos (transcripciones completas, flujos de debate)
- ~200-400 líneas por mecánica
- Rúbricas detalladas para revisión docente
- Notas de implementación frontend/backend

---

## Cuándo Usar Cada Documentación

### Usar Documentación Estándar (README-MODULOS-EDUCATIVOS.md) para:

- Vista general del sistema completo
- Planificación de desarrollo
- Onboarding de nuevos desarrolladores
- Referencia rápida de mecánicas

### Usar Documentación Detallada (este directorio) para:

- Implementación específica de mecánicas complejas
- Diseño de UX/UI detallado
- Integración de APIs externas (Speech-to-Text, AI)
- Creación de rúbricas para docentes
- Debugging de mecánicas específicas

---

## Mecánicas Priorizadas para Documentación Detallada

Las 9 mecánicas documentadas en detalle fueron seleccionadas por:

1. **Complejidad técnica alta** - Requieren integración de APIs externas o sistemas complejos
2. **Evaluación compleja** - Auto-gradabilidad híbrida o manual requiere especificaciones claras
3. **Innovación pedagógica** - Formatos modernos (podcast, chat AI, infografía interactiva)
4. **Tiempo de desarrollo alto** - Mecánicas que consumen >2 sprints de desarrollo

---

## Estructura de Documentación Detallada

Cada mecánica documentada en detalle incluye:

### Secciones Obligatorias

1. **Información General** - Tipo, módulo, dificultad
2. **Descripción** - Explicación extendida (300-500 palabras)
3. **Objetivo Pedagógico** - Justificación educativa
4. **Características Técnicas** - Lista detallada de funcionalidades
5. **Estructura de Contenido** - TypeScript interfaces completas
6. **Ejemplo de Contenido** - Caso completo con Marie Curie
7. **Sistema de Scoring** - Fórmulas, criterios, bonificaciones
8. **Auto-gradabilidad** - Nivel y justificación
9. **Validaciones** - Reglas de negocio
10. **Integración con Gamificación** - ML Coins, XP, achievements
11. **Tiempo Estimado** - Desglose por fase
12. **Prerequisitos** - Nivel mínimo, ejercicios previos
13. **Notas de Implementación** - Frontend, backend, consideraciones

### Secciones Opcionales

- **Rúbricas para Revisión Docente** - Tablas de evaluación
- **Flujos de Ejemplo** - Conversaciones completas (Debate Digital)
- **Análisis AI Generado** - Ejemplos de output (Podcast)
- **Consideraciones de Accesibilidad** - WCAG, alternativas

---

## Integración con Sistema General

### API Endpoints

Todas las mecánicas documentadas utilizan los endpoints estándar:

```
GET    /api/exercises/:id              - Obtener ejercicio (sanitizado)
POST   /api/exercises/:id/submit       - Enviar respuesta
GET    /api/mechanics/:id/hints        - Sistema de pistas
POST   /api/exercises/:id/upload       - Upload multimedia (Podcast, Video)
```

### Flujo de Submission

1. Frontend obtiene ejercicio (sin respuestas correctas)
2. Usuario completa ejercicio
3. Frontend envía POST con respuestas
4. Backend valida server-side
5. Backend calcula score con multiplicadores
6. Trigger DB actualiza user_stats
7. Backend chequea achievements
8. Backend retorna resultado completo

---

## Consideraciones de Implementación

### APIs Externas Requeridas

**Podcast Argumentativo:**
- Speech-to-Text: Google Cloud Speech API o Whisper API
- NLP Analysis: OpenAI API (opcional)

**Debate Digital:**
- Conversational AI: OpenAI API o respuestas predefinidas
- Sentiment Analysis (opcional)

**Chat Literario:**
- Chatbot AI: OpenAI API con persona de Marie Curie

### Storage Requirements

**Audio/Video:**
- Formato: audio/webm, video/mp4
- Límite: 100MB por archivo
- Storage: AWS S3 o similar
- CDN para serving optimizado

**Exportables:**
- Infografía: JSON (<1MB)
- Ensayo: Markdown/JSON (<500KB)

---

## Próximos Pasos

### Documentación Futura

Mecánicas candidatas para documentación detallada expandida:

1. **Tribunal de Opiniones** (Módulo 3) - Complejidad en evaluación de sesgos
2. **Matriz de Perspectivas** (Módulo 3) - AI generación de perspectivas
3. **Verificador de Fake News** (Módulo 4) - Sistema de fact-checking
4. **Cómic Digital** (Módulo 5) - Editor visual complejo
5. **Video Carta** (Módulo 5) - Grabación y análisis de video

### Mejoras a Documentación Existente

- Agregar diagramas de flujo UML para mecánicas complejas
- Incluir mockups de UI/UX
- Expandir sección de testing (unit tests, integration tests)
- Agregar métricas de performance esperadas

---

## Changelog

### Versión 2.0 (2025-11-01) - RFC-0001 Modularizado

- ✅ Dividido MECANICAS-DOCUMENTACION-COMPLETA.md en 3 archivos temáticos
- ✅ Todos los archivos <400 líneas
- ✅ Headers estándar agregados
- ✅ Archivo original respaldado como .backup
- ✅ README creado con índice completo
- ✅ 9 mecánicas documentadas en profundidad

### Versión 1.0 (2025-10-01)

- Documento original consolidado (1,181 líneas)
- 9 mecánicas con documentación extendida

---

## Referencias Cruzadas

### Documentación Relacionada

- **Vista General:** `README-MODULOS-EDUCATIVOS.md`
- **Módulo 1:** `MODULO-01-COMPRENSION-LITERAL.md`
- **Módulo 2:** `MODULO-02-COMPRENSION-INFERENCIAL.md`
- **Módulo 3:** `MODULO-03-COMPRENSION-CRITICA.md`
- **Módulo 4:** `MODULO-04-LECTURA-DIGITAL.md`
- **Módulo 5:** `MODULO-05-PRODUCCION-TEXTOS.md`

### Archivos de Backup

- `MODULOS-EDUCATIVOS.md.backup` (1,489 líneas)
- `MECANICAS-DOCUMENTACION-COMPLETA.md.backup` (1,181 líneas)

---

## Uso de esta Documentación

### Para Desarrolladores

**Al implementar mecánica compleja:**
1. Leer documentación detallada completa
2. Revisar estructura de contenido (TypeScript interfaces)
3. Implementar validaciones especificadas
4. Seguir notas de implementación frontend/backend
5. Usar ejemplos de contenido para testing

### Para Diseñadores UX/UI

**Al diseñar interfaz de mecánica:**
1. Estudiar características técnicas
2. Analizar ejemplos de flujo (ej: Debate Digital)
3. Considerar responsive design y accesibilidad
4. Diseñar estados: empty, loading, completed
5. Mockup de feedback y scoring

### Para Educadores

**Al crear contenido o evaluar:**
1. Revisar objetivo pedagógico
2. Usar rúbricas de evaluación provistas
3. Adaptar ejemplos de contenido a otros temas
4. Entender criterios de scoring
5. Definir prerequisitos para estudiantes

### Para QA/Testing

**Al testear mecánica:**
1. Validar todas las validaciones especificadas
2. Probar casos edge (tiempo límite, inputs vacíos)
3. Verificar cálculo de scoring
4. Testear integración con gamificación
5. Confirmar prerequisitos funcionan correctamente

---

**Mantenido por:** Equipo de Análisis Técnico
**Última actualización:** 2025-11-01
**Próxima revisión:** 2025-12-01
