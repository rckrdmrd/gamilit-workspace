---
id: RF-M4-001
title: Ejercicios Modulo 4 - Lectura Digital y Multimodal
epic: EAI-007
status: Done
created: 2025-12-05
updated: 2026-01-07
---

# RF-M4-001: Ejercicios Modulo 4

## Descripcion

El sistema soporta 5 tipos de ejercicios para el Modulo 4 (Lectura Digital y Multimodal), cada uno con validacion especifica. Cuatro ejercicios requieren revision manual por docentes y uno es auto-gradable.

## Tipos de Ejercicios

| # | Tipo | Descripcion | Validacion | XP | ML Coins |
|---|------|-------------|------------|-----|----------|
| 1 | verificador_fake_news | Verificador de Fake News | Manual | 150 | 30 |
| 2 | infografia_interactiva | Infografia Interactiva | Manual | 150 | 30 |
| 3 | quiz_tiktok | Quiz estilo TikTok | **Auto** | 100 | 20 |
| 4 | navegacion_hipertextual | Navegacion Hipertextual | Manual | 150 | 30 |
| 5 | analisis_memes | Analisis de Memes | Manual | 150 | 30 |

### Nota sobre quiz_tiktok

El ejercicio `quiz_tiktok` es el unico de M4 con evaluacion automatica porque:
- Tiene preguntas con respuestas unicas verificables (`correctAnswers: [1, 1, 2]`)
- Implementado en `exercise-grading.service.ts:gradeQuizTiktok()`
- El estudiante recibe feedback y recompensas inmediatamente

## Requisitos Funcionales

1. **RF-M4-001-01**: El sistema debe permitir envio de respuestas para cada tipo de ejercicio
2. **RF-M4-001-02**: El sistema debe validar formatos de archivo aceptados
3. **RF-M4-001-03**: El sistema debe almacenar archivos multimedia en storage
4. **RF-M4-001-04**: El sistema debe marcar ejercicios como "pendiente revision" (excepto quiz_tiktok)
5. **RF-M4-001-05**: El sistema debe notificar a docentes de nuevos envios

## Restricciones

- Tamano maximo de archivo: 50MB
- Formatos permitidos: PDF, PNG, JPG, MP3, MP4, WEBM
- Tiempo maximo de carga: 30 segundos

## Criterios de Aceptacion

- [x] Los 5 tipos de ejercicio aceptan envios
- [x] Validacion de formato funciona correctamente
- [x] Archivos se almacenan en Supabase Storage
- [x] Estado "pending_review" se asigna automaticamente (4/5 ejercicios)
- [x] quiz_tiktok se auto-califica inmediatamente
- [x] Notificaciones se generan para docentes

## Especificaciones Relacionadas

- [ET-M4M5-001](../specifications/ET-M4M5-001-schema-bd.md)
- [ET-M4M5-002](../specifications/ET-M4M5-002-backend-apis.md)

---

**Estado:** Done
**Actualizado:** 2026-01-07 (CORR-DOC-M4-001: Sincronizar tipos con implementacion)
