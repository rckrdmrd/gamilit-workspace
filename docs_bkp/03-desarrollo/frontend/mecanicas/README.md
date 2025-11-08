# Mecánicas Educativas - GAMILIT Platform v2

**Proyecto:** GAMILIT Platform v2
**Fecha:** 2025-10-27
**Total de Mecánicas:** 33 (organizadas en 5 módulos)

---

## Índice de Mecánicas por Módulo

### [Módulo 1: Comprensión Literal](./Mecanicas-Literal.md) (7 mecánicas)

**Objetivo Pedagógico:** Identificar información explícita en textos

1. **Crucigrama Científico** - Crucigrama interactivo con terminología científica
2. **Línea de Tiempo** - Organizar eventos en orden cronológico
3. **Sopa de Letras** - Encontrar palabras ocultas en una matriz
4. **Mapa Conceptual** - Conectar conceptos relacionados
5. **Emparejamiento** - Unir elementos relacionados de dos columnas
6. **Verdadero/Falso** - Evaluar veracidad de afirmaciones
7. **Completar Espacios** - Completar texto con palabras faltantes

### [Módulo 2: Comprensión Inferencial](./Mecanicas-Inferencial.md) (5 mecánicas)

**Objetivo Pedagógico:** Deducir información implícita en textos

1. **Detective Textual** - Encontrar pistas y evidencias para resolver casos
2. **Construcción de Hipótesis** - Formular hipótesis basadas en información parcial
3. **Predicción Narrativa** - Predecir continuación de una historia
4. **Puzzle de Contexto** - Reconstruir contexto a partir de fragmentos
5. **Rueda de Inferencias** - Hacer inferencias a partir de observaciones

### [Módulo 3: Comprensión Crítica](./Mecanicas-Critica.md) (5 mecánicas)

**Objetivo Pedagógico:** Analizar, evaluar y juzgar textos

1. **Análisis de Fuentes** - Evaluar credibilidad y sesgo de fuentes
2. **Debate Digital** - Argumentar posiciones sobre un tema
3. **Matriz de Perspectivas** - Analizar múltiples puntos de vista
4. **Podcast Argumentativo** - Crear argumentos en formato audio
5. **Tribunal de Opiniones** - Evaluar argumentos como un juez

### [Módulo 4: Textos Digitales y Multimediales](./Mecanicas-Digital.md) (9 mecánicas)

**Objetivo Pedagógico:** Interpretar textos digitales, visuales y multimodales

1. **Verificador de Fake News** - Identificar noticias falsas y verificar información
2. **Quiz TikTok** - Cuestionario con interfaz estilo TikTok
3. **Navegación Hipertextual** - Navegar por documentos enlazados
4. **Análisis de Memes** - Interpretar significado de memes
5. **Infografía Interactiva** - Explorar e interpretar infografías
6. **Email Formal** - Redactar correos formales
7. **Chat Literario** - Conversación con personajes literarios
8. **Ensayo Argumentativo** - Escribir ensayos estructurados
9. **Reseña Crítica** - Escribir reseñas críticas

### [Módulo 5: Producción Creativa](./Mecanicas-Produccion.md) (3 mecánicas)

**Objetivo Pedagógico:** Crear textos originales con intención comunicativa

1. **Diario Multimedia** - Crear entradas de diario con multimedia
2. **Comic Digital** - Crear comics con herramientas digitales
3. **Video Carta** - Grabar mensajes en video

### Mecánicas Auxiliares (4+ mecánicas)

Mecánicas de soporte incluidas en el módulo de producción:
- **Call to Action** - Presentación motivacional
- **Collage de Prensa** - Crear collages temáticos
- **Comprensión Auditiva** - Ejercicios basados en audio
- **Texto en Movimiento** - Textos con animaciones

---

## Arquitectura General

Todas las mecánicas:
- Heredan de `BaseExercise` para funcionalidad común
- Son componentes React independientes y reutilizables
- Están totalmente tipadas con TypeScript
- Se integran con el sistema de gamificación
- Obtienen su configuración desde la base de datos

**Ubicación en el código:** `/src/features/mechanics/`

---

## Navegación Rápida

- **Arquitectura y componente base:** Ver [Mecanicas-Literal.md](./Mecanicas-Literal.md) - Secciones 1-2
- **Sistema de scoring:** Ver [Mecanicas-Digital.md](./Mecanicas-Digital.md) - Sección al final
- **Integración con backend:** Ver [Mecanicas-Digital.md](./Mecanicas-Digital.md) - Sección de integración
- **Mejores prácticas y testing:** Ver [Mecanicas-Produccion.md](./Mecanicas-Produccion.md) - Secciones finales

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
**Mantenedor:** Equipo GAMILIT
