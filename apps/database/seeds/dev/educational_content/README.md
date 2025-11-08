# Seeds: Educational Content - Marie Curie

## Descripción

Seeds de desarrollo para contenido educativo sobre Marie Curie basado en la metodología de comprensión lectora de Daniel Cassany.

## Estructura

### Módulos (01-modules.sql)
- **8 módulos educativos** sobre Marie Curie
- 5 módulos pedagógicos con ejercicios (Módulos 1-5)
- 3 módulos narrativos informativos (Módulos 6-8)

### Ejercicios por Módulo

#### Módulo 1: Comprensión Literal (02-exercises-module1.sql)
- 5 ejercicios interactivos
- Dificultad: beginner
- Tipos: Crucigrama, Línea de Tiempo, Sopa de Letras, Mapa Conceptual, Emparejamiento

#### Módulo 2: Comprensión Inferencial (03-exercises-module2.sql)
- 5 ejercicios interactivos
- Dificultad: intermediate
- Tipos: Detective Textual, Construcción Hipótesis, Predicción Narrativa, Puzzle Contexto, Rueda de Inferencias

#### Módulo 3: Comprensión Crítica (04-exercises-module3.sql)
- 5 ejercicios interactivos
- Dificultad: advanced
- Tipos: Análisis Fuentes, Debate Digital, Matriz Perspectivas, Podcast Argumentativo, Tribunal de Opiniones

#### Módulo 4: Lectura Digital (05-exercises-module4.sql)
- 9 ejercicios interactivos ⭐ (módulo más extenso)
- Dificultad: intermediate → advanced
- Tipos: Verificador Fake News, Quiz TikTok, Navegación Hipertextual, Análisis Memes, Infografía, Email Formal, Chat Literario, Ensayo Argumentativo, Reseña Crítica

#### Módulo 5: Producción Creativa (06-exercises-module5.sql)
- 3 ejercicios interactivos
- Dificultad: intermediate → advanced
- Tipos: Diario Multimedia, Cómic Digital, Video-Carta

### Rúbricas de Evaluación (07-assessment-rubrics.sql)
- Rúbricas para ejercicios complejos
- Criterios de evaluación detallados
- Estándares de calidad

## Orden de Ejecución

```bash
# 1. Crear módulos primero
psql -f 01-modules.sql

# 2. Cargar ejercicios por módulo (en orden)
psql -f 02-exercises-module1.sql
psql -f 03-exercises-module2.sql
psql -f 04-exercises-module3.sql
psql -f 05-exercises-module4.sql
psql -f 06-exercises-module5.sql

# 3. Cargar rúbricas de evaluación
psql -f 07-assessment-rubrics.sql
```

## Estadísticas

| Métrica | Valor |
|---------|-------|
| **Total Módulos** | 8 |
| **Módulos con Ejercicios** | 5 (62.5%) |
| **Módulos Narrativos** | 3 (37.5%) |
| **Total Ejercicios** | 27 |
| **Archivos SQL** | 7 |

### Distribución de Ejercicios

| Módulo | Ejercicios | % del Total |
|--------|------------|-------------|
| Módulo 1 (Literal) | 5 | 18.5% |
| Módulo 2 (Inferencial) | 5 | 18.5% |
| Módulo 3 (Crítica) | 5 | 18.5% |
| Módulo 4 (Digital) | 9 | 33.3% |
| Módulo 5 (Creativo) | 3 | 11.1% |
| **TOTAL** | **27** | **100%** |

## Datos de Marie Curie

### Fechas Clave
- **1867-11-07**: Nacimiento en Varsovia
- **1891**: Traslado a París
- **1895-07-25**: Matrimonio con Pierre Curie
- **1898-12**: Descubrimiento de Radio y Polonio
- **1903**: Primer Premio Nobel (Física)
- **1911**: Segundo Premio Nobel (Química)
- **1934-07-04**: Fallecimiento

### Elementos Descubiertos
- **Polonio** (Po): Nombrado por Polonia
- **Radio** (Ra): Elemento radiactivo brillante

## Características Técnicas

### Idempotencia
Todos los scripts usan `ON CONFLICT DO UPDATE` para ser idempotentes y seguros de re-ejecutar.

### Referencias Dinámicas
Los ejercicios obtienen `module_id` dinámicamente usando `module_code` para evitar dependencia de UUIDs específicos.

### Contenido JSON
- Todos los campos JSONB son válidos
- Estructuras complejas preservadas
- Compatible con validación JSON del schema

### Comodines y Ayudas
- Hints configurables por ejercicio
- Comodines con costos en ML Coins
- Sistema de puntos XP y ML Coins

## Metodología Daniel Cassany

Los módulos siguen la progresión pedagógica de Cassany:

1. **Literal**: Identificar información explícita
2. **Inferencial**: Deducir información implícita
3. **Crítica**: Evaluar y formar opiniones fundamentadas
4. **Digital**: Alfabetización en medios digitales
5. **Creativa**: Producción original de contenido

## Autor

- **SA-SEEDS-EDUCATIONAL**
- **Fecha**: 2025-11-02
- **Proyecto**: Gamilit Educational Platform
