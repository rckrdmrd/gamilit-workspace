---
id: RF-M5-001
title: Ejercicios Modulo 5 - Produccion y Expresion Lectora
epic: EAI-007
status: Done
created: 2025-12-05
updated: 2026-01-04
---

# RF-M5-001: Ejercicios Modulo 5

## Descripcion

El sistema debe soportar 3 tipos de ejercicios para el Modulo 5 (Produccion y Expresion Lectora), con soporte para contenido multimedia y revision manual por docentes.

## Tipos de Ejercicios

| # | Tipo | Descripcion | Validacion |
|---|------|-------------|------------|
| 1 | ensayo | Ensayo creativo | Manual |
| 2 | carta | Carta al personaje | Manual |
| 3 | proyecto_multimedia | Proyecto multimedia | Manual |

## Requisitos Funcionales

1. **RF-M5-001-01**: El sistema debe permitir envio de texto enriquecido
2. **RF-M5-001-02**: El sistema debe soportar adjuntos multimedia
3. **RF-M5-001-03**: El sistema debe permitir multiples archivos por ejercicio
4. **RF-M5-001-04**: El sistema debe asignar rubrica de evaluacion
5. **RF-M5-001-05**: El sistema debe calcular XP/ML basado en calificacion

## Restricciones

- Longitud minima de texto: 200 caracteres
- Longitud maxima de texto: 10,000 caracteres
- Maximo adjuntos: 5 archivos
- Tamano total maximo: 100MB

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
