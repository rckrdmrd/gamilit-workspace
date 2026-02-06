---
id: "RF-EDU-005"
title: "Mecanica de Ejercicio de Ordenamiento"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Contenido Educativo"
epic: "EAI-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Mecanica de Ejercicio de Ordenamiento

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-EDU-005 |
| Modulo | Contenido Educativo |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-002 |

## Descripcion

El sistema debe soportar ejercicios de ordenamiento donde los estudiantes organizan elementos en una secuencia correcta (cronologica, numerica, jerarquica). Usa drag and drop vertical con la libreria dnd-kit Sortable. Los datos del ejercicio estan hardcodeados en la base de datos.

## Requerimiento Funcional

- **RF-EDU-005.1:** Mostrar una lista de items desordenados que el estudiante debe reorganizar en el orden correcto, con indicadores de posicion numerados.
- **RF-EDU-005.2:** Permitir reordenar items mediante drag and drop vertical, con animacion de desplazamiento suave al mover un item entre posiciones.
- **RF-EDU-005.3:** Validar el orden final contra la secuencia correcta almacenada en BD (campo config JSONB del ejercicio), calculando puntuacion parcial por items en posicion correcta.
- **RF-EDU-005.4:** Soportar variantes: cronologia (ordenar eventos), secuencia logica (pasos de un proceso), jerarquia (mayor a menor, primero a ultimo).
- **RF-EDU-005.5:** Mostrar indicadores de posicion correcta/incorrecta al enviar respuesta, resaltando que items estan bien ubicados y cuales no.

## Criterios de Aceptacion

- [ ] AC-001: Los items se muestran en orden aleatorio al iniciar el ejercicio
- [ ] AC-002: El drag and drop vertical funciona con animaciones fluidas
- [ ] AC-003: La validacion calcula correctamente la puntuacion parcial
- [ ] AC-004: Se muestra feedback visual de posiciones correctas e incorrectas
- [ ] AC-005: El ejercicio funciona correctamente en desktop y tablet

## Referencias

- **User Story:** US-ACT-005
- **Especificacion:** ET-EDU-005
- **EPIC:** EAI-002
