---
id: RF-M4-001
title: Ejercicios Modulo 4 - Lectura Digital y Multimodal
epic: EAI-007
status: Done
created: 2025-12-05
updated: 2026-01-04
---

# RF-M4-001: Ejercicios Modulo 4

## Descripcion

El sistema debe soportar 5 tipos de ejercicios para el Modulo 4 (Lectura Digital y Multimodal), cada uno con validacion especifica y soporte para revision manual por docentes.

## Tipos de Ejercicios

| # | Tipo | Descripcion | Validacion |
|---|------|-------------|------------|
| 1 | linea_tiempo | Linea de tiempo interactiva | Manual |
| 2 | mapa_mental | Mapa mental/conceptual | Manual |
| 3 | infografia | Infografia digital | Manual |
| 4 | podcast | Audio/Podcast | Manual |
| 5 | video_resumen | Video resumen | Manual |

## Requisitos Funcionales

1. **RF-M4-001-01**: El sistema debe permitir envio de respuestas para cada tipo de ejercicio
2. **RF-M4-001-02**: El sistema debe validar formatos de archivo aceptados
3. **RF-M4-001-03**: El sistema debe almacenar archivos multimedia en storage
4. **RF-M4-001-04**: El sistema debe marcar ejercicios como "pendiente revision"
5. **RF-M4-001-05**: El sistema debe notificar a docentes de nuevos envios

## Restricciones

- Tamano maximo de archivo: 50MB
- Formatos permitidos: PDF, PNG, JPG, MP3, MP4, WEBM
- Tiempo maximo de carga: 30 segundos

## Criterios de Aceptacion

- [x] Los 5 tipos de ejercicio aceptan envios
- [x] Validacion de formato funciona correctamente
- [x] Archivos se almacenan en Supabase Storage
- [x] Estado "pending_review" se asigna automaticamente
- [x] Notificaciones se generan para docentes

## Especificaciones Relacionadas

- [ET-M4M5-001](../especificaciones/ET-M4M5-001-schema-bd.md)
- [ET-M4M5-002](../especificaciones/ET-M4M5-002-backend-apis.md)

---

**Estado:** Done
