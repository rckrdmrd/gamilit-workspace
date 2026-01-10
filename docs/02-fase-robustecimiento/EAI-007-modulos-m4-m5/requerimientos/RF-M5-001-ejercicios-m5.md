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

## Descripcion Detallada de Ejercicios

### diario_multimedia (Diario Multimedia)

El estudiante crea 5 entradas de diario desde la perspectiva de Marie Curie, combinando:
- Texto narrativo en primera persona
- Imagenes o ilustraciones
- Audio opcional (narración)

**Formato de entrega:** Texto + archivos multimedia

### comic_digital (Comic Digital)

El estudiante crea un comic de 6 vinetas narrando un momento clave del descubrimiento del radio:
- Dialogo entre personajes
- Ilustraciones secuenciales
- Estructura narrativa clara

**Formato de entrega:** Imagen o PDF con las vinetas

### video_carta (Video-Carta)

El estudiante graba un video de 2-3 minutos enviando un mensaje a Marie Curie desde la perspectiva actual:
- Mensaje personal
- Reflexion sobre el impacto de sus descubrimientos
- Conexion con el presente

**Formato de entrega:** Video MP4/WEBM

## Requisitos Funcionales

1. **RF-M5-001-01**: El sistema debe permitir envio de texto enriquecido
2. **RF-M5-001-02**: El sistema debe soportar adjuntos multimedia
3. **RF-M5-001-03**: El sistema debe permitir multiples archivos por ejercicio
4. **RF-M5-001-04**: El sistema debe asignar rubrica de evaluacion
5. **RF-M5-001-05**: El sistema debe calcular XP/ML basado en calificacion del maestro

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
**Actualizado:** 2026-01-07 (CORR-DOC-M5-001: Sincronizar tipos con implementacion)
