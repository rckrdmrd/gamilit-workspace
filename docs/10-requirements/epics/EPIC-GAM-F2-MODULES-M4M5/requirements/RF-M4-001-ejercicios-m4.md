---
id: RF-M4-001
title: Ejercicios Modulo 4 - Lectura Digital y Multimodal
epic: EAI-007
status: Done
created: 2025-12-05
updated: 2026-02-21
---

# RF-M4-001: Ejercicios Modulo 4

## Descripcion

El sistema soporta 5 tipos de ejercicios para el Modulo 4 (Lectura Digital y Multimodal), cada uno con validacion especifica. Los 5 ejercicios requieren revision manual por docentes.

## Tipos de Ejercicios

| # | Tipo | Descripcion | Validacion | XP | ML Coins |
|---|------|-------------|------------|-----|----------|
| 1 | verificador_fake_news | Verificador de Fake News | Manual | 150 | 30 |
| 2 | infografia_interactiva | Infografia Interactiva | Manual | 150 | 30 |
| 3 | quiz_tiktok | Quiz estilo TikTok | Manual | 100 | 20 |
| 4 | navegacion_hipertextual | Navegacion Hipertextual | Manual | 150 | 30 |
| 5 | analisis_memes | Analisis de Memes | Manual | 150 | 30 |

### Nota sobre quiz_tiktok

El ejercicio `quiz_tiktok` requiere revision manual por docente:
- El estudiante debe proporcionar justificaciones escritas para cada respuesta seleccionada
- El docente evalua tanto la seleccion como la calidad de la justificacion
- No se aplica auto-calificacion; las recompensas se otorgan tras la revision del docente

## Requisitos Funcionales

1. **RF-M4-001-01**: El sistema debe permitir envio de respuestas para cada tipo de ejercicio
2. **RF-M4-001-02**: El sistema debe validar formatos de archivo aceptados
3. **RF-M4-001-03**: El sistema debe almacenar archivos multimedia en storage
4. **RF-M4-001-04**: El sistema debe marcar todos los ejercicios como "pendiente revision"
5. **RF-M4-001-05**: El sistema debe notificar a docentes de nuevos envios

## Restricciones

- Tamano maximo de archivo: 50MB
- Formatos permitidos: PDF, PNG, JPG, MP3, MP4, WEBM
- Tiempo maximo de carga: 30 segundos

## Criterios de Aceptacion

- [x] Los 5 tipos de ejercicio aceptan envios
- [x] Validacion de formato funciona correctamente
- [x] Archivos se almacenan en Supabase Storage
- [x] Estado "pending_review" se asigna automaticamente (5/5 ejercicios)
- [x] Notificaciones se generan para docentes

## Especificaciones Relacionadas

- [ET-M4M5-001](../specifications/ET-M4M5-001-schema-bd.md)
- [ET-M4M5-002](../specifications/ET-M4M5-002-backend-apis.md)

---

**Estado:** Done
**Actualizado:** 2026-02-21 (All M4 exercises now require manual grading; quiz_tiktok changed from Auto to Manual with justification requirement)
