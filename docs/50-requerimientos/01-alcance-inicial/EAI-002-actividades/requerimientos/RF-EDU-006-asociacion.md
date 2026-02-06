---
id: "RF-EDU-006"
title: "Mecanica de Ejercicio de Asociacion"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Contenido Educativo"
epic: "EAI-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Mecanica de Ejercicio de Asociacion

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-EDU-006 |
| Modulo | Contenido Educativo |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-002 |

## Descripcion

El sistema debe soportar ejercicios de asociacion (matching) donde los estudiantes conectan elementos relacionados entre dos columnas. Esta mecanica permite demostrar comprension de relaciones entre conceptos mediante emparejamiento por click o lineas de conexion. Los datos estan hardcodeados en BD.

## Requerimiento Funcional

- **RF-EDU-006.1:** Mostrar dos columnas de items (columna A y columna B) con los elementos desordenados para que el estudiante identifique los pares correctos.
- **RF-EDU-006.2:** Permitir emparejar items mediante click secuencial: el estudiante hace click en un item de columna A y luego en uno de columna B para crear la asociacion, con linea visual conectandolos.
- **RF-EDU-006.3:** Permitir deshacer asociaciones haciendo click en una conexion existente, y mostrar contador de pares completados vs total.
- **RF-EDU-006.4:** Validar todas las asociaciones al enviar, comparando contra los pares correctos almacenados en BD (campo config JSONB), con puntuacion parcial por par correcto.
- **RF-EDU-006.5:** Soportar variantes: texto-texto, texto-imagen, e imagen-imagen, con maximo 8 pares por ejercicio para mantener usabilidad.

## Criterios de Aceptacion

- [ ] AC-001: Las dos columnas se muestran con items desordenados
- [ ] AC-002: Las asociaciones se crean por click con linea visual de conexion
- [ ] AC-003: Se pueden deshacer asociaciones antes de enviar la respuesta
- [ ] AC-004: La validacion calcula puntuacion parcial correctamente
- [ ] AC-005: Las variantes texto-imagen funcionan sin distorsion visual

## Referencias

- **User Story:** US-ACT-006
- **Especificacion:** ET-EDU-006
- **EPIC:** EAI-002
