---
id: US-M5-001
title: DTOs para M5 multimedia
epic: EAI-007
et: ET-M4M5-002
status: Done
story_points: 5
sprint: 7
created: 2025-12-05
updated: 2026-01-04
---

# US-M5-001: DTOs para M5 Multimedia

## Historia de Usuario

**Como** desarrollador
**Quiero** crear DTOs especificos para ejercicios del Modulo 5
**Para** soportar contenido multimedia (texto + archivos)

## Criterios de Aceptacion

- [x] DTO para ensayo creativo con validacion de longitud
- [x] DTO para carta al personaje con campos estructurados
- [x] DTO para proyecto multimedia con soporte de adjuntos
- [x] Validacion de tipos de archivo permitidos
- [x] Limite de tamano total de archivos

## Notas de Implementacion

DTOs implementados en `apps/backend/src/educational/dto/module5/`:
- `ensayo-response.dto.ts`
- `carta-response.dto.ts`
- `proyecto-multimedia-response.dto.ts`

---

**Estado:** Done
