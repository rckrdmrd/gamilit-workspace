---
id: "RF-GAM-005"
title: "Sistema de Insignias"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Gamificacion"
epic: "EAI-003"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Sistema de Insignias

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-GAM-005 |
| Modulo | Gamificacion |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-003 |

## Descripcion

El sistema debe otorgar insignias (badges) automaticamente por logros especificos del estudiante, proporcionando reconocimientos visuales coleccionables. Se definen 6 categorias de insignias con niveles de rareza, empezando con 10 insignias pre-definidas hardcodeadas. Las insignias se muestran en una galeria dentro del perfil del estudiante.

## Requerimiento Funcional

- **RF-GAM-005.1:** Definir 10 insignias pre-definidas distribuidas en 6 categorias: academica, social, consistencia, exploracion, maestria, y especial, almacenadas en gamification_system.badges con metadata (nombre, descripcion, icono, rareza, criterio).
- **RF-GAM-005.2:** Otorgar insignias automaticamente al cumplir criterios predefinidos (ej: primera actividad completada, racha de 7 dias, modulo perfecto). Los criterios se evaluan via triggers o eventos del backend.
- **RF-GAM-005.3:** Implementar niveles de rareza para insignias: comun, raro, epico, legendario, con diferenciacion visual (borde, brillo, animacion) segun nivel.
- **RF-GAM-005.4:** Mostrar notificacion celebratoria al obtener una nueva insignia, incluyendo animacion, nombre, descripcion del logro, y rareza.
- **RF-GAM-005.5:** Proveer galeria de insignias en el perfil del estudiante mostrando obtenidas (con fecha) y bloqueadas (silueta con pista del criterio), con contador total.

## Criterios de Aceptacion

- [ ] AC-001: Las 10 insignias pre-definidas existen en BD con sus categorias y criterios
- [ ] AC-002: Las insignias se otorgan automaticamente al cumplir criterios
- [ ] AC-003: La diferenciacion visual por rareza es clara y consistente
- [ ] AC-004: La notificacion de nueva insignia aparece con animacion celebratoria
- [ ] AC-005: La galeria muestra insignias obtenidas y bloqueadas con pistas

## Referencias

- **User Story:** US-GAM-005
- **Especificacion:** ET-GAM-005
- **EPIC:** EAI-003
